import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Code2,
  Terminal as TerminalIcon,
  Play,
  Eye,
  Sparkles,
  ArrowRightLeft,
  BarChart3,
  Globe,
  Search,
  Database,
  BookOpen,
  Download,
  Upload,
  FolderTree,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Sliders,
  ChevronRight,
  Layers,
  LayoutGrid,
  Github,
  BrainCircuit,
  Bookmark,
  Share2,
  Camera,
  Bug,
  GitCompare,
  TestTube,
  Server,
  Wrench,
  GitBranch,
  Gauge,
  SlidersHorizontal,
  SplitSquareVertical,
  Columns,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";

// Subcomponents
import { CodeStudioEditor } from "@/components/codestudio/CodeStudioEditor";
import { CodeStudioTerminal } from "@/components/codestudio/CodeStudioTerminal";
import { CodeStudioLivePreview } from "@/components/codestudio/CodeStudioLivePreview";
import { CodeStudioAiCopilot } from "@/components/codestudio/CodeStudioAiCopilot";
import { CodeStudioTranspiler } from "@/components/codestudio/CodeStudioTranspiler";
import { CodeStudioAlgoVisualizer } from "@/components/codestudio/CodeStudioAlgoVisualizer";
import { CodeStudioApiClient } from "@/components/codestudio/CodeStudioApiClient";
import { CodeStudioRegexTester } from "@/components/codestudio/CodeStudioRegexTester";
import { CodeStudioSqlPlayground } from "@/components/codestudio/CodeStudioSqlPlayground";
import { CodeStudioGitHubModal } from "@/components/codestudio/CodeStudioGitHubModal";
import { CodeStudioSavedSnippets } from "@/components/codestudio/CodeStudioSavedSnippets";
import { CodeStudioShareModal } from "@/components/codestudio/CodeStudioShareModal";
import { CodeStudioDebugger } from "@/components/codestudio/CodeStudioDebugger";
import { CodeStudioGitDiff } from "@/components/codestudio/CodeStudioGitDiff";
import { CodeStudioSnapshotModal } from "@/components/codestudio/CodeStudioSnapshotModal";
import { CodeStudioProjectTemplatesModal } from "@/components/codestudio/CodeStudioProjectTemplatesModal";
import { CodeStudioTemplatePreviewModal } from "@/components/codestudio/CodeStudioTemplatePreviewModal";
import { CodeStudioProjectStatsWidget } from "@/components/codestudio/CodeStudioProjectStatsWidget";
import { MASTER_PROJECT_TEMPLATES, GalleryTemplate } from "@/components/codestudio/TemplateGallery";
import { CodeStudioLintSettings, DEFAULT_LINT_SETTINGS } from "@/components/codestudio/CodeStudioLintSettings";
import { CodeStudioTestRunner } from "@/components/codestudio/CodeStudioTestRunner";
import { CodeStudioMockApi } from "@/components/codestudio/CodeStudioMockApi";
import { CodeStudioRefactorSmells } from "@/components/codestudio/CodeStudioRefactorSmells";
import { CodeStudioErdVisualizer } from "@/components/codestudio/CodeStudioErdVisualizer";
import { CodeStudioRegexRailroad } from "@/components/codestudio/CodeStudioRegexRailroad";
import { CodeStudioMarkdownNotebook } from "@/components/codestudio/CodeStudioMarkdownNotebook";
import { CodeStudioProfiler } from "@/components/codestudio/CodeStudioProfiler";
import { SNIPPET_TEMPLATES } from "@/components/codestudio/CodeStudioSnippetsVault";
import {
  CodeFile,
  SupportedLanguage,
  TerminalLog,
  SnippetTemplate,
  CopilotAction,
  LintingSettings,
} from "@/components/codestudio/CodeStudioTypes";

