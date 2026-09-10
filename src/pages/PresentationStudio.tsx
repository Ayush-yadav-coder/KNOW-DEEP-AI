import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Presentation,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Sparkles,
  Loader2,
  Palette,
  X,
  FileText,
  Layers,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Slide {
  slideNumber: number;
  title: string;
  subtitle: string;
  bullets: string[];
  speakerNotes: string;
}

const THEMES = [
  { id: "Modern Dark", name: "Modern Dark", bg: "bg-slate-950 border-slate-800 text-slate-100", accent: "text-purple-400" },
  { id: "Minimalist Light", name: "Minimalist Light", bg: "bg-stone-50 border-stone-200 text-stone-900", accent: "text-stone-800" },
  { id: "Corporate Blue", name: "Corporate Blue", bg: "bg-slate-900 border-blue-900/50 text-white", accent: "text-blue-400" },
  { id: "Creative Gradient", name: "Creative Gradient", bg: "bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-purple-800/40 text-white", accent: "text-pink-400" },
];

export default function PresentationStudio() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("AI-Driven Enterprise Transformation & Agentic Workflows in 2026");
  const [slideCount, setSlideCount] = useState<number>(5);
  const [selectedTheme, setSelectedTheme] = useState<string>("Modern Dark");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  const [slides, setSlides] = useState<Slide[]>([
    {
      slideNumber: 1,
      title: "AI-Driven Enterprise Transformation",
      subtitle: "Autonomous Agents, Scalable Infrastructure, and Operational Leverage",
      bullets: [
        "Transitioning from passive chatbot interfaces to multi-agent task engines",
        "Deterministic guardrails paired with probabilistic model reasoning",
        "Institutional ROI: Achieving 40%+ productivity acceleration across knowledge workflows",
      ],
      speakerNotes: "Welcome everyone. Today we are unpacking the seismic shift from toy generative demos to mission-critical agentic orchestration.",
    },
    {
      slideNumber: 2,
      title: "The Three Pillars of Agentic Architecture",
      subtitle: "Memory, Reasoning, and Environmental Grounding",
      bullets: [
        "Episodic vs Semantic Memory: Persistent knowledge retrieval pipelines",
        "Deterministic tool execution with real-time feedback loops",
        "Self-correcting verification loops to eradicate hallucinations",
      ],
      speakerNotes: "Emphasize how reasoning is ineffective without reliable real-time grounding in production databases.",
    },
    {
      slideNumber: 3,
      title: "Strategic Implementation Roadmap",
      subtitle: "Phase 1 to Phase 3 Rollout Schedule",
      bullets: [
        "Q1: Micro-pilot deployment in internal workflow automation",
        "Q2: Multi-modal document intelligence and analytics integration",
        "Q3: Cross-department autonomous orchestration and telemetry",
      ],
      speakerNotes: "Walk the board through the timeline, highlighting that Phase 1 carries zero customer-facing risk.",
    },
  ]);

  const activeTheme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];
  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleGenerateDeck = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a presentation topic.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/presentation-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slideCount,
          theme: selectedTheme,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides);
        setCurrentSlideIndex(0);
        toast({ title: "Deck Generated", description: `Created ${data.slides.length} custom slides.` });
      }
    } catch {
      toast({ title: "Generation failed", description: "Could not generate slides.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex + 1 < slides.length) setCurrentSlideIndex(currentSlideIndex + 1);
  };

  // One-Click "Export to PDF"
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const slidesHtml = slides
      .map(
        (s) => `
        <div style="page-break-after: always; height: 100vh; padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif;">
          <p style="font-size: 14px; text-transform: uppercase; color: #a855f7; margin: 0 0 10px 0;">Slide ${s.slideNumber} of ${slides.length}</p>
          <h1 style="font-size: 36px; margin: 0 0 10px 0;">${s.title}</h1>
          <h3 style="font-size: 20px; color: #94a3b8; font-weight: normal; margin: 0 0 30px 0;">${s.subtitle}</h3>
          <ul style="font-size: 18px; line-height: 1.8; padding-left: 24px;">
            ${s.bullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>${topic}</title></head>
        <body style="margin: 0;">
          ${slidesHtml}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast({ title: "Export to PDF", description: "Print dialog opened for PDF export." });
  };

  return (
    <AppLayout title="Presentation Studio">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md">
                <Presentation className="w-5 h-5" />
              </span>
              <span>Presentation Studio</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              AI slide deck generator with visual themes, presenter mode, speaker notes, and PDF export
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPresenterMode(true)}
              className="h-8 text-xs rounded-xl gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current text-fuchsia-400" />
              Presenter Mode
            </Button>
            <Button
              size="sm"
              onClick={handleExportPDF}
              className="h-8 text-xs rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export to PDF
            </Button>
          </div>
        </div>

        {/* Deck Config Bar */}
        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Topic Input */}
            <div className="md:col-span-6">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Presentation Subject &amp; Focus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Q3 Financial Growth & Enterprise AI Strategy..."
                className="w-full h-9 text-xs rounded-xl bg-muted border border-border px-3 font-semibold focus:outline-none"
              />
            </div>

            {/* Slide Count Slider */}
            <div className="md:col-span-3">
              <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
                <span>Slide Count:</span>
                <span className="text-fuchsia-400 font-mono">{slideCount} Slides</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            {/* Theme Selector */}
            <div className="md:col-span-3">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Visual Theme</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full h-9 text-xs rounded-xl bg-muted border border-border px-2.5 font-semibold focus:outline-none"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerateDeck}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:opacity-90 text-white font-semibold text-xs h-10 rounded-xl"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Complete Slide Deck
          </Button>
        </div>

        {/* Slide Carousel Workspace */}
        <div className="space-y-4">
          {/* Main Slide Stage */}
          <div
            className={`min-h-[420px] rounded-3xl p-8 sm:p-12 border shadow-2xl flex flex-col justify-between relative transition-all ${activeTheme.bg}`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className={`text-xs font-bold uppercase tracking-widest ${activeTheme.accent}`}>
                  Slide {activeSlide.slideNumber} of {slides.length}
                </span>
                <span className="text-xs opacity-50 font-mono">Know Deep Presentation Deck</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                {activeSlide.title}
              </h2>
              <p className="text-sm sm:text-base opacity-75 font-medium mb-8">
                {activeSlide.subtitle}
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3 max-w-3xl">
                {activeSlide.bullets.map((b, i) => (
                  <li key={i} className="text-xs sm:text-sm flex items-start gap-3 leading-relaxed">
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activeTheme.accent} bg-current`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Navigation Overlay Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="h-8 text-xs rounded-xl gap-1 bg-black/40 border-white/20 text-white hover:bg-black/60"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <span className="text-xs font-mono opacity-60">
                {currentSlideIndex + 1} / {slides.length}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={handleNextSlide}
                disabled={currentSlideIndex + 1 >= slides.length}
                className="h-8 text-xs rounded-xl gap-1 bg-black/40 border-white/20 text-white hover:bg-black/60"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Strip Navigator */}
          <div className="p-3 rounded-2xl bg-card border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Slide Thumbnails ({slides.length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {slides.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-36 h-20 rounded-xl p-2.5 text-left border shrink-0 transition-all flex flex-col justify-between ${
                    currentSlideIndex === idx
                      ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-sm"
                      : "border-border/60 bg-muted/40 hover:bg-muted/80 opacity-70"
                  }`}
                >
                  <span className="text-[10px] font-bold text-fuchsia-400">#{s.slideNumber}</span>
                  <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight">
                    {s.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
              Speaker Notes (Slide {activeSlide.slideNumber})
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeSlide.speakerNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Full-Screen Presenter Mode Modal */}
      <AnimatePresence>
        {presenterMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 p-8 sm:p-16 flex flex-col justify-between ${activeTheme.bg}`}
          >
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold uppercase tracking-widest ${activeTheme.accent}`}>
                Slide {activeSlide.slideNumber} of {slides.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className="px-3 py-1 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  {showSpeakerNotes ? "Hide Notes" : "Show Notes"}
                </button>
                <button
                  onClick={() => setPresenterMode(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="max-w-5xl mx-auto w-full my-auto space-y-6">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {activeSlide.title}
              </h1>
              <p className="text-xl opacity-75 font-medium">
                {activeSlide.subtitle}
              </p>
              <ul className="space-y-4 pt-4">
                {activeSlide.bullets.map((b, i) => (
                  <li key={i} className="text-base sm:text-xl flex items-start gap-4 leading-relaxed">
                    <span className={`w-3 h-3 rounded-full mt-2.5 shrink-0 ${activeTheme.accent} bg-current`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Speaker Notes Drawer (in Presenter Mode) */}
            {showSpeakerNotes && (
              <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                <span className="text-[10px] uppercase font-bold text-fuchsia-400 block mb-1">
                  Private Presenter Notes
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeSlide.speakerNotes}
                </p>
              </div>
            )}

            {/* Presenter Footer Bar */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                Previous Slide
              </Button>
              <span className="text-sm font-mono opacity-60">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="outline"
                onClick={handleNextSlide}
                disabled={currentSlideIndex + 1 >= slides.length}
                className="rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                Next Slide
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
