import React from "react";
import { Smartphone, Monitor, Square, Eye, Grid, ShieldAlert, Sparkles } from "lucide-react";

export type SocialRatio = "16:9" | "9:16" | "1:1" | "4:5";

interface SocialReframeAutoCropperProps {
  currentRatio: SocialRatio;
  onRatioChange: (ratio: SocialRatio) => void;
  isSafeZoneEnabled: boolean;
  onToggleSafeZone: (enabled: boolean) => void;
  trackingFocus: "center" | "action" | "thirds";
  onTrackingFocusChange: (focus: "center" | "action" | "thirds") => void;
}

const RATIOS: { id: SocialRatio; name: string; icon: any; platform: string }[] = [
  { id: "16:9", name: "16:9 Landscape", icon: Monitor, platform: "YouTube / TV" },
  { id: "9:16", name: "9:16 Vertical", icon: Smartphone, platform: "Reels / TikTok / Shorts" },
  { id: "1:1", name: "1:1 Square", icon: Square, platform: "Instagram / Feed" },
  { id: "4:5", name: "4:5 Portrait", icon: Smartphone, platform: "Social Feed" },
];

export function SocialReframeAutoCropper({
  currentRatio,
  onRatioChange,
  isSafeZoneEnabled,
  onToggleSafeZone,
  trackingFocus,
  onTrackingFocusChange
}: SocialReframeAutoCropperProps) {
  return (
    <div className="space-y-3 bg-muted/20 border border-border/70 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Smart Social Reframe & Auto-Cropper</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Auto-Track Framing</span>
      </div>

      {/* Ratio selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {RATIOS.map((item) => {
          const isSelected = currentRatio === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onRatioChange(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                isSelected
                  ? "bg-primary/10 border-primary text-foreground font-bold shadow-2xs"
                  : "bg-card border-border/60 hover:border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-bold text-foreground">{item.name}</span>
              </div>
              <span className="text-[10px] opacity-75">{item.platform}</span>
            </button>
          );
        })}
      </div>

      {/* Focus tracking options & Safe Zone Guide toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Subject Tracking:</span>
          <div className="flex items-center gap-1 bg-card border border-border/60 p-0.5 rounded-lg text-[10px]">
            <button
              type="button"
              onClick={() => onTrackingFocusChange("center")}
              className={`px-2 py-0.5 rounded font-medium ${trackingFocus === "center" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => onTrackingFocusChange("action")}
              className={`px-2 py-0.5 rounded font-medium ${trackingFocus === "action" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}
            >
              Dynamic Action
            </button>
            <button
              type="button"
              onClick={() => onTrackingFocusChange("thirds")}
              className={`px-2 py-0.5 rounded font-medium ${trackingFocus === "thirds" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}
            >
              Rule of 3rds
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleSafeZone(!isSafeZoneEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            isSafeZoneEnabled
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold"
              : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{isSafeZoneEnabled ? "Reels UI Safe-Zone: ON" : "Safe-Zone Overlay"}</span>
        </button>
      </div>
    </div>
  );
}
