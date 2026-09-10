import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Play, Bug, Zap, Wand2, Loader2, Copy, Check, FileCode, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { ThinkingStepper } from "@/components/ThinkingStepper";
import { Link } from "react-router-dom";

const FREE_USER_DELAY = 7000; // 7 seconds

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
];

const actions = [
  { value: "execute", label: "Run Code", icon: Play, color: "from-green-500 to-emerald-500" },
  { value: "explain", label: "Explain", icon: FileCode, color: "from-blue-500 to-cyan-500" },
  { value: "debug", label: "Debug", icon: Bug, color: "from-red-500 to-orange-500" },
  { value: "optimize", label: "Optimize", icon: Zap, color: "from-yellow-500 to-amber-500" },
  { value: "generate", label: "Generate", icon: Wand2, color: "from-purple-500 to-pink-500" },
];

export default function CodeInterpreter() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPro] = useState(false);
  const { toast } = useToast();

  const handleAction = async (action: string) => {
    if (!code.trim() && action !== "generate") {
      toast({
        title: "Enter some code",
        description: action === "generate" ? "Enter a description of what you want to generate" : "Please enter code to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSelectedAction(action);
    setResult(null);

    try {
      // Apply delay for free users
      if (!isPro) {
        await new Promise(resolve => setTimeout(resolve, FREE_USER_DELAY));
      }

      let interpretationResult = "";
      try {
        const res = await fetch("/api/code-interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, action }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.result) {
            interpretationResult = resData.result;
          }
        }
      } catch (e) {
        console.warn("Local code-interpreter endpoint fallback:", e);
      }

      if (!interpretationResult) {
        const { data, error } = await supabase.functions.invoke("code-interpreter", {
          body: { code, language, action },
        });

        if (error) throw error;
        interpretationResult = data.result;
      }

      setResult(interpretationResult);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Processing failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const sampleCode = {
    javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
    python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
    typescript: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
  };

  return (
    <AppLayout title="Code Interpreter">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Code Interpreter</h1>
          <p className="text-muted-foreground">
            Write, run, debug, and optimize code with AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(sampleCode[language as keyof typeof sampleCode] || sampleCode.javascript)}
              >
                Load Example
              </Button>
            </div>

            <div className="relative">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={selectedAction === "generate" ? "Describe what code you want to generate..." : "Enter your code here..."}
                className="min-h-[400px] font-mono text-sm bg-background/50 rounded-2xl p-4 resize-none"
              />
              {code && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3"
                  onClick={() => copyToClipboard(code)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-5 gap-2">
              {actions.map((action) => (
                <Button
                  key={action.value}
                  onClick={() => handleAction(action.value)}
                  disabled={isProcessing}
                  variant={selectedAction === action.value ? "default" : "outline"}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${
                    selectedAction === action.value ? `bg-gradient-to-br ${action.color} border-0` : ""
                  }`}
                >
                  {isProcessing && selectedAction === action.value ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <action.icon className="w-5 h-5" />
                  )}
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6 min-h-[500px]"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Output
            </h3>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[400px]"
                >
                  <ThinkingStepper isLoading={isProcessing} showUpgradePrompt={!isPro} />
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Execute Result */}
                  {result.output !== undefined && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Console Output</h4>
                      <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{result.output || "No output"}</pre>
                      </div>
                      {result.error && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                          <p className="text-destructive text-sm font-mono">{result.error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optimized/Generated/Corrected Code */}
                  {(result.optimizedCode || result.code || result.correctedCode) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {result.optimizedCode ? "Optimized Code" : result.correctedCode ? "Fixed Code" : "Generated Code"}
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.optimizedCode || result.code || result.correctedCode)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm max-h-[300px] overflow-auto">
                        <pre className="whitespace-pre-wrap">{result.optimizedCode || result.code || result.correctedCode}</pre>
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {result.issues && result.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Issues Found</h4>
                      <div className="space-y-2">
                        {result.issues.map((issue: any, i: number) => (
                          <div key={i} className="bg-destructive/10 rounded-xl p-3 border border-destructive/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Bug className="w-4 h-4 text-destructive" />
                              <span className="text-sm font-medium">{issue.type}</span>
                              {issue.line && <span className="text-xs text-muted-foreground">Line {issue.line}</span>}
                            </div>
                            <p className="text-sm">{issue.description}</p>
                            {issue.fix && <p className="text-sm text-primary mt-1">Fix: {issue.fix}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.improvements && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Improvements</h4>
                      <ul className="space-y-1">
                        {result.improvements.map((imp: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Explanation</h4>
                      <p className="text-sm text-foreground/80">{result.explanation}</p>
                    </div>
                  )}

                  {/* Text result (for explain) */}
                  {result.text && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{result.text}</pre>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                >
                  <Code2 className="w-12 h-12 mb-4 opacity-50" />
                  <p>Enter code and select an action</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
