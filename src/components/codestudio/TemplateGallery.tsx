import React, { useState } from "react";
import {
  Globe,
  Server,
  Database,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Check,
  Code2,
  FolderTree,
  Laptop,
  Smartphone,
  Play,
  Flame,
  Layout,
  Cpu,
  Boxes,
  Palette,
  CheckCircle2,
  Terminal as TerminalIcon,
  BarChart3,
  Bot,
  ShoppingCart,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile } from "./CodeStudioTypes";

export interface GalleryTemplate {
  id: string;
  title: string;
  category: "Frontend" | "Fullstack" | "SaaS" | "AI & ML" | "Database" | "Algorithms";
  icon: React.ElementType;
  accentColor: string;
  badge: string;
  tags: string[];
  description: string;
  features: string[];
  previewComponent: React.ComponentType<{ isInteractive?: boolean }>;
  files: CodeFile[];
}

// 1. Interactive React Glassmorphism Preview
const ReactGlassPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [count, setCount] = useState(15);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Build React Glassmorphism UI", done: true },
    { id: 2, text: "Connect Code Editor to AI Pair-Coder", done: true },
    { id: 3, text: "Deploy Cloud Microservice", done: false },
  ]);

  return (
    <div className="w-full h-full p-3.5 bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-sans select-none overflow-hidden">
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-[10px]">
              KD
            </div>
            <div>
              <div className="font-bold text-[11px] text-white">Glassmorphic App</div>
              <div className="text-[9px] text-cyan-300">Vite + React 18 + Tailwind</div>
            </div>
          </div>
          <button
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setCount((c) => c + 1);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            🔥 Counter: {count}
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
            <span>Sprint Tasks</span>
            <span className="text-cyan-400 font-mono">
              {tasks.filter((t) => t.done).length}/{tasks.length} Done
            </span>
          </div>
          <div className="space-y-1">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={(e) => {
                  if (isInteractive) {
                    e.stopPropagation();
                    setTasks((prev) =>
                      prev.map((item) => (item.id === t.id ? { ...item, done: !item.done } : item))
                    );
                  }
                }}
                className={`p-1.5 rounded-lg border text-[10px] flex items-center justify-between cursor-pointer transition-all ${
                  t.done
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 line-through"
                    : "bg-slate-900/60 border-slate-700/60 text-slate-200"
                }`}
              >
                <span>{t.text}</span>
                <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-black/40">
                  {t.done ? "✓" : "○"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/10">
        <span className="text-emerald-400 font-semibold">● Live Interactive Demo</span>
        <span>Glass UI Stack</span>
      </div>
    </div>
  );
};

