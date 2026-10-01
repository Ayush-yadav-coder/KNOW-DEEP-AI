import React, { useState } from "react";
import {
  Globe,
  Plus,
  Trash2,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Send,
  Layers,
  Clock,
  CheckCircle2,
  Sliders,
  Code2,
  Server,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockApiEndpoint, MockApiLog } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

const INITIAL_MOCK_ENDPOINTS: MockApiEndpoint[] = [
  {
    id: "mock-1",
    name: "Get User Profile",
    method: "GET",
    path: "/api/v1/user/profile",
    status: 200,
    delayMs: 120,
    headers: { "Content-Type": "application/json", "X-Powered-By": "Know Deep Mock Server" },
    responseBody: JSON.stringify(
      {
        id: "usr_99182",
        name: "Ayush Yadav",
        username: "ayushpro",
        email: "ayushyadavprocoder@gmail.com",
        role: "Lead Software Architect",
        plan: "Enterprise",
        verified: true,
        stats: { repositories: 42, totalStars: 1280 },
      },
      null,
      2
    ),
    enabled: true,
    description: "Returns the authenticated user details",
  },
  {
    id: "mock-2",
    name: "List Products Catalog",
    method: "GET",
    path: "/api/v1/products",
    status: 200,
    delayMs: 80,
    headers: { "Content-Type": "application/json" },
    responseBody: JSON.stringify(
      [
        { id: "prod_1", title: "Monaco Code Pro Editor", price: 0.0, category: "IDE", inStock: true },
        { id: "prod_2", title: "AI Code Studio Know Deep", price: 0.0, category: "AI", inStock: true },
        { id: "prod_3", title: "Jest In-Browser Test Suite", price: 0.0, category: "Testing", inStock: true },
      ],
      null,
      2
    ),
    enabled: true,
    description: "Returns catalog of items in inventory",
  },
  {
    id: "mock-3",
    name: "Authenticate & Issue JWT Token",
    method: "POST",
    path: "/api/v1/auth/login",
    status: 200,
    delayMs: 250,
    headers: { "Content-Type": "application/json" },
    responseBody: JSON.stringify(
      {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTkxODIiLCJleHAiOjE3NTk4NDAwMDB9.s8d9f...",
        tokenType: "Bearer",
        expiresIn: 86400,
        user: { id: "usr_99182", email: "ayushyadavprocoder@gmail.com" },
      },
      null,
      2
    ),
    enabled: true,
    description: "Authenticates credentials and returns JWT payload",
  },
];

