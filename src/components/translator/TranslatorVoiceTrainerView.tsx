import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Award,
  Zap,
  ArrowRight,
  Flame,
  HelpCircle,
  Shuffle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
  getSpeechCode,
} from "./TranslatorLanguages";
import { VoiceTrainingResult } from "./TranslatorTypes";
import { safeParseJson } from "./TranslatorUtils";

interface TranslatorVoiceTrainerViewProps {
  initialPhrase?: string;
  initialLang?: string;
}

const PRESET_DRILLS: Record<
  string,
  {
    phrase: string;
    translation: string;
    phonetic: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    focus: string;
  }[]
> = {
  en: [
    {
      phrase: "Through tough thorough thought, though.",
      translation: "Through deep and careful reflection.",
      phonetic: "/θruː tʌf ˈθʌr.ə θɔːt ðoʊ/",
      level: "Advanced",
      focus: "'th' dental fricatives & 'ough' variations",
    },
    {
      phrase: "She sells seashells by the seashore.",
      translation: "Classic articulation tongue twister.",
      phonetic: "/ʃiː sɛlz ˈsiːˌʃɛlz baɪ ðə ˈsiːˌʃɔːr/",
      level: "Intermediate",
      focus: "Sibilant 's' vs 'sh' distinction",
    },
    {
      phrase: "Good morning! It is wonderful to meet you today.",
      translation: "Formal everyday greeting.",
      phonetic: "/ɡʊd ˈmɔːrnɪŋ ɪt ɪz ˈwʌndərfəl tu miːt ju təˈdeɪ/",
      level: "Beginner",
      focus: "Natural rising and falling intonation",
    },
  ],
  es: [
    {
      phrase: "El perro corre rápido por el parque.",
      translation: "The dog runs fast through the park.",
      phonetic: "/el ˈpe.ro ˈko.re ˈra.pi.do por el ˈpar.ke/",
      level: "Intermediate",
      focus: "Rolled double 'rr' (trill)",
    },
    {
      phrase: "¿Podría recomendarme un buen restaurante tradicional?",
      translation: "Could you recommend a good traditional restaurant?",
      phonetic: "/poˈðɾi.a re.ko.menˈdar.me un bwen res.tawˈran.te/",
      level: "Beginner",
      focus: "Soft 'd' tap and vowel clarity",
    },
  ],
  fr: [
    {
      phrase: "Les oiseaux volent au-dessus de la belle forêt.",
      translation: "The birds fly above the beautiful forest.",
      phonetic: "/le.z‿wa.zo vɔl o.d(ə).sy də la bɛl fɔ.ʁɛ/",
      level: "Intermediate",
      focus: "Liaison (les oiseaux) and French 'r' fricative",
    },
    {
      phrase: "Un bon vin blanc et un grand croissant chaud.",
      translation: "A good white wine and a large warm croissant.",
      phonetic: "/œ̃ bɔ̃ vɛ̃ blɑ̃ e œ̃ ɡʁɑ̃ kʁwa.sɑ̃ ʃo/",
      level: "Advanced",
      focus: "Four distinct French nasal vowels",
    },
  ],
  de: [
    {
      phrase: "Ich möchte ein Glas frisches Wasser bitte.",
      translation: "I would like a glass of fresh water please.",
      phonetic: "/ɪç ˈmœç.tə aɪ̯n ɡlaːs ˈfʁɪ.ʃəs ˈvas.ɐ ˈbɪ.tə/",
      level: "Beginner",
      focus: "Ich-Laut (/ç/) and short vowels",
    },
  ],
  ja: [
    {
      phrase: "初めまして、よろしくお願いします。",
      translation: "Nice to meet you, please treat me well.",
      phonetic: "Hajimemashite, yoroshiku onegai shimasu.",
      level: "Beginner",
      focus: "Mora timing and polite pitch accent",
    },
  ],
  hi: [
    {
      phrase: "आपसे मिलकर मुझे बहुत खुशी हुई।",
      translation: "I am very delighted to meet you.",
      phonetic: "Aapse milkar mujhe bahut khushi hui.",
      level: "Beginner",
      focus: "Aspirated 'kh' and retroflex sounds",
    },
  ],
};

