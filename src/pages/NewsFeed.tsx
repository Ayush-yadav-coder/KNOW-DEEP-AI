import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Newspaper,
  TrendingUp,
  Globe,
  DollarSign,
  Cpu,
  Sparkles,
  Clock,
  ExternalLink,
  RefreshCw,
  TrendingDown,
  Minus,
  Search,
  Bookmark,
  BookmarkCheck,
  Radio,
  SlidersHorizontal,
  LayoutGrid,
  Terminal,
  ShieldCheck,
  Eye,
  FileText,
  Volume2,
  Calendar,
  Share2,
  ArrowRight,
  ChevronRight,
  Flame,
  Activity,
  Layers,
  Check,
  Filter,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  HardDrive,
  VolumeX,
  Play,
  Pause,
  Square,
  AudioLines,
} from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Button } from "@/components/ui/button";
import { NewsFeedSkeleton } from "@/components/DashboardSkeletons";
import { FinancialMarquee, MarketTicker } from "@/components/news/FinancialMarquee";
import { ExecutiveBriefingPlayer } from "@/components/news/ExecutiveBriefingPlayer";
import { ArticleDetailModal, NewsArticle } from "@/components/news/ArticleDetailModal";
import { NewsWireTerminal } from "@/components/news/NewsWireTerminal";
import { CustomTopicRadar } from "@/components/news/CustomTopicRadar";
import {
  TopicalIntelligenceSidebar,
  InterestCluster,
  TopicalIntelligenceFilterState,
  INTEREST_CLUSTERS,
} from "@/components/news/TopicalIntelligenceSidebar";
import { SentimentSparklineDashboard } from "@/components/news/SentimentSparklineDashboard";
import { ReadingListSidebar, SavedArticleItem } from "@/components/news/ReadingListSidebar";
import { NewsNotificationCenter } from "@/components/news/NewsNotificationCenter";

const CATEGORIES = [
  { id: "All", label: "Top Stories", icon: Globe },
  { id: "AI & Deep Tech", label: "AI & Deep Tech", icon: Cpu },
  { id: "Financial Markets", label: "Financial Markets", icon: DollarSign },
  { id: "Geopolitics & Trade", label: "Geopolitics", icon: Globe },
  { id: "Science & Space", label: "Science & Space", icon: Sparkles },
  { id: "Cyber & Defense", label: "Cyber & Defense", icon: ShieldCheck },
  { id: "Clean Energy", label: "Clean Energy", icon: Sparkles },
  { id: "Culture & Media", label: "Culture & Media", icon: FilmIcon },
];

function FilmIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

const EDITIONS = [
  { id: "global", label: "Global Edition" },
  { id: "americas", label: "Americas & US" },
  { id: "emea", label: "Europe & MEA" },
  { id: "apac", label: "Asia-Pacific" },
  { id: "india", label: "India Edition" },
];

