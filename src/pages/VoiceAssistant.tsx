import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { ThinkingStepper } from "@/components/ThinkingStepper";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";
import { AttachmentButton, AttachmentPreview, type Attachment } from "@/components/AttachmentButton";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const dailyLimit = useDailyMessageLimit();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(10));
  const [textInput, setTextInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Browser TTS fallback
  const speakWithBrowserTTS = useCallback((text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Alex")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // ElevenLabs TTS function with fallback
  const speakWithElevenLabs = useCallback(async (text: string) => {
    if (isMuted) return;
    
    try {
      setIsSpeaking(true);
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: { text, feature: "voice-assistant" }
      });
      
      if (error) throw error;
      
      // Check for fallback signal
      if (data?.useFallback) {
        console.log("ElevenLabs unavailable, using browser TTS");
        speakWithBrowserTTS(data.text || text);
        return;
      }
      
      if (data?.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => {
          console.log("Audio playback failed, using browser TTS");
          setIsSpeaking(false);
          speakWithBrowserTTS(text);
        };
        await audioRef.current.play();
      } else {
        // No audio content, use fallback
        speakWithBrowserTTS(text);
      }
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  }, [isMuted, speakWithBrowserTTS]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Check for speech recognition support
  const isSpeechRecognitionSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";
      
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript) {
        setInterimTranscript("");
        setTextInput(finalTranscript);
        // Auto-send after speech ends
        setTimeout(() => {
          handleSendMessage(finalTranscript);
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No speech detected",
          description: "Please try speaking again",
        });
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSpeechRecognitionSupported]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Animate visualizer when listening or speaking
  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setVisualizerValues(
          Array(20).fill(0).map(() => 
            isListening ? Math.random() * 40 + 10 : Math.random() * 30 + 5
          )
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisualizerValues(Array(20).fill(10));
    }
  }, [isListening, isSpeaking]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!(await dailyLimit.tryConsume())) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("voice-chat", {
        body: {
          message: text,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) {
        console.error("Voice chat error:", error);
        throw new Error(error.message || "Failed to get response");
      }

      if (!data?.response) {
        throw new Error("No response received");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak the response if not muted
      if (!isMuted) {
        speakWithElevenLabs(data.response);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking();
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        // Recognition might already be running, try stopping and restarting
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 100);
        } catch (e) {
          console.error("Failed to restart recognition:", e);
        }
      }
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const clearConversation = () => {
    setMessages([]);
    stopSpeaking();
    toast({ title: "Conversation cleared" });
  };

  return (
    <AppLayout title="Voice Assistant">
      <DailyLimitDialog open={dailyLimit.showUpgrade} onOpenChange={dailyLimit.setShowUpgrade} />
      <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Voice Assistant</h1>
          <p className="text-muted-foreground">
            Talk naturally with AI - just like Alexa or Siri
          </p>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 mb-6">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Tap the microphone to start talking
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {["What's the weather like?", "Tell me a joke", "Explain quantum physics", "Write a poem"].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-3 py-1.5 text-sm rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "glass-card"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-card rounded-2xl px-4 py-3 max-w-[80%]">
                <ThinkingStepper isLoading={isProcessing} showUpgradePrompt={false} />
              </div>
            </motion.div>
          )}

          {/* Transcript preview */}
          {isListening && interimTranscript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="bg-primary/20 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm italic">{interimTranscript}...</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Visualizer */}
        <div className="flex justify-center items-end gap-1 h-12 mb-4">
          {visualizerValues.map((value, i) => (
            <motion.div
              key={i}
              animate={{ height: value }}
              transition={{ duration: 0.1 }}
              className={`w-1 rounded-full ${
                isListening
                  ? "bg-gradient-to-t from-red-500 to-orange-500"
                  : isSpeaking
                  ? "bg-gradient-to-t from-emerald-500 to-teal-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Recording Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening... Speak now
            </span>
          </motion.div>
        )}

        {/* Text Input */}
        <div className="glass rounded-2xl p-3 mb-4">
          <AttachmentPreview items={attachments} onRemove={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
          <div className="flex gap-2 items-center">
            <AttachmentButton onAttach={(a) => setAttachments(prev => [...prev, a])} disabled={isProcessing} />
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type your message..."
              className="rounded-xl border-0 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const note = attachments.length ? `\n\n[Attached: ${attachments.map(a => a.name).join(", ")}]` : "";
                  handleSendMessage(textInput + note);
                  setAttachments([]);
                }
              }}
            />
            <Button
              onClick={() => {
                const note = attachments.length ? `\n\n[Attached: ${attachments.map(a => a.name).join(", ")}]` : "";
                handleSendMessage(textInput + note);
                setAttachments([]);
              }}
              disabled={isProcessing || (!textInput.trim() && attachments.length === 0)}
              className="rounded-xl gradient-bg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isListening
                ? "bg-gradient-to-br from-red-500 to-rose-500 animate-pulse"
                : "bg-gradient-to-br from-primary to-secondary"
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </motion.button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={clearConversation}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Status */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isListening
            ? "Listening... Speak now"
            : isSpeaking
            ? "Speaking..."
            : isProcessing
            ? "Processing..."
            : "Tap to speak or type below"}
        </p>
      </div>
    </AppLayout>
  );
}
