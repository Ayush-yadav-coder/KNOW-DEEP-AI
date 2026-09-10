import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass rounded-2xl p-6 group cursor-pointer transition-all duration-300 hover:border-primary/30"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${gradient} group-hover:scale-110 transition-transform duration-300`}
        style={{
          boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
        }}
      >
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};
