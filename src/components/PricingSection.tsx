import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
      "Advanced analytics",
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
      "Custom integrations",
      "Dedicated manager",
    ],
    color: "from-emerald-500 to-teal-500",
    popular: false,
  },
];

export const PricingSection = () => {
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Coming Soon!",
      description: `${planName} plan will be available soon. Stay tuned!`,
    });
  };

  return (
    <section id="pricing" className="py-20 px-4 relative">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-400/20 dark:bg-red-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">Simple, Affordable Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Choose the plan that fits your needs. All prices in Indian Rupees.
          </p>
          <Link to="/pricing" className="text-primary hover:underline text-sm font-medium">
            View full pricing details →
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 bg-white/50 dark:bg-muted/20 backdrop-blur-xl border ${
                plan.popular
                  ? "border-2 border-purple-500/50"
                  : "border-white/40 dark:border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4 pt-2">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.name)}
                variant={plan.popular ? "default" : "outline"}
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    : "bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50"
                }`}
                size="sm"
              >
                Upgrade
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
