import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrderedFeatures } from "@/lib/features";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomizeNavModal } from "./CustomizeNavModal";

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { preferences } = useAppStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const orderedFeatures = getOrderedFeatures(preferences.customFeatureOrder);

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(orderedFeatures.length / PAGE_SIZE);

  // Auto select active page on mount/route change
  React.useEffect(() => {
    const activeIndex = orderedFeatures.findIndex(
      (f) =>
        f.href === location.pathname ||
        (f.id === "chat" && (location.pathname === "/chat" || location.pathname === "/app"))
    );
    if (activeIndex !== -1) {
      const targetPage = Math.floor(activeIndex / PAGE_SIZE);
      setCurrentPage(targetPage);
    }
  }, [location.pathname, orderedFeatures]);

  const currentFeatures = orderedFeatures.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40 && currentPage < totalPages - 1) {
      // Swipe left -> next page
      setCurrentPage((p) => p + 1);
    } else if (diff < -40 && currentPage > 0) {
      // Swipe right -> prev page
      setCurrentPage((p) => p - 1);
    }
    touchStartX.current = null;
  };

  return (
    <>
      <CustomizeNavModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />

      <nav
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 backdrop-blur-none select-none shadow-2xl transition-all"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between px-2 pt-1 pb-1">
          {/* Prev Page Button */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={cn(
              "p-1.5 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95",
              currentPage === 0 ? "opacity-20 cursor-default" : "hover:text-cyan-500 dark:hover:text-cyan-400"
            )}
            aria-label="Previous tools page (Features 1-5, 6-10, 11-15)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 5-Icon Horizontal Viewport */}
          <div className="flex-1 grid grid-cols-5 gap-1 px-1">
            <AnimatePresence mode="wait">
              {currentFeatures.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.id === "chat" && (location.pathname === "/chat" || location.pathname === "/app"));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex flex-col items-center py-1 group transition-transform"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                        isActive
                          ? `bg-gradient-to-br ${item.color} text-white shadow-md shadow-cyan-500/25 scale-105 ring-1 ring-white/30`
                          : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80"
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <span
                      className={cn(
                        "text-[9px] sm:text-[10px] font-medium mt-0.5 truncate max-w-[62px] text-center transition-colors",
                        isActive
                          ? "text-cyan-600 dark:text-cyan-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                      )}
                    >
                      {item.shortLabel}
                    </span>
                  </Link>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className={cn(
              "p-1.5 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95",
              currentPage === totalPages - 1 ? "opacity-20 cursor-default" : "hover:text-cyan-500 dark:hover:text-cyan-400"
            )}
            aria-label="Next tools page"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Paginated Dot Indicators, Page Title & Customize Shortcut */}
        <div className="flex justify-between items-center px-4 pb-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="text-[9px] font-medium">
            {`Page ${currentPage + 1}: Features ${currentPage * 5 + 1} – ${Math.min((currentPage + 1) * 5, orderedFeatures.length)}`}
          </span>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  idx === currentPage
                    ? "w-4 bg-cyan-500 dark:bg-cyan-400 shadow-sm shadow-cyan-500/50"
                    : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                )}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="flex items-center gap-1 text-[9px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            title="Reorder bottom navigation features"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export const BottomNavBar = MobileBottomNav;
