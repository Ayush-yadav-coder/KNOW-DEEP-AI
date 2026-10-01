import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Code2,
  SlidersHorizontal,
  Layers,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const COMMON_REGEX_PATTERNS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "URL / Web Link", pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "g" },
  { name: "Hex Color Code", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "g" },
  { name: "IPv4 Address", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b", flags: "g" },
  { name: "JWT Token", pattern: "eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+", flags: "g" },
];

export const CodeStudioRegexTester: React.FC = () => {
  const { toast } = useToast();
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
  });
  const [testText, setTestText] = useState<string>(
    "Hello team! Please send receipts to billing@knowdeep.ai and copy support@example.com or admin@domain.org for immediate assistance. Call 1-800-555-0199."
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active flags string
  const flagsString = useMemo(() => {
    let f = "";
    if (flags.g) f += "g";
    if (flags.i) f += "i";
    if (flags.m) f += "m";
    if (flags.s) f += "s";
    return f;
  }, [flags]);

  // Compute matches
  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], error: null, highlightedHtml: testText };
    }

    try {
      const regex = new RegExp(pattern, flagsString);
      const allMatches: Array<{ match: string; index: number; groups: string[] }> = [];

      if (flags.g) {
        let matchResult: RegExpExecArray | null;
        let guard = 0;
        while ((matchResult = regex.exec(testText)) !== null && guard < 500) {
          guard++;
          allMatches.push({
            match: matchResult[0],
            index: matchResult.index,
            groups: matchResult.slice(1),
          });
          if (matchResult.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const single = regex.exec(testText);
        if (single) {
          allMatches.push({
            match: single[0],
            index: single.index,
            groups: single.slice(1),
          });
        }
      }

      // Generate highlighted HTML
      let html = "";
      let lastIndex = 0;
      allMatches.forEach((m, idx) => {
        html += escapeHtml(testText.substring(lastIndex, m.index));
        html += `<mark class="bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold px-1 rounded border border-cyan-500/40">${escapeHtml(
          m.match
        )}</mark>`;
        lastIndex = m.index + m.match.length;
      });
      html += escapeHtml(testText.substring(lastIndex));

      return { matches: allMatches, error: null, highlightedHtml: html };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { matches: [], error: msg, highlightedHtml: testText };
    }
  }, [pattern, flagsString, testText]);

  function escapeHtml(str: string) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const handleGenerateAiRegex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a regular expression for: "${aiPrompt}". Return ONLY a JSON object with: { "pattern": "...", "flags": "g", "explanation": "..." }. No markdown ticks or other text.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const content = data.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.pattern) {
          setPattern(parsed.pattern);
          toast({ title: "Regex Generated", description: parsed.explanation || "Regex updated." });
        }
      }
    } catch (err) {
      toast({ title: "AI Error", description: "Could not auto-generate regex.", variant: "destructive" });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyRegex = () => {
    navigator.clipboard.writeText(`/${pattern}/${flagsString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied Regex", description: `/${pattern}/${flagsString}` });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Pattern Bar & Flags */}
      <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-[260px] bg-background border border-border rounded-xl px-3 py-1.5">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="regular expression pattern..."
            className="flex-1 bg-transparent border-0 font-mono text-xs text-foreground focus:outline-none"
          />
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">/{flagsString}</span>
        </div>

        {/* Flags Selector */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border/60 text-xs font-mono">
          <label className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={flags.g}
              onChange={(e) => setFlags({ ...flags, g: e.target.checked })}
              className="rounded"
            />
            <span>g</span>
          </label>
          <label className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={flags.i}
              onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
              className="rounded"
            />
            <span>i</span>
          </label>
          <label className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={flags.m}
              onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
              className="rounded"
            />
            <span>m</span>
          </label>
          <label className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={flags.s}
              onChange={(e) => setFlags({ ...flags, s: e.target.checked })}
              className="rounded"
            />
            <span>s</span>
          </label>
        </div>

        <Button size="sm" variant="outline" onClick={handleCopyRegex} className="h-8 text-xs rounded-xl gap-1">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          Copy
        </Button>
      </div>

      {/* Preset Patterns Pills */}
      <div className="px-3 py-1.5 bg-muted/20 border-b border-border/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-muted-foreground font-medium shrink-0">Presets:</span>
        {COMMON_REGEX_PATTERNS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPattern(p.pattern);
              setFlags({ g: true, i: true, m: false, s: false });
            }}
            className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-3 py-1.5 text-xs text-rose-600 font-mono">
          Regex Syntax Error: {error}
        </div>
      )}

      {/* Split-Screen: Test String & Highlights */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-auto">
        {/* Test String Input */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Test String</span>
            <span className="text-[10px] text-muted-foreground font-mono">{testText.length} chars</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-3 rounded-xl bg-muted/40 font-mono text-xs text-foreground border border-border resize-none outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter test string here..."
          />
        </div>

        {/* Live Match Highlights & Match Inspector */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400">
              Matches ({matches.length})
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">
              {matches.length > 0 ? "✓ Pattern Matched" : "No Matches"}
            </span>
          </div>

          <div
            className="flex-1 rounded-xl bg-muted/30 p-3 font-mono text-xs overflow-auto whitespace-pre-wrap leading-relaxed border border-border/60"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          {matches.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto border-t border-border/60 pt-2 space-y-1">
              {matches.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 rounded bg-muted/50 text-[11px] font-mono"
                >
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                    #{idx + 1}: &quot;{m.match}&quot;
                  </span>
                  <span className="text-muted-foreground">Index: {m.index}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Regex Generator Bar */}
      <form
        onSubmit={handleGenerateAiRegex}
        className="p-2.5 bg-muted/40 border-t border-border flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Generate Regex with AI (e.g. 'Match all Visa credit card numbers', 'Extract hashtags')..."
          className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isGeneratingAi || !aiPrompt.trim()}
          className="h-8 px-3 text-xs rounded-xl gap-1"
        >
          {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Generate
        </Button>
      </form>
    </div>
  );
};
