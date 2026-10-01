import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FolderOpen,
  Code2,
  Video,
  Image as ImageIcon,
  Presentation,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Eye,
  Play,
  Plus,
  RefreshCw,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Film,
  FileDown,
  Layers,
  FileCode2,
  Monitor,
  Printer,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { exportToPowerPoint } from "@/utils/pptxExport";
import { PRESENTATION_THEMES, PresentationTheme } from "@/data/presentationThemes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavedApp {
  id: string;
  app_name: string;
  description: string;
  created_at: string;
  files?: Record<string, unknown>;
}

interface SavedVideo {
  id: string;
  title: string;
  prompt?: string;
  aspectRatio?: string;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  date?: string;
  backgroundMusicUrl?: string;
}

interface SavedImage {
  id: string;
  prompt: string;
  image_url: string;
  image_type: string;
  enhancement_mode: string | null;
  created_at: string;
}

interface DeckSlide {
  slideNumber?: number;
  layout?: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  speakerNotes?: string;
  visualDescription?: string;
}

interface SavedDeck {
  id: string;
  title: string;
  themeId: string;
  slideCount: number;
  slides: DeckSlide[];
  timestamp: number;
}

type TabType = "apps" | "videos" | "images" | "ppts";
type SortOption = "newest" | "oldest" | "name" | "slides";

