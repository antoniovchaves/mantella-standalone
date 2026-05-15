"""
Mantella Standalone — Backend Proxy
Default port: 8080
Forwards frontend calls to Mantella (localhost:4999) and reads NPC override files.
"""

import os
import re
import json
import csv
import random
import asyncio
import httpx
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

MANTELLA_BASE = "http://localhost:4999"
TIMEOUT_SHORT = 15.0   # fast calls (start, end, init)
TIMEOUT_LLM   = 120.0  # continue_conversation (waits for LLM)

DEFAULT_OVERRIDE_PATH = Path.home() / "Documents" / "My Games" / "Mantella" / "data" / "Skyrim" / "character_overrides"
OVERRIDE_PATH = Path(os.environ.get("MANTELLA_OVERRIDE_PATH", str(DEFAULT_OVERRIDE_PATH)))

STOP_REPLY_TYPES = {"mantella_player_talk", "mantella_end_conversation", "error"}
MAX_SENTENCES = 10

GENDER_MAP = {"male": 0, "female": 1}

_mantella_lock = asyncio.Lock()

_SPEECH_SPLIT_RE = re.compile(r'\n(?=[A-Z][a-zA-Z\s]+:\s)')
_SPEAKER_PREFIX_RE = re.compile(r'^([A-Z][a-zA-Z\s]+):\s+(.*)', re.DOTALL)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

