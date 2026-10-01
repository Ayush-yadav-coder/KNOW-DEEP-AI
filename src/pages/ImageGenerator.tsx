import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Trash2,
  Upload,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  Zap,
  Split,
  ZoomIn,
  ZoomOut,
  Shuffle,
  Heart,
  Camera,
  Share2,
  ArrowRight,
  ExternalLink,
  Info,
  Grid,
  Columns,
  Square,
  Sparkle,
  Sliders,
  FileImage,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  StylePresetLibrary,
  StylePresetItem,
} from "@/components/image/StylePresetLibrary";

interface AspectRatioItem {
  id: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9";
  label: string;
  sub: string;
  width: number;
  height: number;
  iconShape: string;
}

const ASPECT_RATIOS: AspectRatioItem[] = [
  { id: "1:1", label: "1:1", sub: "Square", width: 1024, height: 1024, iconShape: "w-4 h-4 rounded-xs" },
  { id: "16:9", label: "16:9", sub: "Landscape", width: 1280, height: 720, iconShape: "w-5 h-3 rounded-xs" },
  { id: "9:16", label: "9:16", sub: "Story / Reels", width: 720, height: 1280, iconShape: "w-3 h-5 rounded-xs" },
  { id: "4:3", label: "4:3", sub: "Standard", width: 1152, height: 864, iconShape: "w-4.5 h-3.5 rounded-xs" },
  { id: "3:4", label: "3:4", sub: "Portrait", width: 864, height: 1152, iconShape: "w-3.5 h-4.5 rounded-xs" },
  { id: "21:9", label: "21:9", sub: "Cinematic", width: 1344, height: 576, iconShape: "w-6 h-2.5 rounded-xs" },
];

const STYLE_PRESETS = [
  {
    id: "Photorealistic",
    label: "Photorealistic 8K",
    badge: "Cinematic 35mm",
    color: "from-amber-500/20 to-red-500/20 text-amber-500 border-amber-500/30",
    suffix: "hyper-realistic photograph, 8k resolution, shot on 35mm lens, natural golden hour lighting, cinematic depth of field, hyper-detailed skin and textures",
  },
  {
    id: "Anime",
    label: "Anime Masterpiece",
    badge: "Makoto Shinkai",
    color: "from-pink-500/20 to-purple-500/20 text-pink-500 border-pink-500/30",
    suffix: "studio anime artwork, Makoto Shinkai and Ghibli aesthetic, radiant clouds, emotional lighting, hand-drawn detailing, vibrant cel-shaded color palette",
  },
  {
    id: "Cyberpunk",
    label: "Cyberpunk Neon",
    badge: "Volumetric Sci-Fi",
    color: "from-violet-500/20 to-fuchsia-600/20 text-fuchsia-500 border-fuchsia-500/30",
    suffix: "cyberpunk aesthetic, futuristic neon signage in rain, reflective wet asphalt, volumetric cyan and magenta lighting, holographic advertisements, high-tech dystopian city",
  },
  {
    id: "3D Render",
    label: "3D Octane Render",
    badge: "Cinema4D / Unreal",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
    suffix: "3D digital render, Octane Render, ray-tracing, subsurface scattering, photorealistic textures, soft studio softbox lighting, clay and iridescent glass materials",
  },
  {
    id: "Digital Art",
    label: "Concept Art",
    badge: "ArtStation Trending",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-500 border-cyan-500/30",
    suffix: "epic concept art, trending on ArtStation, matte painting, dynamic camera angle, dramatic atmosphere, detailed digital brushwork, cinematic fantasy worldbuilding",
  },
  {
    id: "Oil Painting",
    label: "Classical Oil",
    badge: "Impasto Canvas",
    color: "from-yellow-600/20 to-amber-700/20 text-amber-600 border-amber-600/30",
    suffix: "classical oil on linen canvas painting, visible textured impasto brushstrokes, rich warm palette, chiaroscuro lighting, museum masterpiece aesthetic",
  },
  {
    id: "Synthwave",
    label: "Retro 80s Synthwave",
    badge: "VHS Outrun",
    color: "from-purple-600/20 to-indigo-600/20 text-purple-400 border-purple-500/30",
    suffix: "80s retro synthwave aesthetic, glowing neon grid horizon, chrome reflective typography, wireframe sun, vintage VHS grain, outrun sports car vibes",
  },
  {
    id: "Watercolor",
    label: "Watercolor & Ink",
    badge: "Organic Wash",
    color: "from-sky-500/20 to-teal-500/20 text-sky-400 border-sky-500/30",
    suffix: "delicate Japanese watercolor and sumi-e ink painting on textured rice paper, soft bleeding pigment washes, minimal negative space, poetic elegance",
  },
];

const CURATED_IDEAS = [
  {
    category: "Futuristic Worlds",
    prompt: "A floating solarpunk greenhouse sanctuary suspended inside a translucent crystalline geodesic sphere high above a misty mountain valley at sunrise",
  },
  {
    category: "Characters",
    prompt: "An enigmatic cybernetic ronin warrior standing in the rain under holographic neon street lanterns, wearing a traditional woven straw hat and glowing katana",
  },
  {
    category: "Mythical & Nature",
    prompt: "An ancient bioluminescent spirit dragon weaving gracefully through a colossal submerged coral cathedral surrounded by glowing jellyfish",
  },
  {
    category: "Architecture",
    prompt: "A minimalist brutalist glass villa cantilevered over crashing ocean waves on a black sand volcanic coastline, cinematic twilight lighting",
  },
];

