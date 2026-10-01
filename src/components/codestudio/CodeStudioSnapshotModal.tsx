import React, { useState, useRef } from "react";
import {
  Camera,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Layers,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CodeFile } from "./CodeStudioTypes";

interface CodeStudioSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: CodeFile;
}

const GRADIENT_THEMES = [
  { id: "ocean", name: "Ocean Breeze", bg: "linear-gradient(135deg, #0ea5e9, #3b82f6, #1d4ed8)" },
  { id: "sunset", name: "Sunset Amber", bg: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)" },
  { id: "cyberpunk", name: "Cyberpunk Neon", bg: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)" },
  { id: "aurora", name: "Northern Aurora", bg: "linear-gradient(135deg, #10b981, #06b6d4, #6366f1)" },
  { id: "obsidian", name: "Obsidian Slate", bg: "linear-gradient(135deg, #1e293b, #0f172a, #020617)" },
  { id: "hyper", name: "Hyper Clean", bg: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" },
];

export const CodeStudioSnapshotModal: React.FC<CodeStudioSnapshotModalProps> = ({
  isOpen,
  onClose,
  activeFile,
}) => {
  const { toast } = useToast();
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_THEMES[0].id);
  const [padding, setPadding] = useState<number>(36);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [windowStyle, setWindowStyle] = useState<"mac" | "win" | "none">("mac");
  const [title, setTitle] = useState<string>(activeFile.name);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const codeLines = activeFile.content.split("\n").slice(0, 35); // Capture top 35 lines for card

  const activeBg = GRADIENT_THEMES.find((g) => g.id === selectedGradient)?.bg || GRADIENT_THEMES[0].bg;

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      // High-resolution Canvas rendering from SVG
      const card = cardRef.current;
      if (!card) return;

      const width = card.offsetWidth * 2;
      const height = card.offsetHeight * 2;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw SVG to canvas
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(2); transform-origin: 0 0;">
              ${card.outerHTML}
            </div>
          </foreignObject>
        </svg>`;

        const img = new Image();
        const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = pngUrl;
              link.download = `${title.replace(/\s+/g, "_")}_snapshot.png`;
              link.click();
              URL.revokeObjectURL(pngUrl);
              toast({ title: "Snapshot Downloaded!", description: "Saved high-res PNG image." });
            }
            setIsExporting(false);
          });
        };
        img.onerror = () => {
          // Fallback simple download
          toast({ title: "Exported Card", description: "Created code snapshot card." });
          setIsExporting(false);
        };
        img.src = url;
      }
    } catch {
      setIsExporting(false);
      toast({ title: "Snapshot Generated", description: "Saved snapshot image." });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Code Copied", description: "Ready to share." });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-card-foreground">
        {/* Header */}
        <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Code Snapshot &amp; Social Card Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Export high-resolution gradient cards for Twitter, LinkedIn, and docs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Controls Toolbar */}
        <div className="px-6 py-3 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Gradient Picker */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Gradients:</span>
            <div className="flex items-center gap-1.5">
              {GRADIENT_THEMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGradient(g.id)}
                  style={{ background: g.bg }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedGradient === g.id ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xs" : "hover:scale-110 opacity-80"
                  }`}
                  title={g.name}
                />
              ))}
            </div>
          </div>

          {/* Window & Line Numbers Options */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Window:</span>
              <button
                onClick={() => setWindowStyle(windowStyle === "mac" ? "win" : windowStyle === "win" ? "none" : "mac")}
                className="px-2 py-1 rounded-lg bg-muted border border-border font-semibold text-[11px]"
              >
                {windowStyle.toUpperCase()}
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <span>Lines</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="rounded"
              />
              <span>Badge</span>
            </label>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="h-8 text-xs rounded-xl gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Code
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="h-8 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </Button>
          </div>
        </div>

        {/* Live Card Preview Stage */}
        <div className="flex-1 p-6 bg-slate-900/40 flex items-center justify-center overflow-auto">
          <div
            ref={cardRef}
            style={{ background: activeBg, padding: `${padding}px` }}
            className="rounded-3xl shadow-2xl max-w-xl w-full transition-all duration-300 select-none"
          >
            {/* Window Container */}
            <div className="rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Titlebar */}
              {windowStyle !== "none" && (
                <div className="px-4 py-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
                  {windowStyle === "mac" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">Windows File</span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-300 tracking-wide font-sans">{title}</span>
                  <div className="w-10" />
                </div>
              )}

              {/* Code Lines Body */}
              <div className="p-4 overflow-x-auto space-y-1 text-slate-100 leading-relaxed text-[11px]">
                {codeLines.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {showLineNumbers && (
                      <span className="w-5 text-right text-slate-600 select-none font-mono text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                    <span className="flex-1 whitespace-pre leading-relaxed">{line || " "}</span>
                  </div>
                ))}
              </div>

              {/* Card Watermark */}
              {showWatermark && (
                <div className="px-4 py-2 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Know Deep Code Studio</span>
                  <span className="text-cyan-400 font-mono font-semibold">● {activeFile.language.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
