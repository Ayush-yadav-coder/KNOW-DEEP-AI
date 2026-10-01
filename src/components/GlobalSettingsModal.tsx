








import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queueOfflineAction } from "@/lib/offlineSync";
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
  Zap,
  Brain,
  Keyboard,
  Volume2,
  VolumeX,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/ttsSpeaker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PolicyLinks } from "./PolicyLinks";
import { PLATFORM_15_FEATURES, getOrderedFeatures } from "@/lib/features";
import { cn } from "@/lib/utils";
import { OfflineSyncSettingsSection } from "./OfflineSyncSettingsSection";
import { KeyboardShortcutsCheatsheetView } from "./KeyboardShortcuts";
import { AboutUsSection } from "./AboutUsSection";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "general" | "shortcuts" | "navigation" | "appearance" | "profile" | "pricing" | "feedback" | "data" | "about";
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = "general"
}) => {
  const [activeTab, setActiveTab] = useState<
    "general" | "shortcuts" | "navigation" | "appearance" | "profile" | "pricing" | "feedback" | "data" | "about"
  >(defaultTab);

  const { signOut } = useAuth();
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

  const resolveInitialDisplayName = () => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("knowdeep_display_name") ||
        localStorage.getItem("knowdeep_user_name");
      if (stored && stored.trim() && stored.trim().toLowerCase() !== "explorer") {
        return stored.trim();
      }
    }
    const userMetaName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name;
    if (userMetaName && userMetaName.trim() && userMetaName.trim().toLowerCase() !== "explorer") {
      return userMetaName.trim();
    }
    if (
      preferences.displayName &&
      preferences.displayName.trim() &&
      preferences.displayName.trim().toLowerCase() !== "explorer"
    ) {
      return preferences.displayName.trim();
    }
    return preferences.displayName || "Ayush";
  };

  const [displayNameInput, setDisplayNameInput] = useState(resolveInitialDisplayName);
  const [systemInstructionsInput, setSystemInstructionsInput] = useState(
    preferences.systemInstructions || ""
  );

  useEffect(() => {
    if (isOpen) {
      setDisplayNameInput(resolveInitialDisplayName());
    }
  }, [isOpen, preferences.displayName, user]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Navigation Customizer State
  const [featureOrder, setFeatureOrder] = useState<string[]>(() => {
    return preferences.customFeatureOrder && preferences.customFeatureOrder.length === 15
      ? preferences.customFeatureOrder
      : PLATFORM_15_FEATURES.map((f) => f.id);
  });

  // Voice Preview & Audio Playback State
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setPreviewingVoice(null);
      setIsLoadingPreview(false);
    }
  }, [isOpen]);

  const handlePlayVoicePreview = async (voiceId: string, sampleText: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (previewingVoice === voiceId) {
      stopSpeaking();
      setPreviewingVoice(null);
      setIsLoadingPreview(false);
      return;
    }

    stopSpeaking();
    setPreviewingVoice(voiceId);
    setIsLoadingPreview(true);

    try {
      await speakText(sampleText, {
        voice: voiceId,
        onStart: () => {
          setIsLoadingPreview(false);
          setPreviewingVoice(voiceId);
        },
        onEnd: () => {
          setPreviewingVoice(null);
          setIsLoadingPreview(false);
        },
        onError: () => {
          setPreviewingVoice(null);
          setIsLoadingPreview(false);
        },
      });
    } catch {
      setPreviewingVoice(null);
      setIsLoadingPreview(false);
    }
  };

  const handleSelectAndPreviewVoice = (v: { id: string; label: string; desc: string; sample: string }) => {
    updatePreferences({ voice: v.id as any });
    toast({
      title: `Voice Selected: ${v.label}`,
      description: `Applied for all chats, Live Mode, and spoken responses.`,
    });
    handlePlayVoicePreview(v.id, v.sample);
  };

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<string>("feature_request");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  React.useEffect(() => {
    const handleOpenTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener("knowdeep_open_settings", handleOpenTab as EventListener);
    return () => {
      window.removeEventListener("knowdeep_open_settings", handleOpenTab as EventListener);
    };
  }, []);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    const cleanName = displayNameInput.trim();
    updatePreferences({
      displayName: cleanName,
      systemInstructions: systemInstructionsInput,
    });

    try {
      localStorage.setItem("knowdeep_display_name", cleanName);
      localStorage.setItem("knowdeep_user_name", cleanName);
    } catch {}

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { display_name: cleanName },
        });
        await supabase
          .from("profiles")
          .upsert(
            {
              user_id: user.id,
              display_name: cleanName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch (err) {
        console.warn("Could not sync profile to Supabase:", err);
      }
    }

    window.dispatchEvent(
      new CustomEvent("knowdeep_name_updated", { detail: { name: cleanName } })
    );

    if (!navigator.onLine) {
      queueOfflineAction({
        type: "UPDATE_PREFERENCES",
        payload: {
          displayName: cleanName,
          systemInstructions: systemInstructionsInput,
        },
        metadata: {
          title: "User Preferences",
          summary: `Display name: ${cleanName || "default"}`,
        },
      });
    }

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
      const feedbackPayload = {
        id: "fb_" + Date.now(),
        rating: feedbackRating,
        category: feedbackCategory,
        title: feedbackTitle || "User Feedback",
        message: feedbackMessage,
        createdAt: new Date().toISOString(),
        user: user?.email || displayNameInput || "Explorer",
      };
      feedbacks.push(feedbackPayload);
      localStorage.setItem("knowdeep_user_feedback", JSON.stringify(feedbacks));

      // Also queue into Background Sync offline action queue so it is pushed to backend
      queueOfflineAction({
        type: "SUBMIT_FEEDBACK",
        payload: feedbackPayload,
        metadata: {
          title: "User Review & Feedback",
          summary: `${feedbackTitle || "Feedback"}: ${feedbackMessage.slice(0, 50)}...`,
        },
      });

      setFeedbackSubmitting(false);
      setFeedbackTitle("");
      setFeedbackMessage("");
      toast({
        title: "Thank You for Your Feedback!",
        description: navigator.onLine
          ? "Your suggestion has been pushed to the backend."
          : "Saved in LocalStorage and queued to push once you reconnect.",
      });
    }, 400);
  };

  const handleLogout = async () => {
    try {
      await signOut();
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
    { id: "shortcuts", label: "2. Keyboard Shortcuts", icon: Keyboard },
    { id: "navigation", label: "3. Customize Navigation", icon: SlidersHorizontal },
    { id: "appearance", label: "4. Appearance & Theme", icon: Palette },
    { id: "profile", label: "5. Profile & Persona", icon: User },
    { id: "pricing", label: "6. Pricing & Plans", icon: Star },
    { id: "feedback", label: "7. Send Feedback & Ideas", icon: MessageSquarePlus },
    { id: "data", label: "8. Data & Privacy", icon: Shield },
    { id: "about", label: "9. About & Status", icon: Info },
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
              <h2 className="text-base font-bold text-foreground">Know Deep Workspace Settings</h2>
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
                <div className="space-y-2.5">
                  <Label className="text-xs text-foreground flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Default AI Model Engine</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: "kd-2-fast",
                        name: "Know Deep 2 Fast",
                        hint: "Quick responses",
                        icon: Zap,
                        aliases: ["kd-2-fast", "gemini-3.8-flash"],
                      },
                      {
                        id: "kd-2-pro",
                        name: "Know Deep 2 Pro",
                        hint: "Complex questions",
                        icon: Brain,
                        aliases: ["kd-2-pro", "gemini-3.1-pro-preview"],
                      },
                      {
                        id: "kd-2.5-pro",
                        name: "Know Deep 2.5 Pro Preview",
                        hint: "Reasoning + Code",
                        icon: Cpu,
                        aliases: ["kd-2.5-pro", "gemini-flash-latest"],
                      },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected =
                        preferences.defaultModel === m.id ||
                        (m.id === "kd-2-fast" && (!preferences.defaultModel || preferences.defaultModel === "gemini-3.8-flash")) ||
                        (m.id === "kd-2-pro" && preferences.defaultModel === "gemini-3.1-pro-preview") ||
                        (m.id === "kd-2.5-pro" && preferences.defaultModel === "gemini-flash-latest");

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updatePreferences({ defaultModel: m.id as any })}
                          className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[92px] ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500 text-foreground shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                              isSelected
                                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                                : "bg-muted/80 text-muted-foreground border-border"
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-cyan-400 tracking-wider bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-foreground leading-tight">{m.name}</span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">{m.hint}</span>
                          </div>
                        </button>
                      );
                    })}
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

                {/* Voice Selector & Audio Preview Engine */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <Mic className="w-3.5 h-3.5 text-pink-500" />
                        <span>AI Voice Engine & Audio Persona</span>
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Listen to sample previews below. Your choice applies instantly to chat audio and Live Mode.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewingVoice && (
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeaking();
                            setPreviewingVoice(null);
                            setIsLoadingPreview(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                        >
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Stop Audio</span>
                        </button>
                      )}
                      <span className="text-[10px] text-pink-500 font-medium px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                        Neural Voices
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: "Adam",
                        label: "Adam",
                        desc: "Friendly, dynamic & clear male",
                        gender: "Male",
                        badge: "Popular",
                        sample: "Hello, how can I help you today? I am Adam. You can choose me for your voice.",
                      },
                      {
                        id: "Kore",
                        label: "Kore",
                        desc: "Warm, natural & soothing female",
                        gender: "Female",
                        badge: "Default",
                        sample: "Hello, how can I help you today? I am Kore. You can choose me for your voice.",
                      },
                      {
                        id: "Rachel",
                        label: "Rachel",
                        desc: "Expressive & vibrant female",
                        gender: "Female",
                        badge: "Crisp",
                        sample: "Hello, how can I help you today? I am Rachel. You can choose me for your voice.",
                      },
                      {
                        id: "Puck",
                        label: "Puck",
                        desc: "Engaging & upbeat male",
                        gender: "Male",
                        badge: "Upbeat",
                        sample: "Hello, how can I help you today? I am Puck. You can choose me for your voice.",
                      },
                      {
                        id: "Zephyr",
                        label: "Zephyr",
                        desc: "Gentle & conversational tone",
                        gender: "Neutral",
                        badge: "Gentle",
                        sample: "Hello, how can I help you today? I am Zephyr. You can choose me for your voice.",
                      },
                      {
                        id: "Charon",
                        label: "Charon",
                        desc: "Deep, calm & authoritative male",
                        gender: "Male",
                        badge: "Deep",
                        sample: "Hello, how can I help you today? I am Charon. You can choose me for your voice.",
                      },
                      {
                        id: "Antony",
                        label: "Antony",
                        desc: "Thoughtful & resonant male",
                        gender: "Male",
                        badge: "Calm",
                        sample: "Hello, how can I help you today? I am Antony. You can choose me for your voice.",
                      },
                      {
                        id: "Fenrir",
                        label: "Fenrir",
                        desc: "Rich, powerful & expressive male",
                        gender: "Male",
                        badge: "Rich",
                        sample: "Hello, how can I help you today? I am Fenrir. You can choose me for your voice.",
                      },
                    ].map((v) => {
                      const isSelected =
                        preferences.voice === v.id ||
                        (!preferences.voice && (v.id === "Kore" || v.id === "Adam"));
                      const isPlayingThis = previewingVoice === v.id;

                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectAndPreviewVoice(v)}
                          className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                            isSelected
                              ? "bg-pink-500/10 border-pink-500 text-foreground ring-1 ring-pink-500/50 shadow-md shadow-pink-500/5"
                              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors">
                                  {v.label}
                                </span>
                                {v.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 font-semibold">
                                    {v.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50">
                                {v.gender}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight mb-2.5">
                              {v.desc}
                            </p>
                          </div>

                          {/* Preview Play Button */}
                          <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {isSelected ? "Active Voice" : "Click to select"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handlePlayVoicePreview(v.id, v.sample, e)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all shadow-xs ${
                                isPlayingThis
                                  ? isLoadingPreview
                                    ? "bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/40"
                                    : "bg-pink-500 text-white dark:text-black border border-pink-500 animate-pulse"
                                  : "bg-muted/90 hover:bg-pink-500/20 text-muted-foreground hover:text-pink-500 border border-border"
                              }`}
                              title={`Listen to sample of ${v.label}`}
                            >
                              {isPlayingThis && isLoadingPreview ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : isPlayingThis ? (
                                <>
                                  <VolumeX className="w-3 h-3" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Preview</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guided Interactive Feature Tour */}
                <div className="pt-4 border-t border-border/80">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-foreground">Interactive Feature Tour</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">
                          Live Walkthrough
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-md">
                        Take a guided walkthrough of My Stuff, Connectors, 8K Image Generator, Video Studio, Document Studio, Code Studio, and AI Chat.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.dispatchEvent(new CustomEvent("knowdeep_start_interactive_tour"));
                      }}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Take Live Tour</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. KEYBOARD SHORTCUTS */}
            {activeTab === "shortcuts" && (
              <KeyboardShortcutsCheatsheetView />
            )}

            {/* 3. CUSTOMIZE NAVIGATION */}
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

                {/* Offline Storage & Background Sync Manager */}
                <OfflineSyncSettingsSection />

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
                <AboutUsSection isModal={true} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
