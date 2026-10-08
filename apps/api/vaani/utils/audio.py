import wave
import io

def get_wav_duration(wav_bytes: bytes) -> float:
    try:
        with wave.open(io.BytesIO(wav_bytes), 'rb') as w:
            frames = w.getnframes()
            rate = w.getframerate()
            return frames / float(rate)
    except:
        return 0.0
