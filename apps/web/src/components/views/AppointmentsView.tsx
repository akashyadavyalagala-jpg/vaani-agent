'use client';

import { useState } from 'react';

export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  // Dummy data
  const appointments = [
    { id: '1', name: 'Srinivas R.', time: '09:00', date: '2026-10-04', service: 'Consultation', status: 'booked' },
    { id: '2', name: 'Lakshmi K.', time: '11:30', date: '2026-10-04', service: 'Follow up', status: 'booked' },
    { id: '3', name: 'Rahul V.', time: '14:00', date: '2026-10-04', service: 'Consultation', status: 'cancelled' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Appointments</h1>
          <p className="text-[var(--muted)] mt-1">Manage bookings and schedule conflicts.</p>
        </div>
        <div className="flex bg-white/5 border border-[var(--border)] rounded-md overflow-hidden">
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'list' ? 'bg-[var(--turmeric)] text-black' : 'text-[var(--muted)] hover:text-white'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-[var(--turmeric)] text-black' : 'text-[var(--muted)] hover:text-white'}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
      </header>

      {view === 'list' ? (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 border-b border-[var(--border)] text-[var(--muted)] font-medium">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{apt.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{apt.service}</td>
                  <td className="px-4 py-3">{apt.date}</td>
                  <td className="px-4 py-3 font-mono">{apt.time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'booked' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[var(--muted)] hover:text-white">Reschedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[600px] border border-[var(--border)] bg-[var(--surface)] rounded-xl flex items-center justify-center text-[var(--muted)]">
          Calendar view requires Drag & Drop libraries (e.g. react-big-calendar).<br/>
          (Mocked for this prototype)
        </div>
      )}
    </div>
  );
}
