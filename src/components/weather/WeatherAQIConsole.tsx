import React, { useState } from "react";
import { Activity, ShieldAlert, Heart, Wind, Leaf, AlertCircle, CheckCircle2, Info, Thermometer, ShieldCheck } from "lucide-react";

export interface AQIData {
  aqi?: number;
  aqiStatus?: string;
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  co?: number;
  so2?: number;
  healthAdvice?: string;
  dominantPollutant?: string;
  pollens?: {
    grass?: string;
    tree?: string;
    weed?: string;
    mold?: string;
  };
}

interface WeatherAQIConsoleProps {
  data?: AQIData;
  city: string;
}

export const WeatherAQIConsole: React.FC<WeatherAQIConsoleProps> = ({
  data,
  city,
}) => {
  const aqiScore = data?.aqi ?? 34;
  const pm25 = data?.pm25 ?? 8.2;
  const pm10 = data?.pm10 ?? 16.4;
  const o3 = data?.o3 ?? 42.1;
  const no2 = data?.no2 ?? 12.0;
  const co = data?.co ?? 0.4;
  const so2 = data?.so2 ?? 2.1;

  const [activeTab, setActiveTab] = useState<"pollutants" | "recommendations" | "pollen">("pollutants");

  // Determine AQI Level, Color, and Category
  const getAQILevel = (score: number) => {
    if (score <= 50) {
      return {
        category: "Good",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        barColor: "bg-emerald-500",
        desc: "Air quality is satisfactory with low air pollution risk.",
        exerciseAdvice: "Ideal conditions for outdoor running, workouts, and sports.",
        ventilationAdvice: "Safe to open windows for indoor fresh air circulation.",
        sensitiveAdvice: "No precautions required for sensitive individuals.",
        maskAdvice: "Face masks not required.",
      };
    }
    if (score <= 100) {
      return {
        category: "Moderate",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        barColor: "bg-amber-500",
        desc: "Air quality is acceptable; unusually sensitive individuals should take precautions.",
        exerciseAdvice: "Outdoor exercise is generally fine; moderate intensity for sensitive runners.",
        ventilationAdvice: "Keep windows open during morning hours when air is fresh.",
        sensitiveAdvice: "Sensitive groups (asthma, elderly) should monitor respiratory comfort.",
        maskAdvice: "Masks optional for vulnerable groups near heavy traffic.",
      };
    }
    if (score <= 150) {
      return {
        category: "Unhealthy for Sensitive Groups",
        color: "text-orange-400",
        bg: "bg-orange-500/10 border-orange-500/30",
        barColor: "bg-orange-500",
        desc: "Members of sensitive groups may experience health effects; general public less affected.",
        exerciseAdvice: "Reduce strenuous outdoor activities or move workouts indoors.",
        ventilationAdvice: "Close windows during peak rush hours to minimize particulate buildup.",
        sensitiveAdvice: "People with respiratory or heart conditions should limit prolonged outdoor exertion.",
        maskAdvice: "N95/KN95 masks recommended for sensitive groups outdoors.",
      };
    }
    return {
      category: "Unhealthy",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
      barColor: "bg-rose-500",
      desc: "Increased likelihood of adverse health effects for all individuals.",
      exerciseAdvice: "Avoid outdoor physical exertion; switch to indoor training.",
      ventilationAdvice: "Keep windows closed and run HEPA air purifiers.",
      sensitiveAdvice: "Remain indoors and avoid outdoor exposure.",
      maskAdvice: "Wear N95/KN95 masks if outdoors.",
    };
  };

  const aqiInfo = getAQILevel(aqiScore);

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-6">
      {/* Top Header & AQI Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Air Quality Index (AQI) Widget</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                {city}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time atmospheric particulate density, gas concentration, and health guidance
            </p>
          </div>
        </div>

        {/* AQI Numeric Ring & Score Display */}
        <div className={`p-3.5 rounded-2xl border ${aqiInfo.bg} flex items-center gap-4 shrink-0 shadow-sm`}>
          <div className="text-center min-w-[60px]">
            <span className={`text-3xl font-black font-mono leading-none ${aqiInfo.color}`}>
              {aqiScore}
            </span>
            <span className="text-[10px] block font-mono text-muted-foreground uppercase pt-0.5">
              AQI INDEX
            </span>
          </div>

          <div className="border-l border-border/60 pl-3.5 space-y-0.5">
            <span className={`text-sm font-extrabold block ${aqiInfo.color}`}>
              {aqiInfo.category}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Dominant: <strong className="text-foreground">{data?.dominantPollutant || "PM2.5"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* AQI 0-500 Visual Meter Scale Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
          <span>0 (Good)</span>
          <span>50</span>
          <span>100 (Moderate)</span>
          <span>150</span>
          <span>200+ (Unhealthy)</span>
        </div>

        <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${aqiInfo.barColor}`}
            style={{ width: `${Math.min(100, (aqiScore / 200) * 100)}%` }}
          />
        </div>
      </div>

      {/* Tabs Switcher: Pollutant Levels vs Health Recommendations vs Pollen */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("pollutants")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "pollutants"
              ? "bg-teal-500 text-white shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pollutant Levels
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "recommendations"
              ? "bg-teal-500 text-white shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Health Recommendations
        </button>

        <button
          onClick={() => setActiveTab("pollen")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "pollen"
              ? "bg-teal-500 text-white shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Botanical Pollen Radar
        </button>
      </div>

      {/* Tab 1: Pollutant Levels Breakdown */}
      {activeTab === "pollutants" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* PM2.5 */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">PM2.5 (Fine Particulates)</span>
              <span className="font-mono text-emerald-400 font-bold">{pm25} µg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (pm25 / 35) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Microscopic air particles (&lt;2.5µm) from combustion and traffic.</p>
          </div>

          {/* PM10 */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">PM10 (Coarse Particles)</span>
              <span className="font-mono text-teal-400 font-bold">{pm10} µg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (pm10 / 50) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Coarse dust, pollen, and roadway particles (&lt;10µm).</p>
          </div>

          {/* O3 Ozone */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">O3 (Ground Ozone)</span>
              <span className="font-mono text-sky-400 font-bold">{o3} µg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, (o3 / 100) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Solar chemical reaction product affecting lung sensitivity.</p>
          </div>

          {/* NO2 */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">NO2 (Nitrogen Dioxide)</span>
              <span className="font-mono text-indigo-400 font-bold">{no2} µg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (no2 / 40) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Vehicle exhaust gas pollutant affecting airways.</p>
          </div>

          {/* CO */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">CO (Carbon Monoxide)</span>
              <span className="font-mono text-amber-400 font-bold">{co} mg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (co / 4) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Colorless gas from incomplete combustion.</p>
          </div>

          {/* SO2 */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">SO2 (Sulfur Dioxide)</span>
              <span className="font-mono text-purple-400 font-bold">{so2} µg/m³</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (so2 / 20) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Industrial emission gas affecting throat and eyes.</p>
          </div>
        </div>
      )}

      {/* Tab 2: Health Recommendations */}
      {activeTab === "recommendations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Outdoor Sports &amp; Exercise
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aqiInfo.exerciseAdvice}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Vulnerable &amp; Sensitive Groups
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aqiInfo.sensitiveAdvice}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4" /> Home Ventilation &amp; Air Purifiers
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aqiInfo.ventilationAdvice}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> Mask &amp; Protection Advice
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aqiInfo.maskAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Pollen Radar */}
      {activeTab === "pollen" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono block">Grass Pollen</span>
            <span className="text-xs font-bold text-foreground font-mono">
              {data?.pollens?.grass || "Low (Level 1/5)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono block">Tree Pollen</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {data?.pollens?.tree || "Moderate (Level 2/5)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono block">Weed Pollen</span>
            <span className="text-xs font-bold text-foreground font-mono">
              {data?.pollens?.weed || "Low (Level 1/5)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono block">Mold Spores</span>
            <span className="text-xs font-bold text-foreground font-mono">
              {data?.pollens?.mold || "Low (Level 1/5)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
