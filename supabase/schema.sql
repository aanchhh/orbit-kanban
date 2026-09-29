-- Orbit database schema
-- Run this entire file in the Supabase SQL editor, then enable Anonymous Sign-Ins
-- in Authentication > Providers > Anonymous.

create extension if not exists pgcrypto;

create type public.task_status as enum ('todo', 'in_progress', 'in_review', 'done');
create type public.task_priority as enum ('low', 'normal', 'high');

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  color text not null default '#4965f2' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'normal',
  due_date date,
  labels text[] not null default '{}',
  assignee_ids uuid[] not null default '{}',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action text not null check (action in ('created', 'updated', 'moved', 'assigned')),
  detail text not null check (char_length(detail) between 1 and 500),
  created_at timestamptz not null default now()
);

create index tasks_user_status_position_idx on public.tasks(user_id, status, position);
create index comments_task_created_idx on public.comments(task_id, created_at);
create index task_activity_task_created_idx on public.task_activity(task_id, created_at desc);
create index team_members_owner_idx on public.team_members(owner_user_id);

alter table public.tasks enable row level security;
alter table public.team_members enable row level security;
alter table public.comments enable row level security;
alter table public.task_activity enable row level security;

create policy "Guests can read their tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Guests can create their tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Guests can update their tasks"
  on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Guests can delete their tasks"
  on public.tasks for delete using (auth.uid() = user_id);

create policy "Guests can read their team"
  on public.team_members for select using (auth.uid() = owner_user_id);
create policy "Guests can create their team"
  on public.team_members for insert with check (auth.uid() = owner_user_id);
create policy "Guests can update their team"
  on public.team_members for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "Guests can delete their team"
  on public.team_members for delete using (auth.uid() = owner_user_id);

create policy "Guests can read their comments"
  on public.comments for select using (auth.uid() = user_id);
create policy "Guests can create their comments"
  on public.comments for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.tasks where tasks.id = comments.task_id and tasks.user_id = auth.uid()
    )
  );
create policy "Guests can update their comments"
  on public.comments for update using (auth.uid() = user_id) with check (
    auth.uid() = user_id and exists (
      select 1 from public.tasks where tasks.id = comments.task_id and tasks.user_id = auth.uid()
    )
  );
create policy "Guests can delete their comments"
  on public.comments for delete using (auth.uid() = user_id);

create policy "Guests can read their activity"
  on public.task_activity for select using (auth.uid() = user_id);
create policy "Guests can create their activity"
  on public.task_activity for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.tasks where tasks.id = task_activity.task_id and tasks.user_id = auth.uid()
    )
  );

-- Grants are still required in addition to RLS policies.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert on public.task_activity to authenticated;
