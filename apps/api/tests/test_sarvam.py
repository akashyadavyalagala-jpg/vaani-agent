import pytest
import base64
from unittest.mock import MagicMock
from httpx import HTTPStatusError, TimeoutException, Request, Response
from vaani.sarvam.client import get_client, RateLimitError, TimeoutError
from vaani.sarvam import stt, llm, tts

@pytest.fixture
def mock_sarvam(mocker):
    # Mock the client singleton
    mock_instance = mocker.patch("vaani.sarvam.client.SarvamClient")
    mock_client = MagicMock()
    mock_instance.return_value.client = mock_client
    
    # Provide the get_client patch explicitly if needed
    mocker.patch("vaani.sarvam.client.get_client", return_value=mock_client)
    return mock_client

@pytest.mark.asyncio
async def test_stt_success(mock_sarvam):
    mock_res = MagicMock()
    mock_res.transcript = "నమస్కారం"
    mock_sarvam.speech_to_text.transcribe.return_value = mock_res
    
    res = await stt.transcribe(b"fake_audio", "audio/wav")
    assert res == "నమస్కారం"
    assert mock_sarvam.speech_to_text.transcribe.called

@pytest.mark.asyncio
async def test_llm_success(mock_sarvam):
    mock_res = MagicMock()
    mock_res.choices = [MagicMock()]
    mock_res.choices[0].message.content = "బాగున్నాను"
    mock_sarvam.chat.completions.return_value = mock_res
    
    res = await llm.complete([{"role": "user", "content": "hello"}])
    assert res == "బాగున్నాను"
    assert mock_sarvam.chat.completions.called

@pytest.mark.asyncio
async def test_tts_success(mock_sarvam):
    mock_res = MagicMock()
    # Mock base64 returned by the API
    mock_res.audios = [base64.b64encode(b"fake_wav").decode("utf-8")]
    mock_sarvam.text_to_speech.convert.return_value = mock_res
    
    res = await tts.synthesize("test", "kavitha", 1.0)
    assert res == b"fake_wav"
    assert mock_sarvam.text_to_speech.convert.called

@pytest.mark.asyncio
async def test_rate_limit(mock_sarvam):
    request = Request("POST", "http://test")
    response = Response(429, request=request)
    mock_sarvam.chat.completions.side_effect = HTTPStatusError("429 Too Many Requests", request=request, response=response)
    
    with pytest.raises(RateLimitError):
        await llm.complete([])

@pytest.mark.asyncio
async def test_timeout(mock_sarvam):
    mock_sarvam.chat.completions.side_effect = TimeoutException("timeout")
    
    with pytest.raises(TimeoutError):
        await llm.complete([])
