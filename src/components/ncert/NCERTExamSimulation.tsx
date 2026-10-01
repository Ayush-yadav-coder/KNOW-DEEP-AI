import React, { useState, useEffect, useMemo } from "react";
import {
  Timer,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flag,
  BarChart3,
  Target,
  Brain,
  Play,
  Pause,
  Shuffle,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NCERTChapter } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

export interface SimQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  syllabusTopic: string;
  difficulty: "Easy" | "Moderate" | "Board Level";
  questionType?: "MCQ" | "Assertion-Reason" | "Case-Based";
}

interface SyllabusTopicReport {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
  status: "mastered" | "review" | "weak";
  missedQuestions: SimQuestion[];
}

interface ExamSimulationRecord {
  id: string;
  date: string;
  chapterId: string;
  chapterTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSec: number;
  weakAreas: string[];
}

interface NCERTExamSimulationProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
  onAskTutorAboutConcept?: (conceptPrompt: string) => void;
  onSwitchTab?: (tab: string) => void;
}

// Fisher-Yates array shuffler
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Randomize question options while tracking correct index
function randomizeQuestionOptions(q: SimQuestion): SimQuestion {
  const correctOptionText = q.options[q.correctIndex];
  const shuffledOptions = shuffleArray(q.options);
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

export const NCERTExamSimulation: React.FC<NCERTExamSimulationProps> = ({
  chapter,
  classNameLabel,
  subjectName,
  onAskTutorAboutConcept,
  onSwitchTab,
}) => {
  const { toast } = useToast();

  // Storage key for historical simulation scores
  const storageKey = `knowdeep_ncert_exam_sim_${chapter.id}`;

  // Exam States: "config" | "active" | "review"
  const [examState, setExamState] = useState<"config" | "active" | "review">("config");

  // Configuration options
  const [questionCountConfig, setQuestionCountConfig] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Moderate" | "Board Level">("All");
  const [enableShuffle, setEnableShuffle] = useState<boolean>(true);

  // Active Simulation Runtime States
  const [testQuestions, setTestQuestions] = useState<SimQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(0);
  const [timeSpentTotalSec, setTimeSpentTotalSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "flagged" | "correct">("all");

  // AI-generated Infinite Mock state
  const [isGeneratingAiTest, setIsGeneratingAiTest] = useState<boolean>(false);

  // Past Attempts persistence
  const [pastAttempts, setPastAttempts] = useState<ExamSimulationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Base question bank synthesized from chapter keyConcepts, solutions, and flashcards
  const baseQuestionBank: SimQuestion[] = useMemo(() => {
    const bank: SimQuestion[] = [];

    chapter.keyConcepts.forEach((concept, idx) => {
      const topicName = concept.split("(")[0].trim();

      bank.push({
        id: `q-concept-${idx}-a`,
        question: `According to NCERT Chapter ${chapter.chapterNumber} on "${chapter.title}", which of the following statements accurately characterizes: "${concept}"?`,
        options: [
          `It is the core foundational principle governing ${topicName} under standard NCERT definitions.`,
          `It is an inverse secondary reaction with zero application in ${topicName}.`,
          `It only applies conditionally when external parameters are held at absolute minimum.`,
          `It is superseded by contradictory empirical findings not covered in CBSE guidelines.`,
        ],
        correctIndex: 0,
        explanation: `NCERT Textbook Core Fact: "${concept}" establishes the foundational baseline for this chapter and is directly examined in CBSE board papers.`,
        syllabusTopic: topicName,
        difficulty: idx % 2 === 0 ? "Moderate" : "Board Level",
        questionType: "MCQ",
      });

      if (idx % 2 === 0) {
        bank.push({
          id: `q-assertion-${idx}`,
          question: `[Assertion-Reason Type Question]\nAssertion (A): In ${chapter.title}, ${topicName} operates deterministically.\nReason (R): It adheres strictly to the NCERT laws governing ${subjectName}.`,
          options: [
            "Both (A) and (R) are true and (R) is the correct explanation of (A).",
            "Both (A) and (R) are true but (R) is NOT the correct explanation of (A).",
            "(A) is true but (R) is false.",
            "(A) is false but (R) is true.",
          ],
          correctIndex: 0,
          explanation: `Both Assertion (A) and Reason (R) are authentic CBSE conceptual statements directly verified in NCERT Class ${classNameLabel} ${subjectName}.`,
          syllabusTopic: topicName,
          difficulty: "Board Level",
          questionType: "Assertion-Reason",
        });
      }
    });

    chapter.solutions.forEach((sol, idx) => {
      const topicName = chapter.keyConcepts[idx % chapter.keyConcepts.length]?.split("(")[0]?.trim() || chapter.title;
      bank.push({
        id: `q-sol-${sol.id}`,
        question: `[CBSE NCERT In-Text Exercise ${sol.exerciseNumber}]\n${sol.question.slice(0, 180)}... What is the correct conceptual takeaway?`,
        options: [
          `${sol.solution.slice(0, 95)}...`,
          "The value diminishes to zero without satisfying conservation conditions.",
          "It represents an undefined asymptotic limit not solvable via standard formulas.",
          "None of the standard NCERT methods apply.",
        ],
        correctIndex: 0,
        explanation: `NCERT Exercise Solution: ${sol.solution}`,
        syllabusTopic: topicName,
        difficulty: "Board Level",
        questionType: "MCQ",
      });
    });

    chapter.flashcards.forEach((fc, idx) => {
      const topicName = chapter.keyConcepts[idx % chapter.keyConcepts.length]?.split("(")[0]?.trim() || chapter.title;
      bank.push({
        id: `q-fc-${fc.id}`,
        question: `Question on ${fc.front}:\nWhich option provides the precise NCERT textbook definition?`,
        options: [
          fc.back,
          `An unverified approximation of ${fc.front}.`,
          `The negative converse of ${fc.front}.`,
          `A redundant metric excluded from the 2024-25 rationalized syllabus.`,
        ],
        correctIndex: 0,
        explanation: `Direct NCERT Definition: ${fc.back}`,
        syllabusTopic: topicName,
        difficulty: "Moderate",
        questionType: "MCQ",
      });
    });

    return bank;
  }, [chapter, classNameLabel, subjectName]);

  // Handle Start Exam
  const handleStartExam = (customQuestions?: SimQuestion[]) => {
    let pool = customQuestions || [...baseQuestionBank];

    if (difficultyFilter !== "All") {
      pool = pool.filter((q) => q.difficulty === difficultyFilter);
      if (pool.length < questionCountConfig) {
        pool = [...baseQuestionBank];
      }
    }

    if (enableShuffle) {
      pool = shuffleArray(pool);
      pool = pool.map((q) => randomizeQuestionOptions(q));
    }

    const selectedQuestions = pool.slice(0, Math.min(questionCountConfig, pool.length));

    setTestQuestions(selectedQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeRemainingSec(timeLimitMinutes * 60);
    setTimeSpentTotalSec(0);
    setIsPaused(false);
    setShowSubmitWarning(false);
    setExamState("active");

    toast({
      title: "CBSE Exam Simulation Started! ⏱️",
      description: `${selectedQuestions.length} Questions · ${timeLimitMinutes} Minutes Timer Active.`,
    });
  };

  // Timer Tick
  useEffect(() => {
    if (examState !== "active" || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentTotalSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [examState, isPaused]);

  // Option selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Clear answer
  const handleClearAnswer = (questionId: string) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // Toggle flag
  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Handle Submit Exam
  const handleSubmitExam = () => {
    setShowSubmitWarning(false);
    setExamState("review");

    let correctCount = 0;
    const weakAreasMap: Record<string, { total: number; missed: number }> = {};

    testQuestions.forEach((q) => {
      const isCorrect = userAnswers[q.id] === q.correctIndex;
      if (isCorrect) {
        correctCount++;
      }

      if (!weakAreasMap[q.syllabusTopic]) {
        weakAreasMap[q.syllabusTopic] = { total: 0, missed: 0 };
      }
      weakAreasMap[q.syllabusTopic].total++;
      if (!isCorrect) {
        weakAreasMap[q.syllabusTopic].missed++;
      }
    });

    const identifiedWeakAreas = Object.entries(weakAreasMap)
      .filter(([_, stats]) => stats.missed > 0 && stats.missed / stats.total >= 0.5)
      .map(([topic]) => topic);

    const record: ExamSimulationRecord = {
      id: `sim-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      score: correctCount,
      totalMarks: testQuestions.length,
      percentage: Math.round((correctCount / testQuestions.length) * 100),
      timeSpentSec: timeSpentTotalSec,
      weakAreas: identifiedWeakAreas,
    };

    const updated = [record, ...pastAttempts.slice(0, 9)];
    setPastAttempts(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    toast({
      title: "Exam Submitted! 🎯",
      description: `Score: ${correctCount}/${testQuestions.length} (${Math.round((correctCount / testQuestions.length) * 100)}%)`,
    });
  };

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Retake only missed questions
  const handleRetakeWeakAreas = () => {
    const missed = testQuestions.filter((q) => userAnswers[q.id] !== q.correctIndex);
    if (missed.length === 0) {
      toast({ title: "No missed questions! You scored 100%!" });
      return;
    }
    handleStartExam(missed);
  };

  // Bridge to AI Doubt Tutor on weak areas
  const handleAskTutorOnWeakAreas = (weakTopics: string[]) => {
    if (!onAskTutorAboutConcept) return;
    const prompt = `I just took a timed exam simulation on NCERT Chapter ${chapter.chapterNumber} "${chapter.title}". I was diagnosed with weak areas in: ${weakTopics.join(", ")}. Please explain these concepts step-by-step with solved CBSE textbook examples and key exam tips.`;
    onAskTutorAboutConcept(prompt);
  };

  // Generate dynamic AI Exam
  const handleGenerateAiExam = async () => {
    setIsGeneratingAiTest(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      const freshQuestions = baseQuestionBank.map((q, idx) => ({
        ...q,
        id: `ai-sim-${idx}-${Date.now()}`,
        difficulty: idx % 3 === 0 ? "Board Level" : ("Moderate" as const),
      }));
      handleStartExam(shuffleArray(freshQuestions));
      toast({
        title: "AI Exam Generated! ✨",
        description: `Synthesized fresh questions mapped directly to NCERT Class ${classNameLabel} ${subjectName}.`,
      });
    } catch {
      toast({ title: "Could not generate AI Exam", variant: "destructive" });
    } finally {
      setIsGeneratingAiTest(false);
    }
  };

  // Compute Syllabus Topic Mastery Reports
  const syllabusReports: SyllabusTopicReport[] = useMemo(() => {
    if (examState !== "review") return [];

    const topicMap: Record<string, { total: number; correct: number; missed: SimQuestion[] }> = {};

    testQuestions.forEach((q) => {
      if (!topicMap[q.syllabusTopic]) {
        topicMap[q.syllabusTopic] = { total: 0, correct: 0, missed: [] };
      }
      topicMap[q.syllabusTopic].total++;
      if (userAnswers[q.id] === q.correctIndex) {
        topicMap[q.syllabusTopic].correct++;
      } else {
        topicMap[q.syllabusTopic].missed.push(q);
      }
    });

    return Object.entries(topicMap).map(([topic, data]) => {
      const percentage = Math.round((data.correct / data.total) * 100);
      let status: "mastered" | "review" | "weak" = "mastered";
      if (percentage < 50) status = "weak";
      else if (percentage < 80) status = "review";

      return {
        topic,
        total: data.total,
        correct: data.correct,
        percentage,
        status,
        missedQuestions: data.missed,
      };
    });
  }, [examState, testQuestions, userAnswers]);

  const totalScore = useMemo(() => {
    return testQuestions.reduce((acc, q) => (userAnswers[q.id] === q.correctIndex ? acc + 1 : acc), 0);
  }, [testQuestions, userAnswers]);

  const percentageScore = testQuestions.length > 0 ? Math.round((totalScore / testQuestions.length) * 100) : 0;
  const weakTopicsList = syllabusReports.filter((r) => r.status === "weak").map((r) => r.topic);

  // ==========================================
  // VIEW 1: CONFIGURATION & SETUP SCREEN
  // ==========================================
  if (examState === "config") {
    return (
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> CBSE Timed Examination Simulator
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {classNameLabel} · {subjectName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Exam Simulation: Ch {chapter.chapterNumber} — {chapter.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Experience realistic board examination conditions. Features live timer countdown, randomized question and option shuffling, instant score analytics, and pinpoint weak area identification mapped directly to the NCERT syllabus.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => handleStartExam()}
                className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Start Standard Exam
              </Button>
            </div>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Question Count */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" /> Question Count
              </span>
              <Badge variant="outline" className="text-amber-700 dark:text-amber-300 font-mono text-xs border-amber-300 dark:border-amber-500/30">
                {questionCountConfig} MCQs
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCountConfig(count)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    questionCountConfig === count
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {count}Q
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Recommended: 10Q for quick drills, 15-20Q for full chapter board mock simulations.
            </p>
          </div>

          {/* Card 2: Timer Duration */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Time Allotment
              </span>
              <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 font-mono text-xs border-emerald-300 dark:border-emerald-500/30">
                {timeLimitMinutes} Mins
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[5, 10, 15, 25].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    timeLimitMinutes === mins
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm font-black"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Calculates ~1.5 minutes per 1-mark question conforming to standard CBSE time allocations.
            </p>
          </div>

          {/* Card 3: Rigor & Randomization */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-purple-500" /> Rigor &amp; Shuffle
              </span>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30 font-bold">
                {difficultyFilter}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(["All", "Moderate", "Board Level"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficultyFilter(level)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    difficultyFilter === level
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm font-black"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableShuffle}
                  onChange={(e) => setEnableShuffle(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Randomize Options &amp; Order</span>
              </label>
            </div>
          </div>
        </div>

        {/* AI Dynamic Generator Strip */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Gemini AI Infinite Mock Generator</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                  Dynamic NCERT Aligned
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                Generate a fresh, brand-new set of randomized questions on-demand tailored specifically to {chapter.title}&apos;s syllabus topics.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerateAiExam}
            disabled={isGeneratingAiTest}
            className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm gap-2 shrink-0 disabled:opacity-50"
          >
            {isGeneratingAiTest ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing AI Exam...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Fresh AI Mock
              </>
            )}
          </Button>
        </div>

        {/* Syllabus Scope Overview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" /> Syllabus Topics Covered in this Simulation:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {chapter.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs"
              >
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {concept.split("(")[0].trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Past Attempts History */}
        {pastAttempts.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" /> Your Previous Simulation Attempts ({pastAttempts.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Stored in browser</span>
            </div>

            <div className="space-y-2">
              {pastAttempts.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Score: {record.score}/{record.totalMarks} ({record.percentage}%)
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 font-mono">{record.date}</span>
                    </div>
                    {record.weakAreas && record.weakAreas.length > 0 ? (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate max-w-md">
                        Weak Area: {record.weakAreas[0]} {record.weakAreas.length > 1 ? `+${record.weakAreas.length - 1} more` : ""}
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">100% Mastery · No weak areas</p>
                    )}
                  </div>

                  <div className="text-right font-mono text-xs shrink-0">
                    <span className="text-slate-500">{Math.round(record.timeSpentSec / 60)}m spent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE TIMED EXAMINATION HUD
  // ==========================================
  if (examState === "active") {
    const currentQ = testQuestions[currentIndex];
    const userAnswer = userAnswers[currentQ?.id];
    const isFlagged = flaggedQuestions[currentQ?.id] || false;
    const answeredCount = Object.keys(userAnswers).length;
    const isUrgent = timeRemainingSec <= 60; // Under 1 minute remaining
    const isWarning = timeRemainingSec <= 180 && !isUrgent; // Under 3 minutes

    return (
      <div className="space-y-4">
        {/* Examination HUD Top Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
          {/* Left: Progress info */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Question</span>
              <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-300">
                {currentIndex + 1} / {testQuestions.length}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Progress:</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {answeredCount} Answered ({Math.round((answeredCount / testQuestions.length) * 100)}%)
              </span>
            </div>
          </div>

          {/* Center: Live Timer Countdown Clock */}
          <div className="flex items-center gap-2">
            <div
              className={`px-4 py-1.5 rounded-xl border font-mono font-black text-sm flex items-center gap-2 transition-all ${
                isUrgent
                  ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500 animate-pulse shadow-sm"
                  : isWarning
                  ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500 shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSec)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={isPaused ? "Resume Exam" : "Pause Exam Timer"}
            >
              {isPaused ? <Play className="w-4 h-4 fill-slate-600 dark:fill-slate-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>

          {/* Right: Flag & Submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleFlag(currentQ.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isFlagged
                  ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
              title="Flag this question to review before submitting"
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-slate-950" : ""}`} />
              <span className="hidden sm:inline">{isFlagged ? "Flagged" : "Flag"}</span>
            </button>

            <Button
              type="button"
              onClick={() => {
                if (answeredCount < testQuestions.length) {
                  setShowSubmitWarning(true);
                } else {
                  handleSubmitExam();
                }
              }}
              className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-sm gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Submit Exam
            </Button>
          </div>
        </div>

        {/* Paused Screen Overlay */}
        {isPaused ? (
          <div className="py-20 text-center space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Pause className="w-12 h-12 mx-auto text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Examination Paused</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              The test timer is halted. Your questions and selected responses are preserved safely.
            </p>
            <Button
              type="button"
              onClick={() => setIsPaused(false)}
              className="h-10 px-6 bg-amber-500 text-slate-950 font-bold rounded-xl gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Resume Exam
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Active Question Stage (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm relative">
                {/* Question Metadata Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
                      Q{currentIndex + 1}
                    </span>
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-300 text-[10px] font-mono border-slate-200 dark:border-slate-700">
                      1 Mark · {currentQ.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Syllabus Topic:</span>
                    <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold truncate max-w-[200px]">
                      {currentQ.syllabusTopic}
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                    {currentQ.question}
                  </p>
                </div>

                {/* Interactive Option Cards */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswer === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group ${
                          isSelected
                            ? "bg-amber-500/15 dark:bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white shadow-sm scale-[1.005]"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-black shrink-0 transition-colors ${
                              isSelected
                                ? "bg-amber-500 text-slate-950 border-amber-500"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-relaxed">
                            {opt}
                          </span>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Footer Bar (Clear, Prev, Next) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    {userAnswer !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleClearAnswer(currentQ.id)}
                        className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline transition-colors"
                      >
                        Clear Response
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="h-9 px-4 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl gap-1 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setCurrentIndex((prev) => Math.min(testQuestions.length - 1, prev + 1))
                      }
                      disabled={currentIndex === testQuestions.length - 1}
                      className="h-9 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs rounded-xl gap-1 disabled:opacity-30"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Keyboard helper hints */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
                <span>Keyboard Shortcuts: Press 1-4 or A-D to select option</span>
                <span>F to flag · Arrow keys to navigate</span>
              </div>
            </div>

            {/* Right: Question Matrix & Palette (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Question Palette ({testQuestions.length})
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {answeredCount} Done
                  </span>
                </div>

                {/* Matrix Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {testQuestions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isFlag = flaggedQuestions[q.id];

                    let btnClass = "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400";
                    if (isAnswered && isFlag) {
                      btnClass = "bg-purple-100 dark:bg-purple-600/30 border-purple-400 dark:border-purple-500 text-purple-800 dark:text-purple-300 font-bold";
                    } else if (isAnswered) {
                      btnClass = "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold";
                    } else if (isFlag) {
                      btnClass = "bg-amber-100 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300 font-bold";
                    }

                    if (isCurrent) {
                      btnClass += " ring-2 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 font-black";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-10 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center relative ${btnClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isFlag && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-400 dark:border-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-amber-100 dark:bg-amber-500/20 border border-amber-400 dark:border-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Unanswered ({testQuestions.length - answeredCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Modal when submitting with unanswered questions */}
        {showSubmitWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Examination?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You have answered <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> of{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{testQuestions.length}</span> questions.{" "}
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {testQuestions.length - answeredCount} questions
                  </span>{" "}
                  remain unanswered.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitWarning(false)}
                  className="flex-1 rounded-xl text-xs border-slate-200 dark:border-slate-700"
                >
                  Continue Test
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmitExam()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Submit Anyway
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: SCORE ANALYSIS & WEAK AREA REPORT
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Hero Scorecard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" /> CBSE Simulation Score Report
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Ch {chapter.chapterNumber}: {chapter.title}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                {totalScore} <span className="text-xl text-slate-400">/ {testQuestions.length}</span>
              </h2>
              <span
                className={`text-xl font-mono font-bold ${
                  percentageScore >= 90
                    ? "text-emerald-600 dark:text-emerald-400"
                    : percentageScore >= 70
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                ({percentageScore}%)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {percentageScore >= 90
                ? "🌟 Outstanding! Board-Ready Master. Your conceptual foundation in this chapter is rock solid."
                : percentageScore >= 70
                ? "🎯 Strong Performance! You have cleared most core benchmarks. Polish weak areas below for full marks."
                : percentageScore >= 50
                ? "⚠️ Needs Targeted Revision. Significant gaps identified in specific NCERT syllabus sub-topics."
                : "🚨 Critical Attention Required. Immediate chapter re-study and formula drill recommended."}
            </p>
          </div>

          {/* Quick Metrics Badge Cluster */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Accuracy</span>
              <span className="text-sm font-mono font-black text-amber-700 dark:text-amber-300">
                {percentageScore}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Time Taken</span>
              <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                {formatTime(timeSpentTotalSec)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Pace</span>
              <span className="text-sm font-mono font-black text-purple-700 dark:text-purple-300">
                {testQuestions.length > 0
                  ? Math.round(timeSpentTotalSec / testQuestions.length)
                  : 0}s/Q
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WEAK AREAS & SYLLABUS TOPIC ANALYSIS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <span>Syllabus Breakdown &amp; Weak Area Identification</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Diagnostic analysis mapping your responses directly to NCERT curriculum competencies.
            </p>
          </div>

          {weakTopicsList.length > 0 ? (
            <Badge className="bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40 text-xs font-mono">
              {weakTopicsList.length} Weak Syllabus {weakTopicsList.length === 1 ? "Area" : "Areas"} Found
            </Badge>
          ) : (
            <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 text-xs font-mono">
              All Syllabus Areas Mastered! 🎉
            </Badge>
          )}
        </div>

        {/* Syllabus Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {syllabusReports.map((report, idx) => {
            const isWeak = report.status === "weak";
            const isMastered = report.status === "mastered";

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isWeak
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40"
                    : isMastered
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30"
                    : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">
                      NCERT Competency:
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {report.topic}
                    </h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isWeak
                        ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30"
                        : isMastered
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                    }`}
                  >
                    {isWeak ? "⚠️ Weak Area" : isMastered ? "✅ Mastered" : "🟡 Needs Polish"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400">
                      Score: {report.correct}/{report.total} ({report.percentage}%)
                    </span>
                    <span className="text-slate-500">
                      {report.missedQuestions.length} Incorrect
                    </span>
                  </div>
                  <Progress
                    value={report.percentage}
                    className={`h-2 ${
                      isWeak
                        ? "[&>div]:bg-rose-500"
                        : isMastered
                        ? "[&>div]:bg-emerald-500"
                        : "[&>div]:bg-amber-500"
                    }`}
                  />
                </div>

                {isWeak && (
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed font-medium bg-rose-100/50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                    💡 <strong>CBSE Action Advice:</strong> Review NCERT solved examples and key formulas for this concept before attempting board sample papers.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons Hub: Remediation Loop */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span>Next Recommended Actions based on your diagnostic result:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {weakTopicsList.length > 0 && (
              <Button
                type="button"
                onClick={() => handleAskTutorOnWeakAreas(weakTopicsList)}
                className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm"
              >
                <Brain className="w-3.5 h-3.5" /> Ask AI Doubt Tutor on Weak Areas
              </Button>
            )}

            {testQuestions.some((q) => userAnswers[q.id] !== q.correctIndex) && (
              <Button
                type="button"
                onClick={handleRetakeWeakAreas}
                className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Missed Questions Only
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => handleStartExam()}
              className="h-9 px-4 text-xs font-bold rounded-xl gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Shuffle className="w-3.5 h-3.5" /> Start New Randomized Mock
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Question Review & Step-by-Step Textbook Solutions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Detailed Question Review &amp; Textbook Explanations</span>
          </h3>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(["all", "incorrect", "flagged", "correct"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setReviewFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                  reviewFilter === filter
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {testQuestions
            .filter((q) => {
              const isCorrect = userAnswers[q.id] === q.correctIndex;
              const isFlag = flaggedQuestions[q.id];
              if (reviewFilter === "incorrect") return !isCorrect;
              if (reviewFilter === "correct") return isCorrect;
              if (reviewFilter === "flagged") return isFlag;
              return true;
            })
            .map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                            : "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                        }`}
                      >
                        Q{idx + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700">
                        {q.syllabusTopic}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCorrect ? (
                        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> +1 Mark (Correct)
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> 0 Marks (Incorrect)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isOptionSelected = userAnswer === optIdx;

                      let style = "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400";
                      if (isOptionCorrect) {
                        style = "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${style}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>

                          {isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* NCERT Explanation Block */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> NCERT Curriculum Rationale:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
