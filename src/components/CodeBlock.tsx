import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const codeString = String(children).replace(/\n$/, "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="relative my-4 rounded-xl bg-muted/60 border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border/50">
        <span className="text-xs text-muted-foreground font-mono">{language || "code"}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 hover:bg-background/60"
          onClick={copyToClipboard}
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-green-500 mr-1" /><span className="text-xs text-green-500">Copied</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5 mr-1" /><span className="text-xs">Copy</span></>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
