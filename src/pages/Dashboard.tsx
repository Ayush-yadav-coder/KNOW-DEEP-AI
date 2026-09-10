import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Image,
  FileText,
  Mic,
  Code2,
  TrendingUp,
  Calendar,
  Crown,
  Zap,
  BarChart3,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UsageStats {
  totalMessages: number;
  totalImages: number;
  totalConversations: number;
  todayMessages: number;
  weeklyMessages: number[];
  recentActivity: { date: string; count: number }[];
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  messagesUsed: number;
  messagesLimit: number;
  renewalDate: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<UsageStats>({
    totalMessages: 0,
    totalImages: 0,
    totalConversations: 0,
    todayMessages: 0,
    weeklyMessages: [0, 0, 0, 0, 0, 0, 0],
    recentActivity: [],
  });
  
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    plan: "Free",
    status: "active",
    messagesUsed: 0,
    messagesLimit: 50,
    renewalDate: null,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load conversations count
      const { count: conversationsCount } = await supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Load messages
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Load images
      const { count: imagesCount } = await supabase
        .from("generated_images")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayMessages = messages?.filter(m => 
        new Date(m.created_at) >= today
      ).length || 0;

      // Weekly breakdown
      const weeklyMessages = Array(7).fill(0);
      const last7Days = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      });

      messages?.forEach(msg => {
        const msgDate = new Date(msg.created_at);
        msgDate.setHours(0, 0, 0, 0);
        const dayIndex = last7Days.findIndex(d => d.getTime() === msgDate.getTime());
        if (dayIndex !== -1) {
          weeklyMessages[6 - dayIndex]++;
        }
      });

      // Recent activity
      const activityMap = new Map<string, number>();
      messages?.slice(0, 100).forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString();
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });
      const recentActivity = Array.from(activityMap.entries())
        .slice(0, 7)
        .map(([date, count]) => ({ date, count }));

      setStats({
        totalMessages: messages?.length || 0,
        totalImages: imagesCount || 0,
        totalConversations: conversationsCount || 0,
        todayMessages,
        weeklyMessages,
        recentActivity,
      });

      // Load subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subData && subData.subscription_plans) {
        setSubscription({
          plan: (subData.subscription_plans as any).name || "Free",
          status: subData.status,
          messagesUsed: stats.totalMessages,
          messagesLimit: (subData.subscription_plans as any).name === "Pro" ? 500 : 
                         (subData.subscription_plans as any).name === "Business" ? 2000 : 50,
          renewalDate: subData.current_period_end,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = Math.min((subscription.messagesUsed / subscription.messagesLimit) * 100, 100);
  const isPro = subscription.plan !== "Free";

  const features = [
    { icon: MessageSquare, label: "AI Chat", count: stats.totalConversations, color: "text-blue-500" },
    { icon: Image, label: "Images Generated", count: stats.totalImages, color: "text-purple-500" },
    { icon: FileText, label: "Documents Analyzed", count: 0, color: "text-green-500" },
    { icon: Code2, label: "Code Sessions", count: 0, color: "text-orange-500" },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeeklyMessages = Math.max(...stats.weeklyMessages, 1);

  if (authLoading || loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Here's your Know Deep usage overview</p>
          </div>
          
          {!isPro && (
            <Button
              onClick={() => navigate("/pricing")}
              className="gradient-bg text-white gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Button>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{feature.count}</p>
                      <p className="text-xs text-muted-foreground">{feature.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Usage & Subscription */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Your message activity over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-40">
                  {stats.weeklyMessages.map((count, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(count / maxWeeklyMessages) * 100}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-md min-h-[4px]"
                        style={{ maxHeight: "120px" }}
                      />
                      <span className="text-xs text-muted-foreground">{weekDays[idx]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Messages</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.todayMessages}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Active Time</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(stats.todayMessages * 1.5)}m</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI Interactions</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.floor(stats.todayMessages / 2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`h-full ${isPro ? "border-primary/50 bg-primary/5" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isPro ? <Crown className="w-5 h-5 text-yellow-500" /> : <Zap className="w-5 h-5" />}
                  {subscription.plan} Plan
                </CardTitle>
                <CardDescription>
                  {isPro ? "Premium features unlocked" : "Upgrade for more features"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Usage Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Messages Used</span>
                    <span className="font-medium">{stats.totalMessages} / {subscription.messagesLimit}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  {usagePercentage > 80 && (
                    <p className="text-xs text-amber-500 mt-1">Running low on messages!</p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Included Features:</p>
                  {[
                    "AI Chat",
                    "Image Generation",
                    isPro ? "Priority Support" : "Standard Support",
                    isPro ? "10x Faster Responses" : "Standard Speed",
                    isPro ? "Advanced Analysis" : "Basic Analysis",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 ${isPro ? "text-green-500" : "text-muted-foreground"}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Renewal Date */}
                {subscription.renewalDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Renews: {new Date(subscription.renewalDate).toLocaleDateString()}</span>
                  </div>
                )}

                {/* CTA */}
                {!isPro && (
                  <Button
                    onClick={() => navigate("/pricing")}
                    className="w-full gradient-bg text-white"
                  >
                    Upgrade Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump right into your favorite features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: MessageSquare, label: "Start Chat", path: "/chat", color: "from-blue-500 to-blue-600" },
                  { icon: Image, label: "Generate Image", path: "/image-generator", color: "from-purple-500 to-purple-600" },
                  { icon: Mic, label: "Voice Assistant", path: "/voice-assistant", color: "from-green-500 to-green-600" },
                  { icon: Code2, label: "Code Interpreter", path: "/code-interpreter", color: "from-orange-500 to-orange-600" },
                ].map((action, idx) => (
                  <motion.button
                    key={action.path}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    onClick={() => navigate(action.path)}
                    className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    <action.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
