import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, MessageSquare, Loader2, FileSearch, BarChart3, List, Send, X, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExtractedData {
  entities?: {
    people: string[];
    organizations: string[];
    places: string[];
  };
  dates?: string[];
  numbers?: string[];
  keyFacts?: string[];
  actionItems?: string[];
  contacts?: string[];
}

const actions = [
  { value: "summarize", label: "Summarize", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { value: "chat", label: "Chat", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
  { value: "extract", label: "Extract Data", icon: List, color: "from-green-500 to-emerald-500" },
  { value: "analyze", label: "Analyze", icon: BarChart3, color: "from-amber-500 to-orange-500" },
];

// Helper function to clean text that might have encoding issues
const cleanDocumentText = (text: string): string => {
  // Remove null bytes and control characters (except newlines/tabs)
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Try to detect and handle common encoding issues
  // Replace common garbled characters with spaces
  cleaned = cleaned.replace(/[�\uFFFD]/g, ' ');
  
  // Remove excessive whitespace but keep paragraph structure
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
};

// Function to extract text from PDF using basic parsing
const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to string and try to find text content
  let text = '';
  
  // Simple extraction - look for text between BT and ET markers or parentheses
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(uint8Array);
  
  // Extract text from PDF streams
  const textMatches = content.match(/\(([^)]+)\)/g);
  if (textMatches) {
    text = textMatches
      .map(m => m.slice(1, -1))
      .filter(t => t.length > 1 && /[a-zA-Z]/.test(t))
      .join(' ');
  }
  
  // If no readable text found, return a helpful message
  if (text.length < 50) {
    return '';
  }
  
  return cleanDocumentText(text);
};

