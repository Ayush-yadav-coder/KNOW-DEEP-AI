import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  Layers,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RailroadNode {
  id: string;
  type: "start" | "end" | "literal" | "set" | "group" | "quantifier" | "branch";
  label: string;
  sublabel?: string;
  quantifier?: string;
  color: string;
}

const PRESET_REGEXES = [
  {
    name: "Email Address",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    nodes: [
      { id: "1", type: "start", label: "Start of Line (^)", color: "border-purple-500 text-purple-400" },
      { id: "2", type: "set", label: "[a-zA-Z0-9._%+-]", sublabel: "Alphanumeric + allowed symbols", quantifier: "One or more (+)", color: "border-cyan-500 text-cyan-400" },
      { id: "3", type: "literal", label: "@", sublabel: "Literal at symbol", color: "border-emerald-500 text-emerald-400" },
      { id: "4", type: "set", label: "[a-zA-Z0-9.-]", sublabel: "Domain name characters", quantifier: "One or more (+)", color: "border-cyan-500 text-cyan-400" },
      { id: "5", type: "literal", label: "\\.", sublabel: "Literal dot (.)", color: "border-emerald-500 text-emerald-400" },
      { id: "6", type: "set", label: "[a-zA-Z]", sublabel: "Top Level Domain (TLD)", quantifier: "2 or more {2,}", color: "border-amber-500 text-amber-400" },
      { id: "7", type: "end", label: "End of Line ($)", color: "border-purple-500 text-purple-400" },
    ],
    sampleMatch: "ayushyadavprocoder@gmail.com",
  },
  {
    name: "Semantic Version (SemVer)",
    pattern: "^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(-[a-zA-Z0-9.-]+)?$",
    nodes: [
      { id: "1", type: "start", label: "Start (^)", color: "border-purple-500 text-purple-400" },
      { id: "2", type: "literal", label: "v?", sublabel: "Optional prefix 'v'", quantifier: "Zero or one (?)", color: "border-slate-500 text-slate-400" },
      { id: "3", type: "group", label: "Major (0|[1-9]\\d*)", sublabel: "Non-negative integer", color: "border-cyan-500 text-cyan-400" },
      { id: "4", type: "literal", label: "\\.", sublabel: "Dot separator", color: "border-emerald-500 text-emerald-400" },
      { id: "5", type: "group", label: "Minor (0|[1-9]\\d*)", sublabel: "Non-negative integer", color: "border-cyan-500 text-cyan-400" },
      { id: "6", type: "literal", label: "\\.", sublabel: "Dot separator", color: "border-emerald-500 text-emerald-400" },
      { id: "7", type: "group", label: "Patch (0|[1-9]\\d*)", sublabel: "Non-negative integer", color: "border-cyan-500 text-cyan-400" },
      { id: "8", type: "group", label: "Pre-Release (-...)?", sublabel: "Optional tag", quantifier: "Zero or one (?)", color: "border-amber-500 text-amber-400" },
      { id: "9", type: "end", label: "End ($)", color: "border-purple-500 text-purple-400" },
    ],
    sampleMatch: "v2.5.0-beta.1",
  },
  {
    name: "Hex Color Code",
    pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
    nodes: [
      { id: "1", type: "start", label: "Start (^)", color: "border-purple-500 text-purple-400" },
      { id: "2", type: "literal", label: "#", sublabel: "Literal hash symbol", color: "border-emerald-500 text-emerald-400" },
      { id: "3", type: "branch", label: "Branch: 6 Hex chars | 3 Hex chars", sublabel: "[A-Fa-f0-9]{6} or [A-Fa-f0-9]{3}", color: "border-pink-500 text-pink-400" },
      { id: "4", type: "end", label: "End ($)", color: "border-purple-500 text-purple-400" },
    ],
    sampleMatch: "#06b6d4",
  },
];

export const CodeStudioRegexRailroad: React.FC = () => {
  const { toast } = useToast();
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [pattern, setPattern] = useState(PRESET_REGEXES[0].pattern);
  const [testString, setTestString] = useState(PRESET_REGEXES[0].sampleMatch);
  const [isMatching, setIsMatching] = useState(true);

  const currentPreset = PRESET_REGEXES[selectedPresetIdx] || PRESET_REGEXES[0];

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const p = PRESET_REGEXES[idx];
    setPattern(p.pattern);
    setTestString(p.sampleMatch);
    try {
      const reg = new RegExp(p.pattern);
      setIsMatching(reg.test(p.sampleMatch));
    } catch {
      setIsMatching(false);
    }
  };

  const handleTestChange = (val: string) => {
    setTestString(val);
    try {
      const reg = new RegExp(pattern);
      setIsMatching(reg.test(val));
    } catch {
      setIsMatching(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Interactive Regex Railroad Diagram</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                Visual Track AST
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Graphical flow diagram illustrating branches, quantifiers, capture groups, and assertions
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center bg-card rounded-lg border border-border p-0.5 text-xs">
          {PRESET_REGEXES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedPresetIdx === idx ? "bg-pink-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Input & Live Test String */}
      <div className="p-4 bg-muted/20 border-b border-border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Regular Expression Pattern</label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-pink-400 font-mono text-xs">
              <span className="text-slate-600 select-none">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 bg-transparent border-0 text-pink-300 font-mono focus:outline-none"
              />
              <span className="text-slate-600 select-none">/g</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1 flex items-center justify-between">
              <span>Test Sample String</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isMatching
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                }`}
              >
                {isMatching ? "✓ Pattern Matches" : "✗ No Match"}
              </span>
            </label>
            <input
              type="text"
              value={testString}
              onChange={(e) => handleTestChange(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Railroad Track Canvas */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-auto bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 min-w-max py-8">
          {currentPreset.nodes.map((node, idx) => (
            <React.Fragment key={node.id}>
              {/* Railroad Node Box */}
              <div
                className={`p-3.5 rounded-2xl bg-slate-900 border-2 shadow-lg flex flex-col items-center justify-center text-center min-w-[130px] transition-transform duration-200 hover:scale-105 ${node.color}`}
              >
                <span className="text-xs font-mono font-bold">{node.label}</span>
                {node.sublabel && <span className="text-[10px] text-slate-400 mt-0.5">{node.sublabel}</span>}
                {node.quantifier && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                    {node.quantifier}
                  </span>
                )}
              </div>

              {/* Connecting Track Line */}
              {idx < currentPreset.nodes.length - 1 && (
                <div className="flex items-center gap-1 text-slate-600">
                  <div className="w-8 h-1 bg-gradient-to-r from-slate-700 via-pink-500/50 to-slate-700 rounded-full" />
                  <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-4 border-t border-slate-800/80 pt-4 mt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Line Anchors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Character Sets
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Literals
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Quantifiers
          </span>
        </div>
      </div>
    </div>
  );
};