export default function MyStuff() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active category tab: 'apps' | 'videos' | 'images' | 'ppts'
  const initialTab = (searchParams.get("tab") as TabType) || "apps";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Per-category search queries to preserve context if user switches tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterTag, setFilterTag] = useState<string>("all");

  // Data states
  const [apps, setApps] = useState<SavedApp[]>([]);
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [images, setImages] = useState<SavedImage[]>([]);
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Preview Modals
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
  const [selectedDeckForPreview, setSelectedDeckForPreview] = useState<SavedDeck | null>(null);
  const [deckPreviewSlideIdx, setDeckPreviewSlideIdx] = useState(0);

  // Delete Confirmation Dialog State
  const [itemToDelete, setItemToDelete] = useState<{
    type: TabType;
    id: string;
    title: string;
  } | null>(null);

  // Copy state for prompts
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Sync active tab to URL query
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSearchQuery("");
    setFilterTag("all");
    setSortBy("newest");
  };

  // Load all user assets from Supabase & localStorage
  const loadAllStuff = async () => {
    setIsLoading(true);
    try {
      // 1. Load PPTs from localStorage
      const storedDecks = localStorage.getItem("presentation_studio_saved_decks");
      if (storedDecks) {
        setDecks(JSON.parse(storedDecks));
      } else {
        setDecks([]);
      }

      // 2. Load Videos from localStorage (and general gallery)
      const storedVideos = localStorage.getItem("knowdeep_video_studio_creations");
      const parsedVideos = storedVideos ? JSON.parse(storedVideos) : [];
      
      const storedGallery = localStorage.getItem("knowdeep_gallery");
      const parsedGallery = storedGallery ? JSON.parse(storedGallery) : [];
      const galleryVideos = parsedGallery
        .filter((item: { type?: string }) => item.type === "video")
        .map((item: { id: string; title?: string; prompt?: string; url?: string; timestamp?: string; aspectRatio?: string }) => ({
          id: item.id,
          title: item.title || item.prompt || "Cinematic Video",
          prompt: item.prompt,
          videoUrl: item.url,
          date: item.timestamp,
          aspectRatio: item.aspectRatio || "16:9",
        }));

      // Combine and deduplicate by id
      const combinedVideosMap = new Map();
      [...parsedVideos, ...galleryVideos].forEach((v) => {
        if (v && v.id) combinedVideosMap.set(v.id, v);
      });
      setVideos(Array.from(combinedVideosMap.values()));

      // 3. Load Apps from Supabase / localStorage
      try {
        const { data: appData } = await supabase
          .from("generated_apps")
          .select("id, app_name, description, created_at, files")
          .order("created_at", { ascending: false });
        if (appData && appData.length > 0) {
          setApps(appData);
        } else {
          const localApps = localStorage.getItem("knowdeep_generated_apps");
          if (localApps) setApps(JSON.parse(localApps));
        }
      } catch {
        const localApps = localStorage.getItem("knowdeep_generated_apps");
        if (localApps) setApps(JSON.parse(localApps));
      }

      // 4. Load Images from Supabase / localStorage
      try {
        const { data: imgData } = await supabase
          .from("generated_images")
          .select("*")
          .order("created_at", { ascending: false });
        if (imgData && imgData.length > 0) {
          setImages(imgData);
        } else {
          const localImgs = localStorage.getItem("knowdeep_gallery_images");
          if (localImgs) setImages(JSON.parse(localImgs));
        }
      } catch {
        const localImgs = localStorage.getItem("knowdeep_gallery_images");
        if (localImgs) setImages(JSON.parse(localImgs));
      }
    } catch (e) {
      console.error("Failed to load My Stuff", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllStuff();
  }, []);

  // Delete operations
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;

    try {
      if (type === "ppts") {
        const updated = decks.filter((d) => d.id !== id);
        setDecks(updated);
        localStorage.setItem("presentation_studio_saved_decks", JSON.stringify(updated));
        toast.success("Presentation removed from vault");
      } else if (type === "videos") {
        const updated = videos.filter((v) => v.id !== id);
        setVideos(updated);
        localStorage.setItem("knowdeep_video_studio_creations", JSON.stringify(updated));
        toast.success("Video removed from vault");
      } else if (type === "images") {
        try {
          await supabase.from("generated_images").delete().eq("id", id);
        } catch {
          // ignore error if local
        }
        const updated = images.filter((img) => img.id !== id);
        setImages(updated);
        localStorage.setItem("knowdeep_gallery_images", JSON.stringify(updated));
        toast.success("Image removed from vault");
      } else if (type === "apps") {
        try {
          await supabase.from("generated_apps").delete().eq("id", id);
        } catch {
          // ignore error if local
        }
        const updated = apps.filter((a) => a.id !== id);
        setApps(updated);
        localStorage.setItem("knowdeep_generated_apps", JSON.stringify(updated));
        toast.success("Project removed from vault");
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  // Open presentation deck directly in Presentation Studio
  const handleOpenDeckInStudio = (deck: SavedDeck) => {
    navigate("/presentation-studio", { state: { loadDeck: deck } });
  };

  // PowerPoint download handler
  const handleDownloadPPTX = async (deck: SavedDeck) => {
    try {
      const theme =
        PRESENTATION_THEMES.find((t) => t.id === deck.themeId) ||
        PRESENTATION_THEMES[0];
      await exportToPowerPoint(deck.slides, theme, deck.title);
      toast.success("PowerPoint (.pptx) downloaded successfully!");
    } catch (e) {
      toast.error("Failed to export PowerPoint presentation.");
    }
  };

  // PDF print window
  const handleDownloadPDF = (deck: SavedDeck) => {
    const theme =
      PRESENTATION_THEMES.find((t) => t.id === deck.themeId) ||
      PRESENTATION_THEMES[0];
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const slidesHtml = deck.slides
      .map(
        (s: DeckSlide, i: number) => `
        <div style="page-break-after: always; min-height: 100vh; padding: 70px 80px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; background: ${theme.hexBg}; color: ${theme.hexText}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div>
            <p style="font-size: 11px; text-transform: uppercase; color: ${theme.hexAccent}; font-weight: 700; letter-spacing: 0.08em; margin: 0 0 12px 0;">Slide ${i + 1} of ${deck.slides.length}</p>
            <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.2;">${s.title || "Untitled Slide"}</h1>
            <h3 style="font-size: 18px; font-weight: 500; color: ${theme.hexAccent}; margin: 0 0 28px 0;">${s.subtitle || ""}</h3>
            <ul style="font-size: 17px; line-height: 1.8; padding-left: 24px;">
              ${(s.bullets || []).map((b: string) => `<li style="margin-bottom: 8px;">${b}</li>`).join("")}
            </ul>
          </div>
          <div style="font-size: 11px; color: ${theme.hexMuted}; border-top: 1px solid ${theme.hexMuted}40; padding-top: 14px; display: flex; justify-content: space-between;">
            <span>KnowDeep AI &bull; ${deck.title}</span>
            <span>Theme: ${theme.name}</span>
          </div>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${deck.title}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${slidesHtml}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("PDF document ready for printing");
  };

  // Copy prompt helper
  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Filtered & Sorted Data Sets
  const filteredApps = useMemo(() => {
    const result = apps.filter((a) => {
      const matchesSearch =
        !searchQuery.trim() ||
        a.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.app_name.localeCompare(b.app_name));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [apps, searchQuery, sortBy]);

  const filteredVideos = useMemo(() => {
    const result = videos.filter((v) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (v.title && v.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.prompt && v.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter =
        filterTag === "all" ||
        (filterTag === "16:9" && (v.aspectRatio === "16:9" || !v.aspectRatio)) ||
        (filterTag === "9:16" && v.aspectRatio === "9:16") ||
        (filterTag === "1:1" && v.aspectRatio === "1:1");
      return matchesSearch && matchesFilter;
    });

    if (sortBy === "name") {
      result.sort((a, b) => (a.title || a.prompt || "").localeCompare(b.title || b.prompt || ""));
    } else if (sortBy === "oldest") {
      result.reverse();
    }
    return result;
  }, [videos, searchQuery, filterTag, sortBy]);

  const filteredImages = useMemo(() => {
    const result = images.filter((img) => {
      const matchesSearch =
        !searchQuery.trim() ||
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterTag === "all" ||
        (filterTag === "enhanced" && img.enhancement_mode) ||
        (filterTag === "standard" && !img.enhancement_mode);
      return matchesSearch && matchesFilter;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.prompt.localeCompare(b.prompt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [images, searchQuery, filterTag, sortBy]);

  const filteredDecks = useMemo(() => {
    const result = decks.filter((d) => {
      const matchesSearch =
        !searchQuery.trim() ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.slides && d.slides.some((s) => s.title?.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesFilter =
        filterTag === "all" ||
        (filterTag === "tech" && d.themeId.includes("tech")) ||
        (filterTag === "executive" && (d.themeId.includes("executive") || d.themeId.includes("boardroom") || d.themeId.includes("gold"))) ||
        (filterTag === "creative" && (d.themeId.includes("studio") || d.themeId.includes("sunset") || d.themeId.includes("luxury")));
      return matchesSearch && matchesFilter;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "slides") {
      result.sort((a, b) => (b.slideCount || b.slides.length) - (a.slideCount || a.slides.length));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      result.sort((a, b) => b.timestamp - a.timestamp);
    }
    return result;
  }, [decks, searchQuery, filterTag, sortBy]);

  const counts = {
    apps: apps.length,
    videos: videos.length,
    images: images.length,
    ppts: decks.length,
    total: apps.length + videos.length + images.length + decks.length,
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "apps":
        return "Search projects by title, stack, or description...";
      case "videos":
        return "Search videos by prompt, title, or tags...";
      case "images":
        return "Search artwork by prompt or style...";
      case "ppts":
        return "Search presentation decks by topic or theme...";
    }
  };

  const getActiveCount = () => {
    switch (activeTab) {
      case "apps":
        return { total: apps.length, showing: filteredApps.length };
      case "videos":
        return { total: videos.length, showing: filteredVideos.length };
      case "images":
        return { total: images.length, showing: filteredImages.length };
      case "ppts":
        return { total: decks.length, showing: filteredDecks.length };
    }
  };

  const activeCountInfo = getActiveCount();

  return (
    <AppLayout title="My Stuff">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col space-y-6">
        
        {/* ==========================================================
            HERO HEADER & STATS OVERVIEW
        ========================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <FolderOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                KnowDeep Creative Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              My Stuff & Project Library
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Access, inspect, edit, and export your personal creations across slide presentations, cinematic AI videos, generated artwork, and web applications.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-md">
              <div
                onClick={() => handleTabChange("apps")}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-colors text-center ${
                  activeTab === "apps" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="text-lg font-bold font-mono tabular-nums">{counts.apps}</div>
                <div className="text-[11px] font-medium text-slate-400">Projects</div>
              </div>

              <div
                onClick={() => handleTabChange("videos")}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-colors text-center ${
                  activeTab === "videos" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="text-lg font-bold font-mono tabular-nums">{counts.videos}</div>
                <div className="text-[11px] font-medium text-slate-400">Videos</div>
              </div>

              <div
                onClick={() => handleTabChange("images")}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-colors text-center ${
                  activeTab === "images" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="text-lg font-bold font-mono tabular-nums">{counts.images}</div>
                <div className="text-[11px] font-medium text-slate-400">Artwork</div>
              </div>

              <div
                onClick={() => handleTabChange("ppts")}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-colors text-center ${
                  activeTab === "ppts" ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="text-lg font-bold font-mono tabular-nums">{counts.ppts}</div>
                <div className="text-[11px] font-medium text-slate-400">Decks</div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={loadAllStuff}
              disabled={isLoading}
              className="h-10 px-3.5 rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-medium text-xs gap-1.5 shadow-sm"
              title="Refresh library"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* ==========================================================
            4 PRIMARY CATEGORY TABS
        ========================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-muted/50 border border-border">
          <button
            onClick={() => handleTabChange("apps")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all text-left",
              activeTab === "apps"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <Code2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Projects & Apps</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0",
                activeTab === "apps" ? "bg-emerald-700 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {counts.apps}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("videos")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all text-left",
              activeTab === "videos"
                ? "bg-red-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span className="truncate">Videos</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0",
                activeTab === "videos" ? "bg-red-700 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {counts.videos}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("images")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all text-left",
              activeTab === "images"
                ? "bg-purple-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Images & Artwork</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0",
                activeTab === "images" ? "bg-purple-700 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {counts.images}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("ppts")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all text-left",
              activeTab === "ppts"
                ? "bg-fuchsia-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <Presentation className="w-4 h-4 shrink-0" />
            <span className="truncate">PPTs & Presentations</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0",
                activeTab === "ppts" ? "bg-fuchsia-700 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {counts.ppts}
            </span>
          </button>
        </div>

        {/* ==========================================================
            DEDICATED CONTEXTUAL SEARCH & TOOLBAR FOR ACTIVE CATEGORY
        ========================================================== */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Contextual Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-10 pr-10 h-10 rounded-xl bg-muted/40 border-border text-xs font-medium focus-visible:ring-primary focus-visible:bg-background transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Controls: Sort By, View Mode, Quick Create Action */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 px-2.5 rounded-xl bg-muted/60 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Title (A-Z)</option>
                  {activeTab === "ppts" && <option value="slides">Most Slides</option>}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-0.5 bg-muted/60 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-medium transition-colors",
                    viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-medium transition-colors",
                    viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Creator Action */}
              {activeTab === "apps" && (
                <Button
                  size="sm"
                  onClick={() => navigate("/app-creator")}
                  className="h-9 px-4 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </Button>
              )}
              {activeTab === "videos" && (
                <Button
                  size="sm"
                  onClick={() => navigate("/video-studio")}
                  className="h-9 px-4 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Video
                </Button>
              )}
              {activeTab === "images" && (
                <Button
                  size="sm"
                  onClick={() => navigate("/image-generator")}
                  className="h-9 px-4 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Image
                </Button>
              )}
              {activeTab === "ppts" && (
                <Button
                  size="sm"
                  onClick={() => navigate("/presentation-studio")}
                  className="h-9 px-4 text-xs rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Deck
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filter Bar & Results Feedback */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground font-medium mr-1 text-[11px]">Filter:</span>
              {activeTab === "ppts" && (
                <>
                  <button
                    onClick={() => setFilterTag("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "all" ? "bg-fuchsia-600/15 text-fuchsia-600 dark:text-fuchsia-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Themes
                  </button>
                  <button
                    onClick={() => setFilterTag("tech")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "tech" ? "bg-fuchsia-600/15 text-fuchsia-600 dark:text-fuchsia-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Tech & AI
                  </button>
                  <button
                    onClick={() => setFilterTag("executive")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "executive" ? "bg-fuchsia-600/15 text-fuchsia-600 dark:text-fuchsia-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Executive & Boardroom
                  </button>
                  <button
                    onClick={() => setFilterTag("creative")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "creative" ? "bg-fuchsia-600/15 text-fuchsia-600 dark:text-fuchsia-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Creative & Studio
                  </button>
                </>
              )}

              {activeTab === "videos" && (
                <>
                  <button
                    onClick={() => setFilterTag("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "all" ? "bg-red-600/15 text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Formats
                  </button>
                  <button
                    onClick={() => setFilterTag("16:9")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "16:9" ? "bg-red-600/15 text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    onClick={() => setFilterTag("9:16")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "9:16" ? "bg-red-600/15 text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    9:16 Portrait
                  </button>
                  <button
                    onClick={() => setFilterTag("1:1")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "1:1" ? "bg-red-600/15 text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    1:1 Square
                  </button>
                </>
              )}

              {activeTab === "images" && (
                <>
                  <button
                    onClick={() => setFilterTag("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "all" ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Artwork
                  </button>
                  <button
                    onClick={() => setFilterTag("standard")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "standard" ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Generated
                  </button>
                  <button
                    onClick={() => setFilterTag("enhanced")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "enhanced" ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Enhanced & Upscaled
                  </button>
                </>
              )}

              {activeTab === "apps" && (
                <>
                  <button
                    onClick={() => setFilterTag("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                      filterTag === "all" ? "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Web Apps
                  </button>
                </>
              )}
            </div>

            {/* Results Count Feedback */}
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>
                Showing <strong className="font-semibold text-foreground font-mono">{activeCountInfo.showing}</strong> of <span className="font-mono">{activeCountInfo.total}</span> items
              </span>
              {(searchQuery || filterTag !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTag("all");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================================
            CONTENT SECTION: 1. PROJECTS & APPS
        ========================================================== */}
        {activeTab === "apps" && (
          <div className="space-y-4">
            {filteredApps.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 bg-card/40">
                <Code2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {searchQuery ? "No matching projects found" : "No Code Projects Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No projects matched "${searchQuery}". Try a different keyword.`
                    : "Generate full-stack web apps, sandboxes, and databases with AI App Creator."}
                </p>
                <Button
                  onClick={() => (searchQuery ? setSearchQuery("") : navigate("/app-creator"))}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2 px-5 h-9"
                >
                  {searchQuery ? "Clear Search" : <><Plus className="w-3.5 h-3.5" /> Launch App Creator</>}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileCode2 className="w-3.5 h-3.5" /> Full-Stack App
                        </span>
                        <span className="font-mono text-[11px]">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {app.app_name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {app.description || "Interactive full-stack application built with React, TypeScript, and modern styling."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => navigate("/code-studio")}
                        className="flex-1 h-8 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Code Studio
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setItemToDelete({
                            type: "apps",
                            id: app.id,
                            title: app.app_name,
                          })
                        }
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {app.app_name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          · {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                        {app.description || "Full-stack web application."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => navigate("/code-studio")}
                        className="h-8 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Code Studio
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setItemToDelete({
                            type: "apps",
                            id: app.id,
                            title: app.app_name,
                          })
                        }
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            CONTENT SECTION: 2. VIDEOS
        ========================================================== */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            {filteredVideos.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 bg-card/40">
                <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {searchQuery ? "No matching videos found" : "No Videos in Vault Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No videos matched "${searchQuery}". Try a different term.`
                    : "Create cinematic AI videos with background tracks, transitions, and export options."}
                </p>
                <Button
                  onClick={() => (searchQuery ? setSearchQuery("") : navigate("/video-studio"))}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold gap-2 px-5 h-9"
                >
                  {searchQuery ? "Clear Search" : <><Plus className="w-3.5 h-3.5" /> Launch Video Studio</>}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-red-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 group"
                  >
                    {/* Video Visual Frame with Play Preview */}
                    <div
                      className="w-full h-40 rounded-xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-border cursor-pointer group/frame"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {video.thumbnailUrl || video.videoUrl ? (
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnailUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-900 text-muted-foreground">
                          <Film className="w-8 h-8 opacity-40 mb-1" />
                          <span className="text-[11px] font-medium opacity-60">AI Video Render</span>
                        </div>
                      )}

                      {/* Play overlay button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/frame:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="p-3 rounded-full bg-red-600 text-white shadow-lg transform group-hover/frame:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Video Badges */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono font-medium text-white backdrop-blur-sm">
                          {video.aspectRatio || "16:9"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono font-medium text-white backdrop-blur-sm">
                          {video.duration || 5}s
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {video.title || video.prompt || "Cinematic Video"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                        {video.date || "Rendered Clip"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2.5 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => setSelectedVideo(video)}
                        className="flex-1 h-8 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/video-studio")}
                        className="h-8 rounded-xl text-xs font-medium px-2.5"
                        title="Open in Video Studio"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      {video.videoUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = video.videoUrl!;
                            a.download = `video_${video.id}.mp4`;
                            a.click();
                            toast.success("Download started");
                          }}
                          className="h-8 rounded-xl text-xs font-medium px-2.5"
                          title="Download MP4"
                        >
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setItemToDelete({
                            type: "videos",
                            id: video.id,
                            title: video.title || video.prompt || "Video",
                          })
                        }
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 cursor-pointer flex items-center justify-center border border-border"
                        onClick={() => setSelectedVideo(video)}
                      >
                        {video.videoUrl ? (
                          <video src={video.videoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-muted-foreground/60" />
                        )}
                        <Play className="w-3.5 h-3.5 text-white absolute inset-auto fill-white drop-shadow" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {video.title || video.prompt || "Cinematic AI Video"}
                        </h4>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{video.aspectRatio || "16:9"}</span>
                          <span>·</span>
                          <span>{video.duration || 5}s</span>
                          {video.date && (
                            <>
                              <span>·</span>
                              <span>{video.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setSelectedVideo(video)}
                        className="h-8 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white gap-1 px-3"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setItemToDelete({
                            type: "videos",
                            id: video.id,
                            title: video.title || "Video",
                          })
                        }
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            CONTENT SECTION: 3. IMAGES & ARTWORK
        ========================================================== */}
        {activeTab === "images" && (
          <div className="space-y-4">
            {filteredImages.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 bg-card/40">
                <ImageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {searchQuery ? "No matching artwork found" : "No Artwork Saved Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No images matched "${searchQuery}". Try searching another keyword.`
                    : "Generate stunning high-resolution artwork or enhance existing photos with AI."}
                </p>
                <Button
                  onClick={() => (searchQuery ? setSearchQuery("") : navigate("/image-generator"))}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-2 px-5 h-9"
                >
                  {searchQuery ? "Clear Search" : <><Plus className="w-3.5 h-3.5" /> Launch Image Generator</>}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="p-3 rounded-2xl border border-border bg-card hover:border-purple-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div
                      className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900 relative cursor-pointer group/img"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.image_url}
                        alt={img.prompt}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow">
                          <Eye className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                        {img.prompt}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                        <span className="font-mono">
                          {new Date(img.created_at).toLocaleDateString()}
                        </span>
                        {img.enhancement_mode && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                            Enhanced
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = img.image_url;
                          a.download = `image_${img.id}.png`;
                          a.click();
                          toast.success("Image downloaded");
                        }}
                        className="h-7 text-[11px] rounded-lg font-medium gap-1 px-2.5"
                      >
                        <Download className="w-3 h-3 text-muted-foreground" />
                        Save
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyPrompt(img.prompt, img.id)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Copy prompt"
                        >
                          {copiedPromptId === img.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setItemToDelete({
                              type: "images",
                              id: img.id,
                              title: img.prompt,
                            })
                          }
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 cursor-pointer border border-border"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img.image_url}
                          alt={img.prompt}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground line-clamp-1 max-w-xl">
                          {img.prompt}
                        </p>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="font-mono">{new Date(img.created_at).toLocaleDateString()}</span>
                          {img.enhancement_mode && (
                            <>
                              <span>·</span>
                              <span className="text-purple-600 dark:text-purple-400">Enhanced</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage(img)}
                        className="h-8 rounded-xl text-xs font-medium px-3 gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        Inspect
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setItemToDelete({
                            type: "images",
                            id: img.id,
                            title: img.prompt,
                          })
                        }
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            CONTENT SECTION: 4. PPTS & PRESENTATION DECKS
        ========================================================== */}
        {activeTab === "ppts" && (
          <div className="space-y-4">
            {filteredDecks.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 bg-card/40">
                <Presentation className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {searchQuery ? "No matching slide decks found" : "No Saved Presentations Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No presentations matched "${searchQuery}". Try another keyword.`
                    : "Generate slide decks in Presentation Studio and save them here for instant export and editing."}
                </p>
                <Button
                  onClick={() => (searchQuery ? setSearchQuery("") : navigate("/presentation-studio"))}
                  className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold gap-2 px-5 h-9"
                >
                  {searchQuery ? "Clear Search" : <><Plus className="w-3.5 h-3.5" /> Launch Presentation Studio</>}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDecks.map((deck) => {
                  const theme =
                    PRESENTATION_THEMES.find((t) => t.id === deck.themeId) ||
                    PRESENTATION_THEMES[0];
                  return (
                    <div
                      key={deck.id}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-fuchsia-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                    >
                      {/* Top Slide Swatch Frame */}
                      <div
                        className={cn(
                          "w-full h-28 rounded-xl p-4 flex flex-col justify-between shadow-inner border border-white/10 relative overflow-hidden",
                          theme.bg
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm border border-white/15 text-white font-mono">
                            {deck.slideCount || deck.slides.length} Slides
                          </span>
                          <span className="text-[11px] font-medium opacity-80 text-white">
                            {theme.profession || "Deck"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate drop-shadow-md">
                          {deck.title}
                        </p>
                      </div>

                      {/* Info & Metadata */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                          {deck.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Theme: {theme.name}</span>
                          <span className="font-mono text-[11px]">
                            {new Date(deck.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          onClick={() => handleOpenDeckInStudio(deck)}
                          className="flex-1 h-8 rounded-xl text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Edit in Studio
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDeckForPreview(deck);
                            setDeckPreviewSlideIdx(0);
                          }}
                          className="h-8 rounded-xl text-xs font-medium px-2.5 gap-1"
                          title="Quick preview deck slides"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPPTX(deck)}
                          className="h-8 rounded-xl text-[11px] font-medium px-2.5 gap-1 text-amber-600 dark:text-amber-400"
                          title="Download PowerPoint (.pptx)"
                        >
                          <Download className="w-3 h-3" />
                          .PPTX
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setItemToDelete({
                              type: "ppts",
                              id: deck.id,
                              title: deck.title,
                            })
                          }
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete deck"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {filteredDecks.map((deck) => {
                  const theme =
                    PRESENTATION_THEMES.find((t) => t.id === deck.themeId) ||
                    PRESENTATION_THEMES[0];
                  return (
                    <div
                      key={deck.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {deck.title}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            · {deck.slideCount || deck.slides.length} slides · {theme.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono text-[11px]">
                          Created {new Date(deck.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleOpenDeckInStudio(deck)}
                          className="h-8 rounded-xl text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-1 px-3"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDeckForPreview(deck);
                            setDeckPreviewSlideIdx(0);
                          }}
                          className="h-8 rounded-xl text-xs font-medium px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPPTX(deck)}
                          className="h-8 rounded-xl text-xs font-medium px-2.5 text-amber-600 dark:text-amber-400"
                          title="Download PPTX"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setItemToDelete({
                              type: "ppts",
                              id: deck.id,
                              title: deck.title,
                            })
                          }
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==========================================================
          MODAL 1: SLIDE DECK INSPECTOR / SLIDESHOW MODAL
      ========================================================== */}
      {selectedDeckForPreview && (
        <Dialog
          open={!!selectedDeckForPreview}
          onOpenChange={(open) => {
            if (!open) setSelectedDeckForPreview(null);
          }}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-background border border-border">
            {(() => {
              const theme =
                PRESENTATION_THEMES.find((t) => t.id === selectedDeckForPreview.themeId) ||
                PRESENTATION_THEMES[0];
              const slides = selectedDeckForPreview.slides || [];
              const currentSlide = slides[deckPreviewSlideIdx] || slides[0];

              return (
                <div className="flex flex-col h-[80vh] max-h-[640px]">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {selectedDeckForPreview.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Theme: {theme.name} &bull; Slide {deckPreviewSlideIdx + 1} of {slides.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPPTX(selectedDeckForPreview)}
                        className="h-8 text-xs rounded-xl font-medium gap-1 text-amber-600 dark:text-amber-400"
                      >
                        <Download className="w-3.5 h-3.5" />
                        .PPTX
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(selectedDeckForPreview)}
                        className="h-8 text-xs rounded-xl font-medium gap-1 text-rose-600 dark:text-rose-400"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleOpenDeckInStudio(selectedDeckForPreview);
                          setSelectedDeckForPreview(null);
                        }}
                        className="h-8 text-xs rounded-xl font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Studio
                      </Button>
                    </div>
                  </div>

                  {/* Slide Canvas Preview */}
                  <div className="flex-1 p-6 bg-muted/20 flex items-center justify-center overflow-auto">
                    <div
                      className={cn(
                        "w-full max-w-2xl aspect-video rounded-2xl p-8 flex flex-col justify-between shadow-2xl border border-white/10 transition-all",
                        theme.bg,
                        theme.text
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs opacity-75 font-mono mb-2">
                          <span>SLIDE {deckPreviewSlideIdx + 1}</span>
                          <span>{theme.profession}</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight mb-1">
                          {currentSlide?.title || "Slide Title"}
                        </h2>
                        {currentSlide?.subtitle && (
                          <h4 className={cn("text-sm font-medium mb-4", theme.accent)}>
                            {currentSlide.subtitle}
                          </h4>
                        )}
                        <ul className="space-y-2 mt-4 text-xs sm:text-sm list-disc list-inside leading-relaxed opacity-90">
                          {(currentSlide?.bullets || []).map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-[11px] opacity-60 border-t border-current/20 pt-3">
                        <span>KnowDeep Presentation Studio</span>
                        <span>{selectedDeckForPreview.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Slide Navigator */}
                  <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deckPreviewSlideIdx === 0}
                      onClick={() => setDeckPreviewSlideIdx((prev) => Math.max(0, prev - 1))}
                      className="h-8 rounded-xl text-xs gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-md px-2">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setDeckPreviewSlideIdx(i)}
                          className={cn(
                            "w-7 h-7 rounded-lg text-xs font-mono font-medium transition-colors",
                            deckPreviewSlideIdx === i
                              ? "bg-fuchsia-600 text-white font-bold shadow"
                              : "hover:bg-muted text-muted-foreground"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deckPreviewSlideIdx === slides.length - 1}
                      onClick={() =>
                        setDeckPreviewSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))
                      }
                      className="h-8 rounded-xl text-xs gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* ==========================================================
          MODAL 2: VIDEO PLAYER MODAL
      ========================================================== */}
      {selectedVideo && (
        <Dialog
          open={!!selectedVideo}
          onOpenChange={(open) => {
            if (!open) setSelectedVideo(null);
          }}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {selectedVideo.title || selectedVideo.prompt || "Video Preview"}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedVideo.aspectRatio || "16:9"} &bull; {selectedVideo.duration || 5}s &bull;{" "}
                  {selectedVideo.date || "Rendered Clip"}
                </p>
              </div>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Video file not found or still processing.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedVideo.videoUrl) {
                    const a = document.createElement("a");
                    a.href = selectedVideo.videoUrl;
                    a.download = `video_${selectedVideo.id}.mp4`;
                    a.click();
                  }
                }}
                className="h-8 text-xs rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download MP4
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  navigate("/video-studio");
                  setSelectedVideo(null);
                }}
                className="h-8 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Edit in Video Studio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ==========================================================
          MODAL 3: IMAGE LIGHTBOX MODAL
      ========================================================== */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => {
            if (!open) setSelectedImage(null);
          }}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white">
            <div className="relative max-h-[70vh] bg-black flex items-center justify-center p-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                  Generation Prompt
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {selectedImage.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(selectedImage.created_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyPrompt(selectedImage.prompt, selectedImage.id)}
                    className="h-8 text-xs rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
                  >
                    {copiedPromptId === selectedImage.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy Prompt
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = selectedImage.image_url;
                      a.download = `artwork_${selectedImage.id}.png`;
                      a.click();
                      toast.success("Artwork downloaded");
                    }}
                    className="h-8 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ==========================================================
          MODAL 4: DELETE CONFIRMATION DIALOG
      ========================================================== */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Remove from My Stuff?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove &quot;{itemToDelete?.title}&quot; from your personal creative vault? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold h-9"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
