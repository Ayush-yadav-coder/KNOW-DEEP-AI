import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  Search,
  HardDrive,
  Sparkles,
  Layers,
  ArrowRight,
  Wifi,
  WifiOff,
  Check,
  RefreshCw,
  X,
  FileText,
  Eye,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/components/news/ArticleDetailModal";

export interface SavedArticleItem extends NewsArticle {
  savedAt?: string;
  isRead?: boolean;
  offlineCached?: boolean;
  offlineSizeKb?: number;
  cachedAt?: string;
}

interface ReadingListSidebarProps {
  savedArticles: SavedArticleItem[];
  onSelectArticle: (article: NewsArticle) => void;
  onRemoveArticle: (articleId: string) => void;
  onToggleReadStatus: (articleId: string) => void;
  onClearAllRead?: () => void;
  onCacheAllOffline?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ReadingListSidebar({
  savedArticles,
  onSelectArticle,
  onRemoveArticle,
  onToggleReadStatus,
  onClearAllRead,
  onCacheAllOffline,
  isOpen = true,
  onClose,
  className = "",
}: ReadingListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread" | "read">("all");
  const [isCachingAll, setIsCachingAll] = useState(false);

  // Compute metrics
  const totalArticles = savedArticles.length;
  const unreadCount = savedArticles.filter((a) => !a.isRead).length;
  const readCount = totalArticles - unreadCount;

  // Estimated reading time in minutes
  const totalMinutes = useMemo(() => {
    return savedArticles.reduce((acc, a) => {
      const match = a.readTime?.match(/(\d+)/);
      const mins = match ? parseInt(match[1], 10) : 3;
      return acc + mins;
    }, 0);
  }, [savedArticles]);

  // Total simulated offline storage
  const totalOfflineSize = useMemo(() => {
    return savedArticles.reduce((acc, a) => {
      return acc + (a.offlineSizeKb || 24);
    }, 0);
  }, [savedArticles]);

  const filteredArticles = useMemo(() => {
    return savedArticles.filter((art) => {
      if (filterMode === "unread" && art.isRead) return false;
      if (filterMode === "read" && !art.isRead) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.source.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [savedArticles, filterMode, searchQuery]);

  const handleCacheAll = () => {
    setIsCachingAll(true);
    setTimeout(() => {
      setIsCachingAll(false);
      if (onCacheAllOffline) onCacheAllOffline();
    }, 700);
  };

  return (
    <aside
      className={`rounded-3xl bg-card/75 dark:bg-card/45 backdrop-blur-2xl border border-border/70 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                Saved for Later
              </h2>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                {totalArticles}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Private reading list & offline cache
            </p>
          </div>
        </div>

        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Offline Storage Status Banner */}
      <div className="p-3 bg-card/60 border-b border-border/50 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <HardDrive className="w-3.5 h-3.5" />
          </div>
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground">
              Offline Storage: {totalOfflineSize} KB
            </span>
            <span className="text-muted-foreground block text-[10px]">
              {totalMinutes} min reading time · Cached locally
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCacheAll}
          disabled={isCachingAll || totalArticles === 0}
          className="h-6.5 px-2 text-[10px] font-bold rounded-lg border-border/60 gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isCachingAll ? "animate-spin" : ""}`} />
          <span>Sync All</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-border/40 space-y-2 bg-card/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved articles..."
            className="w-full h-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/60 rounded-xl pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-muted/40 rounded-xl border border-border/40">
          {(
            [
              { id: "all", label: `All (${totalArticles})` },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "read", label: `Read (${readCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                filterMode === tab.id
                  ? "bg-card text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Articles List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-3 space-y-2.5 scrollbar-thin">
        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Reading List Empty</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {searchQuery
                ? "No saved articles match your search."
                : "Bookmark any news story to store it for offline access and private reading."}
            </p>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isRead = art.isRead || false;
            const offlineKb = art.offlineSizeKb || 24;

            return (
              <motion.div
                key={art.id}
                layout
                onClick={() => onSelectArticle(art)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 ${
                  isRead
                    ? "bg-muted/10 border-border/30 opacity-75 hover:opacity-100"
                    : "bg-card/70 hover:bg-card border-border/60 hover:border-amber-500/40 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1 flex-1 min-w-0">
                    {/* Unboxed Metadata (Zero-pill discipline) */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{art.source}</span>
                      <span aria-hidden="true">·</span>
                      <span>{art.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {art.readTime}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                        isRead
                          ? "text-muted-foreground line-through decoration-muted-foreground/40"
                          : "text-foreground group-hover:text-amber-400"
                      }`}
                    >
                      {art.title}
                    </h4>
                  </div>

                  {/* Thumbnail */}
                  {art.imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={art.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>

                {/* OFFLINE CACHING INDICATOR & ACTIONS BAR */}
                <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px]">
                  {/* Offline Cache Indicator Badge */}
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Offline Cached ({offlineKb} KB)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Toggle Read */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleReadStatus(art.id);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        isRead
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      <Check className="w-3 h-3" />
                    </button>

                    {/* Remove from Saved */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArticle(art.id);
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Summary */}
      {totalArticles > 0 && onClearAllRead && (
        <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground">
            {readCount} of {totalArticles} completed
          </span>
          {readCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearAllRead}
              className="h-6.5 px-2 text-[10px] font-semibold text-muted-foreground hover:text-rose-400"
            >
              Clear Read
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}
