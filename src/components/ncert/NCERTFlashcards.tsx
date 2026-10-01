import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Brain,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NCERTFlashcard } from "@/data/ncertCurriculum";

interface NCERTFlashcardsProps {
  flashcards: NCERTFlashcard[];
  chapterTitle: string;
}

export const NCERTFlashcards: React.FC<NCERTFlashcardsProps> = ({
  flashcards,
  chapterTitle,
}) => {
  const [cards, setCards] = useState<NCERTFlashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  // Sync if chapter changes
  React.useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  if (!cards || cards.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Brain className="w-10 h-10 opacity-30 mx-auto text-rose-500" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Flashcards Available</p>
        <p className="text-[11px] text-slate-500">
          Generating cards for this chapter with AI Tutor.
        </p>
      </div>
    );
  }

  const current = cards[currentIndex];
  const isMastered = masteredIds.includes(current.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev >= cards.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev <= 0 ? cards.length - 1 : prev - 1));
  };

  const toggleMastered = () => {
    if (isMastered) {
      setMasteredIds((prev) => prev.filter((id) => id !== current.id));
    } else {
      setMasteredIds((prev) => [...prev, current.id]);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-5">
      {/* Header & Stats */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NCERT Chapter Concept Flashcards &amp; Memory Vault
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {chapterTitle} · {cards.length} Cards · {masteredIds.length} Mastered
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleShuffle}
          className="h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </Button>
      </div>

      {/* Main Flashcard Card Stage */}
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Meta Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">
            {current.type}
          </span>
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="min-h-[280px] p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 cursor-pointer flex flex-col justify-between shadow-md hover:shadow-lg relative select-none transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 dark:text-slate-500">
            <span className="uppercase tracking-widest font-bold text-rose-600 dark:text-rose-400/90">
              {isFlipped ? "NCERT Explanation / Solution" : "NCERT Prompt / Concept"}
            </span>
            <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Tap to Flip
            </span>
          </div>

          <div className="my-auto py-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white max-w-lg mx-auto leading-relaxed whitespace-pre-line">
                  {isFlipped ? current.back : current.front}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <span className="truncate max-w-[200px]">Chapter: {chapterTitle}</span>
            <span className={isMastered ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}>
              {isMastered ? "✓ Mastered" : "In Progress"}
            </span>
          </div>
        </div>

        {/* Bottom Control Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrev}
            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <Button
            size="sm"
            onClick={toggleMastered}
            className={`h-9 px-4 text-xs font-bold rounded-xl gap-1.5 transition-all ${
              isMastered
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMastered ? "Mastered" : "Mark as Mastered"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
