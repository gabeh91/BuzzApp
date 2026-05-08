create table if not exists public.suburbs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  slug citext not null,
  default_latitude numeric,
  default_longitude numeric,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

create table if not exists public.suburb_tags (
  id uuid primary key default gen_random_uuid(),
  suburb_id uuid not null references public.suburbs(id) on delete cascade,
  tag_key text not null,
  weight numeric not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (suburb_id, tag_key),
  check (weight >= 0)
);

create table if not exists public.user_suburb_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  suburb_id uuid not null references public.suburbs(id) on delete cascade,
  score numeric not null,
  reasons_json jsonb not null default '[]'::jsonb,
  source text not null default 'deterministic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, suburb_id, source)
);

create index if not exists suburbs_city_name_idx
  on public.suburbs (city_id, name);

create index if not exists suburb_tags_key_weight_idx
  on public.suburb_tags (tag_key, weight desc);

create index if not exists user_suburb_matches_user_score_idx
  on public.user_suburb_matches (user_id, score desc, created_at desc);
