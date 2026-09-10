import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, ArrowLeft, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/CodeBlock";
import appLogo from "@/assets/app-logo.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface SharedData {
  conversation: { id: string; title: string; created_at: string };
  messages: Message[];
}

export default function SharedConversation() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-shared-conversation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const responseData = await res.json().catch(() => null);
        if (!res.ok || !responseData?.data) {
          setError("Conversation not found or link has expired");
        } else {
          setData(responseData.data as SharedData);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Conversation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "This conversation may have been deleted or the link is invalid."}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Know Deep
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={appLogo} alt="Know Deep" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold gradient-text">Know Deep</span>
          </Link>
          <Link to="/chat">
            <Button variant="outline" size="sm">Start Your Own Chat</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{data.conversation.title}</h1>
          <p className="text-sm text-muted-foreground">
            Shared conversation • {new Date(data.conversation.created_at).toLocaleDateString()}
          </p>
        </div>

        {data.messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>This conversation appears to be empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match;
                            return isInline ? (
                              <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <CodeBlock language={match[1]} className={className}>
                                {String(children).replace(/\n$/, "")}
                              </CodeBlock>
                            );
                          },
                          table({ children }) {
                            return <div className="overflow-x-auto my-4"><table className="min-w-full">{children}</table></div>;
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
