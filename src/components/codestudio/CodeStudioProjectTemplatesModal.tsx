import React, { useState } from "react";
import {
  LayoutGrid,
  Sparkles,
  ArrowRight,
  FolderTree,
  CheckCircle2,
  Laptop,
  Smartphone,
  Layers,
  Code2,
  Zap,
  RotateCcw,
  Eye,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CodeFile } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";
import { MASTER_PROJECT_TEMPLATES, GalleryTemplate } from "./TemplateGallery";
import { CodeStudioTemplatePreviewModal } from "./CodeStudioTemplatePreviewModal";

interface CodeStudioProjectTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (files: CodeFile[], templateTitle: string) => void;
}

export const CodeStudioProjectTemplatesModal: React.FC<CodeStudioProjectTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<GalleryTemplate>(MASTER_PROJECT_TEMPLATES[0]);
  const [spotlightDevice, setSpotlightDevice] = useState<"desktop" | "mobile">("desktop");
  const [modalPreviewTemplate, setModalPreviewTemplate] = useState<GalleryTemplate | null>(null);

  const categories = ["All", "Frontend", "Fullstack", "SaaS", "AI & ML", "Database", "Algorithms"];

  const filteredTemplates =
    activeCategory === "All"
      ? MASTER_PROJECT_TEMPLATES
      : MASTER_PROJECT_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleApplyTemplate = (tmpl: GalleryTemplate) => {
    // Pass configured files to the parent workspace
    onSelectTemplate(tmpl.files, tmpl.title);
    onClose();
    setModalPreviewTemplate(null);
    toast({
      title: "🚀 Template Scaffolded Successfully!",
      description: `Loaded "${tmpl.title}" with ${tmpl.files.length} project files. Live Preview initialized.`,
    });
  };

  const SpotlightPreview = selectedTemplate.previewComponent;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-card border border-border shadow-2xl rounded-3xl p-6 text-card-foreground overflow-hidden max-h-[90vh] flex flex-col font-sans">
          {/* Header */}
          <DialogHeader className="space-y-1 pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-foreground">
                <LayoutGrid className="w-5 h-5 text-cyan-500" />
                Project Template Gallery &amp; Live Previews
              </DialogTitle>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                Visual Interactive Ready
              </span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose a project template to preview its high-fidelity layout and wireframe mockup in read-only visual mode before scaffolding into your workspace.
            </DialogDescription>
          </DialogHeader>

          {/* TOP FEATURED SPOTLIGHT LIVE PREVIEW */}
          <div className="shrink-0 p-4 rounded-2xl bg-slate-950 border border-border/80 shadow-inner space-y-3 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <selectedTemplate.icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                    Featured Live Preview
                  </span>
                  <h3 className="text-sm font-extrabold text-white">{selectedTemplate.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setSpotlightDevice("desktop")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      spotlightDevice === "desktop"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Desktop View"
                  >
                    <Laptop className="w-3 h-3" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setSpotlightDevice("mobile")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      spotlightDevice === "mobile"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setModalPreviewTemplate(selectedTemplate)}
                  className="h-7 text-xs rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Mockup</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApplyTemplate(selectedTemplate)}
                  className="h-7 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold gap-1 shadow-md"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Interactive Preview Canvas Frame */}
            <div className="flex justify-center items-center py-1">
              <div
                className={`transition-all duration-300 w-full ${
                  spotlightDevice === "mobile" ? "max-w-xs" : "max-w-2xl"
                } h-44 rounded-xl shadow-2xl overflow-hidden border border-slate-800 bg-slate-900/50`}
              >
                <SpotlightPreview isInteractive={true} />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 py-1 overflow-x-auto border-b border-border text-xs shrink-0 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs shrink-0 ${
                  activeCategory === cat
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto p-1 mt-3 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {filteredTemplates.map((tmpl) => {
              const Icon = tmpl.icon;
              const CardPreview = tmpl.previewComponent;
              const isSelected = selectedTemplate.id === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onMouseEnter={() => setSelectedTemplate(tmpl)}
                  onClick={() => setModalPreviewTemplate(tmpl)}
                  className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer backdrop-blur-md relative overflow-hidden ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500 shadow-md ring-1 ring-cyan-500/30"
                      : "bg-muted/20 border-border hover:border-cyan-500/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                            {tmpl.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {tmpl.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono">
                        {tmpl.badge}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tmpl.description}
                    </p>

                    {/* MINI INTERACTIVE PREVIEW THUMBNAIL (CLICK TO OPEN READ-ONLY VISUAL MODAL) */}
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner relative group/thumb">
                      <CardPreview isInteractive={false} />
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          View Read-Only Mockup
                        </span>
                      </div>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-1">
                      {tmpl.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <FolderTree className="w-3.5 h-3.5 text-cyan-500" />
                      {tmpl.files.length} files
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalPreviewTemplate(tmpl);
                        }}
                        className="h-7 text-xs rounded-xl hover:bg-muted text-muted-foreground hover:text-cyan-500 gap-1 font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(tmpl);
                        }}
                        className="h-7 text-xs rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* DEDICATED READ-ONLY HIGH-FIDELITY VISUAL REPRESENTATION & LAYOUT MOCKUP MODAL */}
      <CodeStudioTemplatePreviewModal
        isOpen={Boolean(modalPreviewTemplate)}
        onClose={() => setModalPreviewTemplate(null)}
        template={modalPreviewTemplate}
        onUseTemplate={(tmpl) => handleApplyTemplate(tmpl)}
      />
    </>
  );
};
