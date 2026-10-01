import React, { useState, useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  Plus,
  X,
  FileCode,
  Sparkles,
  Sliders,
  WrapText,
  Play,
  RotateCcw,
  Settings2,
  Layers,
  Code2,
  BrainCircuit,
  Github,
  Share2,
  Camera,
  Bookmark,
  FolderTree,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  Zap,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Map,
  MousePointer2,
  Clock,
  Save,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile, SupportedLanguage } from "./CodeStudioTypes";
import { CodeStudioFileExplorer } from "./CodeStudioFileExplorer";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CodeStudioEditorProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (name: string, language: SupportedLanguage, folder?: string) => void;
  onAddFolder?: (folderPath: string) => void;
  onCloseFile: (id: string) => void;
  onRenameFile?: (id: string, newName: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
  onCodeChange: (content: string) => void;
  onRunCode: () => void;
  onExplainCode?: () => void;
  onOpenGitHub?: () => void;
  onOpenShare?: () => void;
  onOpenSnapshot?: () => void;
  onOpenSavedSnippets?: () => void;
  onOpenTemplatesModal?: () => void;
  isExecuting?: boolean;
  lastSavedTime?: string;
}

export const CodeStudioEditor: React.FC<CodeStudioEditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onAddFolder,
  onCloseFile,
  onRenameFile,
  onDeleteFolder,
  onCodeChange,
  onRunCode,
  onExplainCode,
  onOpenGitHub,
  onOpenShare,
  onOpenSnapshot,
  onOpenSavedSnippets,
  onOpenTemplatesModal,
  isExecuting = false,
  lastSavedTime,
}) => {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(true); // Default enabled
  const [editorThemePreference, setEditorThemePreference] = useState<
    "auto" | "vs" | "vs-dark" | "dracula" | "one-dark" | "cyberpunk" | "monokai" | "hc-black"
  >("auto");
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  // Sidebar Toggles
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showPairCoder, setShowPairCoder] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState("");

  // Modals
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("script.js");
  const [newFileLang, setNewFileLang] = useState<SupportedLanguage>("javascript");

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCodeBuffer = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      toast({
        title: "Confirm Clear Code?",
        description: `Click the button again to erase all code in "${activeFile.name}".`,
      });
      setTimeout(() => setShowClearConfirm(false), 5000);
      return;
    }
    if (editorRef.current) {
      editorRef.current.setValue("");
      editorRef.current.focus();
    }
    onCodeChange("");
    setShowClearConfirm(false);
    toast({
      title: "Code Buffer Cleared",
      description: `Erased all content in ${activeFile.name}. Code Editor buffer updated.`,
    });
  };
  const [renameValue, setRenameValue] = useState("");

  // AI Pair-Coder State
  const [pairCoderQuery, setPairCoderQuery] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    completion: string;
    explanation: string;
    complexity: string;
  } | null>({
    completion: `// Suggested Optimization\nfunction processArrayFast(arr) {\n  const set = new Set(arr);\n  return Array.from(set);\n}`,
    explanation: "This snippet uses an O(N) Hash Set to deduplicate array elements in a single linear pass.",
    complexity: "Time: O(N) │ Space: O(N)",
  });

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const code = activeFile?.content || "";

  // Determine active Monaco theme
  const currentMonacoTheme =
    editorThemePreference === "auto"
      ? resolvedTheme === "dark"
        ? "vs-dark"
        : "vs"
      : editorThemePreference;

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom Monaco Themes
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "number", foreground: "bd93f9" },
        { token: "string", foreground: "f1fa8c" },
        { token: "variable", foreground: "f8f8f2" },
        { token: "type", foreground: "8be9fd" },
        { token: "function", foreground: "50fa7b", fontStyle: "bold" },
      ],
      colors: {
        "editor.background": "#1e1f29",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#44475a33",
        "editorCursor.foreground": "#f8f8f2",
        "editor.selectionBackground": "#44475a88",
        "editorLineNumber.foreground": "#6272a4",
      },
    });

    monaco.editor.defineTheme("one-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5c6370", fontStyle: "italic" },
        { token: "keyword", foreground: "c678dd", fontStyle: "bold" },
        { token: "number", foreground: "d19a66" },
        { token: "string", foreground: "98c379" },
        { token: "variable", foreground: "e06c75" },
        { token: "type", foreground: "e5c07b" },
        { token: "function", foreground: "61afef" },
      ],
      colors: {
        "editor.background": "#181b20",
        "editor.foreground": "#abb2bf",
        "editor.lineHighlightBackground": "#2c313a55",
        "editorCursor.foreground": "#528bff",
        "editor.selectionBackground": "#3e4451",
        "editorLineNumber.foreground": "#4b5263",
      },
    });

    monaco.editor.defineTheme("cyberpunk", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "00f0ff", fontStyle: "italic" },
        { token: "keyword", foreground: "ff007f", fontStyle: "bold" },
        { token: "number", foreground: "ffea00" },
        { token: "string", foreground: "00ff9f" },
        { token: "variable", foreground: "ffffff" },
        { token: "type", foreground: "00f0ff" },
        { token: "function", foreground: "ff7700" },
      ],
      colors: {
        "editor.background": "#0b0c14",
        "editor.foreground": "#00f0ff",
        "editor.lineHighlightBackground": "#ff007f22",
        "editorCursor.foreground": "#ff007f",
        "editor.selectionBackground": "#ff007f44",
        "editorLineNumber.foreground": "#ff007f88",
      },
    });

    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "75715e", fontStyle: "italic" },
        { token: "keyword", foreground: "f92672", fontStyle: "bold" },
        { token: "number", foreground: "ae81ff" },
        { token: "string", foreground: "e6db74" },
        { token: "variable", foreground: "fd971f" },
        { token: "type", foreground: "66d9ef" },
        { token: "function", foreground: "a6e22e" },
      ],
      colors: {
        "editor.background": "#1e1f1c",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#3e3d32",
        "editorCursor.foreground": "#f8f8f0",
        "editor.selectionBackground": "#49483e",
        "editorLineNumber.foreground": "#90908a",
      },
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunCode();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run();
    });
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
      toast({ title: "Formatted", description: "Document formatted via Code Editor." });
    }
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onAddFile(newFileName.trim(), newFileLang);
    setShowNewFileModal(false);
    setNewFileName("");
  };

  const handleRenameFileSubmit = (id: string) => {
    if (!renameValue.trim()) return;
    const file = files.find((f) => f.id === id);
    if (file) {
      file.name = renameValue.trim();
      toast({ title: "File Renamed", description: `Updated name to ${renameValue}` });
    }
    setRenamingFileId(null);
  };

  const handleGeneratePairCodeSuggestion = async (promptText?: string) => {
    setIsAiGenerating(true);
    const textToUse = promptText || pairCoderQuery || "Suggest optimal implementation or enhancement";
    const activeFilePath = activeFile.folder ? `${activeFile.folder}/${activeFile.name}` : activeFile.name;

    try {
      const systemPrompt = `You are AI Pair-Coder for Know Deep Code Studio.
RELATIVE FILE PATH: "${activeFilePath}"
PROGRAMMING LANGUAGE: "${activeFile.language}"
TOTAL LINES: ${code.split("\n").length}

--- FULL CURRENT BUFFER CONTENT (${activeFilePath}) ---
\`\`\`${activeFile.language}
${code}
\`\`\`

Provide a scoped code completion or refactoring specifically for "${activeFilePath}".
Return a clean markdown code block with the suggested code, followed by a concise 1-sentence explanation and Big-O complexity rating (e.g. "Complexity: O(N) Time | O(1) Space").`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Contextual Task for "${activeFilePath}" (${activeFile.language}): ${textToUse}` }],
          systemPrompt,
        }),
      });

      const data = await res.json();
      const content = data.content || "";
      const codeMatch = content.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
      const extractedSnippet = codeMatch ? codeMatch[1].trim() : content.trim();

      const explanationMatch = content.replace(/```[\s\S]*?```/g, "").trim();
      const complexityMatch = explanationMatch.match(/Complexity:[^\n]+/i);

      setAiSuggestion({
        completion: extractedSnippet || `// Optimization for ${activeFile.name}\n`,
        explanation: explanationMatch.slice(0, 180) || `AI generated implementation scoped to ${activeFile.name}.`,
        complexity: complexityMatch ? complexityMatch[0] : "Optimized Runtime",
      });

      toast({ title: "AI Suggestion Ready", description: `Generated contextual update for ${activeFile.name}.` });
    } catch {
      // Fallback
      if (textToUse.toLowerCase().includes("jsdoc") || textToUse.toLowerCase().includes("doc")) {
        setAiSuggestion({
          completion: `/**\n * @file ${activeFilePath}\n * @description Contextual module logic\n */`,
          explanation: "Generated JSDoc annotations documenting module parameters and return types.",
          complexity: "N/A (Documentation)",
        });
      } else {
        setAiSuggestion({
          completion: `// Scoped implementation for ${activeFile.name}\n`,
          explanation: `Contextual suggestion scoped to ${activeFilePath}.`,
          complexity: "Optimized Execution",
        });
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAcceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    const newCode = `${code}\n\n${aiSuggestion.completion}`;
    onCodeChange(newCode);
    toast({ title: "Completion Accepted", description: "Appended AI Pair-Coder code directly into Code Editor." });
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col rounded-2xl bg-card border border-border shadow-sm overflow-hidden transition-all duration-200 ${
        isFullScreen ? "fixed inset-3 z-50 shadow-2xl bg-background border-primary/40" : "h-full min-h-[480px]"
      }`}
    >
      {/* File Tabs Bar with Glassy Sheen & Sidebar Toggles */}
      <div className="flex items-center justify-between bg-muted/40 backdrop-blur-md border-b border-border/70 px-2.5 pt-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none flex-1">
          {/* File Explorer Toggle Button */}
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showFileExplorer ? "bg-cyan-500 text-white shadow-xs" : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Workspace File Explorer"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Explorer</span>
          </button>

          {/* Active File Tabs */}
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer border-t border-x transition-all duration-200 shrink-0 select-none ${
                  isActive
                    ? "bg-card text-foreground border-border font-bold shadow-xs scale-[1.01]"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"}`} />
                <span>{file.name}</span>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-500 rounded p-0.5 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shrink-0 hover:scale-105"
            title="Create New File"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New File</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 pb-2 shrink-0">
          <Button
            size="sm"
            onClick={onRunCode}
            disabled={isExecuting}
            className="h-8 text-xs px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold gap-1.5 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 border border-emerald-400/20"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Run (⌘↵)</span>
          </Button>

          {/* Theme Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-muted/50 hover:bg-muted text-foreground border border-border/80 backdrop-blur-md transition-all shadow-2xs"
                title="Monaco Syntax & Editor Theme"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden xl:inline capitalize">Theme ({editorThemePreference})</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl backdrop-blur-md">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Editor Syntax Theme
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("auto")}
                className={editorThemePreference === "auto" ? "font-bold text-cyan-500" : ""}
              >
                Auto (Theme Sync)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("vs-dark")}
                className={editorThemePreference === "vs-dark" ? "font-bold text-cyan-500" : ""}
              >
                VS Code Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("vs")}
                className={editorThemePreference === "vs" ? "font-bold text-cyan-500" : ""}
              >
                VS Code Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("dracula")}
                className={editorThemePreference === "dracula" ? "font-bold text-cyan-500" : ""}
              >
                Dracula Neon
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("one-dark")}
                className={editorThemePreference === "one-dark" ? "font-bold text-cyan-500" : ""}
              >
                One Dark Pro
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("cyberpunk")}
                className={editorThemePreference === "cyberpunk" ? "font-bold text-cyan-500" : ""}
              >
                Cyberpunk 2077
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("monokai")}
                className={editorThemePreference === "monokai" ? "font-bold text-cyan-500" : ""}
              >
                Monokai Pro
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorThemePreference("hc-black")}
                className={editorThemePreference === "hc-black" ? "font-bold text-cyan-500" : ""}
              >
                High Contrast Black
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`h-8 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showMinimap ? "bg-card border border-border text-foreground shadow-2xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Right-Side Code Minimap"
          >
            <Map className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden lg:inline">Minimap</span>
          </button>

          {/* AI Pair-Coder Toggle */}
          <button
            onClick={() => setShowPairCoder(!showPairCoder)}
            className={`h-8 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showPairCoder
                ? "bg-cyan-500 text-white shadow-xs"
                : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
            title="Toggle AI Pair-Coder Contextual Assistant"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Pair-Coder</span>
          </button>

          {/* AI Know Deep Redirect Button */}
          {onExplainCode && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExplainCode}
              className="h-8 text-xs px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-2xs font-bold gap-1.5"
              title="Open AI Code Studio Know Deep Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden lg:inline">AI Know Deep</span>
            </Button>
          )}

          {/* Clear Code Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearCodeBuffer}
            className={`h-8 text-xs px-2.5 rounded-xl border transition-all font-bold gap-1 ${
              showClearConfirm
                ? "bg-rose-600 text-white border-rose-500 shadow-md animate-pulse hover:bg-rose-700"
                : "hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 border-rose-500/20 backdrop-blur-xs"
            }`}
            title="Clear All Code Buffer in Active File"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{showClearConfirm ? "Confirm Clear?" : "Clear Code"}</span>
          </Button>

          {/* Auto Format Code Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFormatCode}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 backdrop-blur-xs"
            title="Auto Format Document (Code Editor)"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setWordWrap(!wordWrap)}
            className={`h-8 w-8 rounded-xl transition-all ${
              wordWrap ? "bg-muted/80 text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
            title="Toggle Fullscreen Code Editor"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Workspace Body: File Explorer Sidebar + Code Editor + Pair-Coder Sidebar */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* FILE EXPLORER SIDEBAR WITH FOLDER TREE */}
        {showFileExplorer && (
          <CodeStudioFileExplorer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={onSelectFile}
            onAddFile={onAddFile}
            onAddFolder={onAddFolder}
            onRenameFile={onRenameFile}
            onDeleteFile={onCloseFile}
            onDeleteFolder={onDeleteFolder}
            onOpenTemplatesModal={onOpenTemplatesModal}
          />
        )}

        {/* MONACO EDITOR CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <Editor
            height="100%"
            language={activeFile.language}
            theme={currentMonacoTheme}
            value={code}
            onChange={(val) => onCodeChange(val || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize,
              minimap: { enabled: showMinimap, renderCharacters: true },
              wordWrap: wordWrap ? "on" : "off",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              tabSize: 2,
              lineNumbers: "on",
              renderLineHighlight: "all",
              multiCursorModifier: "alt",
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>

        {/* AI PAIR-CODER SIDEBAR ASSISTANT */}
        {showPairCoder && (
          <div className="w-72 bg-card border-l border-border flex flex-col p-3 space-y-3 shrink-0 font-sans text-xs overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[10px]">
                <BrainCircuit className="w-4 h-4 text-cyan-500" />
                AI Pair-Coder
              </span>
              <button onClick={() => setShowPairCoder(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            {/* Quick Context Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Context Actions</span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGeneratePairCodeSuggestion("JSDoc annotation")}
                  className="h-7 text-[10px] rounded-lg bg-muted/40 hover:bg-muted font-semibold"
                >
                  Add JSDoc
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGeneratePairCodeSuggestion("Error guard checks")}
                  className="h-7 text-[10px] rounded-lg bg-muted/40 hover:bg-muted font-semibold"
                >
                  Type Safety
                </Button>
              </div>
            </div>

            {/* Prompt Bar */}
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Ask Pair-Coder to refactor..."
                value={pairCoderQuery}
                onChange={(e) => setPairCoderQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGeneratePairCodeSuggestion();
                }}
                className="w-full text-xs p-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <Button
                size="sm"
                onClick={() => handleGeneratePairCodeSuggestion()}
                disabled={isAiGenerating}
                className="w-full h-7 text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiGenerating ? "Generating..." : "Get AI Completion"}
              </Button>
            </div>

            {/* Suggestion & 1-Click Accept */}
            {aiSuggestion && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">Suggested Code</span>
                  <span className="text-[9px] text-slate-400 font-mono">{aiSuggestion.complexity}</span>
                </div>
                <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36">
                  {aiSuggestion.completion}
                </pre>
                <p className="text-[10px] text-slate-300 leading-snug">{aiSuggestion.explanation}</p>
                <Button
                  size="sm"
                  onClick={handleAcceptAiSuggestion}
                  className="w-full h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept &amp; Insert
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Save className="w-3 h-3 text-emerald-500" />
            {lastSavedTime ? `Auto-saved at ${lastSavedTime}` : "Auto-save active"}
          </span>

          <span>
            Ln {cursorPos.line}, Col {cursorPos.column}
          </span>

          <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted">
            {activeFile.language}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Multi-cursor Indicator Badge */}
          <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20" title="Multi-Cursor Editing: Alt+Click to place cursors, Cmd/Ctrl+D to select next occurrence">
            <MousePointer2 className="w-3 h-3" /> Multi-Cursor (Alt+Click / ⌘D)
          </span>

          <span>UTF-8</span>
        </div>
      </div>

      {/* Modal for Creating File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Create New Workspace File</h3>
              <button onClick={() => setShowNewFileModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewFile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. utils.js, styles.css, query.sql"
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Language</label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value as SupportedLanguage)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="ghost" onClick={() => setShowNewFileModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                  Create File
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
