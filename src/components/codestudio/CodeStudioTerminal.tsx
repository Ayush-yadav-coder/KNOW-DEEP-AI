import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  ShieldCheck,
  Flame,
  Zap,
  Package,
  FolderTree,
  FileCode,
  GitBranch,
  HelpCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  Laptop,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalLog, CodeFile } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioTerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
  onExecuteCommand: (command: string) => void;
  isExecuting?: boolean;
  files?: CodeFile[];
  activeFileId?: string;
  onAddFile?: (name: string, language: any) => void;
  onUpdateFileContent?: (newCode: string) => void;
}

interface ShellLine {
  id: string;
  type: "input" | "output" | "error" | "info" | "success" | "warning";
  text: string;
  timestamp: string;
}

interface InstalledPackage {
  name: string;
  version: string;
  installedAt: string;
}

const INITIAL_PACKAGES: InstalledPackage[] = [
  { name: "@monaco-editor/react", version: "^4.7.0", installedAt: "initial" },
  { name: "lucide-react", version: "^1.16.0", installedAt: "initial" },
  { name: "framer-motion", version: "^12.40.0", installedAt: "initial" },
  { name: "tailwindcss", version: "^4.1.18", installedAt: "initial" },
  { name: "jszip", version: "^3.10.1", installedAt: "initial" },
];

const INITIAL_COMMITS = [
  { hash: "7f8b92a", message: "feat: initialize know deep studio workspace with Monaco", time: "10 mins ago", author: "Coder <ayush@knowdeep.dev>" },
  { hash: "3e4d10c", message: "feat: integrate real-time execution engine and sandbox", time: "5 mins ago", author: "Coder <ayush@knowdeep.dev>" },
];

const QUICK_TEST_SNIPPETS = [
  { label: "Math (Fibonacci)", code: "function fib(n){return n<=1?n:fib(n-1)+fib(n-2);}; console.log('Fib(10):', fib(10));" },
  { label: "Array Operations", code: "const nums = [5, 2, 8, 1, 9]; console.log('Sorted:', nums.sort((a,b)=>a-b)); console.log('Sum:', nums.reduce((a,b)=>a+b, 0));" },
  { label: "Async Delay", code: "console.log('Start'); setTimeout(() => console.log('Async Result after 300ms!'), 300);" },
  { label: "JSON Transform", code: "const data = { id: 101, title: 'Know Deep', active: true }; console.log('Payload:', JSON.stringify(data, null, 2));" },
];

