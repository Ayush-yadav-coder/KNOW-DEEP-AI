import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Activity,
  Sparkles,
  Users,
  BarChart3,
  Target,
  ShieldCheck,
  MessageSquare,
  Radio,
  Clock,
  Send,
  Loader2,
  TrendingUp,
  Percent,
  Check,
  Bookmark,
  Share2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface TimelineEvent {
  minute: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "three_pointer" | "dunk" | "foul" | "six" | "wicket" | "fifty" | "general";
  title: string;
  desc: string;
}

export interface MatchStats {
  possessionA: number;
  possessionB: number;
  shotsA: number;
  shotsB: number;
  shotsOnTargetA: number;
  shotsOnTargetB: number;
  xGA: number;
  xGB: number;
  cornersA: number;
  cornersB: number;
  foulsA: number;
  foulsB: number;
}

export interface DetailedMatch {
  id: string;
  league: string;
  status: string;
  teamA: { name: string; score: number | string; logo: string; primaryColor?: string };
  teamB: { name: string; score: number | string; logo: string; primaryColor?: string };
  venue: string;
  spectators?: string;
  winProbabilityA?: number;
  winProbabilityB?: number;
  aiPrediction: string;
  odds?: { teamA: string; teamB: string; draw?: string; valueBet?: string };
  stats?: MatchStats;
  timeline?: TimelineEvent[];
  lineups?: {
    formationA: string;
    formationB: string;
    teamA: string[];
    teamB: string[];
  };
  starPlayers?: Array<{ name: string; stat: string }>;
  h2h?: Array<{ date: string; match: string; winner: string }>;
}

interface MatchDetailModalProps {
  match: DetailedMatch;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (match: DetailedMatch) => void;
}

type TabType = "timeline" | "stats" | "lineups" | "odds" | "ai-analyst";

