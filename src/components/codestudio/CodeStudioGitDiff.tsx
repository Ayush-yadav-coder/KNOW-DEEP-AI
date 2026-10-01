import React, { useState, useEffect } from "react";
import {
  GitCompare,
  GitMerge,
  GitBranch,
  Check,
  RotateCcw,
  ArrowRight,
  Split,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioGitDiffProps {
  currentCode: string;
  onApplyResolvedCode: (resolvedCode: string) => void;
}

const SAMPLE_INCOMING_CODE = `// Know Deep Code Studio - Optimized Distributed Implementation
function findLongestSubarray(arr, k) {
  let maxLength = 0;
  let currentSum = 0;
  const prefixMap = new Map(); // hash map: prefix sum -> earliest index

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    if (currentSum === k) {
      maxLength = i + 1;
    }
    const diff = currentSum - k;
    if (prefixMap.has(diff)) {
      maxLength = Math.max(maxLength, i - prefixMap.get(diff));
    }
    if (!prefixMap.has(currentSum)) {
      prefixMap.set(currentSum, i);
    }
  }
  return maxLength;
}

// Enterprise test suite
const benchmarkArray = [10, 5, 2, 7, 1, 9, -2, 8];
console.log("Benchmark result:", findLongestSubarray(benchmarkArray, 15));
`;

export const CodeStudioGitDiff: React.FC<CodeStudioGitDiffProps> = ({
  currentCode,
  onApplyResolvedCode,
}) => {
  const { toast } = useToast();
  const [incomingCode, setIncomingCode] = useState<string>(SAMPLE_INCOMING_CODE);
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const [resolvedContent, setResolvedContent] = useState<string>(currentCode);

  const localLines = currentCode.split("\n");
  const incomingLines = incomingCode.split("\n");

  const handleAcceptCurrent = () => {
    setResolvedContent(currentCode);
    onApplyResolvedCode(currentCode);
    toast({ title: "Resolved with Current", description: "Kept your local branch code." });
  };

  const handleAcceptIncoming = () => {
    setResolvedContent(incomingCode);
    onApplyResolvedCode(incomingCode);
    toast({ title: "Resolved with Incoming", description: "Applied incoming remote branch code." });
  };

  const handleAcceptBoth = () => {
    const combined = `// --- LOCAL BRANCH CODE --- \n${currentCode}\n\n// --- INCOMING REMOTE CODE --- \n${incomingCode}`;
    setResolvedContent(combined);
    onApplyResolvedCode(combined);
    toast({ title: "Accepted Both Changes", description: "Combined both versions into editor." });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Diff Controls Header */}
      <div className="p-3.5 bg-muted/40 backdrop-blur-md border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Git Diff &amp; Merge Conflict Resolver
            </h2>
            <p className="text-xs text-muted-foreground">
              Compare branch changes and resolve merge conflicts with 1-click operations
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAcceptCurrent}
            className="h-8 text-xs rounded-xl border-cyan-500/30 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 font-semibold"
          >
            Accept Current (HEAD)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAcceptIncoming}
            className="h-8 text-xs rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 font-semibold"
          >
            Accept Incoming
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAcceptBoth}
            className="h-8 text-xs rounded-xl border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 font-semibold"
          >
            Accept Both
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onApplyResolvedCode(resolvedContent);
              toast({ title: "Diff Applied", description: "Editor updated with resolved code." });
            }}
            className="h-8 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            Apply to Editor
          </Button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-auto">
        {/* Left: Current Local Branch (HEAD) */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              Current Local (HEAD) - {localLines.length} lines
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Branch: local/feature</span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-950 p-3 font-mono text-xs overflow-auto border border-slate-800 space-y-0.5">
            {localLines.map((line, i) => {
              const isDiff = incomingLines[i] !== line;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 py-0.5 px-1 rounded ${
                    isDiff ? "bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400" : "text-slate-300"
                  }`}
                >
                  <span className="w-6 text-right text-slate-600 select-none text-[10px] shrink-0 font-mono">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre leading-relaxed">{line || " "}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Incoming Remote Branch */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5" />
              Incoming Remote (origin/main) - {incomingLines.length} lines
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Branch: origin/main</span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-950 p-3 font-mono text-xs overflow-auto border border-slate-800 space-y-0.5">
            {incomingLines.map((line, i) => {
              const isDiff = localLines[i] !== line;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 py-0.5 px-1 rounded ${
                    isDiff ? "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-400" : "text-slate-300"
                  }`}
                >
                  <span className="w-6 text-right text-slate-600 select-none text-[10px] shrink-0 font-mono">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre leading-relaxed">{line || " "}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
