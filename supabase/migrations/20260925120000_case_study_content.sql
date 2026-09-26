alter table public.selected_work
  add column if not exists case_study jsonb not null default '{}'::jsonb;
