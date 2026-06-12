-- Join a campaign by invite code.
--
-- Run in the Supabase SQL editor. SECURITY DEFINER lets a player resolve a
-- campaign from a code they were given without opening up broad SELECT on
-- campaigns: know the code -> get {id, name}; otherwise nothing comes back.
-- The character's campaign_id is then set from this server-resolved id, so it
-- can't be forged from the client.

create or replace function public.redeem_invite_code(p_code text)
returns table(id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select c.id, c.name
  from public.campaigns c
  where upper(c.invite_code) = upper(trim(p_code))
  limit 1;
$$;

grant execute on function public.redeem_invite_code(text) to authenticated;
