import { useState, useEffect, useRef, useCallback } from 'react';

export type AgentState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';
export type MessageRole = 'user' | 'agent';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

interface VoiceAgentReturn {
  state: AgentState;
  isMuted: boolean;
  messages: Message[];
  partialText: string;
  error: string | null;
  audioLevelRef: React.MutableRefObject<number>;
  sessionId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  sendMockText: (text: string) => void;
}

export function useVoiceAgent(mockMode: boolean = false): VoiceAgentReturn {
  const [state, setState] = useState<AgentState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef<number>(0);
  
  const rafRef = useRef<number>(0);
  const mockTimers = useRef<NodeJS.Timeout[]>([]);
  const stateRef = useRef<AgentState>('idle');
  const partialTextRef = useRef<string>('');
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlaybackTimeRef = useRef<number>(0);

  // Real WebSocket & VAD refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isSpeakingRef = useRef(false);
  const silenceStartRef = useRef<number>(0);

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cleanup function
  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    mockTimers.current.forEach(clearTimeout);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const playAudioChunk = async (base64: string) => {
    if (!audioContextRef.current) return;
    try {
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
      }
      const audioBuffer = await audioContextRef.current.decodeAudioData(array.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      const currentTime = audioContextRef.current.currentTime;
      if (nextPlaybackTimeRef.current < currentTime) {
          nextPlaybackTimeRef.current = currentTime;
      }
      
      source.start(nextPlaybackTimeRef.current);
      nextPlaybackTimeRef.current += audioBuffer.duration;
      
      activeSourcesRef.current.push(source);
      
      // Simulate audio level for UI since we don't have a playback analyser wired
      audioLevelRef.current = 0.4 + Math.random() * 0.4;
      source.onended = () => {
         audioLevelRef.current = 0;
         activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };
    } catch (e) {
      console.error("Failed to play audio chunk", e);
    }
  };

  const startAudioMonitoring = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let smoothedVolume = 0;
    const attack = 0.8;
    const release = 0.2;

    const monitor = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        const normalized = Math.min(average / 100, 1.0);
        
        // Exponential moving average for smoothing
        if (normalized > smoothedVolume) {
          smoothedVolume = smoothedVolume * (1 - attack) + normalized * attack;
        } else {
          smoothedVolume = smoothedVolume * (1 - release) + normalized * release;
        }
        
        if (!isMuted) {
          if (stateRef.current !== 'speaking') {
              audioLevelRef.current = smoothedVolume;
          }
          
          if (mockMode) {
             if (smoothedVolume > 0.4 && stateRef.current === 'listening') {
                stateRef.current = 'thinking'; // Lock instantly for synchronous rAF loop
                setTimeout(() => sendMockText("Hello, what can you do?"), 100);
             }
          } else {
             // REAL VAD Logic
             if (stateRef.current === 'listening' && wsRef.current?.readyState === WebSocket.OPEN) {
                 if (smoothedVolume > 0.08 && !isSpeakingRef.current) {
                     isSpeakingRef.current = true;
                     silenceStartRef.current = 0;
                     audioChunksRef.current = [];
                     if (mediaRecorderRef.current?.state === 'inactive') {
                         mediaRecorderRef.current.start();
                     }
                 } else if (isSpeakingRef.current) {
                     if (smoothedVolume < 0.05) {
                         if (silenceStartRef.current === 0) silenceStartRef.current = Date.now();
                         else if (Date.now() - silenceStartRef.current > 700) {
                             // silence -> stop recording
                             isSpeakingRef.current = false;
                             silenceStartRef.current = 0;
                             if (mediaRecorderRef.current?.state === 'recording') {
                                 mediaRecorderRef.current.stop();
                             }
                         }
                     } else {
                         silenceStartRef.current = 0;
                     }
                 }
             } else if (stateRef.current === 'speaking' && wsRef.current?.readyState === WebSocket.OPEN) {
                 // INTERRUPT (barge-in) logic
                 // If the user speaks loudly while agent is talking, interrupt the agent.
                 if (smoothedVolume > 0.25) { 
                     wsRef.current.send(JSON.stringify({ type: "interrupt" }));
                     
                     // Stop local audio playback immediately
                     activeSourcesRef.current.forEach(source => {
                         try { source.stop(); } catch (e) {}
                     });
                     activeSourcesRef.current = [];
                     
                     // Reset state and immediately start recording
                     isSpeakingRef.current = true;
                     silenceStartRef.current = 0;
                     audioChunksRef.current = [];
                     if (mediaRecorderRef.current?.state === 'inactive') {
                         mediaRecorderRef.current.start();
                     }
                 }
             }
          }
        } else {
          audioLevelRef.current = 0;
        }
      }
      rafRef.current = requestAnimationFrame(monitor);
    };
    monitor();
  }, [isMuted, mockMode]); // Removed sendMockText from deps to prevent recreating, but it's safe if it changes.

  const connect = async () => {
    if (state !== 'idle' && state !== 'error') return;
    setState('connecting');
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      if (mockMode) {
        await new Promise(r => setTimeout(r, 800));
        setState('listening');
        startAudioMonitoring();
      } else {
        // Init MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = async (e) => {
           if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
           const blob = new Blob(audioChunksRef.current);
           const reader = new FileReader();
           reader.readAsDataURL(blob);
           reader.onloadend = () => {
               const base64data = (reader.result as string).split(',')[1];
               wsRef.current?.send(JSON.stringify({ type: "audio.chunk", seq: 1, payload: base64data }));
               wsRef.current?.send(JSON.stringify({ type: "audio.end" }));
           }
        };

        // Real WebSocket Connection
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // e.g. localhost:3000
        
        let sessionId = "";
        try {
           const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${host}/api/v1`;
           const res = await fetch(`${apiUrl}/sessions/new`, { method: 'POST', headers: { 'bypass-tunnel-reminder': 'true' } });
           if (!res.ok) throw new Error("Failed to create session");
           const data = await res.json();
           sessionId = data.session_id;
           setSessionId(sessionId);
        } catch (e) {
           console.error("Session creation failed", e);
           // Fallback for mock mode or testing
           sessionId = 'session_' + Date.now().toString(36);
           setSessionId(sessionId);
        }

        const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${host}/ws`;
        const ws = new WebSocket(`${wsBaseUrl}/session`);
        wsRef.current = ws;

        ws.onopen = () => {
           ws.send(JSON.stringify({ type: "session.start", session_id: sessionId }));
        };

        ws.onmessage = (event) => {
           const data = JSON.parse(event.data);
           if (data.type === 'session.ready') {
              setState('listening');
              startAudioMonitoring();
           } else if (data.type === 'agent.state') {
              const newState = data.state.toLowerCase() as AgentState;
              if (newState === 'listening' && stateRef.current === 'speaking') {
                  // Interrupted! Stop current audio
                  activeSourcesRef.current.forEach(source => {
                      try { source.stop(); } catch (e) {}
                  });
                  activeSourcesRef.current = [];
                  setPartialText('');
                  partialTextRef.current = '';
              }
              setState(newState);
           } else if (data.type === 'stt.final') {
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: data.text, timestamp: Date.now() }]);
           } else if (data.type === 'llm.delta') {
              setPartialText(prev => {
                const newText = prev + data.text;
                partialTextRef.current = newText;
                return newText;
              });
           } else if (data.type === 'tts.chunk') {
              playAudioChunk(data.wav_b64);
           } else if (data.type === 'tts.end') {
              setMessages(prev => {
                if (partialTextRef.current) {
                  return [...prev, { 
                    id: Date.now().toString(), 
                    role: 'agent', 
                    text: partialTextRef.current.trim(), 
                    timestamp: Date.now() 
                  }];
                }
                return prev;
              });
              setPartialText('');
              partialTextRef.current = '';
           } else if (data.type === 'error') {
              setError(data.message);
              setState('error');
              cleanup();
           }
        };

        ws.onerror = (e) => {
           console.error("WS Error", e);
           setError("Connection to agent failed.");
           setState('error');
           cleanup();
        };
        
        ws.onclose = () => {
           if (stateRef.current !== 'idle' && stateRef.current !== 'error') {
              setState('idle');
           }
        };
      }
      
    } catch (err) {
      console.error(err);
      setError('Microphone access denied. Please check your browser permissions.');
      setState('error');
      cleanup();
    }
  };

  const disconnect = useCallback(() => {
    cleanup();
    setState('idle');
    setMessages([{ id: Date.now().toString(), role: 'agent', text: 'Session restarted', timestamp: Date.now() }]);
    setPartialText('');
    setError(null);
    audioLevelRef.current = 0;
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(t => t.enabled = !next);
      }
      return next;
    });
  }, []);

  const sendMockText = useCallback((text: string) => {
    if (state !== 'listening') return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
    
    if (!mockMode && wsRef.current?.readyState === WebSocket.OPEN) {
       // Ideally we'd send text.input to backend, but mock method doesn't support it in orchestrator yet
       wsRef.current.send(JSON.stringify({ type: "text.input", text }));
       return;
    }

    setState('thinking');
    
    // Mock Agent Response FSM
    const t1 = setTimeout(() => {
      setState('speaking');
      const responseText = "అర్థమైంది. తప్పకుండా నేను సహాయం చేయగలను.";
      let currentIdx = 0;
      
      const words = responseText.split(' ');
      const streamInterval = setInterval(() => {
        if (currentIdx < words.length) {
          const chunk = words.slice(0, currentIdx + 1).join(' ');
          setPartialText(chunk);
          audioLevelRef.current = 0.5 + Math.random() * 0.4;
          currentIdx++;
        } else {
          clearInterval(streamInterval);
          setPartialText('');
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: responseText, timestamp: Date.now() }]);
          setState('listening');
          audioLevelRef.current = 0;
        }
      }, 250);
      
      mockTimers.current.push(streamInterval);
    }, 1200);
    
    mockTimers.current.push(t1);
  }, [state, mockMode]);

  return {
    state,
    isMuted,
    messages,
    partialText,
    error,
    audioLevelRef,
    sessionId,
    connect,
    disconnect,
    toggleMute,
    sendMockText
  };
}
