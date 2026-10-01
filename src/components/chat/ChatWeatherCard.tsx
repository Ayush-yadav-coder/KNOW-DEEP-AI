import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Compass,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import { StylishWeatherLogo } from "@/components/weather/StylishWeatherLogo";
import { getCompliantWeatherData, type UnifiedWeatherData } from "@/lib/weatherService";

interface ChatWeatherCardProps {
  city?: string;
  onContinueInChat?: () => void;
}

export const ChatWeatherCard: React.FC<ChatWeatherCardProps> = ({
  city = "Mumbai",
  onContinueInChat,
}) => {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<"°C" | "°F">("°C");
  const [weatherData, setWeatherData] = useState<UnifiedWeatherData | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCompliantWeatherData(city).then((data) => {
      if (isMounted) {
        setWeatherData(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [city]);

  const rawTemp = weatherData?.temp ?? 24;
  const currentTemp = unit === "°C" ? rawTemp : Math.round((rawTemp * 9) / 5 + 32);
  const conditionName = weatherData?.condition || "Partly Cloudy";

  const forecastDays = weatherData?.forecast && weatherData.forecast.length > 0
    ? weatherData.forecast.slice(0, 3).map((f) => ({
        day: f.day,
        temp: unit === "°C" ? f.tempHigh : Math.round((f.tempHigh * 9) / 5 + 32),
        cond: f.condition,
      }))
    : [
        { day: "Today", temp: currentTemp, cond: conditionName },
        { day: "Tomorrow", temp: currentTemp + 2, cond: "Sunny" },
        { day: "Day 3", temp: currentTemp - 1, cond: "Scattered Clouds" },
      ];

  const handleOpenStudio = () => {
    navigate(`/weather?city=${encodeURIComponent(city)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="my-3 w-full max-w-2xl rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-background/80 to-blue-500/5 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Stylish Weather Logo & Location */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <StylishWeatherLogo
            condition={conditionName}
            temperature={currentTemp}
            unit={unit}
            size="md"
            interactive={true}
            onClick={handleOpenStudio}
          />
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight capitalize">
                {weatherData?.city || city}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 font-semibold border border-sky-500/20">
                Live Station
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>{conditionName}</span>
              <span>•</span>
              <span className="text-emerald-500 font-medium">AQI {weatherData?.aqi || 32} (Good)</span>
            </p>
          </div>
        </div>

        {/* Temperature Badge with °C/°F Switch */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80">
          <span className="text-xl sm:text-2xl font-black text-foreground px-2 tracking-tight">
            {currentTemp}
            <span className="text-sm font-semibold text-sky-500">{unit}</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setUnit("°C")}
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                unit === "°C"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("°F")}
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                unit === "°F"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 my-3.5 relative z-10">
        <div className="p-2 rounded-xl bg-card/60 border border-border/60 flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block truncate">Humidity</span>
            <span className="text-xs font-bold text-foreground">{weatherData?.humidity ?? 55}%</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-card/60 border border-border/60 flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block truncate">Wind Speed</span>
            <span className="text-xs font-bold text-foreground">{weatherData?.windSpeed ?? 14} km/h</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-card/60 border border-border/60 flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block truncate">UV Index</span>
            <span className="text-xs font-bold text-foreground">{weatherData?.uvIndex ?? 5} (Mod)</span>
          </div>
        </div>
      </div>

      {/* 3-Day Micro Forecast */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/40 border border-border/50 text-xs mb-3.5 relative z-10">
        {forecastDays.map((f, idx) => (
          <div key={idx} className="flex-1 text-center py-1 border-r last:border-r-0 border-border/40">
            <span className="text-[10px] text-muted-foreground block">{f.day}</span>
            <span className="font-bold text-foreground">{f.temp}{unit}</span>
            <span className="text-[9px] text-muted-foreground block truncate">{f.cond}</span>
          </div>
        ))}
      </div>

      {/* Dual Option Action Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/60 relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-sky-500" />
          <span>Dual Option: Instant snapshot or deep studio</span>
        </div>

        <div className="flex items-center gap-2">
          {onContinueInChat && (
            <button
              onClick={onContinueInChat}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted bg-card/80 border border-border transition-all"
            >
              Continue in Chat
            </button>
          )}

          <button
            onClick={handleOpenStudio}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Open Weather Station</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
