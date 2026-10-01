import React, { useState } from "react";
import {
  Star,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Check,
  Building2,
  Sparkles,
  MapPin,
  Settings2,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface WeatherCityPagesBarProps {
  savedCities: string[];
  defaultCity: string;
  activeCity: string;
  onSelectCity: (city: string) => void;
  onSaveCity: (city: string) => void;
  onRemoveCity: (city: string) => void;
  onSetDefaultCity: (city: string) => void;
  onReorderCities: (cities: string[]) => void;
}

export const WeatherCityPagesBar: React.FC<WeatherCityPagesBarProps> = ({
  savedCities,
  defaultCity,
  activeCity,
  onSelectCity,
  onSaveCity,
  onRemoveCity,
  onSetDefaultCity,
  onReorderCities,
}) => {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [newCityInput, setNewCityInput] = useState("");

  const currentIndex = savedCities.findIndex(
    (c) => c.toLowerCase() === activeCity.toLowerCase()
  );

  const isCurrentSaved = currentIndex !== -1;
  const isCurrentDefault =
    activeCity.toLowerCase() === defaultCity.toLowerCase();

  const handlePrevPage = () => {
    if (savedCities.length === 0) return;
    const prevIdx =
      currentIndex <= 0 ? savedCities.length - 1 : currentIndex - 1;
    onSelectCity(savedCities[prevIdx]);
  };

  const handleNextPage = () => {
    if (savedCities.length === 0) return;
    const nextIdx =
      currentIndex === -1 || currentIndex >= savedCities.length - 1
        ? 0
        : currentIndex + 1;
    onSelectCity(savedCities[nextIdx]);
  };

  const handleAddCityFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;
    const trimmed = newCityInput.trim();
    onSaveCity(trimmed);
    onSelectCity(trimmed);
    setNewCityInput("");
  };

  const moveCity = (index: number, direction: "up" | "down") => {
    const updated = [...savedCities];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onReorderCities(updated);
  };

  return (
    <div className="space-y-2">
      {/* Top Mobile Bar Wrapper */}
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-3">
        {/* Row 1: Active Page Info & Page Arrow Navigation */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <Building2 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  {isCurrentSaved
                    ? `Page ${currentIndex + 1} of ${savedCities.length}`
                    : "Unsaved Location"}
                </span>
                {isCurrentDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> Default First Page
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                {activeCity}
                {!isCurrentSaved && (
                  <span className="text-xs font-normal text-slate-400">
                    (Not in saved pages)
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Controls: Left/Right Arrows, Bookmark & Manage */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save / Pin active city button if unsaved */}
            {!isCurrentSaved ? (
              <Button
                size="sm"
                onClick={() => onSaveCity(activeCity)}
                className="h-8 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Save Page
              </Button>
            ) : (
              !isCurrentDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSetDefaultCity(activeCity)}
                  className="h-8 text-xs rounded-xl gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  title="Set as First / Default Page"
                >
                  <Star className="w-3.5 h-3.5" /> Make 1st Page
                </Button>
              )
            )}

            {/* Left / Right Page Arrow Controls */}
            {savedCities.length > 1 && (
              <div className="flex items-center p-0.5 bg-slate-800 rounded-2xl border border-slate-700">
                <button
                  onClick={handlePrevPage}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                  title="Previous City Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Indicator Dots */}
                <div className="flex items-center gap-1 px-2">
                  {savedCities.map((c, i) => {
                    const isActive = c.toLowerCase() === activeCity.toLowerCase();
                    return (
                      <span
                        key={c}
                        onClick={() => onSelectCity(c)}
                        className={`cursor-pointer transition-all ${
                          isActive
                            ? "w-3 h-1.5 rounded-full bg-sky-400"
                            : "w-1.5 h-1.5 rounded-full bg-slate-600 hover:bg-slate-400"
                        }`}
                        title={c}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                  title="Next City Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Manage Saved Pages Dialog */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-xl gap-1 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <Settings2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Manage Pages</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                    <Building2 className="w-5 h-5 text-sky-400" /> Manage Saved City Pages
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Set your first default page (e.g. Mumbai), reorder pages, or remove cities.
                  </DialogDescription>
                </DialogHeader>

                {/* Add City Input Form */}
                <form onSubmit={handleAddCityFromModal} className="flex gap-2 pt-2">
                  <Input
                    value={newCityInput}
                    onChange={(e) => setNewCityInput(e.target.value)}
                    placeholder="Add city page (e.g. Mumbai)..."
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-xl text-xs gap-1 bg-sky-500 hover:bg-sky-600 text-white font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </form>

                {/* List of Saved City Pages */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 pt-2 scrollbar-thin">
                  {savedCities.map((city, idx) => {
                    const isDef = city.toLowerCase() === defaultCity.toLowerCase();
                    const isAct = city.toLowerCase() === activeCity.toLowerCase();

                    return (
                      <div
                        key={city}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          isAct
                            ? "bg-sky-500/10 border-sky-500/40"
                            : "bg-slate-950/60 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-500 w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-bold truncate text-white">
                            {city}
                          </span>
                          {isDef && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> 1st Page
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Set Default Button */}
                          {!isDef && (
                            <button
                              onClick={() => onSetDefaultCity(city)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                              title="Set as First Page"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move Up */}
                          <button
                            onClick={() => moveCity(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => moveCity(idx, "down")}
                            disabled={idx === savedCities.length - 1}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove City */}
                          <button
                            onClick={() => onRemoveCity(city)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="Remove Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Row 2: Horizontal Scrollable City Tabs / Pages */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> My Pages:
          </span>

          {savedCities.map((city, idx) => {
            const isActive = city.toLowerCase() === activeCity.toLowerCase();
            const isDefault = city.toLowerCase() === defaultCity.toLowerCase();

            return (
              <div
                key={city}
                className={`group relative flex items-center rounded-2xl transition-all shrink-0 border ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500/25 to-blue-600/25 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                    : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => onSelectCity(city)}
                  className="px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  {isDefault && (
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                  )}
                  <span>{city}</span>
                </button>

                {/* Remove Page X Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCity(city);
                  }}
                  className="pr-2.5 pl-1 py-2 text-slate-500 hover:text-rose-400 transition-colors"
                  title={`Remove ${city} page`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Quick Add City Page Button */}
          <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-2 text-xs rounded-2xl font-bold shrink-0 border border-dashed border-sky-500/40 text-sky-400 hover:bg-sky-500/10 transition-colors flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add City Page
              </button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
