import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Download,
  Loader2,
  Wand2,
  Maximize2,
  X,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Ratio,
  Palette,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", width: 1024, height: 1024, icon: "⏹️" },
  { id: "16:9", label: "16:9 Landscape", width: 1280, height: 720, icon: "🖥️" },
  { id: "9:16", label: "9:16 Story/Portrait", width: 720, height: 1280, icon: "📱" },
] as const;

const STYLE_PRESETS = [
  { id: "Photorealistic", label: "Photorealistic", badge: "Cinematic 8K", gradient: "from-amber-500 to-red-500" },
  { id: "Anime", label: "Anime", badge: "Studio Makoto", gradient: "from-pink-500 to-purple-500" },
  { id: "Digital Art", label: "Digital Art", badge: "Concept Design", gradient: "from-cyan-500 to-blue-500" },
  { id: "3D Render", label: "3D Render", badge: "Octane / Unreal", gradient: "from-emerald-500 to-teal-500" },
  { id: "Cyberpunk", label: "Cyberpunk", badge: "Neon Volumetric", gradient: "from-violet-500 to-fuchsia-600" },
] as const;

const SAMPLE_INSPIRATIONS = [
  "A futuristic cyberpunk metropolis at twilight with flying hyper-cars and holographic ads",
  "An ancient mystical Japanese temple perched above misty waterfalls surrounded by cherry blossoms",
  "A majestic crystalline space station orbiting Saturn's rings with nebula radiance",
  "An adorable baby red panda wearing tiny goggles tinkering with vintage clockwork gears",
];

export default function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string>("Photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [history, setHistory] = useState<Array<{ url: string; prompt: string; style: string; time: string }>>([]);

  const selectedAspect = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];

  // "Enhance Prompt" AI Button
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Type a basic prompt first to enhance it.", variant: "destructive" });
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({ title: "Prompt Enhanced", description: "Optimized with cinematic descriptors and lighting." });
      }
    } catch {
      toast({ title: "Enhance failed", description: "Using existing prompt." });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Image Generation Handler
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Please enter an image description.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    const fullPrompt = `${prompt}, style: ${selectedStyle}, ultra-detailed, masterpiece, 8k resolution, cinematic composition`;
    const encoded = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${selectedAspect.width}&height=${selectedAspect.height}&seed=${seed}&nologo=true`;

    // Preload image to ensure seamless rendering
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setGeneratedImage(imageUrl);
      setIsGenerating(false);
      setHistory((prev) => [{ url: imageUrl, prompt, style: selectedStyle, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 7)]);
      toast({ title: "Image Rendered", description: "Generation complete in high resolution." });
    };
    img.onerror = () => {
      // Fallback url
      setGeneratedImage(imageUrl);
      setIsGenerating(false);
    };
  };

  const handleDownload = async (urlToDownload?: string) => {
    const target = urlToDownload || generatedImage;
    if (!target) return;

    try {
      const response = await fetch(target);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knowdeep_art_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Saved high-resolution PNG to your device." });
    } catch {
      // Direct link fallback
      window.open(target, "_blank");
    }
  };

  return (
    <AppLayout title="Image Generator">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                <ImageIcon className="w-5 h-5" />
              </span>
              <span>Image Generator</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Create ultra-high definition imagery with AI prompt enhancement and multi-aspect ratio rendering
            </p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Prompt Input & Enhance Button */}
            <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Prompt Description
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="h-7 text-[11px] rounded-xl border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5"
                >
                  {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  Enhance Prompt
                </Button>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your visual concept in detail..."
                rows={4}
                className="text-xs rounded-2xl bg-muted/40 border-border/80 resize-none leading-relaxed"
              />

              {/* Sample Inspirations */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                  Sample Inspirations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_INSPIRATIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors truncate max-w-full text-left"
                    >
                      {s.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="p-4 rounded-3xl bg-card border border-border/60 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Ratio className="w-3.5 h-3.5 text-cyan-400" />
                Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`py-2 px-2 rounded-2xl border text-center transition-all ${
                      aspectRatio === ar.id
                        ? "bg-purple-500/15 border-purple-500 text-foreground font-semibold shadow-sm"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-sm block">{ar.icon}</span>
                    <span className="text-[10px] block mt-0.5">{ar.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preset Selector */}
            <div className="p-4 rounded-3xl bg-card border border-border/60 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Style Preset
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_PRESETS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      selectedStyle === st.id
                        ? "bg-purple-500/15 border-purple-500 text-foreground shadow-sm"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px] font-semibold block">{st.label}</span>
                    <span className="text-[9px] text-purple-400 block">{st.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Trigger */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:opacity-90 text-white font-semibold text-xs h-11 rounded-2xl shadow-lg shadow-purple-500/20"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate High-Res Artwork
            </Button>
          </div>

          {/* Right Preview Canvas Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex-1 min-h-[440px] rounded-3xl bg-card/60 border border-border/60 p-4 flex flex-col items-center justify-center relative overflow-hidden group">
              {isGenerating ? (
                <div className="text-center p-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center animate-pulse mb-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Rendering Visual Canvas...</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Applying {selectedStyle} stylistic weights at {selectedAspect.width}×{selectedAspect.height}
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={generatedImage}
                    alt={prompt}
                    className="max-h-[500px] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-border/40"
                  />

                  {/* Overlay Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md hover:bg-black text-white transition-all shadow-md"
                      title="Open Full-Screen Lightbox"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload()}
                      className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Visual Canvas Awaiting Input</h3>
                  <p className="text-xs max-w-xs mt-1">
                    Enter a creative description on the left and click &quot;Generate High-Res Artwork&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* History Gallery */}
            {history.length > 0 && (
              <div className="p-4 rounded-3xl bg-card border border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  Recent Creations ({history.length})
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2 pr-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => setGeneratedImage(h.url)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/60 shrink-0 cursor-pointer group hover:scale-105 transition-transform"
                    >
                      <img src={h.url} alt={h.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <Download
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(h.url);
                          }}
                          className="w-4 h-4 text-white hover:text-purple-300"
                        />
                        <Trash2
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistory(prev => prev.filter((_, index) => index !== i));
                            if (generatedImage === h.url) setGeneratedImage(null);
                          }}
                          className="w-4 h-4 text-white hover:text-red-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
              <img
                src={generatedImage}
                alt="Full resolution render"
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 flex items-center gap-4">
                <Button
                  onClick={() => handleDownload()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs rounded-xl px-5 h-9"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Full-Res PNG
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
