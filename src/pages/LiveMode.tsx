import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Phone,
  Camera,
  CameraOff,
  Volume2,
  X,
  Loader2,
  ScreenShare,
  ScreenShareOff,
  SwitchCamera,
  ScanSearch,
  Eye,
  MessageSquare,
  Send,
  Pause,
  Play,
  Subtitles,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import CircleToSearch from "@/components/CircleToSearch";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useCameraDevice } from "@/hooks/useCameraDevice";
import { speakText, stopSpeaking, unlockAudioPlayback } from "@/lib/ttsSpeaker";
import { useAppStore, ChatConversation } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  hasVisualAttachment?: boolean;
}

export default function LiveMode() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addConversation, setCurrentConversationId, preferences } = useAppStore();

  // Dedicated thread management for this live chat session
  const [threadId, setThreadId] = useState<string>(() => crypto.randomUUID());
  const threadIdRef = useRef(threadId);
  const threadCreatedRef = useRef(false);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  // Hardware camera sensing: available for all devices with camera capabilities
  const { hasCamera, multipleCameras } = useCameraDevice();
  const canUseCamera = hasCamera === true || (hasCamera === null && typeof navigator !== "undefined" && !!navigator?.mediaDevices?.getUserMedia);

  // Session state
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [circleMode, setCircleMode] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenFrameData, setFrozenFrameData] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Captions & UI drawers state
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [freqBars, setFreqBars] = useState<number[]>(new Array(24).fill(8));

  // Media Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const canvasCaptureRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio Context Refs for visualizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Auto-submit ref to avoid double processing
  const isSubmittingRef = useRef(false);

  // Forward declaration of processMessage ref to connect with useSpeechRecognition
  const processMessageRef = useRef<((text: string, forceSnapshot?: string) => Promise<void>) | null>(null);

  // Handle auto-submit when silence is detected (~1.2s of silence after speech)
  const handleSpeechEnd = useCallback((spokenText: string) => {
    if (!spokenText.trim() || isSubmittingRef.current) return;
    if (processMessageRef.current) {
      processMessageRef.current(spokenText.trim());
    }
  }, []);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    submitTranscriptNow,
    isSupported: speechSupported,
  } = useSpeechRecognition({
    onSpeechEnd: handleSpeechEnd,
    silenceDelayMs: 650,
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Unlock audio on initial user interaction
  useEffect(() => {
    const handleUnlock = () => {
      unlockAudioPlayback();
    };
    window.addEventListener("click", handleUnlock, { once: true });
    window.addEventListener("touchstart", handleUnlock, { once: true });
    return () => {
      window.removeEventListener("click", handleUnlock);
      window.removeEventListener("touchstart", handleUnlock);
    };
  }, []);

  // Session timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  // Auto-launch session on entry
  useEffect(() => {
    if (!authLoading && user && !isActive) {
      setIsActive(true);
      if (speechSupported && !isMuted) {
        startListening();
      }
    }
  }, [authLoading, user, isActive, speechSupported, isMuted, startListening]);

  // Sync current speech transcript for live real-time captions
  useEffect(() => {
    if (transcript !== currentTranscript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript, currentTranscript]);

  // Real-time Web Audio API frequency analysis for the 24-bar visualizer
  useEffect(() => {
    if (!isActive || isMuted) {
      setFreqBars(new Array(24).fill(6));
      return;
    }

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animId: number | null = null;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((micStream) => {
        micStreamRef.current = micStream;
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        source = audioCtx.createMediaStreamSource(micStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateFrequency = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          const sampledBars: number[] = [];
          for (let i = 0; i < 24; i++) {
            const rawVal = dataArray[i] || 0;
            const height = Math.max(6, Math.round((rawVal / 255) * 56));
            sampledBars.push(height);
          }
          setFreqBars(sampledBars);

          animId = requestAnimationFrame(updateFrequency);
        };

        animId = requestAnimationFrame(updateFrequency);
      })
      .catch((err) => {
        console.warn("Microphone analyser notice:", err);
      });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      try {
        source?.disconnect();
        audioCtx?.close();
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("Cleanup audio error", e);
      }
    };
  }, [isActive, isMuted]);

  // Clean up all hardware streams and speech on unmount
  useEffect(() => {
    return () => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        stopListening();
        stopSpeaking();
      } catch (e) {
        console.warn("Media teardown notice", e);
      }
      streamRef.current = null;
      screenStreamRef.current = null;
    };
  }, [stopListening]);

  // Snaps the current video frame as base64 JPEG (only on supported devices with camera on)
  const snapCurrentFrame = useCallback((): string | null => {
    if (!canUseCamera || !cameraEnabled) return null;
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    if (!canvasCaptureRef.current) {
      canvasCaptureRef.current = document.createElement("canvas");
    }
    const canvas = canvasCaptureRef.current;
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, [canUseCamera, cameraEnabled]);

  // GUARANTEED VOICE OUTPUT: Speaks the text aloud via Web Speech API & audio synthesis
  const speakResponse = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;
      try {
        setIsSpeaking(true);
        // Temporarily pause microphone listening while speaking so the AI doesn't record itself
        stopListening();

        // Unlock audio context in case it was suspended
        unlockAudioPlayback();

        await speakText(text, {
          voice: preferences.voice || "Kore",
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          rate: 1.02,
          pitch: 1.0,
        });
      } catch (err) {
        console.error("Speech playback error:", err);
      } finally {
        setIsSpeaking(false);
        // Only resume listening after speech has fully concluded
        if (isActive && !isMuted && speechSupported) {
          startListening();
        }
      }
    },
    [isActive, isMuted, speechSupported, startListening, stopListening]
  );

  // SAVE LIVE EXCHANGE TO THREAD (Persists to Chat threads, database, and localStorage)
  const saveExchangeToThread = useCallback(
    async (userPrompt: string, assistantAnswer: string, hasVisualAttachment = false) => {
      try {
        // Format how the user said it in live chat as requested:
        // "also describe how the user is saying in the live chat. All the things that are discussed with the live chat will also be answered and also be shown in the chat."
        const formattedUserPrompt = hasVisualAttachment
          ? `🎙️ **Live Voice** *(Camera Frame Attached)*:\n\n${userPrompt.trim()}`
          : `🎙️ **Live Voice**:\n\n${userPrompt.trim()}`;

        // 1. If this live session's thread has not been created in store/DB yet, create it now
        if (!threadCreatedRef.current) {
          threadCreatedRef.current = true;
          const cleanSnippet = userPrompt.trim();
          const snippet = cleanSnippet.length > 32 ? cleanSnippet.slice(0, 32) + "..." : cleanSnippet;
          const threadTitle = `🎙️ Live: ${snippet}`;

          const newConv: ChatConversation = {
            id: threadIdRef.current,
            title: threadTitle,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          addConversation(newConv);
          setCurrentConversationId(threadIdRef.current);

          if (user?.id) {
            supabase
              .from("chat_conversations")
              .insert({
                id: threadIdRef.current,
                user_id: user.id,
                title: threadTitle,
              })
              .then(({ error }) => {
                if (error) console.warn("Live thread insert notice:", error.message);
              });
          }
        }

        const now = new Date().toISOString();
        const userMsg = {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: formattedUserPrompt,
          created_at: now,
        };

        const assistantMsg = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: assistantAnswer,
          created_at: new Date(Date.now() + 10).toISOString(),
        };

        // Cache locally for instant 0ms hydration when navigating to /chat
        const existingLocal = JSON.parse(localStorage.getItem(`guest_msgs_${threadIdRef.current}`) || "[]");
        localStorage.setItem(
          `guest_msgs_${threadIdRef.current}`,
          JSON.stringify([...existingLocal, userMsg, assistantMsg])
        );

        // Persist to Supabase if authenticated
        if (user?.id) {
          supabase
            .from("chat_messages")
            .insert([
              {
                id: userMsg.id,
                conversation_id: threadIdRef.current,
                user_id: user.id,
                role: "user",
                content: formattedUserPrompt,
              },
              {
                id: assistantMsg.id,
                conversation_id: threadIdRef.current,
                user_id: user.id,
                role: "assistant",
                content: assistantAnswer,
              },
            ])
            .then(({ error }) => {
              if (error) console.warn("Live messages insert notice:", error.message);
            });
        }
      } catch (err) {
        console.warn("Could not save exchange to live thread:", err);
      }
    },
    [addConversation, setCurrentConversationId, user]
  );

  // MULTIMODAL MESSAGE PROCESSING (Instant Voice + Optional Vision)
  const processMessage = useCallback(
    async (text: string, forceSnapshot?: string) => {
      if (!text.trim() || isProcessing || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsProcessing(true);
      // Immediately stop mic listening while processing and speaking
      stopListening();
      resetTranscript();
      setCurrentTranscript("");

      const frameSnapshot = forceSnapshot || (canUseCamera && cameraEnabled ? snapCurrentFrame() : null);

      const userMessage: Message = {
        role: "user",
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hasVisualAttachment: !!frameSnapshot,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        let assistantContent = "";

        // Send to Express Multimodal Live Endpoint (/api/live/chat)
        try {
          const liveRes = await fetch("/api/live/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.content,
              })),
              image: frameSnapshot,
            }),
          });

          if (liveRes.ok) {
            const liveData = await liveRes.json();
            assistantContent = liveData.content || liveData.text || "";
          }
        } catch (err) {
          console.warn("Express live chat endpoint attempt:", err);
        }

        // Fallback to Supabase multi-llm-chat if needed
        if (!assistantContent) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.access_token) {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multi-llm-chat`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  messages: [...messages, userMessage].map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              assistantContent = data.content;
            }
          }
        }

        if (!assistantContent) {
          assistantContent =
            "I'm listening and connected. What would you like to explore next?";
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        // Turn off processing immediately so the caption on top displays the answer right away!
        setIsProcessing(false);

        // Save this live exchange to the chat thread so it's preserved in AI Chat and history
        await saveExchangeToThread(text, assistantContent, !!frameSnapshot);

        // Speak the assistant response out loud immediately
        await speakResponse(assistantContent);
      } catch (error: unknown) {
        console.error("Live chat error:", error);
        toast({
          title: "Notice",
          description: (error as Error)?.message || "Speech synthesis interrupted.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        isSubmittingRef.current = false;
        // Resume listening if active
        if (isActive && !isMuted && speechSupported && !isSpeaking) {
          startListening();
        }
      }
    },
    [canUseCamera, cameraEnabled, isMuted, isProcessing, isSpeaking, isActive, messages, resetTranscript, saveExchangeToThread, snapCurrentFrame, speakResponse, speechSupported, startListening, stopListening, toast]
  );

  // Connect processMessage to ref so the silence callback always has the latest function
  useEffect(() => {
    processMessageRef.current = processMessage;
  }, [processMessage]);

  // Handle initial prompt from navigation (e.g. CircleToSearch follow-up)
  useEffect(() => {
    const initialPrompt = (location.state as { initialPrompt?: string })?.initialPrompt;
    if (initialPrompt && isActive && messages.length === 0) {
      processMessage(initialPrompt);
    }
  }, [isActive, location.state, messages.length, processMessage]);

  // CAMERA CONTROLS (Only for mobile/handheld devices)
  const startCamera = async (useFront = false) => {
    if (!canUseCamera) return;
    try {
      setCameraPermissionDenied(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useFront ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      setIsFrozen(false);
      setFrozenFrameData(null);
      setCameraPermissionDenied(false);
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string } | undefined;
      const isDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        (err?.message && String(err.message).toLowerCase().includes("permission denied"));

      if (isDenied) {
        setCameraPermissionDenied(true);
        setCameraEnabled(false);
        toast({
          title: "Camera Permission Denied",
          description: "Click the lock icon in your browser address bar to grant access, or continue in Voice mode.",
        });
      } else {
        setCameraEnabled(false);
        toast({
          title: "Camera Unavailable",
          description: "Could not initialize video feed.",
          variant: "destructive",
        });
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
    setCircleMode(false);
    setIsFrozen(false);
    setFrozenFrameData(null);
  };

  const toggleCamera = () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      startCamera(useFrontCamera);
    }
  };

  const flipCamera = () => {
    const nextFacing = !useFrontCamera;
    setUseFrontCamera(nextFacing);
    if (cameraEnabled) {
      startCamera(nextFacing);
    }
  };

  const toggleFreezeFrame = () => {
    if (!cameraEnabled) return;
    if (isFrozen) {
      setIsFrozen(false);
      setFrozenFrameData(null);
    } else {
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 220);
      const snap = snapCurrentFrame();
      if (snap) {
        setFrozenFrameData(snap);
        setIsFrozen(true);
      }
    }
  };

  // SCREEN SHARE
  const toggleScreenShare = async () => {
    if (screenShareEnabled) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (screenRef.current) {
        screenRef.current.srcObject = null;
      }
      setScreenShareEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (screenRef.current) {
          screenRef.current.srcObject = stream;
        }
        setScreenShareEnabled(true);
        stream.getVideoTracks()[0].onended = () => {
          setScreenShareEnabled(false);
        };
      } catch {
        toast({
          title: "Screen Share Notice",
          description: "Screen share request cancelled.",
        });
      }
    }
  };

  // SESSION RENEWAL & CONTROLS
  const startSession = () => {
    unlockAudioPlayback();
    setIsActive(true);
    if (speechSupported && !isMuted) {
      startListening();
    }
  };

  // Renew session: restarts session cleanly inside Live Chat without kicking user out, while archiving previous conversation
  const renewSession = () => {
    stopSpeaking();
    stopListening();
    resetTranscript();
    setCurrentTranscript("");

    const previousThreadId = threadIdRef.current;
    const hasExistingMessages = messages.length > 0;

    // Archive current session to thread if there were exchanges
    if (hasExistingMessages) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const titleSnippet = firstUserMsg ? firstUserMsg.content.slice(0, 32) : "Live Conversation";
      const threadTitle = `🎙️ Live: ${titleSnippet}`;

      const stateConvs = useAppStore.getState().conversations;
      if (!stateConvs.find((c) => c.id === previousThreadId)) {
        addConversation({
          id: previousThreadId,
          title: threadTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const formatted = messages.map((m, idx) => ({
        id: `live_${previousThreadId}_${idx}`,
        role: m.role,
        content: m.role === "user" ? `🎙️ **Live Voice**:\n\n${m.content}` : m.content,
        created_at: new Date().toISOString(),
      }));
      localStorage.setItem(`guest_msgs_${previousThreadId}`, JSON.stringify(formatted));
    }

    setSessionSeconds(0);
    setMessages([]);
    setIsProcessing(false);
    setIsSpeaking(false);
    setIsActive(true);
    unlockAudioPlayback();

    // Generate a fresh new thread ID for the renewed session
    const nextThreadId = crypto.randomUUID();
    setThreadId(nextThreadId);
    threadIdRef.current = nextThreadId;
    threadCreatedRef.current = false;

    setTimeout(() => {
      if (speechSupported && !isMuted) {
        startListening();
      }
    }, 200);

    toast({
      title: "New Session Started",
      description: hasExistingMessages
        ? "Previous conversation was saved to chat history. Ready for your next question!"
        : "Started a fresh live voice conversation. Speak whenever you are ready!",
      action: hasExistingMessages ? (
        <ToastAction
          altText="View in Chat"
          onClick={() => {
            setCurrentConversationId(previousThreadId);
            navigate(`/chat?id=${previousThreadId}`);
          }}
        >
          View in Chat →
        </ToastAction>
      ) : undefined,
    });
  };

  // Open regular AI Chat page with full session history transferred to the active thread
  const handleExitLiveChat = () => {
    stopSpeaking();
    stopListening();

    const activeId = threadIdRef.current;
    if (messages.length > 0 || threadCreatedRef.current) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const titleSnippet = firstUserMsg ? firstUserMsg.content.slice(0, 32) : "Live Conversation";
      const threadTitle = `🎙️ Live: ${titleSnippet}`;

      const stateConvs = useAppStore.getState().conversations;
      if (!stateConvs.find((c) => c.id === activeId)) {
        addConversation({
          id: activeId,
          title: threadTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (messages.length > 0) {
        const formatted = messages.map((m, idx) => ({
          id: `live_${activeId}_${idx}`,
          role: m.role,
          content: m.role === "user" ? `🎙️ **Live Voice**:\n\n${m.content}` : m.content,
          created_at: new Date().toISOString(),
        }));
        localStorage.setItem(`guest_msgs_${activeId}`, JSON.stringify(formatted));
      }

      setCurrentConversationId(activeId);
      navigate(`/chat?id=${activeId}`);
    } else {
      navigate("/chat");
    }
  };

  const toggleMute = () => {
    unlockAudioPlayback();
    if (isMuted) {
      setIsMuted(false);
      if (isActive && !isSpeaking) startListening();
    } else {
      setIsMuted(true);
      stopListening();
    }
  };

  // INSTANT AI SIGHT / VISION SCAN (Mobile with Camera only)
  const handleTriggerAISight = async () => {
    if (!cameraEnabled) return;
    const snap = snapCurrentFrame();
    if (!snap) {
      toast({ title: "Visual Scan", description: "Camera frame not ready yet." });
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/live/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: snap,
          prompt:
            "Describe clearly what you see in front of the camera, read any writing or symbols, and state key observations.",
        }),
      });

      if (!res.ok) throw new Error("Vision perception failed");
      const data = await res.json();
      const sightText = data.content || data.text || "I see the subject in frame.";

      const userNote: Message = {
        role: "user",
        content: "What do you see through the camera?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hasVisualAttachment: true,
      };
      const assistantNote: Message = {
        role: "assistant",
        content: sightText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userNote, assistantNote]);

      // Save vision exchange into the live thread
      await saveExchangeToThread("What do you see through the camera?", sightText, true);

      await speakResponse(sightText);
    } catch (err: unknown) {
      console.error("Vision trigger error:", err);
      toast({
        title: "Vision Scan Error",
        description: (err as Error)?.message || "Scan failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format session time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Last messages for live captioning
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content;
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")?.content;

  return (
    <div className="fixed inset-0 z-50 bg-[#06080e] text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* TOP STATUS TELEMETRY DOCK */}
      <div className="relative z-40 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
        {/* Left: Session Telemetry & Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>{isActive ? formatTime(sessionSeconds) : "STANDBY"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-medium">Live Voice</span>
            <span>•</span>
            <span
              className={
                isSpeaking
                  ? "text-cyan-300 font-semibold animate-pulse"
                  : isProcessing
                  ? "text-amber-400"
                  : isListening
                  ? "text-emerald-400"
                  : "text-slate-400"
              }
            >
              {isSpeaking
                ? "AI SPEAKING ALOUD"
                : isProcessing
                ? "THINKING..."
                : isListening
                ? "LISTENING"
                : "READY"}
            </span>
          </div>
        </div>

        {/* Center: Device Sensing (Camera Optical Hub vs Audio Interface) */}
        <div className="hidden md:flex items-center gap-2">
          {canUseCamera ? (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <Camera className="w-3 h-3" />
              Camera Optical Hub
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-cyan-400" />
              Audio Interface
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Captions Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCaptions((v) => !v)}
            className={cn(
              "h-8 px-2.5 rounded-xl border text-xs transition-colors",
              showCaptions
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
            )}
            title="Toggle Live Spoken Captions"
          >
            <Subtitles className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Captions</span>
          </Button>

          {/* Transcript History Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranscriptDrawer((v) => !v)}
            className={cn(
              "h-8 px-2.5 rounded-xl border text-xs transition-colors",
              showTranscriptDrawer
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white"
            )}
            title="View Full Session Transcript"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            <span className="hidden sm:inline">Transcript</span>
            {messages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
                {messages.length}
              </span>
            )}
          </Button>

          {/* Switch to Regular AI Chat Page */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitLiveChat}
            className="h-8 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs hidden sm:flex items-center gap-1"
            title="Open AI Chat Page with Session History"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open AI Chat</span>
          </Button>

          {/* Close Live Mode */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitLiveChat}
            className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Exit Live Mode"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* TOP LIVE CAPTIONS OVERLAY (Shows user speech & AI spoken response prominently) */}
      <AnimatePresence>
        {showCaptions && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative z-30 mx-4 sm:mx-8 mt-2.5 max-w-2xl sm:mx-auto w-full pointer-events-auto"
          >
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-2">
              {/* User Live Spoken Speech */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 uppercase tracking-wider shrink-0 mt-0.5">
                    You
                  </div>
                  <div className="text-xs sm:text-sm text-cyan-100 font-medium leading-relaxed min-w-0">
                    {currentTranscript ? (
                      <span className="text-cyan-300">
                        "{currentTranscript}"
                        <span className="inline-block w-1.5 h-3 ml-1 bg-cyan-400 animate-pulse align-middle" />
                      </span>
                    ) : lastUserMessage ? (
                      <span>"{lastUserMessage}"</span>
                    ) : (
                      <span className="text-slate-500 italic">
                        {isListening ? "Listening... Speak naturally" : "Microphone paused"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instant Send / Process button when user speaks */}
                {currentTranscript && (
                  <Button
                    size="sm"
                    onClick={() => submitTranscriptNow()}
                    className="h-6 px-2 text-[11px] rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-sm flex items-center gap-1"
                    title="Process your spoken inquiry immediately"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </Button>
                )}
              </div>

              {/* AI Spoken Answer & Speaking Indicator */}
              <div className="flex items-start justify-between gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 uppercase tracking-wider shrink-0 mt-0.5 flex items-center gap-1">
                    {isSpeaking && <Volume2 className="w-3 h-3 animate-pulse text-emerald-400" />}
                    AI Answer
                  </div>
                  <div className="min-w-0">
                    {isProcessing ? (
                      <p className="text-xs text-amber-300 flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Thinking and formulating voice response...
                      </p>
                    ) : lastAssistantMessage ? (
                      <div className="space-y-1">
                        {isSpeaking && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Speaking aloud now...
                          </div>
                        )}
                        <p
                          className={cn(
                            "text-xs sm:text-sm leading-relaxed",
                            isSpeaking ? "text-white font-medium" : "text-slate-300"
                          )}
                        >
                          {lastAssistantMessage}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Responses are spoken aloud and displayed live here.
                      </p>
                    )}
                  </div>
                </div>

                {/* Replay voice button */}
                {lastAssistantMessage && !isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakResponse(lastAssistantMessage)}
                    className="h-7 px-2 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:text-white hover:bg-slate-800 shrink-0"
                    title="Replay Voice Response"
                  >
                    <Volume2 className="w-3 h-3 mr-1 text-cyan-400" />
                    <span>Replay</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMERA PERMISSION DENIED BANNER (Mobile only) */}
      <AnimatePresence>
        {cameraPermissionDenied && canUseCamera && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="absolute top-14 left-4 right-4 z-50 max-w-xl mx-auto p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <CameraOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-amber-200">Camera Access Blocked</p>
                <p className="text-slate-400 text-[11px] leading-tight mt-0.5">
                  Click the camera icon in your browser address bar to grant access, or continue speaking in Voice mode.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startCamera(useFrontCamera)}
                className="h-7 text-[11px] border-amber-500/40 text-amber-300 hover:bg-amber-500/20 rounded-xl px-2.5"
              >
                Try Again
              </Button>
              <button
                type="button"
                onClick={() => setCameraPermissionDenied(false)}
                className="w-7 h-7 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER STAGE: VIDEO CANVAS OR AUDIO NEURAL VISUALIZER */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Shutter flash animation on capture */}
        <AnimatePresence>
          {shutterFlash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* CAMERA FEED (When enabled on mobile devices) */}
        {canUseCamera && cameraEnabled && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {isFrozen && frozenFrameData ? (
              <img
                src={frozenFrameData}
                alt="Frozen video frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Sci-Fi Optical AR Reticle & Targeting Brackets */}
            <div className="absolute inset-4 sm:inset-10 pointer-events-none border border-cyan-500/20 rounded-3xl overflow-hidden">
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.8)] opacity-60 pointer-events-none"
              />

              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl shadow-[0_0_10px_rgba(0,240,255,0.4)]" />

              <div className="absolute top-4 left-4 pointer-events-auto flex items-center gap-2">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs">
                  <Eye className={cn("w-3.5 h-3.5", isProcessing ? "text-amber-400 animate-spin" : "text-cyan-400")} />
                  <span className="font-mono text-[11px] text-cyan-200">
                    {isProcessing ? "AI PERCEIVING SCENE..." : "SIGHT ONLINE"}
                  </span>
                </div>

                {/* Circle to Search quick toggle inside camera view */}
                <Button
                  size="sm"
                  onClick={() => setCircleMode((v) => !v)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all",
                    circleMode
                      ? "bg-cyan-500 text-white border border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                      : "bg-black/75 hover:bg-black/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400"
                  )}
                  title="Draw or circle anything on screen to analyze"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                  <span>{circleMode ? "Exit Circle Search" : "Circle to Search"}</span>
                </Button>
              </div>

              {/* Camera flip & freeze in top right */}
              <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
                {multipleCameras && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={flipCamera}
                    className="w-8 h-8 rounded-full bg-black/70 border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-black/90"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={toggleFreezeFrame}
                  className={cn(
                    "w-8 h-8 rounded-full border-cyan-500/30 text-xs",
                    isFrozen ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-black/70 text-cyan-300 hover:bg-black/90"
                  )}
                  title={isFrozen ? "Unfreeze camera feed" : "Freeze frame snapshot"}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN SHARE STREAM (When active) */}
        {screenShareEnabled && (
          <video
            ref={screenRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black z-0"
          />
        )}

        {/* CIRCLE TO SEARCH OVERLAY (Only when camera is enabled on mobile) */}
        {canUseCamera && cameraEnabled && (
          <CircleToSearch
            videoRef={videoRef}
            enabled={circleMode}
            onClose={() => setCircleMode(false)}
            onFollowUp={(question) => {
              processMessage(question);
            }}
          />
        )}

        {/* DYNAMIC NEURAL ACOUSTIC VISUALIZER (Main Voice View) */}
        {(!canUseCamera || !cameraEnabled) && (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
            {/* Geometric Acoustic Neural Core */}
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center mb-6">
              {/* Concentric ambient ripples */}
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.25, 1] : isListening ? [1, 1.1, 1] : 1,
                  opacity: isSpeaking ? [0.3, 0.6, 0.3] : [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-indigo-600/20 blur-3xl"
              />

              {/* Orbital Ring 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-cyan-500/20 border-dashed"
              />

              {/* Orbital Ring 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute inset-10 rounded-full border border-indigo-500/20"
              />

              {/* Center Neural Acoustic Core */}
              <motion.div
                animate={{
                  scale: isSpeaking
                    ? [1, 1.08, 1]
                    : isListening
                    ? [1, 1.04, 1]
                    : 1,
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col items-center justify-center p-4 overflow-hidden backdrop-blur-2xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25)_0,transparent_70%)]" />

                <div className="relative z-10 w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-2">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  ) : isSpeaking ? (
                    <Volume2 className="w-6 h-6 text-cyan-400 animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6 text-cyan-400" />
                  )}
                </div>

                <span className="relative z-10 text-[10px] font-mono tracking-widest uppercase text-cyan-200">
                  {isProcessing ? "THINKING" : isSpeaking ? "SPEAKING" : isListening ? "LISTENING" : "READY"}
                </span>
              </motion.div>
            </div>

            {/* REAL-TIME 24-BAR SYMMETRIC SOUNDWAVE EQUALIZER */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-14 mb-4">
              {freqBars.map((height, i) => (
                <div
                  key={i}
                  style={{
                    height: `${height}px`,
                    transition: "height 80ms ease",
                  }}
                  className={cn(
                    "w-1 sm:w-1.5 rounded-full transition-all duration-75",
                    isSpeaking
                      ? "bg-gradient-to-t from-cyan-500 to-indigo-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                      : isListening
                      ? "bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-slate-800"
                  )}
                />
              ))}
            </div>

            {/* Executive Status Heading */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              {!isActive && "Live Audio Session"}
              {isActive && isProcessing && "Thinking and reasoning..."}
              {isActive && isSpeaking && "Speaking out loud..."}
              {isActive && isListening && !isProcessing && !isSpeaking && "Listening... Speak naturally"}
              {isActive && !isListening && !isProcessing && !isSpeaking && isMuted && "Microphone Muted"}
              {isActive && !isListening && !isProcessing && !isSpeaking && !isMuted && "Audio Ready"}
            </h1>

            <p className="text-xs text-slate-400 font-mono">
              Natural conversational voice • Fast turnaround with zero delay
            </p>
          </div>
        )}

        {/* FLOATING CAMERA CONTROL DOCK (When Camera Is On on Mobile) */}
        {canUseCamera && cameraEnabled && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {multipleCameras && (
              <Button
                size="sm"
                variant="secondary"
                onClick={flipCamera}
                className="h-9 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white text-xs"
                title="Flip Camera Lens"
              >
                <SwitchCamera className="w-4 h-4 mr-1.5" />
                Flip
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFreezeFrame}
              className={cn(
                "h-9 rounded-xl backdrop-blur-md border text-xs",
                isFrozen
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white"
              )}
              title={isFrozen ? "Unfreeze live video" : "Freeze current frame"}
            >
              {isFrozen ? <Play className="w-4 h-4 mr-1.5" /> : <Pause className="w-4 h-4 mr-1.5" />}
              {isFrozen ? "Unfreeze" : "Freeze"}
            </Button>

            {/* Instant AI Sight Trigger */}
            <Button
              size="sm"
              onClick={handleTriggerAISight}
              disabled={isProcessing}
              className="h-9 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-xs font-semibold"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              AI Sight
            </Button>
          </div>
        )}
      </div>

      {/* BOTTOM PROFESSIONAL CONTROL DOCK */}
      <div className="relative z-40 px-4 sm:px-8 py-3.5 border-t border-cyan-500/20 bg-slate-950/85 backdrop-blur-2xl flex items-center justify-between gap-4">
        {/* Left Side: Camera tools & Circle to Search (Only on devices that have cameras) */}
        <div className="flex items-center gap-2">
          {canUseCamera && (
            <>
              {/* Camera on/off */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                disabled={!isActive}
                className={cn(
                  "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all",
                  cameraEnabled
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                )}
                title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {cameraEnabled ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </Button>

              {/* Circle to Search (Only in Live Chat on camera-equipped devices) */}
              <Button
                variant="outline"
                onClick={async () => {
                  if (!cameraEnabled) {
                    await startCamera(useFrontCamera);
                  }
                  setCircleMode((v) => !v);
                }}
                disabled={!isActive}
                className={cn(
                  "h-11 sm:h-12 px-3 sm:px-3.5 rounded-2xl transition-all border text-xs font-semibold flex items-center gap-1.5",
                  circleMode
                    ? "bg-cyan-500 text-white border-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.5)]"
                    : "bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10"
                )}
                title={cameraEnabled ? "Circle to Search in Camera Feed" : "Start Camera & Circle to Search"}
              >
                <ScanSearch className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <span className="hidden sm:inline">Circle to Search</span>
              </Button>
            </>
          )}

          {/* Screen Share */}
          {typeof navigator !== "undefined" && !!navigator?.mediaDevices?.getDisplayMedia && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleScreenShare}
              disabled={!isActive}
              className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all",
                screenShareEnabled
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              )}
              title="Share Screen"
            >
              {screenShareEnabled ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
            </Button>
          )}
          {/* Live Transcript Button (Opens transcript in the below) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscriptDrawer((v) => !v)}
            className={cn(
              "h-11 sm:h-12 px-3 rounded-2xl border text-xs flex items-center gap-1.5 transition-all",
              showTranscriptDrawer
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
            )}
            title="Toggle Live Transcript Drawer in the below"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline font-medium">Transcript</span>
            {messages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/25 text-cyan-300 text-[10px] font-mono">
                {messages.length}
              </span>
            )}
          </Button>

          {/* Captions Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCaptions((v) => !v)}
            className={cn(
              "h-11 sm:h-12 px-3 rounded-2xl border text-xs flex items-center gap-1.5 transition-all",
              showCaptions
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            )}
            title="Toggle Spoken Captions Overlay"
          >
            <Subtitles className="w-4 h-4" />
            <span className="hidden md:inline font-medium">Captions</span>
          </Button>
        </div>

        {/* Center: Primary Audio & Call Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mute / Unmute Mic */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            disabled={!isActive}
            className={cn(
              "w-11 h-11 sm:w-14 sm:h-14 rounded-2xl transition-all",
              isMuted
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-slate-900/90 border-slate-800 text-slate-200 hover:text-white"
            )}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />}
          </Button>

          {/* End Session Button
              Clicking "End Session" automatically restarts a clean session in Live Chat without removing it, while saving previous history */}
          <Button
            onClick={isActive ? renewSession : startSession}
            className={cn(
              "h-11 sm:h-14 px-4 sm:px-8 rounded-2xl font-bold tracking-wide transition-all shadow-lg flex items-center gap-2",
              isActive
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40"
            )}
            title={isActive ? "End session and renew with fresh live session" : "Start Live Voice"}
          >
            {isActive ? (
              <>
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">End Session</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Start Live</span>
              </>
            )}
          </Button>

          {/* Open in AI Chat Button
              Transfers to regular AI Chat thread with all live stored chats */}
          <Button
            variant="outline"
            onClick={handleExitLiveChat}
            className="h-11 sm:h-14 px-3 sm:px-4 rounded-2xl bg-slate-900/90 border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
            title="Open in AI Chat thread with full conversation history"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open in AI Chat</span>
          </Button>
        </div>

        {/* Right Side: Quick Text Inquiry Bar */}
        <div className="flex items-center gap-2 max-w-xs w-full justify-end">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) {
                const q = textInput.trim();
                setTextInput("");
                processMessage(q);
              }
            }}
            className="flex items-center gap-1.5 w-full max-w-[240px]"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type inquiry..."
              disabled={isProcessing}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!textInput.trim() || isProcessing}
              className="w-10 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
              title="Send Inquiry Immediately"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* SLIDE-UP TRANSCRIPT DRAWER (Shows in the below as requested) */}
      <AnimatePresence>
        {showTranscriptDrawer && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] sm:max-h-[50vh] bg-slate-950/98 border-t border-cyan-500/30 backdrop-blur-2xl flex flex-col p-4 sm:p-6 shadow-[0_-12px_45px_rgba(0,0,0,0.85)]"
          >
            {/* Transcript Header with Open in AI Chat option */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Live Conversation Transcript</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  {messages.length} utterances
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Button to Open in Regular AI Chat Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExitLiveChat}
                  className="h-8 px-3 rounded-xl border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 text-xs flex items-center gap-1.5"
                  title="Open in AI Chat Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in AI Chat</span>
                </Button>

                {/* Close transcript button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTranscriptDrawer(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No utterances logged yet. Speak into your microphone or type in the inquiry box.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-2xl text-xs space-y-1.5 shadow-sm transition-all max-w-2xl",
                      m.role === "user"
                        ? "bg-cyan-950/50 border border-cyan-500/40 text-cyan-100 ml-auto shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "bg-slate-900/90 border border-slate-800 text-slate-200 mr-auto"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 gap-4">
                      <span className="font-semibold uppercase tracking-wider text-cyan-400">
                        {m.role === "user" ? "You" : "Know Deep AI Voice"}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    {m.hasVisualAttachment && (
                      <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        <Eye className="w-3 h-3" /> Camera Frame Attached
                      </div>
                    )}
                    <p className="leading-relaxed">{m.content}</p>

                    {m.role === "assistant" && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => speakResponse(m.content)}
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Volume2 className="w-3 h-3" /> Speak this
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Transcript footer */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{messages.length} messages in this live session</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                className="h-7 text-[11px] text-slate-400 hover:text-rose-400"
              >
                Clear Transcript
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
