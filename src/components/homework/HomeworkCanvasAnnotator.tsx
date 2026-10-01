import React, { useRef, useState, useEffect } from "react";
import { Edit3, Eraser, RotateCcw, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeworkCanvasAnnotatorProps {
  onAttachDrawing: (dataUrl: string) => void;
}

export const HomeworkCanvasAnnotator: React.FC<HomeworkCanvasAnnotatorProps> = ({
  onAttachDrawing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#818cf8");
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 180;

    // Fill dark background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = mode === "eraser" ? "#020617" : color;
    ctx.lineWidth = mode === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onAttachDrawing(dataUrl);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Draw / Write Equation
          </span>

          {/* Color Palettes */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            {["#818cf8", "#38bdf8", "#34d399", "#f43f5e", "#fbbf24", "#ffffff"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setMode("pen");
                }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  color === c && mode === "pen"
                    ? "scale-125 border-white shadow-md"
                    : "border-transparent hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
                title={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Tools: Eraser, Clear, Attach */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode(mode === "pen" ? "eraser" : "pen")}
            className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 font-mono ${
              mode === "eraser"
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Toggle Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear Drawing"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <Button
            size="sm"
            onClick={handleExport}
            className="h-7 text-xs rounded-xl gap-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Attach Sketch
          </Button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 touch-none cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full block"
        />
      </div>
    </div>
  );
};