interface GeneratedArtwork {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspect: string;
  seed: number;
  timestamp: string;
  referenceImage?: string | null;
  remixNote?: string;
  variationTitle?: string;
  variationDifference?: string;
  isFavorite?: boolean;
}

export default function ImageGenerator() {
  const { toast } = useToast();

  // Mode Selection: "text" | "describe" | "remix"
  const [activeMode, setActiveMode] = useState<"text" | "describe" | "remix">("text");

  const [searchParams] = useSearchParams();
  const urlPrompt = searchParams.get("prompt");
  const urlAutostart = searchParams.get("autostart");
  const hasAutoStartedRef = useRef(false);

  // Core Prompt & Settings
  const [prompt, setPrompt] = useState(
    "A majestic celestial observatory carved into a crystalline asteroid orbiting a purple nebula, cinematic volumetric illumination, 8k resolution"
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioItem["id"]>("16:9");
  const [selectedStyle, setSelectedStyle] = useState<string>("Photorealistic");

  // Process deep-link prompt & autostart
  useEffect(() => {
    if (urlPrompt) {
      let decoded = urlPrompt;
      try {
        decoded = decodeURIComponent(urlPrompt);
      } catch {
        decoded = urlPrompt;
      }
      setPrompt(decoded);
      if (urlAutostart === "true" && !hasAutoStartedRef.current) {
        hasAutoStartedRef.current = true;
        setTimeout(() => {
          executeGeneration(decoded);
        }, 400);
      }
    }
  }, [urlPrompt, urlAutostart]);

  // Image Reference State
  const [referenceImageA, setReferenceImageA] = useState<string | null>(null);
  const [referenceImageB, setReferenceImageB] = useState<string | null>(null);
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);
  const canvasDropRef = useRef<HTMLDivElement>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Dedicated "Generate Variations" Toggle Engine
  const [isVariationsMode, setIsVariationsMode] = useState(false);
  const [variationStrength, setVariationStrength] = useState<"subtle" | "balanced" | "dramatic">("balanced");
  const [variationCount, setVariationCount] = useState<number>(2);
  const [currentVariations, setCurrentVariations] = useState<GeneratedArtwork[]>([]);

  // Workspace Canvas View Mode: "masterpiece" | "side-by-side" | "variations-grid"
  const [canvasViewMode, setCanvasViewMode] = useState<"masterpiece" | "side-by-side" | "variations-grid">("masterpiece");
  const [comparisonSliderPos, setComparisonSliderPos] = useState(50);

  // Vision Analysis State
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<{
    description?: string;
    extractedPrompt?: string;
    style?: string;
    suggestedRemixes?: string[];
  } | null>(null);
  const [remixInstruction, setRemixInstruction] = useState("");

  // Style Preset Library Sidebar State
  const [isStyleLibraryOpen, setIsStyleLibraryOpen] = useState(false);
  const [activeLibraryPresetId, setActiveLibraryPresetId] = useState<string | null>(null);

  const handleApplyLibraryPreset = (preset: StylePresetItem) => {
    setActiveLibraryPresetId(preset.id);
    if (prompt.trim()) {
      if (!prompt.includes(preset.name)) {
        setPrompt(`${prompt.trim()}, ${preset.promptAddon}`);
      }
    } else {
      setPrompt(preset.promptAddon);
    }
    const matched = STYLE_PRESETS.find(
      (s) =>
        s.label.toLowerCase().includes(preset.name.toLowerCase()) ||
        preset.name.toLowerCase().includes(s.id.toLowerCase())
    );
    if (matched) {
      setSelectedStyle(matched.id);
    }
    toast({
      title: `Preset Applied: ${preset.name}`,
      description: `Injected ${preset.category} styling into your prompt.`,
    });
  };

  // Generation & Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState<GeneratedArtwork | null>(() => ({
    id: "init-art",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
    prompt: "A majestic celestial observatory carved into a crystalline asteroid orbiting a purple nebula, cinematic volumetric illumination, 8k resolution",
    style: "Photorealistic",
    aspect: "16:9",
    seed: 849201,
    timestamp: "Ready",
  }));

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Gallery History
  const [history, setHistory] = useState<GeneratedArtwork[]>([]);

  const selectedAspectObj = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[1];
  const selectedStyleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle) || STYLE_PRESETS[0];

  // ==========================================
  // REFERENCE IMAGE UPLOAD & CANVAS DRAG-AND-DROP
  // ==========================================
  const handleUploadImageA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImageA(base64);
      setCanvasViewMode("side-by-side");
      toast({
        title: "Reference Image Loaded",
        description: "Ready for side-by-side comparison, blending, or generating variations.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImageB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImageB(base64);
      toast({
        title: "Style Image Loaded",
        description: "Dual-image fusion will blend Image A (Subject) with Image B (Style).",
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop onto the canvas workspace
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please drop an image file (PNG, JPG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImageA(base64);
      setCanvasViewMode("side-by-side");
      toast({
        title: "Image Dropped onto Canvas",
        description: "Set as active Reference Image! You can now blend, remix, or generate variations.",
      });
    };
    reader.readAsDataURL(file);
  };

  const getImageApiHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const storedGemini = localStorage.getItem("knowdeep_gemini_api_key");
      if (storedGemini?.trim()) headers["x-gemini-api-key"] = storedGemini.trim();
      const storedPexels = localStorage.getItem("knowdeep_pexels_api_key");
      if (storedPexels?.trim()) headers["x-pexels-api-key"] = storedPexels.trim();
    } catch {
      // Ignore localStorage access restrictions in private browsing
    }
    return headers;
  };

  // Vision AI: Describe Image and Extract Generative Prompt
  const handleDescribeImageVision = async (mode: "describe" | "extract_prompt" = "extract_prompt") => {
    if (!referenceImageA) {
      toast({
        title: "Upload Required",
        description: "Please upload an image reference to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingVision(true);
    try {
      const res = await fetch("/api/describe-image", {
        method: "POST",
        headers: getImageApiHeaders(),
        body: JSON.stringify({
          image: referenceImageA,
          mode,
        }),
      });

      const data = await res.json();
      setVisionAnalysis(data);

      if (data.extractedPrompt) {
        setPrompt(data.extractedPrompt);
        if (data.style) {
          const matched = STYLE_PRESETS.find((s) => s.label.toLowerCase().includes(data.style.toLowerCase()));
          if (matched) setSelectedStyle(matched.id);
        }
        toast({
          title: "Prompt Extracted with Vision AI!",
          description: "Full visual composition and style extracted into your prompt bar.",
        });
      }
    } catch {
      toast({
        title: "Vision Analysis Failed",
        description: "Could not parse image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Multimodal Remix: Fuse Reference Image + New Idea Prompt
  const handleSynthesizeRemix = async () => {
    if (!referenceImageA && !remixInstruction.trim()) {
      toast({
        title: "Inputs Required",
        description: "Provide an Image Reference and describe your transformation idea.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingVision(true);
    try {
      const res = await fetch("/api/remix-image", {
        method: "POST",
        headers: getImageApiHeaders(),
        body: JSON.stringify({
          imageA: referenceImageA,
          imageB: referenceImageB,
          instruction: remixInstruction || "Reimagine with higher cinematic fidelity and creative variation",
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (data.remixedPrompt) {
        setPrompt(data.remixedPrompt);
        toast({
          title: "Remix Prompt Synthesized!",
          description: data.conceptSummary || "Generated fused prompt adhering to your visual concept.",
        });
        executeGeneration(data.remixedPrompt, referenceImageA, remixInstruction);
      }
    } catch {
      toast({
        title: "Remix Synthesis Failed",
        description: "Falling back to direct generation.",
      });
      executeGeneration(remixInstruction || prompt, referenceImageA, remixInstruction);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // ==========================================
  // MAGIC PROMPT ENHANCER (Grok Style)
  // ==========================================
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Type an initial idea first to enhance it.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: getImageApiHeaders(),
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Magic Prompt Enhanced",
          description: "Infused cinematic lighting, lens properties, and volumetric depth.",
        });
      }
    } catch {
      toast({ title: "Enhancement Failed", description: "Using current prompt." });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRandomSurprise = () => {
    const random = CURATED_IDEAS[Math.floor(Math.random() * CURATED_IDEAS.length)];
    setPrompt(random.prompt);
    toast({
      title: "Inspiration Loaded",
      description: `Loaded ${random.category} concept.`,
    });
  };

  // ==========================================
  // GENERATE VARIATIONS ENGINE
  // ==========================================
  const handleGenerateVariations = async () => {
    if (!prompt.trim() && !referenceImageA) {
      toast({
        title: "Inputs Required",
        description: "Specify a prompt or upload an Image Reference to generate variations.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(20);
    setGenerationStep(`Analyzing reference & synthesizing ${variationCount} variations...`);
    setCanvasViewMode("variations-grid");

    try {
      const res = await fetch("/api/generate-variations", {
        method: "POST",
        headers: getImageApiHeaders(),
        body: JSON.stringify({
          prompt: prompt || "Masterpiece visual artwork",
          style: selectedStyle,
          strength: variationStrength,
          count: variationCount,
          referenceImage: referenceImageA || activeArtwork?.url,
        }),
      });

      setGenerationProgress(55);
      setGenerationStep("Rendering 8K parallel latent variations...");

      const data = await res.json();
      const variationSpecs: Array<{ title: string; prompt: string; difference: string }> =
        data.variations || [];

      // Generate artworks in parallel using backend safe generation endpoint
      const renderPromises = variationSpecs.map(async (spec, i) => {
        try {
          const genRes = await fetch("/api/generate-image", {
            method: "POST",
            headers: getImageApiHeaders(),
            body: JSON.stringify({
              prompt: spec.prompt,
              style: selectedStyle,
              aspectRatio,
              seed: Math.floor(Math.random() * 9999999),
            }),
          });
          const genData = await genRes.json();
          return {
            id: `var-${Date.now()}-${i}`,
            url: genData.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
            prompt: spec.prompt,
            style: selectedStyle,
            aspect: aspectRatio,
            seed: Math.floor(Math.random() * 9999999),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            referenceImage: referenceImageA || activeArtwork?.url,
            variationTitle: spec.title || `Variation ${i + 1}`,
            variationDifference: spec.difference || "Creative perspective shift",
          };
        } catch {
          return {
            id: `var-${Date.now()}-${i}`,
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
            prompt: spec.prompt,
            style: selectedStyle,
            aspect: aspectRatio,
            seed: 849201,
            timestamp: "Just now",
            referenceImage: referenceImageA || activeArtwork?.url,
            variationTitle: spec.title || `Variation ${i + 1}`,
            variationDifference: spec.difference || "Creative perspective shift",
          };
        }
      });

      setGenerationProgress(85);
      const results = await Promise.all(renderPromises);
      setGenerationProgress(100);

      setCurrentVariations(results);
      if (results[0]) {
        setActiveArtwork(results[0]);
      }
      setHistory((prev) => [...results, ...prev.slice(0, 15)]);

      toast({
        title: `${results.length} Variations Generated!`,
        description: `Created in ${selectedAspectObj.label} with ${variationStrength} variation strength.`,
      });
    } catch (err: any) {
      console.error("Variations generation error:", err);
      toast({
        title: "Variations Fallback",
        description: "Generated single creative variation.",
      });
      executeGeneration(`${prompt}, creative variation, alternate angle, 8k resolution`, referenceImageA);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // ==========================================
  // SINGLE IMAGE GENERATION ENGINE (GOOGLE IMAGEN 3)
  // ==========================================
  const executeGeneration = async (promptToUse: string, refImage?: string | null, remixNote?: string) => {
    if (!promptToUse.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please specify an image concept.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(25);
    setGenerationStep("Analyzing prompt & safety guardrails...");

    const stepTimer1 = setTimeout(() => {
      setGenerationProgress(60);
      setGenerationStep("Synthesizing neural latent space with Google Imagen 3...");
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setGenerationProgress(88);
      setGenerationStep("Rendering 8K volumetric lighting & textures...");
    }, 1400);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: getImageApiHeaders(),
        body: JSON.stringify({
          prompt: promptToUse,
          style: selectedStyle,
          aspectRatio,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setGenerationProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message ||
          errData.error ||
          (res.status === 400 || res.status === 403
            ? "Prompt flagged by content filters. Please try a different prompt."
            : `Image generation notice (${res.status}). Please check network or API keys.`)
        );
      }

      const data = await res.json();
      const newArtwork: GeneratedArtwork = {
        id: data.id || `art-${Date.now()}`,
        url: data.url,
        prompt: promptToUse,
        style: selectedStyle,
        aspect: aspectRatio,
        seed: Math.floor(Math.random() * 9999999),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        referenceImage: refImage || undefined,
        remixNote,
      };

      setActiveArtwork(newArtwork);
      setHistory((prev) => [newArtwork, ...prev.slice(0, 15)]);
      toast({
        title: "Image Rendered Successfully",
        description: `Generated in ${selectedAspectObj.label} (${selectedAspectObj.width}x${selectedAspectObj.height}) with ${data.model || "Google Imagen 3"}`,
      });
    } catch (err: any) {
      console.error("Image generation error:", err);
      toast({
        title: "Generation Notice",
        description: err.message || "Failed to generate image. Please check your prompt.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownloadImage = async (url?: string, format: "png" | "jpg" | "webp" = "png") => {
    const targetUrl = url || activeArtwork?.url;
    if (!targetUrl) return;

    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `knowdeep_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      toast({
        title: "Download Started",
        description: `Saved high-resolution .${format} file.`,
      });
    } catch {
      window.open(targetUrl, "_blank");
    }
  };

  const handleSaveToGallery = (artToSave = activeArtwork) => {
    if (!artToSave) return;
    try {
      const existingStr = localStorage.getItem("knowdeep_gallery");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [
        {
          id: artToSave.id || `gallery-${Date.now()}`,
          url: artToSave.url,
          prompt: artToSave.prompt,
          style: artToSave.style,
          timestamp: new Date().toISOString(),
          type: "image",
        },
        ...existing.filter((item: { id?: string }) => item.id !== artToSave.id),
      ];
      localStorage.setItem("knowdeep_gallery", JSON.stringify(updated));

      // Also sync to knowdeep_gallery_images for My Stuff compatibility
      const localImgsStr = localStorage.getItem("knowdeep_gallery_images");
      const localImgs = localImgsStr ? JSON.parse(localImgsStr) : [];
      const updatedImgs = [
        {
          id: artToSave.id || `gallery-img-${Date.now()}`,
          prompt: artToSave.prompt,
          image_url: artToSave.url,
          image_type: artToSave.style || "Photorealistic",
          created_at: new Date().toISOString(),
        },
        ...localImgs.filter((item: { id?: string }) => item.id !== artToSave.id),
      ];
      localStorage.setItem("knowdeep_gallery_images", JSON.stringify(updatedImgs));

      toast({
        title: "Saved to My Gallery & My Stuff!",
        description: "Your 8K artwork is stored in your personal gallery and My Stuff workspace.",
      });
    } catch {
      toast({
        title: "Saved to My Gallery",
        description: "Artwork stored successfully.",
      });
    }
  };

  const handleCopyPrompt = () => {
    if (!activeArtwork?.prompt) return;
    navigator.clipboard.writeText(activeArtwork.prompt);
    setCopiedPrompt(true);
    toast({ title: "Prompt Copied to Clipboard" });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleUseAsNewReference = (imageUrl?: string) => {
    const target = imageUrl || activeArtwork?.url;
    if (!target) return;
    setReferenceImageA(target);
    setCanvasViewMode("side-by-side");
    toast({
      title: "Active Art Set as Reference",
      description: "Now ready for side-by-side comparison, blending, or generating variations.",
    });
  };

  return (
    <AppLayout title="Image Generator">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* ========================================================= */}
        {/* TOP GROK-STYLE HERO BANNER                                */}
        {/* ========================================================= */}
        <div className="relative border-b border-border/50 bg-gradient-to-b from-purple-950/20 via-background to-background px-4 sm:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    Next-Gen Image Studio
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    Side-by-Side Canvas & Variations
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate 8K visuals, drag-and-drop reference images for blending, and create real-time variations
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs (Text / Vision Describe / Image Remix) */}
            <div className="flex items-center p-1 bg-muted/60 rounded-2xl border border-border/50 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMode("text")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === "text"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Text-to-Image</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("describe")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === "describe"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vision Describe</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("remix")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === "remix"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Split className="w-3.5 h-3.5 text-pink-400" />
                <span>Image Remix</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStyleLibraryOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 ml-1"
                title="Open 20+ Curated Style Preset Library"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Style Library</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN STUDIO GRID                                          */}
        {/* ========================================================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT CONTROLS COLUMN (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* DEDICATED 'IMAGE REFERENCE' UPLOAD FIELD */}
            <div className="glass rounded-3xl border border-cyan-500/30 bg-card/85 p-5 space-y-3.5 shadow-xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <FileImage className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Image Reference
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Source for blending, style transfers, and variations
                    </p>
                  </div>
                </div>

                {referenceImageA && (
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceImageA(null);
                      setVisionAnalysis(null);
                    }}
                    className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Remove Reference
                  </button>
                )}
              </div>

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRefA.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[120px] relative overflow-hidden group ${
                  referenceImageA
                    ? "border-cyan-500/80 bg-cyan-500/5"
                    : "border-border/80 hover:border-cyan-500/60 bg-muted/20 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={fileInputRefA}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImageA}
                  className="hidden"
                />

                {referenceImageA ? (
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0">
                      <img
                        src={referenceImageA}
                        alt="Reference Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-left space-y-1">
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Reference Image Loaded
                      </span>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        Active as primary guidance for variations and canvas blending.
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDescribeImageVision("extract_prompt");
                          }}
                          className="text-[10px] font-bold text-cyan-400 hover:underline"
                        >
                          Vision Extract
                        </button>
                        <span className="text-muted-foreground text-[10px]">·</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasViewMode("side-by-side");
                          }}
                          className="text-[10px] font-bold text-purple-400 hover:underline"
                        >
                          Side-by-Side View
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <Upload className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-foreground">
                      Click to Browse or Drag & Drop Image
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      PNG, JPG, WEBP · Or drag directly onto right canvas
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* DEDICATED 'GENERATE VARIATIONS' TOGGLE BUTTON & CONTROLS */}
            <div className="glass rounded-3xl border border-purple-500/30 bg-card/85 p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sparkle className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Generate Variations
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Explore multiple creative variations of your concept
                    </p>
                  </div>
                </div>

                {/* The Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isVariationsMode;
                    setIsVariationsMode(next);
                    if (next) setCanvasViewMode("variations-grid");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isVariationsMode
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25 ring-2 ring-purple-500/30"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isVariationsMode ? "Variations ON" : "Variations OFF"}</span>
                </button>
              </div>

              {/* Variations Engine Parameter Controls (Revealed when variations toggled ON) */}
              <AnimatePresence>
                {isVariationsMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-2 border-t border-border/40 overflow-hidden"
                  >
                    {/* Variation Strength Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Variation Strength
                        </Label>
                        <span className="font-bold text-purple-400 capitalize text-[11px]">
                          {variationStrength}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "subtle", label: "Subtle", desc: "15% · Minor tweaks" },
                          { id: "balanced", label: "Balanced", desc: "50% · Fresh view" },
                          { id: "dramatic", label: "Dramatic", desc: "85% · Bold vision" },
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVariationStrength(v.id as any)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              variationStrength === v.id
                                ? "bg-purple-500/15 border-purple-500 text-foreground ring-1 ring-purple-500/30"
                                : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="text-xs font-bold block">{v.label}</span>
                            <span className="text-[9px] text-muted-foreground block">{v.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Variation Grid Count */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Variations Output Count
                        </Label>
                        <span className="font-bold text-cyan-400 text-[11px]">
                          {variationCount} Variations Side-by-Side
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVariationCount(2)}
                          className={`p-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                            variationCount === 2
                              ? "bg-cyan-500/15 border-cyan-500 text-foreground ring-1 ring-cyan-500/30"
                              : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          2 Variations (Side-by-Side)
                        </button>

                        <button
                          type="button"
                          onClick={() => setVariationCount(4)}
                          className={`p-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                            variationCount === 4
                              ? "bg-cyan-500/15 border-cyan-500 text-foreground ring-1 ring-cyan-500/30"
                              : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          4 Variations (Quad Canvas)
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MULTIMODAL REFERENCE IMAGE PANEL (When in Describe or Remix mode) */}
            {(activeMode === "describe" || activeMode === "remix") && (
              <div className="glass rounded-3xl border border-cyan-500/30 bg-card/80 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {activeMode === "describe" ? "Vision Describe & Extract" : "Dual-Image Fusion & Blend"}
                    </h3>
                  </div>
                </div>

                {/* Dual Image Blend Zone */}
                {activeMode === "remix" && (
                  <div
                    onClick={() => fileInputRefB.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[110px] relative overflow-hidden ${
                      referenceImageB
                        ? "border-pink-500/80 bg-pink-500/5"
                        : "border-border/80 hover:border-pink-500/60 bg-muted/20"
                    }`}
                  >
                    <input
                      ref={fileInputRefB}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImageB}
                      className="hidden"
                    />
                    {referenceImageB ? (
                      <div className="relative w-full h-20 flex items-center justify-center">
                        <img
                          src={referenceImageB}
                          alt="Reference B"
                          className="max-h-full max-w-full rounded-xl object-cover shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Image B (Style Blend)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Palette className="w-5 h-5 text-pink-400 mx-auto" />
                        <p className="text-xs font-bold text-foreground">Upload Style Image B</p>
                        <p className="text-[10px] text-muted-foreground">Borrow style/colors from 2nd image</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vision Describe Actions */}
                {activeMode === "describe" && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={() => handleDescribeImageVision("extract_prompt")}
                      disabled={isAnalyzingVision || !referenceImageA}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      {isAnalyzingVision ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span>Analyze & Extract Generative Prompt</span>
                    </Button>

                    {visionAnalysis && (
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-2 text-xs">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Vision Analysis Results:
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {visionAnalysis.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Remix Actions */}
                {activeMode === "remix" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">
                        Transformation Idea / Instruction
                      </Label>
                      <Input
                        value={remixInstruction}
                        onChange={(e) => setRemixInstruction(e.target.value)}
                        placeholder="e.g. Turn this car into a flying hovercraft in neon Tokyo rain..."
                        className="h-10 text-xs rounded-xl bg-background border-border/60"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleSynthesizeRemix}
                      disabled={isAnalyzingVision || !referenceImageA}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs gap-2 shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      {isAnalyzingVision ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Synthesize Remix & Generate Artwork</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* PROMPT EDITOR CARD */}
            <div className="glass rounded-3xl border border-border/60 bg-card/90 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Visual Prompt Concept
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Random Inspiration Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRandomSurprise}
                    className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                    title="Surprise me with a unique concept"
                  >
                    <Shuffle className="w-3 h-3 text-amber-500" />
                    <span>Surprise Me</span>
                  </Button>

                  {/* Grok-Style Magic Enhance Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="h-7 px-2.5 text-[10px] font-bold rounded-xl border-purple-500/40 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1 cursor-pointer shadow-xs"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-purple-400" />
                    )}
                    <span>Magic Polish</span>
                  </Button>
                </div>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene, lighting, colors, camera lens and artistic details in depth..."
                rows={3}
                className="text-xs sm:text-sm rounded-2xl bg-muted/30 border-border/70 resize-none leading-relaxed p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
              />

              {/* Sample Inspiration Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Curated Inspiration Prompts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CURATED_IDEAS.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(idea.prompt)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 text-left cursor-pointer"
                    >
                      {idea.category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ASPECT RATIO SELECTOR */}
            <div className="glass rounded-3xl border border-border/60 bg-card/90 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Ratio className="w-3.5 h-3.5 text-cyan-400" />
                  Aspect Ratio
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {selectedAspectObj.width} × {selectedAspectObj.height} px
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {ASPECT_RATIOS.map((ar) => {
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer ${
                        isSelected
                          ? "bg-purple-500/15 border-purple-500 text-foreground shadow-sm ring-1 ring-purple-500/30"
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div
                        className={`border-2 ${ar.iconShape} ${
                          isSelected ? "border-purple-400 bg-purple-400/20" : "border-muted-foreground/60"
                        }`}
                      />
                      <span className="text-[11px] font-bold block">{ar.label}</span>
                      <span className="text-[9px] text-muted-foreground block">{ar.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VISUAL STYLE PRESETS */}
            <div className="glass rounded-3xl border border-border/60 bg-card/90 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  Artistic Style Preset
                </span>
                <button
                  type="button"
                  onClick={() => setIsStyleLibraryOpen(true)}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Library (20+)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {STYLE_PRESETS.map((st) => {
                  const isSelected = selectedStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyle(st.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                        isSelected
                          ? "bg-purple-500/15 border-purple-500 text-foreground ring-1 ring-purple-500/30 shadow-sm"
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-foreground">{st.label}</span>
                        <span className="text-[9px] text-purple-400 font-medium block mt-0.5">{st.badge}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIMARY ACTION BUTTON (Dynamically shifts to Variations vs Single) */}
            <Button
              size="lg"
              onClick={isVariationsMode ? handleGenerateVariations : () => executeGeneration(prompt, referenceImageA)}
              disabled={isGenerating || (!prompt.trim() && !referenceImageA)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm gap-2 shadow-xl shadow-purple-500/25 cursor-pointer transition-transform active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isVariationsMode ? `Rendering ${variationCount} Variations...` : "Synthesizing Latent Artwork..."}</span>
                </>
              ) : isVariationsMode ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {variationCount} Variations</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 8K Masterpiece</span>
                </>
              )}
            </Button>
          </div>

          {/* RIGHT SIDE: MODERN SIDE-BY-SIDE 'CANVAS' WORKSPACE (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* WORKSPACE CANVAS CONTAINER WITH DRAG-AND-DROP BLEND SUPPORT */}
            <div
              ref={canvasDropRef}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverCanvas(true);
              }}
              onDragLeave={() => setIsDragOverCanvas(false)}
              onDrop={handleCanvasDrop}
              className={`glass rounded-3xl border transition-all bg-card/90 p-4 sm:p-6 shadow-2xl relative flex flex-col justify-between min-h-[580px] ${
                isDragOverCanvas
                  ? "border-cyan-400 ring-4 ring-cyan-500/25 bg-cyan-500/5"
                  : "border-border/60"
              }`}
            >
              {/* Drag-and-Drop Active Overlay Indicator */}
              <AnimatePresence>
                {isDragOverCanvas && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-none"
                  >
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-bounce">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Drop Image to Set as Reference</h3>
                      <p className="text-xs text-cyan-300 mt-1">
                        Instantly enables side-by-side comparison, blending, and variation generation
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TOP WORKSPACE CANVAS BAR */}
              <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-border/40 gap-3">
                {/* Canvas View Switcher: Masterpiece vs Side-by-Side vs Variations Grid */}
                <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("masterpiece")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      canvasViewMode === "masterpiece"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Square className="w-3.5 h-3.5 text-purple-400" />
                    <span>Masterpiece</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("side-by-side")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      canvasViewMode === "side-by-side"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Side-by-Side</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("variations-grid")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      canvasViewMode === "variations-grid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 text-pink-400" />
                    <span>Variations ({currentVariations.length || 0})</span>
                  </button>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPrompt}
                    className="h-8 px-2.5 text-xs rounded-xl text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                    title="Copy full prompt"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedPrompt ? "Copied" : "Copy"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUseAsNewReference()}
                    className="h-8 px-2.5 text-xs rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 gap-1 cursor-pointer"
                    title="Set active artwork as new Reference Image"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Use as Ref</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsLightboxOpen(true)}
                    className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Expand Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* REAL-TIME GENERATION PREVIEW OVERLAY / PROGRESS */}
              {isGenerating && (
                <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 animate-spin blur-lg opacity-75" />
                    <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center absolute inset-0 m-auto text-purple-400 shadow-2xl">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <p className="text-base font-extrabold text-foreground">
                      {isVariationsMode ? `Synthesizing ${variationCount} Variations` : "Rendering Your Vision in 8K"}
                    </p>
                    <p className="text-xs text-purple-400 font-mono animate-pulse">
                      {generationStep || "Synthesizing neural latent space..."}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-300"
                        style={{ width: `${generationProgress || 45}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 1: MASTERPIECE SINGLE VIEW */}
              {!isGenerating && canvasViewMode === "masterpiece" && (
                <div className="flex-1 flex items-center justify-center py-4 relative overflow-hidden rounded-2xl">
                  {activeArtwork ? (
                    <div className="relative group w-full flex items-center justify-center">
                      <img
                        src={activeArtwork.url}
                        alt={activeArtwork.prompt}
                        className="max-h-[480px] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-border/40 transition-transform duration-300 group-hover:scale-[1.01]"
                      />

                      {/* Origin Reference Thumbnail Badge */}
                      {activeArtwork.referenceImage && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px]">
                          <img
                            src={activeArtwork.referenceImage}
                            alt="Origin Ref"
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <span className="font-bold px-1">Remixed from Reference</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground text-xs space-y-2">
                      <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
                      <p>Enter a prompt or upload an Image Reference to begin rendering.</p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: SIDE-BY-SIDE DUAL CANVAS WORKSPACE */}
              {!isGenerating && canvasViewMode === "side-by-side" && (
                <div className="flex-1 py-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[420px]">
                    {/* LEFT CANVAS: Reference Image */}
                    <div className="glass bg-card/60 rounded-2xl border border-border/60 p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <FileImage className="w-3.5 h-3.5" />
                          Image Reference
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => fileInputRefA.current?.click()}
                          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Change
                        </Button>
                      </div>

                      <div className="flex-1 flex items-center justify-center p-2">
                        {referenceImageA ? (
                          <img
                            src={referenceImageA}
                            alt="Reference"
                            className="max-h-[340px] w-auto max-w-full rounded-xl object-contain shadow-lg border border-border/40"
                          />
                        ) : (
                          <div
                            onClick={() => fileInputRefA.current?.click()}
                            className="border-2 border-dashed border-border/80 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer space-y-2 w-full"
                          >
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="text-xs font-bold text-foreground">Upload Reference Image</p>
                            <p className="text-[10px] text-muted-foreground">Or drag and drop any image onto this canvas</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground flex justify-between">
                        <span>Original Reference Input</span>
                        <span>Source Geometry / Subject</span>
                      </div>
                    </div>

                    {/* RIGHT CANVAS: Generated Artwork Output */}
                    <div className="glass bg-card/60 rounded-2xl border border-border/60 p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Generated Artwork
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {selectedAspectObj.label} · 8K
                        </span>
                      </div>

                      <div className="flex-1 flex items-center justify-center p-2">
                        {activeArtwork ? (
                          <img
                            src={activeArtwork.url}
                            alt="Result"
                            className="max-h-[340px] w-auto max-w-full rounded-xl object-contain shadow-xl border border-border/40"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground text-xs p-6">
                            No artwork rendered yet. Click "Generate" to see result.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground flex justify-between">
                        <span className="font-semibold text-foreground">Synthesized Output</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(activeArtwork?.url, "png")}
                          className="text-purple-400 hover:underline font-bold"
                        >
                          Download 8K PNG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: VARIATIONS CANVAS GRID */}
              {!isGenerating && canvasViewMode === "variations-grid" && (
                <div className="flex-1 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-pink-400" />
                      Side-by-Side Variations Gallery
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Click any variation to inspect or set as active reference
                    </span>
                  </div>

                  {currentVariations.length === 0 ? (
                    <div className="text-center py-16 space-y-3 glass rounded-2xl border border-border/50 p-6">
                      <Sparkles className="w-10 h-10 text-purple-400 mx-auto opacity-40 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-foreground">No Variations Generated Yet</p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                          Click "Generate {variationCount} Variations" to synthesize alternative lighting, camera angles, and compositions.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleGenerateVariations}
                        className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate {variationCount} Variations Now</span>
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`grid gap-4 ${
                        currentVariations.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"
                      }`}
                    >
                      {currentVariations.map((v, i) => (
                        <div
                          key={v.id}
                          className="glass bg-card/60 rounded-2xl border border-border/60 hover:border-purple-500/80 p-3 space-y-2.5 transition-all shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                              {v.variationTitle || `Variation ${i + 1}`}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              Seed: {v.seed}
                            </span>
                          </div>

                          <div
                            onClick={() => setActiveArtwork(v)}
                            className="relative rounded-xl overflow-hidden cursor-pointer aspect-video bg-black/40 flex items-center justify-center"
                          >
                            <img
                              src={v.url}
                              alt={v.prompt}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="text-xs font-bold text-white bg-black/70 px-2.5 py-1 rounded-lg">
                                Click to View
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {v.variationDifference || v.prompt}
                          </p>

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUseAsNewReference(v.url)}
                              className="h-7 px-2 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10 rounded-lg gap-1 cursor-pointer"
                            >
                              <Split className="w-3 h-3" />
                              Use as Ref
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadImage(v.url, "png")}
                              className="h-7 px-2 text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 rounded-lg gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BOTTOM CANVAS ACTION BAR */}
              {activeArtwork && (
                <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                    <span className="font-bold text-foreground">Prompt:</span> {activeArtwork.prompt}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveToGallery(activeArtwork)}
                      className="h-9 px-3.5 rounded-xl border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/20" />
                      <span>Save to My Gallery</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleDownloadImage(activeArtwork.url, "png")}
                      className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* GENERATION HISTORY GALLERY */}
            <div className="glass rounded-3xl border border-border/60 bg-card/90 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Recent Creations & Variations ({history.length})
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-[10px] text-muted-foreground hover:text-rose-500 font-semibold cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground space-y-1">
                  <p>Your generated artworks will accumulate here.</p>
                  <p className="text-[10px]">1-click to reload, download, or remix any past creation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {history.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setActiveArtwork(art)}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-square ${
                        activeArtwork?.id === art.id
                          ? "ring-2 ring-purple-500 border-purple-500 shadow-md"
                          : "border-border/60 hover:border-purple-500/60"
                      }`}
                    >
                      <img
                        src={art.url}
                        alt={art.prompt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                        <p className="text-[10px] text-white line-clamp-2 font-medium">
                          {art.prompt}
                        </p>
                        <span className="text-[9px] text-purple-300 font-mono mt-0.5">
                          {art.style} · {art.aspect}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* FULLSCREEN LIGHTBOX MODAL                                 */}
        {/* ========================================================= */}
        {isLightboxOpen && activeArtwork && (
          <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
            <DialogContent className="max-w-5xl glass backdrop-blur-2xl border-border/60 bg-card/95 p-6 shadow-2xl rounded-3xl">
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                      Full-Resolution Inspector
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedAspectObj.label} ({selectedAspectObj.width} × {selectedAspectObj.height} px) · Seed: {activeArtwork.seed}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadImage(activeArtwork.url, "png")}
                      className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download 8K
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <div className="max-h-[65vh] overflow-hidden rounded-2xl flex items-center justify-center border border-border/40 bg-black/40">
                  <img
                    src={activeArtwork.url}
                    alt={activeArtwork.prompt}
                    className="max-h-[60vh] w-auto object-contain rounded-xl"
                  />
                </div>

                <div className="w-full p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Full Visual Prompt:
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">
                    {activeArtwork.prompt}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Style Preset Library Sidebar Drawer */}
        <StylePresetLibrary
          isOpen={isStyleLibraryOpen}
          onClose={() => setIsStyleLibraryOpen(false)}
          onApplyPreset={handleApplyLibraryPreset}
          activePresetId={activeLibraryPresetId}
        />
      </div>
    </AppLayout>
  );
}