type StudioTabMode =
  | "editor"
  | "preview"
  | "copilot"
  | "lint"
  | "tests"
  | "mockapi"
  | "refactor"
  | "erd"
  | "railroad"
  | "notebook"
  | "profiler"
  | "saved"
  | "debugger"
  | "gitdiff"
  | "transpiler"
  | "algo"
  | "api"
  | "regex"
  | "sql"
  | "snippets";

const INITIAL_FILES: CodeFile[] = [
  {
    id: "f-1",
    name: "main.js",
    language: "javascript",
    isMain: true,
    content: `// Know Deep Code Studio - Safe In-Browser Sandbox
function findLongestSubarray(arr, k) {
  let maxLength = 0;
  let currentSum = 0;
  const sumMap = new Map(); // sum -> index

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    if (currentSum === k) maxLength = i + 1;
    if (sumMap.has(currentSum - k)) {
      maxLength = Math.max(maxLength, i - sumMap.get(currentSum - k));
    }
    if (!sumMap.has(currentSum)) {
      sumMap.set(currentSum, i);
    }
  }
  return maxLength;
}

const numbers = [10, 5, 2, 7, 1, 9];
const targetSum = 15;
console.log("Input Array:", numbers);
console.log("Target Sum:", targetSum);
const longest = findLongestSubarray(numbers, targetSum);
console.log("Longest subarray length summing to", targetSum, "is:", longest);
`,
  },
  {
    id: "f-2",
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Know Deep Interactive Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between">
      <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full">Know Deep</span>
      <span class="text-xs text-slate-400">Preview Option</span>
    </div>
    <h2 class="text-xl font-bold">Interactive Component</h2>
    <p class="text-sm text-slate-300">Edit this HTML or CSS in Code Studio and see real-time updates instantly.</p>
    <button onclick="alert('Component working!')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white text-sm shadow-md hover:opacity-90">
      Click to Test
    </button>
  </div>
</body>
</html>
`,
  },
];

export default function CodeStudio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<StudioTabMode>("editor");
  const [editorLayout, setEditorLayout] = useState<"split-preview" | "split-terminal" | "editor-only">("split-preview");
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("f-1");
  const [isExecuting, setIsExecuting] = useState(false);
  const [lintSettings, setLintSettings] = useState<LintingSettings>(DEFAULT_LINT_SETTINGS);

  // Modals
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<GalleryTemplate | null>(null);

  const [showBottomTerminal, setShowBottomTerminal] = useState(false);
  const [aiInitialAction, setAiInitialAction] = useState<CopilotAction>("explain");
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: "init-1",
      type: "system",
      text: "Know Deep Code Studio Kernel initialized with Code Editor engine. Ready for execution.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Check URL hash on mount for shared snippet (#snippet=...)
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes("snippet=")) {
        const base64 = decodeURIComponent(hash.split("snippet=")[1]);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const decoded = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(decoded);

        if (parsed.mode === "single" && parsed.content) {
          const sharedFile: CodeFile = {
            id: `shared-${Date.now()}`,
            name: parsed.name || "shared_snippet.js",
            language: parsed.lang || "javascript",
            content: parsed.content,
            isMain: true,
          };
          setFiles([sharedFile, ...INITIAL_FILES]);
          setActiveFileId(sharedFile.id);
          toast({
            title: "Shared Snippet Loaded",
            description: `Loaded ${sharedFile.name} from unique URL.`,
          });
        } else if (parsed.mode === "project" && Array.isArray(parsed.files)) {
          setFiles(parsed.files);
          setActiveFileId(parsed.files[0]?.id || "f-1");
          toast({
            title: "Shared Workspace Loaded",
            description: `Loaded ${parsed.files.length} project files.`,
          });
        }
      }
    } catch {
      // Ignore URL parse error
    }
  }, [toast]);

  const handleAddFile = (name: string, language: SupportedLanguage, folder: string = "") => {
    const newFile: CodeFile = {
      id: `f-${Date.now()}`,
      name,
      folder,
      language,
      content:
        language === "html"
          ? "<!DOCTYPE html>\n<html>\n<head>\n  <title>New App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>"
          : language === "python"
          ? "# Python Script\ndef main():\n    print('Hello from Know Deep Code Studio')\n\nif __name__ == '__main__':\n    main()"
          : language === "sql"
          ? "SELECT * FROM users WHERE active = true LIMIT 10;"
          : `// ${name}\nconsole.log("Welcome to ${name}");\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleAddFolder = (folderPath: string) => {
    handleAddFile("index.js", "javascript", folderPath);
  };

  const handleRenameFile = (id: string, newName: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: newName } : f)));
  };

  const handleDeleteFolder = (folderPath: string) => {
    const remaining = files.filter((f) => f.folder !== folderPath && !f.folder?.startsWith(`${folderPath}/`));
    if (remaining.length === 0) {
      toast({ title: "Action Blocked", description: "Cannot delete the entire workspace.", variant: "destructive" });
      return;
    }
    setFiles(remaining);
    if (!remaining.some((f) => f.id === activeFileId)) {
      setActiveFileId(remaining[0].id);
    }
    toast({ title: "Folder Deleted", description: `Removed folder ${folderPath}.` });
  };

  const handleCloseFile = (id: string) => {
    if (files.length <= 1) {
      toast({ title: "Cannot Close", description: "At least one file must remain open." });
      return;
    }
    const filtered = files.filter((f) => f.id !== id);
    setFiles(filtered);
    if (activeFileId === id) {
      setActiveFileId(filtered[0].id);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, content: newCode } : f))
    );
  };

  const addLog = (type: TerminalLog["type"], text: string) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    addLog("system", `--- Executing [${activeFile.name}] (${activeFile.language}) ---`);

    const startTime = performance.now();

    if (activeFile.language === "javascript" || activeFile.language === "typescript") {
      try {
        const capturedLogs: string[] = [];
        const customConsole = {
          log: (...args: unknown[]) => {
            const formatted = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
              .join(" ");
            capturedLogs.push(formatted);
            addLog("stdout", formatted);
          },
          error: (...args: unknown[]) => {
            const formatted = args.map((arg) => String(arg)).join(" ");
            addLog("stderr", formatted);
          },
          warn: (...args: unknown[]) => {
            const formatted = args.map((arg) => String(arg)).join(" ");
            addLog("warn", formatted);
          },
          info: (...args: unknown[]) => {
            const formatted = args.map((arg) => String(arg)).join(" ");
            addLog("info", formatted);
          },
        };

        const runner = new Function("console", activeFile.content);
        const result = runner(customConsole);

        if (result !== undefined) {
          addLog("info", `➜ Return value: ${typeof result === "object" ? JSON.stringify(result) : String(result)}`);
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        addLog("system", `✓ Execution finished in ${duration}ms (status code 0).`);

        toast({
          title: "Execution Finished",
          description: `Ran ${activeFile.name} successfully in ${duration}ms.`,
        });
      } catch (err: unknown) {
        const error = err as Error;
        addLog("stderr", `Uncaught ${error.name || "Error"}: ${error.message}`);
        if (error.stack) {
          addLog("stderr", error.stack.split("\n").slice(0, 3).join("\n"));
        }
        toast({
          title: "Execution Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsExecuting(false);
      }
    } else if (activeFile.language === "html") {
      setIsExecuting(false);
      setActiveTab("preview");
      toast({
        title: "Switched to Preview Option",
        description: "Viewing live rendered HTML canvas.",
      });
    } else {
      setTimeout(() => {
        addLog("stdout", `[Simulated ${activeFile.language.toUpperCase()} Output] Execution finished successfully.`);
        addLog("system", `✓ Process exited with code 0.`);
        setIsExecuting(false);
      }, 300);
    }
  };

  const handleExplainCode = () => {
    setAiInitialAction("explain");
    setActiveTab("copilot");
  };

  const handleExecuteReplCommand = (command: string) => {
    addLog("system", `> ${command}`);
    try {
      const result = eval(command);
      addLog("stdout", typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
    } catch (err: unknown) {
      const error = err as Error;
      addLog("stderr", `Evaluation Error: ${error.message}`);
    }
  };

  const handleExportZip = async () => {
    try {
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file.content);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `know-deep-studio-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "ZIP Exported", description: `Downloaded ${files.length} workspace files.` });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const ext = file.name.split(".").pop() || "js";
      const langMap: Record<string, SupportedLanguage> = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        html: "html",
        css: "css",
        sql: "sql",
        cpp: "cpp",
        java: "java",
        rs: "rust",
        go: "go",
        json: "json",
        md: "markdown",
      };
      const lang = langMap[ext] || "javascript";
      handleAddFile(file.name, lang);
      handleCodeChange(text);
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout title="Code Studio">
      <div className="w-full flex-1 flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* Top Header Navigation & Action Bar with Glassy Sheen */}
        <div className="border-b border-border/70 bg-card/70 backdrop-blur-xl px-4 py-3 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Title & Brand Pill */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shrink-0 border border-white/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground tracking-tight">Code Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 backdrop-blur-sm">
                    Monaco Engine Pro
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Monaco editor, AI Code Studio Know Deep, Preview Option, Jest tests, mock API &amp; profiler
                </p>
              </div>
            </div>

            {/* Quick Actions with Glassy Animation */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="h-8 text-xs px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold gap-1.5 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 border border-emerald-400/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run (⌘↵)
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExplainCode}
                className="h-8 text-xs px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold gap-1.5 border border-cyan-500/30 backdrop-blur-md shadow-2xs transition-all duration-200 hover:scale-[1.03]"
                title="Explain Code (Line-by-Line & Complexity Analysis)"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                Explain Code
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
                className="h-8 text-xs px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 backdrop-blur-md shadow-2xs gap-1.5 transition-all duration-200 hover:scale-[1.03]"
                title="Share Unique Snippet URL"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Share
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSnapshotModalOpen(true)}
                className="h-8 text-xs px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 backdrop-blur-md shadow-2xs gap-1.5 transition-all duration-200 hover:scale-[1.03]"
                title="Export Code Snapshot Card"
              >
                <Camera className="w-3.5 h-3.5 text-purple-500" />
                Snapshot
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGitHubModalOpen(true)}
                className="h-8 text-xs px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 backdrop-blur-md shadow-2xs gap-1.5 transition-all duration-200 hover:scale-[1.03]"
                title="GitHub Repositories & Push"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </Button>

              <label className="cursor-pointer">
                <input type="file" onChange={handleUploadFile} className="hidden" />
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 text-xs px-2.5 rounded-xl gap-1 text-muted-foreground hover:text-foreground bg-muted/40 backdrop-blur-md hover:bg-muted transition-all hover:scale-[1.03]"
                >
                  <span>
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Import</span>
                  </span>
                </Button>
              </label>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportZip}
                className="h-8 text-xs px-2.5 rounded-xl gap-1 text-muted-foreground hover:text-foreground bg-muted/40 backdrop-blur-md hover:bg-muted transition-all hover:scale-[1.03]"
                title="Download Project as ZIP"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ZIP</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFiles(INITIAL_FILES);
                  setActiveFileId("f-1");
                  toast({ title: "Reset", description: "Workspace restored to default files." });
                }}
                className="h-8 text-xs px-2 rounded-xl text-muted-foreground hover:text-rose-500 backdrop-blur-xs transition-all hover:scale-105"
                title="Reset Workspace"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs with Glassy Backdrop & Smooth Scrolling */}
        <div className="border-b border-border/60 bg-muted/30 backdrop-blur-md px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
            {/* 1. Monaco Editor */}
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "editor"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Monaco Editor
            </button>

            {/* 2. Preview Option (Beside Editor) */}
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "preview"
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Preview Option
            </button>

            {/* 3. AI Code Studio Know Deep */}
            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "copilot"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs border border-cyan-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-500" />
              AI Code Studio Know Deep
            </button>

            {/* 4. Linting & Formatting */}
            <button
              onClick={() => setActiveTab("lint")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "lint"
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 shadow-xs border border-cyan-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
              Linting &amp; Formatting
            </button>

            {/* 5. Jest Test Runner */}
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "tests"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <TestTube className="w-3.5 h-3.5 text-emerald-500" />
              Jest Tests
            </button>

            {/* 6. Mock API Service */}
            <button
              onClick={() => setActiveTab("mockapi")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "mockapi"
                  ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 shadow-xs border border-teal-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Server className="w-3.5 h-3.5 text-teal-500" />
              Mock API Service
            </button>

            {/* 7. AI Refactor & Smells */}
            <button
              onClick={() => setActiveTab("refactor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "refactor"
                  ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-purple-500" />
              Refactor &amp; Smells
            </button>

            {/* 8. ERD Visualizer */}
            <button
              onClick={() => setActiveTab("erd")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "erd"
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 shadow-xs border border-cyan-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              Database ERD
            </button>

            {/* 9. Regex Railroad */}
            <button
              onClick={() => setActiveTab("railroad")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "railroad"
                  ? "bg-pink-500/15 text-pink-700 dark:text-pink-300 shadow-xs border border-pink-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-pink-500" />
              Regex Railroad
            </button>

            {/* 10. Markdown Notebook */}
            <button
              onClick={() => setActiveTab("notebook")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "notebook"
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Markdown Notebook
            </button>

            {/* 11. Performance Profiler */}
            <button
              onClick={() => setActiveTab("profiler")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "profiler"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              Performance Profiler
            </button>

            {/* 12. Saved Snippets */}
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "saved"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              Saved Snippets
            </button>

            {/* 13. Debugger */}
            <button
              onClick={() => setActiveTab("debugger")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "debugger"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 shadow-xs border border-rose-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              Debugger
            </button>

            {/* 14. Git Diff */}
            <button
              onClick={() => setActiveTab("gitdiff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "gitdiff"
                  ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-500/40 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
              Git Diff
            </button>

            {/* 15. Transpiler */}
            <button
              onClick={() => setActiveTab("transpiler")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "transpiler"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              Transpiler
            </button>

            {/* 16. Algo Visualizer */}
            <button
              onClick={() => setActiveTab("algo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "algo"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              Algo Visualizer
            </button>

            {/* 17. REST API Client */}
            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "api"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-500" />
              REST API Client
            </button>

            {/* 18. Regex */}
            <button
              onClick={() => setActiveTab("regex")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "regex"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-purple-500" />
              Regex
            </button>

            {/* 19. SQL */}
            <button
              onClick={() => setActiveTab("sql")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "sql"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              SQL Workbench
            </button>

            {/* 20. Templates */}
            <button
              onClick={() => setActiveTab("snippets")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === "snippets"
                  ? "bg-card text-foreground shadow-xs border border-border scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-500" />
              Templates ({SNIPPET_TEMPLATES.length})
            </button>
          </div>
        </div>

        {/* Main Studio Viewport */}
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex-1 flex flex-col space-y-3">
          {/* REAL-TIME PROJECT STATISTICS DASHBOARD WIDGET */}
          <CodeStudioProjectStatsWidget
            files={files}
            activeFileId={activeFileId}
            onOpenSnapshot={() => setIsSnapshotModalOpen(true)}
            onOpenGitHub={() => setIsGitHubModalOpen(true)}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          />

          {/* TAB 1: MONACO EDITOR WITH BESIDE PREVIEW OPTION */}
          {activeTab === "editor" && (
            <div className="flex flex-col flex-1 space-y-3">
              {/* Layout mode switcher bar */}
              <div className="flex items-center justify-between bg-card/60 border border-border px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <Columns className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Editor Workspace Layout:</span>
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setEditorLayout("split-preview")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      editorLayout === "split-preview"
                        ? "bg-card text-cyan-600 dark:text-cyan-400 shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Beside Preview Option
                  </button>

                  <button
                    onClick={() => setEditorLayout("split-terminal")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      editorLayout === "split-terminal"
                        ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TerminalIcon className="w-3 h-3" />
                    Beside Terminal &amp; Console
                  </button>

                  <button
                    onClick={() => setEditorLayout("editor-only")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      editorLayout === "editor-only"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    Full Width Editor
                  </button>
                </div>
              </div>

              {/* Grid content based on layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">
                {/* Left Column: Monaco Code Editor */}
                <div className={`${editorLayout === "editor-only" ? "lg:col-span-12" : "lg:col-span-7"} flex flex-col`}>
                  <CodeStudioEditor
                    files={files}
                    activeFileId={activeFileId}
                    onSelectFile={setActiveFileId}
                    onAddFile={handleAddFile}
                    onAddFolder={handleAddFolder}
                    onCloseFile={handleCloseFile}
                    onRenameFile={handleRenameFile}
                    onDeleteFolder={handleDeleteFolder}
                    onCodeChange={handleCodeChange}
                    onRunCode={handleRunCode}
                    onExplainCode={handleExplainCode}
                    onOpenGitHub={() => setIsGitHubModalOpen(true)}
                    onOpenShare={() => setIsShareModalOpen(true)}
                    onOpenSnapshot={() => setIsSnapshotModalOpen(true)}
                    onOpenSavedSnippets={() => setActiveTab("saved")}
                    onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
                    isExecuting={isExecuting}
                  />
                </div>

                {/* Right Column: Beside Preview Option OR Terminal */}
                {editorLayout === "split-preview" && (
                  <div className="lg:col-span-5 flex flex-col">
                    <CodeStudioLivePreview files={files} activeFileId={activeFileId} />
                  </div>
                )}

                {editorLayout === "split-terminal" && (
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    <div className="flex-1 min-h-[300px]">
                      <CodeStudioTerminal
                        logs={terminalLogs}
                        onClear={() => setTerminalLogs([])}
                        onExecuteCommand={handleExecuteReplCommand}
                        isExecuting={isExecuting}
                        files={files}
                        activeFileId={activeFileId}
                        onAddFile={handleAddFile}
                        onUpdateFileContent={handleCodeChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PREVIEW OPTION (FULL VIEW) */}
          {activeTab === "preview" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioLivePreview files={files} activeFileId={activeFileId} />
            </div>
          )}

          {/* TAB 3: AI CODE STUDIO KNOW DEEP */}
          {activeTab === "copilot" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioAiCopilot
                activeFile={activeFile}
                projectFiles={files}
                initialAction={aiInitialAction}
                onApplyCode={(optimizedCode) => {
                  handleCodeChange(optimizedCode);
                  setActiveTab("editor");
                }}
                onApplyCodeFix={(fixedCode) => {
                  handleCodeChange(fixedCode);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 4: LINTING & FORMATTING */}
          {activeTab === "lint" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioLintSettings
                settings={lintSettings}
                onUpdateSettings={setLintSettings}
                code={activeFile.content}
                language={activeFile.language}
                onApplyFormattedCode={handleCodeChange}
              />
            </div>
          )}

          {/* TAB 5: JEST TEST RUNNER */}
          {activeTab === "tests" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioTestRunner files={files} activeFile={activeFile} />
            </div>
          )}

          {/* TAB 6: MOCK API SERVICE */}
          {activeTab === "mockapi" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioMockApi />
            </div>
          )}

          {/* TAB 7: AI REFACTOR & CODE SMELLS */}
          {activeTab === "refactor" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioRefactorSmells
                activeFile={activeFile}
                onApplyRefactor={(refactored) => {
                  handleCodeChange(refactored);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 8: DATABASE SCHEMA ERD */}
          {activeTab === "erd" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioErdVisualizer />
            </div>
          )}

          {/* TAB 9: REGEX RAILROAD DIAGRAM */}
          {activeTab === "railroad" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioRegexRailroad />
            </div>
          )}

          {/* TAB 10: MARKDOWN INTERACTIVE NOTEBOOK */}
          {activeTab === "notebook" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioMarkdownNotebook />
            </div>
          )}

          {/* TAB 11: PERFORMANCE PROFILER */}
          {activeTab === "profiler" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioProfiler activeFile={activeFile} />
            </div>
          )}

          {/* TAB 12: SAVED SNIPPETS */}
          {activeTab === "saved" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioSavedSnippets
                activeCode={activeFile.content}
                activeLanguage={activeFile.language}
                onLoadSnippet={(snippetCode, snippetLang) => {
                  handleCodeChange(snippetCode);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 13: DEBUGGER */}
          {activeTab === "debugger" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioDebugger activeFile={activeFile} onSelectLine={(l) => {}} />
            </div>
          )}

          {/* TAB 14: GIT DIFF */}
          {activeTab === "gitdiff" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioGitDiff
                currentCode={activeFile.content}
                fileName={activeFile.name}
                onApplyResolvedCode={(resolved) => {
                  handleCodeChange(resolved);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 15: TRANSPILER */}
          {activeTab === "transpiler" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioTranspiler
                initialCode={activeFile.content}
                initialLanguage={activeFile.language}
                onSendToEditor={(convertedCode, lang) => {
                  handleAddFile(`transpiled.${lang === "python" ? "py" : lang === "typescript" ? "ts" : "js"}`, lang);
                  handleCodeChange(convertedCode);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 16: ALGO VISUALIZER */}
          {activeTab === "algo" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioAlgoVisualizer />
            </div>
          )}

          {/* TAB 17: REST API CLIENT */}
          {activeTab === "api" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioApiClient />
            </div>
          )}

          {/* TAB 18: REGEX TESTER */}
          {activeTab === "regex" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioRegexTester />
            </div>
          )}

          {/* TAB 19: SQL WORKBENCH */}
          {activeTab === "sql" && (
            <div className="flex-1 flex flex-col min-h-[580px]">
              <CodeStudioSqlPlayground
                onExportQuery={(query) => {
                  handleAddFile("query.sql", "sql");
                  handleCodeChange(query);
                  setActiveTab("editor");
                }}
              />
            </div>
          )}

          {/* TAB 20: TEMPLATES VAULT */}
          {activeTab === "snippets" && (
            <div className="flex-1 flex flex-col min-h-[580px] p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    Fullstack Project Boilerplates &amp; Template Gallery
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any project template to inspect its high-fidelity visual layout and interactive wireframe mockup.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsTemplatesModalOpen(true)}
                  className="h-8 text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold gap-1.5 shadow-md"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Open Full Gallery</span>
                </Button>
              </div>

              {/* Master Fullstack Templates Grid */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-500">
                  Featured Production Stacks
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MASTER_PROJECT_TEMPLATES.map((tmpl) => {
                    const Icon = tmpl.icon;
                    const CardPreview = tmpl.previewComponent;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setPreviewModalTemplate(tmpl)}
                        className="group p-4 rounded-2xl bg-muted/20 border border-border hover:border-cyan-500/50 hover:bg-muted/30 transition-all flex flex-col justify-between space-y-3 cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                                  {tmpl.title}
                                </h4>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {tmpl.category}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono">
                              {tmpl.badge}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {tmpl.description}
                          </p>

                          {/* Mini Visual Preview Canvas */}
                          <div className="h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner pointer-events-none select-none">
                            <CardPreview isInteractive={false} />
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <FolderTree className="w-3.5 h-3.5 text-cyan-500" />
                            {tmpl.files.length} files
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalTemplate(tmpl);
                              }}
                              className="h-7 text-xs rounded-xl hover:bg-muted text-muted-foreground hover:text-cyan-500 gap-1 font-semibold"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiles(tmpl.files);
                                const mainFile = tmpl.files.find((f) => f.isMain || f.name === "index.html") || tmpl.files[0];
                                setActiveFileId(mainFile?.id || tmpl.files[0]?.id || "f-1");
                                setActiveTab("editor");
                                setEditorLayout("split-preview");
                                toast({ title: "Template Scaffolded", description: `Loaded ${tmpl.title} in Code Editor.` });
                              }}
                              className="h-7 text-xs rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1 group-hover:translate-x-0.5 transition-transform"
                            >
                              <span>Use Template</span>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        <CodeStudioGitHubModal
          isOpen={isGitHubModalOpen}
          onClose={() => setIsGitHubModalOpen(false)}
          onImportFiles={(importedFiles) => {
            setFiles(importedFiles);
            setActiveFileId(importedFiles[0]?.id || "f-1");
            toast({ title: "Repository Imported", description: `Loaded ${importedFiles.length} files.` });
          }}
          activeFile={activeFile}
        />

        <CodeStudioShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          files={files}
          activeFile={activeFile}
        />

        <CodeStudioSnapshotModal
          isOpen={isSnapshotModalOpen}
          onClose={() => setIsSnapshotModalOpen(false)}
          activeFile={activeFile}
        />

        <CodeStudioProjectTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onSelectTemplate={(templateFiles, title) => {
            setFiles(templateFiles);
            const mainFile = templateFiles.find((f) => f.isMain || f.name === "index.html") || templateFiles[0];
            setActiveFileId(mainFile?.id || templateFiles[0]?.id || "f-1");
            setActiveTab("editor");
            setEditorLayout("split-preview");
            toast({ title: "Template Scaffolded", description: `Loaded ${title} in Code Editor with live preview.` });
          }}
        />

        {/* DEDICATED READ-ONLY VISUAL LAYOUT MOCKUP MODAL */}
        <CodeStudioTemplatePreviewModal
          isOpen={Boolean(previewModalTemplate)}
          onClose={() => setPreviewModalTemplate(null)}
          template={previewModalTemplate}
          onUseTemplate={(tmpl) => {
            setFiles(tmpl.files);
            const mainFile = tmpl.files.find((f) => f.isMain || f.name === "index.html") || tmpl.files[0];
            setActiveFileId(mainFile?.id || tmpl.files[0]?.id || "f-1");
            setActiveTab("editor");
            setEditorLayout("split-preview");
            setPreviewModalTemplate(null);
            toast({ title: "Template Scaffolded", description: `Loaded ${tmpl.title} into Code Editor.` });
          }}
        />

        {/* EMBEDDED FOOTER TERMINAL PANEL */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl transition-all duration-300 flex flex-col">
          {/* Footer Bar / Terminal Toggle Header */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-muted/80 backdrop-blur-md border-b border-border text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBottomTerminal(!showBottomTerminal)}
                className="flex items-center gap-2 font-bold text-foreground hover:text-cyan-500 transition-colors"
              >
                <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Embedded Terminal &amp; Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                  {showBottomTerminal ? "Active (⌘~)" : "Click to Toggle"}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBottomTerminal(!showBottomTerminal)}
                className="h-6 px-2.5 text-xs rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-semibold"
              >
                {showBottomTerminal ? "Collapse Terminal ▾" : "Expand Terminal ▴"}
              </Button>
            </div>
          </div>

          {showBottomTerminal && (
            <div className="h-80 w-full p-2 bg-slate-950 overflow-hidden">
              <CodeStudioTerminal
                logs={terminalLogs}
                onClear={() => setTerminalLogs([])}
                onExecuteCommand={handleExecuteReplCommand}
                isExecuting={isExecuting}
                files={files}
                activeFileId={activeFileId}
                onAddFile={handleAddFile}
                onUpdateFileContent={handleCodeChange}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
