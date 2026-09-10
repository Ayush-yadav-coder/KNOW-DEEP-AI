-- Create table for saved generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'generated', -- 'generated' or 'enhanced'
  enhancement_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved app projects
CREATE TABLE public.generated_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  files JSONB NOT NULL DEFAULT '[]',
  supabase_schema TEXT,
  edge_functions JSONB DEFAULT '[]',
  setup_instructions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_apps ENABLE ROW LEVEL SECURITY;

-- RLS policies for generated_images
CREATE POLICY "Users can view their own images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for generated_apps
CREATE POLICY "Users can view their own apps"
ON public.generated_apps
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own apps"
ON public.generated_apps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps"
ON public.generated_apps
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps"
ON public.generated_apps
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on generated_apps
CREATE TRIGGER update_generated_apps_updated_at
BEFORE UPDATE ON public.generated_apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();