export default function DocumentChat() {
  const [documentContent, setDocumentContent] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [selectedAction, setSelectedAction] = useState("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentName(file.name);
    setUploadError(null);
    setIsUploading(true);

    try {
      // Handle text-based files
      if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const text = await file.text();
        const cleaned = cleanDocumentText(text);
        setDocumentContent(cleaned);
        toast({ title: "Document loaded", description: file.name });
      } 
      // Handle PDFs
      else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const extractedText = await extractTextFromPDF(file);
        
        if (extractedText.length < 50) {
          setUploadError("Could not extract readable text from this PDF. It might be scanned or image-based. Please paste the text content manually.");
          toast({
            title: "PDF Text Extraction Failed",
            description: "Please paste the text content manually below",
            variant: "destructive",
          });
        } else {
          setDocumentContent(extractedText);
          toast({ title: "PDF content extracted", description: file.name });
        }
      }
      // Handle Word documents  
      else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        // For Word docs, we try to read as text but warn user
        try {
          const text = await file.text();
          const cleaned = cleanDocumentText(text);
          
          // Check if we got readable content
          const readableRatio = (cleaned.match(/[a-zA-Z0-9\s]/g) || []).length / cleaned.length;
          
          if (readableRatio < 0.5 || cleaned.length < 50) {
            setUploadError("Word documents may not extract properly. Please copy and paste the text content manually for best results.");
            toast({
              title: "Word Document",
              description: "Please paste the text content manually for best results",
            });
          } else {
            setDocumentContent(cleaned);
            toast({ title: "Document loaded", description: file.name });
          }
        } catch {
          setUploadError("Could not read this document. Please paste the text content manually.");
        }
      }
      // Try to read other files as text
      else {
        try {
          const text = await file.text();
          const cleaned = cleanDocumentText(text);
          
          // Check if content is readable
          const readableRatio = (cleaned.match(/[a-zA-Z0-9\s]/g) || []).length / cleaned.length;
          
          if (readableRatio < 0.3) {
            setUploadError("This file format may not be readable. Please paste the text content manually.");
            toast({
              title: "File format warning",
              description: "Please paste the text content manually for best results",
            });
          } else {
            setDocumentContent(cleaned);
            toast({ title: "Document loaded", description: file.name });
          }
        } catch {
          setUploadError("Could not read this file. Please paste the text content manually.");
          toast({
            title: "Unsupported format",
            description: "Please paste your document content below",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError("Failed to process file. Please paste the text content manually.");
      toast({
        title: "Upload failed",
        description: "Please paste your document content below",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const processDocument = async (action: string, question?: string, retry = false) => {
    if (!documentContent.trim()) {
      toast({
        title: "No document",
        description: "Please upload or paste a document first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    if (!retry) {
      setResult(null);
      setExtractedData(null);
      setRetryCount(0);
    } else {
      setRetryCount(prev => prev + 1);
    }

    try {
      const { data, error } = await supabase.functions.invoke("document-chat", {
        body: {
          documentContent,
          documentName: documentName || "Uploaded Document",
          action,
          question,
        },
      });

      // Handle function invocation error
      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to process document");
      }

      // Handle error in response data
      if (data?.error) {
        console.error("Response error:", data.error);
        throw new Error(data.error);
      }

      // Validate result exists
      if (!data?.result && data?.result !== "") {
        throw new Error("No result returned. Please try again.");
      }

      if (action === "extract" && typeof data.result === "object") {
        setExtractedData(data.result);
      } else if (action === "chat") {
        if (question) {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: data.result },
          ]);
        } else {
          setResult(data.result);
        }
      } else {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Document processing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Processing failed";
      
      // Show retry option for transient errors
      if (retryCount < 2) {
        toast({
          title: "Processing failed",
          description: errorMessage,
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => processDocument(action, question, true)}>
              Retry
            </Button>
          ),
        });
      } else {
        toast({
          title: "Processing failed",
          description: `${errorMessage}. Please try again later.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    processDocument("chat", chatInput);
    setChatInput("");
  };

  const clearDocument = () => {
    setDocumentContent("");
    setDocumentName("");
    setResult(null);
    setExtractedData(null);
    setMessages([]);
    setUploadError(null);
    setRetryCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AppLayout title="Document Chat">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Document Chat</h1>
          <p className="text-muted-foreground">
            Upload documents and chat with AI about their contents
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Document Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Upload */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Document</h3>
                {documentContent && (
                  <Button variant="ghost" size="sm" onClick={clearDocument}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.md,.pdf,.doc,.docx"
              />

              {!documentContent ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-40 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-muted-foreground" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isUploading ? "Processing..." : "Upload a document"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXT, MD, PDF, DOC supported
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium truncate">{documentName}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {documentContent.length.toLocaleString()} chars
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Error Message */}
              {uploadError && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Or paste content</h3>
              <Textarea
                value={documentContent}
                onChange={(e) => {
                  setDocumentContent(e.target.value);
                  setUploadError(null);
                }}
                placeholder="Paste your document content here..."
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                For best results with PDFs or Word docs, copy the text directly from the document and paste it here.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Button
                  key={action.value}
                  onClick={() => {
                    setSelectedAction(action.value);
                    if (action.value !== "chat") {
                      processDocument(action.value);
                    }
                  }}
                  disabled={isProcessing || !documentContent}
                  variant={selectedAction === action.value ? "default" : "outline"}
                  className={`flex items-center gap-2 h-auto py-3 ${
                    selectedAction === action.value ? `bg-gradient-to-br ${action.color} border-0` : ""
                  }`}
                >
                  {isProcessing && selectedAction === action.value ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <action.icon className="w-5 h-5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6 min-h-[600px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Results</h3>
              {(result || extractedData) && (
                <Button variant="ghost" size="sm" onClick={() => processDocument(selectedAction, undefined, true)}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analyzing document...</p>
                </motion.div>
              ) : selectedAction === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-auto space-y-3 mb-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Ask questions about your document</p>
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSubmit()}
                      placeholder="Ask about the document..."
                      disabled={!documentContent}
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || !documentContent}
                      className="gradient-bg"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : extractedData ? (
                <motion.div
                  key="extracted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 overflow-auto space-y-4"
                >
                  {extractedData.entities && (
                    <div>
                      <h4 className="font-medium mb-2">Entities</h4>
                      <div className="space-y-2 text-sm">
                        {extractedData.entities.people?.length > 0 && (
                          <div><span className="text-muted-foreground">People:</span> {extractedData.entities.people.join(", ")}</div>
                        )}
                        {extractedData.entities.organizations?.length > 0 && (
                          <div><span className="text-muted-foreground">Organizations:</span> {extractedData.entities.organizations.join(", ")}</div>
                        )}
                        {extractedData.entities.places?.length > 0 && (
                          <div><span className="text-muted-foreground">Places:</span> {extractedData.entities.places.join(", ")}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {extractedData.keyFacts?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Facts</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {extractedData.keyFacts.map((fact, i) => (
                          <li key={i}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {extractedData.actionItems?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Action Items</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {extractedData.actionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 overflow-auto prose prose-sm max-w-none"
                >
                  <ReactMarkdown>{result}</ReactMarkdown>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-muted-foreground"
                >
                  <FileSearch className="w-12 h-12 mb-3 opacity-50" />
                  <p>Select an action to analyze your document</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
