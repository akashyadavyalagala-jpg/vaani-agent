'use client';

import { useState } from 'react';

export default function AgentStudioPage() {
  const [greeting, setGreeting] = useState("నమస్కారం! నేను డెమో క్లినిక్ నుంచి మాట్లాడుతున్నాను.");
  const [pace, setPace] = useState(1.0);
  
  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in duration-500">
      {/* Left: Editor */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white">Agent Studio</h1>
          <p className="text-[var(--muted)] mt-1">Configure persona, voice, and knowledge.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-[var(--border)] pb-2 text-white">Voice & Tone</h2>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--muted)]">Greeting</label>
            <textarea 
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="bg-white/5 border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--turmeric)]"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--muted)]">Voice</label>
              <select className="bg-white/5 border border-[var(--border)] rounded-md p-2 text-sm focus:outline-none focus:border-[var(--turmeric)]">
                <option value="kavitha">Kavitha (Female, Calm)</option>
                <option value="vijay">Vijay (Male, Professional)</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--muted)]">Pace ({pace}x)</label>
              <input 
                type="range" min="0.8" max="1.5" step="0.1" 
                value={pace} 
                onChange={(e) => setPace(parseFloat(e.target.value))}
                className="w-full accent-[var(--turmeric)]"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <h2 className="text-xl font-semibold text-white">Knowledge Base (FAQ)</h2>
            <button className="text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors text-white">Import CSV</button>
          </div>
          
          <div className="border border-[var(--border)] rounded-lg p-4 bg-white/5 flex items-center justify-between">
            <div className="flex gap-4 items-start">
               <span className="text-lg">Q:</span>
               <div>
                 <p className="text-sm text-white">క్లినిక్ ఎప్పుడు తెరిచి ఉంటుంది?</p>
                 <p className="text-sm text-[var(--muted)] mt-1">A: ఉదయం 9 గంటల నుంచి సాయంత్రం 5 గంటల వరకు.</p>
               </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-xs">Remove</button>
          </div>
          <button className="w-full py-2 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:text-white transition-colors">
            + Add Q&A
          </button>
        </section>
        
        <div className="pt-4 flex gap-4">
          <button className="px-6 py-2 bg-[var(--turmeric)] text-black font-semibold rounded-md hover:bg-yellow-500 transition-colors">
            Save Draft
          </button>
          <button className="px-6 py-2 border border-[var(--border)] text-white font-semibold rounded-md hover:bg-white/5 transition-colors">
            Deploy Version
          </button>
        </div>
      </div>

      {/* Right: Test Simulator */}
      <div className="w-full lg:w-96 border border-[var(--border)] bg-black/40 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-black/60 flex justify-between items-center">
          <h3 className="font-semibold text-white">Test in Console</h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-end gap-4">
           {/* Mock chat */}
           <div className="self-start max-w-[80%] p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm">
             {greeting}
           </div>
        </div>
        <div className="p-4 border-t border-[var(--border)] bg-black/60">
           <div className="flex gap-2">
             <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">🎤</button>
             <input type="text" placeholder="Type to test..." className="flex-1 bg-white/5 border border-[var(--border)] rounded-full px-4 text-sm focus:outline-none" />
           </div>
        </div>
      </div>
    </div>
  );
}
