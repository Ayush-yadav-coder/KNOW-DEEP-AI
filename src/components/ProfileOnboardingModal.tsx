import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Sparkles } from "lucide-react";
import { useUserMemory } from "@/hooks/useUserMemory";
import { useAppStore } from "@/store/useAppStore";

export const ProfileOnboardingModal = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { saveMemory } = useUserMemory();

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
      const isGoogleAuth = 
        user.app_metadata?.provider === "google" || 
        user.identities?.some((id) => id.provider === "google");

      const existingMetaName = user.user_metadata?.display_name || user.user_metadata?.full_name || data?.display_name || preferences.displayName;
      const existingMetaAge = user.user_metadata?.age || preferences.age;
      const existingMetaPurpose = user.user_metadata?.purpose || preferences.purpose;

      // Prompt if not onboarded, or if user is Google auth and missing age or purpose
      if (!hasOnboarded || (isGoogleAuth && (!existingMetaAge || !existingMetaPurpose)) || !data?.display_name) {
        setIsOpen(true);
        if (existingMetaName) setDisplayName(existingMetaName);
        if (existingMetaAge) setAge(String(existingMetaAge));
        if (existingMetaPurpose) setPurpose(existingMetaPurpose);
      }
    } catch (error) {
      console.warn("Could not check profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      // 1. Update profiles table in Supabase
      if (displayName) {
        await supabase
          .from("profiles")
          .upsert({ 
            user_id: user.id,
            display_name: displayName,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
      }

      // 2. Store in Supabase Auth user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            display_name: displayName || user.user_metadata?.display_name,
            age: age || undefined,
            purpose: purpose || undefined,
          }
        });
      } catch (authErr) {
        console.warn("Could not update auth metadata", authErr);
      }

      // 3. Update global AppStore preferences
      updatePreferences({ 
        displayName: displayName || preferences.displayName,
        age: age || preferences.age,
        purpose: purpose || preferences.purpose
      });

      // 4. Save Age & Purpose to User Memory to personalize AI intelligence
      if (age) {
        await saveMemory({
          user_id: user.id,
          fact_text: `User is ${age} years old.`,
          category: "personal_info",
          importance_weight: 8
        });
      }

      if (purpose) {
        await saveMemory({
          user_id: user.id,
          fact_text: `User is using Know Deep AI for: ${purpose}`,
          category: "preferences",
          importance_weight: 9
        });
      }

      // 5. Cache locally to remember onboarding state
      localStorage.setItem(`onboarded_${user.id}`, "true");
      localStorage.setItem(`profile_settings_${user.id}`, JSON.stringify({
        displayName,
        age,
        purpose,
        updatedAt: new Date().toISOString()
      }));

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving onboarding profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 rounded-3xl overflow-hidden shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Welcome to Know Deep AI</DialogTitle>
          <DialogDescription className="text-center">
            Tell us a bit about yourself to personalize your AI workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What should we call you?
            </Label>
            <Input
              id="displayName"
              placeholder="e.g. Ayush"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Age (Optional)
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="e.g. 20"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-xl bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What will you use Know Deep for? (Optional)
            </Label>
            <Textarea
              id="purpose"
              placeholder="e.g. Homework help, coding, learning physics..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-xl bg-background/50 resize-none h-20"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
