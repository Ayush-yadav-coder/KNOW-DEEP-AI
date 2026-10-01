import React, { useState } from "react";
import {
  X,
  Laptop,
  Tablet,
  Smartphone,
  Sparkles,
  ArrowRight,
  FolderTree,
  CheckCircle2,
  Layers,
  Layout,
  Globe,
  ExternalLink,
  Shield,
  Zap,
  Box,
  Cpu,
  Monitor,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GalleryTemplate } from "./TemplateGallery";
import { useToast } from "@/hooks/use-toast";

interface CodeStudioTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: GalleryTemplate | null;
  onUseTemplate: (template: GalleryTemplate) => void;
}

export const CodeStudioTemplatePreviewModal: React.FC<CodeStudioTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
}) => {
  const { toast } = useToast();
  const [deviceViewport, setDeviceViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"visual-demo" | "layout-mockup" | "architecture">("visual-demo");

  if (!template) return null;

  const PreviewComponent = template.previewComponent;
  const Icon = template.icon;

  const handleConfirmUse = () => {
    onUseTemplate(template);
    onClose();
    toast({
      title: "Project Scaffolded",
      description: `Loaded "${template.title}" into Code Editor.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-card border border-border shadow-2xl rounded-3xl p-6 text-card-foreground overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header with Title and Tech Badges */}
        <DialogHeader className="pb-3 border-b border-border shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-extrabold text-foreground">
                    {template.title}
                  </DialogTitle>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono">
                    {template.badge}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    Read-Only Visual Mockup
                  </span>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {template.description}
                </DialogDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs rounded-xl"
              >
                Back to Gallery
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmUse}
                className="h-8 text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
              >
                <span>Scaffold in Code Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation Tabs & Viewport Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-1 border-b border-border/80 text-xs shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("visual-demo")}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === "visual-demo"
                  ? "bg-card text-cyan-600 dark:text-cyan-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Live Visual Demo
            </button>
            <button
              onClick={() => setActiveTab("layout-mockup")}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === "layout-mockup"
                  ? "bg-card text-cyan-600 dark:text-cyan-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Structured Layout Wireframe
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === "architecture"
                  ? "bg-card text-cyan-600 dark:text-cyan-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Component Architecture &amp; Files
            </button>
          </div>

          {/* Viewport Width Frame Selector (Desktop / Tablet / Mobile) */}
          {activeTab === "visual-demo" && (
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                onClick={() => setDeviceViewport("desktop")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceViewport === "desktop"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Desktop View (1440px)"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceViewport("tablet")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceViewport === "tablet"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDeviceViewport("mobile")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceViewport === "mobile"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          )}
        </div>

        {/* MAIN NON-EDITABLE PREVIEW CANVAS CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20 rounded-2xl border border-border my-2 flex flex-col justify-center items-center scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {/* TAB 1: LIVE VISUAL INTERACTIVE DEMO (BROWSER WINDOW CHROME) */}
          {activeTab === "visual-demo" && (
            <div
              className={`w-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col ${
                deviceViewport === "mobile"
                  ? "max-w-sm h-[460px]"
                  : deviceViewport === "tablet"
                  ? "max-w-xl h-[460px]"
                  : "max-w-3xl h-[460px]"
              }`}
            >
              {/* Mock macOS / Chrome Browser Titlebar */}
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>

                {/* Mock Address Bar */}
                <div className="flex-1 max-w-md mx-3 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span className="truncate">https://knowdeep.dev/preview/{template.id}</span>
                  <span className="text-emerald-400 font-bold ml-2">● LIVE</span>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  {deviceViewport === "mobile" ? "375px" : deviceViewport === "tablet" ? "768px" : "1440px"}
                </div>
              </div>

              {/* High-Fidelity Visual Component Canvas */}
              <div className="flex-1 p-3 overflow-hidden">
                <PreviewComponent isInteractive={true} />
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURED LAYOUT WIREFRAME MOCKUP */}
          {activeTab === "layout-mockup" && (
            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs font-mono text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white font-sans text-sm">
                    Structural Wireframe &amp; Layout Blueprint
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  Clean Architecture
                </span>
              </div>

              {/* Wireframe Blocks Diagram */}
              <div className="space-y-3">
                {/* 1. Header Block */}
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-bold">
                      &lt;Header /&gt;
                    </span>
                    <span className="text-slate-300 font-sans text-xs">
                      App Branding, Telemetry Badges &amp; Global Stat Counters
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Sticky Top</span>
                </div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-1.5 md:col-span-2">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold">
                      &lt;MainInteractiveCanvas /&gt;
                    </span>
                    <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                      Primary component state container with event dispatchers, responsive cards, and dynamic UI rendering.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1.5">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold">
                      &lt;ControlSidebar /&gt;
                    </span>
                    <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                      Filters, real-time action triggers, parameter inputs, and status badges.
                    </p>
                  </div>
                </div>

                {/* 3. Data Flow / Output Terminal */}
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                      &lt;TelemetryOutput /&gt;
                    </span>
                    <span className="text-slate-300 font-sans text-xs">
                      Real-time JSON output, console logs, or analytics visualization
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Reactive State</span>
                </div>
              </div>

              {/* Feature Specifications List */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Key Template Capabilities:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {template.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPONENT ARCHITECTURE & PROJECT FILES */}
          {activeTab === "architecture" && (
            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs font-sans text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">
                    Project Workspace Structure ({template.files.length} Files)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">
                  {template.category} Stack
                </span>
              </div>

              {/* Files Blueprint Tree List */}
              <div className="space-y-2">
                {template.files.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px] font-bold uppercase">
                        {f.language}
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono text-xs flex items-center gap-1.5">
                          <span>{f.folder ? `${f.folder}/${f.name}` : f.name}</span>
                          {f.isMain && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-sans font-bold">
                              Entrypoint
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {f.language === "html"
                            ? "HTML5 shell with CDN styling and root mounting node."
                            : f.language === "javascript"
                            ? "Component business logic, reactive state hooks, and event handlers."
                            : f.language === "python"
                            ? "Python asynchronous microservice with typed schemas."
                            : f.language === "sql"
                            ? "Relational database schema definitions and SQL queries."
                            : "Stylesheet declarations and UI tokens."}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500">
                      {f.content.split("\n").length} lines
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs flex items-center justify-between">
                <span>
                  Ready to load this template into your workspace? All {template.files.length} files will be scaffolded seamlessly.
                </span>
                <Button
                  size="sm"
                  onClick={handleConfirmUse}
                  className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold ml-3 shrink-0"
                >
                  Scaffold Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Tags and Scaffolding Call to Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Tags:</span>
            {template.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs rounded-xl"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmUse}
              className="h-8 text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold gap-1.5 shadow-md"
            >
              <span>Use This Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
