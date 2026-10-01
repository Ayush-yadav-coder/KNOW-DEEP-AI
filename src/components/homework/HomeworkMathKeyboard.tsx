import React from "react";
import { Calculator } from "lucide-react";

interface HomeworkMathKeyboardProps {
  onInsertSymbol: (symbol: string) => void;
}

const MATH_SYMBOLS = [
  { label: "x²", symbol: "²" },
  { label: "xⁿ", symbol: "^" },
  { label: "√x", symbol: "√(" },
  { label: "a/b", symbol: " ÷ " },
  { label: "π", symbol: "π" },
  { label: "θ", symbol: "θ" },
  { label: "±", symbol: "±" },
  { label: "≠", symbol: "≠" },
  { label: "≤", symbol: "≤" },
  { label: "≥", symbol: "≥" },
  { label: "∞", symbol: "∞" },
  { label: "∫", symbol: "∫ " },
  { label: "d/dx", symbol: "d/dx(" },
  { label: "∑", symbol: "∑ " },
  { label: "log", symbol: "log(" },
  { label: "ln", symbol: "ln(" },
  { label: "sin", symbol: "sin(" },
  { label: "cos", symbol: "cos(" },
  { label: "tan", symbol: "tan(" },
  { label: "( )", symbol: "()" },
];

export const HomeworkMathKeyboard: React.FC<HomeworkMathKeyboardProps> = ({
  onInsertSymbol,
}) => {
  return (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
          <Calculator className="w-3 h-3" /> Quick Math &amp; Equation Symbols
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Tap to insert
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {MATH_SYMBOLS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onInsertSymbol(item.symbol)}
            className="h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-200 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center active:scale-95 shadow-sm"
            title={`Insert ${item.label}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
