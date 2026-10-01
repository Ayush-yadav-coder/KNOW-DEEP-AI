import React from "react";
import { SlidersHorizontal, Eye, EyeOff, RotateCcw, Check, Sparkles, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WidgetVisibilityState {
  uvIndex: boolean;
  astronomy: boolean; // Moon phase, sunrise/sunset
  aqi: boolean;
  outfit: boolean;
  compare: boolean; // Side-by-side comparison
  activity: boolean;
  multiCity: boolean;
  radar: boolean;
  sevenDayChart: boolean;
}

interface WeatherWidgetCustomizerProps {
  visibility: WidgetVisibilityState;
  onToggleWidget: (widgetKey: keyof WidgetVisibilityState) => void;
  onResetDefault: () => void;
  onToggleAll: (enable: boolean) => void;
}

export const WeatherWidgetCustomizer: React.FC<WeatherWidgetCustomizerProps> = ({
  visibility,
  onToggleWidget,
  onResetDefault,
  onToggleAll,
}) => {
  const widgetConfig: Array<{
    key: keyof WidgetVisibilityState;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      key: "uvIndex",
      label: "UV Index & Sun Safety",
      description: "Real-time UV score, sunscreen advice & safe exposure limits.",
      icon: "☀️",
    },
    {
      key: "astronomy",
      label: "Solar Arc & Moon Phase",
      description: "Sunrise/sunset times, daylight duration & lunar illumination.",
      icon: "🌙",
    },
    {
      key: "aqi",
      label: "Air Quality & Pollutants",
      description: "PM2.5, PM10, Ozone breakdown & pollen allergen radar.",
      icon: "🍃",
    },
    {
      key: "outfit",
      label: "Smart Outfit Planner",
      description: "Occasion-based wardrobe advice for temperature & rain.",
      icon: "👔",
    },
    {
      key: "compare",
      label: "Side-by-Side City Comparison",
      description: "Dual location weather telemetry comparison.",
      icon: "🌐",
    },
    {
      key: "sevenDayChart",
      label: "7-Day Recharts Trend Chart",
      description: "High/low temperature lines & rain probability bars.",
      icon: "📈",
    },
    {
      key: "activity",
      label: "Outdoor Activity Matrix",
      description: "Running, cycling & stargazing readiness scores.",
      icon: "🏃",
    },
    {
      key: "radar",
      label: "Interactive Weather Map",
      description: "Vector doppler radar for precipitation, wind & temperature.",
      icon: "🗺️",
    },
    {
      key: "multiCity",
      label: "Multi-City Global Matrix",
      description: "Quick comparison cards for bookmarked international hubs.",
      icon: "🏙️",
    },
  ];

  return (
    <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <span>Personalized Weather Widgets &amp; Dashboard Layout</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-bold">
                Customizer
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Toggle card visibility to tailor your weather command center view
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleAll(true)}
            className="h-8 text-xs rounded-xl gap-1 text-sky-400 hover:text-sky-300"
          >
            <Eye className="w-3.5 h-3.5" /> Show All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetDefault}
            className="h-8 text-xs rounded-xl gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </Button>
        </div>
      </div>

      {/* Widget Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
        {widgetConfig.map((item) => {
          const isVisible = visibility[item.key];
          return (
            <div
              key={item.key}
              onClick={() => onToggleWidget(item.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isVisible
                  ? "bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/20"
                  : "bg-muted/20 border-border/40 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Toggle Badge */}
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isVisible
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "bg-muted border-border/80 text-muted-foreground"
                }`}
              >
                {isVisible ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3 h-3" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
