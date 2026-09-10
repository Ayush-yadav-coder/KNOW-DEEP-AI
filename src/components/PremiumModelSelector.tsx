import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap, Brain, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModelOption {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DEFAULT_MODELS: ModelOption[] = [
  { id: "kd-2-fast", label: "Know Deep 2 Fast", hint: "Quick responses", icon: Zap },
  { id: "kd-2-pro", label: "Know Deep 2 Pro", hint: "Complex questions", icon: Brain },
  { id: "kd-2.5-pro", label: "Know Deep 2.5 Pro Preview", hint: "Reasoning + Code", icon: Cpu },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
  models?: ModelOption[];
}

export function PremiumModelSelector({ value, onChange, models = DEFAULT_MODELS }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = models.find((m) => m.id === value) ?? models[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium",
          "bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-xl",
          "border border-white/10 hover:border-cyan-300/40",
          "text-white/90 shadow-lg shadow-cyan-500/5",
          "transition-all duration-200",
          "relative",
        )}
        style={{
          backgroundImage: open
            ? "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.08))"
            : undefined,
        }}
      >
        <selected.icon className="w-3.5 h-3.5 text-cyan-300" />
        <span className="truncate max-w-[160px]">{selected.label}</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-white/60 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute bottom-full left-0 mb-2 z-50 min-w-[280px]",
              "rounded-2xl p-1.5 shadow-2xl",
              "bg-slate-950/90 backdrop-blur-2xl border border-white/10",
            )}
          >
            <div className="relative flex flex-col gap-0.5">
              {models.map((m) => {
                const active = m.id === value;
                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    whileHover={{ x: 2 }}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                      "hover:bg-white/[0.04]",
                      active && "text-white",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="kd-model-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-cyan-500/10 border border-cyan-300/30"
                      />
                    )}
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10">
                      <m.icon className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/95 truncate">{m.label}</p>
                      <p className="text-[11px] text-white/50">{m.hint}</p>
                    </div>
                    {active && (
                      <span className="relative text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                        Active
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
