from abc import ABC, abstractmethod
from typing import Dict, Any, Callable

class TelephonyProvider(ABC):
    """
    Abstract interface for Telephony Providers (Twilio, Plivo, etc.)
    """

    @abstractmethod
    def validate_signature(self, request_url: str, request_params: Dict[str, Any], signature: str) -> bool:
        """Validates that an incoming webhook actually came from the provider."""
        pass

    @abstractmethod
    def generate_incoming_twiml(self, wss_url: str) -> str:
        """
        Generates the TwiML (or equivalent XML) response required to answer the call,
        give consent notice, and start the WebSocket media stream.
        """
        pass

    @abstractmethod
    def get_outbound_twiml(self, wss_url: str) -> str:
        """
        Generates the TwiML for an outbound call (similar to incoming, but might have
        a different greeting).
        """
        pass

    @abstractmethod
    async def place_call(self, to_number: str, from_number: str, wss_url: str) -> str:
        """
        Initiates an outbound call.
        Returns the Call SID / ID.
        """
        pass
