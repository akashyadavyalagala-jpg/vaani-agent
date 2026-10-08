"use client";

import React from "react";
import { useUIStore } from "../store/uiStore";
import LandingView from "../components/views/LandingView";
import LoginView from "../components/views/LoginView";
import DashboardView from "../components/views/DashboardView";
import TalkView from "../components/views/TalkView";

export default function RootApp() {
  const mainView = useUIStore((s) => s.mainView);

  switch (mainView) {
    case 'landing':
      return <LandingView />;
    case 'login':
      return <LoginView />;
    case 'dashboard':
      return <DashboardView />;
    case 'talk':
      return <TalkView />;
    default:
      return <LandingView />;
  }
}
