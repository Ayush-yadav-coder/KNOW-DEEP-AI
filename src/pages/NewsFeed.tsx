import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Newspaper,
  TrendingUp,
  Globe,
  DollarSign,
  Cpu,
  Film,
  Sparkles,
  Clock,
  ExternalLink,
  X,
  RefreshCw,
  Loader2,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  source: string;
  domain: string;
  timeAgo: string;
  readTime: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  imageUrl: string;
  summary: string;
  tldr: string[];
}

const CATEGORIES = [
  { id: "All", label: "All Topics", icon: Globe },
  { id: "Technology", label: "Technology", icon: Cpu },
  { id: "Global Geopolitics", label: "Global Geopolitics", icon: Globe },
  { id: "Finance", label: "Finance", icon: DollarSign },
  { id: "Science", label: "Science", icon: Sparkles },
  { id: "Entertainment", label: "Entertainment", icon: Film },
];

export default function NewsFeed() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticleModal, setSelectedArticleModal] = useState<NewsArticle | null>(null);

  const fetchNews = async (cat: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/news-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat }),
      });
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        setArticles(data.articles);
      } else {
        // Fallback default headlines
        setArticles(getDefaultNews(cat));
      }
    } catch {
      setArticles(getDefaultNews(cat));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const getDefaultNews = (cat: string): NewsArticle[] => [
    {
      id: "news-1",
      category: "Technology",
      title: "Next-Gen Quantum Processing Clusters Achieve Coherence Breakthrough",
      source: "TechCrunch",
      domain: "techcrunch.com",
      timeAgo: "1h ago",
      readTime: "3 min read",
      sentiment: "Bullish",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&auto=format&fit=crop&q=80",
      summary: "Commercial quantum computing enters fault-tolerant era with error reduction algorithms.",
      tldr: [
        "1000x reduction in quantum decoherence errors announced by research consortium.",
        "Paves way for cryptographic and molecular simulation algorithms running in minutes.",
        "Venture capital deployment in deep tech surges 45% in response.",
      ],
    },
    {
      id: "news-2",
      category: "Finance",
      title: "Global Central Banks Align on Digital Liquidity & Cross-Border Rails",
      source: "Bloomberg",
      domain: "bloomberg.com",
      timeAgo: "2h ago",
      readTime: "4 min read",
      sentiment: "Neutral",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&auto=format&fit=crop&q=80",
      summary: "Multilateral settlement framework aims to compress transaction clearance from days to milliseconds.",
      tldr: [
        "Consortium of 22 central banks introduces unified ISO messaging protocol.",
        "Foreign exchange spread volatility reduced by an estimated 32 bps.",
        "Regulatory harmonization remains subject to parliamentary oversight.",
      ],
    },
    {
      id: "news-3",
      category: "Global Geopolitics",
      title: "Renewable Energy Corridor Accord Ratified Across Euro-Asia Maritime Routes",
      source: "Reuters",
      domain: "reuters.com",
      timeAgo: "3h ago",
      readTime: "3 min read",
      sentiment: "Bullish",
      imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&auto=format&fit=crop&q=80",
      summary: "High-voltage undersea power grid connections guarantee mutual grid stability across continents.",
      tldr: [
        "Over $18B invested in deep-sea transmission cables.",
        "Significantly lowers reliance on fossil fuel spot-market purchasing.",
        "Full commercial interconnection scheduled for 2028.",
      ],
    },
    {
      id: "news-4",
      category: "Science",
      title: "Deep Space Observatory Detects Atmospheric Water Vapor on Terrestrial Exoplanet",
      source: "Nature",
      domain: "nature.com",
      timeAgo: "4h ago",
      readTime: "5 min read",
      sentiment: "Bullish",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=80",
      summary: "Spectroscopic data confirms clouds and meteorological weather cycles on rocky planet 38 light-years away.",
      tldr: [
        "James Webb & ground telescopes confirm methane and moisture vapor signatures.",
        "Planet orbits in the habitable goldilocks zone of an M-dwarf star.",
        "Follow-up biosignature scans slated for late 2026.",
      ],
    },
    {
      id: "news-5",
      category: "Entertainment",
      title: "Generative Cinema Studio Releases First Interactive Photorealistic Feature",
      source: "Variety",
      domain: "variety.com",
      timeAgo: "5h ago",
      readTime: "3 min read",
      sentiment: "Bearish",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80",
      summary: "Viewers can alter plotlines in real time through voice commands and interactive choice branches.",
      tldr: [
        "Pioneers real-time neural radiance rendering for theatrical displays.",
        "Actors guild negotiations reopen over synthetic likeness rights.",
        "Early box office and streaming subscriptions show polar reviews.",
      ],
    },
  ];

  const getSentimentBadge = (sentiment: "Bullish" | "Bearish" | "Neutral") => {
    switch (sentiment) {
      case "Bullish":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-3 h-3" /> Bullish
          </span>
        );
      case "Bearish":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <TrendingDown className="w-3 h-3" /> Bearish
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30">
            <Minus className="w-3 h-3" /> Neutral
          </span>
        );
    }
  };

  return (
    <AppLayout title="News Engine">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
                <Newspaper className="w-5 h-5" />
              </span>
              <span>News Engine</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time trending headlines categorized with market sentiment tracking and instant AI bullet point TL;DRs
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchNews(selectedCategory)}
            disabled={isLoading}
            className="h-8 text-xs rounded-xl gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>
        </div>

        {/* Filter Pills for 1-Click Topic Switching */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-400" : ""}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* News Cards Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
            <p className="text-xs font-semibold text-foreground">Curating Live Headlines...</p>
            <p className="text-[11px] text-muted-foreground mt-1">Synthesizing global feeds and sentiment indicators</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((art) => (
              <motion.article
                key={art.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedArticleModal(art)}
                className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-rose-500/40 cursor-pointer flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="w-full h-40 rounded-2xl overflow-hidden mb-3 relative bg-slate-800">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                        {art.category}
                      </span>
                    </div>
                    {/* Sentiment Badge */}
                    <div className="absolute top-2 right-2">
                      {getSentimentBadge(art.sentiment)}
                    </div>
                  </div>

                  {/* Header Meta */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
                    <span className="font-semibold text-foreground">{art.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {art.timeAgo}
                    </span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug mb-2">
                    {art.title}
                  </h3>

                  {/* Summary Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {/* Footer trigger */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-rose-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" /> Read AI TL;DR
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* AI Bullet Point TL;DR Modal */}
      <AnimatePresence>
        {selectedArticleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-400">{selectedArticleModal.source}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{selectedArticleModal.timeAgo}</span>
                  {getSentimentBadge(selectedArticleModal.sentiment)}
                </div>
                <button
                  onClick={() => setSelectedArticleModal(null)}
                  className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base font-bold text-white leading-snug">
                {selectedArticleModal.title}
              </h2>

              <div className="w-full h-44 rounded-2xl overflow-hidden">
                <img
                  src={selectedArticleModal.imageUrl}
                  alt={selectedArticleModal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* AI Bullet Point TL;DR */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Executive TL;DR
                </span>
                <ul className="space-y-2">
                  {selectedArticleModal.tldr.map((pt, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Source: {selectedArticleModal.domain}</span>
                <Button
                  size="sm"
                  onClick={() => setSelectedArticleModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 rounded-xl"
                >
                  Close Briefing
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
