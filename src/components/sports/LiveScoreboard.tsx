import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Activity,
  Flame,
  Search,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  Trophy,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export interface PlayByPlayEvent {
  id: string;
  timeOrOver: string;
  eventType: "goal" | "wicket" | "six" | "three_pointer" | "card" | "boundary" | "general";
  title: string;
  commentaryText: string;
}

export interface LiveScoreData {
  matchTitle: string;
  sport: string;
  status: string;
  currentScore: string;
  momentum: { teamA: number; teamB: number };
  winProbA: number;
  winProbB: number;
  runRateOrPace: string;
  activePlayers: Array<{ name: string; stat: string }>;
  playByPlay: PlayByPlayEvent[];
}

interface LiveScoreboardProps {
  initialMatchQuery?: string;
  initialSport?: string;
}

export function LiveScoreboard({
  initialMatchQuery = "India vs West Indies live cricket match",
  initialSport = "Cricket",
}: LiveScoreboardProps) {
  const { toast } = useToast();
  const { speak, stop, isSpeaking, isLoadingAudio } = useSpeechSynthesis();

  const [matchQuery, setMatchQuery] = useState(initialMatchQuery);
  const [liveData, setLiveData] = useState<LiveScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>("all");

  const fetchLivePlayByPlay = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sports-play-by-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchQuery: query, sport: initialSport }),
      });
      const data = await res.json();
      if (data && data.playByPlay) {
        setLiveData(data);
      }
    } catch {
      toast({
        title: "Live Stream Sync Error",
        description: "Could not fetch latest live play-by-play data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePlayByPlay(matchQuery);
  }, []);

  // Periodic Auto-Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLivePlayByPlay(matchQuery);
    }, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [autoRefresh, matchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchQuery.trim()) return;
    fetchLivePlayByPlay(matchQuery.trim());
  };

  const handleReadCommentaryAloud = (evt: PlayByPlayEvent) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(`${evt.title}. ${evt.commentaryText}`, undefined, 1.0, evt.id, evt.title);
      toast({
        title: "Audio Commentary",
        description: `Narrating: ${evt.title}`,
      });
    }
  };

  const filteredPlayByPlay = (liveData?.playByPlay || []).filter((evt) => {
    if (eventFilter === "all") return true;
    if (eventFilter === "key") return ["six", "wicket", "goal", "three_pointer", "card"].includes(evt.eventType);
    if (eventFilter === "boundary") return ["boundary", "six", "three_pointer"].includes(evt.eventType);
    return true;
  });

  const getEventBadgeClass = (type: PlayByPlayEvent["eventType"]) => {
    switch (type) {
      case "six":
      case "goal":
      case "three_pointer":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "wicket":
      case "card":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "boundary":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
  };

  return (
    <div className="w-full relative rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-slate-100 overflow-hidden space-y-6">
      {/* Background Neon Accent Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Glass Title & Live Search Form */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-rose-400 uppercase">
                GLASS-MORPHIC LIVE STREAM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                BALL-BY-BALL
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Real-Time Match Scoreboard & Commentary
            </h2>
          </div>
        </div>

        {/* Live Match Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={matchQuery}
              onChange={(e) => setMatchQuery(e.target.value)}
              placeholder="Search ongoing match (e.g. India vs West Indies)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-rose-600/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Live"}
          </Button>
        </form>
      </div>

      {/* Main Score & Telemetry Banner */}
      {isLoading && !liveData ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Connecting to Live Sports Telemetry Engine...</p>
        </div>
      ) : liveData ? (
        <div className="relative z-10 space-y-6">
          {/* Glass Match Banner */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-slate-400">
                <span className="text-cyan-400 uppercase font-mono">{liveData.sport}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-400 font-mono font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {liveData.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {liveData.currentScore}
              </h1>

              <p className="text-xs font-mono font-semibold text-amber-400">
                ⚡ Run Rate / Tempo: {liveData.runRateOrPace}
              </p>
            </div>

            {/* Active Players Widget */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {liveData.activePlayers?.map((pl, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-0.5 text-xs text-center"
                >
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{pl.name}</span>
                  </div>
                  <div className="font-mono text-cyan-300 font-bold text-[11px]">{pl.stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Win Probability & Team Momentum Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Win Probability Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Win Probability
                </span>
                <span className="font-mono text-white">
                  {liveData.winProbA || 80}% vs {liveData.winProbB || 20}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-700"
                  style={{ width: `${liveData.winProbA || 80}%` }}
                />
                <div
                  className="bg-rose-500/80 h-full transition-all duration-700"
                  style={{ width: `${liveData.winProbB || 20}%` }}
                />
              </div>
            </div>

            {/* Match Momentum Shift */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Match Momentum Index
                </span>
                <span className="font-mono text-amber-300">
                  {liveData.momentum?.teamA || 75}% Attack Intensity
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-700"
                  style={{ width: `${liveData.momentum?.teamA || 75}%` }}
                />
              </div>
            </div>
          </div>

          {/* Play-By-Play Live Event Timeline Feed */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Live Play-by-Play Commentary Stream
                </h3>
              </div>

              {/* Action Controls & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Event Filters */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setEventFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      eventFilter === "all" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
                    }`}
                  >
                    All Plays
                  </button>
                  <button
                    onClick={() => setEventFilter("key")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      eventFilter === "key" ? "bg-rose-500/20 text-rose-300" : "text-slate-400"
                    }`}
                  >
                    Wickets / Goals
                  </button>
                  <button
                    onClick={() => setEventFilter("boundary")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      eventFilter === "boundary" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"
                    }`}
                  >
                    Boundaries / 3PT
                  </button>
                </div>

                {/* Auto Refresh Toggle */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`h-8 text-xs rounded-xl gap-1 border-slate-800 ${
                    autoRefresh ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400"
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                  <span>{autoRefresh ? "Auto-Sync ON" : "Auto-Sync OFF"}</span>
                </Button>
              </div>
            </div>

            {/* Play-by-Play Event Cards */}
            <div className="space-y-3">
              {filteredPlayByPlay.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No events match the selected event filter.
                </p>
              ) : (
                filteredPlayByPlay.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs font-bold text-slate-300 shrink-0">
                        {evt.timeOrOver}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${getEventBadgeClass(
                              evt.eventType
                            )}`}
                          >
                            {evt.eventType}
                          </span>
                          <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {evt.commentaryText}
                        </p>
                      </div>
                    </div>

                    {/* Read Aloud Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReadCommentaryAloud(evt)}
                      disabled={isLoadingAudio}
                      className="h-8 text-xs rounded-xl gap-1.5 text-slate-400 hover:text-white shrink-0 self-end sm:self-auto"
                      title="Listen to Live Commentary"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Read Aloud</span>
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
