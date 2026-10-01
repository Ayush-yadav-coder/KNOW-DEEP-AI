import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VoiceWaveformBarProps {
  isListening: boolean;
  transcript?: string;
  onStop: () => void;
  onSend?: () => void;
}

export const VoiceWaveformBar: React.FC<VoiceWaveformBarProps> = ({
  isListening,
  transcript,
  onStop,
}) => {
  const BAR_COUNT = 46;
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 4)
  );

  useEffect(() => {
    if (!isListening) return;

    // Animate equalizer heights to simulate audio wave movements matching the exact heartbeat frequency lines
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map((_, i) => {
          // Center region gets higher amplitude
          const distFromCenter = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          const centerWeight = Math.max(0.15, 1 - distFromCenter * 0.85);
          
          // Dynamic wave oscillation
          const time = Date.now() / 120;
          const wave1 = Math.sin(time + i * 0.35);
          const wave2 = Math.cos(time * 0.8 + i * 0.2);
          const combined = (wave1 + wave2 + 2) / 4; // Normalized 0 to 1
          
          const height = Math.floor(4 + combined * 26 * centerWeight);
          return height;
        })
      );
    }, 70);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="w-full flex items-center justify-between gap-3 px-1 py-1 select-none min-h-[48px]">
      {/* Equalizer vertical bars stretching across the text area line */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
        {/* Live status badge + live transcript string */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
          <span className="text-rose-500 font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Listening...
          </span>
          {transcript && (
            <span className="truncate max-w-[280px] text-[11px] text-foreground/80 italic font-mono">
              "{transcript}"
            </span>
          )}
        </div>

        {/* Dynamic Waveform Line (Thin vertical bar lines pulsing up and down) */}
        <div className="w-full flex items-center justify-center gap-[2.5px] sm:gap-[3.5px] h-8 py-1 px-3 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden">
          {barHeights.map((h, idx) => (
            <motion.div
              key={idx}
              animate={{ height: `${h}px` }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="w-[2px] sm:w-[2.5px] rounded-full bg-slate-700 dark:bg-slate-200 transition-colors shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Black Stop Button Circle matching user's image */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onStop}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/40 border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center text-slate-900 dark:text-white transition-all shadow-md active:scale-95"
          title="Stop Listening"
        >
          <div className="w-3.5 h-3.5 bg-slate-900 dark:bg-slate-100 rounded-xs" />
        </button>
      </div>
    </div>
  );
};
