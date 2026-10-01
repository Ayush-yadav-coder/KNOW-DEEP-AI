import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  ArrowRightLeft,
  User,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
  getSpeechCode,
} from "./TranslatorLanguages";
import { ConversationTurn } from "./TranslatorTypes";

interface TranslatorConversationViewProps {
  initialLangA?: string;
  initialLangB?: string;
}

const SAMPLE_CONVERSATION: ConversationTurn[] = [
  {
    id: "turn-1",
    speaker: "A",
    language: "en",
    originalText: "Hello! Could you help me find the nearest medical center?",
    translatedText: "¡Hola! ¿Podría ayudarme a encontrar el centro médico más cercano?",
    timestamp: Date.now() - 60000,
  },
  {
    id: "turn-2",
    speaker: "B",
    language: "es",
    originalText: "Por supuesto, camine dos cuadras hacia el norte y gire a la derecha.",
    translatedText: "Of course, walk two blocks north and turn right.",
    timestamp: Date.now() - 30000,
  },
];

export const TranslatorConversationView: React.FC<TranslatorConversationViewProps> = ({
  initialLangA = "en",
  initialLangB = "es",
}) => {
  const { toast } = useToast();

  const [langA, setLangA] = useState(initialLangA);
  const [langB, setLangB] = useState(initialLangB);

  const [activeSpeaker, setActiveSpeaker] = useState<"A" | "B" | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>(SAMPLE_CONVERSATION);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [autoPlaySpeech, setAutoPlaySpeech] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, interimTranscript]);

  // Audio Playback
  const speakAudio = (text: string, langCode: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const speechCode = getSpeechCode(langCode);
    utterance.lang = speechCode;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Process Speech Turn & Translate
  const handleProcessTurn = async (speaker: "A" | "B", spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsTranslating(true);
    const srcLang = speaker === "A" ? langA : langB;
    const tgtLang = speaker === "A" ? langB : langA;
    const srcName = getLanguageName(srcLang);
    const tgtName = getLanguageName(tgtLang);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Translate the following conversation turn from ${srcName} to ${tgtName} naturally: "${spokenText}". Return only the translation text.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const translation = data.content?.trim() || data.text?.trim() || "";

      const newTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        speaker,
        language: srcLang,
        originalText: spokenText,
        translatedText: translation,
        timestamp: Date.now(),
      };

      setConversation((prev) => [...prev, newTurn]);

      if (autoPlaySpeech && translation) {
        speakAudio(translation, tgtLang);
      }
    } catch (err) {
      console.error("Conversation translation error:", err);
      toast({
        title: "Translation Error",
        description: "Could not translate turn.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
      setInterimTranscript("");
      setActiveSpeaker(null);
    }
  };

  // Toggle Push to Talk Mic for a Speaker
  const handleToggleMic = (speaker: "A" | "B") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Voice Not Supported",
        description: "Microphone speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (activeSpeaker === speaker) {
      // Stop recording and process
      recognitionRef.current?.stop();
      setActiveSpeaker(null);
      if (interimTranscript.trim()) {
        handleProcessTurn(speaker, interimTranscript);
      }
    } else {
      // Start recording for this speaker
      setInterimTranscript("");
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechCode(speaker === "A" ? langA : langB);

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInterimTranscript(transcript);
      };

      recognition.onerror = () => {
        setActiveSpeaker(null);
      };

      recognition.onend = () => {
        if (interimTranscript.trim()) {
          handleProcessTurn(speaker, interimTranscript);
        } else {
          setActiveSpeaker(null);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setActiveSpeaker(speaker);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Top Header & Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Live Conversation Interpreter
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlaySpeech}
              onChange={(e) => setAutoPlaySpeech(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Auto Voice Playback</span>
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConversation([])}
            className="h-8 text-xs text-muted-foreground hover:text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Split Transcript Feed */}
      <div className="h-[420px] overflow-y-auto p-4 sm:p-6 bg-card border border-border/80 rounded-3xl space-y-4 shadow-inner">
        {conversation.map((turn) => {
          const isA = turn.speaker === "A";
          const currentSpeakerLang = isA ? langA : langB;
          const targetSpeakerLang = isA ? langB : langA;

          return (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isA ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl space-y-2 shadow-xs ${
                  isA
                    ? "bg-muted/50 border border-border/70 rounded-tl-xs text-left"
                    : "bg-primary/10 border border-primary/20 rounded-tr-xs text-left"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Speaker {turn.speaker} ({getLanguageName(currentSpeakerLang)})
                  </span>
                  <button
                    type="button"
                    onClick={() => speakAudio(turn.translatedText, targetSpeakerLang)}
                    className="hover:text-primary transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground italic">"{turn.originalText}"</p>
                  <p className="text-sm font-semibold text-foreground">{turn.translatedText}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Interim Live Transcript */}
        {interimTranscript && (
          <div
            className={`flex flex-col ${activeSpeaker === "A" ? "items-start" : "items-end"}`}
          >
            <div className="p-3 rounded-2xl bg-muted/40 border border-primary/40 text-xs italic animate-pulse">
              Hearing: "{interimTranscript}"
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Dual Push-to-Talk Speakers Control Station */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speaker A Station */}
        <div className="p-5 bg-card border border-border/80 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>{getLanguageFlag(langA)}</span>
              <span>Speaker A</span>
            </span>
            <select
              value={langA}
              onChange={(e) => setLangA(e.target.value)}
              className="bg-muted/80 border border-border rounded-xl px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-primary"
            >
              {POPULAR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="lg"
            variant={activeSpeaker === "A" ? "destructive" : "default"}
            onClick={() => handleToggleMic("A")}
            className={`w-full h-14 rounded-2xl gap-2 font-bold text-sm shadow-md transition-all ${
              activeSpeaker === "A" ? "animate-pulse" : ""
            }`}
          >
            {activeSpeaker === "A" ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Listening Speaker A... (Tap to Send)</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Speak {getLanguageName(langA)}</span>
              </>
            )}
          </Button>
        </div>

        {/* Speaker B Station */}
        <div className="p-5 bg-card border border-border/80 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span>{getLanguageFlag(langB)}</span>
              <span>Speaker B</span>
            </span>
            <select
              value={langB}
              onChange={(e) => setLangB(e.target.value)}
              className="bg-muted/80 border border-border rounded-xl px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-primary"
            >
              {POPULAR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="lg"
            variant={activeSpeaker === "B" ? "destructive" : "secondary"}
            onClick={() => handleToggleMic("B")}
            className={`w-full h-14 rounded-2xl gap-2 font-bold text-sm shadow-md transition-all border border-border ${
              activeSpeaker === "B" ? "animate-pulse bg-rose-600 text-white" : ""
            }`}
          >
            {activeSpeaker === "B" ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Listening Speaker B... (Tap to Send)</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-primary" />
                <span>Speak {getLanguageName(langB)}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
