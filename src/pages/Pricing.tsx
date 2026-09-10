import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Building2, Users, Zap, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Pro",
    price: 199,
    icon: Sparkles,
    description: "For individual learners",
    features: [
      "500 AI messages/month",
      "Basic AI chat & voice",
      "Image generation (50/month)",
      "Homework assistance",
      "Email support",
    ],
    color: "from-blue-500 to-cyan-500",
    popular: false,
  },
  {
    name: "Business",
    price: 399,
    icon: Crown,
    description: "For power users",
    features: [
      "2000 AI messages/month",
      "Priority AI responses",
      "Unlimited image generation",
      "NCERT Tutor access",
      "Document analysis",
      "Voice assistant",
      "Priority support",
    ],
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
  {
    name: "Expert",
    price: 699,
    icon: Users,
    description: "For professionals",
    features: [
      "5000 AI messages/month",
      "All Business features",
      "Code interpreter",
      "App creator access",
      "Advanced analytics",
      "Custom AI training",
      "24/7 support",
    ],
    color: "from-amber-500 to-orange-500",
    popular: false,
  },
  {
    name: "Organisation",
    price: 999,
    icon: Building2,
    description: "For teams & schools",
    features: [
      "Unlimited AI messages",
      "All Expert features",
      "Unlimited team members",
      "Admin dashboard",
      "SSO & security",
      "Custom integrations",
      "Dedicated manager",
      "SLA guarantee",
    ],
    color: "from-emerald-500 to-teal-500",
    popular: false,
  },
];

export default function Pricing() {
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Coming Soon",
      description: `${planName} tier subscription will be available for purchase soon!`,
    });
  };

  return (
    <AppLayout title="Pricing">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-background dark:via-background dark:to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/30 dark:bg-red-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/30 dark:bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-[80px]" />
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50 mb-4"
            >
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Get the Turbo Experience</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All features remain free, but Pro takes your speed and intelligence to the next level.
            </p>
          </div>

          {/* Standard vs Pro Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Standard */}
              <div className="p-5 rounded-2xl bg-white/50 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  Standard (Current)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Good responses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Standard server speed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Basic AI model
                  </li>
                </ul>
              </div>

              {/* Pro */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 relative">
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                    Recommended
                  </span>
                </div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  Pro
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>Smarter & deeper reasoning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">10x faster response time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500" />
                    Priority access during busy hours
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 bg-white/50 dark:bg-muted/20 backdrop-blur-xl border ${
                  plan.popular
                    ? "border-2 border-purple-500/50"
                    : "border-white/40 dark:border-border/50"
                } shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  id={`purchase-${plan.name.toLowerCase()}`}
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full font-semibold rounded-xl ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 glow-primary shadow-lg shadow-purple-500/25"
                      : "bg-white/70 dark:bg-muted/40 text-foreground hover:bg-white dark:hover:bg-muted/60 border border-white/40 dark:border-border/60"
                  }`}
                >
                  Purchase
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Footer links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 space-y-4"
          >
            <p className="text-muted-foreground text-sm">
              All prices are in Indian Rupees (₹). Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Terms of Service
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
