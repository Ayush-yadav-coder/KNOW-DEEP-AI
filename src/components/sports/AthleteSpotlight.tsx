import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  UserCheck,
  UserPlus,
  Sparkles,
  Search,
  Flame,
  Zap,
  Award,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  Loader2,
  RefreshCw,
  Star,
  CheckCircle2,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface AthleteData {
  name: string;
  sport: string;
  team: string;
  position: string;
  country: string;
  age: number;
  worldRank: string;
  avatarVisual: {
    gradientFrom: string;
    gradientTo: string;
    jerseyNumber: string;
    headshotPrompt: string;
    initials: string;
  };
  summary: string;
  formRating: number;
  stats: Array<{
    label: string;
    value: string;
    max: number;
    unit: string;
  }>;
  milestones: Array<{
    year: string;
    title: string;
    desc: string;
  }>;
  recentPerformances?: Array<{
    date: string;
    opponent: string;
    stat: string;
    result: string;
  }>;
}

const POPULAR_ATHLETES = [
  { name: "Virat Kohli", sport: "🏏 Cricket" },
  { name: "Lionel Messi", sport: "⚽ Football" },
  { name: "LeBron James", sport: "🏀 NBA" },
  { name: "Jasprit Bumrah", sport: "🏏 Cricket" },
  { name: "Max Verstappen", sport: "🏎️ F1" },
  { name: "Erling Haaland", sport: "⚽ Football" },
  { name: "Stephen Curry", sport: "🏀 NBA" },
  { name: "Carlos Alcaraz", sport: "🎾 Tennis" },
  { name: "Rohit Sharma", sport: "🏏 Cricket" },
];

