import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type ChatConversation } from "@/store/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  X,
  Trash2,
  Calendar,
  Search,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Pin,
  ImageIcon,
  FolderOpen,
  Boxes,
  MoreVertical,
  Edit2,
  Check,
  User,
  Shield,
} from "lucide-react";
import { PolicyLinks } from "./PolicyLinks";
import { modKey } from "./KeyboardShortcuts";
export { PLATFORM_15_FEATURES, type FeatureDirectoryItem } from "@/lib/features";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

interface UnifiedSidebarDrawerProps {
  onOpenSettings?: () => void;
}

export const UnifiedSidebarDrawer: React.FC<UnifiedSidebarDrawerProps> = ({ onOpenSettings }) => {
  const { signOut } = useAuth();
  const {
    user,
    isGuest,
    resetStore,
    isSidebarOpen,
    setSidebarOpen,
    conversations,
    removeConversation,
    addConversation,
    updateConversation,
    pinConversation,
    fetchConversations,
    currentConversationId,
    setCurrentConversationId,
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const urlConvId = location.pathname === "/chat" ? new URLSearchParams(location.search).get("id") : null;
  const activeConvId = currentConversationId || urlConvId;

  // Long-press & contextual actions state
  const [activeActionConv, setActiveActionConv] = useState<ChatConversation | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState("");
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Fetch conversations when drawer opens
  useEffect(() => {
    if (isSidebarOpen) {
      fetchConversations();
    }
  }, [isSidebarOpen, fetchConversations]);

  // Initial fetch on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeActionConv) {
          setActiveActionConv(null);
          setIsRenaming(false);
        } else if (isSidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, setSidebarOpen, activeActionConv]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Sort chat conversations by pinned status first, then by date
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [filteredConversations]);

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setSidebarOpen(false);
    navigate("/chat", { replace: true });
  };

  const handleSelectConversation = (convId: string) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setCurrentConversationId(convId);
    setSidebarOpen(false);
    navigate(`/chat?id=${convId}`);
  };

  // Long-press detection helpers
  const handleTouchStart = (conv: ChatConversation) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setActiveActionConv(conv);
      setNewTitleInput(conv.title || "Chat session");
      setIsRenaming(false);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(40); } catch {}
      }
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, conv: ChatConversation) => {
    e.preventDefault();
    setActiveActionConv(conv);
    setNewTitleInput(conv.title || "Chat session");
    setIsRenaming(false);
  };

  // Action handlers
  const handleSaveRename = async () => {
    if (!activeActionConv) return;
    const trimmed = newTitleInput.trim();
    if (!trimmed) return;

    updateConversation(activeActionConv.id, { title: trimmed });

    if (user) {
      try {
        await supabase
          .from("chat_conversations")
          .update({ title: trimmed })
          .eq("id", activeActionConv.id);
      } catch (e) {
        console.warn("Could not rename in Supabase:", e);
      }
    }

    toast({
      title: "Chat Renamed",
      description: `Title updated to "${trimmed}"`,
    });
    setActiveActionConv(null);
    setIsRenaming(false);
  };

  const handleTogglePin = async () => {
    if (!activeActionConv) return;
    const newPinnedState = !activeActionConv.pinned;
    pinConversation(activeActionConv.id, newPinnedState);
    toast({
      title: newPinnedState ? "Chat Pinned" : "Chat Unpinned",
      description: newPinnedState ? "This conversation will stay pinned at the top." : "Conversation unpinned.",
    });
    setActiveActionConv(null);
  };

  const handleDeleteConversation = async () => {
    if (!activeActionConv) return;
    const convId = activeActionConv.id;
    removeConversation(convId);

    if (user) {
      try {
        await supabase.from("chat_conversations").delete().eq("id", convId);
      } catch (e) {
        console.warn("Could not delete from Supabase:", e);
      }
    }

    toast({
      title: "Chat Deleted",
      description: "Conversation thread was removed.",
    });

    if (currentConversationId === convId) {
      setCurrentConversationId(null);
      navigate("/chat");
    }
    setActiveActionConv(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
    resetStore();
    setSidebarOpen(false);
    navigate("/");
    toast({
      title: "Signed Out",
      description: "You have been logged out of your session.",
    });
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Unified Overlay & Semi-Transparent Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setActiveActionConv(null);
              setSidebarOpen(false);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Smooth Off-Canvas Slide-Out Drawer */}
          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col shadow-2xl transition-colors"
          >
            {/* 1. TOP HEADER ("Know Deep AI" logo + New Chat button) */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 group"
                >
                  <img
                    src={LOGO_URL}
                    alt="Know Deep AI"
                    className="w-8 h-8 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      Know Deep AI
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Conversations & History</p>
                  </div>
                </Link>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center justify-center transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-between shadow-md shadow-cyan-500/20 transition-all active:scale-98"
                title={`Start New Chat (${modKey}+N)`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/20 text-white rounded">
                  {modKey}N
                </kbd>
              </button>

              {/* Filter Search Input */}
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-12 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    window.dispatchEvent(new CustomEvent("knowdeep_open_search"));
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors"
                  title={`Open Global Search (${modKey}+K)`}
                >
                  {modKey}K
                </button>
              </div>

              {/* My Stuff Link */}
              <Link
                id="tour-sidebar-my-stuff"
                to="/my-stuff"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors relative"
              >
                <FolderOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-medium">My Stuff</span>
              </Link>

              {/* Connectors Link */}
              <Link
                id="tour-sidebar-connectors"
                to="/connected-apps"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors group relative"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Connectors</span>
                </div>
                <span className="text-[10px] bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/30 px-1.5 py-0.5 rounded-full font-medium">
                  Apps
                </span>
              </Link>
            </div>

            {/* 2. CHAT HISTORY THREADS (With Long-Press & Pin Indicator) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Chats ({sortedConversations.length})
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Hold to manage</span>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-1" />
                  <p className="text-xs font-medium">
                    {searchQuery ? "No matching conversations" : "No conversation threads yet."}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-600">
                    Click &quot;New Chat&quot; above to start dialogue.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedConversations.map((c) => {
                    const isActive = activeConvId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c.id)}
                        onTouchStart={() => handleTouchStart(c)}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchEnd}
                        onMouseDown={() => handleTouchStart(c)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onContextMenu={(e) => handleContextMenu(e, c)}
                        className={`flex items-center justify-between px-2.5 py-2.5 rounded-xl cursor-pointer group transition-all select-none ${
                          isActive
                            ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-950 dark:text-cyan-200 font-semibold border-2 border-cyan-500 shadow-sm ring-1 ring-cyan-500/25"
                            : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                        }`}
                        title="Click to open. Long-press or right-click to rename, pin, or delete."
                      >
                        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
                          )}
                          {c.pinned ? (
                            <Pin className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 fill-amber-500/20" />
                          ) : (
                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-slate-400 dark:text-slate-500 opacity-80"}`} />
                          )}
                          <span className={`truncate text-xs ${isActive ? "font-semibold text-cyan-950 dark:text-cyan-200" : ""}`}>
                            {c.title || "Chat session"}
                          </span>
                        </div>

                        {/* 3-dots action button for quick click access */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionConv(c);
                            setNewTitleInput(c.title || "Chat session");
                            setIsRenaming(false);
                          }}
                          className={`p-1 rounded-lg transition-colors shrink-0 ml-1.5 ${
                            isActive
                              ? "text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200/50 dark:hover:bg-cyan-900/50"
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60 opacity-0 group-hover:opacity-100"
                          }`}
                          title="Chat Options (Rename, Pin, Delete)"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. BOTTOM FOOTER (User card & Auth actions) */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex flex-col gap-2.5">
              {user ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0 shadow-sm">
                    {user.user_metadata?.display_name ? user.user_metadata.display_name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user.user_metadata?.display_name || "Active User"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-emerald-500" title="Secured with PBKDF2">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-1">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate("/login");
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium text-center transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate("/signup");
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold text-center shadow-sm hover:opacity-95 transition-opacity"
                  >
                    Create Account
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    if (onOpenSettings) {
                      onOpenSettings();
                    } else {
                      window.dispatchEvent(new CustomEvent("knowdeep_open_settings"));
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white text-xs font-semibold transition-colors"
                  title={`Global Settings (${modKey}+,)`}
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Settings</span>
                </button>

                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-semibold transition-colors"
                    title={`Signed in as ${user.email}`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>

              <div className="pt-1">
                <PolicyLinks className="text-[10px] text-slate-500 justify-center" />
              </div>
            </div>

            {/* 4. LONG-PRESS / ACTION MODAL DIALOG */}
            <AnimatePresence>
              {activeActionConv && (
                <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-4 text-slate-900 dark:text-white"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-0.5">
                          Manage Chat Thread
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {activeActionConv.title || "Chat session"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveActionConv(null);
                          setIsRenaming(false);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rename Form or Action Buttons */}
                    {isRenaming ? (
                      <div className="space-y-3">
                        <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block">
                          Edit Chat Name:
                        </label>
                        <input
                          type="text"
                          value={newTitleInput}
                          onChange={(e) => setNewTitleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                          }}
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsRenaming(false)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveRename}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save Name
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* 1. Change Name (Rename) */}
                        <button
                          type="button"
                          onClick={() => setIsRenaming(true)}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                          <div className="flex flex-col text-left">
                            <span>Change Name</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Rename this conversation</span>
                          </div>
                        </button>

                        {/* 2. Pin / Unpin */}
                        <button
                          type="button"
                          onClick={handleTogglePin}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                        >
                          <Pin className={`w-4 h-4 ${activeActionConv.pinned ? "text-amber-500 fill-amber-500" : "text-amber-500"}`} />
                          <div className="flex flex-col text-left">
                            <span>{activeActionConv.pinned ? "Unpin Chat" : "Pin Chat to Top"}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {activeActionConv.pinned ? "Remove from top pinned group" : "Keep this chat at the top"}
                            </span>
                          </div>
                        </button>

                        {/* 3. Delete */}
                        <button
                          type="button"
                          onClick={handleDeleteConversation}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          <div className="flex flex-col text-left">
                            <span>Delete Chat</span>
                            <span className="text-[10px] text-rose-500/80 dark:text-rose-400/70">Permanently delete this conversation</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};


