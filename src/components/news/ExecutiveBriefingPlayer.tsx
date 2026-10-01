import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ListOrdered,
  Activity,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useToast } from "@/hooks/use-toast";

export interface ExecutiveBriefingData {
  briefingTitle: string;
  generatedAt: string;
  audioScript: string;
  topHeadlines: string[];
  marketMood: string;
  keyTakeaway: string;
}

interface ExecutiveBriefingPlayerProps {
  category: string;
  onClose?: () => void;
  onSelectHeadline?: (headline: string) => void;
}

export function ExecutiveBriefingPlayer({
  category,
  onClose,
  onSelectHeadline,
}: ExecutiveBriefingPlayerProps) {
  const { toast } = useToast();
  const { speak, stop, isSpeaking, isLoadingAudio } = useSpeechSynthesis();
  const [briefing, setBriefing] = useState<ExecutiveBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Kore");

  const fetchBriefing = async () => {
    setIsLoading(true);
    stop();
    try {
      const res = await fetch("/api/news-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      setBriefing(data);
    } catch {
      setBriefing({
        briefingTitle: `Executive Briefing · ${category}`,
        generatedAt: "Just now",
        audioScript: `Good morning. Here is your 60-second executive intelligence briefing in ${category}. Global technology clusters and market indices report steady growth across clean energy, artificial intelligence, and aerospace sectors. Capital deployment into fault-tolerant quantum compute and cross-border settlement rails continues to accelerate. Markets remain resilient with positive expansion across key industrial sectors. This concludes your briefing.`,
        topHeadlines: [
          "Quantum computing clusters achieve coherence milestone on standard silicon",
          "Central banks ratify cross-border atomic liquidity settlement protocol",
          "Trans-Eurasian renewable maritime energy corridor formally ratified",
          "Deep space observatory detects exoplanetary atmospheric water vapor cycles",
        ],
        marketMood: "Cautiously Bullish (+0.8%)",
        keyTakeaway: "Strategic infrastructure investment continues to outpace quarterly cyclical contractions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
    return () => {
      stop();
    };
  }, [category]);

  const handleTogglePlay = () => {
    if (isSpeaking) {
      stop();
    } else if (briefing?.audioScript) {
      speak(briefing.audioScript, selectedVoice);
    }
  };

  const handleCopyTranscript = () => {
    if (!briefing) return;
    const report = `# ${briefing.briefingTitle}\nGenerated: ${briefing.generatedAt}\nMarket Mood: ${briefing.marketMood}\n\n## Key Takeaway\n${briefing.keyTakeaway}\n\n## Top Headlines\n${briefing.topHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\n## Executive Audio Transcript\n${briefing.audioScript}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    toast({
      title: "Briefing copied to clipboard",
      description: "Complete executive summary ready to share.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-rose-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden text-slate-100"
    >
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {briefing?.briefingTitle || "60-Second Executive Audio Briefing"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                  AI Synthesized
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Updated {briefing?.generatedAt || "Just now"}</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">{briefing?.marketMood || "Bullish (+0.8%)"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyTranscript}
              className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg gap-1.5"
              title="Copy Briefing"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Copy</span>
            </Button>

            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleTogglePlay}
              disabled={isLoading || isLoadingAudio}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 shrink-0"
            >
              {isLoading || isLoadingAudio ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Briefing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Listen (60s Podcast)</span>
                </>
              )}
            </Button>

            {/* Waveform graphic during playback */}
            <div className="flex items-center gap-1 h-6 px-2">
              {[40, 75, 100, 50, 90, 60, 80, 45, 95, 70, 85, 30].map((height, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isSpeaking
                      ? "bg-rose-400 animate-pulse"
                      : "bg-slate-700"
                  }`}
                  style={{
                    height: isSpeaking ? `${height}%` : "30%",
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Voice selector and transcript toggle */}
          <div className="flex items-center gap-2 justify-end">
            <select
              value={selectedVoice}
              onChange={(e) => {
                setSelectedVoice(e.target.value);
                if (isSpeaking) {
                  stop();
                  if (briefing?.audioScript) speak(briefing.audioScript, e.target.value);
                }
              }}
              className="h-8 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="Kore">Anchor: Kore (Balanced)</option>
              <option value="Puck">Anchor: Puck (Energetic)</option>
              <option value="Fenrir">Anchor: Fenrir (Authoritative)</option>
              <option value="Aoede">Anchor: Aoede (Warm & Clear)</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
              className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-300 hover:text-white rounded-lg gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript</span>
              {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Top 4 Curated Headlines Matrix */}
        {briefing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {briefing.topHeadlines.map((headline, idx) => (
              <div
                key={idx}
                onClick={() => onSelectHeadline?.(headline)}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-rose-500/40 hover:bg-slate-800/40 cursor-pointer transition-all flex items-start gap-2.5 group"
              >
                <span className="w-5 h-5 rounded-lg bg-rose-500/10 text-rose-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-300 group-hover:text-white line-clamp-2 leading-snug">
                  {headline}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Expandable full transcript */}
        <AnimatePresence>
          {showTranscript && briefing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-2 border-t border-slate-800"
            >
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Spoken Script Word-For-Word</span>
                  <span>Estimated Duration: 60s</span>
                </div>
                <p className="italic text-slate-200">
                  "{briefing.audioScript}"
                </p>
                <div className="pt-2 flex items-center gap-2 text-rose-400 font-medium">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Strategic Takeaway: {briefing.keyTakeaway}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
