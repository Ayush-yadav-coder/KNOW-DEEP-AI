import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { LineChart as ChartIcon, Sparkles, Plus, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESET_FUNCTIONS = [
  { name: "Quadratic (Parabola)", expr: "x^2 - 4" },
  { name: "Sine Wave", expr: "sin(x)" },
  { name: "Cubic Function", expr: "x^3 - 3*x" },
  { name: "Linear Equation", expr: "2*x - 3" },
  { name: "Absolute Value", expr: "abs(x) - 2" },
];

export const HomeworkGraphCalculator: React.FC = () => {
  const [expression, setExpression] = useState("x^2 - 4");
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [evalX, setEvalX] = useState(2);

  // Parse expression cleanly for graphing
  const parseFunction = (exprStr: string) => {
    return (x: number): number => {
      try {
        let formatted = exprStr
          .replace(/sin\((.*?)\)/g, "Math.sin($1)")
          .replace(/cos\((.*?)\)/g, "Math.cos($1)")
          .replace(/tan\((.*?)\)/g, "Math.tan($1)")
          .replace(/abs\((.*?)\)/g, "Math.abs($1)")
          .replace(/sqrt\((.*?)\)/g, "Math.sqrt($1)")
          .replace(/x\^(\d+)/g, "Math.pow(x, $1)")
          .replace(/x\^2/g, "Math.pow(x, 2)")
          .replace(/x\^3/g, "Math.pow(x, 3)")
          .replace(/\^/g, "**");

        // evaluate safely
        // eslint-disable-next-line no-new-func
        const fn = new Function("x", `return ${formatted};`);
        const val = fn(x);
        return isNaN(val) || !isFinite(val) ? 0 : val;
      } catch {
        return 0;
      }
    };
  };

  const chartData = useMemo(() => {
    const fn = parseFunction(expression);
    const step = (xMax - xMin) / 60;
    const points = [];
    for (let x = xMin; x <= xMax; x += step) {
      const roundedX = Math.round(x * 100) / 100;
      const yVal = Math.round(fn(x) * 100) / 100;
      points.push({ x: roundedX, y: yVal });
    }
    return points;
  }, [expression, xMin, xMax]);

  const currentFn = useMemo(() => parseFunction(expression), [expression]);
  const evalY = Math.round(currentFn(evalX) * 1000) / 1000;

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>2D Interactive Graphing Calculator</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono uppercase font-bold">
                Plotter
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualize algebraic curves, roots, and function values in real-time
            </p>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_FUNCTIONS.map((p) => (
            <button
              key={p.name}
              onClick={() => setExpression(p.expr)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-xl border transition-all shrink-0 ${
                expression === p.expr
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              f(x) = {p.expr}
            </button>
          ))}
        </div>
      </div>

      {/* Function Expression Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-mono font-bold text-indigo-400 px-2 shrink-0">
            f(x) =
          </span>
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. x^2 - 4 or sin(x)"
            className="h-8 text-xs font-mono bg-transparent border-0 text-white focus-visible:ring-0"
          />
        </div>

        {/* Range Selectors */}
        <div className="sm:col-span-3 flex items-center gap-1 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs font-mono text-slate-400">
          <span>Domain:</span>
          <Input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
            className="h-7 w-14 text-center text-xs bg-slate-900 border-slate-800 text-white rounded-lg p-0"
          />
          <span>to</span>
          <Input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="h-7 w-14 text-center text-xs bg-slate-900 border-slate-800 text-white rounded-lg p-0"
          />
        </div>

        {/* Point Evaluator */}
        <div className="sm:col-span-3 flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">x =</span>
          <Input
            type="number"
            value={evalX}
            onChange={(e) => setEvalX(Number(e.target.value))}
            className="h-7 w-12 text-center text-xs bg-slate-900 border-slate-800 text-white rounded-lg p-0"
          />
          <span className="text-emerald-400 font-bold">⇒ y = {evalY}</span>
        </div>
      </div>

      {/* Recharts Curve Visualization */}
      <div className="h-64 w-full bg-slate-950/90 rounded-2xl p-3 border border-slate-800 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="x" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "11px", color: "#f8fafc" }}
              formatter={(value: unknown) => [`y = ${value}`, "f(x)"]}
              labelFormatter={(label) => `x = ${label}`}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
            <ReferenceLine x={evalX} stroke="#10b981" strokeDasharray="3 3" label={{ value: `x=${evalX}`, fill: "#10b981", fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#6366f1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
