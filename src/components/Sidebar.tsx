"use client";

import { useStore } from "@/lib/store";
import type { AppView } from "@/lib/types";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  History,
  Settings,
  Flame,
  CalendarDays,
  FileText,
  Megaphone,
  BarChart3,
  Video,
} from "lucide-react";

const navSections: { label?: string; items: { view: AppView; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    items: [
      { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { view: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Create",
    items: [
      { view: "generate", label: "Generate", icon: Sparkles },
      { view: "video", label: "Video Studio", icon: Video },
      { view: "templates", label: "Templates", icon: FileText },
      { view: "campaigns", label: "Campaigns", icon: Megaphone },
    ],
  },
  {
    label: "Manage",
    items: [
      { view: "products", label: "Products", icon: Package },
      { view: "calendar", label: "Calendar", icon: CalendarDays },
      { view: "history", label: "History", icon: History },
    ],
  },
  {
    items: [
      { view: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { state, dispatch } = useStore();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-30 flex flex-col border-r border-slate-800/60 bg-[#070A10]/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl forge-gradient flex items-center justify-center shadow-lg shadow-forge-600/20">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            Push<span className="text-forge-400">Forge</span>
          </h1>
          <p className="text-[9px] text-slate-600 tracking-[0.15em] uppercase font-medium">
            Content Engine
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-3 mt-3 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-5" : ""}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[9px] font-semibold text-slate-600 uppercase tracking-[0.12em]">
                {section.label}
              </p>
            )}
            {section.items.map(({ view, label, icon: Icon }) => {
              const isActive = state.currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => dispatch({ type: "SET_VIEW", view })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all mb-0.5 cursor-pointer relative
                    ${
                      isActive
                        ? "bg-forge-600/10 text-forge-400"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-forge-500" />
                  )}
                  <Icon className={`w-[16px] h-[16px] ${isActive ? "text-forge-400" : ""}`} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* Bottom stats */}
      <div className="px-4 py-3.5">
        <div className="flex justify-between text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
            {state.products.length} products
          </span>
          <span>{state.generatedContent.length} generated</span>
        </div>
      </div>
    </aside>
  );
}
