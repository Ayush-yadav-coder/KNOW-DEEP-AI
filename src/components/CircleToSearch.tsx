import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Languages, GraduationCap, ShoppingBag, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface CircleToSearchProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onFollowUp?: (q: string) => void;
}

export default function CircleToSearch({ videoRef, enabled, onFollowUp }: CircleToSearchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  const [hasPoints, setHasPoints] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Resize canvas to viewport (DPR-aware)
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      const ctx = c.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirtyRef.current = true;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Single rAF loop that paints only when dirty (no per-move React re-renders)
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (dirtyRef.current) {
        const c = canvasRef.current;
        const ctx = c?.getContext("2d");
        if (c && ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          const pts = pointsRef.current;
          if (pts.length >= 2) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // Outer halo
            ctx.shadowBlur = 28;
            ctx.shadowColor = "rgba(0, 240, 255, 0.95)";
            ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
            ctx.lineWidth = 14;
            drawSmooth(ctx, pts);
            // Inner crisp line
            ctx.shadowBlur = 12;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(220, 250, 255, 0.98)";
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
      rafRef.current = null;
    };
  }, [enabled]);

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

  const getPoint = (e: React.PointerEvent): Point => ({
    x: e.clientX,
    y: e.clientY,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enabled || loading || result) return;
    e.preventDefault();
    drawingRef.current = true;
    pointsRef.current = [getPoint(e)];
    setHasPoints(true);
    dirtyRef.current = true;
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    // Throttle: only keep points moved >2px to limit array growth
    const pts = pointsRef.current;
    const p = getPoint(e);
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 2) {
      pts.push(p);
      dirtyRef.current = true;
    }
  };


  const clearPoints = useCallback(() => {
    pointsRef.current = [];
    setHasPoints(false);
    dirtyRef.current = true;
  }, []);

  const reset = useCallback(() => {
    clearPoints();
    setFrozenFrame(null);
    setResult(null);
    setLoading(false);
  }, [clearPoints]);

  const captureRegion = useCallback(async () => {
    const points = pointsRef.current;
    if (points.length < 8 || !videoRef.current) {
      clearPoints();
      return;
    }
    const video = videoRef.current;
    if (!video.videoWidth) {
      clearPoints();
      return;
    }

    // Bounding box of stroke in viewport coords
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Map viewport coords to video frame coords (object-cover style)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vidAspect = video.videoWidth / video.videoHeight;
    const viewAspect = vw / vh;
    let drawW = vw, drawH = vh, offX = 0, offY = 0;
    if (vidAspect > viewAspect) {
      drawH = vh;
      drawW = vh * vidAspect;
      offX = (vw - drawW) / 2;
    } else {
      drawW = vw;
      drawH = vw / vidAspect;
      offY = (vh - drawH) / 2;
    }
    const scale = video.videoWidth / drawW;
    const sx = Math.max(0, (minX - offX) * scale);
    const sy = Math.max(0, (minY - offY) * scale);
    const sw = Math.min(video.videoWidth - sx, (maxX - minX) * scale);
    const sh = Math.min(video.videoHeight - sy, (maxY - minY) * scale);

    if (sw < 20 || sh < 20) {
      clearPoints();
      return;
    }

    const longSide = Math.max(sw, sh);
    const outScale = longSide > 800 ? 800 / longSide : 1;
    const outW = Math.round(sw * outScale);
    const outH = Math.round(sh * outScale);
    const off = document.createElement("canvas");
    off.width = outW;
    off.height = outH;
    const octx = off.getContext("2d");
    if (!octx) return;
    octx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    const dataUrl = off.toDataURL("image/jpeg", 0.82);
    setFrozenFrame(dataUrl);
    setLoading(true);

    try {
      const locale = (typeof navigator !== "undefined" && navigator.language) || "en-US";
      const tz = (typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone) || "";
      const { data, error } = await supabase.functions.invoke("circle-to-search", {
        body: { image: dataUrl, locale, timezone: tz },
      });
      if (error) throw error;
      setResult(data as AnalysisResult);
    } catch (err) {
      console.error(err);
      toast({
        title: "Vision unavailable",
        description: "Couldn't analyze the selection. Try again.",
        variant: "destructive",
      });
      reset();
    } finally {
      setLoading(false);
    }
  }, [videoRef, toast, clearPoints, reset]);

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    captureRegion();
  };


  if (!enabled) return null;

  return (
    <>
      {/*
        Drawing canvas overlay.
        - Constrained to the area ABOVE the bottom control bar (bottom-40 on mobile, bottom-44 on md+)
          so the Circle / Mute / End-Call buttons stay tappable even while drawing.
        - touch-none disables browser scroll/zoom gestures inside the draw area.
        - pointer-events-auto is explicit so it always wins over any ancestor that toggles pointer-events.
      */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="fixed top-0 left-0 right-0 bottom-40 md:bottom-44 z-40 touch-none pointer-events-auto"
        style={{ cursor: "crosshair", touchAction: "none" }}
      />

      {/* Hint */}
      {!frozenFrame && !hasPoints && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/40 text-white text-xs"
        >
          <Sparkles className="inline w-3 h-3 mr-1 text-cyan-300" />
          Draw a circle around anything to analyze
        </motion.div>
      )}

      {/* Frozen frame + pulse */}
      <AnimatePresence>
        {frozenFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm pointer-events-none"
          >
            <motion.img
              src={frozenFrame}
              alt="captured"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 max-w-[60vw] max-h-[28vh] rounded-2xl border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(0,240,255,0.5)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-cyan-300 animate-spin" />
          <p className="text-white text-sm">Analyzing region…</p>
        </div>
      )}

      {/* Result panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl bg-slate-900/95 backdrop-blur-xl border-t border-cyan-400/30 shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center gap-2">
                {result.type === "product" && <ShoppingBag className="w-5 h-5 text-cyan-300" />}
                {result.type === "text" && <Languages className="w-5 h-5 text-cyan-300" />}
                {result.type === "general" && <Sparkles className="w-5 h-5 text-cyan-300" />}
                <h3 className="text-white font-semibold">{result.title || "Analysis"}</h3>
              </div>
              <Button size="icon" variant="ghost" onClick={reset} className="text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* Section A — Product Intelligence */}
              {result.summary && <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>}

              {(result.pros?.length || result.cons?.length) ? (
                <div className="grid grid-cols-2 gap-2">
                  {result.pros && result.pros.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1.5 font-semibold">Pros</p>
                      <ul className="space-y-1">
                        {result.pros.map((p, i) => <li key={i} className="text-xs text-white/90">+ {p}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.cons && result.cons.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/30">
                      <p className="text-[10px] uppercase tracking-wider text-rose-300 mb-1.5 font-semibold">Cons</p>
                      <ul className="space-y-1">
                        {result.cons.map((p, i) => <li key={i} className="text-xs text-white/90">– {p}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Section B — Live Price Comparison */}
              {result.type === "product" && result.priceComparison && result.priceComparison.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-cyan-300/80">
                    Live Prices {result.currency ? `(${result.currency})` : ""}
                  </p>
                  {result.priceComparison.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        row.bestDeal
                          ? "bg-emerald-500/15 border-emerald-400/40"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{row.platform}</span>
                        {row.bestDeal && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" /> Best Deal
                          </span>
                        )}
                      </div>
                      <span className="text-white font-mono">{row.price}</span>
                    </motion.div>
                  ))}

                  {/* Section C — Direct Action Links */}
                  {result.priceComparison.some((r) => r.url) && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {result.priceComparison.filter((r) => r.url).map((row, i) => (
                        <a
                          key={i}
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-300/40 text-xs text-white font-medium transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Open {row.platform}
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 italic">
                    Prices are AI-estimated, verify on retailer site before buying.
                  </p>
                </div>
              )}

              {/* OCR text */}
              {result.ocrText && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300/80 mb-1">Detected Text</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{result.ocrText}</p>
                </div>
              )}

              {/* Translation */}
              {result.translation && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/30">
                  <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1">
                    <Languages className="w-3 h-3" /> Instant Translation
                  </p>
                  <p className="text-sm text-white">{result.translation}</p>
                </div>
              )}

              {/* Academic */}
              {result.academicBreakdown && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30">
                  <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Academic Blueprint
                  </p>
                  <p className="text-sm text-white whitespace-pre-wrap">{result.academicBreakdown}</p>
                </div>
              )}

              {/* Follow-ups */}
              {result.followUps && result.followUps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-cyan-300/80">Ask Next</p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.followUps.slice(0, 4).map((q, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        onClick={() => {
                          onFollowUp?.(q);
                          reset();
                        }}
                        className="text-left p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-xs text-white transition-colors"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
