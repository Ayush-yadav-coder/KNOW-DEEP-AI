import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Calendar, TrendingUp, Droplets, Sun } from "lucide-react";

interface ForecastDay {
  day: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon?: string;
  rainProb?: number;
  windSpeed?: number;
}

interface WeatherSevenDayChartProps {
  forecast?: ForecastDay[];
  unit?: "C" | "F";
}

export const WeatherSevenDayChart: React.FC<WeatherSevenDayChartProps> = ({
  forecast = [],
  unit = "C",
}) => {
  const defaultForecast: ForecastDay[] = [
    { day: "Mon", tempHigh: 25, tempLow: 16, condition: "Sunny", icon: "☀️", rainProb: 10 },
    { day: "Tue", tempHigh: 24, tempLow: 16, condition: "Partly Cloudy", icon: "⛅", rainProb: 15 },
    { day: "Wed", tempHigh: 22, tempLow: 15, condition: "Rain Shower", icon: "🌧️", rainProb: 70 },
    { day: "Thu", tempHigh: 20, tempLow: 14, condition: "Thunderstorm", icon: "⛈️", rainProb: 85 },
    { day: "Fri", tempHigh: 23, tempLow: 16, condition: "Sunny", icon: "☀️", rainProb: 10 },
    { day: "Sat", tempHigh: 26, tempLow: 18, condition: "Clear Sky", icon: "🌤️", rainProb: 5 },
    { day: "Sun", tempHigh: 27, tempLow: 19, condition: "Partly Cloudy", icon: "⛅", rainProb: 15 },
  ];

  const days = forecast && forecast.length > 0 ? forecast : defaultForecast;

  // Convert helper
  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return c;
  };

  // Format data for Recharts
  const chartData = days.map((d) => ({
    day: d.day,
    high: convertTemp(d.tempHigh),
    low: convertTemp(d.tempLow),
    rain: d.rainProb ?? 10,
    condition: d.condition,
    icon: d.icon || "☀️",
  }));

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-1.5 font-mono text-white">
          <div className="font-bold text-sky-400 flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
            <span>{label} Forecast</span>
            <span className="text-base">{data.icon}</span>
          </div>
          <div className="text-slate-300 font-sans">{data.condition}</div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-amber-400 font-bold">High: {data.high}°{unit}</span>
            <span className="text-sky-300 font-bold">Low: {data.low}°{unit}</span>
          </div>
          <div className="text-sky-400 flex items-center gap-1 pt-0.5">
            <Droplets className="w-3 h-3" /> Rain Chance: {data.rain}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>7-Day Temperature Trend &amp; Precipitation Line Chart</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                Recharts Analytics
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Comparative daily high/low temperatures (°{unit}) &amp; precipitation probability curve
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> High Temp
          </span>
          <span className="flex items-center gap-1 text-sky-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Low Temp
          </span>
          <span className="flex items-center gap-1 text-blue-500 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/40 inline-block" /> Rain %
          </span>
        </div>
      </div>

      {/* Recharts Composed Chart Container */}
      <div className="w-full h-[260px] sm:h-[300px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 3", "dataMax + 3"]}
              unit={`°`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#60a5fa"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Precipitation Bar */}
            <Bar
              yAxisId="right"
              dataKey="rain"
              name="Rain Chance %"
              fill="#38bdf8"
              opacity={0.25}
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />

            {/* High Temperature Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="high"
              name={`High (°${unit})`}
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 7 }}
            />

            {/* Low Temperature Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="low"
              name={`Low (°${unit})`}
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 5, fill: "#38bdf8", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
