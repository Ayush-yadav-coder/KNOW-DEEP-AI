import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { PLATFORM_15_FEATURES, getOrderedFeatures, FeatureDirectoryItem } from "@/lib/features";
import { 
  GripVertical, 
  RotateCcw, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight,
  Sliders,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NavDragDropCustomizerProps {
  onSaved?: () => void;
  compact?: boolean;
}

export const NavDragDropCustomizer: React.FC<NavDragDropCustomizerProps> = ({ onSaved, compact = false }) => {
  const { preferences, updatePreferences } = useAppStore();
  const { toast } = useToast();

  const [featureOrder, setFeatureOrder] = useState<string[]>(() => {
    return preferences.customFeatureOrder && preferences.customFeatureOrder.length === 15
      ? preferences.customFeatureOrder
      : PLATFORM_15_FEATURES.map((f) => f.id);
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentOrderedItems = getOrderedFeatures(featureOrder);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...featureOrder];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setFeatureOrder(updated);
    updatePreferences({ customFeatureOrder: updated });
    setDraggedIndex(null);
    setDragOverIndex(null);

    toast({
      title: "Order Updated",
      description: "Feature moved successfully.",
    });
  };

  // Keyboard / Touch button reorder handlers
  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featureOrder.length) return;

    const updated = [...featureOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFeatureOrder(updated);
    updatePreferences({ customFeatureOrder: updated });
  };

  const swapBetweenRows = (index: number, targetRow: 1 | 2) => {
    // Row 1: 0..4, Row 2: 5..9
    const targetSlot = targetRow === 1 ? 0 : 5;
    const updated = [...featureOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetSlot, 0, moved);
    setFeatureOrder(updated);
    updatePreferences({ customFeatureOrder: updated });
    toast({
      title: "Moved to " + (targetRow === 1 ? "Row 1 (Primary)" : "Row 2 (Secondary)"),
      description: "Feature relocated successfully.",
    });
  };

  const handleReset = () => {
    const defaultIds = PLATFORM_15_FEATURES.map((f) => f.id);
    setFeatureOrder(defaultIds);
    updatePreferences({ customFeatureOrder: defaultIds });
    toast({
      title: "Reset to Default",
      description: "Navigation features restored to standard 1-15 arrangement.",
    });
    if (onSaved) onSaved();
  };

  const renderFeatureCard = (item: FeatureDirectoryItem, index: number, rowNum: number) => {
    const Icon = item.icon;
    const isDragging = draggedIndex === index;
    const isDragTarget = dragOverIndex === index;

    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        className={cn(
          "flex items-center justify-between p-2.5 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing",
          isDragging
            ? "opacity-40 scale-95 border-dashed border-cyan-500 bg-cyan-500/10"
            : isDragTarget
            ? "border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500/30 shadow-lg scale-[1.02]"
            : "bg-background/80 hover:bg-background border-border/70 hover:border-cyan-500/40 shadow-sm"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="text-muted-foreground/60 hover:text-foreground cursor-grab">
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-mono font-bold text-muted-foreground w-4 text-center">
            {index + 1}
          </span>
          <div
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white shrink-0 bg-gradient-to-br shadow-sm",
              item.color
            )}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold text-foreground block truncate">
              {item.name}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.shortLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Move to Row 1 / Row 2 shortcut button */}
          {rowNum === 1 ? (
            <button
              type="button"
              onClick={() => swapBetweenRows(index, 2)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-muted hover:bg-indigo-500/20 hover:text-indigo-400 text-muted-foreground transition-colors hidden sm:inline-flex"
              title="Move to Row 2"
            >
              To Row 2
            </button>
          ) : rowNum === 2 ? (
            <button
              type="button"
              onClick={() => swapBetweenRows(index, 1)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-muted hover:bg-cyan-500/20 hover:text-cyan-400 text-muted-foreground transition-colors hidden sm:inline-flex"
              title="Move to Row 1"
            >
              To Row 1
            </button>
          ) : null}

          {/* Up / Down Controls */}
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveItem(index, "up")}
            className={cn(
              "w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors",
              index === 0 && "opacity-20 cursor-not-allowed"
            )}
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            disabled={index === featureOrder.length - 1}
            onClick={() => moveItem(index, "down")}
            className={cn(
              "w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors",
              index === featureOrder.length - 1 && "opacity-20 cursor-not-allowed"
            )}
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Sliders className="w-4 h-4 text-cyan-500" />
            Drag-and-Drop Bottom Bar Customizer
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag items or use buttons to rearrange your favorite tools between Row 1 and Row 2.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-xl text-xs gap-1.5 h-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Default
        </Button>
      </div>

      {/* Row 1 (Features 1 - 5) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
              Row 1: Primary Toolbar (Features 1 – 5)
            </h5>
          </div>
          <span className="text-[11px] text-muted-foreground">Always visible by default</span>
        </div>

        <div className="space-y-2 p-2 rounded-2xl bg-muted/20 border border-border/60">
          {currentOrderedItems.slice(0, 5).map((item, idx) => renderFeatureCard(item, idx, 1))}
        </div>
      </div>

      {/* Row 2 (Features 6 - 10) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              Row 2: Secondary Toolbar (Features 6 – 10)
            </h5>
          </div>
          <span className="text-[11px] text-muted-foreground">Accessible via 1-tap swipe</span>
        </div>

        <div className="space-y-2 p-2 rounded-2xl bg-muted/20 border border-border/60">
          {currentOrderedItems.slice(5, 10).map((item, idx) => renderFeatureCard(item, idx + 5, 2))}
        </div>
      </div>

      {/* Row 3 (Features 11 - 15) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
              Row 3: Specialized Studios (Features 11 – 15)
            </h5>
          </div>
          <span className="text-[11px] text-muted-foreground">Specialized power tools</span>
        </div>

        <div className="space-y-2 p-2 rounded-2xl bg-muted/20 border border-border/60">
          {currentOrderedItems.slice(10, 15).map((item, idx) => renderFeatureCard(item, idx + 10, 3))}
        </div>
      </div>
    </div>
  );
};
