import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bug,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  CornerDownRight,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Terminal as TerminalIcon,
  Filter,
  Edit3,
  Check,
  X,
  FastForward,
  HelpCircle,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DebuggerBreakpoint, DebuggerScopeVar, DebuggerFrame, CodeFile } from "./CodeStudioTypes";

interface CodeStudioDebuggerProps {
  currentCode?: string;
  activeFile?: CodeFile;
  onHighlightLine?: (line: number) => void;
  onSelectLine?: (line: number) => void;
}

export interface DebugLogEntry {
  id: string;
  type: "system" | "breakpoint" | "stdout" | "eval";
  message: string;
  timestamp: string;
  line?: number;
}

export const CodeStudioDebugger: React.FC<CodeStudioDebuggerProps> = ({
  currentCode,
  activeFile,
  onHighlightLine,
  onSelectLine,
}) => {
  const { toast } = useToast();
  const codeToDebug = activeFile?.content || currentCode || "";
  const lines = codeToDebug.split("\n");

  // Debugger Execution States
  const [breakpoints, setBreakpoints] = useState<DebuggerBreakpoint[]>([
    { line: 4, enabled: true, condition: "" },
    { line: 8, enabled: true, condition: "i >= 2" },
    { line: 12, enabled: true, condition: "" },
  ]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  const [autoStepSpeedMs, setAutoStepSpeedMs] = useState(800);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  // Dynamic Variable Scope & State
  const [scopeVariables, setScopeVariables] = useState<DebuggerScopeVar[]>([]);
  const [globalVariables, setGlobalVariables] = useState<DebuggerScopeVar[]>([]);
  const [changedVarNames, setChangedVarNames] = useState<Set<string>>(new Set());
  const [callStack, setCallStack] = useState<DebuggerFrame[]>([]);
  const [editingVarName, setEditingVarName] = useState<string | null>(null);
  const [editingVarVal, setEditingVarVal] = useState("");

  // Watch Expressions
  const [watchExpressions, setWatchExpressions] = useState<string[]>([
    "arr.length",
    "currentSum",
    "k",
    "currentSum - k",
  ]);
  const [newWatchInput, setNewWatchInput] = useState("");
  const [watchValues, setWatchValues] = useState<Record<string, string>>({});

  // Conditional Breakpoint Modal
  const [editingBpLine, setEditingBpLine] = useState<number | null>(null);
  const [bpConditionInput, setBpConditionInput] = useState("");

  // Debug Logs Console Stream
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [activeTabPanel, setActiveTabPanel] = useState<"scope" | "stack" | "watch" | "breakpoints" | "console">("scope");
  const [logFilter, setLogFilter] = useState<"all" | "stdout" | "breakpoint">("all");

  // Variable Hover Tooltip in Code Canvas
  const [hoveredVar, setHoveredVar] = useState<{ name: string; value: string; x: number; y: number } | null>(null);

  const autoStepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add system debug log
  const addDebugLog = (type: DebugLogEntry["type"], message: string, line?: number) => {
    const newEntry: DebugLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      line,
    };
    setDebugLogs((prev) => [newEntry, ...prev].slice(0, 80));
  };

  // Toggle or add breakpoint
  const toggleBreakpoint = (lineNum: number) => {
    setBreakpoints((prev) => {
      const exists = prev.find((b) => b.line === lineNum);
      if (exists) {
        addDebugLog("system", `Removed breakpoint at line ${lineNum}`);
        return prev.filter((b) => b.line !== lineNum);
      } else {
        addDebugLog("system", `Added breakpoint at line ${lineNum}`);
        return [...prev, { line: lineNum, enabled: true, condition: "" }].sort((a, b) => a.line - b.line);
      }
    });
  };

  const toggleBreakpointEnabled = (lineNum: number) => {
    setBreakpoints((prev) =>
      prev.map((b) => (b.line === lineNum ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const saveBreakpointCondition = (lineNum: number) => {
    setBreakpoints((prev) =>
      prev.map((b) => (b.line === lineNum ? { ...b, condition: bpConditionInput.trim() } : b))
    );
    setEditingBpLine(null);
    toast({ title: "Breakpoint Updated", description: `Set condition for line ${lineNum}: "${bpConditionInput}"` });
  };

  // Generate & evaluate runtime scope state dynamically based on execution line
  const evaluateScopeForLine = useCallback((lineNum: number, currentVarsOverride?: Record<string, string>) => {
    const lineText = lines[lineNum - 1] || "";

    // Simulated execution state tracking that reacts dynamically to line numbers and code text
    const iVal = Math.min(5, Math.max(0, Math.floor((lineNum - 5) / 2)));
    const numbersArr = "[10, 5, 2, 7, 1, 9]";
    const currentSumVal = String(10 + iVal * 4);
    const maxLenVal = String(Math.max(0, Math.floor(iVal * 0.8)));

    const defaultLocalScope: DebuggerScopeVar[] = [
      { name: "arr", value: numbersArr, type: "Array(6)" },
      { name: "k", value: "15", type: "number" },
      { name: "i", value: String(iVal), type: "number" },
      { name: "currentSum", value: currentSumVal, type: "number" },
      { name: "maxLength", value: maxLenVal, type: "number" },
      { name: "sumMap", value: `Map(${Math.min(3, iVal + 1)}) { 10 => 0, 15 => 1 }`, type: "Map" },
    ];

    // Apply manual user edits if active
    let activeScope = defaultLocalScope;
    if (currentVarsOverride) {
      activeScope = defaultLocalScope.map((v) =>
        currentVarsOverride[v.name] ? { ...v, value: currentVarsOverride[v.name] } : v
      );
    }

    setScopeVariables(activeScope);

    // Global Scope
    setGlobalVariables([
      { name: "numbers", value: numbersArr, type: "Array(6)" },
      { name: "targetSum", value: "15", type: "number" },
      { name: "longest", value: lineNum >= 13 ? "4" : "undefined", type: "number" },
      { name: "findLongestSubarray", value: "function(arr, k)", type: "Function" },
    ]);

    // Call Stack
    if (lineNum >= 1 && lineNum <= 12) {
      setCallStack([
        { functionName: "findLongestSubarray", line: lineNum, column: 5, file: activeFile?.name || "main.js" },
        { functionName: "(anonymous global)", line: 18, column: 1, file: activeFile?.name || "main.js" },
      ]);
    } else {
      setCallStack([
        { functionName: "(anonymous global)", line: lineNum, column: 1, file: activeFile?.name || "main.js" },
      ]);
    }

    // Identify changed variables
    const changed = new Set<string>();
    if (lineText.includes("currentSum")) changed.add("currentSum");
    if (lineText.includes("maxLength")) changed.add("maxLength");
    if (lineText.includes("i++") || lineText.includes("for")) changed.add("i");
    if (lineText.includes("sumMap")) changed.add("sumMap");
    setChangedVarNames(changed);

    // Watch Expressions Evaluation
    const evals: Record<string, string> = {};
    watchExpressions.forEach((expr) => {
      try {
        if (expr === "arr.length") evals[expr] = "6";
        else if (expr === "currentSum") evals[expr] = currentSumVal;
        else if (expr === "k") evals[expr] = "15";
        else if (expr === "currentSum - k") evals[expr] = String(Number(currentSumVal) - 15);
        else if (expr === "i") evals[expr] = String(iVal);
        else if (expr === "arr[i]") evals[expr] = String([10, 5, 2, 7, 1, 9][iVal] ?? "undefined");
        else evals[expr] = `<evaluated @ L${lineNum}>`;
      } catch (e) {
        evals[expr] = "ReferenceError";
      }
    });
    setWatchValues(evals);

    if (onHighlightLine) onHighlightLine(lineNum);
  }, [lines, activeFile?.name, watchExpressions, onHighlightLine]);

  // Start Debugging Session
  const handleStartDebugging = () => {
    setIsDebugging(true);
    setIsPaused(true);
    const enabledBps = breakpoints.filter((b) => b.enabled);
    const startLine = enabledBps[0]?.line || 1;
    setCurrentLine(startLine);
    evaluateScopeForLine(startLine);
    addDebugLog("system", `Debugger attached to ${activeFile?.name || "current buffer"}`);
    addDebugLog("breakpoint", `Paused at line ${startLine} (Breakpoint hit)`, startLine);
    toast({ title: "Debugger Started", description: `Paused at line ${startLine}` });
  };

  // Step Over (F10)
  const handleStepOver = () => {
    if (!isDebugging) return;
    const nextLine = (currentLine || 1) + 1;
    if (nextLine > lines.length) {
      handleStopDebugging();
      addDebugLog("system", "Program execution finished cleanly.");
      toast({ title: "Debugging Finished", description: "Reached end of program script." });
      return;
    }

    setCurrentLine(nextLine);
    evaluateScopeForLine(nextLine);

    // Check hit log / output simulation
    const lineText = lines[nextLine - 1] || "";
    if (lineText.includes("console.log")) {
      addDebugLog("stdout", `[Console] Step @ L${nextLine}: ${lineText.trim()}`, nextLine);
    } else {
      addDebugLog("system", `Stepped to line ${nextLine}`, nextLine);
    }
  };

  // Step Into (F11)
  const handleStepInto = () => {
    if (!isDebugging) return;
    handleStepOver(); // In script sandbox, step into progresses statement
  };

  // Step Out (Shift+F11)
  const handleStepOut = () => {
    if (!isDebugging) return;
    const mainCallLine = 13;
    setCurrentLine(mainCallLine);
    evaluateScopeForLine(mainCallLine);
    addDebugLog("system", `Stepped out to global caller frame (line ${mainCallLine})`, mainCallLine);
  };

  // Continue to Next Breakpoint (F8)
  const handleContinue = () => {
    if (!isDebugging) return;
    const enabledBps = breakpoints.filter((b) => b.enabled);
    const nextBp = enabledBps.find((b) => b.line > (currentLine || 0));

    if (nextBp) {
      setCurrentLine(nextBp.line);
      evaluateScopeForLine(nextBp.line);
      addDebugLog("breakpoint", `Hit breakpoint at line ${nextBp.line}`, nextBp.line);
      toast({ title: "Hit Breakpoint", description: `Paused on line ${nextBp.line}` });
    } else {
      handleStopDebugging();
      addDebugLog("system", "No further breakpoints. Program executed to end.");
      toast({ title: "Execution Complete", description: "No further breakpoints hit." });
    }
  };

  // Stop Debugger
  const handleStopDebugging = () => {
    setIsDebugging(false);
    setIsPaused(false);
    setIsAutoStepping(false);
    if (autoStepTimerRef.current) clearInterval(autoStepTimerRef.current);
    setCurrentLine(null);
    setScopeVariables([]);
    setGlobalVariables([]);
    setCallStack([]);
    addDebugLog("system", "Debugger detached.");
  };

  // Auto-Step Loop
  useEffect(() => {
    if (isAutoStepping && isDebugging) {
      autoStepTimerRef.current = setInterval(() => {
        handleStepOver();
      }, autoStepSpeedMs);
    } else {
      if (autoStepTimerRef.current) clearInterval(autoStepTimerRef.current);
    }
    return () => {
      if (autoStepTimerRef.current) clearInterval(autoStepTimerRef.current);
    };
  }, [isAutoStepping, isDebugging, currentLine, autoStepSpeedMs]);

  // Keyboard Shortcuts (F5, F8, F10, F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDebugging) {
        if (e.key === "F5") {
          e.preventDefault();
          handleStartDebugging();
        }
        return;
      }

      if (e.key === "F10") {
        e.preventDefault();
        handleStepOver();
      } else if (e.key === "F8") {
        e.preventDefault();
        handleContinue();
      } else if (e.key === "F11" && !e.shiftKey) {
        e.preventDefault();
        handleStepInto();
      } else if (e.key === "F11" && e.shiftKey) {
        e.preventDefault();
        handleStepOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDebugging, currentLine]);

  // Add Watch Expression
  const handleAddWatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchInput.trim()) return;
    setWatchExpressions((prev) => [...prev, newWatchInput.trim()]);
    setNewWatchInput("");
    addDebugLog("eval", `Added watch expression: ${newWatchInput.trim()}`);
  };

  const handleRemoveWatch = (expr: string) => {
    setWatchExpressions((prev) => prev.filter((w) => w !== expr));
  };

  // Variable Value Edit Submit
  const handleSaveVarEdit = (varName: string) => {
    setScopeVariables((prev) =>
      prev.map((v) => (v.name === varName ? { ...v, value: editingVarVal } : v))
    );
    addDebugLog("eval", `Modified variable '${varName}' value to: ${editingVarVal}`);
    toast({ title: "Scope Modified", description: `Updated '${varName}' to ${editingVarVal}` });
    setEditingVarName(null);
  };

  const filteredLogs = debugLogs.filter((log) => {
    if (logFilter === "stdout") return log.type === "stdout";
    if (logFilter === "breakpoint") return log.type === "breakpoint";
    return true;
  });

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Top Glassy Control Toolbar */}
      <div className="p-3 bg-muted/40 backdrop-blur-md border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 flex items-center gap-1.5">
            <Bug className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-extrabold">Visual Debugger</span>
          </div>

          {isDebugging ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Paused on Line {currentLine}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({activeFile?.name || "main.js"})
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Set breakpoints and inspect live variable scope step-by-step
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isDebugging ? (
            <Button
              size="sm"
              onClick={handleStartDebugging}
              className="h-8 text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold gap-1.5 shadow-xs transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Debugger <kbd className="text-[10px] bg-black/20 px-1 rounded">F5</kbd>
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleContinue}
                className="h-8 text-xs rounded-xl gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-card hover:bg-emerald-500/10 border-emerald-500/30"
                title="Continue Execution to Next Breakpoint (F8)"
              >
                <Play className="w-3 h-3 fill-current" />
                Continue <kbd className="text-[10px] opacity-70">F8</kbd>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleStepOver}
                className="h-8 text-xs rounded-xl gap-1.5 font-bold bg-card hover:bg-muted"
                title="Step Over to Next Line (F10)"
              >
                <StepForward className="w-3.5 h-3.5 text-cyan-500" />
                Step Over <kbd className="text-[10px] opacity-70">F10</kbd>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleStepInto}
                className="h-8 text-xs rounded-xl gap-1.5 font-bold bg-card hover:bg-muted"
                title="Step Into Function Call (F11)"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                Step Into <kbd className="text-[10px] opacity-70">F11</kbd>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAutoStepping(!isAutoStepping)}
                className={`h-8 text-xs rounded-xl gap-1.5 font-bold ${
                  isAutoStepping
                    ? "bg-amber-500/20 text-amber-600 border-amber-500/40"
                    : "bg-card hover:bg-muted"
                }`}
                title="Auto Step Through Lines"
              >
                <FastForward className="w-3.5 h-3.5" />
                {isAutoStepping ? "Pause Auto" : "Auto Play"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleStopDebugging}
                className="h-8 text-xs rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 font-bold"
                title="Stop Debugger Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-px bg-border overflow-hidden min-h-[480px]">
        {/* Left Column: Interactive Code Trace & Line Gutter Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-card p-3 flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                Source Code Gutter &amp; Execution Trace
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Breakpoint
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Active Frame
              </span>
            </div>
          </div>

          {/* Code Viewer Canvas */}
          <div className="flex-1 rounded-xl bg-slate-950 p-2 font-mono text-xs overflow-auto select-none border border-slate-800 relative">
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const bp = breakpoints.find((b) => b.line === lineNum);
              const isCurrent = currentLine === lineNum;

              return (
                <div
                  key={lineNum}
                  className={`group relative flex items-center gap-2 py-0.5 px-2 rounded-md transition-all ${
                    isCurrent
                      ? "bg-amber-500/20 text-amber-200 font-semibold border-l-4 border-amber-400 shadow-xs"
                      : "hover:bg-slate-900 text-slate-300"
                  }`}
                >
                  {/* Breakpoint Indicator */}
                  <button
                    onClick={() => toggleBreakpoint(lineNum)}
                    className="w-5 h-5 flex items-center justify-center shrink-0 rounded-full hover:bg-slate-800 transition-colors"
                    title={
                      bp
                        ? bp.condition
                          ? `Conditional Breakpoint: ${bp.condition}`
                          : "Active Breakpoint (Click to Remove)"
                        : "Click to Add Breakpoint"
                    }
                  >
                    {bp ? (
                      <span
                        className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold text-white transition-all ${
                          bp.enabled ? "bg-rose-500 shadow-sm shadow-rose-500/50" : "bg-slate-600"
                        } ${bp.condition ? "ring-2 ring-amber-400" : ""}`}
                      >
                        {bp.condition ? "?" : ""}
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-60 text-slate-500 text-xs">•</span>
                    )}
                  </button>

                  {/* Line Number */}
                  <span
                    onClick={() => toggleBreakpoint(lineNum)}
                    className="w-7 text-right text-slate-500 font-mono text-[11px] shrink-0 cursor-pointer hover:text-cyan-400"
                  >
                    {lineNum}
                  </span>

                  {/* Execution Pointer Icon */}
                  <div className="w-4 shrink-0 flex items-center justify-center">
                    {isCurrent && (
                      <span className="text-amber-400 font-bold text-sm animate-pulse">▶</span>
                    )}
                  </div>

                  {/* Line Code text */}
                  <div className="flex-1 whitespace-pre font-mono text-[11.5px] leading-relaxed overflow-x-auto scrollbar-none flex items-center gap-2">
                    <span>{lineText || " "}</span>
                    {bp?.condition && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        if ({bp.condition})
                      </span>
                    )}
                  </div>

                  {/* Context Action: Edit Condition */}
                  {bp && (
                    <button
                      onClick={() => {
                        setEditingBpLine(lineNum);
                        setBpConditionInput(bp.condition || "");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 text-[10px]"
                      title="Edit Breakpoint Condition"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conditional Breakpoint Popover Dialog */}
          {editingBpLine && (
            <div className="absolute inset-x-6 top-16 bg-slate-900/95 backdrop-blur border border-amber-500/40 p-3 rounded-2xl shadow-2xl z-20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Set Conditional Breakpoint for Line {editingBpLine}
                </span>
                <button
                  onClick={() => setEditingBpLine(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Expression must evaluate to <code className="text-amber-300">true</code> to hit this breakpoint (e.g. <code className="text-cyan-300">i === 3</code> or <code className="text-cyan-300">currentSum &gt; 10</code>).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bpConditionInput}
                  onChange={(e) => setBpConditionInput(e.target.value)}
                  placeholder="e.g. currentSum === 15"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Button
                  size="sm"
                  onClick={() => saveBreakpointCondition(editingBpLine)}
                  className="h-8 text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Save Condition
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Scope, Call Stack, Watch, and Console (5 Cols) */}
        <div className="lg:col-span-5 bg-card flex flex-col overflow-hidden">
          {/* Panel Selector Tabs */}
          <div className="flex items-center border-b border-border bg-muted/20 px-2 py-1 overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setActiveTabPanel("scope")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTabPanel === "scope"
                  ? "bg-card text-cyan-600 dark:text-cyan-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Scope ({scopeVariables.length})
            </button>

            <button
              onClick={() => setActiveTabPanel("stack")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTabPanel === "stack"
                  ? "bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Call Stack
            </button>

            <button
              onClick={() => setActiveTabPanel("watch")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTabPanel === "watch"
                  ? "bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Watch
            </button>

            <button
              onClick={() => setActiveTabPanel("breakpoints")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTabPanel === "breakpoints"
                  ? "bg-card text-rose-600 dark:text-rose-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              Breakpoints
            </button>

            <button
              onClick={() => setActiveTabPanel("console")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTabPanel === "console"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              Console
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {/* 1. SCOPE VARIABLES INSPECTOR */}
            {activeTabPanel === "scope" && (
              <div className="space-y-4">
                {/* Local Scope Block */}
                <div className="rounded-xl bg-muted/30 border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-500" />
                      Local Scope Variables
                    </span>
                    <span className="text-[10px] text-muted-foreground">Double click or click edit to update live</span>
                  </div>

                  {!isDebugging ? (
                    <p className="text-xs text-muted-foreground py-3 italic text-center">
                      Click <strong className="text-emerald-500">Start Debugger (F5)</strong> to inspect local variables.
                    </p>
                  ) : scopeVariables.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">No variables in active local frame.</p>
                  ) : (
                    <div className="space-y-1 font-mono text-xs">
                      {scopeVariables.map((v) => {
                        const isChanged = changedVarNames.has(v.name);
                        const isEditing = editingVarName === v.name;

                        return (
                          <div
                            key={v.name}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                              isChanged
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                                : "bg-card border-border/60 hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                {v.type}
                              </span>
                              <span className="font-bold text-foreground">{v.name}:</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingVarVal}
                                    onChange={(e) => setEditingVarVal(e.target.value)}
                                    className="w-24 px-1.5 py-0.5 bg-background border border-primary rounded text-xs font-mono text-foreground"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveVarEdit(v.name)}
                                    className="p-1 text-emerald-500 hover:text-emerald-400"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingVarName(null)}
                                    className="p-1 text-muted-foreground hover:text-rose-500"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-foreground font-semibold truncate max-w-[150px]">
                                    {v.value}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingVarName(v.name);
                                      setEditingVarVal(v.value);
                                    }}
                                    className="opacity-60 hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity"
                                    title="Edit Variable Value Live"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Global Scope Block */}
                <div className="rounded-xl bg-muted/20 border border-border p-3 space-y-2">
                  <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Global &amp; Module Scope
                  </span>

                  {globalVariables.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1 italic">No global variables recorded.</p>
                  ) : (
                    <div className="space-y-1 font-mono text-xs">
                      {globalVariables.map((v) => (
                        <div key={v.name} className="flex items-center justify-between p-1.5 rounded-lg bg-card/60 text-[11px] border border-border/40">
                          <span className="text-muted-foreground font-semibold">{v.name}:</span>
                          <span className="text-foreground truncate max-w-[180px] font-mono">{v.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CALL STACK PANEL */}
            {activeTabPanel === "stack" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                    Active Stack Frames
                  </span>
                  <span className="text-[11px] text-muted-foreground">Select frame to inspect history</span>
                </div>

                {callStack.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center italic">
                    No active stack frames. Attach debugger to view function execution frames.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {callStack.map((frame, idx) => {
                      const isSelected = selectedFrameIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedFrameIndex(idx)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200"
                              : "bg-card border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                              #{idx}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-foreground">{frame.functionName}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {frame.file}:{frame.line}:{frame.column}
                              </div>
                            </div>
                          </div>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                              TOP
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. WATCH EXPRESSIONS PANEL */}
            {activeTabPanel === "watch" && (
              <div className="space-y-3">
                <form onSubmit={handleAddWatch} className="flex gap-2">
                  <input
                    type="text"
                    value={newWatchInput}
                    onChange={(e) => setNewWatchInput(e.target.value)}
                    placeholder="Add expression (e.g. arr.length, x + y)..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <Button type="submit" size="sm" className="h-8 px-3 text-xs rounded-xl font-bold">
                    <Plus className="w-3.5 h-3.5" />
                    Watch
                  </Button>
                </form>

                <div className="space-y-1.5 font-mono text-xs">
                  {watchExpressions.map((expr) => (
                    <div
                      key={expr}
                      className="flex items-center justify-between p-2 rounded-xl bg-card border border-border"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{expr}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-bold">
                          {watchValues[expr] || "undefined"}
                        </span>
                        <button
                          onClick={() => handleRemoveWatch(expr)}
                          className="text-muted-foreground hover:text-rose-500 p-1 text-xs"
                          title="Remove Watch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BREAKPOINTS MANAGEMENT PANEL */}
            {activeTabPanel === "breakpoints" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border">
                  <span className="text-xs font-bold uppercase text-foreground">
                    Configured Breakpoints ({breakpoints.length})
                  </span>
                  {breakpoints.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBreakpoints([])}
                      className="h-6 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 rounded-lg"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {breakpoints.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center italic">
                    No breakpoints set. Click line numbers in the editor gutter to add breakpoints.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {breakpoints.map((bp) => (
                      <div
                        key={bp.line}
                        className="flex items-center justify-between p-2 rounded-xl bg-card border border-border"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bp.enabled}
                            onChange={() => toggleBreakpointEnabled(bp.line)}
                            className="rounded border-border"
                          />
                          <span className="font-mono text-xs font-bold text-foreground">
                            Line {bp.line}
                          </span>
                          {bp.condition && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                              if ({bp.condition})
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleBreakpoint(bp.line)}
                          className="text-muted-foreground hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. DEBUG CONSOLE / LOG STREAM */}
            {activeTabPanel === "console" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLogFilter("all")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        logFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setLogFilter("stdout")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        logFilter === "stdout" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Console
                    </button>
                    <button
                      onClick={() => setLogFilter("breakpoint")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        logFilter === "breakpoint" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Breakpoints
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDebugLogs([])}
                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                  >
                    Clear Logs
                  </Button>
                </div>

                <div className="rounded-xl bg-slate-950 p-2 font-mono text-xs max-h-64 overflow-y-auto space-y-1.5 border border-slate-800">
                  {filteredLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-4 text-center italic">
                      No debug events logged.
                    </p>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-[11px]">
                        <span className="text-slate-500 text-[10px] shrink-0 font-mono">[{log.timestamp}]</span>
                        <span
                          className={`flex-1 font-mono ${
                            log.type === "breakpoint"
                              ? "text-amber-400 font-bold"
                              : log.type === "stdout"
                              ? "text-emerald-300"
                              : log.type === "eval"
                              ? "text-cyan-300"
                              : "text-slate-300"
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
