"""
Mantella Standalone — Backend Proxy
Porta padrão: 8080
Redireciona chamadas do frontend para o Mantella (localhost:4999)
Também lê os arquivos de override de personagens do Mantella
"""

import os
import json
import csv
import httpx
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

MANTELLA_BASE = "http://localhost:4999"
TIMEOUT_SHORT = 15.0   # para chamadas rápidas (start, end, init)
TIMEOUT_LLM   = 120.0  # para continue_conversation (aguarda o LLM)

DEFAULT_OVERRIDE_PATH = Path.home() / "Documents" / "My Games" / "Mantella" / "data" / "Skyrim" / "character_overrides"
OVERRIDE_PATH = Path(os.environ.get("MANTELLA_OVERRIDE_PATH", str(DEFAULT_OVERRIDE_PATH)))

app = FastAPI(title="Mantella Standalone Proxy", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GENDER_MAP = {"male": 0, "female": 1}


def _hex_to_int(value: str) -> int:
    """Converte ref_id/base_id de hex string para int."""
    try:
        if isinstance(value, int):
            return value
        value = str(value).strip()
        if value.lower().startswith("0x"):
            return int(value, 16)
        return int(value)
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _post_mantella(body: dict, timeout: float = TIMEOUT_SHORT) -> dict:
    """Envia POST /mantella e retorna o JSON de resposta como dict."""
    url = f"{MANTELLA_BASE}/mantella"
    log.info(f">> POST {url} | type={body.get('mantella_request_type')}")
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=body)
        log.info(f"<< {resp.status_code}")
        try:
            return resp.json()
        except Exception:
            return {"raw": resp.text}
    except httpx.ConnectError:
        raise HTTPException(503, "Mantella não está acessível em localhost:4999. Verifique se o mod está rodando.")
    except httpx.TimeoutException:
        raise HTTPException(504, f"Timeout após {timeout}s aguardando o Mantella.")
    except Exception as exc:
        log.exception("Erro inesperado ao contatar o Mantella")
        raise HTTPException(500, str(exc))


def _extract_npc_response(mantella_data: dict) -> dict:
    """Traduz a resposta do Mantella para o formato que o frontend espera."""
    npc_talk = mantella_data.get("mantella_npc_talk", {})
    actions = npc_talk.get("mantella_actor_actions", []) if npc_talk else []
    action_ids = [a.get("identifier") for a in actions if isinstance(a, dict) and a.get("identifier")]
    return {
        "npc_name": npc_talk.get("mantella_actor_speaker", "") if npc_talk else "",
        "npc_response": npc_talk.get("mantella_actor_line_to_speak", "") if npc_talk else "",
        "action": action_ids[0] if action_ids else None,
        "reply_type": mantella_data.get("mantella_reply_type", ""),
        "_raw": mantella_data,
    }


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

    # Traduza o formato do frontend para o formato do Mantella
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

    # NPCs
    for npc in body.get("npcs", []):
        actors.append(_build_actor(
            name=npc.get("name", ""),
            race=npc.get("race", "Nord"),
            gender=npc.get("gender", "male"),
            is_player=False,
            ref_id=npc.get("ref_id", "0x000198C5"),
            base_id=npc.get("base_id", "0x000198C4"),
            voice_type=npc.get("voice_type", ""),
            is_in_combat=npc.get("is_in_combat", False),
            is_enemy=npc.get("is_enemy", False),
            relationship_rank=npc.get("relationship_rank", 0),
        ))

    # Converte "HH:MM" → hora inteira
    time_str = body.get("in_game_time", "12:00")
    try:
        hour = int(time_str.split(":")[0])
    except Exception:
        hour = 12

    mantella_body = {
        "mantella_request_type": "mantella_start_conversation",
        "mantella_input_type": "mantella_text_input",
        "mantella_actors": actors,
        "mantella_context": {
            "mantella_location": body.get("location", "Skyrim"),
            "mantella_time": hour,
            "mantella_gamedays": 1,
            "mantella_ingame_events": [],
            "mantella_nearby_actors": [],
        },
    }

    data = await _post_mantella(mantella_body)
    return JSONResponse(data)


STOP_REPLY_TYPES = {"mantella_player_talk", "mantella_end_conversation", "error"}

@app.post("/player_input")
async def player_input(request: Request):
    body = await request.json()
    transcript = body.get("transcript", "")

    # Passo 1: envia o texto do jogador
    input_data = await _post_mantella({
        "mantella_request_type": "mantella_player_input",
        "mantella_player_input": transcript,
        "mantella_context": {},
    })
    log.info(f"player_input reply_type: {input_data.get('mantella_reply_type')}")

    # Passo 2: loop de continue_conversation — coleta todas as falas do turno
    # Cada chamada retorna uma fala; paramos quando o Mantella pede a vez do jogador
    sentences: list[dict] = []
    MAX_SENTENCES = 10

    for i in range(MAX_SENTENCES):
        continue_data = await _post_mantella({
            "mantella_request_type": "mantella_continue_conversation",
            "mantella_topicinfofile": 1,
            "mantella_context": {},
        }, timeout=TIMEOUT_LLM)

        reply_type = continue_data.get("mantella_reply_type", "")
        log.info(f"continue [{i+1}] reply_type: {reply_type} | raw: {json.dumps(continue_data)}")

        npc_talk = continue_data.get("mantella_npc_talk")
        if npc_talk and npc_talk.get("mantella_actor_line_to_speak"):
            sentences.append({
                "speaker": npc_talk.get("mantella_actor_speaker", ""),
                "text": npc_talk.get("mantella_actor_line_to_speak", ""),
                "actions": npc_talk.get("mantella_actor_actions", []),
            })

        if reply_type in STOP_REPLY_TYPES:
            break
        # mantella_npc_talk sem conteúdo = mantella aguardando jogador
        if reply_type == "mantella_npc_talk" and not npc_talk:
            break

    if not sentences:
        return JSONResponse([{"npc_name": "", "npc_response": "", "action": None}])

    # Retorna sempre uma lista — o frontend adiciona cada item como mensagem separada
    result = []
    for s in sentences:
        actions = [a.get("identifier") for a in s["actions"] if isinstance(a, dict) and a.get("identifier")]
        result.append({
            "npc_name": s["speaker"],
            "npc_response": s["text"],
            "action": actions[0] if actions else None,
        })
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
        log.warning(f"Erro ao ler JSON {file_path}: {e}")
    return []


def parse_override_csv(file_path: Path) -> list[dict]:
    try:
        with open(file_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            return [row for row in reader if row.get("name", "").strip()]
    except Exception as e:
        log.warning(f"Erro ao ler CSV {file_path}: {e}")
    return []


def load_all_overrides(folder: Path) -> list[dict]:
    if not folder.exists():
        log.info(f"Pasta de overrides não encontrada: {folder}")
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
        raise HTTPException(status_code=400, detail="Campo 'path' é obrigatório.")
    OVERRIDE_PATH = Path(new_path)
    return {"path": str(OVERRIDE_PATH), "exists": OVERRIDE_PATH.exists()}


if __name__ == "__main__":
    import uvicorn
    log.info(f"Pasta de overrides configurada: {OVERRIDE_PATH}")
    uvicorn.run("proxy:app", host="0.0.0.0", port=8080, reload=True, log_level="info")
