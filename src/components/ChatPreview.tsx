import { motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const sampleMessages = [
  { role: "user", content: "Explain quantum computing in simple terms" },
  { role: "assistant", content: "Imagine a coin spinning in the air. Regular computers work with coins that are either heads or tails. Quantum computers use 'spinning coins' that can be both at once! This lets them solve certain problems much faster by exploring many possibilities simultaneously." },
];

export const ChatPreview = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="glass rounded-3xl p-6 md:p-8 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-destructive" />
        <div className="w-3 h-3 rounded-full bg-accent" />
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="ml-4 text-sm text-muted-foreground font-mono">Deep AI Chat</span>
      </div>

      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
        {sampleMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-md ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Deep anything..."
          className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <Button variant="hero" size="icon" className="rounded-xl w-12 h-12">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};