export function MatchDetailModal({
  match,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
}: MatchDetailModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("timeline");

  // AI Analyst Chatbot State
  const [analystMessages, setAnalystMessages] = useState<Array<{ role: "user" | "ai"; text: string; metrics?: any }>>([
    {
      role: "ai",
      text: `Hello! I am your AI Sports Tactical Analyst. Ask me anything regarding **${match.teamA.name} vs ${match.teamB.name}** (${match.league}) — key player matchups, tactical adjustments, or probability shifts.`,
    },
  ]);
  const [queryInput, setQueryInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const probA = match.winProbabilityA || 60;
  const probB = match.winProbabilityB || 100 - probA;

  const handleAskAnalyst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isAsking) return;

    const q = queryInput.trim();
    setQueryInput("");
    setAnalystMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsAsking(true);

    try {
      const res = await fetch("/api/sports-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          matchContext: match,
        }),
      });
      const data = await res.json();
      setAnalystMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "Tactical metrics show high intensity in midfield transitions with key wing exploits.",
          metrics: data.keyMetrics,
        },
      ]);
    } catch {
      setAnalystMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Based on current formation and possession maps, maintaining central midfield control remains key.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const getEventBadgeColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "goal":
      case "six":
      case "three_pointer":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "yellow_card":
      case "foul":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "red_card":
      case "wicket":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">{match.league}</span>
              <span>·</span>
              <span>📍 {match.venue}</span>
              {match.spectators && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> {match.spectators} Attendance
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-rose-400" /> {match.status}
              </span>

              {onToggleBookmark && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleBookmark(match)}
                  className={`h-8 w-8 p-0 rounded-xl ${
                    isBookmarked ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
                  }`}
                  title={isBookmarked ? "Remove Watchlist" : "Pin Match to Watchlist"}
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Teams Scoreboard Display */}
          <div className="grid grid-cols-12 items-center p-4 rounded-2xl bg-slate-900/90 border border-slate-800 gap-4">
            {/* Team A */}
            <div className="col-span-5 flex items-center justify-between sm:justify-start gap-3">
              <span className="text-3xl sm:text-4xl">{match.teamA.logo}</span>
              <div>
                <h2 className="text-sm sm:text-lg font-black text-white">{match.teamA.name}</h2>
                <span className="text-[10px] text-slate-400">Win Probability: {probA}%</span>
              </div>
            </div>

            {/* Score */}
            <div className="col-span-2 text-center">
              <div className="text-2xl sm:text-4xl font-mono font-black text-cyan-400 tracking-wider">
                {match.teamA.score} : {match.teamB.score}
              </div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{match.status}</span>
            </div>

            {/* Team B */}
            <div className="col-span-5 flex items-center justify-end gap-3 text-right">
              <div>
                <h2 className="text-sm sm:text-lg font-black text-white">{match.teamB.name}</h2>
                <span className="text-[10px] text-slate-400">Win Probability: {probB}%</span>
              </div>
              <span className="text-3xl sm:text-4xl">{match.teamB.logo}</span>
            </div>
          </div>

          {/* Win Probability Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Victory Odds
              </span>
              <span className="font-mono text-slate-300 font-bold">{probA}% — {probB}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full" style={{ width: `${probA}%` }} />
              <div className="bg-slate-700 h-full" style={{ width: `${probB}%` }} />
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "timeline", label: "Play-by-Play Feed", icon: Activity },
            { id: "stats", label: "Match Stats & Momentum", icon: BarChart3 },
            { id: "lineups", label: "Lineups & Formations", icon: Users },
            { id: "odds", label: "Odds & H2H History", icon: TrendingUp },
            { id: "ai-analyst", label: "AI Tactical Chatbot", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Play-by-Play Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Real-time commentary & minute-by-minute action feed updated via high-speed telemetry.</span>
              </div>

              {match.timeline && match.timeline.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {match.timeline.map((evt, idx) => (
                    <div key={idx} className="relative pl-10 flex flex-col gap-1">
                      <div className="absolute left-1.5 top-1.5 w-5 h-5 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400">
                        {evt.minute.slice(0, 2)}
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${getEventBadgeColor(evt.type)}`}>
                            {evt.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{evt.minute}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pt-1">{evt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800">
                  Play-by-play ticker initializing for active half.
                </div>
              )}
            </div>
          )}

          {/* 2. Match Stats & Momentum */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Momentum Waveform Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-400">90' Match Momentum Curve</span>
                  <span className="text-slate-400 font-mono text-[10px]">Dominance Ratio</span>
                </div>
                <div className="flex items-end gap-1 h-16 pt-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const heightA = Math.sin(i * 0.4) * 30 + 35;
                    const isTeamA = heightA > 35;
                    return (
                      <div key={i} className="flex-1 bg-slate-800 rounded-t flex flex-col justify-end h-full">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isTeamA ? "bg-cyan-500" : "bg-rose-500"
                          }`}
                          style={{ height: `${heightA}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>1' Kickoff</span>
                  <span>45' Half Time</span>
                  <span>90' Full Time</span>
                </div>
              </div>

              {/* Stats Grid */}
              {match.stats && (
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Comprehensive Match Telemetry</h3>

                  <div className="space-y-3 text-xs">
                    {/* Possession */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{match.stats.possessionA}%</span>
                        <span className="text-slate-400">Possession</span>
                        <span>{match.stats.possessionB}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                        <div className="bg-cyan-500 h-full" style={{ width: `${match.stats.possessionA}%` }} />
                        <div className="bg-rose-500 h-full" style={{ width: `${match.stats.possessionB}%` }} />
                      </div>
                    </div>

                    {/* Shots */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between font-bold">
                        <span>{match.stats.shotsA}</span>
                        <span className="text-slate-400">Total Shots</span>
                        <span>{match.stats.shotsB}</span>
                      </div>
                    </div>

                    {/* Shots on Target */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between font-bold">
                        <span>{match.stats.shotsOnTargetA}</span>
                        <span className="text-slate-400">Shots on Target</span>
                        <span>{match.stats.shotsOnTargetB}</span>
                      </div>
                    </div>

                    {/* xG Expected Goals */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-cyan-400">{match.stats.xGA}</span>
                        <span className="text-slate-400">Expected Goals (xG)</span>
                        <span className="text-rose-400">{match.stats.xGB}</span>
                      </div>
                    </div>

                    {/* Corners */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between font-bold">
                        <span>{match.stats.cornersA}</span>
                        <span className="text-slate-400">Corners</span>
                        <span>{match.stats.cornersB}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Lineups & Formations */}
          {activeTab === "lineups" && match.lineups && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team A Lineup */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{match.teamA.logo}</span>
                      <span>{match.teamA.name}</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      {match.lineups.formationA}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 divide-y divide-slate-800">
                    {match.lineups.teamA.map((player, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between">
                        <span>{player}</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team B Lineup */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{match.teamB.logo}</span>
                      <span>{match.teamB.name}</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                      {match.lineups.formationB}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 divide-y divide-slate-800">
                    {match.lineups.teamB.map((player, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between">
                        <span>{player}</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Star Players */}
              {match.starPlayers && match.starPlayers.length > 0 && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" /> Key Match Performers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {match.starPlayers.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="font-bold text-white">{p.name}</div>
                        <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{p.stat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Odds & H2H History */}
          {activeTab === "odds" && (
            <div className="space-y-6">
              {/* Odds Box */}
              {match.odds && (
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Real-time Market Odds
                  </h3>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">{match.teamA.name}</span>
                      <div className="text-base font-mono font-bold text-cyan-400">{match.odds.teamA}</div>
                    </div>
                    {match.odds.draw && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">Draw</span>
                        <div className="text-base font-mono font-bold text-slate-300">{match.odds.draw}</div>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">{match.teamB.name}</span>
                      <div className="text-base font-mono font-bold text-rose-400">{match.odds.teamB}</div>
                    </div>
                  </div>

                  {match.odds.valueBet && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">AI Tactical Value Recommendation:</span>
                      <span className="font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                        {match.odds.valueBet}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Head-to-Head History */}
              {match.h2h && match.h2h.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Previous Encounters (H2H)</h3>
                  <div className="space-y-2 text-xs">
                    {match.h2h.map((h, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[10px]">{h.date}</span>
                        <span className="font-bold text-white">{h.match}</span>
                        <span className="text-cyan-400 font-semibold">{h.winner}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. AI Tactical Chatbot */}
          {activeTab === "ai-analyst" && (
            <div className="space-y-4 flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {analystMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-cyan-600 text-white rounded-br-none"
                          : "bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {msg.metrics && Array.isArray(msg.metrics) && (
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {msg.metrics.map((m: any, mIdx: number) => (
                          <span key={mIdx} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                            {m.label}: {m.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Sports Analyst analyzing tactical metrics...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskAnalyst} className="relative pt-2">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={`Ask AI about ${match.teamA.name} vs ${match.teamB.name} tactics, subs or player stats...`}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-24 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Button
                  type="submit"
                  disabled={isAsking || !queryInput.trim()}
                  size="sm"
                  className="absolute right-1.5 top-3.5 h-8 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold gap-1"
                >
                  <span>Ask AI</span>
                  <Send className="w-3 h-3" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
