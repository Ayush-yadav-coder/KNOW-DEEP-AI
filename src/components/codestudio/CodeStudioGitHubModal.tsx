import React, { useState, useEffect } from "react";
import {
  Github,
  GitBranch,
  GitCommit,
  FolderGit2,
  UploadCloud,
  DownloadCloud,
  KeyRound,
  ExternalLink,
  Check,
  Loader2,
  Search,
  Lock,
  Globe,
  AlertCircle,
  FileCode,
  CheckCircle2,
  X,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CodeFile, SupportedLanguage } from "./CodeStudioTypes";

interface CodeStudioGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFiles: CodeFile[];
  activeFile: CodeFile;
  onImportFiles: (files: CodeFile[], repoName: string) => void;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  public_repos: number;
  total_private_repos?: number;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  updated_at: string;
}

export const CodeStudioGitHubModal: React.FC<CodeStudioGitHubModalProps> = ({
  isOpen,
  onClose,
  currentFiles,
  activeFile,
  onImportFiles,
}) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [importingRepo, setImportingRepo] = useState(false);

  // Push commit state
  const [commitMessage, setCommitMessage] = useState<string>("Update code from Know Deep Code Studio");
  const [targetBranch, setTargetBranch] = useState<string>("main");
  const [targetPath, setTargetPath] = useState<string>(activeFile.name);
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);

  // Public repo importer
  const [publicRepoUrl, setPublicRepoUrl] = useState<string>("");
  const [isImportingPublic, setIsImportingPublic] = useState(false);

  // Load saved token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("knowdeep_github_token");
    if (savedToken) {
      setToken(savedToken);
      fetchGitHubProfile(savedToken);
    }
  }, []);

  const fetchGitHubProfile = async (pat: string) => {
    setIsAuthenticating(true);
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${pat.trim()}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) {
        throw new Error("Invalid GitHub token or insufficient scopes");
      }

      const userData: GitHubUser = await res.json();
      setUser(userData);
      localStorage.setItem("knowdeep_github_token", pat.trim());
      toast({ title: "Connected to GitHub", description: `Signed in as @${userData.login}` });
      fetchUserRepos(pat.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast({ title: "GitHub Error", description: msg, variant: "destructive" });
      setUser(null);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchUserRepos = async (pat: string) => {
    setIsLoadingRepos(true);
    try {
      const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (res.ok) {
        const repoList: GitHubRepo[] = await res.json();
        setRepos(repoList);
        if (repoList.length > 0 && !selectedRepo) {
          setSelectedRepo(repoList[0]);
          setTargetBranch(repoList[0].default_branch || "main");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch user repos:", err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("knowdeep_github_token");
    setUser(null);
    setRepos([]);
    setToken("");
    setSelectedRepo(null);
    toast({ title: "Disconnected", description: "GitHub credentials removed from session." });
  };

  // Helper to map extension to language
  const detectLanguage = (filename: string): SupportedLanguage => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "js":
      case "jsx":
      case "mjs":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "html":
      case "htm":
        return "html";
      case "css":
      case "scss":
        return "css";
      case "sql":
        return "sql";
      case "cpp":
      case "cc":
      case "c":
      case "h":
      case "hpp":
        return "cpp";
      case "java":
        return "java";
      case "rs":
        return "rust";
      case "go":
        return "go";
      case "json":
        return "json";
      case "md":
      case "markdown":
        return "markdown";
      default:
        return "javascript";
    }
  };

  // Import repository files
  const handleImportRepository = async (repoFullName: string, defaultBranch = "main") => {
    setImportingRepo(true);
    try {
      const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch repository contents recursively via GitHub Trees API
      const treeRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );

      if (!treeRes.ok) {
        throw new Error("Could not fetch repository tree. Check branch name or permissions.");
      }

      const treeData = await treeRes.json();
      const codeFilesList = (treeData.tree || [])
        .filter((item: any) => item.type === "blob")
        .filter((item: any) => {
          const ext = item.path.split(".").pop()?.toLowerCase();
          return ["js", "ts", "jsx", "tsx", "py", "html", "css", "sql", "cpp", "java", "rs", "go", "json", "md"].includes(ext);
        })
        .slice(0, 15); // Load up to 15 key source files

      if (codeFilesList.length === 0) {
        throw new Error("No source code files found in the root tree of this repository.");
      }

      // Download content for files
      const loadedFiles: CodeFile[] = await Promise.all(
        codeFilesList.map(async (item: any, idx: number) => {
          try {
            const rawRes = await fetch(
              `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/${item.path}`,
              { headers }
            );
            const content = await rawRes.text();
            return {
              id: `gh-${idx}-${Date.now()}`,
              name: item.path.split("/").pop() || item.path,
              language: detectLanguage(item.path),
              content,
              isMain: idx === 0,
            };
          } catch {
            return {
              id: `gh-${idx}`,
              name: item.path,
              language: detectLanguage(item.path),
              content: `// Could not fetch ${item.path}`,
            };
          }
        })
      );

      onImportFiles(loadedFiles, repoFullName);
      toast({
        title: "Repository Imported!",
        description: `Imported ${loadedFiles.length} files from ${repoFullName}`,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import repo";
      toast({ title: "Import Failed", description: msg, variant: "destructive" });
    } finally {
      setImportingRepo(false);
    }
  };

  // Push / Commit Active File directly to GitHub
  const handlePushCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user || !selectedRepo) {
      toast({ title: "Authentication Required", description: "Connect your GitHub account first.", variant: "destructive" });
      return;
    }

    setIsPushing(true);
    setPushSuccessUrl(null);

    try {
      const cleanPath = targetPath.trim().replace(/^\/+/, "");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      };

      // 1. Check if the file already exists in repo to obtain its SHA
      let currentSha: string | undefined;
      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${selectedRepo.full_name}/contents/${cleanPath}?ref=${targetBranch}`,
          { headers }
        );
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          currentSha = fileData.sha;
        }
      } catch {
        // File doesn't exist yet, proceeding as new file creation
      }

      // 2. Base64 encode the current editor content
      const utf8Bytes = new TextEncoder().encode(activeFile.content);
      let binary = "";
      utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const base64Content = btoa(binary);

      // 3. Commit file via GitHub Contents API
      const commitRes = await fetch(
        `https://api.github.com/repos/${selectedRepo.full_name}/contents/${cleanPath}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            message: commitMessage || `Update ${cleanPath} via Know Deep Code Studio`,
            content: base64Content,
            branch: targetBranch || selectedRepo.default_branch || "main",
            ...(currentSha ? { sha: currentSha } : {}),
          }),
        }
      );

      if (!commitRes.ok) {
        const errData = await commitRes.json();
        throw new Error(errData.message || "Failed to commit changes to GitHub");
      }

      const commitResult = await commitRes.json();
      const commitUrl = commitResult.commit?.html_url || `${selectedRepo.html_url}/commits/${targetBranch}`;
      setPushSuccessUrl(commitUrl);
      toast({
        title: "Pushed to GitHub!",
        description: `Successfully committed ${cleanPath} to ${selectedRepo.name} (${targetBranch})`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to push to GitHub";
      toast({ title: "Push Error", description: msg, variant: "destructive" });
    } finally {
      setIsPushing(false);
    }
  };

  // Import public repository by URL (e.g. facebook/react or full URL)
  const handleImportPublicUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicRepoUrl.trim()) return;

    let repoPath = publicRepoUrl.trim();
    repoPath = repoPath.replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");

    const parts = repoPath.split("/");
    if (parts.length >= 2) {
      handleImportRepository(`${parts[0]}/${parts[1]}`);
    } else {
      toast({ title: "Invalid Format", description: "Use 'owner/repository' format or full GitHub URL", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-card-foreground">
        {/* Header */}
        <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                GitHub Repository Suite
                {user && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    Connected
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                Import existing repositories and push editor changes directly to GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 1. GitHub Connection Status / Login */}
          {!user ? (
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/80 space-y-4">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Authenticate with GitHub</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enter your GitHub Personal Access Token (PAT with <code className="text-foreground">repo</code> scope) to access private repositories and push commits.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  onClick={() => fetchGitHubProfile(token)}
                  disabled={isAuthenticating || !token.trim()}
                  className="h-9 px-4 rounded-xl text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 shadow-xs"
                >
                  {isAuthenticating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Github className="w-3.5 h-3.5 mr-1.5" />}
                  Connect Account
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Stored securely in local browser session.</span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  Generate Token on GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-10 h-10 rounded-2xl border border-border shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{user.name || user.login}</span>
                    <span className="text-xs text-muted-foreground font-mono">@{user.login}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {repos.length} Repositories Available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchUserRepos(token)}
                  disabled={isLoadingRepos}
                  className="h-8 text-xs rounded-xl gap-1"
                  title="Refresh Repositories"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRepos ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDisconnect}
                  className="h-8 text-xs rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {/* 2. Push Current Code to Repository */}
          {user && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">Push Active File to GitHub</h3>
                </div>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                  File: {activeFile.name}
                </span>
              </div>

              <form onSubmit={handlePushCommit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground block mb-1">Select Target Repository</label>
                    <select
                      value={selectedRepo?.full_name || ""}
                      onChange={(e) => {
                        const found = repos.find((r) => r.full_name === e.target.value);
                        if (found) {
                          setSelectedRepo(found);
                          setTargetBranch(found.default_branch || "main");
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {repos.map((r) => (
                        <option key={r.id} value={r.full_name}>
                          {r.private ? "🔒" : "🌐"} {r.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1">Target Branch</label>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border">
                      <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={targetBranch}
                        onChange={(e) => setTargetBranch(e.target.value)}
                        placeholder="main"
                        className="w-full bg-transparent border-0 font-mono text-xs focus:outline-none text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground block mb-1">File Path in Repository</label>
                    <input
                      type="text"
                      value={targetPath}
                      onChange={(e) => setTargetPath(e.target.value)}
                      placeholder="src/index.js"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">Commit Message</label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Update via Know Deep Code Studio"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {pushSuccessUrl ? (
                    <a
                      href={pushSuccessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <CheckCircle2 className="w-4 h-4" /> View Commit on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      Commits directly to repository tree.
                    </span>
                  )}

                  <Button
                    type="submit"
                    disabled={isPushing || !selectedRepo}
                    className="h-8 px-4 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-xs"
                  >
                    {isPushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                    Push Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Browse & Import Your Repositories */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Import Your Repositories
                </h3>
                <span className="text-xs text-muted-foreground font-mono">{repos.length} repos</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter repositories..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {repos
                  .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((repo) => (
                    <div
                      key={repo.id}
                      className="p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          {repo.private ? <Lock className="w-3 h-3 text-amber-500 shrink-0" /> : <Globe className="w-3 h-3 text-muted-foreground shrink-0" />}
                          <span className="text-xs font-bold text-foreground truncate">{repo.name}</span>
                        </div>
                        {repo.language && (
                          <span className="text-[10px] text-muted-foreground">{repo.language}</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleImportRepository(repo.full_name, repo.default_branch)}
                        disabled={importingRepo}
                        className="h-7 text-xs px-2.5 rounded-lg shrink-0 gap-1"
                      >
                        <DownloadCloud className="w-3 h-3" />
                        Import
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. Import Any Public Repository by URL */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Import Any Public GitHub Repository
            </h3>
            <form onSubmit={handleImportPublicUrl} className="flex gap-2">
              <input
                type="text"
                value={publicRepoUrl}
                onChange={(e) => setPublicRepoUrl(e.target.value)}
                placeholder="e.g. facebook/react or https://github.com/torvalds/linux"
                className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                disabled={importingRepo || !publicRepoUrl.trim()}
                size="sm"
                className="h-8 px-3 rounded-xl text-xs gap-1"
              >
                {importingRepo ? <Loader2 className="w-3 h-3 animate-spin" /> : <DownloadCloud className="w-3 h-3" />}
                Import Repo
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
