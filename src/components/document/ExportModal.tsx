import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  FileCode,
  FileType,
  Download,
  Check,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import {
  exportToPdf,
  exportToWord,
  exportToMarkdown,
  exportToPlainText,
  exportToJson,
  ExportParagraph,
} from "./exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  paragraphs: ExportParagraph[];
  activeStamp?: string | null;
}

type ExportFormat = "pdf" | "word" | "markdown" | "txt" | "json";

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  paragraphs,
  activeStamp,
}) => {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [customFilename, setCustomFilename] = useState(documentTitle || "Strategic_Document");
  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    {
      id: "pdf" as ExportFormat,
      name: "PDF Document",
      ext: ".pdf",
      badge: "Print Ready",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: FileText,
      iconColor: "text-rose-500",
      description: "A4 multi-page document with professional headings, line wraps, margins & stamps",
    },
    {
      id: "word" as ExportFormat,
      name: "Microsoft Word",
      ext: ".doc",
      badge: "Full Formatting",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: FileType,
      iconColor: "text-blue-500",
      description: "Word & Google Docs compatible with preserved font hierarchies, styles & lists",
    },
    {
      id: "markdown" as ExportFormat,
      name: "Markdown",
      ext: ".md",
      badge: "Developer",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: FileCode,
      iconColor: "text-purple-500",
      description: "Standard markdown tags (#, ##, -, >) ready for GitHub, Notion, or Obsidian",
    },
    {
      id: "txt" as ExportFormat,
      name: "Plain Text",
      ext: ".txt",
      badge: "Universal",
      badgeColor: "bg-muted text-muted-foreground border-border",
      icon: Layers,
      iconColor: "text-muted-foreground",
      description: "Clean UTF-8 text with formatted section dividers and indented bullet points",
    },
    {
      id: "json" as ExportFormat,
      name: "JSON Data",
      ext: ".json",
      badge: "Raw AST",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: FileSpreadsheet,
      iconColor: "text-amber-500",
      description: "Complete structured paragraph tree with tags, IDs and metadata for backups",
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    try {
      const filename = customFilename.trim() || documentTitle || "Document";
      const options = {
        includeStamp: includeStamp && !!activeStamp,
        stampText: activeStamp,
        includeDate,
        authorName: "Document Studio",
      };

      if (selectedFormat === "pdf") {
        exportToPdf(filename, paragraphs, options);
      } else if (selectedFormat === "word") {
        exportToWord(filename, paragraphs, options);
      } else if (selectedFormat === "markdown") {
        exportToMarkdown(filename, paragraphs, options);
      } else if (selectedFormat === "txt") {
        exportToPlainText(filename, paragraphs);
      } else if (selectedFormat === "json") {
        exportToJson(filename, paragraphs);
      }

      toast({
        title: "Export Complete",
        description: `Successfully exported "${filename}${formats.find((f) => f.id === selectedFormat)?.ext}".`,
      });
      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: err.message || "An error occurred while generating the file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl glass backdrop-blur-2xl border-border/60 p-0 overflow-hidden shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Download className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Export Document
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Export with high-fidelity formatting preserved across all platforms
                </DialogDescription>
              </div>
            </div>
            <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Canva-Grade Export
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Format Selector Grid */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Output Format
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;

                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-card border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/5"
                        : "bg-muted/30 border-border/50 hover:border-border hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-cyan-500/15"
                              : "bg-background border border-border/50 group-hover:border-border"
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 ${fmt.iconColor}`} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            {fmt.name}
                            <span className="text-xs font-mono font-normal text-muted-foreground">
                              {fmt.ext}
                            </span>
                          </p>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${fmt.badgeColor}`}
                          >
                            {fmt.badge}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {fmt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document File Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Document File Name
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Enter file name"
                className="h-10 text-sm font-medium rounded-xl border-border/60 bg-background/80"
              />
              <span className="px-3 py-2 bg-muted/60 text-muted-foreground rounded-xl text-xs font-mono font-semibold border border-border/40 shrink-0">
                {formats.find((f) => f.id === selectedFormat)?.ext}
              </span>
            </div>
          </div>

          {/* Options & Styling Toggles */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
            <p className="text-xs font-bold text-foreground">Formatting Presets & Inclusions</p>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer">
                <span>Include Document Stamp / Status Watermark ({activeStamp || "None"})</span>
                <input
                  type="checkbox"
                  checked={includeStamp}
                  onChange={(e) => setIncludeStamp(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer">
                <span>Include Export Timestamp & Studio Attribution</span>
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                try {
                  const existingStr = localStorage.getItem("knowdeep_gallery");
                  const existing = existingStr ? JSON.parse(existingStr) : [];
                  const newDoc = {
                    id: `doc-${Date.now()}`,
                    title: customFilename || documentTitle,
                    type: "document",
                    timestamp: new Date().toISOString(),
                    prompt: paragraphs.map(p => p.text).join(" ").slice(0, 100),
                  };
                  localStorage.setItem("knowdeep_gallery", JSON.stringify([newDoc, ...existing]));
                  toast({
                    title: "Saved to My Gallery & My Stuff!",
                    description: "Document archived in your personal gallery.",
                  });
                } catch {
                  toast({ title: "Saved to My Gallery" });
                }
              }}
              className="h-10 px-4 rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Save to Gallery</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Generating..." : `Download ${formats.find((f) => f.id === selectedFormat)?.name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
