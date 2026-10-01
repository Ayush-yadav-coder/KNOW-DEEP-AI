import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Video,
  Presentation,
  Code2,
  FileText,
  Wand2,
  BookOpen,
  Languages,
  ListFilter,
  GraduationCap,
  Activity,
  Terminal,
  CloudSun,
  Newspaper,
  Trophy,
  FolderOpen,
  Zap,
  Eye,
  Download,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsNewGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureGuideItem {
  id: string;
  title: string;
  category: "Creative Studios" | "Information & Research" | "Workspace & Navigation";
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeColor: string;
  targetRoute: string;
  summary: string;
  deepSubFeatures: string[];
  autoSaveNote: string;
}

const FEATURE_GUIDE_ITEMS: FeatureGuideItem[] = [
  {
    id: "auto-redirect",
    title: "Smart Intent Banners & Preview System",
    category: "Workspace & Navigation",
    icon: Zap,
    badge: "Auto Integration",
    badgeColor: "from-cyan-500 to-blue-600",
    targetRoute: "/chat",
    summary: "Intelligent query detection automatically presents 1-click studio preview banners with zero forced redirects.",
    deepSubFeatures: [
      "Ask 'create a document' or 'enhance photo' to trigger direct preview cards.",
      "Choose 'Launch Studio' or 'Stay in Chat' with zero disruption.",
      "Dual-option previews for Weather, News, Sports, Homework, and Translator.",
      "No auto-navigation timers — you remain in total control.",
    ],
    autoSaveNote: "Integrated directly into AI Chat dock",
  },
  {
    id: "my-stuff-gallery",
    title: "My Stuff Hub & Double Save Options",
    category: "Workspace & Navigation",
    icon: FolderOpen,
    badge: "Gallery Storage",
    badgeColor: "from-purple-500 to-pink-600",
    targetRoute: "/my-stuff",
    summary: "Centralized cloud gallery with dual options: Download file to device AND Save to My Gallery.",
    deepSubFeatures: [
      "Image Generator: Download PNG + Save to My Gallery.",
      "Video Studio: Download MP4 + Save to Video Gallery.",
      "Code & Document Studios: Auto-syncs projects directly to My Stuff.",
      "Connected Apps: Connect Google Drive, GitHub, and Notion drives.",
    ],
    autoSaveNote: "Saved assets accessible anytime in My Stuff",
  },
  {
    id: "vision-studio",
    title: "8K Vision Studio & Image Generator",
    category: "Creative Studios",
    icon: ImageIcon,
    badge: "Google Imagen 3",
    badgeColor: "from-purple-600 to-pink-500",
    targetRoute: "/image-generator",
    summary: "8K photorealistic art studio with style presets, aspect ratios, and vision analysis.",
    deepSubFeatures: [
      "Google Imagen 3 (8K high-definition rendering).",
      "Dignity & modesty guardrails for portrait figures.",
      "Vision Image-to-Prompt descriptor & side-by-side remixing.",
      "Quad-canvas variations grid for parallel concept generation.",
    ],
    autoSaveNote: "Download PNG + Save to My Gallery supported",
  },
  {
    id: "image-enhancer",
    title: "4K / 8K AI Image Enhancer",
    category: "Creative Studios",
    icon: Wand2,
    badge: "Quality Upscaler",
    badgeColor: "from-indigo-500 to-purple-600",
    targetRoute: "/image-enhancer",
    summary: "Restore low-res photos, remove grain noise, sharpen faces, and upscale up to 8K.",
    deepSubFeatures: [
      "Denoise & artifact compression removal.",
      "Facial clarity restoration and skin texture sharpening.",
      "HD dynamic range and contrast boosting.",
      "Download enhanced high-res PNG file.",
    ],
    autoSaveNote: "Auto-saves enhanced images to My Stuff",
  },
  {
    id: "director-video",
    title: "Director AI Video Studio",
    category: "Creative Studios",
    icon: Video,
    badge: "Veo 3.1 Cinematic",
    badgeColor: "from-red-500 to-amber-600",
    targetRoute: "/video-studio",
    summary: "Cinematic prompt-to-video studio with camera paths, storyboards, and audio foley.",
    deepSubFeatures: [
      "Camera motion paths (Dolly, Orbit, Zoom, Pan, Tilt).",
      "Multi-scene timed storyboard progression.",
      "AI narrator voiceover and Foley sound effect generator.",
      "Social Reframe auto-cropper (16:9 to 9:16 reels).",
    ],
    autoSaveNote: "Download MP4 + Save to Video Gallery supported",
  },
  {
    id: "slide-architect",
    title: "Slide Architect Presentation Studio",
    category: "Creative Studios",
    icon: Presentation,
    badge: "Multi-Slide Deck",
    badgeColor: "from-fuchsia-500 to-violet-600",
    targetRoute: "/presentation-studio",
    summary: "Generates multi-slide presentation decks with layout engines, script notes, and PPTX export.",
    deepSubFeatures: [
      "Corporate, Academic Defense, and Startup Pitch deck themes.",
      "Line-by-line speaker notes & presentation scripts.",
      "Direct export to Microsoft PowerPoint (.pptx) and PDF.",
    ],
    autoSaveNote: "Decks saved to My Stuff presentation section",
  },
  {
    id: "code-studio",
    title: "KnowDeep Code Studio & Sandbox",
    category: "Creative Studios",
    icon: Code2,
    badge: "Full-Stack IDE",
    badgeColor: "from-cyan-500 to-blue-600",
    targetRoute: "/code-studio",
    summary: "Multi-file web IDE with live iframe rendering, terminal execution, and AI debugger.",
    deepSubFeatures: [
      "Multi-file React, HTML, CSS, TSX project editor.",
      "Instant live sandboxed execution preview.",
      "Package manager with NPM dependency injection.",
      "AI Copilot for one-click bug fixes & code refactoring.",
    ],
    autoSaveNote: "Auto-saves full project code to My Stuff",
  },
  {
    id: "doc-architect",
    title: "Doc Architect Studio",
    category: "Creative Studios",
    icon: FileText,
    badge: "Structured Editor",
    badgeColor: "from-emerald-500 to-teal-600",
    targetRoute: "/document-studio",
    summary: "Structured document writer for formal reports, executive summaries, and whitepapers.",
    deepSubFeatures: [
      "Auto-generated table of contents and heading hierarchy.",
      "Academic citations and key takeaway highlight blocks.",
      "Direct export to PDF and formatted Word (.docx) files.",
    ],
    autoSaveNote: "Auto-saves documents to My Stuff",
  },
  {
    id: "homework-assistant",
    title: "Homework & Tutor Assistant AI",
    category: "Information & Research",
    icon: BookOpen,
    badge: "Problem Solver",
    badgeColor: "from-amber-500 to-orange-600",
    targetRoute: "/homework",
    summary: "Step-by-step problem solver for math, physics, chemistry, biology, and history.",
    deepSubFeatures: [
      "Step-by-step formula breakdown and visual diagrams.",
      "Homework solution verifier — check your own work for mistakes.",
      "Curriculum topic digests across all academic grades.",
    ],
    autoSaveNote: "Dual option: Launch Tutor Hub or Stay in Chat",
  },
  {
    id: "translator",
    title: "Universal Language Translator",
    category: "Information & Research",
    icon: Languages,
    badge: "100+ Languages",
    badgeColor: "from-cyan-500 to-teal-500",
    targetRoute: "/translator",
    summary: "Real-time multilingual translation with dialect nuances, phonetics, and speech audio.",
    deepSubFeatures: [
      "100+ global languages with formal/informal tone toggles.",
      "Phonetic transliteration and spoken audio pronunciation.",
      "Full document file translation.",
    ],
    autoSaveNote: "Dual option banner active in Chat",
  },
  {
    id: "summarizer",
    title: "Executive Summarizer Studio",
    category: "Information & Research",
    icon: ListFilter,
    badge: "Text Compression",
    badgeColor: "from-violet-500 to-fuchsia-600",
    targetRoute: "/summarizer",
    summary: "Distills lengthy articles, PDFs, and pastes into bullet takeaways and audio digests.",
    deepSubFeatures: [
      "Key takeaways, action items, and sentiment analysis.",
      "Audio 60-second executive summary playback.",
    ],
    autoSaveNote: "Auto-saves summary logs",
  },
  {
    id: "ncert-tutor",
    title: "NCERT & CBSE Master Tutor",
    category: "Information & Research",
    icon: GraduationCap,
    badge: "Classes 6-12",
    badgeColor: "from-blue-600 to-indigo-700",
    targetRoute: "/ncert-tutor",
    summary: "Classes 6-12 rationalized eBooks, exercise solutions, board exam simulators, and formula vaults.",
    deepSubFeatures: [
      "Official textbook chapter eBooks and exercise solutions.",
      "Timed CBSE board exam simulator with marking schemes.",
    ],
    autoSaveNote: "Curriculum notes accessible anytime",
  },
  {
    id: "concept-xray",
    title: "Concept X-Ray Explainer",
    category: "Information & Research",
    icon: Activity,
    badge: "Visual Breakdown",
    badgeColor: "from-cyan-400 to-blue-600",
    targetRoute: "/concept-xray",
    summary: "3D interactive conceptual breakdown into surface ideas, mechanics, and atomic principles.",
    deepSubFeatures: [
      "Layered visual node mapping for complex concepts.",
    ],
    autoSaveNote: "Interactive node explorer",
  },
  {
    id: "code-interpreter",
    title: "Python Code Interpreter",
    category: "Information & Research",
    icon: Terminal,
    badge: "Live Python",
    badgeColor: "from-yellow-500 to-amber-600",
    targetRoute: "/code-interpreter",
    summary: "Sandboxed in-browser Python execution with dataframes, charts, and numerical calculations.",
    deepSubFeatures: [
      "Matplotlib/Seaborn graph rendering and CSV data analytics.",
    ],
    autoSaveNote: "Auto-saves Python scripts",
  },
  {
    id: "weather-hub",
    title: "Weather Station AI",
    category: "Information & Research",
    icon: CloudSun,
    badge: "Live Open-Meteo",
    badgeColor: "from-sky-400 to-blue-600",
    targetRoute: "/weather",
    summary: "Real-time meteorological station feeds (exact 24°C temperature, AQI, UV index, 7-day radar).",
    deepSubFeatures: [
      "Live weather station readings without stale API data.",
    ],
    autoSaveNote: "Dual option: Launch Radar or Stay in Chat",
  },
  {
    id: "news-wire",
    title: "NewsWire Intelligence Terminal",
    category: "Information & Research",
    icon: Newspaper,
    badge: "Live Reuters/AP",
    badgeColor: "from-amber-500 to-rose-600",
    targetRoute: "/news",
    summary: "Verified breaking headlines with multi-angle perspective analysis and audio news podcasts.",
    deepSubFeatures: [
      "Today's verified news feeds and financial marquees.",
    ],
    autoSaveNote: "Dual option: Launch Wire or Stay in Chat",
  },
  {
    id: "sports-arena",
    title: "Sports Stadium Arena",
    category: "Information & Research",
    icon: Trophy,
    badge: "Live Telemetry",
    badgeColor: "from-emerald-500 to-cyan-600",
    targetRoute: "/sports",
    summary: "Live match scoreboards across Premier League, IPL, NBA, F1, and Champions League.",
    deepSubFeatures: [
      "Match timelines, win probability indexes, and athlete spotlights.",
    ],
    autoSaveNote: "Dual option: Launch Arena or Stay in Chat",
  },
];

