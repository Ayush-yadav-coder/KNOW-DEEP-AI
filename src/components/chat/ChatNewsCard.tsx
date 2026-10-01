import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Newspaper,
  TrendingUp,
  Globe,
  Radio,
  ArrowUpRight,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ChatNewsCardProps {
  topic?: string;
  onContinueInChat?: () => void;
}

export const ChatNewsCard: React.FC<ChatNewsCardProps> = ({
  topic = "Top Global & Tech News",
  onContinueInChat,
}) => {
  const navigate = useNavigate();

  const sampleArticles = [
    {
      title: "Global AI Compute & Clean Energy Milestones Announced",
      source: "Reuters Tech",
      time: "12m ago",
      tag: "Technology",
    },
    {
      title: "Market Rally Continues Amid Resilient Global Economic Indicators",
      source: "Bloomberg",
      time: "34m ago",
      tag: "Markets",
    },
    {
      title: "Deep Space Telescope Unveils Atmospheric Data from Exoplanets",
      source: "Science Daily",
      time: "1h ago",
      tag: "Science",
    },
  ];

  const handleOpenNewsFeed = () => {
    navigate(`/news?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="my-3 w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background/80 to-rose-500/5 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                NewsWire Intelligence
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/20">
                Today's Edition • {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              Topic: {topic}
            </p>
          </div>
        </div>
      </div>

      {/* Headline Items */}
      <div className="space-y-2 my-3.5 relative z-10">
        {sampleArticles.map((art, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-card/60 border border-border/60 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {art.title}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span className="text-amber-500 font-medium">{art.source}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {art.time}
                </span>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
              {art.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Dual Option Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/60 relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Dual Option: Read bullet digest or full news wire</span>
        </div>

        <div className="flex items-center gap-2">
          {onContinueInChat && (
            <button
              onClick={onContinueInChat}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted bg-card/80 border border-border transition-all"
            >
              Continue in Chat
            </button>
          )}

          <button
            onClick={handleOpenNewsFeed}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Open News Feed Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
