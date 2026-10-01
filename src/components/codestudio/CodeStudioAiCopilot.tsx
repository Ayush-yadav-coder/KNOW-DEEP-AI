import React, { useState } from "react";
import {
  Sparkles,
  Bug,
  Zap,
  TestTube,
  ShieldAlert,
  FileText,
  Volume2,
  VolumeX,
  Loader2,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  Send,
  Code2,
  Layers,
  BookOpen,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { CopilotAction, SupportedLanguage, CodeFile } from "./CodeStudioTypes";
import { KnowDeepBadge } from "@/components/KnowDeepBadge";

interface CodeStudioAiCopilotProps {
  activeFile?: CodeFile;
  projectFiles?: CodeFile[];
  currentCode?: string;
  currentLanguage?: SupportedLanguage;
  onApplyCodeFix?: (fixedCode: string) => void;
  onApplyCode?: (fixedCode: string) => void;
  initialAction?: CopilotAction;
}

export const CodeStudioAiCopilot: React.FC<CodeStudioAiCopilotProps> = ({
  activeFile,
  projectFiles = [],
  currentCode,
  currentLanguage,
  onApplyCodeFix,
  onApplyCode,
  initialAction = "explain",
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CopilotAction>(initialAction);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [extractedCode, setExtractedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoInject, setAutoInject] = useState(true);

  const effectiveCode = currentCode ?? activeFile?.content ?? "";
  const effectiveLanguage = currentLanguage ?? activeFile?.language ?? "javascript";
  const activeFilePath = activeFile?.folder
    ? `${activeFile.folder}/${activeFile.name}`
    : activeFile?.name || "main.js";

  // Helper to extract code block from markdown
  const extractCodeFromMarkdown = (text: string): string | null => {
    const codeBlockMatch = text.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : null;
  };

  const handleRunAiAction = async (action: CopilotAction, userCustomQuery?: string) => {
    const queryToUse = userCustomQuery || customPrompt;

    if (!effectiveCode.trim() && action !== "custom") {
      toast({ title: "No Code Selected", description: "Please write code in the Code Editor first, or type custom instructions below to create an app.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysisResult("");
    setExtractedCode(null);
    setActiveTab(action);

    // Build Full Project Context Summary for Deep Intelligence
    const allFilesList = projectFiles.length > 0 ? projectFiles : activeFile ? [activeFile] : [];
    const projectStructure = allFilesList
      .map((f) => {
        const path = f.folder ? `${f.folder}/${f.name}` : f.name;
        const excerpt = f.content.slice(0, 350);
        return `--- File: ${path} (${f.language}) ---\n${excerpt}${f.content.length > 350 ? "\n..." : ""}`;
      })
      .join("\n\n");

    const systemPrompt = `You are AI Code Studio Know Deep, an elite principal software architect and intelligent coding companion.
You have real-time contextual awareness of the active file buffer and the overall project workspace.

================================================================================
ACTIVE FILE TARGET & CONTEXT
================================================================================
- RELATIVE FILE PATH: "${activeFilePath}"
- PROGRAMMING LANGUAGE: "${effectiveLanguage}"
- TOTAL LINE COUNT: ${effectiveCode.split("\n").length} lines

--- FULL CONTENT OF CURRENT ACTIVE BUFFER (${activeFilePath}) ---
\`\`\`${effectiveLanguage}
${effectiveCode}
\`\`\`
================================================================================

WORKSPACE PROJECT FILES OVERVIEW (${allFilesList.length} files total):
${projectStructure}

STRICT CONTEXTUAL SCOPING DIRECTIVES:
1. TARGET SCOPING: All code suggestions, line-by-line analyses, refactorings, optimizations, bug fixes, unit tests, and explanations MUST be strictly scoped and contextually tailored to the active file "${activeFilePath}" and its language "${effectiveLanguage}".
2. FULL BUFFER FIDELITY: Base all reasoning on the complete active buffer content provided above. Preserve existing variable naming conventions, framework imports/exports, function signatures, and structural paradigms unless the user explicitly asks to replace them.
3. INJECTION COMPATIBILITY: Output clean, complete code inside standard markdown blocks (\`\`\`${effectiveLanguage} ... \`\`\`) so it can be seamlessly applied directly into "${activeFilePath}" in the Code Editor.
4. ARCHITECTURAL INTEGRITY: Ensure generated code is production-ready, highly performant, type-safe, and free of syntax errors or undefined identifiers.`;

    let userPrompt = "";

    switch (action) {
      case "explain":
        userPrompt = `Perform a comprehensive, project-aware breakdown of file "${activeFilePath}" (${effectiveLanguage}):

1. **High-Level Purpose & Architecture**: What this file achieves in the context of the workspace.
2. **Line-by-Line Breakdown**: Step through the critical lines and logical segments sequentially, explaining exactly what each operation does.
3. **Computational Complexity Analysis (Big-O)**:
   - **Time Complexity**: Exact Big-O runtime notation with detailed justification.
   - **Space Complexity**: Exact Big-O memory allocation explanation.
4. **Edge Cases & Failure Modes**: Potential boundary conditions, null/undefined traps, or numeric overflow risks.
5. **Architectural Improvements**: Idiomatic best practices and cleaner alternatives.

\`\`\`${effectiveLanguage}
${effectiveCode}
\`\`\``;
        break;
      case "debug":
        userPrompt = `Audit and debug file "${activeFilePath}" (${effectiveLanguage}). Identify any syntax errors, logic bugs, boundary vulnerabilities, or runtime crashes.\nProvide the full, corrected, and clean code inside a single markdown code block (\`\`\`${effectiveLanguage} ... \`\`\`), followed by a concise bulleted list of the exact fixes made.\n\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\``;
        break;
      case "optimize":
        userPrompt = `Refactor and optimize file "${activeFilePath}" (${effectiveLanguage}) for maximum execution speed, reduced memory allocation, and cleaner modern idioms.\nProvide the fully optimized code inside a single markdown code block (\`\`\`${effectiveLanguage} ... \`\`\`), followed by a Big-O benchmark comparison before vs after.\n\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\``;
        break;
      case "unit-tests":
        userPrompt = `Generate an exhaustive unit test suite for file "${activeFilePath}" (${effectiveLanguage}).\nInclude tests for standard happy path, edge cases, and exception handling.\n\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\``;
        break;
      case "security":
        userPrompt = `Perform a comprehensive OWASP Top 10 security audit on file "${activeFilePath}" (${effectiveLanguage}).\nList any found vulnerabilities with Severity and provide remediated secure code.\n\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\``;
        break;
      case "docstrings":
        userPrompt = `Generate comprehensive docstrings and typing documentation for file "${activeFilePath}" (${effectiveLanguage}).\nProvide the fully documented code inside a single code block.\n\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\``;
        break;
      case "custom":
        userPrompt = effectiveCode.trim()
          ? `Regarding active file "${activeFilePath}" (${effectiveLanguage}) in the Code Editor:\n\`\`\`${effectiveLanguage}\n${effectiveCode}\n\`\`\`\n\nUser Question / Instruction: ${queryToUse}`
          : `Create a complete, fully functional, production-ready ${effectiveLanguage} application/component for file "${activeFilePath}" based on this user instruction:\n"${queryToUse}"\n\nProvide the complete working code inside a single markdown code block (\`\`\`${effectiveLanguage} ... \`\`\`), followed by a brief summary of features built.`;
        break;
    }

    try {
      // Structured JSON Context Object for Project-Aware Intelligence
      const activeFileContextJson = {
        activeFile: {
          relativePath: activeFilePath,
          language: effectiveLanguage,
          totalLines: effectiveCode.split("\n").length,
          fullContent: effectiveCode,
        },
        workspaceSummary: allFilesList.map((f) => ({
          path: f.folder ? `${f.folder}/${f.name}` : f.name,
          language: f.language,
          sizeBytes: f.content.length,
        })),
        requestedAction: action,
      };

      const finalPromptWithContext = `FILE CONTEXT (JSON):\n${JSON.stringify(activeFileContextJson, null, 2)}\n\nUSER PROMPT:\n${userPrompt}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: finalPromptWithContext }],
          systemPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI service request failed");
      }

      const responseText = data.content || "Analysis complete.";
      setAnalysisResult(responseText);

      // ALWAYS check if we can extract code for 1-click write to Code Editor
      const codeSnippet = extractCodeFromMarkdown(responseText);
      if (codeSnippet) {
        setExtractedCode(codeSnippet);
        if (autoInject) {
          if (onApplyCodeFix) onApplyCodeFix(codeSnippet);
          if (onApplyCode) onApplyCode(codeSnippet);
          toast({
            title: "Direct Code Injection Complete!",
            description: `Injected generated code directly into active tab: ${activeFile?.name || "Code Editor"}.`,
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to AI Code Studio Know Deep.";
      toast({ title: "AI Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFix = () => {
    if (extractedCode) {
      if (onApplyCodeFix) onApplyCodeFix(extractedCode);
      if (onApplyCode) onApplyCode(extractedCode);
      toast({ title: "Code Applied!", description: "Code Editor updated with AI improvements." });
    }
  };

  const handleCopyAnalysis = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "AI analysis copied to clipboard." });
  };

  const handleSpeakWalkthrough = async () => {
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (!analysisResult) return;

    try {
      setIsPlayingAudio(true);
      const cleanSummary = analysisResult.replace(/```[\s\S]*?```/g, "Code block omitted for audio.").slice(0, 800);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanSummary, voice: "Kore" }),
      });

      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
        setAudioElement(audio);
      } else {
        setIsPlayingAudio(false);
      }
    } catch (err) {
      setIsPlayingAudio(false);
      console.warn("TTS error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Official KnowDeep AI Brand Header */}
      <div className="p-3 px-4 border-b border-border/70 bg-muted/30 backdrop-blur flex items-center justify-between">
        <KnowDeepBadge
          assistantName="KnowDeep Code Architect"
          studioBadge="Code Studio AI"
          size="sm"
          showAura={true}
        />
        <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-lg border border-border/50">
          Autonomous Coding Engine
        </span>
      </div>

      {/* AI Mode Tabs Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 backdrop-blur-md border-b border-border text-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 flex-1">
          <Button
            size="sm"
            variant={activeTab === "explain" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("explain")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "explain"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Explain &amp; Complexity
          </Button>

          <Button
            size="sm"
            variant={activeTab === "debug" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("debug")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "debug"
                ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-300" />
            Auto-Fix Bugs
          </Button>

          <Button
            size="sm"
            variant={activeTab === "optimize" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("optimize")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "optimize"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Optimize Code
          </Button>

          <Button
            size="sm"
            variant={activeTab === "unit-tests" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("unit-tests")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "unit-tests"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <TestTube className="w-3.5 h-3.5 text-emerald-300" />
            Unit Tests
          </Button>

          <Button
            size="sm"
            variant={activeTab === "security" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("security")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "security"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" />
            Security Audit
          </Button>

          <Button
            size="sm"
            variant={activeTab === "docstrings" ? "default" : "ghost"}
            onClick={() => handleRunAiAction("docstrings")}
            disabled={isLoading}
            className={`h-7 text-xs rounded-xl gap-1.5 px-3 shrink-0 backdrop-blur-md transition-all duration-200 ${
              activeTab === "docstrings"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:opacity-90"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-300" />
            Docs &amp; JSDoc
          </Button>
        </div>

        {/* Audio / Copy Actions */}
        {analysisResult && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSpeakWalkthrough}
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-xl backdrop-blur-sm hover:bg-muted/80 transition-all"
              title={isPlayingAudio ? "Stop Voice" : "Listen to Explanation"}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyAnalysis}
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-xl backdrop-blur-sm hover:bg-muted/80 transition-all"
              title="Copy Analysis"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Real-time File & Project Context Status Bar */}
      <div className="px-3.5 py-1.5 bg-muted/20 border-b border-border text-[11px] font-mono flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 truncate">
            <Code2 className="w-3.5 h-3.5 text-cyan-500" />
            {activeFilePath}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted uppercase font-bold text-foreground">
            {effectiveLanguage}
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            ({effectiveCode.split("\n").length} lines)
          </span>
        </div>

        <span className="flex items-center gap-1 text-[10px] text-cyan-500 font-semibold shrink-0">
          <Layers className="w-3 h-3 text-cyan-500" />
          {projectFiles.length || 1} Workspace Files Linked
        </span>
      </div>

      {/* Direct AI-to-Editor Injection Bridge Banner */}
      {extractedCode && (
        <div className="bg-cyan-500/10 backdrop-blur-md border-b border-cyan-500/20 px-3.5 py-2 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-500 fill-current" />
              Direct AI Bridge Active:
            </span>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoInject}
                onChange={(e) => setAutoInject(e.target.checked)}
                className="rounded border-border text-cyan-500 focus:ring-cyan-500"
              />
              <span>Auto-Inject to Active Tab ({activeFile?.name || "Editor"})</span>
            </label>
          </div>

          <Button
            size="sm"
            onClick={handleApplyFix}
            className="h-6 px-3 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg gap-1 shadow-sm transition-all hover:scale-[1.02]"
          >
            <Check className="w-3 h-3 text-white" />
            Inject into Active Tab
          </Button>
        </div>
      )}

      {/* Analysis Output Body with Smooth Scrollbox */}
      <div className="flex-1 p-5 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 scroll-smooth">
        {isLoading ? (
          <div className="h-full py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 backdrop-blur-md animate-pulse">
              <BrainCircuit className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">AI Code Studio Know Deep is Analyzing...</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Evaluating line-by-line syntax, Big-O computational bounds, and architectural paradigms
              </p>
            </div>
          </div>
        ) : analysisResult ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <div className="w-12 h-12 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 shadow-sm backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">AI Code Studio Know Deep</p>
            <p className="text-xs max-w-sm mx-auto text-muted-foreground">
              Click &quot;Explain &amp; Complexity&quot; for an in-depth line-by-line breakdown and Big-O analysis, or type custom instructions below.
            </p>
          </div>
        )}
      </div>

      {/* Quick AI App Generator Chips */}
      <div className="px-3 pt-2 bg-muted/20 border-t border-border/50 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        <span className="font-bold text-muted-foreground uppercase shrink-0">AI Build:</span>
        <button
          onClick={() => handleRunAiAction("custom", `Create a modern interactive Todo List app with Tailwind styling in ${effectiveLanguage}`)}
          className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold shrink-0 transition-all"
        >
          ✨ Build Todo App
        </button>
        <button
          onClick={() => handleRunAiAction("custom", `Create a sleek Weather Card widget with mock forecast data and Tailwind CSS in ${effectiveLanguage}`)}
          className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-semibold shrink-0 transition-all"
        >
          🌤️ Build Weather Widget
        </button>
        <button
          onClick={() => handleRunAiAction("custom", `Create a dark theme scientific calculator with glassmorphism UI in ${effectiveLanguage}`)}
          className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold shrink-0 transition-all"
        >
          🧮 Build Calculator
        </button>
      </div>

      {/* Custom AI Query Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customPrompt.trim()) {
            handleRunAiAction("custom", customPrompt.trim());
          }
        }}
        className="flex items-center gap-2 p-3 bg-muted/40 backdrop-blur-md border-t border-border"
      >
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ask AI Code Studio Know Deep (e.g. 'Explain line 12-25', 'Add input validation')..."
          className="flex-1 bg-background/80 backdrop-blur-xs border border-border/80 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !customPrompt.trim()}
          className="h-9 px-4 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-sm transition-all hover:scale-[1.02]"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </form>
    </div>
  );
};
