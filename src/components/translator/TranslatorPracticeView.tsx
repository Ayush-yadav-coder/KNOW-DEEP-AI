import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Award,
  Zap,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Brain,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
} from "./TranslatorLanguages";
import { GrammarQuizQuestion } from "./TranslatorTypes";
import { safeParseJson } from "./TranslatorUtils";

interface TranslatorPracticeViewProps {
  initialLang?: string;
}

const CATEGORIES = [
  { id: "tenses", name: "Verb Tenses & Conjugation" },
  { id: "prepositions", name: "Prepositions & Articles" },
  { id: "sentence_structure", name: "Sentence Structure & Word Order" },
  { id: "idioms_vocab", name: "Vocabulary in Context" },
  { id: "common_errors", name: "Spot the Grammatical Error" },
];

const SAMPLE_QUESTIONS: GrammarQuizQuestion[] = [
  {
    id: "q1",
    type: "multiple_choice",
    targetLanguage: "en",
    level: "B1",
    category: "tenses",
    question: "By the time the train arrived at the station, we _______ on the platform for over an hour.",
    options: [
      "had been waiting",
      "have been waiting",
      "were waiting",
      "are waiting"
    ],
    correctAnswer: "had been waiting",
    explanation: "Past Perfect Continuous ('had been waiting') is required here because the action of waiting began in the past and continued up to another specific past reference event ('the train arrived').",
  },
  {
    id: "q2",
    type: "multiple_choice",
    targetLanguage: "en",
    level: "A2",
    category: "prepositions",
    question: "She is extremely interested _______ learning international economics and European diplomacy.",
    options: ["in", "on", "at", "about"],
    correctAnswer: "in",
    explanation: "The adjective 'interested' is always paired with the preposition 'in' when referring to areas of study, hobbies, or passions.",
  },
  {
    id: "q3",
    type: "multiple_choice",
    targetLanguage: "en",
    level: "B2",
    category: "common_errors",
    question: "Identify the grammatically correct sentence:",
    options: [
      "Neither the manager nor the employees were informed about the schedule shift.",
      "Neither the manager nor the employees was informed about the schedule shift.",
      "Neither the manager or the employees was informed about the schedule shift.",
      "Neither the manager nor the employee were informed about the schedule shift."
    ],
    correctAnswer: "Neither the manager nor the employees were informed about the schedule shift.",
    explanation: "With 'Neither... nor', the verb agrees with the closer subject. Since 'the employees' (plural) is closer to the verb, the plural auxiliary 'were' is correct.",
  },
  {
    id: "q4",
    type: "multiple_choice",
    targetLanguage: "en",
    level: "C1",
    category: "sentence_structure",
    question: "Rarely _______ such exceptional dedication and linguistic fluency among new students.",
    options: [
      "have I witnessed",
      "I have witnessed",
      "did I witnessed",
      "I witnessed"
    ],
    correctAnswer: "have I witnessed",
    explanation: "When a sentence starts with a negative or restrictive adverb like 'Rarely', 'Seldom', or 'Hardly', subject-auxiliary inversion ('have I witnessed') is mandatory.",
  },
];