// 2. SaaS KPI Analytics Dashboard Preview
const SaasDashboardPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [activeKpi, setActiveKpi] = useState<"mrr" | "users" | "speed">("mrr");

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-sans select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-[11px] text-white">SaaS Growth Dashboard</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full font-mono font-bold">
            Realtime KPI
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setActiveKpi("mrr");
              }
            }}
            className={`p-2 rounded-lg border cursor-pointer transition-all ${
              activeKpi === "mrr"
                ? "bg-cyan-500/20 border-cyan-500/50 text-white shadow-xs"
                : "bg-slate-900/60 border-slate-800 text-slate-300"
            }`}
          >
            <div className="text-[8px] text-slate-400 uppercase font-bold">MRR</div>
            <div className="text-[11px] font-bold text-cyan-300">$48,250</div>
            <div className="text-[8px] text-emerald-400 font-semibold">+18.4% ↑</div>
          </div>
          <div
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setActiveKpi("users");
              }
            }}
            className={`p-2 rounded-lg border cursor-pointer transition-all ${
              activeKpi === "users"
                ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-xs"
                : "bg-slate-900/60 border-slate-800 text-slate-300"
            }`}
          >
            <div className="text-[8px] text-slate-400 uppercase font-bold">Active Users</div>
            <div className="text-[11px] font-bold text-indigo-300">12,890</div>
            <div className="text-[8px] text-emerald-400 font-semibold">+9.2% ↑</div>
          </div>
          <div
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setActiveKpi("speed");
              }
            }}
            className={`p-2 rounded-lg border cursor-pointer transition-all ${
              activeKpi === "speed"
                ? "bg-emerald-500/20 border-emerald-500/50 text-white shadow-xs"
                : "bg-slate-900/60 border-slate-800 text-slate-300"
            }`}
          >
            <div className="text-[8px] text-slate-400 uppercase font-bold">Latency</div>
            <div className="text-[11px] font-bold text-emerald-300">28ms</div>
            <div className="text-[8px] text-emerald-400 font-semibold">99.99%</div>
          </div>
        </div>

        {/* Mock Interactive Bar Graph */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Weekly Growth Trajectory</span>
            <span className="text-cyan-400 font-bold">{activeKpi.toUpperCase()} Mode</span>
          </div>
          <div className="flex items-end gap-1.5 h-10 pt-1">
            <div className="flex-1 bg-cyan-600/40 rounded-t h-[40%] hover:bg-cyan-500 transition-colors"></div>
            <div className="flex-1 bg-cyan-600/60 rounded-t h-[65%] hover:bg-cyan-500 transition-colors"></div>
            <div className="flex-1 bg-cyan-600/50 rounded-t h-[55%] hover:bg-cyan-500 transition-colors"></div>
            <div className="flex-1 bg-cyan-600/80 rounded-t h-[80%] hover:bg-cyan-500 transition-colors"></div>
            <div className="flex-1 bg-cyan-500 rounded-t h-[100%] shadow-xs"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-emerald-400 font-semibold">● Live Chart &amp; Metric Telemetry</span>
        <span>Tailwind Charts</span>
      </div>
    </div>
  );
};

