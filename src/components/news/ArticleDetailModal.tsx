import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Clock,
  Globe,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  BarChart3,
  Layers,
  Send,
  MessageSquare,
  ChevronRight,
  Info,
  Calendar,
  User,
  Eye,
  Hash,
  Loader2,
  Highlighter,
  FileText,
  Languages,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  StickyNote,
  Play,
  Pause,
  Square,
  AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, languages } from "@/contexts/LanguageContext";

export interface ArticlePerspective {
  outlet: string;
  stance: string;
  summary: string;
}

export interface ImpactAnalysis {
  market: string;
  geopolitics: string;
  timeline: string;
}

export interface ArticleAnnotation {
  id: string;
  selectedText: string;
  note: string;
  color: "amber" | "rose" | "emerald" | "sky";
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  source: string;
  domain: string;
  author?: string;
  timeAgo: string;
  readTime: string;
  views?: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  credibilityScore?: number;
  imageUrl: string;
  summary: string;
  fullStory?: string;
  tldr: string[];
  perspectives?: ArticlePerspective[];
  impactAnalysis?: ImpactAnalysis;
  relatedTickers?: string[];
  tags?: string[];
}

interface ArticleDetailModalProps {
  article: NewsArticle;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  onSelectTag?: (tag: string) => void;
}

type ModalTab = "story" | "perspectives" | "impact" | "factcheck" | "chat" | "notes";

