import { useState } from "react";
import { Share2, Copy, Check, Link2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShareConversationProps {
  conversationId: string;
  conversationTitle: string;
}

interface SharedLink {
  id: string;
  share_token: string;
  created_at: string;
  view_count: number;
}

export const ShareConversation = ({ conversationId, conversationTitle }: ShareConversationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null);
  const [copied, setCopied] = useState(false);

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const loadExistingShare = async () => {
    const { data, error } = await supabase
      .from("shared_conversations")
      .select("*")
      .eq("conversation_id", conversationId)
      .maybeSingle();

    if (!error && data) {
      setSharedLink(data as SharedLink);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      await loadExistingShare();
    }
  };

  const createShareLink = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to share conversations");
        return;
      }

      const token = generateToken();
      
      const { data, error } = await supabase
        .from("shared_conversations")
        .insert({
          conversation_id: conversationId,
          user_id: session.user.id,
          share_token: token,
        })
        .select()
        .single();

      if (error) throw error;

      setSharedLink(data as SharedLink);
      toast.success("Share link created!");
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShareLink = async () => {
    if (!sharedLink) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("shared_conversations")
        .delete()
        .eq("id", sharedLink.id);

      if (error) throw error;

      setSharedLink(null);
      toast.success("Share link removed");
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast.error("Failed to remove share link");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    if (!sharedLink) return;
    
    const shareUrl = `${window.location.origin}/shared/${sharedLink.share_token}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = sharedLink 
    ? `${window.location.origin}/shared/${sharedLink.share_token}`
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share Conversation
          </DialogTitle>
          <DialogDescription>
            Create a public link to share "{conversationTitle}" with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {sharedLink ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Views: {sharedLink.view_count}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteShareLink}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remove Link
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Generate a shareable link for this conversation. Anyone with the link can view it.
              </p>
              <Button onClick={createShareLink} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Create Share Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
