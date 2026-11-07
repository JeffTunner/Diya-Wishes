create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) <= 24),
  text text not null check (char_length(text) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.wishes enable row level security;

create policy "anyone can send a wish" on public.wishes
  for insert to anon, authenticated with check (true);

create policy "admin can read wishes" on public.wishes
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

create policy "admin can delete wishes" on public.wishes
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

alter publication supabase_realtime add table public.wishes;

