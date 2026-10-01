import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  FileCheck2,
  Brain,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Atom,
  Languages,
  History,
  FileText,
  Network,
  Zap,
  Timer,
  Sigma,
  ListChecks,
} from "lucide-react";

// Curriculum Data & Components
import {
  NCERT_CURRICULUM,
  NCERTClass,
  NCERTSubject,
  NCERTChapter,
} from "@/data/ncertCurriculum";
import { NCERTPdfViewer } from "@/components/ncert/NCERTPdfViewer";
import { NCERTSolutionsViewer } from "@/components/ncert/NCERTSolutionsViewer";
import { NCERTFlashcards } from "@/components/ncert/NCERTFlashcards";
import { NCERTExamSimulation } from "@/components/ncert/NCERTExamSimulation";
import { NCERTPYQsViewer } from "@/components/ncert/NCERTPYQsViewer";
import { NCERTDoubtSolver } from "@/components/ncert/NCERTDoubtSolver";
import { NCERTChapterSidebar } from "@/components/ncert/NCERTChapterSidebar";
import { NCERTChapterDigest } from "@/components/ncert/NCERTChapterDigest";
import { NCERTConceptMapper } from "@/components/ncert/NCERTConceptMapper";
import { NCERTFormulaVault } from "@/components/ncert/NCERTFormulaVault";
import { NCERTRevisionChecklist } from "@/components/ncert/NCERTRevisionChecklist";

export type NCERTTab =
  | "digest"
  | "conceptMap"
  | "tutor"
  | "simulation"
  | "pdf"
  | "solutions"
  | "flashcards"
  | "pyqs"
  | "formulas"
  | "checklist";

