"use client";

import { useStore } from "@/lib/store";
import { Package, Sparkles, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { products, generatedContent } = state;

  const todayContent = generatedContent.filter(
    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString()
  );

  const stats = [
    {
      label: "Products",
      value: products.length,
      icon: Package,
      color: "text-forge-400",
      bg: "bg-forge-600/10",
    },
    {
      label: "Total Generated",
      value: generatedContent.length,
      icon: Sparkles,
      color: "text-spark-400",
      bg: "bg-yellow-600/10",
    },
    {
      label: "Today",
      value: todayContent.length,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Platforms",
      value: new Set(generatedContent.map((c) => c.platform)).size,
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-600/10",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-slate-400 text-sm">
          Your marketing command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
          className="glass-card rounded-2xl p-6 text-left hover:border-forge-600/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-forge-600/10 flex items-center justify-center mb-4 group-hover:bg-forge-600/20 transition-colors">
            <Package className="w-6 h-6 text-forge-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">
            {products.length === 0 ? "Add Your First Product" : "Manage Products"}
          </h3>
          <p className="text-sm text-slate-400">
            {products.length === 0
              ? "Start by adding a SaaS product to generate content for"
              : `${products.length} product${products.length !== 1 ? "s" : ""} ready to promote`}
          </p>
        </button>

        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
          className="glass-card rounded-2xl p-6 text-left hover:border-spark-400/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-600/10 flex items-center justify-center mb-4 group-hover:bg-yellow-600/20 transition-colors">
            <Sparkles className="w-6 h-6 text-spark-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">Generate Content</h3>
          <p className="text-sm text-slate-400">
            Create social posts, emails, video scripts in seconds
          </p>
        </button>
      </div>

      {/* Recent Content */}
      {generatedContent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Recent Content
          </h3>
          <div className="space-y-2">
            {generatedContent.slice(0, 5).map((c) => {
              const product = products.find((p) => p.id === c.productId);
              return (
                <div
                  key={c.id}
                  className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">
                      {product?.name || "Unknown"} &middot; {c.platform}
                    </p>
                    <p className="text-sm text-slate-300 truncate">
                      {c.content.slice(0, 80)}...
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-600 ml-3 whitespace-nowrap">
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
        <div className="glass-card rounded-2xl p-10 text-center mt-4">
          <div className="w-16 h-16 rounded-2xl forge-gradient mx-auto flex items-center justify-center mb-4 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Welcome to PushForge
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Add your SaaS products, then generate marketing content across
            Twitter, LinkedIn, Email, WhatsApp, and more — in seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              Set API Key First
            </button>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
              className="px-4 py-2 rounded-lg forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
