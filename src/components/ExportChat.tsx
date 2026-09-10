import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileJson, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ExportChatProps {
  messages: Message[];
  conversationTitle?: string;
}

export function ExportChat({ messages, conversationTitle = "chat" }: ExportChatProps) {
  const { toast } = useToast();

  const formatAsMarkdown = (): string => {
    let md = `# ${conversationTitle}\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    
    messages.forEach((msg) => {
      const role = msg.role === "user" ? "👤 You" : "🤖 Know Deep";
      md += `## ${role}\n\n${msg.content}\n\n---\n\n`;
    });
    
    return md;
  };

  const formatAsJson = (): string => {
    return JSON.stringify({
      title: conversationTitle,
      exportedAt: new Date().toISOString(),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      })),
    }, null, 2);
  };

  const formatAsText = (): string => {
    let text = `${conversationTitle}\n`;
    text += `Exported: ${new Date().toLocaleDateString()}\n`;
    text += "=".repeat(50) + "\n\n";
    
    messages.forEach((msg) => {
      const role = msg.role === "user" ? "You" : "Know Deep";
      text += `[${role}]\n${msg.content}\n\n`;
    });
    
    return text;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported successfully", description: `Saved as ${filename}` });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatAsText());
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleExport = (format: "md" | "json" | "txt") => {
    const safeTitle = conversationTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    
    switch (format) {
      case "md":
        downloadFile(formatAsMarkdown(), `${safeTitle}.md`, "text/markdown");
        break;
      case "json":
        downloadFile(formatAsJson(), `${safeTitle}.json`, "application/json");
        break;
      case "txt":
        downloadFile(formatAsText(), `${safeTitle}.txt`, "text/plain");
        break;
    }
  };

  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("md")}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("txt")}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
