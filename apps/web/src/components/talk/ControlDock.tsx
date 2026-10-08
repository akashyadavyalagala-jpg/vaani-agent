'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Terminal, Command } from 'lucide-react';
import { AgentState } from '../../hooks/useVoiceAgent';

interface ControlDockProps {
  state: AgentState;
  isMuted: boolean;
  onMuteToggle: () => void;
  onDisconnect: () => void;
  onToggleDrawer: () => void;
  onTogglePalette: () => void;
}

export function ControlDock({ 
  state, 
  isMuted, 
  onMuteToggle, 
  onDisconnect,
  onToggleDrawer,
  onTogglePalette
}: ControlDockProps) {
  const [sessionTime, setSessionTime] = useState(0);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state !== 'idle' && state !== 'connecting' && state !== 'error') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDisconnect = () => {
    if (!disconnectConfirm) {
      setDisconnectConfirm(true);
      setTimeout(() => setDisconnectConfirm(false), 5000);
    } else {
      setDisconnectConfirm(false);
      onDisconnect();
    }
  };

  const isVisible = state !== 'idle' && state !== 'connecting';

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav 
        className={`flex items-center gap-2 p-1.5 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-700/50 rounded-full shadow-2xl transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <button 
          onClick={onTogglePalette}
          className="group relative w-11 h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Command Palette"
        >
          <Command className="w-5 h-5" />
          <div className="absolute -top-10 bg-zinc-100 text-zinc-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-2">
            Menu <kbd className="font-mono text-[9px] bg-black/10 border border-black/10 px-1 rounded">⌘K</kbd>
          </div>
        </button>

        <div className="px-3 font-mono text-[13px] text-zinc-400 font-feature-[tnum] pointer-events-none">
          {formatTime(sessionTime)}
        </div>

        <button 
          onClick={onMuteToggle}
          className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted 
              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
              : 'bg-zinc-100 text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
          }`}
          aria-label="Toggle Mic"
          aria-pressed={isMuted}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <div className="absolute -top-10 bg-zinc-100 text-zinc-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-2">
            {isMuted ? 'Unmute' : 'Mute'} <kbd className="font-mono text-[9px] bg-black/10 border border-black/10 px-1 rounded">Space</kbd>
          </div>
        </button>

        <button 
          onClick={onToggleDrawer}
          className="group relative w-11 h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Transcript"
        >
          <Terminal className="w-5 h-5" />
          <div className="absolute -top-10 bg-zinc-100 text-zinc-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-2">
            Transcript <kbd className="font-mono text-[9px] bg-black/10 border border-black/10 px-1 rounded">⌘J</kbd>
          </div>
        </button>

        <button 
          onClick={handleDisconnect}
          className={`group relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            disconnectConfirm 
              ? 'bg-red-500/20 text-red-500' 
              : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
          aria-label="End Call"
        >
          <PhoneOff className="w-5 h-5" />
          <div className="absolute -top-10 bg-zinc-100 text-zinc-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-2">
            {disconnectConfirm ? 'Press again to end' : 'End Call'} <kbd className="font-mono text-[9px] bg-black/10 border border-black/10 px-1 rounded">Esc</kbd>
          </div>
        </button>
      </nav>
    </div>
  );
}
