import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sliders,
  Palette,
  User,
  Shield,
  Info,
  LogOut,
  Download,
  Trash2,
  Check,
  Globe,
  Mic,
  Cpu,
  Sparkles,
  Camera,
  X,
  Key,
  Eye,
  EyeOff,
  MessageSquarePlus,
  Star,
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Send,
  HelpCircle,
  Activity,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PolicyLinks } from "./PolicyLinks";
import { PLATFORM_15_FEATURES, getOrderedFeatures } from "@/lib/features";
import { cn } from "@/lib/utils";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "general" | "navigation" | "appearance" | "profile" | "api" | "feedback" | "data" | "about";
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = "general"
}) => {
  const [activeTab, setActiveTab] = useState<
    "general" | "navigation" | "appearance" | "profile" | "api" | "feedback" | "data" | "about"
  >(defaultTab);

  const {
    user,
    isGuest,
    preferences,
    updatePreferences,
    resetStore,
    conversations,
  } = useAppStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayNameInput, setDisplayNameInput] = useState(
    preferences.displayName || user?.user_metadata?.display_name || "AyushCoder"
  );
  const [systemInstructionsInput, setSystemInstructionsInput] = useState(
    preferences.systemInstructions || ""
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // API Key Configuration State
  const [weatherApiKeyInput, setWeatherApiKeyInput] = useState(
    preferences.weatherApiKey || ""
  );
  const [sportsApiKeyInput, setSportsApiKeyInput] = useState(
    preferences.sportsApiKey || ""
  );
  const [showWeatherKey, setShowWeatherKey] = useState(false);
  const [showSportsKey, setShowSportsKey] = useState(false);

  // Navigation Customizer State
  const [featureOrder, setFeatureOrder] = useState<string[]>(() => {
    return preferences.customFeatureOrder && preferences.customFeatureOrder.length === 15
      ? preferences.customFeatureOrder
      : PLATFORM_15_FEATURES.map((f) => f.id);
  });

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<string>("feature_request");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKeys = () => {
    updatePreferences({
      weatherApiKey: weatherApiKeyInput.trim(),
      sportsApiKey: sportsApiKeyInput.trim(),
    });
    toast({
      title: "API Keys Saved",
      description: "Live weather & sports credentials updated. Feeds will re-fetch automatically.",
    });
  };

  const handleSaveProfile = () => {
    updatePreferences({
      displayName: displayNameInput,
      systemInstructions: systemInstructionsInput,
    });
    toast({
      title: "Settings Saved",
      description: "Profile and workspace personalization updated successfully.",
    });
  };

  const handleSaveNavOrder = () => {
    updatePreferences({ customFeatureOrder: featureOrder });
    toast({
      title: "Navigation Saved",
      description: "Bottom navigation features reordered successfully.",
    });
  };

  const handleResetNavOrder = () => {
    const defaultIds = PLATFORM_15_FEATURES.map((f) => f.id);
    setFeatureOrder(defaultIds);
    updatePreferences({ customFeatureOrder: defaultIds });
    toast({
      title: "Navigation Reset",
      description: "Restored standard 1-15 feature order.",
    });
  };

  const handleMoveNav = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featureOrder.length) return;
    const updated = [...featureOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFeatureOrder(updated);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      toast({
        title: "Feedback Message Required",
        description: "Please share a few details so we can improve Know Deep.",
        variant: "destructive",
      });
      return;
    }

    setFeedbackSubmitting(true);
    setTimeout(() => {
      // Store in local audit log
      const feedbacks = JSON.parse(localStorage.getItem("knowdeep_user_feedback") || "[]");
      feedbacks.push({
        id: "fb_" + Date.now(),
        rating: feedbackRating,
        category: feedbackCategory,
        title: feedbackTitle || "User Feedback",
        message: feedbackMessage,
        createdAt: new Date().toISOString(),
        user: user?.email || displayNameInput || "Explorer",
      });
      localStorage.setItem("knowdeep_user_feedback", JSON.stringify(feedbacks));

      setFeedbackSubmitting(false);
      setFeedbackTitle("");
      setFeedbackMessage("");
      toast({
        title: "Thank You for Your Feedback!",
        description: "Your suggestion and review have been recorded to improve Know Deep.",
      });
    }, 400);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    resetStore();
    onClose();
    navigate("/");
    toast({
      title: "Signed Out",
      description: "You have been logged out of your session.",
    });
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(conversations, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `knowdeep_chat_export_${Date.now()}.json`);
    dlAnchor.click();
    toast({
      title: "Export Complete",
      description: "Chat history downloaded as JSON.",
    });
  };

  const handleExportCSV = () => {
    let csv = "ID,Title,Created_At\n";
    conversations.forEach((c) => {
      csv += `"${c.id}","${(c.title || "").replace(/"/g, '""')}","${c.created_at}"\n`;
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `knowdeep_chat_export_${Date.now()}.csv`);
    dlAnchor.click();
    toast({
      title: "Export Complete",
      description: "Chat history downloaded as CSV.",
    });
  };

  const handleClearConversations = () => {
    if (window.confirm("Are you sure you want to clear all conversation threads?")) {
      useAppStore.setState({ conversations: [], currentConversationId: null });
      toast({
        title: "Cleared",
        description: "All conversations removed from workspace.",
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast({ title: "Avatar Loaded", description: "Save to apply." });
      };
      reader.readAsDataURL(file);
    }
  };

  const TABS = [
    { id: "general", label: "1. General & AI Engine", icon: Sliders },
    { id: "navigation", label: "2. Customize Navigation", icon: SlidersHorizontal },
    { id: "appearance", label: "3. Appearance & Theme", icon: Palette },
    { id: "profile", label: "4. Profile & Persona", icon: User },
    { id: "pricing", label: "5. Pricing & Plans", icon: Star },
    { id: "feedback", label: "6. Send Feedback & Ideas", icon: MessageSquarePlus },
    { id: "data", label: "7. Data & Privacy", icon: Shield },
    { id: "about", label: "8. About & Status", icon: Info },
  ] as const;

  const currentOrderedNavItems = getOrderedFeatures(featureOrder);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-[680px] max-h-[92vh] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Global Workspace Settings</h2>
              <p className="text-xs text-muted-foreground">Configure models, navigation layout, profile, and plans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Desktop Modal / Tabbed Menu */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Category Navigation */}
          <div className="md:col-span-4 border-r border-border p-3 bg-muted/20 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 md:shrink text-left ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-500" : "text-muted-foreground"}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}

            <div className="mt-auto hidden md:block pt-4 border-t border-border px-2">
              <p className="text-[11px] font-bold text-foreground">Know Deep Workspace</p>
              <p className="text-[10px] text-muted-foreground">Version 2.5 • Unified Edition</p>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-card">
            {/* 1. GENERAL & AI ENGINE */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-500" />
                    <span>General & AI Engine</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control default AI reasoning models, speech synthesis, and interface language.</p>
                </div>

                {/* Default AI Model Selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Default AI Model Engine</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "gemini-2.5-flash", name: "Know Deep 2 Fast", badge: "Ultra Fast" },
                      { id: "gemini-1.5-pro", name: "Know Deep 2 Pro", badge: "Deep Reasoner" },
                      { id: "gpt-4o", name: "Know Deep 2.5 Pro Preview", badge: "Multi-Modal" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updatePreferences({ defaultModel: m.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preferences.defaultModel === m.id
                            ? "bg-cyan-500/15 border-cyan-500 text-foreground font-semibold shadow-sm"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-semibold block text-foreground">{m.name}</span>
                        <span className="text-[10px] text-cyan-500 block mt-0.5">{m.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Interface & Response Language</span>
                  </Label>
                  <select
                    value={preferences.language}
                    onChange={(e) => updatePreferences({ language: e.target.value })}
                    className="w-full bg-muted border border-border text-foreground text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="en">English (US / UK / Global)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="sa">Sanskrit (संस्कृतम्)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="ja">Japanese (日本語)</option>
                  </select>
                </div>

                {/* Voice Selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-pink-500" />
                    <span>Live Chat Voice (ElevenLabs & Web Speech)</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Rachel", "Adam", "Antony"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          updatePreferences({ voice: v });
                          toast({ title: `Voice: ${v}`, description: "Selected for spoken audio playback." });
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                          preferences.voice === v
                            ? "bg-pink-500/15 border-pink-500 text-foreground font-semibold"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground text-xs"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CUSTOMIZE NAVIGATION */}
            {activeTab === "navigation" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
                      <span>Customize Bottom Navigation</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Reorder the 15 tools so your most important features sit in Page 1 (first row) or Page 2.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetNavOrder}
                    className="text-xs gap-1 h-8 rounded-xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {currentOrderedNavItems.map((item, idx) => {
                    const Icon = item.icon;
                    const pageNumber = Math.floor(idx / 5) + 1;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[11px] font-mono font-bold text-muted-foreground w-5 text-center">
                            #{idx + 1}
                          </span>
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 bg-gradient-to-br text-xs",
                              item.color
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-semibold text-foreground block truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-cyan-500">
                              Page {pageNumber} {pageNumber === 1 ? "• Primary Bar" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveNav(idx, "up")}
                            className={cn(
                              "w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground",
                              idx === 0 && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === 14}
                            onClick={() => handleMoveNav(idx, "down")}
                            className={cn(
                              "w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground",
                              idx === 14 && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveNavOrder}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-xl px-5 h-9"
                  >
                    Save Navigation Arrangement
                  </Button>
                </div>
              </div>
            )}

            {/* 3. APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span>Appearance & Theming</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Switch between dark mode, crisp high-contrast light mode, and system defaults.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "dark", label: "Dark Mode", desc: "Eye-safe twilight slate", preview: "bg-slate-950 border-slate-800" },
                    { id: "light", label: "Light Mode", desc: "Clean crisp high-contrast", preview: "bg-white border-slate-200" },
                    { id: "system", label: "System", desc: "Syncs with OS theme", preview: "bg-slate-800 border-slate-700" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTheme(m.id);
                        updatePreferences({ theme: m.id as any });
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        theme === m.id
                          ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                          : "border-border bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      <div className={`w-full h-12 rounded-xl mb-3 ${m.preview} border flex items-center justify-center`}>
                        {theme === m.id && <Check className="w-4 h-4 text-cyan-500" />}
                      </div>
                      <span className="text-xs font-semibold text-foreground block">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PROFILE & PERSONALIZATION */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Profile & Personalization</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize your greeting display name, avatar, and universal persona instructions.
                  </p>
                </div>

                {/* Avatar & Display Name */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="relative w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                    <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-colors opacity-0 hover:opacity-100">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-foreground">Workspace Greeting & Display Name</Label>
                    <Input
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="e.g. Explorer"
                      className="bg-muted border-border text-xs h-9 rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Powers the welcome greeting: &quot;Hi {displayNameInput || "Explorer"}, how can I help you today?&quot;
                    </p>
                  </div>
                </div>

                {/* Custom System Instructions */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Custom System Instructions (Universal AI Persona)</span>
                  </Label>
                  <Textarea
                    value={systemInstructionsInput}
                    onChange={(e) => setSystemInstructionsInput(e.target.value)}
                    rows={4}
                    placeholder="e.g., Always provide concise bullet points, specialize in full-stack TypeScript, and provide clear code examples."
                    className="bg-muted border-border text-xs rounded-xl resize-none text-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    These instructions are automatically appended to all chat, code, summarizer, and analysis prompts.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl px-5 h-9"
                >
                  Save Profile Changes
                </Button>
              </div>
            )}

            {/* 5. PRICING & PLANS */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Pricing & Upgrade Plans</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a plan that fits your usage. Purchasing options will be available soon.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Plan */}
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border flex flex-col">
                    <h4 className="text-lg font-bold text-foreground">Explorer</h4>
                    <div className="mt-2 text-2xl font-extrabold text-foreground">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground flex-1">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Standard AI Models</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic Chat & 15 Tools</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Community Support</li>
                    </ul>
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="mt-6 w-full text-xs font-semibold rounded-xl opacity-50"
                    >
                      Current Plan
                    </Button>
                  </div>

                  {/* Pro Plan */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                    <h4 className="text-lg font-bold text-cyan-600 dark:text-cyan-400">Pro Studio</h4>
                    <div className="mt-2 text-2xl font-extrabold text-foreground">$12<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground flex-1">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-500" /> Advanced Know Deep 2.5 Pro</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-500" /> Unlimited Live Voice API</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-500" /> Image Gen & Priority Speeds</li>
                    </ul>
                    <Button
                      type="button"
                      onClick={() => toast({ title: "Coming Soon", description: "Purchasing will be available in a future update." })}
                      className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-xl"
                    >
                      Upgrade Soon
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SEND FEEDBACK & IDEAS */}
            {activeTab === "feedback" && (
              <form onSubmit={handleSubmitFeedback} className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-emerald-500" />
                    <span>Send Feedback & Ideas</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Have a feature request, bug report, or idea to improve Know Deep? Tell us below!
                  </p>
                </div>

                {/* Rating selection */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <Label className="text-xs font-semibold text-foreground">How is your experience with Know Deep?</Label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            star <= feedbackRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-muted-foreground ml-2">
                      {feedbackRating === 5 ? "⭐️⭐️⭐️⭐️⭐️ Fantastic" : `${feedbackRating}/5 Stars`}
                    </span>
                  </div>
                </div>

                {/* Category selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Feedback Category</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "feature_request", label: "💡 Feature Idea" },
                      { id: "bug_report", label: "🐞 Bug Report" },
                      { id: "ui_ux", label: "🎨 UI & Layout" },
                      { id: "performance", label: "⚡ Speed & Accuracy" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFeedbackCategory(c.id)}
                        className={cn(
                          "py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all",
                          feedbackCategory === c.id
                            ? "bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic / Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Subject / Topic</Label>
                  <Input
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    placeholder="e.g., Bottom navigation customizer or whiteboard suggestion"
                    className="bg-muted border-border text-xs rounded-xl h-9"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Your Feedback & Suggestions *</Label>
                  <Textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={4}
                    placeholder="Share your detailed thoughts, suggestions, or describe what happened..."
                    className="bg-muted border-border text-xs rounded-xl resize-none text-foreground"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-xl px-5 h-9 gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            )}

            {/* 7. DATA & PRIVACY */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Data & Privacy Controls</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage exports, conversation histories, or terminate your session.</p>
                </div>

                {/* Export Chat History */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Export Conversation History</h4>
                      <p className="text-[11px] text-muted-foreground">Download your workspace threads for offline archiving.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportJSON}
                        className="text-xs h-8 rounded-lg gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportCSV}
                        className="text-xs h-8 rounded-lg gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Clear Conversations */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Clear Workspace Conversations</h4>
                      <p className="text-[11px] text-muted-foreground">Delete all local message history and threads from this device.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClearConversations}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 rounded-lg gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Explicit Logout Button */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-500">Account Session</h4>
                      <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                        {user ? `Signed in as ${user.email}` : "Currently running in Guest Exploration Mode"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleLogout}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 rounded-lg gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-500" />
                    <span>About Know Deep AI</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Platform runtime status, credentials, and legal compliance.</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Version</span>
                      <span className="text-xs font-bold text-foreground mt-1 block">v2.5.0-unified</span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">API Status</span>
                      <span className="text-xs font-bold text-emerald-500 mt-1 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Operational
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Engine</span>
                      <span className="text-xs font-bold text-cyan-500 mt-1 block">Gemini 2.5 Flash</span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Tools Suite</span>
                      <span className="text-xs font-bold text-purple-500 mt-1 block">15 Flagship</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <PolicyLinks className="text-xs text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
