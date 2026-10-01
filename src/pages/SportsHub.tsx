import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import {
  Trophy,
  Activity,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  ChevronRight,
  TrendingUp,
  Percent,
  Key,
  Flame,
  Zap,
  Search,
  Users,
  BarChart3,
  Target,
  ShieldCheck,
  MessageSquare,
  Plus,
  Check,
  Share2,
  Bookmark,
  Radio,
  Info,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  BookmarkCheck,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportsHubSkeleton } from "@/components/DashboardSkeletons";
import { MatchDetailModal, DetailedMatch } from "@/components/sports/MatchDetailModal";
import { StadiumAudioPlayer } from "@/components/sports/StadiumAudioPlayer";
import { LiveScoreboardTicker } from "@/components/sports/LiveScoreboardTicker";
import { AthleteSpotlight } from "@/components/sports/AthleteSpotlight";
import { LiveScoreboard } from "@/components/sports/LiveScoreboard";

interface UpcomingFixture {
  id: string;
  league: string;
  date: string;
  match: string;
  stadium: string;
  aiInsight: string;
  odds?: { teamA: string; teamB: string; draw?: string };
}

interface Standing {
  rank: number;
  team: string;
  played: number;
  won: number;
  points: number;
  form?: string[];
}

const LEAGUES = [
  { id: "All", name: "All Sports", emoji: "🏆" },
  { id: "Football", name: "Football / Soccer", emoji: "⚽" },
  { id: "Basketball", name: "Basketball / NBA", emoji: "🏀" },
  { id: "Cricket", name: "Cricket", emoji: "🏏" },
  { id: "Formula 1", name: "Formula 1", emoji: "🏎️" },
  { id: "Tennis", name: "Tennis", emoji: "🎾" },
  { id: "NFL", name: "American Football", emoji: "🏈" },
];

