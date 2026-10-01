import React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Droplets,
  Sparkles,
  Thermometer,
} from "lucide-react";

export type WeatherVisualType = "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "windy" | "night";

interface StylishWeatherLogoProps {
  condition?: string;
  temperature?: number;
  unit?: "°C" | "°F";
  city?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const StylishWeatherLogo: React.FC<StylishWeatherLogoProps> = ({
  condition = "Partly Cloudy",
  temperature = 22,
  unit = "°C",
  city,
  size = "md",
  showGlow = true,
  interactive = true,
  onClick,
}) => {
  const condLower = condition.toLowerCase();

  let visualType: WeatherVisualType = "sunny";
  if (condLower.includes("rain") || condLower.includes("drizzle") || condLower.includes("shower")) {
    visualType = "rainy";
  } else if (condLower.includes("thunder") || condLower.includes("storm") || condLower.includes("lightning")) {
    visualType = "stormy";
  } else if (condLower.includes("snow") || condLower.includes("blizzard") || condLower.includes("ice") || condLower.includes("flurry")) {
    visualType = "snowy";
  } else if (condLower.includes("wind") || condLower.includes("breeze") || condLower.includes("tornado") || condLower.includes("gust")) {
    visualType = "windy";
  } else if (condLower.includes("night") || condLower.includes("clear night") || condLower.includes("moon")) {
    visualType = "night";
  } else if (condLower.includes("cloud") || condLower.includes("overcast") || condLower.includes("fog") || condLower.includes("mist") || condLower.includes("haze")) {
    visualType = "cloudy";
  }

  // Theme palettes and glow styles
  const themes = {
    sunny: {
      gradient: "from-amber-500/30 via-orange-500/20 to-yellow-400/10",
      border: "border-amber-400/40 hover:border-amber-400/80",
      glow: "shadow-[0_0_25px_rgba(251,191,36,0.35)]",
      sunColor: "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]",
      cloudColor: "text-amber-100 dark:text-amber-200/80",
      accent: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    },
    cloudy: {
      gradient: "from-sky-500/25 via-slate-500/20 to-blue-500/10",
      border: "border-sky-400/40 hover:border-sky-400/80",
      glow: "shadow-[0_0_25px_rgba(56,189,248,0.3)]",
      sunColor: "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]",
      cloudColor: "text-sky-100 dark:text-sky-200",
      accent: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    },
    rainy: {
      gradient: "from-blue-600/30 via-cyan-600/20 to-indigo-900/20",
      border: "border-cyan-400/40 hover:border-cyan-400/80",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.35)]",
      sunColor: "text-cyan-300",
      cloudColor: "text-cyan-100 dark:text-cyan-200",
      accent: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    stormy: {
      gradient: "from-purple-600/30 via-indigo-700/25 to-amber-500/15",
      border: "border-purple-400/40 hover:border-purple-400/80",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
      sunColor: "text-amber-400",
      cloudColor: "text-purple-100 dark:text-purple-200",
      accent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    snowy: {
      gradient: "from-cyan-300/30 via-sky-200/20 to-blue-400/10",
      border: "border-cyan-300/50 hover:border-cyan-300/90",
      glow: "shadow-[0_0_25px_rgba(103,232,249,0.4)]",
      sunColor: "text-sky-200",
      cloudColor: "text-white",
      accent: "bg-cyan-500/20 text-cyan-300 border-cyan-300/30",
    },
    windy: {
      gradient: "from-teal-500/30 via-emerald-500/20 to-sky-500/10",
      border: "border-teal-400/40 hover:border-teal-400/80",
      glow: "shadow-[0_0_25px_rgba(45,212,191,0.35)]",
      sunColor: "text-teal-300",
      cloudColor: "text-teal-100",
      accent: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    },
    night: {
      gradient: "from-indigo-900/40 via-purple-900/30 to-slate-900/40",
      border: "border-indigo-400/40 hover:border-indigo-400/80",
      glow: "shadow-[0_0_25px_rgba(129,140,248,0.35)]",
      sunColor: "text-indigo-300",
      cloudColor: "text-indigo-100",
      accent: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
  };

  const currentTheme = themes[visualType];

  const sizeClasses = {
    sm: "w-10 h-10 p-1.5 rounded-xl",
    md: "w-14 h-14 p-2.5 rounded-2xl",
    lg: "w-20 h-20 p-3.5 rounded-3xl",
    xl: "w-28 h-28 p-4 rounded-3xl",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.05, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center backdrop-blur-xl border bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.border} ${sizeClasses[size]} ${showGlow ? currentTheme.glow : ""} ${interactive ? "cursor-pointer" : ""} transition-all duration-300 select-none`}
    >
      {/* Dynamic Animated Atmospheric Rings */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xs pointer-events-none"
        />
      </div>

      {/* Weather Art Glyphs */}
      <div className="relative z-10 flex items-center justify-center">
        {visualType === "sunny" && (
          <div className="relative flex items-center justify-center">
            {/* Spinning corona rays */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className={`${iconSizes[size]} ${currentTheme.sunColor} opacity-90`} />
            </motion.div>
            {/* Pulsing solar core */}
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-3/5 h-3/5 rounded-full bg-amber-400/80 blur-xs absolute"
            />
            <Sun className={`${iconSizes[size]} ${currentTheme.sunColor} relative z-10`} />
          </div>
        )}

        {visualType === "cloudy" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Cloud className={`${iconSizes[size]} ${currentTheme.cloudColor} drop-shadow-md`} />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 45, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 z-0"
            >
              <Sun className={`w-3.5 h-3.5 ${currentTheme.sunColor}`} />
            </motion.div>
          </div>
        )}

        {visualType === "rainy" && (
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              animate={{ y: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudRain className={`${iconSizes[size]} ${currentTheme.cloudColor} drop-shadow-md`} />
            </motion.div>
            {/* Animated falling rain droplets */}
            <div className="absolute -bottom-1 flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, 6], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeIn",
                  }}
                  className="w-0.5 h-1.5 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {visualType === "stormy" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 0.98, 1],
                filter: [
                  "drop-shadow(0 0 0px #eab308)",
                  "drop-shadow(0 0 8px #eab308)",
                  "drop-shadow(0 0 0px #eab308)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudLightning className={`${iconSizes[size]} text-amber-300 drop-shadow-lg`} />
            </motion.div>
          </div>
        )}

        {visualType === "snowy" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudSnow className={`${iconSizes[size]} ${currentTheme.cloudColor}`} />
            </motion.div>
          </div>
        )}

        {visualType === "windy" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ x: [-3, 3, -3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Wind className={`${iconSizes[size]} ${currentTheme.sunColor}`} />
            </motion.div>
          </div>
        )}

        {visualType === "night" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Sparkles className={`${iconSizes[size]} ${currentTheme.sunColor}`} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Tiny Status Dot Badge */}
      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-background" />
      </span>
    </motion.div>
  );
};
