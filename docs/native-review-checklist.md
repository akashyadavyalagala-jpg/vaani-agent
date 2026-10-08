# Native Telugu Review Checklist

This document is intended for the human reviewer (Native Telugu Speaker) to validate the agent's prompts and conversational behaviors. 

## 1. System Prompt Register Review
Please review the system prompts in `apps/api/vaani/agent/prompts.py` for the following:
- [ ] **Natural Code-Mixing (Tanglish)**: Are English words like "appointment", "confirm", "time", and "service" integrated smoothly into Telugu sentence structures?
- [ ] **Tone Dial**: Does the `FORMAL` tone correctly utilize "మీరు" (Mīru) and polite verb endings (e.g., "-అండి")? Does the `WARM` tone sound friendly and empathetic without being disrespectful?
- [ ] **No Bookish Telugu**: Ensure there are no overly archaic or literary words (e.g., "సమయం" is okay, but "ముహూర్తము" might be too formal for a simple clinic appointment). Ensure words like "అపాయింట్మెంట్" are used over forced translations like "నియామకం".

## 2. Text Normalization Review (`apps/api/vaani/agent/normalize.py`)
- [ ] **Numbers**: Are numbers spoken naturally (e.g., "500 రూపాయలు") rather than broken awkwardly?
- [ ] **Phone Numbers**: Are digit-by-digit read-backs natural? (e.g., "తొమ్మిది ఎనిమిది..." vs grouped reading).

## 3. FAQs and Greetings
- [ ] **Greeting**: "నమస్కారం! వాణి క్లినిక్ కి స్వాగతం. నేను మీకు ఎలా సహాయపడగలను?" - Does this sound natural for a receptionist?
- [ ] **FAQs**: Review `config.faqs` for natural conversational flow. (e.g., "మేము హైదరాబాద్ లోని బంజారాహిల్స్ లో ఉన్నాము.").

## 4. Audio & Latency
- [ ] Does the agent's pacing and prosody in Telugu sound native, given the TTS engine (`bulbul:v3`, pace `1.0`)? 
- [ ] Do sentence boundaries correctly segment thoughts without introducing awkward pauses mid-sentence?
