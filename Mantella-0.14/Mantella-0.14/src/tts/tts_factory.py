from src.config.config_loader import ConfigLoader
from src.config.definitions.tts_definitions import TTSEnum
from src.tts.ttsable import TTSable
from src.tts.piper import Piper
from src.tts.xtts import XTTS
from src.tts.xvasynth import xVASynth
from src.games.gameable import Gameable
from src import utils

logger = utils.get_logger()

_PARSE_MAPPING: dict[str, TTSEnum] = {
    'piper': TTSEnum.PIPER,
    'xtts': TTSEnum.XTTS,
    'xvasynth': TTSEnum.XVASYNTH,
    'none': TTSEnum.NONE,
}


def parse_tts_service(value: str | None) -> TTSEnum | None:
    """Parse a TTS service string into a TTSEnum value.

    Returns None for empty / null-like strings. Logs a warning for unrecognized values.
    """
    if not value:
        return None
    normalized = str(value).strip().lower().replace('-', '').replace('_', '').replace(' ', '')
    if normalized in ('nan', 'none', 'null', ''):
        return None
    result = _PARSE_MAPPING.get(normalized)
    if result is None:
        logger.warning(f"Unrecognized tts_service '{value}'. Valid options: piper, xtts, xvasynth. Using default TTS.")
    return result


def create_tts(service: TTSEnum | None, config: ConfigLoader, game: Gameable | None = None) -> TTSable:
    """Create a new TTS instance for the given service."""
    if service is None or service == TTSEnum.NONE:
        return NoopTTS(config)
    if service == TTSEnum.PIPER:
        return Piper(config, game)
    elif service == TTSEnum.XTTS:
        return XTTS(config, game)
    elif service == TTSEnum.XVASYNTH:
        return xVASynth(config)
    raise ValueError(f"Unknown TTS service: {service}")


class NoopTTS(TTSable):
    """TTS desativado — não sintetiza nada."""
    def __init__(self, config, game=None):
        self._last_voice = None
        self._synthesizer = None

    def change_voice(self, voice, in_game_voice=None, csv_in_game_voice=None,
                     advanced_voice_model=None, voice_accent=None,
                     voice_gender=None, voice_race=None):
        self._last_voice = voice

    def tts_synthesize(self, voiceline, final_voiceline_file, synth_options):
        pass

    def synthesize(self, voice, voiceline, in_game_voice, csv_in_game_voice,
                   voice_accent, synth_options, advanced_voice_model=None):
        """Sobrescreve o método concreto da base para evitar acesso a atributos não inicializados."""
        self._last_voice = voice
        return ""
