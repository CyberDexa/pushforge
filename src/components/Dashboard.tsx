"use client";

import { useStore } from "@/lib/store";
import { Package, Sparkles, TrendingUp, Clock, ArrowRight, Zap } from "lucide-react";

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { products, generatedContent } = state;

  const todayContent = generatedContent.filter(
    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString()
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Products",
      value: products.length,
      icon: Package,
      iconColor: "#fb923c",
      iconBg: "rgba(249,115,22,0.12)",
      accentGlow: "rgba(249,115,22,0.2)",
      topBar: "linear-gradient(90deg, #FF6B2C, #EA580C)",
    },
    {
      label: "Total Generated",
      value: generatedContent.length,
      icon: Sparkles,
      iconColor: "#fbbf24",
      iconBg: "rgba(251,191,36,0.12)",
      accentGlow: "rgba(251,191,36,0.15)",
      topBar: "linear-gradient(90deg, #F59E0B, #D97706)",
    },
    {
      label: "Today",
      value: todayContent.length,
      icon: TrendingUp,
      iconColor: "#34d399",
      iconBg: "rgba(52,211,153,0.12)",
      accentGlow: "rgba(52,211,153,0.15)",
      topBar: "linear-gradient(90deg, #10B981, #059669)",
    },
    {
      label: "Platforms",
      value: new Set(generatedContent.map((c) => c.platform)).size,
      icon: Zap,
      iconColor: "#60a5fa",
      iconBg: "rgba(96,165,250,0.12)",
      accentGlow: "rgba(96,165,250,0.15)",
      topBar: "linear-gradient(90deg, #3B82F6, #2563EB)",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>{greeting}</p>
        <h2 className="text-[26px] font-bold text-white mb-1.5 tracking-tight">Dashboard</h2>
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Your marketing command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 transition-all cursor-default overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.032)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: stat.topBar }} />
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: stat.iconBg, boxShadow: `0 0 12px ${stat.accentGlow}` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(148,163,184,0.4)" }}>
                {stat.label}
              </p>
            </div>
            <p className="text-[32px] font-bold text-white leading-none tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
          className="rounded-2xl p-5 text-left group transition-all"
          style={{
            background: "rgba(255,255,255,0.032)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.052)"; e.currentTarget.style.borderColor = "rgba(249,115,22,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.032)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
              style={{ background: "rgba(249,115,22,0.1)" }}
            >
              <Package className="w-5 h-5" style={{ color: "#fb923c" }} />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-forge-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">
            {products.length === 0 ? "Add Your First Product" : "Manage Products"}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>
            {products.length === 0
              ? "Start by adding a SaaS product to generate content for"
              : `${products.length} product${products.length !== 1 ? "s" : ""} ready to promote`}
          </p>
        </button>

        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
          className="rounded-2xl p-5 text-left group transition-all"
          style={{
            background: "rgba(255,255,255,0.032)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.052)"; e.currentTarget.style.borderColor = "rgba(251,191,36,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.032)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
              style={{ background: "rgba(251,191,36,0.1)" }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#fbbf24" }} />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Generate Content</h3>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>
            Create social posts, emails, video scripts in seconds
          </p>
        </button>
      </div>

      {/* Recent Content */}
      {generatedContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(148,163,184,0.5)" }}>
              Recent Content
            </h3>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "history" })}
              className="text-[11px] transition-colors cursor-pointer hover:text-forge-400"
              style={{ color: "rgba(148,163,184,0.4)" }}
            >
              View all →
            </button>
          </div>
          <div className="space-y-1.5">
            {generatedContent.slice(0, 5).map((c) => {
              const product = products.find((p) => p.id === c.productId);
              return (
                <div
                  key={c.id}
                  className="rounded-xl px-4 py-3 flex items-center justify-between transition-all"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
                        {product?.name || "Unknown"}
                      </span>
                      <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.25)" }}>&middot;</span>
                      <span className="text-[11px] capitalize" style={{ color: "rgba(148,163,184,0.45)" }}>
                        {c.platform.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs truncate leading-relaxed" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {c.content.slice(0, 90)}
                    </p>
                  </div>
                  <span className="text-[10px] ml-3 whitespace-nowrap font-mono tabular-nums" style={{ color: "rgba(148,163,184,0.3)" }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && generatedContent.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center mt-4 relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 65%)" }} />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #FF6B2C 0%, #EA580C 100%)", boxShadow: "0 8px 28px rgba(249,115,22,0.35), 0 0 0 1px rgba(255,107,44,0.2) inset" }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Welcome to PushForge
            </h3>
            <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>
              Add your SaaS products, then generate marketing content across
              Twitter, LinkedIn, Email, WhatsApp, and more — in seconds.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
                className="px-5 py-2.5 rounded-xl text-sm border transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#cbd5e1"; }}
              >
                Set API Key
              </button>
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
                className="px-5 py-2.5 rounded-xl btn-primary text-sm font-medium"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
