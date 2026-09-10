import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Crown, Camera, Loader2, Check, Trash2, AlertTriangle, Brain, Sliders, ArrowRight } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { PolicyLinks } from "@/components/PolicyLinks";
import { CustomizeNavModal } from "@/components/CustomizeNavModal";
import { NavDragDropCustomizer } from "@/components/NavDragDropCustomizer";
import { PricingTiers } from "@/components/PricingTiers";
import { useAppStore } from "@/store/useAppStore";

interface Plan {
  id: string;
  name: string;
  price_inr: number;
  features: string[];
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useAppStore();
  
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
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
      localStorage.setItem(`profile_settings_${user.id}`, JSON.stringify({
        displayName,
        age,
        purpose,
        updatedAt: new Date().toISOString(),
      }));

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

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-2xl h-auto p-1.5 gap-1.5 bg-muted/40 backdrop-blur-md">
            <TabsTrigger value="profile" className="rounded-xl py-2.5">
              <User className="w-4 h-4 mr-2" />
              Profile
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
          </TabsList>

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

              </CardContent>
            </Card>
          </TabsContent>


          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="glass-card rounded-2xl border-0 p-4 sm:p-6 shadow-xl">
              <PricingTiers />
            </Card>
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
