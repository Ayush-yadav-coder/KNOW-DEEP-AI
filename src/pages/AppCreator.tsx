import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Code, Loader2, Copy, Check, Download, Plus, X, Sparkles, Save, Rocket, Eye, Edit3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AppLayout } from "@/components/AppLayout";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";
import { AttachmentButton, AttachmentPreview, type Attachment } from "@/components/AttachmentButton";
import { cn } from "@/lib/utils";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface EdgeFunction {
  name: string;
  code: string;
}

interface GeneratedApp {
  appName: string;
  description: string;
  files: GeneratedFile[];
  supabaseSchema: string;
  edgeFunctions: EdgeFunction[];
  setupInstructions: string[];
}

const appTemplates = [
  { label: "Task Manager", prompt: "A task management app with real-time collaboration, authentication, and project organization" },
  { label: "E-commerce", prompt: "An e-commerce store with product catalog, shopping cart, checkout, and order tracking" },
  { label: "Social Platform", prompt: "A social media platform with posts, comments, likes, follows, and notifications" },
  { label: "Dashboard", prompt: "An analytics dashboard with charts, data visualization, and real-time metrics" },
];

const AppCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dailyLimit = useDailyMessageLimit();
  const [appDescription, setAppDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "instructions">("code");
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedFiles, setEditedFiles] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);

  const addFeature = () => {
    if (newFeature.trim() && features.length < 10) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Parse JSON with multiple fallback strategies
  const parseAppJSON = (content: string): GeneratedApp | null => {
    // Strategy 1: Direct parse
    try {
      return JSON.parse(content);
    } catch {}

    // Strategy 2: Extract JSON from markdown code block
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim());
      } catch {}
    }

    // Strategy 3: Find first { and last }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(content.slice(firstBrace, lastBrace + 1));
      } catch {}
    }

    // Strategy 4: Try to fix common JSON issues
    try {
      let fixed = content
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/'/g, '"') // Replace single quotes
        .replace(/\n/g, '\\n'); // Escape newlines in strings
      
      const match = fixed.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {}

    return null;
  };

  const generateApp = async (retry = false) => {
    if (!appDescription.trim()) {
      toast.error("Please describe your app idea");
      return;
    }
    if (!retry && !(await dailyLimit.tryConsume())) return;


    if (!user) {
      toast.error("Please sign in to generate apps");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    if (!retry) {
      setGeneratedApp(null);
      setEditedFiles({});
      setRetryCount(0);
    } else {
      setRetryCount(prev => prev + 1);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        navigate("/auth");
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          description: appDescription,
          features,
        }),
      });

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!response.ok) {
        throw new Error("Failed to generate app");
      }

      // Validate the response has required fields
      if (!data?.files || !Array.isArray(data.files)) {
        // Try to parse if it's a string response
        if (typeof data === 'string') {
          const parsed = parseAppJSON(data);
          if (parsed?.files) {
            setGeneratedApp(parsed);
            if (parsed.files.length > 0) {
              setSelectedFile(parsed.files[0].path);
            }
            toast.success("App generated!");
            return;
          }
        }
        throw new Error("Invalid response format. Retrying...");
      }

      setGeneratedApp(data);
      if (data.files?.length > 0) {
        setSelectedFile(data.files[0].path);
      }
      toast.success("App generated!");
    } catch (error) {
      console.error("App generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate app";
      
      // Auto-retry for transient errors
      if (retryCount < 2) {
        toast.error(errorMessage, {
          action: {
            label: "Retry",
            onClick: () => generateApp(true),
          },
        });
      } else {
        toast.error(`${errorMessage}. Please try a simpler description.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFileContent = () => {
    if (!selectedFile || !generatedApp) return "Select a file";
    
    // Check if there's an edited version
    if (editedFiles[selectedFile]) {
      return editedFiles[selectedFile];
    }
    
    if (selectedFile === "__schema__") return generatedApp.supabaseSchema;
    if (selectedFile.startsWith("__edge__")) {
      const fnName = selectedFile.replace("__edge__", "");
      return generatedApp.edgeFunctions.find(f => f.name === fnName)?.code || "";
    }
    return generatedApp.files.find((f) => f.path === selectedFile)?.content || "";
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      if (selectedFile && editedContent !== getFileContent()) {
        setEditedFiles(prev => ({
          ...prev,
          [selectedFile]: editedContent
        }));
        toast.success("Changes saved");
      }
      setEditMode(false);
    } else {
      // Enter edit mode
      setEditedContent(getFileContent());
      setEditMode(true);
    }
  };

  const handleFileSelect = (path: string) => {
    // Save current edits before switching
    if (editMode && selectedFile && editedContent !== getFileContent()) {
      setEditedFiles(prev => ({
        ...prev,
        [selectedFile]: editedContent
      }));
    }
    setSelectedFile(path);
    setEditMode(false);
  };

  const saveApp = async () => {
    if (!user) {
      toast.error("Please sign in to save apps");
      navigate("/auth");
      return;
    }

    if (!generatedApp) return;

    setIsSaving(true);
    try {
      // Apply any edits to the files before saving
      const finalFiles = generatedApp.files.map(file => ({
        ...file,
        content: editedFiles[file.path] || file.content
      }));

      const { error } = await supabase.from("generated_apps").insert({
        user_id: user.id,
        app_name: generatedApp.appName || "Untitled App",
        description: generatedApp.description || appDescription,
        features,
        files: finalFiles as unknown as Json,
        supabase_schema: editedFiles["__schema__"] || generatedApp.supabaseSchema,
        edge_functions: generatedApp.edgeFunctions as unknown as Json,
        setup_instructions: generatedApp.setupInstructions,
      });

      if (error) throw error;
      toast.success("App saved to projects!");
    } catch (error) {
      toast.error("Failed to save app");
    } finally {
      setIsSaving(false);
    }
  };

  const copyCode = async (content: string, path: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(path);
    toast.success("Copied!");
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadAllFiles = () => {
    if (!generatedApp) return;
    
    // Apply edits to files before download
    const content = generatedApp.files
      .map((f) => {
        const fileContent = editedFiles[f.path] || f.content;
        return `// ${f.path}\n${"=".repeat(50)}\n${fileContent}\n\n`;
      })
      .join("");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedApp.appName || "app"}-code.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Convert generated files to Sandpack format
  const sandpackFiles = useMemo(() => {
    if (!generatedApp?.files) return {};
    
    const files: Record<string, string> = {};
    
    // Add all generated files
    generatedApp.files.forEach(file => {
      const content = editedFiles[file.path] || file.content;
      // Normalize path for Sandpack
      const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
      files[normalizedPath] = content;
    });

    // Ensure we have an App.tsx or index file
    if (!files['/App.tsx'] && !files['/src/App.tsx']) {
      const appFile = generatedApp.files.find(f => 
        f.path.includes('App.tsx') || f.path.includes('App.jsx')
      );
      if (appFile) {
        files['/App.tsx'] = editedFiles[appFile.path] || appFile.content;
      }
    }

    return files;
  }, [generatedApp, editedFiles]);

  const hasValidPreviewFiles = Object.keys(sandpackFiles).length > 0 && 
    (sandpackFiles['/App.tsx'] || sandpackFiles['/src/App.tsx'] || sandpackFiles['/index.tsx']);

  return (
    <AppLayout title="App Creator">
      <DailyLimitDialog open={dailyLimit.showUpgrade} onOpenChange={dailyLimit.setShowUpgrade} />
      <div className="min-h-full p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {!generatedApp ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">AI-Powered Development</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Build Your <span className="gradient-text">Dream App</span>
                </h2>
              </motion.div>

              {/* App Description Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-4 md:p-6 max-w-3xl mx-auto"
              >
                {/* Quick Templates */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Quick Start Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {appTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAppDescription(template.prompt)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Describe your app</label>
                  <AttachmentPreview items={attachments} onRemove={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                  <Textarea
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    placeholder="A task management app with real-time collaboration..."
                    className="min-h-[120px] bg-background/50 border-border resize-none"
                  />
                  <div className="mt-2">
                    <AttachmentButton onAttach={(a) => setAttachments(prev => [...prev, a])} disabled={isLoading} />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Key Features</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addFeature()}
                      placeholder="Add a feature..."
                      className="bg-background/50 border-border"
                    />
                    <Button onClick={addFeature} variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-sm"
                        >
                          {feature}
                          <button onClick={() => removeFeature(idx)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => generateApp()}
                  disabled={isLoading || !appDescription.trim()}
                  className="w-full gradient-bg text-primary-foreground h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating App...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate App
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* App Header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">{generatedApp.appName}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-1">{generatedApp.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveApp} disabled={isSaving} size="sm" className="gradient-bg text-primary-foreground">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {user ? "Save" : "Sign in"}
                  </Button>
                  <Button onClick={downloadAllFiles} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => generateApp(true)} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button onClick={() => setGeneratedApp(null)} variant="ghost" size="sm">
                    New
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[250px_1fr] gap-4">
                {/* File Explorer */}
                <div className="glass rounded-2xl p-3">
                  <h3 className="font-semibold mb-3 text-sm">Files</h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1">
                      {generatedApp.files.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => handleFileSelect(file.path)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2",
                            selectedFile === file.path
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted text-foreground/80"
                          )}
                        >
                          <Code className="w-3 h-3" />
                          <span className="truncate">{file.path}</span>
                          {editedFiles[file.path] && (
                            <span className="ml-auto text-amber-500">•</span>
                          )}
                        </button>
                      ))}
                      {generatedApp.supabaseSchema && (
                        <button
                          onClick={() => handleFileSelect("__schema__")}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2",
                            selectedFile === "__schema__"
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted text-foreground/80"
                          )}
                        >
                          <Code className="w-3 h-3" />
                          schema.sql
                          {editedFiles["__schema__"] && (
                            <span className="ml-auto text-amber-500">•</span>
                          )}
                        </button>
                      )}
                      {generatedApp.edgeFunctions?.map((fn) => (
                        <button
                          key={fn.name}
                          onClick={() => handleFileSelect(`__edge__${fn.name}`)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2",
                            selectedFile === `__edge__${fn.name}`
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted text-foreground/80"
                          )}
                        >
                          <Code className="w-3 h-3" />
                          <span className="truncate">{fn.name}/index.ts</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Code Viewer / Editor / Preview */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("code")}
                        className={cn(
                          "px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                          activeTab === "code" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                        )}
                      >
                        <Code className="w-3 h-3" />
                        Code
                      </button>
                      <button
                        onClick={() => setActiveTab("preview")}
                        className={cn(
                          "px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                          activeTab === "preview" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => setActiveTab("instructions")}
                        className={cn(
                          "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                          activeTab === "instructions" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                        )}
                      >
                        Setup
                      </button>
                    </div>
                    {selectedFile && activeTab === "code" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditToggle}
                          className={cn(editMode && "text-amber-500")}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          {editMode ? "Save" : "Edit"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(getFileContent(), selectedFile)}
                        >
                          {copiedFile === selectedFile ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  {activeTab === "code" ? (
                    <ScrollArea className="h-[400px]">
                      {editMode ? (
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full h-full min-h-[400px] p-4 text-xs font-mono bg-transparent border-0 resize-none focus-visible:ring-0"
                          placeholder="Edit code here..."
                        />
                      ) : (
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                          <code>{getFileContent()}</code>
                        </pre>
                      )}
                    </ScrollArea>
                  ) : activeTab === "preview" ? (
                    <div className="h-[400px]">
                      {hasValidPreviewFiles ? (
                        <SandpackProvider
                          template="react-ts"
                          files={sandpackFiles}
                          theme="dark"
                          options={{
                            externalResources: ["https://cdn.tailwindcss.com"],
                          }}
                        >
                          <SandpackLayout>
                            <SandpackPreview 
                              showOpenInCodeSandbox={false}
                              showRefreshButton={true}
                              style={{ height: "400px" }}
                            />
                          </SandpackLayout>
                        </SandpackProvider>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                          <Eye className="w-12 h-12 mb-4 opacity-50" />
                          <p className="text-center mb-4">Preview not available for this app structure.</p>
                          <p className="text-xs text-center">The generated code can be downloaded and run locally.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="p-4">
                        <h4 className="font-semibold mb-3">Setup Instructions</h4>
                        <ul className="space-y-2">
                          {generatedApp.setupInstructions?.map((instruction, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary font-bold">{idx + 1}.</span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AppCreator;
