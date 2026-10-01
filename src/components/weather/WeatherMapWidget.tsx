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
  Thermometer,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherMapWidgetProps {
  city: string;
  country?: string;
  condition?: string;
  temp?: number;
  windSpeed?: number;
  humidity?: number;
}

export type WeatherMapLayer = "precipitation" | "temperature" | "wind" | "clouds";

export const WeatherMapWidget: React.FC<WeatherMapWidgetProps> = ({
  city,
  country = "Global",
  condition = "Partly Cloudy",
  temp = 22,
  windSpeed = 14,
  humidity = 58,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState<WeatherMapLayer>("precipitation");
  const [zoomLevel, setZoomLevel] = useState(1); // 1x to 3x zoom
  const [timeOffset, setTimeOffset] = useState(0); // -120m to +120m
  const [clickedProbe, setClickedProbe] = useState<{
    x: number;
    y: number;
    lat: string;
    lng: string;
    tempVal: string;
    rainVal: string;
    windVal: string;
  } | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  // Render weather map simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Map Slate Field & Grid Lines
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Lat/Lng Grid overlay
      ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
      ctx.lineWidth = 1;

      const gridSize = 40 * zoomLevel;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Range concentric radar rings
      ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
      for (let r = 60 * zoomLevel; r <= 360 * zoomLevel; r += 60 * zoomLevel) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const timeFactor = isPlaying ? (Date.now() / 1000) % 3600 : frame;

      // 2. Render Selected Weather Map Layer
      if (activeLayer === "precipitation") {
        // Precipitation Radar Layer (Rain / Storm Cells)
        for (let i = 0; i < 9; i++) {
          const offsetX = Math.sin(timeFactor * 0.18 + i) * 70 * zoomLevel + timeOffset;
          const offsetY = Math.cos(timeFactor * 0.12 + i * 1.5) * 50 * zoomLevel;
          const px = (centerX - 140 * zoomLevel + i * 40 * zoomLevel + offsetX) % width;
          const py = (centerY - 90 * zoomLevel + i * 25 * zoomLevel + offsetY) % height;
          const radius = (35 + (i % 4) * 22) * zoomLevel;

          const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
          if (i % 3 === 0) {
            grad.addColorStop(0, "rgba(225, 29, 72, 0.8)"); // Heavy rain / thunderstorm
            grad.addColorStop(0.4, "rgba(245, 158, 11, 0.6)");
            grad.addColorStop(0.8, "rgba(14, 165, 233, 0.3)");
            grad.addColorStop(1, "rgba(14, 165, 233, 0)");
          } else {
            grad.addColorStop(0, "rgba(14, 165, 233, 0.7)"); // Moderate rain band
            grad.addColorStop(0.6, "rgba(56, 189, 248, 0.35)");
            grad.addColorStop(1, "rgba(56, 189, 248, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeLayer === "temperature") {
        // Temperature Isotherm Heatmap Layer
        for (let x = 0; x < width; x += 40) {
          for (let y = 0; y < height; y += 40) {
            const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const localTemp = temp + Math.sin(x * 0.01 + y * 0.01 + timeFactor * 0.1) * 6 - (distFromCenter / 100);

            let color = "rgba(14, 165, 233, 0.3)"; // Cool blue
            if (localTemp >= 25) {
              color = "rgba(244, 63, 94, 0.4)"; // Warm rose
            } else if (localTemp >= 20) {
              color = "rgba(245, 158, 11, 0.35)"; // Mild amber
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 35 * zoomLevel, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (activeLayer === "wind") {
        // Wind Speed Vector Field Layer
        ctx.strokeStyle = "rgba(45, 212, 191, 0.7)";
        ctx.lineWidth = 1.8;

        const spacing = 35 * zoomLevel;
        for (let x = 20; x < width; x += spacing) {
          for (let y = 20; y < height; y += spacing) {
            const angle = Math.sin(x * 0.008 + y * 0.008 + timeFactor * 0.4) * Math.PI * 1.5;
            const length = (14 + Math.cos(x * 0.02) * 8) * zoomLevel;

            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Arrowhead tip
            ctx.fillStyle = "rgba(45, 212, 191, 0.9)";
            ctx.beginPath();
            ctx.arc(endX, endY, 2.5 * zoomLevel, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (activeLayer === "clouds") {
        // Cloud Cover Satellite Layer
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        for (let i = 0; i < 8; i++) {
          const px = (centerX - 160 + i * 60 + (timeFactor * 12) % width) % width;
          const py = (centerY - 80 + (i % 3) * 50) % height;
          ctx.beginPath();
          ctx.arc(px, py, 50 * zoomLevel, 0, Math.PI * 2);
          ctx.arc(px + 30 * zoomLevel, py - 12 * zoomLevel, 40 * zoomLevel, 0, Math.PI * 2);
          ctx.arc(px - 30 * zoomLevel, py + 12 * zoomLevel, 35 * zoomLevel, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Radar Sweep Beam Animation
      const sweepAngle = (timeFactor * 1.4) % (Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * (360 * zoomLevel),
        centerY + Math.sin(sweepAngle) * (360 * zoomLevel)
      );
      ctx.stroke();

      ctx.fillStyle = "rgba(56, 189, 248, 0.09)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 360 * zoomLevel, sweepAngle - 0.28, sweepAngle);
      ctx.closePath();
      ctx.fill();

      // 4. Center Location Marker
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulse ring around city location
      const pulseRadius = 7 + (Math.floor(timeFactor * 22) % 26);
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - pulseRadius / 32})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Selected Crosshair Probe
      if (clickedProbe) {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(clickedProbe.x, clickedProbe.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(clickedProbe.x - 18, clickedProbe.y);
        ctx.lineTo(clickedProbe.x + 18, clickedProbe.y);
        ctx.moveTo(clickedProbe.x, clickedProbe.y - 18);
        ctx.lineTo(clickedProbe.x, clickedProbe.y + 18);
        ctx.stroke();
      }

      if (isPlaying) {
        frame++;
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activeLayer, zoomLevel, timeOffset, clickedProbe, temp]);

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Estimate coordinates and metrics for crosshair
    const lat = (40.7128 + (y - canvas.height / 2) * -0.008).toFixed(4);
    const lng = (-74.006 + (x - canvas.width / 2) * 0.008).toFixed(4);

    const tempVal = `${(temp + (Math.random() * 4 - 2)).toFixed(1)}°C`;
    const rainVal = `${(Math.random() * 6.5 + 0.1).toFixed(1)} mm/h`;
    const windVal = `${Math.floor(windSpeed + Math.random() * 8 - 4)} km/h NW`;

    setClickedProbe({ x, y, lat, lng, tempVal, rainVal, windVal });
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
      {/* Header & Layer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Weather Map Widget</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Vector Doppler
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live precipitation radar, temperature heatmaps &amp; wind speed vector field for {city}, {country}
            </p>
          </div>
        </div>

        {/* Map Layer Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveLayer("precipitation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "precipitation"
                ? "bg-sky-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>

          <button
            onClick={() => setActiveLayer("temperature")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === "temperature"
                ? "bg-rose-500 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
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
            <span>Wind Speed</span>
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

      {/* Main Canvas Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
        <canvas
          ref={canvasRef}
          width={750}
          height={340}
          onClick={handleMapClick}
          className="w-full h-[300px] sm:h-[340px] object-cover cursor-crosshair"
        />

        {/* Top-Left Location Badge Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center gap-2 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-white">{city} Vector Center</span>
          <span className="text-slate-400">· {temp}°C {condition}</span>
        </div>

        {/* Top-Right Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors"
            title="Zoom In Map"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors"
            title="Zoom Out Map"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Crosshair Probe Telemetry HUD Popover */}
        {clickedProbe && (
          <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-rose-500/40 text-xs space-y-1.5 shadow-2xl animate-in fade-in max-w-[240px]">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span className="flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" /> PROBE TELEMETRY
              </span>
              <button
                onClick={() => setClickedProbe(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              Lat: {clickedProbe.lat}° N · Lng: {clickedProbe.lng}° W
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block text-[9px]">TEMP</span>
                <span className="font-bold text-rose-300">{clickedProbe.tempVal}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">RAIN</span>
                <span className="font-bold text-sky-300">{clickedProbe.rainVal}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 block text-[9px]">WIND VECTOR</span>
                <span className="font-bold text-teal-300">{clickedProbe.windVal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Color Scale Intensity Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-[10px] font-mono flex items-center gap-2">
          <span className="text-slate-400 uppercase">
            {activeLayer === "temperature"
              ? "Temp Scale (°C):"
              : activeLayer === "wind"
              ? "Wind Speed (km/h):"
              : "Precipitation Rate:"}
          </span>
          <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-teal-400 via-amber-400 to-rose-600" />
          <span className="text-slate-300 font-bold">Low ➔ High</span>
        </div>
      </div>

      {/* Bottom Controls Bar & Timeline Offset Scrubber */}
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
              setClickedProbe(null);
              setZoomLevel(1);
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
