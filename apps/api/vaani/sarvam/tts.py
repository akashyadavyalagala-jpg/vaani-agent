import base64
from vaani.sarvam.client import get_client, async_wrap

async def synthesize(text: str, voice: str, pace: float, lang: str = "te-IN") -> bytes:
    """
    Synthesize text to speech using bulbul:v3.
    Returns the decoded base64 WAV bytes.
    """
    client = get_client()
    
    def _do_synthesize():
        from vaani.config import settings
        if settings.sarvam_api_key.get_secret_value() == "dummy_key":
            return b"dummy_audio"
        res = client.text_to_speech.convert(
            text=text,
            language_code=lang,
            model="bulbul:v3",
            speaker=voice,
            pace=pace
        )
        return base64.b64decode(res.audios[0])

    return await async_wrap(_do_synthesize)
