
-- 1) Lock down user_subscriptions (no user inserts/updates)
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

-- 2) Tighten feedback insert policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Users can submit their own feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() = user_id)
  );

-- 3) Account deletion RPC
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 4) Restrict trigger/helper functions from being directly callable
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 5) get_shared_conversation must remain callable for public share links
GRANT EXECUTE ON FUNCTION public.get_shared_conversation(text) TO anon, authenticated;
