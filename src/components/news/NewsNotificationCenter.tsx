import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  Sparkles,
  Radio,
  Clock,
  X,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Zap,
  Filter,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/components/news/ArticleDetailModal";

export interface RadarNotification {
  id: string;
  article: NewsArticle;
  matchedKeyword: string;
  matchedCluster?: string;
  timestamp: string;
  isRead: boolean;
}

interface NewsNotificationCenterProps {
  articles?: NewsArticle[];
  customTopics?: string[];
  pinnedClusters?: string[];
  trackedKeywords?: string[];
  savedInterests?: string[];
  onSelectArticle: (article: NewsArticle) => void;
}

export function NewsNotificationCenter({
  articles = [],
  customTopics = [],
  pinnedClusters = [],
  trackedKeywords = [],
  savedInterests = [],
  onSelectArticle,
}: NewsNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_news_read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_news_dismissed_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate matching notifications based on custom radars and tracked keywords
  const notifications = useMemo(() => {
    const list: RadarNotification[] = [];

    const safeTopics: string[] = Array.isArray(customTopics) && customTopics.length > 0
      ? customTopics
      : Array.isArray(trackedKeywords)
      ? trackedKeywords
      : [];

    const safeClusters: string[] = Array.isArray(pinnedClusters) && pinnedClusters.length > 0
      ? pinnedClusters
      : Array.isArray(savedInterests)
      ? savedInterests
      : [];

    const safeArticles: NewsArticle[] = Array.isArray(articles) ? articles : [];

    const allKeywords = [
      ...safeTopics,
      ...safeClusters,
      "Quantum",
      "Fusion",
      "Semiconductor",
      "AI",
      "Defense",
      "Space",
    ];

    safeArticles.forEach((art) => {
      // Find matches in title, summary, fullStory, tags, or category
      for (const kw of allKeywords) {
        if (!kw || typeof kw !== "string" || kw.trim().length < 2) continue;
        const kwLower = kw.toLowerCase().trim();
        const titleMatch = art.title?.toLowerCase().includes(kwLower);
        const tagMatch = art.tags?.some((t) => typeof t === "string" && t.toLowerCase().includes(kwLower));
        const catMatch = art.category?.toLowerCase().includes(kwLower);
        const summaryMatch = art.summary?.toLowerCase().includes(kwLower);

        if (titleMatch || tagMatch || catMatch || summaryMatch) {
          const notifId = `notif-${art.id}-${kwLower}`;
          if (!dismissedNotificationIds.includes(notifId)) {
            list.push({
              id: notifId,
              article: art,
              matchedKeyword: kw,
              timestamp: art.timeAgo || "Just now",
              isRead: readNotificationIds.includes(notifId),
            });
          }
          break; // One notification per article
        }
      }
    });

    return list;
  }, [articles, customTopics, pinnedClusters, trackedKeywords, savedInterests, readNotificationIds, dismissedNotificationIds]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem("knowdeep_news_read_notifications", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedNotificationIds, id];
    setDismissedNotificationIds(updated);
    try {
      localStorage.setItem("knowdeep_news_dismissed_notifications", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSelectNotif = (notif: RadarNotification) => {
    if (!notif.isRead) {
      const updated = [...readNotificationIds, notif.id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem("knowdeep_news_read_notifications", JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
    setIsOpen(false);
    onSelectArticle(notif.article);
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-9 px-3 text-xs rounded-xl gap-1.5 transition-all ${
          unreadCount > 0
            ? "border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-sm"
            : "border-border/70 text-muted-foreground hover:text-foreground"
        }`}
        title="Tracked Topic Alerts"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Radar Alerts</span>
        {unreadCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile/clickaway */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-3xl bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Dropdown Header */}
              <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-rose-500/15 text-rose-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      Tracked Topic Radar Alerts
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Dispatches matching your custom keywords & clusters
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 space-y-1.5 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">No active alerts</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Articles matching your pinned interest clusters and custom topic radars will appear here in real time.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      onClick={() => handleSelectNotif(notif)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-1.5 ${
                        notif.isRead
                          ? "bg-card/40 border-transparent hover:bg-card hover:border-border/40"
                          : "bg-rose-500/10 border-rose-500/30 text-foreground hover:bg-rose-500/15"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="text-[10px] font-bold font-mono text-rose-400">
                            Radar Match: {notif.matchedKeyword}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDismissNotification(notif.id, e)}
                          className="p-0.5 rounded text-muted-foreground/50 hover:text-rose-400 transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">
                        {notif.article.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>{notif.article.source}</span>
                          <span aria-hidden="true">·</span>
                          <span>{notif.timestamp}</span>
                        </div>
                        <span className="text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Read <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Tracking {customTopics.length} custom radars & {pinnedClusters.length} clusters
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">● Live Stream</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
