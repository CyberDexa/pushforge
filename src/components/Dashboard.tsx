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
      color: "text-forge-400",
      bg: "bg-forge-600/10",
      borderColor: "hover:border-forge-600/30",
    },
    {
      label: "Total Generated",
      value: generatedContent.length,
      icon: Sparkles,
      color: "text-amber-400",
      bg: "bg-amber-600/10",
      borderColor: "hover:border-amber-600/30",
    },
    {
      label: "Today",
      value: todayContent.length,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-600/10",
      borderColor: "hover:border-emerald-600/30",
    },
    {
      label: "Platforms Used",
      value: new Set(generatedContent.map((c) => c.platform)).size,
      icon: Zap,
      color: "text-blue-400",
      bg: "bg-blue-600/10",
      borderColor: "hover:border-blue-600/30",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-slate-500 mb-1">{greeting}</p>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-slate-500 text-sm">
          Your marketing command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass-card stat-card rounded-2xl p-5 ${stat.borderColor} transition-all cursor-default`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
          className="glass-card interactive-card rounded-2xl p-5 text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-forge-600/10 flex items-center justify-center mb-3 group-hover:bg-forge-600/15 transition-colors">
              <Package className="w-5 h-5 text-forge-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-forge-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">
            {products.length === 0 ? "Add Your First Product" : "Manage Products"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {products.length === 0
              ? "Start by adding a SaaS product to generate content for"
              : `${products.length} product${products.length !== 1 ? "s" : ""} ready to promote`}
          </p>
        </button>

        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
          className="glass-card interactive-card rounded-2xl p-5 text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center mb-3 group-hover:bg-amber-600/15 transition-colors">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Generate Content</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create social posts, emails, video scripts in seconds
          </p>
        </button>
      </div>

      {/* Recent Content */}
      {generatedContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Content
            </h3>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "history" })}
              className="text-[10px] text-slate-600 hover:text-forge-400 transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-1.5">
            {generatedContent.slice(0, 5).map((c) => {
              const product = products.find((p) => p.id === c.productId);
              return (
                <div
                  key={c.id}
                  className="glass-card-flat rounded-xl px-4 py-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-slate-400">
                        {product?.name || "Unknown"}
                      </span>
                      <span className="text-[10px] text-slate-700">&middot;</span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {c.platform.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                      {c.content.slice(0, 90)}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-700 ml-3 whitespace-nowrap font-mono">
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
        <div className="glass-card-elevated rounded-2xl p-12 text-center mt-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-forge-600/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl forge-gradient mx-auto flex items-center justify-center mb-5 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Welcome to PushForge
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Add your SaaS products, then generate marketing content across
              Twitter, LinkedIn, Email, WhatsApp, and more — in seconds.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
                className="px-5 py-2.5 rounded-xl bg-slate-800/80 text-slate-300 text-sm border border-slate-700 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
              >
                Set API Key
              </button>
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
                className="px-5 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium btn-primary"
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