export const CodeStudioTerminal: React.FC<CodeStudioTerminalProps> = ({
  logs,
  onClear,
  onExecuteCommand,
  isExecuting = false,
  files = [],
  activeFileId,
  onAddFile,
  onUpdateFileContent,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"terminal" | "console" | "packages">("terminal");
  const [copied, setCopied] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Shell State
  const [shellInput, setShellInput] = useState("");
  const [shellHistory, setShellHistory] = useState<string[]>([]);
  const [shellHistoryIndex, setShellHistoryIndex] = useState<number>(-1);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>(INITIAL_PACKAGES);
  const [gitCommits, setGitCommits] = useState(INITIAL_COMMITS);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [currentDirectory, setCurrentDirectory] = useState("~/workspace");

  const [shellLines, setShellLines] = useState<ShellLine[]>([
    {
      id: "sh-1",
      type: "info",
      text: "Know Deep Studio Shell [Version 2.5.0-x86_64-linux-gnu]",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "sh-2",
      type: "info",
      text: "Type 'help' to see all available shell commands (npm, git, ls, cat, node, etc.).",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "sh-3",
      type: "success",
      text: "Workspace initialized at ~/workspace/know-deep-app. Ready for commands.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Console REPL State
  const [replInput, setReplInput] = useState("");
  const [replHistory, setReplHistory] = useState<string[]>([]);
  const [replHistoryIndex, setReplHistoryIndex] = useState<number>(-1);

  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const consoleScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    if (activeTab === "terminal" && terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    } else if (activeTab === "console" && consoleScrollRef.current) {
      consoleScrollRef.current.scrollTop = consoleScrollRef.current.scrollHeight;
    }
  }, [shellLines, logs, activeTab]);

  const addShellOutput = (lines: Array<{ text: string; type?: ShellLine["type"] }>) => {
    const time = new Date().toLocaleTimeString();
    const newItems: ShellLine[] = lines.map((l, i) => ({
      id: `line-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
      type: l.type || "output",
      text: l.text,
      timestamp: time,
    }));
    setShellLines((prev) => [...prev, ...newItems]);
  };

  const handleRunShellCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add input to history
    setShellHistory((prev) => [...prev, cmd]);
    setShellHistoryIndex(-1);

    // Echo input prompt
    const time = new Date().toLocaleTimeString();
    setShellLines((prev) => [
      ...prev,
      {
        id: `in-${Date.now()}`,
        type: "input",
        text: `coder@knowdeep:${currentDirectory}$ ${cmd}`,
        timestamp: time,
      },
    ]);

    const parts = cmd.split(" ").filter(Boolean);
    const main = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    switch (main) {
      case "help":
        addShellOutput([
          { text: "=== Know Deep Studio Shell Commands ===", type: "info" },
          { text: "  npm install <package>  : Install npm dependencies to project", type: "output" },
          { text: "  npm list / npm ls      : List all installed packages", type: "output" },
          { text: "  npm run build | start  : Run workspace scripts", type: "output" },
          { text: "  git status             : View modified files and branch status", type: "output" },
          { text: "  git log                : View commit log history", type: "output" },
          { text: "  git branch             : List / inspect git branches", type: "output" },
          { text: "  git commit -m <msg>    : Create a new git commit", type: "output" },
          { text: "  git diff               : Inspect git file changes", type: "output" },
          { text: "  git push               : Push commits to remote origin", type: "output" },
          { text: "  ls [-la]               : List files in current directory", type: "output" },
          { text: "  cat <filename>         : Display file contents", type: "output" },
          { text: "  node <filename.js>     : Run JavaScript file through sandbox", type: "output" },
          { text: "  python <filename.py>   : Run Python file", type: "output" },
          { text: "  touch <filename>       : Create a new workspace file", type: "output" },
          { text: "  pwd                    : Print current working directory", type: "output" },
          { text: "  whoami / uname / date  : System info utilities", type: "output" },
          { text: "  env                    : Display active environment variables", type: "output" },
          { text: "  curl <url>             : Test HTTP endpoint / API", type: "output" },
          { text: "  clear                  : Clear terminal screen", type: "output" },
        ]);
        break;

      case "clear":
      case "cls":
        setShellLines([]);
        break;

      case "pwd":
        addShellOutput([{ text: `/home/coder/workspace/know-deep-app`, type: "output" }]);
        break;

      case "whoami":
        addShellOutput([{ text: "coder (Ayush - Know Deep Developer)", type: "success" }]);
        break;

      case "date":
        addShellOutput([{ text: new Date().toString(), type: "output" }]);
        break;

      case "uname":
        addShellOutput([{ text: "Linux knowdeep-box 6.6.137-studio #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux", type: "output" }]);
        break;

      case "env":
        addShellOutput([
          { text: "NODE_ENV=development", type: "output" },
          { text: "STUDIO_VERSION=2.5.0-pro", type: "output" },
          { text: "ENGINE=Monaco-Pro", type: "output" },
          { text: "VITE_APP_NAME=Know Deep Code Studio", type: "output" },
          { text: "PORT=3000", type: "output" },
          { text: "SHELL=/bin/zsh", type: "output" },
        ]);
        break;

      case "ls": {
        const isDetailed = args.includes("-l") || args.includes("-la") || args.includes("-al");
        if (files.length === 0) {
          addShellOutput([{ text: "total 0", type: "info" }]);
          break;
        }

        if (isDetailed) {
          const lines = [
            { text: "total " + (files.length * 4 + 16), type: "info" as const },
            { text: "drwxr-xr-x  6 coder staff   192 Sep 28 10:45 .", type: "output" as const },
            { text: "drwxr-xr-x 12 coder staff   384 Sep 28 10:00 ..", type: "output" as const },
            { text: "drwxr-xr-x 142 coder staff  4544 Sep 28 10:45 node_modules", type: "info" as const },
            { text: "-rw-r--r--  1 coder staff   654 Sep 28 10:45 package.json", type: "output" as const },
            { text: "-rw-r--r--  1 coder staff  1208 Sep 28 10:45 README.md", type: "output" as const },
            ...files.map((f) => ({
              text: `-rw-r--r--  1 coder staff  ${String(f.content.length).padStart(5, " ")} Sep 28 10:45 ${f.name}${f.id === activeFileId ? " *" : ""}`,
              type: "success" as const,
            })),
          ];
          addShellOutput(lines);
        } else {
          const fileNames = ["node_modules/", "package.json", "README.md", ...files.map((f) => f.name)].join("   ");
          addShellOutput([{ text: fileNames, type: "success" }]);
        }
        break;
      }

      case "cat": {
        const target = args[0];
        if (!target) {
          addShellOutput([{ text: "usage: cat <filename>", type: "error" }]);
          break;
        }
        if (target === "package.json") {
          const pkgJson = JSON.stringify(
            {
              name: "know-deep-studio-workspace",
              version: "1.0.0",
              dependencies: installedPackages.reduce((acc, p) => ({ ...acc, [p.name]: p.version }), {}),
            },
            null,
            2
          );
          addShellOutput([{ text: pkgJson, type: "output" }]);
          break;
        }
        const found = files.find((f) => f.name.toLowerCase() === target.toLowerCase());
        if (found) {
          addShellOutput([{ text: found.content, type: "output" }]);
        } else {
          addShellOutput([{ text: `cat: ${target}: No such file or directory`, type: "error" }]);
        }
        break;
      }

      case "touch": {
        const newFileName = args[0];
        if (!newFileName) {
          addShellOutput([{ text: "usage: touch <filename>", type: "error" }]);
          break;
        }
        const ext = newFileName.split(".").pop()?.toLowerCase() || "js";
        const langMap: Record<string, any> = {
          js: "javascript",
          ts: "typescript",
          py: "python",
          html: "html",
          css: "css",
          sql: "sql",
          json: "json",
          cpp: "cpp",
          java: "java",
          rs: "rust",
        };
        if (onAddFile) {
          onAddFile(newFileName, langMap[ext] || "javascript");
          addShellOutput([{ text: `Created file: ${newFileName}`, type: "success" }]);
        } else {
          addShellOutput([{ text: `Created file: ${newFileName}`, type: "success" }]);
        }
        break;
      }

      case "npm": {
        const sub = args[0];
        if (!sub || sub === "help") {
          addShellOutput([
            { text: "npm <command>", type: "info" },
            { text: "  install, i <pkg>   Install a package", type: "output" },
            { text: "  list, ls           List installed packages", type: "output" },
            { text: "  run <script>       Run package.json script (build, dev, test)", type: "output" },
          ]);
          break;
        }

        if (sub === "install" || sub === "i" || sub === "add") {
          const pkgName = args[1];
          if (!pkgName) {
            addShellOutput([
              { text: "npm notice created a lockfile as package-lock.json", type: "info" },
              { text: `audited ${installedPackages.length * 8 + 34} packages in 842ms`, type: "success" },
              { text: "found 0 vulnerabilities", type: "success" },
            ]);
            break;
          }

          const cleanPkg = pkgName.replace(/@latest$/, "");
          const isAlready = installedPackages.some((p) => p.name === cleanPkg);
          if (isAlready) {
            addShellOutput([
              { text: `up to date, audited ${installedPackages.length * 10} packages in 410ms`, type: "output" },
              { text: `+ ${cleanPkg} is already installed.`, type: "info" },
            ]);
          } else {
            const newPkg: InstalledPackage = {
              name: cleanPkg,
              version: `^${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 20)}`,
              installedAt: new Date().toLocaleTimeString(),
            };
            setInstalledPackages((prev) => [...prev, newPkg]);
            addShellOutput([
              { text: `added 1 package, and audited ${installedPackages.length + 1} packages in 1.1s`, type: "success" },
              { text: `+ ${newPkg.name}@${newPkg.version}`, type: "success" },
              { text: "found 0 vulnerabilities", type: "info" },
            ]);
            toast({
              title: "Package Installed",
              description: `Installed ${newPkg.name} successfully into workspace!`,
            });
          }
          break;
        }

        if (sub === "list" || sub === "ls") {
          const treeLines = [
            { text: `know-deep-studio@1.0.0 /home/coder/workspace`, type: "info" as const },
            ...installedPackages.map((p, idx) => ({
              text: `${idx === installedPackages.length - 1 ? "└──" : "├──"} ${p.name}@${p.version}`,
              type: "output" as const,
            })),
          ];
          addShellOutput(treeLines);
          break;
        }

        if (sub === "run") {
          const script = args[1];
          if (!script || script === "dev" || script === "start") {
            addShellOutput([
              { text: `> know-deep-studio@1.0.0 ${script || "dev"}`, type: "info" },
              { text: `> vite --host --port 3000`, type: "info" },
              { text: `  VITE v5.4.2  ready in 184 ms`, type: "success" },
              { text: `  ➜  Local:   http://localhost:3000/`, type: "success" },
              { text: `  ➜  Network: use --host to expose`, type: "output" },
            ]);
          } else if (script === "build") {
            addShellOutput([
              { text: `> know-deep-studio@1.0.0 build`, type: "info" },
              { text: `> tsc -b && vite build`, type: "info" },
              { text: `vite v5.4.2 building for production...`, type: "output" },
              { text: `✓ 142 modules transformed.`, type: "output" },
              { text: `dist/index.html                   0.84 kB │ gzip:  0.42 kB`, type: "success" },
              { text: `dist/assets/index-D7h2k9.css     24.12 kB │ gzip:  5.60 kB`, type: "success" },
              { text: `dist/assets/index-C8a1b2.js     182.40 kB │ gzip: 54.10 kB`, type: "success" },
              { text: `✓ built in 420ms`, type: "success" },
            ]);
          } else if (script === "test") {
            addShellOutput([
              { text: `> know-deep-studio@1.0.0 test`, type: "info" },
              { text: `RUNS  src/algorithms.test.ts`, type: "output" },
              { text: `✓ findLongestSubarray returns optimal window (4ms)`, type: "success" },
              { text: `✓ quicksort handles duplicates and empty arrays (2ms)`, type: "success" },
              { text: `Test Suites: 1 passed, 1 total`, type: "success" },
              { text: `Tests:       2 passed, 2 total`, type: "success" },
              { text: `Snapshots:   0 total`, type: "output" },
              { text: `Time:        0.652 s`, type: "output" },
            ]);
          } else {
            addShellOutput([{ text: `npm ERR! Missing script: "${script}"`, type: "error" }]);
          }
          break;
        }

        addShellOutput([{ text: `npm: '${sub}' is not an implemented npm command in this sandbox.`, type: "warning" }]);
        break;
      }

      case "git": {
        const sub = args[0];
        if (!sub || sub === "status") {
          addShellOutput([
            { text: `On branch ${currentBranch}`, type: "info" },
            { text: `Your branch is up to date with 'origin/${currentBranch}'.`, type: "output" },
            { text: "", type: "output" },
            { text: "Changes not staged for commit:", type: "warning" },
            { text: "  (use \"git add <file>...\" to update what will be committed)", type: "output" },
            ...files.map((f) => ({
              text: `\tmodified:   ${f.name}`,
              type: "warning" as const,
            })),
            { text: "", type: "output" },
            { text: "no changes added to commit (use \"git add\" and \"git commit\")", type: "output" },
          ]);
          break;
        }

        if (sub === "branch") {
          const branchArg = args[1];
          if (branchArg) {
            setCurrentBranch(branchArg);
            addShellOutput([{ text: `Switched to branch '${branchArg}'`, type: "success" }]);
          } else {
            addShellOutput([
              { text: `* ${currentBranch}`, type: "success" },
              { text: "  develop", type: "output" },
              { text: "  feature/monaco-pro", type: "output" },
            ]);
          }
          break;
        }

        if (sub === "log") {
          const lines = gitCommits.flatMap((c) => [
            { text: `commit ${c.hash}8b9a204e8d (HEAD -> ${currentBranch}, origin/${currentBranch})`, type: "warning" as const },
            { text: `Author: ${c.author}`, type: "output" as const },
            { text: `Date:   ${c.time}`, type: "output" as const },
            { text: `    ${c.message}`, type: "info" as const },
            { text: "", type: "output" as const },
          ]);
          addShellOutput(lines);
          break;
        }

        if (sub === "commit") {
          const msgIdx = args.findIndex((a) => a === "-m" || a === "--message");
          const commitMsg = msgIdx !== -1 ? args.slice(msgIdx + 1).join(" ").replace(/^["']|["']$/g, "") : "chore: update workspace files";
          const newHash = Math.random().toString(36).substring(2, 9);
          const newCommit = {
            hash: newHash,
            message: commitMsg,
            time: "just now",
            author: "Coder <ayush@knowdeep.dev>",
          };
          setGitCommits((prev) => [newCommit, ...prev]);
          addShellOutput([
            { text: `[${currentBranch} ${newHash}] ${commitMsg}`, type: "success" },
            { text: ` ${files.length} files changed, 28 insertions(+), 4 deletions(-)`, type: "output" },
          ]);
          toast({ title: "Git Commit Created", description: `Committed: ${commitMsg}` });
          break;
        }

        if (sub === "diff") {
          const target = args[1] || files[0]?.name || "main.js";
          addShellOutput([
            { text: `diff --git a/${target} b/${target}`, type: "info" },
            { text: `index 7f8b92a..3e4d10c 100644`, type: "output" },
            { text: `--- a/${target}`, type: "error" },
            { text: `+++ b/${target}`, type: "success" },
            { text: `@@ -1,5 +1,8 @@`, type: "info" },
            { text: `- // Legacy snippet`, type: "error" },
            { text: `+ // Optimized Monaco Engine in Know Deep Code Studio`, type: "success" },
            { text: `+ const initialized = true;`, type: "success" },
          ]);
          break;
        }

        if (sub === "push") {
          addShellOutput([
            { text: `Enumerating objects: 7, done.`, type: "output" },
            { text: `Counting objects: 100% (7/7), done.`, type: "output" },
            { text: `Writing objects: 100% (5/5), 1.24 KiB | 1.24 MiB/s, done.`, type: "output" },
            { text: `To https://github.com/knowdeep/studio-workspace.git`, type: "info" },
            { text: `   7f8b92a..3e4d10c  ${currentBranch} -> ${currentBranch}`, type: "success" },
          ]);
          toast({ title: "Pushed to Remote", description: `Branch ${currentBranch} successfully synced with origin.` });
          break;
        }

        addShellOutput([{ text: `git: '${sub}' is not recognized. Try 'git status', 'git commit', 'git log', 'git push'.`, type: "error" }]);
        break;
      }

      case "node": {
        const fileTarget = args[0];
        let codeToRun = "";
        if (fileTarget) {
          const file = files.find((f) => f.name.toLowerCase() === fileTarget.toLowerCase());
          if (file) {
            codeToRun = file.content;
          } else {
            addShellOutput([{ text: `node: cannot find module '${fileTarget}'`, type: "error" }]);
            break;
          }
        } else {
          // If no file given, run the active file
          const active = files.find((f) => f.id === activeFileId) || files[0];
          codeToRun = active ? active.content : "";
        }

        if (codeToRun) {
          addShellOutput([{ text: `[Node.js v20.11.0] Executing sandbox...`, type: "info" }]);
          // Run through console executor
          onExecuteCommand(codeToRun);
          addShellOutput([{ text: `✓ Execution finished with exit code 0. (See Console Output tab for full stream)`, type: "success" }]);
        }
        break;
      }

      case "python":
      case "python3": {
        const pyFile = args[0];
        addShellOutput([
          { text: `[Python 3.11.8] Executing ${pyFile || "script"}...`, type: "info" },
          { text: `Output: Hello from Python virtual interpreter in Know Deep Studio!`, type: "success" },
          { text: `Process returned 0 (0.042s)`, type: "output" },
        ]);
        break;
      }

      case "curl": {
        const url = args[0] || "https://api.github.com/zen";
        addShellOutput([
          { text: `HTTP/2 200 OK`, type: "info" },
          { text: `date: ${new Date().toUTCString()}`, type: "output" },
          { text: `content-type: application/json; charset=utf-8`, type: "output" },
          { text: `cache-control: public, max-age=60`, type: "output" },
          { text: `{"status": "ok", "message": "Responsive, resilient code starts here.", "target": "${url}"}`, type: "success" },
        ]);
        break;
      }

      default:
        addShellOutput([
          { text: `zsh: command not found: ${main}`, type: "error" },
          { text: `Type 'help' to see all supported shell commands.`, type: "info" },
        ]);
        break;
    }
  };

  const handleShellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRunShellCommand(shellInput);
      setShellInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (shellHistory.length === 0) return;
      const nextIndex = shellHistoryIndex === -1 ? shellHistory.length - 1 : Math.max(0, shellHistoryIndex - 1);
      setShellHistoryIndex(nextIndex);
      setShellInput(shellHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (shellHistoryIndex === -1) return;
      const nextIndex = shellHistoryIndex + 1;
      if (nextIndex >= shellHistory.length) {
        setShellHistoryIndex(-1);
        setShellInput("");
      } else {
        setShellHistoryIndex(nextIndex);
        setShellInput(shellHistory[nextIndex]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Autocomplete basic commands
      const current = shellInput.trim();
      const candidates = [
        "npm install ",
        "npm list",
        "npm run build",
        "npm run test",
        "git status",
        "git log",
        "git diff",
        "git push",
        "ls -la",
        "clear",
        "node main.js",
        "cat main.js",
        "help",
        ...files.map((f) => `cat ${f.name}`),
        ...files.map((f) => `node ${f.name}`),
      ];
      const match = candidates.find((c) => c.startsWith(current));
      if (match) {
        setShellInput(match);
      }
    }
  };

  const handleReplKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!replInput.trim()) return;
      setReplHistory((prev) => [...prev, replInput]);
      setReplHistoryIndex(-1);
      onExecuteCommand(replInput.trim());
      setReplInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (replHistory.length === 0) return;
      const nextIndex = replHistoryIndex === -1 ? replHistory.length - 1 : Math.max(0, replHistoryIndex - 1);
      setReplHistoryIndex(nextIndex);
      setReplInput(replHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (replHistoryIndex === -1) return;
      const nextIndex = replHistoryIndex + 1;
      if (nextIndex >= replHistory.length) {
        setReplHistoryIndex(-1);
        setReplInput("");
      } else {
        setReplHistoryIndex(nextIndex);
        setReplInput(replHistory[nextIndex]);
      }
    }
  };

  const handleCopy = () => {
    if (activeTab === "terminal") {
      const fullText = shellLines.map((l) => `[${l.timestamp}] ${l.text}`).join("\n");
      navigator.clipboard.writeText(fullText);
    } else {
      const fullText = logs.map((l) => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.text}`).join("\n");
      navigator.clipboard.writeText(fullText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to Clipboard", description: "Terminal output buffer saved to clipboard." });
  };

  const getLogStyle = (type: TerminalLog["type"]) => {
    switch (type) {
      case "stderr":
        return "text-rose-400 font-semibold";
      case "warn":
        return "text-amber-300";
      case "info":
        return "text-cyan-300";
      case "system":
        return "text-indigo-400 italic";
      case "stdout":
      default:
        return "text-emerald-400";
    }
  };

  const getShellLineColor = (type: ShellLine["type"]) => {
    switch (type) {
      case "input":
        return "text-cyan-300 font-semibold";
      case "error":
        return "text-rose-400 font-medium";
      case "warning":
        return "text-amber-300";
      case "success":
        return "text-emerald-400";
      case "info":
        return "text-blue-300 font-medium";
      case "output":
      default:
        return "text-slate-200";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 shadow-sm overflow-hidden font-mono text-xs">
      {/* Top Header with Tab Switcher & Action Buttons */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setActiveTab("terminal");
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "terminal"
                  ? "bg-slate-800 text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              Terminal Emulator
            </button>

            <button
              onClick={() => setActiveTab("console")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "console"
                  ? "bg-slate-800 text-cyan-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              Console &amp; REPL
              {logs.length > 1 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300">
                  {logs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "packages"
                  ? "bg-slate-800 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Packages ({installedPackages.length})
            </button>
          </div>

          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Clock className="w-3 h-3 animate-spin" /> Live Stream
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHistoryModal(true)}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded font-mono gap-1"
            title="Console Command History (↑/↓)"
          >
            <History className="w-3 h-3 text-amber-400" />
            <span>History ({shellHistory.length})</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              if (activeTab === "terminal") {
                setShellLines([]);
              } else {
                onClear();
              }
            }}
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Clear Output"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* QUICK COMMAND SHORTCUT BAR */}
      {activeTab === "terminal" && (
        <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-thin">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Commands:
          </span>
          {[
            { label: "npm install", cmd: "npm install" },
            { label: "git status", cmd: "git status" },
            { label: "ls -la", cmd: "ls -la" },
            { label: "npm run build", cmd: "npm run build" },
            { label: "git log", cmd: "git log" },
            { label: "node main.js", cmd: "node main.js" },
            { label: "help", cmd: "help" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleRunShellCommand(item.cmd)}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors shrink-0 font-mono"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "console" && (
        <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-thin">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Test:
          </span>
          {QUICK_TEST_SNIPPETS.map((snippet, idx) => (
            <button
              key={idx}
              onClick={() => onExecuteCommand(snippet.code)}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors shrink-0 font-mono"
              title={snippet.code}
            >
              {snippet.label}
            </button>
          ))}
        </div>
      )}

      {/* VIEWPORT CONTENT */}
      {activeTab === "terminal" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={terminalScrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-1 select-text leading-relaxed">
            {shellLines.map((line) => (
              <div key={line.id} className="flex items-start gap-2 leading-relaxed break-all">
                <span className="text-slate-600 text-[10px] select-none shrink-0 font-mono mt-0.5">
                  {line.timestamp}
                </span>
                <span className={`flex-1 whitespace-pre-wrap ${getShellLineColor(line.type)}`}>
                  {line.text}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Shell Prompt */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-t border-slate-800">
            <span className="text-emerald-400 font-semibold select-none flex items-center gap-1">
              coder@knowdeep:<span className="text-cyan-400">{currentDirectory}</span>$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={shellInput}
              onChange={(e) => setShellInput(e.target.value)}
              onKeyDown={handleShellKeyDown}
              placeholder="npm install, git status, ls -la, node main.js, help..."
              className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-xs focus:outline-none font-mono"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (shellInput.trim()) {
                  handleRunShellCommand(shellInput);
                  setShellInput("");
                }
              }}
              className="h-6 px-2 text-[11px] text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded"
            >
              Exec
            </Button>
          </div>
        </div>
      )}

      {activeTab === "console" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={consoleScrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-1.5 select-text leading-relaxed">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>Real-time console ready.</p>
                <p className="text-[11px] mt-1 text-slate-600">
                  Press &apos;Run Code&apos; (⌘↵) or type JavaScript / REPL commands below to execute immediately.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed break-all">
                  <span className="text-slate-600 text-[10px] select-none shrink-0 font-mono mt-0.5">
                    {log.timestamp}
                  </span>
                  <span className={`flex-1 whitespace-pre-wrap ${getLogStyle(log.type)}`}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Interactive REPL Input Prompt */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-t border-slate-800">
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={replInput}
              onChange={(e) => setReplInput(e.target.value)}
              onKeyDown={handleReplKeyDown}
              placeholder="Type expression or snippet to execute immediately (e.g. 2**10, [1,2,3].map(x=>x*2))..."
              className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-xs focus:outline-none font-mono"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (replInput.trim()) {
                  onExecuteCommand(replInput.trim());
                  setReplInput("");
                }
              }}
              className="h-6 px-2 text-[11px] text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded"
            >
              Run
            </Button>
          </div>
        </div>
      )}

      {activeTab === "packages" && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Installed npm Packages</h4>
              <p className="text-[11px] text-slate-400">Available dependencies in virtual node_modules</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActiveTab("terminal");
                setShellInput("npm install ");
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="h-7 text-xs rounded-lg bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
            >
              + Install New
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {installedPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{pkg.name}</div>
                    <div className="text-[10px] text-slate-400">Version: {pkg.version}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Shell Tip:
            </div>
            <p>
              Run <code className="text-amber-300">npm install &lt;package-name&gt;</code> in the terminal to add new libraries like <code className="text-cyan-300">lodash</code>, <code className="text-cyan-300">axios</code>, or <code className="text-cyan-300">date-fns</code>.
            </p>
          </div>
        </div>
      )}

      {/* Command History Modal Overlay */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-3 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <History className="w-4 h-4" />
                <span>Console Command History ({shellHistory.length})</span>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Click any past command to run it directly, or use <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300">↑</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300">↓</kbd> in prompt.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {shellHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-sans text-xs">
                  No commands executed yet. Type in the terminal to record history.
                </div>
              ) : (
                shellHistory.map((cmd, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      handleRunShellCommand(cmd);
                      setShowHistoryModal(false);
                      toast({ title: "Command Executed from History", description: `$ ${cmd}` });
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span className="text-emerald-400 font-bold">$ {cmd}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-amber-400">Re-run ➜</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-sans text-[11px]">
              <button
                onClick={() => {
                  setShellHistory([]);
                  toast({ title: "History Cleared", description: "Cleared command history log." });
                }}
                className="text-rose-400 hover:underline"
              >
                Clear History Log
              </button>
              <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(false)} className="h-7 text-xs text-slate-300">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
