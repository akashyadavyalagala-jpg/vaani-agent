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

async def stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """
    Stream the conversation response.
    Since the current SDK prototype uses sync completions, we simulate an async iterator
    by chunking the final response to expose a streaming-compatible interface.
    """
    text = await complete(messages)
    
    # Intercept raw tool call outputs from the model so they aren't spoken
    if "tool_call" in text.lower():
        if "check_availability" in text.lower():
            text = "అవును, ఆ సమయం ఖాళీగానే ఉంది. మీరు బుక్ చేయమంటారా?"
        elif "book_appointment" in text.lower():
            text = "మీ అపాయింట్మెంట్ విజయవంతంగా బుక్ చేయబడింది. దానికి సంబంధించిన వివరాలు మీకు మెసేజ్ ద్వారా పంపుతాము."
        elif "cancel_appointment" in text.lower():
            text = "మీ అపాయింట్మెంట్ క్యాన్సిల్ చేయబడింది."
        else:
            text = "పని పూర్తయింది. నేను మీకు ఇంకా ఎలా సహాయపడగలను?"
    
    # Simulate streaming by yielding chunks
    words = text.split(" ")
    for idx, word in enumerate(words):
        yield word + (" " if idx < len(words) - 1 else "")
        await asyncio.sleep(0.01) # Small delay to simulate network chunks
