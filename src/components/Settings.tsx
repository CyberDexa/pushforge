"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { BrandVoice } from "@/lib/types";
import { Key, Eye, EyeOff, CheckCircle, Cpu, Mic, Plus, X } from "lucide-react";

export default function SettingsView() {
  const { state, dispatch } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(state.apiKey);
  const [saved, setSaved] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [brand, setBrand] = useState<BrandVoice>(state.brandVoice);
  const [newSample, setNewSample] = useState("");
  const [newDoNot, setNewDoNot] = useState("");
  const [newInclude, setNewInclude] = useState("");

  const handleSave = () => {
    dispatch({ type: "SET_API_KEY", key: tempKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveBrandVoice = () => {
    dispatch({ type: "SET_BRAND_VOICE", brandVoice: brand });
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2000);
  };

  const addSample = () => {
    if (!newSample.trim()) return;
    setBrand({ ...brand, writingSamples: [...brand.writingSamples, newSample.trim()] });
    setNewSample("");
  };

  const removeSample = (i: number) => {
    setBrand({ ...brand, writingSamples: brand.writingSamples.filter((_, idx) => idx !== i) });
  };

  const addDoNot = () => {
    if (!newDoNot.trim()) return;
    setBrand({ ...brand, doNot: [...brand.doNot, newDoNot.trim()] });
    setNewDoNot("");
  };

  const removeDoNot = (i: number) => {
    setBrand({ ...brand, doNot: brand.doNot.filter((_, idx) => idx !== i) });
  };

  const addInclude = () => {
    if (!newInclude.trim()) return;
    setBrand({ ...brand, includeAlways: [...brand.includeAlways, newInclude.trim()] });
    setNewInclude("");
  };

  const removeInclude = (i: number) => {
    setBrand({ ...brand, includeAlways: brand.includeAlways.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 section-header">Settings</h2>
        <p className="text-slate-400 text-sm">
          Configure your AI provider, API keys, and brand voice
        </p>
      </div>

      {/* AI Provider */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-forge-400" />
          <h3 className="text-sm font-semibold text-white">AI Provider</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => dispatch({ type: "SET_AI_PROVIDER", provider: "openai" })}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer ${
              state.aiProvider === "openai"
                ? "bg-forge-600/15 border border-forge-600/30"
                : "bg-slate-800/80 border border-slate-700 hover:border-slate-600"
            }`}
          >
            <p className={`text-sm font-semibold ${state.aiProvider === "openai" ? "text-forge-400" : "text-white"}`}>
              OpenAI
            </p>
            <p className="text-[10px] text-slate-500 mt-1">GPT-4o Mini • Fast & affordable</p>
          </button>

          <button
            onClick={() => dispatch({ type: "SET_AI_PROVIDER", provider: "anthropic" })}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer ${
              state.aiProvider === "anthropic"
                ? "bg-forge-600/15 border border-forge-600/30"
                : "bg-slate-800/80 border border-slate-700 hover:border-slate-600"
            }`}
          >
            <p className={`text-sm font-semibold ${state.aiProvider === "anthropic" ? "text-forge-400" : "text-white"}`}>
              Anthropic
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Claude Sonnet • High quality</p>
          </button>
        </div>
      </div>

      {/* API Key */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-forge-400" />
          <h3 className="text-sm font-semibold text-white">
            {state.aiProvider === "openai" ? "OpenAI" : "Anthropic"} API Key
          </h3>
        </div>

        <div className="relative mb-3">
          <input
            type={showKey ? "text" : "password"}
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder={state.aiProvider === "openai" ? "sk-..." : "sk-ant-..."}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors font-mono"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg btn-primary text-white text-sm font-medium"
          >
            Save Key
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <p className="text-[10px] text-slate-600 mt-3">
          Your API key is stored locally in your browser. It never leaves your device.
        </p>
      </div>

      {/* Brand Voice */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-4 h-4 text-forge-400" />
          <h3 className="text-sm font-semibold text-white">Brand Voice</h3>
          <span className="text-[10px] text-slate-500 ml-auto">Shapes AI-generated content</span>
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Company / Brand Name</label>
          <input
            type="text"
            value={brand.companyName}
            onChange={(e) => setBrand({ ...brand, companyName: e.target.value })}
            placeholder="Your company name"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
          />
        </div>

        {/* Personality */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Brand Personality</label>
          <textarea
            value={brand.personality}
            onChange={(e) => setBrand({ ...brand, personality: e.target.value })}
            placeholder="Describe your brand's voice and personality. e.g., 'We're bold, direct, and builder-focused. We speak like a smart friend who gets things done.'"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
          />
        </div>

        {/* Writing Samples */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Writing Samples
            <span className="text-slate-600 ml-1">({brand.writingSamples.length})</span>
          </label>
          <p className="text-[10px] text-slate-600 mb-2">
            Paste examples of your writing so the AI can match your style
          </p>
          {brand.writingSamples.map((sample, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <p className="flex-1 text-xs text-slate-400 bg-slate-800/60 rounded-lg p-2 line-clamp-2">
                {sample}
              </p>
              <button onClick={() => removeSample(i)} className="p-1 text-slate-500 hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <textarea
              value={newSample}
              onChange={(e) => setNewSample(e.target.value)}
              placeholder="Paste a writing sample..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
            />
            <button
              onClick={addSample}
              className="px-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Do Not */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Never Do</label>
          <p className="text-[10px] text-slate-600 mb-2">Things the AI should avoid</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {brand.doNot.map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-red-900/20 text-red-400 border border-red-900/30">
                {item}
                <button onClick={() => removeDoNot(i)}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDoNot}
              onChange={(e) => setNewDoNot(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDoNot())}
              placeholder="e.g., Use emojis excessively"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
            />
            <button onClick={addDoNot} className="px-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Always Include */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Always Include</label>
          <p className="text-[10px] text-slate-600 mb-2">Things to always mention or include</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {brand.includeAlways.map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-emerald-900/20 text-emerald-400 border border-emerald-900/30">
                {item}
                <button onClick={() => removeInclude(i)}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())}
              placeholder="e.g., Website link at the end"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
            />
            <button onClick={addInclude} className="px-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveBrandVoice}
            className="px-4 py-2 rounded-lg btn-primary text-white text-sm font-medium"
          >
            Save Brand Voice
          </button>
          {brandSaved && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>
      </div>

      {/* Quick Start */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Start</h3>
        <ol className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-forge-400 font-bold">1.</span>
            Get an API key from{" "}
            {state.aiProvider === "openai" ? (
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-forge-400 hover:underline">
                platform.openai.com
              </a>
            ) : (
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-forge-400 hover:underline">
                console.anthropic.com
              </a>
            )}
          </li>
          <li className="flex gap-2">
            <span className="text-forge-400 font-bold">2.</span>
            Paste it above and click Save
          </li>
          <li className="flex gap-2">
            <span className="text-forge-400 font-bold">3.</span>
            Configure your Brand Voice for better results
          </li>
          <li className="flex gap-2">
            <span className="text-forge-400 font-bold">4.</span>
            Add products, then Generate or run Campaigns!
          </li>
        </ol>
      </div>
    </div>
  );
}
