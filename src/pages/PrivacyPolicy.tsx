import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Information We Collect",
    body: `We collect information that you provide directly to us, as well as information automatically generated during your sessions:

• Account Data: When you sign up or log in, we collect your authentication data (such as email and name) via our authentication providers (e.g., Supabase Auth).
• Media and Vision Data: When using our "Live Mode" or "Circle-to-Search" features, we temporarily process your active device camera feed and image crops to deliver real-time visual analysis, object tracking, and OCR translation text.
• Persistent Memory and Context: If enabled, our background context engine automatically extracts and organizes personal preferences or technical project details you share to save them securely inside our database table (user_memory) for session continuity.
• Location Data: We check temporary IP location headers strictly to deliver localized services, such as converting global product prices directly into Indian Rupees (₹) for relevant regions.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the gathered information to operate, maintain, and optimize our feature pillars:

• To personalize your AI chatting experience using long-term memory profiles.
• To run visual and object calculations for the live camera tools.
• To render e-commerce pricing tables and direct purchasing hyperlinks.
• To debug code anomalies inside our App Builder sandboxes.

We do not sell, rent, or trade your personal data, media data, or memory logs to third-party advertising networks.`,
  },
  {
    title: "3. Data Storage and Security",
    body: `Your account files, text logs, and personalized memory arrays are stored securely using industry-standard cloud infrastructure and database solutions (including Supabase). While we enforce rigorous technical firewalls and encrypted token management, no internet-based data transfer can be guaranteed 100% secure.`,
  },
  {
    title: "4. Your Data Privacy Rights",
    body: `You maintain full control over the personal details our AI memorizes:

• You can visit the "Memory Center" tab in the application Settings at any time to inspect individual facts stored by the AI.
• You have the right to delete specific saved facts manually or click "Reset Memory" to completely erase your personalization cache.
• You can delete your entire application user account at any time.`,
  },
  {
    title: "5. Contact Us",
    body: `If you have any questions or concerns regarding this Privacy Policy, please contact us at: ayushyadavprocoder@gmail.com`,
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: June 2026</p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              Welcome to Know Deep. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web and mobile applications, including our AI text tools, live camera vision features, and cross-session personalization systems.
            </p>
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-2xl font-bold mb-3 text-foreground">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
