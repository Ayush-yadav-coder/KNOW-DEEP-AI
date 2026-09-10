
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view by share token" ON public.shared_conversations;

-- Security-definer RPC: returns conversation + messages only when a valid token is supplied
CREATE OR REPLACE FUNCTION public.get_shared_conversation(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  share_row public.shared_conversations%ROWTYPE;
  conv_row public.chat_conversations%ROWTYPE;
  msgs jsonb;
BEGIN
  SELECT * INTO share_row FROM public.shared_conversations WHERE share_token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- best-effort view count bump
  UPDATE public.shared_conversations
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = share_row.id;

  SELECT * INTO conv_row FROM public.chat_conversations WHERE id = share_row.conversation_id LIMIT 1;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'role', m.role,
    'content', m.content,
    'created_at', m.created_at
  ) ORDER BY m.created_at ASC), '[]'::jsonb)
  INTO msgs
  FROM public.chat_messages m
  WHERE m.conversation_id = share_row.conversation_id;

  RETURN jsonb_build_object(
    'conversation', jsonb_build_object(
      'id', share_row.conversation_id,
      'title', COALESCE(conv_row.title, 'Shared Conversation'),
      'created_at', COALESCE(conv_row.created_at, share_row.created_at)
    ),
    'messages', msgs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_conversation(text) TO anon, authenticated;
