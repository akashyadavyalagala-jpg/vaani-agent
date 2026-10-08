from typing import Dict, Any
from twilio.request_validator import RequestValidator
from twilio.rest import Client
from .base import TelephonyProvider
import os

class TwilioProvider(TelephonyProvider):
    def __init__(self, auth_token: str, account_sid: str = None):
        self.auth_token = auth_token
        self.account_sid = account_sid
        self.validator = RequestValidator(auth_token)
        if account_sid and auth_token:
            self.client = Client(account_sid, auth_token)
        else:
            self.client = None

    def validate_signature(self, request_url: str, request_params: Dict[str, Any], signature: str) -> bool:
        return self.validator.validate(request_url, request_params, signature)

    def generate_incoming_twiml(self, wss_url: str) -> str:
        """
        Compliance First: Disclose AI and recording.
        Then start the bidirectional media stream.
        """
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <!-- Compliance message in Telugu -->
    <Say voice="Polly.Aditi">నమస్కారం. ఈ కాల్ ఒక AI అసిస్టెంట్ ద్వారా సమాధానం ఇవ్వబడుతుంది మరియు నాణ్యత కోసం రికార్డ్ చేయబడుతుంది.</Say>
    <Connect>
        <Stream url="{wss_url}">
            <Parameter name="channel" value="phone" />
        </Stream>
    </Connect>
</Response>"""

    def get_outbound_twiml(self, wss_url: str) -> str:
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">నమస్కారం, ఇది ఒక ముఖ్యమైన రిమైండర్ కోసం AI అసిస్టెంట్ కాల్.</Say>
    <Connect>
        <Stream url="{wss_url}">
            <Parameter name="channel" value="phone" />
        </Stream>
    </Connect>
</Response>"""

    async def place_call(self, to_number: str, from_number: str, wss_url: str) -> str:
        if not self.client:
            raise ValueError("Twilio client not configured with SID and Token.")
        
        twiml = self.get_outbound_twiml(wss_url)
        call = self.client.calls.create(
            to=to_number,
            from_=from_number,
            twiml=twiml
        )
        return call.sid
