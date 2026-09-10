CREATE TABLE public.user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('identity','preferences','active_projects','learning_style','other')),
  fact_text TEXT NOT NULL,
  importance_weight INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_memory_user_id_idx ON public.user_memory(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memory TO authenticated;
GRANT ALL ON public.user_memory TO service_role;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory" ON public.user_memory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_memory_updated_at BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Also extend delete_user_account to clean up memory rows
CREATE OR REPLACE FUNCTION public.delete_user_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM public.user_memory WHERE user_id = uid;
  DELETE FROM public.shared_conversations WHERE user_id = uid;
  DELETE FROM public.user_subscriptions WHERE user_id = uid;
  DELETE FROM public.bookmarked_news WHERE user_id = uid;
  DELETE FROM public.feedback WHERE user_id = uid;
  DELETE FROM public.generated_apps WHERE user_id = uid;
  DELETE FROM public.generated_images WHERE user_id = uid;
  DELETE FROM public.chat_messages WHERE user_id = uid;
  DELETE FROM public.chat_conversations WHERE user_id = uid;
  DELETE FROM public.profiles WHERE user_id = uid;
END;
$function$;