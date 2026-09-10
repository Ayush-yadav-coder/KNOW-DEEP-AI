import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Languages,
  ArrowLeftRight,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Loader2,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "zh", name: "Mandarin Chinese (中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "th", name: "Thai (ไทย)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" },
  { code: "tl", name: "Tagalog (Filipino)" },
  { code: "he", name: "Hebrew (עברית)" },
];

const TONES = ["Formal", "Casual", "Business", "Slang"] as const;

export default function TranslateStudio() {
  const { toast } = useToast();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [tone, setTone] = useState<"Formal" | "Casual" | "Business" | "Slang">("Business");
  const [sourceText, setSourceText] = useState("Good morning! We are excited to collaborate with your team on this strategic initiative.");
  const [translatedText, setTranslatedText] = useState("¡Buenos días! Estamos muy entusiasmados de colaborar con su equipo en esta iniciativa estratégica.");
  const [phoneticGuide, setPhoneticGuide] = useState("Bweh-nos DEE-ahs! Eh-STAH-mos MWEE en-too-syahs-MAH-dos deh koh-lah-boh-RAHR kohn soo eh-KEE-poh...");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
    setPhoneticGuide("");
    toast({ title: "Languages Swapped" });
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    const srcName = LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang;
    const tgtName = LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;

    try {
      const prompt = `Translate the following text from ${srcName} to ${tgtName}.
Tone: ${tone}.
Format your response as valid JSON with two fields:
{
  "translation": "translated text here",
  "phoneticGuide": "phonetic pronunciation guide or romanization here"
}

Text to translate:
"${sourceText}"`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const raw = data.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setTranslatedText(parsed.translation || raw);
        setPhoneticGuide(parsed.phoneticGuide || "");
      } else {
        setTranslatedText(raw);
        setPhoneticGuide("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Translation service unavailable";
      toast({ title: "Translation error", description: msg, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (!window.speechSynthesis) {
      toast({ title: "Audio Unsupported", description: "Text-to-speech not available in browser.", variant: "destructive" });
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    toast({ title: "Playing Pronunciation", description: `Language: ${langCode}` });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Translation copied to clipboard." });
  };

  return (
    <AppLayout title="Translate Studio">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                <Languages className="w-5 h-5" />
              </span>
              <span>Translate Studio</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              30+ global languages with tone adaptation (Formal, Casual, Business, Slang) and phonetic pronunciation guides
            </p>
          </div>

          {/* Tone Adjuster Pills */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-2xl border border-border/60 shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">Tone:</span>
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  tone === t
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection & Swap Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm">
          {/* Source Lang Dropdown */}
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Source Language</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full h-9 text-xs rounded-xl bg-muted border border-border px-3 font-semibold focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bidirectional Swap Button */}
          <button
            type="button"
            onClick={handleSwapLanguages}
            className="self-center p-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-teal-400 hover:scale-105 border border-border/60 transition-all"
            title="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Target Lang Dropdown */}
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full h-9 text-xs rounded-xl bg-muted border border-border px-3 font-semibold focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Translation Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[440px]">
          {/* Left Panel: Source Text */}
          <div className="p-5 rounded-3xl bg-card border border-border/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Input Text ({sourceText.length} characters)
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(sourceText, sourceLang)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Listen to Source Audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type or paste text to translate..."
              rows={8}
              className="flex-1 w-full bg-transparent border-0 resize-none focus-visible:ring-0 text-sm leading-relaxed p-0"
            />

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Auto-detecting accents &amp; idioms</span>
              <Button
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs h-9 rounded-xl px-5 gap-1.5 shadow-sm"
              >
                {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Translate Now
              </Button>
            </div>
          </div>

          {/* Right Panel: Translated Output & Phonetics */}
          <div className="p-5 rounded-3xl bg-card border border-border/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Translation ({tone} Tone)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(translatedText, targetLang)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Audio Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Copy Translation"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isTranslating ? (
                <div className="h-full py-16 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-foreground">Translating Idiomatic Expressions...</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Refining phonetic markers and lexical nuances</p>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {translatedText || "Translated text will appear here."}
                </p>
              )}
            </div>

            {/* Phonetic Pronunciation Guide */}
            {phoneticGuide && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Phonetic Pronunciation Guide
                </span>
                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {phoneticGuide}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
