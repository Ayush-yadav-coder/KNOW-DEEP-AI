import React from "react";
import { motion } from "framer-motion";
import { Radio, ChevronRight, Zap, Trophy } from "lucide-react";
import { DetailedMatch } from "./MatchDetailModal";

interface LiveScoreboardTickerProps {
  matches: DetailedMatch[];
  onSelectMatch: (match: DetailedMatch) => void;
}

export function LiveScoreboardTicker({ matches, onSelectMatch }: LiveScoreboardTickerProps) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="w-full bg-slate-950/80 border-y border-slate-800/80 backdrop-blur-md py-2 px-4 overflow-hidden relative">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-800">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-black tracking-wider text-rose-400 uppercase flex items-center gap-1">
            <Radio className="w-3 h-3 text-rose-500" /> LIVE SCORES
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          {matches.map((m) => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectMatch(m)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-left shrink-0 transition-all cursor-pointer group"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {m.league.split(" ")[0]}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="flex items-center gap-1">
                  <span>{m.teamA.logo}</span>
                  <span className="truncate max-w-[80px]">{m.teamA.name.split(" ")[0]}</span>
                  <span className="font-mono text-cyan-400">{m.teamA.score}</span>
                </span>
                <span className="text-slate-500 text-[10px]">-</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-cyan-400">{m.teamB.score}</span>
                  <span className="truncate max-w-[80px]">{m.teamB.name.split(" ")[0]}</span>
                  <span>{m.teamB.logo}</span>
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                {m.status}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
