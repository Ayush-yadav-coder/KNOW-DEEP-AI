import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Upload,
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  FileImage,
  Archive,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import {
  UpscaleMode,
  UpscaleScale,
  processSuperResolution,
  loadImage,
  DEFAULT_ADJUSTMENTS,
} from "./SuperResolutionEngine";

export interface BatchQueueItem {
  id: string;
  name: string;
  size: number;
  originalUrl: string;
  enhancedUrl: string | null;
  status: "queued" | "processing" | "completed" | "error";
  progress: number;
  originalDimensions?: { width: number; height: number };
  enhancedDimensions?: { width: number; height: number };
  error?: string;
}

interface BulkProcessingQueueProps {
  queue: BatchQueueItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQueue: (updater: (prev: BatchQueueItem[]) => BatchQueueItem[]) => void;
  onSelectForCanvas: (item: BatchQueueItem) => void;
  onAddFiles: (files: FileList | File[]) => void;
}

export function BulkProcessingQueue({
  queue,
  isOpen,
  onClose,
  onUpdateQueue,
  onSelectForCanvas,
  onAddFiles,
}: BulkProcessingQueueProps) {
  const { toast } = useToast();
  const [batchMode, setBatchMode] = useState<UpscaleMode>("Photo");
  const [batchScale, setBatchScale] = useState<UpscaleScale>("4x");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate stats
  const totalItems = queue.length;
  const completedCount = queue.filter((item) => item.status === "completed").length;
  const processingCount = queue.filter((item) => item.status === "processing").length;

  // Process all queued items sequentially
  const handleProcessAll = async () => {
    if (queue.length === 0) return;
    setIsBatchProcessing(true);
    setOverallProgress(0);

    const itemsToProcess = queue.filter(
      (item) => item.status === "queued" || item.status === "error"
    );

    if (itemsToProcess.length === 0) {
      toast({
        title: "All Items Completed",
        description: "All files in the queue have already been enhanced.",
      });
      setIsBatchProcessing(false);
      return;
    }

    let processedSoFar = completedCount;

    for (const item of itemsToProcess) {
      // Mark as processing
      onUpdateQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "processing", progress: 20 } : i
        )
      );

      try {
        // Small delay for UI smoothness
        await new Promise((r) => setTimeout(r, 200));

        onUpdateQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, progress: 50 } : i
          )
        );

        const result = await processSuperResolution(
          item.originalUrl,
          {
            mode: batchMode,
            scale: batchScale,
            faceRestoration: true,
            microContrast: true,
          },
          DEFAULT_ADJUSTMENTS
        );

        onUpdateQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "completed",
                  progress: 100,
                  enhancedUrl: result.dataUrl,
                  enhancedDimensions: { width: result.width, height: result.height },
                }
              : i
          )
        );

        processedSoFar++;
        setOverallProgress(Math.round((processedSoFar / totalItems) * 100));
      } catch (err: unknown) {
        console.error("Batch item error", err);
        const errorMessage = err instanceof Error ? err.message : "Enhancement failed";
        onUpdateQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  error: errorMessage,
                }
              : i
          )
        );
      }
    }

    setIsBatchProcessing(false);
    toast({
      title: "Batch Enhancement Finished",
      description: `Successfully processed ${processedSoFar} of ${totalItems} images.`,
    });
  };

  // Download all completed as a ZIP package
  const handleDownloadAllZip = async () => {
    const completedItems = queue.filter(
      (item) => item.status === "completed" && item.enhancedUrl
    );

    if (completedItems.length === 0) {
      toast({
        title: "No Completed Files",
        description: "Process files before downloading ZIP.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Packaging ZIP Archive...",
      description: `Compiling ${completedItems.length} ultra-high resolution images.`,
    });

    try {
      const zip = new JSZip();
      const folder = zip.folder(`enhanced_batch_${batchScale}_${Date.now()}`);

      for (let idx = 0; idx < completedItems.length; idx++) {
        const item = completedItems[idx];
        const base64Data = item.enhancedUrl!.split(",")[1];
        const safeName = item.name.replace(/\.[^/.]+$/, "");
        folder?.file(`${safeName}_${batchScale}_enhanced.png`, base64Data, {
          base64: true,
        });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KnowDeep_Enhanced_Batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "ZIP Downloaded",
        description: `Successfully downloaded ${completedItems.length} enhanced assets.`,
      });
    } catch (err) {
      console.error("ZIP download failed", err);
      toast({
        title: "Export Failed",
        description: "Could not create ZIP archive.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSingle = (item: BatchQueueItem) => {
    if (!item.enhancedUrl) return;
    const link = document.createElement("a");
    link.href = item.enhancedUrl;
    link.download = `${item.name.replace(/\.[^/.]+$/, "")}_${batchScale}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveItem = (id: string) => {
    onUpdateQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    onUpdateQueue(() => []);
    toast({ title: "Queue Cleared", description: "All queued items removed." });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-background/98 backdrop-blur-2xl border-t border-border/80 shadow-2xl flex flex-col"
    >
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Bulk Processing Queue
              </h2>
              <span className="text-xs text-muted-foreground">
                ({completedCount}/{totalItems} enhanced)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Drop multiple images to batch enhance with consistent resolution and model settings.
            </p>
          </div>
        </div>

        {/* Global Batch Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Upscale Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground px-2">
              Mode:
            </span>
            {(["Photo", "Artistic", "Text-Heavy"] as UpscaleMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBatchMode(mode)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  batchMode === mode
                    ? "bg-background text-foreground shadow-sm border border-border/60 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Scale Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground px-2">
              Scale:
            </span>
            {(["2x", "4x", "8x"] as UpscaleScale[]).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setBatchScale(scale)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  batchScale === scale
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {scale}
              </button>
            ))}
          </div>

          {/* Add more files trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Files</span>
          </Button>

          {/* Enhance All Trigger */}
          <Button
            size="sm"
            onClick={handleProcessAll}
            disabled={isBatchProcessing || queue.length === 0}
            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isBatchProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>
              {isBatchProcessing ? "Processing Batch..." : "Enhance All"}
            </span>
          </Button>

          {/* Download ZIP */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadAllZip}
            disabled={completedCount === 0}
            className="h-8 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All (ZIP)</span>
          </Button>

          {/* Clear & Close */}
          {queue.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAll}
              className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
            >
              Clear
            </Button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar for Batch */}
      {isBatchProcessing && (
        <div className="w-full bg-muted/40 h-1">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Queue Items Grid / List */}
      <div className="flex-1 overflow-y-auto p-5 max-h-[55vh]">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Queue is empty
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Select or drop multiple files here to upscale them simultaneously with consistent settings.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {queue.map((item) => {
              const displayUrl = item.enhancedUrl || item.originalUrl;
              return (
                <div
                  key={item.id}
                  className="group relative p-3 rounded-xl border border-border/60 bg-card hover:border-emerald-500/40 transition-all flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/50 border border-border/40 shrink-0 relative">
                    <img
                      src={displayUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {item.status === "processing" && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                      {item.originalDimensions && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.originalDimensions.width}×{item.originalDimensions.height}
                          </span>
                        </>
                      )}
                      {item.status === "completed" && item.enhancedDimensions && (
                        <>
                          <span aria-hidden="true">→</span>
                          <span className="text-emerald-500 font-medium">
                            {item.enhancedDimensions.width}×{item.enhancedDimensions.height}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {item.status === "completed" && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        )}
                        {item.status === "queued" && (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Queued
                          </span>
                        )}
                        {item.status === "processing" && (
                          <span className="text-[11px] font-medium text-emerald-500">
                            Enhancing ({item.progress}%)
                          </span>
                        )}
                        {item.status === "error" && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectForCanvas(item)}
                          title="Open in Canvas"
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {item.enhancedUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item)}
                            title="Download result"
                            className="p-1 rounded-md text-emerald-500 hover:text-emerald-400 hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove from queue"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
