"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { VideoJob } from "@/lib/types";
import {
  Video,
  Mic,
  Loader2,
  Download,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
} from "lucide-react";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "Warm, natural female" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", desc: "Soft, young female" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", desc: "Well-rounded male" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", desc: "Crisp, authoritative male" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", desc: "Deep, narration male" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", desc: "Raspy, authentic male" },
];

const DID_VOICES = [
  { id: "en-US-JennyNeural", name: "Jenny", desc: "Natural female" },
  { id: "en-US-GuyNeural", name: "Guy", desc: "Natural male" },
  { id: "en-US-AriaNeural", name: "Aria", desc: "Professional female" },
  { id: "en-US-DavisNeural", name: "Davis", desc: "Conversational male" },
  { id: "en-GB-SoniaNeural", name: "Sonia", desc: "British female" },
  { id: "en-GB-RyanNeural", name: "Ryan", desc: "British male" },
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-slate-400", label: "Pending" },
  processing: { icon: Loader2, color: "text-amber-400", label: "Processing" },
  completed: { icon: CheckCircle, color: "text-emerald-400", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
};

export default function VideoStudio() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<"voiceover" | "talking_head">("voiceover");
  const [scriptText, setScriptText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);
  const [selectedDIDVoice, setSelectedDIDVoice] = useState(DID_VOICES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get video scripts from generated content
  const videoScripts = state.generatedContent.filter(
    (c) => c.platform === "video_script"
  );

  // API key config
  const hasElevenLabsKey = !!state.apiKey; // Reuse settings, or we'll check env
  const elevenLabsKey =
    typeof window !== "undefined"
      ? localStorage.getItem("pushforge_elevenlabs_key") || ""
      : "";
  const dIdKey =
    typeof window !== "undefined"
      ? localStorage.getItem("pushforge_did_key") || ""
      : "";

  const [elevenLabsInput, setElevenLabsInput] = useState(elevenLabsKey);
  const [dIdInput, setDIdInput] = useState(dIdKey);

  function saveKeys() {
    localStorage.setItem("pushforge_elevenlabs_key", elevenLabsInput);
    localStorage.setItem("pushforge_did_key", dIdInput);
  }

  // Poll for D-ID job status
  useEffect(() => {
    const processingJobs = state.videoJobs.filter(
      (j) => j.type === "talking_head" && j.status === "processing"
    );
    if (processingJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of processingJobs) {
        try {
          const key = localStorage.getItem("pushforge_did_key") || "";
          const res = await fetch(
            `/api/video/status?talkId=${encodeURIComponent(job.id)}&apiKey=${encodeURIComponent(key)}`
          );
          const data = await res.json();
          if (data.status === "done" && data.resultUrl) {
            dispatch({
              type: "UPDATE_VIDEO_JOB",
              job: {
                ...job,
                status: "completed",
                resultUrl: data.resultUrl,
                completedAt: new Date().toISOString(),
              },
            });
          } else if (data.status === "error" || data.error) {
            dispatch({
              type: "UPDATE_VIDEO_JOB",
              job: {
                ...job,
                status: "failed",
                error: data.error || "Unknown error",
              },
            });
          }
        } catch {
          // silent — will retry next interval
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state.videoJobs, dispatch]);

  async function handleVoiceover() {
    const key = localStorage.getItem("pushforge_elevenlabs_key") || "";
    if (!key) {
      setError("Add your ElevenLabs API key above");
      return;
    }
    if (!scriptText.trim()) {
      setError("Enter or select a script");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      const res = await fetch("/api/video/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          voiceId: selectedVoice,
          apiKey: key,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Voiceover failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const job: VideoJob = {
        id: generateId(),
        scriptText: scriptText.slice(0, 200),
        type: "voiceover",
        voiceId: selectedVoice,
        status: "completed",
        resultUrl: url,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_VIDEO_JOB", job });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voiceover failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleTalkingHead() {
    const key = localStorage.getItem("pushforge_did_key") || "";
    if (!key) {
      setError("Add your D-ID API key above");
      return;
    }
    if (!scriptText.trim()) {
      setError("Enter or select a script");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/video/talking-head", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptText,
          voiceId: selectedDIDVoice,
          apiKey: key,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video creation failed");

      const job: VideoJob = {
        id: data.talkId,
        scriptText: scriptText.slice(0, 200),
        type: "talking_head",
        voiceId: selectedDIDVoice,
        status: "processing",
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_VIDEO_JOB", job });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video creation failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Video Studio</h2>
        <p className="text-slate-400 text-sm">
          Turn scripts into voiceovers and talking-head videos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* API Keys */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              API Keys
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">
                  ElevenLabs API Key
                </label>
                <input
                  type="password"
                  value={elevenLabsInput}
                  onChange={(e) => setElevenLabsInput(e.target.value)}
                  onBlur={saveKeys}
                  placeholder="xi-..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-forge-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">
                  D-ID API Key
                </label>
                <input
                  type="password"
                  value={dIdInput}
                  onChange={(e) => setDIdInput(e.target.value)}
                  onBlur={saveKeys}
                  placeholder="Base64 encoded key"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-forge-500"
                />
              </div>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("voiceover")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "voiceover"
                  ? "bg-forge-600/15 text-forge-400 border border-forge-600/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <Mic className="w-4 h-4" />
              AI Voiceover
            </button>
            <button
              onClick={() => setTab("talking_head")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "talking_head"
                  ? "bg-forge-600/15 text-forge-400 border border-forge-600/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <User className="w-4 h-4" />
              Talking Head Video
            </button>
          </div>

          {/* Script Input */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">
                Script
              </label>
              {videoScripts.length > 0 && (
                <select
                  onChange={(e) => {
                    const script = videoScripts.find(
                      (s) => s.id === e.target.value
                    );
                    if (script) setScriptText(script.content);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">Load from history...</option>
                  {videoScripts.map((s) => (
                    <option key={s.id} value={s.id}>
                      🎬{" "}
                      {s.content.slice(0, 50).replace(/\n/g, " ")}...
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={
                tab === "voiceover"
                  ? "Paste your video script or narration text here..."
                  : "Enter the text for the talking head to speak..."
              }
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-slate-600 mt-1">
              {scriptText.length} chars •{" "}
              ~{Math.ceil(scriptText.split(/\s+/).filter(Boolean).length / 150)}{" "}
              min
            </p>
          </div>

          {/* Voice Selection */}
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-3">
              {tab === "voiceover" ? "ElevenLabs Voice" : "D-ID Voice"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(tab === "voiceover" ? ELEVENLABS_VOICES : DID_VOICES).map(
                (v) => {
                  const selected =
                    tab === "voiceover"
                      ? selectedVoice === v.id
                      : selectedDIDVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() =>
                        tab === "voiceover"
                          ? setSelectedVoice(v.id)
                          : setSelectedDIDVoice(v.id)
                      }
                      className={`px-3 py-2.5 rounded-xl text-left transition-all ${
                        selected
                          ? "bg-forge-600/15 border border-forge-600/30"
                          : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          selected ? "text-forge-400" : "text-slate-300"
                        }`}
                      >
                        {v.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{v.desc}</p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={tab === "voiceover" ? handleVoiceover : handleTalkingHead}
            disabled={loading}
            className="w-full py-3.5 rounded-xl forge-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tab === "voiceover"
                  ? "Generating voiceover..."
                  : "Creating talking head video..."}
              </>
            ) : (
              <>
                {tab === "voiceover" ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {tab === "voiceover"
                  ? "Generate Voiceover"
                  : "Create Talking Head Video"}
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Audio Player (for voiceover result) */}
          {audioUrl && (
            <div className="glass-card rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-xl forge-gradient flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Voiceover Ready
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {ELEVENLABS_VOICES.find((v) => v.id === selectedVoice)
                      ?.name || "Unknown"}{" "}
                    • {scriptText.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
                <a
                  href={audioUrl}
                  download={`pushforge-voiceover-${Date.now()}.mp3`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download MP3
                </a>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Right: Job History */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Jobs
          </h3>
          {state.videoJobs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Generated videos and voiceovers will appear here
              </p>
            </div>
          ) : (
            state.videoJobs.slice(0, 20).map((job) => {
              const config = STATUS_CONFIG[job.status];
              const Icon = config.icon;
              return (
                <div
                  key={job.id}
                  className="glass-card rounded-xl p-4 animate-slide-up"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job.type === "voiceover" ? (
                        <Mic className="w-3.5 h-3.5 text-forge-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span className="text-[10px] font-medium text-slate-300">
                        {job.type === "voiceover"
                          ? "Voiceover"
                          : "Talking Head"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={`w-3 h-3 ${config.color} ${
                          job.status === "processing" ? "animate-spin" : ""
                        }`}
                      />
                      <span className={`text-[10px] ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">
                    {job.scriptText}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {job.status === "completed" && job.resultUrl && (
                        <a
                          href={job.resultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-900/30 transition-all"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() =>
                          dispatch({ type: "DELETE_VIDEO_JOB", id: job.id })
                        }
                        className="p-1 rounded-lg bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
