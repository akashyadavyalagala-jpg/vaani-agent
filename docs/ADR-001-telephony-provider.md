# ADR 001: Telephony Provider for India Voice AI

## Context
Vaani requires the ability to receive and place real phone calls in India. The chosen provider must support:
1. **Real-time Audio Streaming**: Bidirectional WebSockets (Media Streams) to stream audio chunks between the provider and our backend in real-time, bypassing slow SIP trunks or offline recording.
2. **Indian Regulatory Compliance**: Telemarketing (TRAI/DLT) requirements, opt-out registries (NCPR), explicit consent for recording, and local number availability.

We evaluated Twilio, Plivo, Exotel, and Knowlarity.

## Decision
We select **Twilio**.

### Rationale
- **Media Streams**: Twilio's `<Connect><Stream>` TwiML verb provides industry-leading, perfectly documented bidirectional WebSocket streaming (8kHz PCMU / mu-law). 
- **Signature Verification**: Highly robust SDKs for validating `X-Twilio-Signature` to prevent spoofed webhook invocations.
- **Indian Regulations**: Twilio supports India Local Virtual Numbers (LVNs) and toll-free numbers, enforcing strict KYC and regulatory compliance in their console. Outbound calls must respect Indian quiet hours (9 PM to 8 AM IST) and DLT (for any companion SMS). 

*Alternative considered: Exotel.* Exotel is deeply native to India and excellent for compliance, but its WebSocket streaming APIs (Voice API v2) are newer and have less community tooling compared to Twilio's Media Streams for raw PCMU byte manipulation. Plivo is a close second but Twilio's ecosystem for AI voice bridging is more mature.

## Consequences
1. **Audio Bridging**: We must transcode 8kHz mu-law (Twilio standard) to 16kHz PCM (Sarvam AI standard) on the fly, and vice-versa.
2. **Consent First**: The TwiML must play a static `<Say>` or `<Play>` message in Telugu declaring "This call is being recorded by an AI assistant" *before* connecting the stream, to ensure absolute compliance.
3. **Quiet Hours**: Our outbound scheduler must enforce IST timezone checks to prevent dialing outside 08:00 - 21:00.