app = FastAPI(title="Mantella Standalone Proxy", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _hex_to_int(value: str) -> int:
    try:
        if isinstance(value, int):
            return value
        value = str(value).strip()
        if value.lower().startswith("0x"):
            return int(value, 16)
        return int(value)
    except Exception:
        return 0


async def _post_mantella(body: dict, timeout: float = TIMEOUT_SHORT) -> dict:
    url = f"{MANTELLA_BASE}/mantella"
    log.info(f">> POST {url} | type={body.get('mantella_request_type')}")
    async with _mantella_lock:
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(url, json=body)
            log.info(f"<< {resp.status_code}")
            try:
                data = resp.json()
                log.info(f"<< body: {json.dumps(data, ensure_ascii=False)}")
                return data
            except Exception:
                log.info(f"<< raw text: {resp.text}")
                return {"raw": resp.text}
        except httpx.ConnectError:
            raise HTTPException(503, "Mantella is not reachable at localhost:4999. Make sure the mod is running.")
        except httpx.TimeoutException:
            raise HTTPException(504, f"Timeout after {timeout}s waiting for Mantella.")
        except Exception as exc:
            log.exception("Unexpected error contacting Mantella")
            raise HTTPException(500, str(exc))


def _build_actor(name: str, race: str, gender: str, is_player: bool,
                 ref_id: str, base_id: str, **kwargs) -> dict:
    return {
        "mantella_actor_name": name,
        "mantella_actor_race": race,
        "mantella_actor_gender": GENDER_MAP.get(gender.lower(), 0),
        "mantella_actor_is_player": is_player,
        "mantella_actor_refid": _hex_to_int(ref_id),
        "mantella_actor_baseid": _hex_to_int(base_id),
        "mantella_actor_voicetype": kwargs.get("voice_type", ""),
        "mantella_actor_is_in_combat": kwargs.get("is_in_combat", False),
        "mantella_actor_is_enemy": kwargs.get("is_enemy", False),
        "mantella_actor_relationshiprank": int(kwargs.get("relationship_rank", 0) or 0),
        "mantella_actor_customvalues": {},
        "mantella_equipment": {},
    }


def _split_speech(speaker: str, text: str, actions: list) -> list[dict]:
    """Split a single line_to_speak that may contain multiple 'Name: text' segments."""
    parts = _SPEECH_SPLIT_RE.split(text)
    result = []
    for i, part in enumerate(parts):
        m = _SPEAKER_PREFIX_RE.match(part)
        if m:
            result.append({"speaker": m.group(1).strip(), "text": m.group(2).strip(), "actions": actions if i == 0 else []})
        else:
            result.append({"speaker": speaker, "text": part.strip(), "actions": actions if i == 0 else []})
    return [s for s in result if s["text"]]


def _clean_speech(text: str) -> str:
    """Remove action markers and normalize whitespace from NPC speech."""
    text = re.sub(r'\*[^*]+\*', '', text)
    text = re.sub(r' +', ' ', text).strip()
    if (text.startswith('"') and text.endswith('"')) or \
       (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()
    return re.sub(r' +', ' ', text).strip()


def _collect_npc_sentences(sentences: list[dict]) -> list[dict]:
    """Clean each sentence and return individually; skip empty/single-word fragments."""
    result = []
    for s in sentences:
        cleaned = _clean_speech(s["text"])
        if not cleaned:
            continue
        if " " not in cleaned and cleaned[-1] not in ".!?":
            continue
        actions = [a.get("identifier") for a in s["actions"] if isinstance(a, dict) and a.get("identifier")]
        result.append({
            "npc_name": s["speaker"],
            "npc_response": cleaned,
            "action": actions[0] if actions else None,
        })
    return result


async def _continue_loop(label: str) -> list[dict]:
    """Run the continue_conversation loop and return collected sentences."""
    sentences: list[dict] = []
    for i in range(MAX_SENTENCES):
        continue_data = await _post_mantella({
            "mantella_request_type": "mantella_continue_conversation",
            "mantella_topicinfofile": 1,
            "mantella_context": {},
        }, timeout=TIMEOUT_LLM)

        reply_type = continue_data.get("mantella_reply_type", "")
        npc_talk = continue_data.get("mantella_npc_talk")
        raw_line = npc_talk.get("mantella_actor_line_to_speak", "") if npc_talk else ""
        log.info(f"{label} [{i+1}] reply_type={reply_type!r} | line={raw_line!r}")

        if npc_talk and raw_line:
            sentences.extend(_split_speech(
                speaker=npc_talk.get("mantella_actor_speaker", ""),
                text=raw_line,
                actions=npc_talk.get("mantella_actor_actions", []),
            ))

        if reply_type in STOP_REPLY_TYPES:
            break
        if reply_type == "mantella_npc_talk" and not npc_talk:
            break
    return sentences


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/status")
async def status():
    data = await _post_mantella({"mantella_request_type": "mantella_initialize"})
    return JSONResponse(data)


@app.get("/health")
async def health():
    return {"proxy": "ok", "mantella_target": MANTELLA_BASE}


@app.post("/start_conversation")
async def start_conversation(request: Request):
    body = await request.json()

    actors = []

    # Player
    actors.append(_build_actor(
        name=body.get("player_name", "Player"),
        race=body.get("player_race", "Nord"),
        gender=body.get("player_gender", "male"),
        is_player=True,
        ref_id="000014",
        base_id="000007",
        relationship_rank=4,
    ))

    # NPCs — random ref_id per session so Mantella never loads previous context
    for npc in body.get("npcs", []):
        session_ref_id = hex(random.randint(0x100000, 0xEFFFFF))
        actors.append(_build_actor(
            name=npc.get("name", ""),
            race=npc.get("race", "Nord"),
            gender=npc.get("gender", "male"),
            is_player=False,
            ref_id=session_ref_id,
            base_id=npc.get("base_id", "0x000198C4"),
            voice_type=npc.get("voice_type", ""),
            is_in_combat=npc.get("is_in_combat", False),
            is_enemy=npc.get("is_enemy", False),
            relationship_rank=npc.get("relationship_rank", 0),
        ))

    time_str = body.get("in_game_time", "12:00")
    try:
        hour = int(time_str.split(":")[0])
    except Exception:
        hour = 12

    await _post_mantella({
        "mantella_request_type": "mantella_start_conversation",
        "mantella_input_type": "mantella_text_input",
        "mantella_actors": actors,
        "mantella_context": {
            "mantella_location": "American Diner",
            "mantella_time": hour,
            "mantella_gamedays": 1,
            "mantella_ingame_events": [],
            "mantella_nearby_actors": [],
        },
    })

    # Collect the opening NPC greeting; if Mantella isn't ready for continue yet, return empty
    greeting = []
    try:
        sentences = await _continue_loop("greeting")
        greeting = _collect_npc_sentences(sentences)
    except Exception as e:
        log.warning(f"Could not collect opening greeting: {e}")

    return JSONResponse({"greeting": greeting})


@app.post("/player_input")
async def player_input(request: Request):
    body = await request.json()
    transcript = body.get("transcript", "")

    input_data = await _post_mantella({
        "mantella_request_type": "mantella_player_input",
        "mantella_player_input": transcript,
        "mantella_context": {},
    })
    log.info(f"player_input reply_type: {input_data.get('mantella_reply_type')}")

    sentences = await _continue_loop("continue")
    result = _collect_npc_sentences(sentences)

    if not result:
        return JSONResponse([{"npc_name": "", "npc_response": "", "action": None}])
    return JSONResponse(result)


@app.post("/end_conversation")
async def end_conversation(request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    body["mantella_request_type"] = "mantella_end_conversation"
    data = await _post_mantella(body)
    return JSONResponse(data)


# ---------------------------------------------------------------------------
# Override NPC helpers
# ---------------------------------------------------------------------------

def parse_override_json(file_path: Path) -> list[dict]:
    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return [data]
    except Exception as e:
        log.warning(f"Failed to read JSON {file_path}: {e}")
    return []


def parse_override_csv(file_path: Path) -> list[dict]:
    try:
        with open(file_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            return [row for row in reader if row.get("name", "").strip()]
    except Exception as e:
        log.warning(f"Failed to read CSV {file_path}: {e}")
    return []


def load_all_overrides(folder: Path) -> list[dict]:
    if not folder.exists():
        log.info(f"Override folder not found: {folder}")
        return []
    npcs = []
    for json_file in sorted(folder.glob("*.json")):
        entries = parse_override_json(json_file)
        for e in entries:
            e["_source_file"] = json_file.name
        npcs.extend(entries)
    for csv_file in sorted(folder.glob("*.csv")):
        entries = parse_override_csv(csv_file)
        for e in entries:
            e["_source_file"] = csv_file.name
        npcs.extend(entries)
    return npcs


def normalize_npc(raw: dict) -> dict:
    gender_raw = raw.get("gender", "male").strip().lower()
    return {
        "name": raw.get("name", "").strip(),
        "race": raw.get("race", "Nord").strip(),
        "gender": "female" if gender_raw in ("female", "f", "feminino") else "male",
        "bio": raw.get("bio", ""),
        "voice_model": raw.get("voice_model", raw.get("voice_type", "")),
        "ref_id": raw.get("ref_id", raw.get("refID", "0x00000001")),
        "base_id": raw.get("base_id", raw.get("baseID", "0x00000002")),
        "is_follower": str(raw.get("is_follower", "false")).lower() == "true",
        "is_enemy": str(raw.get("is_enemy", "false")).lower() == "true",
        "relationship_rank": int(raw.get("relationship_rank", 0) or 0),
        "_source_file": raw.get("_source_file", ""),
    }


@app.get("/override_npcs")
async def get_override_npcs():
    raw_npcs = load_all_overrides(OVERRIDE_PATH)
    normalized = [normalize_npc(n) for n in raw_npcs if n.get("name")]
    return {"npcs": normalized, "count": len(normalized), "override_path": str(OVERRIDE_PATH), "path_exists": OVERRIDE_PATH.exists()}


@app.get("/override_path")
async def get_override_path():
    return {"path": str(OVERRIDE_PATH), "exists": OVERRIDE_PATH.exists(),
            "files": [f.name for f in OVERRIDE_PATH.glob("*.[cj][ss][ov]*")] if OVERRIDE_PATH.exists() else []}


@app.post("/override_path")
async def set_override_path(request: Request):
    global OVERRIDE_PATH
    body = await request.json()
    new_path = body.get("path", "").strip()
    if not new_path:
        raise HTTPException(status_code=400, detail="Field 'path' is required.")
    OVERRIDE_PATH = Path(new_path)
    return {"path": str(OVERRIDE_PATH), "exists": OVERRIDE_PATH.exists()}


if __name__ == "__main__":
    import uvicorn
    log.info(f"Override folder: {OVERRIDE_PATH}")
    uvicorn.run("proxy:app", host="0.0.0.0", port=8080, reload=True, log_level="info")
