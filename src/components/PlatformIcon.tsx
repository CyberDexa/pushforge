"use client";

import type { Platform } from "@/lib/types";
import { Twitter, Linkedin, Mail, MailOpen, MessageCircle, Video, Camera } from "lucide-react";

const ICON_MAP: Record<Platform, typeof Twitter> = {
  twitter: Twitter,
  linkedin: Linkedin,
  email_subject: Mail,
  email_body: MailOpen,
  whatsapp: MessageCircle,
  video_script: Video,
  instagram: Camera,
};

const COLOR_MAP: Record<Platform, string> = {
  twitter: "text-sky-400",
  linkedin: "text-blue-400",
  email_subject: "text-forge-400",
  email_body: "text-forge-400",
  whatsapp: "text-emerald-400",
  video_script: "text-red-400",
  instagram: "text-pink-400",
};

const BG_MAP: Record<Platform, string> = {
  twitter: "bg-sky-500/10",
  linkedin: "bg-blue-500/10",
  email_subject: "bg-forge-600/10",
  email_body: "bg-forge-600/10",
  whatsapp: "bg-emerald-500/10",
  video_script: "bg-red-500/10",
  instagram: "bg-pink-500/10",
};

export function PlatformIcon({
  platform,
  size = "sm",
  showBg = false,
}: {
  platform: Platform;
  size?: "xs" | "sm" | "md";
  showBg?: boolean;
}) {
  const Icon = ICON_MAP[platform];
  const sizeClass = size === "xs" ? "w-3 h-3" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const bgSize = size === "xs" ? "w-5 h-5" : size === "sm" ? "w-6 h-6" : "w-7 h-7";

  if (showBg) {
    return (
      <div className={`${bgSize} rounded-md ${BG_MAP[platform]} flex items-center justify-center shrink-0`}>
        <Icon className={`${sizeClass} ${COLOR_MAP[platform]}`} />
      </div>
    );
  }

  return <Icon className={`${sizeClass} ${COLOR_MAP[platform]} shrink-0`} />;
}

export function PlatformBadge({
  platform,
  label,
  selected = false,
  onClick,
}: {
  platform: Platform;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
        selected
          ? "bg-forge-600/15 text-forge-400 border border-forge-600/30"
          : "bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      <PlatformIcon platform={platform} size="xs" />
      {label}
    </button>
  );
}
