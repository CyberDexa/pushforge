"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/lib/store";
import AuthGate from "@/components/AuthGate";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Products from "@/components/Products";
import Generate from "@/components/Generate";
import HistoryView from "@/components/History";
import SettingsView from "@/components/Settings";
import Calendar from "@/components/Calendar";
import Templates from "@/components/Templates";
import Campaigns from "@/components/Campaigns";
import Analytics from "@/components/Analytics";
import Landing from "@/components/Landing";
import VideoStudio from "@/components/VideoStudio";
import { useStore } from "@/lib/store";

function AppContent() {
  const { state } = useStore();

  const renderView = () => {
    switch (state.currentView) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "generate":
        return <Generate />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      case "calendar":
        return <Calendar />;
      case "templates":
        return <Templates />;
      case "campaigns":
        return <Campaigns />;
      case "analytics":
        return <Analytics />;
      case "video":
        return <VideoStudio />;
      case "landing":
        return <Landing />;
      default:
        return <Dashboard />;
    }
  };

  // Landing page renders without sidebar
  if (state.currentView === "landing") {
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-6xl px-4">
          {renderView()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-5xl px-8 py-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <StoreProvider>
        <AuthGate>
          <AppContent />
        </AuthGate>
      </StoreProvider>
    </SessionProvider>
  );
}
