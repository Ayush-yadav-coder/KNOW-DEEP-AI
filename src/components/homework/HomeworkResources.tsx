import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Search,
  Upload,
  BookOpen,
  Filter,
  Sparkles,
  Layers,
  FileCode,
  FileCheck,
  Globe,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export interface StudyResource {
  id: string;
  title: string;
  subject: string;
  type: "pdf" | "link" | "notes";
  url: string;
  description: string;
  fileSize?: string;
  date: string;
}

export const HomeworkResources: React.FC = () => {
  const [resources, setResources] = useState<StudyResource[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_homework_resources");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any legacy mock IDs
          const clean = parsed.filter((r) => !/^res-[1-9]$/.test(r.id));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Quick Preview Modal state
  const [previewResource, setPreviewResource] = useState<StudyResource | null>(null);

  // New Resource Form States
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Maths");
  const [type, setType] = useState<"pdf" | "link" | "notes">("pdf");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_homework_resources", JSON.stringify(resources));
    } catch {
      // ignore
    }
  }, [resources]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRes: StudyResource = {
      id: "res-" + Date.now(),
      title: title.trim(),
      subject,
      type,
      url: url.trim() || "#",
      description: description.trim() || "Uploaded study material for course revision.",
      fileSize: uploadedFileName ? "File Attached" : type === "link" ? "External Link" : "PDF Doc",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    setResources((prev) => [newRes, ...prev]);
    setIsAddModalOpen(false);
    setTitle("");
    setUrl("");
    setDescription("");
    setUploadedFileName("");
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResources = resources.filter((r) => {
    const matchesSubject = selectedSubject === "All" || r.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Study Resources &amp; PDF Library</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                {resources.length} Materials
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Attach textbook PDFs, syllabi, and lecture links organized by subject with instant modal previews
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Add Resource Modal Trigger */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add PDF / Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <FileText className="w-5 h-5 text-cyan-400" /> Add Study Resource
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Upload a PDF document or paste a web study material link.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddResource} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Resource Title:
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Calculus Limits Guide or NCERT Chapter 4 PDF"
                    required
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subject:</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                    >
                      <option value="Maths">Maths</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Science">Science (Physics/Chem/Bio)</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="CS">Computer Science</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Resource Type:</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "pdf" | "link" | "notes")}
                      className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="link">Web / Drive Link</option>
                      <option value="notes">Summary Notes</option>
                    </select>
                  </div>
                </div>

                {/* PDF File Upload or Web Link Input */}
                {type === "pdf" ? (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Upload PDF / Document:
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl bg-slate-950 text-center cursor-pointer transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf,.doc,.docx,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-400">
                        {uploadedFileName ? `Attached: ${uploadedFileName}` : "Click to select PDF or image file"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Resource URL / Link:
                    </label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://docs.google.com/... or textbook link"
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Notes / Description:
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key chapters covered, page numbers, or exam topics..."
                    rows={3}
                    className="text-xs rounded-xl bg-slate-950 border-slate-800 text-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Save Resource to Library
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subject Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {["All", "Maths", "Science", "English", "Hindi", "CS"].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
                selectedSubject === subj
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study resources..."
            className="h-9 text-xs pl-9 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  {res.subject}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {res.date} · {res.fileSize}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                  {res.type === "pdf" ? (
                    <FileText className="w-4 h-4" />
                  ) : res.type === "link" ? (
                    <Link2 className="w-4 h-4" />
                  ) : (
                    <FileCode className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewResource(res)}
                className="h-7 text-xs rounded-xl gap-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-bold"
              >
                <Eye className="w-3.5 h-3.5" /> Quick Preview
              </Button>

              <div className="flex items-center gap-1">
                {res.url && res.url !== "#" && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Open Resource Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => handleDeleteResource(res.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  title="Remove from library"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick-Preview Modal */}
      <Dialog open={!!previewResource} onOpenChange={(open) => !open && setPreviewResource(null)}>
        {previewResource && (
          <DialogContent className="max-w-2xl rounded-3xl bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  {previewResource.subject} · {previewResource.type.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {previewResource.fileSize}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-white mt-1">
                {previewResource.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 leading-relaxed">
                {previewResource.description}
              </DialogDescription>
            </DialogHeader>

            {/* Document Preview Frame */}
            <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              {previewResource.url.startsWith("data:") ? (
                /* Data URL embedded document preview */
                <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                  {previewResource.url.includes("image") ? (
                    <img src={previewResource.url} alt="Attached Document" className="w-full h-full object-contain" />
                  ) : (
                    <iframe
                      src={previewResource.url}
                      title={previewResource.title}
                      className="w-full h-full border-0"
                    />
                  )}
                </div>
              ) : (
                /* External / PDF Link View */
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <div className="p-3 w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{previewResource.title}</h4>
                    <p className="text-xs font-mono text-slate-400 truncate max-w-md mx-auto mt-1">
                      {previewResource.url}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <a
                      href={previewResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-1.5 shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                    </a>
                  </div>
                </div>
              )}

              {/* Study Notes & Quick Guide */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-cyan-300 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Quick Study Advice:
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Review this material alongside the Socratic breakdown and flashcards to cross-verify theorem definitions and formulas before taking the practice quiz.
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
