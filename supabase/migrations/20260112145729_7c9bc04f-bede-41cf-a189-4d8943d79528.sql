-- Create bookmarked_news table for saving favorite articles
CREATE TABLE public.bookmarked_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  category TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookmarked_news ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own bookmarks" 
ON public.bookmarked_news 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.bookmarked_news 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.bookmarked_news 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate bookmarks
CREATE UNIQUE INDEX idx_bookmarked_news_user_url ON public.bookmarked_news (user_id, url);