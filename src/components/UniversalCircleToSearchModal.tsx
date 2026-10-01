import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Camera,
  CameraOff,
  SwitchCamera,
  X,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Eye,
  ShoppingBag,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCameraDevice } from "@/hooks/useCameraDevice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PriceRow {
  platform: string;
  price: string;
  bestDeal?: boolean;
  url?: string;
}

interface AnalysisResult {
  type?: "product" | "text" | "general";
  title?: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  priceComparison?: PriceRow[];
  ocrText?: string;
  translation?: string;
  academicBreakdown?: string;
  followUps?: string[];
  currency?: string;
}

interface Point {
  x: number;
  y: number;
}

interface UniversalCircleToSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalCircleToSearchModal({
  isOpen,
  onClose,
}: UniversalCircleToSearchModalProps) {
  const { hasCamera, multipleCameras } = useCameraDevice();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Canvas drawing state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const dirtyRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Initialize mode based on hardware camera sensing
  useEffect(() => {
    if (isOpen) {
      if (hasCamera) {
        setActiveTab("camera");
      } else {
        setActiveTab("upload");
      }
      setResult(null);
    }
  }, [isOpen, hasCamera]);

  // Camera start / stop
  const startCamera = useCallback(async (useFront = false) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useFront ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraRunning(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setIsCameraRunning(false);
      toast({
        title: "Camera Access Error",
        description: "Could not open camera stream. Switching to Image Upload mode.",
      });
      setActiveTab("upload");
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraRunning(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "camera" && hasCamera) {
      startCamera(useFrontCamera);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, hasCamera, useFrontCamera, startCamera, stopCamera]);

  // Handle camera flip
  const handleFlipCamera = () => {
    const nextFront = !useFrontCamera;
    setUseFrontCamera(nextFront);
    startCamera(nextFront);
  };

  // Canvas drawing loop
  useEffect(() => {
    if (!isOpen) return;

    const tick = () => {
      if (dirtyRef.current && canvasRef.current) {
        const c = canvasRef.current;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          const pts = pointsRef.current;
          if (pts.length >= 2) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // Glowing cyan outline
            ctx.shadowBlur = 24;
            ctx.shadowColor = "rgba(0, 240, 255, 0.9)";
            ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
            ctx.lineWidth = 12;
            drawSmooth(ctx, pts);

            // Crisp inner neon stroke
            ctx.shadowBlur = 8;
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#a5f3fc";
            drawSmooth(ctx, pts);
          }
        }
        dirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen]);

  function drawSmooth(ctx: CanvasRenderingContext2D, pts: Point[]) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  // Canvas pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (loading || result) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    drawingRef.current = true;
    pointsRef.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
    dirtyRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const pts = pointsRef.current;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 3) {
      pts.push(p);
      dirtyRef.current = true;
    }
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    processCircleSearch();
  };

  // Perform Vision Analysis on Circled Region
  const processCircleSearch = async () => {
    const pts = pointsRef.current;
    if (pts.length < 6) {
      pointsRef.current = [];
      dirtyRef.current = true;
      return;
    }

    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const sw = maxX - minX;
    const sh = maxY - minY;

    if (sw < 20 || sh < 20) {
      pointsRef.current = [];
      dirtyRef.current = true;
      return;
    }

    setLoading(true);

    try {
      let dataUrl = "";
      const offscreen = document.createElement("canvas");
      const octx = offscreen.getContext("2d");

      if (activeTab === "camera" && videoRef.current && videoRef.current.videoWidth) {
        const video = videoRef.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !octx) return;

        const scaleX = video.videoWidth / rect.width;
        const scaleY = video.videoHeight / rect.height;

        const sourceX = Math.max(0, minX * scaleX);
        const sourceY = Math.max(0, minY * scaleY);
        const sourceW = Math.min(video.videoWidth - sourceX, sw * scaleX);
        const sourceH = Math.min(video.videoHeight - sourceY, sh * scaleY);

        offscreen.width = Math.min(sourceW, 800);
        offscreen.height = Math.min(sourceH, 800 * (sourceH / sourceW));

        octx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, offscreen.width, offscreen.height);
        dataUrl = offscreen.toDataURL("image/jpeg", 0.85);
      } else if (activeTab === "upload" && imageRef.current) {
        const img = imageRef.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !octx) return;

        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        const sourceX = Math.max(0, minX * scaleX);
        const sourceY = Math.max(0, minY * scaleY);
        const sourceW = Math.min(img.naturalWidth - sourceX, sw * scaleX);
        const sourceH = Math.min(img.naturalHeight - sourceY, sh * scaleY);

        offscreen.width = Math.min(sourceW, 800);
        offscreen.height = Math.min(sourceH, 800 * (sourceH / sourceW));

        octx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, offscreen.width, offscreen.height);
        dataUrl = offscreen.toDataURL("image/jpeg", 0.85);
      }

      if (!dataUrl) {
        throw new Error("Could not extract image segment");
      }

      // Call Express Server Circle to Search Endpoint
      const response = await fetch("/api/circle-to-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          locale: navigator.language || "en-US",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const parsed = await response.json();
      setResult(parsed);
    } catch (err: any) {
      console.error("Circle to search error:", err);
      toast({
        title: "Search Error",
        description: "Failed to analyze circled object. Please try again.",
        variant: "destructive",
      });
      pointsRef.current = [];
      dirtyRef.current = true;
    } finally {
      setLoading(false);
    }
  };

  // Full Frame Snap & Analyze
  const handleSnapFullFrame = () => {
    if (canvasRef.current) {
      const c = canvasRef.current;
      pointsRef.current = [
        { x: 10, y: 10 },
        { x: c.width - 10, y: 10 },
        { x: c.width - 10, y: c.height - 10 },
        { x: 10, y: c.height - 10 },
        { x: 10, y: 10 },
      ];
      dirtyRef.current = true;
      processCircleSearch();
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setResult(null);
      pointsRef.current = [];
      dirtyRef.current = true;
    };
    reader.readAsDataURL(file);
  };

  // Reset circle search
  const handleResetSearch = () => {
    pointsRef.current = [];
    dirtyRef.current = true;
    setResult(null);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // TTS Read Aloud
  const handleSpeakResult = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${result.title || ""}. ${result.summary || ""}. ${
      result.academicBreakdown || ""
    }`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Ask in Live Mode
  const handleSendToLiveMode = (question?: string) => {
    onClose();
    navigate("/live-mode", {
      state: {
        initialPrompt:
          question ||
          `I just circled: ${result?.title}. Summary: ${result?.summary || ""}. Tell me more about it.`,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-card/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden text-foreground"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/80 bg-background/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <ScanSearch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                Circle to Search & Spatial Lens
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Multimodal
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Circle anything on camera or screen for instant object detection, price matching & OCR
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            {hasCamera && (
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("camera");
                    handleResetSearch();
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5",
                    activeTab === "camera"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Read Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    handleResetSearch();
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5",
                    activeTab === "upload"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Screen/Upload</span>
                </button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Viewfinder & Interactive Canvas Stage */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center select-none">
          {/* CAMERA FEED MODE */}
          {activeTab === "camera" && (
            <>
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground max-w-sm">
                  <CameraOff className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                  <p className="font-semibold text-foreground">No Camera Hardware Detected</p>
                  <p className="text-xs mt-1">This device has no active video cameras. Switch to Screen / Upload mode to circle any image.</p>
                </div>
              )}

              {/* Camera Controls Overlay */}
              {isCameraRunning && (
                <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                  {multipleCameras && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleFlipCamera}
                      className="rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 text-xs h-8"
                    >
                      <SwitchCamera className="w-3.5 h-3.5 mr-1.5" />
                      Flip Lens
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSnapFullFrame}
                    disabled={loading}
                    className="rounded-xl bg-cyan-600/80 backdrop-blur-md border border-cyan-400/50 text-white hover:bg-cyan-500 text-xs h-8"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Snap Entire View
                  </Button>
                </div>
              )}

              {/* Optical HUD Framing Target Elements */}
              {isCameraRunning && (
                <div className="absolute inset-8 pointer-events-none border border-cyan-500/20 rounded-2xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                </div>
              )}
            </>
          )}

          {/* SCREEN / UPLOAD MODE */}
          {activeTab === "upload" && (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              {uploadedImage ? (
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Inspection Subject"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-3xl cursor-pointer transition-colors max-w-sm text-center">
                  <Upload className="w-10 h-10 text-cyan-400 mb-3" />
                  <span className="font-semibold text-sm text-foreground">Upload or Drop Image to Inspect</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, or screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Drawing Canvas Layer */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
          />

          {/* Bottom Interactive Hint */}
          {!result && !loading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-white text-xs flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Draw a loop or circle around any object, text, or math equation</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
                <div className="w-full h-full rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                  <ScanSearch className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <p className="text-sm font-semibold tracking-wide">Analyzing Circled Region...</p>
              <p className="text-xs text-cyan-200/70 mt-1">Extracting spatial entities, OCR text & marketplace data</p>
            </div>
          )}
        </div>

        {/* ANALYSIS RESULTS PANEL (Slides up when result is ready) */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="relative border-t border-cyan-500/30 bg-card/95 backdrop-blur-2xl max-h-[50%] overflow-y-auto p-4 sm:p-6 shrink-0 z-40"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                        result.type === "product"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : result.type === "text"
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                          : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                      )}
                    >
                      {result.type || "Visual Match"}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {result.title || "Detected Item"}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Audio Readout & Reset Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSpeakResult}
                    className="h-8 rounded-xl border-border hover:bg-muted text-xs"
                    title={isSpeaking ? "Stop Voice" : "Listen to Analysis"}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-amber-400 mr-1" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                    )}
                    {isSpeaking ? "Mute" : "Speak"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetSearch}
                    className="h-8 rounded-xl border-border hover:bg-muted text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    New Circle
                  </Button>
                </div>
              </div>

              {/* Price Comparisons (if product) */}
              {result.priceComparison && result.priceComparison.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                    Live Marketplace Estimates {result.currency ? `(${result.currency})` : ""}:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {result.priceComparison.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url || `https://www.google.com/search?q=${encodeURIComponent(result.title || "product")}`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "p-2.5 rounded-xl border transition-all flex flex-col justify-between group",
                          p.bestDeal
                            ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                            : "bg-muted/40 border-border hover:border-muted-foreground/40"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>{p.platform}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-sm font-bold text-foreground">{p.price}</span>
                          {p.bestDeal && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              Best Deal
                            </span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text Extraction (if text) */}
              {result.ocrText && (
                <div className="mb-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Extracted Text / OCR:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(result.ocrText || "");
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedText ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-background/50 p-2 rounded-lg">
                    {result.ocrText}
                  </p>
                  {result.translation && (
                    <div className="mt-2 text-xs text-foreground bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                      <strong className="text-cyan-400">Translation: </strong>
                      {result.translation}
                    </div>
                  )}
                </div>
              )}

              {/* Academic & Equation Breakdown */}
              {result.academicBreakdown && (
                <div className="mb-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
                  <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Step-by-Step Solution & Concept Breakdown:
                  </div>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {result.academicBreakdown}
                  </p>
                </div>
              )}

              {/* Follow-up Prompts */}
              {result.followUps && result.followUps.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Ask Live AI:</span>
                  {result.followUps.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendToLiveMode(q)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
