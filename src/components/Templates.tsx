"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Template, Platform, Tone } from "@/lib/types";
import { getPlatformLabel } from "@/lib/ai";
import { PlatformBadge, PlatformIcon } from "@/components/PlatformIcon";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Rocket,
  Star,
  MessageSquare,
  Tag,
  BookOpen,
  Wrench,
  Sparkles,
  FileText,
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

const CATEGORIES = [
  { value: "launch" as const, label: "Launch", icon: Rocket },
  { value: "feature" as const, label: "Feature", icon: Star },
  { value: "engagement" as const, label: "Engagement", icon: MessageSquare },
  { value: "promo" as const, label: "Promo", icon: Tag },
  { value: "story" as const, label: "Story", icon: BookOpen },
  { value: "custom" as const, label: "Custom", icon: Wrench },
];

const BUILT_IN_TEMPLATES: Omit<Template, "id" | "createdAt">[] = [
  {
    name: "Product Launch",
    category: "launch",
    platforms: ["twitter", "linkedin", "email_subject", "email_body", "instagram"],
    tone: "urgent",
    angle: "Launch announcement",
    customPrompt: "Highlight the unique value proposition. Create excitement about what's new. Include a clear CTA to try it.",
    isBuiltIn: true,
  },
  {
    name: "Feature Update",
    category: "feature",
    platforms: ["twitter", "linkedin", "email_body"],
    tone: "professional",
    angle: "Feature highlight",
    customPrompt: "Focus on the specific new feature and how it helps users. Be specific about the benefit, not just the feature.",
    isBuiltIn: true,
  },
  {
    name: "Customer Story",
    category: "story",
    platforms: ["linkedin", "email_body", "instagram", "video_script"],
    tone: "storytelling",
    angle: "Customer success story",
    customPrompt: "Use a narrative structure: challenge → discovery → transformation. Make it relatable and authentic.",
    isBuiltIn: true,
  },
  {
    name: "Problem → Solution",
    category: "engagement",
    platforms: ["twitter", "linkedin", "instagram"],
    tone: "casual",
    angle: "Problem → Solution",
    customPrompt: "Start by describing a common pain point your audience faces. Then show how the product solves it elegantly.",
    isBuiltIn: true,
  },
  {
    name: "Flash Sale / Promo",
    category: "promo",
    platforms: ["twitter", "email_subject", "email_body", "whatsapp", "instagram"],
    tone: "urgent",
    angle: "Limited-time offer",
    customPrompt: "Create urgency with time-limited elements. Include specific discount/offer details. Make the CTA unmissable.",
    isBuiltIn: true,
  },
  {
    name: "Behind the Scenes",
    category: "story",
    platforms: ["twitter", "linkedin", "instagram"],
    tone: "casual",
    angle: "Behind the scenes",
    customPrompt: "Share the human side — the process, decisions, or team story behind building the product.",
    isBuiltIn: true,
  },
  {
    name: "Free Trial Invite",
    category: "promo",
    platforms: ["twitter", "linkedin", "email_subject", "email_body", "whatsapp"],
    tone: "casual",
    angle: "Free trial / demo invite",
    customPrompt: "Lower the barrier to entry. Emphasize no risk, no credit card. Make trying the product feel effortless.",
    isBuiltIn: true,
  },
  {
    name: "Comparison Post",
    category: "engagement",
    platforms: ["twitter", "linkedin", "email_body"],
    tone: "professional",
    angle: "Comparison with alternatives",
    customPrompt: "Position against alternatives without being negative. Focus on unique advantages and differentiators.",
    isBuiltIn: true,
  },
];

export default function TemplatesView() {
  const { state, dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    category: "custom" as Template["category"],
    platforms: ["twitter", "linkedin"] as Platform[],
    tone: "casual" as Tone,
    angle: "",
    customPrompt: "",
  });

  // Merge built-in with user templates
  const allTemplates = [
    ...BUILT_IN_TEMPLATES.map((t, i) => ({
      ...t,
      id: `builtin-${i}`,
      createdAt: "2026-01-01T00:00:00Z",
    })),
    ...state.templates,
  ];

  const filtered = filterCategory === "all"
    ? allTemplates
    : allTemplates.filter((t) => t.category === filterCategory);

  const resetForm = () => {
    setForm({ name: "", category: "custom", platforms: ["twitter", "linkedin"], tone: "casual", angle: "", customPrompt: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (template: Template) => {
    if (template.isBuiltIn) return;
    setForm({
      name: template.name,
      category: template.category,
      platforms: template.platforms,
      tone: template.tone,
      angle: template.angle,
      customPrompt: template.customPrompt,
    });
    setEditing(template);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const template: Template = {
      id: editing?.id || generateId(),
      name: form.name.trim(),
      category: form.category,
      platforms: form.platforms,
      tone: form.tone,
      angle: form.angle.trim(),
      customPrompt: form.customPrompt.trim(),
      isBuiltIn: false,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };

    if (editing) {
      dispatch({ type: "UPDATE_TEMPLATE", template });
    } else {
      dispatch({ type: "ADD_TEMPLATE", template });
    }
    resetForm();
  };

  const togglePlatform = (p: Platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const useTemplate = (template: Template | (Omit<Template, "id" | "createdAt"> & { id: string; createdAt: string })) => {
    // Navigate to Generate with template pre-filled — store in sessionStorage
    sessionStorage.setItem(
      "pushforge_template",
      JSON.stringify({
        platforms: template.platforms,
        tone: template.tone,
        angle: template.angle,
        customPrompt: template.customPrompt,
      })
    );
    dispatch({ type: "SET_VIEW", view: "generate" });
  };

  const categoryIcon = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? found.icon : FileText;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 section-header">Templates</h2>
          <p className="text-slate-400 text-sm">Reusable content recipes for quick generation</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === "all"
              ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
              : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
          }`}
        >
          All ({allTemplates.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = allTemplates.filter((t) => t.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filterCategory === cat.value
                  ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((template) => {
          const CatIcon = categoryIcon(template.category);
          return (
            <div
              key={template.id}
              className="glass-card rounded-2xl p-5 hover:border-slate-600/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-forge-600/10 flex items-center justify-center">
                    <CatIcon className="w-4 h-4 text-forge-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                    <span className="text-[10px] text-slate-500 capitalize">{template.category}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {template.isBuiltIn ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">Built-in</span>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => openEdit(template as Template)}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: "DELETE_TEMPLATE", id: template.id })}
                        className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {template.customPrompt || template.angle}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {template.platforms.map((p) => (
                  <span key={p} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500">
                    <PlatformIcon platform={p} size="xs" /> {getPlatformLabel(p)}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 capitalize">
                  {template.tone} tone
                </span>
                <button
                  onClick={() => useTemplate(template)}
                  className="flex items-center gap-1 text-[11px] text-forge-400 hover:text-forge-300 font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editing ? "Edit Template" : "New Template"}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Weekly Feature Spotlight"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.category === cat.value
                          ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <cat.icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

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
                      <PlatformIcon platform={p} size="xs" /> {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

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
                  placeholder="e.g., Weekly feature spotlight"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom Instructions</label>
                <textarea
                  value={form.customPrompt}
                  onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
                  placeholder="Specific instructions for the AI..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  {editing ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
