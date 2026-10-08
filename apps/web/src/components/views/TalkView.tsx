'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';
import { AtmosphereLayer } from '../../components/talk/AtmosphereLayer';
import { OnboardingHero } from '../../components/talk/OnboardingHero';
import { ActiveSession } from '../../components/talk/ActiveSession';
import { ControlDock } from '../../components/talk/ControlDock';
import { TranscriptDrawer } from '../../components/talk/TranscriptDrawer';
import { CommandPalette } from '../../components/talk/CommandPalette';
import { CustomCursor } from '../../components/CustomCursor';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUIStore } from '../../store/uiStore';

export default function TalkView() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const setMainView = useUIStore(s => s.setMainView);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const {
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
  } = useVoiceAgent(false);

  // Global Keyboard Shortcuts (only when active)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space' && state !== 'idle' && state !== 'connecting' && state !== 'error') {
        e.preventDefault();
        toggleMute();
      }
      
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      
      if (e.key.toLowerCase() === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, toggleMute]);

  const showOnboarding = state === 'idle' || state === 'connecting' || state === 'error';
  const showActive = !showOnboarding;

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden selection:bg-purple-500/30 font-sans transition-colors duration-300">
      <AtmosphereLayer />

      {/* Header / Global Status */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (state !== 'idle' && state !== 'error') {
                if (window.confirm("Call is still active. End call and leave?")) {
                  disconnect();
                  setMainView('dashboard');
                }
              } else {
                setMainView('dashboard');
              }
            }}
            className="group flex items-baseline gap-2 font-serif text-[clamp(24px,2vw,32px)] tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 rounded-sm"
            aria-label="Vaani Dashboard"
          >
            <span className="bg-clip-text text-transparent bg-zinc-900 dark:bg-zinc-100 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">వాణి.</span>
          </a>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full pointer-events-auto">
          <div className={`w-1.5 h-1.5 rounded-full ${
            state === 'error' ? 'bg-red-500' : 
            state === 'idle' ? 'bg-zinc-500' :
            'bg-emerald-400 animate-pulse'
          }`} />
          <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wide">
            {state === 'idle' ? 'Ready' : 
             state === 'connecting' ? 'Connecting...' : 
             state === 'error' ? 'Error' : 
             isMuted ? 'Muted' : 'Live'}
          </span>
        </div>
        <div className="flex justify-end w-[80px] pointer-events-auto z-50">
          <button 
            data-cursor="interact"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Views */}
      <main className="absolute inset-0 flex flex-col items-center justify-center">
        
        <OnboardingHero 
          isActive={showOnboarding}
          onStart={connect}
          error={error}
        />
        
        <ActiveSession 
          isActive={showActive}
          state={state}
          audioLevelRef={audioLevelRef}
          partialText={partialText}
          messages={messages}
          onSuggestionClick={sendMockText}
        />

      </main>

      {/* Dock (only visible during session) */}
      <ControlDock 
        state={state}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        onDisconnect={() => {
          disconnect();
          setMainView('landing');
        }}
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        onTogglePalette={() => setIsPaletteOpen(true)}
      />

      {/* Overlays */}
      <TranscriptDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        messages={messages} 
      />
      
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
      />

    </div>
  );
}
