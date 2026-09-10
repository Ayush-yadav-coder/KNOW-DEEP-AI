import React from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PricingTiers } from "@/components/PricingTiers";
import { PolicyLinks } from "@/components/PolicyLinks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Subscription Plans & Pricing">
      <div className="w-full min-h-screen px-4 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Top Back & Context Bar */}
        <div className="flex items-center justify-between mb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground h-9 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Early Access Pricing</span>
          </div>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-10 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold">
            <Crown className="w-4 h-4" />
            <span>Know Deep AI Turbo Subscriptions</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Simple, Transparent Subscriptions
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose the tier tailored to your workflow. Unlock ultra-low latency, unlimited code generation, and deep research reasoning.
          </p>
        </motion.div>

        {/* Main Pricing Tiers Component */}
        <PricingTiers />

        {/* Bottom Policy & Legal Links */}
        <div className="mt-16 pt-8 border-t border-border/40">
          <PolicyLinks />
        </div>
      </div>
    </AppLayout>
  );
}
