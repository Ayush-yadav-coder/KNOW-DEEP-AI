import React, { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  Shield,
  KeyRound,
  Check,
  Search,
  Keyboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { UnifiedSidebarDrawer, PLATFORM_15_FEATURES } from "./UnifiedSidebarDrawer";
import { MobileBottomNav } from "./MobileBottomNav";
import { GlobalSettingsModal } from "./GlobalSettingsModal";
import { PolicyLinks } from "./PolicyLinks";
import { ProfileOnboardingModal } from "./ProfileOnboardingModal";
import { BeginnerTutorialModal } from "./BeginnerTutorialModal";
import { modKey } from "./KeyboardShortcuts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toggleSidebar, conversations, currentConversationId } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<any>("general");
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const isInChat = location.pathname === "/chat";
  const activeChat = conversations.find((c) => c.id === currentConversationId);

  useEffect(() => {
    const handleOpenSettings = (e: any) => {
      if (e?.detail?.tab) {
        setSettingsDefaultTab(e.detail.tab);
      }
      setIsSettingsOpen(true);
    };

    window.addEventListener("knowdeep_open_settings", handleOpenSettings as EventListener);

    return () => {
      window.removeEventListener("knowdeep_open_settings", handleOpenSettings as EventListener);
    };
  }, []);

  useEffect(() => {
    // Check if new account for the first time
    if (user?.id) {
      try {
        const tutorialKey = `tutorial_shown_${user.id}`;
        const hasShown = localStorage.getItem(tutorialKey);
        if (!hasShown) {
          const timer = setTimeout(() => {
            setIsTutorialOpen(true);
          }, 800);
          return () => {
            clearTimeout(timer);
          };
        }
      } catch (e) {
        console.warn("Could not check account tutorial status:", e);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Unified Slide-Out Sidebar Drawer */}
      <UnifiedSidebarDrawer onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Beginner-Friendly Step-by-Step Interactive Tutorial */}
      <BeginnerTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Top Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-3 sm:px-5 h-14">
          <div className="flex items-center gap-3">
            {/* Triple-Line Hamburger Icon */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative group"
              aria-label="Toggle Navigation Drawer"
              title={`Toggle Navigation Drawer (${modKey}+B)`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm border border-cyan-500/30 ring-1 ring-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                <img src={LOGO_URL} alt="Know Deep" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">
                  Know Deep
                </span>
              </div>
            </Link>
          </div>

          {/* Center: In Chat, show ONLY the chat name and everything like old; outside chat, show full action search */}
          {isInChat ? (
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 max-w-xs lg:max-w-md truncate pointer-events-none">
              <span className="text-xs sm:text-sm font-semibold text-foreground/90 truncate">
                {activeChat ? activeChat.title : "AI Chat"}
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center flex-1 max-w-sm mx-4">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("knowdeep_open_search"))}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50 text-xs transition-all shadow-2xs hover:border-cyan-500/40 cursor-pointer group"
                title={`Open Search & Command Palette (${modKey}+K)`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 text-cyan-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Search tools, actions & chats...</span>
                </div>
                <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-background/90 border border-border/80 rounded text-muted-foreground shadow-2xs shrink-0">
                  {modKey}K
                </kbd>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile/Tablet Search Button (Only outside chat) */}
            {!isInChat && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("knowdeep_open_search"))}
                className="md:hidden w-8 h-8 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title={`Search & Quick Actions (${modKey}+K)`}
                aria-label="Open Search Palette"
              >
                <Search className="w-4 h-4 text-cyan-500" />
              </button>
            )}

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("knowdeep_open_shortcuts_dialog"))}
              className="w-8 h-8 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={`Keyboard Shortcuts (${modKey}+/)`}
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={`Global Settings (${modKey}+,)`}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm hover:ring-2 hover:ring-cyan-500/40 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus:outline-none"
                    title={user.email || "User Profile"}
                  >
                    <Avatar className="h-full w-full rounded-xl">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                        alt={user.user_metadata?.display_name || "User profile picture"}
                      />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase flex items-center justify-center h-full w-full">
                        {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-xl">
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold leading-none text-white truncate">
                        {user.user_metadata?.display_name || "Active User"}
                      </p>
                      <p className="text-[11px] leading-none text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                        <Shield className="w-3 h-3" />
                        <span>PBKDF2 Secured</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer text-xs flex items-center gap-2 hover:bg-slate-800 focus:bg-slate-800 rounded-lg py-2 text-slate-200 hover:text-white"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Profile & Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsSettingsOpen(true)}
                    className="cursor-pointer text-xs flex items-center gap-2 hover:bg-slate-800 focus:bg-slate-800 rounded-lg py-2 text-slate-200 hover:text-white"
                  >
                    <SettingsIcon className="w-4 h-4 text-violet-400" />
                    <span>Workspace Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings?tab=security")}
                    className="cursor-pointer text-xs flex items-center gap-2 hover:bg-slate-800 focus:bg-slate-800 rounded-lg py-2 text-slate-200 hover:text-white"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Security & Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="cursor-pointer text-xs flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10 rounded-lg py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-muted/70 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace View (Expands to 100% width when drawer is closed) */}
      <main className="flex-1 pt-14 pb-24 w-full flex flex-col min-h-screen">
        {children}
      </main>

      {/* Universal Paginated Bottom Navigation Bar (Features 1-15 in 3 pages) */}
      <MobileBottomNav />

      {/* Profile Onboarding for first-time login */}
      <ProfileOnboardingModal />

      {/* Global Workspace Settings Modal (contains Cheatsheet, General, Bottom Nav, Appearance, etc.) */}
      <GlobalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsDefaultTab}
      />
    </div>
  );
}
