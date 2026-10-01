import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Sun,
  Camera,
  Layers,
  Search,
  Check,
  X,
  Wand2,
  Sliders,
  ChevronRight,
  Flame,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface StylePresetItem {
  id: string;
  name: string;
  category: "artistic" | "lighting" | "camera";
  tag: string;
  description: string;
  gradient: string;
  promptAddon: string;
}

export const PRESET_LIBRARY: StylePresetItem[] = [
  // --- ARTISTIC MEDIUMS ---
  {
    id: "photo-8k",
    name: "Photorealistic 8K",
    category: "artistic",
    tag: "National Geographic",
    description: "Ultra-sharp detail, natural lighting, and lifelike skin/surface textures",
    gradient: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
    promptAddon: "hyper-realistic photograph, 8k resolution, shot on 35mm lens, natural golden hour lighting, cinematic depth of field, hyper-detailed textures",
  },
  {
    id: "anime-ghibli",
    name: "Anime Masterpiece",
    category: "artistic",
    tag: "Makoto Shinkai / Ghibli",
    description: "Radiant emotional skies, vibrant cel-shaded color palette, and hand-drawn detail",
    gradient: "from-pink-500/20 to-purple-500/20 text-pink-500 border-pink-500/30",
    promptAddon: "studio anime artwork, Makoto Shinkai and Ghibli aesthetic, radiant clouds, emotional lighting, hand-drawn detailing, vibrant cel-shaded color palette",
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    category: "artistic",
    tag: "Blade Runner",
    description: "Dystopian sci-fi with rainy reflective asphalt and volumetric cyan/magenta neon",
    gradient: "from-violet-500/20 to-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30",
    promptAddon: "cyberpunk aesthetic, futuristic neon signage in rain, reflective wet asphalt, volumetric cyan and magenta lighting, holographic advertisements, high-tech dystopian city",
  },
  {
    id: "3d-octane",
    name: "3D Octane Render",
    category: "artistic",
    tag: "Cinema4D / Unreal",
    description: "Clean ray-traced materials, subsurface scattering, and soft studio lighting",
    gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
    promptAddon: "3D digital render, Octane Render, ray-tracing, subsurface scattering, photorealistic textures, soft studio softbox lighting, clay and iridescent glass materials",
  },
  {
    id: "concept-art",
    name: "Concept Matte Art",
    category: "artistic",
    tag: "ArtStation Trending",
    description: "Epic worldbuilding, dynamic camera perspective, and painterly matte brushes",
    gradient: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    promptAddon: "epic concept art, trending on ArtStation, matte painting, dynamic camera angle, dramatic atmosphere, detailed digital brushwork, cinematic fantasy worldbuilding",
  },
  {
    id: "oil-impasto",
    name: "Classical Oil Canvas",
    category: "artistic",
    tag: "Impasto Masters",
    description: "Visible textured brushstrokes, warm earthen palette, and museum finish",
    gradient: "from-yellow-600/20 to-amber-700/20 text-amber-500 border-amber-600/30",
    promptAddon: "classical oil on linen canvas painting, visible textured impasto brushstrokes, rich warm palette, chiaroscuro lighting, museum masterpiece aesthetic",
  },
  {
    id: "synthwave-80s",
    name: "80s Retro Synthwave",
    category: "artistic",
    tag: "Outrun VHS",
    description: "Neon wireframe horizons, chrome typography, and vintage analog CRT warmth",
    gradient: "from-purple-600/20 to-indigo-600/20 text-purple-400 border-purple-500/30",
    promptAddon: "80s retro synthwave aesthetic, glowing neon grid horizon, chrome reflective typography, wireframe sun, vintage VHS grain, outrun sports car vibes",
  },
  {
    id: "watercolor-sumie",
    name: "Japanese Watercolor",
    category: "artistic",
    tag: "Sumi-e Wash",
    description: "Delicate pigment bleeds on rice paper, negative space, and poetic calm",
    gradient: "from-sky-500/20 to-teal-500/20 text-sky-400 border-sky-500/30",
    promptAddon: "delicate Japanese watercolor and sumi-e ink painting on textured rice paper, soft bleeding pigment washes, minimal negative space, poetic elegance",
  },
  {
    id: "ukiyo-e",
    name: "Ukiyo-e Woodblock",
    category: "artistic",
    tag: "Hokusai Style",
    description: "Bold contour lines, traditional Japanese color blocks, and wave/cloud motifs",
    gradient: "from-red-500/20 to-rose-600/20 text-rose-400 border-rose-500/30",
    promptAddon: "traditional Japanese Ukiyo-e woodblock print, Hokusai aesthetic, flat graphic planes, bold organic outlines, textured washi paper, vintage Edo period elegance",
  },
  {
    id: "dark-gothic",
    name: "Dark Fantasy Gothic",
    category: "artistic",
    tag: "Elden Ring / Souls",
    description: "Towering gothic spires, haunting mist, and somber, ornate armor and architecture",
    gradient: "from-neutral-800/40 to-neutral-900/40 text-neutral-300 border-neutral-700",
    promptAddon: "dark gothic fantasy, Elden Ring dark souls aesthetic, crumbling gothic spires, haunting volumetric fog, ornate rusted filigree armor, moody somber palette, cinematic masterpiece",
  },

  // --- LIGHTING ATMOSPHERES ---
  {
    id: "light-golden",
    name: "Golden Hour Glow",
    category: "lighting",
    tag: "Warm Atmospheric",
    description: "Low-angled honeyed sunlight with long dramatic shadows and warm rim glow",
    gradient: "from-amber-400/20 to-yellow-500/20 text-amber-400 border-amber-400/30",
    promptAddon: "golden hour lighting, warm honey sunlight streaming at low angle, long cinematic shadows, radiant amber rim light, dust motes in atmospheric air",
  },
  {
    id: "light-godrays",
    name: "Volumetric God Rays",
    category: "lighting",
    tag: "Crepuscular Beams",
    description: "Dazzling shafts of light piercing mist, fog, or grand architectural windows",
    gradient: "from-blue-400/20 to-cyan-500/20 text-cyan-300 border-cyan-400/30",
    promptAddon: "dramatic volumetric god rays, intense crepuscular sunbeams piercing through dense mist, ethereal hazy atmosphere, specular highlights, ray-traced lighting",
  },
  {
    id: "light-bioluminescent",
    name: "Bioluminescent Flora",
    category: "lighting",
    tag: "Avatar Pandora",
    description: "Deep oceanic or forest night illuminated by glowing cyan, emerald, and violet spores",
    gradient: "from-teal-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30",
    promptAddon: "bioluminescent glowing lighting, Avatar Pandora aesthetic, neon cyan and emerald glowing flora and spores, dark midnight contrast, magical radiant illumination",
  },
  {
    id: "light-film-noir",
    name: "Moody Film Noir",
    category: "lighting",
    tag: "High Contrast",
    description: "Extreme chiaroscuro contrast with venetian blind shadows and smoking silhouettes",
    gradient: "from-zinc-700/30 to-zinc-900/40 text-zinc-300 border-zinc-600",
    promptAddon: "moody film noir lighting, stark black and white chiaroscuro, harsh venetian blind shadows, silhouetted forms, smoky atmospheric haze, high-contrast drama",
  },
  {
    id: "light-studio-softbox",
    name: "Studio Glamour Softbox",
    category: "lighting",
    tag: "Vogue Editorial",
    description: "Diffused three-point beauty lighting with flawless catchlights and zero harsh glare",
    gradient: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
    promptAddon: "commercial studio three-point lighting, large diffuse softbox illumination, subtle catchlights in eyes, clean shadow falloff, professional beauty photography",
  },

  // --- CAMERA & RENDERING ENGINES ---
  {
    id: "cam-35mm-film",
    name: "35mm Analog Grain",
    category: "camera",
    tag: "Kodak Portra 400",
    description: "Authentic film grain, natural halation around highlights, and organic color grading",
    gradient: "from-orange-500/20 to-amber-600/20 text-orange-400 border-orange-500/30",
    promptAddon: "shot on 35mm vintage camera, Kodak Portra 400 film stock, authentic fine film grain, natural red halation around highlights, soft analog color grading",
  },
  {
    id: "cam-imax-70mm",
    name: "IMAX 70mm Panavision",
    category: "camera",
    tag: "Christopher Nolan",
    description: "Massive cinematic scale, crystal-clear edge sharpness, and expansive dynamic range",
    gradient: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30",
    promptAddon: "shot on IMAX 70mm Panavision camera, Christopher Nolan cinematic scale, crystal edge sharpness, wide panoramic framing, deep dynamic range, 8k theater master",
  },
  {
    id: "cam-macro-bokeh",
    name: "Macro F/1.2 Bokeh",
    category: "camera",
    tag: "Extreme Close-Up",
    description: "Microscopic focal plane with creamy circular bokeh spheres in the background",
    gradient: "from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30",
    promptAddon: "extreme macro lens photography, shot at f/1.2, razor-thin focal plane, creamy circular bokeh blur in background, microscopic surface textures",
  },
  {
    id: "cam-tilt-shift",
    name: "Tilt-Shift Miniature",
    category: "camera",
    tag: "Toy Town Effect",
    description: "Selective focus plane creating a charming miniature toy model optical illusion",
    gradient: "from-lime-500/20 to-emerald-600/20 text-lime-400 border-lime-500/30",
    promptAddon: "tilt-shift lens miniature photography, miniature diorama aesthetic, selective horizontal focus band, blurred foreground and background, toy world illusion",
  },
  {
    id: "cam-unreal-5",
    name: "Unreal Engine 5 Lumen",
    category: "camera",
    tag: "Next-Gen Nanite",
    description: "Real-time global illumination, infinite geometric detail, and high-specular reflections",
    gradient: "from-slate-700/40 to-slate-900/40 text-cyan-400 border-cyan-500/40",
    promptAddon: "Unreal Engine 5.4 render, Lumen global illumination, Nanite micro-polygon geometry, ray-traced ambient occlusion, next-generation video game cinematic",
  },
];

