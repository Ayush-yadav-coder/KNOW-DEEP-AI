import React, { useState } from "react";
import { Plus, X, Sparkles, Hash, Search, ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomTopicRadarProps {
  customTopics: string[];
  activeTopic: string | null;
  onSelectTopic: (topic: string) => void;
  onAddTopic: (topic: string) => void;
  onRemoveTopic: (topic: string) => void;
}

const POPULAR_SUGGESTIONS = [
  "Quantum Hardware",
  "Fusion Energy",
  "Federal Reserve Rates",
  "Semiconductor Foundries",
  "Autonomous Robotics",
  "Cyber Warfare",
  "Deep Space Observatories",
];

export function CustomTopicRadar({
  customTopics,
  activeTopic,
  onSelectTopic,
  onAddTopic,
  onRemoveTopic,
}: CustomTopicRadarProps) {
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicInput.trim()) return;
    onAddTopic(newTopicInput.trim());
    setNewTopicInput("");
    setIsAdding(false);
  };

  return (
    <div className="w-full rounded-2xl bg-card border border-border/60 p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Custom Topic Radars</h3>
            <p className="text-[11px] text-muted-foreground">Track custom keywords with AI-synthesized real-time intelligence feeds</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAdding(!isAdding)}
          className="h-7 px-2.5 text-xs rounded-lg gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        >
          <Plus className="w-3 h-3" />
          <span>Add Radar</span>
        </Button>
      </div>

      {/* Add Topic Input Field */}
      {isAdding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1 animate-in fade-in-50 duration-200">
          <input
            type="text"
            value={newTopicInput}
            onChange={(e) => setNewTopicInput(e.target.value)}
            placeholder="e.g. Clean Fusion Energy, NVIDIA Blackwell, Central Bank Liquidity..."
            className="flex-1 h-8 bg-muted/50 border border-border rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs">
            Track
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </form>
      )}

      {/* Tracked custom topic tags */}
      <div className="flex flex-wrap items-center gap-2">
        {customTopics.map((topic) => {
          const isActive = activeTopic === topic;
          return (
            <div
              key={topic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              <button
                onClick={() => onSelectTopic(topic)}
                className="flex items-center gap-1.5 text-left"
              >
                <Hash className="w-3 h-3 text-rose-400" />
                <span>{topic}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTopic(topic);
                }}
                className="p-0.5 rounded text-muted-foreground/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                title="Remove radar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Suggestion pills */}
        {customTopics.length === 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground mr-1">Suggested radars:</span>
            {POPULAR_SUGGESTIONS.slice(0, 4).map((sugg) => (
              <button
                key={sugg}
                onClick={() => onAddTopic(sugg)}
                className="px-2 py-0.5 rounded-lg bg-muted/40 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground border border-border/40 transition-colors flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{sugg}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
