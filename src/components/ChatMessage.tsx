import React, { useEffect, useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterMarkdown } from "./TypewriterMarkdown";
import { MessageFeedback } from "./MessageFeedback";
import { FollowUpSuggestions } from "./FollowUpSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, RotateCcw, Plus, Volume2, VolumeX, Sparkles, Download, FileText, FileJson, Presentation, Video, Code2, ImageIcon, FolderOpen, ArrowUpRight, CloudSun, Radio, Trophy } from "lucide-react";
import { KNOWDEEP_LOGO_URL } from "@/lib/branding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { ChatWeatherCard } from "@/components/chat/ChatWeatherCard";
import { ChatNewsCard } from "@/components/chat/ChatNewsCard";
import { ChatSportsCard } from "@/components/chat/ChatSportsCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onFollowUp?: (text: string) => void;
  previousUserMessage?: string;
  onRetry?: (promptText: string, assistantMessageId?: string) => void;
  canRetry?: boolean;
}

// Local heuristic fallback used until AI returns
function localFollowUps(content: string): string[] {
  const suggestions: string[] = [];
  if (content.toLowerCase().includes("code") || content.includes("```")) {
    suggestions.push("Explain this code in plain English", "How can I optimize it?");
  }
  if (content.length > 500) {
    suggestions.push("Summarize this in 3 points");
  }
  if (suggestions.length === 0) {
    suggestions.push("Tell me more", "Give a concrete example");
  }
  return suggestions.slice(0, 3);
}

