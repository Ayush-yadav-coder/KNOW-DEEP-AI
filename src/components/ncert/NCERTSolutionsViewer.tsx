import React, { useState } from "react";
import {
  FileCheck2,
  Search,
  Copy,
  Check,
  Lightbulb,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NCERTExerciseSolution } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

interface NCERTSolutionsViewerProps {
  solutions: NCERTExerciseSolution[];
  chapterTitle: string;
}

export const NCERTSolutionsViewer: React.FC<NCERTSolutionsViewerProps> = ({
  solutions,
  chapterTitle,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = solutions.filter(
    (s) =>
      s.question.toLowerCase().includes(search.toLowerCase()) ||
      s.solution.toLowerCase().includes(search.toLowerCase()) ||
      s.exerciseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Solution Copied" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar with Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official NCERT Textbook Exercise Solutions
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {chapterTitle} · {solutions.length} Solved Questions &amp; Exercises
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question, exercise..."
            className="h-9 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Solutions List */}
      <div className="space-y-4">
        {filtered.map((sol) => (
          <div
            key={sol.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            {/* Header with Exercise Number */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {sol.exerciseNumber}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleCopy(
                    sol.id,
                    `Question: ${sol.question}\n\nSolution:\n${sol.solution}`
                  )
                }
                className="h-7 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg gap-1"
              >
                {copiedId === sol.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === sol.id ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {/* Question Statement */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Question:
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {sol.question}
              </p>
            </div>

            {/* Step-by-Step Solution */}
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                Step-by-Step NCERT Solution:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {sol.solution}
              </p>
            </div>

            {/* Pro Tip / Examiner Note */}
            {sol.tip && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>CBSE Tip:</strong> {sol.tip}
                </span>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 opacity-30 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Matching Exercise Solutions
            </p>
            <p className="text-[11px] text-slate-500">
              Try searching with another keyword or exercise number like &quot;Ex 1.1&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
