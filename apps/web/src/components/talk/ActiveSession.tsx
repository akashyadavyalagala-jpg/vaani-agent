'use client';

import React, { useEffect, useState } from 'react';
import { VoiceOrbCanvas } from './VoiceOrbCanvas';
import { AgentState, Message } from '../../hooks/useVoiceAgent';

interface ActiveSessionProps {
  state: AgentState;
  audioLevelRef: React.MutableRefObject<number>;
  partialText: string;
  messages: Message[];
  onSuggestionClick: (text: string) => void;
  isActive: boolean;
}

export function ActiveSession({ 
  state, 
  audioLevelRef, 
  partialText, 
  messages,
  onSuggestionClick,
  isActive 
}: ActiveSessionProps) {
  
  // Extract the latest full message from the agent to display as history
  const [historyText, setHistoryText] = useState('');
  
  useEffect(() => {
    // If the agent is speaking, we don't update history yet (it's in partialText).
    // If the agent finishes, the last agent message becomes the new history.
    if (state === 'listening' || state === 'thinking') {
      const lastAgentMsg = [...messages].reverse().find(m => m.role === 'agent');
      if (lastAgentMsg) {
        setHistoryText(lastAgentMsg.text);
      }
    }
  }, [messages, state]);

  // Determine what the 'current' text is
  let currentText = partialText;
  if (!currentText && state === 'error') currentText = "Connection error.";
  
  const showSuggestions = state === 'listening' && messages.length === 0 && !partialText;

  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isActive 
          ? 'opacity-100 scale-100 pointer-events-auto' 
          : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="mb-12">
        <VoiceOrbCanvas state={state} audioLevelRef={audioLevelRef} />
      </div>
      
      {/* Captions area */}
      <div 
        className="h-[120px] w-[90%] max-w-[600px] text-center flex flex-col justify-start relative [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        aria-live="polite"
      >
        <div className="text-zinc-500 opacity-60 mb-2 font-serif text-[clamp(18px,3vw,28px)] leading-[1.2] transition-all duration-300">
          {currentText ? historyText : ''}
        </div>
        
        <div className="font-serif text-[clamp(24px,4vw,40px)] leading-[1.1] tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          {currentText || historyText}
        </div>
      </div>

      {/* Suggestions Box */}
      <div 
        className={`flex gap-3 flex-wrap justify-center max-w-[600px] mt-12 transition-all duration-500 ${
          showSuggestions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {["నా ఈమెయిల్స్ చదువు", "క్వాంటం కంప్యూటింగ్ గురించి చెప్పు", "నాకు ఒక జోక్ చెప్పు"].map((text, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(text)}
            className={`px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:-translate-y-0.5 hover:border-zinc-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'both' }}
          >
            "{text}"
          </button>
        ))}
      </div>
    </div>
  );
}
