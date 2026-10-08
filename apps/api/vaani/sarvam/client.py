import asyncio
from functools import partial
from typing import Callable, TypeVar, Any
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from sarvamai import SarvamAI
import httpx

from vaani.config import settings

T = TypeVar("T")

class SarvamAPIError(Exception):
    pass

class RateLimitError(SarvamAPIError):
    pass

class TimeoutError(SarvamAPIError):
    pass

def map_sarvam_error(exc: Exception) -> Exception:
    """Map httpx or SDK exceptions to our domain errors."""
    if isinstance(exc, httpx.HTTPStatusError):
        if exc.response.status_code == 429:
            return RateLimitError("Rate limit exceeded")
        return SarvamAPIError(f"HTTP Error: {exc.response.status_code} - {exc.response.text}")
    if isinstance(exc, httpx.TimeoutException):
        return TimeoutError("Request timed out")
    return exc

class SarvamClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SarvamClient, cls).__new__(cls)
            cls._instance._client = SarvamAI(api_subscription_key=settings.sarvam_api_key.get_secret_value())
        return cls._instance
    
    @property
    def client(self) -> SarvamAI:
        return self._client

def get_client() -> SarvamAI:
    return SarvamClient().client

# Base async wrapper with retries for transient errors
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((RateLimitError, TimeoutError)),
    reraise=True
)
async def async_wrap(func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    loop = asyncio.get_running_loop()
    pfunc = partial(func, *args, **kwargs)
    try:
        return await loop.run_in_executor(None, pfunc)
    except Exception as e:
        mapped_err = map_sarvam_error(e)
        if mapped_err is not e:
            raise mapped_err from e
        raise
