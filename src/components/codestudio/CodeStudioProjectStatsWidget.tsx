import React, { useState, useMemo } from "react";
import {
  Code2,
  FolderTree,
  GitCommit,
  Clock,
  Layers,
  FileCode,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart3,
  HardDrive,
  Activity,
  Zap,
  RefreshCw,
  Camera,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile, SupportedLanguage } from "./CodeStudioTypes";

interface CodeStudioProjectStatsWidgetProps {
  files: CodeFile[];
  activeFileId: string;
  lastCommitTime?: string;
  onOpenSnapshot?: () => void;
  onOpenGitHub?: () => void;
  onOpenTemplates?: () => void;
}

const LANGUAGE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  javascript: { bg: "bg-amber-500/15", text: "text-amber-500 dark:text-amber-400", bar: "bg-amber-400" },
  typescript: { bg: "bg-blue-500/15", text: "text-blue-500 dark:text-blue-400", bar: "bg-blue-500" },
  html: { bg: "bg-orange-500/15", text: "text-orange-500 dark:text-orange-400", bar: "bg-orange-500" },
  css: { bg: "bg-cyan-500/15", text: "text-cyan-500 dark:text-cyan-400", bar: "bg-cyan-400" },
  python: { bg: "bg-emerald-500/15", text: "text-emerald-500 dark:text-emerald-400", bar: "bg-emerald-500" },
  sql: { bg: "bg-purple-500/15", text: "text-purple-500 dark:text-purple-400", bar: "bg-purple-400" },
  json: { bg: "bg-teal-500/15", text: "text-teal-500 dark:text-teal-400", bar: "bg-teal-400" },
  markdown: { bg: "bg-pink-500/15", text: "text-pink-500 dark:text-pink-400", bar: "bg-pink-400" },
  cpp: { bg: "bg-indigo-500/15", text: "text-indigo-500 dark:text-indigo-400", bar: "bg-indigo-400" },
  java: { bg: "bg-red-500/15", text: "text-red-500 dark:text-red-400", bar: "bg-red-400" },
  rust: { bg: "bg-orange-600/15", text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-600" },
  go: { bg: "bg-sky-500/15", text: "text-sky-500 dark:text-sky-400", bar: "bg-sky-400" },
};

