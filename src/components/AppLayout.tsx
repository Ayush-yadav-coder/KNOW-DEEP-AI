import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  User,
  Settings as SettingsIcon,
  Sparkles,
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

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { toggleSidebar } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener("knowdeep_open_settings", handleOpenSettings);
    return () => window.removeEventListener("knowdeep_open_settings", handleOpenSettings);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Unified Slide-Out Sidebar Drawer */}
      <UnifiedSidebarDrawer onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Global Settings Modal */}
      <GlobalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Top Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-3 sm:px-5 h-14">
          <div className="flex items-center gap-3">
            {/* Triple-Line Hamburger Icon */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle Navigation Drawer"
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
                <span className="text-[9px] text-muted-foreground hidden sm:block -mt-1 font-medium">
                  Autonomous Studio
                </span>
              </div>
            </Link>
          </div>

          {title && location.pathname !== "/chat" && location.pathname !== "/app" && (
            <h1 className="text-xs sm:text-sm font-semibold text-foreground absolute left-1/2 -translate-x-1/2 hidden md:block truncate max-w-xs">
              {title}
            </h1>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-xl hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Global Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {user ? (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm"
                title="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              >
                Sign In
              </Link>
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
    </div>
  );
}
