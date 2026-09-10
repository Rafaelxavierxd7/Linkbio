-- Rode este arquivo inteiro no SQL Editor do Supabase (Menu "SQL Editor" > "New query")

create extension if not exists "pgcrypto";

-- Perfis (1 por usuário autenticado)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Links de cada perfil
create table if not exists links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  position int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  constraint links_url_must_be_http check (url ~* '^https?://')
);

-- Registro de cada clique
-- ip_address guarda um HASH do IP (sha256, truncado), nunca o IP bruto —
-- ver IP_HASH_SALT e app/api/click/[linkId]/route.ts.
create table if not exists clicks (
  id uuid default gen_random_uuid() primary key,
  link_id uuid references links(id) on delete cascade not null,
  clicked_at timestamptz default now(),
  ip_address text,
  city text,
  region text,
  country text,
  device text,
  browser text,
  os text,
  referrer text
);

create index if not exists clicks_link_id_idx on clicks(link_id);
create index if not exists links_profile_id_idx on links(profile_id);

-- Row Level Security
alter table profiles enable row level security;
alter table links enable row level security;
alter table clicks enable row level security;

-- Perfis: qualquer um pode ler (página pública), só o dono edita
create policy "Perfis são públicos para leitura" on profiles
  for select using (true);

create policy "Dono edita seu perfil" on profiles
  for update using (auth.uid() = id);

create policy "Dono cria seu perfil" on profiles
  for insert with check (auth.uid() = id);

-- Links: qualquer um pode ler links ativos, só o dono gerencia
create policy "Links ativos são públicos" on links
  for select using (active = true or auth.uid() = profile_id);

create policy "Dono gerencia seus links" on links
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Cliques: só o dono do link pode ler os detalhes.
-- Inserção acontece só pelo backend (service role), então não precisa de policy de insert pública.
create policy "Dono ve os cliques dos seus links" on clicks
  for select using (
    exists (
      select 1 from links
      where links.id = clicks.link_id
      and links.profile_id = auth.uid()
    )
  );
