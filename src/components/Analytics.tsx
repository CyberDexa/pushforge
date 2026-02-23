"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getPlatformLabel } from "@/lib/ai";
import type { Platform } from "@/lib/types";
import { PlatformIcon } from "@/components/PlatformIcon";
import {
  BarChart3,
  TrendingUp,
  Copy,
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AnalyticsView() {
  const { state } = useStore();
  const { generatedContent, products } = state;

  const analytics = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = generatedContent.filter(
      (c) => new Date(c.createdAt) >= weekAgo
    );
    const lastWeek = generatedContent.filter(
      (c) => new Date(c.createdAt) >= twoWeeksAgo && new Date(c.createdAt) < weekAgo
    );

    // Platform breakdown
    const platformCounts: Record<string, number> = {};
    generatedContent.forEach((c) => {
      platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
    });

    // Product breakdown
    const productCounts: Record<string, number> = {};
    generatedContent.forEach((c) => {
      productCounts[c.productId] = (productCounts[c.productId] || 0) + 1;
    });

    // Daily activity (last 30 days)
    const dailyActivity: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyActivity[key] = 0;
    }
    generatedContent.forEach((c) => {
      const key = new Date(c.createdAt).toISOString().split("T")[0];
      if (key in dailyActivity) {
        dailyActivity[key]++;
      }
    });

    // Status breakdown
    const statusCounts = {
      draft: generatedContent.filter((c) => !c.status || c.status === "draft").length,
      scheduled: generatedContent.filter((c) => c.status === "scheduled").length,
      posted: generatedContent.filter((c) => c.status === "posted").length,
    };

    // Copies
    const totalCopied = generatedContent.filter((c) => c.copied).length;
    const todayCount = generatedContent.filter(
      (c) => new Date(c.createdAt).toDateString() === today
    ).length;

    const weekChange = lastWeek.length > 0
      ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
      : thisWeek.length > 0 ? 100 : 0;

    return {
      total: generatedContent.length,
      thisWeek: thisWeek.length,
      lastWeek: lastWeek.length,
      weekChange,
      todayCount,
      totalCopied,
      platformCounts,
      productCounts,
      dailyActivity,
      statusCounts,
    };
  }, [generatedContent, products]);

  const maxDailyCount = Math.max(...Object.values(analytics.dailyActivity), 1);

  const platformEntries = Object.entries(analytics.platformCounts)
    .sort(([, a], [, b]) => b - a);

  const maxPlatformCount = Math.max(...Object.values(analytics.platformCounts), 1);

  const productEntries = Object.entries(analytics.productCounts)
    .sort(([, a], [, b]) => b - a);

  const maxProductCount = Math.max(...Object.values(analytics.productCounts), 1);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1 section-header">Analytics</h2>
        <p className="text-slate-400 text-sm">Content performance insights</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card glass-card rounded-2xl p-5 hover:border-forge-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-forge-600/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-forge-400" />
            </div>
            {analytics.weekChange !== 0 && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                analytics.weekChange > 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {analytics.weekChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(analytics.weekChange)}%
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white">{analytics.total}</p>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Total Generated</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-5 hover:border-emerald-600/30">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{analytics.thisWeek}</p>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">This Week</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-5 hover:border-blue-600/30">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-3">
            <Copy className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{analytics.totalCopied}</p>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Copied</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-5 hover:border-amber-600/30">
          <div className="w-10 h-10 rounded-xl bg-yellow-600/10 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">{analytics.todayCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Chart (last 30 days) */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-forge-400" />
            <h3 className="text-sm font-semibold text-white">30-Day Activity</h3>
          </div>
          <div className="flex items-end gap-[3px] h-32">
            {Object.entries(analytics.dailyActivity).map(([date, count]) => {
              const height = maxDailyCount > 0 ? (count / maxDailyCount) * 100 : 0;
              const isToday = date === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={date}
                  className="flex-1 group relative"
                  style={{ height: "100%" }}
                >
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all ${
                      isToday ? "bg-forge-500" : count > 0 ? "bg-forge-600/50" : "bg-slate-800/50"
                    } group-hover:bg-forge-400`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {date.slice(5)}: {count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-slate-600">30 days ago</span>
            <span className="text-[9px] text-slate-600">Today</span>
          </div>
        </div>

        {/* Content Status */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-forge-400" />
            <h3 className="text-sm font-semibold text-white">Content Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Draft</span>
                <span className="text-xs text-slate-400">{analytics.statusCounts.draft}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-500 transition-all duration-500"
                  style={{
                    width: `${analytics.total > 0 ? (analytics.statusCounts.draft / analytics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Scheduled</span>
                <span className="text-xs text-slate-400">{analytics.statusCounts.scheduled}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${analytics.total > 0 ? (analytics.statusCounts.scheduled / analytics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Posted</span>
                <span className="text-xs text-slate-400">{analytics.statusCounts.posted}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${analytics.total > 0 ? (analytics.statusCounts.posted / analytics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {analytics.total === 0 && (
            <p className="text-sm text-slate-500 text-center mt-6">No content generated yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">By Platform</h3>
          {platformEntries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {platformEntries.map(([platform, count]) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300 flex items-center gap-1.5">
                      <PlatformIcon platform={platform as Platform} size="xs" />
                      {getPlatformLabel(platform as Platform)}
                    </span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full forge-gradient transition-all duration-500"
                      style={{ width: `${(count / maxPlatformCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Breakdown */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">By Product</h3>
          {productEntries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {productEntries.map(([productId, count]) => {
                const product = products.find((p) => p.id === productId);
                return (
                  <div key={productId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">
                        {product?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(count / maxProductCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
