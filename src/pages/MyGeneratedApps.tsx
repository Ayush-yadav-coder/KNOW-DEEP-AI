import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Code2, Loader2, Search, Trash2, Eye, Calendar, Download, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GeneratedApp {
  id: string;
  app_name: string;
  description: string;
  features: string[] | null;
  files: any;
  supabase_schema: string | null;
  edge_functions: any;
  setup_instructions: string[] | null;
  created_at: string;
}

export default function MyGeneratedApps() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<GeneratedApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<GeneratedApp | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchApps();
  }, [user, navigate]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredApps(
        apps.filter(
          (app) =>
            app.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredApps(apps);
    }
  }, [searchQuery, apps]);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_apps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApps(data || []);
      setFilteredApps(data || []);
    } catch (error) {
      toast.error("Failed to fetch apps");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      const { error } = await supabase.from("generated_apps").delete().eq("id", id);
      if (error) throw error;
      setApps((prev) => prev.filter((app) => app.id !== id));
      toast.success("App deleted");
    } catch (error) {
      toast.error("Failed to delete app");
    }
  };

  const downloadApp = (app: GeneratedApp) => {
    const files = Array.isArray(app.files) ? app.files : [];
    const content = files
      .map((f: any) => `// ${f.path}\n${"=".repeat(50)}\n${f.content}\n\n`)
      .join("");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${app.app_name || "app"}-code.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFileContent = () => {
    if (!selectedApp || !selectedFile) return "";
    if (selectedFile === "__schema__") return selectedApp.supabase_schema || "";
    if (selectedFile.startsWith("__edge__")) {
      const fnName = selectedFile.replace("__edge__", "");
      const edgeFns = Array.isArray(selectedApp.edge_functions) ? selectedApp.edge_functions : [];
      return edgeFns.find((f: any) => f.name === fnName)?.code || "";
    }
    const files = Array.isArray(selectedApp.files) ? selectedApp.files : [];
    return files.find((f: any) => f.path === selectedFile)?.content || "";
  };

  return (
    <AppLayout title="My Generated Apps">
      <div className="min-h-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Apps</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              My <span className="gradient-text">Generated Apps</span>
            </h2>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps..."
                className="pl-10 rounded-xl"
              />
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Apps Grid */}
          {!isLoading && filteredApps.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app, idx) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-2xl p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{app.app_name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {app.description}
                  </p>

                  {app.features && app.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {feature}
                        </span>
                      ))}
                      {app.features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{app.features.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApp(app);
                        const files = Array.isArray(app.files) ? app.files : [];
                        if (files.length > 0) {
                          setSelectedFile(files[0].path);
                        }
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadApp(app)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete App</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{app.app_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteApp(app.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredApps.length === 0 && (
            <div className="text-center py-20">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No apps match your search." : "You haven't created any apps yet."}
              </p>
              <Button onClick={() => navigate("/app-creator")} className="gradient-bg text-primary-foreground">
                Create Your First App
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* App Details Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedApp?.app_name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[200px_1fr] gap-4 h-full overflow-hidden">
            {/* File Explorer */}
            <div className="border rounded-lg p-2 overflow-auto">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Files</p>
              <div className="space-y-1">
                {selectedApp && Array.isArray(selectedApp.files) && selectedApp.files.map((file: any) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs transition-colors",
                      selectedFile === file.path
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {file.path}
                  </button>
                ))}
                {selectedApp?.supabase_schema && (
                  <button
                    onClick={() => setSelectedFile("__schema__")}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs transition-colors",
                      selectedFile === "__schema__"
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    schema.sql
                  </button>
                )}
                {selectedApp && Array.isArray(selectedApp.edge_functions) && selectedApp.edge_functions.map((fn: any) => (
                  <button
                    key={fn.name}
                    onClick={() => setSelectedFile(`__edge__${fn.name}`)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs transition-colors",
                      selectedFile === `__edge__${fn.name}`
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {fn.name}/index.ts
                  </button>
                ))}
              </div>
            </div>

            {/* Code Viewer */}
            <ScrollArea className="border rounded-lg p-4 h-full">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                <code>{getFileContent()}</code>
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
