import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import {
  Search,
  Keyboard,
  Command as CommandIcon,
  MessageSquare,
  Globe,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
  FileSearch,
  Terminal,
  Languages,
  GraduationCap,
  Newspaper,
  Trophy,
  CloudSun,
  BookOpen,
  BookMarked,
  Presentation,
  Boxes,
  Home,
  Plus,
  Moon,
  Sun,
  Settings as SettingsIcon,
  X,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  Compass,
  Check,
  Video,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsHelpDialog } from "@/components/KeyboardShortcutsHelpDialog";
export { KeyboardShortcutsHelpDialog };
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

// Detect Mac vs. Windows/Linux
export const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const modKey = isMac ? "⌘" : "Ctrl";
export const altKey = isMac ? "⌥" : "Alt";

export interface WorkspaceToolShortcut {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  route: string;
  icon: React.ElementType;
  color: string;
  numKey?: string; // 1-9 or 0
  seqKey?: string; // e.g. "c" for chat, "s" for search
}

export const WORKSPACE_TOOLS: WorkspaceToolShortcut[] = [
  {
    id: "chat",
    name: "AI Chat",
    shortLabel: "Chat",
    description: "Multi-turn conversational intelligence & reasoning",
    route: "/chat",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-500",
    numKey: "1",
    seqKey: "c",
  },
  {
    id: "web-search",
    name: "Web Search Engine",
    shortLabel: "Search",
    description: "Deep live multi-source web intelligence",
    route: "/web-search",
    icon: Globe,
    color: "from-sky-500 to-indigo-500",
    numKey: "2",
    seqKey: "s",
  },
  {
    id: "document-studio",
    name: "Document Studio",
    shortLabel: "Docs",
    description: "PDF analysis, OCR scanning & markdown publishing",
    route: "/document-studio",
    icon: FileText,
    color: "from-emerald-500 to-teal-500",
    numKey: "3",
    seqKey: "d",
  },
  {
    id: "image-generator",
    name: "Image Generator",
    shortLabel: "Generate",
    description: "High-resolution creative visual asset studio",
    route: "/image-generator",
    icon: ImageIcon,
    color: "from-purple-500 to-pink-500",
    numKey: "4",
    seqKey: "i",
  },
  {
    id: "image-enhancer",
    name: "Image Enhancer",
    shortLabel: "Enhance",
    description: "4K upscale, deburring, and artistic styling filters",
    route: "/image-enhancer",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    numKey: "5",
    seqKey: "e",
  },
  {
    id: "image-summarizer",
    name: "Image Summarizer",
    shortLabel: "Summarize",
    description: "OCR, visual object analysis & circle-to-search",
    route: "/summarizer",
    icon: FileSearch,
    color: "from-rose-500 to-pink-500",
    numKey: "6",
    seqKey: "m",
  },
  {
    id: "code-studio",
    name: "Code Studio",
    shortLabel: "Code",
    description: "Multi-language runtime sandbox & debugging studio",
    route: "/code-studio",
    icon: Terminal,
    color: "from-emerald-400 to-cyan-500",
    numKey: "7",
    seqKey: "k",
  },
  {
    id: "translate-studio",
    name: "Translate Studio",
    shortLabel: "Translate",
    description: "Polyglot translation with dialect preservation",
    route: "/translate-studio",
    icon: Languages,
    color: "from-blue-500 to-teal-500",
    numKey: "8",
    seqKey: "t",
  },
  {
    id: "homework-assistant",
    name: "Homework Assistant",
    shortLabel: "Homework",
    description: "Step-by-step problem solver for STEM & humanities",
    route: "/homework-assistant",
    icon: GraduationCap,
    color: "from-indigo-500 to-violet-600",
    numKey: "9",
    seqKey: "a",
  },
  {
    id: "home",
    name: "Workspace Overview",
    shortLabel: "Home",
    description: "Return to Know Deep home dashboard",
    route: "/",
    icon: Home,
    color: "from-cyan-500 to-blue-600",
    numKey: "0",
    seqKey: "h",
  },
  // Additional searchable platform tools
  {
    id: "news",
    name: "News Engine",
    shortLabel: "News",
    description: "Curated real-time global news & trend analysis",
    route: "/news",
    icon: Newspaper,
    color: "from-red-500 to-rose-600",
    seqKey: "n",
  },
  {
    id: "sports",
    name: "Sports Hub",
    shortLabel: "Sports",
    description: "Live scores, match stats & athlete tracking",
    route: "/sports",
    icon: Trophy,
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "weather",
    name: "Weather Station",
    shortLabel: "Weather",
    description: "Radar, hourly forecasts & atmospheric data",
    route: "/weather",
    icon: CloudSun,
    color: "from-amber-400 to-yellow-600",
    seqKey: "w",
  },
  {
    id: "ncert",
    name: "NCERT Tutor",
    shortLabel: "NCERT",
    description: "Curriculum aligned academic problem solving",
    route: "/ncert-tutor",
    icon: BookOpen,
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "video-studio",
    name: "Video Studio",
    shortLabel: "Videos",
    description: "Cinematic text/image to video synthesis and dynamic camera pathways",
    route: "/video-studio",
    icon: Video,
    color: "from-red-500 to-amber-500",
    seqKey: "v",
  },
  {
    id: "presentation",
    name: "Presentation Studio",
    shortLabel: "Slides",
    description: "Instant pitch deck generation & slide designer",
    route: "/presentation-studio",
    icon: Presentation,
    color: "from-orange-500 to-pink-500",
    seqKey: "p",
  },
  {
    id: "gallery",
    name: "My Stuff Vault",
    shortLabel: "My Stuff",
    description: "Saved presentations, videos, apps, and artwork",
    route: "/my-stuff",
    icon: FolderOpen,
    color: "from-pink-500 to-rose-500",
    seqKey: "g",
  },
  {
    id: "connectors",
    name: "Connectors & Apps",
    shortLabel: "Connectors",
    description: "Workspace integration hub & API connectors",
    route: "/connected-apps",
    icon: Boxes,
    color: "from-cyan-500 to-teal-500",
  },
];

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  shortcut: string;
  icon: React.ElementType;
  action: () => void;
}

