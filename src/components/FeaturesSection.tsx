import { motion } from "framer-motion";
import { 
  Zap, 
  Layers, 
  Lock, 
  Infinity, 
  Cpu, 
  Wand2 
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second responses with our optimized inference engine. No more waiting.",
    gradient: "bg-gradient-to-br from-primary to-primary/60",
  },
  {
    icon: Layers,
    title: "Multi-Modal",
    description: "Text, images, code, and voice - Deep understands and generates it all.",
    gradient: "bg-gradient-to-br from-secondary to-secondary/60",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your data never leaves your control.",
    gradient: "bg-gradient-to-br from-accent to-accent/60",
  },
  {
    icon: Infinity,
    title: "Unlimited Context",
    description: "1M+ token context window. Perfect for analyzing entire codebases or documents.",
    gradient: "bg-gradient-to-br from-primary to-accent",
  },
  {
    icon: Cpu,
    title: "Custom Models",
    description: "Fine-tune Deep on your data. Create specialized AI that knows your business.",
    gradient: "bg-gradient-to-br from-secondary to-primary",
  },
  {
    icon: Wand2,
    title: "Agentic Workflows",
    description: "Autonomous AI agents that can browse, code, and complete complex tasks.",
    gradient: "bg-gradient-to-br from-accent to-secondary",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Why Choose Deep?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built from the ground up to be the most powerful, versatile, and secure AI platform ever created.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
