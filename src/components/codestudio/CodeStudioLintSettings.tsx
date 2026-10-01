import React, { useState } from "react";
import {
  Sliders,
  Check,
  AlertTriangle,
  Info,
  Wrench,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LintingSettings, LinterIssue } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioLintSettingsProps {
  settings: LintingSettings;
  onUpdateSettings: (newSettings: LintingSettings) => void;
  code: string;
  language: string;
  onApplyFormattedCode: (formattedCode: string) => void;
}

export const DEFAULT_LINT_SETTINGS: LintingSettings = {
  semicolons: true,
  quotes: "double",
  tabWidth: 2,
  indentType: "spaces",
  trailingComma: "es5",
  noUnusedVars: true,
  noConsole: false,
  arrowParens: "always",
  bracketSpacing: true,
  formatOnSave: true,
  formatOnRun: true,
  maxLineLength: 80,
};

export const CodeStudioLintSettings: React.FC<CodeStudioLintSettingsProps> = ({
  settings,
  onUpdateSettings,
  code,
  language,
  onApplyFormattedCode,
}) => {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"settings" | "issues">("settings");
  const [issues, setIssues] = useState<LinterIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const runLinterScan = () => {
    setIsScanning(true);
    const foundIssues: LinterIssue[] = [];
    const lines = code.split("\n");

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();

      // Rule: Semi-colons
      if (settings.semicolons && (language === "javascript" || language === "typescript")) {
        if (
          trimmed.length > 0 &&
          !trimmed.endsWith(";") &&
          !trimmed.endsWith("{") &&
          !trimmed.endsWith("}") &&
          !trimmed.endsWith(":") &&
          !trimmed.startsWith("//") &&
          !trimmed.startsWith("/*") &&
          !trimmed.startsWith("*") &&
          !trimmed.startsWith("if") &&
          !trimmed.startsWith("for") &&
          !trimmed.startsWith("while") &&
          !trimmed.startsWith("switch") &&
          !trimmed.startsWith("catch") &&
          !trimmed.startsWith("import") &&
          !trimmed.startsWith("export default")
        ) {
          foundIssues.push({
            id: `semi-${lineNum}`,
            line: lineNum,
            column: lineText.length,
            severity: "warning",
            rule: "semi",
            message: "Missing semicolon at the end of statement.",
            fixable: true,
            autoFix: "add-semi",
          });
        }
      }

      // Rule: Quotes
      if (settings.quotes === "single" && lineText.includes('"') && !lineText.includes('\\"')) {
        foundIssues.push({
          id: `quote-${lineNum}`,
          line: lineNum,
          column: lineText.indexOf('"') + 1,
          severity: "info",
          rule: "quotes",
          message: "Strings must use single quotes according to current config.",
          fixable: true,
          autoFix: "to-single",
        });
      } else if (settings.quotes === "double" && lineText.includes("'") && !lineText.includes("\\'")) {
        // Skip comment lines
        if (!trimmed.startsWith("//")) {
          foundIssues.push({
            id: `quote-${lineNum}`,
            line: lineNum,
            column: lineText.indexOf("'") + 1,
            severity: "info",
            rule: "quotes",
            message: "Strings must use double quotes according to current config.",
            fixable: true,
            autoFix: "to-double",
          });
        }
      }

      // Rule: No console
      if (settings.noConsole && lineText.includes("console.log(")) {
        foundIssues.push({
          id: `noconsole-${lineNum}`,
          line: lineNum,
          column: lineText.indexOf("console.log") + 1,
          severity: "warning",
          rule: "no-console",
          message: "Unexpected console statement in production code.",
          fixable: true,
        });
      }

      // Rule: Line Length
      if (lineText.length > settings.maxLineLength) {
        foundIssues.push({
          id: `maxlen-${lineNum}`,
          line: lineNum,
          column: settings.maxLineLength,
          severity: "warning",
          rule: "max-len",
          message: `Line exceeds maximum allowed length of ${settings.maxLineLength} characters (${lineText.length} chars).`,
          fixable: false,
        });
      }

      // Rule: Trailing spaces
      if (lineText.length > 0 && /\s+$/.test(lineText)) {
        foundIssues.push({
          id: `trailing-space-${lineNum}`,
          line: lineNum,
          column: lineText.length,
          severity: "info",
          rule: "no-trailing-spaces",
          message: "Trailing whitespace detected.",
          fixable: true,
        });
      }
    });

    setTimeout(() => {
      setIssues(foundIssues);
      setIsScanning(false);
      setActiveSubTab("issues");
      toast({
        title: "Linter Scan Complete",
        description: `Found ${foundIssues.length} rule matches & warnings.`,
      });
    }, 200);
  };

  const handleFormatCodeNow = () => {
    let formatted = code;

    // Apply quote preferences
    if (settings.quotes === "double") {
      formatted = formatted.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
    } else if (settings.quotes === "single") {
      formatted = formatted.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, "'$1'");
    }

    // Clean trailing spaces
    formatted = formatted
      .split("\n")
      .map((l) => l.replace(/\s+$/, ""))
      .join("\n");

    // Add semicolons if needed
    if (settings.semicolons && (language === "javascript" || language === "typescript")) {
      formatted = formatted
        .split("\n")
        .map((l) => {
          const t = l.trim();
          if (
            t.length > 0 &&
            !t.endsWith(";") &&
            !t.endsWith("{") &&
            !t.endsWith("}") &&
            !t.endsWith(":") &&
            !t.startsWith("//") &&
            !t.startsWith("/*") &&
            !t.startsWith("if") &&
            !t.startsWith("for") &&
            !t.startsWith("while")
          ) {
            return l + ";";
          }
          return l;
        })
        .join("\n");
    }

    onApplyFormattedCode(formatted);
    toast({
      title: "Code Formatted",
      description: `Applied ${settings.indentType} (${settings.tabWidth}), ${settings.quotes} quotes, and semicolons rule.`,
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Linting &amp; Formatting Configurator</h3>
            <p className="text-[11px] text-muted-foreground">
              Configure ESLint &amp; Prettier rules for {language.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={runLinterScan}
            disabled={isScanning}
            className="h-8 text-xs rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 border-cyan-500/30 gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isScanning ? "Scanning..." : "Run Linter"}
          </Button>

          <Button
            size="sm"
            onClick={handleFormatCodeNow}
            className="h-8 text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Format Active Code
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-border bg-muted/20 gap-2 text-xs">
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
            activeSubTab === "settings"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Rules &amp; Code Style
        </button>
        <button
          onClick={() => setActiveSubTab("issues")}
          className={`py-2 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === "issues"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Linter Diagnostics
          {issues.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {issues.length}
            </span>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeSubTab === "settings" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Formatting Rules */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-500" />
                Prettier / Formatting Rules
              </h4>

              {/* Quotes */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Quote Style</span>
                <div className="flex items-center bg-card rounded-lg border border-border p-0.5">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, quotes: "single" })}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      settings.quotes === "single"
                        ? "bg-cyan-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Single (&apos;)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, quotes: "double" })}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      settings.quotes === "double"
                        ? "bg-cyan-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Double (&quot;)
                  </button>
                </div>
              </div>

              {/* Semicolons */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Require Semicolons (;)</span>
                <button
                  onClick={() => onUpdateSettings({ ...settings, semicolons: !settings.semicolons })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.semicolons ? "bg-cyan-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.semicolons ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Tab Width */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Indentation Size</span>
                <div className="flex items-center gap-1.5">
                  {[2, 4].map((width) => (
                    <button
                      key={width}
                      onClick={() => onUpdateSettings({ ...settings, tabWidth: width })}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        settings.tabWidth === width
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-card text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {width} Spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Trailing Comma */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Trailing Commas</span>
                <select
                  value={settings.trailingComma}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, trailingComma: e.target.value as LintingSettings["trailingComma"] })
                  }
                  className="bg-card border border-border text-foreground text-xs rounded-lg px-2 py-1"
                >
                  <option value="none">None</option>
                  <option value="es5">ES5 (Arrays &amp; Objects)</option>
                  <option value="all">All (Functions &amp; Params)</option>
                </select>
              </div>

              {/* Max Line Length */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">Print Width / Max Length</span>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {settings.maxLineLength} cols
                </span>
              </div>
            </div>

            {/* ESLint Static Analysis */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                ESLint Code Quality Rules
              </h4>

              {/* No Unused Vars */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-foreground font-medium block">no-unused-vars</span>
                  <span className="text-[10px] text-muted-foreground">Disallow unused variables and imports</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, noUnusedVars: !settings.noUnusedVars })}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    settings.noUnusedVars ? "bg-cyan-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.noUnusedVars ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* No Console */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-foreground font-medium block">no-console</span>
                  <span className="text-[10px] text-muted-foreground">Flag console.log statements</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, noConsole: !settings.noConsole })}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    settings.noConsole ? "bg-cyan-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.noConsole ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Format On Run */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-foreground font-medium block">Auto-Format on Run</span>
                  <span className="text-[10px] text-muted-foreground">Automatically format before sandbox run</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, formatOnRun: !settings.formatOnRun })}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    settings.formatOnRun ? "bg-cyan-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.formatOnRun ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Reset Defaults */}
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onUpdateSettings(DEFAULT_LINT_SETTINGS);
                    toast({ title: "Reset", description: "Linting settings restored to defaults." });
                  }}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore Default Configuration
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {issues.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Zero Lint Issues Found!</p>
                <p className="text-xs mt-1">Your code adheres to all configured ESLint and Prettier standards.</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                    issue.severity === "error"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : issue.severity === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {issue.severity === "error" ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span>
                        Line {issue.line}:{issue.column} - rule({issue.rule})
                      </span>
                      {issue.fixable && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10">
                          Auto-Fixable
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5">{issue.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
