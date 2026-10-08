import { MicVAD } from '@ricky0123/vad-web';
import { useSessionStore } from '../store/useSessionStore';

export class AudioCapture {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private vad: any = null; // using any since vad types can be complex
  public onAudioData: ((pcm: Int16Array) => void) | null = null;

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.context.resume(); // iOS Safari quirk

      // Load downsampler worklet
      await this.context.audioWorklet.addModule('/worklets/downsample.js');
      
      const source = this.context.createMediaStreamSource(this.stream);
      
      this.workletNode = new AudioWorkletNode(this.context, 'downsample-processor', {
        processorOptions: {
          targetSampleRate: 16000,
          inputSampleRate: this.context.sampleRate,
        }
      });

      this.workletNode.port.onmessage = (event) => {
        if (this.onAudioData) {
          // The worklet sends the buffer, we wrap it in Int16Array
          this.onAudioData(new Int16Array(event.data));
        }
      };

      source.connect(this.workletNode);
      this.workletNode.connect(this.context.destination); // Required for some browsers to keep the worklet running, but we might want to ensure we don't output to speakers to prevent echo loop. Wait, we must NOT connect worklet to destination if it outputs audio. The downsampler just emits messages, so connecting might be safe if we output 0s. Let's just not connect to destination unless it pauses. We can connect it to a dummy gain node with gain=0.

      const dummyGain = this.context.createGain();
      dummyGain.gain.value = 0;
      this.workletNode.connect(dummyGain);
      dummyGain.connect(this.context.destination);

      // Setup VAD
      const { handsFree } = useSessionStore.getState();
      if (handsFree) {
        this.vad = await MicVAD.new({
          getStream: async () => this.stream!,
          onSpeechStart: () => {
            const state = useSessionStore.getState().state;
            if (state === 'listening' || state === 'idle' || state === 'agent-speaking') {
              useSessionStore.getState().setState('user-speaking');
            }
          },
          onSpeechEnd: (audio: Float32Array) => {
            const state = useSessionStore.getState().state;
            if (state === 'user-speaking') {
              useSessionStore.getState().setState('listening'); // Will transition to thinking when server processes
            }
          },
          onVADMisfire: () => {
            const state = useSessionStore.getState().state;
            if (state === 'user-speaking') {
              useSessionStore.getState().setState('listening');
            }
          }
        });
        this.vad.start();
      }

    } catch (err: any) {
      console.error('Audio capture failed:', err);
      useSessionStore.getState().setError(err.message || 'Microphone access denied');
      throw err;
    }
  }

  stop() {
    if (this.vad) {
      this.vad.destroy();
      this.vad = null;
    }
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  pause() {
    if (this.vad) this.vad.pause();
  }

  resume() {
    if (this.vad) this.vad.start();
  }
}
