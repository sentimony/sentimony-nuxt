alter table public.events
  add column if not exists flyer_a_og text,
  add column if not exists flyer_a_th text,
  add column if not exists flyer_b_th text;