export const CodeStudioMockApi: React.FC = () => {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<MockApiEndpoint[]>(INITIAL_MOCK_ENDPOINTS);
  const [activeEndpointId, setActiveEndpointId] = useState<string>("mock-1");
  const [logs, setLogs] = useState<MockApiLog[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const activeEndpoint = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  const handleTestEndpoint = () => {
    if (!activeEndpoint) return;
    setIsTesting(true);

    setTimeout(() => {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(activeEndpoint.responseBody);
      } catch {
        parsedBody = activeEndpoint.responseBody;
      }

      const result = {
        status: activeEndpoint.status,
        statusText: activeEndpoint.status === 200 ? "OK" : activeEndpoint.status === 201 ? "Created" : "Error",
        delayMs: activeEndpoint.delayMs,
        headers: activeEndpoint.headers,
        data: parsedBody,
        timestamp: new Date().toLocaleTimeString(),
      };

      setTestResult(result);
      setIsTesting(false);

      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          method: activeEndpoint.method,
          path: activeEndpoint.path,
          status: activeEndpoint.status,
          delayMs: activeEndpoint.delayMs,
          responsePreview: typeof parsedBody === "object" ? JSON.stringify(parsedBody).substring(0, 80) + "..." : String(parsedBody),
        },
        ...prev,
      ]);

      toast({
        title: `Mock API ${activeEndpoint.method} Responded`,
        description: `HTTP ${activeEndpoint.status} (${activeEndpoint.delayMs}ms) from ${activeEndpoint.path}`,
      });
    }, activeEndpoint.delayMs || 100);
  };

  const handleAddNewEndpoint = () => {
    const newEp: MockApiEndpoint = {
      id: `mock-${Date.now()}`,
      name: "New Mock Endpoint",
      method: "GET",
      path: `/api/v1/resource-${endpoints.length + 1}`,
      status: 200,
      delayMs: 100,
      headers: { "Content-Type": "application/json" },
      responseBody: JSON.stringify({ message: "Mock response data", timestamp: new Date().toISOString() }, null, 2),
      enabled: true,
      description: "Custom mock endpoint",
    };
    setEndpoints([...endpoints, newEp]);
    setActiveEndpointId(newEp.id);
    toast({ title: "Endpoint Created", description: `Added ${newEp.path}` });
  };

  const handleDeleteEndpoint = (id: string) => {
    if (endpoints.length <= 1) {
      toast({ title: "Cannot Delete", description: "Keep at least one mock endpoint." });
      return;
    }
    const filtered = endpoints.filter((e) => e.id !== id);
    setEndpoints(filtered);
    if (activeEndpointId === id) {
      setActiveEndpointId(filtered[0].id);
    }
  };

  const handleUpdateActiveEndpoint = (patch: Partial<MockApiEndpoint>) => {
    setEndpoints((prev) =>
      prev.map((e) => (e.id === activeEndpoint.id ? { ...e, ...patch } : e))
    );
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "POST":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "PUT":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">In-Browser Mock API Server</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Port 4000 (Virtual)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Define custom JSON routes, latency, and status codes to test fetch() without network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddNewEndpoint}
            className="h-8 text-xs rounded-xl bg-card hover:bg-muted border-border gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Route
          </Button>

          <Button
            size="sm"
            onClick={handleTestEndpoint}
            disabled={isTesting}
            className="h-8 text-xs rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold gap-1.5 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? "animate-spin" : ""}`} />
            {isTesting ? "Executing..." : "Test Endpoint"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Left Column: Route List (4 cols) */}
        <div className="lg:col-span-4 p-3 overflow-y-auto space-y-2 bg-muted/10">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
            Available Mock Routes ({endpoints.length})
          </div>

          <div className="space-y-1.5">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => setActiveEndpointId(ep.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  ep.id === activeEndpoint.id
                    ? "bg-card border-teal-500/50 shadow-xs ring-1 ring-teal-500/20"
                    : "bg-card/60 border-border/70 hover:bg-card hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <div className="truncate">
                    <div className="font-semibold text-foreground truncate">{ep.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">{ep.path}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground">{ep.status}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEndpoint(ep.id);
                    }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Snippet copy */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
              <span className="font-semibold">JavaScript Fetch Usage:</span>
              <button
                onClick={() => {
                  const code = `fetch("${activeEndpoint.path}")\n  .then(res => res.json())\n  .then(data => console.log(data));`;
                  navigator.clipboard.writeText(code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                  toast({ title: "Copied", description: "Fetch code snippet copied." });
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy Code
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-slate-950 text-teal-400 font-mono text-[10px] overflow-x-auto border border-slate-800">
              {`fetch("${activeEndpoint.path}")\n  .then(res => res.json())\n  .then(data => console.log(data));`}
            </pre>
          </div>
        </div>

        {/* Right Column: Route Configurator & Live Test Inspector (8 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Endpoint Details Form */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Route Name</label>
                <input
                  type="text"
                  value={activeEndpoint.name}
                  onChange={(e) => handleUpdateActiveEndpoint({ name: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl bg-background border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">HTTP Method</label>
                <select
                  value={activeEndpoint.method}
                  onChange={(e) => handleUpdateActiveEndpoint({ method: e.target.value as any })}
                  className="w-full text-xs p-2 rounded-xl bg-background border border-border text-foreground font-bold focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Endpoint URL Path</label>
                <input
                  type="text"
                  value={activeEndpoint.path}
                  onChange={(e) => handleUpdateActiveEndpoint({ path: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">HTTP Status Code</label>
                <select
                  value={activeEndpoint.status}
                  onChange={(e) => handleUpdateActiveEndpoint({ status: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-xl bg-background border border-border text-foreground font-mono font-bold"
                >
                  <option value={200}>200 OK</option>
                  <option value={201}>201 Created</option>
                  <option value={400}>400 Bad Request</option>
                  <option value={401}>401 Unauthorized</option>
                  <option value={404}>404 Not Found</option>
                  <option value={500}>500 Internal Server Error</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Simulated Latency: {activeEndpoint.delayMs} ms
                </label>
                <input
                  type="range"
                  min={0}
                  max={1500}
                  step={50}
                  value={activeEndpoint.delayMs}
                  onChange={(e) => handleUpdateActiveEndpoint({ delayMs: Number(e.target.value) })}
                  className="w-full accent-teal-500 mt-2"
                />
              </div>
            </div>

            {/* Response JSON Editor */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1 flex items-center justify-between">
                <span>Mock Response Body (JSON):</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">application/json</span>
              </label>
              <textarea
                value={activeEndpoint.responseBody}
                onChange={(e) => handleUpdateActiveEndpoint({ responseBody: e.target.value })}
                rows={7}
                className="w-full p-3 rounded-xl bg-slate-950 text-teal-400 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Test Response Window */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    HTTP {testResult.status} {testResult.statusText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({testResult.delayMs}ms latency)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{testResult.timestamp}</span>
              </div>
              <pre className="p-2 text-xs font-mono text-emerald-300 overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
