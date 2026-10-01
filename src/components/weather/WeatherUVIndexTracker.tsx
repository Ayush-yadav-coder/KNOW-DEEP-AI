import React from "react";
import { Sun, ShieldAlert, Glasses, Umbrella, Clock, Sparkles, CheckCircle2, Heart } from "lucide-react";

interface WeatherUVIndexTrackerProps {
  uvIndex?: number;
  city?: string;
}

export const WeatherUVIndexTracker: React.FC<WeatherUVIndexTrackerProps> = ({
  uvIndex = 5,
  city = "New York",
}) => {
  // Determine UV Level, Color, and Advice
  const getUVInfo = (score: number) => {
    if (score <= 2) {
      return {
        category: "Low",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        barColor: "bg-emerald-500",
        maxSafeMinutes: "60+ mins unshielded",
        spf: "SPF 15+",
        advice: "Minimal solar protection required. Enjoy outdoor activities safely.",
        gear: ["Optional Sunglasses"],
      };
    }
    if (score <= 5) {
      return {
        category: "Moderate",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        barColor: "bg-amber-500",
        maxSafeMinutes: "30-45 mins unshielded",
        spf: "SPF 30+",
        advice: "Wear broad-spectrum sunscreen and UV-rated sunglasses during midday hours.",
        gear: ["SPF 30+ Sunscreen", "UV400 Sunglasses", "Wide-Brim Hat"],
      };
    }
    if (score <= 7) {
      return {
        category: "High",
        color: "text-orange-400",
        bg: "bg-orange-500/10 border-orange-500/30",
        barColor: "bg-orange-500",
        maxSafeMinutes: "15-25 mins unshielded",
        spf: "SPF 50+",
        advice: "Protection required. Seek shade during peak solar hours (11:00 AM - 3:00 PM).",
        gear: ["SPF 50+ Sunscreen", "UV400 Sunglasses", "Shade Umbrella", "Long Sleeves"],
      };
    }
    if (score <= 10) {
      return {
        category: "Very High",
        color: "text-rose-400",
        bg: "bg-rose-500/10 border-rose-500/30",
        barColor: "bg-rose-500",
        maxSafeMinutes: "10-15 mins unshielded",
        spf: "SPF 50+ Reapply every 2h",
        advice: "Extra solar protection needed. Avoid direct skin exposure near solar noon.",
        gear: ["SPF 50+ Broad Spectrum", "UV400 Sunglasses", "Wide Hat", "UV Shirt"],
      };
    }
    return {
      category: "Extreme",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
      barColor: "bg-purple-500",
      maxSafeMinutes: "<10 mins unshielded",
      spf: "SPF 50+ Maximum Protection",
      advice: "Take extreme precautions. Unprotected skin can burn within minutes.",
      gear: ["SPF 50+ Reapplied", "Full UV Shield", "Wide Hat", "Stay in Shade"],
    };
  };

  const uv = getUVInfo(uvIndex);

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-5">
      {/* Header & Score Ring */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Sun className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Real-Time UV Index Tracking Widget</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                Solar Telemetry
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time ultraviolet exposure score and sun safety protocols for {city}
            </p>
          </div>
        </div>

        {/* UV Meter Badge */}
        <div className={`p-3.5 rounded-2xl border ${uv.bg} flex items-center gap-4 shrink-0 shadow-sm`}>
          <div className="text-center min-w-[60px]">
            <span className={`text-3xl font-black font-mono leading-none ${uv.color}`}>
              {uvIndex}
            </span>
            <span className="text-[10px] block font-mono text-muted-foreground uppercase pt-0.5">
              UV SCORE
            </span>
          </div>

          <div className="border-l border-border/60 pl-3.5 space-y-0.5">
            <span className={`text-sm font-extrabold block ${uv.color}`}>
              {uv.category} Risk
            </span>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Limit: {uv.maxSafeMinutes}
            </span>
          </div>
        </div>
      </div>

      {/* UV Scale Bar (0 to 12) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>0 (Low)</span>
          <span>3 (Moderate)</span>
          <span>6 (High)</span>
          <span>8 (Very High)</span>
          <span>11+ (Extreme)</span>
        </div>

        <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${uv.barColor}`}
            style={{ width: `${Math.min(100, (uvIndex / 12) * 100)}%` }}
          />
        </div>
      </div>

      {/* Sun Protection Advice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Max Safe Unshielded Time
          </span>
          <span className="text-xs font-mono font-bold text-foreground block">
            {uv.maxSafeMinutes}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
          <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Sunscreen Recommendation
          </span>
          <span className="text-xs font-mono font-bold text-foreground block">
            {uv.spf}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <Glasses className="w-3.5 h-3.5" /> Peak UV Solar Hours
          </span>
          <span className="text-xs font-mono font-bold text-foreground block">
            11:00 AM – 03:00 PM
          </span>
        </div>
      </div>

      {/* Gear Checklist & General Advice Bar */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-amber-200 leading-snug">
          {uv.advice}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
            Recommended Protection Gear:
          </span>
          {uv.gear.map((item, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-[10px] font-mono text-amber-200 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
