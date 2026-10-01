import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Flame,
  Activity,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface ChatSportsCardProps {
  query?: string;
  onContinueInChat?: () => void;
}

export const ChatSportsCard: React.FC<ChatSportsCardProps> = ({
  query = "Live Matches & Standings",
  onContinueInChat,
}) => {
  const navigate = useNavigate();

  const liveMatches = [
    {
      teamA: "Arsenal",
      teamB: "Bayern Munich",
      scoreA: 2,
      scoreB: 1,
      status: "78'",
      league: "Champions League",
      isLive: true,
    },
    {
      teamA: "India",
      teamB: "Australia",
      scoreA: "184/3 (18.2)",
      scoreB: "180/7 (20)",
      status: "IND won by 7 wkts",
      league: "T20 Series",
      isLive: false,
    },
  ];

  const handleOpenSportsHub = () => {
    navigate(`/sports?query=${encodeURIComponent(query)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="my-3 w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background/80 to-teal-500/5 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                Sports Arena Hub
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Scores
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {query}
            </p>
          </div>
        </div>
      </div>

      {/* Live Match Cards */}
      <div className="space-y-2 my-3.5 relative z-10">
        {liveMatches.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-card/60 border border-border/60 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span className="font-medium text-emerald-500">{m.league}</span>
              <span className={m.isLive ? "text-rose-500 font-bold animate-pulse" : "text-muted-foreground"}>
                {m.status}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold text-xs sm:text-sm text-foreground">
              <div className="flex items-center gap-2">
                <span>{m.teamA}</span>
                <span className="text-muted-foreground font-normal">vs</span>
                <span>{m.teamB}</span>
              </div>
              <div className="font-bold text-emerald-500">
                {m.scoreA} - {m.scoreB}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dual Option Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/60 relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Dual Option: Instant score ticker or complete arena telemetry</span>
        </div>

        <div className="flex items-center gap-2">
          {onContinueInChat && (
            <button
              onClick={onContinueInChat}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted bg-card/80 border border-border transition-all"
            >
              Continue in Chat
            </button>
          )}

          <button
            onClick={handleOpenSportsHub}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Open Sports Arena</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
