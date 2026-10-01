import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NCERTMCQ } from "@/data/ncertCurriculum";

interface NCERTExamQuizProps {
  mcqs: NCERTMCQ[];
  chapterTitle: string;
}

export const NCERTExamQuiz: React.FC<NCERTExamQuizProps> = ({
  mcqs,
  chapterTitle,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Sync if chapter changes
  React.useEffect(() => {
    setSelectedAnswers({});
    setShowResults(false);
  }, [mcqs]);

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-2 rounded-3xl bg-slate-900 border border-slate-800">
        <Award className="w-10 h-10 opacity-30 mx-auto text-amber-400" />
        <p className="text-xs font-bold text-slate-400">No Mock Exam Questions Yet</p>
        <p className="text-[11px] text-slate-500">
          Generating mock questions for this chapter.
        </p>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    mcqs.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / mcqs.length) * 100);
  const allAnswered = Object.keys(selectedAnswers).length === mcqs.length;

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Scorecard */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CBSE Board Pattern Mock Examination</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                1-Mark MCQs
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {chapterTitle} · {mcqs.length} Objective Questions
            </p>
          </div>
        </div>

        {showResults ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Score:</span>
              <span className="text-lg font-mono font-black text-amber-300">
                {score} / {mcqs.length} ({percentage}%)
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleReset}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Test
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className={`h-9 px-5 text-xs font-bold rounded-xl shadow-lg transition-all ${
              allAnswered
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {allAnswered
              ? "Submit & Evaluate Test"
              : `Answered ${Object.keys(selectedAnswers).length} of ${mcqs.length}`}
          </Button>
        )}
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {mcqs.map((q, qIndex) => {
          const userAnswer = selectedAnswers[q.id];
          const isAnswered = userAnswer !== undefined;

          return (
            <div
              key={q.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
            >
              {/* Question Line */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  Q{qIndex + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIndex) => {
                  const isSelected = userAnswer === optIndex;
                  const isCorrect = optIndex === q.correctIndex;

                  let buttonStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700";

                  if (showResults) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                    }
                  } else if (isSelected) {
                    buttonStyle = "bg-amber-500/20 border-amber-500 text-amber-300 font-bold";
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      disabled={showResults}
                      className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>

                      {showResults && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal after Submission */}
              {showResults && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> NCERT Explanation:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
