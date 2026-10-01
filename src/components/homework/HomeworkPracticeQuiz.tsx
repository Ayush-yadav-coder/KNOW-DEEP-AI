import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Award, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface HomeworkPracticeQuizProps {
  questions: QuizQuestion[];
  subjectName: string;
  onGenerateMore?: () => void;
}

export const HomeworkPracticeQuiz: React.FC<HomeworkPracticeQuizProps> = ({
  questions,
  subjectName,
  onGenerateMore,
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Knowledge Check &amp; Practice Quiz</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                {questions.length} Questions
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Test your understanding of the solved {subjectName} problem with instant feedback
            </p>
          </div>
        </div>

        {/* Score Badge */}
        {showResults && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400">Score:</span>
            <span className="text-sm font-mono font-black text-amber-300">
              {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selectedOpt = userAnswers[q.id];
          const isAnswered = selectedOpt !== undefined;

          return (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
                  Q{qIdx + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOpt === optIdx;
                  const isCorrect = optIdx === q.correctIndex;

                  let optStyle =
                    "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700";

                  if (showResults) {
                    if (isCorrect) {
                      optStyle =
                        "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optStyle =
                        "bg-rose-500/20 border-rose-500/50 text-rose-200 font-bold";
                    }
                  } else if (isSelected) {
                    optStyle =
                      "bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={showResults}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="truncate">{opt}</span>
                      </span>

                      {showResults && (
                        <span className="shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isSelected ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {showResults && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Explanation:
                  </p>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Reveal Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400 font-mono">
          {Object.keys(userAnswers).length} of {questions.length} answered
        </span>

        <div className="flex items-center gap-2">
          {!showResults ? (
            <Button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Grade My Answers
            </Button>
          ) : (
            <Button
              onClick={() => {
                setShowResults(false);
                setUserAnswers({});
              }}
              variant="outline"
              className="h-9 text-xs rounded-xl gap-1 bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
