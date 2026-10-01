import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NCERTPYQuestion } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

interface NCERTPYQsViewerProps {
  pyqs: NCERTPYQuestion[];
  chapterTitle: string;
}

export const NCERTPYQsViewer: React.FC<NCERTPYQsViewerProps> = ({
  pyqs,
  chapterTitle,
}) => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "PYQ Copied to Clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!pyqs || pyqs.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Trophy className="w-10 h-10 opacity-30 mx-auto text-amber-500" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          No Previous Year Questions Tagged
        </p>
        <p className="text-[11px] text-slate-500">
          Check back or ask the AI Tutor for previous year question patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>CBSE Board Previous Year Questions (PYQs)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                5-Year Trend
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {chapterTitle} · {pyqs.length} High-Yield Past Examination Questions
            </p>
          </div>
        </div>
      </div>

      {/* PYQ Cards */}
      <div className="space-y-4">
        {pyqs.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            {/* Header with Year, Marks & Frequency */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.year}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {item.marks} Marks
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> {item.frequencyNote}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      item.id,
                      `Q: ${item.question}\n\nModel Answer:\n${item.solution}`
                    )
                  }
                  className="h-7 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg gap-1"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Question */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                Board Question:
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {item.question}
              </p>
            </div>

            {/* Model Solution */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block mb-1">
                CBSE Marking Scheme &amp; Model Answer:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {item.solution}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
