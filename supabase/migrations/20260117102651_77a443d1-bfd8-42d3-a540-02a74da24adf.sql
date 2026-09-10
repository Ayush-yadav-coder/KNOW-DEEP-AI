-- Create shared_conversations table for public conversation links
CREATE TABLE public.shared_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token VARCHAR(32) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own shared links
CREATE POLICY "Users can view their own shared conversations" 
ON public.shared_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create shared links for their own conversations
CREATE POLICY "Users can create shared conversations" 
ON public.shared_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shared links
CREATE POLICY "Users can delete their own shared conversations" 
ON public.shared_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Public can view shared conversations by token (for public access)
CREATE POLICY "Anyone can view by share token" 
ON public.shared_conversations 
FOR SELECT 
USING (true);

-- Create index for fast token lookups
CREATE INDEX idx_shared_conversations_token ON public.shared_conversations(share_token);