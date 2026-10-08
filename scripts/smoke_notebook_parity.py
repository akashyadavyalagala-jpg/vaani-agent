import os
import sys
import asyncio

# Ensure apps/api is in the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'apps', 'api'))

from vaani.config import settings
from vaani.sarvam import llm, tts, stt

async def main():
    key = settings.sarvam_api_key.get_secret_value()
    if not key or key in ["your_api_key_here", "test"]:
        print("Skipping smoke parity tests due to missing SARVAM_API_KEY.")
        sys.exit(0)

    print("Running Smoke Parity Tests...")

    # Test LLM (Cell 3 equivalent)
    print("Testing LLM...")
    reply = await llm.complete([
        {"role": "system", "content": "You are a Telugu assistant."},
        {"role": "user", "content": "నమస్కారం, మీరు ఎలా ఉన్నారు?"}
    ])
    assert reply and len(reply) > 0
    print(f"LLM Reply: {reply}")

    # Test TTS (Cell 4 equivalent)
    print("Testing TTS...")
    audio = await tts.synthesize("నమస్కారం! మీకు ఎలా సహాయం చేయగలను?", "kavitha", 1.0)
    assert audio and len(audio) > 100
    print(f"TTS generated {len(audio)} bytes of WAV audio.")

    # Test STT (Cell 9 equivalent)
    # Generate a dummy valid 16khz WAV to test STT, or if we have one.
    # Since we don't have a real Telugu recording easily available in the script,
    # we'll skip STT unless we synthesize one first!
    print("Testing STT using the synthesized audio...")
    transcript = await stt.transcribe(audio, "audio/wav")
    assert transcript and len(transcript) > 0
    print(f"STT Transcript: {transcript}")

    print("All notebook parity checks passed!")

if __name__ == "__main__":
    asyncio.run(main())
