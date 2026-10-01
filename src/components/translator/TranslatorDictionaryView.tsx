import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Award,
  Trash2,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  POPULAR_LANGUAGES,
  getLanguageName,
  getLanguageFlag,
  getSpeechCode,
} from "./TranslatorLanguages";
import { DictionaryEntry, VocabCard } from "./TranslatorTypes";
import { safeParseJson } from "./TranslatorUtils";

interface TranslatorDictionaryViewProps {
  initialWord?: string;
  initialLang?: string;
  onOpenVoiceTrainer?: (word: string, lang: string) => void;
}

const DEFAULT_SAMPLE_ENTRY: DictionaryEntry = {
  word: "Serendipity",
  language: "en",
  phoneticIpa: "/ˌsɛr.ənˈdɪp.ɪ.ti/",
  partOfSpeech: ["Noun"],
  primaryMeaning: "The occurrence and development of events by chance in a happy or beneficial way.",
  definitions: [
    {
      partOfSpeech: "Noun",
      definition: "The faculty or phenomenon of finding valuable or agreeable things not sought for.",
      example: "A fortunate stroke of serendipity brought the two researchers together at the conference.",
      translatedExample: "Un afortunado golpe de serendipia reunió a los dos investigadores en la conferencia.",
    },
    {
      partOfSpeech: "Noun",
      definition: "Good fortune or luck in making unexpected, pleasant discoveries.",
      example: "Finding that rare vintage record in a dusty shop was pure serendipity.",
      translatedExample: "Encontrar ese disco raro en una tienda polvorienta fue pura casualidad afortunada.",
    },
  ],
  synonyms: ["coincidence", "happy accident", "fluke", "providence", "good fortune", "luck"],
  antonyms: ["misfortune", "adversity", "bad luck", "calamity"],
  idiomsAndPhrases: [
    { phrase: "A stroke of serendipity", meaning: "A sudden fortunate occurrence that happens by chance" },
    { phrase: "Pure serendipity", meaning: "Completely accidental yet wonderful discovery" },
  ],
  etymology: "Coined in 1754 by Horace Walpole from the Persian fairy tale 'The Three Princes of Serendip' (Sri Lanka).",
  collocations: ["pure serendipity", "stroke of serendipity", "sheer serendipity", "serendipity played a role"],
  isSaved: false,
};

const INITIAL_VOCAB_BANK: VocabCard[] = [
  {
    id: "v1",
    word: "Serendipity",
    language: "en",
    meaning: "Finding valuable or agreeable things not sought for.",
    phonetic: "/ˌsɛr.ənˈdɪp.ɪ.ti/",
    partOfSpeech: "Noun",
    example: "Finding that vintage book was pure serendipity.",
    addedAt: Date.now() - 86400000 * 2,
    masteryLevel: 3,
  },
  {
    id: "v2",
    word: "Éphémère",
    language: "fr",
    meaning: "Lasting for a very short time; fleeting.",
    phonetic: "/e.fe.mɛʁ/",
    partOfSpeech: "Adjective",
    example: "La beauté éphémère d'un coucher de soleil.",
    addedAt: Date.now() - 86400000 * 5,
    masteryLevel: 4,
  },
  {
    id: "v3",
    word: "Sobremesa",
    language: "es",
    meaning: "The time spent lingering around the table engaged in conversation after a meal.",
    phonetic: "/so.βɾeˈme.sa/",
    partOfSpeech: "Noun",
    example: "Disfrutamos de una larga sobremesa con la familia.",
    addedAt: Date.now() - 86400000 * 1,
    masteryLevel: 2,
  },
];

