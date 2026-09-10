import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Search, 
  Image, 
  Mic, 
  Code, 
  Brain, 
  FileText, 
  Newspaper,
  GraduationCap,
  Globe,
  Terminal
} from "lucide-react";

const row1Capabilities = [
  {
    icon: MessageSquare,
    title: "Conversational AI",
    description: "Natural, context-aware conversations like ChatGPT & Gemini",
    color: "from-primary to-primary/60",
    href: "/chat",
  },
  {
    icon: Search,
    title: "App Creator",
    description: "Generate full-stack apps with AI like Lovable",
    color: "from-secondary to-secondary/60",
    href: "/app-creator",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning visuals like DALL-E & Midjourney",
    color: "from-accent to-accent/60",
    href: "/image-generator",
  },
  {
    icon: Mic,
    title: "Image Enhancer",
    description: "4K upscale, Ghibli style, remove blur & more",
    color: "from-primary to-accent",
    href: "/image-enhancer",
  },
  {
    icon: Code,
    title: "Code Generation",
    description: "Write & debug code like Copilot & Cursor",
    color: "from-secondary to-primary",
    href: "/chat",
  },
];

const row2Capabilities = [
  {
    icon: Brain,
    title: "Deep Reasoning",
    description: "Advanced analysis like DeepSeek & Grok",
    color: "from-accent to-secondary",
    href: "/chat",
  },
  {
    icon: FileText,
    title: "AI Summarizer",
    description: "Summarize any text or document instantly",
    color: "from-primary to-secondary",
    href: "/summarizer",
  },
  {
    icon: Newspaper,
    title: "AI News Feed",
    description: "Stay informed with AI-curated news",
    color: "from-accent to-primary",
    href: "/news",
  },
  {
    icon: Globe,
    title: "Web Search",
    description: "AI-powered deep web research",
    color: "from-secondary to-accent",
    href: "/web-search",
  },
  {
    icon: Terminal,
    title: "Code Interpreter",
    description: "Execute & analyze code with AI",
    color: "from-primary to-accent",
    href: "/code-interpreter",
  },
];

const row3Capabilities = [
  {
    icon: GraduationCap,
    title: "Homework Assistant",
    description: "Upload homework photos & get instant AI solutions",
    color: "from-accent to-primary",
    href: "/homework-assistant",
  },
  // More features coming soon...
];

const CapabilityCard = ({ cap, index }: { cap: typeof row1Capabilities[0]; index: number }) => (
  <Link to={cap.href}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="glass rounded-2xl p-5 text-center group cursor-pointer h-full"
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cap.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
        style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.2)" }}
      >
        <cap.icon className="w-7 h-7 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
        {cap.title}
      </h3>
      <p className="text-muted-foreground text-xs md:text-sm">
        {cap.description}
      </p>
    </motion.div>
  </Link>
);

export const CapabilityShowcase = () => {
  return (
    <section id="capabilities" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Unified AI Capabilities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every breakthrough from the world's leading AI platforms, unified into one powerful experience.
          </p>
        </motion.div>

        {/* Row 1 - 5 items */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
          {row1Capabilities.map((cap, i) => (
            <CapabilityCard key={cap.title} cap={cap} index={i} />
          ))}
        </div>

        {/* Row 2 - 5 items */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
          {row2Capabilities.map((cap, i) => (
            <CapabilityCard key={cap.title} cap={cap} index={i + 5} />
          ))}
        </div>

        {/* Row 3 - Homework Assistant (more coming soon) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {row3Capabilities.map((cap, i) => (
            <CapabilityCard key={cap.title} cap={cap} index={i + 10} />
          ))}
        </div>
      </div>
    </section>
  );
};
