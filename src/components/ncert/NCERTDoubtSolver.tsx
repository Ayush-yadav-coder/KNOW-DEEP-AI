import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { useToast } from "@/hooks/use-toast";
import { NCERTChapter } from "@/data/ncertCurriculum";

interface NCERTDoubtSolverProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
  initialQuestion?: string;
}

export const NCERTDoubtSolver: React.FC<NCERTDoubtSolverProps> = ({
  chapter,
  classNameLabel,
  subjectName,
  initialQuestion,
}) => {
  const { toast } = useToast();
  const dailyLimit = useDailyMessageLimit();
  const [question, setQuestion] = useState(initialQuestion || "");
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Audio speech synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { isListening, transcript, startListening, stopListening, isSupported } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setQuestion((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({ title: "Listening for doubt..." });
    }
  };

  const handleAskTutor = async (customPrompt?: string) => {
    const q = customPrompt || question;
    if (!q.trim()) return;

    if (!dailyLimit.checkLimitAndProceed()) {
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const systemInstruction = `You are a CBSE Board Examiner and Master NCERT Tutor for Class ${classNameLabel}, Subject: ${subjectName}.
Chapter: ${chapter.chapterNumber} - ${chapter.title}.
Official NCERT summary: ${chapter.summary}
Official Key Concepts: ${chapter.keyConcepts.join(", ")}
${chapter.formulas ? `Official Formulas: ${chapter.formulas.join(", ")}` : ""}

Student Query: "${q}"

Respond in clear, Socratic, CBSE-aligned format:
1. Direct NCERT textbook answer (definition or mathematical statement).
2. Step-by-step conceptual derivation or breakdown with examiner tips.
3. Common mistakes/traps students make in CBSE board exams on this topic.
4. Conclude with 2 related NCERT topics or follow-up questions formatted as:
[RELATED_TOPICS: Topic 1 | Topic 2]`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: systemInstruction }],
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to connect to AI Tutor. Check network.");
      }

      const data = await res.json();
      const text = data.text || "";

      // Parse related topics if present
      const relMatch = text.match(/\[RELATED_TOPICS:\s*(.*?)\]/);
      if (relMatch) {
        const topics = relMatch[1]
          .split("|")
          .map((t: string) => t.trim())
          .filter(Boolean);
        setRelatedTopics(topics);
      } else {
        setRelatedTopics(chapter.keyConcepts.slice(0, 3));
      }

      const cleanedText = text.replace(/\[RELATED_TOPICS:.*?\]/g, "").trim();
      setResponse(cleanedText);
    } catch (error: any) {
      toast({
        title: "Tutor Error",
        description: error.message || "Failed to fetch response. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast({ title: "Solution Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayVoice = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!response) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const plainText = response.replace(/[#*`_]/g, "");
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 1000));
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      toast({ title: "Speech Synthesis not supported in this browser" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Doubt Input Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Socratic NCERT AI Tutor &amp; Doubt Solver
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Grounded in {classNameLabel} {subjectName} · Chapter {chapter.chapterNumber}: {chapter.title}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 font-bold">
            CBSE 2024-25
          </span>
        </div>

        {/* Text Area with Mic and Controls */}
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask any doubt from ${chapter.title}, e.g. "Derive the quadratic formula", "Explain double circulation", or "Why did Lencho call postmen crooks?"...`}
            rows={4}
            className="text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none pr-14 leading-relaxed"
          />

          {isSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`absolute right-3 top-3 p-2 rounded-xl border transition-colors ${
                isListening
                  ? "bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isListening ? "Stop Listening" : "Voice Input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick Chapter Prompt Starters */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Suggested Textbook Questions:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {chapter.keyConcepts.slice(0, 3).map((concept, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const q = `Explain the NCERT concept of: ${concept} with step-by-step textbook examples and key exam points.`;
                  setQuestion(q);
                  handleAskTutor(q);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono shrink-0 transition-colors"
              >
                {concept.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Ask Button */}
        <Button
          onClick={() => handleAskTutor()}
          disabled={isLoading || !question.trim()}
          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Consulting NCERT Textbook &amp; Marking Scheme...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Ask NCERT Tutor
            </>
          )}
        </Button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          {/* Response Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                NCERT Verified Solution
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayVoice}
                className="h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-1.5"
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
                <span>{isPlayingAudio ? "Stop Audio" : "Voice Tutor"}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 text-slate-800 dark:text-slate-200">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>

          {/* Related Topics Chips */}
          {relatedTopics.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 pt-3">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Next Recommended NCERT Study Topics:
              </span>
              <div className="flex flex-wrap gap-2">
                {relatedTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const followUp = `Explain the NCERT syllabus topic: ${topic} in detail with equations and diagrams.`;
                      setQuestion(followUp);
                      handleAskTutor(followUp);
                    }}
                    className="px-3 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <span>{topic}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
