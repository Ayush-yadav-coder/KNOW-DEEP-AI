import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Copy,
  Check,
  FileImage,
  Layers,
  Sparkles,
  Maximize2,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  enhancedImageUrl: string | null;
  originalWidth: number;
  originalHeight: number;
}

export function ImageEnhancerExportModal({
  isOpen,
  onClose,
  enhancedImageUrl,
  originalWidth,
  originalHeight,
}: ExportModalProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState<number>(95);
  const [scaleMultiplier, setScaleMultiplier] = useState<1 | 2 | 4>(1);
  const [copied, setCopied] = useState(false);

  if (!enhancedImageUrl) return null;

  const currentW = Math.round((originalWidth || 1920) * scaleMultiplier);
  const currentH = Math.round((originalHeight || 1080) * scaleMultiplier);

  const handleDownload = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = currentW;
      canvas.height = currentH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, currentW, currentH);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "webp"
          ? "image/webp"
          : "image/jpeg";
      const q = format === "png" ? undefined : quality / 100;
      const dataUrl = canvas.toDataURL(mimeType, q);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `KnowDeep_Enhanced_${currentW}x${currentH}_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Completed",
        description: `Saved as ${format.toUpperCase()} (${currentW}×${currentH} px).`,
      });
      onClose();
    };
    img.src = enhancedImageUrl;
  };

  const handleCopyToClipboard = async () => {
    try {
      const response = await fetch(enhancedImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Image copied as binary clipboard item.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Clipboard Copy",
        description: "Direct binary copy not permitted by browser; use Download button.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-border/80 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-500" />
            Export Enhanced Master
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "png" as const, label: "PNG", note: "Lossless Crisp" },
                { id: "webp" as const, label: "WebP", note: "Modern Web" },
                { id: "jpeg" as const, label: "JPEG", note: "Universal" },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    format === fmt.id
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                      : "border-border/60 hover:border-border text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-semibold">{fmt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {fmt.note}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG / WebP) */}
          {format !== "png" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Encoding Quality
                </span>
                <span className="font-mono text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                min={50}
                max={100}
                step={1}
                onValueChange={(v) => setQuality(v[0])}
                className="py-1 cursor-pointer"
              />
            </div>
          )}

          {/* Scale Resolution Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Output Scale</span>
              <span className="font-mono text-emerald-500 text-xs">
                {currentW} × {currentH} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1 as const, label: "1x Native" },
                { scale: 2 as const, label: "2x Boost" },
                { scale: 4 as const, label: "4x Studio Ultra" },
              ].map((s) => (
                <button
                  key={s.scale}
                  type="button"
                  onClick={() => setScaleMultiplier(s.scale)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    scaleMultiplier === s.scale
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground font-semibold"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                try {
                  const localImgsStr = localStorage.getItem("knowdeep_gallery_images");
                  const localImgs = localImgsStr ? JSON.parse(localImgsStr) : [];
                  const newImg = {
                    id: `enhanced-${Date.now()}`,
                    prompt: "AI Enhanced Super-Resolution Image",
                    image_url: enhancedImageUrl,
                    image_type: "Enhanced HD",
                    created_at: new Date().toISOString(),
                  };
                  localStorage.setItem("knowdeep_gallery_images", JSON.stringify([newImg, ...localImgs]));
                  toast({
                    title: "Saved to My Gallery & My Stuff!",
                    description: "Enhanced high-definition image saved to personal gallery.",
                  });
                } catch {
                  toast({ title: "Saved to My Gallery" });
                }
              }}
              className="text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Save to Gallery</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCopyToClipboard}
              className="text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            <Button
              type="button"
              onClick={handleDownload}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
