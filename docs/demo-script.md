# Vaani - 60-Second Demo Kit

This script is designed for a flawless screen-recorded product demonstration.

## Preparation Checklist
- [ ] Ensure Docker containers are running (`docker-compose up`).
- [ ] Turn off notifications and "Do Not Disturb" on your Mac/PC.
- [ ] Ensure Bluetooth headphones are charged or use a wired mic to avoid OS-level echo cancellation clipping.
- [ ] Clear browser cache/cookies to show the Cookie Consent banner if desired.
- [ ] Database is seeded (`python seed.py` has been executed).

## The Script

### 1. The Dashboard (0:00 - 0:15)
**Action:** Open `http://localhost:3000/app/overview`.
**Voiceover:** "Meet Vaani, the intelligent Telugu voice AI designed for Indian businesses. From our dashboard, business owners get a bird's-eye view of call volume, booking completion rates, and real-time latency."
**Visual:** Scroll down smoothly to show the language distribution graph and recent calls list.

### 2. The Agent Studio (0:15 - 0:30)
**Action:** Click on the `Agent` tab in the sidebar.
**Voiceover:** "Configuring your AI is as easy as typing. You can define your business name, working hours, and even feed it custom FAQs."
**Visual:** Highlight the `Tone` dial, moving it from 'Formal' to 'Warm'.

### 3. The Live Call (0:30 - 0:55)
**Action:** Open `http://localhost:3000/talk` in a new tab.
**Voiceover:** "But the real magic is the latency. Let's talk to it."
**Action:** Click the microphone. 
**You:** "నమస్కారం, నాకు రేపు ఒక అపాయింట్మెంట్ కావాలి." (Namaskaram, I need an appointment tomorrow).
**Agent (Audio):** "నమస్కారం! తప్పకుండా, మీ పేరు చెప్పండి?" (Namaskaram! Sure, what is your name?)
**You:** "నా పేరు ఆకాష్." (My name is Akash.)
**Visual:** The Orb pulses smoothly with the audio.

### 4. The Handoff (0:55 - 1:00)
**Action:** Switch back to `http://localhost:3000/app/calls`.
**Voiceover:** "Everything is instantly synced, transcribed, and available for review."
**Visual:** Click the top call in the list, showing the synced audio waveform and Telugu transcript.
