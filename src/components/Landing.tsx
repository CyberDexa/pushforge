"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Sparkles,
  Zap,
  CalendarDays,
  BarChart3,
  Layers,
  Globe,
  ArrowRight,
  Check,
  MessageCircle,
  Mail,
  Megaphone,
  Loader2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Content Engine",
    desc: "Generate platform-perfect content for Twitter, LinkedIn, Email, WhatsApp, Instagram & more in one click.",
  },
  {
    icon: Layers,
    title: "Multi-Product Campaigns",
    desc: "Manage 5+ products and generate content across all of them simultaneously with batch campaigns.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    desc: "Visualize your content pipeline on a month-view calendar. Schedule, track, and never miss a post.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track generation stats, platform breakdown, status distribution, and week-over-week trends.",
  },
  {
    icon: MessageCircle,
    title: "Brand Voice Training",
    desc: "Train the AI on your writing style with personality, samples, and guardrails. Every piece sounds like you.",
  },
  {
    icon: Zap,
    title: "A/B Variations",
    desc: "Generate up to 3 variations per piece to test different hooks, angles, and approaches.",
  },
];

const PLATFORMS = [
  { emoji: "🐦", name: "Twitter/X" },
  { emoji: "💼", name: "LinkedIn" },
  { emoji: "📧", name: "Email" },
  { emoji: "💬", name: "WhatsApp" },
  { emoji: "📸", name: "Instagram" },
  { emoji: "🎬", name: "Video Scripts" },
];

const PRICING = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying PushForge",
    features: [
      "1 product",
      "50 generations / month",
      "All platforms",
      "Content history",
      "Copy & share",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
    desc: "For serious content creators",
    features: [
      "Unlimited products",
      "Unlimited generations",
      "A/B variations",
      "Brand voice training",
      "Campaign builder",
      "Content calendar",
      "Analytics dashboard",
      "Template library",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM || "",
    desc: "For agencies & teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Direct social posting",
      "Email distribution",
      "API access",
      "Custom templates",
      "White-label export",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Landing() {
  const { dispatch } = useStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(priceId: string, planName: string) {
    if (!priceId) {
      dispatch({ type: "SET_VIEW", view: "generate" });
      return;
    }
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="animate-fade-in -m-8 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-forge-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-forge-600/30 bg-forge-600/10 px-4 py-1.5 text-xs text-forge-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Marketing Content Engine
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Forge marketing content
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-orange-400">
              across every platform
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            One product. Seven platforms. Instant content. PushForge uses AI to
            generate platform-perfect marketing copy for all your SaaS products
            — from tweets to email campaigns.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
              className="forge-gradient px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Start Generating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "dashboard" })}
              className="px-6 py-3 rounded-xl text-slate-300 border border-slate-700 text-sm font-medium hover:border-slate-600 hover:text-white transition-all"
            >
              View Dashboard
            </button>
          </div>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400"
              >
                <span>{p.emoji}</span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Everything you need to dominate content marketing
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built for indie hackers and SaaS founders who manage multiple
              products and need consistent content across all channels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 hover:border-forge-600/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-forge-600/10 flex items-center justify-center mb-4 group-hover:bg-forge-600/20 transition-colors">
                  <f.icon className="w-5 h-5 text-forge-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-slate-900/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Three steps to content dominance
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Add Your Products",
                desc: "Drop in your product name, description, audience, and key features.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Choose & Generate",
                desc: "Pick platforms, set tone, and let AI forge content tailored to each channel.",
                icon: Megaphone,
              },
              {
                step: "03",
                title: "Copy, Schedule & Post",
                desc: "Copy to clipboard, share directly, or schedule for later. Done in seconds.",
                icon: Mail,
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-3xl font-black text-forge-600/20 mb-3">
                  {s.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-forge-600/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-forge-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-400 text-sm">
              Start free. Upgrade when you&apos;re ready to scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-b from-forge-600/10 to-transparent border-2 border-forge-600/40 relative"
                    : "glass-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-forge-600 text-white text-[10px] font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-forge-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    "priceId" in plan && plan.priceId
                      ? handleCheckout(plan.priceId, plan.name)
                      : dispatch({ type: "SET_VIEW", view: "generate" })
                  }
                  disabled={loadingPlan === plan.name}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? "forge-gradient text-white hover:opacity-90"
                      : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600"
                  } disabled:opacity-50`}
                >
                  {loadingPlan === plan.name ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center glass-card rounded-2xl p-10 border-forge-600/20">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to forge your content?
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Stop spending hours writing marketing copy. Let AI generate
            platform-perfect content for every product in your portfolio.
          </p>
          <button
            onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
            className="forge-gradient px-8 py-3.5 rounded-xl text-white font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Get Started — It&apos;s Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-800/50">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg forge-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">PushForge</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PushForge. Built for builders.
          </p>
        </div>
      </footer>
    </div>
  );
}
