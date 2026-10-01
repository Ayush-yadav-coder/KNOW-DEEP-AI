import React, { useState } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  ChevronRight,
  BookMarked,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { NCERTChapter, NCERTSubject } from "@/data/ncertCurriculum";

interface NCERTChapterSidebarProps {
  subject: NCERTSubject;
  activeChapterId: string;
  onSelectChapter: (chapter: NCERTChapter) => void;
  completedChapterIds: string[];
  onToggleCompleteChapter: (chapterId: string) => void;
}

export const NCERTChapterSidebar: React.FC<NCERTChapterSidebarProps> = ({
  subject,
  activeChapterId,
  onSelectChapter,
  completedChapterIds,
  onToggleCompleteChapter,
}) => {
  const [search, setSearch] = useState("");

  const filteredChapters = subject.chapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(search.toLowerCase()) ||
      (ch.hindiTitle && ch.hindiTitle.toLowerCase().includes(search.toLowerCase())) ||
      `chapter ${ch.chapterNumber}`.includes(search.toLowerCase())
  );

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm h-full flex flex-col">
      {/* Subject Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
            Textbook Chapters
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {subject.bookName}
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold shrink-0">
          {completedChapterIds.length}/{subject.chapters.length} Done
        </span>
      </div>

      {/* Chapter Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter chapters..."
          className="h-8 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Chapters Scrollable List */}
      <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin flex-1">
        {filteredChapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          const isDone = completedChapterIds.includes(ch.id);

          return (
            <div
              key={ch.id}
              onClick={() => onSelectChapter(ch)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                isActive
                  ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/50 text-slate-900 dark:text-white shadow-sm ring-1 ring-amber-500/20"
                  : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              }`}
            >
              <div className="min-w-0 space-y-0.5 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Ch {ch.chapterNumber}
                  </span>
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive ? "text-amber-800 dark:text-amber-300" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {ch.title}
                  </span>
                </div>
                {ch.hindiTitle && (
                  <p className="text-[11px] text-slate-500 truncate pl-0.5">
                    {ch.hindiTitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompleteChapter(ch.id);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      : "text-slate-300 dark:text-slate-600 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={isDone ? "Completed" : "Mark as Completed"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? "text-amber-600 dark:text-amber-400 translate-x-0.5"
                      : "text-slate-300 dark:text-slate-600 group-hover:text-slate-500"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            No matching chapters found.
          </div>
        )}
      </div>
    </div>
  );
};
