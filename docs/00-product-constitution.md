# Vaani (వాణి) - Product Constitution

## 1. Vision
To build the most natural, premium, and reliable Telugu voice AI agent, seamlessly bridging the gap between local businesses and their Telugu-speaking customers. Vaani aims to make digital interactions feel as warm, intuitive, and human as speaking to a trusted local receptionist, operating entirely in real-time with flawless code-switching between Telugu and English.

## 2. Target Users
- **End Customers:** Telugu-speaking customers (often comfortable with Telugu-English code-mixing) of local businesses such as clinics, salons, banks, real-estate firms, and utility providers.
- **Business Owners:** Administrators and operators of these businesses who configure the agent, review conversation logs, and manage bookings or customer inquiries.

## 3. Core Use Cases
1. **Appointment Booking & Rescheduling:** Handling requests like "నాకు రేపు అపాయింట్మెంట్ కావాలి" (I need an appointment tomorrow) for clinics and salons.
2. **Service Inquiries & FAQs:** Answering common questions about pricing, operating hours, and location.
3. **Lead Qualification:** Gathering preliminary details for real-estate or banking services before handing off to a human agent.
4. **Outbound Reminders:** Calling customers to remind them of upcoming appointments or payments (future scope, but architecturally supported).
5. **Issue Triage:** Identifying the urgency of a utility or banking issue and routing the customer to the appropriate human department.

## 4. Non-Goals
- We are not building a general-purpose voice assistant (like Siri or Alexa).
- We are not supporting languages other than Telugu (and Telugu-English code-mixing) in this phase.
- We will not implement complex multi-turn negotiations or therapy; Vaani is task-oriented.
- No heavy, complex web dashboards for the end-user; the primary interface is the real-time voice orb.

## 5. Success Metrics
- **Latency:** End-of-speech-to-first-audio latency target < 1.5 seconds (p50).
- **Transcription Quality:** High accuracy rate on code-mixed (Telugu + English) speech using the `saaras:v3` model.
- **Task Success:** Appointment completion rate (successful bookings vs. total booking intents).

## 6. Brand Voice (System Prompt Rules)
The agent's behavior is governed by these exact rules:
1. Speak natural conversational Telugu.
2. Keep answers short.
3. Do not give long explanations.
4. Ask only one question at a time.
5. Never say "as an AI".
6. If the customer uses Telugu + English, respond naturally.
7. Do not repeat the customer's entire sentence.
8. Sound friendly and human.

## 7. Risk Register
| Risk | Mitigation |
| :--- | :--- |
| **Hallucinated Bookings** | Strict grounding of the LLM prompts. Validate available slots against a real database before confirming. |
| **PII Leakage** | Avoid storing sensitive details like credit cards in the `conversation` memory log. |
| **Mis-transcription** | Utilize `saaras:v3` transcribing capabilities effectively; prompt the LLM to gracefully handle slightly garbled input. |
| **TTS Mispronunciation** | `bulbul:v3` may mispronounce English words or complex numbers in Telugu. We will use phonetic spelling interventions in the prompt where necessary. |