/**
 * Global Keyboard Shortcuts Hook
 */
export function useGlobalKeyboardShortcuts({
  onOpenSearch,
  onOpenShortcuts,
  onNewChat,
  onFocusInput,
}: {
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  onNewChat?: () => void;
  onFocusInput?: () => void;
} = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, isSidebarOpen, setSidebarOpen, setCurrentConversationId } = useAppStore();

  const [sequencePending, setSequencePending] = useState<string | null>(null);

  useEffect(() => {
    let sequenceTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInputFocused =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.tagName === "SELECT" ||
        activeEl?.isContentEditable ||
        Boolean(activeEl?.closest(".monaco-editor"));

      const isModifierActive = e.metaKey || e.ctrlKey;

      // 1. GLOBAL COMMAND PALETTE: Ctrl/Cmd + K
      if (isModifierActive && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // 2. TOGGLE SIDEBAR DRAWER: Ctrl/Cmd + B
      if (isModifierActive && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
        toast({
          title: !isSidebarOpen ? "Navigation Drawer Opened" : "Navigation Drawer Closed",
          description: `${modKey}+B pressed`,
          duration: 1500,
        });
        return;
      }

      // 3. START NEW CHAT: Ctrl/Cmd + N
      if (isModifierActive && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (onNewChat) {
          onNewChat();
        } else {
          setCurrentConversationId(null);
          navigate("/chat");
        }
        toast({
          title: "New Chat Started",
          description: `${modKey}+N pressed`,
          duration: 1500,
        });
        return;
      }

      // 4. TOGGLE THEME: Ctrl/Cmd + Shift + T
      if (isModifierActive && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        toast({
          title: `Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`,
          description: `${modKey}+Shift+T pressed`,
          duration: 1500,
        });
        return;
      }

      // 5. OPEN GLOBAL SETTINGS: Ctrl/Cmd + ,
      if (isModifierActive && e.key === ",") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("knowdeep_open_settings"));
        return;
      }

      // 6. SHORTCUTS CHEATSHEET: Ctrl/Cmd + / or ?
      if (isModifierActive && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        onOpenShortcuts?.();
        return;
      }

      // 7. TOOL SWITCHING: Ctrl/Cmd + 0..9 or Alt + 0..9
      if ((isModifierActive || e.altKey) && !e.shiftKey && e.key >= "0" && e.key <= "9") {
        const num = e.key;
        const matchedTool = WORKSPACE_TOOLS.find((t) => t.numKey === num);
        if (matchedTool) {
          e.preventDefault();
          navigate(matchedTool.route);
          toast({
            title: `Switched to ${matchedTool.name}`,
            description: `${isModifierActive ? modKey : altKey}+${num}`,
            duration: 1500,
          });
          return;
        }
      }

      // 8. ESCAPE: Dismissals & Unfocus
      if (e.key === "Escape") {
        if (isInputFocused) {
          activeEl?.blur();
          return;
        }
        if (isSidebarOpen) {
          setSidebarOpen(false);
          return;
        }
      }

      // SHORTCUTS BELOW ONLY WORK WHEN USER IS NOT TYPING IN AN INPUT
      if (isInputFocused) {
        return;
      }

      // Open Search with '/' when not typing
      if (e.key === "/" && !e.shiftKey) {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Open Shortcuts Help with '?' (Shift + /)
      if (e.key === "?") {
        e.preventDefault();
        onOpenShortcuts?.();
        return;
      }

      // Sequential "Go To..." (e.g. 'g' then 'c' for chat, 'g' then 'i' for image gen)
      if (e.key.toLowerCase() === "g" && !sequencePending) {
        setSequencePending("g");
        if (sequenceTimer) clearTimeout(sequenceTimer);
        sequenceTimer = setTimeout(() => {
          setSequencePending(null);
        }, 1500);
        return;
      }

      if (sequencePending === "g") {
        const key = e.key.toLowerCase();
        setSequencePending(null);
        if (sequenceTimer) clearTimeout(sequenceTimer);

        const targetTool = WORKSPACE_TOOLS.find((t) => t.seqKey === key);
        if (targetTool) {
          e.preventDefault();
          navigate(targetTool.route);
          toast({
            title: `Navigated to ${targetTool.name}`,
            description: `Key sequence: g + ${key}`,
            duration: 1500,
          });
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimer) clearTimeout(sequenceTimer);
    };
  }, [
    navigate,
    location,
    toast,
    theme,
    setTheme,
    toggleSidebar,
    isSidebarOpen,
    setSidebarOpen,
    setCurrentConversationId,
    onOpenSearch,
    onOpenShortcuts,
    onNewChat,
    sequencePending,
  ]);
}

