import React, { useState, useRef } from "react";
import { Mic, Volume2, Sparkles, Play, Pause, Globe, Check, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export interface VoicePersona {
  id: string;
  name: string;
  voiceKey: string;
  description: string;
  vibe: string;
}

const VOICE_PERSONAS: VoicePersona[] = [
  { id: "epic", name: "Epic Movie Narrator", voiceKey: "Charon", description: "Deep baritone with Hollywood blockbuster gravitas", vibe: "Dramatic" },
  { id: "anime", name: "Anime Energetic", voiceKey: "Puck", description: "High-octane, enthusiastic, dynamic pacing", vibe: "Energetic" },
  { id: "podcast", name: "Chill Documentary", voiceKey: "Zephyr", description: "Warm, thoughtful, natural conversational tone", vibe: "Calm" },
  { id: "dramatic", name: "Deep Dramatic", voiceKey: "Fenrir", description: "Solemn, emotionally resonant, rich timbre", vibe: "Intense" },
  { id: "storyteller", name: "Warm Storyteller", voiceKey: "Kore", description: "Soothing, expressive, cinematic fairy-tale cadence", vibe: "Emotional" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" }
];

const EMOTIONAL_STYLES = [
  { id: "natural", label: "Natural", style: "Professional, natural, steady pace" },
  { id: "whisper", label: "Whisper", style: "Soft, intimate, whispered cinematic tone" },
  { id: "excited", label: "Excited", style: "High energy, fast-paced, enthusiastic" },
  { id: "sad", label: "Melancholic", style: "Somber, slow, emotionally heavy" },
  { id: "heroic", label: "Heroic", style: "Epic, powerful, commanding Hollywood trailer style" },
  { id: "mysterious", label: "Mysterious", style: "Suspenseful, low pitch, intriguing" }
];

interface AiVoiceoverGeneratorProps {
  initialScript?: string | null;
  onVoiceoverReady?: (audioBlobUrl: string) => void;
  videoDuration?: number;
}

export function AiVoiceoverGenerator({
  initialScript,
  onVoiceoverReady,
  videoDuration = 10
}: AiVoiceoverGeneratorProps) {
  const { toast } = useToast();
  const [script, setScript] = useState<string>(
    initialScript || "Through the boundless expanse of the forgotten realm, an ancient light awakens."
  );
  const [selectedPersona, setSelectedPersona] = useState<string>("epic");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedStyle, setSelectedStyle] = useState<string>("natural");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTranslate = async (langCode: string) => {
    setSelectedLanguage(langCode);
    if (langCode === "en") return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Translate this cinematic voiceover script into ${langCode}:\n"${script}"\nReturn ONLY the translated script text without commentary.` }],
          systemInstruction: "You are a professional cinematic screenplay translator. Return strictly the translated sentence."
        })
      });
      if (res.ok) {
        const data = await res.json();
        const translated = (data.content || data.text || "").trim().replace(/^["']|["']$/g, "");
        if (translated) setScript(translated);
        toast({ title: "Translated", description: `Voiceover adapted to ${LANGUAGES.find(l => l.code === langCode)?.label}` });
      }
    } catch {
      toast({ title: "Translation Failed", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!script.trim()) return;
    setIsSynthesizing(true);
    const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
    const styleObj = EMOTIONAL_STYLES.find(s => s.id === selectedStyle) || EMOTIONAL_STYLES[0];

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          voice: persona.voiceKey,
          style: styleObj.style
        })
      });

      if (!res.ok) {
        throw new Error("Voiceover synthesis failed");
      }

      const data = await res.json();
      if (data.audio) {
        const audioSrc = `data:${data.mimeType || "audio/wav"};base64,${data.audio}`;
        setAudioUrl(audioSrc);
        onVoiceoverReady?.(audioSrc);

        toast({
          title: "🎙️ Voiceover Generated!",
          description: `Voiced by ${persona.name} (${persona.vibe}).`
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "TTS failed";
      toast({
        title: "Voiceover Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  return (
    <div className="space-y-4 bg-muted/20 border border-border/70 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-foreground">AI Voiceover & Emotional Narration</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Neural Gemini TTS</span>
      </div>

      {/* Voice Persona Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {VOICE_PERSONAS.map((persona) => {
          const isSelected = selectedPersona === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => setSelectedPersona(persona.id)}
              className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1 ${
                isSelected
                  ? "bg-primary/10 border-primary text-foreground shadow-2xs"
                  : "bg-card border-border/60 hover:border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-foreground">{persona.name}</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-primary">
                  {persona.vibe}
                </span>
              </div>
              <p className="text-[10px] line-clamp-1 opacity-70">{persona.description}</p>
            </button>
          );
        })}
      </div>

      {/* Language Switcher */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1">
            <Globe className="w-3 h-3" />
            <span>Language:</span>
          </span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={isTranslating}
              onClick={() => handleTranslate(lang.code)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                selectedLanguage === lang.code
                  ? "bg-red-500/10 border-red-500/30 text-red-500 font-bold"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3" />
            <span>Emotion:</span>
          </span>
          {EMOTIONAL_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.id)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                selectedStyle === style.id
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Script input */}
      <div className="space-y-1.5">
        <Textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Write or edit the narration script..."
          className="text-xs bg-card border-border/70 rounded-xl p-3 resize-none h-18"
        />
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {audioUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePlayAudio}
              className="h-8 rounded-xl text-xs gap-1.5 border-border"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-red-500" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? "Pause" : "Listen Preview"}</span>
            </Button>
          )}
        </div>

        <Button
          type="button"
          disabled={isSynthesizing || !script.trim()}
          onClick={handleGenerateVoiceover}
          className="h-8 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm shadow-red-500/10"
        >
          {isSynthesizing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing Voice...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Voiceover</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
