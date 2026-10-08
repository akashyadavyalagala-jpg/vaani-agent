'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Message } from '../../hooks/useVoiceAgent';

interface TranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export function TranscriptDrawer({ isOpen, onClose, messages }: TranscriptDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 z-[190] transition-opacity duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-zinc-950/60 backdrop-blur-[40px] saturate-150 border-l border-zinc-800 z-[200] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } max-sm:max-w-full max-sm:top-auto max-sm:h-[80dvh] max-sm:border-l-0 max-sm:border-t max-sm:rounded-t-3xl max-sm:translate-x-0 ${
          isOpen ? 'max-sm:translate-y-0' : 'max-sm:translate-y-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="p-6 flex justify-between items-center border-b border-zinc-800/50">
          <div className="font-medium text-[16px]">Transcript</div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close Transcript"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {messages.length === 0 && (
            <div className="text-center text-zinc-600 font-mono text-sm mt-10">
              No messages yet
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-1 max-w-[90%] ${
                msg.role === 'user' ? 'self-end items-end' : 'self-start'
              }`}
            >
              <div className="font-mono text-[10px] text-zinc-500 flex gap-1.5">
                {msg.role === 'agent' ? 'వాణి' : 'You'} &bull; {formatTime(msg.timestamp)}
              </div>
              <div 
                className={`text-[15px] p-3 px-4 rounded-2xl border ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-200' 
                    : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-100 font-serif text-[18px] leading-relaxed'
                }`}
                lang={msg.role === 'agent' ? 'te' : 'en'}
              >
                {/* Safe text rendering, no innerHTML */}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
