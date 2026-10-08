'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';

// Mock data fetcher for the client
function useCallDetails(id: string | undefined) {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchCall() {
      try {
        const res = await fetch(`/api/v1/calls/${id}`, { cache: 'no-store', headers: { 'bypass-tunnel-reminder': 'true' } });
        if (!res.ok) throw new Error('Failed to fetch call');
        const json = await res.json();
        setData(json);
      } catch (err) {
        // Fallback mock data for demo purposes
        setData({
          id,
          status: 'completed',
          outcome: 'booked',
          started_at: new Date().toISOString(),
          duration_sec: 145,
          turns: [
            { id: 't1', role: 'user', text: 'నమస్కారం, నాకు రేపు ఒక అపాయింట్‌మెంట్ కావాలి.', created_at: new Date(Date.now() - 145000).toISOString() },
            { id: 't2', role: 'agent', text: 'నమస్కారం! తప్పకుండా, డెమో క్లినిక్‌కి స్వాగతం. రేపు ఉదయం 10 గంటలకు, లేదా మధ్యాహ్నం 2 గంటలకు ఖాళీగా ఉంది. మీకు ఏ సమయం అనుకూలంగా ఉంటుంది?', created_at: new Date(Date.now() - 140000).toISOString() },
            { id: 't3', role: 'user', text: 'ఉదయం పది గంటలకు అయితే బాగుంటుంది.', created_at: new Date(Date.now() - 120000).toISOString() },
            { id: 't4', role: 'agent', text: 'సరే, ఉదయం 10 గంటలకు అపాయింట్‌మెంట్ ఫిక్స్ చేయడానికి మీ పేరు మరియు ఫోన్ నంబర్ దయచేసి చెప్పగలరా?', created_at: new Date(Date.now() - 115000).toISOString() },
            { id: 't5', role: 'user', text: 'నా పేరు ఆకాష్, నా నంబర్ 9876543210.', created_at: new Date(Date.now() - 90000).toISOString() },
            { id: 't6', role: 'agent', text: 'ధన్యవాదాలు ఆకాష్ గారు. మీ నంబర్ తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా. సరిగ్గా ఉందా?', created_at: new Date(Date.now() - 85000).toISOString() },
            { id: 't7', role: 'user', text: 'అవును, కరెక్టే.', created_at: new Date(Date.now() - 70000).toISOString() },
            { id: 't8', role: 'agent', text: 'అద్భుతం! రేపు ఉదయం 10 గంటలకు మీ అపాయింట్‌మెంట్ కన్ఫర్మ్ అయింది. మీకు కన్ఫర్మేషన్ మెసేజ్ కూడా పంపుతాము. ఇంకా ఏమైనా సహాయం కావాలా?', created_at: new Date(Date.now() - 65000).toISOString() },
            { id: 't9', role: 'user', text: 'అంతే, ఇంకేం వద్దు. థాంక్యూ.', created_at: new Date(Date.now() - 40000).toISOString() },
            { id: 't10', role: 'agent', text: 'కాల్ చేసినందుకు ధన్యవాదాలు. శుభ దినం!', created_at: new Date(Date.now() - 35000).toISOString() }
          ]
        });
      }
    }
    fetchCall();
  }, [id]);

  return data;
}

export default function CallDetailView() {
  const { selectedCallId, setDashboardView } = useUIStore();
  const data = useCallDetails(selectedCallId);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!data) return <div className="p-10 flex justify-center"><span className="text-[var(--muted)]">Loading...</span></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setDashboardView('calls')}
          className="text-[var(--muted)] hover:text-white transition-colors"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Call {data.id.split('-')[0]}</h1>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 capitalize">
          {data.outcome}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Transcript & Audio */}
        <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex-1">
               <h3 className="text-white font-semibold mb-1">Transcript</h3>
               <p className="text-xs text-[var(--muted)]">Click the play button next to any message to hear the original audio.</p>
            </div>

          <div className="space-y-4">
            {data.turns.map((turn: any, i: number) => (
              <div key={turn.id} className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${turn.role === 'user' ? 'bg-white/10 text-white rounded-br-none' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-none'}`}>
                  <p className="font-medium">{turn.text}</p>
                </div>
                {turn.audio_url && (
                  <audio controls src={turn.audio_url} className="h-8 w-48 opacity-50 hover:opacity-100 transition-opacity mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Meta & Analysis */}
        <div className="space-y-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-xl">
            <h3 className="font-semibold text-white mb-2">Analysis</h3>
            <ul className="text-sm space-y-2 text-[var(--muted)]">
              <li className="flex justify-between"><span>Status</span><span className="text-white capitalize">{data.status}</span></li>
              <li className="flex justify-between"><span>Outcome</span><span className="text-white capitalize">{data.outcome}</span></li>
              <li className="flex justify-between"><span>Date</span><span className="text-white">{new Date(data.started_at).toLocaleDateString()}</span></li>
            </ul>
          </div>
          
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-xl">
            <h3 className="font-semibold text-white mb-2">Extracted Entities</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white">Service: Consultation</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white">Intent: Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