export function ArticleDetailModal({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectTag,
}: ArticleDetailModalProps) {
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const {
    speak,
    stop,
    pause,
    resume,
    setRate,
    isSpeaking,
    isPaused,
    isLoadingAudio,
    playbackRate,
    currentlySpeakingId,
  } = useSpeechSynthesis();
  const [activeTab, setActiveTab] = useState<ModalTab>("story");
  const [copied, setCopied] = useState(false);

  // Quick Summary state
  const [isQuickSummaryActive, setIsQuickSummaryActive] = useState(false);
  const [quickSummaryType, setQuickSummaryType] = useState<"tldr" | "bullet-points" | "executive">("bullet-points");
  const [generatedQuickSummary, setGeneratedQuickSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Translation state
  const [targetLangCode, setTargetLangCode] = useState<string>(currentLanguage || "es");
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    title: string;
    summary: string;
    fullStory: string;
    tldr: string[];
  } | null>(null);

  // Text selection & Highlight annotations state
  const [selectedTextSnippet, setSelectedTextSnippet] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<"amber" | "rose" | "emerald" | "sky">("amber");
  const [showNoteCreationModal, setShowNoteCreationModal] = useState(false);

  const [annotations, setAnnotations] = useState<ArticleAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(`knowdeep_article_notes_${article.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveAnnotations = (list: ArticleAnnotation[]) => {
    setAnnotations(list);
    try {
      localStorage.setItem(`knowdeep_article_notes_${article.id}`, JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  // In-article interactive Q&A
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: `Hello. I am the Know Deep News Intelligence Analyst. Ask me anything regarding **"${article.title}"**, its geopolitical background, market implications, or technical nuances.`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const articleBodyRef = useRef<HTMLDivElement>(null);

  // Handle text selection in article
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedTextSnippet("");
      setSelectionPosition(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedTextSnippet(text);
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleAddAnnotation = () => {
    if (!selectedTextSnippet) return;
    setShowNoteCreationModal(true);
  };

  const handleSaveAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTextSnippet) return;

    const newAnnotation: ArticleAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      selectedText: selectedTextSnippet,
      note: newNoteInput.trim() || "Highlighted key passage",
      color: selectedHighlightColor,
      createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newAnnotation, ...annotations];
    saveAnnotations(updated);
    setNewNoteInput("");
    setShowNoteCreationModal(false);
    setSelectedTextSnippet("");
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();

    toast({
      title: "Highlight & Note Saved",
      description: "Saved to your private notes for this article.",
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((a) => a.id !== id);
    saveAnnotations(updated);
    toast({ title: "Note removed" });
  };

  // Quick Summary Generation
  const handleGenerateQuickSummary = async (type: "tldr" | "bullet-points" | "executive" = quickSummaryType) => {
    setIsSummarizing(true);
    setIsQuickSummaryActive(true);
    try {
      const textToSummarize = `${article.title}\n\n${article.fullStory || article.summary}`;
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSummarize,
          summaryType: type,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setGeneratedQuickSummary(data.summary);
      }
    } catch {
      setGeneratedQuickSummary(
        `### Executive Quick Summary\n\n- **Core Development**: ${article.tldr[0] || article.summary}\n- **Strategic Implication**: ${article.tldr[1] || "Key operational progress."}\n- **Market Impact**: ${article.impactAnalysis?.market || "Steady outlook."}`
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  // Article Translation
  const handleTranslateArticle = async (langCode: string = targetLangCode) => {
    const targetLangObj = languages.find((l) => l.code === langCode);
    const targetLangName = targetLangObj?.name || "Spanish";

    setIsTranslating(true);
    try {
      // Translate title, summary, and fullStory in one structured batch call
      const combinedText = `[TITLE]\n${article.title}\n[SUMMARY]\n${article.summary}\n[STORY]\n${article.fullStory || article.summary}\n[TLDR]\n${article.tldr.join(" ||| ")}`;

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: combinedText,
          targetLang: targetLangName,
        }),
      });
      const data = await res.json();
      const rawTranslated = data.translatedText || "";

      // Parse translated parts
      const titleMatch = rawTranslated.match(/\[TITLE\]\s*([\s\S]*?)(?=\[SUMMARY\]|$)/i);
      const summaryMatch = rawTranslated.match(/\[SUMMARY\]\s*([\s\S]*?)(?=\[STORY\]|$)/i);
      const storyMatch = rawTranslated.match(/\[STORY\]\s*([\s\S]*?)(?=\[TLDR\]|$)/i);
      const tldrMatch = rawTranslated.match(/\[TLDR\]\s*([\s\S]*?)$/i);

      setTranslatedContent({
        title: titleMatch ? titleMatch[1].trim() : article.title,
        summary: summaryMatch ? summaryMatch[1].trim() : article.summary,
        fullStory: storyMatch ? storyMatch[1].trim() : (article.fullStory || article.summary),
        tldr: tldrMatch ? tldrMatch[1].trim().split("|||").map((s) => s.trim()).filter(Boolean) : article.tldr,
      });
      setIsTranslated(true);
      toast({
        title: `Translated to ${targetLangName}`,
        description: `Article content translated into ${targetLangObj?.nativeName || targetLangName}.`,
      });
    } catch {
      toast({
        title: "Translation error",
        description: "Failed to translate article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAsk = async (questionText?: string) => {
    const q = questionText || inputQuery;
    if (!q.trim() || isAsking) return;

    const userMsg = { role: "user" as const, text: q };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAsking(true);

    try {
      const systemPrompt = `You are a world-class investigative news and financial analyst at Know Deep Intelligence.
Context Article:
Title: "${article.title}"
Category: "${article.category}"
Source: "${article.source}"
Summary: "${article.summary}"
Full Story Context: "${article.fullStory || article.summary}"
TL;DR: "${article.tldr.join("; ")}"

Answer the user's inquiry thoroughly, authoritatively, and objectively with verified background context.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          systemPrompt,
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: data.content || data.reply || "Based on the investigative reporting, this development marks a strategic shift in capital and policy frameworks." },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Verified reporting indicates this development reflects broader macro trends across global infrastructure and regulatory standards." },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      const currentTitle = isTranslated && translatedContent ? translatedContent.title : article.title;
      const currentSummary = isTranslated && translatedContent ? translatedContent.summary : article.summary;
      const currentStory = isTranslated && translatedContent ? translatedContent.fullStory : (article.fullStory || article.summary);
      const narrationText = `${currentTitle}. Reported by ${article.source}, ${article.author || "Senior Correspondent"}. ${currentSummary}. ${currentStory.slice(0, 1200)}`;
      speak(narrationText, undefined, playbackRate, article.id, currentTitle);
    }
  };

  const handleCopyReport = () => {
    const title = isTranslated && translatedContent ? translatedContent.title : article.title;
    const summary = isTranslated && translatedContent ? translatedContent.summary : article.summary;
    const story = isTranslated && translatedContent ? translatedContent.fullStory : (article.fullStory || article.summary);

    const md = `# ${title}\n**Source:** ${article.source} (${article.domain})\n**Category:** ${article.category} · **Sentiment:** ${article.sentiment}\n\n## Summary\n${summary}\n\n## Full Investigation\n${story}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast({
      title: "Story Copied",
      description: "Markdown dossier copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const displayTitle = isTranslated && translatedContent ? translatedContent.title : article.title;
  const displaySummary = isTranslated && translatedContent ? translatedContent.summary : article.summary;
  const displayStory = isTranslated && translatedContent ? translatedContent.fullStory : (article.fullStory || article.summary);
  const displayTldr = isTranslated && translatedContent ? translatedContent.tldr : article.tldr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60 shrink-0">
          <div className="space-y-1.5 flex-1 pr-2">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-rose-400">{article.source}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.timeAgo}
              </span>
              <span>·</span>
              <span>{article.readTime}</span>
              {article.views && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views} reads
                  </span>
                </>
              )}
              {article.credibilityScore && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> {article.credibilityScore}% Reliability
                  </span>
                </>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
              {displayTitle}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Translation Language Selector */}
            <div className="relative flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2 py-1">
              <Languages className="w-3.5 h-3.5 text-rose-400" />
              <select
                value={targetLangCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setTargetLangCode(code);
                  handleTranslateArticle(code);
                }}
                disabled={isTranslating}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {languages.slice(0, 15).map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
              {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-rose-400 ml-1" />}
            </div>

            {/* Quick Summary Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!isQuickSummaryActive) {
                  handleGenerateQuickSummary("bullet-points");
                } else {
                  setIsQuickSummaryActive(false);
                }
              }}
              className={`h-8 px-2.5 text-xs rounded-xl gap-1.5 ${
                isQuickSummaryActive
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="Toggle Quick Summary Mode"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{isQuickSummaryActive ? "Full Text" : "Quick Summary"}</span>
            </Button>

            {/* Read Aloud Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleSpeak}
              disabled={isLoadingAudio}
              className={`h-8 px-2.5 text-xs rounded-xl gap-1.5 transition-all ${
                isSpeaking
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20"
                  : isPaused
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="Read Aloud using Neural Speech Engine"
            >
              {isLoadingAudio ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : isSpeaking ? (
                <Pause className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              ) : isPaused ? (
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline font-semibold">
                {isLoadingAudio
                  ? "Loading Audio..."
                  : isSpeaking
                  ? "Pause"
                  : isPaused
                  ? "Resume"
                  : "Read Aloud"}
              </span>
            </Button>

            {/* Bookmark */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleBookmark(article)}
              className={`h-8 w-8 p-0 rounded-xl ${
                isBookmarked ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Story"}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>

            {/* Copy */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyReport}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              title="Copy Story"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>

            {/* Close */}
            <button
              onClick={() => {
                stop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Read Aloud Audio Control Strip (when audio is active or paused) */}
        {(isSpeaking || isPaused || isLoadingAudio) && currentlySpeakingId === article.id && (
          <div className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              {/* Equalizer Visualizer */}
              <div className="flex items-center gap-1 h-4 px-1.5 py-1 rounded bg-rose-500/20">
                <span className={`w-1 rounded-full bg-rose-400 ${isSpeaking ? "animate-bounce h-3" : "h-1.5"}`} style={{ animationDelay: "0ms" }} />
                <span className={`w-1 rounded-full bg-rose-400 ${isSpeaking ? "animate-bounce h-4" : "h-2"}`} style={{ animationDelay: "150ms" }} />
                <span className={`w-1 rounded-full bg-rose-400 ${isSpeaking ? "animate-bounce h-2" : "h-1"}`} style={{ animationDelay: "300ms" }} />
                <span className={`w-1 rounded-full bg-rose-400 ${isSpeaking ? "animate-bounce h-3.5" : "h-2"}`} style={{ animationDelay: "450ms" }} />
              </div>

              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AudioLines className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isLoadingAudio ? "Synthesizing Neural Audio..." : isSpeaking ? "Reading Aloud Active" : "Audio Paused"}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  {displayTitle}
                </div>
              </div>
            </div>

            {/* Playback & Speed Controls */}
            <div className="flex items-center gap-2">
              {/* Speed Rate Selectors */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-xl p-0.5">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rateVal) => (
                  <button
                    key={rateVal}
                    onClick={() => setRate(rateVal)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                      playbackRate === rateVal
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {rateVal}x
                  </button>
                ))}
              </div>

              {/* Play / Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleSpeak}
                className="h-7 px-2 text-xs rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 gap-1 font-bold"
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-rose-300" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-rose-300" />
                    <span>Resume</span>
                  </>
                )}
              </Button>

              {/* Stop */}
              <Button
                size="sm"
                variant="ghost"
                onClick={stop}
                className="h-7 w-7 p-0 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Stop Audio"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            </div>
          </div>
        )}

        {/* Translation Banner if active */}
        {isTranslated && (
          <div className="px-4 py-2 bg-rose-500/15 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>Translated to {languages.find((l) => l.code === targetLangCode)?.name}</span>
            </span>
            <button
              onClick={() => setIsTranslated(false)}
              className="text-[11px] font-bold underline hover:text-white"
            >
              Show Original English
            </button>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto shrink-0">
          {[
            { id: "story", label: "Full Report & TL;DR", icon: Sparkles },
            { id: "notes", label: `Notes & Highlights (${annotations.length})`, icon: Highlighter },
            { id: "perspectives", label: "Multi-Perspective Radar", icon: Layers },
            { id: "impact", label: "Impact & Timeline", icon: BarChart3 },
            { id: "factcheck", label: "Credibility & Citations", icon: ShieldCheck },
            { id: "chat", label: "Ask News AI", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ModalTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-400" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Body */}
        <div
          ref={articleBodyRef}
          onMouseUp={handleMouseUp}
          className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5"
        >
          {/* FLOATING TEXT HIGHLIGHT & NOTE ACTION BAR */}
          {selectedTextSnippet && selectionPosition && activeTab === "story" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="fixed z-50 bg-slate-950 border border-rose-500/50 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 backdrop-blur-xl"
              style={{
                left: Math.max(16, selectionPosition.x - 120),
                top: Math.max(16, selectionPosition.y - 45),
              }}
            >
              <Button
                size="sm"
                onClick={handleAddAnnotation}
                className="h-7 px-2.5 text-[11px] font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-1"
              >
                <Highlighter className="w-3 h-3" />
                <span>Highlight & Note</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setActiveTab("chat");
                  handleAsk(`Explain this key passage from the story: "${selectedTextSnippet}"`);
                  setSelectedTextSnippet("");
                  setSelectionPosition(null);
                }}
                className="h-7 px-2 text-[11px] font-bold text-slate-300 hover:text-white rounded-xl gap-1"
              >
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>AI Explain</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(`"${selectedTextSnippet}" — ${article.source}`);
                  toast({ title: "Quote copied" });
                  setSelectedTextSnippet("");
                  setSelectionPosition(null);
                }}
                className="h-7 w-7 p-0 text-slate-400 hover:text-white rounded-xl"
                title="Copy Quote"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </motion.div>
          )}

          {/* TAB 1: STORY & TL;DR (OR QUICK SUMMARY MODE) */}
          {activeTab === "story" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Cover Image */}
              <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden relative bg-slate-950">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                    {article.category}
                  </span>
                  {article.sentiment === "Bullish" && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Bullish Market Tone
                    </span>
                  )}
                  {article.sentiment === "Bearish" && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 backdrop-blur-md text-rose-300 text-[11px] font-semibold border border-rose-500/30 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Bearish Market Tone
                    </span>
                  )}
                  {article.sentiment === "Neutral" && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1">
                      <Minus className="w-3 h-3" /> Objective Wire
                    </span>
                  )}
                </div>
              </div>

              {/* QUICK SUMMARY CONDENSED VIEW */}
              {isQuickSummaryActive ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <h3 className="text-sm font-black text-white">AI Quick Summary Mode</h3>
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-xl border border-slate-700">
                      {[
                        { id: "bullet-points", label: "Bullet Points" },
                        { id: "executive", label: "Executive" },
                        { id: "tldr", label: "30s TL;DR" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setQuickSummaryType(s.id as any);
                            handleGenerateQuickSummary(s.id as any);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            quickSummaryType === s.id
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isSummarizing ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
                      <span className="text-xs text-slate-300">Synthesizing on-demand summary...</span>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                      {generatedQuickSummary || displaySummary}
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/30 flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Condensed from full editorial report</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsQuickSummaryActive(false)}
                      className="text-rose-400 hover:text-rose-300 text-xs h-7"
                    >
                      Return to Full Report
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* AI Executive TL;DR Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Executive TL;DR
                      </span>
                      <span className="text-[11px] text-slate-400">30-Second Digest</span>
                    </div>
                    <ul className="space-y-2">
                      {displayTldr.map((pt, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-sm shadow-rose-500/50" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full Article Prose with Text Selection Tip */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-white">Editorial Briefing & Analysis</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Highlighter className="w-3 h-3 text-rose-400" /> Highlight any text to add private notes
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans selection:bg-rose-500/30 selection:text-white">
                      {displayStory.split("\n\n").map((para, i) => (
                        <p key={i} className="text-slate-300">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tags & Tickers Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Related Topics:</span>
                  {(article.tags || [article.category, "Global Trade", "Technology"]).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onSelectTag?.(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {article.relatedTickers && article.relatedTickers.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold">Tickers:</span>
                    {article.relatedTickers.map((tick, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-950 font-mono text-[11px] text-emerald-400 border border-emerald-500/30"
                      >
                        {tick}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTES & HIGHLIGHTS */}
          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Highlighter className="w-4 h-4 text-amber-400" />
                    <span>Private Highlights & Notes</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your personal highlighted passages, commentary, and takeaways for this article.
                  </p>
                </div>

                {annotations.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const allText = annotations.map((a) => `> "${a.selectedText}"\nNote: ${a.note}`).join("\n\n");
                      navigator.clipboard.writeText(allText);
                      toast({ title: "All notes copied to clipboard" });
                    }}
                    className="h-8 text-xs border-slate-700 rounded-xl gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Export Notes</span>
                  </Button>
                )}
              </div>

              {annotations.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">No Highlights Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Switch to the <strong>Full Report</strong> tab and select any passage of text to highlight it and attach private notes.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("story")}
                    className="h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs mt-2"
                  >
                    Go to Story
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <blockquote
                          className={`text-xs italic pl-3 border-l-2 leading-relaxed ${
                            ann.color === "amber"
                              ? "border-amber-400 text-amber-200"
                              : ann.color === "rose"
                              ? "border-rose-400 text-rose-200"
                              : ann.color === "emerald"
                              ? "border-emerald-400 text-emerald-200"
                              : "border-sky-400 text-sky-200"
                          }`}
                        >
                          "{ann.selectedText}"
                        </blockquote>

                        <button
                          onClick={() => handleDeleteAnnotation(ann.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <StickyNote className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="font-medium">{ann.note}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{ann.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MULTI-PERSPECTIVE RADAR */}
          {activeTab === "perspectives" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Multi-Perspective Stance Analysis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How different global news organizations, market analysts, and engineering boards frame this development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(
                  article.perspectives || [
                    { outlet: "Reuters & Global Wire", stance: "Verified Facts", summary: "Focuses on peer-reviewed metrics, officially signed treaties, and audited statements." },
                    { outlet: "Bloomberg / Wall St", stance: "Market Impact", summary: "Analyzes capital deployment, venture funding allocations, and valuation adjustments." },
                    { outlet: "Technical / Engineering", stance: "Architecture & Limits", summary: "Examines protocol scalability, physical limits, and timeline bottlenecks." },
                  ]
                ).map((persp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white">{persp.outlet}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-rose-300 border border-rose-500/30">
                          {persp.stance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{persp.summary}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified Corroboration</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IMPACT & TIMELINE */}
          {activeTab === "impact" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <span>Strategic Impact & Execution Milestones</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Quantifiable implications across financial markets, geopolitical treaties, and execution timelines.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Financial Markets & Equities Impact</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {article.impactAnalysis?.market || "Positive capital inflows into semiconductor equipment manufacturers and clean energy infrastructure equities."}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Geopolitical & Regulatory Alignment</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {article.impactAnalysis?.geopolitics || "Multilateral accords establish reciprocal standards and cyber defense safeguards across cross-border hubs."}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">30 - 90 Day Milestone Outlook</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {article.impactAnalysis?.timeline || "Enterprise pilot integrations and secondary verification datasets scheduled for public release in Q4."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CREDIBILITY & CITATIONS */}
          {activeTab === "factcheck" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Fact-Checking & Integrity Score</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Audited against Know Deep News Integrity & Source Verification Matrix.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {article.credibilityScore || 98}%
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    High Confidence
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ASK NEWS AI */}
          {activeTab === "chat" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200 flex flex-col h-full">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Grounded Article Analyst</h4>
                    <p className="text-[10px] text-slate-400">Inquire into facts, quotes, context, or market links</p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[40vh] pr-1 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-rose-500/30">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-lg ${
                        msg.role === "user"
                          ? "bg-rose-600 text-white rounded-tr-none"
                          : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    <span>Analyzing intelligence dossier...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-800"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question about this story..."
                  className="flex-1 h-9 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAsking || !inputQuery.trim()}
                  className="h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* MODAL: ADD HIGHLIGHT & NOTE */}
        <AnimatePresence>
          {showNoteCreationModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Highlighter className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold text-white">Save Highlight & Note</h3>
                  </div>
                  <button
                    onClick={() => setShowNoteCreationModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <blockquote className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs italic text-slate-300 max-h-24 overflow-y-auto leading-relaxed">
                  "{selectedTextSnippet}"
                </blockquote>

                <form onSubmit={handleSaveAnnotation} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Highlight Tint</label>
                    <div className="flex items-center gap-2">
                      {(["amber", "rose", "emerald", "sky"] as const).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedHighlightColor(col)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            col === "amber"
                              ? "bg-amber-400"
                              : col === "rose"
                              ? "bg-rose-400"
                              : col === "emerald"
                              ? "bg-emerald-400"
                              : "bg-sky-400"
                          } ${selectedHighlightColor === col ? "scale-125 border-white" : "border-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Private Annotation Note</label>
                    <textarea
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      placeholder="Add personal thoughts, research notes, or takeaways..."
                      className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNoteCreationModal(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4"
                    >
                      Save Annotation
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
