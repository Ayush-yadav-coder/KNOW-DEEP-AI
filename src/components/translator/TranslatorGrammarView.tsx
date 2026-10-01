import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  BookOpen,
  Volume2,
  Trash2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
} from "./TranslatorLanguages";
import { GrammarAnalysisResult, GrammarIssue } from "./TranslatorTypes";
import { safeParseJson } from "./TranslatorUtils";

interface TranslatorGrammarViewProps {
  initialText?: string;
  onOpenVoiceTrainer?: (text: string, lang: string) => void;
}

const GOALS = [
  { id: "all_errors", label: "Fix All Errors", desc: "Correct grammar, spelling & punctuation" },
  { id: "clarity", label: "Clarity & Brevity", desc: "Remove fluff and simplify dense phrasing" },
  { id: "business", label: "Executive Business", desc: "Polite, authoritative & corporate" },
  { id: "academic", label: "Academic Precision", desc: "Elevate scholarly vocabulary & flow" },
  { id: "friendly", label: "Warm & Friendly", desc: "Approachable, conversational & engaging" },
];

export const TranslatorGrammarView: React.FC<TranslatorGrammarViewProps> = ({
  initialText = "",
  onOpenVoiceTrainer,
}) => {
  const { toast } = useToast();

  const [language, setLanguage] = useState("en");
  const [selectedGoal, setSelectedGoal] = useState("all_errors");
  const [inputText, setInputText] = useState(
    initialText ||
      "Their is many reasons why people loves to travel around the world. It help you learn about new cultures and makes your life much more better."
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GrammarAnalysisResult | null>({
    originalText:
      "Their is many reasons why people loves to travel around the world. It help you learn about new cultures and makes your life much more better.",
    correctedText:
      "There are many reasons why people love to travel around the world. It helps you learn about new cultures and makes your life much better.",
    readabilityScore: 88,
    overallQuality: "Needs Improvement",
    toneAnalysis: "Informative and conversational with minor grammatical inconsistencies.",
    issues: [
      {
        id: "issue-1",
        type: "spelling",
        originalText: "Their is",
        suggestedText: "There are",
        explanation: "'Their' is a possessive pronoun; use the existential 'There are' to agree with the plural noun 'reasons'.",
        applied: false,
      },
      {
        id: "issue-2",
        type: "grammar",
        originalText: "people loves",
        suggestedText: "people love",
        explanation: "'People' is a plural subject, requiring the base verb form 'love' instead of third-person singular 'loves'.",
        applied: false,
      },
      {
        id: "issue-3",
        type: "grammar",
        originalText: "It help",
        suggestedText: "It helps",
        explanation: "Singular pronoun 'It' requires the third-person singular verb 'helps'.",
        applied: false,
      },
      {
        id: "issue-4",
        type: "clarity",
        originalText: "more better",
        suggestedText: "better",
        explanation: "'Better' is already a comparative adjective; pairing it with 'more' creates a double comparative error.",
        applied: false,
      },
    ],
    improvedAlternatives: [
      "There are countless reasons why people love exploring the world; traveling enriches cultural understanding and transforms perspectives.",
      "Exploring new destinations offers tremendous personal growth, exposing travelers to diverse global cultures.",
      "Why do so many people love traveling? Beyond the thrill, it immerses you in authentic cultures and significantly enriches your worldview.",
    ],
  });

  const [copiedCorrected, setCopiedCorrected] = useState(false);
  const [viewMode, setViewMode] = useState<"side_by_side" | "diff">("side_by_side");

  const handleAnalyzeGrammar = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    const langName = getLanguageName(language);
    const goalObj = GOALS.find((g) => g.id === selectedGoal);

    try {
      const prompt = `You are an elite multilingual grammar, style, and tone editor.
Analyze the following text written in ${langName}.
Goal: ${goalObj?.label} (${goalObj?.desc}).

Input Text:
"""
${inputText}
"""

Please provide a comprehensive linguistic audit.
Output STRICT JSON conforming to this schema:
{
  "correctedText": "fully corrected and polished text",
  "readabilityScore": 85, // integer 0 to 100
  "overallQuality": "Excellent" | "Good" | "Needs Improvement" | "Poor",
  "toneAnalysis": "1-sentence summary of the tone and clarity",
  "issues": [
    {
      "id": "issue-1",
      "type": "grammar" | "spelling" | "punctuation" | "clarity" | "tone" | "vocabulary",
      "originalText": "exact erroneous substring",
      "suggestedText": "corrected replacement",
      "explanation": "concise, insightful reason why this fix is needed"
    }
  ],
  "improvedAlternatives": [
    "stylistic alternative 1 with higher elegance or conciseness",
    "stylistic alternative 2",
    "stylistic alternative 3"
  ]
}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction:
            "You are an expert computational grammarian. Respond exclusively with valid JSON conforming to the requested schema.",
        }),
      });

      if (!res.ok) throw new Error("Grammar analysis failed");
      const data = await res.json();
      let textResponse = data.content || data.text || "";

      const parsed = safeParseJson(textResponse, {
        correctedText: inputText,
        readabilityScore: 85,
        overallQuality: "Good",
        toneAnalysis: "Analyzed text.",
        issues: [],
        improvedAlternatives: []
      });
      setAnalysisResult({
        originalText: inputText,
        correctedText: parsed.correctedText || inputText,
        readabilityScore: parsed.readabilityScore || 85,
        overallQuality: parsed.overallQuality || "Good",
        toneAnalysis: parsed.toneAnalysis || "Analyzed text.",
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        improvedAlternatives: Array.isArray(parsed.improvedAlternatives)
          ? parsed.improvedAlternatives
          : [],
      });

      toast({
        title: "Grammar Audit Complete",
        description: `Found ${parsed.issues?.length || 0} improvements.`,
      });
    } catch (err) {
      console.error("Grammar error:", err);
      toast({
        title: "Grammar Check Failed",
        description: "Could not complete grammar check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySingleFix = (issue: GrammarIssue) => {
    if (!analysisResult) return;
    const newIssues = analysisResult.issues.map((i) =>
      i.id === issue.id ? { ...i, applied: true } : i
    );
    setAnalysisResult({
      ...analysisResult,
      issues: newIssues,
    });
    toast({
      title: "Correction Accepted",
      description: `Replaced "${issue.originalText}" with "${issue.suggestedText}".`,
    });
  };

  const handleApplyAll = () => {
    if (!analysisResult) return;
    setInputText(analysisResult.correctedText);
    const updatedIssues = analysisResult.issues.map((i) => ({ ...i, applied: true }));
    setAnalysisResult({
      ...analysisResult,
      issues: updatedIssues,
    });
    toast({
      title: "All Corrections Applied",
      description: "Updated input buffer with polished, corrected text.",
    });
  };

  const handleCopyCorrected = () => {
    if (!analysisResult?.correctedText) return;
    navigator.clipboard.writeText(analysisResult.correctedText);
    setCopiedCorrected(true);
    setTimeout(() => setCopiedCorrected(false), 2000);
    toast({ title: "Copied Polished Text" });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header & Objective Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-xs font-semibold text-muted-foreground">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-muted/80 border border-border rounded-xl px-2.5 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              {POPULAR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Goal Selector */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGoal(g.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedGoal === g.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
                title={g.desc}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleAnalyzeGrammar}
          disabled={isAnalyzing || !inputText.trim()}
          className="h-9 px-4 rounded-xl gap-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-sm"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Auditing Grammar...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Audit & Polish</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Dual Editor: Source Text & Polished Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Source Textarea */}
        <div className="flex flex-col bg-card border border-border/80 rounded-3xl p-4 shadow-sm focus-within:border-primary/60 transition-all justify-between min-h-[300px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span>Original Text</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  ({inputText.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              </span>
              <button
                type="button"
                onClick={() => setInputText("")}
                className="text-muted-foreground hover:text-foreground text-xs p-1 hover:bg-muted rounded-md"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or write any text to check grammar, spelling, clarity, and tone..."
              className="w-full resize-none bg-transparent border-none p-0 text-base focus-visible:ring-0 shadow-none leading-relaxed min-h-[200px]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
            <span>Powered by neural grammar parser</span>
            <span>{inputText.length} characters</span>
          </div>
        </div>

        {/* Polished / Corrected View */}
        <div className="flex flex-col bg-card border border-border/80 rounded-3xl p-4 shadow-sm justify-between min-h-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Polished Output</span>
              </span>

              {analysisResult && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyAll}
                    className="h-7 text-xs px-2.5 rounded-lg border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                  >
                    Accept All ({analysisResult.issues.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCorrected}
                    className="h-7 w-7 p-0 rounded-lg hover:bg-muted"
                  >
                    {copiedCorrected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground font-medium animate-pulse">
                  Detecting grammatical improvements and styling flow...
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-3">
                <p className="text-base leading-relaxed text-foreground font-normal selection:bg-emerald-500/20">
                  {analysisResult.correctedText}
                </p>

                {/* Metric Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Readability
                    </div>
                    <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {analysisResult.readabilityScore}/100
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Quality
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {analysisResult.overallQuality}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Issues Fixed
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {analysisResult.issues.length} detected
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground text-sm italic">
                Click "Audit & Polish" to inspect grammar, clarity, and tone.
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
              <span className="italic truncate max-w-sm">{analysisResult.toneAnalysis}</span>
              {onOpenVoiceTrainer && (
                <button
                  type="button"
                  onClick={() => onOpenVoiceTrainer(analysisResult.correctedText, language)}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Practice Speech
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Issues Breakdown List */}
      {analysisResult && analysisResult.issues.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Detailed Linguistic Error Breakdown ({analysisResult.issues.length})
            </span>
            <span>Click to accept individual suggestions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisResult.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  issue.applied
                    ? "bg-emerald-500/5 border-emerald-500/30 opacity-75"
                    : "bg-card border-border/80 hover:border-primary/50 shadow-2xs"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                      {issue.type}
                    </span>
                    {issue.applied ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Applied
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="line-through text-rose-500 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded">
                      {issue.originalText}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {issue.suggestedText}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {issue.explanation}
                  </p>
                </div>

                {!issue.applied && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApplySingleFix(issue)}
                      className="h-7 text-xs px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                    >
                      Apply Fix
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stylistic Rewrites */}
      {analysisResult && analysisResult.improvedAlternatives?.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Stylistic & Expressive Rewrites
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysisResult.improvedAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-card border border-border/70 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 shadow-2xs"
              >
                <p className="text-xs leading-relaxed text-foreground/90">{alt}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Option {idx + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setInputText(alt);
                      toast({ title: "Applied Stylistic Alternative" });
                    }}
                    className="h-7 text-xs px-2.5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                  >
                    Use This
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