export const TranslatorDictionaryView: React.FC<TranslatorDictionaryViewProps> = ({
  initialWord = "",
  initialLang = "en",
  onOpenVoiceTrainer,
}) => {
  const { toast } = useToast();

  const [searchWord, setSearchWord] = useState(initialWord || "Serendipity");
  const [selectedLang, setSelectedLang] = useState(initialLang || "en");
  const [isSearching, setIsSearching] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(DEFAULT_SAMPLE_ENTRY);

  // Vocab Bank State & Flashcard Mode
  const [vocabBank, setVocabBank] = useState<VocabCard[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_vocab_bank");
      return stored ? JSON.parse(stored) : INITIAL_VOCAB_BANK;
    } catch {
      return INITIAL_VOCAB_BANK;
    }
  });
  const [activeTab, setActiveTab] = useState<"lookup" | "bank" | "flashcards">("lookup");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Persist Vocab Bank
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_vocab_bank", JSON.stringify(vocabBank));
    } catch (e) {
      console.warn("Could not save vocab bank:", e);
    }
  }, [vocabBank]);

  // Audio Pronunciation TTS
  const handlePlayAudio = (text: string, lang: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const code = getSpeechCode(lang);
    utterance.lang = code;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Perform Dictionary Lookup
  const handleSearch = async (termToSearch = searchWord, lang = selectedLang) => {
    if (!termToSearch.trim()) return;

    setIsSearching(true);
    const langName = getLanguageName(lang);

    try {
      const prompt = `You are an Oxford/Cambridge-level computational lexicographer and multilingual dictionary engine.
Provide an in-depth dictionary entry for the word "${termToSearch}" in ${langName}.

Output STRICT JSON conforming to this schema:
{
  "word": "${termToSearch}",
  "language": "${lang}",
  "phoneticIpa": "accurate IPA phonetic transcription",
  "partOfSpeech": ["Noun", "Verb", ...],
  "primaryMeaning": "concise 1-sentence primary definition",
  "definitions": [
    {
      "partOfSpeech": "Noun",
      "definition": "detailed definition",
      "example": "real-world sentence demonstrating usage",
      "translatedExample": "bilingual translation of the example sentence"
    }
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4"],
  "antonyms": ["antonym1", "antonym2"],
  "idiomsAndPhrases": [
    { "phrase": "common idiom using this word", "meaning": "meaning of the idiom" }
  ],
  "etymology": "fascinating etymology / root origin of the word",
  "collocations": ["collocation1", "collocation2", "collocation3"]
}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction:
            "You are a dictionary engine. Respond exclusively with valid JSON conforming to the requested schema.",
        }),
      });

      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      let textResponse = data.content || data.text || "";

      const parsed = safeParseJson<DictionaryEntry>(textResponse, {
        word: termToSearch,
        language: lang,
        phoneticIpa: "",
        partOfSpeech: ["Noun"],
        primaryMeaning: "",
        definitions: [],
        synonyms: [],
        antonyms: [],
        idiomsAndPhrases: [],
        collocations: []
      });
      const isSaved = vocabBank.some(
        (v) => v.word.toLowerCase() === parsed.word.toLowerCase() && v.language === parsed.language
      );
      setCurrentEntry({ ...parsed, isSaved });
      setActiveTab("lookup");
    } catch (err) {
      console.error("Dictionary lookup error:", err);
      toast({
        title: "Lookup Failed",
        description: "Could not retrieve dictionary entry. Please try another word.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle Save to Vocab Bank
  const handleToggleSaveVocab = () => {
    if (!currentEntry) return;

    const existingIndex = vocabBank.findIndex(
      (v) =>
        v.word.toLowerCase() === currentEntry.word.toLowerCase() &&
        v.language === currentEntry.language
    );

    if (existingIndex !== -1) {
      // Remove
      setVocabBank(vocabBank.filter((_, i) => i !== existingIndex));
      setCurrentEntry({ ...currentEntry, isSaved: false });
      toast({ title: "Removed from Vocab Bank" });
    } else {
      // Add
      const newCard: VocabCard = {
        id: `vocab-${Date.now()}`,
        word: currentEntry.word,
        language: currentEntry.language,
        meaning: currentEntry.primaryMeaning,
        phonetic: currentEntry.phoneticIpa,
        partOfSpeech: currentEntry.partOfSpeech[0] || "Noun",
        example: currentEntry.definitions[0]?.example || "",
        addedAt: Date.now(),
        masteryLevel: 1,
      };
      setVocabBank([newCard, ...vocabBank]);
      setCurrentEntry({ ...currentEntry, isSaved: true });
      toast({
        title: "Saved to Personal Vocab Bank",
        description: `Added "${currentEntry.word}" to your flashcards bank.`,
      });
    }
  };

  // Flashcard Actions
  const handleCardResult = (mastered: boolean) => {
    if (vocabBank.length === 0) return;
    const card = vocabBank[currentCardIndex];
    if (card) {
      const updated = vocabBank.map((c, i) =>
        i === currentCardIndex
          ? {
              ...c,
              masteryLevel: mastered
                ? Math.min(5, c.masteryLevel + 1)
                : Math.max(0, c.masteryLevel - 1),
            }
          : c
      );
      setVocabBank(updated);
    }

    setIsCardFlipped(false);
    if (currentCardIndex < vocabBank.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
      toast({ title: "Flashcard Session Completed!", description: "Great vocabulary practice!" });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Search Bar & View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/70 rounded-2xl backdrop-blur-sm">
        {/* Search Input & Language */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-muted/80 border border-border rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search word, term, or idiom..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button
            size="sm"
            onClick={() => handleSearch()}
            disabled={isSearching || !searchWord.trim()}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95"
          >
            {isSearching ? <Sparkles className="w-4 h-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        {/* Navigation Tabs (Lookup, Vocab Bank, Flashcards) */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("lookup")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === "lookup"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dictionary Lookup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "bank"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Vocab Bank</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-background/50 rounded-full">
              {vocabBank.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("flashcards");
              setIsCardFlipped(false);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "flashcards"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DICTIONARY LOOKUP */}
      {activeTab === "lookup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Dictionary Entry Card (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground font-medium animate-pulse">
                  Retrieving linguistic definitions, IPA phonetics & etymology...
                </p>
              </div>
            ) : currentEntry ? (
              <>
                {/* Word Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                        {currentEntry.word}
                      </h1>
                      <div className="flex items-center gap-1.5">
                        {currentEntry.partOfSpeech.map((pos) => (
                          <span
                            key={pos}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                      <span>{currentEntry.phoneticIpa}</span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(currentEntry.word, currentEntry.language)}
                        className="p-1 rounded-md hover:bg-muted text-primary transition-colors"
                        title="Listen pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={currentEntry.isSaved ? "secondary" : "outline"}
                      size="sm"
                      onClick={handleToggleSaveVocab}
                      className="h-9 px-3.5 rounded-xl gap-2 text-xs font-semibold"
                    >
                      {currentEntry.isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Saved in Bank</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-muted-foreground" />
                          <span>Add to Vocab Bank</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Primary Meaning Card */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-primary tracking-wider">
                    Core Definition
                  </div>
                  <p className="text-base text-foreground font-medium leading-relaxed">
                    {currentEntry.primaryMeaning}
                  </p>
                </div>

                {/* Definitions & Examples List */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Detailed Definitions & Usage Examples
                  </div>
                  <div className="space-y-3">
                    {currentEntry.definitions.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-card border border-border/70 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground italic">
                            ({def.partOfSpeech})
                          </span>
                          <p className="text-sm font-medium text-foreground">{def.definition}</p>
                        </div>
                        {def.example && (
                          <div className="pl-7 space-y-1 text-xs">
                            <p className="text-muted-foreground italic">"{def.example}"</p>
                            {def.translatedExample && (
                              <p className="text-primary/90 font-medium">
                                → {def.translatedExample}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Idioms & Common Collocations */}
                {currentEntry.idiomsAndPhrases?.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Idiomatic Expressions & Phrases
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentEntry.idiomsAndPhrases.map((idm, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1"
                        >
                          <div className="text-xs font-bold text-foreground">{idm.phrase}</div>
                          <div className="text-[11px] text-muted-foreground">{idm.meaning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Etymology / Origin */}
                {currentEntry.etymology && (
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      📜 Etymology & Linguistic Origin
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed italic">
                      {currentEntry.etymology}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground text-sm italic">
                Type any word above and click "Lookup" to explore definitions and phonetics.
              </div>
            )}
          </div>

          {/* Right Sidebar: Synonyms, Antonyms, Collocations (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Synonyms */}
            {currentEntry?.synonyms?.length ? (
              <div className="p-4 rounded-3xl bg-card border border-border/80 space-y-2.5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Synonyms & Related Words
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentEntry.synonyms.map((syn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchWord(syn);
                        handleSearch(syn, selectedLang);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium transition-colors"
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Antonyms */}
            {currentEntry?.antonyms?.length ? (
              <div className="p-4 rounded-3xl bg-card border border-border/80 space-y-2.5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Antonyms
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentEntry.antonyms.map((ant, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchWord(ant);
                        handleSearch(ant, selectedLang);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-medium transition-colors"
                    >
                      {ant}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Collocations */}
            {currentEntry?.collocations?.length ? (
              <div className="p-4 rounded-3xl bg-card border border-border/80 space-y-2.5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Frequent Collocations
                </div>
                <div className="space-y-1.5">
                  {currentEntry.collocations.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-muted/40 text-xs text-foreground/90 font-mono"
                    >
                      • {col}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: VOCAB BANK */}
      {activeTab === "bank" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Personal Vocabulary Bank ({vocabBank.length} Saved Words)
              </h3>
              <p className="text-xs text-muted-foreground">
                Words you bookmark during translations and dictionary lookups are saved here for review.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab("flashcards");
                setCurrentCardIndex(0);
              }}
              disabled={vocabBank.length === 0}
              className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
            >
              <GraduationCap className="w-4 h-4" />
              Start Flashcard Drill
            </Button>
          </div>

          {vocabBank.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border text-muted-foreground space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">Your Vocab Bank is empty.</p>
              <p className="text-xs">Search words in Dictionary Lookup or Translate to bookmark them!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vocabBank.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2.5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">{card.word}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                          {card.partOfSpeech}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVocabBank(vocabBank.filter((c) => c.id !== card.id));
                          toast({ title: `Removed "${card.word}"` });
                        }}
                        className="text-muted-foreground hover:text-rose-500 p-1"
                        title="Delete word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span>{card.phonetic}</span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(card.word, card.language)}
                        className="p-0.5 hover:text-primary"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-xs text-foreground/90 line-clamp-2 pt-1">{card.meaning}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Mastery: {"⭐".repeat(card.masteryLevel || 1)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchWord(card.word);
                        setSelectedLang(card.language);
                        handleSearch(card.word, card.language);
                      }}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE FLASHCARDS */}
      {activeTab === "flashcards" && (
        <div className="max-w-xl mx-auto space-y-6 py-4">
          {vocabBank.length === 0 ? (
            <div className="p-8 text-center bg-card border rounded-3xl space-y-3">
              <p className="text-sm font-semibold">No words in vocab bank to practice.</p>
              <Button size="sm" onClick={() => setActiveTab("lookup")} className="rounded-xl">
                Lookup & Add Words
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">
                  Card {currentCardIndex + 1} of {vocabBank.length}
                </span>
                <span>Tap card to flip definition</span>
              </div>

              {/* Flip Card Stage */}
              <motion.div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="cursor-pointer min-h-[300px] p-8 rounded-3xl bg-gradient-to-br from-card to-muted/40 border border-border/90 shadow-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/60 transition-all select-none relative"
                layout
              >
                <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground">
                  {isCardFlipped ? "Definition Side" : "Word Side"}
                </div>

                {!isCardFlipped ? (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-primary font-bold">
                      {vocabBank[currentCardIndex]?.partOfSpeech}
                    </span>
                    <h2 className="text-4xl font-black text-foreground">
                      {vocabBank[currentCardIndex]?.word}
                    </h2>
                    <p className="text-sm font-mono text-muted-foreground">
                      {vocabBank[currentCardIndex]?.phonetic}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(
                          vocabBank[currentCardIndex]?.word,
                          vocabBank[currentCardIndex]?.language
                        );
                      }}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline pt-2"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen Audio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-foreground leading-relaxed">
                      "{vocabBank[currentCardIndex]?.meaning}"
                    </p>
                    {vocabBank[currentCardIndex]?.example && (
                      <p className="text-xs italic text-muted-foreground">
                        Example: {vocabBank[currentCardIndex]?.example}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Review Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleCardResult(false)}
                  className="rounded-2xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 gap-2 font-bold"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Still Learning</span>
                </Button>

                <Button
                  size="lg"
                  onClick={() => handleCardResult(true)}
                  className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 gap-2 font-bold shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>I Know This!</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
