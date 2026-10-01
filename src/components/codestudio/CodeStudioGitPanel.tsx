import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Plus,
  ArrowRight,
  GitCompare,
  Clock,
  Sparkles,
  Search,
  Check,
  Tag,
  ChevronRight,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

interface GitCommitItem {
  hash: string;
  message: string;
  author: string;
  time: string;
  branch: string;
  filesCount: number;
}

interface CodeStudioGitPanelProps {
  files: CodeFile[];
  activeFile: CodeFile;
  onApplyCommit?: (commitMessage: string) => void;
}

const INITIAL_COMMITS: GitCommitItem[] = [
  {
    hash: "7f8b92a",
    message: "feat: initialize Monaco editor with auto-save & tabbed interface",
    author: "Ayush Yadav <ayush@knowdeep.dev>",
    time: "10 mins ago",
    branch: "main",
    filesCount: 3,
  },
  {
    hash: "3e4d10c",
    message: "feat: add multi-cursor editing & minimap visualization",
    author: "Ayush Yadav <ayush@knowdeep.dev>",
    time: "5 mins ago",
    branch: "main",
    filesCount: 2,
  },
];

export const CodeStudioGitPanel: React.FC<CodeStudioGitPanelProps> = ({
  files,
  activeFile,
  onApplyCommit,
}) => {
  const { toast } = useToast();
  const [currentBranch, setCurrentBranch] = useState("main");
  const [branches, setBranches] = useState(["main", "develop", "feature/monaco-pro", "feature/auto-save"]);
  const [newBranchName, setNewBranchName] = useState("");
  const [showNewBranchInput, setShowNewBranchNameInput] = useState(false);

  const [commitMessage, setCommitMessage] = useState("");
  const [commits, setCommits] = useState<GitCommitItem[]>(INITIAL_COMMITS);
  const [isPushing, setIsPushing] = useState(false);
  const [selectedFileForDiff, setSelectedFileForDiff] = useState<string>(activeFile?.id || files[0]?.id || "");

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    const clean = newBranchName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!branches.includes(clean)) {
      setBranches([...branches, clean]);
      setCurrentBranch(clean);
      toast({ title: "Branch Created", description: `Switched to new branch '${clean}'.` });
    } else {
      setCurrentBranch(clean);
    }
    setNewBranchName("");
    setShowNewBranchNameInput(false);
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) {
      toast({ title: "Message Required", description: "Write a commit message first.", variant: "destructive" });
      return;
    }

    const newCommit: GitCommitItem = {
      hash: Math.random().toString(36).substring(2, 9),
      message: commitMessage.trim(),
      author: "Ayush Yadav <ayush@knowdeep.dev>",
      time: "Just now",
      branch: currentBranch,
      filesCount: files.length,
    };

    setCommits([newCommit, ...commits]);
    if (onApplyCommit) onApplyCommit(commitMessage.trim());

    toast({
      title: "Changes Committed",
      description: `[${currentBranch} ${newCommit.hash}] ${commitMessage.trim()}`,
    });
    setCommitMessage("");
  };

  const handlePushToOrigin = () => {
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      toast({
        title: "Pushed to Remote Origin",
        description: `Synced ${commits.length} commits on origin/${currentBranch}`,
      });
    }, 600);
  };

  const selectedDiffFile = files.find((f) => f.id === selectedFileForDiff) || activeFile;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Git Operations &amp; Version Control</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {currentBranch}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Commit staged changes, switch branches, inspect diffs, and push to origin
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handlePushToOrigin}
          disabled={isPushing}
          className="h-8 text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold gap-1.5 shadow-sm"
        >
          <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? "animate-bounce" : ""}`} />
          {isPushing ? "Pushing..." : "Push to Remote"}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Left: Branch Manager & Staged Files (5 cols) */}
        <div className="lg:col-span-5 p-4 overflow-y-auto space-y-4 bg-muted/10">
          {/* Branch Switcher Card */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                Active Branch
              </span>
              <button
                onClick={() => setShowNewBranchNameInput(!showNewBranchInput)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New Branch
              </button>
            </div>

            {showNewBranchInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="feature/new-branch..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none"
                />
                <Button size="sm" onClick={handleCreateBranch} className="h-8 text-xs bg-indigo-600 text-white font-bold">
                  Create
                </Button>
              </div>
            ) : (
              <select
                value={currentBranch}
                onChange={(e) => {
                  setCurrentBranch(e.target.value);
                  toast({ title: "Switched Branch", description: `Active branch is now '${e.target.value}'.` });
                }}
                className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground font-mono font-bold focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b} {b === currentBranch ? " (Active)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Staged & Modified Files */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
                Modified Files ({files.length})
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                Staged for Commit
              </span>
            </div>

            <div className="space-y-1.5">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileForDiff(file.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    file.id === selectedDiffFile?.id
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    MODIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Form */}
          <form onSubmit={handleCommit} className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-foreground block">Commit Staged Changes</span>
            <textarea
              required
              rows={3}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="feat: concise commit description..."
              className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
            />
            <Button size="sm" type="submit" className="w-full h-8 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-1.5">
              <GitCommit className="w-3.5 h-3.5" />
              Commit Changes
            </Button>
          </form>
        </div>

        {/* Right: Diff Inspector & Graphical Commit History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-4 space-y-4 overflow-y-auto min-h-0">
          {/* File Diff Inspector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-indigo-400">
                <GitCompare className="w-3.5 h-3.5" />
                <span>diff --git a/{selectedDiffFile?.name} b/{selectedDiffFile?.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">100644 blob</span>
            </div>

            <pre className="p-3 rounded-xl bg-slate-900 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-48 overflow-y-auto">
              <div className="text-slate-500">@@ -1,5 +1,8 @@</div>
              <div className="text-rose-400">- // Legacy unversioned code snippet</div>
              <div className="text-emerald-400">+ // Auto-saved &amp; version-controlled in Know Deep Studio</div>
              <div className="text-emerald-400">+ const autoSavedAt = &quot;{new Date().toLocaleTimeString()}&quot;;</div>
              <div className="text-slate-300">{selectedDiffFile?.content.substring(0, 150)}...</div>
            </pre>
          </div>

          {/* Graphical Commit History Timeline */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                Graphical Commit History ({commits.length})
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">origin/{currentBranch}</span>
            </div>

            <div className="space-y-3">
              {commits.map((c) => (
                <div key={c.hash} className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-card shrink-0" />
                    <div className="w-0.5 h-10 bg-border/80" />
                  </div>

                  <div className="flex-1 p-2.5 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-foreground">{c.message}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {c.hash}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{c.author}</span>
                      <span>{c.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
