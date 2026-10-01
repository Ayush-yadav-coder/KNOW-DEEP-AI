import React, { useState } from "react";
import {
  Send,
  Loader2,
  Copy,
  Check,
  Code2,
  Globe,
  SlidersHorizontal,
  Clock,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioApiClientProps {
  onInsertCodeSnippet?: (code: string) => void;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HeaderItem {
  id: string;
  key: string;
  value: string;
}

const PRESET_ENDPOINTS = [
  { name: "JSONPlaceholder Posts", method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
  { name: "JSONPlaceholder Todos", method: "GET", url: "https://jsonplaceholder.typicode.com/todos" },
  { name: "HTTPBin IP Address", method: "GET", url: "https://httpbin.org/ip" },
  { name: "GitHub Public User (Torvalds)", method: "GET", url: "https://api.github.com/users/torvalds" },
];

export const CodeStudioApiClient: React.FC<CodeStudioApiClientProps> = ({ onInsertCodeSnippet }) => {
  const { toast } = useToast();
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: "1", key: "Content-Type", value: "application/json" },
  ]);
  const [requestBody, setRequestBody] = useState(`{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}`);
  const [activeSubTab, setActiveSubTab] = useState<"body" | "headers">("body");

  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState("");
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseSizeKb, setResponseSizeKb] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a valid HTTP/HTTPS URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    setResponseTimeMs(null);

    const startTime = performance.now();

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) headersObj[h.key.trim()] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      if (method !== "GET" && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || (res.ok ? "OK" : "Error"));

      const rawText = await res.text();
      const sizeKb = (new Blob([rawText]).size / 1024).toFixed(2);
      setResponseSizeKb(sizeKb);

      try {
        const json = JSON.parse(rawText);
        setResponseData(JSON.stringify(json, null, 2));
      } catch {
        setResponseData(rawText);
      }
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(0);
      setResponseStatusText("Network / CORS Error");
      const msg = err instanceof Error ? err.message : String(err);
      setResponseData(`Error: ${msg}\n\nNote: If requesting external cross-origin APIs without CORS headers, the browser might restrict direct frontend fetch.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied Response", description: "Response payload copied to clipboard." });
  };

  const handleGenerateFetchSnippet = () => {
    const snippet = `// Generated Fetch API Client Request
async function executeApiRequest() {
  try {
    const response = await fetch("${url}", {
      method: "${method}",
      headers: ${JSON.stringify(
        headers.reduce((acc, h) => {
          if (h.key) acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
        null,
        2
      )},
      ${method !== "GET" ? `body: JSON.stringify(${requestBody}),` : ""}
    });
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("API Request Failed:", error);
  }
}

executeApiRequest();
`;
    if (onInsertCodeSnippet) {
      onInsertCodeSnippet(snippet);
      toast({ title: "Snippet Injected", description: "Inserted Fetch script into Code Studio editor." });
    } else {
      navigator.clipboard.writeText(snippet);
      toast({ title: "Copied Script", description: "Fetch code snippet copied to clipboard." });
    }
  };

  const getStatusBadge = (status: number | null) => {
    if (status === null) return null;
    if (status >= 200 && status < 300) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 text-xs">
          {status} {responseStatusText}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 text-xs">
        {status === 0 ? "Failed" : `${status} ${responseStatusText}`}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Top Address & Method Bar */}
      <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="h-9 px-3 rounded-xl bg-background border border-border font-bold text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 min-w-[220px] h-9 px-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <Button
          size="sm"
          onClick={handleSendRequest}
          disabled={isLoading}
          className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-xs"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Send
        </Button>
      </div>

      {/* Preset Pills */}
      <div className="px-3 py-1.5 bg-muted/20 border-b border-border/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-muted-foreground font-medium shrink-0">Presets:</span>
        {PRESET_ENDPOINTS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setMethod(preset.method as HttpMethod);
              setUrl(preset.url);
            }}
            className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Split Pane: Request Builder (Left) & Response Inspector (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-auto">
        {/* Request Tabs & Body Editor */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab("body")}
                className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                  activeSubTab === "body" ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                JSON Body
              </button>
              <button
                onClick={() => setActiveSubTab("headers")}
                className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                  activeSubTab === "headers" ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                Headers ({headers.length})
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateFetchSnippet}
              className="h-6 text-[11px] px-2 rounded-lg gap-1"
            >
              <Code2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              Generate Fetch Code
            </Button>
          </div>

          {activeSubTab === "body" ? (
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              spellCheck={false}
              placeholder="Enter JSON request payload..."
              className="flex-1 w-full p-3 rounded-xl bg-muted/40 font-mono text-xs text-foreground border border-border resize-none outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {headers.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => {
                      const next = [...headers];
                      next[i].key = e.target.value;
                      setHeaders(next);
                    }}
                    placeholder="Header Key"
                    className="flex-1 h-8 px-2 rounded-lg bg-background border border-border text-xs"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => {
                      const next = [...headers];
                      next[i].value = e.target.value;
                      setHeaders(next);
                    }}
                    placeholder="Header Value"
                    className="flex-1 h-8 px-2 rounded-lg bg-background border border-border text-xs"
                  />
                  <button
                    onClick={() => setHeaders(headers.filter((item) => item.id !== h.id))}
                    className="text-muted-foreground hover:text-rose-500 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setHeaders([...headers, { id: String(Date.now()), key: "", value: "" }])
                }
                className="h-7 text-xs rounded-lg"
              >
                + Add Header
              </Button>
            </div>
          )}
        </div>

        {/* Response Inspector */}
        <div className="bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-muted-foreground">Response</span>
              {getStatusBadge(responseStatus)}
              {responseTimeMs !== null && (
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {responseTimeMs} ms
                </span>
              )}
              {responseSizeKb && (
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> {responseSizeKb} KB
                </span>
              )}
            </div>

            {responseData && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyResponse}
                className="h-6 text-[11px] px-2 rounded-lg gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                Copy JSON
              </Button>
            )}
          </div>

          <div className="flex-1 rounded-xl bg-slate-950 p-3 text-slate-100 font-mono text-xs overflow-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Sending HTTP Request...</p>
              </div>
            ) : responseData ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400/90">{responseData}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <Globe className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No Response Yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click &quot;Send&quot; to test your API endpoint.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
