import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Award,
  BookOpen,
  Trophy,
  Target,
  Sparkles,
  RotateCcw,
  BarChart2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NCERTChapter } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

interface NCERTRevisionChecklistProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
  onNavigateToTab?: (tab: string) => void;
}

export const NCERTRevisionChecklist: React.FC<NCERTRevisionChecklistProps> = ({
  chapter,
  classNameLabel,
  subjectName,
  onNavigateToTab,
}) => {
  const { toast } = useToast();

  const storageKey = `knowdeep_ncert_checklist_${chapter.id}`;

  const defaultTasks = [
    {
      id: "read-theory",
      title: "Complete First Textbook Read",
      description: "Read line-by-line textbook theory including highlighted boxed activities.",
      category: "Theory",
      points: 15,
      targetTab: "pdf",
    },
    {
      id: "digest-takeaways",
      title: "Master AI Chapter Digest & Bullet Points",
      description: "Memorize key definitions, boundary conditions, and executive summary.",
      category: "Conceptual",
      points: 15,
      targetTab: "digest",
    },
    {
      id: "concept-mapper",
      title: "Explore Concept & Character Mind Map",
      description: "Verify dependencies between topics, formulas, and central themes.",
      category: "Visual",
      points: 15,
      targetTab: "conceptMap",
    },
    {
      id: "intext-solutions",
      title: "Solve All In-Text & End Exercises",
      description: `Complete all ${chapter.solutions.length} NCERT textbook questions with standard CBSE step-marking.`,
      category: "Practice",
      points: 20,
      targetTab: "solutions",
    },
    {
      id: "flashcards-memory",
      title: "Master Memory Flashcards (Active Recall)",
      description: `Cycle through all ${chapter.flashcards.length} flashcards until mastered.`,
      category: "Memory",
      points: 15,
      targetTab: "flashcards",
    },
    {
      id: "board-pyqs",
      title: "Solve 5-Year CBSE Board PYQs",
      description: `Practice the ${chapter.pyqs.length} high-frequency board examination questions.`,
      category: "Exam Prep",
      points: 20,
      targetTab: "pyqs",
    },
    {
      id: "mock-simulation",
      title: "Pass a Timed Exam Simulation (>80%)",
      description: "Test your speed, time management, and accuracy under board exam timer constraints.",
      category: "Evaluation",
      points: 20,
      targetTab: "quiz",
    },
  ];

  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedIds));
    } catch {
      // ignore
    }
  }, [checkedIds, storageKey]);

  const toggleCheck = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setCheckedIds((prev) => [...prev, id]);
      toast({
        title: "Milestone Completed! 🎉",
        description: "Your chapter mastery score has increased.",
      });
    }
  };

  const resetChecklist = () => {
    setCheckedIds([]);
    toast({ title: "Revision Checklist Reset" });
  };

  const totalPoints = defaultTasks.reduce((acc, t) => acc + t.points, 0);
  const earnedPoints = defaultTasks
    .filter((t) => checkedIds.includes(t.id))
    .reduce((acc, t) => acc + t.points, 0);
  const progressPercent = Math.round((earnedPoints / totalPoints) * 100);

  // Estimate chapter board marks weightage
  const estimatedMarks = Math.min(10, Math.max(5, Math.round(chapter.solutions.length * 0.8)));

  return (
    <div className="space-y-5">
      {/* Header with Blueprint & Progress */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> CBSE Curriculum Blueprint &amp; Revision Matrix
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Ch {chapter.chapterNumber}: {chapter.title}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Structured Chapter Mastery Checklist
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Complete each systematic NCERT preparation milestone to ensure 100% readiness for CBSE board and internal assessments.
          </p>
        </div>

        {/* Blueprint Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Board Weightage</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              ~{estimatedMarks} Marks
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Mastery Score</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {checkedIds.length} of {defaultTasks.length} Milestones Achieved
          </span>
          <span className="text-slate-500">
            {earnedPoints} / {totalPoints} Syllabus Points
          </span>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Task Items */}
      <div className="space-y-3">
        {defaultTasks.map((task) => {
          const isDone = checkedIds.includes(task.id);
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                isDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                onClick={() => toggleCheck(task.id)}
                className="flex items-start gap-3.5 cursor-pointer flex-1 select-none"
              >
                <div className="pt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        isDone
                          ? "line-through text-slate-500 dark:text-slate-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold">
                      {task.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{task.points} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {onNavigateToTab && task.targetTab && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNavigateToTab(task.targetTab)}
                  className="h-8 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 rounded-lg gap-1"
                >
                  Open Tool
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset control */}
      <div className="flex justify-end pt-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={resetChecklist}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Checklist
        </Button>
      </div>
    </div>
  );
};
