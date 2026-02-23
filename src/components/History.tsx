"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getPlatformLabel } from "@/lib/ai";
import type { Platform } from "@/lib/types";
import { Copy, Check, Trash2, Search, Filter } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";

export default function HistoryView() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = state.generatedContent.filter((c) => {
    if (filterPlatform !== "all" && c.platform !== filterPlatform) return false;
    if (filterProduct !== "all" && c.productId !== filterProduct) return false;
    if (search && !c.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    dispatch({ type: "MARK_COPIED", id });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platforms = Array.from(
    new Set(state.generatedContent.map((c) => c.platform))
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 section-header">History</h2>
        <p className="text-slate-400 text-sm">
          All your generated content in one place
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as Platform | "all")}
            className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-forge-500"
          >
            <option value="all">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {getPlatformLabel(p)}
              </option>
            ))}
          </select>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-forge-500"
          >
            <option value="all">All Products</option>
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-slate-500 text-sm">
            {state.generatedContent.length === 0
              ? "No content generated yet. Go to Generate to start."
              : "No content matches your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const product = state.products.find((p) => p.id === c.productId);
            return (
              <div
                key={c.id}
                className="glass-card rounded-xl p-4 group hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={c.platform} size="xs" />
                    <span className="text-xs font-medium text-slate-300">
                      {getPlatformLabel(c.platform)}
                    </span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">
                      {product?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(c.content, c.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                      {copiedId === c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => dispatch({ type: "DELETE_CONTENT", id: c.id })}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-600 mt-4">
          Showing {filtered.length} of {state.generatedContent.length} pieces
        </p>
      )}
    </div>
  );
}
