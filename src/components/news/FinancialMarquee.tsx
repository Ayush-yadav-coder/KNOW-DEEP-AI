import React, { useState } from "react";
import { TrendingUp, TrendingDown, Radio, ChevronRight, Volume2, Sparkles, Pause, Play } from "lucide-react";

export interface MarketTicker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const DEFAULT_MARKET_TICKERS: MarketTicker[] = [
  { symbol: "S&P 500", name: "US Large Cap", price: "5,864.20", change: "+0.84%", isPositive: true },
  { symbol: "NASDAQ", name: "Tech 100", price: "18,485.10", change: "+1.32%", isPositive: true },
  { symbol: "BTC/USD", name: "Bitcoin", price: "$68,420", change: "+3.45%", isPositive: true },
  { symbol: "ETH/USD", name: "Ethereum", price: "$3,490.50", change: "+2.18%", isPositive: true },
  { symbol: "BRENT", name: "Crude Oil", price: "$74.80/bbl", change: "-1.12%", isPositive: false },
  { symbol: "GOLD", name: "Spot Ounce", price: "$2,748.90", change: "+0.65%", isPositive: true },
  { symbol: "US 10Y", name: "Treasury Yield", price: "4.18%", change: "-0.04 bps", isPositive: false },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "$142.50", change: "+3.80%", isPositive: true },
  { symbol: "NIKKEI", name: "Tokyo 225", price: "38,910", change: "+0.55%", isPositive: true },
  { symbol: "FTSE 100", name: "London", price: "8,245.30", change: "-0.22%", isPositive: false },
];

interface FinancialMarqueeProps {
  onSelectTicker?: (ticker: MarketTicker) => void;
  breakingNewsAlert?: string;
  onOpenBriefing?: () => void;
}

export function FinancialMarquee({
  onSelectTicker,
  breakingNewsAlert = "BREAKING: Global consortium verifies fault-tolerant quantum computing coherence milestone on standard silicon wafers.",
  onOpenBriefing,
}: FinancialMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full bg-slate-950/80 dark:bg-slate-950/90 border-y border-border/40 backdrop-blur-md text-xs select-none">
      {/* Top breaking news bar */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 text-xs border-b border-border/20">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold text-[10px] tracking-wider uppercase shrink-0 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <Radio className="w-3 h-3 text-rose-400" />
            <span>Flash Wire</span>
          </div>
          <p className="text-muted-foreground text-xs truncate">
            <span className="text-foreground font-medium">{breakingNewsAlert}</span>
          </p>
        </div>

        {onOpenBriefing && (
          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium shrink-0 transition-colors group"
          >
            <Sparkles className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">60s Audio Briefing</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Scrolling market indices */}
      <div
        className="relative flex items-center overflow-hidden py-1.5 group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-6 whitespace-nowrap ${
            isPaused ? "animate-none" : "animate-marquee"
          }`}
          style={{
            animationDuration: "35s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {[...DEFAULT_MARKET_TICKERS, ...DEFAULT_MARKET_TICKERS].map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              onClick={() => onSelectTicker?.(item)}
              className="flex items-center gap-2 px-2 py-0.5 rounded-md hover:bg-slate-800/60 transition-colors"
            >
              <span className="font-bold text-slate-200">{item.symbol}</span>
              <span className="text-slate-400 font-mono text-[11px]">{item.price}</span>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-semibold font-mono ${
                  item.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {item.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {item.change}
              </span>
              <span className="text-slate-700 ml-1">·</span>
            </div>
          ))}
        </div>

        {/* Marquee pause/play indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-slate-900/80 px-2 py-0.5 rounded border border-border/30 backdrop-blur-sm pointer-events-none">
          {isPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
          <span>{isPaused ? "Paused" : "Live Stream"}</span>
        </div>
      </div>
    </div>
  );
}