export default function NCERTTutor() {
  const { toast } = useToast();
  const dailyLimit = useDailyMessageLimit();

  // Class Selection (default Class 10 Board Exam)
  const [selectedClassNum, setSelectedClassNum] = useState<string>("10");

  const currentClass: NCERTClass =
    NCERT_CURRICULUM.find((c) => c.classNumber === selectedClassNum) ||
    NCERT_CURRICULUM[0];

  // Subject Selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentClass.subjects[0].id
  );

  const currentSubject: NCERTSubject =
    currentClass.subjects.find((s) => s.id === selectedSubjectId) ||
    currentClass.subjects[0];

  // Chapter Selection
  const [activeChapterId, setActiveChapterId] = useState<string>(
    currentSubject.chapters[0].id
  );

  const currentChapter: NCERTChapter =
    currentSubject.chapters.find((ch) => ch.id === activeChapterId) ||
    currentSubject.chapters[0];

  // Active Learning Mode Tab (10 Systematic modules)
  const [activeTab, setActiveTab] = useState<NCERTTab>("digest");

  // Initial Question for AI Doubt Tutor Bridge
  const [initialTutorQuestion, setInitialTutorQuestion] = useState<string>("");

  // User Completed Chapters Persistence
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_ncert_completed_chapters");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "knowdeep_ncert_completed_chapters",
        JSON.stringify(completedChapters)
      );
    } catch {
      // ignore
    }
  }, [completedChapters]);

  const toggleCompleteChapter = (chapterId: string) => {
    if (completedChapters.includes(chapterId)) {
      setCompletedChapters((prev) => prev.filter((id) => id !== chapterId));
      toast({ title: "Marked as Incomplete" });
    } else {
      setCompletedChapters((prev) => [...prev, chapterId]);
      toast({
        title: "Chapter Completed! 🎉",
        description: "Your NCERT syllabus progress has been saved.",
      });
    }
  };

  // When class changes, reset subject & chapter to valid options
  const handleClassChange = (classNum: string) => {
    setSelectedClassNum(classNum);
    const targetClass =
      NCERT_CURRICULUM.find((c) => c.classNumber === classNum) ||
      NCERT_CURRICULUM[0];
    const firstSub = targetClass.subjects[0];
    setSelectedSubjectId(firstSub.id);
    setActiveChapterId(firstSub.chapters[0].id);
  };

  // When subject changes, reset active chapter
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const targetSub = currentClass.subjects.find((s) => s.id === subjectId);
    if (targetSub && targetSub.chapters.length > 0) {
      setActiveChapterId(targetSub.chapters[0].id);
    }
  };

  // Navigate to Next / Previous Chapter
  const currentChapterIndex = currentSubject.chapters.findIndex(
    (ch) => ch.id === currentChapter.id
  );

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setActiveChapterId(currentSubject.chapters[currentChapterIndex - 1].id);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < currentSubject.chapters.length - 1) {
      setActiveChapterId(currentSubject.chapters[currentChapterIndex + 1].id);
    }
  };

  // Bridge from Concept Mapper or Exam Sim to AI Doubt Tutor
  const handleAskTutorAboutConcept = (conceptPrompt: string) => {
    setInitialTutorQuestion(conceptPrompt);
    setActiveTab("tutor");
    toast({
      title: "Sent to AI Doubt Tutor",
      description: "Concept query pre-loaded into the tutor chat.",
    });
  };

  // Render subject icon helper
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-4 h-4" />;
      case "Atom":
        return <Atom className="w-4 h-4" />;
      case "Languages":
        return <Languages className="w-4 h-4" />;
      case "History":
        return <History className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const isCurrentChapterDone = completedChapters.includes(currentChapter.id);

  // Tab definitions with systematic metadata
  const TABS_CONFIG = [
    {
      id: "digest" as const,
      label: "AI Chapter Digest",
      icon: Zap,
      activeColor: "bg-amber-500 text-slate-950 shadow-amber-500/20",
      badge: "High Yield",
    },
    {
      id: "conceptMap" as const,
      label: "Concept Mapper",
      icon: Network,
      activeColor: "bg-indigo-600 text-white shadow-indigo-500/20",
      badge: "Node Graph",
    },
    {
      id: "simulation" as const,
      label: "Exam Simulation",
      icon: Timer,
      activeColor: "bg-amber-500 text-slate-950 shadow-amber-500/20",
      badge: "Timed Test",
    },
    {
      id: "tutor" as const,
      label: "AI Doubt Tutor",
      icon: Sparkles,
      activeColor: "bg-purple-600 text-white shadow-purple-500/20",
      badge: "Voice & AI",
    },
    {
      id: "pdf" as const,
      label: "Textbook & PDF",
      icon: FileText,
      activeColor: "bg-sky-600 text-white shadow-sky-500/20",
      badge: "Official",
    },
    {
      id: "solutions" as const,
      label: `Solutions (${currentChapter.solutions.length})`,
      icon: FileCheck2,
      activeColor: "bg-emerald-600 text-white shadow-emerald-500/20",
    },
    {
      id: "flashcards" as const,
      label: `Flashcards (${currentChapter.flashcards.length})`,
      icon: Brain,
      activeColor: "bg-rose-600 text-white shadow-rose-500/20",
    },
    {
      id: "pyqs" as const,
      label: `Board PYQs (${currentChapter.pyqs.length})`,
      icon: Trophy,
      activeColor: "bg-violet-600 text-white shadow-violet-500/20",
    },
    {
      id: "formulas" as const,
      label: `Formulas (${currentChapter.formulas?.length || 0})`,
      icon: Sigma,
      activeColor: "bg-teal-600 text-white shadow-teal-500/20",
    },
    {
      id: "checklist" as const,
      label: "Revision Roadmap",
      icon: ListChecks,
      activeColor: "bg-blue-600 text-white shadow-blue-500/20",
    },
  ];

  return (
    <AppLayout title="NCERT Master Tutor & Exam Center">
      <DailyLimitDialog
        open={dailyLimit.showUpgrade}
        onOpenChange={dailyLimit.setShowUpgrade}
      />

      <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header Hub */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> NCERT Comprehensive Curriculum
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs font-mono text-muted-foreground">
                CBSE 2024-2025 Edition
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                100% Real Textbooks &amp; Solved Papers
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              NCERT Master Tutor &amp; Study Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Complete interactive chapter textbooks, AI Chapter Digest, dynamic Concept Node Mapper, timed Exam Simulations, official PDF eBooks, in-text &amp; exercise solutions, 3D flashcards, formula vaults, and past board questions across Classes 6 to 12.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right shadow-sm">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Active Chapter:</span>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                Ch {currentChapter.chapterNumber}: {currentChapter.title.slice(0, 18)}...
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right shadow-sm">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Syllabus Progress:</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {completedChapters.length} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Class Selection Segmented Strip */}
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span className="uppercase tracking-wider font-bold">Select Class:</span>
            <span>Classes 6 to 12 Available</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {NCERT_CURRICULUM.map((cls) => {
              const isSelected = cls.classNumber === selectedClassNum;
              return (
                <button
                  key={cls.classNumber}
                  type="button"
                  onClick={() => handleClassChange(cls.classNumber)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black scale-[1.02]"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{cls.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selector Bar */}
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span className="uppercase tracking-wider font-bold">Select Subject:</span>
            <span>{currentClass.subjects.length} Subjects in {currentClass.label}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {currentClass.subjects.map((sub) => {
              const isSelected = sub.id === currentSubject.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubjectChange(sub.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-amber-500 text-slate-900 dark:text-white shadow-md ring-1 ring-amber-500/30 scale-[1.01]"
                      : "bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {getSubjectIcon(sub.iconName)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold truncate block">
                      {sub.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {sub.chapters.length} Chapters
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Content Stage (Split Grid) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column: Chapter Explorer Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <NCERTChapterSidebar
              subject={currentSubject}
              activeChapterId={currentChapter.id}
              onSelectChapter={(ch) => setActiveChapterId(ch.id)}
              completedChapterIds={completedChapters}
              onToggleCompleteChapter={toggleCompleteChapter}
            />
          </div>

          {/* Right Column: Active Learning Stage & Systematic Tools (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Active Chapter Header Strip with Next/Prev and Completion Toggle */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs border border-amber-500/30 shrink-0">
                  Chapter {currentChapter.chapterNumber}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {currentChapter.title}
                  </h2>
                  {currentChapter.hindiTitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentChapter.hindiTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleCompleteChapter(currentChapter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isCurrentChapterDone
                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                  title={isCurrentChapterDone ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isCurrentChapterDone ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    }`}
                  />
                  <span>{isCurrentChapterDone ? "Completed" : "Mark Done"}</span>
                </button>

                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={handlePrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Previous Chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono px-2 text-slate-500">
                    {currentChapterIndex + 1}/{currentSubject.chapters.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === currentSubject.chapters.length - 1}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Next Chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Systematic Mode Navigation Tabs (10 Modules) */}
            <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center overflow-x-auto scrollbar-none shadow-sm">
              <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
                {TABS_CONFIG.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                        isActive
                          ? `${tab.activeColor} shadow-md scale-[1.01]`
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase font-bold ${
                            isActive
                              ? "bg-black/20 text-current"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Mode Render Stage */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${currentChapter.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Tab 1: AI Chapter Digest */}
                  {activeTab === "digest" && (
                    <NCERTChapterDigest
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                    />
                  )}

                  {/* Tab 2: Interactive Concept & Character Mapper */}
                  {activeTab === "conceptMap" && (
                    <NCERTConceptMapper
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                      onAskTutorAboutConcept={handleAskTutorAboutConcept}
                    />
                  )}

                  {/* Tab 3: Exam Simulation Mode */}
                  {activeTab === "simulation" && (
                    <NCERTExamSimulation
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                      onAskTutorAboutConcept={handleAskTutorAboutConcept}
                      onSwitchTab={(targetTab) => {
                        if (
                          targetTab === "digest" ||
                          targetTab === "conceptMap" ||
                          targetTab === "tutor" ||
                          targetTab === "simulation" ||
                          targetTab === "pdf" ||
                          targetTab === "solutions" ||
                          targetTab === "flashcards" ||
                          targetTab === "pyqs" ||
                          targetTab === "formulas" ||
                          targetTab === "checklist"
                        ) {
                          setActiveTab(targetTab as NCERTTab);
                        }
                      }}
                    />
                  )}

                  {/* Tab 4: AI Doubt Tutor */}
                  {activeTab === "tutor" && (
                    <NCERTDoubtSolver
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                      initialQuestion={initialTutorQuestion}
                    />
                  )}

                  {/* Tab 5: Textbook PDF & eBook */}
                  {activeTab === "pdf" && (
                    <NCERTPdfViewer
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                    />
                  )}

                  {/* Tab 6: Exercise Solutions */}
                  {activeTab === "solutions" && (
                    <NCERTSolutionsViewer
                      solutions={currentChapter.solutions}
                      chapterTitle={`Ch ${currentChapter.chapterNumber}: ${currentChapter.title}`}
                    />
                  )}

                  {/* Tab 7: Concept Flashcards */}
                  {activeTab === "flashcards" && (
                    <NCERTFlashcards
                      flashcards={currentChapter.flashcards}
                      chapterTitle={`Ch ${currentChapter.chapterNumber}: ${currentChapter.title}`}
                    />
                  )}

                  {/* Tab 8: Board PYQs */}
                  {activeTab === "pyqs" && (
                    <NCERTPYQsViewer
                      pyqs={currentChapter.pyqs}
                      chapterTitle={`Ch ${currentChapter.chapterNumber}: ${currentChapter.title}`}
                    />
                  )}

                  {/* Tab 9: Formulas & Law Vault */}
                  {activeTab === "formulas" && (
                    <NCERTFormulaVault
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                      onAskTutorAboutFormula={(form) =>
                        handleAskTutorAboutConcept(`Explain the derivation and NCERT application of the formula: ${form}`)
                      }
                    />
                  )}

                  {/* Tab 10: Revision Checklist & Roadmap */}
                  {activeTab === "checklist" && (
                    <NCERTRevisionChecklist
                      chapter={currentChapter}
                      classNameLabel={currentClass.label}
                      subjectName={currentSubject.name}
                      onNavigateToTab={(t) => {
                        if (
                          t === "digest" ||
                          t === "conceptMap" ||
                          t === "tutor" ||
                          t === "simulation" ||
                          t === "pdf" ||
                          t === "solutions" ||
                          t === "flashcards" ||
                          t === "pyqs" ||
                          t === "formulas" ||
                          t === "checklist"
                        ) {
                          setActiveTab(t as NCERTTab);
                        } else if (t === "quiz") {
                          setActiveTab("simulation");
                        }
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
