import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Languages,
  ArrowLeftRight,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "ro", name: "Romanian" },
  { code: "hu", name: "Hungarian" },
  { code: "uk", name: "Ukrainian" },
  { code: "fa", name: "Persian" },
  { code: "sw", name: "Swahili" },
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "ny", name: "Chichewa" },
  { code: "co", name: "Corsican" },
  { code: "hr", name: "Croatian" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "tl", name: "Filipino" },
  { code: "fy", name: "Frisian" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian" },
  { code: "hmn", name: "Hmong" },
  { code: "is", name: "Icelandic" },
  { code: "ig", name: "Igbo" },
  { code: "ga", name: "Irish" },
  { code: "jw", name: "Javanese" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "ku", name: "Kurdish" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "or", name: "Odia" },
  { code: "ps", name: "Pashto" },
  { code: "sm", name: "Samoan" },
  { code: "gd", name: "Scottish Gaelic" },
  { code: "sr", name: "Serbian" },
  { code: "st", name: "Sesotho" },
  { code: "sn", name: "Shona" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "su", name: "Sundanese" },
  { code: "tg", name: "Tajik" },
  { code: "tt", name: "Tatar" },
  { code: "tk", name: "Turkmen" },
  { code: "ug", name: "Uyghur" },
  { code: "uz", name: "Uzbek" },
  { code: "cy", name: "Welsh" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
];

interface LangPickerProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
}

function LanguageCombobox({ value, onChange, label }: LangPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => languages.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()) || l.code.includes(q.toLowerCase())),
    [q],
  );
  const selected = languages.find((l) => l.code === value);
  return (
    <div className="flex-1 min-w-0">
      <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md rounded-lg"
          >
            <span className="truncate">{selected?.name ?? "Select"}</span>
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0 bg-slate-950/95 backdrop-blur-2xl border border-white/10" align="start">
          <div className="flex items-center gap-2 p-2 border-b border-white/10">
            <Search className="w-4 h-4 text-white/40 ml-1" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search language..."
              className="h-8 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-white/50 px-3 py-4 text-center">No matches.</p>
            ) : (
              filtered.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { onChange(l.code); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors",
                    l.code === value && "bg-cyan-500/10 text-cyan-200",
                  )}
                >
                  <span>{l.name}</span>
                  {l.code === value && <Check className="w-4 h-4 text-cyan-300" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Translator() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [realtime, setRealtime] = useState(true);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        setSourceText(transcript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const runTranslate = async (text: string) => {
    if (!text.trim()) { setTranslatedText(""); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsTranslating(true);
    try {
      const sName = languages.find(l => l.code === sourceLang)?.name || sourceLang;
      const tName = languages.find(l => l.code === targetLang)?.name || targetLang;
      
      let translated = "";
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLang: sName,
            targetLang: tName,
          }),
          signal: abortRef.current.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            translated = data.translatedText;
            setTranslatedText(translated);
            return;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.warn("Local translate endpoint fallback:", err);
      }

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: [{ role: "user", content: `Translate from ${sName} to ${tName}. Respond ONLY with the translated text, nothing else:\n\n${text}` }],
        }),
      });
      if (!response.ok) throw new Error("Translation failed");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let result = "";
      setTranslatedText("");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) { result += content; setTranslatedText(result); }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: "Translation Failed", description: e.message || "Try again", variant: "destructive" });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Real-time debounced translation
  useEffect(() => {
    if (!realtime) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runTranslate(sourceText), 450);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, sourceLang, targetLang, realtime]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { try { recognitionRef.current?.start(); setIsListening(true); } catch { toast({ title: "Speech unsupported", variant: "destructive" }); } }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang); setTargetLang(sourceLang);
    setSourceText(translatedText); setTranslatedText(sourceText);
  };

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; window.speechSynthesis.speak(u);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout title="Translator">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-background dark:via-background dark:to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/30 dark:bg-red-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/30 dark:bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Real-time Translator</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
                Translate As You Type
              </span>
            </h1>
            <p className="text-muted-foreground">110+ languages • Live translation • Voice in & out</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 bg-white/50 dark:bg-muted/20 backdrop-blur-xl border border-white/40 dark:border-border/50 shadow-xl"
          >
            <div className="flex items-end gap-3 mb-6">
              <LanguageCombobox value={sourceLang} onChange={setSourceLang} label="From" />
              <Button variant="ghost" size="icon" onClick={swapLanguages} className="rounded-full bg-white/60 dark:bg-muted/30 border border-white/40 dark:border-border/50 mb-0.5">
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
              <LanguageCombobox value={targetLang} onChange={setTargetLang} label="To" />
            </div>

            <div className="flex items-center justify-end gap-2 mb-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                <input type="checkbox" checked={realtime} onChange={(e) => setRealtime(e.target.checked)} className="rounded" />
                Translate as I type
              </label>
              {isTranslating && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Type to translate instantly..."
                  className="min-h-[220px] resize-none bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md text-base"
                />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleListening} className={`h-8 w-8 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-white/60 dark:bg-muted/30'}`}>
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => speakText(sourceText, sourceLang)} className="h-8 w-8 rounded-full bg-white/60 dark:bg-muted/30" disabled={!sourceText}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder="Translation appears here..."
                  className="min-h-[220px] resize-none bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md text-base"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => speakText(translatedText, targetLang)} className="h-8 w-8 rounded-full bg-white/60 dark:bg-muted/30" disabled={!translatedText}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 rounded-full bg-white/60 dark:bg-muted/30" disabled={!translatedText}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {!realtime && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => runTranslate(sourceText)}
                  disabled={isTranslating || !sourceText.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90"
                >
                  {isTranslating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating...</> : <><Sparkles className="w-4 h-4 mr-2" />Translate</>}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