// 3. AI Copilot Chat Interface Preview
const AiChatCopilotPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [messages, setMessages] = useState([
    { role: "user", text: "Create an auth middleware for express." },
    { role: "assistant", text: "Generated secure JWT middleware with refresh tokens in server.js ✓" },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-sans select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-[11px] text-white">KnowDeep Code Assistant</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-mono font-bold">
            KnowDeep AI
          </span>
        </div>

        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-[10px] leading-relaxed ${
                m.role === "assistant"
                  ? "bg-purple-950/40 border border-purple-800/50 text-purple-200"
                  : "bg-slate-900 border border-slate-800 text-slate-300 ml-4"
              }`}
            >
              <div className="text-[8px] font-bold text-purple-400 uppercase mb-0.5">
                {m.role === "assistant" ? "Know Deep AI" : "You"}
              </div>
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Ask AI to write code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim() && isInteractive) {
                e.stopPropagation();
                setMessages((prev) => [
                  ...prev,
                  { role: "user", text: input.trim() },
                  { role: "assistant", text: `Injected code for "${input.trim()}" into Code Editor buffer.` },
                ]);
                setInput("");
              }
            }}
            className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-white focus:outline-none"
          />
          <button
            onClick={(e) => {
              if (isInteractive && input.trim()) {
                e.stopPropagation();
                setMessages((prev) => [
                  ...prev,
                  { role: "user", text: input.trim() },
                  { role: "assistant", text: `Injected code for "${input.trim()}" into Code Editor buffer.` },
                ]);
                setInput("");
              }
            }}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold"
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-purple-400 font-semibold">● Direct Buffer Injector</span>
        <span>AI Studio Bridge</span>
      </div>
    </div>
  );
};

// 4. Express Node API Tester Preview
const ExpressNodePreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [output, setOutput] = useState<string>('{ "status": 200, "message": "API online", "users": 3 }');

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-mono select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-sans">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-[11px] text-white">Express REST Server</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
            Live Routes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-sans">
          <button
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setOutput('GET /api/users → 200 OK\n[\n  { "id": 1, "name": "Ayush Yadav" },\n  { "id": 2, "name": "Sara Smith" }\n]');
              }
            }}
            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-center transition-all"
          >
            GET /api/users
          </button>
          <button
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setOutput('POST /api/users → 201 Created\n{ "id": 4, "name": "New User", "role": "Engineer" }');
              }
            }}
            className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold text-center transition-all"
          >
            POST /api/users
          </button>
        </div>

        <pre className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-[9px] overflow-x-auto h-16">
          {output}
        </pre>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800 font-sans">
        <span className="text-emerald-400 font-semibold">● Express Microservice</span>
        <span>JSON Response Sandbox</span>
      </div>
    </div>
  );
};

// 5. Python FastAPI Machine Learning Preview
const PythonFastApiPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [status, setStatus] = useState("Model idle. Click to run inference.");

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-mono select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-sans">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-[11px] text-white">Python 3.11 ML Engine</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">
            FastAPI + PyTorch
          </span>
        </div>

        <button
          onClick={(e) => {
            if (isInteractive) {
              e.stopPropagation();
              setStatus("[Inference Complete]\nInput: 'High-speed sentiment model'\nClass: POSITIVE (0.994 confidence)\nLatency: 14.2ms");
            }
          }}
          className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold font-sans shadow-sm transition-all"
        >
          ⚡ Run Neural Classifier
        </button>

        <pre className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 text-[9px] overflow-x-auto h-16 leading-tight">
          {status}
        </pre>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800 font-sans">
        <span className="text-amber-400 font-semibold">● Async Event Loop</span>
        <span>Pydantic Models</span>
      </div>
    </div>
  );
};

// 6. SQL Database Analytics Workbench Preview
const SqlAnalyticsPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [rows, setRows] = useState([
    { id: 101, user: "ayush_dev", orders: 14, spent: "$1,450.00" },
    { id: 102, user: "sara_m", orders: 8, spent: "$820.50" },
  ]);

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-mono select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-sans">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-[11px] text-white">PostgreSQL Analytics</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-bold">
            SQL Query Engine
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-[9px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[8px]">
              <tr>
                <th className="p-1.5">ID</th>
                <th className="p-1.5">User</th>
                <th className="p-1.5">Orders</th>
                <th className="p-1.5">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-1.5 font-bold text-cyan-400">#{r.id}</td>
                  <td className="p-1.5">{r.user}</td>
                  <td className="p-1.5">{r.orders}</td>
                  <td className="p-1.5 font-bold text-emerald-400">{r.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800 font-sans">
        <span className="text-cyan-400 font-semibold">● Relational Schema &amp; Joins</span>
        <span>Aggregation Pipeline</span>
      </div>
    </div>
  );
};

// 7. E-Commerce Showcase Preview
const EcommercePreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [cartCount, setCartCount] = useState(2);

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-sans select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-pink-400" />
            <span className="font-bold text-[11px] text-white">NextGen Storefront</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full font-bold">
            Cart: {cartCount} items
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-bold text-[11px] text-white">Pro Developer Toolkit</div>
            <div className="text-[9px] text-slate-400">Glassmorphic UI Kit + Monaco</div>
            <div className="text-[11px] font-bold text-pink-400 mt-1">$79.00</div>
          </div>
          <button
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setCartCount((c) => c + 1);
              }
            }}
            className="px-2.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg text-[10px] font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            + Add to Cart
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-pink-400 font-semibold">● Instant Checkout Flow</span>
        <span>Stripe-ready Architecture</span>
      </div>
    </div>
  );
};

// 8. Sorting & Pathfinding Algorithm Visualizer Preview
const AlgorithmVisualizerPreview: React.FC<{ isInteractive?: boolean }> = ({ isInteractive = true }) => {
  const [bars, setBars] = useState([35, 80, 45, 95, 20, 60, 75, 40]);
  const [isSorting, setIsSorting] = useState(false);

  const shuffleBars = () => {
    setBars(bars.slice().sort(() => Math.random() - 0.5));
  };

  return (
    <div className="w-full h-full p-3.5 bg-slate-950 text-slate-100 rounded-xl flex flex-col justify-between text-xs font-sans select-none overflow-hidden border border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-[11px] text-white">Algorithm Visualizer</span>
          </div>
          <button
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                shuffleBars();
              }
            }}
            className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-full font-mono font-bold"
          >
            🔀 Shuffle
          </button>
        </div>

        <div className="flex items-end justify-center gap-1.5 h-16 p-2 rounded-lg bg-slate-900 border border-slate-800">
          {bars.map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm transition-all duration-300"
            ></div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-blue-400 font-semibold">● Step-by-Step Execution</span>
        <span>O(N log N) Sorting</span>
      </div>
    </div>
  );
};

// Complete Master Templates Library
export const MASTER_PROJECT_TEMPLATES: GalleryTemplate[] = [
  {
    id: "react-tailwind",
    title: "React 18 Glassmorphic Web App",
    category: "Frontend",
    icon: Globe,
    accentColor: "from-cyan-500 to-blue-600",
    badge: "Vite + React 18",
    tags: ["React 18", "Tailwind CSS", "Babel", "Interactive Preview"],
    description: "Modern single page web application with glassmorphic UI components, animated stat counters, task manager, and instant visual live preview.",
    features: ["Pre-configured React 18 & Babel engine", "Glassmorphic blur cards with Tailwind CSS", "Live Task Management with state persistence", "One-click interactive execution"],
    previewComponent: ReactGlassPreview,
    files: [
      {
        id: "rt-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Glassmorphic App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen">
  <div id="root"></div>
  <script type="text/babel" src="./src/App.jsx"></script>
</body>
</html>`,
      },
      {
        id: "rt-2",
        name: "App.jsx",
        folder: "src",
        language: "javascript",
        content: `// React Glassmorphic App Component
function App() {
  const [count, setCount] = React.useState(15);
  const [tasks, setTasks] = React.useState([
    { id: 1, text: "Build React Glassmorphism UI", completed: true },
    { id: 2, text: "Connect Code Editor to AI Know Deep", completed: true },
    { id: 3, text: "Deploy Cloud Microservice", completed: false }
  ]);
  const [newTask, setNewTask] = React.useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        <header className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-lg shadow-inner">
              KD
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Know Deep React App</h1>
              <p className="text-xs text-slate-400">Interactive Live Preview Ready</p>
            </div>
          </div>

          <button
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105"
          >
            🔥 Stat Counter: {count}
          </button>
        </header>

        <main className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-cyan-300">Live Task Manager</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add new task..."
              className="flex-1 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white"
            />
            <button
              onClick={addTask}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
            >
              Add Task
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={\`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs \${
                  t.completed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through" : "bg-slate-900/50 border-slate-800 text-slate-200"
                }\`}
              >
                <span>{t.text}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800">
                  {t.completed ? "Done ✓" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
      },
      {
        id: "rt-3",
        name: "styles.css",
        folder: "src",
        language: "css",
        content: `/* Custom Glassmorphism Styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow-x: hidden;
}`,
      },
    ],
  },
  {
    id: "saas-dashboard",
    title: "SaaS Analytics & Growth Hub",
    category: "SaaS",
    icon: BarChart3,
    accentColor: "from-cyan-500 to-indigo-600",
    badge: "Executive Dashboard",
    tags: ["Analytics", "KPI Metrics", "Charts", "Tailwind"],
    description: "Production SaaS business intelligence dashboard with interactive KPI cards, weekly conversion charts, revenue breakdown, and user analytics.",
    features: ["Real-time KPI conversion metrics", "Interactive bar chart telemetry", "Customer retention breakdowns", "Responsive glassmorphic dark theme"],
    previewComponent: SaasDashboardPreview,
    files: [
      {
        id: "saas-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SaaS Growth Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex items-center justify-between p-6 bg-slate-900/90 border border-slate-800 rounded-3xl">
      <div>
        <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Enterprise Overview</span>
        <h1 class="text-2xl font-extrabold text-white">SaaS Revenue &amp; Growth Hub</h1>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-mono">Live Sync</span>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <span class="text-xs text-slate-400 font-bold">MONTHLY RECURRING (MRR)</span>
        <div class="text-2xl font-extrabold text-cyan-300 mt-1">$48,250</div>
        <div class="text-xs text-emerald-400 mt-1 font-semibold">+18.4% vs last month</div>
      </div>
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <span class="text-xs text-slate-400 font-bold">ACTIVE SUBSCRIBERS</span>
        <div class="text-2xl font-extrabold text-indigo-300 mt-1">12,890</div>
        <div class="text-xs text-emerald-400 mt-1 font-semibold">+9.2% retention</div>
      </div>
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <span class="text-xs text-slate-400 font-bold">AVG LATENCY</span>
        <div class="text-2xl font-extrabold text-emerald-300 mt-1">28ms</div>
        <div class="text-xs text-emerald-400 mt-1 font-semibold">99.99% SLA</div>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
    ],
  },
  {
    id: "ai-code-architect",
    title: "KnowDeep Code Architect & Streaming Assistant",
    category: "AI & ML",
    icon: Bot,
    accentColor: "from-purple-500 to-indigo-600",
    badge: "LLM + Buffer Bridge",
    tags: ["AI Assistant", "Code Injection", "Prompt Engineering", "Chat"],
    description: "Interactive AI coding companion with prompt presets, direct code editor buffer injection, syntax highlighting, and conversation history.",
    features: ["Real-time AI prompt responses", "1-click injection into Code Editor", "Contextual code snippet extraction", "Audio TTS voice walkthrough ready"],
    previewComponent: AiChatCopilotPreview,
    files: [
      {
        id: "ai-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Studio Companion</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans min-h-screen">
  <div class="max-w-xl mx-auto space-y-4">
    <header class="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
      <h1 class="text-lg font-bold text-purple-400">Know Deep Code Architect</h1>
      <span class="text-xs px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-bold">Connected</span>
    </header>
    <div class="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-2 text-xs">
      <p class="text-purple-200">AI companion is connected directly to your Code Editor buffer.</p>
    </div>
  </div>
</body>
</html>`,
      },
    ],
  },
  {
    id: "express-node",
    title: "Node.js Express REST API & Tester",
    category: "Fullstack",
    icon: Server,
    accentColor: "from-emerald-500 to-teal-600",
    badge: "Express JS + Live UI",
    tags: ["Node.js", "Express", "REST API", "Interactive Client"],
    description: "Production-ready REST API architecture with interactive web client dashboard to test endpoints live and visualize JSON payloads.",
    features: ["Interactive route test runner", "Pre-built GET & POST handlers", "JSON response viewer", "Clean modular routing architecture"],
    previewComponent: ExpressNodePreview,
    files: [
      {
        id: "ex-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Express API Live Tester</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans">
  <div class="max-w-xl mx-auto space-y-6">
    <header class="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex items-center justify-between">
      <div>
        <div class="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-1">Node Express REST API</div>
        <h1 class="text-xl font-bold">Express Web Microservice</h1>
        <p class="text-xs text-slate-400">Live API Tester Dashboard</p>
      </div>
      <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
    </header>

    <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
      <h2 class="text-sm font-bold text-slate-200">Interactive Endpoints</h2>
      <div class="grid grid-cols-2 gap-3">
        <button onclick="fetchUsers()" class="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md">
          GET /api/v1/users
        </button>
        <button onclick="addUser()" class="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md">
          POST /api/v1/users
        </button>
      </div>

      <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
        <span class="text-slate-500 text-[10px] uppercase font-bold">JSON Response Output</span>
        <pre id="api-output" class="text-emerald-400 overflow-x-auto">Click endpoint button above to test live response...</pre>
      </div>
    </div>
  </div>

  <script>
    const mockUsers = [
      { id: 1, name: "Ayush Yadav", role: "Principal Architect", email: "ayush@knowdeep.dev" },
      { id: 2, name: "Sara Smith", role: "Frontend Engineer", email: "sara@knowdeep.dev" }
    ];

    function fetchUsers() {
      document.getElementById('api-output').textContent = JSON.stringify({ success: true, count: mockUsers.length, data: mockUsers }, null, 2);
    }

    function addUser() {
      const newUser = { id: mockUsers.length + 1, name: "New Dev", role: "Software Engineer", email: "new@knowdeep.dev" };
      mockUsers.push(newUser);
      document.getElementById('api-output').textContent = JSON.stringify({ success: true, message: "User Created (201)", data: newUser }, null, 2);
    }
  </script>
</body>
</html>`,
      },
      {
        id: "ex-2",
        name: "server.js",
        folder: "",
        language: "javascript",
        content: `// Express REST API Entry Point
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/v1/users", (req, res) => {
  res.json({ success: true, users: [{ id: 1, name: "Ayush Yadav" }] });
});

app.listen(3000, () => console.log("Server listening on port 3000"));`,
      },
    ],
  },
  {
    id: "python-fastapi",
    title: "Python FastAPI / Flask Microservice",
    category: "Fullstack",
    icon: Zap,
    accentColor: "from-amber-500 to-orange-600",
    badge: "Python 3.11",
    tags: ["Python", "FastAPI", "Async", "Microservice"],
    description: "High-performance Python asynchronous API backend with Pydantic validation models, OpenAPI interactive docs, and sandbox execution.",
    features: ["Async request handling", "Pydantic typed validation", "Interactive execution runner", "Clean Python service architecture"],
    previewComponent: PythonFastApiPreview,
    files: [
      {
        id: "py-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Python Service Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans">
  <div class="max-w-xl mx-auto space-y-6">
    <header class="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex items-center justify-between">
      <div>
        <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">Python 3.11 Microservice</span>
        <h1 class="text-xl font-bold mt-1">Python FastAPI Runner</h1>
        <p class="text-xs text-slate-400">Pydantic Schema Validation &amp; Service Explorer</p>
      </div>
    </header>

    <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
      <button onclick="runPython()" class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg">
        ⚡ Execute Python UserService logic
      </button>

      <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300">
        <pre id="py-output">Click button to execute Python script in live sandbox...</pre>
      </div>
    </div>
  </div>

  <script>
    function runPython() {
      document.getElementById('py-output').textContent = \`[Python 3.11 Log]
UserService initialized...
Found 2 active users:
1. ayush_dev (ayush@knowdeep.dev)
2. coder_pro (coder@knowdeep.dev)
Added User: alex_m (alex@knowdeep.dev)
Process exited with return code 0.\`;
    }
  </script>
</body>
</html>`,
      },
      {
        id: "py-2",
        name: "main.py",
        folder: "",
        language: "python",
        content: `# Python Microservice Architecture
class UserService:
    def __init__(self):
        self.db = [{"id": 1, "username": "ayush_dev"}]

print("UserService initialized...")`,
      },
    ],
  },
  {
    id: "sql-analytics",
    title: "SQL Database Analytics & Schema",
    category: "Database",
    icon: Database,
    accentColor: "from-cyan-500 to-emerald-600",
    badge: "PostgreSQL Queries",
    tags: ["PostgreSQL", "Relational Schema", "Foreign Keys", "Aggregation"],
    description: "Relational database schema with foreign keys, indexes, views, and complex analytical aggregation queries with table visualizations.",
    features: ["Interactive revenue query execution", "Relational schema DDL definition", "Data table result viewer", "Performance index examples"],
    previewComponent: SqlAnalyticsPreview,
    files: [
      {
        id: "sql-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SQL Visual Query Workbench</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex items-center justify-between">
      <div>
        <span class="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">SQL Workbench</span>
        <h1 class="text-xl font-bold mt-1">PostgreSQL Analytics Workbench</h1>
      </div>
    </header>

    <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
      <button onclick="runQuery()" class="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl">
        ▶ Execute Revenue &amp; Customer Order Aggregation Query
      </button>

      <div class="overflow-x-auto rounded-2xl border border-slate-800">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-950 text-slate-400 uppercase text-[10px]">
            <tr>
              <th class="p-3">User ID</th>
              <th class="p-3">Username</th>
              <th class="p-3">Total Orders</th>
              <th class="p-3">Total Spent</th>
            </tr>
          </thead>
          <tbody id="sql-rows" class="divide-y divide-slate-800 text-slate-300">
            <tr><td colspan="4" class="p-4 text-center text-slate-500">Click button above to execute SQL query...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function runQuery() {
      document.getElementById('sql-rows').innerHTML = \`
        <tr class="bg-slate-900/50"><td class="p-3">#101</td><td class="p-3 font-bold text-cyan-400">ayush_dev</td><td class="p-3">14</td><td class="p-3 font-bold text-emerald-400">$1,450.00</td></tr>
        <tr class="bg-slate-900/30"><td class="p-3">#102</td><td class="p-3 font-bold text-cyan-400">sara_m</td><td class="p-3">8</td><td class="p-3 font-bold text-emerald-400">$820.50</td></tr>
      \`;
    }
  </script>
</body>
</html>`,
      },
      {
        id: "sql-2",
        name: "schema.sql",
        folder: "",
        language: "sql",
        content: `-- Database Schema
CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50));
CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), amount NUMERIC(10,2));`,
      },
    ],
  },
  {
    id: "algo-sorting",
    title: "Algorithm & DSA Visualizer",
    category: "Algorithms",
    icon: Cpu,
    accentColor: "from-blue-500 to-cyan-500",
    badge: "O(N log N) Engine",
    tags: ["Algorithms", "Data Structures", "Sorting", "Animations"],
    description: "Interactive visual algorithm animator for Merge Sort, Quick Sort, Binary Search, and Graph Pathfinding with live execution steps.",
    features: ["Live dynamic array bar visualizer", "Step-by-step sorting animations", "Big-O computational complexity comparison", "Interactive shuffle and play controls"],
    previewComponent: AlgorithmVisualizerPreview,
    files: [
      {
        id: "algo-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Algorithm Visualizer</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
      <div>
        <span class="text-xs text-blue-400 font-bold">DSA Learning Suite</span>
        <h1 class="text-xl font-bold">Sorting &amp; Pathfinding Visualizer</h1>
      </div>
    </header>
  </div>
</body>
</html>`,
      },
      {
        id: "algo-2",
        name: "sort.js",
        folder: "",
        language: "javascript",
        content: `// QuickSort Algorithm Implementation
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log("Sorted:", quickSort([35, 80, 45, 95, 20, 60, 75, 40]));`,
      },
    ],
  },
  {
    id: "ecommerce-store",
    title: "E-Commerce Product Showcase",
    category: "Frontend",
    icon: ShoppingCart,
    accentColor: "from-pink-500 to-rose-600",
    badge: "Modern Storefront",
    tags: ["E-Commerce", "Cart State", "Tailwind", "Checkout"],
    description: "Full-featured online store front with interactive cart drawer, product pricing, rating reviews, and responsive checkout layout.",
    features: ["Interactive cart state and quantity updates", "Product gallery modal with badges", "Stripe-ready payment interface", "Responsive mobile-friendly store grid"],
    previewComponent: EcommercePreview,
    files: [
      {
        id: "ecom-1",
        name: "index.html",
        folder: "",
        language: "html",
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Modern E-Commerce Store</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-6 font-sans">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
      <h1 class="text-xl font-bold">Know Deep Storefront</h1>
      <span class="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-bold">Cart: 2 items</span>
    </header>
  </div>
</body>
</html>`,
      },
    ],
  },
];
