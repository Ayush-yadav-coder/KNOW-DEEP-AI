import React, { useState } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  BookOpen,
  Sparkles,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NCERTChapter } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

interface NCERTPdfViewerProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
}

export const NCERTPdfViewer: React.FC<NCERTPdfViewerProps> = ({
  chapter,
  classNameLabel,
  subjectName,
}) => {
  const { toast } = useToast();
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast({ title: "Copied to Clipboard", description: formula });
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Official NCERT Document Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {classNameLabel} · {subjectName}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Chapter {chapter.chapterNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {chapter.title}
          </h2>
          {chapter.hindiTitle && (
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {chapter.hindiTitle}
            </p>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 max-w-xl">
            {chapter.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={chapter.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" /> Open Official NCERT PDF
          </a>
          <a
            href="https://ncert.nic.in/textbook.php"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> NCERT Portal
          </a>
        </div>
      </div>

      {/* Embedded Digital Reader / Mind Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Core Concepts Breakdown (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chapter Mind Map &amp; Core Syllabus Concepts
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              NCERT Rationalized Edition
            </span>
          </div>

          <div className="space-y-3">
            {chapter.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {concept}
                </p>
              </div>
            ))}
          </div>

          {/* NCERT Direct Textbook Viewer Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono flex items-center gap-1.5 font-bold">
                <FileText className="w-3.5 h-3.5 text-amber-500" /> Official Textbook Chapter eBook
              </span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Verified NCERT Publication
              </span>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-800 dark:text-slate-300 font-bold">
                Official NCERT PDF for {chapter.title} is ready to view.
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Read the authentic textbook lines, illustrative diagrams, and in-text solved examples directly from NCERT.
              </p>
              <div className="pt-2">
                <a
                  href={chapter.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Launch Chapter PDF in Full Viewer
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Formulas & Quick Reference (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {chapter.formulas && chapter.formulas.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Essential Formulas &amp; Equations
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {chapter.formulas.length} Formulas
                </span>
              </div>

              <div className="space-y-2.5">
                {chapter.formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 group"
                  >
                    <code className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 select-all overflow-x-auto">
                      {formula}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyFormula(formula)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
                      title="Copy Formula"
                    >
                      {copiedFormula === formula ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Syllabus Info Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Exam Preparation Tips
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Always write the formal statement of definitions before giving mathematical formulas in CBSE answers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Label all diagrams neatly with arrows and include SI units with every numerical answer.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  NCERT summary points at the end of each chapter frequently appear as 1-mark MCQs.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
