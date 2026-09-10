import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, ScanLine, RotateCcw, Sparkles, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";

interface XRayStep {
  title: string;
  explanation: string;
  svg: string;
}
interface XRayResult {
  concept: string;
  steps: XRayStep[];
}

export default function ConceptXRay() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<XRayResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const limit = useDailyMessageLimit();

  const currentStep = useMemo(
    () => (result && result.steps[stepIndex]) || null,
    [result, stepIndex]
  );

  const safeSvgMarkup = useMemo(() => {
    if (!currentStep?.svg || typeof DOMParser === "undefined") return "";
    const parsed = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg">${currentStep.svg}</svg>`,
      "image/svg+xml"
    );
    if (parsed.querySelector("parsererror")) return "";
    parsed.querySelectorAll("script, foreignObject, image, animate, set, iframe, use, video, audio, object, embed, style, link").forEach((node) => node.remove());
    parsed.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        if (attribute.name.toLowerCase().startsWith("on") || /^(href|xlink:href|src|style)$/i.test(attribute.name)) {
          node.removeAttribute(attribute.name);
        }
      });
    });
    return parsed.documentElement.innerHTML;
  }, [currentStep]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Image required", description: "Please upload a textbook photo.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setResult(null);
      setStepIndex(0);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageDataUrl) return;
    if (!(await limit.tryConsume())) return;

    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/concept-xray`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
          body: JSON.stringify({ imageBase64: imageDataUrl }),
        }
      );
      const data = await res.json();
      if (data.error && !data.steps) throw new Error(data.error);
      setResult(data);
      setStepIndex(0);
    } catch (e) {
      toast({
        title: "Analysis failed",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setResult(null);
    setStepIndex(0);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <DailyLimitDialog open={limit.showUpgrade} onOpenChange={limit.setShowUpgrade} />

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-white/30 dark:border-border/50 backdrop-blur-md mb-3">
            <ScanLine className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-medium">Concept X-Ray</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-700 dark:text-cyan-300">BETA</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
            See textbooks come alive
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Snap a page from any equation, diagram or process. Scrub the slider to watch how it solves itself, step by step.
          </p>
        </div>

        {/* Upload */}
        {!imageDataUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-white/40 dark:border-border/60 bg-white/40 dark:bg-card/40 backdrop-blur-xl p-12 text-center cursor-pointer hover:bg-white/60 dark:hover:bg-card/60 transition"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-500" />
            <p className="font-semibold mb-1">Upload or snap a textbook page</p>
            <p className="text-xs text-muted-foreground">JPG / PNG · works best on a single concept</p>
          </motion.div>
        )}

        {/* Workspace */}
        {imageDataUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-white/40 dark:border-border/60 bg-black/5 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
              <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={imageDataUrl}
                  alt="Textbook page"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {/* Animated SVG overlay */}
                <AnimatePresence mode="wait">
                  {currentStep && (
                    <motion.svg
                      key={stepIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
                      dangerouslySetInnerHTML={{ __html: safeSvgMarkup }}
                    />
                  )}
                </AnimatePresence>

                {/* Scanning overlay while loading */}
                {loading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="relative w-16 h-16">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-cyan-400"
                          animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <ScanLine className="w-16 h-16 text-cyan-400 relative" />
                      </div>
                      <p className="text-sm font-medium">X-raying concept...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            {!result && !loading && (
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={reset} className="rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" /> Choose another
                </Button>
                <Button
                  onClick={analyze}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Run X-Ray
                </Button>
              </div>
            )}

            {/* Step slider + explanation */}
            {result && result.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/40 dark:border-border/60 shadow-lg space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {stepIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{currentStep?.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{currentStep?.explanation}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[stepIndex]}
                    min={0}
                    max={result.steps.length - 1}
                    step={1}
                    onValueChange={(v) => setStepIndex(v[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {result.steps.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setStepIndex(i)}
                        className={`px-2 py-0.5 rounded transition ${
                          i === stepIndex
                            ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold"
                            : "hover:text-foreground"
                        }`}
                      >
                        Step {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={reset} className="rounded-lg">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> New image
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStepIndex((i) => Math.min(result.steps.length - 1, i + 1))}
                    disabled={stepIndex >= result.steps.length - 1}
                    className="rounded-lg ml-auto bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
                  >
                    Next step <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
