import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Building2,
  HelpCircle,
  ShieldCheck,
  Flame,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  badge?: string;
  highlightColor: string;
  badgeBg: string;
  features: string[];
  notIncluded?: string[];
  ctaText: string;
  ctaVariant?: "default" | "outline" | "secondary";
}

export const SUBSCRIPTION_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Free Explorer",
    tagline: "Ideal for daily queries and casual study",
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlightColor: "border-slate-300 dark:border-slate-800",
    badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    features: [
      "50 daily AI chat messages",
      "Standard Web Search grounding",
      "Basic homework solver",
      "Access to all 15 tools with daily limits",
      "Standard response speed",
      "Community support",
    ],
    notIncluded: [
      "No priority GPU inference",
      "Limited image generations",
      "Basic AI memory capacity",
    ],
    ctaText: "Purchase",
    ctaVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro Learner",
    tagline: "Accelerate academic and personal learning",
    monthlyPrice: 199,
    yearlyPrice: 1899,
    popular: true,
    badge: "Most Popular",
    highlightColor: "border-cyan-500/60 shadow-cyan-500/10",
    badgeBg: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm",
    features: [
      "2,500 High-Speed AI Messages / mo",
      "Turbo Response Engine (10x faster)",
      "NCERT Tutor with textbook explanations",
      "Document Studio (PDF analysis up to 50MB)",
      "50 high-res AI image generations / mo",
      "Permanent AI Memory Center storage",
      "Priority email & ticket support",
    ],
    ctaText: "Purchase",
    ctaVariant: "default",
  },
  {
    id: "business",
    name: "Turbo Business",
    tagline: "Built for engineers, researchers & power creators",
    monthlyPrice: 499,
    yearlyPrice: 4790,
    badge: "Best Value",
    highlightColor: "border-purple-500/60 shadow-purple-500/10",
    badgeBg: "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-sm",
    features: [
      "10,000 High-Speed AI Messages / mo",
      "Unrestricted AI App Generator & Code Sandbox",
      "Unlimited AI Image Generator & Enhancer",
      "Deep Web Search with comprehensive research synthesis",
      "Custom system instructions & persona tuning",
      "Multi-document side-by-side comparison",
      "24/7 dedicated support channel",
    ],
    ctaText: "Purchase",
    ctaVariant: "default",
  },
  {
    id: "enterprise",
    name: "Organisation",
    tagline: "For coaching centers, schools & enterprise teams",
    monthlyPrice: 999,
    yearlyPrice: 9590,
    badge: "Enterprise",
    highlightColor: "border-amber-500/60 shadow-amber-500/10",
    badgeBg: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm",
    features: [
      "Unlimited AI Messages & maximum token bandwidth",
      "Multi-seat team workspace with role management",
      "Dedicated high-performance AI GPU instances",
      "Shared organizational knowledge base & custom documents",
      "Enterprise SSO, audit logging & data privacy SLA",
      "Custom integrations & webhook exports",
      "Dedicated Account Manager & onboarding",
    ],
    ctaText: "Purchase",
    ctaVariant: "default",
  },
];

const FAQS = [
  {
    question: "When will subscription purchases go live?",
    answer:
      "Online checkout and automatic tier activation are currently in final preview testing. All features are currently accessible for free during this preview period!",
  },
  {
    question: "Can I switch or cancel my plan at any time?",
    answer:
      "Yes, once payment processing launches, you can upgrade, downgrade, or cancel your subscription at any time directly from the Settings page with zero cancellation fees.",
  },
  {
    question: "What payment methods will be supported?",
    answer:
      "We will support UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, RuPay), and Net Banking across all major Indian banks.",
  },
  {
    question: "What happens if I reach my monthly limit?",
    answer:
      "You will simply transition to the standard speed pool without interruption, so you never lose access to your conversations or projects.",
  },
];

export const PricingTiers: React.FC = () => {
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handlePurchase = (tier: PricingTier) => {
    toast({
      title: "Coming Soon",
      description: `${tier.name} tier subscription will be available for purchase soon!`,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Billing Switch (Monthly vs Yearly) */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-muted/60 backdrop-blur-md border border-border/80 shadow-sm">
          <button
            type="button"
            id="pricing-billing-monthly"
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              !isAnnual
                ? "bg-card text-foreground shadow-md border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            id="pricing-billing-yearly"
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isAnnual
                ? "bg-card text-foreground shadow-md border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {isAnnual ? "Billed annually • 2 months free included" : "Billed on a monthly cycle"}
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier, idx) => {
          const price = isAnnual ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative rounded-3xl p-6 flex flex-col justify-between bg-card text-card-foreground border-2 ${
                tier.highlightColor
              } ${
                tier.popular
                  ? "shadow-xl ring-2 ring-cyan-500/20"
                  : "shadow-md"
              } transition-all duration-200 hover:-translate-y-1`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider ${tier.badgeBg}`}
                  >
                    {tier.popular ? <Flame className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="pt-2 pb-4 border-b border-border/50">
                  <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                    {tier.tagline}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">
                      {price === 0 ? "₹0" : `₹${price}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {price === 0 ? "forever" : isAnnual ? "/mo (billed ₹" + tier.yearlyPrice + "/yr)" : "/month"}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="py-5 space-y-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Included features
                  </p>
                  <ul className="space-y-2.5 text-xs">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-foreground/90 font-medium leading-tight">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {tier.notIncluded && (
                    <ul className="space-y-2 text-xs pt-2 border-t border-border/30">
                      {tier.notIncluded.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-muted-foreground/60">
                          <span className="w-4 text-center shrink-0">—</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Purchase CTA Button */}
              <div className="pt-4 border-t border-border/50">
                <Button
                  id={`purchase-${tier.id}`}
                  type="button"
                  onClick={() => handlePurchase(tier)}
                  className={`w-full h-11 rounded-2xl font-bold text-xs tracking-wide transition-all shadow-md ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      : tier.id === "enterprise"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25"
                      : tier.id === "business"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25"
                      : "bg-muted/80 hover:bg-muted text-foreground border border-border/80"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {tier.ctaText}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  No credit card required for preview
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Instant GPU Speed</h4>
            <p className="text-[11px] text-muted-foreground">Sub-second streaming token throughput</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Private & Encrypted</h4>
            <p className="text-[11px] text-muted-foreground">Your data is never used to train public models</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Cancel Anytime</h4>
            <p className="text-[11px] text-muted-foreground">Zero contracts or commitments</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-8 max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-500" />
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Everything you need to know about subscriptions and billing
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-cyan-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/30 bg-muted/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
