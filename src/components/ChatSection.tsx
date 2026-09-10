import { motion } from "framer-motion";
import { ChatPreview } from "./ChatPreview";

export const ChatSection = () => {
  return (
    <section id="chat" className="py-20 px-4 relative">
      {/* Background effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, hsl(199 89% 48% / 0.2) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Experience Deep AI</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how Deep handles complex questions with clarity and precision.
          </p>
        </motion.div>

        <ChatPreview />
      </div>
    </section>
  );
};
