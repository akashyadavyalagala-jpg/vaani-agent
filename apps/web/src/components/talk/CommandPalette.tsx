'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Mic, Download, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIONS = [
  { id: 'theme', icon: Moon, label: 'Toggle Theme', shortcut: 'T' },
  { id: 'voice', icon: Mic, label: 'Change Voice Model', shortcut: 'V' },
  { id: 'download', icon: Download, label: 'Download Transcript', shortcut: 'D' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredActions = ACTIONS.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[activeIndex];
        if (action) executeAction(action.id);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredActions, onClose]);

  const executeAction = (id: string) => {
    onClose();
    if (id === 'theme') {
      const isDark = document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', !isDark);
    } else {
      alert(`Executed stub: ${id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[300]" 
        onClick={onClose}
      />
      <div 
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-zinc-950/90 backdrop-blur-[40px] saturate-200 border border-zinc-800 rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] z-[301] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50">
          <Search className="w-5 h-5 text-zinc-500" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none text-zinc-100 text-lg outline-none placeholder:text-zinc-600"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={`cmd-item-${activeIndex}`}
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-[300px] overflow-y-auto" id="cmd-list" role="listbox">
          {filteredActions.length === 0 && (
            <div className="p-4 text-center text-zinc-500 text-sm">
              No results found.
            </div>
          )}
          {filteredActions.map((action, idx) => {
            const Icon = action.icon;
            const isActive = idx === activeIndex;
            return (
              <div
                key={action.id}
                id={`cmd-item-${idx}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => executeAction(action.id)}
                className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-colors ${
                  isActive ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  isActive ? 'bg-zinc-700/50 border-zinc-600' : 'bg-zinc-900 border-zinc-800'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-sm font-medium">{action.label}</div>
                {/* 
                  // If we wanted to show a shortcut visually:
                  <div className="font-mono text-[10px] text-zinc-500">⌘{action.shortcut}</div>
                */}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
