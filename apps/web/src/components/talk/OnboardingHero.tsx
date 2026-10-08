'use client';

import React from 'react';

interface OnboardingHeroProps {
  onStart: () => void;
  isActive: boolean;
  error?: string | null;
}

export function OnboardingHero({ onStart, isActive, error }: OnboardingHeroProps) {
  // We use CSS animations for the reveal instead of framer-motion here for max performance
  // Intentionally leaving standard split logic; 
  // For proper Telugu we use standard HTML but styled with Noto Serif Telugu.
  
  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center text-center gap-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isActive 
          ? 'opacity-100 scale-100 pointer-events-auto' 
          : 'opacity-0 scale-105 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-serif text-[clamp(48px,8vw,120px)] leading-none tracking-tight flex overflow-hidden">
          {/* We use a simple CSS animation sequence defined in Tailwind for the reveal */}
          <span className="inline-block animate-in slide-in-from-bottom-[100%] duration-700 delay-200 fill-mode-both">
            Just say
          </span>
          <span className="inline-block animate-in slide-in-from-bottom-[100%] duration-700 delay-300 ml-[0.25em] fill-mode-both">
            hello.
          </span>
        </h1>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md">
            {error}
          </p>
        )}
      </div>
      
      <button 
        onClick={onStart}
        className="relative overflow-hidden px-8 py-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-medium text-[16px] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 group animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 fill-mode-both shadow-xl border border-transparent dark:border-white/10"
      >
        <span className="relative z-10">{error ? "Try Again" : "Start conversation"}</span>
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/80 dark:via-black/20 to-transparent skew-x-[-20deg] group-hover:animate-[shine_0.7s_ease-out_forwards]" />
      </button>
    </div>
  );
}
