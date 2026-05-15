delete from public.blocks existing
using public.blocks duplicate
where existing.ctid < duplicate.ctid
  and existing.blocker_id = duplicate.blocker_id
  and existing.blocked_id = duplicate.blocked_id;

create unique index if not exists blocks_pair_unique_idx
  on public.blocks (blocker_id, blocked_id);
