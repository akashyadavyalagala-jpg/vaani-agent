# Sarvam AI API Verified Notes

These facts are verified from the current Sarvam AI Developer Documentation.

## 1. Streaming Options
- **Speech-to-Text (STT):** Real-time streaming is achieved via WebSockets (`wss://api.sarvam.ai/speech-to-text-realtime/ws`), which is essential for low latency and voice activity detection (VAD). [Source](https://docs.sarvam.ai/)
- **Text-to-Speech (TTS):** Supports both WebSocket streaming (`wss://api.sarvam.ai/text-to-speech/ws`) for persistent, low-latency conversational agents, and HTTP Streaming (`POST /text-to-speech/stream`) for one-shot server-side pipelines. [Source](https://docs.sarvam.ai/)

## 2. Audio Formats
- **STT Input:** The REST/Batch APIs support WAV, MP3, AAC, AIFF, OGG, OPUS, FLAC, WebM, etc. For WebSocket/PCM streaming, explicit codec mapping is required (`pcm_s16le`, `pcm_l16`, `pcm_raw`). [Source](https://docs.sarvam.ai/)
- **TTS Output:** Supports `mp3`, `wav`, `aac`, `opus`, `flac`, `linear16` (PCM), `mulaw`, and `alaw`. Base64-encoded `wav` is the standard output for typical usage. [Source](https://docs.sarvam.ai/)

## 3. Text Length Limits (TTS)
- **REST API:** Max 2,500 characters per request.
- **HTTP Streaming:** Max 3,500 characters per request.
- **WebSocket:** Max 2,500 characters per message, but keeping it under 500 characters is recommended for optimal low-latency streaming. [Source](https://docs.sarvam.ai/)

## 4. Voice Parameters
- **Pace:** The `pace` parameter is fully supported and ranges from `0.5` to `2.0` (where `1.0` is the native speed).
- **Pitch & Loudness:** These parameters are **not supported** on the current `bulbul:v3` model (they were legacy features of v2). We must rely on speaker selection and pace control for prosody. [Source](https://docs.sarvam.ai/)

## 5. Sample Rates
- **STT:** `16 kHz` is the recommended sample rate for maximum accuracy. Telephony audio (`8 kHz`) is also natively supported.
- **TTS:** Supports 8000, 16000, 22050, and 24000 Hz across all surfaces. The default is `24000 Hz`. [Source](https://docs.sarvam.ai/)

## 6. Rate Limits
Limits are account-wide and based on a token-bucket model:
- **STT WebSocket Streaming:** 20 concurrent connections on Starter, 100 on Pro/Business.
- **STT Real-time REST:** 60 requests/minute on Starter, up to 4,000 on Business. [Source](https://docs.sarvam.ai/)

## 7. Error Types
- **400 Bad Request (STT):** Common issues include exceeding duration limits (REST is limited to max 30s per request), submitting empty files, incorrect `multipart/form-data` formatting, or missing `input_audio_codec` for raw PCM streams. [Source](https://docs.sarvam.ai/)

## 8. Python SDK Usage (Prototype Verification)
The prototype demonstrates the following exact SDK signatures and parsing patterns:

**1. LLM (Chat Completions):**
```python
response = client.chat.completions(
    model="sarvam-105b",
    messages=conversation # List of dicts
)
reply = response.choices[0].message.content
```

**2. TTS (Text-to-Speech):**
```python
tts = client.text_to_speech.convert(
    text=reply,
    language_code="te-IN",
    model="bulbul:v3",
    speaker="kavitha", # Default voice
    pace=1.0
)
audio_bytes = base64.b64decode(tts.audios[0])
```
*Note: Available tested voices include `kavitha`, `rupali`, `priya`, `shreya`, `shruti`, `suhani`, and `vijay`.*

**3. STT (Speech-to-Text):**
```python
stt_response = client.speech_to_text.transcribe(
    file=open("user_audio.webm", "rb"),
    model="saaras:v3",
    mode="transcribe"
)
transcript = stt_response.transcript
```
