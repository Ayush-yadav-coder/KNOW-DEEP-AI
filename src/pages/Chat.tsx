import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";
import liveChatIcon from "@/assets/live-chat-icon.png";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Plus, 
  Sparkles,
  Loader2,
  Share2,
  Download,
  StopCircle,
  HelpCircle,
  Code2,
  BookOpen,
  Atom,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { AppLayout } from "@/components/AppLayout";
import { ThinkingStepper } from "@/components/ThinkingStepper";
import { ChatMessage } from "@/components/ChatMessage";
import { StreamingMessage } from "@/components/StreamingMessage";
import { ExplorationBreadcrumbs } from "@/components/ExplorationBreadcrumbs";
import { ExportChat } from "@/components/ExportChat";
import { useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ShareConversation } from "@/components/ShareConversation";
import { AttachmentButton, AttachmentPreview, type Attachment } from "@/components/AttachmentButton";
import { PremiumModelSelector } from "@/components/PremiumModelSelector";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";
import { useUserMemory } from "@/hooks/useUserMemory";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  pinned?: boolean;
}

interface BreadcrumbItem {
  id: string;
  label: string;
  query: string;
}

const HERO_SUGGESTIONS = [
  { icon: Atom, title: "Explain Pythagoras Theorem", prompt: "Explain the Pythagoras theorem with clear visual intuition, formula, and step-by-step real-world examples." },
  { icon: BookOpen, title: "Summarize Newton Laws", prompt: "Summarize Newton's 3 Laws of Motion with concise formulas and everyday physical demonstrations." },
  { icon: HelpCircle, title: "Steps for Quadratic Equation", prompt: "What are the step-by-step methods to solve quadratic equations (factoring, completing square, quadratic formula)?" },
  { icon: Sparkles, title: "Explain Photosynthesis", prompt: "Explain the biological process of photosynthesis simply with light-dependent and Calvin cycle stages." },
  { icon: Code2, title: "Build a Python Web Scraper", prompt: "Write a complete Python script to scrape articles using BeautifulSoup and Requests with error handling." },
  { icon: TrendingUp, title: "Analyze Financial Markets", prompt: "Analyze current global market macroeconomic trends, interest rates, and tech sector momentum." },
];