export const CodeStudioProjectStatsWidget: React.FC<CodeStudioProjectStatsWidgetProps> = ({
  files,
  activeFileId,
  lastCommitTime,
  onOpenSnapshot,
  onOpenGitHub,
  onOpenTemplates,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commitTimestamp, setCommitTimestamp] = useState<string>(
    lastCommitTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Compute live project analytics
  const stats = useMemo(() => {
    let totalLines = 0;
    let totalBytes = 0;
    const langLinesMap: Record<string, number> = {};
    const foldersSet = new Set<string>();

    files.forEach((file) => {
      const lines = file.content ? file.content.split("\n").length : 0;
      totalLines += lines;
      totalBytes += new Blob([file.content || ""]).size;

      const lang = file.language || "javascript";
      langLinesMap[lang] = (langLinesMap[lang] || 0) + lines;

      if (file.folder) {
        const parts = file.folder.split("/");
        let curr = "";
        parts.forEach((p) => {
          curr = curr ? `${curr}/${p}` : p;
          foldersSet.add(curr);
        });
      }
    });

    // Language distribution percentages
    const langBreakdown = Object.entries(langLinesMap)
      .map(([lang, count]) => ({
        language: lang,
        lines: count,
        percent: totalLines > 0 ? Math.round((count / totalLines) * 100) : 0,
        color: LANGUAGE_COLORS[lang] || { bg: "bg-muted", text: "text-muted-foreground", bar: "bg-cyan-500" },
      }))
      .sort((a, b) => b.lines - a.lines);

    const activeFile = files.find((f) => f.id === activeFileId) || files[0];
    const activeFileLines = activeFile?.content ? activeFile.content.split("\n").length : 0;
    const avgLinesPerFile = files.length > 0 ? Math.round(totalLines / files.length) : 0;
    const sizeInKb = (totalBytes / 1024).toFixed(1);

    return {
      totalLines,
      totalBytes,
      sizeInKb,
      totalFiles: files.length,
      totalFolders: foldersSet.size,
      langBreakdown,
      activeFile,
      activeFileLines,
      avgLinesPerFile,
    };
  }, [files, activeFileId]);

  return (
    <div className="w-full bg-card/90 backdrop-blur-md border border-border rounded-2xl p-3 shadow-xs font-sans text-xs transition-all duration-200">
      {/* Top Compact Dashboard Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Metric 1: Total Lines of Code */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
            <Code2 className="w-4 h-4 text-cyan-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Total Lines of Code
              </div>
              <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
                {stats.totalLines.toLocaleString()}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">LOC</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Workspace Files & Folders */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Project Structure
              </div>
              <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
                {stats.totalFiles}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">
                  {stats.totalFiles === 1 ? "file" : "files"}
                </span>{" "}
                <span className="text-muted-foreground/60 text-xs">·</span>{" "}
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  {stats.totalFolders} {stats.totalFolders === 1 ? "folder" : "folders"}
                </span>
              </div>
            </div>
          </div>

          {/* Metric 3: Last Commit / Auto-Save Timestamp */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <GitCommit className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground leading-none flex items-center gap-1">
                <span>Last Commit / Sync</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-sm font-extrabold text-foreground font-mono mt-0.5 flex items-center gap-1.5">
                <span>{commitTimestamp}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Metric 4: Estimated Bundle Size */}
          <div className="hidden xl:flex items-center gap-2 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <HardDrive className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Workspace Size
              </div>
              <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
                {stats.sizeInKb} <span className="text-[10px] font-normal text-muted-foreground">KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Tools & Expand Details Toggle */}
        <div className="flex items-center gap-2">
          {onOpenSnapshot && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenSnapshot}
              className="h-8 text-xs rounded-xl bg-muted/40 hover:bg-muted font-bold text-foreground gap-1.5 shadow-2xs"
              title="Capture Project Snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden md:inline">Snapshot</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2.5 text-xs rounded-xl hover:bg-muted font-bold text-muted-foreground hover:text-foreground gap-1"
          >
            <span>{isExpanded ? "Hide Details" : "Project Analytics"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* EXPANDABLE DEEP ANALYTICS & LANGUAGE DISTRIBUTION PANEL */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3 animate-in fade-in duration-200">
          {/* Multi-language distribution bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
                Language Composition
              </span>
              <span className="text-muted-foreground">
                Average {stats.avgLinesPerFile} lines/file
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex gap-0.5 p-0.5 shadow-inner">
              {stats.langBreakdown.map((item) => (
                <div
                  key={item.language}
                  style={{ width: `${Math.max(item.percent, 3)}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${item.color.bar}`}
                  title={`${item.language.toUpperCase()}: ${item.lines} lines (${item.percent}%)`}
                />
              ))}
            </div>

            {/* Language Badges Breakdown */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.langBreakdown.map((item) => (
                <div
                  key={item.language}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/70 text-[10px] font-mono font-bold ${item.color.bg} ${item.color.text}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span className="uppercase">{item.language}</span>
                  <span className="text-muted-foreground font-normal">
                    {item.lines} lines ({item.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active File Context Telemetry */}
          {stats.activeFile && (
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-500 font-bold text-[10px]">
                  ACTIVE
                </span>
                <span className="font-bold text-foreground font-mono">
                  {stats.activeFile.folder ? `${stats.activeFile.folder}/${stats.activeFile.name}` : stats.activeFile.name}
                </span>
                <span className="text-muted-foreground">
                  ({stats.activeFileLines} lines · {stats.activeFile.language})
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span>UTF-8 Encoding</span>
                <span>·</span>
                <span className="text-emerald-500 font-semibold">● Synced with Code Editor</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
