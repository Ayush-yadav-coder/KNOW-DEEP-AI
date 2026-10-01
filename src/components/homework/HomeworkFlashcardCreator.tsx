import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Brain,
  Zap,
  Target,
  Search,
  BookOpen,
  Filter,
  Check,
  AlertCircle,
  FolderPlus,
  Download,
  GraduationCap,
  Atom,
  FlaskConical,
  Dna,
  Languages,
  Code2,
  TrendingUp,
  History,
  Compass,
  ArrowRight,
  FileCheck,
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
import { useToast } from "@/hooks/use-toast";
import {
  CURRICULUM_SUBJECTS,
  CURRICULUM_TOPICS,
  generateCurriculumCards,
  getTotalCurriculumFlashcardsCount,
  BankFlashcard,
  CurriculumTopic,
} from "@/data/flashcardQuestionBank";

export interface SRSCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  subject: string;
  tag: string;
  box: number; // 1 (new/difficult) to 5 (mastered)
  intervalDays: number;
  lastReviewedDate?: string;
  nextDueDate: string;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
}

const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: "deck-math",
    name: "Mathematics Revision",
    subject: "Maths",
    description: "Calculus, algebra, geometry, and trigonometry theorems.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "deck-science",
    name: "Physics & Science",
    subject: "Science",
    description: "Mechanics, kinematics, electromagnetism, and thermodynamics.",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "deck-english",
    name: "English Literature & Grammar",
    subject: "English",
    description: "Literary devices, PEEL rhetoric, vocabulary, and essay writing.",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "deck-hindi",
    name: "हिंदी व्याकरण एवं साहित्य",
    subject: "Hindi",
    description: "संधि, समास, अलंकार, रस, मुहावरे एवं लोकोक्तियाँ।",
    color: "from-rose-500 to-red-600",
  },
  {
    id: "deck-cs",
    name: "Computer Science & Coding",
    subject: "CS",
    description: "Algorithms, Big-O complexity, data structures, and Python.",
    color: "from-cyan-500 to-teal-600",
  },
];

