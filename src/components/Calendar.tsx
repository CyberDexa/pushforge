"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { getPlatformLabel, getPlatformEmoji } from "@/lib/ai";
import type { Platform } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Clock,
  Send,
  CalendarDays,
} from "lucide-react";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView() {
  const { state, dispatch } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Group content by date
  const contentByDay = useMemo(() => {
    const map: Record<number, typeof state.generatedContent> = {};
    state.generatedContent.forEach((c) => {
      const d = c.scheduledFor ? new Date(c.scheduledFor) : new Date(c.createdAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(c);
      }
    });
    return map;
  }, [state.generatedContent, year, month]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedDayContent = selectedDay ? contentByDay[selectedDay] || [] : [];

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    dispatch({ type: "MARK_COPIED", id });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColors = {
    draft: "bg-slate-600",
    scheduled: "bg-blue-500",
    posted: "bg-emerald-500",
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Content Calendar</h2>
        <p className="text-slate-400 text-sm">Plan and track your content schedule</p>
      </div>

      {/* Calendar Header */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-white min-w-[180px] text-center">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={goToday} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors">
            Today
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-500 uppercase py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-lg" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayContent = contentByDay[day] || [];
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`h-20 rounded-lg p-1.5 text-left transition-all relative group ${
                  isSelected
                    ? "bg-forge-600/15 border border-forge-600/30"
                    : isToday(day)
                    ? "bg-slate-800/80 border border-forge-600/20"
                    : "hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday(day) ? "text-forge-400" : isSelected ? "text-white" : "text-slate-400"
                  }`}
                >
                  {day}
                </span>

                {dayContent.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayContent.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-1"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[c.status || "draft"]}`} />
                        <span className="text-[8px] text-slate-500 truncate">
                          {getPlatformEmoji(c.platform)}
                        </span>
                      </div>
                    ))}
                    {dayContent.length > 3 && (
                      <span className="text-[8px] text-slate-600">
                        +{dayContent.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="text-[10px] text-slate-500">Draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-slate-500">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-500">Posted</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            {MONTH_NAMES[month]} {selectedDay}, {year}
            <span className="text-slate-600 ml-2">
              ({selectedDayContent.length} piece{selectedDayContent.length !== 1 ? "s" : ""})
            </span>
          </h3>

          {selectedDayContent.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No content for this day</p>
              <button
                onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
                className="mt-3 px-4 py-2 rounded-lg forge-gradient text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Generate Content
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayContent.map((c) => {
                const product = state.products.find((p) => p.id === c.productId);
                return (
                  <div key={c.id} className="glass-card rounded-xl p-4 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{getPlatformEmoji(c.platform)}</span>
                        <span className="text-xs font-medium text-slate-300">
                          {getPlatformLabel(c.platform)}
                        </span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{product?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          c.status === "posted"
                            ? "bg-emerald-900/30 text-emerald-400"
                            : c.status === "scheduled"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {c.status === "posted" ? "Posted" : c.status === "scheduled" ? "Scheduled" : "Draft"}
                        </span>
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
                          {c.status === "draft" && (
                            <button
                              onClick={() =>
                                dispatch({ type: "SET_CONTENT_STATUS", id: c.id, status: "posted" })
                              }
                              className="p-1.5 rounded-lg hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400 transition-all"
                              title="Mark as posted"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {c.status !== "scheduled" && c.status !== "posted" && (
                            <button
                              onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(9, 0, 0, 0);
                                dispatch({
                                  type: "SCHEDULE_CONTENT",
                                  id: c.id,
                                  scheduledFor: tomorrow.toISOString(),
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 transition-all"
                              title="Schedule for tomorrow"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                      {c.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
