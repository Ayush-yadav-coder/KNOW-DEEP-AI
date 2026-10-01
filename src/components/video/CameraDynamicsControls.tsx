import React from "react";
import { Compass, Sparkles, Zap, Timer, Wind, Activity } from "lucide-react";

export type CameraDynamicType = "none" | "drone_fly" | "bullet_time" | "fpv_dive" | "action_shake" | "hyper_orbit";

interface CameraDynamicsControlsProps {
  activeDynamics: CameraDynamicType;
  onChange: (type: CameraDynamicType) => void;
}

const DYNAMICS_OPTIONS: { id: CameraDynamicType; name: string; icon: any; desc: string; badge: string }[] = [
  { id: "none", name: "Standard Cam", icon: Compass, desc: "Smooth standard cinematic camera path", badge: "Static" },
  { id: "drone_fly", name: "Drone Fly-Through", icon: Wind, desc: "Continuous smooth forward glide with volumetric drift", badge: "Aerial" },
  { id: "bullet_time", name: "Matrix Bullet-Time", icon: Timer, desc: "Dynamic time-dilation: slow-mo freeze at climax", badge: "0.25x Drop" },
  { id: "fpv_dive", name: "FPV Drone Dive", icon: Sparkles, desc: "High velocity banking roll and vertical angle sweep", badge: "Acrobatic" },
  { id: "action_shake", name: "Action Cam Shake", icon: Activity, desc: "Handheld adrenaline micro-impact vibration", badge: "Adrenaline" },
  { id: "hyper_orbit", name: "Hyper-Orbit", icon: Zap, desc: "Full 360 dynamic perspective circular sweep", badge: "360 Sweep" }
];

export function CameraDynamicsControls({
  activeDynamics,
  onChange
}: CameraDynamicsControlsProps) {
  return (
    <div className="space-y-3 bg-muted/20 border border-border/70 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-red-500 animate-spin" />
          <span className="text-xs font-bold text-foreground">Camera Dynamics & Bullet Time FX</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/15">
          Live Render FX
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DYNAMICS_OPTIONS.map((item) => {
          const isSelected = activeDynamics === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                isSelected
                  ? "bg-red-500/10 border-red-500/40 text-foreground shadow-2xs font-bold ring-1 ring-red-500/30"
                  : "bg-card border-border/60 hover:border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-red-500" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground">{item.name}</span>
                </div>
              </div>
              <p className="text-[10px] line-clamp-1 opacity-75">{item.desc}</p>
              <span className="text-[9px] font-mono uppercase self-start px-1.5 py-0.2 rounded bg-muted text-muted-foreground mt-0.5">
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
