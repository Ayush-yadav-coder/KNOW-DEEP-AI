import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle2, AlertCircle, HardDrive, Sparkles, X, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VideoExportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  filename: string;
  creationTitle?: string;
  resolution?: string;
  exportFormat?: string;
}

export function VideoExportProgressModal({
  isOpen,
  onClose,
  videoUrl,
  filename,
  creationTitle = "Veo 3.1 Cinematic Sequence",
  resolution = "1080p",
  exportFormat = "MP4"
}: VideoExportProgressModalProps) {
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing secure media buffer...");
  const [downloadSpeed, setDownloadSpeed] = useState<string>("Calculating...");
  const [transferredBytes, setTransferredBytes] = useState<string>("0 MB");
  const [totalBytes, setTotalBytes] = useState<string>("Pending");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !videoUrl) return;

    let isCancelled = false;
    setProgress(5);
    setStatusMessage("Connecting to media buffer...");
    setIsCompleted(false);
    setError(null);

    const startDownload = async () => {
      try {
        const startTime = Date.now();
        let targetUrl = videoUrl;

        // If not already a blob URL and not same-origin, proxy it to read stream packets
        if (!targetUrl.startsWith("blob:") && !targetUrl.startsWith(window.location.origin) && !targetUrl.startsWith("/")) {
          targetUrl = `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
        }

        setProgress(15);
        setStatusMessage("Requesting high-definition video chunks...");

        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`Media fetch failed with status ${response.status}`);
        }

        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        if (total > 0) {
          setTotalBytes(`${(total / (1024 * 1024)).toFixed(1)} MB`);
        } else {
          setTotalBytes("Dynamic Stream");
        }

        let blob: Blob;

        if (response.body && total > 0) {
          const reader = response.body.getReader();
          let received = 0;
          const chunks: Uint8Array[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (isCancelled) return;

            chunks.push(value);
            received += value.length;

            const percent = Math.min(94, Math.round(15 + (received / total) * 75));
            setProgress(percent);
            setTransferredBytes(`${(received / (1024 * 1024)).toFixed(1)} MB`);

            const elapsedSecs = Math.max(0.1, (Date.now() - startTime) / 1000);
            const speedMbps = ((received / (1024 * 1024)) / elapsedSecs).toFixed(1);
            setDownloadSpeed(`${speedMbps} MB/s`);
            setStatusMessage(`Downloading video chunks (${(received / (1024 * 1024)).toFixed(1)} MB / ${(total / (1024 * 1024)).toFixed(1)} MB)...`);
          }

          blob = new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" });
        } else {
          // Fallback if content-length is missing
          setProgress(50);
          setStatusMessage("Processing full video buffer...");
          blob = await response.blob();
          setTransferredBytes(`${(blob.size / (1024 * 1024)).toFixed(1)} MB`);
          setTotalBytes(`${(blob.size / (1024 * 1024)).toFixed(1)} MB`);
        }

        if (isCancelled) return;

        setProgress(96);
        setStatusMessage("Packaging finalized video file...");

        const localBlobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = localBlobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          if (!isCancelled) {
            setProgress(100);
            setStatusMessage("Download complete! File saved to your device.");
            setIsCompleted(true);
            setTimeout(() => window.URL.revokeObjectURL(localBlobUrl), 15000);
          }
        }, 400);

      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn("Progress download fallback:", err);
          setError("Network buffer direct stream failed. Attempting fallback download...");
          
          // Direct open fallback
          try {
            const a = document.createElement("a");
            a.href = videoUrl;
            a.target = "_blank";
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setProgress(100);
            setIsCompleted(true);
            setStatusMessage("Opened in download manager.");
          } catch (fallbackErr: unknown) {
            const msg = fallbackErr instanceof Error ? fallbackErr.message : "Failed to trigger download.";
            setError(msg);
          }
        }
      }
    };

    startDownload();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, videoUrl, filename]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="bg-card border border-border/80 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${
              isCompleted ? "bg-emerald-500" : error ? "bg-amber-500" : "bg-red-500"
            } shadow-lg shadow-red-500/10`}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <FileVideo className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <span>{isCompleted ? "Export Ready" : "Downloading Video"}</span>
                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {resolution} · {exportFormat}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                {creationTitle}
              </p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-3 bg-muted/30 border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-red-500" />
                <span>Buffer Progress</span>
              </span>
              <span className="font-mono font-bold text-red-500">{progress}%</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden relative border border-border/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
                className={`h-full rounded-full transition-all duration-200 ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-red-600 via-amber-500 to-red-500"
                }`}
              />
            </div>

            {/* Live Metrics readout */}
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
              <span>{transferredBytes} / {totalBytes}</span>
              <span>{downloadSpeed}</span>
            </div>
          </div>

          {/* Status Message Line */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground min-h-[22px]">
            {isCompleted ? (
              <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </span>
            ) : error ? (
              <span className="text-amber-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{statusMessage}</span>
              </span>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-border/40">
            {isCompleted ? (
              <Button
                type="button"
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-9"
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl text-xs font-semibold h-9"
                >
                  Close in Background
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = videoUrl;
                    a.download = filename;
                    a.click();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold h-9 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Direct Export</span>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