export default function NewsFeed() {
  const { toast } = useToast();
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
    currentlySpeakingTitle,
  } = useSpeechSynthesis();

  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get("topic") || searchParams.get("q");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEdition, setSelectedEdition] = useState("global");
  const [searchQuery, setSearchQuery] = useState(() => {
    if (urlTopic && urlTopic.trim()) return decodeURIComponent(urlTopic.trim());
    return "";
  });

  useEffect(() => {
    if (urlTopic && urlTopic.trim()) {
      setSearchQuery(decodeURIComponent(urlTopic.trim()));
    }
  }, [urlTopic]);
  const [viewMode, setViewMode] = useState<"magazine" | "wire" | "saved">("magazine");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticleModal, setSelectedArticleModal] = useState<NewsArticle | null>(null);
  const [showExecutiveBriefing, setShowExecutiveBriefing] = useState(false);
  const [showSentimentDashboard, setShowSentimentDashboard] = useState(true);

  // Topical Intelligence Sidebar & Reading List Drawer State
  const [selectedCluster, setSelectedCluster] = useState<InterestCluster | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarVisibleDesktop, setIsSidebarVisibleDesktop] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"topical" | "readingList">("topical");

  const [topicalFilters, setTopicalFilters] = useState<TopicalIntelligenceFilterState>({
    category: "All",
    selectedClusterId: null,
    clusterQuery: "",
    sentimentFilter: "all",
    formatFilter: "all",
    minCredibility: 0,
  });

  // Custom Topic Radars
  const [customTopics, setCustomTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_news_custom_radars");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return ["Quantum Computing", "Clean Fusion", "Semiconductors"];
    } catch {
      return ["Quantum Computing", "Clean Fusion", "Semiconductors"];
    }
  });
  const [activeCustomTopic, setActiveCustomTopic] = useState<string | null>(null);

  // Reading List & Saved Articles with Offline-Caching Metadata
  const [savedArticles, setSavedArticles] = useState<SavedArticleItem[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_news_bookmarks");
      if (!saved) return [];
      const parsed: SavedArticleItem[] = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        offlineCached: item.offlineCached ?? true,
        offlineSizeKb: item.offlineSizeKb ?? Math.floor(18 + Math.random() * 16),
        cachedAt: item.cachedAt ?? "Recently cached",
      }));
    } catch {
      return [];
    }
  });

  const saveBookmarks = (list: SavedArticleItem[]) => {
    setSavedArticles(list);
    try {
      localStorage.setItem("knowdeep_news_bookmarks", JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  const handleToggleBookmark = (article: NewsArticle) => {
    const isAlready = savedArticles.some((a) => a.id === article.id);
    if (isAlready) {
      const updated = savedArticles.filter((a) => a.id !== article.id);
      saveBookmarks(updated);
      toast({ title: "Bookmark removed", description: "Article removed from your private reading list." });
    } else {
      const newItem: SavedArticleItem = {
        ...article,
        savedAt: new Date().toISOString(),
        isRead: false,
        offlineCached: true,
        offlineSizeKb: Math.floor(18 + Math.random() * 16),
        cachedAt: "Just now",
      };
      const updated = [newItem, ...savedArticles];
      saveBookmarks(updated);
      toast({
        title: "Saved for Later",
        description: `Cached offline (${newItem.offlineSizeKb} KB) for distraction-free reading.`,
      });
    }
  };

  const handleToggleReadStatus = (articleId: string) => {
    const updated = savedArticles.map((a) =>
      a.id === articleId ? { ...a, isRead: !a.isRead } : a
    );
    saveBookmarks(updated);
  };

  const handleRemoveSavedArticle = (articleId: string) => {
    const updated = savedArticles.filter((a) => a.id !== articleId);
    saveBookmarks(updated);
    toast({ title: "Removed from reading list" });
  };

  const handleReadArticleAloud = (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentlySpeakingId === article.id) {
      if (isSpeaking) {
        pause();
      } else if (isPaused) {
        resume();
      } else {
        stop();
      }
    } else {
      const narrationText = `${article.title}. Reported by ${article.source}, ${article.author || "Correspondent"}. ${article.summary}. Core takeaways: ${article.tldr.join(". ")}.`;
      speak(narrationText, undefined, playbackRate, article.id, article.title);
      toast({
        title: "Read Aloud",
        description: `Playing audio narration for "${article.title.slice(0, 45)}..."`,
      });
    }
  };

  const handleClearAllRead = () => {
    const updated = savedArticles.filter((a) => !a.isRead);
    saveBookmarks(updated);
    toast({ title: "Completed articles cleared from reading list" });
  };

  const handleCacheAllOffline = () => {
    const updated = savedArticles.map((a) => ({
      ...a,
      offlineCached: true,
      cachedAt: "Just now",
    }));
    saveBookmarks(updated);
    toast({
      title: "Offline Cache Synchronized",
      description: `All ${savedArticles.length} stories cached locally in offline database.`,
    });
  };

  const fetchNews = useCallback(async (cat: string, query: string = "") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/news-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, query }),
      });
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        setArticles(data.articles);
      }
    } catch {
      // Retain current or fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeCustomTopic) {
      fetchNews("All", activeCustomTopic);
    } else if (selectedCluster) {
      fetchNews(selectedCluster.category, selectedCluster.name);
    } else {
      fetchNews(selectedCategory, searchQuery);
    }
  }, [selectedCategory, activeCustomTopic, selectedCluster, searchQuery, fetchNews]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCustomTopic(null);
    setSelectedCluster(null);
    fetchNews(selectedCategory, searchQuery);
  };

  const handleAddCustomTopic = (topic: string) => {
    if (customTopics.includes(topic)) return;
    const updated = [...customTopics, topic];
    setCustomTopics(updated);
    try {
      localStorage.setItem("knowdeep_news_custom_radars", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setActiveCustomTopic(topic);
    setSelectedCluster(null);
    toast({ title: "Radar added", description: `Now tracking "${topic}" with real-time AI synthesis.` });
  };

  const handleRemoveCustomTopic = (topic: string) => {
    const updated = customTopics.filter((t) => t !== topic);
    setCustomTopics(updated);
    try {
      localStorage.setItem("knowdeep_news_custom_radars", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (activeCustomTopic === topic) {
      setActiveCustomTopic(null);
    }
  };

  const handleSelectCluster = (cluster: InterestCluster | null) => {
    setSelectedCluster(cluster);
    setActiveCustomTopic(null);
    setTopicalFilters((prev) => ({
      ...prev,
      selectedClusterId: cluster ? cluster.id : null,
    }));
    if (cluster) {
      setSelectedCategory(cluster.category);
      setSearchQuery(cluster.name);
    }
  };

  const handleSelectCategoryFromSidebar = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedCluster(null);
    setActiveCustomTopic(null);
    setTopicalFilters((prev) => ({
      ...prev,
      category: cat,
      selectedClusterId: null,
    }));
    if (viewMode === "saved") setViewMode("magazine");
  };

  const handleResetAllFilters = () => {
    setSelectedCategory("All");
    setSelectedCluster(null);
    setActiveCustomTopic(null);
    setSearchQuery("");
    setTopicalFilters({
      category: "All",
      selectedClusterId: null,
      clusterQuery: "",
      sentimentFilter: "all",
      formatFilter: "all",
      minCredibility: 0,
    });
    fetchNews("All", "");
    toast({ title: "Filters reset", description: "Showing standard global news feed." });
  };

  // Active topic name for Sentiment Sparkline Dashboard
  const activeTopicDisplay = useMemo(() => {
    if (selectedCluster) return selectedCluster.name;
    if (activeCustomTopic) return activeCustomTopic;
    if (searchQuery.trim()) return searchQuery.trim();
    if (selectedCategory !== "All") return selectedCategory;
    return "Global Intelligence";
  }, [selectedCluster, activeCustomTopic, searchQuery, selectedCategory]);

  // Filtered articles factoring in Topical Intelligence refinements (sentiment, credibility, search query)
  const displayedArticles = useMemo(() => {
    const baseList = viewMode === "saved" ? savedArticles : articles;
    return baseList.filter((art) => {
      // Sentiment filter
      if (
        topicalFilters.sentimentFilter !== "all" &&
        art.sentiment !== topicalFilters.sentimentFilter
      ) {
        return false;
      }

      // Min credibility
      if (
        topicalFilters.minCredibility > 0 &&
        (art.credibilityScore || 90) < topicalFilters.minCredibility
      ) {
        return false;
      }

      return true;
    });
  }, [viewMode, savedArticles, articles, topicalFilters]);

  const heroArticle = displayedArticles.length > 0 ? displayedArticles[0] : null;
  const gridArticles = displayedArticles.length > 1 ? displayedArticles.slice(1) : [];

  // Market sentiment calculation
  const bullishCount = displayedArticles.filter((a) => a.sentiment === "Bullish").length;
  const bearishCount = displayedArticles.filter((a) => a.sentiment === "Bearish").length;
  const neutralCount = displayedArticles.length - bullishCount - bearishCount;
  const totalCount = displayedArticles.length || 1;
  const bullishPct = Math.round((bullishCount / totalCount) * 100);
  const bearishPct = Math.round((bearishCount / totalCount) * 100);
  const neutralPct = 100 - bullishPct - bearishPct;

  return (
    <AppLayout title="News Engine">
      <div className="w-full flex-1 flex flex-col bg-background text-foreground min-h-screen">
        {/* Top Financial & Crypto Marquee */}
        <FinancialMarquee
          onOpenBriefing={() => setShowExecutiveBriefing(true)}
          breakingNewsAlert={heroArticle ? `FLASH: ${heroArticle.title}` : undefined}
          onSelectTicker={(ticker) => {
            setSearchQuery(ticker.symbol);
            fetchNews("All", ticker.symbol);
          }}
        />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col space-y-6">
          {/* Main Studio Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20">
                  <Newspaper className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                    <span>Global News & Intelligence Engine</span>
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-perspective journalism, sentiment trend sparklines, topical clusters & offline reading list
                  </p>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Notification Center */}
              <NewsNotificationCenter
                articles={articles}
                customTopics={customTopics}
                pinnedClusters={
                  selectedCluster
                    ? [selectedCluster.name, ...(selectedCluster.keywords || [])]
                    : topicalFilters.selectedClusterId
                    ? [topicalFilters.selectedClusterId]
                    : ["AI", "Semiconductors", "Fusion"]
                }
                trackedKeywords={customTopics}
                savedInterests={
                  selectedCluster
                    ? [selectedCluster.name, ...(selectedCluster.keywords || [])]
                    : topicalFilters.selectedClusterId
                    ? [topicalFilters.selectedClusterId]
                    : ["AI", "Semiconductors", "Fusion"]
                }
                onSelectArticle={(article) => setSelectedArticleModal(article)}
              />

              {/* Reading List Drawer Toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSidebarTab("readingList");
                  setIsSidebarVisibleDesktop(true);
                  setIsSidebarOpenMobile(true);
                }}
                className="h-9 px-3 text-xs rounded-xl gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold hover:bg-amber-500/20 transition-all"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Reading List</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono font-bold">
                  {savedArticles.length}
                </span>
              </Button>

              {/* Mobile Topical Intelligence Drawer Trigger */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSidebarTab("topical");
                  setIsSidebarOpenMobile(true);
                }}
                className="lg:hidden h-9 px-3 text-xs rounded-xl gap-1.5 border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold"
              >
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <span>Topical Hubs</span>
                {selectedCluster && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Button>

              {/* Desktop Sidebar Toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSidebarVisibleDesktop(!isSidebarVisibleDesktop)}
                className="hidden lg:flex h-9 px-3 text-xs rounded-xl gap-1.5 border-border/70 text-muted-foreground hover:text-foreground"
                title={isSidebarVisibleDesktop ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarVisibleDesktop ? (
                  <>
                    <PanelLeftClose className="w-3.5 h-3.5 text-rose-400" />
                    <span>Focus View</span>
                  </>
                ) : (
                  <>
                    <PanelLeftOpen className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sidebar</span>
                  </>
                )}
              </Button>

              {/* Edition Switcher */}
              <select
                value={selectedEdition}
                onChange={(e) => {
                  setSelectedEdition(e.target.value);
                  fetchNews(selectedCategory, searchQuery);
                }}
                className="h-9 text-xs bg-card border border-border/70 rounded-xl px-2.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {EDITIONS.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.label}
                  </option>
                ))}
              </select>

              {/* 60s Audio Briefing Toggle */}
              <Button
                size="sm"
                onClick={() => setShowExecutiveBriefing(!showExecutiveBriefing)}
                className={`h-9 px-3 text-xs rounded-xl gap-1.5 font-semibold transition-all ${
                  showExecutiveBriefing
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/25"
                    : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>60s Audio Briefing</span>
              </Button>

              {/* Refresh Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchNews(selectedCategory, searchQuery)}
                disabled={isLoading}
                className="h-9 px-3 text-xs rounded-xl gap-1.5 border-border/70"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh Wire</span>
              </Button>
            </div>
          </div>

          {/* Executive Audio Briefing Player (Animated Drawer) */}
          <AnimatePresence>
            {showExecutiveBriefing && (
              <ExecutiveBriefingPlayer
                category={selectedCluster?.name || activeCustomTopic || selectedCategory}
                onClose={() => setShowExecutiveBriefing(false)}
                onSelectHeadline={(headline) => {
                  setSearchQuery(headline);
                  fetchNews("All", headline);
                }}
              />
            )}
          </AnimatePresence>

          {/* MAIN WORKSPACE GRID: SIDEBAR (TOPICAL / READING LIST) + DISPATCHES CANVAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* DESKTOP SIDEBAR WITH TABBED TOGGLE (Topical Intelligence vs Reading List) */}
            {isSidebarVisibleDesktop && (
              <div className="hidden lg:flex flex-col gap-3 lg:col-span-4 xl:col-span-3.5 sticky top-4 max-h-[calc(100vh-6rem)]">
                {/* Sidebar Mode Switcher Tab */}
                <div className="flex items-center gap-1 p-1 bg-card/60 border border-border/60 rounded-2xl backdrop-blur-md">
                  <button
                    onClick={() => setActiveSidebarTab("topical")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSidebarTab === "topical"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Topical Intelligence</span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarTab("readingList")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSidebarTab === "readingList"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Reading List ({savedArticles.length})</span>
                  </button>
                </div>

                {activeSidebarTab === "topical" ? (
                  <TopicalIntelligenceSidebar
                    currentCategory={selectedCategory}
                    selectedCluster={selectedCluster}
                    onSelectCategory={handleSelectCategoryFromSidebar}
                    onSelectCluster={handleSelectCluster}
                    onSearchTopic={(q) => {
                      setSearchQuery(q);
                      fetchNews("All", q);
                    }}
                    onPinCustomTopic={handleAddCustomTopic}
                    filterState={topicalFilters}
                    onUpdateFilterState={(updates) => setTopicalFilters((prev) => ({ ...prev, ...updates }))}
                    onResetAllFilters={handleResetAllFilters}
                    className="max-h-[calc(100vh-9.5rem)]"
                  />
                ) : (
                  <ReadingListSidebar
                    savedArticles={savedArticles}
                    onSelectArticle={(art) => setSelectedArticleModal(art)}
                    onRemoveArticle={handleRemoveSavedArticle}
                    onToggleReadStatus={handleToggleReadStatus}
                    onClearAllRead={handleClearAllRead}
                    onCacheAllOffline={handleCacheAllOffline}
                    className="max-h-[calc(100vh-9.5rem)]"
                  />
                )}
              </div>
            )}

            {/* MAIN CONTENT CANVAS */}
            <div
              className={`space-y-6 flex flex-col ${
                isSidebarVisibleDesktop
                  ? "lg:col-span-8 xl:col-span-8.5"
                  : "lg:col-span-12"
              }`}
            >
              {/* Search, Filter Tabs & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search global intelligence, tickers, or events (e.g. Quantum, OPEC, SpaceX)..."
                    className="w-full h-10 bg-card border border-border/70 rounded-2xl pl-9 pr-20 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/60 rounded-2xl shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setViewMode("magazine")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === "magazine"
                        ? "bg-card text-foreground shadow-sm border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-rose-400" />
                    <span>Magazine</span>
                  </button>

                  <button
                    onClick={() => setViewMode("wire")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === "wire"
                        ? "bg-card text-foreground shadow-sm border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Wire Terminal</span>
                  </button>

                  <button
                    onClick={() => setViewMode("saved")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === "saved"
                        ? "bg-card text-foreground shadow-sm border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved ({savedArticles.length})</span>
                  </button>
                </div>
              </div>

              {/* VISUAL SENTIMENT ANALYSIS DASHBOARD WITH SPARKLINE CHART */}
              {showSentimentDashboard && (
                <SentimentSparklineDashboard
                  topicName={activeTopicDisplay}
                  category={selectedCategory}
                  bullishPct={bullishPct}
                  bearishPct={bearishPct}
                  neutralPct={neutralPct}
                />
              )}

              {/* Active Cluster or Category Spotlight Banner */}
              {selectedCluster && (
                <div className="p-3 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-300">
                          Active Cluster: {selectedCluster.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({selectedCluster.category})
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedCluster.summary}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSelectCluster(null)}
                    className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg shrink-0 gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Cluster</span>
                  </Button>
                </div>
              )}

              {/* Interactive Category Tabs (Anti-pill metadata discipline: interactive button tabs with clean active styling) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive =
                    selectedCategory === cat.id && !activeCustomTopic && !selectedCluster && viewMode !== "saved";
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCustomTopic(null);
                        setSelectedCluster(null);
                        if (viewMode === "saved") setViewMode("magazine");
                        setSelectedCategory(cat.id);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                        isActive
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                          : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-400" : ""}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Radars */}
              <CustomTopicRadar
                customTopics={customTopics}
                activeTopic={activeCustomTopic}
                onSelectTopic={(topic) => {
                  if (viewMode === "saved") setViewMode("magazine");
                  setActiveCustomTopic(topic);
                  setSelectedCluster(null);
                }}
                onAddTopic={handleAddCustomTopic}
                onRemoveTopic={handleRemoveCustomTopic}
              />

              {/* DISPATCHES / TERMINAL FEED */}
              {isLoading ? (
                <NewsFeedSkeleton />
              ) : viewMode === "wire" ? (
                <NewsWireTerminal
                  articles={displayedArticles}
                  onSelectArticle={(art) => setSelectedArticleModal(art)}
                  isLoading={isLoading}
                />
              ) : displayedArticles.length === 0 ? (
                <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No Dispatches Found</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {viewMode === "saved"
                      ? "You haven't saved any stories to your Reading List yet. Click the bookmark icon on any article to save it for offline reading."
                      : "No news stories matched your active filters or query. Try resetting topical filters."}
                  </p>
                  <Button
                    size="sm"
                    onClick={handleResetAllFilters}
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs"
                  >
                    Reset Topical Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* HERO LEAD STORY (Magazine Mode) */}
                  {heroArticle && viewMode === "magazine" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedArticleModal(heroArticle)}
                      className="group relative rounded-3xl bg-card border border-border/60 overflow-hidden shadow-md hover:shadow-xl hover:border-rose-500/40 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12"
                    >
                      {/* Hero Left Column: Image with Gradient */}
                      <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto relative overflow-hidden bg-slate-900">
                        <img
                          src={heroArticle.imageUrl}
                          alt={heroArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                            {heroArticle.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                            Lead Story
                          </span>
                        </div>
                      </div>

                      {/* Hero Right Column: Editorial Analysis */}
                      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {/* Typographic Metadata (Anti-pill discipline) */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">{heroArticle.source}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {heroArticle.timeAgo}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{heroArticle.readTime}</span>
                            {heroArticle.credibilityScore && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3" /> {heroArticle.credibilityScore}% Score
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-lg sm:text-xl font-black text-foreground group-hover:text-rose-500 transition-colors leading-snug">
                            {heroArticle.title}
                          </h2>

                          {/* Summary */}
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {heroArticle.summary}
                          </p>

                          {/* 2 Bullet TL;DR snippet */}
                          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Executive Digest
                            </span>
                            <ul className="space-y-1.5 text-xs text-foreground/90">
                              {heroArticle.tldr.slice(0, 2).map((t, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                  <span className="line-clamp-2">{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Footer Trigger */}
                        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-rose-500">
                          <span className="flex items-center gap-1.5">
                            <span>Read Multi-Perspective Report</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleReadArticleAloud(heroArticle, e)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                currentlySpeakingId === heroArticle.id && (isSpeaking || isPaused)
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                  : "bg-muted/60 text-muted-foreground hover:text-foreground border-border/60"
                              }`}
                              title="Listen to Read Aloud"
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${currentlySpeakingId === heroArticle.id && isSpeaking ? "text-rose-400 animate-pulse" : ""}`} />
                              <span>{currentlySpeakingId === heroArticle.id && isSpeaking ? "Playing" : "Listen"}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(heroArticle);
                              }}
                              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Save for Later"
                            >
                              {savedArticles.some((a) => a.id === heroArticle.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* CURATED GRID ARTICLES */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 ${
                      isSidebarVisibleDesktop ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                    } gap-5`}
                  >
                    {(viewMode === "saved" ? displayedArticles : gridArticles).map((art) => {
                      const isBookmarked = savedArticles.some((a) => a.id === art.id);
                      return (
                        <motion.article
                          key={art.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedArticleModal(art)}
                          className="p-4 sm:p-5 rounded-3xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:border-rose-500/40 cursor-pointer flex flex-col justify-between transition-all group"
                        >
                          <div className="space-y-3">
                            {/* Article Thumbnail */}
                            <div className="w-full h-44 rounded-2xl overflow-hidden relative bg-slate-900">
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2.5 left-2.5">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/10">
                                  {art.category}
                                </span>
                              </div>

                              {/* Sentiment Tag */}
                              <div className="absolute top-2.5 right-2.5">
                                {art.sentiment === "Bullish" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                                    <TrendingUp className="w-3 h-3" /> Bullish
                                  </span>
                                )}
                                {art.sentiment === "Bearish" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-500/30">
                                    <TrendingDown className="w-3 h-3" /> Bearish
                                  </span>
                                )}
                                {art.sentiment === "Neutral" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700">
                                    <Minus className="w-3 h-3" /> Neutral
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Typographic Metadata (Anti-pill discipline) */}
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="font-semibold text-foreground">{art.source}</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {art.timeAgo}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{art.readTime}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 group-hover:text-rose-500 transition-colors leading-snug">
                              {art.title}
                            </h3>

                            {/* Summary Preview */}
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {art.summary}
                            </p>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-rose-500">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Read Full TL;DR
                            </span>
                            <div className="flex items-center gap-1.5">
                              {/* Read Aloud Button */}
                              <button
                                onClick={(e) => handleReadArticleAloud(art, e)}
                                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition-all ${
                                  currentlySpeakingId === art.id && (isSpeaking || isPaused)
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                                }`}
                                title="Listen / Read Aloud"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${currentlySpeakingId === art.id && isSpeaking ? "text-rose-400 animate-pulse" : ""}`} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBookmark(art);
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title={isBookmarked ? "Saved in Reading List" : "Save for Later"}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-1" />
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-OVER DRAWER (TOPICAL OR READING LIST) */}
        <AnimatePresence>
          {isSidebarOpenMobile && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpenMobile(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 w-full max-w-sm h-full bg-background border-r border-border shadow-2xl flex flex-col"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-xl">
                    <button
                      onClick={() => setActiveSidebarTab("topical")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        activeSidebarTab === "topical"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Topical Hubs
                    </button>
                    <button
                      onClick={() => setActiveSidebarTab("readingList")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        activeSidebarTab === "readingList"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Reading List ({savedArticles.length})
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsSidebarOpenMobile(false)}
                    className="h-7 w-7 p-0 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeSidebarTab === "topical" ? (
                    <TopicalIntelligenceSidebar
                      currentCategory={selectedCategory}
                      selectedCluster={selectedCluster}
                      onSelectCategory={handleSelectCategoryFromSidebar}
                      onSelectCluster={handleSelectCluster}
                      onSearchTopic={(q) => {
                        setSearchQuery(q);
                        fetchNews("All", q);
                      }}
                      onPinCustomTopic={handleAddCustomTopic}
                      filterState={topicalFilters}
                      onUpdateFilterState={(updates) => setTopicalFilters((prev) => ({ ...prev, ...updates }))}
                      onResetAllFilters={handleResetAllFilters}
                      onCloseMobileDrawer={() => setIsSidebarOpenMobile(false)}
                      className="h-full rounded-none border-none shadow-none"
                    />
                  ) : (
                    <ReadingListSidebar
                      savedArticles={savedArticles}
                      onSelectArticle={(art) => {
                        setSelectedArticleModal(art);
                        setIsSidebarOpenMobile(false);
                      }}
                      onRemoveArticle={handleRemoveSavedArticle}
                      onToggleReadStatus={handleToggleReadStatus}
                      onClearAllRead={handleClearAllRead}
                      onCacheAllOffline={handleCacheAllOffline}
                      onClose={() => setIsSidebarOpenMobile(false)}
                      className="h-full rounded-none border-none shadow-none"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* In-Depth Article Detail & Multi-Perspective Modal */}
        <AnimatePresence>
          {selectedArticleModal && (
            <ArticleDetailModal
              article={selectedArticleModal}
              onClose={() => setSelectedArticleModal(null)}
              isBookmarked={savedArticles.some((a) => a.id === selectedArticleModal.id)}
              onToggleBookmark={handleToggleBookmark}
              onSelectTag={(tag) => {
                setSelectedArticleModal(null);
                setSearchQuery(tag);
                fetchNews("All", tag);
              }}
            />
          )}
        </AnimatePresence>

        {/* Global Floating Read Aloud Audio Player Dock */}
        <AnimatePresence>
          {(isSpeaking || isPaused || isLoadingAudio) && currentlySpeakingTitle && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-40 max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-rose-500/40 shadow-2xl rounded-2xl p-3.5 text-slate-100 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AudioLines className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{isLoadingAudio ? "Preparing Audio..." : isSpeaking ? "Reading Aloud" : "Audio Paused"}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      {currentlySpeakingTitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={stop}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Close Audio Player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                {/* Speed Controls */}
                <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((rateVal) => (
                    <button
                      key={rateVal}
                      onClick={() => setRate(rateVal)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                        playbackRate === rateVal
                          ? "bg-rose-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {rateVal}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (isSpeaking) pause();
                      else if (isPaused) resume();
                    }}
                    className="h-7 px-3 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1"
                  >
                    {isSpeaking ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </Button>

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
