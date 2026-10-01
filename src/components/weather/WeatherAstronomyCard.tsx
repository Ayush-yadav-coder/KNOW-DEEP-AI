import React from "react";
import { Sun, Moon, Compass, Sparkles, Clock, Sunset, Sunrise } from "lucide-react";

interface AstronomyData {
  sunrise?: string;
  sunset?: string;
  solarNoon?: string;
  daylightHours?: string;
  moonPhase?: string;
  moonIllumination?: string;
  moonrise?: string;
  moonset?: string;
}

interface WeatherAstronomyCardProps {
  data?: AstronomyData;
  city: string;
}

export const WeatherAstronomyCard: React.FC<WeatherAstronomyCardProps> = ({
  data,
  city,
}) => {
  const sunrise = data?.sunrise || "06:14 AM";
  const sunset = data?.sunset || "07:42 PM";
  const daylight = data?.daylightHours || "13h 28m";
  const moonPhase = data?.moonPhase || "Waxing Gibbous";
  const moonIllum = data?.moonIllumination || "78%";

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-6 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Solar Arc &amp; Astronomical Tracking
            </h3>
            <p className="text-xs text-muted-foreground">
              Solar trajectory, daylight duration, and lunar illumination for {city}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Arc Visualization */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sunrise className="w-4 h-4 text-amber-400" /> Sunrise: {sunrise}
            </span>
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sunset className="w-4 h-4 text-orange-400" /> Sunset: {sunset}
            </span>
          </div>

          {/* Graphical Solar Arc Curve */}
          <div className="relative h-20 w-full flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 200 80" className="w-full h-full text-amber-400">
              <path
                d="M 10 70 Q 100 10 190 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-40"
              />
              <path
                d="M 10 70 Q 100 10 140 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              {/* Sun Position Sphere */}
              <circle cx="140" cy="35" r="7" className="fill-amber-400 stroke-card stroke-2 shadow-lg" />
            </svg>
            <div className="absolute bottom-1 text-[11px] font-mono text-muted-foreground">
              Total Daylight: <span className="font-bold text-foreground">{daylight}</span>
            </div>
          </div>
        </div>

        {/* Lunar Tracking Box */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" /> Moon Phase: {moonPhase}
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {moonIllum} Illuminated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Moonrise</span>
              <span className="font-mono font-bold text-foreground">{data?.moonrise || "04:22 PM"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Moonset</span>
              <span className="font-mono font-bold text-foreground">{data?.moonset || "03:15 AM"}</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug pt-1">
            Excellent night sky clarity expected after 11:00 PM for telescope observation.
          </p>
        </div>
      </div>
    </div>
  );
};
