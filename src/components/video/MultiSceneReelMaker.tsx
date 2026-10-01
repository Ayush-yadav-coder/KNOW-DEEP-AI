import React, { useState } from "react";
import { Film, Play, Pause, Plus, Trash2, ArrowRight, Layers, Sparkles, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface ReelClip {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  transition: "crossfade" | "whip_pan" | "zoom_glitch" | "fade_black" | "flash";
}

interface MultiSceneReelMakerProps {
  availableCreations: Array<{ id: string; prompt: string; videoUrl: string; style: string }>;
  onPlayReelSequence?: (clips: ReelClip[]) => void;
  onExportMasterReel?: (clips: ReelClip[]) => void;
}

export function MultiSceneReelMaker({
  availableCreations,
  onPlayReelSequence,
  onExportMasterReel
}: MultiSceneReelMakerProps) {
  const { toast } = useToast();
  const [reelClips, setReelClips] = useState<ReelClip[]>([
    {
      id: "rc-1",
      title: availableCreations[0]?.prompt.slice(0, 32) || "Opening Sequence",
      videoUrl: availableCreations[0]?.videoUrl || "",
      duration: 4.0,
      transition: "crossfade"
    },
    {
      id: "rc-2",
      title: availableCreations[1]?.prompt.slice(0, 32) || "Climax Scene",
      videoUrl: availableCreations[1]?.videoUrl || availableCreations[0]?.videoUrl || "",
      duration: 4.5,
      transition: "zoom_glitch"
    }
  ]);

  const totalReelDuration = reelClips.reduce((acc, c) => acc + c.duration, 0);

  const handleAddClipFromHistory = (creation: { id: string; prompt: string; videoUrl: string }) => {
    const newClip: ReelClip = {
      id: `rc-${Date.now()}`,
      title: creation.prompt.slice(0, 35) || "Timeline Scene",
      videoUrl: creation.videoUrl,
      duration: 4.0,
      transition: "whip_pan"
    };
    setReelClips([...reelClips, newClip]);
    toast({ title: "Scene Added to Reel", description: "Appended to your continuous master timeline." });
  };

  const handleRemoveClip = (id: string) => {
    setReelClips(reelClips.filter(c => c.id !== id));
  };

  const handleMoveClip = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === reelClips.length - 1)) return;
    const target = direction === "up" ? index - 1 : index + 1;
    const updated = [...reelClips];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setReelClips(updated);
  };

  return (
    <div className="space-y-4 bg-muted/20 border border-border/70 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Multi-Scene Reel & Short Maker (Timeline Joiner)</span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">
          {reelClips.length} Clips · {totalReelDuration.toFixed(1)}s Total
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Stitch together multiple generated clips into one seamless 30–60s story or YouTube Short / Instagram Reel with custom transition sweeps.
      </p>

      {/* Reel Timeline track */}
      <div className="space-y-2">
        {reelClips.map((clip, idx) => (
          <div
            key={clip.id}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-xs shadow-2xs gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded bg-primary/10 text-primary font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate text-xs">{clip.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>Duration:</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    step="0.5"
                    value={clip.duration}
                    onChange={(e) => {
                      const updated = [...reelClips];
                      updated[idx].duration = parseFloat(e.target.value) || 3.0;
                      setReelClips(updated);
                    }}
                    className="w-12 bg-muted/50 rounded px-1 text-[10px] font-mono"
                  />
                  <span>sec</span>
                  <span>·</span>
                  <span>Transition:</span>
                  <select
                    value={clip.transition}
                    onChange={(e) => {
                      const updated = [...reelClips];
                      updated[idx].transition = e.target.value as any;
                      setReelClips(updated);
                    }}
                    className="bg-muted/50 rounded px-1 text-[10px]"
                  >
                    <option value="crossfade">Crossfade</option>
                    <option value="whip_pan">Whip Pan</option>
                    <option value="zoom_glitch">Zoom Glitch</option>
                    <option value="fade_black">Fade Black</option>
                    <option value="flash">Flash</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMoveClip(idx, "up")}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs"
                title="Move Up"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={idx === reelClips.length - 1}
                onClick={() => handleMoveClip(idx, "down")}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs"
                title="Move Down"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => handleRemoveClip(clip.id)}
                className="p-1 rounded hover:bg-muted text-rose-500"
                title="Delete Clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Available creations quick adder */}
      {availableCreations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Quick Add From Recent Projects:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {availableCreations.slice(0, 5).map((creation) => (
              <button
                key={creation.id}
                type="button"
                onClick={() => handleAddClipFromHistory(creation)}
                className="shrink-0 max-w-[140px] p-1.5 rounded-lg bg-card hover:bg-muted border border-border/60 text-left text-[10px] truncate transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{creation.prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (reelClips.length === 0) return;
            onPlayReelSequence?.(reelClips);
            toast({ title: "Playing Master Reel", description: `Sequencing ${reelClips.length} clips in master cinema viewer.` });
          }}
          className="h-8 rounded-xl text-xs gap-1.5 font-bold"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play Master Sequence</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (reelClips.length === 0) return;
            onExportMasterReel?.(reelClips);
          }}
          className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master Reel</span>
        </Button>
      </div>
    </div>
  );
}
