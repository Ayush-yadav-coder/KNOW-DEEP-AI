import React, { useState, useRef } from "react";
import { Clock, Droplets, Wind, Sparkles, TrendingUp, ChevronLeft, ChevronRight, BarChart2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HourlyItem {
  time: string;
  temp: number;
  condition: string;
  icon?: string;
  pop?: number; // probability of precipitation %
  wind?: string;
  humidity?: number;
  feelsLike?: number;
}

interface WeatherHourlyTimelineProps {
  hourly?: HourlyItem[];
}

export const WeatherHourlyTimeline: React.FC<WeatherHourlyTimelineProps> = ({
  hourly = [],
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"scroll" | "chart">("scroll");
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // Generate 24 fallback hourly items if fewer provided
  const generateFallback24 = (): HourlyItem[] => {
    const hours: HourlyItem[] = [];
    const nowHour = new Date().getHours();
    const conds = [
      { cond: "Sunny", icon: "☀️", pop: 0 },
      { cond: "Clear", icon: "🌤️", pop: 5 },
      { cond: "Partly Cloudy", icon: "⛅", pop: 15 },
      { cond: "Cloudy", icon: "☁️", pop: 30 },
      { cond: "Light Rain", icon: "🌦️", pop: 60 },
      { cond: "Clear Sky", icon: "🌙", pop: 0 },
    ];

    for (let i = 0; i < 24; i++) {
      const h = (nowHour + i) % 24;
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const label = i === 0 ? "Now" : `${h12} ${ampm}`;
      const temp = 22 + Math.round(Math.sin(((h - 6) / 24) * Math.PI * 2) * 5);
      const isNight = h < 6 || h >= 20;
      const c = conds[i % conds.length];

      hours.push({
        time: label,
        temp,
        condition: c.cond,
        icon: isNight && c.icon === "☀️" ? "🌙" : c.icon,
        pop: c.pop,
        wind: `${10 + (i % 6) * 2} km/h`,
        humidity: 50 + (i % 8) * 4,
        feelsLike: temp + (isNight ? -1 : 1),
      });
    }
    return hours;
  };

  const items = hourly && hourly.length >= 12 ? hourly : generateFallback24();
  const activeItem = items[selectedIdx] || items[0];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // Min & Max Temps for SVG chart scaling
  const minTemp = Math.min(...items.map((i) => i.temp)) - 2;
  const maxTemp = Math.max(...items.map((i) => i.temp)) + 2;
  const tempRange = maxTemp - minTemp || 1;

  // SVG Chart path generation
  const svgWidth = 800;
  const svgHeight = 120;
  const points = items.map((item, idx) => {
    const x = (idx / (items.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 20 - ((item.temp - minTemp) / tempRange) * (svgHeight - 40);
    return { x, y, item, idx };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Next 24-Hour Forecast Timeline</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                24 Hours
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Micro-hourly atmospheric shifts, precipitation probabilities &amp; temperature curve
            </p>
          </div>
        </div>

        {/* View Switcher: Scrollable List vs SVG Chart */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border/60">
          <button
            onClick={() => setViewMode("scroll")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === "scroll"
                ? "bg-sky-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Scrollable List
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === "chart"
                ? "bg-sky-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> 24H Wave Chart
          </button>
        </div>
      </div>

      {/* Selected Hour Telemetry Ribbon */}
      <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sky-400 font-mono text-sm">
            {activeItem.time}
          </span>
          <span className="text-2xl">{activeItem.icon || "☀️"}</span>
          <span className="font-bold text-foreground">{activeItem.condition}</span>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <span className="text-foreground font-bold">
            Temp: <span className="text-sky-400">{activeItem.temp}°C</span>
          </span>
          <span className="text-muted-foreground">
            Feels like: <span className="text-foreground font-bold">{activeItem.feelsLike ?? activeItem.temp}°C</span>
          </span>
          <span className="text-muted-foreground">
            Rain: <span className="text-sky-300 font-bold">{activeItem.pop ?? 10}%</span>
          </span>
          <span className="text-muted-foreground">
            Wind: <span className="text-teal-300 font-bold">{activeItem.wind || "14 km/h"}</span>
          </span>
        </div>
      </div>

      {/* View Mode 1: Scrollable Horizontal Card List */}
      {viewMode === "scroll" ? (
        <div className="relative group">
          {/* Scroll Nav Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/90 text-white border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 shadow-xl transition-opacity"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/90 text-white border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 shadow-xl transition-opacity"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-sky-500/30 scrollbar-track-muted/20"
          >
            {items.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3.5 rounded-2xl border text-center transition-all min-w-[96px] shrink-0 flex flex-col items-center space-y-1.5 ${
                    isSelected
                      ? "bg-sky-500/20 border-sky-500/60 shadow-lg ring-2 ring-sky-500/30"
                      : "bg-muted/30 border-border/40 hover:bg-muted/60"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground font-mono">
                    {item.time}
                  </span>
                  <span className="text-2xl">{item.icon || "☀️"}</span>
                  <span className="text-sm font-black font-mono text-foreground">
                    {item.temp}°
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    {item.condition}
                  </span>

                  {(item.pop ?? 0) > 0 ? (
                    <span className="text-[10px] font-bold text-sky-400 font-mono flex items-center gap-0.5 pt-1">
                      <Droplets className="w-3 h-3" /> {item.pop}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono pt-1">
                      {item.wind || "12 km/h"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode 2: Interactive SVG 24H Wave Chart */
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[140px] overflow-visible">
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gradient Fill under curve */}
              <path d={areaD} fill="url(#tempGradient)" />

              {/* Main Line Curve */}
              <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

              {/* Data Points */}
              {points.map((p) => {
                const isSel = p.idx === selectedIdx;
                return (
                  <g key={p.idx} onClick={() => setSelectedIdx(p.idx)} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSel ? 6 : 3.5}
                      className={isSel ? "fill-sky-400 stroke-white stroke-2 shadow-lg" : "fill-sky-400 hover:r-5"}
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[10px] font-bold"
                    >
                      {p.item.temp}°
                    </text>
                    <text
                      x={p.x}
                      y={svgHeight - 2}
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono text-[9px]"
                    >
                      {p.item.time}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
