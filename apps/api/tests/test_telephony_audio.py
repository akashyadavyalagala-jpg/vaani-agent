import pytest
import audioop
import math
from vaani.telephony.audio import AudioBridge

def generate_sine_wave(freq: float, sample_rate: int, duration_sec: float) -> bytes:
    """Generates a 16-bit PCM sine wave."""
    num_samples = int(sample_rate * duration_sec)
    frames = bytearray()
    for i in range(num_samples):
        # 16-bit amplitude is roughly -32768 to 32767
        value = int(32767.0 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
        # Pack into 2 bytes little-endian
        frames.extend(value.to_bytes(2, byteorder='little', signed=True))
    return bytes(frames)

def test_audio_bridge_inbound_transcode():
    bridge = AudioBridge()
    # 1. Generate 8kHz sine wave
    pcm_8k = generate_sine_wave(440.0, 8000, 0.1) # 100ms
    # 2. Encode to mu-law (what Twilio sends)
    mulaw_8k = audioop.lin2ulaw(pcm_8k, 2)
    
    # 3. Transcode inbound (mu-law -> 16kHz PCM)
    pcm_16k = bridge.inbound_transcode(mulaw_8k)
    
    # Verify sizes: 100ms @ 8000Hz = 800 samples. 
    # mu-law (1 byte/sample) = 800 bytes
    assert len(mulaw_8k) == 800
    # 16kHz PCM (2 bytes/sample) = approx 3200 bytes
    assert len(pcm_16k) in (3198, 3200, 3202)

def test_audio_bridge_outbound_transcode():
    bridge = AudioBridge()
    # 1. Generate 16kHz sine wave (what Sarvam outputs)
    pcm_16k = generate_sine_wave(440.0, 16000, 0.1) # 100ms
    
    # 2. Transcode outbound (16kHz PCM -> 8kHz mu-law)
    mulaw_8k = bridge.outbound_transcode(pcm_16k)
    
    # Verify sizes: 100ms @ 16000Hz = 1600 samples. 
    # 16kHz PCM (2 bytes/sample) = 3200 bytes
    assert len(pcm_16k) == 3200
    # mu-law (1 byte/sample) = 800 bytes
    assert len(mulaw_8k) == 800
