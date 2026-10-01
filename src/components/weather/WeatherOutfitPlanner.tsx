import React, { useState } from "react";
import { Shirt, Umbrella, Sun, Wind, CheckCircle2, Sparkles, Footprints, Glasses, Layers, Check } from "lucide-react";

interface WeatherOutfitPlannerProps {
  temp?: number;
  condition?: string;
  rainProb?: number;
  humidity?: number;
  windSpeed?: number;
}

type OccasionType = "casual" | "workout" | "formal" | "rain";

export const WeatherOutfitPlanner: React.FC<WeatherOutfitPlannerProps> = ({
  temp = 22,
  condition = "Partly Cloudy",
  rainProb = 15,
  humidity = 58,
  windSpeed = 14,
}) => {
  const [occasion, setOccasion] = useState<OccasionType>("casual");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Determine outfit recommendations based on temperature, rain probability, and occasion
  const getOutfitSuggestions = () => {
    const isCold = temp < 15;
    const isWarm = temp >= 24;
    const isWet = rainProb >= 40 || condition.toLowerCase().includes("rain");

    if (occasion === "workout") {
      return {
        top: isCold ? "Thermal Compression Long-Sleeve & Light Windbreaker" : "Breathable Mesh Running Tee",
        bottom: isCold ? "Fleece-Lined Athletic Tights" : "Moisture-Wicking Shorts",
        shoes: isWet ? "Water-Resistant Trail Running Shoes" : "Cushioned Mesh Sneakers",
        accessories: isWarm ? "UV Sports Cap & Polarized Shades" : "Thermal Running Headband",
        note: "Optimal moisture evacuation and lightweight breathability for physical exertion.",
      };
    }

    if (occasion === "formal") {
      return {
        top: isCold ? "Wool Blazer over Oxford Shirt & Cashmere Sweater" : "Tailored Cotton Dress Shirt & Blazer",
        bottom: "Tailored Trousers / Chinos",
        shoes: isWet ? "Polished Leather Boots with Rubber Soles" : "Classic Leather Loafers / Oxfords",
        accessories: isWet ? "Compact Wind-Proof Umbrella & Trench Coat" : "Silk Tie & Leather Watch",
        note: "Sharp executive silhouette with climate-controlled fabric lining.",
      };
    }

    if (occasion === "rain" || isWet) {
      return {
        top: "Hooded GORE-TEX Waterproof Shell over Fleece Layer",
        bottom: "Water-Repellent Tactical Pants",
        shoes: "Waterproof Rubber-Sole Boots",
        accessories: "Storm-Resistant Umbrella & Waterproof Backpack Cover",
        note: "Maximum precipitation shielding with sealed seams and water barrier protection.",
      };
    }

    // Casual default
    return {
      top: isCold ? "Layered Knit Hoodie & Light Down Vest" : isWarm ? "Breathable Linen / Cotton Shirt" : "Soft Crewneck Sweater & Tee",
      bottom: isWarm ? "Relaxed Cotton Shorts or Linen Trousers" : "Comfortable Denim / Chinos",
      shoes: "Versatile Daily Canvas Sneakers",
      accessories: isWarm ? "Polarized UV400 Sunglasses & Hydration Flask" : "Light Scarf or Beanie",
      note: "Balanced casual comfort for indoor and outdoor transition.",
    };
  };

  const outfit = getOutfitSuggestions();

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-5">
      {/* Header & Occasion Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Smart Outfit Planner Widget</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-bold">
                {temp}°C · {rainProb}% Rain Risk
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Dynamic clothing and layering recommendations matched to thermal comfort &amp; precipitation risk
            </p>
          </div>
        </div>

        {/* Occasion Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border/60 overflow-x-auto">
          <button
            onClick={() => setOccasion("casual")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              occasion === "casual"
                ? "bg-sky-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Casual / City
          </button>

          <button
            onClick={() => setOccasion("workout")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              occasion === "workout"
                ? "bg-teal-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fitness / Run
          </button>

          <button
            onClick={() => setOccasion("formal")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              occasion === "formal"
                ? "bg-indigo-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Work / Formal
          </button>

          <button
            onClick={() => setOccasion("rain")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              occasion === "rain"
                ? "bg-rose-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rain Armor
          </button>
        </div>
      </div>

      {/* Recommended Outfit Checklist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Top Outerwear */}
        <div
          onClick={() => toggleCheck("top")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            checkedItems["top"]
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-muted/30 border-border/40 hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Top &amp; Outerwear
            </span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              checkedItems["top"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground"
            }`}>
              {checkedItems["top"] && <Check className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground leading-snug">
            {outfit.top}
          </p>
        </div>

        {/* Bottom Trousers */}
        <div
          onClick={() => toggleCheck("bottom")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            checkedItems["bottom"]
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-muted/30 border-border/40 hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5" /> Bottom &amp; Trousers
            </span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              checkedItems["bottom"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground"
            }`}>
              {checkedItems["bottom"] && <Check className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground leading-snug">
            {outfit.bottom}
          </p>
        </div>

        {/* Footwear */}
        <div
          onClick={() => toggleCheck("shoes")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            checkedItems["shoes"]
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-muted/30 border-border/40 hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5" /> Footwear &amp; Socks
            </span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              checkedItems["shoes"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground"
            }`}>
              {checkedItems["shoes"] && <Check className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground leading-snug">
            {outfit.shoes}
          </p>
        </div>

        {/* Accessories */}
        <div
          onClick={() => toggleCheck("accessories")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            checkedItems["accessories"]
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-muted/30 border-border/40 hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Glasses className="w-3.5 h-3.5" /> Gear &amp; Accessories
            </span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              checkedItems["accessories"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground"
            }`}>
              {checkedItems["accessories"] && <Check className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground leading-snug">
            {outfit.accessories}
          </p>
        </div>
      </div>

      {/* Note Bar */}
      <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-muted-foreground flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
        <p className="leading-snug">{outfit.note}</p>
      </div>
    </div>
  );
};
