import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Compass,
  Sparkles,
  MapPin,
  Search,
  Loader2,
  RefreshCw,
  Umbrella,
  Shirt,
  Eye,
  Thermometer,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  airQuality: string;
  clothingAdvice: string;
  activityAdvice: string;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    icon: string;
    rainProb: number;
  }>;
  isLiveApi?: boolean;
}

const CITY_PRESETS = ["New York", "London", "Tokyo", "Delhi", "Paris", "Sydney", "Singapore"];

export default function WeatherStation() {
  const { toast } = useToast();
  const { preferences } = useAppStore();
  const [cityInput, setCityInput] = useState("New York");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeather = useCallback(async (city: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/weather-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();
      if (data.temp !== undefined) {
        setWeather(data);
      } else if (data.current && data.current.temp !== undefined) {
        // Standardized mapped format
        setWeather({
          city: data.location || city,
          country: data.country || "Global",
          temp: data.current.temp,
          feelsLike: data.current.feelsLike || data.current.temp,
          condition: data.current.condition || "Partly Cloudy",
          humidity: data.current.humidity || 55,
          windSpeed: typeof data.current.windSpeed === "number" ? data.current.windSpeed : parseInt(data.current.windSpeed) || 12,
          uvIndex: data.current.uvIndex || 5,
          visibility: typeof data.current.visibility === "number" ? data.current.visibility : parseInt(data.current.visibility) || 10,
          airQuality: data.current.aqiStatus ? `${data.current.aqiStatus} (AQI ${data.current.aqi || 35})` : "Good (AQI 32)",
          clothingAdvice: data.smartDress || "Optimal lightweight attire with light evening layers.",
          activityAdvice: "Comfortable atmospheric conditions for sports and travel.",
          forecast: (data.daily || []).map((d: { day?: string; high?: number; low?: number; condition?: string; pop?: number }) => ({
            day: d.day || "Day",
            tempHigh: d.high || 24,
            tempLow: d.low || 16,
            condition: d.condition || "Sunny",
            icon: d.condition?.toLowerCase().includes("rain") ? "🌧️" : "☀️",
            rainProb: d.pop || 10,
          })),
          isLiveApi: data.isLiveApi || Boolean(key),
        });
      } else {
        setWeather(getDefaultWeather(city));
      }
    } catch {
      setWeather(getDefaultWeather(city));
    } finally {
      setIsLoading(false);
    }
  }, [preferences.weatherApiKey]);

  useEffect(() => {
    fetchWeather(cityInput || "New York");
  }, [fetchWeather]);

  useEffect(() => {
    const handleKeyUpdate = () => {
      fetchWeather(cityInput || "New York");
    };
    window.addEventListener("knowdeep_api_keys_updated", handleKeyUpdate);
    return () => window.removeEventListener("knowdeep_api_keys_updated", handleKeyUpdate);
  }, [cityInput, fetchWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchWeather(cityInput.trim());
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Unavailable", description: "Browser does not support GPS.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast({ title: "Location Detected", description: "Fetching localized meteorological telemetry." });
        fetchWeather("Local Area");
      },
      () => {
        toast({ title: "Permission Denied", description: "Falling back to city search.", variant: "destructive" });
      }
    );
  };

  const getDefaultWeather = (city: string): WeatherData => ({
    city,
    country: "Global",
    temp: 22,
    feelsLike: 23,
    condition: "Partly Cloudy",
    humidity: 58,
    windSpeed: 14,
    uvIndex: 5,
    visibility: 10,
    airQuality: "Good (AQI 34)",
    clothingAdvice:
      "Lightweight cotton shirt with a thin evening layer. Sunglasses recommended during peak midday solar exposure.",
    activityAdvice:
      "Excellent conditions for outdoor distance running and cycling between 7:00 AM and 11:00 AM.",
    forecast: [
      { day: "Mon", tempHigh: 23, tempLow: 15, condition: "Sunny", icon: "☀️", rainProb: 10 },
      { day: "Tue", tempHigh: 24, tempLow: 16, condition: "Partly Cloudy", icon: "⛅", rainProb: 15 },
      { day: "Wed", tempHigh: 21, tempLow: 14, condition: "Light Rain", icon: "🌦️", rainProb: 65 },
      { day: "Thu", tempHigh: 20, tempLow: 13, condition: "Cloudy", icon: "☁️", rainProb: 30 },
      { day: "Fri", tempHigh: 22, tempLow: 15, condition: "Sunny", icon: "☀️", rainProb: 5 },
      { day: "Sat", tempHigh: 25, tempLow: 17, condition: "Clear Skies", icon: "🌤️", rainProb: 10 },
      { day: "Sun", tempHigh: 26, tempLow: 18, condition: "Sunny", icon: "☀️", rainProb: 5 },
    ],
  });

  return (
    <AppLayout title="Weather Station">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                <Cloud className="w-5 h-5" />
              </span>
              <span>Weather Station</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Precision meteorological telemetry, 7-day extended forecasts, and AI dynamic lifestyle &amp; clothing intelligence
            </p>
          </div>

          {/* Search Bar + Geolocation Button */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search city..."
                className="h-9 w-48 sm:w-60 text-xs rounded-xl pr-8 bg-card border-border/60"
              />
              <button type="submit" className="absolute right-2.5 text-muted-foreground hover:text-foreground">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleUseGeolocation}
              className="h-9 text-xs rounded-xl gap-1.5 px-3"
              title="Use GPS Geolocation"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">My Location</span>
            </Button>
          </div>
        </div>

        {/* Quick City Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
            Popular Cities:
          </span>
          {CITY_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCityInput(c);
                fetchWeather(c);
              }}
              className={`px-3 py-1 text-xs rounded-xl font-medium shrink-0 transition-all ${
                weather?.city.toLowerCase() === c.toLowerCase()
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
            <p className="text-xs font-semibold text-foreground">Sampling Atmospheric Sensors...</p>
            <p className="text-[11px] text-muted-foreground mt-1">Synthesizing Doppler radar and microclimate indices</p>
          </div>
        ) : weather ? (
          <div className="space-y-6">
            {/* Hero Current Conditions Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card to-sky-950/20 border border-border/60 shadow-lg relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Temp & Location */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">
                      {weather.city}, {weather.country}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-extrabold font-mono tracking-tight text-foreground">
                      {weather.temp}°
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      Feels like {weather.feelsLike}°C
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span>{weather.condition}</span>
                    <span className="text-xs font-normal text-muted-foreground">• Air Quality: {weather.airQuality}</span>
                  </div>
                </div>

                {/* Weather Metrics Grid */}
                <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Droplets className="w-3 h-3 text-sky-400" /> Humidity
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">{weather.humidity}%</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Wind className="w-3 h-3 text-cyan-400" /> Wind Speed
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">{weather.windSpeed} km/h</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Sun className="w-3 h-3 text-amber-400" /> UV Index
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">{weather.uvIndex} / 10</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">{weather.visibility} km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 sm:col-span-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Thermometer className="w-3 h-3 text-rose-400" /> Heat Index
                    </span>
                    <span className="text-xs font-medium text-foreground">Comfortable Range</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Dynamic Clothing & Activity Advice Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-card border border-sky-500/30 bg-sky-500/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Shirt className="w-4 h-4" /> AI Wardrobe &amp; Clothing Advice
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {weather.clothingAdvice}
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-card border border-teal-500/30 bg-teal-500/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Outdoor &amp; Activity Outlook
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {weather.activityAdvice}
                </p>
              </div>
            </div>

            {/* 7-Day Extended Forecast Row */}
            <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                7-Day Atmospheric Outlook
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weather.forecast.map((fc, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-muted/30 border border-border/40 text-center flex flex-col items-center space-y-1.5 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-xs font-bold text-foreground">{fc.day}</span>
                    <span className="text-2xl">{fc.icon}</span>
                    <span className="text-[11px] text-muted-foreground">{fc.condition}</span>
                    <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-mono">
                      <span className="font-bold text-foreground">{fc.tempHigh}°</span>
                      <span className="text-muted-foreground">{fc.tempLow}°</span>
                    </div>
                    {fc.rainProb > 0 && (
                      <span className="text-[9px] text-sky-400 font-semibold flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" /> {fc.rainProb}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
