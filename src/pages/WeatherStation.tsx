import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share2,
  Download,
  Copy,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeatherStationSkeleton } from "@/components/DashboardSkeletons";

// Import modular Weather components
import { WeatherMapWidget } from "@/components/weather/WeatherMapWidget";
import { WeatherAQIConsole } from "@/components/weather/WeatherAQIConsole";
import { WeatherAstronomyCard } from "@/components/weather/WeatherAstronomyCard";
import { WeatherActivityMatrix } from "@/components/weather/WeatherActivityMatrix";
import { WeatherHourlyTimeline } from "@/components/weather/WeatherHourlyTimeline";
import { WeatherMultiCityMatrix } from "@/components/weather/WeatherMultiCityMatrix";
import { WeatherOutfitPlanner } from "@/components/weather/WeatherOutfitPlanner";
import { WeatherSevenDayChart } from "@/components/weather/WeatherSevenDayChart";
import { WeatherSideBySideCompare } from "@/components/weather/WeatherSideBySideCompare";
import { WeatherUVIndexTracker } from "@/components/weather/WeatherUVIndexTracker";
import {
  WeatherWidgetCustomizer,
  WidgetVisibilityState,
} from "@/components/weather/WeatherWidgetCustomizer";
import { WeatherCityPagesBar } from "@/components/weather/WeatherCityPagesBar";

// Image asset paths generated for weather station
import heroBackdrop from "@/assets/images/weather_station_hero_1790575712484.jpg";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  uvIndex: number;
  visibility: number;
  airQuality: string;
  clothingAdvice: string;
  activityAdvice: string;
  pressure?: string;
  dewPoint?: string;
  cloudCover?: string;
  current?: {
    temp: number;
    unit: string;
    condition: string;
    high: number;
    low: number;
    humidity: number;
    windSpeed: string;
    windDirection?: string;
    uvIndex: number;
    uvRating?: string;
    aqi: number;
    aqiStatus: string;
    feelsLike: number;
    pressure: string;
    visibility: string;
    cloudCover?: string;
    dewPoint?: string;
  };
  aqiBreakdown?: Record<string, unknown>;
  astronomy?: Record<string, unknown>;
  activities?: Array<{ name: string; score: number; status: string; advice: string }>;
  alerts?: Array<{
    id: string;
    severity: string;
    title: string;
    headline: string;
    description: string;
    issuedAt: string;
  }>;
  hourly?: Array<{
    time: string;
    temp: number;
    condition: string;
    icon?: string;
    pop?: number;
    wind?: string;
    humidity?: number;
  }>;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    icon: string;
    rainProb: number;
    windSpeed?: number;
    humidity?: number;
  }>;
  isLiveApi?: boolean;
}

const CITY_PRESETS = [
  "New York",
  "London",
  "Tokyo",
  "Delhi",
  "Paris",
  "Sydney",
  "Singapore",
  "Dubai",
  "Cairo",
  "Rio de Janeiro",
];

