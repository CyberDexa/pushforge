"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { generateContent, getPlatformLabel, getPlatformEmoji } from "@/lib/ai";
import type { Platform, Tone, Campaign, GeneratedContent } from "@/lib/types";
import {
  Megaphone,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Trash2,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const ALL_PLATFORMS: Platform[] = [
  "twitter", "linkedin", "email_subject", "email_body", "whatsapp", "video_script", "instagram",
];

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "witty", label: "Witty" },
  { value: "storytelling", label: "Story" },
];

export default function CampaignsView() {
  const { state, dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, product: "" });
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    productIds: [] as string[],
    platforms: ["twitter", "linkedin", "email_body", "whatsapp"] as Platform[],
    tone: "casual" as Tone,
    angle: "",
    customPrompt: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      productIds: [],
      platforms: ["twitter", "linkedin", "email_body", "whatsapp"],
      tone: "casual",
      angle: "",
      customPrompt: "",
    });
    setShowForm(false);
  };

  const toggleProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((x) => x !== id)
        : [...prev.productIds, id],
    }));
  };

  const togglePlatform = (p: Platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const selectAllProducts = () => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.length === state.products.length
        ? []
        : state.products.map((p) => p.id),
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.productIds.length === 0) return;

    const campaign: Campaign = {
      id: generateId(),
      name: form.name.trim(),
      productIds: form.productIds,
      platforms: form.platforms,
      tone: form.tone,
      angle: form.angle.trim(),
      customPrompt: form.customPrompt.trim() || undefined,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_CAMPAIGN", campaign });
    resetForm();
  };

  const runCampaign = async (campaign: Campaign) => {
    if (!state.apiKey) {
      dispatch({ type: "SET_VIEW", view: "settings" });
      return;
    }

    setRunning(campaign.id);
    dispatch({
      type: "UPDATE_CAMPAIGN",
      campaign: { ...campaign, status: "generating" },
    });

    const products = state.products.filter((p) =>
      campaign.productIds.includes(p.id)
    );
    const total = products.length;
    setProgress({ current: 0, total, product: "" });

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setProgress({ current: i + 1, total, product: product.name });

        const generated = await generateContent(
          product,
          campaign.platforms,
          campaign.tone,
          campaign.angle || "General product promotion",
          state.apiKey,
          state.aiProvider,
          campaign.customPrompt,
          state.brandVoice
        );

        const contentItems: GeneratedContent[] = Object.entries(generated).map(
          ([platform, content]) => ({
            id: generateId(),
            productId: product.id,
            platform: platform as Platform,
            content,
            createdAt: new Date().toISOString(),
            copied: false,
            status: "draft" as const,
            campaignId: campaign.id,
          })
        );

        dispatch({ type: "ADD_CONTENT", content: contentItems });
      }

      dispatch({
        type: "UPDATE_CAMPAIGN",
        campaign: { ...campaign, status: "completed", completedAt: new Date().toISOString() },
      });
    } catch {
      dispatch({
        type: "UPDATE_CAMPAIGN",
        campaign: { ...campaign, status: "ready" },
      });
    } finally {
      setRunning(null);
    }
  };

  const campaignContent = (campaignId: string) =>
    state.generatedContent.filter((c) => c.campaignId === campaignId);

  const statusBadge = (status: Campaign["status"]) => {
    const styles = {
      draft: "bg-slate-800 text-slate-400",
      generating: "bg-amber-900/30 text-amber-400",
      ready: "bg-blue-900/30 text-blue-400",
      completed: "bg-emerald-900/30 text-emerald-400",
    };
    return styles[status];
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Campaigns</h2>
          <p className="text-slate-400 text-sm">
            Generate content across multiple products at once
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={state.products.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaign List */}
      {state.campaigns.length === 0 && !showForm ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-forge-600/10 mx-auto flex items-center justify-center mb-4">
            <Megaphone className="w-7 h-7 text-forge-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">No campaigns yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Create a campaign to batch-generate content across all your products
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.campaigns.map((campaign) => {
            const products = state.products.filter((p) =>
              campaign.productIds.includes(p.id)
            );
            const content = campaignContent(campaign.id);
            const isExpanded = expandedCampaign === campaign.id;
            const isRunning = running === campaign.id;

            return (
              <div key={campaign.id} className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{campaign.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge(campaign.status)}`}>
                          {campaign.status === "generating" ? "Generating..." : campaign.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {products.length} product{products.length !== 1 ? "s" : ""} •{" "}
                        {campaign.platforms.length} platform{campaign.platforms.length !== 1 ? "s" : ""} •{" "}
                        {content.length} pieces generated
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(campaign.status === "draft" || campaign.status === "ready") && (
                        <button
                          onClick={() => runCampaign(campaign)}
                          disabled={!!running}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg forge-gradient text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          Run
                        </button>
                      )}
                      <button
                        onClick={() => dispatch({ type: "DELETE_CAMPAIGN", id: campaign.id })}
                        className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar during generation */}
                  {isRunning && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">
                          Generating for {progress.product}...
                        </span>
                        <span className="text-xs text-forge-400">
                          {progress.current}/{progress.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full forge-gradient transition-all duration-500"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Product tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {products.map((p) => (
                      <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {p.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {campaign.platforms.map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500">
                        {getPlatformEmoji(p)}
                      </span>
                    ))}
                  </div>

                  {/* Expand/collapse for generated content */}
                  {content.length > 0 && (
                    <button
                      onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                      className="flex items-center gap-1 text-xs text-forge-400 hover:text-forge-300 transition-colors mt-2"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Hide" : "View"} generated content
                    </button>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && content.length > 0 && (
                  <div className="border-t border-slate-800 p-4 space-y-2 max-h-96 overflow-y-auto">
                    {content.map((c) => {
                      const product = state.products.find((p) => p.id === c.productId);
                      return (
                        <div key={c.id} className="bg-slate-800/40 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-medium text-slate-300">
                              {product?.name}
                            </span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-[10px] text-slate-500">
                              {getPlatformEmoji(c.platform)} {getPlatformLabel(c.platform)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 whitespace-pre-wrap line-clamp-3">
                            {c.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">New Campaign</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Campaign Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., February Product Push"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                  required
                />
              </div>

              {/* Product Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-400">Products *</label>
                  <button
                    type="button"
                    onClick={selectAllProducts}
                    className="text-[10px] text-forge-400 hover:text-forge-300"
                  >
                    {form.productIds.length === state.products.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {state.products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        form.productIds.includes(p.id)
                          ? "bg-forge-600/15 text-forge-400 border border-forge-600/20"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        form.productIds.includes(p.id)
                          ? "border-forge-500 bg-forge-500"
                          : "border-slate-600"
                      }`}>
                        {form.productIds.includes(p.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.platforms.includes(p)
                          ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {getPlatformEmoji(p)} {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, tone: t.value })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.tone === t.value
                          ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Angle / Focus</label>
                <input
                  type="text"
                  value={form.angle}
                  onChange={(e) => setForm({ ...form, angle: e.target.value })}
                  placeholder="e.g., General product promotion"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom Instructions (optional)</label>
                <textarea
                  value={form.customPrompt}
                  onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
                  placeholder="Additional AI instructions for all products..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.productIds.length === 0}
                  className="flex-1 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Create Campaign ({form.productIds.length} product{form.productIds.length !== 1 ? "s" : ""})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