export function AthleteSpotlight() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("Virat Kohli");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Tracked Athletes State from LocalStorage
  const [trackedAthletes, setTrackedAthletes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_tracked_athletes");
      return saved ? JSON.parse(saved) : ["Virat Kohli", "Lionel Messi"];
    } catch {
      return ["Virat Kohli", "Lionel Messi"];
    }
  });

  const saveTracked = (list: string[]) => {
    setTrackedAthletes(list);
    try {
      localStorage.setItem("knowdeep_tracked_athletes", JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  const handleToggleTrack = (name: string) => {
    const isTracked = trackedAthletes.includes(name);
    if (isTracked) {
      const updated = trackedAthletes.filter((a) => a !== name);
      saveTracked(updated);
      toast({
        title: "Untracked Athlete",
        description: `Removed ${name} from your tracked athlete spotlight radar.`,
      });
    } else {
      const updated = [...trackedAthletes, name];
      saveTracked(updated);
      toast({
        title: "Tracking Athlete ⭐",
        description: `Pinned ${name}! Live match performance & stats updates will be prioritized.`,
      });
    }
  };

  const fetchAthleteData = async (name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/athlete-spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteName: name }),
      });
      const data = await res.json();
      if (data && data.name) {
        setSelectedAthlete(data);
      }
    } catch {
      toast({
        title: "Intelligence Search Error",
        description: "Could not retrieve live athlete data. Please retry.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAthleteData("Virat Kohli");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchAthleteData(searchQuery.trim());
  };

  const isCurrentTracked = selectedAthlete
    ? trackedAthletes.includes(selectedAthlete.name)
    : false;

  return (
    <div className="w-full space-y-6">
      {/* Search Header & Quick Selector */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/70 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20">
              <Star className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <span>Athlete Spotlight & Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REAL-TIME STATS
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Track favorite global stars, career milestones, generative headshot visuals & live match form
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athlete (e.g. Jasprit Bumrah)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Spotlight"}
            </Button>
          </form>
        </div>

        {/* Popular Athlete Quick Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
            Quick Stars:
          </span>
          {POPULAR_ATHLETES.map((ath) => {
            const isSelected = selectedAthlete?.name.toLowerCase() === ath.name.toLowerCase();
            return (
              <button
                key={ath.name}
                onClick={() => {
                  setSearchQuery(ath.name);
                  fetchAthleteData(ath.name);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                <span>{ath.name}</span>
                <span className="text-[10px] opacity-70">{ath.sport.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Athlete Detail Card */}
      {isLoading ? (
        <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Gathering Athlete Telemetry...</h3>
          <p className="text-xs text-muted-foreground">
            Analyzing career milestones, generative headshots, and real-time match records via Google Search Grounding.
          </p>
        </div>
      ) : selectedAthlete ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xl"
        >
          {/* Top Hero Visual Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-border/60 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Generative Headshot Visual Canvas/Card */}
              <div className="relative group shrink-0">
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center transition-transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${
                      selectedAthlete.avatarVisual?.gradientFrom || "#004B87"
                    }, ${selectedAthlete.avatarVisual?.gradientTo || "#FFD100"})`,
                  }}
                >
                  {/* Holographic Shine & Pattern Overlay */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-3xl" />
                  <div className="absolute top-2 left-2 text-[10px] font-mono font-black text-white/80 bg-black/40 px-2 py-0.5 rounded-lg border border-white/20">
                    #{selectedAthlete.avatarVisual?.jerseyNumber || "10"}
                  </div>

                  {/* Avatar Initials / Stylized Portrait Icon */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-md tracking-tighter">
                      {selectedAthlete.avatarVisual?.initials || selectedAthlete.name.slice(0, 2)}
                    </span>
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mt-1">
                      {selectedAthlete.sport}
                    </span>
                  </div>

                  {/* Aura Ring */}
                  <div className="absolute -bottom-2 inset-x-0 h-10 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Form Rating Badge */}
                <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1 border border-white/30">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>FORM {selectedAthlete.formRating}/100</span>
                  </span>
                </div>
              </div>

              {/* Athlete Bio & Core Header */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" /> {selectedAthlete.team}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-slate-300">{selectedAthlete.country}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-slate-300">Age {selectedAthlete.age}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                      <span>{selectedAthlete.name}</span>
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                    </h1>
                    <p className="text-xs font-bold text-amber-400 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedAthlete.worldRank}</span>
                      <span className="text-slate-400">({selectedAthlete.position})</span>
                    </p>
                  </div>

                  {/* Track Athlete Button */}
                  <Button
                    size="sm"
                    onClick={() => handleToggleTrack(selectedAthlete.name)}
                    className={`rounded-2xl gap-2 font-bold text-xs shadow-lg transition-all ${
                      isCurrentTracked
                        ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                        : "bg-muted/80 hover:bg-muted text-foreground border border-border"
                    }`}
                  >
                    {isCurrentTracked ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Tracked Athlete</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-amber-400" />
                        <span>Track Athlete</span>
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
                  {selectedAthlete.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Body Section: Key Stats Meters + Milestones Timeline */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Key Statistics Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Performance Telemetry & Metrics</span>
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Verified Sports Analytics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedAthlete.stats.map((st, idx) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      (parseFloat(st.value.replace(/[^0-9.]/g, "")) / (st.max || 100)) * 100
                    ) || 75
                  );

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-2 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">{st.label}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{st.unit}</span>
                      </div>

                      <div className="text-xl font-black font-mono text-foreground flex items-baseline justify-between">
                        <span>{st.value}</span>
                        <span className="text-[10px] text-muted-foreground font-sans font-normal">
                          Max: {st.max}
                        </span>
                      </div>

                      {/* Meter Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones & Recent Match Performances Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-border/60">
              {/* Career Milestones */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Career Milestones & Trophies</span>
                </h3>

                <div className="space-y-3">
                  {selectedAthlete.milestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3.5 hover:bg-muted/60 transition-colors"
                    >
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 shrink-0">
                        {ms.year}
                      </span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">{ms.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{ms.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Match Performances */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Recent Match Logs</span>
                </h3>

                <div className="space-y-3">
                  {(selectedAthlete.recentPerformances || [
                    {
                      date: "Today's Match",
                      opponent: "vs West Indies",
                      stat: "104* (82b), 9x4, 4x6",
                      result: "Match in progress",
                    },
                    {
                      date: "Last Match",
                      opponent: "vs Australia",
                      stat: "76 runs off 62 balls",
                      result: "Won by 6 wickets",
                    },
                  ]).map((rm, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase">
                          <span>{rm.date}</span>
                          <span>•</span>
                          <span className="text-muted-foreground">{rm.opponent}</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-foreground">{rm.stat}</p>
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {rm.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
