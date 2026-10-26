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
