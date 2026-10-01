import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import {
  Languages,
  Sparkles,
  Volume2,
  CheckCircle2,
  Mic,
  BookOpen,
  Target,
  MessageSquare,
  BookMarked,
  History,
  Trash2,
  Bookmark,
  RotateCcw,
  X,
  Search,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  TranslatorTab,
  TranslationHistoryItem,
} from "@/components/translator/TranslatorTypes";
import { TranslatorLiveView } from "@/components/translator/TranslatorLiveView";
import { TranslatorGrammarView } from "@/components/translator/TranslatorGrammarView";
import { TranslatorVoiceTrainerView } from "@/components/translator/TranslatorVoiceTrainerView";
import { TranslatorDictionaryView } from "@/components/translator/TranslatorDictionaryView";
import { TranslatorPracticeView } from "@/components/translator/TranslatorPracticeView";
import { TranslatorConversationView } from "@/components/translator/TranslatorConversationView";
import { TranslatorPhrasebookView } from "@/components/translator/TranslatorPhrasebookView";
import {
  getLanguageName,
  getLanguageFlag,
} from "@/components/translator/TranslatorLanguages";

const TABS: { id: TranslatorTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "translate", label: "Translate", icon: Languages },
  { id: "grammar", label: "Grammar & Tone", icon: CheckCircle2 },
  { id: "voice-trainer", label: "Voice Trainer", icon: Mic, badge: "AI Speech" },
  { id: "dictionary", label: "Dictionary", icon: BookOpen },
  { id: "practice", label: "Grammar Practice", icon: Target, badge: "Quizzes" },
  { id: "conversation", label: "Live Conversation", icon: MessageSquare },
  { id: "phrasebook", label: "Phrasebook", icon: BookMarked },
];

export default function Translator() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TranslatorTab>("translate");

  // Cross-module states
  const [crossPhrase, setCrossPhrase] = useState<string>("");
  const [crossLang, setCrossLang] = useState<string>("en");

  // Translation History
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_translator_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_translator_history", JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn("Could not save history:", e);
    }
  }, [history]);

  const handleAddHistory = (item: Omit<TranslationHistoryItem, "id" | "timestamp">) => {
    const newItem: TranslationHistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({ title: "History Cleared" });
  };

  // Cross-linking handlers
  const handleOpenVoiceTrainerForPhrase = (phrase: string, lang: string) => {
    setCrossPhrase(phrase);
    setCrossLang(lang);
    setActiveTab("voice-trainer");
    toast({
      title: "Voice Trainer Activated",
      description: `Loaded phrase in ${getLanguageName(lang)} for pronunciation training.`,
    });
  };

  const handleOpenDictionaryForWord = (word: string, lang: string) => {
    setCrossPhrase(word);
    setCrossLang(lang);
    setActiveTab("dictionary");
  };

  const filteredHistory = history.filter(
    (h) =>
      h.sourceText.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.translatedText.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-3.5rem)] pt-16 pb-12 px-3 sm:px-6 lg:px-8 bg-background relative selection:bg-primary/20">
        {/* Background ambient lighting */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Main Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                    <span>Translator</span>
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">
                    Universal AI Multilingual Translator, Grammar Studio, Voice Pronunciation Trainer & Lexicon
                  </p>
                </div>
              </div>
            </div>

            {/* History Trigger */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="h-9 gap-1.5 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted/80"
              >
                <History className="w-4 h-4 text-primary" />
                <span>History ({history.length})</span>
              </Button>
            </div>
          </div>

          {/* Clean Segmented Navigation Tabs (Anti-Slop Zero-Pill Compliant) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-card/80 border border-border/70 rounded-2xl overflow-x-auto shadow-xs backdrop-blur-md">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary rounded-md font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE TAB CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "translate" && (
                <TranslatorLiveView
                  onAddHistory={handleAddHistory}
                  onOpenDictionaryForWord={handleOpenDictionaryForWord}
                  onOpenVoiceTrainerForPhrase={handleOpenVoiceTrainerForPhrase}
                />
              )}

              {activeTab === "grammar" && (
                <TranslatorGrammarView
                  initialText={crossPhrase}
                  onOpenVoiceTrainer={handleOpenVoiceTrainerForPhrase}
                />
              )}

              {activeTab === "voice-trainer" && (
                <TranslatorVoiceTrainerView
                  initialPhrase={crossPhrase}
                  initialLang={crossLang}
                />
              )}

              {activeTab === "dictionary" && (
                <TranslatorDictionaryView
                  initialWord={crossPhrase}
                  initialLang={crossLang}
                  onOpenVoiceTrainer={handleOpenVoiceTrainerForPhrase}
                />
              )}

              {activeTab === "practice" && (
                <TranslatorPracticeView initialLang={crossLang} />
              )}

              {activeTab === "conversation" && (
                <TranslatorConversationView
                  initialLangA="en"
                  initialLangB={crossLang === "en" ? "es" : crossLang}
                />
              )}

              {activeTab === "phrasebook" && <TranslatorPhrasebookView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Translation History Drawer */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end"
              onClick={() => setIsHistoryOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-foreground">Translation History</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search History */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/60 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* History List */}
                  <div className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-2.5 pr-1">
                    {filteredHistory.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs italic">
                        No translation history found.
                      </div>
                    ) : (
                      filteredHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 hover:border-primary/40 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                            <span>
                              {getLanguageFlag(item.sourceLang)} {getLanguageName(item.sourceLang)} →{" "}
                              {getLanguageFlag(item.targetLang)} {getLanguageName(item.targetLang)}
                            </span>
                            <span className="font-normal opacity-70">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-foreground/80 line-clamp-2">
                            "{item.sourceText}"
                          </p>
                          <p className="text-xs font-semibold text-primary line-clamp-2">
                            {item.translatedText}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="pt-3 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      className="w-full h-9 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 border-rose-500/30 gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All History</span>
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
