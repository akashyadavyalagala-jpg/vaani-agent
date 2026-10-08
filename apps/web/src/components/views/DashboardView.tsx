import React from 'react';
import { useUIStore } from '../../store/uiStore';
import OverviewView from './OverviewView';
import CallsView from './CallsView';
import CallDetailView from './CallDetailView';
import AppointmentsView from './AppointmentsView';
import AgentView from './AgentView';
import UsersView from './UsersView';
import SettingsView from './SettingsView';

export default function DashboardView() {
  const { dashboardView, setDashboardView, setMainView } = useUIStore();

  const renderContent = () => {
    switch (dashboardView) {
      case 'overview': return <OverviewView />;
      case 'calls': return <CallsView />;
      case 'call_details': return <CallDetailView />;
      case 'appointments': return <AppointmentsView />;
      case 'agent': return <AgentView />;
      case 'team': return <UsersView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewView />;
    }
  };

  const navItem = (id: typeof dashboardView, label: string) => (
    <button 
      onClick={() => setDashboardView(id)}
      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${dashboardView === id || (dashboardView === 'call_details' && id === 'calls') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[var(--muted)] hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row text-[var(--foreground)] font-sans antialiased relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md flex flex-col relative z-10">
        <div className="p-4 border-b border-[var(--border)]">
          <a href="#" onClick={(e) => { e.preventDefault(); setMainView('landing'); }} className="text-xl font-bold tracking-tight text-[var(--turmeric)] hover:text-white transition-colors cursor-pointer block">వాణి Studio</a>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItem('overview', 'Overview')}
          {navItem('calls', 'Calls')}
          {navItem('appointments', 'Appointments')}
          {navItem('agent', 'Agent Config')}
          {navItem('team', 'Team')}
          {navItem('settings', 'Settings')}
        </nav>
        
        <div className="p-4 border-t border-[var(--border)]">
          <button 
            onClick={() => setMainView('talk')}
            className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-black font-bold text-sm transition-all shadow-lg"
          >
            <span className="mr-2 text-red-500">▶</span> Start Conversation
          </button>
        </div>

        <div className="p-4 border-t border-[var(--border)] text-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[var(--muted)]">
            <span>Demo Clinic</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘K</kbd>
          </div>
          <button className="text-left text-xs text-red-400 hover:text-red-300 w-full mt-2" onClick={() => { localStorage.clear(); setMainView('landing'); }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative z-10">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