/**
 * Global Command Palette / Search Bar Modal
 */
export function GlobalCommandPalette({
  isOpen,
  onClose,
  onOpenShortcuts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, setCurrentConversationId, conversations } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<"all" | "tools" | "actions" | "chats">("all");

  const quickActions: QuickActionItem[] = useMemo(
    () => [
      {
        id: "new-chat",
        title: "Start New Chat",
        description: "Initialize a fresh AI conversational workspace",
        shortcut: `${modKey}+N`,
        icon: Plus,
        action: () => {
          setCurrentConversationId(null);
          navigate("/chat");
          toast({ title: "New Chat Initialized", description: "Ready for your prompt" });
        },
      },
      {
        id: "toggle-drawer",
        title: "Toggle Navigation Drawer",
        description: "Show or hide the slide-out navigation sidebar",
        shortcut: `${modKey}+B`,
        icon: SlidersHorizontal,
        action: () => {
          toggleSidebar();
        },
      },
      {
        id: "toggle-theme",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        description: "Toggle high-contrast workspace theme appearance",
        shortcut: `${modKey}+⇧+T`,
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          const next = theme === "dark" ? "light" : "dark";
          setTheme(next);
          toast({ title: `Theme set to ${next} mode` });
        },
      },
      {
        id: "open-settings",
        title: "Workspace Preferences & Settings",
        description: "Manage default models, languages, and custom shortcuts",
        shortcut: `${modKey}+,`,
        icon: SettingsIcon,
        action: () => {
          window.dispatchEvent(new CustomEvent("knowdeep_open_settings"));
        },
      },
      {
        id: "view-shortcuts",
        title: "View All Keyboard Shortcuts",
        description: "Open the complete hotkeys and keyboard cheatsheet in Settings",
        shortcut: "?",
        icon: Keyboard,
        action: () => {
          window.dispatchEvent(new CustomEvent("knowdeep_open_settings", { detail: { tab: "shortcuts" } }));
        },
      },
    ],
    [navigate, setCurrentConversationId, setTheme, theme, toast, toggleSidebar]
  );

  const handleSelectTool = (route: string, name: string) => {
    onClose();
    navigate(route);
  };

  const handleSelectAction = (action: () => void) => {
    onClose();
    action();
  };

  const handleSelectChat = (convId: string) => {
    onClose();
    setCurrentConversationId(convId);
    navigate(`/chat?id=${convId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Tools & Commands</DialogTitle>
          <DialogDescription>Quickly switch tools or run workspace actions</DialogDescription>
        </DialogHeader>

        <Command className="rounded-2xl border-none">
          <div className="flex items-center px-4 pt-3.5 pb-2 border-b border-border/60 gap-2">
            <Search className="w-5 h-5 text-cyan-500 shrink-0" />
            <CommandInput
              placeholder="Search tools, actions, or chats... (e.g. 'code', 'theme', 'image')"
              className="border-none focus:ring-0 text-sm py-1 h-10 w-full placeholder:text-muted-foreground/70"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/80 rounded-md">
              ESC
            </kbd>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/40 bg-muted/20 text-xs overflow-x-auto">
            {(
              [
                { id: "all", label: "All Results" },
                { id: "tools", label: "Tools & Studios" },
                { id: "actions", label: "Quick Actions" },
                { id: "chats", label: "Recent Chats" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterCategory === tab.id
                    ? "bg-cyan-500 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <CommandList className="max-h-[360px] p-2 overflow-y-auto">
            <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
              No matching tools, actions, or conversations found.
            </CommandEmpty>

            {/* QUICK ACTIONS GROUP */}
            {(filterCategory === "all" || filterCategory === "actions") && (
              <CommandGroup heading="Quick Actions" className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <CommandItem
                      key={action.id}
                      onSelect={() => handleSelectAction(action.action)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted/70 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground group-hover:text-cyan-500 transition-colors">
                            {action.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {action.description}
                          </span>
                        </div>
                      </div>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/80 rounded-md shrink-0 ml-2">
                        {action.shortcut}
                      </kbd>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {(filterCategory === "all" || filterCategory === "tools") && (
              <>
                <CommandSeparator className="my-2" />
                <CommandGroup heading="Workspace Tools" className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-1">
                  {WORKSPACE_TOOLS.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <CommandItem
                        key={tool.id}
                        onSelect={() => handleSelectTool(tool.route, tool.name)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                            <ToolIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground group-hover:text-cyan-500 transition-colors">
                                {tool.name}
                              </span>
                              {tool.shortLabel && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  • {tool.shortLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {tool.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {tool.numKey && (
                            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/80 rounded-md">
                              {modKey}+{tool.numKey}
                            </kbd>
                          )}
                          {tool.seqKey && (
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70 bg-muted/50 border border-border/50 rounded">
                              g {tool.seqKey}
                            </kbd>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {/* RECENT CHATS GROUP */}
            {(filterCategory === "all" || filterCategory === "chats") && conversations.length > 0 && (
              <>
                <CommandSeparator className="my-2" />
                <CommandGroup heading="Recent Conversations" className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-1">
                  {conversations.slice(0, 8).map((conv) => (
                    <CommandItem
                      key={conv.id}
                      onSelect={() => handleSelectChat(conv.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-muted/70 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="text-xs text-foreground truncate group-hover:text-cyan-500 transition-colors">
                          {conv.title || "Chat session"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : "Recent"}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* Palette Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↵</kbd>
                <span>Select</span>
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">Esc</kbd>
                <span>Close</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className="flex items-center gap-1 text-cyan-500 hover:text-cyan-600 font-medium hover:underline cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Full Shortcuts Guide</span>
            </button>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Interactive Keyboard Shortcuts Cheatsheet View:
 * Used directly inside Workspace Settings tab, Settings page, or dialogs.
 */
export function KeyboardShortcutsCheatsheetView({ className }: { className?: string }) {
  const [filter, setFilter] = useState("");

  const shortcutSections = [
    {
      title: "🚀 Essential Quick Actions",
      items: [
        { label: "Open Search & Command Palette", keys: [modKey, "K"], note: "Or press '/' when not typing" },
        { label: "Toggle Navigation Drawer / Sidebar", keys: [modKey, "B"], note: "Quick access to history & links" },
        { label: "Start New Chat Conversation", keys: [modKey, "N"], note: "Clears current chat & opens editor" },
        { label: "Toggle Dark / Light Theme", keys: [modKey, "Shift", "T"], note: "Instant appearance toggle" },
        { label: "Open Global Settings", keys: [modKey, ","], note: "Configure models, voice & keys" },
        { label: "Return to Workspace Overview", keys: [modKey, "0"], note: "Jump to home dashboard" },
        { label: "Dismiss Dialog / Unfocus Input", keys: ["Esc"], note: "Clears active focus or closes modal" },
        { label: "Open Shortcuts in Settings", keys: ["?"], note: "Or press " + modKey + " + /" },
      ],
    },
    {
      title: "🛠️ Direct Tool Switchers (Hold " + modKey + " + Number)",
      items: [
        { label: "1. AI Chat Workspace", keys: [modKey, "1"], note: "Conversational intelligence" },
        { label: "2. Web Search Engine", keys: [modKey, "2"], note: "Live web research engine" },
        { label: "3. Document Studio", keys: [modKey, "3"], note: "PDF analysis & doc synthesis" },
        { label: "4. Image Generator", keys: [modKey, "4"], note: "High-res prompt studio" },
        { label: "5. Image Enhancer", keys: [modKey, "5"], note: "4K upscale & photo filter" },
        { label: "6. Image Summarizer", keys: [modKey, "6"], note: "OCR & Circle-to-Search" },
        { label: "7. Code Studio", keys: [modKey, "7"], note: "Execution sandbox & debugging" },
        { label: "8. Translate Studio", keys: [modKey, "8"], note: "Multi-language translations" },
        { label: "9. Homework Assistant", keys: [modKey, "9"], note: "Academic solver" },
      ],
    },
    {
      title: "🧭 Sequential 'Go To' Navigation (Press 'G' then Letter)",
      items: [
        { label: "Go to AI Chat", keys: ["G", "then", "C"] },
        { label: "Go to Web Search", keys: ["G", "then", "S"] },
        { label: "Go to Document Studio", keys: ["G", "then", "D"] },
        { label: "Go to Image Generator", keys: ["G", "then", "I"] },
        { label: "Go to Image Enhancer", keys: ["G", "then", "E"] },
        { label: "Go to Code Studio", keys: ["G", "then", "K"] },
        { label: "Go to Translate Studio", keys: ["G", "then", "T"] },
        { label: "Go to Workspace Home", keys: ["G", "then", "H"] },
        { label: "Go to News Engine", keys: ["G", "then", "N"] },
        { label: "Go to Weather Station", keys: ["G", "then", "W"] },
        { label: "Go to Presentations", keys: ["G", "then", "P"] },
        { label: "Go to Video Studio", keys: ["G", "then", "V"] },
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!filter.trim()) return shortcutSections;
    const q = filter.toLowerCase();
    return shortcutSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.keys.join(" ").toLowerCase().includes(q) ||
            (item.note && item.note.toLowerCase().includes(q))
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [filter]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-cyan-500" />
            <span>Keyboard Shortcuts Cheatsheet</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full keybindings reference to navigate Know Deep with zero mouse friction
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground self-start sm:self-auto">
          {isMac ? "macOS (⌘ Command)" : "Windows / Linux (Ctrl)"}
        </span>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter shortcuts (e.g. 'chat', 'sidebar', 'g')..."
          className="w-full pl-8 pr-3 py-2 bg-muted/30 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
        {filteredSections.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No shortcuts found matching &quot;{filter}&quot;.
          </div>
        ) : (
          filteredSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-bold text-foreground/80 tracking-wide">
                {sec.title}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/40 transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="text-[11px] text-muted-foreground">
                          {item.note}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {k === "then" ? (
                            <span className="text-[10px] text-muted-foreground px-0.5 font-medium">then</span>
                          ) : (
                            <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background text-foreground border border-border/80 rounded-lg shadow-2xs min-w-[24px] text-center">
                              {k}
                            </kbd>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Keyboard Shortcuts Cheatsheet Modal (Kept for fallback dialogs)
 */
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[85vh] p-6 flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Keyboard Shortcuts Cheatsheet</DialogTitle>
          <DialogDescription>Quickly review all keyboard navigation shortcuts</DialogDescription>
        </DialogHeader>

        <KeyboardShortcutsCheatsheetView />

        <div className="pt-3 border-t border-border/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Global Keyboard Manager Component:
 * Mounts in App.tsx inside router & providers.
 * Listens for events and coordinates command palette and settings shortcut views.
 */
export function GlobalKeyboardManager() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);

  // Hook activation
  useGlobalKeyboardShortcuts({
    onOpenSearch: () => setIsSearchOpen((prev) => !prev),
    onOpenShortcuts: () => setIsShortcutsDialogOpen(true),
  });

  // Listen to custom window events from buttons across the app
  useEffect(() => {
    const handleOpenSearchEvent = () => setIsSearchOpen(true);
    const handleOpenShortcutsEvent = () => setIsShortcutsDialogOpen(true);

    window.addEventListener("knowdeep_open_search", handleOpenSearchEvent);
    window.addEventListener("knowdeep_open_shortcuts", handleOpenShortcutsEvent);
    window.addEventListener("knowdeep_open_shortcuts_dialog", handleOpenShortcutsEvent);

    return () => {
      window.removeEventListener("knowdeep_open_search", handleOpenSearchEvent);
      window.removeEventListener("knowdeep_open_shortcuts", handleOpenShortcutsEvent);
      window.removeEventListener("knowdeep_open_shortcuts_dialog", handleOpenShortcutsEvent);
    };
  }, []);

  return (
    <>
      <GlobalCommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenShortcuts={() => {
          setIsSearchOpen(false);
          setIsShortcutsDialogOpen(true);
        }}
      />
      <KeyboardShortcutsHelpDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
      />
    </>
  );
}

/**
 * Backwards compatibility hook for existing pages like Chat.tsx
 */
export function useKeyboardShortcuts({
  onNewChat,
  onToggleSidebar,
  onFocusInput,
}: {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
} = {}) {
  useGlobalKeyboardShortcuts({
    onNewChat,
    onFocusInput,
  });
}

/**
 * Backwards compatibility inline component
 */
export function KeyboardShortcutsHelp() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("knowdeep_open_shortcuts"))}
          className="text-xs text-cyan-500 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Search & Quick Actions", keys: [modKey, "K"] },
          { label: "Toggle Navigation Drawer", keys: [modKey, "B"] },
          { label: "New Chat Conversation", keys: [modKey, "N"] },
          { label: "Switch to Tool 1-9", keys: [modKey, "1..9"] },
          { label: "Shortcuts Cheatsheet", keys: ["?"] },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1">
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-1">
              {item.keys.map((k, kIdx) => (
                <kbd key={kIdx} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
