from pydantic import BaseModel
from typing import Dict

class Voice(BaseModel):
    id: str
    display_name: str
    sample_text: str
    default_pace: float = 1.0

VOICES: Dict[str, Voice] = {
    "kavitha": Voice(id="kavitha", display_name="Kavitha", sample_text="నమస్కారం. నేను కవిత. మీకు ఎలా సహాయం చేయగలను?"),
    "rupali": Voice(id="rupali", display_name="Rupali", sample_text="నమస్కారం. నేను రూపాలి. మీకు ఎలా సహాయం చేయగలను?"),
    "priya": Voice(id="priya", display_name="Priya", sample_text="నమస్కారం. నేను ప్రియ. మీకు ఎలా సహాయం చేయగలను?"),
    "shreya": Voice(id="shreya", display_name="Shreya", sample_text="నమస్కారం. నేను శ్రేయ. మీకు ఎలా సహాయం చేయగలను?"),
    "shruti": Voice(id="shruti", display_name="Shruti", sample_text="నమస్కారం. నేను శృతి. మీకు ఎలా సహాయం చేయగలను?"),
    "suhani": Voice(id="suhani", display_name="Suhani", sample_text="నమస్కారం. నేను సుహాని. మీకు ఎలా సహాయం చేయగలను?"),
    "vijay": Voice(id="vijay", display_name="Vijay", sample_text="నమస్కారం. నేను విజయ్. మీకు ఎలా సహాయం చేయగలను?")
}

DEFAULT_VOICE = "kavitha"

def get_voice(voice_id: str) -> Voice:
    return VOICES.get(voice_id, VOICES[DEFAULT_VOICE])
