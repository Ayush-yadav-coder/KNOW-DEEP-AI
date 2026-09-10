import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Phone, 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX,
  X,
  Sparkles,
  Loader2,
  ScreenShare,
  ScreenShareOff,
  SwitchCamera,
  Minimize2,
  ScanSearch
} from "lucide-react";
import CircleToSearch from "@/components/CircleToSearch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import chatLogo from "@/assets/chat-logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LiveMode() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [circleMode, setCircleMode] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported 
  } = useSpeechRecognition();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Auto-launch listening session (no auto camera — user toggles it)
  useEffect(() => {
    if (!authLoading && user && !isActive) {
      setIsActive(true);
      if (speechSupported && !isMuted) startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Release ALL media on unmount (camera + screen share + mic + audio)
  useEffect(() => {
    return () => {
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
      try { screenStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
      try { stopListening(); } catch {}
      try { audioRef.current?.pause(); } catch {}
      streamRef.current = null;
      screenStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Update transcript (only when it actually changes to a new utterance)
  useEffect(() => {
    if (transcript && transcript !== currentTranscript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  // Process transcript when user stops talking
  const lastProcessedRef = useRef<string>("");
  useEffect(() => {
    if (!isListening && currentTranscript && isActive && !isMuted && !isProcessing) {
      if (currentTranscript === lastProcessedRef.current) return;
      lastProcessedRef.current = currentTranscript;
      const toSend = currentTranscript;
      setCurrentTranscript("");
      processMessage(toSend);
    }
  }, [isListening, currentTranscript, isActive, isMuted, isProcessing]);

  const startCamera = async (useFront: boolean = true) => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: useFront ? "user" : "environment" },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const toggleCamera = () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      startCamera(useFrontCamera);
    }
  };

  const flipCamera = async () => {
    const newUseFront = !useFrontCamera;
    setUseFrontCamera(newUseFront);
    if (cameraEnabled) {
      await startCamera(newUseFront);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      screenStreamRef.current = stream;
      if (screenRef.current) {
        screenRef.current.srcObject = stream;
      }
      setScreenShareEnabled(true);

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: "Could not share screen",
        variant: "destructive",
      });
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (screenRef.current) {
      screenRef.current.srcObject = null;
    }
    setScreenShareEnabled(false);
  };

  const toggleScreenShare = () => {
    if (screenShareEnabled) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const startSession = () => {
    setIsActive(true);
    if (speechSupported && !isMuted) {
      startListening();
    }
  };

  const endSession = () => {
    setIsActive(false);
    stopListening();
    stopCamera();
    stopScreenShare();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSpeaking(false);
    setMessages([]);
    setIsMinimized(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (isActive) startListening();
    } else {
      setIsMuted(true);
      stopListening();
    }
  };

  const processMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in");
      }

      // Get AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multi-llm-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantContent = data.content;

      const assistantMessage: Message = { role: "assistant", content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);

      // Convert to speech using ElevenLabs
      await speakResponse(assistantContent, session.access_token);

    } catch (error) {
      console.error("Live mode error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Resume listening after response
      if (isActive && !isMuted && speechSupported) {
        startListening();
      }
    }
  };

  const speakResponse = async (text: string, token: string) => {
    try {
      setIsSpeaking(true);
      
      const cleanText = text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 3000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: cleanText }),
        }
      );

      if (!response.ok) throw new Error("TTS failed");

      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        // Resume listening after AI finishes speaking
        if (isActive && !isMuted && speechSupported) {
          startListening();
        }
      };
      
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Minimized floating view
  if (isMinimized && isActive) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <div 
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer shadow-2xl glow-primary"
          onClick={() => setIsMinimized(false)}
        >
          <Sparkles className={cn(
            "w-8 h-8 text-white",
            isSpeaking && "animate-pulse"
          )} />
        </div>
        <div className="absolute -top-1 -right-1">
          <div className={cn(
            "w-4 h-4 rounded-full",
            isListening ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: isActive 
              ? "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle, hsl(var(--muted) / 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: isSpeaking || isListening ? Infinity : 0 }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            endSession();
            navigate(-1);
          }}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Live Header */}
        {isActive && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        )}

        {/* Minimize Button */}
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Fullscreen camera background (when enabled) */}
      {cameraEnabled && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />
        </div>
      )}

      {/* Screen Share PIP */}
      {screenShareEnabled && (
        <div className="absolute top-16 right-4 z-40">
          <div className="relative w-40 h-24 md:w-52 md:h-32 rounded-2xl overflow-hidden border-2 border-green-500/50 shadow-lg">
            <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
          </div>
        </div>
      )}

      {/* Circle-to-Search overlay */}
      <CircleToSearch
        videoRef={videoRef}
        enabled={circleMode && cameraEnabled}
        onFollowUp={(q) => {
          setCircleMode(false);
          processMessage(q);
        }}
      />

      {/* Flip camera FAB */}
      {cameraEnabled && !circleMode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={flipCamera}
          className="absolute top-16 right-4 z-30 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full"
        >
          <SwitchCamera className="w-5 h-5 text-white" />
        </Button>
      )}


      {/* Main Content — never block pointer events globally; child controls manage their own */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        {/* AI Orb — hidden when camera is active so the live feed is 100% clear */}
        {!cameraEnabled && (
          <motion.div
            className={cn(
              "w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center relative mb-8 overflow-hidden",
              isActive ? "glow-primary" : ""
            )}
            style={{
              boxShadow: isActive 
                ? "0 0 60px hsl(var(--primary) / 0.5), 0 0 120px hsl(var(--secondary) / 0.3)"
                : "none",
            }}
            animate={{
              scale: isSpeaking ? [1, 1.05, 1] : isListening ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: isSpeaking || isListening ? Infinity : 0 }}
          >
            <img 
              src={chatLogo} 
              alt="AI Assistant" 
              className="w-full h-full object-cover"
            />
            
            {/* Listening indicator */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary"
                animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, transparent 60%, hsl(var(--primary) / 0.3) 100%)",
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        )}

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {!isActive && "Live Mode"}
            {isActive && isProcessing && "Processing..."}
            {isActive && isSpeaking && "Speaking..."}
            {isActive && isListening && !isProcessing && "Listening..."}
            {isActive && !isListening && !isProcessing && !isSpeaking && isMuted && "Muted"}
            {isActive && !isListening && !isProcessing && !isSpeaking && !isMuted && "Ready"}
          </h1>
          
          {/* Current transcript */}
          {currentTranscript && (
            <p className="text-muted-foreground max-w-md mx-auto">
              "{currentTranscript}"
            </p>
          )}
          
          {/* Last message */}
          {!currentTranscript && messages.length > 0 && (
            <p className="text-muted-foreground max-w-md mx-auto line-clamp-2">
              {messages[messages.length - 1].content.slice(0, 100)}...
            </p>
          )}
        </motion.div>

        {/* Navigation Bar Controls — explicit pointer-events-auto + raised z so they always remain tappable, even while Circle-to-Search canvas is active above the camera */}
        <div className="relative z-50 pointer-events-auto flex items-center gap-3 md:gap-4">
          {/* Camera Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            disabled={!isActive}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full",
              cameraEnabled && "bg-primary/20 border-primary/50"
            )}
            title="Toggle camera"
          >
            {cameraEnabled ? <CameraOff className="w-5 h-5 md:w-6 md:h-6" /> : <Camera className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>

          {/* Circle to Search */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCircleMode((v) => !v)}
            disabled={!cameraEnabled}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full",
              circleMode && "bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            )}
            title="Circle to Search"
          >
            <ScanSearch className={cn("w-5 h-5 md:w-6 md:h-6", circleMode && "text-cyan-300")} />
          </Button>

          {/* Screen Share Button */}
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleScreenShare}
              disabled={!isActive}
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-full",
                screenShareEnabled && "bg-green-500/20 border-green-500/50"
              )}
              title="Share screen"
            >
              {screenShareEnabled ? <ScreenShareOff className="w-5 h-5 md:w-6 md:h-6" /> : <ScreenShare className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>
          )}

          {/* Mute Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            disabled={!isActive}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full",
              isMuted && "bg-destructive/20 border-destructive/50"
            )}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>

          {/* Start/End Call Button */}
          <Button
            onClick={isActive ? endSession : startSession}
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-full text-white",
              isActive 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
            )}
            title={isActive ? "End call" : "Start call"}
          >
            <X className={cn("w-6 h-6 md:w-8 md:h-8", !isActive && "hidden")} />
            <Phone className={cn("w-6 h-6 md:w-8 md:h-8", isActive && "hidden")} />
          </Button>
        </div>

        {/* Hint text */}
        {!isActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-muted-foreground text-center max-w-sm"
          >
            {isMobile 
              ? "Start a live conversation with voice and camera. AI can see what you show it!" 
              : "Start a real-time voice conversation with AI. Share your screen for help with apps."}
          </motion.p>
        )}
      </div>
    </div>
  );
}
