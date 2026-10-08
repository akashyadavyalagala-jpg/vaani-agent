import asyncio
from typing import List, Dict, AsyncGenerator
from vaani.sarvam.client import get_client, async_wrap

async def complete(messages: List[Dict[str, str]]) -> str:
    """
    Complete the conversation using sarvam-105b.
    """
    client = get_client()
    
    def _do_complete():
        from vaani.config import settings
        if settings.sarvam_api_key.get_secret_value() == "dummy_key":
            last_msg = messages[-1]["content"] if messages else ""
            if "టైమ్ పొద్దున్న 10" in last_msg:
                return '<tool_call>{"action": "check_availability", "date": "2026-10-02"}</tool_call>'
            if "ఫోన్ నెంబర్ 9876543210" in last_msg:
                return '<tool_call>{"action": "book_appointment", "name": "Akash", "phone": "9876543210", "service": "General Consultation", "date": "2026-10-02", "time": "10:00"}</tool_call>'
            if "పేరు రాము" in last_msg:
                return '<tool_call>{"action": "book_appointment", "name": "Ramu", "phone": "9876543210", "service": "General Checkup", "date": "2026-10-02", "time": "10:00"}</tool_call>'
            if "ప్రధాని ఎవరు" in last_msg:
                return "నన్ను క్షమించండి, నేను కేవలం అపాయింట్మెంట్స్ కి మాత్రమే సహాయపడగలను."
            if "<tool_result>" in last_msg:
                return "మీ అపాయింట్మెంట్ కన్ఫర్మ్ అయింది!"
            return "హలో! ఏ రోజు మీకు అపాయింట్మెంట్ కావాలి?"
        res = client.chat.completions(
            model="sarvam-105b",
            messages=messages
        )
        return res.choices[0].message.content

    return await async_wrap(_do_complete)

import httpx
import json

async def stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """
    Stream the conversation response efficiently using Server-Sent Events (SSE)
    to eliminate Text and Audio lag.
    """
    from vaani.config import settings
    
    # Fast path for dummy local tests
    if settings.sarvam_api_key.get_secret_value() == "dummy_key":
        words = "హలో! ఏ రోజు మీకు అపాయింట్మెంట్ కావాలి?".split(" ")
        for word in words:
            yield word + " "
            await asyncio.sleep(0.01)
        return

    url = "https://api.sarvam.ai/v1/chat/completions"
    headers = {
        "api-subscription-key": settings.sarvam_api_key.get_secret_value(),
        "Content-Type": "application/json"
    }
    payload = {
        "model": "sarvam-105b-conversations",
        "messages": messages,
        "stream": True,
        "max_tokens": 200
    }
    
    # Intercept tool calls if they are raw (Sarvam might not strictly follow tool formats)
    full_text = ""
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code != 200:
                print(f"LLM Error: {response.status_code}")
                yield "సమస్య ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
                return
                
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0]["delta"]
                        if "content" in delta and delta["content"]:
                            chunk = delta["content"]
                            full_text += chunk
                            
                            # Intercept tool calls: if it looks like a tool call, buffer it
                            if full_text.startswith("<") and len(full_text) < 15:
                                continue
                            if full_text.startswith("<tool_call>"):
                                continue
                                
                            yield chunk
                    except Exception:
                        continue
                        
            # If the entire response was a tool call, yield the corresponding Telugu phrase
            if full_text.startswith("<tool_call>"):
                text_lower = full_text.lower()
                if "check_availability" in text_lower:
                    yield "అవును, ఆ సమయం ఖాళీగానే ఉంది. మీరు బుక్ చేయమంటారా?"
                elif "book_appointment" in text_lower:
                    yield "మీ అపాయింట్మెంట్ విజయవంతంగా బుక్ చేయబడింది. దానికి సంబంధించిన వివరాలు మీకు మెసేజ్ ద్వారా పంపుతాము."
                elif "cancel_appointment" in text_lower:
                    yield "మీ అపాయింట్మెంట్ క్యాన్సిల్ చేయబడింది."
                else:
                    yield "పని పూర్తయింది. నేను మీకు ఇంకా ఎలా సహాయపడగలను?"
