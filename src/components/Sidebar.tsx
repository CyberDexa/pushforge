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
    <aside className="w-64 h-screen fixed left-0 top-0 z-30 flex flex-col border-r border-slate-800 bg-[#080B11]">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg forge-gradient flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Push<span className="text-forge-500">Forge</span>
          </h1>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">
            Content Engine
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.label && (
              <p className="px-4 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map(({ view, label, icon: Icon }) => {
              const isActive = state.currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => dispatch({ type: "SET_VIEW", view })}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                    ${
                      isActive
                        ? "bg-forge-600/15 text-forge-400 border border-forge-600/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? "text-forge-400" : ""}`} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom stats */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{state.products.length} products</span>
          <span>{state.generatedContent.length} generated</span>
        </div>
      </div>
    </aside>
  );
}