function ChatMessageComponent({ message, isLast = false, onFollowUp, previousUserMessage, onRetry, canRetry = false }: ChatMessageProps) {
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [aiFollowUps, setAiFollowUps] = useState<string[] | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === "user";
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSpeaking, isLoadingAudio, speak, stop } = useSpeechSynthesis();
  const [isReadingThis, setIsReadingThis] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSpeaking && !isLoadingAudio) {
      setIsReadingThis(false);
    }
  }, [isSpeaking, isLoadingAudio]);

  // AI-powered, context-aware follow-up generation for the last assistant message
  useEffect(() => {
    if (isUser || !isLast || !onFollowUp) return;
    if (!message.content || message.content.length < 40) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke("follow-ups", {
          body: {
            userMessage: previousUserMessage || "",
            assistantMessage: message.content,
          },
        });
        const qs = (data as any)?.questions;
        if (!cancelled && Array.isArray(qs) && qs.length) {
          setAiFollowUps(qs.slice(0, 3));
        }
      } catch {
        /* keep heuristic */
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isUser, isLast, message.content, previousUserMessage, onFollowUp]);

  // Handle quick definition/summary
  const handleQuickDefinition = () => {
    if (onFollowUp) {
      onFollowUp("Summarize the above response in 2-3 short sentences.");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: isUser ? "Prompt has been copied." : "Answer has been copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
    setShowContextMenu(false);
  };

  const handleStartNewChat = () => {
    setShowContextMenu(false);
    useAppStore.getState().setCurrentConversationId(null);
    navigate(`/chat?q=${encodeURIComponent(message.content)}`);
    toast({
      title: "Starting New Chat",
      description: "Starting a new chat thread with this prompt...",
    });
  };

  const handleRetryUserPrompt = () => {
    setShowContextMenu(false);
    if (onRetry) {
      onRetry(message.content);
    }
  };

  const handleRetryAssistantAnswer = () => {
    if (onRetry) {
      onRetry(previousUserMessage || "", message.id);
    }
  };

  const handleToggleSpeech = () => {
    if (isReadingThis && isSpeaking) {
      stop();
      setIsReadingThis(false);
    } else {
      speak(message.content);
      setIsReadingThis(true);
    }
  };

  // Robust long-press handler for mobile touch and desktop mouse hold on user prompt box
  const startLongPress = () => {
    if (!isUser) return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setShowContextMenu(true);
      navigator.clipboard.writeText(message.content).then(() => {
        toast({
          title: "Prompt Selected",
          description: "Options ready / copied to clipboard.",
        });
      }).catch(() => {});
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(40); } catch { /* ignore */ }
      }
    }, 400);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleExportMessage = (format: "md" | "txt" | "json") => {
    let content = message.content;
    let filename = `know_deep_response_${new Date().toISOString().slice(0, 10)}`;
    let mimeType = "text/plain";

    if (format === "md") {
      content = `# Know Deep AI Response\n\n*Date: ${new Date().toLocaleString()}*\n\n---\n\n${message.content}\n\n---\n*Know Deep is an AI and can make mistakes.*`;
      filename += ".md";
      mimeType = "text/markdown";
    } else if (format === "json") {
      content = JSON.stringify(
        {
          role: "assistant",
          content: message.content,
          timestamp: message.created_at || new Date().toISOString(),
          disclaimer: "Know Deep is an AI and can make mistakes.",
        },
        null,
        2
      );
      filename += ".json";
      mimeType = "application/json";
    } else {
      content = `Know Deep AI Response (${new Date().toLocaleString()})\n\n${message.content}\n\n[Know Deep is an AI and can make mistakes.]`;
      filename += ".txt";
      mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `Downloaded as ${filename}`,
    });
  };

  // Content to display
  const displayContent = showQuickSummary && message.content.length > 300
    ? message.content.slice(0, 200) + "..."
    : message.content;

  // 1. USER PROMPT: Rendered inside a box/bubble container with click/long-press actions
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-4 relative group w-full"
      >
        {/* Backdrop overlay to close context menu when clicking outside */}
        {showContextMenu && (
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setShowContextMenu(false)}
          />
        )}

        <div
          id={`user-prompt-${message.id}`}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowContextMenu(true);
          }}
          onTouchStart={startLongPress}
          onTouchEnd={clearLongPress}
          onTouchMove={clearLongPress}
          onMouseDown={startLongPress}
          onMouseUp={clearLongPress}
          onMouseLeave={clearLongPress}
          onClick={() => {
            setShowContextMenu((prev) => !prev);
          }}
          className="relative max-w-[85%] md:max-w-[70%] rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 hover:shadow-md cursor-pointer select-text transition-all"
        >
          {/* Action buttons popup on click or long-press */}
          <AnimatePresence>
            {showContextMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 right-0 top-full mt-2 bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-1.5 min-w-[200px] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {onRetry && (
                  <button 
                    type="button"
                    onClick={handleRetryUserPrompt}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-xl flex items-center gap-2.5 transition-colors mb-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Retry Prompt</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={handleCopyText}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{isCopied ? "Copied!" : "Copy Prompt"}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={handleStartNewChat}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Start a New Chat</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed select-text">{message.content}</p>
            {canRetry && (
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-amber-500 font-medium">
                <RotateCcw className="w-3 h-3 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Response paused • Click prompt to Retry</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. ASSISTANT ANSWER: Uses the whole page (no box structure), with full-width layout and bottom copy + retry buttons
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-8 pt-1"
      id={`assistant-answer-${message.id}`}
    >
      {/* KnowDeep AI Identity Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg overflow-hidden border border-cyan-500/40 ring-1 ring-cyan-500/20 bg-slate-950 shrink-0">
          <img src={KNOWDEEP_LOGO_URL} alt="KnowDeep AI" className="w-full h-full object-cover" />
        </div>
        <span className="text-xs font-black text-foreground tracking-tight">KnowDeep AI</span>
      </div>

      {/* Full-width Markdown Flow without enclosing box */}
      <div className="w-full text-foreground">
        <TypewriterMarkdown
          content={displayContent}
          animate={false}
          speed={12}
          showSkipButton={true}
        />

        {/* Contextual Weather, News, Sports & Studio Launcher Cards */}
        {(() => {
          const contentLower = (message.content + " " + (previousUserMessage || "")).toLowerCase();
          const mentionsWeather =
            contentLower.includes("weather") ||
            contentLower.includes("temperature") ||
            contentLower.includes("forecast") ||
            contentLower.includes("rain in");
          const mentionsNews =
            contentLower.includes("news") ||
            contentLower.includes("breaking news") ||
            contentLower.includes("headlines");
          const mentionsSports =
            contentLower.includes("score") ||
            contentLower.includes("match") ||
            contentLower.includes("ipl") ||
            contentLower.includes("champions league") ||
            contentLower.includes("sports");
          const mentionsPresentation =
            contentLower.includes("presentation") ||
            contentLower.includes("slide") ||
            contentLower.includes("pitch deck") ||
            contentLower.includes("ppt");
          const mentionsVideo =
            contentLower.includes("video") ||
            contentLower.includes("movie") ||
            contentLower.includes("storyboard") ||
            contentLower.includes("scene") ||
            contentLower.includes("clip");
          const mentionsCode =
            contentLower.includes("code studio") ||
            contentLower.includes("build an app") ||
            contentLower.includes("sandbox") ||
            contentLower.includes("full-stack");
          const mentionsDocument =
            contentLower.includes("document studio") ||
            contentLower.includes("executive brief") ||
            contentLower.includes("synthesis") ||
            contentLower.includes("essay");
          const mentionsImage =
            contentLower.includes("generate an image") ||
            contentLower.includes("artwork") ||
            contentLower.includes("picture of") ||
            contentLower.includes("vision studio");

          // Extract location or topic if present
          let weatherCity = "New York";
          if (previousUserMessage) {
            const match = previousUserMessage.match(/weather\s+(?:in|for|at|of)?\s*([a-zA-Z\s,]+)/i);
            if (match && match[1]) {
              weatherCity = match[1].replace(/[?!.]/g, "").trim();
            }
          }

          return (
            <div className="mt-4 space-y-3">
              {/* Weather Inline Card with Stylish Animated Logo */}
              {mentionsWeather && (
                <ChatWeatherCard city={weatherCity} />
              )}

              {/* News Inline Digest Card */}
              {mentionsNews && !mentionsWeather && (
                <ChatNewsCard topic={previousUserMessage || "Top Headlines"} />
              )}

              {/* Sports Inline Scoreboard Card */}
              {mentionsSports && !mentionsWeather && !mentionsNews && (
                <ChatSportsCard query={previousUserMessage || "Live Matches"} />
              )}

              {/* Creative Studios Jump Panel */}
              {(mentionsPresentation || mentionsVideo || mentionsCode || mentionsDocument || mentionsImage) && (
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Continue with Specialized KnowDeep Studio
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Open this project in full interactive studio with deep editing controls
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {mentionsPresentation && (
                      <button
                        onClick={() => navigate(`/presentation-studio?topic=${encodeURIComponent(previousUserMessage || "Presentation")}&autostart=true`)}
                        className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                        <span>Open in Slide Architect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}

                    {mentionsVideo && (
                      <button
                        onClick={() => navigate(`/video-studio?prompt=${encodeURIComponent(previousUserMessage || "Video Project")}`)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open in Director AI</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}

                    {mentionsCode && (
                      <button
                        onClick={() => navigate(`/code-studio?prompt=${encodeURIComponent(previousUserMessage || "Code Project")}`)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Open in Code Studio</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}

                    {mentionsDocument && (
                      <button
                        onClick={() => navigate(`/document-studio?prompt=${encodeURIComponent(previousUserMessage || "Document")}`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open in Doc Architect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}

                    {mentionsImage && (
                      <button
                        onClick={() => navigate(`/image-generator?prompt=${encodeURIComponent(previousUserMessage || "Artwork")}&autostart=true`)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Open in KnowDeep Vision</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* BOTTOM ACTION TOOLBAR: Copy Whole Answer, Export, Retry, Speech Readout, and Feedback */}
        <div className="mt-5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Copy Whole Answer Option */}
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs"
                title="Copy the whole answer"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{isCopied ? "Copied!" : "Copy"}</span>
              </button>

              {/* Export Response Option */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs"
                    title="Export this response"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Export</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 rounded-xl">
                  <DropdownMenuItem onClick={() => handleExportMessage("md")} className="gap-2 text-xs">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <span>Markdown (.md)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportMessage("txt")} className="gap-2 text-xs">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Plain Text (.txt)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportMessage("json")} className="gap-2 text-xs">
                    <FileJson className="w-4 h-4 text-amber-500" />
                    <span>JSON (.json)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Retry Option (Regenerates answer, removing the current one) */}
              {onRetry && (
                <button
                  type="button"
                  onClick={handleRetryAssistantAnswer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-xs"
                  title="Retry and generate a fresh answer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Retry</span>
                </button>
              )}

              {/* Read Aloud / Neural Voice Speak */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-xs border ${
                  isReadingThis && isSpeaking
                    ? "bg-pink-500/15 border-pink-500/50 text-pink-600 dark:text-pink-400 animate-pulse"
                    : isReadingThis && isLoadingAudio
                    ? "bg-muted/80 border-border text-muted-foreground cursor-wait"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200/60 dark:border-slate-700/60"
                }`}
                title={isReadingThis ? (isLoadingAudio ? "Synthesizing realistic audio..." : "Stop reading aloud") : "Read aloud with natural neural voice"}
              >
                {isReadingThis && isLoadingAudio ? (
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                ) : isReadingThis && isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>
                  {isReadingThis && isLoadingAudio
                    ? "Loading..."
                    : isReadingThis && isSpeaking
                    ? "Stop"
                    : "Read aloud"}
                </span>
              </button>

              {/* Summary Option for longer answers */}
              {onFollowUp && message.content.length > 300 && (
                <button
                  type="button"
                  onClick={handleQuickDefinition}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-500 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs"
                  title="Summarize in 2-3 sentences"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Summary</span>
                </button>
              )}
            </div>

            <MessageFeedback messageId={message.id} />
          </div>

          {/* Small disclaimer below export / action options */}
          <p className="text-[11px] text-muted-foreground/60 select-none mt-2">
            Know Deep is an AI and can make mistakes.
          </p>
        </div>

        {/* Context-aware follow-up suggestion chips */}
        {isLast && onFollowUp && (
          <FollowUpSuggestions
            suggestions={aiFollowUps ?? localFollowUps(message.content)}
            onSelect={onFollowUp}
          />
        )}
      </div>
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);

