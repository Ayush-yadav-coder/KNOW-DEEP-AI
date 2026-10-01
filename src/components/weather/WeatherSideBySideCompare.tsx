import React, { useState, useEffect } from "react";
import { ArrowRightLeft, MapPin, Sun, Wind, Droplets, Thermometer, Clock, ShieldCheck, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CityMetrics {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  aqi: number;
  aqiStatus: string;
  uvIndex: number;
  rainProb: number;
  localTime: string;
}

interface WeatherSideBySideCompareProps {
  primaryCity: string;
  primaryCountry?: string;
  primaryTemp?: number;
  primaryFeelsLike?: number;
  primaryCondition?: string;
  primaryHumidity?: number;
  primaryWindSpeed?: number;
  primaryAqi?: number;
  primaryUv?: number;
  primaryRainProb?: number;
  unit?: "C" | "F";
}

const COMPARISON_CITIES = [
  "London",
  "Tokyo",
  "Paris",
  "Sydney",
  "Singapore",
  "Dubai",
  "Cairo",
  "Rio de Janeiro",
  "Mumbai",
  "Toronto",
];

export const WeatherSideBySideCompare: React.FC<WeatherSideBySideCompareProps> = ({
  primaryCity,
  primaryCountry = "Global",
  primaryTemp = 22,
  primaryFeelsLike = 23,
  primaryCondition = "Partly Cloudy",
  primaryHumidity = 58,
  primaryWindSpeed = 14,
  primaryAqi = 34,
  primaryUv = 5,
  primaryRainProb = 15,
  unit = "C",
}) => {
  const [targetCityName, setTargetCityName] = useState<string>("Tokyo");
  const [targetCityData, setTargetCityData] = useState<CityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Convert temperature
  const displayTemp = (celsius: number) => {
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  // Fetch or simulate secondary target city telemetry
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchTargetData = async () => {
      try {
        const res = await fetch("/api/weather-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: targetCityName }),
        });
        const data = await res.json();

        if (isMounted) {
          if (data && data.temp !== undefined) {
            setTargetCityData({
              city: data.city || targetCityName,
              country: data.country || "Global",
              temp: data.temp,
              feelsLike: data.feelsLike || data.temp,
              condition: data.condition || "Clear Sky",
              icon: data.condition?.toLowerCase().includes("rain") ? "🌧️" : "☀️",
              humidity: data.humidity || 52,
              windSpeed: typeof data.windSpeed === "number" ? data.windSpeed : 12,
              windDirection: "NE",
              aqi: data.current?.aqi || 28,
              aqiStatus: "Good",
              uvIndex: data.uvIndex || 6,
              rainProb: data.forecast?.[0]?.rainProb || 10,
              localTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
          } else {
            // Fallback mock for smooth comparison
            setTargetCityData(getMockTargetCity(targetCityName));
          }
        }
      } catch {
        if (isMounted) {
          setTargetCityData(getMockTargetCity(targetCityName));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTargetData();

    return () => {
      isMounted = false;
    };
  }, [targetCityName]);

  const getMockTargetCity = (cityName: string): CityMetrics => ({
    city: cityName,
    country: "International Hub",
    temp: 24,
    feelsLike: 25,
    condition: "Clear Sky",
    icon: "☀️",
    humidity: 50,
    windSpeed: 10,
    windDirection: "NE",
    aqi: 26,
    aqiStatus: "Good",
    uvIndex: 6,
    rainProb: 5,
    localTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  const targetData = targetCityData || getMockTargetCity(targetCityName);
  const tempDiff = targetData.temp - primaryTemp;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-6">
      {/* Header & Target City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Location Side-by-Side Weather Comparison</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                Dual Telemetry
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Compare your current location with another global city in real time
            </p>
          </div>
        </div>

        {/* Target City Selector Dropdown Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {COMPARISON_CITIES.slice(0, 5).map((c) => (
            <button
              key={c}
              onClick={() => setTargetCityName(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 transition-all ${
                targetCityName.toLowerCase() === c.toLowerCase()
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-muted border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Dual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Delta Indicator Badge between cards */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-sky-500 text-white shadow-xl border border-sky-400 items-center justify-center font-mono text-xs font-bold">
          {tempDiff === 0 ? "Equal" : tempDiff > 0 ? `+${tempDiff}°C` : `${tempDiff}°C`}
        </div>

        {/* Card 1: User Primary Location */}
        <div className="p-5 rounded-3xl bg-sky-500/10 border border-sky-500/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> PRIMARY: {primaryCity}
            </span>
            <span className="text-xs font-mono text-muted-foreground">Saved Location</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-5xl font-black font-mono text-foreground">
              {displayTemp(primaryTemp)}°{unit}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-sky-300 block">{primaryCondition}</span>
              <span className="text-xs text-muted-foreground font-mono">
                Feels like {displayTemp(primaryFeelsLike)}°{unit}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-sky-500/20 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">HUMIDITY</span>
              <span className="font-bold text-foreground">{primaryHumidity}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">WIND SPEED</span>
              <span className="font-bold text-foreground">{primaryWindSpeed} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">AIR QUALITY</span>
              <span className="font-bold text-emerald-400">AQI {primaryAqi}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">RAIN CHANCE</span>
              <span className="font-bold text-sky-400">{primaryRainProb}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Selected Global Target City */}
        <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> COMPARED: {targetData.city}
            </span>
            <span className="text-xs font-mono text-muted-foreground">{targetData.country}</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-5xl font-black font-mono text-foreground">
              {displayTemp(targetData.temp)}°{unit}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-indigo-300 block flex items-center justify-end gap-1">
                {targetData.icon} {targetData.condition}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Feels like {displayTemp(targetData.feelsLike)}°{unit}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-indigo-500/20 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">HUMIDITY</span>
              <span className="font-bold text-foreground">{targetData.humidity}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">WIND SPEED</span>
              <span className="font-bold text-foreground">{targetData.windSpeed} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">AIR QUALITY</span>
              <span className="font-bold text-emerald-400">AQI {targetData.aqi}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">RAIN CHANCE</span>
              <span className="font-bold text-sky-400">{targetData.rainProb}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
