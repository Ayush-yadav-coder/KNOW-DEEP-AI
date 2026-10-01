import React, { useState } from "react";
import {
  Calculator,
  Search,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sigma,
  FlaskConical,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NCERTChapter } from "@/data/ncertCurriculum";
import { useToast } from "@/hooks/use-toast";

interface NCERTFormulaVaultProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
  onAskTutorAboutFormula?: (formula: string) => void;
}

export const NCERTFormulaVault: React.FC<NCERTFormulaVaultProps> = ({
  chapter,
  classNameLabel,
  subjectName,
  onAskTutorAboutFormula,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const formulas = chapter.formulas || [];

  // Categorize or generate structured items
  const items = formulas.map((f, idx) => {
    let type: "Formula" | "Law / Theorem" | "Chemical Equation" | "Definition" = "Formula";
    if (f.includes("→") || f.includes("+") && f.includes("=")) {
      type = subjectName.toLowerCase().includes("chem") || subjectName.toLowerCase().includes("sci") ? "Chemical Equation" : "Formula";
    } else if (f.toLowerCase().includes("law") || f.toLowerCase().includes("theorem") || f.toLowerCase().includes("rule")) {
      type = "Law / Theorem";
    }

    const topic = chapter.keyConcepts[idx % chapter.keyConcepts.length]?.split("(")[0]?.trim() || chapter.title;

    return {
      id: `form-${idx}`,
      formula: f,
      type,
      topic,
      notes: `Authoritative NCERT relation for ${topic}. High frequency in numericals and step-wise CBSE marking.`,
    };
  });

  const filtered = items.filter(
    (item) =>
      item.formula.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    toast({
      title: "Formula Copied",
      description: formulaText,
    });
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sigma className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Formula &amp; Scientific Laws Vault</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30">
                {formulas.length} High-Yield Formulas
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {classNameLabel} · {subjectName} · Chapter {chapter.chapterNumber}: {chapter.title}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search formula, theorem..."
            className="h-9 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {formulas.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Atom className="w-10 h-10 opacity-30 mx-auto text-amber-500" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Qualitative Chapter / Conceptual Focus
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            This chapter focuses on qualitative rules and narrative comprehension. See the Key Concepts in AI Chapter Digest or ask the AI Tutor for formula derivations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {item.topic}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300 overflow-x-auto select-all">
                  {item.formula}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.notes}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(item.formula)}
                  className="h-8 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg gap-1.5"
                >
                  {copiedFormula === item.formula ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Equation
                    </>
                  )}
                </Button>

                {onAskTutorAboutFormula && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAskTutorAboutFormula(
                        `Explain the formula "${item.formula}" from Chapter ${chapter.chapterNumber}: ${chapter.title}. Explain every variable, SI units, and give one numerical solved example.`
                      );
                    }}
                    className="h-8 text-xs border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg gap-1 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
