import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
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
} from "lucide-react";
import { PolicyLinks } from "./PolicyLinks";
export { PLATFORM_15_FEATURES, type FeatureDirectoryItem } from "@/lib/features";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

interface UnifiedSidebarDrawerProps {
  onOpenSettings?: () => void;
}

export const UnifiedSidebarDrawer: React.FC<UnifiedSidebarDrawerProps> = ({ onOpenSettings }) => {
  const {
    user,
    isGuest,
    resetStore,
    isSidebarOpen,
    setSidebarOpen,
    conversations,
    removeConversation,
    addConversation,
    setCurrentConversationId,
  } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, setSidebarOpen]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Group chat conversations by Today, Yesterday, Previous 7 Days, Older
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: {
      today: typeof filteredConversations;
      yesterday: typeof filteredConversations;
      previous7Days: typeof filteredConversations;
      older: typeof filteredConversations;
    } = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    filteredConversations.forEach((conv) => {
      const convTime = new Date(conv.created_at || Date.now()).getTime();
      if (convTime >= today) {
        groups.today.push(conv);
      } else if (convTime >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups.previous7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    const newConv = {
      id: newId,
      title: "New Conversation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addConversation(newConv);
    setCurrentConversationId(newId);
    setSidebarOpen(false);
    navigate(`/chat?id=${newId}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Smooth Off-Canvas Slide-Out Drawer (Single Collapsible Drawer) */}
          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl"
          >
            {/* 1. TOP HEADER ("Know Deep AI" logo + New Chat button) */}
            <div className="p-4 border-b border-slate-800 flex flex-col gap-3">
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
                    <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      Know Deep AI
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </span>
                    <p className="text-[10px] text-slate-400">Conversations & History</p>
                  </div>
                </Link>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>

              {/* Filter Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* 2. CHAT HISTORY THREADS (Chronologically grouped) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 stroke-1" />
                  <p className="text-xs">
                    {searchQuery ? "No matching conversations" : "No conversation threads yet."}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Click &quot;New Chat&quot; above to start dialogue.
                  </p>
                </div>
              ) : (
                <>
                  {/* Today */}
                  {groupedConversations.today.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Today</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupedConversations.today.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCurrentConversationId(c.id);
                              setSidebarOpen(false);
                              navigate(`/chat?id=${c.id}`);
                            }}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate">{c.title || "Chat session"}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeConversation(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday */}
                  {groupedConversations.yesterday.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>Yesterday</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupedConversations.yesterday.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCurrentConversationId(c.id);
                              setSidebarOpen(false);
                              navigate(`/chat?id=${c.id}`);
                            }}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{c.title || "Chat session"}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeConversation(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous 7 Days */}
                  {groupedConversations.previous7Days.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Previous 7 Days</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupedConversations.previous7Days.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCurrentConversationId(c.id);
                              setSidebarOpen(false);
                              navigate(`/chat?id=${c.id}`);
                            }}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{c.title || "Chat session"}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeConversation(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Older */}
                  {groupedConversations.older.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Older</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupedConversations.older.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCurrentConversationId(c.id);
                              setSidebarOpen(false);
                              navigate(`/chat?id=${c.id}`);
                            }}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{c.title || "Chat session"}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeConversation(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3. BOTTOM FOOTER (Settings & Logout action) */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex flex-col gap-2">
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
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                  title={user ? `Signed in as ${user.email}` : "Exit guest exploration"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{user ? "Sign Out" : "Exit Guest"}</span>
                </button>
              </div>

              <div className="pt-1">
                <PolicyLinks className="text-[10px] text-slate-500 justify-center" />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

