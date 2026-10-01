import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Scope, Purpose, and Governing Intent",
    body: `This Privacy Policy governs the collection, processing, storage, and protection of user data across the Know Deep AI platform. This policy applies to all registered members, visitors, and programmatic consumers accessing the Know Deep application via web, mobile, or integrated client interface.

By creating an account, sending prompts, or interacting with the Know Deep interface, you acknowledge that you have read, understood, and agreed to the data processing practices described in this document.`,
  },
  {
    title: "2. Information Categories We Collect",
    body: `To provide real-time AI responses, manage user sessions, and maintain platform stability, Know Deep collects the following specific types of data:

A. Directly Provided User Data
Account Registration Identifiers: Full name, selected username, email address, and hashed authentication credentials created upon registration.

Prompt Inputs and Context: Text strings, code blocks, structured instructions, uploaded documents, and files submitted to the Know Deep chat interface.

Saved Conversations: Transcripts of user-AI interactions preserved under user profiles for session continuation.

B. Automatically Collected Technical Identifiers
System Diagnostics: Internet Protocol (IP) addresses, user-agent browser strings, device type, operating system version, and system language settings.

Usage Logs: Page request timestamps, button click streams, response latency metrics, API response codes, and session duration data.

Local Storage and Authentication Tokens: Secure browser tokens (such as JSON Web Tokens or Local Storage key-value pairs) used to keep user accounts securely authenticated across browser refreshes.`,
  },
  {
    title: "3. Processing Mechanics & AI Data Handling",
    body: `Third-Party Processing: Prompts submitted to Know Deep are transmitted over encrypted TLS connections to third-party machine learning APIs for real-time text and code generation.

No Selling of Personal Data: Know Deep does not sell, rent, lease, or trade personal data, prompt history, or identifying information to third-party advertisers or data brokers.

Data Minimization: We only pass the text and contextual parameters necessary for generating the immediate AI response.`,
  },
  {
    title: "4. Storage, Encryption, and Data Security",
    body: `Encryption Standards: All data in transit between your local device, our Vercel-hosted frontend, and our cloud database is protected using modern HTTPS/TLS 1.3 encryption. Static database entries are encrypted at rest using AES-256 protocols.

Hosting Architecture: Application UI components and frontend serverless routes are hosted on Vercel. Persistent user accounts and chat records are managed via secure cloud database endpoints.

Breach Notification: In the event of a security incident affecting personal credentials, Know Deep will notify impacted users via email in accordance with applicable legal requirements.`,
  },
  {
    title: "5. User Rights and Data Deletion",
    body: `Users hold the following rights regarding their data on Know Deep:

Conversation Purging: Users may delete individual chat threads or clear their complete chat history directly within the platform settings.

Account Termination: Users may submit a formal request to delete their entire account, which permanently purges profile details, saved conversations, and associated database references.`,
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
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm font-medium">Effective Date: September 18, 2026</p>
          </div>

          {/* Top Notice Box */}
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm space-y-1.5">
            <p className="text-sm font-semibold text-cyan-400">Effective Date: September 18, 2026</p>
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
