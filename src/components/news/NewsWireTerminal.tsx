import React, { useState } from "react";
import {
  Terminal,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Play,
  Pause,
  ArrowUpRight,
} from "lucide-react";
import { NewsArticle } from "./ArticleDetailModal";

interface NewsWireTerminalProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  isLoading: boolean;
}

export function NewsWireTerminal({
  articles,
  onSelectArticle,
  isLoading,
}: NewsWireTerminalProps) {
  const [filterText, setFilterText] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      activeCategory === "ALL" || art.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      !filterText ||
      art.title.toLowerCase().includes(filterText.toLowerCase()) ||
      art.source.toLowerCase().includes(filterText.toLowerCase()) ||
      art.summary.toLowerCase().includes(filterText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Top Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-bold text-slate-100 flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            <span>KNOW-DEEP // LIVE-WIRE TERMINAL</span>
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            CONNECTIVITY: 100%
          </span>
        </div>

        {/* Filter input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter wire..."
              className="h-7 w-36 sm:w-48 bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Wire category filter tabs */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
        {["ALL", "AI & Deep Tech", "Financial Markets", "Geopolitics", "Science & Space", "Cyber & Defense"].map(
          (cat) => {
            const isActive = activeCategory === (cat === "ALL" ? "ALL" : cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  isActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                [{cat}]
              </button>
            );
          }
        )}
      </div>

      {/* Wire Rows List */}
      <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>STREAMING GLOBAL INTELLIGENCE WIRE...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>NO WIRE HEADLINES MATCHING CURRENT FILTER</p>
          </div>
        ) : (
          filteredArticles.map((art, idx) => (
            <div
              key={art.id || idx}
              onClick={() => onSelectArticle(art)}
              className="p-3 sm:px-4 sm:py-3 hover:bg-slate-900/80 cursor-pointer transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              {/* Left Column: Timestamp, Source, Headline */}
              <div className="flex items-start sm:items-center gap-3 flex-1 overflow-hidden">
                <span className="text-[11px] text-rose-400 shrink-0 font-bold">
                  {art.timeAgo}
                </span>

                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold shrink-0 border border-slate-700">
                  {art.source}
                </span>

                <span className="text-[11px] text-slate-400 shrink-0 hidden md:inline">
                  [{art.category}]
                </span>

                <h4 className="text-xs text-slate-200 font-medium group-hover:text-rose-300 transition-colors truncate">
                  {art.title}
                </h4>
              </div>

              {/* Right Column: Sentiment, Tickers, Trigger */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {art.sentiment === "Bullish" && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <TrendingUp className="w-3 h-3" /> +BULL
                  </span>
                )}
                {art.sentiment === "Bearish" && (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                    <TrendingDown className="w-3 h-3" /> -BEAR
                  </span>
                )}
                {art.sentiment === "Neutral" && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Minus className="w-3 h-3" /> NEUT
                  </span>
                )}

                {art.relatedTickers && art.relatedTickers[0] && (
                  <span className="text-[10px] text-slate-400 hidden lg:inline">
                    {art.relatedTickers[0]}
                  </span>
                )}

                <span className="text-[11px] text-slate-500 group-hover:text-slate-200 flex items-center gap-0.5">
                  <span>DISPATCH</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Status */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>TOTAL DISPATCHES: {filteredArticles.length} STORIES</span>
        <span className="text-rose-400 animate-pulse">● LIVE SECURE FEED ACTIVE</span>
      </div>
    </div>
  );
}
