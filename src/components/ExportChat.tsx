import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileJson, Copy, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

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

  const handleExport = (format: "md" | "json" | "txt" | "pdf") => {
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
      case "pdf":
        exportAsPdf(safeTitle);
        break;
    }
  };

  const exportAsPdf = (safeTitle: string) => {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(16);
    doc.text(conversationTitle, 10, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exported: ${new Date().toLocaleDateString()}`, 10, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    messages.forEach((msg) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const role = msg.role === "user" ? "You:" : "Know Deep:";
      doc.setFont("helvetica", "bold");
      doc.text(role, 10, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      const textLines = doc.splitTextToSize(msg.content, 180);
      doc.text(textLines, 10, yPos);
      yPos += (textLines.length * 6) + 10;
    });
    
    doc.save(`${safeTitle}.pdf`);
    toast({ title: "Exported successfully", description: `Saved as ${safeTitle}.pdf` });
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
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <File className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
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
