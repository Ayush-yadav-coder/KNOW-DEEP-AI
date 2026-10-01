import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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
  Plus,
  Wand2,
  RotateCcw,
  FileUp,
  Zap,
  MessageSquare,
  Search,
  Check,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Edit3,
  RefreshCw,
  FolderOpen,
  Eye,
  CheckCircle2,
  Send,
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  Paperclip,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PRESENTATION_THEMES,
  THEME_CATEGORIES,
  PresentationTheme,
  TOTAL_THEMES_COUNT,
} from "@/data/presentationThemes";
import { exportToPowerPoint } from "@/utils/pptxExport";
import { KnowDeepBadge } from "@/components/KnowDeepBadge";
import { KNOWDEEP_LOGO_URL } from "@/lib/branding";

interface Slide {
  slideNumber: number;
  layout: string;
  title: string;
  subtitle: string;
  bullets: string[];
  speakerNotes: string;
  visualDescription: string;
  imageUrl?: string;
}

interface SavedDeck {
  id: string;
  title: string;
  themeId: string;
  slideCount: number;
  slides: Slide[];
  timestamp: number;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  content: string;
}

const STARTER_PROMPTS = [
  "🚀 AI SaaS Startup Pitch Deck for Tier 1 VCs",
  "📈 Q3 Boardroom Executive Business Review & Revenue KPI",
  "🧬 Clinical Oncology & Precision Biotech Drug Discovery",
  "🎨 Luxury Brand Visual Identity & Creative Strategy",
  "🌱 Net-Zero ESG & Corporate Sustainability Report 2026",
  "🎓 PhD Defense: Autonomous Multi-Agent Neural Systems",
];

const LAYOUT_STRUCTURES = [
  { id: "balanced", label: "Executive Balanced", description: "Title hero, strategic pillars, data milestones, and roadmap", icon: LayoutGrid },
  { id: "pitch", label: "VC Pitch Deck", description: "Problem, Solution, TAM/SAM, Product Architecture, Traction, Financials", icon: Zap },
  { id: "technical", label: "Deep-Dive Technical", description: "System architecture, benchmarks, API flow, and security proofs", icon: FileCode },
  { id: "academic", label: "Academic / Thesis", description: "Abstract, methodology, experimental results, and conclusion", icon: FileText },
];

