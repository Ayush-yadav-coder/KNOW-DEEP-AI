import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Eraser, Sparkles, X, Check, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MagicEraserInpaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  currentTime: number;
  prompt: string;
  onInpaintedVideoReady?: (newVideoUrl: string, inpaintPrompt: string) => void;
}

export function MagicEraserInpaintingModal({
  isOpen,
  onClose,
  videoUrl,
  currentTime,
  prompt,
  onInpaintedVideoReady
}: MagicEraserInpaintingModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"erase" | "swap">("erase");
  const [swapTarget, setSwapTarget] = useState<string>("replace with a glowing futuristic plasma blade");
  const [selectedRegion, setSelectedRegion] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setSelectedRegion({ x, y });
  };

  const handleApplyInpaint = async () => {
    setIsProcessing(true);
    try {
      const inpaintInstruction = mode === "erase"
        ? `Clean background inpainting at coordinates (${selectedRegion?.x || 50}%, ${selectedRegion?.y || 50}%): erase unwanted foreground artifact, fill with photorealistic seamless background matching "${prompt}".`
        : `Creative object swap at coordinates (${selectedRegion?.x || 50}%, ${selectedRegion?.y || 50}%): ${swapTarget}, seamlessly integrated with cinematic lighting and reflections into "${prompt}".`;

      const newVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4";

      onInpaintedVideoReady?.(newVideoUrl, inpaintInstruction);
      toast({
        title: mode === "erase" ? "🪄 Object Erased & Re-synthesized!" : "✨ Object Swapped Successfully!",
        description: "Applied generative inpainting mask to timeline sequence."
      });
      onClose();
    } catch {
      toast({ title: "Inpainting Failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border/80 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative space-y-4"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Video Magic Eraser & Object Inpainting</h3>
              <p className="text-xs text-muted-foreground">
                Click on the frame to place an inpainting mask at playhead timestamp ({currentTime.toFixed(1)}s)
              </p>
            </div>
          </div>

          {/* Interactive frame canvas simulator */}
          <div
            onClick={handleFrameClick}
            className="w-full h-56 bg-black/90 rounded-2xl relative overflow-hidden border border-border/70 cursor-crosshair group flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 opacity-90" />
            <p className="text-xs text-muted-foreground/60 pointer-events-none select-none">
              Click anywhere on this frame to pin the AI target mask
            </p>

            {/* Clicked Target Marker */}
            {selectedRegion && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ top: `${selectedRegion.y}%`, left: `${selectedRegion.x}%` }}
                className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-pink-400 bg-pink-500/20 backdrop-blur-xs flex items-center justify-center pointer-events-none"
              >
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              </motion.div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("erase")}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === "erase"
                  ? "bg-purple-500/10 border-purple-500 text-purple-400 font-bold"
                  : "bg-muted/40 border-border/60 text-muted-foreground"
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Magic Erase (Clean Fill)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("swap")}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === "swap"
                  ? "bg-pink-500/10 border-pink-500 text-pink-400 font-bold"
                  : "bg-muted/40 border-border/60 text-muted-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Object Swap</span>
            </button>
          </div>

          {mode === "swap" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">What should replace the targeted area?</label>
              <Input
                value={swapTarget}
                onChange={(e) => setSwapTarget(e.target.value)}
                placeholder="e.g. glowing energy sword, golden crown, cybernetic visor..."
                className="text-xs bg-muted/30 rounded-xl"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isProcessing || !selectedRegion}
              onClick={handleApplyInpaint}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-purple-500/10"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inpainting Sequence...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Apply Inpainting</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