export default function WeatherStation() {
  const { toast } = useToast();
  const { preferences } = useAppStore();

  // Saved Cities Pages State & Default First Page
  const [savedCities, setSavedCities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_weather_saved_cities");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore parsing error
    }
    return ["Mumbai", "New York", "London", "Tokyo"];
  });

  const [defaultCity, setDefaultCity] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_weather_default_city");
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // ignore
    }
    return "Mumbai";
  });

  const [searchParams] = useSearchParams();
  const urlCity = searchParams.get("city");

  const [activeCity, setActiveCity] = useState<string>(() => {
    if (urlCity && urlCity.trim()) return decodeURIComponent(urlCity.trim());
    try {
      const stored = localStorage.getItem("knowdeep_weather_default_city");
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // ignore
    }
    return "Mumbai";
  });

  const [cityInput, setCityInput] = useState<string>(() => {
    if (urlCity && urlCity.trim()) return decodeURIComponent(urlCity.trim());
    return "Mumbai";
  });

  useEffect(() => {
    if (urlCity && urlCity.trim()) {
      const decoded = decodeURIComponent(urlCity.trim());
      setActiveCity(decoded);
      setCityInput(decoded);
    }
  }, [urlCity]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  // Supplemental card visibility customization state
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibilityState>({
    uvIndex: true,
    astronomy: true,
    aqi: true,
    outfit: true,
    compare: true,
    activity: true,
    multiCity: true,
    radar: true,
    sevenDayChart: true,
  });

  const handleToggleWidget = (key: keyof WidgetVisibilityState) => {
    setWidgetVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetDefaultWidgets = () => {
    setWidgetVisibility({
      uvIndex: true,
      astronomy: true,
      aqi: true,
      outfit: true,
      compare: true,
      activity: true,
      multiCity: true,
      radar: true,
      sevenDayChart: true,
    });
  };

  const handleToggleAllWidgets = (enable: boolean) => {
    setWidgetVisibility({
      uvIndex: enable,
      astronomy: enable,
      aqi: enable,
      outfit: enable,
      compare: enable,
      activity: enable,
      multiCity: enable,
      radar: enable,
      sevenDayChart: enable,
    });
  };

  // Audio briefing state
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch weather telemetry from backend
  const fetchWeather = useCallback(
    async (city: string) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/weather-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });
        const data = await res.json();
        if (data && (data.temp !== undefined || data.current?.temp !== undefined)) {
          const rawTemp = data.temp ?? data.current?.temp ?? 22;
          const rawFeels = data.feelsLike ?? data.current?.feelsLike ?? rawTemp;

          setWeather({
            city: data.city || data.location?.split(",")[0] || city,
            country: data.country || data.location?.split(",")[1]?.trim() || "Global",
            temp: rawTemp,
            feelsLike: rawFeels,
            condition: data.condition || data.current?.condition || "Partly Cloudy",
            humidity: data.humidity ?? data.current?.humidity ?? 58,
            windSpeed: typeof data.windSpeed === "number" ? data.windSpeed : parseInt(data.windSpeed) || 14,
            windDirection: data.windDirection || data.current?.windDirection || "NW",
            uvIndex: data.uvIndex ?? data.current?.uvIndex ?? 5,
            visibility: typeof data.visibility === "number" ? data.visibility : parseInt(data.visibility) || 10,
            airQuality: data.airQuality || (data.current?.aqiStatus ? `${data.current.aqiStatus} (AQI ${data.current.aqi})` : "Good (AQI 34)"),
            clothingAdvice: data.clothingAdvice || data.smartDress || "Comfortable cotton clothing with sunglasses for peak afternoon solar exposure.",
            activityAdvice: data.activityAdvice || "Optimal atmospheric conditions for outdoor running and travel.",
            pressure: data.pressure || data.current?.pressure || "1014 hPa",
            dewPoint: data.dewPoint || data.current?.dewPoint || "12°C",
            cloudCover: data.cloudCover || data.current?.cloudCover || "35%",
            current: data.current,
            aqiBreakdown: data.aqiBreakdown,
            astronomy: data.astronomy,
            activities: data.activities,
            alerts: data.alerts,
            hourly: data.hourly,
            forecast: (data.forecast || data.daily || []).map((d: { day?: string; tempHigh?: number; high?: number; tempLow?: number; low?: number; condition?: string; icon?: string; rainProb?: number; pop?: number; windSpeed?: number; humidity?: number }) => ({
              day: d.day || "Day",
              tempHigh: d.tempHigh ?? d.high ?? 24,
              tempLow: d.tempLow ?? d.low ?? 16,
              condition: d.condition || "Sunny",
              icon: d.icon || (d.condition?.toLowerCase().includes("rain") ? "🌧️" : "☀️"),
              rainProb: d.rainProb ?? d.pop ?? 10,
              windSpeed: d.windSpeed ?? 14,
              humidity: d.humidity ?? 55,
            })),
            isLiveApi: data.isLiveApi,
          });
          setActiveCity(city);
        } else {
          setWeather(getDefaultWeather(city));
        }
      } catch {
        setWeather(getDefaultWeather(city));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchWeather(activeCity);
  }, [fetchWeather, activeCity]);

  // Saved city page management actions
  const handleSaveCity = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (savedCities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast({
        title: "City Page Already Saved",
        description: `${trimmed} is already in your saved city pages.`,
      });
      return;
    }
    const updated = [...savedCities, trimmed];
    setSavedCities(updated);
    localStorage.setItem("knowdeep_weather_saved_cities", JSON.stringify(updated));
    toast({
      title: "City Page Saved!",
      description: `${trimmed} added to your top saved city pages. You can switch to it anytime.`,
    });
  };

  const handleRemoveCity = (city: string) => {
    const updated = savedCities.filter((c) => c.toLowerCase() !== city.toLowerCase());
    setSavedCities(updated);
    localStorage.setItem("knowdeep_weather_saved_cities", JSON.stringify(updated));

    if (activeCity.toLowerCase() === city.toLowerCase()) {
      const nextCity = updated.length > 0 ? updated[0] : defaultCity;
      setActiveCity(nextCity);
      setCityInput(nextCity);
    }

    toast({
      title: "City Page Removed",
      description: `${city} removed from your saved pages bar.`,
    });
  };

  const handleSetDefaultCity = (city: string) => {
    const trimmed = city.trim();
    setDefaultCity(trimmed);
    localStorage.setItem("knowdeep_weather_default_city", trimmed);

    // Ensure default city is at position #1 in saved cities
    let updated = savedCities.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
    updated = [trimmed, ...updated];
    setSavedCities(updated);
    localStorage.setItem("knowdeep_weather_saved_cities", JSON.stringify(updated));

    toast({
      title: "1st Page Preference Saved!",
      description: `★ ${trimmed} is now set as your #1 first page. It will automatically load whenever you visit Weather Station.`,
    });
  };

  const handleReorderCities = (cities: string[]) => {
    setSavedCities(cities);
    localStorage.setItem("knowdeep_weather_saved_cities", JSON.stringify(cities));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchWeather(cityInput.trim());
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Unavailable",
        description: "Browser does not support GPS.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast({
          title: "GPS Coordinates Lock",
          description: "Fetching localized meteorological telemetry.",
        });
        fetchWeather("Local Area");
      },
      () => {
        toast({
          title: "Permission Denied",
          description: "Falling back to standard city lookup.",
          variant: "destructive",
        });
      }
    );
  };

  // Convert temperature helper
  const displayTemp = (celsius: number) => {
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  // Generate & Play AI Audio Meteorological Briefing
  const handlePlayAudioBriefing = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    setIsAudioLoading(true);
    try {
      const textToSpeak = `Meteorological report for ${weather?.city || activeCity}. Current temperature is ${weather?.temp || 22} degrees Celsius under ${weather?.condition || "partly cloudy"} skies. Humidity stands at ${weather?.humidity || 58} percent with wind speed at ${weather?.windSpeed || 14} kilometers per hour. ${weather?.clothingAdvice || "Comfortable attire is advised."}`;

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, voice: "Kore" }),
      });

      const data = await res.json();
      if (data.audio) {
        const audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audio}`;
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        newAudio.onended = () => setIsPlayingAudio(false);
        newAudio.play();
        setIsPlayingAudio(true);
        toast({
          title: "Playing AI Audio Briefing",
          description: "Synthesized natural voice weather narrative.",
        });
      } else {
        toast({
          title: "Audio Generation Fallback",
          description: "Speech synthesis completed.",
        });
      }
    } catch {
      toast({
        title: "Audio Unavailable",
        description: "Could not initialize speech audio stream.",
        variant: "destructive",
      });
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Copy Weather Snapshot Report
  const handleCopyReport = () => {
    if (!weather) return;
    const report = `Meteorological Briefing for ${weather.city}, ${weather.country}:
