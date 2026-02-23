"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { generateContent, getPlatformLabel, getPlatformEmoji } from "@/lib/ai";
import type { Platform, GeneratedContent } from "@/lib/types";
import { Sparkles, Copy, Check, Loader2, AlertTriangle, Calendar, GitBranch, Share2, MessageCircle } from "lucide-react";

const ALL_PLATFORMS: Platform[] = [
  "twitter",
  "linkedin",
  "email_subject",
  "email_body",
  "whatsapp",
  "video_script",
  "instagram",
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "witty", label: "Witty" },
  { value: "storytelling", label: "Story" },
];

const ANGLE_SUGGESTIONS = [
  "Launch announcement",
  "Problem → Solution",
  "Customer success story",
  "Feature highlight",
  "Limited-time offer",
  "Behind the scenes",
  "Comparison with alternatives",
  "Free trial / demo invite",
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Generate() {
  const { state, dispatch } = useStore();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitter",
    "linkedin",
    "email_subject",
    "email_body",
    "whatsapp",
  ]);
  const [tone, setTone] = useState("casual");
  const [angle, setAngle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  const [variations, setVariations] = useState(1);
  const [scheduleDate, setScheduleDate] = useState("");
  const [allResults, setAllResults] = useState<{ variation: number; results: Record<string, string> }[]>([]);

  // Load template from sessionStorage (when user clicks "Use Template")
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pushforge_template");
      if (saved) {
        const tmpl = JSON.parse(saved);
        if (tmpl.platforms) setSelectedPlatforms(tmpl.platforms);
        if (tmpl.tone) setTone(tmpl.tone);
        if (tmpl.angle) setAngle(tmpl.angle);
        if (tmpl.customPrompt) setCustomPrompt(tmpl.customPrompt);
        sessionStorage.removeItem("pushforge_template");
      }
    } catch {
      // ignore
    }
  }, []);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    if (!selectedProduct) {
      setError("Select a product first");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (!state.apiKey) {
      setError("Set your API key in Settings first");
      return;
    }

    const product = state.products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setLoading(true);
    setError("");
    setResults({});
    setAllResults([]);

    try {
      const variationResults: { variation: number; results: Record<string, string> }[] = [];

      for (let v = 0; v < variations; v++) {
        const variationPrompt = variations > 1
          ? `${customPrompt || ""}\n\nIMPORTANT: This is variation ${v + 1} of ${variations}. Create a DISTINCTLY DIFFERENT angle, hook, and structure from other variations. Be creative with a unique approach.`.trim()
          : customPrompt || undefined;

        const generated = await generateContent(
          product,
          selectedPlatforms,
          tone,
          angle || "General product promotion",
          state.apiKey,
          state.aiProvider,
          variationPrompt,
          state.brandVoice
        );

        variationResults.push({ variation: v + 1, results: generated });

        // Save to store
        const variationGroupId = variations > 1 ? generateId() : undefined;
        const contentItems: GeneratedContent[] = Object.entries(generated).map(
          ([platform, content]) => ({
            id: generateId(),
            productId: selectedProduct,
            platform: platform as Platform,
            content,
            createdAt: new Date().toISOString(),
            copied: false,
            status: scheduleDate ? ("scheduled" as const) : ("draft" as const),
            scheduledFor: scheduleDate || undefined,
            variationGroup: variationGroupId,
          })
        );

        dispatch({ type: "ADD_CONTENT", content: contentItems });
      }

      if (variations > 1) {
        setAllResults(variationResults);
      } else {
        setResults(variationResults[0].results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIds((prev) => new Set(prev).add(key));
    setTimeout(() => {
      setCopiedIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 2000);
  };

  const shareToWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToTwitter = (text: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToLinkedIn = (text: string) => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(text.slice(0, 100))}`, "_blank");
  };

  const hasApiKey = !!state.apiKey;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          Generate Content
        </h2>
        <p className="text-slate-400 text-sm">
          Select a product, choose platforms, and forge your content
        </p>
      </div>

      {!hasApiKey && (
        <div className="glass-card rounded-xl p-4 mb-6 border-amber-600/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-amber-200 text-sm font-medium">API Key Required</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Go to{" "}
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
                className="text-forge-400 hover:underline"
              >
                Settings
              </button>{" "}
              to add your OpenAI or Anthropic API key.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="space-y-5">
          {/* Product Select */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Product
            </label>
            {state.products.length === 0 ? (
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
                className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm hover:border-forge-600/40 hover:text-forge-400 transition-all"
              >
                + Add a product first
              </button>
            ) : (
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-forge-500 transition-colors"
              >
                <option value="">Select product...</option>
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Platforms */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedPlatforms.includes(p)
                      ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <span>{getPlatformEmoji(p)}</span>
                  {getPlatformLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    tone === t.value
                      ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Angle / Focus
            </label>
            <input
              type="text"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="What angle to take? e.g., 'Launch announcement'"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {ANGLE_SUGGESTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                    angle === a
                      ? "bg-forge-600/20 text-forge-400"
                      : "bg-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Custom Instructions (optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Any additional instructions for the AI..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
            />
          </div>

          {/* A/B Variations & Schedule */}
          <div className="glass-card rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  A/B Variations
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariations(v)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                        variations === v
                          ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !hasApiKey}
            className="w-full py-3.5 rounded-xl forge-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Forging {variations > 1 ? `${variations} variations` : "content"}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {selectedPlatforms.length} Pieces
                {variations > 1 ? ` × ${variations} Variations` : ""}
              </>
            )}
          </button>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {Object.keys(results).length === 0 && allResults.length === 0 && !loading && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Generated content will appear here
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card rounded-2xl p-10 text-center shimmer-bg">
              <Loader2 className="w-10 h-10 text-forge-400 mx-auto mb-3 animate-spin" />
              <p className="text-slate-400 text-sm">
                Forging your content across {selectedPlatforms.length} platforms
                {variations > 1 ? ` (${variations} variations)` : ""}...
              </p>
            </div>
          )}

          {/* Single variation results */}
          {Object.entries(results).map(([platform, content]) => (
            <div
              key={platform}
              className="glass-card rounded-2xl p-5 animate-slide-up"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {getPlatformEmoji(platform as Platform)}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {getPlatformLabel(platform as Platform)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {platform === "whatsapp" && (
                    <button
                      onClick={() => shareToWhatsApp(content)}
                      className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-900/30 transition-all"
                      title="Share via WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                  )}
                  {platform === "twitter" && (
                    <button
                      onClick={() => shareToTwitter(content)}
                      className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-900/30 transition-all"
                      title="Post to Twitter"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                  {platform === "linkedin" && (
                    <button
                      onClick={() => shareToLinkedIn(content)}
                      className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-900/30 transition-all"
                      title="Share on LinkedIn"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(content, platform)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    {copiedIds.has(platform) ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            </div>
          ))}

          {/* A/B Variation results */}
          {allResults.map((varResult) => (
            <div key={varResult.variation} className="animate-slide-up">
              <h3 className="text-xs font-semibold text-forge-400 mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" />
                Variation {varResult.variation}
              </h3>
              <div className="space-y-3 mb-6">
                {Object.entries(varResult.results).map(([platform, content]) => {
                  const key = `v${varResult.variation}-${platform}`;
                  return (
                    <div key={key} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{getPlatformEmoji(platform as Platform)}</span>
                          <span className="text-xs font-medium text-slate-300">
                            {getPlatformLabel(platform as Platform)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {platform === "whatsapp" && (
                            <button
                              onClick={() => shareToWhatsApp(content)}
                              className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-900/30 transition-all"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(content, key)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-400 hover:text-white transition-all"
                          >
                            {copiedIds.has(key) ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
