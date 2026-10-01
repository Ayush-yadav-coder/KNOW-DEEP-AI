import React, { useState } from "react";
import {
  BookOpen,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Eye,
  FileCode,
  Sparkles,
  Layers,
  Terminal as TerminalIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PRESET_NOTEBOOKS = [
  {
    title: "Algorithms & Big-O Interactive Notebook",
    category: "Computer Science",
    markdown: `# 🚀 High-Performance Algorithms & Big-O

Welcome to the **Know Deep Interactive Notebook**! This guide contains runnable JavaScript code cells right inside the documentation.

---

## 1. Linear Sliding Window ($O(N)$)

Instead of checking all pairs ($O(N^2)$), a Hash Map lets us find the longest subarray summing to $k$ in a single pass:

\`\`\`javascript
function findLongestSubarray(arr, k) {
  let maxLength = 0;
  let currentSum = 0;
  const sumMap = new Map();

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    if (currentSum === k) maxLength = i + 1;
    if (sumMap.has(currentSum - k)) {
      maxLength = Math.max(maxLength, i - sumMap.get(currentSum - k));
    }
    if (!sumMap.has(currentSum)) sumMap.set(currentSum, i);
  }
  return maxLength;
}

const numbers = [10, 5, 2, 7, 1, 9];
const result = findLongestSubarray(numbers, 15);
console.log("Input:", numbers, "-> Longest Subarray (Sum=15):", result);
\`\`\`

---

## 2. In-Place QuickSort ($O(N \\log N)$)

Partitioning an array around a pivot element allows efficient sorting without auxiliary memory allocations:

\`\`\`javascript
function quicksort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
  }
  return [...quicksort(left), pivot, ...quicksort(right)];
}

console.log("Sorted Array:", quicksort([64, 25, 12, 22, 11]));
\`\`\`
`,
  },
  {
    title: "Modern JavaScript & Async Patterns",
    category: "Web Engineering",
    markdown: `# ⚡ Modern JavaScript Patterns (ES2024)

Documentation with live execution cells for modern asynchronous flows.

---

## Concurrency with Promise.allSettled()

\`\`\`javascript
async function fetchAllResources() {
  const p1 = Promise.resolve({ id: 1, name: "Resource Alpha" });
  const p2 = Promise.reject(new Error("Timeout on beta node"));
  const p3 = Promise.resolve({ id: 3, name: "Resource Gamma" });

  const results = await Promise.allSettled([p1, p2, p3]);
  console.log("Settled Results:", results);
}

fetchAllResources();
\`\`\`
`,
  },
];

export const CodeStudioMarkdownNotebook: React.FC = () => {
  const { toast } = useToast();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [markdown, setMarkdown] = useState(PRESET_NOTEBOOKS[0].markdown);
  const [cellOutputs, setCellOutputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");

  const currentNotebook = PRESET_NOTEBOOKS[selectedIdx];

  const handleSelectNotebook = (idx: number) => {
    setSelectedIdx(idx);
    setMarkdown(PRESET_NOTEBOOKS[idx].markdown);
    setCellOutputs({});
  };

  const handleRunCodeCell = (code: string, cellId: string) => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) =>
        logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
      error: (...args: any[]) => logs.push("Error: " + args.join(" ")),
      warn: (...args: any[]) => logs.push("Warn: " + args.join(" ")),
    };

    try {
      const runFn = new Function("console", code);
      runFn(customConsole);
      setCellOutputs((prev) => ({
        ...prev,
        [cellId]: logs.length > 0 ? logs.join("\n") : "Execution completed with no console output.",
      }));
      toast({ title: "Code Cell Executed", description: `Ran cell #${cellId} successfully.` });
    } catch (err: any) {
      setCellOutputs((prev) => ({
        ...prev,
        [cellId]: `Runtime Error: ${err.message}`,
      }));
      toast({ title: "Cell Error", description: err.message, variant: "destructive" });
    }
  };

  // Parse markdown code blocks for preview
  const renderInteractiveMarkdown = () => {
    const segments = markdown.split(/(```javascript[\s\S]*?```)/g);
    let cellCounter = 0;

    return segments.map((seg, idx) => {
      if (seg.startsWith("```javascript")) {
        cellCounter++;
        const cellId = `cell-${cellCounter}`;
        const code = seg.replace(/^```javascript\n?/, "").replace(/\n?```$/, "");
        const output = cellOutputs[cellId];

        return (
          <div
            key={idx}
            className="my-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 overflow-hidden shadow-md"
          >
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <FileCode className="w-3.5 h-3.5" />
                <span>Runnable Cell #{cellCounter}</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleRunCodeCell(code, cellId)}
                className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 px-3"
              >
                <Play className="w-3 h-3 fill-current" />
                Run Cell
              </Button>
            </div>

            <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">{code}</pre>

            {output && (
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 font-mono text-xs text-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                  <TerminalIcon className="w-3 h-3 text-emerald-400" />
                  Console Output:
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        );
      }

      // Simple markdown text rendering
      const lines = seg.split("\n");
      return (
        <div key={idx} className="space-y-2 text-foreground text-sm leading-relaxed">
          {lines.map((line, lIdx) => {
            if (line.startsWith("# ")) return <h1 key={lIdx} className="text-2xl font-black text-foreground mt-4 mb-2">{line.replace("# ", "")}</h1>;
            if (line.startsWith("## ")) return <h2 key={lIdx} className="text-lg font-bold text-foreground mt-3 mb-1">{line.replace("## ", "")}</h2>;
            if (line.startsWith("---")) return <hr key={lIdx} className="border-border my-3" />;
            if (!line.trim()) return <div key={lIdx} className="h-1" />;
            return <p key={lIdx} className="text-muted-foreground">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Interactive Markdown Notebook</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Live Docs + Runnable Cells
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Write documentation with embedded JavaScript sandboxes and interactive inline outputs
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center bg-card rounded-lg border border-border p-0.5 text-xs">
          {PRESET_NOTEBOOKS.map((nb, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectNotebook(idx)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedIdx === idx ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {nb.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Left: Markdown Editor */}
        <div className="flex flex-col p-4 space-y-2 bg-muted/10 min-h-0">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Markdown Source Editor</span>
            <span className="text-[10px] font-mono text-cyan-500">```javascript ... ``` for live cells</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 p-3.5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
          />
        </div>

        {/* Right: Live Formatted Interactive Notebook Preview */}
        <div className="p-6 overflow-y-auto min-h-0 space-y-3 bg-card">
          {renderInteractiveMarkdown()}
        </div>
      </div>
    </div>
  );
};