export default function PresentationStudio() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard step: "describe" (Step 1) | "style" (Step 2) | "files" (Step 3: Select File Assets) | "specs" (Step 4: Slide Count & Specs) | "compact" (Editing Deck)
  const [wizardStep, setWizardStep] = useState<"describe" | "style" | "files" | "specs" | "compact">("describe");

  // Core deck configuration
  const [topic, setTopic] = useState("");
  const [selectedLayoutId, setSelectedLayoutId] = useState("balanced");
  const [selectedThemeId, setSelectedThemeId] = useState<string>("tech-deep-space");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [sourceNotes, setSourceNotes] = useState("");
  const [slideCount, setSlideCount] = useState<number>(6);
  const [targetAudience, setTargetAudience] = useState("Venture Capital & C-Suite Executives");
  
  // Theme gallery filters
  const [themeCategory, setThemeCategory] = useState<string>("All");
  const [themeSearch, setThemeSearch] = useState<string>("");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Generation & AI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  // Inline Slide Editing State
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editBullets, setEditBullets] = useState<string[]>([]);
  const [editSpeakerNotes, setEditSpeakerNotes] = useState("");

  // Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // Saved decks modal
  const [isSavedDecksOpen, setIsSavedDecksOpen] = useState(false);
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);

  // Side-by-Side Panel Mode: "chat" (AI Co-Pilot) | "inspect" (Direct Slide Inspector)
  const [sidePanelTab, setSidePanelTab] = useState<"chat" | "inspect">("chat");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // KnowDeep Slide Architect Interactive Chat
  const [architectMessages, setArchitectMessages] = useState<{ sender: "user" | "architect"; text: string }[]>([
    {
      sender: "architect",
      text: "Hello! I am KnowDeep Slide Architect. You can chat with me to rename slide titles, update bullet content, or add new slides in real time while watching your deck update side-by-side! Try typing: 'Rename slide to Market Opportunity' or 'Make bullets punchier'.",
    },
  ]);
  const [architectInput, setArchitectInput] = useState("");
  const [isArchitectTyping, setIsArchitectTyping] = useState(false);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [architectMessages, isArchitectTyping]);

  // Zero demo slides by default (Clean, lag-free initial state!)
  const [slides, setSlides] = useState<Slide[]>([]);

  // Load saved decks and incoming deck from localStorage / state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("presentation_studio_saved_decks");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedDecks(parsed);
      }

      // Check if user navigated here with a specific deck to edit
      const targetDeck = (location.state as { loadDeck?: SavedDeck })?.loadDeck;
      if (targetDeck && targetDeck.slides && targetDeck.slides.length > 0) {
        setSlides(targetDeck.slides);
        setTopic(targetDeck.title || "");
        setSelectedThemeId(targetDeck.themeId || "tech-deep-space");
        setSlideCount(targetDeck.slideCount || targetDeck.slides.length);
        setCurrentSlideIndex(0);
        setWizardStep("compact");
        toast({
          title: "Loaded Deck from My Stuff",
          description: `Ready to present and edit "${targetDeck.title}".`,
        });
      }
    } catch (e) {
      console.error("Failed to load saved decks", e);
    }
  }, [location.state]);

  // Save deck helper
  const saveDeckToStorage = (newSlides: Slide[], deckTitle: string, themeId: string, showToast = true) => {
    try {
      const deck: SavedDeck = {
        id: Date.now().toString(),
        title: deckTitle || "Untitled Presentation",
        themeId,
        slideCount: newSlides.length,
        slides: newSlides,
        timestamp: Date.now(),
      };
      const updated = [deck, ...savedDecks.filter((d) => d.title !== deckTitle).slice(0, 24)];
      setSavedDecks(updated);
      localStorage.setItem("presentation_studio_saved_decks", JSON.stringify(updated));
      if (showToast) {
        toast({
          title: "Saved to My Stuff! 📁",
          description: "Your presentation has been saved to your creative vault in My Stuff.",
        });
      }
    } catch (e) {
      console.error("Failed to save deck", e);
    }
  };

  // Find active theme object
  const activeTheme: PresentationTheme = useMemo(() => {
    const found = PRESENTATION_THEMES.find((t) => t.id === selectedThemeId);
    return found || PRESENTATION_THEMES[0];
  }, [selectedThemeId]);

  const activeSlide: Slide | undefined = slides[currentSlideIndex] || slides[0];

  // Sync edit state whenever active slide changes
  useEffect(() => {
    if (activeSlide) {
      setEditTitle(activeSlide.title || "");
      setEditSubtitle(activeSlide.subtitle || "");
      setEditBullets(activeSlide.bullets || []);
      setEditSpeakerNotes(activeSlide.speakerNotes || "");
    }
  }, [activeSlide]);

  // Filter themes for the 106+ backgrounds gallery
  const filteredThemes = useMemo(() => {
    return PRESENTATION_THEMES.filter((t) => {
      const matchesCategory =
        themeCategory === "All" || t.category === themeCategory;
      const matchesSearch =
        !themeSearch.trim() ||
        t.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
        t.profession.toLowerCase().includes(themeSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(themeSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [themeCategory, themeSearch]);

  // Save inline slide edits
  const handleSaveSlideEdits = () => {
    if (!activeSlide) return;
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...activeSlide,
      title: editTitle,
      subtitle: editSubtitle,
      bullets: editBullets,
      speakerNotes: editSpeakerNotes,
    };
    setSlides(updated);
    setIsEditingSlide(false);
    toast({ title: "Slide Updated", description: "Changes saved to slide." });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isEditingSlide
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        if (currentSlideIndex < slides.length - 1) {
          e.preventDefault();
          setCurrentSlideIndex((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (currentSlideIndex > 0) {
          e.preventDefault();
          setCurrentSlideIndex((prev) => prev - 1);
        }
      } else if (e.key === "Escape") {
        setPresenterMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, slides.length, isEditingSlide]);

  // Handle multi-file assets upload
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const newAttached: AttachedFile = {
            name: file.name,
            size: file.size,
            type: file.type || "text/plain",
            content: text,
          };
          setAttachedFiles((prev) => [...prev, newAttached]);
          if (!topic.trim()) {
            const firstLine = text.split("\n")[0].replace(/^#+\s*/, "").slice(0, 80);
            setTopic(firstLine || file.name.replace(/\.[^/.]+$/, ""));
          }
          toast({
            title: "Asset Attached! 📄",
            description: `Loaded "${file.name}" (${Math.round(file.size / 1024)} KB) into presentation generator.`,
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Asset Removed" });
  };

  // Master Deck Generator
  const handleGenerateDeck = async () => {
    if (!topic.trim() && attachedFiles.length === 0 && !sourceNotes.trim()) {
      toast({
        title: "Prompt or File Assets Required",
        description: "Please describe what presentation you want to create or attach file assets.",
        variant: "destructive",
      });
      return;
    }

    const effectiveTopic = topic.trim() || "Executive Strategic Presentation";

    setIsGenerating(true);
    toast({
      title: "Designing Slide Deck...",
      description: `KnowDeep Slide Architect is generating ${slideCount} slides with ${activeTheme.name} style for ${targetAudience}.`,
    });

    try {
      // Assemble full reference payload from attached file assets & notes
      const filesContext = attachedFiles
        .map((f) => `--- File Asset: ${f.name} ---\n${f.content.slice(0, 2000)}`)
        .join("\n\n");

      const combinedNotes = [
        sourceNotes.trim() ? `User Reference Notes:\n${sourceNotes.slice(0, 2500)}` : "",
        filesContext ? `Attached Source Files:\n${filesContext}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const combinedTopic = combinedNotes
        ? `${effectiveTopic}\n\n${combinedNotes}`
        : effectiveTopic;

      const res = await fetch("/api/presentation-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: combinedTopic,
          slideCount,
          theme: activeTheme.name,
          targetAudience,
          layoutStructure: selectedLayoutId,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        const enhancedSlides = data.slides.map((s: Slide) => ({
          ...s,
          imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80`,
        }));
        setSlides(enhancedSlides);
        setCurrentSlideIndex(0);
        setWizardStep("compact");
        saveDeckToStorage(enhancedSlides, effectiveTopic, selectedThemeId, false);
        toast({
          title: "Presentation Engineered! ✨",
          description: `Created ${enhancedSlides.length} high-impact slides. Automatically saved to My Stuff.`,
        });
      } else {
        throw new Error("Invalid slide response");
      }
    } catch {
      toast({
        title: "Generation Failed",
        description: "Could not generate slide deck from server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // PowerPoint (.pptx) Export
  const handleExportPowerPoint = async () => {
    if (!slides || slides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Please generate a presentation deck first.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingPPTX(true);
    toast({
      title: "Generating PowerPoint Presentation (.pptx)...",
      description: "Preserving design consistency, typography, and speaker notes.",
    });

    try {
      await exportToPowerPoint(slides, activeTheme, topic || "Executive Presentation");
      toast({
        title: "PowerPoint Export Complete! 📊",
        description: `Downloaded "${topic || "presentation"}.pptx" with ${slides.length} slides.`,
      });
    } catch (err: unknown) {
      console.error("PPTX Export Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to download PowerPoint presentation.";
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingPPTX(false);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!slides || slides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Please generate a presentation deck first.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to open the print-to-PDF presentation dialog.",
        variant: "destructive",
      });
      return;
    }

    const slidesHtml = slides
      .map(
        (s, i) => `
      <div style="page-break-after: always; width: 100vw; height: 100vh; padding: 60px 80px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; background: ${activeTheme.hexBg}; color: ${activeTheme.hexText}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${activeTheme.hexAccent}40; padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${activeTheme.hexAccent};"></div>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${activeTheme.hexAccent}; font-weight: 800;">Slide ${i + 1} of ${slides.length} &bull; ${activeTheme.profession}</span>
          </div>
          <span style="font-size: 11px; color: ${activeTheme.hexMuted}; font-weight: 600;">KnowDeep AI Slide Architect</span>
        </div>

        <div style="margin: auto 0; max-width: 90%;">
          <h1 style="font-size: 44px; font-weight: 900; line-height: 1.15; margin: 0 0 18px 0; color: ${activeTheme.hexText};">${s.title}</h1>
          <h3 style="font-size: 22px; font-weight: 600; line-height: 1.4; margin: 0 0 32px 0; color: ${activeTheme.hexAccent};">${s.subtitle}</h3>

          <ul style="font-size: 20px; line-height: 1.8; margin: 0; padding-left: 24px; color: ${activeTheme.hexText};">
            ${(s.bullets || []).map((b) => `<li style="margin-bottom: 12px;">${b}</li>`).join("")}
          </ul>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid ${activeTheme.hexMuted}40; padding-top: 16px; font-size: 11px; color: ${activeTheme.hexMuted};">
          <span>${topic || "Executive Presentation"}</span>
          <span>Theme: ${activeTheme.name} &bull; ${activeTheme.fontPairing}</span>
        </div>
      </div>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${topic || "Presentation"} - KnowDeep Slide Architect</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; background: ${activeTheme.hexBg}; }
          </style>
        </head>
        <body>
          ${slidesHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast({
      title: "PDF Print View Ready",
      description: "Use browser print dialog to save as landscape PDF.",
    });
  };

  // Copy full deck as Markdown
  const handleCopyDeckMarkdown = () => {
    if (!slides || slides.length === 0) return;
    const md = slides
      .map(
        (s) =>
          `## Slide ${s.slideNumber}: ${s.title}\n*${s.subtitle}*\n\n${s.bullets
            .map((b) => `- ${b}`)
            .join("\n")}\n\n> Speaker Notes: ${s.speakerNotes}\n`
      )
      .join("\n---\n\n");

    navigator.clipboard.writeText(md);
    toast({
      title: "Copied to Clipboard",
      description: "All slides copied in clean Markdown outline format.",
    });
  };

  // Interactive KnowDeep Slide Architect chat handler (Real-time live deck reflection)
  const handleSendArchitectMessage = async () => {
    if (!architectInput.trim()) return;
    const userQuery = architectInput.trim();
    setArchitectMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setArchitectInput("");
    setIsArchitectTyping(true);

    try {
      const lower = userQuery.toLowerCase();

      // Quick local check for direct theme switch
      if (lower.includes("theme") || lower.includes("background")) {
        const found = PRESENTATION_THEMES.find((t) => lower.includes(t.name.toLowerCase()) || lower.includes(t.profession.toLowerCase()));
        if (found) {
          setSelectedThemeId(found.id);
          setArchitectMessages((prev) => [
            ...prev,
            { sender: "architect", text: `Visual background style switched to "${found.name}" (${found.profession})!` },
          ]);
          setIsArchitectTyping(false);
          return;
        }
      }

      // Call AI endpoint with live slide payload for full contextual understanding & edits
      const res = await fetch("/api/presentation-chat-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userQuery,
          currentSlide: activeSlide,
          currentSlideIndex,
          allSlides: slides,
          topic,
          theme: activeTheme.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // If the AI updated the current slide (title, subtitle, bullets, speaker notes)
        if (data.action === "update_slide" && data.updatedSlide) {
          const updated = [...slides];
          updated[currentSlideIndex] = {
            ...activeSlide,
            ...data.updatedSlide,
            slideNumber: currentSlideIndex + 1,
          };
          setSlides(updated);
          setEditTitle(data.updatedSlide.title || "");
          setEditSubtitle(data.updatedSlide.subtitle || "");
          setEditBullets(data.updatedSlide.bullets || []);
          setEditSpeakerNotes(data.updatedSlide.speakerNotes || "");
          toast({
            title: "Slide Updated Live ✨",
            description: `Reflected changes in Slide ${currentSlideIndex + 1}.`,
          });
        } else if (data.action === "add_slide" && data.newSlide) {
          const newSlideData: Slide = {
            slideNumber: slides.length + 1,
            layout: data.newSlide.layout || "bullet-focus",
            title: data.newSlide.title || "New Strategic Slide",
            subtitle: data.newSlide.subtitle || "",
            bullets: data.newSlide.bullets || ["Key insight 1", "Key insight 2"],
            speakerNotes: data.newSlide.speakerNotes || "",
            visualDescription: data.newSlide.visualDescription || "Minimalist infographic",
          };
          const updated = [...slides, newSlideData];
          setSlides(updated);
          setCurrentSlideIndex(updated.length - 1);
          toast({
            title: "New Slide Added 🚀",
            description: `Added "${newSlideData.title}" as Slide ${updated.length}.`,
          });
        }

        if (data.updatedDeckTitle) {
          setTopic(data.updatedDeckTitle);
        }

        setArchitectMessages((prev) => [
          ...prev,
          { sender: "architect", text: data.reply || "I have analyzed and updated your presentation." },
        ]);
      } else {
        // Fallback local pattern matching if API fails
        if (lower.includes("rename") || lower.includes("title")) {
          const titleMatch = userQuery.match(/(?:title to|rename (?:slide \d+ )?to)\s*["']?([^"'\n.]+)["']?/i);
          if (titleMatch && titleMatch[1]) {
            const newTitle = titleMatch[1].trim();
            const updated = [...slides];
            if (updated[currentSlideIndex]) {
              updated[currentSlideIndex].title = newTitle;
              setSlides(updated);
              setEditTitle(newTitle);
              setArchitectMessages((prev) => [
                ...prev,
                { sender: "architect", text: `I have renamed Slide ${currentSlideIndex + 1}'s title to: "${newTitle}".` },
              ]);
              setIsArchitectTyping(false);
              return;
            }
          }
        }
        setArchitectMessages((prev) => [
          ...prev,
          { sender: "architect", text: "I recommend keeping your slide headline outcome-oriented and limiting each bullet to one decisive takeaway." },
        ]);
      }
    } catch {
      setArchitectMessages((prev) => [
        ...prev,
        { sender: "architect", text: "I am ready to help refine your slide architecture, speaker notes, or rename slide titles." },
      ]);
    } finally {
      setIsArchitectTyping(false);
    }
  };

  // AI Assistant action (rewrite, expand, tone)
  const handleAssistantAction = async (action: "rewrite" | "expand" | "tone") => {
    if (!activeSlide) return;
    setIsAssistantLoading(true);
    toast({
      title: "KnowDeep Slide Architect working...",
      description: `Refining slide ${activeSlide.slideNumber} with AI.`,
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are KnowDeep Slide Architect.
Given this slide:
Title: "${activeSlide.title}"
Subtitle: "${activeSlide.subtitle}"
Bullets: ${JSON.stringify(activeSlide.bullets)}

Action requested: ${action} ("rewrite" for sharper executive punch, "expand" for deeper data/strategic points, "tone" for elevated academic/C-suite authority).
Respond in pure JSON format:
{
  "title": "string",
  "subtitle": "string",
  "bullets": ["string", "string", "string"],
  "speakerNotes": "string"
}`,
        }),
      });

      const data = await res.json();
      const content = data.reply || data.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updated = [...slides];
        updated[currentSlideIndex] = {
          ...activeSlide,
          title: parsed.title || activeSlide.title,
          subtitle: parsed.subtitle || activeSlide.subtitle,
          bullets: parsed.bullets || activeSlide.bullets,
          speakerNotes: parsed.speakerNotes || activeSlide.speakerNotes,
        };
        setSlides(updated);
        toast({
          title: "Slide Refined! ✨",
          description: "Applied KnowDeep Slide Architect enhancements.",
        });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch {
      toast({
        title: "Enhancement Failed",
        description: "Could not refine slide right now.",
        variant: "destructive",
      });
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Speech Narration
  const handleToggleNarration = () => {
    if (!activeSlide) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      const text = `${activeSlide.title}. ${activeSlide.subtitle}. ${activeSlide.bullets.join(". ")}. Speaker note: ${activeSlide.speakerNotes}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  // Re-generate slide visual background
  const handleRegenerateImage = () => {
    if (!activeSlide) return;
    setIsRegeneratingImage(true);
    const updated = [...slides];
    updated[currentSlideIndex] = { ...activeSlide, imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80" };
    setSlides(updated);
    setTimeout(() => {
      setIsRegeneratingImage(false);
      toast({ title: "Visual Regenerated", description: "Updated slide artwork." });
    }, 800);
  };

  // Add slide
  const handleAddSlide = () => {
    const newSlide: Slide = {
      slideNumber: slides.length + 1,
      layout: "bullet-focus",
      title: "New Strategic Slide",
      subtitle: "Executive takeaway or premise",
      bullets: ["Enter mission-critical insight here", "Key operational metric or data point"],
      speakerNotes: "Speaker notes for this new slide beat.",
      visualDescription: "Professional executive abstract visual background",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    toast({ title: "Slide Appended", description: "New slide added to deck." });
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex + 1 < slides.length) setCurrentSlideIndex(currentSlideIndex + 1);
  };

  return (
    <AppLayout title="Presentation Studio">
      <div className="max-w-7xl mx-auto px-4 py-5 w-full flex-1 flex flex-col space-y-6">
        
        {/* ========================================================
            TOP HEADER BAR
        ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2.5 tracking-tight">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 text-white shadow-lg shadow-fuchsia-500/20">
                <Presentation className="w-5 h-5" />
              </span>
              <span>KnowDeep Slide Architect</span>
              <span className="text-[10px] bg-fuchsia-500/10 text-fuchsia-500 px-2 py-0.5 rounded-full uppercase font-black tracking-widest border border-fuchsia-500/20">
                {TOTAL_THEMES_COUNT}+ Backgrounds
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              Describe on top &bull; Pick layout & style &bull; Attach files &bull; Define slide count &bull; Export to PPTX / PDF
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Save to My Stuff Button */}
            {slides.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  saveDeckToStorage(slides, topic, selectedThemeId, true);
                }}
                className="h-9 text-xs rounded-xl border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-bold gap-2 px-3.5 shadow-sm transition-all active:scale-95"
              >
                <FolderOpen className="w-4 h-4 text-purple-500" />
                Save to My Stuff
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSavedDecksOpen(true)}
              className="h-9 text-xs rounded-xl gap-2 font-bold px-3.5 hover:bg-muted transition-all"
            >
              <FolderOpen className="w-4 h-4 text-fuchsia-500" />
              Saved Decks ({savedDecks.length})
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="h-9 text-xs rounded-xl gap-2 font-bold px-3.5 hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4 text-emerald-500" />
              Import Notes
            </Button>

            {slides.length > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPresenterMode(true)}
                  className="h-9 text-xs rounded-xl gap-2 font-bold px-3.5 hover:bg-fuchsia-50 hover:text-fuchsia-600 border-fuchsia-200 transition-all shadow-sm"
                >
                  <Maximize2 className="w-4 h-4 text-fuchsia-500" />
                  Presenter Mode
                </Button>

                <Button
                  size="sm"
                  onClick={handleExportPowerPoint}
                  disabled={isExportingPPTX}
                  className="h-9 text-xs rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black gap-2 px-3.5 shadow-md transition-all active:scale-95"
                >
                  {isExportingPPTX ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download .PPTX
                </Button>

                <Button
                  size="sm"
                  onClick={handleExportPDF}
                  className="h-9 text-xs rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black gap-2 px-3.5 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ========================================================
            4-STEP CREATOR WIZARD (No Demo Slides Lagging Initial Load!)
        ======================================================== */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: DESCRIBE TOPIC */}
            {wizardStep === "describe" && (
              <motion.div
                key="step-describe"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-fuchsia-500/5 border border-fuchsia-500/30 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      1
                    </span>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-foreground">
                        Step 1: Describe What Presentation You Want to Create
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Type your prompt below. Next, you'll choose from 106+ large profession background styles.
                      </p>
                    </div>
                  </div>

                  {slides.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWizardStep("compact")}
                      className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Current Deck ({slides.length} slides)
                    </Button>
                  )}
                </div>

                {/* Main Describing Input Area */}
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Describe your presentation... e.g. 'A high-impact seed pitch deck for an autonomous AI customer support platform raising $3M, highlighting market pain, architecture, traction, and 3-year financial projections'..."
                      className="min-h-[130px] rounded-3xl bg-muted/30 border-2 border-border/70 p-5 text-sm sm:text-base font-medium focus-visible:ring-fuchsia-500 shadow-inner"
                    />
                    {topic.trim() && (
                      <button
                        onClick={() => setTopic("")}
                        className="absolute right-4 top-4 p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Starter Chips */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
                      <span>Quick Idea Starters:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STARTER_PROMPTS.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => setTopic(starter.replace(/^[^\s]+\s*/, ""))}
                          className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-fuchsia-500/10 text-muted-foreground hover:text-fuchsia-600 dark:hover:text-fuchsia-400 border border-border text-xs font-semibold transition-all shadow-2xs hover:border-fuchsia-500/40 text-left"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    {topic.trim().length > 0 ? `${topic.trim().split(" ").length} words entered` : "Enter a prompt to continue"}
                  </span>

                  <Button
                    onClick={() => {
                      if (!topic.trim()) {
                        toast({
                          title: "Prompt Required",
                          description: "Please enter a topic or describe your presentation first.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setWizardStep("style");
                    }}
                    className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider px-7 shadow-lg shadow-fuchsia-500/25 gap-2 active:scale-95"
                  >
                    Next: Choose Layout & Style (106 Styles)
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHOOSE LAYOUT & BACKGROUND STYLE (20%+ Larger Preview Elements!) */}
            {wizardStep === "style" && (
              <motion.div
                key="step-style"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-indigo-500/5 border border-fuchsia-500/30 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      2
                    </span>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-foreground">
                        Step 2: Choose Presentation Layout & Profession Style (Extra-Large Previews)
                      </h2>
                      <p className="text-xs text-muted-foreground truncate max-w-xl">
                        Clicking any layout automatically prompts for file assets next. Topic: <span className="font-bold text-foreground">"{topic.slice(0, 80)}..."</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWizardStep("describe")}
                      className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Prompt
                    </Button>
                  </div>
                </div>

                {/* Structure Flow Layouts */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-fuchsia-500" />
                    <span>Select Deck Structure Flow:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {LAYOUT_STRUCTURES.map((layout) => {
                      const Icon = layout.icon;
                      const isSelected = selectedLayoutId === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setSelectedLayoutId(layout.id)}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${
                            isSelected
                              ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-sm"
                              : "border-border/70 bg-card hover:border-fuchsia-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-fuchsia-500" />
                              <span className="text-xs font-black text-foreground">{layout.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{layout.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-fuchsia-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">
                        Showing {filteredThemes.length} of {TOTAL_THEMES_COUNT} Profession Backgrounds
                      </span>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        value={themeSearch}
                        onChange={(e) => setThemeSearch(e.target.value)}
                        placeholder="Search doctor, VC, finance, legal, dark..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/40 border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {THEME_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setThemeCategory(cat)}
                        className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shrink-0 transition-all ${
                          themeCategory === cat
                            ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* 20%+ BIGGER PREVIEW CARDS (Significantly larger preview boxes and typography!) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[580px] overflow-y-auto pr-1 p-1 scrollbar-thin scrollbar-thumb-fuchsia-500/20">
                    {filteredThemes.map((theme) => {
                      const isSelected = selectedThemeId === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => {
                            setSelectedThemeId(theme.id);
                            // Automatically advances directly to Step 3: Select File Assets as requested!
                            setWizardStep("files");
                          }}
                          className={`p-5 rounded-3xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between relative group hover:scale-[1.01] ${
                            isSelected
                              ? "border-fuchsia-500 ring-4 ring-fuchsia-500/20 bg-fuchsia-500/5 shadow-2xl scale-[1.02]"
                              : "border-border/80 bg-card hover:border-fuchsia-400 hover:shadow-xl"
                          }`}
                        >
                          {/* 20%+ Larger Slide Preview Box */}
                          <div
                            className={`w-full h-56 sm:h-60 rounded-2xl mb-4 p-5 flex flex-col justify-between shadow-md border border-white/15 relative overflow-hidden ${theme.bg}`}
                          >
                            {/* Top preview row */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-current/25 bg-current/10 truncate max-w-[180px]">
                                {theme.profession}
                              </span>
                              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                                <div
                                  className="w-4 h-4 rounded-full shadow-md shrink-0 ring-1 ring-white/30"
                                  style={{ backgroundColor: theme.hexAccent }}
                                  title={`Accent: ${theme.hexAccent}`}
                                />
                                <div
                                  className="w-4 h-4 rounded-full shadow-md shrink-0 ring-1 ring-white/30"
                                  style={{ backgroundColor: theme.hexBg }}
                                  title={`Background: ${theme.hexBg}`}
                                />
                              </div>
                            </div>

                            {/* Center mock slide content with 20% larger typography */}
                            <div className="space-y-2 my-auto">
                              <div
                                className="w-24 h-1.5 rounded-full mb-1.5"
                                style={{ backgroundColor: theme.hexAccent }}
                              />
                              <p className="text-base sm:text-lg font-black truncate drop-shadow-sm leading-tight">
                                {theme.name}
                              </p>
                              <p className="text-xs opacity-80 truncate font-semibold">
                                Executive Strategic Presentation Deck
                              </p>
                              <div className="space-y-1.5 pt-1.5 opacity-70">
                                <div className="h-1.5 rounded-full w-4/5 bg-current/40" />
                                <div className="h-1.5 rounded-full w-3/5 bg-current/30" />
                              </div>
                            </div>

                            {/* Bottom preview footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-current/15 text-[10px] opacity-75 font-mono">
                              <span>Font: {theme.fontPairing}</span>
                              <span className="font-bold">{theme.category}</span>
                            </div>
                          </div>

                          {/* Info & Select Button */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-base sm:text-lg font-black truncate text-foreground">
                                {theme.name}
                              </h4>
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-xs font-black text-fuchsia-600 bg-fuchsia-500/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-4 h-4 text-fuchsia-500 shrink-0" /> Selected
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground group-hover:text-fuchsia-500 flex items-center gap-1">
                                  Select & Next <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 font-semibold">
                              {theme.profession}
                            </p>
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                              <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold font-mono">
                                {theme.category}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Auto-opens File Assets next →
                              </span>
                            </div>
                          </div>

                          {theme.tag && (
                            <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-fuchsia-500 text-white shadow-sm">
                              {theme.tag}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 Bottom Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Selected Style:
                    </span>
                    <span className="text-xs font-black text-fuchsia-500">
                      {activeTheme.name} &bull; {activeTheme.profession}
                    </span>
                  </div>

                  <Button
                    onClick={() => setWizardStep("files")}
                    className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider px-7 shadow-lg shadow-fuchsia-500/25 gap-2 active:scale-95"
                  >
                    Next: Select File Assets (Step 3)
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SELECT FILE ASSETS & SOURCE DOCUMENTS (Automatically prompted after layout selection!) */}
            {wizardStep === "files" && (
              <motion.div
                key="step-files"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-emerald-500/5 border border-fuchsia-500/30 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      3
                    </span>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-foreground">
                        Step 3: Select File Assets & Source Documents (Optional)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Attach research documents, datasets, lecture notes, or transcripts to ground your presentation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWizardStep("style")}
                      className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Layouts
                    </Button>
                  </div>
                </div>

                {/* File Upload Zone */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-fuchsia-500/40 hover:border-fuchsia-500 rounded-3xl p-8 text-center bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 min-h-[220px]"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFilesUpload}
                        multiple
                        accept=".txt,.md,.json,.csv,.doc,.docx,.pdf"
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 text-fuchsia-600 flex items-center justify-center shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          Click or Drag File Assets Here
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports .pdf, .docx, .txt, .md, .json, and .csv files
                        </p>
                      </div>
                      <span className="text-[10px] bg-fuchsia-500/15 text-fuchsia-600 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Browse Files
                      </span>
                    </div>

                    {/* Attached Files List */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-fuchsia-500" />
                          <span>Attached File Assets ({attachedFiles.length}):</span>
                        </label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {attachedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-fuchsia-500 shrink-0" />
                                <span className="font-bold text-foreground truncate">{file.name}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Raw Notes Paste Area */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-2">
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Or Paste Raw Reference Notes & Outline:</span>
                      </label>
                      <Textarea
                        value={sourceNotes}
                        onChange={(e) => setSourceNotes(e.target.value)}
                        placeholder="Paste article text, research findings, financial metrics, speech drafts, or bullet outlines here. KnowDeep AI will synthesize these notes into structured presentation slides."
                        className="min-h-[170px] rounded-3xl bg-muted/30 border-2 border-border/70 p-4 text-xs leading-relaxed focus-visible:ring-emerald-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-card/70 border border-border/70 text-xs text-muted-foreground flex items-center justify-between">
                      <span>Layout: <strong className="text-foreground">{activeTheme.name}</strong></span>
                      <span>Total Assets: <strong className="text-foreground">{attachedFiles.length} files attached</strong></span>
                    </div>
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep("style")}
                    className="h-11 rounded-2xl text-xs font-bold px-6"
                  >
                    ← Back to Layouts
                  </Button>

                  <Button
                    onClick={() => setWizardStep("specs")}
                    className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider px-8 shadow-lg shadow-fuchsia-500/25 gap-2 active:scale-95"
                  >
                    Next: Define Slide Count & Specs (Step 4)
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DEFINE SLIDE COUNT & GENERATION SPECS (Follows file selection!) */}
            {wizardStep === "specs" && (
              <motion.div
                key="step-specs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-amber-500/5 border border-fuchsia-500/30 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      4
                    </span>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-foreground">
                        Step 4: Define Slide Count & Final Presentation Specs
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Theme: <span className="font-bold text-foreground">{activeTheme.name}</span> &bull; Assets: <span className="font-bold text-foreground">{attachedFiles.length > 0 ? `${attachedFiles.length} files attached` : "Prompt based"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWizardStep("files")}
                      className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      ← Back to File Assets
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-muted/20 border border-border/60">
                  {/* Slide Count Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-black tracking-wider text-foreground">
                        Total Slides / Pages:
                      </label>
                      <span className="text-sm font-black text-fuchsia-500 bg-fuchsia-500/10 px-3.5 py-1 rounded-xl border border-fuchsia-500/20">
                        {slideCount} Slides
                      </span>
                    </div>

                    {/* Quick Count Pills */}
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 6, 8, 10, 12, 16, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSlideCount(num)}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                            slideCount === num
                              ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30 scale-105"
                              : "bg-card hover:bg-muted text-foreground border border-border"
                          }`}
                        >
                          {num} {num === 1 ? "Slide" : "Slides"}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Custom Slider */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Custom Slide Count:</span>
                        <span className="text-foreground">{slideCount} Slides</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={slideCount}
                        onChange={(e) => setSlideCount(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium pt-1">
                      {slideCount <= 4
                        ? "⚡ Perfect for quick elevator pitches & intro decks"
                        : slideCount <= 8
                        ? "💼 Ideal for executive board meetings & client overviews"
                        : slideCount <= 12
                        ? "🚀 Standard comprehensive venture capital pitch deck"
                        : "📚 Deep-dive technical masterclass & comprehensive roadmap"}
                    </p>
                  </div>

                  {/* Target Audience & Persona */}
                  <div className="space-y-4">
                    <label className="text-xs uppercase font-black tracking-wider text-foreground">
                      Target Audience & Presentation Tone:
                    </label>

                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full h-11 rounded-xl bg-card border border-border px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-fuchsia-500 shadow-sm"
                    >
                      <option value="Venture Capital & C-Suite Executives">Venture Capital & C-Suite Executives</option>
                      <option value="Board of Directors & Institutional Investors">Board of Directors & Institutional Investors</option>
                      <option value="Enterprise Clients & B2B Decision Makers">Enterprise Clients & B2B Decision Makers</option>
                      <option value="Engineering, R&D & Technical Architects">Engineering, R&D & Technical Architects</option>
                      <option value="Academic Symposium & Peer Reviewers">Academic Symposium & Peer Reviewers</option>
                      <option value="Creative Agency & Brand Leadership">Creative Agency & Brand Leadership</option>
                      <option value="General Public & Conference Keynote">General Public & Conference Keynote</option>
                    </select>

                    <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 text-xs text-muted-foreground space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>Visual Theme:</span>
                        <span className="text-foreground">{activeTheme.name}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>Profession Focus:</span>
                        <span className="text-foreground">{activeTheme.profession}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>Font Pairing:</span>
                        <span className="text-foreground font-mono text-[10px]">{activeTheme.fontPairing}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>Attached Assets:</span>
                        <span className="text-emerald-500 font-bold">{attachedFiles.length} file(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Generation CTA Button */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep("files")}
                    className="h-11 rounded-2xl text-xs font-bold px-6"
                  >
                    ← Back to File Assets
                  </Button>

                  <Button
                    onClick={handleGenerateDeck}
                    disabled={isGenerating || (!topic.trim() && attachedFiles.length === 0 && !sourceNotes.trim())}
                    className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider px-9 shadow-xl shadow-fuchsia-500/25 gap-2.5 active:scale-95"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Presentation...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Create Complete Presentation Deck ✨
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* COMPACT TOP BAR (Active when slides exist) */}
            {wizardStep === "compact" && slides.length > 0 && (
              <motion.div
                key="step-compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${activeTheme.bg}`}
                  >
                    <Palette className="w-5 h-5 text-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground truncate">
                        {topic || "Executive Presentation Deck"}
                      </span>
                      <span className="text-[9px] bg-fuchsia-500/10 text-fuchsia-600 font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 border border-fuchsia-500/20">
                        {slides.length} Slides
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Style: <span className="font-bold text-foreground">{activeTheme.name}</span> &bull; {activeTheme.profession}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveDeckToStorage(slides, topic, selectedThemeId, true)}
                    className="h-9 text-xs rounded-xl font-bold gap-1.5 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                    Save to My Stuff
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyDeckMarkdown}
                    className="h-9 text-xs rounded-xl font-bold gap-1.5 border-border"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Text
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsThemeModalOpen(true)}
                    className="h-9 text-xs rounded-xl font-bold gap-1.5 border-border"
                  >
                    <Palette className="w-3.5 h-3.5 text-fuchsia-500" />
                    Change Background ({TOTAL_THEMES_COUNT})
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setWizardStep("describe")}
                    className="h-9 text-xs rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black gap-1.5 shadow-md active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    New Presentation
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================
            SLIDE WORKSPACE & REAL-TIME SIDE-BY-SIDE EDITING PANEL
            * 20%+ LARGER SLIDE PREVIEW CANVAS AND TITLE ELEMENTS *
            * REAL-TIME SIDE-BY-SIDE AI CO-PILOT CHAT & DIRECT INSPECTOR *
        ======================================================== */}
        {slides.length > 0 && activeSlide ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Slide Navigator & Extra-Large Visual Stage (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Horizontal Slide Thumbnail Carousel Strip */}
              <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-sm flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground pl-1">
                    <Layers className="w-3.5 h-3.5 text-fuchsia-500" />
                    <span className="hidden sm:inline">Deck:</span>
                  </div>
                  <span className="text-xs font-extrabold bg-fuchsia-500/10 text-fuchsia-600 px-2 py-0.5 rounded-lg border border-fuchsia-500/20">
                    {slides.length} Slides
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                  {slides.map((s, idx) => {
                    const isActive = currentSlideIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                          isActive
                            ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 ring-2 ring-fuchsia-500/20 shadow-sm"
                            : "border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md text-[10px] font-black flex items-center justify-center ${isActive ? "bg-fuchsia-500 text-white" : "bg-black/10 dark:bg-white/10 text-foreground"}`}>
                          {idx + 1}
                        </span>
                        <span className="max-w-[120px] truncate">{s.title || `Slide ${idx + 1}`}</span>
                      </button>
                    );
                  })}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddSlide}
                    className="h-8 text-xs font-black rounded-xl px-2.5 text-fuchsia-600 hover:bg-fuchsia-500/10 shrink-0 gap-1 border border-dashed border-fuchsia-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slide
                  </Button>
                </div>
              </div>

              {/* 16:9 Widescreen Presentation Canvas - 20%+ INCREASED PREVIEW & TITLE SIZE */}
              <div
                className={`relative w-full aspect-video rounded-[2.5rem] p-8 sm:p-12 lg:p-14 shadow-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 ${activeTheme.bg} ${activeTheme.border}`}
              >
                {/* Visual Backdrop Overlay Image if present */}
                {activeSlide.imageUrl && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center mix-blend-overlay"
                    style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
                  />
                )}

                {/* Top slide header metadata */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: activeTheme.hexAccent }}
                    />
                    <span
                      className="text-xs sm:text-sm font-mono uppercase tracking-widest font-black"
                      style={{ color: activeTheme.hexAccent }}
                    >
                      {activeTheme.profession} &bull; SLIDE {currentSlideIndex + 1} OF {slides.length}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold opacity-75 tracking-wider font-mono"
                    style={{ color: activeTheme.hexMuted }}
                  >
                    {activeTheme.name}
                  </span>
                </div>

                {/* Slide Core Content (20%+ Larger Title, Subtitle, and Bullet Points!) */}
                <div className="relative z-10 my-auto max-w-4xl space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    {/* 20%+ Larger Title */}
                    <h2
                      className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
                      style={{ color: activeTheme.hexText }}
                    >
                      {activeSlide.title}
                    </h2>
                    {/* 20%+ Larger Subtitle */}
                    {activeSlide.subtitle && (
                      <p
                        className="text-base sm:text-lg lg:text-xl font-bold"
                        style={{ color: activeTheme.hexAccent }}
                      >
                        {activeSlide.subtitle}
                      </p>
                    )}
                  </div>

                  {/* 20%+ Larger Bullet Insights */}
                  <ul className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                    {activeSlide.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-3 sm:gap-4 text-base sm:text-lg lg:text-xl leading-relaxed"
                        style={{ color: activeTheme.hexText }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-2.5 shrink-0 shadow-sm"
                          style={{ backgroundColor: activeTheme.hexAccent }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom slide footer */}
                <div
                  className="relative z-10 flex items-center justify-between pt-3 border-t text-xs opacity-80"
                  style={{ borderColor: `${activeTheme.hexMuted}35`, color: activeTheme.hexMuted }}
                >
                  <span className="font-semibold">{topic || "Presentation Deck"}</span>
                  <span className="font-mono font-bold">KnowDeep Slide Architect</span>
                </div>
              </div>

              {/* Slide Navigation & Canvas Control Bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="h-8 rounded-xl text-xs font-bold gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="text-xs font-extrabold px-3 text-muted-foreground">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="h-8 rounded-xl text-xs font-bold gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerateImage}
                    disabled={isRegeneratingImage}
                    className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRegeneratingImage ? "animate-spin" : ""}`} />
                    Regenerate Art
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleNarration}
                    className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                    {isNarrating ? "Stop Audio" : "Rehearse Speech"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPresenterMode(true)}
                    className="h-8 text-xs font-bold gap-1.5 rounded-xl border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-fuchsia-500" />
                    Fullscreen
                  </Button>
                </div>
              </div>

              {/* Speaker Rehearsal Notes Card */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-fuchsia-500" />
                    <span>Presenter Speaking Notes (Slide {currentSlideIndex + 1})</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">Exported in .pptx</span>
                </div>
                <Textarea
                  value={activeSlide.speakerNotes || ""}
                  onChange={(e) => {
                    const updated = [...slides];
                    updated[currentSlideIndex].speakerNotes = e.target.value;
                    setSlides(updated);
                  }}
                  placeholder="Enter presentation cues, talking beats, or key metrics for this slide..."
                  className="min-h-[70px] rounded-xl bg-muted/30 border-border text-xs leading-relaxed focus-visible:ring-fuchsia-500"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Side-by-Side AI Chat & Direct Editing Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-card via-card to-fuchsia-500/5 border-2 border-fuchsia-500/30 shadow-2xl p-5 flex flex-col justify-between space-y-4 min-h-[620px]">
                
                {/* Panel Brand & Status Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <KnowDeepBadge
                    assistantName="KnowDeep Slide Architect"
                    studioBadge="Live Co-Pilot"
                    size="sm"
                    showAura={true}
                  />
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span>Live Sync Active</span>
                  </div>
                </div>

                {/* Side-by-Side Mode Tab Selector */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setSidePanelTab("chat")}
                    className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      sidePanelTab === "chat"
                        ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    AI Chat Co-Pilot
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidePanelTab("inspect")}
                    className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      sidePanelTab === "inspect"
                        ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Direct Inspector
                  </button>
                </div>

                {/* TAB 1: REAL-TIME AI CHAT CO-PILOT */}
                {sidePanelTab === "chat" && (
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-h-[360px]">
                    
                    {/* Quick Conversational Prompt Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-fuchsia-500" />
                        Quick AI Action Commands:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Rename slide title to Executive Growth Pillars",
                          "Make bullet points punchier with data metrics",
                          "Add a conclusion & next steps slide",
                          "Refine subtitle for VC pitch",
                        ].map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setArchitectInput(prompt);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-card border border-border/80 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 text-[10px] font-bold text-muted-foreground hover:text-fuchsia-600 transition-all text-left"
                          >
                            &ldquo;{prompt}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Messages Stream */}
                    <div
                      ref={chatScrollRef}
                      className="flex-1 max-h-[280px] overflow-y-auto space-y-2.5 pr-1 p-2 rounded-2xl bg-muted/20 border border-border/60 scrollbar-thin scrollbar-thumb-fuchsia-500/20"
                    >
                      {architectMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-2xl text-xs leading-relaxed transition-all ${
                            msg.sender === "user"
                              ? "bg-fuchsia-600 text-white ml-auto max-w-[88%] shadow-sm"
                              : "bg-card border border-border/80 text-card-foreground mr-auto max-w-[92%] shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${msg.sender === "user" ? "text-fuchsia-100" : "text-fuchsia-600 dark:text-fuchsia-400"}`}>
                              {msg.sender === "user" ? "You" : "KnowDeep Slide Architect"}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                        </div>
                      ))}

                      {isArchitectTyping && (
                        <div className="p-3 rounded-2xl bg-card border border-border text-xs flex items-center gap-2 text-muted-foreground mr-auto max-w-[85%] animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-fuchsia-500" />
                          <span>KnowDeep Slide Architect is updating slide deck...</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Input Box */}
                    <div className="relative flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={architectInput}
                        onChange={(e) => setArchitectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isArchitectTyping) {
                            handleSendArchitectMessage();
                          }
                        }}
                        placeholder="Chat with AI: 'Rename slide to...', 'Add metric bullets'..."
                        className="flex-1 h-10 rounded-xl bg-muted/40 border-2 border-border/80 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 font-medium"
                      />
                      <Button
                        size="sm"
                        onClick={handleSendArchitectMessage}
                        disabled={isArchitectTyping || !architectInput.trim()}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold text-xs shrink-0 shadow-md shadow-fuchsia-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 2: DIRECT SLIDE INSPECTOR (Instant live 2-way reflection) */}
                {sidePanelTab === "inspect" && (
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Slide Title (Instant Live Sync):
                      </label>
                      <input
                        type="text"
                        value={activeSlide.title}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[currentSlideIndex] = {
                            ...activeSlide,
                            title: e.target.value,
                          };
                          setSlides(updated);
                          setEditTitle(e.target.value);
                        }}
                        placeholder="Slide Title..."
                        className="w-full h-9 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Slide Subtitle:
                      </label>
                      <input
                        type="text"
                        value={activeSlide.subtitle || ""}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[currentSlideIndex] = {
                            ...activeSlide,
                            subtitle: e.target.value,
                          };
                          setSlides(updated);
                          setEditSubtitle(e.target.value);
                        }}
                        placeholder="Slide Subtitle..."
                        className="w-full h-8 rounded-xl bg-muted/40 border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Bullet Insights ({activeSlide.bullets.length}):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentSlideIndex].bullets = [
                              ...activeSlide.bullets,
                              "New key insight point",
                            ];
                            setSlides(updated);
                          }}
                          className="text-[10px] font-bold text-fuchsia-500 hover:text-fuchsia-600 flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {activeSlide.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...slides];
                                const newBullets = [...activeSlide.bullets];
                                newBullets[bIdx] = e.target.value;
                                updated[currentSlideIndex].bullets = newBullets;
                                setSlides(updated);
                              }}
                              className="flex-1 h-8 rounded-xl bg-muted/40 border border-border px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                            />
                            {activeSlide.bullets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...slides];
                                  updated[currentSlideIndex].bullets = activeSlide.bullets.filter((_, i) => i !== bIdx);
                                  setSlides(updated);
                                }}
                                className="w-7 h-7 rounded-lg text-muted-foreground hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1-Click AI Quick Toolkit Footer */}
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <span>1-Click AI Slide Enhancers:</span>
                    <span className="text-fuchsia-500 font-mono">Slide {currentSlideIndex + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleAssistantAction("rewrite")}
                      disabled={isAssistantLoading}
                      variant="outline"
                      className="h-8 justify-start px-2.5 rounded-xl border-fuchsia-200 dark:border-fuchsia-800/60 text-fuchsia-600 dark:text-fuchsia-400 font-bold text-[11px] gap-1.5 hover:bg-fuchsia-500/10"
                    >
                      <RotateCcw className="w-3 h-3 text-fuchsia-500" />
                      Magic Rewrite
                    </Button>
                    <Button
                      onClick={() => handleAssistantAction("expand")}
                      disabled={isAssistantLoading}
                      variant="outline"
                      className="h-8 justify-start px-2.5 rounded-xl border-pink-200 dark:border-pink-800/60 text-pink-600 dark:text-pink-400 font-bold text-[11px] gap-1.5 hover:bg-pink-500/10"
                    >
                      <Plus className="w-3 h-3 text-pink-500" />
                      Expand Insights
                    </Button>
                    <Button
                      onClick={() => handleAssistantAction("tone")}
                      disabled={isAssistantLoading}
                      variant="outline"
                      className="h-8 justify-start px-2.5 rounded-xl border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 font-bold text-[11px] gap-1.5 hover:bg-purple-500/10"
                    >
                      <Wand2 className="w-3 h-3 text-purple-500" />
                      Executive Tone
                    </Button>
                    <Button
                      onClick={handleAddSlide}
                      variant="outline"
                      className="h-8 justify-start px-2.5 rounded-xl border-border text-foreground font-bold text-[11px] gap-1.5 hover:bg-muted"
                    >
                      <Plus className="w-3 h-3 text-emerald-500" />
                      Add Next Slide
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* Clean empty state prompt if user resets wizard */
          wizardStep === "compact" && (
            <div className="min-h-[440px] rounded-[3rem] border-4 border-dashed border-border/80 flex flex-col items-center justify-center text-center p-10 bg-muted/10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shadow-inner">
                <Presentation className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Ready to Architect Your Presentation
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  Describe what you want to present, pick from 106+ profession background styles, attach files, and export directly to PowerPoint (.pptx).
                </p>
              </div>
              <Button
                onClick={() => setWizardStep("describe")}
                className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider px-8 shadow-md"
              >
                Start Presentation Wizard ✨
              </Button>
            </div>
          )
        )}
      </div>

      {/* ========================================================
          THEME MODAL (Full 106+ Background Picker)
      ======================================================== */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Choose Profession Background Style ({TOTAL_THEMES_COUNT} Styles)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Switch background styling instantly while preserving slide text and layouts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
                  {THEME_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setThemeCategory(cat)}
                      className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                        themeCategory === cat
                          ? "bg-fuchsia-600 text-white shadow-sm"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    placeholder="Search styles..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredThemes.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        setIsThemeModalOpen(false);
                        toast({
                          title: "Theme Applied! 🎨",
                          description: `Switched deck style to ${theme.name}.`,
                        });
                      }}
                      className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-fuchsia-500 ring-2 ring-fuchsia-500/20 bg-fuchsia-500/5 shadow-md scale-[1.01]"
                          : "border-border/70 hover:border-fuchsia-300 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-full h-44 rounded-2xl mb-3 p-3 flex flex-col justify-between shadow-inner border border-white/10 ${theme.bg}`}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-current/20 bg-current/5 truncate max-w-[140px]">
                          {theme.profession}
                        </span>
                        <div>
                          <p className="text-sm font-black truncate">{theme.name}</p>
                          <p className="text-[10px] opacity-75 font-mono">{theme.fontPairing}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-foreground">{theme.name}</p>
                          <p className="text-[10px] text-muted-foreground">{theme.profession}</p>
                        </div>
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.hexAccent }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SAVED DECKS MODAL
      ======================================================== */}
      {isSavedDecksOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 sm:p-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Saved Presentation Decks ({savedDecks.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Re-open, present, or export any past presentation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSavedDecksOpen(false)}
                className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 flex-1 overflow-y-auto pr-1">
              {savedDecks.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No saved presentations yet. Generate a deck to see it here!
                </div>
              ) : (
                savedDecks.map((deck) => {
                  const theme =
                    PRESENTATION_THEMES.find((t) => t.id === deck.themeId) ||
                    PRESENTATION_THEMES[0];
                  return (
                    <div
                      key={deck.id}
                      className="p-4 rounded-2xl border border-border/80 hover:border-fuchsia-500/40 bg-card/60 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black truncate text-foreground">
                          {deck.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {deck.slideCount} Slides &bull; Style: {theme.name} &bull;{" "}
                          {new Date(deck.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSlides(deck.slides);
                            setTopic(deck.title);
                            setSelectedThemeId(deck.themeId);
                            setCurrentSlideIndex(0);
                            setWizardStep("compact");
                            setIsSavedDecksOpen(false);
                            toast({
                              title: "Deck Loaded",
                              description: `Opened "${deck.title}".`,
                            });
                          }}
                          className="h-8 text-xs font-bold rounded-xl bg-fuchsia-600 text-white"
                        >
                          Open Deck
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = savedDecks.filter((d) => d.id !== deck.id);
                            setSavedDecks(updated);
                            localStorage.setItem(
                              "presentation_studio_saved_decks",
                              JSON.stringify(updated)
                            );
                            toast({ title: "Deck Removed" });
                          }}
                          className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IMPORT RAW TEXT MODAL
      ======================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 sm:p-8 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Import Presentation Notes or Document
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Paste raw notes, research papers, or speech transcripts to turn into slides.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste raw text here... KnowDeep Slide Architect will extract key topics and structure them into professional slides."
              className="min-h-[180px] rounded-2xl bg-muted/30 border-border text-xs leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {importText.length > 0 ? `${importText.length} characters` : ""}
              </span>
              <Button
                onClick={() => {
                  if (!importText.trim()) return;
                  setSourceNotes(importText);
                  setTopic(importText.slice(0, 100).split("\n")[0] || "Imported Presentation");
                  setIsImportModalOpen(false);
                  setWizardStep("style");
                  toast({
                    title: "Notes Imported! 📄",
                    description: "Proceed to choose your profession background style.",
                  });
                }}
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
              >
                Continue with Imported Notes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRESENTER FULLSCREEN MODE (20%+ Larger Elements)
      ======================================================== */}
      {presenterMode && activeSlide && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 sm:p-12 text-white select-none">
          <div className="flex items-center justify-between opacity-70 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase font-black">
                {activeTheme.name} &bull; Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
            <button
              onClick={() => setPresenterMode(false)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5"
            >
              Exit Fullscreen (ESC)
            </button>
          </div>

          <div className="max-w-5xl mx-auto my-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              {activeSlide.title}
            </h1>
            <p
              className="text-xl sm:text-2xl lg:text-3xl font-bold"
              style={{ color: activeTheme.hexAccent }}
            >
              {activeSlide.subtitle}
            </p>

            <ul className="space-y-4 max-w-4xl mx-auto text-left pt-6 text-lg sm:text-2xl leading-relaxed">
              {activeSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="w-3 h-3 rounded-full mt-3 shrink-0"
                    style={{ backgroundColor: activeTheme.hexAccent }}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between opacity-60 text-xs font-semibold">
            <span>Press Left/Right Arrow or Spacebar to navigate</span>
            <span>KnowDeep Slide Architect</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