export default function Chat() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { preferences, currentConversationId, setCurrentConversationId, toggleSidebar } = useAppStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const dailyLimit = useDailyMessageLimit();
  const { extractFromMessage } = useUserMemory();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isPro] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [greetingIndex, setGreetingIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [temporaryChat, setTemporaryChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("kd-2-fast");

  const abortControllerRef = useRef<AbortController | null>(null);

  const { isListening, transcript, error: speechError, startListening, stopListening, isSupported: speechRecognitionSupported } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: speechSynthesisSupported } = useSpeechSynthesis();

  const [searchParams] = useSearchParams();
  const urlConvId = searchParams.get("id");
  const rawQuery = searchParams.get("q");

  useEffect(() => {
    if (rawQuery) {
      let decoded = rawQuery;
      try {
        decoded = decodeURIComponent(rawQuery);
      } catch {
        decoded = rawQuery;
      }
      setInput(decoded);
    }
  }, [rawQuery]);

  // Dynamically auto-expand textarea based on user input (supporting 1 up to 5-6 lines ~148px)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      // 48px is min-height (1 line), 148px is ~5-6 lines
      inputRef.current.style.height = `${Math.min(Math.max(scrollHeight, 48), 148)}px`;
    }
  }, [input]);

  // Rotating greeting options as requested
  const displayName = preferences.displayName || user?.user_metadata?.display_name || "Ayush Coder";
  
  // Create a new chat on app load if no conversation is selected and we're not loading an existing one
  useEffect(() => {
    if (!urlConvId && !currentConversationId && conversations.length > 0 && !currentConversation) {
      createNewConversation();
    }
  }, [urlConvId, currentConversationId, conversations, currentConversation]);

  useEffect(() => {
    if (urlConvId && urlConvId !== currentConversation) {
      setCurrentConversation(urlConvId);
    } else if (currentConversationId && currentConversationId !== currentConversation) {
      setCurrentConversation(currentConversationId);
    }
  }, [urlConvId, currentConversationId]);

  useEffect(() => {
    if (speechError) {
      toast({
        title: "Voice Input Notice",
        description: speechError,
        variant: "destructive",
      });
    }
  }, [speechError]);

  // Load pinned conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pinned_conversations");
    if (saved) {
      try {
        setPinnedConversations(new Set(JSON.parse(saved)));
      } catch {
        setPinnedConversations(new Set());
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      const isGuest = localStorage.getItem("guest_mode") === "true";
      if (!isGuest) navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    if (!user) {
      const saved = localStorage.getItem("guest_conversations");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConversations(parsed);
          if (parsed.length > 0 && !currentConversation) {
            setCurrentConversation(parsed[0].id);
          }
          return;
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const sorted = (data || []).sort((a, b) => {
        const aPinned = pinnedConversations.has(a.id);
        const bPinned = pinnedConversations.has(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setConversations(sorted);
      if (sorted.length > 0 && !currentConversation) {
        setCurrentConversation(sorted[0].id);
      }
    } catch (error) {
      console.warn("Notice loading conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) {
      const saved = localStorage.getItem(`guest_msgs_${conversationId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
          return;
        } catch {
          // ignore
        }
      }
      setMessages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const typedMessages: Message[] = (data || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        created_at: m.created_at,
      }));
      setMessages(typedMessages);
    } catch (error) {
      console.warn("Notice loading messages:", error);
    }
  };

  async function createNewConversation() {
    const newId = crypto.randomUUID();
    const newConv: Conversation = {
      id: newId,
      title: "New Conversation",
      created_at: new Date().toISOString(),
    };

    if (user) {
      try {
        const { data } = await supabase
          .from("chat_conversations")
          .insert({ id: newId, user_id: user.id, title: "New Conversation" })
          .select()
          .single();
        if (data) {
          setConversations([data, ...conversations]);
        } else {
          setConversations([newConv, ...conversations]);
        }
      } catch {
        setConversations([newConv, ...conversations]);
      }
    } else {
      const updated = [newConv, ...conversations];
      setConversations(updated);
      localStorage.setItem("guest_conversations", JSON.stringify(updated));
    }

    setCurrentConversation(newId);
    setCurrentConversationId(newId);
    setMessages([]);
    setBreadcrumbs([]);
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: createNewConversation,
    onToggleSidebar: () => toggleSidebar(),
    onFocusInput: () => inputRef.current?.focus(),
  });

  const handleFollowUp = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
    
    const shortLabel = text.length > 30 ? text.slice(0, 30) + "..." : text;
    setBreadcrumbs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: shortLabel, query: text },
    ]);
  };

  const handleBreadcrumbNavigate = (item: BreadcrumbItem) => {
    const idx = breadcrumbs.findIndex((b) => b.id === item.id);
    if (idx !== -1) {
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
      setInput(item.query);
      inputRef.current?.focus();
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const sendMessageWithPrompt = (promptText: string) => {
    setInput(promptText);
    setTimeout(() => {
      handleSendMessage(promptText);
    }, 50);
  };

  const handleSendMessage = async (customText?: string) => {
    const queryText = (customText !== undefined ? customText : input).trim();
    if ((!queryText && attachments.length === 0) || isLoading) return;
    if (user && !(await dailyLimit.tryConsume())) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      conversationId = crypto.randomUUID();
      const newConv: Conversation = {
        id: conversationId,
        title: queryText.slice(0, 50),
        created_at: new Date().toISOString(),
      };

      setCurrentConversation(conversationId);
      setCurrentConversationId(conversationId);
      if (user) {
        try {
          await supabase
            .from("chat_conversations")
            .insert({ id: conversationId, user_id: user.id, title: queryText.slice(0, 50) });
        } catch (e) {
          console.warn("Could not save conversation to DB:", e);
        }
        setConversations([newConv, ...conversations]);
      } else {
        const updated = [newConv, ...conversations];
        setConversations(updated);
        localStorage.setItem("guest_conversations", JSON.stringify(updated));
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: queryText,
      created_at: new Date().toISOString(),
    };

    if (messages.length === 0 || breadcrumbs.length === 0) {
      const shortLabel = queryText.length > 30 ? queryText.slice(0, 30) + "..." : queryText;
      setBreadcrumbs([{ id: crypto.randomUUID(), label: shortLabel, query: queryText }]);
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);
    setStreamingContent("");

    if (user) {
      try {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "user",
          content: queryText,
        });
      } catch (e) {
        console.warn("Could not save user message to DB:", e);
      }
    } else {
      const existing = JSON.parse(localStorage.getItem(`guest_msgs_${conversationId}`) || "[]");
      localStorage.setItem(`guest_msgs_${conversationId}`, JSON.stringify([...existing, userMessage]));
    }

    if (user) {
      extractFromMessage(queryText);
    }

    if (messages.length === 0 && user) {
      try {
        await supabase
          .from("chat_conversations")
          .update({ title: queryText.slice(0, 50) })
          .eq("id", conversationId);
        loadConversations();
      } catch (e) {
        // ignore
      }
    }

    try {
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);

      let response: Response;
      try {
        response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });
      } catch (localErr) {
        const { data: { session: streamSession } } = await supabase.auth.getSession();
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${streamSession?.access_token || ""}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");

      if (user) {
        try {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: fullContent,
          });
        } catch (e) {
          console.warn("Could not save assistant message to DB:", e);
        }
      } else {
        const existing = JSON.parse(localStorage.getItem(`guest_msgs_${conversationId}`) || "[]");
        localStorage.setItem(`guest_msgs_${conversationId}`, JSON.stringify([...existing, assistantMessage]));
      }

      if (voiceEnabled && fullContent) {
        speak(fullContent);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const currentConversationData = conversations.find((c) => c.id === currentConversation);

  return (
    <AppLayout>
      <DailyLimitDialog open={dailyLimit.showUpgrade} onOpenChange={dailyLimit.setShowUpgrade} />

      {/* Modern Ambient Mesh Aura Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* FULL-PAGE IMMERSIVE WORKSPACE (No inner short card, no double scrolling) */}
      <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-3.5rem)] relative">
        
        {/* Top Floating Controls Bar (Minimalist Sound Toggle & Breadcrumbs) */}
        {breadcrumbs.length > 0 && (
          <div className="w-full max-w-4xl mx-auto px-4 pt-2">
            <ExplorationBreadcrumbs
              items={breadcrumbs}
              onNavigate={handleBreadcrumbNavigate}
              onClear={() => setBreadcrumbs([])}
            />
          </div>
        )}

        {/* MESSAGES & CONTENT FLOW */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-48 space-y-6">
          
          {/* WELCOME / EMPTY STATE: Radiant Shining Hero Screen matching user prompt & image */}
          {messages.length === 0 && (
            <div className="flex flex-col items-start justify-center pt-8 sm:pt-14 pb-8 max-w-3xl mx-auto">
              
              {/* Star / Sparkle Glowing Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-6 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Know Deep AI Workspace</span>
              </motion.div>

              {/* Central Glowing Icon / Neon Ring Emblem */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative mb-6"
              >
                {/* Luminous Neon Ring Aura (Cyan, Blue, Green, Yellow, Red) */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 via-emerald-400 via-yellow-400 to-red-500 blur-md opacity-70 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 p-0.5 animate-spin" style={{ animationDuration: "12s" }}>
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-cyan-300" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shining Dynamic Greeting Headline */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-1 mb-4 text-left"
              >
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500 animate-gradient-x py-1">
                  Hi {displayName}, how can I help you today?
                </h1>
              </motion.div>

              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl text-left">
                Ask any question, solve math equations, write code, explore research papers, or brainstorm new ideas.
              </p>

              {/* Suggestion Chips Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {HERO_SUGGESTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => sendMessageWithPrompt(item.prompt)}
                      className="group flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-cyan-500/50 shadow-sm hover:shadow-md text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.prompt}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE CHAT MESSAGES */}
          {messages.map((message, idx) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              isLast={idx === messages.length - 1 && message.role === "assistant" && !isStreaming}
              onFollowUp={handleFollowUp}
              previousUserMessage={idx > 0 && messages[idx - 1]?.role === "user" ? messages[idx - 1].content : undefined}
            />
          ))}

          {/* Streaming Assistant Response */}
          {isStreaming && streamingContent && (
            <StreamingMessage content={streamingContent} isStreaming={true} />
          )}

          {/* Thinking Stepper Indicator */}
          {isLoading && !streamingContent && messages[messages.length - 1]?.role === "user" && (
            <ThinkingStepper isLoading={isLoading} showUpgradePrompt={!isPro} />
          )}

          {/* Chat End Actions: Export & Share at the bottom of the conversation */}
          {messages.length > 0 && !isLoading && !isStreaming && (
            <div className="flex items-center justify-between pt-6 border-t border-border/60">
              <div className="flex items-center gap-2">
                <ExportChat 
                  messages={messages} 
                  conversationTitle={currentConversationData?.title || "Know Deep Chat"} 
                />
                {currentConversation && (
                  <ShareConversation
                    conversationId={currentConversation}
                    conversationTitle={currentConversationData?.title || "Know Deep Chat"}
                  />
                )}
              </div>

              {speechSynthesisSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={cn("text-xs rounded-xl h-8 gap-1.5", voiceEnabled ? "text-cyan-500 font-semibold" : "text-muted-foreground")}
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Voice Audio {voiceEnabled ? "On" : "Off"}</span>
                </Button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM FIXED / DOCKED EXPANSIVE SMART TEXTING DOCK */}
        <div className="fixed bottom-14 left-0 right-0 z-20 px-3 sm:px-6 pb-2 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            
            {/* Attachment Preview Chip Row */}
            <AttachmentPreview 
              items={attachments} 
              onRemove={(i) => setAttachments((a) => a.filter((_, x) => x !== i))} 
            />

            {/* Smart Expansive Input Box Capsule */}
            <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-2xl p-2 sm:p-3 transition-all focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20">
              
              {/* Spacious Multi-line Text Area */}
              <div className="px-2 pt-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(Math.max(el.scrollHeight, 48), 148)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Know Deep Anything..."
                  rows={1}
                  className="w-full bg-transparent border-0 focus:outline-none focus-visible:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 resize-none min-h-[48px] max-h-[148px] leading-relaxed py-1"
                  disabled={isLoading}
                />
              </div>

              {/* Integrated Bottom Toolbar (Model, Attachment, Dictation Mic, Send, Live Mode) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-1">
                
                {/* Left Controls: Model Selector & Attachments */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <PremiumModelSelector value={selectedModel} onChange={setSelectedModel} />
                  <AttachmentButton onAttach={(a) => setAttachments((prev) => [...prev, a])} disabled={isLoading} />
                  
                  <label className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-muted/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={temporaryChat}
                      onChange={(e) => setTemporaryChat(e.target.checked)}
                      className="rounded border-border text-cyan-500 focus:ring-0"
                    />
                    <span>Temporary Chat</span>
                  </label>
                </div>

                {/* Right Controls: Voice Mic, Send/Stop & Live Mode */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  
                  {/* Voice Recognition Dictation Mic */}
                  {speechRecognitionSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleVoiceInput}
                      className={cn(
                        "w-9 h-9 rounded-xl transition-all",
                        isListening
                          ? "bg-rose-500/20 text-rose-500 animate-pulse ring-2 ring-rose-500/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title={isListening ? "Listening... click to stop" : "Speak to text"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}

                  {/* Send / Stop Streaming Button */}
                  {isStreaming ? (
                    <Button
                      type="button"
                      onClick={cancelStream}
                      size="icon"
                      variant="destructive"
                      className="w-9 h-9 rounded-xl shadow-md"
                      title="Stop generating"
                    >
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() && attachments.length === 0 || isLoading}
                      size="icon"
                      className={cn(
                        "w-9 h-9 rounded-xl transition-all shadow-md",
                        input.trim()
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25 scale-100 active:scale-95"
                          : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      )}
                      title="Send message"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  {/* Live Mode Launcher Avatar */}
                  <button
                    type="button"
                    onClick={() => navigate("/live-mode")}
                    className="relative w-9 h-9 rounded-full overflow-hidden shadow-md hover:scale-105 active:scale-95 transition-transform flex-shrink-0 ml-1 border border-cyan-500/30"
                    title="Start Live Voice Mode"
                  >
                    <img src={liveChatIcon} alt="Live Mode" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 rounded-full bg-cyan-400/25 animate-ping opacity-30" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
