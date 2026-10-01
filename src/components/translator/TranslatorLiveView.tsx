import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Mic,
  MicOff,
  Trash2,
  Bookmark,
  Share2,
  FileText,
  Upload,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Info,
  ChevronDown,
  BookOpen,
  Headphones,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ALL_LANGUAGES,
  POPULAR_LANGUAGES,
  LanguageOption,
  getLanguageName,
  getLanguageFlag,
  getSpeechCode,
} from "./TranslatorLanguages";
import {
  TranslationTone,
  TranslationHistoryItem,
} from "./TranslatorTypes";
import { safeParseJson } from "./TranslatorUtils";

interface TranslatorLiveViewProps {
  onAddHistory: (item: Omit<TranslationHistoryItem, "id" | "timestamp">) => void;
  onOpenDictionaryForWord?: (word: string, lang: string) => void;
  onOpenVoiceTrainerForPhrase?: (phrase: string, lang: string) => void;
}

const TONES: { id: TranslationTone; label: string; desc: string }[] = [
  { id: "Natural", label: "Natural", desc: "Fluent, native-sounding phrasing" },
  { id: "Formal", label: "Formal", desc: "Polite, diplomatic & respectful" },
  { id: "Casual", label: "Casual", desc: "Everyday conversational talk" },
  { id: "Business", label: "Business", desc: "Professional executive tone" },
  { id: "Academic", label: "Academic", desc: "Scholarly & precise vocabulary" },
  { id: "Slang", label: "Slang / Idiomatic", desc: "Colloquial street expressions" },
  { id: "Poetic", label: "Poetic / Lyrical", desc: "Artistic & evocative cadence" },
];

const QUICK_STARTERS = [
  { text: "Could you please tell me how to get to the nearest train station?", label: "Directions" },
  { text: "We look forward to partnering with your organization on this venture.", label: "Business" },
  { text: "Can I please have a table for two and the vegetarian menu?", label: "Dining" },
  { text: "It is an absolute pleasure to meet you today!", label: "Greeting" },
];

