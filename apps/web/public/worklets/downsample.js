class DownsampleProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options.processorOptions?.targetSampleRate || 16000;
    this.inputSampleRate = options.processorOptions?.inputSampleRate || 48000;
    
    // We want to emit roughly 20-40ms chunks at 16kHz.
    // 30ms at 16kHz = 480 samples. Let's use 512 for a nice power of 2, 
    // which is 32ms.
    this.bufferSize = 512; 
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    this.ratio = this.inputSampleRate / this.targetSampleRate;
    this.lastSample = 0;
    this.readIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    
    const channelData = input[0]; // Mono
    
    // Simple linear interpolation downsampling
    while (this.readIndex < channelData.length) {
      const idx = Math.floor(this.readIndex);
      const nextIdx = Math.min(idx + 1, channelData.length - 1);
      const fraction = this.readIndex - idx;
      
      const sample = channelData[idx] * (1 - fraction) + channelData[nextIdx] * fraction;
      
      this.buffer[this.bufferIndex++] = sample;
      
      if (this.bufferIndex >= this.bufferSize) {
        // Convert to Int16 PCM to save bandwidth (if the server expects it) 
        // or just send Float32. The prompt says "PCM", usually means Int16 PCM for WebSockets.
        // We'll emit Float32 and let the main thread encode it to base64, 
        // or convert it to Int16 right here.
        
        const pcm16 = new Int16Array(this.bufferSize);
        for (let i = 0; i < this.bufferSize; i++) {
          let s = Math.max(-1, Math.min(1, this.buffer[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
        
        this.bufferIndex = 0;
      }
      
      this.readIndex += this.ratio;
    }
    
    this.readIndex -= channelData.length;
    
    return true;
  }
}

registerProcessor('downsample-processor', DownsampleProcessor);
