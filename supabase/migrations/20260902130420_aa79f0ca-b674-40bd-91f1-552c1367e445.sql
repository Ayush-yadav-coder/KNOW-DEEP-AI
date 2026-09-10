CREATE TABLE public.ai_daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0 CHECK (message_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

GRANT SELECT ON public.ai_daily_usage TO authenticated;
GRANT ALL ON public.ai_daily_usage TO service_role;

ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily AI usage"
  ON public.ai_daily_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_ai_daily_usage_updated_at
  BEFORE UPDATE ON public.ai_daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.consume_daily_ai_message(_user_id UUID, _daily_limit INTEGER DEFAULT 15)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  IF _user_id IS NULL OR _daily_limit < 1 OR _daily_limit > 1000 THEN
    RAISE EXCEPTION 'Invalid usage request';
  END IF;

  INSERT INTO public.ai_daily_usage (user_id, usage_date, message_count)
  VALUES (_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    message_count = public.ai_daily_usage.message_count + 1,
    updated_at = now()
  WHERE public.ai_daily_usage.message_count < _daily_limit
  RETURNING message_count INTO current_count;

  IF current_count IS NULL THEN
    SELECT message_count
      INTO current_count
      FROM public.ai_daily_usage
     WHERE user_id = _user_id
       AND usage_date = CURRENT_DATE;
  END IF;

  RETURN jsonb_build_object(
    'allowed', current_count <= _daily_limit,
    'count', current_count,
    'limit', _daily_limit,
    'usage_date', CURRENT_DATE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_daily_ai_message(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_daily_ai_message(UUID, INTEGER) TO service_role;

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_shared_conversation(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_conversation(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;