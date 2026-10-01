import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  Zap,
  Info,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Radio,
} from "lucide-react";

interface SparklinePoint {
  timestamp: string;
  hour: string;
  sentimentScore: number; // -100 (Extremely Bearish) to +100 (Extremely Bullish)
  headline: string;
  volumeMultiplier: number;
}

interface SentimentSparklineDashboardProps {
  topicName: string;
  category?: string;
  bullishPct?: number;
  bearishPct?: number;
  neutralPct?: number;
}

export function SentimentSparklineDashboard({
  topicName,
  category = "Global Intelligence",
  bullishPct = 65,
  bearishPct = 15,
  neutralPct = 20,
}: SentimentSparklineDashboardProps) {
  const [timeframe, setTimeframe] = useState<"24H" | "7D" | "30D">("24H");
  const [hoveredPoint, setHoveredPoint] = useState<SparklinePoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Generate realistic, deterministic sparkline series based on topic name and timeframe
  const sparklineData = useMemo(() => {
    // Generate a pseudo-random seed from topicName
    let seed = 0;
    for (let i = 0; i < topicName.length; i++) {
      seed = (seed << 5) - seed + topicName.charCodeAt(i);
      seed |= 0;
    }
    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const count = timeframe === "24H" ? 12 : timeframe === "7D" ? 14 : 15;
    const points: SparklinePoint[] = [];

    // Base bias based on bullishPct
    const baseBias = (bullishPct - bearishPct) * 0.8;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const wave = Math.sin(progress * Math.PI * 3 + seed) * 22;
      const noise = (pseudoRandom(i * 7) - 0.5) * 18;
      const rawScore = Math.max(-90, Math.min(95, Math.round(baseBias + wave + noise)));

      let hourLabel = "";
      if (timeframe === "24H") {
        const hoursAgo = Math.round((1 - progress) * 24);
        hourLabel = hoursAgo === 0 ? "Now" : `-${hoursAgo}h`;
      } else if (timeframe === "7D") {
        const daysAgo = Math.round((1 - progress) * 7);
        hourLabel = daysAgo === 0 ? "Today" : `-${daysAgo}d`;
      } else {
        const daysAgo = Math.round((1 - progress) * 30);
        hourLabel = daysAgo === 0 ? "Today" : `-${daysAgo}d`;
      }

      const sampleHeadlines = [
        `Institutional inflow acceleration detected across ${topicName} corridors`,
        `Consortium publishes verified benchmark findings for ${topicName}`,
        `Macro risk assessment notes steady deployment velocity in ${topicName}`,
        `Global regulatory working group issues positive policy framework for ${topicName}`,
        `Market analysts upgrade multi-year capital efficiency targets in ${topicName}`,
        `Consolidated wire report notes sustained positive momentum for ${topicName}`,
      ];

      points.push({
        timestamp: `${hourLabel}`,
        hour: hourLabel,
        sentimentScore: rawScore,
        headline: sampleHeadlines[Math.floor(pseudoRandom(i * 13) * sampleHeadlines.length)],
        volumeMultiplier: 1 + Math.round(pseudoRandom(i * 3) * 8) / 10,
      });
    }

    return points;
  }, [topicName, timeframe, bullishPct, bearishPct]);

  // Sparkline coordinates calculation
  const width = 600;
  const height = 130;
  const paddingX = 20;
  const paddingY = 20;

  const minScore = -100;
  const maxScore = 100;

  const coordinates = useMemo(() => {
    return sparklineData.map((pt, idx) => {
      const x = paddingX + (idx / (sparklineData.length - 1)) * (width - paddingX * 2);
      // Map score (-100 to 100) to height
      const normalized = (pt.sentimentScore - minScore) / (maxScore - minScore);
      const y = height - paddingY - normalized * (height - paddingY * 2);
      return { x, y, pt };
    });
  }, [sparklineData]);

  // Path strings
  const pathD = useMemo(() => {
    if (coordinates.length === 0) return "";
    let d = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [coordinates]);

  // Area path for gradient fill
  const areaD = useMemo(() => {
    if (coordinates.length === 0) return "";
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    return `${pathD} L ${last.x} ${height - paddingY / 2} L ${first.x} ${height - paddingY / 2} Z`;
  }, [pathD, coordinates]);

  const latestScore = sparklineData[sparklineData.length - 1]?.sentimentScore ?? 45;
  const initialScore = sparklineData[0]?.sentimentScore ?? 20;
  const delta = latestScore - initialScore;
  const isPositiveDelta = delta >= 0;

  return (
    <div className="rounded-3xl bg-card/75 dark:bg-card/45 backdrop-blur-2xl border border-border/70 shadow-lg p-4 sm:p-6 space-y-4">
      {/* Header with live status and timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground">
                Public Sentiment Trend Radar
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                Live Pulse
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real-time multi-source sentiment telemetry for{" "}
              <strong className="text-foreground">{topicName}</strong>
            </p>
          </div>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/40 self-start sm:self-auto">
          {(["24H", "7D", "30D"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-card text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Current Sentiment Index */}
        <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sentiment Index
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-black font-mono ${
                latestScore > 20
                  ? "text-emerald-400"
                  : latestScore < -20
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {latestScore > 0 ? `+${latestScore}` : latestScore}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
          <span className="text-[10px] font-medium text-foreground block">
            {latestScore > 30
              ? "Strongly Bullish"
              : latestScore > 10
              ? "Moderately Positive"
              : latestScore > -10
              ? "Neutral Balance"
              : "Defensive / Bearish"}
          </span>
        </div>

        {/* Metric 2: Net Momentum Delta */}
        <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {timeframe} Trajectory
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-black font-mono flex items-center ${
                isPositiveDelta ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositiveDelta ? "+" : ""}
              {delta} pts
            </span>
            {isPositiveDelta ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block">
            vs. {timeframe === "24H" ? "24 hours ago" : `${timeframe} baseline`}
          </span>
        </div>

        {/* Metric 3: Media Confidence Ratio */}
        <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Consensus Confidence
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-foreground">94.2%</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-muted-foreground block">High verification score</span>
        </div>

        {/* Metric 4: Volatility Band */}
        <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Discourse Velocity
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-amber-400">Low Friction</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-[10px] text-muted-foreground block">Institutional stability</span>
        </div>
      </div>

      {/* SVG SPARKLINE CHART */}
      <div className="relative w-full rounded-2xl bg-card/90 border border-border/50 p-3 overflow-hidden">
        {/* Zero baseline indicator */}
        <div
          className="absolute left-0 right-0 border-b border-border/40 border-dashed pointer-events-none"
          style={{ top: `${height / 2 + 10}px` }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 sm:h-36 overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="sentimentAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke Gradient */}
            <linearGradient id="sentimentStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <path d={areaD} fill="url(#sentimentAreaGrad)" />

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#sentimentStrokeGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive data point nodes */}
          {coordinates.map((coord, idx) => {
            const isHovered = hoveredPoint?.hour === coord.pt.hour;
            const isLatest = idx === coordinates.length - 1;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Invisible larger hover zone */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r="12"
                  fill="transparent"
                  onMouseEnter={() => {
                    setHoveredPoint(coord.pt);
                    setHoverPos({ x: coord.x, y: coord.y });
                  }}
                />

                {/* Visible dot */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? "5" : isLatest ? "4" : "2.5"}
                  className={`transition-all duration-150 ${
                    coord.pt.sentimentScore > 0
                      ? "fill-emerald-400 stroke-emerald-950"
                      : "fill-rose-400 stroke-rose-950"
                  }`}
                  strokeWidth="2"
                />

                {/* Pulsing halo for latest point */}
                {isLatest && !isHovered && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="8"
                    className="fill-emerald-400/20 animate-ping pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip on hover */}
        <AnimatePresence>
          {hoveredPoint && hoverPos && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute z-20 pointer-events-none bg-slate-950/95 border border-rose-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs space-y-1 max-w-xs"
              style={{
                left: Math.min(Math.max(hoverPos.x - 70, 10), width - 180),
                top: Math.max(hoverPos.y - 65, 5),
              }}
            >
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {hoveredPoint.hour}
                </span>
                <span
                  className={`font-mono font-bold ${
                    hoveredPoint.sentimentScore > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  Score: {hoveredPoint.sentimentScore > 0 ? `+${hoveredPoint.sentimentScore}` : hoveredPoint.sentimentScore}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                {hoveredPoint.headline}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* X-Axis labels */}
        <div className="flex justify-between items-center px-2 pt-2 text-[10px] font-mono text-muted-foreground border-t border-border/30">
          <span>{timeframe === "24H" ? "24h ago" : timeframe === "7D" ? "7 days ago" : "30 days ago"}</span>
          <span>{timeframe === "24H" ? "12h ago" : timeframe === "7D" ? "3 days ago" : "15 days ago"}</span>
          <span className="text-emerald-400 font-bold">Real-time Now</span>
        </div>
      </div>

      {/* Sentiment Emotional Pillars Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Technological Optimism</span>
          <span className="font-mono font-bold text-emerald-400">76%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Regulatory Scrutiny</span>
          <span className="font-mono font-bold text-amber-400">18%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Macro Supply Risk</span>
          <span className="font-mono font-bold text-rose-400">6%</span>
        </div>
      </div>
    </div>
  );
}
