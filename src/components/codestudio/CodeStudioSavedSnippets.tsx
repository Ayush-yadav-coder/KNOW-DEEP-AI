import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
  Code2,
  Folder,
  Tag,
  ArrowRight,
  Sparkles,
  Download,
  Share2,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserSavedSnippet, SupportedLanguage } from "./CodeStudioTypes";
import { CodeStudioPrismHighlight } from "./CodeStudioPrismHighlight";

interface CodeStudioSavedSnippetsProps {
  onInsertSnippet?: (code: string, mode: "append" | "replace") => void;
  onLoadSnippet?: (code: string, lang: SupportedLanguage) => void;
  activeCode?: string;
  activeLanguage?: SupportedLanguage;
}

const DEFAULT_SAVED_SNIPPETS: UserSavedSnippet[] = [
  {
    id: "snip-1",
    title: "Deep Clone Object",
    category: "Utilities",
    language: "javascript",
    description: "Robust deep clone using structuredClone with JSON fallback.",
    tags: ["Objects", "Utility", "Cloning"],
    code: `function deepClone(obj) {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

const original = { user: "Ayush", nested: { role: "admin", scores: [95, 99] } };
const cloned = deepClone(original);
console.log("Deep cloned object:", cloned);`,
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
  },
  {
    id: "snip-2",
    title: "Debounce Function Hook",
    category: "Frontend",
    language: "typescript",
    description: "Generic debounce wrapper with timeout cancellation.",
    tags: ["React", "Hooks", "Debounce"],
    code: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

const logSearch = debounce((query: string) => {
  console.log("Executing search query:", query);
}, 300);

logSearch("Know Deep");`,
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
  },
  {
    id: "snip-3",
    title: "Exponential Backoff Retry",
    category: "Backend",
    language: "javascript",
    description: "Resilient async retry function with exponential backoff delay.",
    tags: ["Async", "API", "Resilience"],
    code: `async function fetchWithRetry(fn, maxRetries = 3, baseDelay = 300) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(\`Attempt \${attempt} failed. Retrying in \${delay}ms...\`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}`,
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
  },
];

const CATEGORIES = ["All", "Frontend", "Backend", "Algorithms", "Utilities", "Database", "Custom"];

export const CodeStudioSavedSnippets: React.FC<CodeStudioSavedSnippetsProps> = ({
  onInsertSnippet,
  onLoadSnippet,
  activeCode = "",
  activeLanguage = "javascript",
}) => {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<UserSavedSnippet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for new/edit snippet
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Utilities");
  const [formLanguage, setFormLanguage] = useState<SupportedLanguage>(activeLanguage);
  const [formDescription, setFormDescription] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formTags, setFormTags] = useState("");

  // Load snippets on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("knowdeep_user_saved_snippets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSnippets(parsed);
          return;
        }
      }
      setSnippets(DEFAULT_SAVED_SNIPPETS);
      localStorage.setItem("knowdeep_user_saved_snippets", JSON.stringify(DEFAULT_SAVED_SNIPPETS));
    } catch {
      setSnippets(DEFAULT_SAVED_SNIPPETS);
    }
  }, []);

  const saveSnippetsToStorage = (updated: UserSavedSnippet[]) => {
    setSnippets(updated);
    localStorage.setItem("knowdeep_user_saved_snippets", JSON.stringify(updated));
  };

  const handleOpenAddModal = (useCurrentCode = false) => {
    setEditingSnippetId(null);
    setFormTitle(useCurrentCode ? "Current Editor Snippet" : "");
    setFormCategory("Utilities");
    setFormLanguage(activeLanguage);
    setFormDescription(useCurrentCode ? "Saved from active Code Studio session." : "");
    setFormCode(useCurrentCode ? activeCode : "");
    setFormTags("custom, saved");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (snippet: UserSavedSnippet) => {
    setEditingSnippetId(snippet.id);
    setFormTitle(snippet.title);
    setFormCategory(snippet.category);
    setFormLanguage(snippet.language);
    setFormDescription(snippet.description || "");
    setFormCode(snippet.code);
    setFormTags(snippet.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) {
      toast({ title: "Title & Code Required", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const now = new Date().toISOString().split("T")[0];

    if (editingSnippetId) {
      const updated = snippets.map((s) =>
        s.id === editingSnippetId
          ? {
              ...s,
              title: formTitle.trim(),
              category: formCategory,
              language: formLanguage,
              description: formDescription.trim(),
              code: formCode,
              tags: tagsArray,
              updatedAt: now,
            }
          : s
      );
      saveSnippetsToStorage(updated);
      toast({ title: "Snippet Updated", description: `Saved changes to "${formTitle}".` });
    } else {
      const newSnippet: UserSavedSnippet = {
        id: `snip-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        language: formLanguage,
        description: formDescription.trim(),
        code: formCode,
        tags: tagsArray,
        createdAt: now,
        updatedAt: now,
      };
      saveSnippetsToStorage([newSnippet, ...snippets]);
      toast({ title: "Snippet Saved", description: `Added "${formTitle}" to your Saved Snippets library.` });
    }

    setIsModalOpen(false);
  };

  const handleDeleteSnippet = (id: string, title: string) => {
    const updated = snippets.filter((s) => s.id !== id);
    saveSnippetsToStorage(updated);
    toast({ title: "Snippet Removed", description: `Deleted "${title}".` });
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to Clipboard", description: "Snippet code copied." });
  };

  // Get all unique tags for tag chips filter
  const allTags = Array.from(new Set(snippets.flatMap((s) => s.tags)));

  // Real-time Fuzzy Search & Category & Tag Filter
  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory = selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesTag = !activeTagFilter || s.tags.some((t) => t.toLowerCase() === activeTagFilter.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory && matchesTag;

    const titleMatch = s.title.toLowerCase().includes(query);
    const descMatch = s.description?.toLowerCase().includes(query) ?? false;
    const tagMatch = s.tags.some((t) => t.toLowerCase().includes(query));
    const langMatch = s.language.toLowerCase().includes(query);
    const codeMatch = s.code.toLowerCase().includes(query);

    return matchesCategory && matchesTag && (titleMatch || descMatch || tagMatch || langMatch || codeMatch);
  });

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Top Header & Action Controls */}
      <div className="p-4 bg-muted/40 backdrop-blur-md border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-sm">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Saved Snippets Library
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                {filteredSnippets.length} / {snippets.length} Saved
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">Categorize, fuzzy-search, and load code blocks into Monaco</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenAddModal(true)}
              className="h-8 text-xs rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border-amber-500/30 font-semibold gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Save Active Code
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleOpenAddModal(false)}
            className="h-8 text-xs rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Snippet
          </Button>
        </div>
      </div>

      {/* Real-Time Fuzzy Search & Filter Toolbar */}
      <div className="px-4 py-3 bg-muted/20 border-b border-border space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Fuzzy Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Fuzzy search by title, description, tags, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Chips Filter Bar */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
            <span className="text-muted-foreground font-semibold shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-500" /> Filter Tags:
            </span>
            {activeTagFilter && (
              <button
                onClick={() => setActiveTagFilter(null)}
                className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                ✕ Clear Tag
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full font-mono transition-colors shrink-0 ${
                  activeTagFilter === tag
                    ? "bg-amber-500 text-white font-bold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Snippets Grid */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filteredSnippets.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <Bookmark className="w-10 h-10 text-amber-500/50 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No matching snippets found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your fuzzy search query or category filter.</p>
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="p-4 rounded-2xl bg-card border border-border hover:border-amber-500/40 transition-all shadow-xs flex flex-col space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{snippet.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {snippet.category}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                      {snippet.language}
                    </span>
                  </div>
                  {snippet.description && (
                    <p className="text-xs text-muted-foreground">{snippet.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(snippet.id, snippet.code)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Copy Code"
                  >
                    {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEditModal(snippet)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Edit Snippet"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSnippet(snippet.id, snippet.title)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-500"
                    title="Delete Snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  {(onInsertSnippet || onLoadSnippet) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (onLoadSnippet) {
                          onLoadSnippet(snippet.code, snippet.language);
                        } else if (onInsertSnippet) {
                          onInsertSnippet(snippet.code, "replace");
                        }
                        toast({ title: "Loaded Snippet", description: `Applied ${snippet.title} to Monaco editor.` });
                      }}
                      className="h-7 text-xs rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1 px-3"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Load in Editor
                    </Button>
                  )}
                </div>
              </div>

              {/* Prism Syntax Highlighted Code Preview */}
              <CodeStudioPrismHighlight code={snippet.code} language={snippet.language} className="max-h-48" />

              {/* Tags */}
              {snippet.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {snippet.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      onClick={() => setActiveTagFilter(tag)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground cursor-pointer hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating / Editing Snippet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingSnippetId ? "Edit Saved Snippet" : "Save New Code Snippet"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSnippet} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Exponential Backoff Retry"
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as SupportedLanguage)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short explanation or use case..."
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Async, Utility, API"
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Code Block *</label>
                <textarea
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  rows={6}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 text-amber-300 font-mono border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  Save Snippet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
