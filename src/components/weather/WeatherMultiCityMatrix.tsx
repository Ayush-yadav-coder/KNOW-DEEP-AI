import React, { useState } from "react";
import { Globe2, Plus, Trash2, MapPin, ArrowRightLeft, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CityWeatherSummary {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  aqi: string;
  rainRisk: number;
}

interface WeatherMultiCityMatrixProps {
  currentCity: string;
  onSelectCity: (city: string) => void;
}

export const WeatherMultiCityMatrix: React.FC<WeatherMultiCityMatrixProps> = ({
  currentCity,
  onSelectCity,
}) => {
  const [favoriteCities, setFavoriteCities] = useState<CityWeatherSummary[]>([
    { city: "New York", country: "USA", temp: 22, condition: "Partly Cloudy", humidity: 58, windSpeed: 14, aqi: "Good (34)", rainRisk: 15 },
    { city: "London", country: "UK", temp: 18, condition: "Light Rain", humidity: 75, windSpeed: 22, aqi: "Good (28)", rainRisk: 65 },
    { city: "Tokyo", country: "Japan", temp: 24, condition: "Clear Sky", humidity: 50, windSpeed: 10, aqi: "Good (22)", rainRisk: 5 },
    { city: "Paris", country: "France", temp: 21, condition: "Sunny", humidity: 52, windSpeed: 12, aqi: "Moderate (55)", rainRisk: 10 },
  ]);

  const [newCityInput, setNewCityInput] = useState("");

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;
    const name = newCityInput.trim();
    if (favoriteCities.some((c) => c.city.toLowerCase() === name.toLowerCase())) {
      setNewCityInput("");
      return;
    }

    setFavoriteCities([
      ...favoriteCities,
      {
        city: name,
        country: "Global",
        temp: Math.floor(Math.random() * 12 + 18),
        condition: "Sunny",
        humidity: 55,
        windSpeed: 14,
        aqi: "Good (30)",
        rainRisk: 10,
      },
    ]);
    setNewCityInput("");
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setFavoriteCities(favoriteCities.filter((c) => c.city !== cityToRemove));
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Multi-City Global Weather Telemetry Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Compare bookmarked international hubs side-by-side in real time
            </p>
          </div>
        </div>

        {/* Add City Input Form */}
        <form onSubmit={handleAddCity} className="flex items-center gap-2">
          <Input
            value={newCityInput}
            onChange={(e) => setNewCityInput(e.target.value)}
            placeholder="Add city to matrix..."
            className="h-9 w-44 sm:w-52 text-xs rounded-xl bg-card border-border/60"
          />
          <Button type="submit" size="sm" className="h-9 text-xs rounded-xl gap-1 bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </form>
      </div>

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {favoriteCities.map((item) => {
          const isActive = item.city.toLowerCase() === currentCity.toLowerCase();
          return (
            <div
              key={item.city}
              className={`p-4 rounded-2xl border transition-all space-y-3 relative group ${
                isActive
                  ? "bg-sky-500/10 border-sky-500/50 ring-2 ring-sky-500/20"
                  : "bg-muted/30 border-border/40 hover:border-border/80"
              }`}
            >
              {/* Top Row: City & Remove */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> {item.city}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.country}</span>
                </div>

                <button
                  onClick={() => handleRemoveCity(item.city)}
                  className="text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Temp & Condition */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {item.temp}°C
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  {item.condition}
                </span>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">HUMIDITY</span>
                  <span className="font-bold text-foreground">{item.humidity}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">WIND</span>
                  <span className="font-bold text-foreground">{item.windSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">AQI</span>
                  <span className="font-bold text-emerald-400">{item.aqi}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">RAIN RISK</span>
                  <span className="font-bold text-sky-400">{item.rainRisk}%</span>
                </div>
              </div>

              {/* Action: Select City */}
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCity(item.city)}
                className="w-full h-8 text-xs rounded-xl gap-1 pt-1"
              >
                {isActive ? "Active View" : "Load Telemetry"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