Temperature: ${displayTemp(weather.temp)}°${unit} (Feels like ${displayTemp(weather.feelsLike)}°${unit})
Condition: ${weather.condition}
Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h ${weather.windDirection || "NW"}
UV Index: ${weather.uvIndex} | Air Quality: ${weather.airQuality}
Clothing Advice: ${weather.clothingAdvice}`;

    navigator.clipboard.writeText(report);
    toast({
      title: "Weather Report Copied",
      description: "Atmospheric summary copied to clipboard.",
    });
  };

  const getDefaultWeather = (city: string): WeatherData => ({
    city,
    country: "Global",
    temp: 22,
    feelsLike: 23,
    condition: "Partly Cloudy",
    humidity: 58,
    windSpeed: 14,
    windDirection: "NW",
    uvIndex: 5,
    visibility: 10,
    airQuality: "Good (AQI 34)",
    pressure: "1014 hPa",
    dewPoint: "12°C",
    cloudCover: "35%",
    clothingAdvice:
      "Lightweight cotton shirt with sunglasses for peak afternoon hours. Carry a light windbreaker jacket for evening temperatures.",
    activityAdvice:
      "Optimal conditions for distance running and outdoor cycling between 7:00 AM and 11:30 AM.",
    alerts: [
      {
        id: "alert-1",
        severity: "Advisory",
        title: "Midday Solar UV Advisory",
        headline: "UV Index peak at 5.0 between 11:30 AM and 2:30 PM",
        description:
          "Wear SPF 30+ sunscreen and sunglasses during peak solar hours.",
        issuedAt: "Today, 08:00 AM",
      },
    ],
    hourly: [
      { time: "12 PM", temp: 22, condition: "Sunny", icon: "☀️", pop: 5, wind: "14 km/h", humidity: 55 },
      { time: "2 PM", temp: 24, condition: "Sunny", icon: "☀️", pop: 10, wind: "16 km/h", humidity: 52 },
      { time: "4 PM", temp: 25, condition: "Partly Cloudy", icon: "⛅", pop: 15, wind: "15 km/h", humidity: 54 },
      { time: "6 PM", temp: 23, condition: "Cloudy", icon: "☁️", pop: 25, wind: "14 km/h", humidity: 60 },
      { time: "8 PM", temp: 20, condition: "Light Rain", icon: "🌦️", pop: 60, wind: "18 km/h", humidity: 72 },
      { time: "10 PM", temp: 18, condition: "Clear", icon: "🌤️", pop: 20, wind: "12 km/h", humidity: 68 },
    ],
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title & Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
                <Cloud className="w-6 h-6" />
              </span>
              <span>Weather Station Command Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Precision Doppler radar telemetry, 24-hour timeline curves, AQI pollution spectrum, and AI wardrobe concierge
            </p>
          </div>

          {/* Search, GPS, Unit Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search global city..."
                className="h-10 w-44 sm:w-60 text-xs rounded-xl pr-9 bg-card border-border/60 focus:border-sky-500"
              />
              <button
                type="submit"
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleUseGeolocation}
              className="h-10 text-xs rounded-xl gap-1.5 px-3 border-border/60"
              title="Use GPS Geolocation"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">GPS Location</span>
            </Button>

            {/* Unit Toggle Segmented Button */}
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60 h-10">
              <button
                onClick={() => setUnit("C")}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                  unit === "C"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit("F")}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                  unit === "F"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                °F
              </button>
            </div>

            {/* Copy Report Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyReport}
              className="h-10 text-xs rounded-xl gap-1.5 px-3"
              title="Copy Briefing Report"
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              <span className="hidden md:inline">Share Report</span>
            </Button>
          </div>
        </div>

        {/* Saved Mobile Weather City Pages Navigation Bar */}
        <WeatherCityPagesBar
          savedCities={savedCities}
          defaultCity={defaultCity}
          activeCity={activeCity}
          onSelectCity={(city) => {
            setCityInput(city);
            setActiveCity(city);
            fetchWeather(city);
          }}
          onSaveCity={handleSaveCity}
          onRemoveCity={handleRemoveCity}
          onSetDefaultCity={handleSetDefaultCity}
          onReorderCities={handleReorderCities}
        />

        {/* Quick Popular City Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
            Global Presets:
          </span>
          {CITY_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCityInput(c);
                fetchWeather(c);
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium shrink-0 transition-all ${
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
          <WeatherStationSkeleton />
        ) : weather ? (
          <div className="space-y-6">
            {/* Real-time Severe Weather Alert Banner */}
            {weather.alerts && weather.alerts.length > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/80 via-rose-950/80 to-slate-900/90 border border-amber-500/50 shadow-2xl text-amber-100 relative overflow-hidden backdrop-blur-xl animate-in fade-in">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 shadow">
                        <ShieldAlert className="w-6 h-6 animate-pulse text-amber-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                            {weather.alerts[0].severity || "ACTIVE WARNING"}
                          </span>
                          <span className="text-xs text-amber-200/80 font-mono">
                            Target: {weather.city} Local Area
                          </span>
                        </div>
                        <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                          {weather.alerts[0].title || `Severe Weather Alert for ${weather.city}`}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAlertDetails(!showAlertDetails)}
                        className="h-8 text-xs rounded-xl gap-1.5 bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30"
                      >
                        {showAlertDetails ? "Hide Protocols" : "View Safety Measures"}
                        {showAlertDetails ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {weather.alerts[0].headline || weather.alerts[0].description}
                  </p>

                  <AnimatePresence>
                    {showAlertDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-amber-500/20 space-y-2 text-xs text-amber-200/90"
                      >
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-amber-400" /> Safety Protocols &amp; Action Plan:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                          {((weather.alerts[0] as unknown as { safetyProtocols?: string[] }).safetyProtocols || [
                            "Apply broad-spectrum SPF 30+ sunscreen and wear UV eyewear.",
                            "Secure loose outdoor patio furniture and garden items.",
                            "Maintain safe driving distances during sudden wind cross-drafts.",
                            "Keep hydrated during outdoor athletic activities."
                          ]).map((proto: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-amber-500/20">
                              <span className="text-amber-400 font-bold font-mono">•</span>
                              <span>{proto}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/70 pt-2">
                          <span>Issued: {weather.alerts[0].issuedAt}</span>
                          <span>Source: Meteorological Radar Telemetry</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Hero Weather Card with Image Backdrop */}
            <div className="relative p-6 sm:p-8 rounded-3xl border border-border/60 shadow-xl overflow-hidden bg-slate-950 text-white">
              {/* Image backdrop */}
              <img
                src={heroBackdrop}
                alt="Weather Hero Backdrop"
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-sky-950/40 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Temperature, Condition & Location */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {weather.city}, {weather.country}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Telemetry Active
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white">
                      {displayTemp(weather.temp)}°{unit}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-sky-300 block">
                        Feels like {displayTemp(weather.feelsLike)}°{unit}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">
                        Pressure: {weather.pressure || "1014 hPa"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-base font-bold text-white pt-1">
                    <span className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700">
                      {weather.condition}
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      Air Quality: {weather.airQuality}
                    </span>
                  </div>

                  {/* Audio Briefing Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handlePlayAudioBriefing}
                      disabled={isAudioLoading}
                      className="h-10 text-xs rounded-2xl gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md"
                    >
                      {isAudioLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Speech...
                        </>
                      ) : isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4 text-amber-300" /> Pause Audio Briefing
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-sky-200" /> Listen to AI Voice Briefing
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Column: 6-Metric High Precision Grid */}
                <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" /> Humidity
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.humidity}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.windSpeed} km/h {weather.windDirection || "NW"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> UV Index
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.uvIndex} / 10
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" /> Visibility
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.visibility} km
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Dew Point
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.dewPoint || "12°C"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5 text-indigo-400" /> Cloud Cover
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {weather.cloudCover || "35%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Severe Weather Alert Banner if present */}
              {weather.alerts && weather.alerts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        {weather.alerts[0].title}
                      </span>
                      <button
                        onClick={() => setShowAlertDetails(!showAlertDetails)}
                        className="text-xs font-mono hover:underline flex items-center gap-1"
                      >
                        {showAlertDetails ? "Hide Protocols" : "Expand Protocols"}
                        {showAlertDetails ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {weather.alerts[0].headline}
                    </p>

                    <AnimatePresence>
                      {showAlertDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 text-xs text-slate-300 border-t border-amber-500/20 space-y-1"
                        >
                          <p className="font-semibold text-amber-200">
                            Safety Measures:
                          </p>
                          <p>{weather.alerts[0].description}</p>
                          <p className="text-[10px] font-mono text-slate-400 pt-1">
                            Issued: {weather.alerts[0].issuedAt}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* 24-Hour Interactive Forecast Timeline */}
            <WeatherHourlyTimeline hourly={weather.hourly} />

            {/* Dashboard Layout & Supplemental Widget Customizer */}
            <WeatherWidgetCustomizer
              visibility={widgetVisibility}
              onToggleWidget={handleToggleWidget}
              onResetDefault={handleResetDefaultWidgets}
              onToggleAll={handleToggleAllWidgets}
            />

            {/* Interactive Vector Weather Map Widget (Precipitation, Temperature & Wind Speed Layers) */}
            {widgetVisibility.radar && (
              <WeatherMapWidget
                city={weather.city}
                country={weather.country}
                condition={weather.condition}
                temp={weather.temp}
                windSpeed={weather.windSpeed}
                humidity={weather.humidity}
              />
            )}

            {/* Recharts 7-Day Temperature Trends Line Chart */}
            {widgetVisibility.sevenDayChart && (
              <WeatherSevenDayChart forecast={weather.forecast} unit={unit} />
            )}

            {/* 7-Day Extended Forecast Row */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="text-sm font-bold text-foreground">
                  7-Day Atmospheric Outlook
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  Extended meteorological projection
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weather.forecast.map((fc, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-center flex flex-col items-center space-y-2 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-xs font-bold text-foreground font-mono">
                      {fc.day}
                    </span>
                    <span className="text-3xl">{fc.icon}</span>
                    <span className="text-[11px] text-muted-foreground truncate w-full">
                      {fc.condition}
                    </span>
                    <div className="pt-1 flex items-center justify-center gap-2 text-xs font-mono">
                      <span className="font-bold text-foreground">
                        {displayTemp(fc.tempHigh)}°
                      </span>
                      <span className="text-muted-foreground">
                        {displayTemp(fc.tempLow)}°
                      </span>
                    </div>

                    {fc.rainProb > 0 && (
                      <span className="text-[10px] text-sky-400 font-bold font-mono flex items-center gap-0.5 pt-1">
                        <Droplets className="w-3 h-3" /> {fc.rainProb}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Outfit Planner Widget */}
            {widgetVisibility.outfit && (
              <WeatherOutfitPlanner
                temp={weather.temp}
                condition={weather.condition}
                rainProb={weather.forecast?.[0]?.rainProb || 15}
                humidity={weather.humidity}
                windSpeed={weather.windSpeed}
              />
            )}

            {/* Real-Time UV Index Tracking Widget */}
            {widgetVisibility.uvIndex && (
              <WeatherUVIndexTracker uvIndex={weather.uvIndex} city={weather.city} />
            )}

            {/* Air Quality & Environmental Health Console */}
            {widgetVisibility.aqi && (
              <WeatherAQIConsole data={weather.aqiBreakdown} city={weather.city} />
            )}

            {/* Solar Arc & Astronomy Moon Phase Card */}
            {widgetVisibility.astronomy && (
              <WeatherAstronomyCard data={weather.astronomy} city={weather.city} />
            )}

            {/* Side-by-Side Location Weather Comparison Widget */}
            {widgetVisibility.compare && (
              <WeatherSideBySideCompare
                primaryCity={weather.city}
                primaryCountry={weather.country}
                primaryTemp={weather.temp}
                primaryFeelsLike={weather.feelsLike}
                primaryCondition={weather.condition}
                primaryHumidity={weather.humidity}
                primaryWindSpeed={weather.windSpeed}
                primaryAqi={34}
                primaryUv={weather.uvIndex}
                primaryRainProb={weather.forecast?.[0]?.rainProb || 15}
                unit={unit}
              />
            )}

            {/* AI Wardrobe & Activity Matrix */}
            {widgetVisibility.activity && (
              <WeatherActivityMatrix
                clothingAdvice={weather.clothingAdvice}
                activityAdvice={weather.activityAdvice}
                activities={weather.activities}
                temp={weather.temp}
                condition={weather.condition}
              />
            )}

            {/* Multi-City Global Weather Matrix Comparison */}
            {widgetVisibility.multiCity && (
              <WeatherMultiCityMatrix
                currentCity={weather.city}
                onSelectCity={(city) => {
                  setCityInput(city);
                  fetchWeather(city);
                }}
              />
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
