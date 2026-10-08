import asyncio
import tempfile
import os
import subprocess
from typing import Dict, Any

from vaani.sarvam.client import get_client, async_wrap, SarvamAPIError

async def _transcode_to_wav(audio_bytes: bytes) -> bytes:
    """Transcode to 16 kHz mono WAV using ffmpeg."""
    loop = asyncio.get_running_loop()
    
    def run_ffmpeg():
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_in, \
             tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_out:
            in_path = temp_in.name
            out_path = temp_out.name
            temp_in.write(audio_bytes)
        
        try:
            # -y overwrites output, -ar 16000 sets sample rate, -ac 1 sets mono
            cmd = ["ffmpeg", "-y", "-i", in_path, "-ar", "16000", "-ac", "1", out_path]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            with open(out_path, "rb") as f:
                return f.read()
        finally:
            if os.path.exists(in_path):
                os.remove(in_path)
            if os.path.exists(out_path):
                os.remove(out_path)

    return await loop.run_in_executor(None, run_ffmpeg)

async def transcribe(audio_bytes: bytes, mime: str) -> str:
    """
    Transcribe audio bytes using Sarvam STT.
    Always transcodes to WAV first to ensure compatibility and prevent silent empty transcripts.
    """
    client = get_client()
    
    def _do_transcribe(data: bytes, filename: str) -> str:
        with tempfile.NamedTemporaryFile(suffix=filename, delete=False) as tmp:
            tmp_name = tmp.name
            tmp.write(data)
        
        try:
            with open(tmp_name, "rb") as f:
                res = client.speech_to_text.transcribe(
                    file=f,
                    model="saaras:v3",
                    mode="transcribe"
                )
            return res.transcript
        finally:
            if os.path.exists(tmp_name):
                os.remove(tmp_name)

    # Always transcode browser audio to clean 16kHz mono WAV for Sarvam
    wav_bytes = await _transcode_to_wav(audio_bytes)
    transcript = await async_wrap(_do_transcribe, wav_bytes, ".wav")
    return transcript
