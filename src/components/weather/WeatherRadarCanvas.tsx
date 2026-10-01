import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  MapPin,
  Eye,
  Wind,
  CloudRain,
  Radio,
  Maximize2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherRadarCanvasProps {
  city: string;
  country?: string;
  condition?: string;
  temp?: number;
}

type LayerType = "precipitation" | "wind" | "aqi" | "clouds";

export const WeatherRadarCanvas: React.FC<WeatherRadarCanvasProps> = ({
  city,
  country = "Global",
  condition = "Partly Cloudy",
  temp = 22,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerType>("precipitation");
  const [timeOffset, setTimeOffset] = useState(0); // -120m to +120m
  const [clickedCoord, setClickedCoord] = useState<{
    x: number;
    y: number;
    lat: string;
    lng: string;
    val: string;
  } | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  // Render atmospheric simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Map Grid & Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radar Grid rings
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.lineWidth = 1;

      for (let r = 50; r <= 300; r += 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // 2. Animated Layer Rendering
      const timeFactor = isPlaying ? (Date.now() / 1000) % 3600 : step;

      if (activeLayer === "precipitation") {
        // Render precipitation rain/storm cells
        for (let i = 0; i < 8; i++) {
          const offsetX = Math.sin(timeFactor * 0.2 + i) * 60 + (timeOffset * 0.8);
          const offsetY = Math.cos(timeFactor * 0.15 + i * 2) * 40;
          const px = (centerX - 120 + i * 35 + offsetX) % canvas.width;
          const py = (centerY - 80 + i * 20 + offsetY) % canvas.height;
          const radius = 30 + (i % 3) * 20;

          const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
          if (i % 3 === 0) {
            grad.addColorStop(0, "rgba(239, 68, 68, 0.7)"); // Heavy rain / thunderstorm
            grad.addColorStop(0.5, "rgba(245, 158, 11, 0.5)");
            grad.addColorStop(1, "rgba(245, 158, 11, 0)");
          } else {
            grad.addColorStop(0, "rgba(14, 165, 233, 0.6)"); // Moderate rain
            grad.addColorStop(0.6, "rgba(56, 189, 248, 0.3)");
            grad.addColorStop(1, "rgba(56, 189, 248, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeLayer === "wind") {
        // Render animated wind vector particles
        ctx.strokeStyle = "rgba(45, 212, 191, 0.6)";
        ctx.lineWidth = 1.5;

        for (let x = 30; x < canvas.width; x += 30) {
          for (let y = 30; y < canvas.height; y += 30) {
            const angle = Math.sin(x * 0.01 + y * 0.01 + timeFactor * 0.5) * Math.PI;
            const length = 12 + Math.cos(x * 0.02) * 6;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();

            // Arrow tip
            ctx.fillStyle = "rgba(45, 212, 191, 0.8)";
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * length, y + Math.sin(angle) * length, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (activeLayer === "aqi") {
        // Render Air Quality Heatmap
        for (let i = 0; i < 5; i++) {
          const px = (centerX + (i - 2) * 70) % canvas.width;
          const py = (centerY + Math.sin(i + timeFactor * 0.1) * 50) % canvas.height;
          const grad = ctx.createRadialGradient(px, py, 5, px, py, 80);

          if (i === 1) {
            grad.addColorStop(0, "rgba(245, 158, 11, 0.5)"); // Moderate AQI
            grad.addColorStop(1, "rgba(245, 158, 11, 0)");
          } else {
            grad.addColorStop(0, "rgba(16, 185, 129, 0.5)"); // Good AQI
            grad.addColorStop(1, "rgba(16, 185, 129, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 80, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeLayer === "clouds") {
        // Render Cloud Cover Coverage
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        for (let i = 0; i < 6; i++) {
          const px = (centerX - 100 + i * 50 + (timeFactor * 10) % canvas.width) % canvas.width;
          const py = (centerY - 50 + (i % 2) * 60) % canvas.height;
          ctx.beginPath();
          ctx.arc(px, py, 45, 0, Math.PI * 2);
          ctx.arc(px + 25, py - 10, 35, 0, Math.PI * 2);
          ctx.arc(px - 25, py + 10, 30, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Radar Sweep Line Animation
      const sweepAngle = (timeFactor * 1.5) % (Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * 300,
        centerY + Math.sin(sweepAngle) * 300
      );
      ctx.stroke();

      // Radar Sweep Glow sector
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 300, sweepAngle - 0.25, sweepAngle);
      ctx.closePath();
      ctx.fill();

      // 4. Center City Radar Marker
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulse ring around city
      const pulseRadius = 6 + (Math.floor(timeFactor * 20) % 24);
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - pulseRadius / 30})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Render Selected Crosshair
      if (clickedCoord) {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(clickedCoord.x, clickedCoord.y, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(clickedCoord.x - 15, clickedCoord.y);
        ctx.lineTo(clickedCoord.x + 15, clickedCoord.y);
        ctx.moveTo(clickedCoord.x, clickedCoord.y - 15);
        ctx.lineTo(clickedCoord.x, clickedCoord.y + 15);
        ctx.stroke();
      }

      if (isPlaying) {
        step++;
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activeLayer, timeOffset, clickedCoord]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Simulate coordinates and values based on position
    const lat = (40.7128 + (y - canvas.height / 2) * -0.01).toFixed(4);
    const lng = (-74.006 + (x - canvas.width / 2) * 0.01).toFixed(4);

    let val = "0.0 mm/h (Dry)";
    if (activeLayer === "precipitation") {
      val = `${(Math.random() * 8 + 0.2).toFixed(1)} mm/h (Rain Band)`;
    } else if (activeLayer === "wind") {
      val = `${Math.floor(Math.random() * 25 + 10)} km/h NW`;
    } else if (activeLayer === "aqi") {
      val = `AQI ${Math.floor(Math.random() * 30 + 25)} (Good)`;
    } else {
      val = `${Math.floor(Math.random() * 40 + 20)}% Cloud Density`;
    }

    setClickedCoord({ x, y, lat, lng, val });
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
      {/* Top Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>Interactive Meteorological Doppler Radar</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                Live 4K Vector
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live reflectivity telemetry &amp; atmospheric particle vectors for {city}, {country}
            </p>
          </div>
        </div>

        {/* Layer Selector Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-x-auto">
          <button
            onClick={() => setActiveLayer("precipitation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "precipitation"
                ? "bg-sky-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain</span>
          </button>

          <button
            onClick={() => setActiveLayer("wind")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "wind"
                ? "bg-teal-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>

          <button
            onClick={() => setActiveLayer("aqi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "aqi"
                ? "bg-amber-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>AQI</span>
          </button>

          <button
            onClick={() => setActiveLayer("clouds")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "clouds"
                ? "bg-indigo-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Clouds</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Radar Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
        <canvas
          ref={canvasRef}
          width={700}
          height={320}
          onClick={handleCanvasClick}
          className="w-full h-[280px] sm:h-[320px] object-cover cursor-crosshair"
        />

        {/* Top-Left Location Badge Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-white">{city} Radar Center</span>
          <span className="text-slate-400">· {temp}°C {condition}</span>
        </div>

        {/* Crosshair Click Telemetry HUD Popover */}
        {clickedCoord && (
          <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-rose-500/40 text-xs space-y-1 shadow-2xl animate-in fade-in max-w-[220px]">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span>PROBE CROSSHAIR</span>
              <button
                onClick={() => setClickedCoord(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              Lat: {clickedCoord.lat}° N
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              Lng: {clickedCoord.lng}° W
            </div>
            <div className="text-xs font-bold text-sky-300 pt-1 border-t border-slate-800">
              {clickedCoord.val}
            </div>
          </div>
        )}

        {/* Bottom Legend Gradient Bar */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[10px] font-mono flex items-center gap-2">
          <span className="text-slate-400 uppercase">Intensity:</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-600" />
          <span className="text-slate-300">Light ➔ Extreme</span>
        </div>
      </div>

      {/* Bottom Animation Controls & Timeline Scrubber */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 text-xs gap-1.5 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Sweep
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Play Radar
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTimeOffset(0);
              setClickedCoord(null);
            }}
            className="h-8 text-xs gap-1 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset View
          </Button>
        </div>

        {/* Timeline Offset Slider */}
        <div className="flex items-center gap-3 w-full sm:w-72">
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            -2h
          </span>
          <input
            type="range"
            min={-120}
            max={120}
            step={15}
            value={timeOffset}
            onChange={(e) => setTimeOffset(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <span className="text-[10px] font-mono text-slate-300 shrink-0 min-w-[42px]">
            {timeOffset === 0
              ? "NOW"
              : timeOffset > 0
              ? `+${timeOffset}m`
              : `${timeOffset}m`}
          </span>
        </div>
      </div>
    </div>
  );
};
