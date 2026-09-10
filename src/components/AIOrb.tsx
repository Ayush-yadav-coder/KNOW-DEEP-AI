import { motion } from "framer-motion";
import chatLogo from "@/assets/chat-logo.png";

export const AIOrb = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.3), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Secondary ring */}
      <motion.div
        className="absolute inset-4 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.4), transparent 60%)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Core orb with logo */}
      <motion.div
        className="absolute inset-8 rounded-full overflow-hidden"
        style={{
          boxShadow: "0 0 60px hsl(199 89% 48% / 0.5), 0 0 120px hsl(262 83% 58% / 0.3)",
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img 
          src={chatLogo} 
          alt="AI Assistant" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Inner glow */}
      <motion.div
        className="absolute inset-12 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(0 0% 100% / 0.2), transparent 60%)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary"
          style={{
            left: "50%",
            top: "50%",
            boxShadow: "0 0 10px hsl(199 89% 48%)",
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI * 2) / 6) * 100, 0],
            y: [0, Math.sin((i * Math.PI * 2) / 6) * 100, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};