export default function SportsHub() {
  const { toast } = useToast();
  const { preferences } = useAppStore();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("query") || searchParams.get("sport") || "";

  const [selectedSport, setSelectedSport] = useState(() => {
    const q = urlQuery.toLowerCase();
    if (q.includes("cricket") || q.includes("ipl")) return "Cricket";
    if (q.includes("football") || q.includes("soccer") || q.includes("champions league") || q.includes("premier league")) return "Football";
    if (q.includes("nba") || q.includes("basketball")) return "Basketball";
    if (q.includes("f1") || q.includes("formula")) return "Formula 1";
    if (q.includes("tennis")) return "Tennis";
    if (q.includes("nfl")) return "NFL";
    return "All";
  });

  useEffect(() => {
    if (urlQuery) {
      const q = urlQuery.toLowerCase();
      if (q.includes("cricket") || q.includes("ipl")) setSelectedSport("Cricket");
      else if (q.includes("football") || q.includes("soccer") || q.includes("champions league")) setSelectedSport("Football");
      else if (q.includes("nba") || q.includes("basketball")) setSelectedSport("Basketball");
      else if (q.includes("f1") || q.includes("formula")) setSelectedSport("Formula 1");
      else if (q.includes("tennis")) setSelectedSport("Tennis");
    }
  }, [urlQuery]);
  const [activeTab, setActiveTab] = useState<
    "live-stream" | "athletes" | "live" | "fixtures" | "standings" | "watchlist"
  >("live-stream");
  const [liveMatches, setLiveMatches] = useState<DetailedMatch[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingFixture[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Match Modal State
  const [selectedMatchModal, setSelectedMatchModal] = useState<DetailedMatch | null>(null);

  // Watchlist State
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_sports_watchlist");
      return saved ? JSON.parse(saved) : ["match-101", "match-103"];
    } catch {
      return ["match-101", "match-103"];
    }
  });

  const saveWatchlist = (ids: string[]) => {
    setWatchlistIds(ids);
    try {
      localStorage.setItem("knowdeep_sports_watchlist", JSON.stringify(ids));
    } catch {
      // Ignore
    }
  };

  const handleToggleWatchlist = (match: DetailedMatch) => {
    const isSaved = watchlistIds.includes(match.id);
    if (isSaved) {
      const updated = watchlistIds.filter((id) => id !== match.id);
      saveWatchlist(updated);
      toast({ title: "Removed from Watchlist", description: `${match.teamA.name} vs ${match.teamB.name}` });
    } else {
      const updated = [...watchlistIds, match.id];
      saveWatchlist(updated);
      toast({ title: "Added to Sports Watchlist", description: `Pinned match alerts for ${match.teamA.name} vs ${match.teamB.name}` });
    }
  };

  const fetchSportsData = useCallback(async (sport: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sports-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, apiKey: preferences.sportsApiKey }),
      });
      const data = await res.json();
      if (data.liveMatches && data.liveMatches.length > 0) {
        setLiveMatches(
          data.liveMatches.map((m: Partial<DetailedMatch>) => ({
            ...m,
            id: m.id || `match-${Math.random()}`,
            league: m.league || "Championship",
            status: m.status || "LIVE",
            teamA: m.teamA || { name: "Team 1", score: 0, logo: "⚽" },
            teamB: m.teamB || { name: "Team 2", score: 0, logo: "⚽" },
            venue: m.venue || "Stadium",
            winProbabilityA: m.winProbabilityA || Math.floor(Math.random() * 30 + 50),
            winProbabilityB: m.winProbabilityB || 100 - (m.winProbabilityA || 60),
            aiPrediction: m.aiPrediction || "High intensity match with transition dominance.",
            odds: m.odds || { teamA: "1.80", teamB: "3.20", draw: "3.40", valueBet: "Match Over 2.5 Goals" },
          }))
        );
      } else {
        setLiveMatches(getDefaultLiveMatches());
      }
      setUpcoming(data.upcoming || getDefaultUpcoming());
      setStandings(data.standings || getDefaultStandings());
    } catch {
      setLiveMatches(getDefaultLiveMatches());
      setUpcoming(getDefaultUpcoming());
      setStandings(getDefaultStandings());
    } finally {
      setIsLoading(false);
    }
  }, [preferences.sportsApiKey]);

  useEffect(() => {
    fetchSportsData(selectedSport);
  }, [selectedSport, fetchSportsData]);

  useEffect(() => {
    const handleKeyUpdate = () => {
      fetchSportsData(selectedSport);
    };
    window.addEventListener("knowdeep_api_keys_updated", handleKeyUpdate);
    return () => window.removeEventListener("knowdeep_api_keys_updated", handleKeyUpdate);
  }, [selectedSport, fetchSportsData]);

  const getDefaultLiveMatches = (): DetailedMatch[] => [
    {
      id: "match-101",
      league: "Premier League",
      status: "LIVE 76'",
      teamA: { name: "Manchester City", score: 2, logo: "⚽", primaryColor: "#6CABDD" },
      teamB: { name: "Arsenal", score: 1, logo: "⚽", primaryColor: "#EF0107" },
      venue: "Etihad Stadium, Manchester",
      spectators: "53,400",
      winProbabilityA: 72,
      winProbabilityB: 28,
      aiPrediction: "Man City maintains 65% possession with high press in final third; projected victory margin +1 goal.",
      odds: { teamA: "1.75", teamB: "3.80", draw: "3.50", valueBet: "Man City Over 1.5 Goals" },
      stats: {
        possessionA: 64, possessionB: 36,
        shotsA: 14, shotsB: 7,
        shotsOnTargetA: 6, shotsOnTargetB: 2,
        xGA: 2.1, xGB: 0.8,
        cornersA: 7, cornersB: 3,
        foulsA: 8, foulsB: 12,
      },
      timeline: [
        { minute: "74'", type: "goal", title: "GOAL! Haaland", desc: "Haaland header into top corner off Kevin De Bruyne inswinging corner." },
        { minute: "62'", type: "substitution", title: "Substitution - Arsenal", desc: "Trossard replaces Martinelli to reinforce left wing width." },
        { minute: "51'", type: "yellow_card", title: "Yellow Card - Rice", desc: "Declan Rice cautioned for late tactical challenge in central midfield." },
        { minute: "38'", type: "goal", title: "GOAL! Saka", desc: "Bukayo Saka curls left-footed shot into far post from edge of penalty box." },
        { minute: "18'", type: "goal", title: "GOAL! Foden", desc: "Phil Foden slots low shot past Raya after quick transition play." }
      ],
      lineups: {
        formationA: "4-3-3",
        formationB: "4-2-3-1",
        teamA: ["Ederson (GK)", "Walker", "Dias", "Akanji", "Gvardiol", "Rodri", "De Bruyne (C)", "Foden", "Bernardo", "Grealish", "Haaland"],
        teamB: ["Raya (GK)", "White", "Saliba", "Gabriel", "Timber", "Rice", "Partey", "Odegaard (C)", "Saka", "Martinelli", "Havertz"],
      },
      starPlayers: [
        { name: "Erling Haaland", stat: "1 Goal, 4 Shots, 14 Fantasy Pts" },
        { name: "Bukayo Saka", stat: "1 Goal, 3 Key Passes, 12 Fantasy Pts" }
      ],
      h2h: [
        { date: "Oct 2025", match: "Arsenal 1 - 0 Man City", winner: "Arsenal" },
        { date: "Mar 2025", match: "Man City 0 - 0 Arsenal", winner: "Draw" },
        { date: "Oct 2024", match: "Arsenal 1 - 2 Man City", winner: "Man City" }
      ]
    },
    {
      id: "match-102",
      league: "NBA Regular Season",
      status: "Q4 02:18",
      teamA: { name: "Golden State Warriors", score: 108, logo: "🏀", primaryColor: "#1D428A" },
      teamB: { name: "LA Lakers", score: 105, logo: "🏀", primaryColor: "#552583" },
      venue: "Chase Center, San Francisco",
      spectators: "18,064",
      winProbabilityA: 68,
      winProbabilityB: 32,
      aiPrediction: "Clutch perimeter conversion gives Warriors late edge; Curry 7-11 from 3PT range.",
      odds: { teamA: "1.62", teamB: "2.35", draw: "N/A", valueBet: "Warriors -3.5 Spread" },
      stats: {
        possessionA: 52, possessionB: 48,
        shotsA: 42, shotsB: 39,
        shotsOnTargetA: 18, shotsOnTargetB: 14,
        xGA: 112, xGB: 104,
        cornersA: 0, cornersB: 0,
        foulsA: 14, foulsB: 16,
      },
      timeline: [
        { minute: "Q4 02:45", type: "three_pointer", title: "3-Pointer Stephen Curry", desc: "Curry stepback 3-pt jumper from 28 feet over Anthony Davis." },
        { minute: "Q4 04:10", type: "dunk", title: "Dunk LeBron James", desc: "LeBron James driving contest slam in transition off turnover." },
        { minute: "Q4 06:30", type: "foul", title: "Technical Foul - Green", desc: "Draymond Green called for arguing foul call with referee." }
      ],
      lineups: {
        formationA: "Small Ball Pace",
        formationB: "Inside Power",
        teamA: ["S. Curry (PG)", "B. Hield (SG)", "A. Wiggins (SF)", "J. Kuminga (PF)", "D. Green (C)"],
        teamB: ["D. Russell (PG)", "A. Reaves (SG)", "L. James (SF)", "R. Hachimura (PF)", "A. Davis (C)"],
      },
      starPlayers: [
        { name: "Stephen Curry", stat: "34 Pts, 7 3PM, 8 Ast, 28 Fantasy Pts" },
        { name: "LeBron James", stat: "28 Pts, 11 Reb, 9 Ast, 26 Fantasy Pts" }
      ],
      h2h: [
        { date: "Jan 2026", match: "Lakers 114 - 120 Warriors", winner: "Warriors" },
        { date: "Dec 2025", match: "Warriors 101 - 109 Lakers", winner: "Lakers" }
      ]
    },
    {
      id: "match-103",
      league: "Cricket - ICC World Trophy",
      status: "LIVE 38.4 Overs",
      teamA: { name: "India", score: "284/4", logo: "🏏", primaryColor: "#004B87" },
      teamB: { name: "Australia", score: "—", logo: "🏏", primaryColor: "#FFD100" },
      venue: "Wankhede Stadium, Mumbai",
      spectators: "33,000",
      winProbabilityA: 82,
      winProbabilityB: 18,
      aiPrediction: "Run rate 7.41 rpo projects 360+ total; pitch offering dry spin grip for second innings.",
      odds: { teamA: "1.40", teamB: "2.90", draw: "N/A", valueBet: "India Total Overs Over 350" },
      stats: {
        possessionA: 60, possessionB: 40,
        shotsA: 32, shotsB: 0,
        shotsOnTargetA: 28, shotsOnTargetB: 0,
        xGA: 360, xGB: 290,
        cornersA: 0, cornersB: 0,
        foulsA: 0, foulsB: 0,
      },
      timeline: [
        { minute: "38.2 Ov", type: "six", title: "SIX! Virat Kohli", desc: "Kohli lofts Zampa over long-on for a massive 88m six." },
        { minute: "35.1 Ov", type: "fifty", title: "Half-Century - Shubman Gill", desc: "Gill reaches 50 off 42 balls with crisp cover drive." },
        { minute: "28.4 Ov", type: "wicket", title: "WICKET! Rohit Sharma 84", desc: "Rohit caught at deep midwicket off Cummins bowling." }
      ],
      lineups: {
        formationA: "Bat First",
        formationB: "Field First",
        teamA: ["R. Sharma (C)", "S. Gill", "V. Kohli", "S. Iyer", "K.L. Rahul (WK)", "H. Pandya", "R. Jadeja", "K. Yadav", "J. Bumrah", "M. Siraj", "M. Shami"],
        teamB: ["T. Head", "D. Warner", "M. Marsh", "S. Smith", "G. Maxwell", "M. Stoinis", "A. Carey (WK)", "P. Cummins (C)", "M. Starc", "A. Zampa", "J. Hazlewood"],
      },
      starPlayers: [
        { name: "Virat Kohli", stat: "92* (74 balls), 8 Fours, 3 Sixes" },
        { name: "Shubman Gill", stat: "64 (52 balls), 6 Fours, 2 Sixes" }
      ],
      h2h: [
        { date: "Nov 2025", match: "India won by 6 wickets", winner: "India" },
        { date: "Oct 2025", match: "Australia won by 21 runs", winner: "Australia" }
      ]
    }
  ];

  const getDefaultUpcoming = (): UpcomingFixture[] => [
    {
      id: "up-101",
      league: "UEFA Champions League Final",
      date: "Tomorrow, 20:00 CET",
      match: "Real Madrid vs Bayern Munich",
      stadium: "Santiago Bernabéu, Madrid",
      aiInsight: "Historical knockout win rate favors Madrid (84%) when playing home leg.",
      odds: { teamA: "2.10", teamB: "3.20", draw: "3.40" }
    },
    {
      id: "up-102",
      league: "Formula 1 - Monaco Grand Prix",
      date: "Sunday, 15:00 Local",
      match: "Qualifying & Race Day",
      stadium: "Circuit de Monaco, Monte Carlo",
      aiInsight: "Pole position converts to victory in 86% of Monaco Grand Prix races.",
      odds: { teamA: "1.90 (Verstappen)", teamB: "3.10 (Leclerc)" }
    }
  ];

  const getDefaultStandings = (): Standing[] => [
    { rank: 1, team: "Real Madrid", played: 29, won: 23, points: 75, form: ["W", "W", "D", "W", "W"] },
    { rank: 2, team: "Barcelona", played: 29, won: 21, points: 69, form: ["W", "W", "W", "L", "W"] },
    { rank: 3, team: "Girona", played: 29, won: 19, points: 62, form: ["L", "W", "D", "W", "L"] },
    { rank: 4, team: "Atlético Madrid", played: 29, won: 18, points: 58, form: ["W", "L", "W", "W", "D"] },
    { rank: 5, team: "Athletic Club", played: 29, won: 16, points: 56, form: ["D", "W", "W", "L", "W"] }
  ];

  const displayedMatches = activeTab === "watchlist"
    ? liveMatches.filter((m) => watchlistIds.includes(m.id))
    : liveMatches;

  return (
    <AppLayout title="Sports Hub">
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top Live Scoreboard Ticker Ribbon */}
        <LiveScoreboardTicker
          matches={liveMatches}
          onSelectMatch={(m) => setSelectedMatchModal(m)}
        />

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col space-y-6">
          {/* Main Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                    <span>Sports Command Center</span>
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live match center, play-by-play telemetry, odds matrix, tactical AI analyst & stadium ambiance audio
                  </p>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Stadium Crowd Audio Player */}
              <StadiumAudioPlayer />

              {/* Watchlist Quick Filter */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab(activeTab === "watchlist" ? "live" : "watchlist")}
                className={`h-8 text-xs rounded-xl gap-1.5 transition-all ${
                  activeTab === "watchlist"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                    : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Watchlist</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono font-bold">
                  {watchlistIds.length}
                </span>
              </Button>

              {/* Sync Scores */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchSportsData(selectedSport)}
                disabled={isLoading}
                className="h-8 text-xs rounded-xl gap-1.5 border-border/70 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                <span>Sync Scores</span>
              </Button>
            </div>
          </div>

          {/* Multi-League Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {LEAGUES.map((l) => {
              const isActive = selectedSport === l.id && activeTab !== "watchlist";
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    if (activeTab === "watchlist") setActiveTab("live");
                    setSelectedSport(l.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <span>{l.emoji}</span>
                  <span>{l.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: "live-stream", label: "Live Scoreboard Stream", icon: Radio, highlight: true },
              { id: "athletes", label: "Athlete Spotlight", icon: Zap, highlight: true },
              { id: "live", label: "Live Matches Grid", icon: Activity },
              { id: "fixtures", label: "Upcoming Fixtures", icon: Calendar },
              { id: "standings", label: "League Standings", icon: Trophy },
              { id: "watchlist", label: `My Watchlist (${watchlistIds.length})`, icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "live-stream" | "athletes" | "live" | "fixtures" | "standings" | "watchlist"
                    )
                  }
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-muted text-foreground border border-border shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? "text-cyan-400"
                        : tab.highlight
                        ? "text-amber-400"
                        : ""
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Live Scoreboard Glass-Morphic Component */}
          {activeTab === "live-stream" && (
            <div className="space-y-6">
              <LiveScoreboard
                initialMatchQuery={
                  selectedSport === "Cricket"
                    ? "India vs West Indies live cricket match"
                    : selectedSport === "Football"
                    ? "Real Madrid vs Barcelona live soccer match"
                    : selectedSport === "Basketball"
                    ? "Warriors vs Lakers live NBA basketball match"
                    : "India vs West Indies live cricket match"
                }
                initialSport={selectedSport}
              />
            </div>
          )}

          {/* Tab 2: Athlete Spotlight Component */}
          {activeTab === "athletes" && (
            <div className="space-y-6">
              <AthleteSpotlight />
            </div>
          )}

          {/* Main Layout Grid (Content + Right Intelligence Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Content Area */}
            <div className="lg:col-span-8 xl:col-span-8.5 space-y-6">
              {isLoading ? (
                <SportsHubSkeleton />
              ) : (
                <>
                  {/* 1. Live Matches Tab */}
                  {(activeTab === "live" || activeTab === "watchlist") && (
                    <div className="space-y-4">
                      {displayedMatches.length === 0 ? (
                        <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-3">
                          <Trophy className="w-8 h-8 text-cyan-400 mx-auto" />
                          <h3 className="text-base font-bold text-foreground">No Pinned Matches</h3>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Click the bookmark icon on any live match card to pin it to your private sports watchlist.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setActiveTab("live")}
                            className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold"
                          >
                            Explore Live Matches
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {displayedMatches.map((m) => {
                            const probA = m.winProbabilityA || 64;
                            const probB = m.winProbabilityB || 100 - probA;
                            const isSaved = watchlistIds.includes(m.id);

                            return (
                              <motion.div
                                key={m.id}
                                whileHover={{ y: -3 }}
                                className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                                onClick={() => setSelectedMatchModal(m)}
                              >
                                {/* Top League & Pulsar */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {m.league}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                      {m.status}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleWatchlist(m);
                                      }}
                                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                      title={isSaved ? "Remove Watchlist" : "Add Watchlist"}
                                    >
                                      {isSaved ? (
                                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                      ) : (
                                        <Bookmark className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Teams & Scoreboard */}
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg sm:text-xl">{m.teamA.logo}</span>
                                      <span className="text-sm font-bold text-foreground">{m.teamA.name}</span>
                                    </div>
                                    <span className="text-2xl font-mono font-black text-cyan-400">{m.teamA.score}</span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg sm:text-xl">{m.teamB.logo}</span>
                                      <span className="text-sm font-bold text-foreground">{m.teamB.name}</span>
                                    </div>
                                    <span className="text-2xl font-mono font-black text-cyan-400">{m.teamB.score}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                                    <span className="truncate max-w-[200px]">📍 {m.venue}</span>
                                    {m.spectators && <span>👥 {m.spectators}</span>}
                                  </div>
                                </div>

                                {/* Win Probability Progress Bar */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] font-semibold">
                                    <span className="text-cyan-400 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-cyan-400" /> Win Probability
                                    </span>
                                    <span className="text-foreground font-mono font-bold">
                                      {probA}% vs {probB}%
                                    </span>
                                  </div>

                                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                                    <div
                                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                                      style={{ width: `${probA}%` }}
                                    />
                                    <div
                                      className="bg-slate-700 h-full transition-all duration-500"
                                      style={{ width: `${probB}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Odds & Value Bet */}
                                {m.odds && (
                                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                      Odds: <span className="font-mono text-foreground font-bold">{m.odds.teamA}</span> / <span className="font-mono text-foreground font-bold">{m.odds.teamB}</span>
                                    </span>
                                    {m.odds.valueBet && (
                                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        Value: {m.odds.valueBet}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Trigger Match Command Center */}
                                <div className="pt-2 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                                  <span className="flex items-center gap-1">
                                    <span>Open Match Command Center</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Upcoming Fixtures Tab */}
                  {activeTab === "fixtures" && (
                    <div className="space-y-3">
                      {upcoming.map((u) => (
                        <div
                          key={u.id}
                          className="p-5 rounded-3xl bg-card border border-border/60 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                              <span>{u.league}</span>
                              <span>•</span>
                              <span className="text-muted-foreground">{u.date}</span>
                            </div>
                            <h3 className="text-base font-bold text-foreground">{u.match}</h3>
                            <p className="text-xs text-muted-foreground">🏟️ {u.stadium}</p>
                          </div>

                          <div className="sm:max-w-xs p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1">
                            <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Scouting Insight
                            </span>
                            <p className="leading-relaxed text-[11px]">{u.aiInsight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Standings Table Tab */}
                  {activeTab === "standings" && (
                    <div className="rounded-3xl bg-card border border-border/60 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                          <tr>
                            <th className="py-3.5 px-4"># Rank</th>
                            <th className="py-3.5 px-4">Club / Team</th>
                            <th className="py-3.5 px-4">Played</th>
                            <th className="py-3.5 px-4">Won</th>
                            <th className="py-3.5 px-4">Form</th>
                            <th className="py-3.5 px-4 text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-medium">
                          {standings.map((s) => (
                            <tr key={s.rank} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-foreground">#{s.rank}</td>
                              <td className="py-3.5 px-4 font-bold text-foreground">{s.team}</td>
                              <td className="py-3.5 px-4 text-muted-foreground">{s.played}</td>
                              <td className="py-3.5 px-4 text-muted-foreground">{s.won}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1">
                                  {s.form ? (
                                    s.form.map((f, fIdx) => (
                                      <span
                                        key={fIdx}
                                        className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                                          f === "W"
                                            ? "bg-emerald-600"
                                            : f === "L"
                                            ? "bg-rose-600"
                                            : "bg-slate-600"
                                        }`}
                                      >
                                        {f}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-black text-cyan-400 text-sm">
                                {s.points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Intelligence Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3.5 space-y-5">
              {/* Star Performers Spotlight */}
              <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Star Performers & Fantasy
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { name: "Erling Haaland", team: "Man City", stat: "1 Goal, 4 Shots, 14 Fantasy Pts", sport: "⚽ Football" },
                    { name: "Stephen Curry", team: "Warriors", stat: "34 Pts, 7 3PM, 8 Ast, 28 Pts", sport: "🏀 Basketball" },
                    { name: "Virat Kohli", team: "India", stat: "92* (74b), 8x4, 3x6, 32 Pts", sport: "🏏 Cricket" },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-foreground">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.sport}</span>
                      </div>
                      <p className="text-[11px] text-cyan-400 font-mono font-semibold">{p.stat}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tactical Analyst Quick Prompt Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Ask AI Tactical Analyst</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click any live match card to open the Match Command Center and ask deep tactical questions regarding team formations, player matchups, or odds movements!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Match Command Center Inspector Modal */}
        <AnimatePresence>
          {selectedMatchModal && (
            <MatchDetailModal
              match={selectedMatchModal}
              onClose={() => setSelectedMatchModal(null)}
              isBookmarked={watchlistIds.includes(selectedMatchModal.id)}
              onToggleBookmark={handleToggleWatchlist}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
