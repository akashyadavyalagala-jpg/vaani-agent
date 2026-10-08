import { useSessionStore } from '../store/useSessionStore';

export class AudioPlayback {
  private context: AudioContext;
  private analyser: AnalyserNode;
  private queue: Array<{ id: string, buffer: AudioBuffer }> = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  getAnalyser() {
    return this.analyser;
  }

  // Expects base64 encoded wav string
  async playBase64Wav(id: string, base64: string) {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await this.context.decodeAudioData(bytes.buffer);
      this.queue.push({ id, buffer: audioBuffer });
      
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (e) {
      console.error('Failed to decode audio chunk:', e);
    }
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      const state = useSessionStore.getState().state;
      if (state === 'agent-speaking') {
        useSessionStore.getState().setState('listening');
      }
      return;
    }

    this.isPlaying = true;
    const { id, buffer } = this.queue.shift()!;
    
    // Ensure agent-speaking state is active
    if (useSessionStore.getState().state !== 'agent-speaking') {
      useSessionStore.getState().setState('agent-speaking');
    }

    this.currentSource = this.context.createBufferSource();
    this.currentSource.buffer = buffer;
    
    // Reset gain in case we faded out previously
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.setValueAtTime(1, this.context.currentTime);

    this.currentSource.connect(this.gainNode);
    
    this.currentSource.onended = () => {
      this.currentSource?.disconnect();
      this.currentSource = null;
      this.playNext();
    };

    this.currentSource.start(0);
  }

  interrupt() {
    // Instant flush on barge-in with 30ms fade-out to avoid clicks
    this.queue = [];
    if (this.currentSource) {
      const currTime = this.context.currentTime;
      this.gainNode.gain.setValueAtTime(1, currTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, currTime + 0.03);
      this.currentSource.stop(currTime + 0.03);
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  close() {
    this.interrupt();
    this.context.close();
  }
}
