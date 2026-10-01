import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  RotateCcw,
  Sparkles,
  Layers,
  Split,
  Camera,
  Trash2,
  Check,
  Clock,
  ArrowLeftRight,
  Plus,
  Eye,
  Sliders,
  Maximize2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImageRevision {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  dataUrl: string;
  width: number;
  height: number;
  badge: "Original" | "AI Upscale" | "Auto-Tone" | "LUT Grade" | "Studio Bg" | "Manual Edit" | "Snapshot";
  adjustmentsSummary?: string;
}

interface RevisionTimelineProps {
  revisions: ImageRevision[];
  activeRevisionId: string;
  comparingRevisionId: string | null;
  onRestoreRevision: (revision: ImageRevision) => void;
  onCompareRevision: (revision: ImageRevision) => void;
  onStopComparing: () => void;
  onTakeSnapshot: () => void;
  onDeleteRevision?: (id: string) => void;
}

export function RevisionTimeline({
  revisions,
  activeRevisionId,
  comparingRevisionId,
  onRestoreRevision,
  onCompareRevision,
  onStopComparing,
  onTakeSnapshot,
  onDeleteRevision,
}: RevisionTimelineProps) {
  const getBadgeStyle = (badge: ImageRevision["badge"]) => {
    switch (badge) {
      case "Original":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "AI Upscale":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Auto-Tone":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "LUT Grade":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Studio Bg":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Snapshot":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Header and Snapshot Action */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-foreground">Revision Timeline</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {revisions.length} saved {revisions.length === 1 ? "state" : "states"} · Compare or rollback anytime
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onTakeSnapshot}
          className="h-7 px-2.5 rounded-lg border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-[11px] font-medium gap-1.5 cursor-pointer"
        >
          <Camera className="w-3 h-3" />
          <span>Save Snapshot</span>
        </Button>
      </div>

      {/* Active Comparison Status Bar */}
      {comparingRevisionId && (
        <div className="p-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Split className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            <div className="text-[11px] truncate">
              <span className="font-semibold text-cyan-300">Comparing version: </span>
              <span className="text-muted-foreground">
                {revisions.find((r) => r.id === comparingRevisionId)?.title || "Selected version"}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onStopComparing}
            className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 shrink-0 cursor-pointer"
          >
            Exit Compare
          </Button>
        </div>
      )}

      {/* Timeline List */}
      <div className="space-y-2.5">
        {revisions.map((rev, index) => {
          const isActive = rev.id === activeRevisionId;
          const isComparing = rev.id === comparingRevisionId;

          return (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
              className={`p-3 rounded-xl border transition-all relative group ${
                isComparing
                  ? "border-cyan-500/60 bg-cyan-950/20 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : isActive
                  ? "border-emerald-500/50 bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/30"
                  : "border-border/60 hover:border-border/90 bg-card/60 hover:bg-card/90"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Visual Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border/70 bg-black/60 shrink-0 relative">
                  <img
                    src={rev.dataUrl}
                    alt={rev.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {rev.title}
                    </h4>
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                      {formatTime(rev.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md border ${getBadgeStyle(
                        rev.badge
                      )}`}
                    >
                      {rev.badge}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                      {rev.width} × {rev.height} px
                    </span>
                  </div>

                  {rev.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {rev.description}
                    </p>
                  )}

                  {/* Actions for this revision */}
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                    {!isActive ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRestoreRevision(rev)}
                        className="h-6 px-2 rounded-md text-[10px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 cursor-pointer"
                        title="Restore this version as active canvas"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Restore</span>
                      </Button>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-400/90 flex items-center gap-1 py-0.5 px-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Current Active</span>
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (isComparing) {
                          onStopComparing();
                        } else {
                          onCompareRevision(rev);
                        }
                      }}
                      className={`h-6 px-2 rounded-md text-[10px] font-medium gap-1 cursor-pointer ${
                        isComparing
                          ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                      title="Compare this revision on split slider"
                    >
                      <Split className="w-2.5 h-2.5" />
                      <span>{isComparing ? "Stop Compare" : "Compare"}</span>
                    </Button>

                    {onDeleteRevision && revisions.length > 1 && !isActive && (
                      <button
                        type="button"
                        onClick={() => onDeleteRevision(rev.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sm cursor-pointer"
                        title="Delete revision"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