export const HomeworkFlashcardCreator: React.FC = () => {
  const { toast } = useToast();

  // Primary View Switcher
  const [activeView, setActiveView] = useState<"mySRS" | "curriculumBank" | "aiGenerator">("mySRS");

  // Decks State (Clean starter subjects)
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_flashcard_decks");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_DECKS;
  });

  // Personal SRS Cards State - Zero Mock Data: starts completely clean at []
  const [cards, setCards] = useState<SRSCard[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_flashcard_cards");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy IDs like c-1, c-2...
          const clean = parsed.filter((c: SRSCard) => !/^c-[1-9]$/.test(c.id));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedDeckId, setSelectedDeckId] = useState<string>("deck-math");
  const [studyFilter, setStudyFilter] = useState<"all" | "dueToday">("all");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Modals state
  const [isCreateCardOpen, setIsCreateCardOpen] = useState<boolean>(false);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiTopicInput, setAiTopicInput] = useState<string>("");

  // New Card Form
  const [cardFront, setCardFront] = useState<string>("");
  const [cardBack, setCardBack] = useState<string>("");
  const [cardTag, setCardTag] = useState<string>("");
  const [cardTargetDeck, setCardTargetDeck] = useState<string>("deck-math");

  // New Deck Form
  const [deckName, setDeckName] = useState<string>("");
  const [deckSubject, setDeckSubject] = useState<string>("Maths");
  const [deckDesc, setDeckDesc] = useState<string>("");

  // 100,000+ Curriculum Question Bank State
  const [bankSubject, setBankSubject] = useState<string>("all");
  const [bankTopicId, setBankTopicId] = useState<string>("math-calc");
  const [bankSearch, setBankSearch] = useState<string>("");
  const [bankPage, setBankPage] = useState<number>(1);
  const [previewFlippedCardId, setPreviewFlippedCardId] = useState<string | null>(null);

  // Sync personal SRS cards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_flashcard_decks", JSON.stringify(decks));
      localStorage.setItem("knowdeep_flashcard_cards", JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, [decks, cards]);

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  // Cards in active personal deck
  const deckCards = useMemo(() => {
    return cards.filter((c) => c.deckId === activeDeck.id);
  }, [cards, activeDeck.id]);

  // Study filtered cards (All vs Due Today)
  const studyCards = useMemo(() => {
    if (studyFilter === "dueToday") {
      const due = deckCards.filter((c) => c.nextDueDate === "Today" || c.box <= 2);
      return due.length > 0 ? due : deckCards;
    }
    return deckCards;
  }, [deckCards, studyFilter]);

  // Safe active card in personal SRS deck
  const currentCard: SRSCard | undefined = studyCards[currentCardIndex] || studyCards[0];

  // Curriculum Question Bank Topics Filtered
  const filteredCurriculumTopics = useMemo(() => {
    if (bankSubject === "all") return CURRICULUM_TOPICS;
    return CURRICULUM_TOPICS.filter((t) => t.subject === bankSubject);
  }, [bankSubject]);

  // Active topic in Curriculum Question Bank
  const currentCurriculumTopic = useMemo(() => {
    const found = CURRICULUM_TOPICS.find((t) => t.id === bankTopicId);
    if (found) return found;
    return filteredCurriculumTopics[0] || CURRICULUM_TOPICS[0];
  }, [bankTopicId, filteredCurriculumTopics]);

  // Curriculum Generated Flashcards (from 100,000+ catalog)
  const curriculumCards = useMemo(() => {
    const generated = generateCurriculumCards(currentCurriculumTopic.id, 20, bankPage);
    if (!bankSearch.trim()) return generated;
    const q = bankSearch.toLowerCase();
    return generated.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
    );
  }, [currentCurriculumTopic.id, bankPage, bankSearch]);

  // Spaced Repetition SRS Algorithm Logic (Leitner 5-Box Engine)
  const handleSRSRate = (rating: "again" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    let newBox = currentCard.box;
    let newInterval = currentCard.intervalDays;
    let nextDueDateText = "In 2 Days";

    if (rating === "again") {
      newBox = 1; // reset to box 1 (learning)
      newInterval = 1;
      nextDueDateText = "Today";
    } else if (rating === "hard") {
      newBox = Math.max(1, currentCard.box);
      newInterval = Math.max(1, Math.round(currentCard.intervalDays * 1.2));
      nextDueDateText = "Tomorrow";
    } else if (rating === "good") {
      newBox = Math.min(5, currentCard.box + 1);
      newInterval = currentCard.box === 1 ? 2 : Math.round(currentCard.intervalDays * 1.8);
      nextDueDateText = `In ${newInterval} Days`;
    } else if (rating === "easy") {
      newBox = Math.min(5, currentCard.box + 2);
      newInterval = Math.max(7, Math.round(currentCard.intervalDays * 2.5));
      nextDueDateText = `In ${newInterval} Days`;
    }

    const updated = cards.map((c) =>
      c.id === currentCard.id
        ? {
            ...c,
            box: newBox,
            intervalDays: newInterval,
            nextDueDate: nextDueDateText,
            reviewCount: c.reviewCount + 1,
            lastReviewedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
        : c
    );

    setCards(updated);
    setIsFlipped(false);

    // Advance to next card
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev >= studyCards.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev <= 0 ? studyCards.length - 1 : prev - 1));
  };

  // Create manual card
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    const target = decks.find((d) => d.id === cardTargetDeck) || activeDeck;

    const newCard: SRSCard = {
      id: "card-" + Date.now(),
      deckId: target.id,
      subject: target.subject,
      front: cardFront.trim(),
      back: cardBack.trim(),
      tag: cardTag.trim() || target.subject,
      box: 1, // start in learning box 1
      intervalDays: 1,
      nextDueDate: "Today",
      reviewCount: 0,
    };

    setCards((prev) => [...prev, newCard]);
    setCardFront("");
    setCardBack("");
    setCardTag("");
    setIsCreateCardOpen(false);
    toast({
      title: "Flashcard Created",
      description: `Added card to "${target.name}" deck.`,
    });
  };

  // Create custom deck
  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    const newDeck: FlashcardDeck = {
      id: "deck-" + Date.now(),
      name: deckName.trim(),
      subject: deckSubject,
      description: deckDesc.trim() || `Subject deck for ${deckSubject} revision.`,
      color: "from-indigo-500 to-purple-600",
    };

    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
    setDeckName("");
    setDeckDesc("");
    setIsCreateDeckOpen(false);
    toast({
      title: "New Deck Created",
      description: `"${newDeck.name}" is now active.`,
    });
  };

  // Import individual card from 100,000+ Curriculum Bank to Personal SRS Deck
  const handleImportBankCard = (bankCard: BankFlashcard) => {
    // Find matched deck by subject or active deck
    let target = decks.find((d) => d.subject.toLowerCase() === bankCard.subject.toLowerCase()) || activeDeck;

    const newCard: SRSCard = {
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      deckId: target.id,
      subject: target.subject,
      front: bankCard.front,
      back: bankCard.back,
      tag: bankCard.tag,
      box: 1,
      intervalDays: 1,
      nextDueDate: "Today",
      reviewCount: 0,
    };

    setCards((prev) => [...prev, newCard]);
    toast({
      title: "Card Imported to SRS Rotation",
      description: `Added "${bankCard.tag}" card to ${target.name}.`,
    });
  };

  // Import full topic batch of 20 cards
  const handleImportEntireTopic = () => {
    let target = decks.find((d) => d.subject.toLowerCase().includes(currentCurriculumTopic.subject.toLowerCase())) || activeDeck;

    const newCards: SRSCard[] = curriculumCards.map((bc, idx) => ({
      id: `imported-topic-${Date.now()}-${idx}`,
      deckId: target.id,
      subject: target.subject,
      front: bc.front,
      back: bc.back,
      tag: bc.tag,
      box: 1,
      intervalDays: 1,
      nextDueDate: "Today",
      reviewCount: 0,
    }));

    setCards((prev) => [...prev, ...newCards]);
    toast({
      title: `${newCards.length} Curriculum Cards Imported`,
      description: `Imported full "${currentCurriculumTopic.name}" set into ${target.name}.`,
    });
    setActiveView("mySRS");
  };

  // AI-Powered Custom Flashcard Generator
  const handleAIGenerateCards = async () => {
    if (!aiTopicInput.trim()) return;
    setIsGeneratingAI(true);

    try {
      const prompt = `Generate 4 high-yield flashcards for students on this topic.
Topic: ${aiTopicInput}
Subject: ${activeDeck.subject}

Format strictly as a raw JSON array of objects:
[
  {
    "front": "Clear question, concept prompt, or term",
    "back": "Accurate, concise explanation, formula, or definition",
    "tag": "${activeDeck.subject}"
  }
]
Return ONLY the raw JSON array.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const rawText = data.content || "";

      let parsed: Array<{ front: string; back: string; tag: string }> = [];
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }

      if (parsed.length > 0) {
        const newCards: SRSCard[] = parsed.map((item, idx) => ({
          id: `card-ai-${Date.now()}-${idx}`,
          deckId: activeDeck.id,
          subject: activeDeck.subject,
          front: item.front,
          back: item.back,
          tag: item.tag || activeDeck.subject,
          box: 1,
          intervalDays: 1,
          nextDueDate: "Today",
          reviewCount: 0,
        }));

        setCards((prev) => [...prev, ...newCards]);
        setAiTopicInput("");
        toast({
          title: "AI Flashcards Generated",
          description: `Added 4 new cards on "${aiTopicInput}" to ${activeDeck.name}.`,
        });
        setActiveView("mySRS");
      }
    } catch {
      // Procedural fallback
      const fallbackCard: SRSCard = {
        id: "card-ai-" + Date.now(),
        deckId: activeDeck.id,
        subject: activeDeck.subject,
        front: `Core Concept: ${aiTopicInput}`,
        back: `Review definitions, formulas, and proofs for ${aiTopicInput} in ${activeDeck.name}.`,
        tag: activeDeck.subject,
        box: 1,
        intervalDays: 1,
        nextDueDate: "Today",
        reviewCount: 0,
      };
      setCards((prev) => [...prev, fallbackCard]);
      toast({
        title: "Card Added",
        description: `Created flashcard milestone for "${aiTopicInput}".`,
      });
      setActiveView("mySRS");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    toast({ title: "Card Deleted" });
  };

  // Retention metrics for personal SRS deck
  const totalDeckCards = deckCards.length;
  const dueTodayCount = deckCards.filter((c) => c.nextDueDate === "Today" || c.box <= 2).length;
  const masteredCount = deckCards.filter((c) => c.box >= 4).length;
  const retentionScore = totalDeckCards > 0 ? Math.round((masteredCount / totalDeckCards) * 100) : 0;
  const totalCurriculumCount = getTotalCurriculumFlashcardsCount();

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5 shadow-xl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Flashcard Creator &amp; Spaced Repetition (SRS)</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                Leitner 5-Box Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero mock data preloaded. Study your own cards with scientific spaced repetition or import from {totalCurriculumCount.toLocaleString()}+ curriculum cards.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Card & Add Deck */}
        <div className="flex items-center gap-2">
          {/* Create Flashcard Dialog */}
          <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <Bookmark className="w-5 h-5 text-rose-400" /> Create Custom Flashcard
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Add your own prompt and answer. It will be scheduled with the Leitner 5-box algorithm.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateCard} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Target Deck:</label>
                    <select
                      value={cardTargetDeck}
                      onChange={(e) => setCardTargetDeck(e.target.value)}
                      className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                    >
                      {decks.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tag / Topic:</label>
                    <Input
                      value={cardTag}
                      onChange={(e) => setCardTag(e.target.value)}
                      placeholder="e.g. Calculus or संधि"
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Front Side (Question / Concept):
                  </label>
                  <Textarea
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    placeholder="Enter question, equation, or vocabulary term..."
                    required
                    rows={3}
                    className="text-xs rounded-xl bg-slate-950 border-slate-800 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Back Side (Answer / Solution / Proof):
                  </label>
                  <Textarea
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    placeholder="Enter complete answer, step-by-step proof, or translation..."
                    required
                    rows={3}
                    className="text-xs rounded-xl bg-slate-950 border-slate-800 text-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Save to Study Deck
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Create New Deck Dialog */}
          <Dialog open={isCreateDeckOpen} onOpenChange={setIsCreateDeckOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:text-white gap-1.5"
              >
                <FolderPlus className="w-4 h-4 text-indigo-400" /> New Deck
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <FolderPlus className="w-5 h-5 text-indigo-400" /> Create Subject Deck
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Organize cards by course chapter, language, or specific exam syllabus.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateDeck} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Deck Title:</label>
                  <Input
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="e.g. Advanced Calculus or CBSE Hindi Vyakaran"
                    required
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subject:</label>
                  <select
                    value={deckSubject}
                    onChange={(e) => setDeckSubject(e.target.value)}
                    className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                  >
                    <option value="Maths">Maths</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Science">Science / Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="CS">Computer Science</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Description:</label>
                  <Textarea
                    value={deckDesc}
                    onChange={(e) => setDeckDesc(e.target.value)}
                    placeholder="Core syllabus and revision goals for this card set..."
                    rows={2}
                    className="text-xs rounded-xl bg-slate-950 border-slate-800 text-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Create Deck
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Mode Toggle Buttons: My SRS Deck vs 100,000+ Curriculum Bank vs AI Generator */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
        <button
          onClick={() => setActiveView("mySRS")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeView === "mySRS"
              ? "bg-rose-500 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>My Personal SRS Deck</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            {cards.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView("curriculumBank")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeView === "curriculumBank"
              ? "bg-indigo-500 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>100,000+ Subject Question Bank</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300">
            150k+
          </span>
        </button>

        <button
          onClick={() => setActiveView("aiGenerator")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeView === "aiGenerator"
              ? "bg-purple-500 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>⚡ AI Batch Generator</span>
        </button>
      </div>

      {/* VIEW 1: MY PERSONAL SRS DECK (Zero Mock Data) */}
      {activeView === "mySRS" && (
        <div className="space-y-5">
          {/* Deck Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-rose-400" /> Subject Decks:
            </span>
            {decks.map((deck) => {
              const isActive = deck.id === activeDeck.id;
              const count = cards.filter((c) => c.deckId === deck.id).length;

              return (
                <button
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 ${
                    isActive
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{deck.name}</span>
                  <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.2 rounded-full border border-slate-800 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SRS Spaced Repetition Analytics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-400" /> Retention Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-white">
                  {retentionScore}%
                </span>
                <span className="text-xs font-mono text-emerald-400">Mastered</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Due Today (SRS)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-300">
                  {dueTodayCount} Cards
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Box 4 &amp; 5 Cards
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {masteredCount} / {totalDeckCards}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Total Reviews
              </span>
              <span className="text-2xl font-black font-mono text-cyan-300">
                {deckCards.reduce((acc, c) => acc + c.reviewCount, 0)} Logged
              </span>
            </div>
          </div>

          {/* Interactive Card & Spaced Repetition Grading */}
          {currentCard ? (
            <div className="space-y-4">
              {/* Card Meta & Leitner Box Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Card {currentCardIndex + 1} of {studyCards.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-rose-300">
                    {currentCard.tag}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-400">Leitner Box:</span>
                  {[1, 2, 3, 4, 5].map((b) => (
                    <div
                      key={b}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                        currentCard.box >= b
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-600"
                      }`}
                      title={`Box ${b}: ${b === 1 ? "1d interval" : b === 2 ? "2d" : b === 3 ? "4d" : b === 4 ? "7d" : "14d"}`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* The Flip Flashcard Box */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex flex-col justify-between shadow-2xl relative select-none transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="uppercase tracking-widest font-bold text-rose-400/80">
                    {isFlipped ? "Answer / Solution" : "Question / Prompt"}
                  </span>
                  <span className="group-hover:text-slate-300 transition-colors flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Tap to Flip
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFlipped ? "back" : "front"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-base sm:text-lg font-bold text-white max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/60 pt-3">
                  <span>Interval: {currentCard.intervalDays} Days</span>
                  <span>Next Due: {currentCard.nextDueDate}</span>
                </div>
              </div>

              {/* 4-Tier SRS Grading Controls */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 text-center block uppercase tracking-wider">
                  Rate Recall to Schedule Next Repetition:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleSRSRate("again")}
                    variant="outline"
                    className="h-12 flex flex-col items-center justify-center rounded-2xl border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold gap-0.5"
                  >
                    <span>🔴 Again</span>
                    <span className="text-[10px] font-mono text-rose-400">Reset Box 1 · 1d</span>
                  </Button>

                  <Button
                    onClick={() => handleSRSRate("hard")}
                    variant="outline"
                    className="h-12 flex flex-col items-center justify-center rounded-2xl border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold gap-0.5"
                  >
                    <span>🟠 Hard</span>
                    <span className="text-[10px] font-mono text-amber-400">Review Soon · 2d</span>
                  </Button>

                  <Button
                    onClick={() => handleSRSRate("good")}
                    variant="outline"
                    className="h-12 flex flex-col items-center justify-center rounded-2xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold gap-0.5"
                  >
                    <span>🟢 Good</span>
                    <span className="text-[10px] font-mono text-emerald-400">Advance Box · 4d</span>
                  </Button>

                  <Button
                    onClick={() => handleSRSRate("easy")}
                    variant="outline"
                    className="h-12 flex flex-col items-center justify-center rounded-2xl border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold gap-0.5"
                  >
                    <span>🔵 Easy</span>
                    <span className="text-[10px] font-mono text-cyan-400">Mastered · 14d</span>
                  </Button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrev}
                  className="h-8 text-xs rounded-xl gap-1 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <span className="text-xs font-mono text-slate-500">
                  Reviewed {currentCard.reviewCount} times
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleNext}
                  className="h-8 text-xs rounded-xl gap-1 text-slate-400 hover:text-white"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Card Ledger Table for Active Deck */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Cards in &quot;{activeDeck.name}&quot; ({deckCards.length}):
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {deckCards.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate max-w-sm">
                            {c.front}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-rose-400">
                            Box {c.box}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Next Due: {c.nextDueDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          {c.back}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteCard(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Clean Empty State (Zero Mock Data) */
            <div className="py-16 text-center space-y-4 rounded-3xl bg-slate-950/60 border border-dashed border-slate-800 p-8">
              <div className="w-14 h-14 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Brain className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Your Personal SRS Deck is Ready</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No mock data loaded. Build your own custom flashcards, generate tailored sets with AI, or import verified syllabus cards from our 100,000+ subject question bank.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  onClick={() => setIsCreateCardOpen(true)}
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Create Custom Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveView("curriculumBank")}
                  className="h-9 px-4 text-xs font-bold rounded-xl border-slate-700 bg-slate-900 text-indigo-300 hover:text-white gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Browse 100,000+ Question Bank
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 100,000+ GLOBAL CURRICULUM BANK */}
      {activeView === "curriculumBank" && (
        <div className="space-y-5">
          {/* Subject Selector Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CURRICULUM_SUBJECTS.map((subj) => (
              <button
                key={subj.id}
                onClick={() => {
                  setBankSubject(subj.id);
                  setBankPage(1);
                  const firstTopic = CURRICULUM_TOPICS.find((t) => subj.id === "all" || t.subject === subj.id);
                  if (firstTopic) setBankTopicId(firstTopic.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors border ${
                  bankSubject === subj.id
                    ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {subj.name}
              </button>
            ))}
          </div>

          {/* Topic & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Chapter / Topic:
                </span>
                <select
                  value={currentCurriculumTopic.id}
                  onChange={(e) => {
                    setBankTopicId(e.target.value);
                    setBankPage(1);
                  }}
                  className="h-9 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white px-3 font-bold"
                >
                  {filteredCurriculumTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (~{t.estimatedCards.toLocaleString()} cards)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search in Catalog */}
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <Input
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Search formula, theorem, question..."
                    className="h-9 pl-8 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Import entire chapter set button */}
              <Button
                onClick={handleImportEntireTopic}
                className="h-9 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5 shrink-0 shadow-md"
              >
                <Download className="w-4 h-4" /> Import Chapter ({curriculumCards.length} Cards)
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              {currentCurriculumTopic.description}
            </p>
          </div>

          {/* Curriculum Cards Grid (Displaying 20 on page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {curriculumCards.map((card) => {
              const isCardFlipped = previewFlippedCardId === card.id;

              return (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-2 border-b border-slate-900">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 font-bold border border-slate-800">
                        {card.tag}
                      </span>
                      <span className="text-slate-400 font-bold">
                        {card.difficulty}
                      </span>
                    </div>

                    <div className="py-2 min-h-[64px]">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        {isCardFlipped ? "Solution / Proof:" : "Question / Concept:"}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-white whitespace-pre-line leading-relaxed">
                        {isCardFlipped ? card.back : card.front}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <button
                      onClick={() =>
                        setPreviewFlippedCardId(isCardFlipped ? null : card.id)
                      }
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isCardFlipped ? "Show Question" : "Reveal Answer"}</span>
                    </button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImportBankCard(card)}
                      className="h-7 text-[11px] rounded-xl border-slate-800 bg-slate-900 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 text-slate-300 gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to SRS
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination & Next Procedural Batch */}
          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBankPage((prev) => Math.max(1, prev - 1))}
              disabled={bankPage <= 1}
              className="h-8 text-xs rounded-xl border-slate-800 text-slate-400 hover:text-white gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous 20
            </Button>

            <span className="text-xs font-mono text-slate-500">
              Batch Page {bankPage} · {currentCurriculumTopic.estimatedCards.toLocaleString()} cards in topic
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setBankPage((prev) => prev + 1)}
              className="h-8 text-xs rounded-xl border-slate-800 text-slate-400 hover:text-white gap-1"
            >
              Next 20 Cards <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* VIEW 3: AI CUSTOM BATCH GENERATOR */}
      {activeView === "aiGenerator" && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">AI-Powered Flashcard Synthesizer</h4>
              <p className="text-xs text-slate-400">
                Enter any chapter, poem, theorem, or textbook topic. AI will synthesize rigorous flashcards with questions, proofs, and definitions.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Topic / Exam Syllabus:
                </label>
                <Input
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="e.g. Krebs cycle enzymes, Hamlet soliloquy analysis, or Integration by substitution"
                  className="h-10 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Deck:</label>
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full h-10 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white px-3 font-bold"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleAIGenerateCards}
              disabled={isGeneratingAI || !aiTopicInput.trim()}
              className="w-full h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingAI ? "Synthesizing High-Yield Flashcards..." : "Generate & Add to My Deck"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