export const TranslatorPracticeView: React.FC<TranslatorPracticeViewProps> = ({
  initialLang = "en",
}) => {
  const { toast } = useToast();

  const [selectedLang, setSelectedLang] = useState(initialLang || "en");
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("B1");
  const [selectedCategory, setSelectedCategory] = useState("tenses");

  const [questions, setQuestions] = useState<GrammarQuizQuestion[]>(SAMPLE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Score & streaks
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(3);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const currentQ = questions[currentIndex];

  const handleGenerateNewDrill = async () => {
    setIsGeneratingQuiz(true);
    const langName = getLanguageName(selectedLang);
    const catObj = CATEGORIES.find((c) => c.id === selectedCategory);

    try {
      const prompt = `You are a certified CEFR language examiner.
Generate 4 challenging, realistic grammar practice questions for a student learning ${langName}.
CEFR Level: ${selectedLevel}.
Topic / Category: ${catObj?.name}.

Output STRICT JSON conforming to this schema:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "targetLanguage": "${selectedLang}",
    "level": "${selectedLevel}",
    "category": "${selectedCategory}",
    "question": "Question prompt text with a blank _______ or challenge",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact matching string from options",
    "explanation": "Clear, precise grammatical rule explanation for why the answer is correct"
  }
]`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction:
            "You are a grammar quiz engine. Respond strictly with a JSON array conforming to the schema.",
        }),
      });

      if (!res.ok) throw new Error("Quiz generation failed");
      const data = await res.json();
      let textResponse = data.content || data.text || "";

      const parsed = safeParseJson<GrammarQuizQuestion[]>(textResponse, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestions(parsed);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setIsQuizFinished(false);
        toast({
          title: "New Grammar Drill Ready",
          description: `Loaded ${parsed.length} questions in ${langName} (${selectedLevel}).`,
        });
      }
    } catch (err) {
      console.error("Quiz gen error:", err);
      toast({
        title: "Could Not Generate Drill",
        description: "Using standard practice set. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      toast({
        title: "🎉 Correct!",
        description: "Excellent grammar mastery!",
      });
    } else {
      setStreak(0);
      toast({
        title: "Not Quite",
        description: "Review the grammatical explanation below.",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Controls: Language, Level, Category */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Language */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-muted/80 border border-border rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          {/* CEFR Level Chips */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
            {(["A1", "A2", "B1", "B2", "C1"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Topic Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-muted/80 border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary max-w-[200px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate AI Drill Button & Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streak} Day Streak</span>
          </div>

          <Button
            size="sm"
            onClick={handleGenerateNewDrill}
            disabled={isGeneratingQuiz}
            className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white gap-1.5 shadow-sm"
          >
            {isGeneratingQuiz ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Brain className="w-3.5 h-3.5" />
            )}
            <span>Generate Drill</span>
          </Button>
        </div>
      </div>

      {/* Main Practice Question Stage */}
      {!isQuizFinished ? (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header with progress */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Grammar Practice · {selectedLevel} Level
              </span>
              <p className="text-xs text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-foreground">
              Score: <span className="text-emerald-500 font-extrabold">{score}</span> / {questions.length}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="py-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed">
              {currentQ?.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ?.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;

              let btnStyle = "bg-muted/30 border-border/80 hover:border-primary/50 text-foreground";
              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 line-through";
                } else {
                  btnStyle = "bg-muted/10 border-border/40 opacity-50";
                }
              } else if (isSelected) {
                btnStyle = "bg-primary/15 border-primary text-primary font-bold shadow-xs";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-background/80 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswerSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Action / Explanation */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            {!isAnswerSubmitted ? (
              <div className="flex items-center justify-end">
                <Button
                  size="lg"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="rounded-2xl px-6 font-semibold"
                >
                  Check Answer
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Explanation Card */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="text-xs font-bold uppercase text-primary flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Linguistic Rule Explanation:
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {currentQ?.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    size="lg"
                    onClick={handleNextQuestion}
                    className="rounded-2xl px-6 gap-2 font-semibold bg-primary text-primary-foreground"
                  >
                    <span>{currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Summary Stage */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground">Grammar Practice Complete!</h2>
            <p className="text-sm text-muted-foreground">
              You scored <span className="font-bold text-foreground">{score}</span> out of{" "}
              <span className="font-bold text-foreground">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              variant="outline"
              onClick={handleRestart}
              className="rounded-2xl gap-2 font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry This Drill</span>
            </Button>

            <Button
              size="lg"
              onClick={handleGenerateNewDrill}
              className="rounded-2xl gap-2 font-semibold bg-primary text-primary-foreground"
            >
              <Sparkles className="w-4 h-4" />
              <span>New AI Drill</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
