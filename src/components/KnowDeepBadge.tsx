import React from "react";
import { KNOWDEEP_LOGO_URL, KNOWDEEP_BRAND_NAME } from "@/lib/branding";
import { Sparkles } from "lucide-react";

interface KnowDeepBadgeProps {
  assistantName: string;
  studioBadge?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showAura?: boolean;
}

export const KnowDeepBadge: React.FC<KnowDeepBadgeProps> = ({
  assistantName,
  studioBadge = "Official Studio AI",
  size = "md",
  className = "",
  showAura = false,
}) => {
  const logoDimensions =
    size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const titleSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0">
        {showAura && (
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 blur-xs opacity-70 animate-pulse" />
        )}
        <div
          className={`${logoDimensions} rounded-xl overflow-hidden shadow-sm border border-cyan-500/40 ring-1 ring-cyan-500/20 bg-slate-950 flex items-center justify-center shrink-0`}
        >
          <img
            src={KNOWDEEP_LOGO_URL}
            alt={KNOWDEEP_BRAND_NAME}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black tracking-tight text-foreground ${titleSize}`}>
            {assistantName}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-wider border border-cyan-500/20 shrink-0">
            {studioBadge}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          {KNOWDEEP_BRAND_NAME}
        </span>
      </div>
    </div>
  );
};
