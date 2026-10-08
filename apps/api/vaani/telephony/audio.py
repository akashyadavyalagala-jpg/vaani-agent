import audioop

class AudioBridge:
    """
    Handles transcoding between Twilio (8kHz mu-law) and Sarvam (16kHz PCM).
    Maintains state for the rate conversion (if needed).
    """
    def __init__(self):
        self._in_rate_state = None
        self._out_rate_state = None

    def inbound_transcode(self, mulaw_bytes: bytes) -> bytes:
        """
        8kHz mu-law -> 16kHz PCM (16-bit)
        """
        # 1. Decode mu-law to 16-bit PCM (still 8kHz)
        pcm_8k = audioop.ulaw2lin(mulaw_bytes, 2)
        # 2. Resample 8kHz to 16kHz
        pcm_16k, self._in_rate_state = audioop.ratecv(
            pcm_8k, 2, 1, 8000, 16000, self._in_rate_state
        )
        return pcm_16k

    def outbound_transcode(self, pcm_16k_bytes: bytes) -> bytes:
        """
        16kHz PCM (16-bit) -> 8kHz mu-law
        """
        # 1. Resample 16kHz to 8kHz
        pcm_8k, self._out_rate_state = audioop.ratecv(
            pcm_16k_bytes, 2, 1, 16000, 8000, self._out_rate_state
        )
        # 2. Encode 16-bit PCM to mu-law
        mulaw_bytes = audioop.lin2ulaw(pcm_8k, 2)
        return mulaw_bytes
