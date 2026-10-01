import React, { useState } from "react";
import { FolderHeart, Search, Trash2, ArrowUpRight, Tag, Calendar, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NotebookEntry {
  id: string;
  subject: string;
  question: string;
  solutionMarkdown: string;
  date: string;
  tags: string[];
}

interface HomeworkNotebookProps {
  entries: NotebookEntry[];
  onSelectEntry: (entry: NotebookEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearNotebook: () => void;
}

export const HomeworkNotebook: React.FC<HomeworkNotebookProps> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onClearNotebook,
}) => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  if (!entries) return null;

  const filtered = entries.filter((e) => {
    const matchesTag = selectedTag === "all" || e.subject.toLowerCase() === selectedTag.toLowerCase();
    const matchesSearch =
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.solutionMarkdown.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>My Study Notebook &amp; Solved History</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                {entries.length} Saved
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Bookmark problems, review past solutions, and study before exams
            </p>
          </div>
        </div>

        {entries.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearNotebook}
            className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Search & Subject Filter */}
      {entries.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved homework questions..."
                className="h-9 text-xs pl-10 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Notebook Cards List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        {entry.subject}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {entry.date}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                      {entry.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => onSelectEntry(entry)}
                      className="h-8 text-xs rounded-xl gap-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 font-bold"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Reload
                    </Button>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <FolderHeart className="w-10 h-10 opacity-30 mx-auto" />
          <p className="text-xs font-bold text-slate-400">Notebook is Empty</p>
          <p className="text-[11px] max-w-xs mx-auto text-slate-500">
            Click &quot;Save to Study Notebook&quot; on any solved problem to build your personalized exam review folder.
          </p>
        </div>
      )}
    </div>
  );
};
