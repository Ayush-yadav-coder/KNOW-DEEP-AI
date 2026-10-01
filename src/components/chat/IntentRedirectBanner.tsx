import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  X,
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
} from "lucide-react";
import { IntentMatchResult } from "@/lib/intentDispatcher";

interface IntentRedirectBannerProps {
  intentMatch: IntentMatchResult | null;
  onDismiss: () => void;
  onStayInChat: () => void;
  autoRedirectSeconds?: number;
}

export const IntentRedirectBanner: React.FC<IntentRedirectBannerProps> = ({
  intentMatch,
  onDismiss,
  onStayInChat,
}) => {
  const navigate = useNavigate();

  if (!intentMatch || intentMatch.intent === "general_chat") return null;

  const handleLaunchNow = () => {
    navigate(intentMatch.targetRoute);
    onDismiss();
  };

  const getIcon = () => {
    switch (intentMatch.intent) {
      case "image_generation":
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case "image_enhancer":
        return <Wand2 className="w-5 h-5 text-indigo-400" />;
      case "video_generation":
        return <Video className="w-5 h-5 text-red-400" />;
      case "presentation_generation":
        return <Presentation className="w-5 h-5 text-fuchsia-400" />;
      case "code_studio":
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case "document_studio":
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case "homework_assistant":
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case "translator":
        return <Languages className="w-5 h-5 text-teal-400" />;
      case "summarizer":
        return <ListFilter className="w-5 h-5 text-fuchsia-400" />;
      case "ncert_tutor":
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case "concept_xray":
        return <Activity className="w-5 h-5 text-cyan-300" />;
      case "code_interpreter":
        return <Terminal className="w-5 h-5 text-yellow-400" />;
      case "weather_dual":
        return <CloudSun className="w-5 h-5 text-sky-400" />;
      case "news_dual":
        return <Newspaper className="w-5 h-5 text-amber-500" />;
      case "sports_dual":
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        className="mb-3 w-full rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden"
      >
        {/* Ambient Top Glow Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${intentMatch.badgeColor}`} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/80 border border-border/80 flex items-center justify-center shrink-0 shadow-xs">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold tracking-wide uppercase border border-primary/20">
                  {intentMatch.badgeLabel}
                </span>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>{intentMatch.headline}</span>
                  <span className="text-[10px] text-cyan-500 font-semibold">(Auto-Redirect on Submit)</span>
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {intentMatch.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onStayInChat}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted border border-border transition-all cursor-pointer"
            >
              Stay in Chat
            </button>

            <button
              onClick={handleLaunchNow}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${intentMatch.badgeColor} hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all cursor-pointer`}
            >
              <span>Auto-Redirect Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
