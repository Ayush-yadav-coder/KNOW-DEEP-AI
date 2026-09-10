import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Eligibility and Accounts",
    body: `To use the application, you must complete our login registration. You agree to provide true, accurate, and complete registration information. You are solely responsible for safeguarding your authentication credentials and for all operations or code updates run under your user profile.`,
  },
  {
    title: "2. Acceptable Use Guidelines",
    body: `You may not access or use the platform for any purpose other than its intended design as an AI exploration, development, and visual research workspace. Prohibited activities include, but are not limited to:

• Attempting to bypass security protocols, reverse-engineer the source code files, or break the application's api infrastructure.
• Using the App Builder to programmatically build, deploy, or host illegal, malicious, or harmful software scripts.
• Utilizing the camera tools or file upload tracks to distribute copyrighted assets or explicit material.`,
  },
  {
    title: "3. AI-Generated Content and Disclaimers",
    body: `Nature of AI Outputs: Our platform leverages advanced multimodal models to deliver code fragments, language translations, academic summaries, and product reviews. AI models can occasionally produce inaccurate text, hallucinations, or broken code snippets.

No Warranty: All AI responses, price conversions (such as Indian Rupee conversions), and code fixes are provided on an "as-is" basis. We offer no warranties that the generated outputs are error-free, secure, or ready for production development without human evaluation.

Third-Party Marketplace Links: E-commerce pricing arrays and links to marketplaces (like Amazon or Flipkart) are provided for reference only. We do not control or endorse the content, policies, or product availability on external vendor websites.`,
  },
  {
    title: "4. Intellectual Property Rights",
    body: `Our Platform Proprietary Rights: We retain all rights, titles, and ownership over our platform's proprietary code frameworks, UI configurations, logos, animations, and visual design assets.

User Creations: You retain ownership over the original prompt instructions, custom application designs, and files you construct while interacting with our App Builder modules.`,
  },
  {
    title: "5. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Know Deep and its developers shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from app downtime, software failures, lost database code, or reliance on AI-generated information.`,
  },
  {
    title: "6. Termination",
    body: `We reserve the right, without notice or liability, to suspend, terminate, or restrict your account access if we determine, in our sole discretion, that your interactions violate these Terms or threaten our system infrastructure.`,
  },
  {
    title: "7. Contact Us",
    body: `For questions, notices, or formal clarifications regarding these Terms of Service, please reach out to us at: ayushyadavprocoder@gmail.com`,
  },
];

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: June 2026</p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement made between you ("User") and Know Deep ("we," "us," or "our"), concerning your access to and use of our AI utility ecosystem, mobile layout, and tools. By creating an account or accessing our services, you agree to be bound by these Terms.
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
