import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

interface HomeworkFlashcardsProps {
  cards: Flashcard[];
  subjectName: string;
}

export const HomeworkFlashcards: React.FC<HomeworkFlashcardsProps> = ({
  cards,
  subjectName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.includes(currentCard.id);

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
      setMasteredIds((prev) => prev.filter((id) => id !== currentCard.id));
    } else {
      setMasteredIds((prev) => [...prev, currentCard.id]);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Concept Flashcards &amp; Memory Trainer</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                {cards.length} Cards
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Flip cards to memorize key definitions, variables, and formulas for {subjectName}
            </p>
          </div>
        </div>

        {/* Mastered Progress */}
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
          {masteredIds.length} / {cards.length} Mastered
        </span>
      </div>

      {/* 3D Flip Card */}
      <div className="relative min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-full cursor-pointer perspective-1000"
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-slate-700 shadow-2xl flex flex-col justify-between items-center text-center transform-style-3d relative"
          >
            {/* Front Side */}
            {!isFlipped ? (
              <div className="space-y-3 my-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  {currentCard.category || "Core Concept"}
                </span>
                <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                  {currentCard.front}
                </p>
                <p className="text-[10px] text-slate-500 font-mono italic">
                  (Tap to reveal answer)
                </p>
              </div>
            ) : (
              /* Back Side */
              <div className="space-y-3 my-auto rotate-y-180">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Answer / Formula Solution
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-200 leading-relaxed">
                  {currentCard.back}
                </p>
                <p className="text-[10px] text-slate-500 font-mono italic">
                  (Tap to flip back)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePrev}
          className="h-8 text-xs rounded-xl gap-1 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMastered}
            className={`h-8 text-xs rounded-xl gap-1 px-3 ${
              isMastered
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isMastered ? "Mastered" : "Mark Mastered"}
          </Button>

          <span className="text-xs font-mono font-bold text-slate-400 px-2">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleNext}
          className="h-8 text-xs rounded-xl gap-1 text-slate-400 hover:text-white"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
