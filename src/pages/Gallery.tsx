import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Download, Loader2, Image as ImageIcon, Sparkles, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";
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

interface SavedImage {
  id: string;
  prompt: string;
  image_url: string;
  image_type: string;
  enhancement_mode: string | null;
  created_at: string;
}

const Gallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [filter, setFilter] = useState<"all" | "generated" | "enhanced">("all");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchImages();
  }, [user, navigate]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setImages(images.filter((img) => img.id !== id));
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const downloadImage = (image: SavedImage) => {
    const link = document.createElement("a");
    link.href = image.image_url;
    link.download = `deep-ai-${image.image_type}-${Date.now()}.png`;
    link.click();
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || img.image_type === filter;
    return matchesSearch && matchesFilter;
  });

  if (!user) return null;

  return (
    <AppLayout title="Gallery">
      <div className="min-h-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Creations</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Your <span className="gradient-text">Gallery</span>
            </h2>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 bg-background/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl overflow-hidden border border-border">
                  {(["all", "generated", "enhanced"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors",
                        filter === f ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex rounded-xl overflow-hidden border border-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn("p-2", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredImages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No images yet</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "No matches found" : "Start creating!"}
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link to="/image-generator">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/image-enhancer">Enhance</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Grid View */}
          {!isLoading && filteredImages.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredImages.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative aspect-square rounded-xl overflow-hidden glass cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs line-clamp-2">{image.prompt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* List View */}
          {!isLoading && filteredImages.length > 0 && viewMode === "list" && (
            <div className="space-y-2">
              {filteredImages.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="glass rounded-xl p-3 flex gap-3 items-center"
                >
                  <div
                    className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{image.prompt}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => downloadImage(image)}>
                      <Download className="w-4 h-4" />
                    </Button>
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
                          <AlertDialogAction onClick={() => deleteImage(image.id)}>Delete</AlertDialogAction>
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

      {/* Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-4 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage.image_url} alt={selectedImage.prompt} className="w-full rounded-xl mb-4" />
            <p className="text-sm mb-4">{selectedImage.prompt}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadImage(selectedImage)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AppLayout>
  );
};

export default Gallery;
