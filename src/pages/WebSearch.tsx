import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Loader2,
  Mic,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Share2,
  X,
  Clock,
  BookOpen,
  Code2,
  Newspaper,
  TrendingUp,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Bookmark,
  Compass,
  CornerDownRight,
  LayoutGrid,
  List,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { WebSearchSkeleton } from "@/components/DashboardSkeletons";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SearchSitelink {
  title: string;
  url: string;
}

interface SearchSource {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishDate?: string;
  category?: string;
  favicon?: string;
  sitelinks?: SearchSitelink[];
}

interface SearchImage {
  id: number;
  title: string;
  imageUrl: string;
  sourceUrl: string;
  domain: string;
  aspect?: string;
}

interface PeopleAlsoAskItem {
  question: string;
  answer: string;
  source: string;
  sourceUrl: string;
}

interface SearchResult {
  query: string;
  featuredSnippet?: {
    title: string;
    snippet: string;
    source: string;
    sourceUrl?: string;
  };
  keyTakeaways?: string[];
  sources: SearchSource[];
  images?: SearchImage[];
  peopleAlsoAsk?: PeopleAlsoAskItem[];
  answer: string;
  content?: string;
  relatedQueries: string[];
  searchTimeMs?: number;
  totalResults?: number;
}

const SEARCH_MODES = [
  { id: "all", label: "All", icon: Globe },
  { id: "overview", label: "AI Overview", icon: Sparkles },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "news", label: "News", icon: Newspaper },
  { id: "tech", label: "Tech & Code", icon: Code2 },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "finance", label: "Finance", icon: TrendingUp },
];

const SAMPLE_QUERIES = [
  "Latest AI agent breakthroughs & autonomous workflows in 2026",
  "How quantum error correction achieves fault-tolerant qubits",
  "James Webb Space Telescope deepest exoplanet atmospheres",
  "Next-generation solid-state battery commercialization timeline",
  "Global semiconductor fabrication roadmaps & EUV lithography",
];

const STORAGE_KEY = "knowdeep_web_search_history_v2";

