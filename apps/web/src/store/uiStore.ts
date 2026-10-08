import { create } from 'zustand';

export type MainView = 'landing' | 'login' | 'dashboard' | 'talk';
export type DashboardView = 'overview' | 'calls' | 'call_details' | 'appointments' | 'agent' | 'team' | 'settings';

interface UIState {
  mainView: MainView;
  dashboardView: DashboardView;
  selectedCallId?: string;
  
  setMainView: (view: MainView) => void;
  setDashboardView: (view: DashboardView, callId?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mainView: 'login',
  dashboardView: 'overview',
  
  setMainView: (view) => set({ mainView: view }),
  setDashboardView: (view, callId) => set({ dashboardView: view, selectedCallId: callId }),
}));