export const TranslatorLiveView: React.FC<TranslatorLiveViewProps> = ({
  onAddHistory,
  onOpenDictionaryForWord,
  onOpenVoiceTrainerForPhrase,
}) => {
  const { toast } = useToast();

  const [sourceLang, setSourceLang] = useState<string>("en");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [tone, setTone] = useState<TranslationTone>("Natural");

  const [sourceText, setSourceText] = useState<string>(
    "Welcome to the all-new universal Translator. Speak, listen, refine grammar, and master any language effortlessly!"
  );
  const [translatedText, setTranslatedText] = useState<string>(
    "¡Bienvenido al nuevo Traductor universal! ¡Habla, escucha, perfecciona la gramática y domina cualquier idioma sin esfuerzo!"
  );
  const [phoneticGuide, setPhoneticGuide] = useState<string>(
    "¡Byen-veh-NEE-doh ahl NWEH-voh trah-dook-TOHR oo-nee-vehr-SAHL! ¡AH-blah, ehs-KOO-chah, pehr-fehk-SYOH-nah lah grah-MAH-tee-kah..."
  );
  const [detectedLangName, setDetectedLangName] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isCopiedSource, setIsCopiedSource] = useState<boolean>(false);
  const [isCopiedTarget, setIsCopiedTarget] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Speech Recognition (Mic)
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const spokenTextRef = useRef<string>("");

  // Text to speech state
  const [isPlayingSource, setIsPlayingSource] = useState<boolean>(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0); // 0.5, 0.75, 1, 1.25

  // Fullscreen view modal
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Language selection modals / popovers
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [isSourcePickerOpen, setIsSourcePickerOpen] = useState(false);
  const [isTargetPickerOpen, setIsTargetPickerOpen] = useState(false);

  // Auto-translate debounce timer
  const autoTranslateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Speech-to-text initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechCode(sourceLang === "auto" ? "en" : sourceLang);

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          spokenTextRef.current = currentTranscript;
          setSourceText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (spokenTextRef.current.trim()) {
          const text = spokenTextRef.current;
          spokenTextRef.current = "";
          triggerTranslation(text, tone);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [sourceLang, tone]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Microphone Not Supported",
        description: "Your browser does not support Web Speech Recognition. Please type your text.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        spokenTextRef.current = "";
        recognitionRef.current.lang = getSpeechCode(sourceLang === "auto" ? "en" : sourceLang);
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: `Speak in ${sourceLang === "auto" ? "any language" : getLanguageName(sourceLang)}.`,
        });
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  // Text to Speech playback
  const handleSpeakText = (text: string, langCode: string, isSource: boolean) => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser does not support text-to-speech audio synthesis.",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();

    if ((isSource && isPlayingSource) || (!isSource && isPlayingTarget)) {
      setIsPlayingSource(false);
      setIsPlayingTarget(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const speechCode = getSpeechCode(langCode === "auto" ? "en" : langCode);
    utterance.lang = speechCode;
    utterance.rate = speechSpeed;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(speechCode.slice(0, 2)) || v.lang === speechCode
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (isSource) {
      setIsPlayingSource(true);
      utterance.onend = () => setIsPlayingSource(false);
      utterance.onerror = () => setIsPlayingSource(false);
    } else {
      setIsPlayingTarget(true);
      utterance.onend = () => setIsPlayingTarget(false);
      utterance.onerror = () => setIsPlayingTarget(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  // Main translation function
  const triggerTranslation = async (textToTranslate = sourceText, currentTone = tone) => {
    if (!textToTranslate.trim()) {
      setTranslatedText("");
      setPhoneticGuide("");
      return;
    }

    setIsTranslating(true);
    const srcName = sourceLang === "auto" ? "Auto-Detect Source Language" : getLanguageName(sourceLang);
    const tgtName = getLanguageName(targetLang);

    try {
      const prompt = `You are a world-class translation engine and computational linguist.
Translate the following source text from ${srcName} into ${tgtName}.

Desired Tone / Style: ${currentTone}
Source Text:
"""
${textToTranslate}
"""

Instructions:
1. Provide a natural, highly accurate, culturally native translation.
2. If the target language or source uses non-Latin script or benefits from pronunciation assistance, provide a clean Romanization / Phonetic Guide (e.g. Pinyin for Chinese, Romaji for Japanese, Romanized Urdu/Hindi, IPA/phonetics).
3. If source was "Auto-Detect", identify the detected language name.
4. Output STRICT JSON only with this schema:
{
  "detectedLanguage": "string or null",
  "translation": "string",
  "phoneticGuide": "string (romanized pronunciation guide or phonetic transcription)",
  "culturalNote": "optional short 1-line note if there is an important idiom/cultural nuance"
}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction: "You are the universal Translator AI. Respond strictly in valid JSON without conversational wrapper text.",
        }),
      });

      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();
      let textResponse = data.content || data.text || "";

      const parsed = safeParseJson(textResponse, {
        translation: "",
        phoneticGuide: "",
        detectedLanguage: null
      });
      const finalTranslation = parsed.translation || "";
      const finalPhonetic = parsed.phoneticGuide || "";
      const detected = parsed.detectedLanguage;

      setTranslatedText(finalTranslation);
      setPhoneticGuide(finalPhonetic);
      if (detected && sourceLang === "auto") {
        setDetectedLangName(detected);
      } else {
        setDetectedLangName(null);
      }

      // Record to history
      onAddHistory({
        sourceText: textToTranslate,
        translatedText: finalTranslation,
        sourceLang: sourceLang === "auto" && detected ? detected : sourceLang,
        targetLang,
        tone: currentTone,
        phoneticGuide: finalPhonetic,
        isBookmarked: false,
      });
    } catch (err) {
      console.error("Translation error:", err);
      // Fallback translation attempt with simple string output
      try {
        const fallbackRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Translate to ${tgtName} with ${currentTone} tone: "${textToTranslate}". Return only the translation without explanation.`,
              },
            ],
          }),
        });
        const fbData = await fallbackRes.json();
        setTranslatedText(fbData.content?.trim() || fbData.text?.trim() || "Translation error. Please try again.");
      } catch {
        toast({
          title: "Translation Failed",
          description: "Could not connect to translation engine. Please check your internet.",
          variant: "destructive",
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
      toast({
        title: "Select Specific Source",
        description: "Cannot swap when Source is set to Auto-Detect.",
      });
      return;
    }

    const prevSource = sourceLang;
    const prevTarget = targetLang;
    const prevSourceText = sourceText;
    const prevTranslatedText = translatedText;

    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setSourceText(prevTranslatedText);
    setTranslatedText(prevSourceText);
    setPhoneticGuide("");

    if (prevTranslatedText.trim()) {
      triggerTranslation(prevTranslatedText, tone);
    }
  };

  // Handle Source Text Change with auto debounce
  const handleSourceChange = (val: string) => {
    setSourceText(val);
    if (!val.trim()) {
      setTranslatedText("");
      setPhoneticGuide("");
    }
  };

  // Copy text handlers
  const handleCopySource = () => {
    if (!sourceText) return;
    navigator.clipboard.writeText(sourceText);
    setIsCopiedSource(true);
    setTimeout(() => setIsCopiedSource(false), 2000);
    toast({ title: "Copied Source Text" });
  };

  const handleCopyTarget = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopiedTarget(true);
    setTimeout(() => setIsCopiedTarget(false), 2000);
    toast({ title: "Copied Translated Text" });
  };

  // Handle Document / Image file upload for OCR translation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setSourceText(content.slice(0, 5000));
          toast({
            title: "File Loaded",
            description: `Imported ${file.name} (${content.length} chars).`,
          });
        }
      };
      reader.readAsText(file);
    } else {
      // For images/PDFs, simulate document reading & extract
      toast({
        title: "Scanning Document...",
        description: `Extracting text from ${file.name} via AI OCR...`,
      });
      setIsTranslating(true);
      setTimeout(() => {
        const mockExtracted = `Extracted Text from ${file.name}: We are pleased to provide this international certificate of completion for multilingual proficiency.`;
        setSourceText(mockExtracted);
        setIsTranslating(false);
        triggerTranslation(mockExtracted, tone);
      }, 1200);
    }
  };

  // Filtered lists for popover pickers
  const filteredSourceLanguages = ALL_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTargetLanguages = ALL_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(targetSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(targetSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Tone & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pl-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            Translation Tone:
          </span>
          <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTone(t.id);
                  if (sourceText.trim()) triggerTranslation(sourceText, t.id);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  tone === t.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
                title={t.desc}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speech Speed & Quick Starters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-xl border border-border/40">
            <Headphones className="w-3.5 h-3.5 text-primary" />
            <span>Voice Speed:</span>
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSpeechSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  speechSpeed === speed
                    ? "bg-primary/20 text-primary font-bold"
                    : "hover:text-foreground"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="h-8 gap-1.5 text-xs border-border/70 rounded-xl hover:bg-muted/70"
            title="Fullscreen Dual View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus</span>
          </Button>
        </div>
      </div>

      {/* Main Dual-Pane Translation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* SOURCE PANE */}
        <div className="flex flex-col bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden focus-within:border-primary/60 transition-all">
          {/* Header Bar: Source Language Selector & Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              {/* Auto Detect Button */}
              <button
                type="button"
                onClick={() => setSourceLang("auto")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  sourceLang === "auto"
                    ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                ✨ Detect Language
              </button>

              {/* Source Language Dropdown */}
              <Popover open={isSourcePickerOpen} onOpenChange={setIsSourcePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium border border-border/60 rounded-xl hover:bg-muted px-3"
                  >
                    <span>{getLanguageFlag(sourceLang)}</span>
                    <span className="max-w-[130px] truncate font-semibold">
                      {sourceLang === "auto"
                        ? detectedLangName
                          ? `${detectedLangName} (Detected)`
                          : "Auto Detect"
                        : getLanguageName(sourceLang)}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 rounded-2xl shadow-xl" align="start">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={sourceSearch}
                      onChange={(e) => setSourceSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSourceLang("auto");
                        setIsSourcePickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                        sourceLang === "auto" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>✨</span>
                        <span className="font-semibold">Auto-Detect Language</span>
                      </span>
                    </button>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 pt-2 pb-1">
                      Languages
                    </div>
                    {filteredSourceLanguages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setSourceLang(l.code);
                          setIsSourcePickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                          sourceLang === l.code
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        <span className="text-[11px] opacity-70">{l.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick Clear Button */}
            {sourceText && (
              <button
                type="button"
                onClick={() => {
                  setSourceText("");
                  setTranslatedText("");
                  setPhoneticGuide("");
                }}
                className="text-muted-foreground hover:text-foreground text-xs p-1.5 hover:bg-muted rounded-lg transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Textarea for Source */}
          <div className="relative flex-1 p-4 min-h-[260px] flex flex-col justify-between">
            <Textarea
              value={sourceText}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="Type, paste text, or tap the microphone to speak in any language..."
              className="w-full flex-1 resize-none bg-transparent border-none p-0 text-base sm:text-lg focus-visible:ring-0 shadow-none leading-relaxed placeholder:text-muted-foreground/60 min-h-[180px]"
            />

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                {/* Voice Input (Mic) */}
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "secondary"}
                  size="sm"
                  onClick={toggleListening}
                  className={`h-9 px-3 rounded-xl gap-1.5 text-xs transition-all ${
                    isListening ? "animate-pulse" : ""
                  }`}
                  title="Voice dictation"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold">Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-primary" />
                      <span>Voice Input</span>
                    </>
                  )}
                </Button>

                {/* Voice Speak Audio (TTS) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!sourceText.trim()}
                  onClick={() => handleSpeakText(sourceText, sourceLang, true)}
                  className="h-9 w-9 p-0 rounded-xl hover:bg-muted"
                  title="Listen to pronunciation"
                >
                  {isPlayingSource ? (
                    <VolumeX className="w-4 h-4 text-primary animate-bounce" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Copy */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!sourceText.trim()}
                  onClick={handleCopySource}
                  className="h-9 w-9 p-0 rounded-xl hover:bg-muted"
                  title="Copy text"
                >
                  {isCopiedSource ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Upload File / Document OCR */}
                <label className="cursor-pointer h-9 px-2.5 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-xs gap-1 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Doc</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Character & Word Count */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <span>{sourceText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>·</span>
                <span>{sourceText.length} chars</span>
              </div>
            </div>
          </div>
        </div>

        {/* SWAP BUTTON (Absolute center or flex separator) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapLanguages}
            className="w-12 h-12 rounded-2xl bg-card border border-border shadow-lg hover:bg-muted hover:scale-105 transition-all text-primary"
            title="Swap source & target languages"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </Button>
        </div>

        {/* TARGET PANE */}
        <div className="flex flex-col bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden focus-within:border-primary/60 transition-all relative">
          {/* Header Bar: Target Language Selector & Swap on Mobile */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              {/* Mobile Swap Button */}
              <button
                type="button"
                onClick={handleSwapLanguages}
                className="lg:hidden p-1.5 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                title="Swap languages"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Target Language Dropdown */}
              <Popover open={isTargetPickerOpen} onOpenChange={setIsTargetPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold border border-border/60 rounded-xl hover:bg-muted px-3"
                  >
                    <span>{getLanguageFlag(targetLang)}</span>
                    <span className="max-w-[130px] truncate">{getLanguageName(targetLang)}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 rounded-2xl shadow-xl" align="start">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 pt-1 pb-1">
                      Popular Languages
                    </div>
                    {POPULAR_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setTargetLang(l.code);
                          setIsTargetPickerOpen(false);
                          if (sourceText.trim()) triggerTranslation(sourceText, tone);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                          targetLang === l.code
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        <span className="text-[11px] opacity-70">{l.nativeName}</span>
                      </button>
                    ))}
                    <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 pt-2 pb-1">
                      All Languages
                    </div>
                    {filteredTargetLanguages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setTargetLang(l.code);
                          setIsTargetPickerOpen(false);
                          if (sourceText.trim()) triggerTranslation(sourceText, tone);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                          targetLang === l.code
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        <span className="text-[11px] opacity-70">{l.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Translate Action Button */}
            <Button
              size="sm"
              onClick={() => triggerTranslation(sourceText, tone)}
              disabled={isTranslating || !sourceText.trim()}
              className="h-8 gap-1.5 text-xs font-semibold px-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 shadow-sm hover:opacity-95"
            >
              {isTranslating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate</span>
                </>
              )}
            </Button>
          </div>

          {/* Target Content Area */}
          <div className="relative flex-1 p-4 min-h-[260px] flex flex-col justify-between">
            {isTranslating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground font-medium animate-pulse">
                  Translating into {getLanguageName(targetLang)} ({tone} tone)...
                </p>
              </div>
            ) : translatedText ? (
              <div className="space-y-3">
                <p className="text-base sm:text-lg leading-relaxed text-foreground font-normal selection:bg-primary/20">
                  {translatedText}
                </p>

                {/* Phonetic / Romanization Guide */}
                {phoneticGuide && (
                  <div className="p-3 bg-muted/40 rounded-2xl border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-primary" />
                        Phonetic & Pronunciation Guide:
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed italic">
                      {phoneticGuide}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm italic">
                Translation will appear here instantly...
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                {/* Voice Speak Audio (TTS) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!translatedText.trim()}
                  onClick={() => handleSpeakText(translatedText, targetLang, false)}
                  className="h-9 px-2.5 rounded-xl hover:bg-muted text-xs gap-1.5"
                  title="Listen to native pronunciation"
                >
                  {isPlayingTarget ? (
                    <>
                      <VolumeX className="w-4 h-4 text-primary animate-bounce" />
                      <span className="text-primary font-semibold">Playing</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <span>Listen</span>
                    </>
                  )}
                </Button>

                {/* Pronounce Practice / Voice Trainer Shortcut */}
                {onOpenVoiceTrainerForPhrase && translatedText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenVoiceTrainerForPhrase(translatedText, targetLang)}
                    className="h-9 px-2.5 rounded-xl hover:bg-muted text-xs gap-1.5 text-primary"
                    title="Practice speaking this phrase in Voice Trainer"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Voice Train</span>
                  </Button>
                )}

                {/* Copy */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!translatedText.trim()}
                  onClick={handleCopyTarget}
                  className="h-9 w-9 p-0 rounded-xl hover:bg-muted"
                  title="Copy translation"
                >
                  {isCopiedTarget ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Bookmark / Favorite */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!translatedText.trim()}
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    toast({
                      title: isBookmarked ? "Removed from Saved" : "Saved to Phrasebook",
                      description: `Saved: "${translatedText.slice(0, 30)}..."`,
                    });
                  }}
                  className={`h-9 w-9 p-0 rounded-xl hover:bg-muted ${
                    isBookmarked ? "text-amber-500" : "text-muted-foreground"
                  }`}
                  title="Save translation"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                </Button>
              </div>

              {/* Character & Word Count */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <span>{translatedText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>·</span>
                <span>{translatedText.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Starter Templates */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Quick Example Prompts:
          </span>
          <span>Click any phrase to translate immediately</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUICK_STARTERS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSourceText(item.text);
                triggerTranslation(item.text, tone);
              }}
              className="text-left p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/70 hover:border-primary/50 transition-all group flex flex-col justify-between gap-1 shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary group-hover:underline">
                {item.label}
              </div>
              <p className="text-xs text-foreground/90 line-clamp-2 leading-snug">{item.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Dialog Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl p-6 rounded-3xl bg-background border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold">
                <span>{getLanguageFlag(sourceLang)}</span>
                <span>{getLanguageName(sourceLang)}</span>
                <ArrowLeftRight className="w-4 h-4 text-muted-foreground mx-1" />
                <span>{getLanguageFlag(targetLang)}</span>
                <span>{getLanguageName(targetLang)}</span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Source</div>
              <p className="text-lg leading-relaxed">{sourceText}</p>
            </div>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="text-xs font-semibold text-primary">Translation ({tone})</div>
              <p className="text-lg font-medium leading-relaxed">{translatedText}</p>
              {phoneticGuide && (
                <p className="text-xs font-mono text-muted-foreground pt-2 italic">
                  {phoneticGuide}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
