import { useSessionStore } from '../store/useSessionStore';
import { AudioCapture } from '../audio/AudioCapture';
import { AudioPlayback } from '../audio/AudioPlayback';

export class SessionClient {
  private ws: WebSocket | null = null;
  private capture: AudioCapture | null = null;
  private playback: AudioPlayback | null = null;
  private reconnectAttempts = 0;
  private url = 'ws://localhost:8000/ws/session'; // Example endpoint
  
  constructor() {
    this.playback = new AudioPlayback();
    this.capture = new AudioCapture();
    
    // When we capture PCM data, encode it and send over WS
    this.capture.onAudioData = (pcm16) => {
      // Int16Array -> Uint8Array -> base64
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const u8 = new Uint8Array(pcm16.buffer);
        let binary = '';
        // Btoa has limits, use a chunked approach or loop
        for (let i = 0; i < u8.byteLength; i++) {
          binary += String.fromCharCode(u8[i]);
        }
        const b64 = window.btoa(binary);
        
        this.ws.send(JSON.stringify({
          type: 'audio.chunk',
          payload: { pcm: b64 }
        }));
      }
    };
  }

  getAnalyser() {
    return this.playback?.getAnalyser();
  }

  async connect() {
    useSessionStore.getState().setState('connecting');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = async () => {
      this.reconnectAttempts = 0;
      
      const { voice, pace, agentId, locale } = useSessionStore.getState();
      
      // Start session
      this.ws?.send(JSON.stringify({
        type: 'session.start',
        payload: { voice, pace, agent_id: agentId, locale }
      }));

      // Start mic
      try {
        await this.capture?.start();
        useSessionStore.getState().setState('listening');
      } catch (err) {
        useSessionStore.getState().setError('Failed to start microphone.');
      }
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.handleMessage(msg);
      } catch (e) {
        console.error('Failed to parse WS msg:', e);
      }
    };

    this.ws.onclose = () => {
      this.cleanup();
      if (this.reconnectAttempts < 3) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts); // basic backoff
      } else {
        useSessionStore.getState().setError('Connection lost.');
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private handleMessage(msg: any) {
    const store = useSessionStore.getState();
    switch (msg.type) {
      case 'session.ready':
        store.setState('listening');
        break;
      case 'vad.speech_start':
        this.playback?.interrupt();
        store.setState('user-speaking');
        break;
      case 'stt.partial':
        store.updateTranscript('user_active', msg.payload.text, true);
        break;
      case 'stt.final':
        // Assign real ID
        store.updateTranscript('user_active', msg.payload.text, false);
        // We typically replace user_active with a real ID and create a new partial placeholder
        break;
      case 'llm.delta':
        store.setState('agent-speaking');
        // append delta to current agent transcript
        break;
      case 'agent.state':
        store.setState(msg.payload.state); // e.g. 'thinking'
        break;
      case 'tts.chunk':
        this.playback?.playBase64Wav(msg.payload.sentence_id, msg.payload.wav_b64);
        break;
      case 'metrics':
        store.setMetrics(msg.payload);
        break;
      case 'error':
        store.setError(msg.payload.message || 'Server error');
        break;
    }
  }

  interrupt() {
    this.playback?.interrupt();
    this.ws?.send(JSON.stringify({ type: 'interrupt' }));
    useSessionStore.getState().setState('listening');
  }

  sendText(text: string) {
    this.ws?.send(JSON.stringify({
      type: 'text.input',
      payload: { text }
    }));
    useSessionStore.getState().setState('thinking');
  }

  cleanup() {
    this.capture?.stop();
    this.playback?.close();
  }

  disconnect() {
    this.cleanup();
    this.ws?.close();
    useSessionStore.getState().setState('idle');
  }
}
