import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import {
  Keyboard,
  Search,
  SlidersHorizontal,
  Plus,
  Sun,
  Moon,
  Settings as SettingsIcon,
  MessageSquare,
  Globe,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Code2,
  Languages,
  GraduationCap,
  Newspaper,
  CloudSun,
  Trophy,
  ArrowRight,
  ExternalLink,
  Check,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { isMac, modKey, altKey } from "@/components/KeyboardShortcuts";

export interface ShortcutItem {
  id: string;
  label: string;
  keys: string[];
  category: "essential" | "chat" | "tools" | "sequences";
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

export function KeyboardShortcutsHelpDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, setCurrentConversationId } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "essential" | "chat" | "tools" | "sequences"
  >("all");
  const [executedShortcut, setExecutedShortcut] = useState<string | null>(null);

  const handleExecute = (item: ShortcutItem) => {
    if (item.action) {
      item.action();
      setExecutedShortcut(item.id);
      setTimeout(() => setExecutedShortcut(null), 1500);
    }
  };

  const allShortcuts: ShortcutItem[] = useMemo(
    () => [
      // 1. Essential Actions
      {
        id: "command-palette",
        label: "Open Search & Command Palette",
        keys: [modKey, "K"],
        category: "essential",
        description: "Instant search for tools, chats, and fast actions",
        actionLabel: "Open Search",
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("knowdeep_open_search"));
        },
      },
      {
        id: "toggle-sidebar",
        label: "Toggle Navigation Drawer",
        keys: [modKey, "B"],
        category: "essential",
        description: "Expand or collapse the slide-out workspace sidebar",
        actionLabel: "Toggle",
        action: () => {
          toggleSidebar();
          toast({ title: "Navigation Drawer Toggled" });
        },
      },
      {
        id: "new-chat",
        label: "Start New Chat Conversation",
        keys: [modKey, "N"],
        category: "essential",
        description: "Initializes a fresh conversation and resets context",
        actionLabel: "New Chat",
        action: () => {
          onClose();
          setCurrentConversationId(null);
          navigate("/chat");
          toast({ title: "New Chat Workspace Opened" });
        },
      },
      {
        id: "toggle-theme",
        label: "Toggle Dark / Light Theme",
        keys: [modKey, "Shift", "T"],
        category: "essential",
        description: "Switch between dark mode and crisp high-contrast light theme",
        actionLabel: "Toggle Theme",
        action: () => {
          const next = theme === "dark" ? "light" : "dark";
          setTheme(next);
          toast({ title: `Theme switched to ${next} mode` });
        },
      },
      {
        id: "open-settings",
        label: "Open Workspace Settings",
        keys: [modKey, ","],
        category: "essential",
        description: "Configure models, API keys, language, and voice",
        actionLabel: "Settings",
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("knowdeep_open_settings"));
        },
      },
      {
        id: "shortcuts-help",
        label: "Show Keyboard Shortcuts Dialog",
        keys: ["?"],
        category: "essential",
        description: `Or press ${modKey} + / to view this dialog anytime`,
      },
      {
        id: "dismiss-modal",
        label: "Close Dialog or Unfocus Input",
        keys: ["Esc"],
        category: "essential",
        description: "Closes open popups, overlays, or removes focus from inputs",
      },

      // 2. Chat & AI Prompts
      {
        id: "chat-send",
        label: "Send Chat Message",
        keys: ["Enter"],
        category: "chat",
        description: "Submits current prompt to the active AI reasoning model",
      },
      {
        id: "chat-newline",
        label: "Insert Line Break",
        keys: ["Shift", "Enter"],
        category: "chat",
        description: "Creates a new line without submitting prompt",
      },
      {
        id: "chat-quick-focus",
        label: "Quick-Focus Chat / Search Input",
        keys: ["/"],
        category: "chat",
        description: "Press '/' anywhere when not typing to focus search or input",
      },
      {
        id: "chat-circle-search",
        label: "Circle to Search on Images",
        keys: ["Click + Drag"],
        category: "chat",
        description: "Draw a circle around any image area to initiate visual AI search",
      },

      // 3. Direct Tool Switchers
      {
        id: "tool-chat",
        label: "1. AI Chat Workspace",
        keys: [modKey, "1"],
        category: "tools",
        description: "Multi-turn conversational intelligence & coding",
        actionLabel: "Open Chat",
        action: () => {
          onClose();
          navigate("/chat");
        },
      },
      {
        id: "tool-search",
        label: "2. Web Search Engine",
        keys: [modKey, "2"],
        category: "tools",
        description: "Real-time web research, sources & Google-style snippets",
        actionLabel: "Open Search",
        action: () => {
          onClose();
          navigate("/web-search");
        },
      },
      {
        id: "tool-docs",
        label: "3. Document Studio",
        keys: [modKey, "3"],
        category: "tools",
        description: "PDF analysis, document chat, OCR scanning",
        actionLabel: "Open Docs",
        action: () => {
          onClose();
          navigate("/document-studio");
        },
      },
      {
        id: "tool-img-gen",
        label: "4. Image Generator",
        keys: [modKey, "4"],
        category: "tools",
        description: "AI image creation with high-resolution generation",
        actionLabel: "Open Studio",
        action: () => {
          onClose();
          navigate("/image-generator");
        },
      },
      {
        id: "tool-img-enh",
        label: "5. Image Enhancer",
        keys: [modKey, "5"],
        category: "tools",
        description: "4K super-resolution upscaling and color restoration",
        actionLabel: "Open Enhancer",
        action: () => {
          onClose();
          navigate("/image-enhancer");
        },
      },
      {
        id: "tool-summarizer",
        label: "6. Image Summarizer",
        keys: [modKey, "6"],
        category: "tools",
        description: "Visual OCR extraction and chart analysis",
        actionLabel: "Open Summarizer",
        action: () => {
          onClose();
          navigate("/summarizer");
        },
      },
      {
        id: "tool-code",
        label: "7. Code Studio",
        keys: [modKey, "7"],
        category: "tools",
        description: "Interactive code interpreter, runner and debugger",
        actionLabel: "Open Code",
        action: () => {
          onClose();
          navigate("/code-studio");
        },
      },
      {
        id: "tool-trans",
        label: "8. Translate Studio",
        keys: [modKey, "8"],
        category: "tools",
        description: "Multi-language neural translation & audio speech",
        actionLabel: "Open Translate",
        action: () => {
          onClose();
          navigate("/translate-studio");
        },
      },
      {
        id: "tool-homework",
        label: "9. Homework Assistant",
        keys: [modKey, "9"],
        category: "tools",
        description: "Step-by-step academic solver with diagrams",
        actionLabel: "Open Homework",
        action: () => {
          onClose();
          navigate("/homework");
        },
      },
      {
        id: "tool-overview",
        label: "0. Workspace Overview / Home",
        keys: [modKey, "0"],
        category: "tools",
        description: "Return to Know Deep main dashboard",
        actionLabel: "Go Home",
        action: () => {
          onClose();
          navigate("/");
        },
      },

      // 4. Sequential Jump Keys
      {
        id: "seq-c",
        label: "Go to Chat",
        keys: ["G", "then", "C"],
        category: "sequences",
        description: "Sequential shortcut to jump to AI Chat",
        action: () => {
          onClose();
          navigate("/chat");
        },
      },
      {
        id: "seq-s",
        label: "Go to Web Search",
        keys: ["G", "then", "S"],
        category: "sequences",
        description: "Sequential shortcut to jump to Web Search Engine",
        action: () => {
          onClose();
          navigate("/web-search");
        },
      },
      {
        id: "seq-d",
        label: "Go to Document Studio",
        keys: ["G", "then", "D"],
        category: "sequences",
        description: "Sequential shortcut to jump to Document Studio",
        action: () => {
          onClose();
          navigate("/document-studio");
        },
      },
      {
        id: "seq-n",
        label: "Go to News Engine",
        keys: ["G", "then", "N"],
        category: "sequences",
        description: "Sequential shortcut to jump to Real-time News",
        action: () => {
          onClose();
          navigate("/news");
        },
      },
      {
        id: "seq-w",
        label: "Go to Weather Station",
        keys: ["G", "then", "W"],
        category: "sequences",
        description: "Sequential shortcut to jump to Weather Station",
        action: () => {
          onClose();
          navigate("/weather");
        },
      },
      {
        id: "seq-h",
        label: "Go to Workspace Home",
        keys: ["G", "then", "H"],
        category: "sequences",
        description: "Sequential shortcut to jump to Landing Page / Home",
        action: () => {
          onClose();
          navigate("/");
        },
      },
    ],
    [navigate, onClose, setCurrentConversationId, setTheme, theme, toast, toggleSidebar]
  );

  const filteredShortcuts = useMemo(() => {
    return allShortcuts.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.keys.join(" ").toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [allShortcuts, searchQuery, selectedCategory]);

  const categories = [
    { id: "all", label: "All Shortcuts", count: allShortcuts.length },
    {
      id: "essential",
      label: "Essential",
      count: allShortcuts.filter((s) => s.category === "essential").length,
    },
    {
      id: "chat",
      label: "AI & Chat",
      count: allShortcuts.filter((s) => s.category === "chat").length,
    },
    {
      id: "tools",
      label: "Tool Switchers",
      count: allShortcuts.filter((s) => s.category === "tools").length,
    },
    {
      id: "sequences",
      label: "Vim Sequences",
      count: allShortcuts.filter((s) => s.category === "sequences").length,
    },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        id="keyboard-shortcuts-help-dialog"
        className="sm:max-w-2xl max-w-[95vw] max-h-[88vh] p-0 flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl z-50"
      >
        <DialogHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Keyboard Shortcuts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {isMac ? "macOS (⌘)" : "Windows / Linux (Ctrl)"}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Navigate, chat, and switch tools with zero friction
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="mt-4 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts (e.g., 'drawer', 'b', 'new chat', 'search')..."
                className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                    selectedCategory === cat.id
                      ? "bg-cyan-500 text-white shadow-2xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      selectedCategory === cat.id
                        ? "bg-black/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Shortcuts List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 max-h-[50vh]">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
              <Keyboard className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="font-semibold text-foreground">No matching shortcuts found</p>
              <p className="text-[11px]">Try searching with a different keyword or key symbol.</p>
            </div>
          ) : (
            filteredShortcuts.map((item) => {
              const isExecuted = executedShortcut === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all group",
                    isExecuted
                      ? "bg-cyan-500/15 border-cyan-500/50"
                      : "bg-muted/20 hover:bg-muted/40 border-border/40 hover:border-border/80"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {item.label}
                      </span>
                      {item.category === "sequences" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">
                          Sequence
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Key Caps */}
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {k === "then" ? (
                            <span className="text-[10px] text-muted-foreground px-0.5 font-medium">
                              then
                            </span>
                          ) : (
                            <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background text-foreground border border-border/80 rounded-lg shadow-2xs min-w-[24px] text-center select-none group-hover:border-cyan-500/50 transition-colors">
                              {k}
                            </kbd>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Quick Trigger Button if Action Exists */}
                    {item.action && (
                      <button
                        type="button"
                        onClick={() => handleExecute(item)}
                        className={cn(
                          "hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ml-1",
                          isExecuted
                            ? "bg-emerald-500 text-white"
                            : "bg-muted hover:bg-cyan-500/20 hover:text-cyan-400 text-muted-foreground"
                        )}
                        title={`Run shortcut action: ${item.label}`}
                      >
                        {isExecuted ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Executed</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>{item.actionLabel || "Run"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-border/60 bg-muted/25 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Tip:</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-background border border-border/80 rounded font-mono text-[10px]">?</kbd> anywhere outside text inputs to summon this dialog</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