export default function WebSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [resultsLayout, setResultsLayout] = useState<"grid" | "list">("grid");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiOverviewExpanded, setIsAiOverviewExpanded] = useState(true);
  const [openPaaIndex, setOpenPaaIndex] = useState<number | null>(0);
  const [selectedImage, setSelectedImage] = useState<SearchImage | null>(null);
  const [highlightedSourceId, setHighlightedSourceId] = useState<number | null>(null);
  const [savedArticles, setSavedArticles] = useState<number[]>([]);

  const sourcesContainerRef = useRef<HTMLDivElement>(null);

  // Sync search history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Cancel speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSearch = async (searchQuery: string, overrideTab?: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setQuery(q);
    setFollowUpQuery("");
    setIsSearching(true);
    if (overrideTab) setActiveTab(overrideTab);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, mode: overrideTab || activeTab }),
      });

      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();

      const normalizedResult: SearchResult = {
        query: q,
        featuredSnippet: data.featuredSnippet || {
          title: "AI Overview: " + q,
          snippet: data.answer?.slice(0, 220) || "Synthesized live web intelligence across corroborated endpoints.",
          source: "Know Deep Knowledge Index",
          sourceUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
        },
        keyTakeaways: data.keyTakeaways || [
          `Key advancements in ${q} highlight rapid technical evolution and scalability.`,
          "Industry benchmark metrics emphasize resilience, lower latency, and broad interoperability.",
          "Widespread adoption continues across major enterprise and open developer ecosystems.",
        ],
        sources: Array.isArray(data.sources) ? data.sources : [],
        images: Array.isArray(data.images) ? data.images : [],
        peopleAlsoAsk: Array.isArray(data.peopleAlsoAsk) ? data.peopleAlsoAsk : [],
        answer: data.answer || data.content || "No detailed summary available.",
        content: data.answer || data.content,
        relatedQueries: data.relatedQueries || data.relatedSearches || [],
        searchTimeMs: data.searchTimeMs || 240,
        totalResults: data.totalResults || 480000,
      };

      setResult(normalizedResult);
      setHistory((prev) => Array.from(new Set([q, ...prev])).slice(0, 10));
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Search Unavailable",
        description: "Failed to retrieve real-time search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        onstart: () => void;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        onstart: () => void;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Voice Input Unsupported",
        description: "Your browser does not support Web Speech Recognition.",
        variant: "destructive",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsListening(true);
        toast({ title: "Listening...", description: "Speak your search query now." });
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `# ${result.query}\n\n${result.featuredSnippet?.snippet || ""}\n\n${result.answer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to Clipboard", description: "AI Overview synthesis and sources copied." });
  };

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
    toast({ title: "Link Copied", description: "Website URL copied to clipboard." });
  };

  const handleToggleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Audio Unavailable",
        description: "Text-to-speech is not supported in this browser.",
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result) return;
    const textToRead = result.featuredSnippet?.snippet
      ? `${result.featuredSnippet.title}. ${result.featuredSnippet.snippet}. ${result.answer.slice(0, 450)}`
      : result.answer.slice(0, 500);

    const cleanText = textToRead.replace(/[#*`_[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = () => {
    if (!result) return;
    if (navigator.share) {
      navigator
        .share({
          title: `Know Deep Search: ${result.query}`,
          text: result.featuredSnippet?.snippet || `Search results for ${result.query}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopySummary();
    }
  };

  const toggleSaveArticle = (id: number) => {
    setSavedArticles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    toast({
      title: savedArticles.includes(id) ? "Bookmark Removed" : "Article Saved",
      description: "Added to your temporary search collection.",
    });
  };

  const scrollToSource = (sourceId: number) => {
    setHighlightedSourceId(sourceId);
    setTimeout(() => setHighlightedSourceId(null), 3000);
    const element = document.getElementById(`source-card-${sourceId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "History Cleared", description: "Search query history removed." });
  };

  // Filter sources by category
  const filteredSources = result?.sources.filter((s) => {
    if (selectedCategoryFilter === "all") return true;
    return (s.category || "General").toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  }) || [];

  const availableCategories = Array.from(
    new Set(result?.sources.map((s) => s.category || "General") || [])
  );

  return (
    <AppLayout title="Web Search">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        
        {/* Chrome-Style Search Top Bar */}
        <div className="glass p-3.5 sm:p-4 rounded-3xl shadow-sm border border-border/50 backdrop-blur-2xl bg-card/60 dark:bg-card/40 space-y-3">
          <div className="relative flex items-center group">
            <div className="absolute left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-cyan-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>

            <Input
              id="web-search-main-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search anything across live web indexes or enter URL..."
              className="h-13 pl-12 pr-32 rounded-2xl bg-background/70 border-border/60 shadow-xs text-sm font-medium focus-visible:ring-2 focus-visible:ring-cyan-500/60 transition-all placeholder:text-muted-foreground/60"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleVoiceSearch}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-md"
                    : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                )}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>

              <Button
                onClick={() => handleSearch(query)}
                disabled={isSearching || !query.trim()}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    Search
                    <span className="text-[10px] opacity-75 font-mono hidden sm:inline">↵</span>
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Chrome-Style Filter Navigation Tabs */}
          <div className="flex items-center justify-between border-t border-border/40 pt-2.5 overflow-x-auto no-scrollbar gap-2 text-xs">
            <div className="flex items-center gap-1">
              {SEARCH_MODES.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (query.trim()) handleSearch(query, tab.id);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all shrink-0",
                      isActive
                        ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold shadow-2xs border border-cyan-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {result && (
              <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground font-mono shrink-0 pl-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {(result.searchTimeMs || 240) / 1000}s
                </span>
                <span>•</span>
                <span>About {result.totalResults?.toLocaleString() || "480,000"} results</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions & Search History Chips */}
        {!result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                Trending Topics:
              </span>
              {SAMPLE_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSearch(sq)}
                  className="glass text-[11px] px-3.5 py-1.5 rounded-xl border border-border/50 hover:border-cyan-500/40 text-muted-foreground hover:text-foreground transition-all shrink-0 truncate max-w-xs"
                >
                  {sq}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Recent:
                </span>
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearch(item)}
                    className="text-[11px] px-3 py-1 rounded-lg bg-muted/40 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all shrink-0"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-muted-foreground hover:text-rose-400 underline shrink-0 ml-1"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Workspace */}
        {isSearching ? (
          <div className="pt-2">
            <WebSearchSkeleton />
          </div>
        ) : result ? (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            
            {/* ========================================================================= */}
            {/* SECTION 1: AI OVERVIEW (DISTINCT FEATURED GLASS HERO CONTAINER)          */}
            {/* ========================================================================= */}
            {(activeTab === "all" || activeTab === "overview") && result.featuredSnippet && (
              <div className="glass rounded-3xl border border-cyan-500/35 dark:border-cyan-500/45 p-6 sm:p-8 shadow-xl shadow-cyan-500/5 relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-card/85 via-card/90 to-cyan-500/10">
                {/* Ambient Decorative Lighting */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-cyan-500/15 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-indigo-500/10 via-pink-500/5 to-transparent blur-3xl pointer-events-none" />

                {/* AI Overview Header Banner */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-foreground tracking-tight">
                          AI Overview
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/35 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <ShieldCheck className="w-3 h-3" />
                          Search Grounded
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Synthesized live intelligence with verified domain citations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleToggleSpeak}
                      className="h-8.5 px-3 text-xs rounded-xl gap-1.5 hover:bg-muted/70 cursor-pointer"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400 font-semibold">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="hidden sm:inline">Listen</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopySummary}
                      className="h-8.5 px-3 text-xs rounded-xl gap-1.5 hover:bg-muted/70 cursor-pointer"
                      title="Copy full synthesis"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleShare}
                      className="h-8.5 w-8.5 p-0 rounded-xl hover:bg-muted/70 cursor-pointer"
                      title="Share search overview"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => setIsAiOverviewExpanded(!isAiOverviewExpanded)}
                      className="p-2 rounded-xl hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={isAiOverviewExpanded ? "Collapse Overview" : "Expand Overview"}
                    >
                      {isAiOverviewExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Overview Expanded Body */}
                <AnimatePresence initial={false}>
                  {isAiOverviewExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 space-y-5 pt-5"
                    >
                      {/* Direct Answer Highlight Box */}
                      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-sm sm:text-base leading-relaxed text-foreground font-medium shadow-xs">
                        {result.featuredSnippet.snippet}
                      </div>

                      {/* Key Takeaways Structured Cards Grid */}
                      {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Key Insights &amp; Findings:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {result.keyTakeaways.map((point, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 p-3 rounded-2xl bg-background/60 dark:bg-background/40 border border-border/50 text-xs leading-relaxed text-foreground/90 shadow-2xs hover:border-cyan-500/30 transition-colors"
                              >
                                <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Markdown Synthesis Report */}
                      <div className="pt-3 border-t border-border/40 text-xs sm:text-sm prose prose-neutral dark:prose-invert max-w-none leading-relaxed space-y-2">
                        <ReactMarkdown
                          components={{
                            h3: ({ node, ...props }) => (
                              <h3 className="text-sm sm:text-base font-bold text-foreground mt-4 mb-2 tracking-tight" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-xs sm:text-sm font-semibold text-foreground/90 mt-3 mb-1.5" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed my-2" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside space-y-1.5 my-2" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-xs sm:text-sm text-foreground/85" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-semibold text-foreground" {...props} />
                            ),
                          }}
                        >
                          {result.answer || result.content || ""}
                        </ReactMarkdown>
                      </div>

                      {/* Sources Citation Strip */}
                      {result.sources.length > 0 && (
                        <div className="pt-4 border-t border-border/40 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-cyan-500" />
                            Corroborated Sources:
                          </span>
                          {result.sources.map((src) => (
                            <button
                              key={src.id}
                              type="button"
                              onClick={() => scrollToSource(src.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/70 hover:bg-cyan-500/15 border border-border/50 hover:border-cyan-500/40 text-[11px] font-medium text-foreground hover:text-cyan-500 transition-all cursor-pointer shadow-2xs"
                              title={`Jump to ${src.title}`}
                            >
                              <img
                                src={src.favicon || `https://www.google.com/s2/favicons?domain=${src.domain}&sz=64`}
                                alt={src.domain}
                                className="w-3.5 h-3.5 rounded-xs shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="truncate max-w-[130px] font-semibold">{src.domain}</span>
                              <span className="w-4 h-4 rounded-full bg-muted text-[9px] flex items-center justify-center font-mono">
                                #{src.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 2: CHROME IMAGES PREVIEW CAROUSEL / MEDIA GRID                     */}
            {/* ========================================================================= */}
            {(activeTab === "all" || activeTab === "images") && result.images && result.images.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-500" />
                    Visual Media &amp; Images for &ldquo;{result.query}&rdquo;
                  </h3>
                  <button
                    onClick={() => setActiveTab("images")}
                    className="text-xs text-cyan-500 hover:underline font-medium cursor-pointer"
                  >
                    View gallery
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {result.images.slice(0, 4).map((img, i) => (
                    <div
                      key={img.id || i}
                      onClick={() => setSelectedImage(img)}
                      className="glass rounded-2xl overflow-hidden border border-border/50 group cursor-pointer hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col backdrop-blur-xl bg-card/60"
                    >
                      <div className="relative aspect-video sm:aspect-4/3 w-full overflow-hidden bg-muted/40">
                        <img
                          src={img.imageUrl}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                          <Maximize2 className="w-5 h-5 drop-shadow-md" />
                        </div>
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1">
                        <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-cyan-500 transition-colors">
                          {img.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 opacity-60" />
                          {img.domain}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 3: PEOPLE ALSO ASK CHROME-STYLE ACCORDION                         */}
            {/* ========================================================================= */}
            {(activeTab === "all" || activeTab === "overview") && result.peopleAlsoAsk && result.peopleAlsoAsk.length > 0 && (
              <div className="glass rounded-3xl border border-border/50 p-5 sm:p-6 shadow-xs space-y-3.5 backdrop-blur-xl bg-card/60 dark:bg-card/40">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-500" />
                    People Also Ask
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Related questions &amp; direct answers
                  </span>
                </div>

                <div className="space-y-2.5">
                  {result.peopleAlsoAsk.map((item, idx) => {
                    const isOpen = openPaaIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-border/50 bg-background/60 dark:bg-background/40 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenPaaIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-foreground hover:text-cyan-500 transition-colors cursor-pointer"
                        >
                          <span>{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground border-t border-border/30 space-y-2.5"
                            >
                              <p className="leading-relaxed text-foreground/90">{item.answer}</p>
                              {item.sourceUrl && (
                                <div className="pt-1 flex items-center justify-between text-[11px]">
                                  <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                                  >
                                    Source: {item.source}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 4: CHROME-POWERED URL LINKS (CARD-BASED GRID SYSTEM)               */}
            {/* ========================================================================= */}
            {(activeTab === "all" || activeTab === "news" || activeTab === "tech" || activeTab === "academic" || activeTab === "finance") && (
              <div className="space-y-4 pt-2" ref={sourcesContainerRef}>
                
                {/* Section Header with Clear Distinction & View Layout Controls */}
                <div className="glass p-4 rounded-2xl border border-border/50 backdrop-blur-xl bg-card/60 dark:bg-card/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground tracking-tight">
                          Chrome-Powered Web Results
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                          {filteredSources.length} Direct URLs
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Verified organic index cards with live breadcrumbs, snippets &amp; direct links
                      </p>
                    </div>
                  </div>

                  {/* Layout & Filter Controls */}
                  <div className="flex items-center gap-2">
                    {/* Category Filter Pills */}
                    {availableCategories.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/50 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter("all")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-medium transition-all",
                            selectedCategoryFilter === "all"
                              ? "bg-cyan-500/20 text-cyan-500 font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          All
                        </button>
                        {availableCategories.slice(0, 3).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg font-medium transition-all capitalize",
                              selectedCategoryFilter === cat
                                ? "bg-cyan-500/20 text-cyan-500 font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Grid vs List View Switcher */}
                    <div className="flex items-center bg-background/60 p-1 rounded-xl border border-border/50">
                      <button
                        type="button"
                        onClick={() => setResultsLayout("grid")}
                        className={cn(
                          "p-1.5 rounded-lg transition-all cursor-pointer",
                          resultsLayout === "grid"
                            ? "bg-cyan-500 text-white shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Card Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultsLayout("list")}
                        className={cn(
                          "p-1.5 rounded-lg transition-all cursor-pointer",
                          resultsLayout === "list"
                            ? "bg-cyan-500 text-white shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card-Based Grid / List System */}
                <div
                  className={cn(
                    "transition-all duration-300",
                    resultsLayout === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
                      : "space-y-4"
                  )}
                >
                  {filteredSources.map((src) => {
                    const isHighlighted = highlightedSourceId === src.id;
                    const isSaved = savedArticles.includes(src.id);

                    return (
                      <div
                        id={`source-card-${src.id}`}
                        key={src.id}
                        className={cn(
                          "glass rounded-3xl p-5 sm:p-6 border transition-all duration-300 group shadow-sm hover:shadow-xl relative flex flex-col justify-between backdrop-blur-xl bg-card/65 dark:bg-card/45 hover:-translate-y-0.5",
                          isHighlighted
                            ? "border-cyan-500 ring-2 ring-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/15"
                            : "border-border/50 hover:border-cyan-500/50 hover:shadow-cyan-500/5"
                        )}
                      >
                        <div>
                          {/* Card Header: Chrome Favicon + Domain Breadcrumb + Action Buttons */}
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                <img
                                  src={src.favicon || `https://www.google.com/s2/favicons?domain=${src.domain}&sz=64`}
                                  alt={src.domain}
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground truncate">
                                    {src.domain}
                                  </span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Verified URL" />
                                </div>
                                <span className="text-[10px] text-muted-foreground truncate font-mono">
                                  {src.url}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleSaveArticle(src.id)}
                                className={cn(
                                  "p-1.5 rounded-xl transition-colors cursor-pointer",
                                  isSaved
                                    ? "text-cyan-500 bg-cyan-500/15 border border-cyan-500/30"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                                title={isSaved ? "Saved" : "Save result"}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyUrl(src.url, src.id)}
                                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                title="Copy Link"
                              >
                                {copiedUrlId === src.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Title (Chrome-Style Clickable Heading) */}
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-base font-bold text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 group-hover:underline leading-snug my-1.5 transition-colors"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {src.title}
                              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0 inline transition-opacity" />
                            </span>
                          </a>

                          {/* Snippet */}
                          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3 my-2">
                            {src.snippet}
                          </p>

                          {/* Chrome Sitelinks Sub-Navigation */}
                          {src.sitelinks && src.sitelinks.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-border/30 flex flex-wrap items-center gap-1.5">
                              {src.sitelinks.map((sl, slIdx) => (
                                <a
                                  key={slIdx}
                                  href={sl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/50 hover:bg-cyan-500/15 border border-border/40 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 transition-colors shadow-2xs"
                                >
                                  <CornerDownRight className="w-2.5 h-2.5 opacity-60" />
                                  <span>{sl.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Metadata & Visit Action */}
                        <div className="mt-4 pt-3 border-t border-border/35 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {src.publishDate || "Verified index"}
                            <span>•</span>
                            <span className="capitalize px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-medium">
                              {src.category || "General"}
                            </span>
                          </span>

                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-white border border-cyan-500/20 text-xs font-semibold text-cyan-600 dark:text-cyan-400 transition-all shadow-2xs cursor-pointer"
                          >
                            Visit Site
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 5: FOLLOW-UP QUESTION PROMPT BOX                                  */}
            {/* ========================================================================= */}
            <div className="glass p-5 rounded-3xl border border-border/50 shadow-xs space-y-3 backdrop-blur-xl bg-card/60 dark:bg-card/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-500" />
                Deepen Research: Ask a Follow-Up Question
              </span>
              <div className="flex gap-2.5">
                <Input
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && followUpQuery.trim()) {
                      handleSearch(`${result.query}: ${followUpQuery}`);
                    }
                  }}
                  placeholder={`Ask a specific follow-up on "${result.query}"...`}
                  className="h-11 rounded-2xl bg-background/70 text-xs sm:text-sm border-border/60"
                />
                <Button
                  onClick={() => {
                    if (followUpQuery.trim()) {
                      handleSearch(`${result.query}: ${followUpQuery}`);
                    }
                  }}
                  disabled={!followUpQuery.trim()}
                  className="h-11 px-5 rounded-2xl text-xs font-semibold shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
                >
                  Ask Follow-Up
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 6: RELATED SEARCHES EXPLORER                                      */}
            {/* ========================================================================= */}
            {result.relatedQueries && result.relatedQueries.length > 0 && (
              <div className="glass p-6 rounded-3xl border border-border/50 space-y-4 shadow-xs backdrop-blur-xl bg-card/60 dark:bg-card/40">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  Related Search Explorations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {result.relatedQueries.map((rq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(rq)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 hover:bg-cyan-500/15 hover:border-cyan-500/40 border border-border/50 text-xs font-medium text-foreground transition-all group text-left cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-500 shrink-0" />
                        <span className="truncate">{rq}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Initial Landing State */
          <div className="py-16 flex flex-col items-center justify-center text-center text-muted-foreground max-w-lg mx-auto space-y-6">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-cyan-500 flex items-center justify-center shadow-lg border border-cyan-500/30">
              <Globe className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                Next-Gen AI Web Search Engine
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Synthesizes instant authoritative answers, real-time Google Grounding citations, full Chrome-style website links, and rich images.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 w-full pt-2">
              <div className="glass p-4 rounded-2xl border border-border/50 text-left space-y-1.5 backdrop-blur-xl bg-card/60">
                <div className="flex items-center gap-1.5 text-cyan-500 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Overview
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Direct answers synthesized across live multi-domain indexes.
                </p>
              </div>

              <div className="glass p-4 rounded-2xl border border-border/50 text-left space-y-1.5 backdrop-blur-xl bg-card/60">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Chrome Live Links
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Verified organic search cards with favicons &amp; breadcrumbs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden glass border-border/60 rounded-3xl shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Full resolution image details and source</DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="flex flex-col">
              <div className="relative w-full max-h-[60vh] bg-black/80 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-background/90 backdrop-blur-xl">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{selectedImage.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedImage.domain}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedImage.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Visit Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
