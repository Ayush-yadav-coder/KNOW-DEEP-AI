import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Code, Loader2, FolderOpen, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
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

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface EdgeFunction {
  name: string;
  code: string;
}

interface SavedProject {
  id: string;
  app_name: string;
  description: string;
  features: string[];
  files: GeneratedFile[];
  supabase_schema: string | null;
  edge_functions: EdgeFunction[];
  setup_instructions: string[];
  created_at: string;
}

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_apps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedData: SavedProject[] = (data || []).map((item) => ({
        id: item.id,
        app_name: item.app_name,
        description: item.description,
        features: item.features || [],
        files: (item.files as unknown as GeneratedFile[]) || [],
        supabase_schema: item.supabase_schema,
        edge_functions: (item.edge_functions as unknown as EdgeFunction[]) || [],
        setup_instructions: item.setup_instructions || [],
        created_at: item.created_at,
      }));
      
      setProjects(transformedData);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("generated_apps").delete().eq("id", id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  if (!user) return null;

  return (
    <AppLayout title="Projects">
      <div className="min-h-full p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Projects</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Your <span className="gradient-text">Projects</span>
            </h2>
          </motion.div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && projects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <Button asChild>
                <Link to="/app-creator">
                  <Plus className="w-4 h-4 mr-2" />
                  Create App
                </Link>
              </Button>
            </motion.div>
          )}

          {!isLoading && projects.length > 0 && (
            <div className="space-y-3">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-2xl p-4 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{project.app_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {project.files.length} files
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProject(project.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Projects;
