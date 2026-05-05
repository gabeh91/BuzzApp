alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.interest_activations enable row level security;

create policy "Public interests are readable"
on public.interests
for select
using (true);