export const TranslatorVoiceTrainerView: React.FC<TranslatorVoiceTrainerViewProps> = ({
  initialPhrase = "",
  initialLang = "en",
}) => {
  const { toast } = useToast();

  const [selectedLang, setSelectedLang] = useState<string>(initialLang || "en");
  const [currentPhrase, setCurrentPhrase] = useState<string>(
    initialPhrase ||
      PRESET_DRILLS[initialLang]?.[0]?.phrase ||
      "Through tough thorough thought, though."
  );
  const [customInput, setCustomInput] = useState<string>("");

  const [isListening, setIsListening] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [trainingResult, setTrainingResult] = useState<VoiceTrainingResult | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechCode(selectedLang);

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // Play Native Reference Audio
  const handlePlayReference = (speed = playSpeed) => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Speech Not Supported",
        description: "Browser speech synthesis is unavailable.",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPhrase);
    const code = getSpeechCode(selectedLang);
    utterance.lang = code;
    utterance.rate = speed;

    const voices = window.speechSynthesis.getVoices();
    const matching = voices.find((v) => v.lang === code || v.lang.startsWith(code.slice(0, 2)));
    if (matching) utterance.voice = matching;

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone Recording
  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Please ensure microphone permissions are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (userTranscript.trim()) {
        evaluatePronunciation(userTranscript);
      }
    } else {
      setUserTranscript("");
      setTrainingResult(null);
      try {
        recognitionRef.current.lang = getSpeechCode(selectedLang);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start failed:", err);
      }
    }
  };

  // AI Pronunciation Assessment
  const evaluatePronunciation = async (recordedText: string) => {
    setIsEvaluating(true);
    const langName = getLanguageName(selectedLang);

    try {
      const prompt = `You are an expert phonetician and AI pronunciation speech coach.
Compare the user's recorded spoken transcript against the target practice phrase in ${langName}.

Target Phrase: "${currentPhrase}"
User's Spoken Audio Transcript: "${recordedText}"

Evaluate accuracy, phonetics, fluency, and articulation.
Output STRICT JSON with this schema:
{
  "transcript": "${recordedText}",
  "accuracyScore": 92, // integer 0 to 100
  "fluencyScore": 88, // integer 0 to 100
  "pronunciationScore": 90, // integer 0 to 100
  "wordScores": [
    {
      "word": "each target word",
      "score": 95, // 0 to 100
      "status": "correct" | "minor_flaw" | "mispronounced",
      "phoneticTip": "short tip if flawed or empty"
    }
  ],
  "coachFeedback": "2-sentence encouraging, highly specific feedback on tongue placement, stress, or vowel duration",
  "stressTip": "1 key takeaway sound to master"
}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction:
            "You are an AI pronunciation coach. Respond strictly with valid JSON conforming to the requested schema.",
        }),
      });

      if (!res.ok) throw new Error("Voice evaluation failed");
      const data = await res.json();
      let textResponse = data.content || data.text || "";

      const parsed = safeParseJson<VoiceTrainingResult>(textResponse, {
        transcript: recordedText,
        accuracyScore: 70,
        fluencyScore: 70,
        pronunciationScore: 70,
        wordScores: [],
        coachFeedback: "Practice speaking slowly and clearly.",
        stressTip: ""
      });
      setTrainingResult(parsed);

      toast({
        title: `Pronunciation Score: ${parsed.accuracyScore}%`,
        description: parsed.coachFeedback,
      });
    } catch (err) {
      console.error("Voice eval error:", err);
      // Fallback local score calculation
      const targetWords = currentPhrase.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
      const userWords = recordedText.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
      let matches = 0;
      const wordScores = targetWords.map((tw) => {
        const has = userWords.includes(tw);
        if (has) matches++;
        return {
          word: tw,
          score: has ? 95 : 45,
          status: (has ? "correct" : "mispronounced") as "correct" | "mispronounced",
          phoneticTip: has ? undefined : "Focus on articulation",
        };
      });
      const score = Math.round((matches / Math.max(targetWords.length, 1)) * 100);
      setTrainingResult({
        transcript: recordedText,
        accuracyScore: score,
        fluencyScore: Math.min(100, score + 5),
        pronunciationScore: score,
        wordScores,
        coachFeedback: `Great attempt! You matched ${matches} of ${targetWords.length} words accurately.`,
        stressTip: "Practice slower articulation for crisp syllables.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectDrill = (drillPhrase: string) => {
    setCurrentPhrase(drillPhrase);
    setTrainingResult(null);
    setUserTranscript("");
  };

  const handleApplyCustom = () => {
    if (!customInput.trim()) return;
    setCurrentPhrase(customInput.trim());
    setCustomInput("");
    setTrainingResult(null);
    setUserTranscript("");
    toast({ title: "Custom Practice Phrase Set" });
  };

  const availableDrills = PRESET_DRILLS[selectedLang] || PRESET_DRILLS["en"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Language Bar & Drill Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-primary" />
            Target Voice Language:
          </span>
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              const drills = PRESET_DRILLS[e.target.value] || PRESET_DRILLS["en"];
              setCurrentPhrase(drills[0]?.phrase || "Hello, how are you?");
              setTrainingResult(null);
            }}
            className="bg-muted/80 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Phrase Input */}
        <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
          <input
            type="text"
            placeholder="Type any sentence to practice..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyCustom()}
            className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-1.5 flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            size="sm"
            onClick={handleApplyCustom}
            disabled={!customInput.trim()}
            className="h-8 text-xs rounded-xl"
          >
            Set Phrase
          </Button>
        </div>
      </div>

      {/* Main Pronunciation Training Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Practice Card (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-card border border-border/80 rounded-3xl p-6 shadow-sm justify-between space-y-6">
          {/* Target Phrase Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-3">
              <span className="font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Target Practice Phrase
              </span>
              <span>{getLanguageName(selectedLang)}</span>
            </div>

            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
                "{currentPhrase}"
              </h2>
            </div>

            {/* Reference Audio Player Controls */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/40 rounded-2xl border border-border/50">
              <Button
                size="sm"
                onClick={() => handlePlayReference(playSpeed)}
                disabled={isPlayingAudio}
                className="h-9 px-4 rounded-xl gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                <span>{isPlayingAudio ? "Playing Native Audio..." : "Listen Reference Audio"}</span>
              </Button>

              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <span className="text-[11px] font-semibold">Speed:</span>
                {[0.5, 0.75, 1.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setPlaySpeed(s);
                      handlePlayReference(s);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                      playSpeed === s
                        ? "bg-primary/20 text-primary font-bold"
                        : "hover:text-foreground"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Microphone Recorder Stage */}
          <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-border/60 rounded-3xl space-y-4 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
            )}

            {/* Big Mic Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30"
                  : "bg-gradient-to-tr from-primary to-blue-600 text-white hover:shadow-primary/30"
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-foreground">
                {isListening
                  ? "Listening... Speak now into your microphone"
                  : "Tap Microphone & Speak This Phrase"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isListening
                  ? "Tap again when you finish speaking to analyze pronunciation"
                  : "AI will analyze phoneme accuracy, intonation & fluency"}
              </p>
            </div>

            {/* Live interim transcript */}
            {userTranscript && (
              <div className="p-3 bg-card border border-border/70 rounded-2xl max-w-lg text-center text-xs font-medium text-foreground/90 shadow-2xs">
                <span className="text-muted-foreground mr-1">Heard:</span>
                "{userTranscript}"
              </div>
            )}
          </div>

          {/* AI Analysis Feedback Results */}
          {isEvaluating ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Evaluating acoustic phonemes & pronunciation accuracy...
              </p>
            </div>
          ) : trainingResult ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Pronunciation Scorecard
                </span>
                <span className="text-xs text-muted-foreground">
                  Accuracy: {trainingResult.accuracyScore}%
                </span>
              </div>

              {/* Three Radial Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">
                    Overall Accuracy
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {trainingResult.accuracyScore}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">
                    Fluency
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {trainingResult.fluencyScore}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">
                    Articulation
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {trainingResult.pronunciationScore}%
                  </div>
                </div>
              </div>

              {/* Word-by-Word Colored Feedback */}
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Word-Level Breakdown:</div>
                <div className="flex flex-wrap items-center gap-2">
                  {trainingResult.wordScores.map((ws, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        ws.status === "correct"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : ws.status === "minor_flaw"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      }`}
                      title={ws.phoneticTip || `${ws.score}% accuracy`}
                    >
                      {ws.word}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Feedback Box */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-1.5">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Voice Coach Insight:
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {trainingResult.coachFeedback}
                </p>
                {trainingResult.stressTip && (
                  <p className="text-[11px] font-medium text-muted-foreground pt-1 italic">
                    💡 Tip: {trainingResult.stressTip}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Sidebar: Curated Practice Drills (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-foreground uppercase tracking-wider px-1">
            <span>Curated Drills ({availableDrills.length})</span>
            <span className="text-muted-foreground font-normal">Select a challenge</span>
          </div>

          <div className="space-y-2.5">
            {availableDrills.map((drill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDrill(drill.phrase)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                  currentPhrase === drill.phrase
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-card border-border/70 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {drill.level}
                  </span>
                  <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                    Practice <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <p className="text-xs font-semibold text-foreground line-clamp-2">
                  "{drill.phrase}"
                </p>

                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    {drill.phonetic}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 line-clamp-1">
                    🎯 Focus: {drill.focus}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
