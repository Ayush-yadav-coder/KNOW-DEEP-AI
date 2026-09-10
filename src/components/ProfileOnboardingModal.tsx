import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Calendar, 
  Briefcase, 
  X,
  Code,
  GraduationCap,
  Search,
  PenTool,
  Zap,
  Image as ImageIcon
} from "lucide-react";
import { useUserMemory } from "@/hooks/useUserMemory";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

const WORK_PRESETS = [
  { id: "coding", label: "Coding & Development", icon: Code },
  { id: "academics", label: "Homework & Academics", icon: GraduationCap },
  { id: "research", label: "Deep Research & Analysis", icon: Search },
  { id: "creative", label: "Creative Writing & Content", icon: PenTool },
  { id: "productivity", label: "Daily Productivity & Planning", icon: Zap },
  { id: "multimedia", label: "Image & Media Creation", icon: ImageIcon },
];

const AGE_PRESETS = ["16", "20", "24", "28", "35+"];

export const ProfileOnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useAppStore();
  const { toast } = useToast();
  const { saveMemory } = useUserMemory();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;
    try {
      const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
      if (hasOnboarded) {
        setIsOpen(false);
        setLoading(false);
        return;
      }

      // Read existing data if available
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const existingMetaName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        data?.display_name ||
        preferences.displayName ||
        "";

      const existingMetaAge = user.user_metadata?.age || preferences.age || "";
      const existingMetaPurpose = user.user_metadata?.purpose || preferences.purpose || "";

      if (existingMetaName) setDisplayName(existingMetaName);
      if (existingMetaAge) setAge(String(existingMetaAge));
      if (existingMetaPurpose) setPurpose(existingMetaPurpose);

      // If already has name, age, and purpose in metadata or database, don't show
      if (existingMetaName && existingMetaAge && existingMetaPurpose) {
        localStorage.setItem(`onboarded_${user.id}`, "true");
        setIsOpen(false);
      } else {
        // Show the 3-step onboarding
        setIsOpen(true);
      }
    } catch (error) {
      console.warn("Could not check profile onboarding state:", error);
    } finally {
      setLoading(false);
    }
  };

  // Safe dismiss that unlocks the screen immediately
  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`onboarded_${user.id}`, "true");
    }
    setIsOpen(false);
  };

  // Safe submission of onboarding data
  const handleComplete = async () => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    setSaving(true);
    const finalName = displayName.trim() || preferences.displayName || "Ayush Coder";
    const finalAge = age.trim();
    const finalPurpose = purpose.trim();

    // 1. Immediately update client state & mark onboarded
    updatePreferences({
      displayName: finalName,
      age: finalAge,
      purpose: finalPurpose,
    });
    localStorage.setItem(`onboarded_${user.id}`, "true");
    localStorage.setItem(
      `profile_settings_${user.id}`,
      JSON.stringify({
        displayName: finalName,
        age: finalAge,
        purpose: finalPurpose,
        updatedAt: new Date().toISOString(),
      })
    );

    // Close the modal immediately so the user can interact with the app without freezing
    setIsOpen(false);
    setSaving(false);

    toast({
      title: `Welcome, ${finalName}!`,
      description: "Your AI workspace is fully personalized and ready.",
    });

    // 2. Perform background async sync safely without blocking UI
    try {
      // Upsert profile in Supabase
      supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            display_name: finalName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .then(() => {})
        .catch((err) => console.warn("Background profile upsert failed:", err));

      // Update auth user metadata
      supabase.auth
        .updateUser({
          data: {
            display_name: finalName,
            age: finalAge || undefined,
            purpose: finalPurpose || undefined,
          },
        })
        .then(() => {})
        .catch((err) => console.warn("Background auth metadata update failed:", err));

      // Save to memory
      if (finalAge) {
        saveMemory({
          user_id: user.id,
          fact_text: `User is ${finalAge} years old.`,
          category: "personal_info",
          importance_weight: 8,
        }).catch(() => {});
      }

      if (finalPurpose) {
        saveMemory({
          user_id: user.id,
          fact_text: `User primary work use: ${finalPurpose}`,
          category: "preferences",
          importance_weight: 9,
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Background sync error:", err);
    }
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (!displayName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  if (loading || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent 
        id="profile-onboarding-dialog"
        className="sm:max-w-md w-[92vw] bg-card/95 backdrop-blur-2xl border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        {/* Custom Header with Step Progress & Dismiss Button */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
              Question {step} of 3
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {step === 1 ? "Username" : step === 2 ? "Age" : "Work Use"}
            </span>
          </div>

          <button
            type="button"
            id="dismiss-onboarding-arrow"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            title="Close and enter AI workspace"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden my-2">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full"
            initial={{ width: "33%" }}
            animate={{
              width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step-by-Step Questions */}
        <AnimatePresence mode="wait">
          {/* STEP 1: USERNAME */}
          {step === 1 && (
            <motion.form
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleNextStep}
              className="space-y-4 pt-2"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shadow-inner mb-2">
                  <User className="w-6 h-6" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  1. What is your username or name?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
                  How should Know Deep AI address you in chats, code, and study guides?
                </DialogDescription>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="onboard-username" className="text-xs font-semibold text-foreground">
                  Your Display Name / Handle
                </Label>
                <Input
                  id="onboard-username"
                  type="text"
                  placeholder="e.g. Ayush Coder"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl h-11 bg-background/60 border-border/80 text-sm font-medium focus:border-cyan-500"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground h-11 px-3 rounded-xl"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  disabled={!displayName.trim()}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Age</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: AGE */}
          {step === 2 && (
            <motion.form
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleNextStep}
              className="space-y-4 pt-2"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center justify-center shadow-inner mb-2">
                  <Calendar className="w-6 h-6" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  2. What is your age?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tailors vocabulary, complexity, and educational tone to your age group.
                </DialogDescription>
              </div>

              <div className="space-y-3 pt-2">
                <Label htmlFor="onboard-age" className="text-xs font-semibold text-foreground">
                  Select or type your age
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAge(preset.replace("+", ""))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        age === preset.replace("+", "")
                          ? "bg-blue-600 text-white border-blue-500 shadow-md"
                          : "bg-muted/50 text-foreground border-border/70 hover:border-blue-500/40"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <Input
                  id="onboard-age"
                  type="number"
                  min={8}
                  max={120}
                  placeholder="Enter age (e.g. 21)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="rounded-xl h-11 bg-background/60 border-border/80 text-sm font-medium focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="h-11 px-3 rounded-xl border-border text-xs gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setAge(""); setStep(3); }}
                    className="text-xs text-muted-foreground hover:text-foreground h-11 px-3 rounded-xl"
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 px-5 shadow-lg shadow-blue-500/20"
                  >
                    <span>Continue to Work Use</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.form>
          )}

          {/* STEP 3: WORK USE */}
          {step === 3 && (
            <motion.form
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleNextStep}
              className="space-y-4 pt-2"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center shadow-inner mb-2">
                  <Briefcase className="w-6 h-6" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  3. What is your primary work use?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
                  What will you use Know Deep AI for most frequently?
                </DialogDescription>
              </div>

              {/* Work Presets Quick Selection */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold text-foreground">
                  Select popular categories or describe below
                </Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {WORK_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = purpose.includes(preset.label);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setPurpose(purpose.replace(preset.label, "").trim());
                          } else {
                            setPurpose((prev) => (prev ? `${prev}, ${preset.label}` : preset.label));
                          }
                        }}
                        className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-muted/40 text-foreground border-border/70 hover:bg-muted/80"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-medium line-clamp-1">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                <Textarea
                  id="onboard-purpose"
                  placeholder="Or describe in your own words (e.g. Learning physics, writing Python, writing stories)..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="rounded-xl bg-background/60 border-border/80 text-xs font-medium focus:border-indigo-500 resize-none h-16"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="h-11 px-3 rounded-xl border-border text-xs gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs text-muted-foreground hover:text-foreground h-11 px-3 rounded-xl"
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 px-5 shadow-lg shadow-indigo-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started</span>
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
