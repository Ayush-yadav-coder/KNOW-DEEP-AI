import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Loader2,
  Mic,
  Copy,
  Check,
  RotateCcw,
  Bookmark,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

interface SearchSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  favicon?: string;
}

interface SearchResult {
  query: string;
  featuredSnippet?: {
    heading: string;
    text: string;
    source: string;
  };
  sources: SearchSource[];
  content: string;
  relatedSearches: string[];
}

const SAMPLE_QUERIES = [
  "What are the major breakthrough AI developments in 2026?",
  "How does quantum computing error correction work?",
  "Latest James Webb Space Telescope discoveries",
  "Clean energy and next-gen battery grid storage advancements",
];

export default function WebSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setQuery(q);
    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResult(data);
      setHistory((prev) => Array.from(new Set([q, ...prev])).slice(0, 6));
    } catch {
      toast({ title: "Search Error", description: "Failed to connect to search gateway.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        onstart: () => void;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        onstart: () => void;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech Recognition Unavailable", description: "Browser does not support voice input.", variant: "destructive" });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsListening(true);
        toast({ title: "Listening...", description: "Speak your search query now." });
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Search summary copied to clipboard." });
  };

  return (
    <AppLayout title="Web Search">
      <div className="max-w-5xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Search Bar & Voice Input */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search anything across the real-time web..."
              className="h-13 pl-12 pr-28 rounded-2xl bg-card border-border/80 shadow-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
              <Button
                onClick={() => handleSearch(query)}
                disabled={isSearching || !query.trim()}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-sm"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>

          {/* Sample Prompts & History Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              Trending:
            </span>
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(sq)}
                className="text-[11px] px-3 py-1 rounded-xl bg-card border border-border/60 hover:border-blue-500/40 text-muted-foreground hover:text-foreground transition-all shrink-0 truncate max-w-xs"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Results Workspace */}
        {isSearching ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-xs font-semibold text-foreground">Scouring Live Web Indexes...</p>
            <p className="text-[11px] text-muted-foreground mt-1">Cross-referencing citations and extracting featured snippet</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* 1. Top Google-Style Featured Snippet Card */}
            {result.featuredSnippet && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card to-blue-950/20 border border-blue-500/30 shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Google-Style Featured Snippet
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {result.featuredSnippet.source}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {result.featuredSnippet.heading}
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {result.featuredSnippet.text}
                </p>
              </div>
            )}

            {/* 2. Horizontal Source Carousel with Favicons and Domain Badges */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Citations &amp; Sources ({result.sources.length})
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {result.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-card border border-border/60 hover:border-blue-500/50 w-56 shrink-0 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 text-xs">
                            🌐
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground truncate">
                            {src.domain}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                          {src.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                          {src.snippet}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-blue-400 font-semibold">
                        <span>Source [{idx + 1}]</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Formatted Response Body with Inline Bracket Citations [1] */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Synthesized Web Intelligence
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-8 text-xs rounded-xl gap-1.5 border-border/80"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Summary
                </Button>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed space-y-3">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
            </div>

            {/* 4. Clickable "Related Searches" Pill Chips */}
            {result.relatedSearches && result.relatedSearches.length > 0 && (
              <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Related Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.relatedSearches.map((rs, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(rs)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-muted/60 hover:bg-blue-500/15 hover:text-blue-300 border border-border/60 text-xs font-semibold transition-all group"
                    >
                      <Search className="w-3 h-3 text-muted-foreground group-hover:text-blue-400" />
                      <span>{rs}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Continuous Real-Time Web Search</h3>
            <p className="text-xs max-w-xs mt-1">
              Ask any question to receive a featured answer snippet, verified source carousel, and cited insights.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
