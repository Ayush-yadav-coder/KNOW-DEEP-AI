export interface UnifiedWeatherData {
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
  aqi: number;
  clothingAdvice: string;
  activityAdvice: string;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    icon: string;
    rainProb: number;
    windSpeed?: number;
  }>;
}

// In-memory cache for live weather consistency across Chat and WeatherStation
const weatherCache = new Map<string, { data: UnifiedWeatherData; timestamp: number }>();

export async function getCompliantWeatherData(cityName = "Mumbai"): Promise<UnifiedWeatherData> {
  const cleanCity = (cityName || "Mumbai").trim();
  const cacheKey = cleanCity.toLowerCase();
  const cached = weatherCache.get(cacheKey);

  // Return cached result if fresh within 5 minutes
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }

  try {
    const res = await fetch("/api/weather-feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: cleanCity }),
    });

    if (res.ok) {
      const serverData = await res.json();
      const current = serverData.current || {};
      const temp = Number(serverData.temp ?? current.temp ?? 24);
      const condition = serverData.condition || current.condition || "Partly Cloudy";

      const unified: UnifiedWeatherData = {
        city: serverData.city || cleanCity,
        country: serverData.country || "Global",
        temp,
        feelsLike: Number(serverData.feelsLike ?? current.feelsLike ?? temp),
        condition,
        humidity: Number(serverData.humidity ?? current.humidity ?? 55),
        windSpeed: Number(typeof serverData.windSpeed === "number" ? serverData.windSpeed : parseInt(serverData.windSpeed || "14", 10)),
        uvIndex: Number(serverData.uvIndex ?? current.uvIndex ?? 5),
        visibility: Number(serverData.visibility ?? 10),
        airQuality: serverData.airQuality || "Good (AQI 32)",
        aqi: Number(current.aqi ?? 32),
        clothingAdvice: serverData.clothingAdvice || serverData.smartDress || "Comfortable, breathable attire is recommended for today.",
        activityAdvice: serverData.activityAdvice || "Optimal conditions for outdoor activities and light exercise.",
        forecast: Array.isArray(serverData.forecast)
          ? serverData.forecast.map((f: any) => ({
              day: f.day || "Day",
              tempHigh: Number(f.tempHigh ?? f.high ?? temp + 2),
              tempLow: Number(f.tempLow ?? f.low ?? temp - 4),
              condition: f.condition || "Clear",
              icon: f.icon || "🌤️",
              rainProb: Number(f.rainProb || 15),
              windSpeed: Number(f.windSpeed || 12),
            }))
          : [
              { day: "Today", tempHigh: temp + 2, tempLow: temp - 4, condition, icon: "⛅", rainProb: 15 },
              { day: "Tomorrow", tempHigh: temp + 3, tempLow: temp - 3, condition: "Sunny", icon: "☀️", rainProb: 10 },
              { day: "Day 3", tempHigh: temp + 1, tempLow: temp - 5, condition: "Partly Cloudy", icon: "🌤️", rainProb: 20 },
            ],
      };

      weatherCache.set(cacheKey, { data: unified, timestamp: Date.now() });
      return unified;
    }
  } catch (e) {
    console.warn("Weather service fetch failed, using fallback:", e);
  }

  // Consistent deterministic fallback
  const fallback: UnifiedWeatherData = {
    city: cleanCity,
    country: "Global",
    temp: 24,
    feelsLike: 25,
    condition: "Partly Cloudy",
    humidity: 55,
    windSpeed: 14,
    uvIndex: 5,
    visibility: 10,
    airQuality: "Good (AQI 32)",
    aqi: 32,
    clothingAdvice: "Light comfortable clothing with sunglasses during daytime.",
    activityAdvice: "Great conditions for outdoor exercise, walking, and sightseeing.",
    forecast: [
      { day: "Today", tempHigh: 26, tempLow: 20, condition: "Partly Cloudy", icon: "⛅", rainProb: 15 },
      { day: "Tomorrow", tempHigh: 27, tempLow: 21, condition: "Sunny", icon: "☀️", rainProb: 10 },
      { day: "Day 3", tempHigh: 25, tempLow: 19, condition: "Scattered Clouds", icon: "🌤️", rainProb: 20 },
    ],
  };

  weatherCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
  return fallback;
}