export const WhatsNewGuideModal: React.FC<WhatsNewGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<FeatureGuideItem | null>(null);

  if (!isOpen) return null;

  const categories = ["All", "Creative Studios", "Information & Research", "Workspace & Navigation"];

  const filteredItems = FEATURE_GUIDE_ITEMS.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  const handleLaunch = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl rounded-3xl border border-cyan-500/30 bg-card/95 p-4 sm:p-8 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col justify-between"
        >
          {/* Ambient Glow Background */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* TOP HEADER */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "5s" }} />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                  v2.5 Full Update Guide
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">
                What's New in Know Deep AI
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
                Explore every deeply built feature: Smart Intent Dispatcher, Save to Gallery, My Stuff, and 17 specialized AI studios.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-muted/80 hover:bg-rose-500/20 hover:text-rose-500 text-muted-foreground transition-all cursor-pointer border border-border/60"
              title="Skip & Start Chatting"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex items-center gap-2 py-3 overflow-x-auto shrink-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* MAIN SCROLLABLE FEATURE GRID */}
          <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1 my-2 max-h-[50vh] sm:max-h-[55vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = previewItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`glass rounded-2xl border p-4 space-y-3 transition-all ${
                      isExpanded
                        ? "border-cyan-500/80 bg-cyan-500/5 ring-1 ring-cyan-500/30"
                        : "border-border/60 hover:border-cyan-500/40 bg-card/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-border/80 flex items-center justify-center shrink-0 shadow-xs">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-white bg-gradient-to-r ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <h3 className="text-sm font-bold text-foreground mt-0.5">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(isExpanded ? null : item)}
                          className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all cursor-pointer border border-border/50"
                          title="Preview Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">{isExpanded ? "Close" : "Preview"}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>

                    {/* EXPANDED DEEP SUB-FEATURE BREAKDOWN */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-border/50 space-y-2 text-xs"
                        >
                          <p className="font-bold text-foreground flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Deep Sub-Features & Capabilities:
                          </p>
                          <ul className="space-y-1 pl-2 text-muted-foreground text-[11px]">
                            {item.deepSubFeatures.map((sub, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-1.5 text-[10px] font-mono text-cyan-400 font-semibold">
                            📁 {item.autoSaveNote}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ACTION FOOTER BUTTON */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {item.category}
                      </span>

                      <Button
                        size="sm"
                        onClick={() => handleLaunch(item.targetRoute)}
                        className={`h-8 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${item.badgeColor} hover:opacity-90 gap-1.5 cursor-pointer shadow-xs`}
                      >
                        <span>Launch Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM DISMISS BAR */}
          <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              <span>This guide appears once on update. You can re-open it anytime from the top Chat header.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground h-9 px-4 rounded-xl"
              >
                Skip Tour & Start Chatting
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent("knowdeep_start_interactive_tour"));
                }}
                className="w-full sm:w-auto h-11 px-7 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer animate-pulse active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Got It! Start Live Guided Tour</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
