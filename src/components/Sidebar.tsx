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
  Zap,
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
    <aside
      className="w-64 h-screen fixed left-0 top-0 z-30 flex flex-col"
      style={{
        background: "rgba(7, 9, 17, 0.96)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #FF6B2C 0%, #EA580C 100%)",
              boxShadow: "0 4px 14px rgba(249,115,22,0.38), 0 0 0 1px rgba(255,107,44,0.2) inset",
            }}
          >
            <Flame className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white leading-none">
              Push<span className="text-forge-400">Forge</span>
            </h1>
            <p className="text-[9px] text-slate-600 tracking-[0.18em] uppercase font-semibold mt-0.5">
              Content Engine
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* Nav */}
      <nav className="flex-1 px-2.5 pt-3 pb-2 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.label && (
              <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "rgba(148,163,184,0.35)" }}>
                {section.label}
              </p>
            )}
            {section.items.map(({ view, label, icon: Icon }) => {
              const isActive = state.currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => dispatch({ type: "SET_VIEW", view })}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5 cursor-pointer text-left"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(234,88,12,0.08) 100%)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(249,115,22,0.22)"
                      : "1px solid transparent",
                    color: isActive ? "#fb923c" : "rgba(148,163,184,0.7)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#cbd5e1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(148,163,184,0.7)";
                    }
                  }}
                >
                  <Icon
                    className="shrink-0"
                    style={{
                      width: 15,
                      height: 15,
                      color: isActive ? "#fb923c" : undefined,
                    }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* Bottom footer */}
      <div className="px-4 py-4">
        <div
          className="rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
            <span className="text-[11px] text-slate-500 truncate">
              {state.products.length} product{state.products.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Zap className="w-3 h-3 text-forge-600" />
            {state.generatedContent.length}
          </div>
        </div>
      </div>
    </aside>
  );
}
