export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "sql"
  | "cpp"
  | "java"
  | "rust"
  | "go"
  | "json"
  | "markdown"
  | "css";

export interface CodeFile {
  id: string;
  name: string;
  folder?: string;
  language: SupportedLanguage;
  content: string;
  isMain?: boolean;
}

export interface SnippetTemplate {
  id: string;
  title: string;
  category: "Algorithms" | "Data Structures" | "Web & Frontend" | "Backend & APIs" | "Utilities" | "LeetCode Top";
  language: SupportedLanguage;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  code: string;
  tags: string[];
}

export interface UserSavedSnippet {
  id: string;
  title: string;
  category: string;
  language: SupportedLanguage;
  description?: string;
  code: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TerminalLog {
  id: string;
  type: "stdout" | "stderr" | "info" | "warn" | "system";
  text: string;
  timestamp: string;
}

export type CopilotAction =
  | "explain"
  | "debug"
  | "optimize"
  | "unit-tests"
  | "security"
  | "docstrings"
  | "complexity"
  | "custom";

export interface DebuggerBreakpoint {
  line: number;
  enabled: boolean;
  condition?: string;
}

export interface DebuggerScopeVar {
  name: string;
  value: string;
  type: string;
}

export interface DebuggerFrame {
  functionName: string;
  line: number;
  column: number;
  file: string;
}

// ================= LINTING & FORMATTING =================
export interface LintingSettings {
  semicolons: boolean;
  quotes: "single" | "double";
  tabWidth: number;
  indentType: "spaces" | "tabs";
  trailingComma: "none" | "es5" | "all";
  noUnusedVars: boolean;
  noConsole: boolean;
  arrowParens: "always" | "avoid";
  bracketSpacing: boolean;
  formatOnSave: boolean;
  formatOnRun: boolean;
  maxLineLength: number;
}

export interface LinterIssue {
  id: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  rule: string;
  fixable: boolean;
  autoFix?: string;
}

// ================= JEST TEST RUNNER =================
export interface TestCase {
  id: string;
  name: string;
  suiteName: string;
  status: "passed" | "failed" | "running" | "idle";
  durationMs: number;
  assertionCount: number;
  errorMessage?: string;
  expected?: string;
  actual?: string;
  code: string;
}

export interface TestSuite {
  id: string;
  fileName: string;
  name: string;
  tests: TestCase[];
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

// ================= MOCK API SERVICE =================
export interface MockApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  status: number;
  delayMs: number;
  headers: Record<string, string>;
  responseBody: string;
  enabled: boolean;
  description?: string;
}

export interface MockApiLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  delayMs: number;
  responsePreview: string;
}

// ================= CODE SMELLS & REFACTORING =================
export interface CodeSmell {
  id: string;
  title: string;
  category: "Antipattern" | "Performance" | "Maintainability" | "Security" | "Dead Code";
  severity: "critical" | "warning" | "suggestion";
  lineRange: [number, number];
  description: string;
  impact: string;
  originalSnippet: string;
  refactoredSnippet: string;
  explanation: string;
}

// ================= DATABASE SCHEMA & ERD =================
export interface ErdColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: { table: string; column: string };
  isNullable?: boolean;
  defaultValue?: string;
}

export interface ErdTable {
  id: string;
  name: string;
  columns: ErdColumn[];
  x?: number;
  y?: number;
  color?: string;
  rowCount?: number;
}

export interface ErdRelationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: "1:1" | "1:N" | "N:M";
}

// ================= PERFORMANCE PROFILER =================
export interface BenchmarkResult {
  iterations: number;
  opsPerSec: number;
  meanMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  memoryMb: number;
  samples: number[];
  histogram: { range: string; count: number }[];
}
