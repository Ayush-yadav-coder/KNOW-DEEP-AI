import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore, type ChatConversation } from "@/store/useAppStore";
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
  ArrowRight,
  Edit2,
  Trash2,
  Check,
  Pin,
  Compass,
  Radio,
  X,
  Presentation,
  Video,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  CloudSun,
  Newspaper,
  Trophy,
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
import { VoiceWaveformBar } from "@/components/chat/VoiceWaveformBar";
import { queueOfflineAction } from "@/lib/offlineSync";
import { detectUserIntent, type IntentMatchResult } from "@/lib/intentDispatcher";
import { IntentRedirectBanner } from "@/components/chat/IntentRedirectBanner";
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

import { WhatsNewGuideModal } from "@/components/chat/WhatsNewGuideModal";

export default function Chat() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    preferences,
    updatePreferences,
    currentConversationId,
    setCurrentConversationId,
    toggleSidebar,
    conversations,
    addConversation,
    updateConversation,
    removeConversation,
    pinConversation,
    fetchConversations,
  } = useAppStore();
  
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
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [pausedMessageId, setPausedMessageId] = useState<string | null>(null);

  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    return localStorage.getItem("knowdeep_v3_single_clean_tour_v1") !== "true";
  });

  const handleCloseGuide = () => {
    localStorage.setItem("knowdeep_v3_single_clean_tour_v1", "true");
    setIsGuideOpen(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [temporaryChat, setTemporaryChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("kd-2-fast");

  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSentQueryRef = useRef(false);

  const { isListening, transcript, error: speechError, startListening, stopListening, isSupported: speechRecognitionSupported } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: speechSynthesisSupported } = useSpeechSynthesis();

  const [searchParams] = useSearchParams();
  const urlConvId = searchParams.get("id");
  const rawQuery = searchParams.get("q");

  // Intelligent Intent Dispatcher state for Redirecting Project
  const [activeIntentMatch, setActiveIntentMatch] = useState<IntentMatchResult | null>(null);
  const [dismissedIntentKey, setDismissedIntentKey] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length > 5) {
      const match = detectUserIntent(trimmed);
      if (match.intent !== "general_chat" && match.confidence >= 0.85) {
        if (dismissedIntentKey !== trimmed) {
          setActiveIntentMatch(match);
          return;
        }
      }
    }
    setActiveIntentMatch(null);
  }, [input, dismissedIntentKey]);

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

  // Resolve user display name with persistent priority
  const getResolvedDisplayName = useCallback((): string => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("knowdeep_display_name") ||
        localStorage.getItem("knowdeep_user_name");
      if (stored && stored.trim() && stored.trim().toLowerCase() !== "explorer") {
        return stored.trim();
      }
    }
    const userMetaName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name;
    if (userMetaName && userMetaName.trim() && userMetaName.trim().toLowerCase() !== "explorer") {
      return userMetaName.trim();
    }
    if (
      preferences?.displayName &&
      preferences.displayName.trim() &&
      preferences.displayName.trim().toLowerCase() !== "explorer"
    ) {
      return preferences.displayName.trim();
    }
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("knowdeep_display_name") ||
        localStorage.getItem("knowdeep_user_name");
      if (stored && stored.trim()) return stored.trim();
    }
    return preferences?.displayName || "Ayush";
  }, [preferences.displayName, user]);

  const [currentDisplayName, setCurrentDisplayName] = useState<string>(getResolvedDisplayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState<string>(getResolvedDisplayName());

  // Listen for name updates across app
  useEffect(() => {
    const handleNameSync = (e?: any) => {
      const updated = e?.detail?.name || getResolvedDisplayName();
      setCurrentDisplayName(updated);
      setNameInputValue(updated);
    };

    window.addEventListener("knowdeep_name_updated", handleNameSync);
    window.addEventListener("storage", handleNameSync);
    return () => {
      window.removeEventListener("knowdeep_name_updated", handleNameSync);
      window.removeEventListener("storage", handleNameSync);
    };
  }, [getResolvedDisplayName]);

  // Sync if preferences or user changes
  useEffect(() => {
    const resolved = getResolvedDisplayName();
    setCurrentDisplayName(resolved);
    setNameInputValue(resolved);
  }, [preferences.displayName, user, getResolvedDisplayName]);

  const handleSaveName = async (nameToSave?: string) => {
    const finalName = (nameToSave !== undefined ? nameToSave : nameInputValue).trim();
    if (!finalName) {
      setIsEditingName(false);
      return;
    }

    setCurrentDisplayName(finalName);
    setIsEditingName(false);

    try {
      localStorage.setItem("knowdeep_display_name", finalName);
      localStorage.setItem("knowdeep_user_name", finalName);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    updatePreferences({ displayName: finalName });

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { display_name: finalName },
        });
        await supabase
          .from("profiles")
          .upsert(
            {
              user_id: user.id,
              display_name: finalName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch (err) {
        console.warn("Could not sync name to Supabase:", err);
      }
    }

    window.dispatchEvent(
      new CustomEvent("knowdeep_name_updated", { detail: { name: finalName } })
    );

    toast({
      title: "Name Saved",
      description: `Hello, ${finalName}! Your name is remembered across your workspace.`,
    });
  };
  
  useEffect(() => {
    if (urlConvId) {
      if (urlConvId !== currentConversation) {
        setCurrentConversation(urlConvId);
        setCurrentConversationId(urlConvId);
      }
    } else {
      // If URL does not have an id parameter, cleanly reset conversation and clear thread
      if (currentConversation !== null) {
        setCurrentConversation(null);
        setCurrentConversationId(null);
        setMessages([]);
        setBreadcrumbs([]);
      }
    }
  }, [urlConvId]);

  useEffect(() => {
    if (!urlConvId && !currentConversationId && currentConversation !== null) {
      setCurrentConversation(null);
      setMessages([]);
      setBreadcrumbs([]);
    }
  }, [currentConversationId, urlConvId, currentConversation]);

  useEffect(() => {
    if (speechError) {
      toast({
        title: "Voice Input Notice",
        description: speechError,
        variant: "destructive",
      });
    }
  }, [speechError]);

  useEffect(() => {
    if (!authLoading && !user) {
      const isGuest = localStorage.getItem("guest_mode") === "true";
      if (!isGuest) navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchConversations();
  }, [user, fetchConversations]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const prevListeningRef = useRef(false);

  useEffect(() => {
    if (prevListeningRef.current && !isListening) {
      if (transcript && transcript.trim()) {
        setInput((prev) => {
          const base = prev ? prev.trim() : "";
          const added = transcript.trim();
          if (base.endsWith(added)) return base;
          return base ? base + " " + added : added;
        });
      }
    }
    prevListeningRef.current = isListening;
  }, [isListening, transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (conversationId: string) => {
    setPausedMessageId(null);
    
    // Check instant local storage cache first so live chat transitions render with zero delay
    const savedLocal = localStorage.getItem(`guest_msgs_${conversationId}`);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // ignore
      }
    }

    if (!user) {
      if (!savedLocal) setMessages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const typedMessages: Message[] = data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        }));
        setMessages(typedMessages);
      }
    } catch (error) {
      console.warn("Notice loading messages:", error);
    }
  };

  async function createNewConversation() {
    cancelStream();
    setCurrentConversation(null);
    setCurrentConversationId(null);
    setMessages([]);
    setBreadcrumbs([]);
    setInput("");
    setPausedMessageId(null);
    navigate("/chat", { replace: true });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
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
      
      // Mark the last user message as paused/retryable
      const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
      if (lastUserMsg) {
        setPausedMessageId(lastUserMsg.id);
      }
    }
  };

  const handleRetryMessage = async (promptText: string, assistantMessageId?: string) => {
    cancelStream();
    setPausedMessageId(null);
    
    // 1. Remove the previous assistant answer so it is completely gone from the screen
    let targetPrompt = promptText;
    setMessages((prev) => {
      let filtered = [...prev];
      if (assistantMessageId) {
        const idx = filtered.findIndex((m) => m.id === assistantMessageId);
        if (idx !== -1) {
          // If previous user message exists before this assistant message, use its content
          if (idx > 0 && filtered[idx - 1]?.role === "user") {
            targetPrompt = filtered[idx - 1].content;
          }
          filtered = filtered.filter((_, i) => i !== idx);
          return filtered;
        }
      }
      // Fallback: find matching user prompt and remove any following assistant answer
      const lastMatchingIdx = [...filtered].reverse().findIndex((m) => m.role === "user" && m.content === promptText);
      if (lastMatchingIdx !== -1) {
        const actualIdx = filtered.length - 1 - lastMatchingIdx;
        filtered = filtered.slice(0, actualIdx + 1);
      }
      return filtered;
    });

    // 2. Clean from database / local guest storage if persisted
    if (assistantMessageId) {
      if (user) {
        supabase.from("chat_messages").delete().eq("id", assistantMessageId).then(() => {});
      }
      if (currentConversation) {
        try {
          const key = `guest_msgs_${currentConversation}`;
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = existing.filter((m: any) => m.id !== assistantMessageId);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch { /* ignore */ }
      }
    }

    setIsLoading(true);
    setStreamingContent("");
    setTimeout(() => {
      handleSendMessage(targetPrompt || promptText, true);
    }, 60);
  };

  const handleStartNewChatButton = async () => {
    cancelStream();
    const queryToSend = input.trim();
    if (!queryToSend) {
      // If user has no input text, directly open a fresh new chat
      await createNewConversation();
      return;
    }

    const newId = crypto.randomUUID();
    const initialTitle = queryToSend.length > 35 ? queryToSend.slice(0, 35) + "..." : queryToSend;
    const newConv: ChatConversation = {
      id: newId,
      title: initialTitle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addConversation(newConv);

    if (user) {
      try {
        await supabase
          .from("chat_conversations")
          .insert({ id: newId, user_id: user.id, title: newConv.title });
      } catch (e) {
        console.warn("Could not save conversation to DB:", e);
      }
    }

    setCurrentConversation(newId);
    setCurrentConversationId(newId);
    setMessages([]);
    setBreadcrumbs([]);
    setInput("");
    setPausedMessageId(null);
    navigate(`/chat?id=${newId}`, { replace: true });
    
    // Wait a tiny bit for state update and then send the message
    setTimeout(() => {
      handleSendMessage(queryToSend);
    }, 80);
  };

  const sendMessageWithPrompt = (promptText: string) => {
    setInput(promptText);
    setTimeout(() => {
      handleSendMessage(promptText);
    }, 50);
  };

  const handleSendMessage = async (customText?: string, isRetry = false) => {
    const queryText = (customText !== undefined ? customText : input).trim();
    if ((!queryText && attachments.length === 0) || isLoading) return;
    if (user && !(await dailyLimit.tryConsume())) return;

    setIsLoading(true);
    setStreamingContent("");
    setPausedMessageId(null);
    let conversationId = currentConversation;
    let currentTurnUserMessageId: string | null = null;

    if (!conversationId) {
      conversationId = crypto.randomUUID();
      const initialTitle = queryText.length > 35 ? queryText.slice(0, 35) + "..." : queryText;
      const newConv: ChatConversation = {
        id: conversationId,
        title: initialTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentConversation(conversationId);
      setCurrentConversationId(conversationId);
      addConversation(newConv);

      if (user) {
        try {
          await supabase
            .from("chat_conversations")
            .insert({ id: conversationId, user_id: user.id, title: initialTitle });
        } catch (e) {
          console.warn("Could not save conversation to DB:", e);
        }
      }
    }

    let payloadMessages: Message[] = [];

    if (!isRetry) {
      // Check if prompt matches a specialized AI Studio intent (image, video, doc, code, presentation, enhancer, etc.)
      const intentMatch = detectUserIntent(queryText);
      if (intentMatch.intent !== "general_chat" && intentMatch.confidence >= 0.90) {
        toast({
          title: `Launching ${intentMatch.studioName}`,
          description: `Automatically redirecting you to live ${intentMatch.headline} preview workspace...`,
        });
        setIsLoading(false);
        navigate(intentMatch.targetRoute);
        return;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: queryText,
        created_at: new Date().toISOString(),
      };
      currentTurnUserMessageId = userMessage.id;

      if (messages.length === 0 || breadcrumbs.length === 0) {
        const shortLabel = queryText.length > 30 ? queryText.slice(0, 30) + "..." : queryText;
        setBreadcrumbs([{ id: crypto.randomUUID(), label: shortLabel, query: queryText }]);
      }

      setMessages((prev) => [...prev, userMessage]);
      payloadMessages = [...messages, userMessage];
      setInput("");
      setAttachments([]);

      // Background Sync Offline Handling:
      // If the browser is offline, save action to LocalStorage and queue for background sync
      if (!navigator.onLine) {
        queueOfflineAction({
          type: "CHAT_MESSAGE",
          payload: {
            conversationId,
            role: "user",
            content: queryText,
            userId: user?.id,
            timestamp: new Date().toISOString(),
          },
          metadata: {
            conversationId,
            summary: queryText.slice(0, 60),
            title: "Offline Chat Prompt",
          },
        });

        const offlineNoticeMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚡ **Offline Mode Active**: Your message has been safely saved in **LocalStorage** and queued for automatic background sync. Once your internet connection is restored, it will automatically push and sync with the backend.`,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, offlineNoticeMessage]);
        const existingOfflineMsgs = JSON.parse(
          localStorage.getItem(`guest_msgs_${conversationId}`) || "[]"
        );
        localStorage.setItem(
          `guest_msgs_${conversationId}`,
          JSON.stringify([...existingOfflineMsgs, userMessage, offlineNoticeMessage])
        );

        toast({
          title: "Action Saved in LocalStorage",
          description: "Your prompt is queued offline and will automatically push once reconnected.",
        });

        setIsLoading(false);
        return;
      }

      if (user) {
        try {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "user",
            content: queryText,
          });
        } catch (e) {
          console.warn("Could not save user message to DB, queueing for background sync:", e);
          queueOfflineAction({
            type: "CHAT_MESSAGE",
            payload: {
              conversationId,
              role: "user",
              content: queryText,
              userId: user.id,
            },
            metadata: {
              conversationId,
              summary: queryText.slice(0, 60),
            },
          });
        }
      } else {
        const existing = JSON.parse(localStorage.getItem(`guest_msgs_${conversationId}`) || "[]");
        localStorage.setItem(`guest_msgs_${conversationId}`, JSON.stringify([...existing, userMessage]));
      }

      if (user) {
        extractFromMessage(queryText);
      }
    } else {
      // In retry mode, use current messages which already includes the user prompt without the removed answer
      payloadMessages = messages;
      if (payloadMessages.length === 0 || payloadMessages[payloadMessages.length - 1]?.role !== "user") {
        payloadMessages = [...messages, {
          id: crypto.randomUUID(),
          role: "user",
          content: queryText,
          created_at: new Date().toISOString(),
        }];
        setMessages(payloadMessages);
      }
    }

    // AI title recognition for new chats
    if (messages.length === 0) {
      const targetConvId = conversationId;
      (async () => {
        try {
          const res = await fetch("/api/chat/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: queryText }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.title) {
              const aiTitle = data.title.trim();
              updateConversation(targetConvId, { title: aiTitle });
              if (user) {
                await supabase
                  .from("chat_conversations")
                  .update({ title: aiTitle })
                  .eq("id", targetConvId);
              }
            }
          }
        } catch (e) {
          console.warn("Could not generate AI title:", e);
        }
      })();
    }

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsStreaming(true);

      let mappedModel = "gemini-3.8-flash";
      const activeModelKey = selectedModel || preferences.defaultModel || "kd-2-fast";
      if (activeModelKey === "kd-2-fast" || activeModelKey === "gemini-3.5-flash" || activeModelKey === "gemini-3.8-flash") {
        mappedModel = "gemini-3.8-flash";
      } else if (activeModelKey === "kd-2.5-pro" || activeModelKey === "gemini-flash-latest") {
        mappedModel = "gemini-flash-latest";
      } else if (activeModelKey === "kd-2-pro" || activeModelKey === "gemini-3.1-pro-preview") {
        mappedModel = "gemini-3.1-pro-preview";
      } else {
        mappedModel = activeModelKey;
      }

      const requestPayload = {
        messages: payloadMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: mappedModel,
      };

      const streamHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      try {
        const storedKey = localStorage.getItem("knowdeep_gemini_api_key");
        if (storedKey?.trim()) {
          streamHeaders["x-gemini-api-key"] = storedKey.trim();
        }
      } catch {}

      let response: Response;
      try {
        response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: streamHeaders,
          body: JSON.stringify(requestPayload),
          signal: controller?.signal,
        });
      } catch (localErr) {
        if (controller?.signal?.aborted || (localErr as Error)?.name === "AbortError") {
          throw localErr;
        }
        const { data: { session: streamSession } } = await supabase.auth.getSession();
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${streamSession?.access_token || ""}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            ...streamHeaders,
          },
          body: JSON.stringify(requestPayload),
          signal: controller?.signal,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.message ||
          `Server returned status ${response.status}. Please check your API keys or Vercel Environment Variables.`
        );
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
      if (currentTurnUserMessageId) {
        setPausedMessageId(currentTurnUserMessageId);
      }
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

  useEffect(() => {
    if (rawQuery && !autoSentQueryRef.current) {
      autoSentQueryRef.current = true;
      let decoded = rawQuery;
      try {
        decoded = decodeURIComponent(rawQuery);
      } catch {
        decoded = rawQuery;
      }
      setTimeout(() => {
        handleSendMessage(decoded);
      }, 300);
    }
  }, [rawQuery]);

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleRenameChat = async () => {
    if (!currentConversation || !editTitleValue.trim()) return;
    const trimmed = editTitleValue.trim();
    setIsEditingTitle(false);
    
    updateConversation(currentConversation, { title: trimmed });
    if (!navigator.onLine) {
      queueOfflineAction({
        type: "UPDATE_CONVERSATION",
        payload: { id: currentConversation, title: trimmed },
        metadata: { title: "Rename Conversation", summary: `New title: "${trimmed}"` },
      });
    } else if (user) {
      try {
        await supabase.from("chat_conversations").update({ title: trimmed }).eq("id", currentConversation);
      } catch (e) {
        console.warn("Could not rename in DB:", e);
        queueOfflineAction({
          type: "UPDATE_CONVERSATION",
          payload: { id: currentConversation, title: trimmed },
          metadata: { title: "Rename Conversation", summary: `New title: "${trimmed}"` },
        });
      }
    }
    toast({
      title: "Title Updated",
      description: `Renamed to "${trimmed}"`,
    });
  };

  const handlePinChat = () => {
    if (!currentConversation) return;
    const currentConv = conversations.find(c => c.id === currentConversation);
    const newPinned = !currentConv?.pinned;
    pinConversation(currentConversation, newPinned);
    toast({
      title: newPinned ? "Chat Pinned" : "Chat Unpinned",
      description: newPinned ? "Chat will stay at the top of history." : "Chat unpinned.",
    });
  };

  const handleDeleteChat = async () => {
    if (!currentConversation) return;
    const convId = currentConversation;
    removeConversation(convId);
    if (!navigator.onLine) {
      queueOfflineAction({
        type: "DELETE_CONVERSATION",
        payload: { id: convId },
        metadata: { title: "Delete Conversation", summary: `ID: ${convId}` },
      });
    } else if (user) {
      try {
        await supabase.from("chat_conversations").delete().eq("id", convId);
      } catch (e) {
        console.warn("Could not delete from DB:", e);
        queueOfflineAction({
          type: "DELETE_CONVERSATION",
          payload: { id: convId },
          metadata: { title: "Delete Conversation", summary: `ID: ${convId}` },
        });
      }
    }
    setCurrentConversation(null);
    setCurrentConversationId(null);
    setMessages([]);
    navigate("/chat");
    toast({
      title: "Chat Deleted",
      description: "The conversation was deleted.",
    });
  };

  const currentConversationData = conversations.find((c) => c.id === currentConversation);
  const isOnThread = Boolean(currentConversation || urlConvId);

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
        {currentConversationData && messages.length > 0 && (
          <div className="w-full max-w-4xl mx-auto px-4 pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-white/90 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm text-slate-800 dark:text-slate-200">
              <div className="flex-1 flex items-center gap-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="text" 
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameChat() }}
                      className="bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full max-w-xs"
                      autoFocus
                    />
                    <button onClick={handleRenameChat} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-emerald-500">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h2 
                    onClick={() => {
                      setEditTitleValue(currentConversationData.title || "");
                      setIsEditingTitle(true);
                    }}
                    className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-2 max-w-[200px] sm:max-w-md cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    title="Click to rename"
                  >
                    <span>{currentConversationData.title || "Chat session"}</span>
                    {currentConversationData.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </h2>
                )}
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                {!isEditingTitle && (
                  <button 
                    onClick={() => {
                      setEditTitleValue(currentConversationData.title || "");
                      setIsEditingTitle(true);
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    title="Rename Chat"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handlePinChat}
                  className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors ${currentConversationData.pinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  title={currentConversationData.pinned ? "Unpin Chat" : "Pin Chat to Top"}
                >
                  <Pin className={`w-4 h-4 ${currentConversationData.pinned ? 'fill-amber-500' : ''}`} />
                </button>
                <button 
                  onClick={handleDeleteChat}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-500/30 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  title="View What's New & Full Feature Guide"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span className="hidden sm:inline">What's New</span>
                </button>

                <button 
                  onClick={createNewConversation}
                  className="p-1.5 hover:bg-cyan-50 dark:hover:bg-slate-800 rounded-md text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors ml-1"
                  title="Start a New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
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
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-64 space-y-6">
          
          {/* WELCOME / EMPTY STATE: Radiant Shining Hero Screen matching user prompt & image */}
          {messages.length === 0 && (
            <div className="flex flex-col items-start justify-center pt-8 sm:pt-14 pb-8 max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Know Deep AI Workspace</span>
                </motion.div>

                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="View What's New and Take the Live Tour"
                >
                  <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                  <span>What's New & Guided Tour</span>
                </button>
              </div>

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

              {/* Shining Dynamic Greeting Headline with Interactive Name Editor */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-1 mb-4 text-left"
              >
                {isEditingName ? (
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    <span className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                      Hello
                    </span>
                    <div className="inline-flex items-center gap-1.5 bg-card/90 backdrop-blur border-2 border-cyan-500 rounded-2xl px-3 py-1.5 shadow-xl">
                      <input
                        type="text"
                        value={nameInputValue}
                        onChange={(e) => setNameInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setIsEditingName(false);
                        }}
                        placeholder="Your name"
                        autoFocus
                        className="bg-transparent text-2xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 focus:outline-none max-w-[200px] sm:max-w-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveName()}
                        className="p-1.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-sm cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                      , how can I help you today?
                    </span>
                  </div>
                ) : (
                  <div className="group/greeting inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500 animate-gradient-x py-1">
                      Hello{" "}
                      <span
                        onClick={() => {
                          setNameInputValue(currentDisplayName);
                          setIsEditingName(true);
                        }}
                        className="underline decoration-cyan-500/40 hover:decoration-cyan-500 cursor-pointer decoration-2 underline-offset-4 transition-all"
                        title="Click to change your name"
                      >
                        {currentDisplayName}
                      </span>
                      , how can I help you today?
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInputValue(currentDisplayName);
                        setIsEditingName(true);
                      }}
                      className="opacity-70 group-hover/greeting:opacity-100 hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Change your name"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Name</span>
                    </button>
                  </div>
                )}
              </motion.div>

              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl text-left">
                Ask any question, solve math equations, write code, explore research papers, or launch specialized studios.
              </p>

              {/* KnowDeep Autonomous Studios & Launchers (Direct Open & Trigger) */}
              <div className="w-full mb-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>KnowDeep Specialized AI Studios</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">1-Click Launch</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/presentation-studio")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-fuchsia-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 group-hover:bg-fuchsia-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                      Slide Architect
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">106+ Styles PPT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/video-studio")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-red-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Video className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-red-600 dark:group-hover:text-red-400">
                      Director AI
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Timeline & Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/image-generator")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-purple-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      Vision Studio
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Art & Design</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/code-studio")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-cyan-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                      Code Studio
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Apps & Sandbox</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/document-studio")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-emerald-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Doc Architect
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Synthesis & PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/weather")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-sky-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <CloudSun className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      Weather Hub
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Live Radar & AQI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/news")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-amber-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      NewsWire
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Live Global Feed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/sports")}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-card/70 hover:bg-white dark:hover:bg-card border border-border/80 hover:border-emerald-500/50 flex flex-col items-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Sports Arena
                    </span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">Scores & Telemetry</span>
                  </button>
                </div>
              </div>

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
          {messages.map((message, idx) => {
            // Check if this user prompt received a completed assistant answer
            const subsequentAssistantMessage = idx < messages.length - 1 && messages[idx + 1]?.role === "assistant" ? messages[idx + 1] : null;
            const hasSuccessfulAnswer = Boolean(
              subsequentAssistantMessage &&
              subsequentAssistantMessage.content &&
              subsequentAssistantMessage.content.trim().length > 0
            );

            // Do not show retry if the AI is currently streaming or loading an answer for this prompt
            const isCurrentlyResponding = (idx === messages.length - 1 && (isLoading || isStreaming));

            // Only allow retry / show paused state if this prompt failed, was cancelled/paused, or has no answer and is not currently generating
            const isFailedOrPaused = message.id === pausedMessageId || (!hasSuccessfulAnswer && !isCurrentlyResponding && idx === messages.length - 1);
            const canRetry = message.role === "user" && isFailedOrPaused && !hasSuccessfulAnswer;

            return (
              <ChatMessage 
                key={message.id} 
                message={message}
                isLast={idx === messages.length - 1 && message.role === "assistant" && !isStreaming}
                onFollowUp={handleFollowUp}
                previousUserMessage={idx > 0 && messages[idx - 1]?.role === "user" ? messages[idx - 1].content : undefined}
                onRetry={handleRetryMessage}
                canRetry={canRetry}
              />
            );
          })}

          {/* Streaming Assistant Response */}
          {isStreaming && streamingContent && (
            <StreamingMessage content={streamingContent} isStreaming={true} />
          )}

          {/* Thinking Stepper Indicator */}
          {isLoading && !streamingContent && messages[messages.length - 1]?.role === "user" && (
            <ThinkingStepper
              isLoading={isLoading}
              showUpgradePrompt={!isPro}
              userPrompt={messages[messages.length - 1]?.content}
            />
          )}

          {/* Chat End Actions: Export & Share at the bottom of the conversation */}
          {messages.length > 0 && !isLoading && !isStreaming && (
            <div className="pt-6 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
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

              {/* Small disclaimer below export option */}
              <p className="text-[11px] text-muted-foreground/60 select-none">
                Know Deep is an AI and can make mistakes.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM FIXED / DOCKED EXPANSIVE SMART TEXTING DOCK */}
        <div className="fixed bottom-28 left-0 right-0 z-20 px-3 sm:px-6 pb-2 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            
            {/* Intelligent Intent Dispatcher / Redirecting Banner */}
            {activeIntentMatch && (
              <IntentRedirectBanner
                intentMatch={activeIntentMatch}
                onDismiss={() => {
                  setDismissedIntentKey(input.trim());
                  setActiveIntentMatch(null);
                }}
                onStayInChat={() => {
                  setDismissedIntentKey(input.trim());
                  setActiveIntentMatch(null);
                }}
              />
            )}

            {/* Attachment Preview Chip Row */}
            <AttachmentPreview 
              items={attachments} 
              onRemove={(i) => setAttachments((a) => a.filter((_, x) => x !== i))} 
            />

            {/* Smart Expansive Input Box Capsule */}
            <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-2xl p-2 sm:p-3 transition-all focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20">
              
              {/* Spacious Multi-line Text Area or Voice Speaking Waveform Animation */}
              <div className="px-2 pt-1 min-h-[48px] flex items-center w-full">
                {isListening ? (
                  <VoiceWaveformBar
                    isListening={isListening}
                    transcript={transcript}
                    onStop={stopListening}
                  />
                ) : (
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
                )}
              </div>

              {/* Integrated Bottom Toolbar (Model, Attachment, Dictation Mic, Send, Live Mode) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-1">
                
                {/* Left Controls: Model Selector, Attachments, and Start a New Chat */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <PremiumModelSelector value={selectedModel} onChange={setSelectedModel} />
                  <AttachmentButton onAttach={(a) => setAttachments((prev) => [...prev, a])} disabled={isLoading} />
                  
                  <Button
                    type="button"
                    onClick={handleStartNewChatButton}
                    variant={isOnThread ? "default" : "outline"}
                    className={cn(
                      "h-9 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all select-none",
                      isOnThread
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-400 shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/40 font-bold"
                        : "border-cyan-500/25 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                    )}
                    title={isOnThread ? "You are on a thread. Click to leave and start a new chat" : "Start a brand new chat"}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Start a New Chat</span>
                  </Button>

                  <label className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-muted/60 transition-colors">
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
                      disabled={(!input.trim() && attachments.length === 0) || isLoading}
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



                  {/* Live Chat Launcher with Provided Logo */}
                  <button
                    type="button"
                    onClick={() => navigate("/live-mode")}
                    className="relative w-9 h-9 rounded-full overflow-hidden shadow-md hover:scale-105 active:scale-95 transition-transform flex-shrink-0 ml-1 border border-cyan-500/40 ring-1 ring-cyan-500/20"
                    title="Start Live Voice & Vision Mode"
                  >
                    <img src={liveChatIcon} alt="Live Mode" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-30 pointer-events-none" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* What's New & Complete Platform Guide Modal */}
        <WhatsNewGuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />
      </div>
    </AppLayout>
  );
}
