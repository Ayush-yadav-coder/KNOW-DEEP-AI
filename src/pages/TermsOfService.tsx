import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance and User Agreement",
    body: `These Terms of Service constitute a legally binding agreement between you ("User") and Know Deep AI. Accessing or using the platform indicates your agreement to these terms. If you do not agree to every provision, you are prohibited from using the platform.`,
  },
  {
    title: "2. Platform Description & Service Availability",
    body: `Know Deep is an artificial intelligence application offering automated chat, text synthesis, programming code generation, and interactive digital assistance.

Service Availability: We strive for continuous uptime, but Know Deep does not guarantee 100% uninterrupted platform access. Outages, maintenance windows, or third-party cloud infrastructure delays may temporarily affect platform performance.

Feature Evolution: Know Deep reserves the right to modify, upgrade, or deprecate specific UI components, AI model versions, or features at any time without prior notice.`,
  },
  {
    title: "3. AI Output Disclaimer, Accuracy & Responsibility",
    body: `Probabilistic AI Nature: AI-generated outputs (text, solutions, summaries, and code) are produced by complex machine learning algorithms. Outputs may occasionally contain factual errors, outdated references, or bug-prone code.

User Verification Obligation: The user is strictly responsible for inspecting, testing, and verifying any AI-generated code or information before executing it in production, utilizing it for business, or relying on it for decisions.

No Certified Guarantees: Know Deep AI outputs do not constitute certified legal, medical, financial, or formal engineering advice.`,
  },
  {
    title: "4. Prohibited Activities and User Conduct",
    body: `You agree NOT to use Know Deep to:

Generate malware, keyloggers, exploits, or malicious code designed to disrupt computer networks.

Bypass or exploit platform security controls, rate-limiting systems, or backend API routes.

Submit content that violates third-party copyright, trademark, or intellectual property rights.

Engage in automated scraping, bot attacks, or Denial-of-Service (DoS) activities against our Vercel hosting infrastructure.

Generate hate speech, sexually explicit materials, harassing content, or harmful material targeting any individual or group.

Violation of these conduct rules will result in immediate account suspension or permanent termination without notice.`,
  },
  {
    title: "5. Intellectual Property Rights and Output Ownership",
    body: `User Prompts: Users retain all intellectual property rights to the original text, files, and prompts submitted to the Platform.

AI Outputs: Subject to compliance with these Terms, users are granted full commercial and non-commercial usage rights to the specific AI responses generated for them by Know Deep.

Know Deep Proprietary Assets: All visual designs, custom frontend interface code, brand logos, graphics, and unique platform workflows remain the exclusive intellectual property of Know Deep.`,
  },
  {
    title: "6. Limitation of Liability & Warranty Disclaimer",
    body: `"AS-IS" Provision: Know Deep AI is provided strictly on an "AS-IS" and "AS-AVAILABLE" basis without warranties of any kind, whether express, implied, or statutory.

Liability Cap: To the maximum extent allowed by law, Know Deep AI and its operators, developers, and hosting partners shall not be held liable for any direct, indirect, incidental, special, or consequential damages (including loss of data, lost profits, or system crashes) resulting from your use of the platform or reliance on AI outputs.`,
  },
  {
    title: "7. Account Termination",
    body: `Know Deep reserves the right to suspend or terminate user accounts, restrict access to features, or purge profile data at its sole discretion for violations of these Terms or abusive platform usage.`,
  },
  {
    title: "8. Amendments to Terms",
    body: `We reserve the right to revise or replace these Terms at any time. Updates will be published directly on the platform page with a revised effective date. Continued use of Know Deep following any changes signifies your agreement to the updated Terms.`,
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
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Terms of Service & Acceptable Use</h1>
            <p className="text-muted-foreground text-sm font-medium">Effective Date: September 18, 2026</p>
          </div>

          {/* Top Notice Box */}
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-sm space-y-1.5">
            <p className="text-sm font-semibold text-purple-400">Effective Date: September 18, 2026</p>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              Platform: Know Deep AI Application (“Know Deep,” “Platform,” “we,” “us,” or “our”)
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8 border border-border/40">
            {sections.map((s) => (
              <section key={s.title} className="space-y-3 pb-6 border-b border-border/20 last:border-b-0 last:pb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">{s.body}</p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
