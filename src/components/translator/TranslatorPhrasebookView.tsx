import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  Volume2,
  Copy,
  Check,
  Search,
  Compass,
  Utensils,
  Hotel,
  AlertOctagon,
  ShoppingBag,
  Briefcase,
  Smile,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
  getSpeechCode,
} from "./TranslatorLanguages";

interface PhraseItem {
  id: string;
  source: string;
  category: string;
}

const PHRASE_CATEGORIES = [
  { id: "all", name: "All Phrases", icon: Zap },
  { id: "greetings", name: "Greetings & Basics", icon: Smile },
  { id: "travel", name: "Transit & Travel", icon: Compass },
  { id: "dining", name: "Food & Dining", icon: Utensils },
  { id: "hotel", name: "Hotel & Stay", icon: Hotel },
  { id: "emergency", name: "Health & Emergency", icon: AlertOctagon },
  { id: "shopping", name: "Shopping & Money", icon: ShoppingBag },
  { id: "business", name: "Business & Work", icon: Briefcase },
];

const MASTER_PHRASES: PhraseItem[] = [
  { id: "p1", source: "Hello! Nice to meet you.", category: "greetings" },
  { id: "p2", source: "Please and thank you very much.", category: "greetings" },
  { id: "p3", source: "Do you speak English?", category: "greetings" },
  { id: "p4", source: "Excuse me, where is the train station?", category: "travel" },
  { id: "p5", source: "How much is a ticket to the city center?", category: "travel" },
  { id: "p6", source: "Can I see the menu, please?", category: "dining" },
  { id: "p7", source: "I would like water and the vegetarian dish.", category: "dining" },
  { id: "p8", source: "Could we please have the bill / check?", category: "dining" },
  { id: "p9", source: "I have a reservation under this name.", category: "hotel" },
  { id: "p10", source: "What time is checkout tomorrow morning?", category: "hotel" },
  { id: "p11", source: "Please help me! I need a doctor immediately.", category: "emergency" },
  { id: "p12", source: "Where is the nearest pharmacy or hospital?", category: "emergency" },
  { id: "p13", source: "How much does this cost?", category: "shopping" },
  { id: "p14", source: "Do you accept credit cards or mobile pay?", category: "shopping" },
  { id: "p15", source: "We are glad to collaborate with your organization.", category: "business" },
];

export const TranslatorPhrasebookView: React.FC = () => {
  const { toast } = useToast();

  const [targetLang, setTargetLang] = useState("es");
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Playback
  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechCode(targetLang);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied Phrase" });
  };

  const filteredPhrases = MASTER_PHRASES.filter((p) => {
    const matchesCat = selectedCat === "all" || p.category === selectedCat;
    const matchesSearch = p.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Controls: Language & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Survival Phrasebook
          </span>
          <span className="text-xs text-muted-foreground">· Translate to:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-muted/80 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search phrase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/50">
        {PHRASE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCat === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Phrase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPhrases.map((phrase) => (
          <div
            key={phrase.id}
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {phrase.category}
              </span>
              <p className="text-sm font-semibold text-foreground">{phrase.source}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground font-mono">
                {getLanguageFlag(targetLang)} {getLanguageName(targetLang)}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSpeak(phrase.source)}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(phrase.id, phrase.source)}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                  title="Copy phrase"
                >
                  {copiedId === phrase.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
