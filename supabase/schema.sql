-- House Chores schema. Run once in the Supabase SQL editor.
--
-- A household has members (auth users). Chores and completions belong to a household.
-- A chore's last-done date is derived from its completions, same as the local app.
-- Row Level Security limits every read and write to members of that household.

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our home',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (household_id, user_id)
);

create table chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  frequency_days integer not null check (frequency_days >= 1),
  -- Null means anyone in the household can do it.
  assignee_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  chore_id uuid not null references chores (id) on delete cascade,
  done_on date not null,
  done_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index chores_household_idx on chores (household_id);
create index completions_household_idx on completions (household_id);
create index completions_chore_idx on completions (chore_id, done_on desc);

-- True when the signed-in user belongs to the household.
-- security definer lets policies check membership without recursing into household_members' own policies.
create function is_household_member(hid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- Creates a household and makes the caller its first member in one step.
create function create_household(household_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;

  insert into households (name) values (coalesce(nullif(trim(household_name), ''), 'Our home'))
  returning id into new_id;

  insert into household_members (household_id, user_id) values (new_id, auth.uid());
  return new_id;
end;
$$;

-- Lets a signed-in user join an existing household by its id.
-- The id is a random UUID, so it works as a shared secret. Share it only with your partner.
create function join_household(hid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;

  if not exists (select 1 from households where id = hid) then
    raise exception 'Household not found';
  end if;

  insert into household_members (household_id, user_id)
  values (hid, auth.uid())
  on conflict do nothing;
end;
$$;

-- Functions are callable by signed-in users only, not by anonymous visitors.
revoke execute on function is_household_member(uuid) from public, anon;
revoke execute on function create_household(text) from public, anon;
revoke execute on function join_household(uuid) from public, anon;
grant execute on function is_household_member(uuid) to authenticated;
grant execute on function create_household(text) to authenticated;
grant execute on function join_household(uuid) to authenticated;

-- Table grants for the signed-in role. Needed when "Automatically expose new tables" is off.
-- RLS policies below still decide which rows each user can see.
grant select, insert, update, delete on households, household_members, chores, completions to authenticated;

alter table households enable row level security;
alter table household_members enable row level security;
alter table chores enable row level security;
alter table completions enable row level security;

create policy "members read household" on households
  for select using (is_household_member(id));

create policy "members read membership" on household_members
  for select using (user_id = auth.uid() or is_household_member(household_id));

create policy "members manage chores" on chores
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members manage completions" on completions
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- Lets the app receive live changes for chores and completions.
alter publication supabase_realtime add table chores, completions;

-- Display names for household members. Run once in the Supabase SQL editor.

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0 and length(display_name) <= 40)
);

alter table profiles enable row level security;

grant select, insert, update on profiles to authenticated;

-- You can write only your own profile.
create policy "users manage own profile" on profiles
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Members of the same household can read each other's names.
create policy "household members read profiles" on profiles
  for select using (
    exists (
      select 1
      from household_members mine
      join household_members theirs on theirs.household_id = mine.household_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.user_id
    )
  );
