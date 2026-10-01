import React, { useState } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  Zap,
  Loader2,
  Code2,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SupportedLanguage } from "./CodeStudioTypes";
import ReactMarkdown from "react-markdown";

interface CodeStudioTranspilerProps {
  sourceCode: string;
  sourceLanguage: SupportedLanguage;
  onApplyConvertedCode: (code: string, newLanguage: SupportedLanguage) => void;
}

const TARGET_LANGUAGES = [
  { id: "python", name: "Python 3" },
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript (ES6+)" },
  { id: "rust", name: "Rust" },
  { id: "go", name: "Go (Golang)" },
  { id: "cpp", name: "C++ (Modern C++20)" },
  { id: "java", name: "Java 21" },
  { id: "sql", name: "SQL (PostgreSQL/ANSI)" },
  { id: "csharp", name: "C# / .NET" },
  { id: "kotlin", name: "Kotlin" },
  { id: "swift", name: "Swift" },
];

export const CodeStudioTranspiler: React.FC<CodeStudioTranspilerProps> = ({
  sourceCode,
  sourceLanguage,
  onApplyConvertedCode,
}) => {
  const { toast } = useToast();
  const [targetLang, setTargetLang] = useState<string>("python");
  const [convertedCode, setConvertedCode] = useState<string>("");
  const [conversionNotes, setConversionNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranspile = async () => {
    if (!sourceCode.trim()) {
      toast({ title: "No Code", description: "Please provide source code to convert.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setConvertedCode("");
    setConversionNotes("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Transpile / Convert the following ${sourceLanguage} code to idiomatic, production-grade ${targetLang}.\n\nRequirements:\n1. Provide the complete converted code inside a single markdown code block (\`\`\`${targetLang} ... \`\`\`).\n2. Maintain semantic equivalence, proper static types, idiomatic conventions, and performance.\n3. Below the code block, provide a short section explaining key language paradigm differences or required package dependencies.\n\n\`\`\`${sourceLanguage}\n${sourceCode}\n\`\`\``,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Transpilation request failed");
      }

      const content = data.content || "";
      const match = content.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
      if (match) {
        setConvertedCode(match[1].trim());
        setConversionNotes(content.replace(/```[\s\S]*?```/, "").trim());
      } else {
        setConvertedCode(content);
      }
      toast({ title: "Transpilation Succeeded", description: `Converted from ${sourceLanguage} to ${targetLang}.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      toast({ title: "Conversion Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Converted code copied to clipboard." });
  };

  const handleApplyToEditor = () => {
    if (convertedCode) {
      onApplyConvertedCode(convertedCode, targetLang as SupportedLanguage);
      toast({ title: "Code Loaded", description: `Editor switched to ${targetLang}.` });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
            <ArrowRightLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Universal Language Transpiler
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Target:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-8 text-xs rounded-xl bg-background border border-border px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {TARGET_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={handleTranspile}
            disabled={isLoading}
            className="h-8 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-xs"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Convert Now
          </Button>
        </div>
      </div>

      {/* Main Diff / Result Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-auto">
        {/* Source Box */}
        <div className="bg-card p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">
              Source ({sourceLanguage.toUpperCase()})
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {sourceCode.split("\n").length} lines
            </span>
          </div>
          <pre className="flex-1 p-3 rounded-xl bg-muted/50 text-foreground font-mono text-xs overflow-auto leading-relaxed">
            {sourceCode || "// No source code provided"}
          </pre>
        </div>

        {/* Target Box */}
        <div className="bg-card p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-[11px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
              Target ({targetLang.toUpperCase()})
            </span>
            {convertedCode && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-[11px] px-2 rounded-lg gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyToEditor}
                  className="h-6 text-[11px] px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Load into Editor
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 rounded-xl bg-muted/50 p-3 overflow-auto flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin mb-2" />
                <p className="text-xs text-muted-foreground">Transpiling AST &amp; Idiomatic Types...</p>
              </div>
            ) : convertedCode ? (
              <div className="space-y-4">
                <pre className="text-foreground font-mono text-xs overflow-x-auto leading-relaxed">
                  {convertedCode}
                </pre>
                {conversionNotes && (
                  <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Architecture &amp; Migration Notes:</p>
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none text-xs">
                      {conversionNotes}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-foreground">Select Target Language &amp; Convert</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI will preserve algorithmic complexity and apply target idioms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
