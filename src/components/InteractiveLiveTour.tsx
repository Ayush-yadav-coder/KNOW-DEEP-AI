import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
  CheckCircle2,
  FolderOpen,
  Boxes,
  Image as ImageIcon,
  Video,
  FileText,
  Terminal,
  MessageSquare,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

export interface TourStep {
  id: string;
  type: "sidebar" | "page";
  title: string;
  badge: string;
  targetRoute: string;
  targetElementId?: string;
  openSidebar?: boolean;
  closeSidebar?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  durationSeconds: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "sidebar-my-stuff",
    type: "sidebar",
    title: "1. Spotlight: My Stuff",
    badge: "Sidebar Navigation",
    targetRoute: "/chat",
    targetElementId: "tour-sidebar-my-stuff",
    openSidebar: true,
    closeSidebar: false,
    icon: FolderOpen,
    description: "Your centralized creative vault in the sidebar.",
    details: [
      "Spotlighting My Stuff in the navigation drawer.",
      "Your unified hub for all generated images, video creations, code scripts, and documents.",
      "Opening My Stuff in 5 seconds to show everything inside...",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-my-stuff",
    type: "page",
    title: "2. Exploring My Stuff Hub",
    badge: "Cloud Vault & Double Save",
    targetRoute: "/my-stuff",
    openSidebar: false,
    closeSidebar: true,
    icon: FolderOpen,
    description: "Live showcase of your gallery with dual save options.",
    details: [
      "Here is everything in your personal workspace!",
      "Filter by Images, Videos, Documents, and Code.",
      "Dual Save: Download file directly to device OR save to cloud gallery.",
    ],
    durationSeconds: 5,
  },
  {
    id: "sidebar-connectors",
    type: "sidebar",
    title: "3. Spotlight: Connectors",
    badge: "Sidebar Navigation",
    targetRoute: "/my-stuff",
    targetElementId: "tour-sidebar-connectors",
    openSidebar: true,
    closeSidebar: false,
    icon: Boxes,
    description: "Third-party app sync & webhook management.",
    details: [
      "Spotlighting Connectors right below My Stuff.",
      "Link external tools, Google Drive, GitHub, and custom webhooks.",
      "Opening Connectors in 5 seconds to show everything inside...",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-connectors",
    type: "page",
    title: "4. Exploring Connectors Hub",
    badge: "Active Integrations",
    targetRoute: "/connected-apps",
    openSidebar: false,
    closeSidebar: true,
    icon: Boxes,
    description: "Full dashboard to connect and configure external tools.",
    details: [
      "Live integration management hub.",
      "Real-time token sync, webhook endpoints, and active tool status.",
      "Safely connect and remove connectors with safety confirmations.",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-image-studio",
    type: "page",
    title: "5. 8K Vision Studio & Image Generator",
    badge: "Google Imagen 3",
    targetRoute: "/image-generator",
    openSidebar: false,
    closeSidebar: true,
    icon: ImageIcon,
    description: "8K photorealistic image generation with live canvas preview.",
    details: [
      "Cinematic aspect ratios (16:9, 1:1, 9:16, 4:3) and style presets.",
      "Live preview canvas renders before saving.",
      "Dual Export: 'Download PNG' to device + 'Save to My Gallery'!",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-video-studio",
    type: "page",
    title: "6. Director AI Video Studio",
    badge: "Cinematic Veo 3.1",
    targetRoute: "/video-studio",
    openSidebar: false,
    closeSidebar: true,
    icon: Video,
    description: "Cinematic prompt-to-video studio with full cinema player.",
    details: [
      "Camera motion paths (Dolly, Orbit, Zoom, Pan, Tilt) and storyboard.",
      "Cinema screen viewer with interactive playback scrubber.",
      "Dual Export: 'Download Video (MP4)' + 'Save to Video Gallery'!",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-document-studio",
    type: "page",
    title: "7. Document Studio",
    badge: "Executive Editor",
    targetRoute: "/document-studio",
    openSidebar: false,
    closeSidebar: true,
    icon: FileText,
    description: "Rich document editing with AI executive summaries and tone shifting.",
    details: [
      "Full formatting tools, headings, lists, and multi-version history.",
      "Export to PDF and Word format in one click.",
      "Auto-syncs generated documents straight to My Stuff.",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-code-studio",
    type: "page",
    title: "8. Code Studio & IDE",
    badge: "Monaco Developer Hub",
    targetRoute: "/code-studio",
    openSidebar: false,
    closeSidebar: true,
    icon: Terminal,
    description: "Full-featured code IDE with terminal, debugger, and linting.",
    details: [
      "Monaco editor supporting TypeScript, Python, HTML/CSS, and C++.",
      "Live terminal execution, refactor smells, and error diagnosis.",
      "Automatic project save to My Stuff and ZIP bundle downloads.",
    ],
    durationSeconds: 5,
  },
  {
    id: "page-chat-return",
    type: "page",
    title: "9. Universal AI Chat",
    badge: "Voice Waveform & Smart Intents",
    targetRoute: "/chat",
    openSidebar: false,
    closeSidebar: true,
    icon: MessageSquare,
    description: "Your home base with heartbeat mic animation and smart studio intents.",
    details: [
      "Heartbeat waveform mic line animation during voice input.",
      "Smart Intent Preview Banners detect studio requests without forced redirects.",
      "Persistent memory and 40+ language translation support.",
    ],
    durationSeconds: 6,
  },
];

const STORAGE_ACTIVE_KEY = "knowdeep_live_tour_active";
const STORAGE_STEP_KEY = "knowdeep_live_tour_step";

export const InteractiveLiveTour: React.FC = () => {
  // Check if tour was already active in session
  const [isActive, setIsActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_ACTIVE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_STEP_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setSidebarOpen } = useAppStore();

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  // Listen to custom start event
  useEffect(() => {
    const handleStartTour = () => {
      try {
        sessionStorage.setItem(STORAGE_ACTIVE_KEY, "true");
        sessionStorage.setItem(STORAGE_STEP_KEY, "0");
      } catch {}
      setCurrentStepIndex(0);
      setSecondsRemaining(TOUR_STEPS[0].durationSeconds);
      setIsPaused(false);
      setIsActive(true);
    };

    window.addEventListener("knowdeep_start_interactive_tour", handleStartTour);
    return () => {
      window.removeEventListener("knowdeep_start_interactive_tour", handleStartTour);
    };
  }, []);

  // Update spotlight target bounds
  const updateSpotlightBounds = useCallback(() => {
    if (!currentStep.targetElementId) {
      setSpotlightRect(null);
      return;
    }
    const el = document.getElementById(currentStep.targetElementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep.targetElementId]);

  // Handle Step Transitions whenever currentStepIndex changes
  useEffect(() => {
    if (!isActive) return;

    try {
      sessionStorage.setItem(STORAGE_ACTIVE_KEY, "true");
      sessionStorage.setItem(STORAGE_STEP_KEY, currentStepIndex.toString());
    } catch {}

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    // Reset countdown for this new step
    setSecondsRemaining(step.durationSeconds);

    // Sidebar state
    if (step.openSidebar) {
      setSidebarOpen(true);
    } else if (step.closeSidebar) {
      setSidebarOpen(false);
    }

    // Navigation
    if (step.targetRoute && location.pathname !== step.targetRoute) {
      navigate(step.targetRoute);
    }

    // Delay checking spotlight bounds so sidebar drawer can slide out
    const timer = setTimeout(() => {
      updateSpotlightBounds();
    }, 450);

    return () => clearTimeout(timer);
  }, [isActive, currentStepIndex]); // Notice: explicitly depending on currentStepIndex only for clean transitions!

  // Re-calculate spotlight on resize or scroll
  useEffect(() => {
    if (!isActive || !currentStep.targetElementId) return;
    const handleRecalc = () => updateSpotlightBounds();
    window.addEventListener("resize", handleRecalc);
    window.addEventListener("scroll", handleRecalc);
    return () => {
      window.removeEventListener("resize", handleRecalc);
      window.removeEventListener("scroll", handleRecalc);
    };
  }, [isActive, currentStep.targetElementId, updateSpotlightBounds]);

  // Robust 1-Second Interval Timer
  useEffect(() => {
    if (!isActive || isPaused) return;

    if (secondsRemaining <= 0) {
      // Step timer expired, advance!
      if (currentStepIndex < TOUR_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        handleFinishTour();
      }
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, isPaused, secondsRemaining, currentStepIndex]);

  const handleNextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinishTour();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinishTour = () => {
    setIsActive(false);
    setSidebarOpen(false);
    setSpotlightRect(null);
    try {
      sessionStorage.removeItem(STORAGE_ACTIVE_KEY);
      sessionStorage.removeItem(STORAGE_STEP_KEY);
      localStorage.setItem("knowdeep_v3_tour_completed", "true");
      localStorage.setItem("knowdeep_v3_updates_tour_seen", "true");
    } catch {}
    navigate("/chat");
    toast({
      title: "🎉 Tour Completed!",
      description: "You're all set! Replay this interactive tour anytime from the Chat header.",
    });
  };

  const handleSkipTour = () => {
    setIsActive(false);
    setSidebarOpen(false);
    setSpotlightRect(null);
    try {
      sessionStorage.removeItem(STORAGE_ACTIVE_KEY);
      sessionStorage.removeItem(STORAGE_STEP_KEY);
      localStorage.setItem("knowdeep_v3_tour_completed", "true");
      localStorage.setItem("knowdeep_v3_updates_tour_seen", "true");
    } catch {}
    navigate("/chat");
    toast({
      title: "Tour Exited",
      description: "You can restart the live guided tour anytime from the top Chat menu.",
    });
  };

  if (!isActive) return null;

  const IconComponent = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;
  const countdownPercent = ((currentStep.durationSeconds - secondsRemaining) / currentStep.durationSeconds) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between">
        {/* TOP INTERACTIVE TOUR CONTROL BAR (Sticky on top with Skip Button) */}
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto w-full bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/40 text-white shadow-2xl px-4 py-2.5 z-[101]"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Brand + Step Number */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Know Deep Live Tour
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {currentStep.title}
                </p>
              </div>
            </div>

            {/* Center: Live 5-Second Timer & Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Progress Ring / Countdown Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-inner">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 -rotate-90">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray={37.7}
                      strokeDashoffset={37.7 - (37.7 * countdownPercent) / 100}
                      className="text-cyan-400 transition-all duration-1000 ease-linear"
                    />
                  </svg>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {secondsRemaining}s
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {isPaused ? "(Paused)" : "auto-next"}
                </span>
              </div>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title={isPaused ? "Resume auto-timer" : "Pause auto-timer to explore"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Step Navigation Arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Previous Step"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-xs transition-colors"
                  title="Next Step"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: PROMINENT SKIP BUTTON */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleSkipTour}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs transition-all shadow-sm active:scale-95"
                title="Skip tour and resume work immediately"
              >
                <X className="w-3.5 h-3.5" />
                <span>Skip Tour</span>
              </button>
            </div>
          </div>

          {/* Overall Tour Progress Line */}
          <div className="w-full bg-slate-800/80 h-1 mt-2.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* SPOTLIGHT BEACON FOR SIDEBAR ITEMS */}
        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[102] rounded-2xl border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.85)] ring-4 ring-cyan-500/30 transition-all duration-300"
            style={{
              top: spotlightRect.top - 4,
              left: spotlightRect.left - 4,
              width: spotlightRect.width + 8,
              height: spotlightRect.height + 8,
            }}
          >
            {/* Glowing Pointer Badge */}
            <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1 animate-bounce">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Looking Here</span>
            </div>
          </motion.div>
        )}

        {/* BOTTOM EXPLANATORY CARD (Floats above page content with full descriptions) */}
        <motion.div
          key={currentStep.id}
          initial={{ y: 50, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto mx-auto mb-6 max-w-xl w-[calc(100%-2rem)] p-4 sm:p-5 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 text-white shadow-2xl shadow-cyan-950/50 z-[101]"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold text-cyan-400">
                  {currentStep.badge}
                </span>
                <span className="text-slate-600 dark:text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {currentStep.description}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {currentStep.title}
              </h3>

              <div className="mt-2.5 space-y-1.5">
                {currentStep.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Action row */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Advancing to next in <span className="font-mono text-cyan-300 font-bold">{secondsRemaining}s</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <span>{currentStepIndex === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Feature"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
