import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Zap,
  GraduationCap,
  Crown,
  FolderOpen,
  Code2,
  Layers,
  User,
  ExternalLink,
  Calculator,
  Calendar,
  StickyNote,
  Brain,
  Presentation,
  Sparkles,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicyLinks } from "./PolicyLinks";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Zap, label: "My Activity", href: "/dashboard" },
  { icon: GraduationCap, label: "Academic Assistant", href: "/learning-hub" },
  { icon: FolderOpen, label: "My Stuff", href: "/my-stuff" },
  { icon: Layers, label: "My Generated Apps", href: "/my-apps" },
  { icon: User, label: "Profile", href: "/settings" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Crown, label: "Pricing", href: "/pricing" },
  { icon: ExternalLink, label: "Connectors & APIs", href: "/connected-apps" },
];

const knowDeepSuiteItems = [
  { icon: Code2, label: "Know Deep's Coding Assistant", href: "/code-studio", color: "text-cyan-500" },
  { icon: Calculator, label: "Smart Calculator & Tutor", href: "/learning-hub", color: "text-blue-500" },
  { icon: Calendar, label: "Smart Calendar & Activity", href: "/dashboard", color: "text-emerald-500" },
  { icon: StickyNote, label: "Smart Notes & Studio", href: "/document-studio", color: "text-amber-500" },
  { icon: Brain, label: "Concept Trainer & X-Ray", href: "/concept-xray", color: "text-purple-500" },
  { icon: Presentation, label: "Smart Whiteboard & Slides", href: "/presentation-studio", color: "text-rose-500" },
];


export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="font-bold text-lg gradient-text">Navigation</span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1 mb-6">
                {sidebarItems.map((item) => {
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                        isActive
                          ? "bg-primary/20 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Know-Deep Suite */}
              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 px-3 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Useful apps
                  </span>
                </div>

                <div className="space-y-1">
                  {knowDeepSuiteItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                          isActive
                            ? "bg-primary/20 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", item.color)} />
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <PolicyLinks className="text-center" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
