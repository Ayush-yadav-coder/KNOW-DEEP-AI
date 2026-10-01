import React from "react";
import { Shirt, Sparkles, Compass, CheckCircle2, AlertTriangle, Layers, Umbrella, Sun, Wind } from "lucide-react";

interface ActivityItem {
  name: string;
  score: number;
  status: string;
  advice: string;
}

interface WeatherActivityMatrixProps {
  clothingAdvice?: string;
  activityAdvice?: string;
  activities?: ActivityItem[];
  temp?: number;
  condition?: string;
}

export const WeatherActivityMatrix: React.FC<WeatherActivityMatrixProps> = ({
  clothingAdvice,
  activityAdvice,
  activities,
  temp = 22,
  condition = "Partly Cloudy",
}) => {
  const defaultActivities: ActivityItem[] = [
    { name: "Distance Running", score: 9.2, status: "Optimal", advice: "Ideal cool temperature and low humidity." },
    { name: "Outdoor Photography", score: 8.8, status: "Great", advice: "Soft light with partial cloud framing." },
    { name: "Cycling & Commuting", score: 9.0, status: "Optimal", advice: "Light NW winds at 14 km/h; dry road traction." },
    { name: "Drone Flight Ops", score: 8.5, status: "Good", advice: "Wind gusts below 20 km/h; high visibility." },
    { name: "Stargazing & Astrophotography", score: 7.5, status: "Fair", advice: "35% cloud cover; clear after midnight." },
    { name: "Outdoor Dining & Beach", score: 8.0, status: "Pleasant", advice: "UV index 5; sunglasses recommended." },
  ];

  const items = activities && activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="space-y-6">
      {/* AI Smart Wardrobe & Clothing Advice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-sky-500/30 bg-sky-500/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Shirt className="w-4 h-4" /> AI Wardrobe &amp; Clothing Concierge
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Thermal Target: {temp}°C
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {clothingAdvice || "Comfortable cotton shirt with sunglasses for peak afternoon solar exposure. Carry a light windbreaker jacket for evening temperature drop."}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-teal-500/30 bg-teal-500/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Outdoor &amp; Travel Outlook
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {condition}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {activityAdvice || "Optimal atmospheric conditions for sports and travel. Minimal precipitation risk during morning and early afternoon hours."}
          </p>
        </div>
      </div>

      {/* Activity Readiness Matrix Grid */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" /> Activity Suitability &amp; Readiness Scores
          </h3>
          <span className="text-[11px] text-muted-foreground font-mono">
            Calibrated for current weather metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((act, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{act.name}</span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
                  act.score >= 8.5
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : act.score >= 7.0
                    ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {act.score.toFixed(1)} / 10
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {act.advice}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
