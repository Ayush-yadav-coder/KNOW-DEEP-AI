import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeFile } from "./CodeStudioTypes";

interface CodeStudioLivePreviewProps {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  files?: CodeFile[];
  activeFileId?: string;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export const CodeStudioLivePreview: React.FC<CodeStudioLivePreviewProps> = ({
  htmlCode = "",
  cssCode = "",
  jsCode = "",
  files = [],
  activeFileId,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [key, setKey] = useState(0);
  const [previewSrcDoc, setPreviewSrcDoc] = useState("");

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  useEffect(() => {
    let targetHtml = htmlCode;
    let targetCss = cssCode;
    let targetJs = jsCode;

    // Collect all JS/JSX/TS/TSX/CSS contents from project files
    let allJsContent = "";
    let allCssContent = "";

    if (files && files.length > 0) {
      files.forEach((f) => {
        if (!f) return;
        if (f.language === "css" || f.name.endsWith(".css")) {
          allCssContent += `\n/* ${f.name} */\n` + f.content;
        } else if (
          f.language === "javascript" ||
          f.language === "typescript" ||
          f.name.endsWith(".js") ||
          f.name.endsWith(".jsx") ||
          f.name.endsWith(".ts") ||
          f.name.endsWith(".tsx")
        ) {
          allJsContent += `\n// --- File: ${f.name} ---\n` + f.content;
        }
      });

      const htmlFile = files.find((f) => f && (f.language === "html" || (f.name && f.name.endsWith(".html"))));
      if (htmlFile) {
        targetHtml = htmlFile.content;
      } else {
        const activeFile = files.find((f) => f.id === activeFileId) || files[0];
        if (activeFile && activeFile.language === "html") {
          targetHtml = activeFile.content;
        }
      }
    }

    if (!targetCss) targetCss = allCssContent;
    if (!targetJs) targetJs = allJsContent;

    // If no explicit HTML, generate an interactive React/JS App root wrapper
    if (!targetHtml) {
      targetHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Know Deep Interactive Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div id="root">
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">Live Sandbox</span>
        <span className="text-xs text-slate-400">Code Editor Preview</span>
      </div>
      <h2 className="text-lg font-bold">Interactive Component Canvas</h2>
      <p className="text-xs text-slate-300">Live preview environment generated from active workspace code.</p>
    </div>
  </div>
  <script type="text/babel">
    try {
      ${targetJs}
    } catch (err) {
      console.error("[React Preview Error]:", err);
      document.getElementById('root').innerHTML = '<div class="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs font-mono"><strong>Preview Render Error:</strong><br/>' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
    }

    // Process targetHtml to resolve local script imports (e.g. <script src="./src/App.jsx"></script>)
    let fullDoc = targetHtml;

    // Replace <script src="..."></script> tags pointing to local files with Babel React bundle
    fullDoc = fullDoc.replace(/<script\s+src=["']\.\/src\/[^"']+["']><\/script>/gi, "");

    // Inject React & Babel Standalone if JSX is detected
    const hasJsxOrReact = targetJs.includes("React.") || targetJs.includes("render") || targetJs.includes("<") || targetJs.includes("return (");

    if (!fullDoc.includes("<html") && !fullDoc.includes("<!DOCTYPE")) {
      fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Know Deep Interactive App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${hasJsxOrReact ? `
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  ` : ""}
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    ${targetCss}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  ${targetHtml}
  <script type="${hasJsxOrReact ? "text/babel" : "text/javascript"}">
    try {
      ${targetJs}
    } catch (err) {
      console.error("[Live Preview Error]:", err);
    }
  </script>
</body>
</html>`;
    } else {
      // Ensure CDNs are injected before </head> if missing
      if (!fullDoc.includes("tailwindcss")) {
        fullDoc = fullDoc.replace(
          "</head>",
          `<script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          </head>`
        );
      }

      // Inject compiled JS bundle before </body>
      fullDoc = fullDoc.replace(
        "</body>",
        `<script type="text/babel">
          try {
            ${targetJs}
          } catch (err) {
            console.error("[Live Preview Script Error]:", err);
          }
        </script>
        </body>`
      );
    }

    setPreviewSrcDoc(fullDoc);
  }, [htmlCode, cssCode, jsCode, files, activeFileId]);

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Viewport & Controls Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Preview Option
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5 border border-border/60">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-1 rounded-lg text-xs transition-all ${
              viewport === "desktop"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-1 rounded-lg text-xs transition-all ${
              viewport === "tablet"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-1 rounded-lg text-xs transition-all ${
              viewport === "mobile"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1 rounded-lg"
            title="Reload Preview Frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </Button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-900/60 p-3 flex items-center justify-center overflow-auto">
        <div
          className="h-full transition-all duration-300 rounded-xl overflow-hidden shadow-md border border-border bg-white flex flex-col"
          style={{ width: getViewportWidth(), minHeight: "380px" }}
        >
          <iframe
            key={key}
            title="Live Code Studio Preview"
            srcDoc={previewSrcDoc}
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full flex-1 border-0 bg-white"
          />
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-3 py-1.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Tailwind CSS &amp; DOM Sandbox Enabled</span>
        <span className="font-mono text-[10px]">{viewport.toUpperCase()} • Safe IFrame</span>
      </div>
    </div>
  );
};
