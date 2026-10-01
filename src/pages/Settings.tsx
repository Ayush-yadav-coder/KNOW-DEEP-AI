import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Crown,
  Camera,
  Loader2,
  Check,
  Trash2,
  AlertTriangle,
  Brain,
  Sliders,
  MessageSquarePlus,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Copy,
  LogOut,
  Shield,
  Keyboard,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PolicyLinks } from "@/components/PolicyLinks";
import { CustomizeNavModal } from "@/components/CustomizeNavModal";
import { NavDragDropCustomizer } from "@/components/NavDragDropCustomizer";
import { PricingTiers } from "@/components/PricingTiers";
import { useAppStore } from "@/store/useAppStore";
import { OfflineSyncSettingsSection } from "@/components/OfflineSyncSettingsSection";
import { evaluatePasswordStrength } from "@/lib/secureAuth";
import { KeyboardShortcutsCheatsheetView } from "@/components/KeyboardShortcuts";
import { AboutUsSection } from "@/components/AboutUsSection";

interface Plan {
  id: string;
  name: string;
  price_inr: number;
  features: string[];
}

export default function Settings() {
  const { user, signOut, updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences, updatePreferences } = useAppStore();
  
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "shortcuts", "security", "navigation", "notifications", "subscription", "feedback", "about"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [isCustomizingNav, setIsCustomizingNav] = useState(false);
  const [showHeroPage, setShowHeroPage] = useState(
    typeof window !== "undefined" && localStorage.getItem("show_hero_page") === "true"
  );
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    aiUpdates: true,
    newFeatures: true,
  });

  // Password & Security Management State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  const newPasswordStrength = evaluatePasswordStrength(newPassword);

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
      toast({ title: "Account ID Copied", description: "Your unique account ID has been copied to clipboard." });
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match. Please re-enter.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(currentPassword, newPassword);
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        toast({
          title: "Password Updated",
          description: "Your credentials have been securely re-hashed and updated.",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      setPasswordError(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const toggleShowHero = (v: boolean) => {
    setShowHeroPage(v);
    localStorage.setItem("show_hero_page", v ? "true" : "false");
    toast({ title: v ? "Hero page enabled" : "Hero page hidden", description: v ? "You'll see the landing page on Home." : "Home will go straight to chat." });
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      // Sync age and purpose from user metadata or app preferences
      const cached = localStorage.getItem(`profile_settings_${user.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.age) setAge(parsed.age);
          if (parsed.purpose) setPurpose(parsed.purpose);
          if (parsed.displayName && !displayName) setDisplayName(parsed.displayName);
        } catch { /* ignore */ }
      }
      if (user.user_metadata?.age) setAge(String(user.user_metadata.age));
      if (user.user_metadata?.purpose) setPurpose(user.user_metadata.purpose);
      if (preferences.age) setAge(String(preferences.age));
      if (preferences.purpose) setPurpose(preferences.purpose);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_inr", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // 1. Update profiles table in Supabase
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: displayName,
            avatar_url: avatarUrl,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            display_name: displayName,
            avatar_url: avatarUrl,
          });

        if (error) throw error;
      }

      // 2. Update Supabase Auth user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            display_name: displayName,
            age,
            purpose,
          },
        });
      } catch (authErr) {
        console.warn("Could not update auth user metadata:", authErr);
      }

      // 3. Update global AppStore preferences
      updatePreferences({
        displayName,
        age,
        purpose,
      });

      // 4. Save to localStorage
      localStorage.setItem("knowdeep_display_name", displayName);
      localStorage.setItem("knowdeep_user_name", displayName);
      localStorage.setItem(`profile_settings_${user.id}`, JSON.stringify({
        displayName,
        age,
        purpose,
        updatedAt: new Date().toISOString(),
      }));

      window.dispatchEvent(
        new CustomEvent("knowdeep_name_updated", { detail: { name: displayName } })
      );

      toast({
        title: "Profile Saved",
        description: "Your profile details, age, and purpose have been updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubscribe = (plan: Plan) => {
    toast({
      title: "Coming Soon",
      description: `Stripe integration for ${plan.name} plan will be enabled soon. Price: ₹${plan.price_inr}/month`,
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // Fully delete account (data + auth user) via secure edge function
      const { error: fnError } = await supabase.functions.invoke("delete-auth-user");
      if (fnError) throw fnError;

      await signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setFeedbackSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        email: user?.email || null,
        message: feedbackMessage.trim().slice(0, 2000),
        page: "settings_page",
      });
      if (error) throw error;
      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We appreciate it!",
      });
      setFeedbackMessage("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const getPlanColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "pro":
        return "from-blue-500 to-cyan-500";
      case "business":
        return "from-purple-500 to-pink-500";
      case "expert":
        return "from-amber-500 to-orange-500";
      case "organisation":
        return "from-emerald-500 to-teal-500";
      default:
        return "from-primary to-secondary";
    }
  };

  if (!user) return null;

  return (
    <AppLayout title="Settings">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <SettingsIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 rounded-2xl h-auto p-1.5 gap-1.5 bg-muted/40 backdrop-blur-md">
            <TabsTrigger value="profile" className="rounded-xl py-2.5">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="rounded-xl py-2.5">
              <Keyboard className="w-4 h-4 mr-2 text-cyan-500" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl py-2.5">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
              Security
            </TabsTrigger>
            <TabsTrigger value="navigation" className="rounded-xl py-2.5">
              <Sliders className="w-4 h-4 mr-2 text-cyan-500" />
              Bottom Bar
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl py-2.5">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-xl py-2.5">
              <Crown className="w-4 h-4 mr-2 text-amber-500" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl py-2.5">
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-xl py-2.5">
              <Info className="w-4 h-4 mr-2 text-purple-500" />
              About Us
            </TabsTrigger>
          </TabsList>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts">
            <Card className="glass-card rounded-2xl border-0 p-6">
              <KeyboardShortcutsCheatsheetView />
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="glass-card rounded-2xl border-0">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and AI personalization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                      variant="secondary"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 22"
                    className="rounded-xl"
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose for using Know Deep AI</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Homework help, learning physics, writing code, research..."
                    className="rounded-xl resize-none h-20"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="rounded-xl bg-muted"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full rounded-xl gradient-bg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                {/* Guided Interactive Feature Tour */}
                <div className="pt-4 border-t border-border/60">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm font-semibold text-foreground">Interactive Feature Tour</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Replay the complete live walkthrough of My Stuff, Connectors, and creative studios.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("knowdeep_start_interactive_tour"));
                      }}
                      className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Take Live Tour</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Password Management Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* 1. Account Credentials & Security Posture */}
            <Card className="glass-card rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Account Credentials & Authentication</span>
                    </CardTitle>
                    <CardDescription>
                      Overview of your account identity and cryptographic protection
                    </CardDescription>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Session</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1">Authenticated Email</span>
                    <span className="text-sm font-semibold text-foreground break-all">{user.email}</span>
                  </div>

                  {/* Account UUID */}
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Account UUID</span>
                      <span className="text-xs font-mono text-foreground truncate block max-w-[200px]">
                        {user.id}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUserId}
                      className="h-8 px-2.5 rounded-lg text-xs hover:bg-muted"
                    >
                      {copiedUserId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>{copiedUserId ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                {/* Storage Architecture Callout */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Cryptographic Storage Architecture</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    User credentials are protected using hardware-accelerated <strong>Web Crypto PBKDF2-HMAC-SHA256</strong> with <strong>100,000 iterations</strong> and unique cryptographically secure 16-byte random salts. Raw passwords are never transmitted in cleartext or stored on local disks.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">KDF Algorithm</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">PBKDF2</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Hash Engine</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">HMAC-SHA256</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Work Factor</span>
                      <span className="text-xs font-mono font-semibold text-emerald-400">100,000 Rounds</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Salt Entropy</span>
                      <span className="text-xs font-mono font-semibold text-cyan-400">128-bit CSPRNG</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Change Password Form */}
            <Card className="glass-card rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Update Password</span>
                </CardTitle>
                <CardDescription>
                  Change your account password securely. We recommend at least 8 characters with numbers and symbols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{passwordError}</span>
                    </motion.div>
                  )}

                  {passwordSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Password changed successfully! New hash saved with fresh salt.</span>
                    </motion.div>
                  )}

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs font-medium">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-medium">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Real-time Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Strength:</span>
                          <span
                            className={`font-semibold ${
                              newPasswordStrength.score <= 1
                                ? "text-rose-400"
                                : newPasswordStrength.score === 2
                                ? "text-amber-400"
                                : newPasswordStrength.score === 3
                                ? "text-cyan-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {newPasswordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => {
                            const active = newPasswordStrength.score >= step;
                            const barColor =
                              newPasswordStrength.score <= 1
                                ? "bg-rose-500"
                                : newPasswordStrength.score === 2
                                ? "bg-amber-500"
                                : newPasswordStrength.score === 3
                                ? "bg-cyan-500"
                                : "bg-emerald-500";
                            return (
                              <div
                                key={step}
                                className={`h-full rounded-full transition-all ${
                                  active ? barColor : "bg-muted"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-1">
                          <span className={`flex items-center gap-1 ${newPasswordStrength.hasMinLength ? "text-emerald-500 font-medium" : ""}`}>
                            <Check className="w-3 h-3" /> 6+ characters
                          </span>
                          <span className={`flex items-center gap-1 ${newPasswordStrength.hasNumber || newPasswordStrength.hasSpecial ? "text-emerald-500 font-medium" : ""}`}>
                            <Check className="w-3 h-3" /> Numbers / Symbols
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmNewPassword" className="text-xs font-medium">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmNewPassword"
                        type={showConfirmNewPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmNewPassword && newPassword !== confirmNewPassword && (
                      <p className="text-[11px] text-rose-400">Passwords do not match yet.</p>
                    )}
                    {confirmNewPassword && newPassword === confirmNewPassword && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full rounded-xl gradient-bg font-semibold"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Encrypting & Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 3. Session Termination & Sign Out */}
            <Card className="glass-card rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Session Sign Out</span>
                </CardTitle>
                <CardDescription>
                  Sign out of your account on this browser. Your cached session token will be purged.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Signed in as <strong className="text-foreground">{user.email}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Signing out ends your authenticated session immediately.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                    toast({
                      title: "Signed Out",
                      description: "You have been successfully signed out.",
                    });
                  }}
                  className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Bar Customization Tab */}
          <TabsContent value="navigation">
            <Card className="glass-card rounded-2xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-cyan-500" />
                      Bottom Navigation Customization
                    </CardTitle>
                    <CardDescription>
                      Drag and drop to rearrange features across Row 1 and Row 2.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <NavDragDropCustomizer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="glass-card rounded-2xl border-0">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new AI model updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.aiUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, aiUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know about new features
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newFeatures}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newFeatures: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional content and offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>

                {/* Hero page toggle */}
                {/* Memory Center entry */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2"><Brain className="w-4 h-4 text-cyan-500" /> Memory Center</Label>
                    <p className="text-sm text-muted-foreground">
                      View and manage everything Know Deep remembers about you.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/memory")} className="rounded-xl">
                    Open My Brain
                  </Button>
                </div>

                {/* Customize Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-500" /> Bottom Bar Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Reorder and customize your navigation tools.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsCustomizingNav(true)} className="rounded-xl">
                    Customize Layout
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="space-y-0.5">
                    <Label>Enable it to see heroes page</Label>
                    <p className="text-sm text-muted-foreground">
                      Show the landing/hero page on Home. When off, Home goes straight to Chat.
                    </p>
                  </div>
                  <Switch checked={showHeroPage} onCheckedChange={toggleShowHero} />
                </div>

                {/* Offline Storage & Background Sync Controls */}
                <div className="pt-4 border-t border-border/30">
                  <OfflineSyncSettingsSection />
                </div>

              </CardContent>
            </Card>
          </TabsContent>


          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card className="glass-card rounded-2xl border-0 p-6 shadow-xl">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Send Feedback & Ideas</CardTitle>
                <CardDescription>We value your input. Let us know how we can improve.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0">
                <Textarea
                  placeholder="Tell us what you think, report a bug, or suggest a feature..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none"
                />
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackSubmitting || !feedbackMessage.trim()}
                  className="w-full rounded-xl gradient-bg"
                >
                  {feedbackSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Us Tab */}
          <TabsContent value="about">
            <AboutUsSection />
          </TabsContent>
        </Tabs>

        {/* Delete Account Section */}
        <Card className="glass-card rounded-2xl border-0 mt-8 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions that affect your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data from our servers
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-xl">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All chat conversations and messages</li>
                        <li>Generated images and apps</li>
                        <li>Profile information</li>
                        <li>Bookmarks and saved content</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete my account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <PolicyLinks />
        </div>
      </div>
      
      <CustomizeNavModal isOpen={isCustomizingNav} onClose={() => setIsCustomizingNav(false)} />
    </AppLayout>
  );
}