interface StylePresetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (preset: StylePresetItem) => void;
  activePresetId?: string | null;
}

export const StylePresetLibrary: React.FC<StylePresetLibraryProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
  activePresetId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "artistic" | "lighting" | "camera">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredPresets = PRESET_LIBRARY.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] glass backdrop-blur-2xl bg-card/95 border-l border-border/60 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Palette className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Style Preset Library
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Click any style, lighting, or lens to inject into prompt
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="p-4 border-b border-border/40 space-y-3 bg-muted/20">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime, cyberpunk, golden hour, 35mm..."
            className="pl-9 h-9 text-xs rounded-xl bg-background border-border/60"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl text-xs">
          {[
            { id: "all", label: "All Styles", icon: Sparkles },
            { id: "artistic", label: "Art Mediums", icon: Palette },
            { id: "lighting", label: "Lighting", icon: Sun },
            { id: "camera", label: "Lenses & 3D", icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1 pb-1">
          <span>{filteredPresets.length} Presets Available</span>
          <span className="text-purple-400 font-bold">1-Click Apply</span>
        </div>

        {filteredPresets.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isActive
                  ? "bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/30 shadow-md"
                  : "bg-card/70 border-border/60 hover:border-purple-500/60 hover:bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center bg-gradient-to-br ${preset.gradient}`}
                  >
                    {preset.category === "artistic" ? (
                      <Palette className="w-3.5 h-3.5" />
                    ) : preset.category === "lighting" ? (
                      <Sun className="w-3.5 h-3.5" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-foreground group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                      {preset.name}
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                        {preset.tag}
                      </span>
                    </h3>
                  </div>
                </div>

                {isActive && (
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pl-9">
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
