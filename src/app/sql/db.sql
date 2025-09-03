-- Stores poll information
create table public.polls (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_by uuid references auth.users(id) not null,
  is_public boolean default true,
  allow_multiple_votes boolean default false,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.polls enable row level security;

-- RLS Policies
-- 1. Allow users to view public polls
create policy "Anyone can view public polls"
  on public.polls
  for select
  using (is_public = true);

-- 2. Allow users to view their own private polls
create policy "Users can view their own polls"
  on public.polls
  for select
  using (created_by = auth.uid());

-- 3. Allow users to create polls
create policy "Users can create polls"
  on public.polls
  for insert
  with check (created_by = auth.uid());

-- 4. Allow users to update their own polls
create policy "Users can update their own polls"
  on public.polls
  for update
  using (created_by = auth.uid());

-- 5. Allow users to delete their own polls
create policy "Users can delete their own polls"
  on public.polls
  for delete
  using (created_by = auth.uid());

  -- Stores options for each poll
create table public.poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  text text not null,
  position integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.poll_options enable row level security;

-- RLS Policies
-- 1. Allow users to view options for public polls
create policy "Anyone can view options for public polls"
  on public.poll_options
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id
      and polls.is_public = true
    )
  );

-- 2. Allow users to view options for their own polls
create policy "Users can view options for their own polls"
  on public.poll_options
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 3. Allow users to create options for their own polls
create policy "Users can create options for their own polls"
  on public.poll_options
  for insert
  with check (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 4. Allow users to update options for their own polls
create policy "Users can update options for their own polls"
  on public.poll_options
  for update
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 5. Allow users to delete options for their own polls
create policy "Users can delete options for their own polls"
  on public.poll_options
  for delete
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id
      and polls.created_by = auth.uid()
    )
  );

  -- Stores user votes
create table public.votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id uuid references public.poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  
  -- Ensure a user can only vote once per option
  unique(user_id, option_id)
);

-- Enable Row Level Security
alter table public.votes enable row level security;

-- RLS Policies
-- 1. Allow users to view votes for public polls
create policy "Anyone can view votes for public polls"
  on public.votes
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.is_public = true
    )
  );

-- 2. Allow users to view votes for their own polls
create policy "Users can view votes for their own polls"
  on public.votes
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 3. Allow users to vote on public polls
create policy "Users can vote on public polls"
  on public.votes
  for insert
  with check (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.is_public = true
      and (polls.end_date is null or polls.end_date > now())
    ) and user_id = auth.uid()
  );

-- 4. Allow users to delete their own votes
create policy "Users can delete their own votes"
  on public.votes
  for delete
  using (user_id = auth.uid());

  -- Stores user votes
create table public.votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id uuid references public.poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  
  -- Ensure a user can only vote once per option
  unique(user_id, option_id)
);

-- Enable Row Level Security
alter table public.votes enable row level security;

-- RLS Policies
-- 1. Allow users to view votes for public polls
create policy "Anyone can view votes for public polls"
  on public.votes
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.is_public = true
    )
  );

-- 2. Allow users to view votes for their own polls
create policy "Users can view votes for their own polls"
  on public.votes
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 3. Allow users to vote on public polls
create policy "Users can vote on public polls"
  on public.votes
  for insert
  with check (
    exists (
      select 1 from public.polls
      where polls.id = votes.poll_id
      and polls.is_public = true
      and (polls.end_date is null or polls.end_date > now())
    ) and user_id = auth.uid()
  );

-- 4. Allow users to delete their own votes
create policy "Users can delete their own votes"
  on public.votes
  for delete
  using (user_id = auth.uid());

  -- Stores analytics data for polls
create table public.poll_analytics (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  views integer default 0,
  shares integer default 0,
  unique_voters integer default 0,
  last_updated timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.poll_analytics enable row level security;

-- RLS Policies
-- 1. Allow poll creators to view analytics
create policy "Poll creators can view analytics"
  on public.poll_analytics
  for select
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_analytics.poll_id
      and polls.created_by = auth.uid()
    )
  );

-- 2. Allow system to update analytics
create policy "System can update analytics"
  on public.poll_analytics
  for update
  using (true);

  -- Function to update poll's updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for polls table
create trigger set_polls_updated_at
before update on public.polls
for each row
execute function public.handle_updated_at();

-- Trigger for poll_options table
create trigger set_poll_options_updated_at
before update on public.poll_options
for each row
execute function public.handle_updated_at();

-- Function to update poll analytics when a new vote is cast
create or replace function public.update_poll_analytics_on_vote()
returns trigger as $$
begin
  insert into public.poll_analytics (poll_id, unique_voters)
  values (new.poll_id, 1)
  on conflict (poll_id)
  do update set 
    unique_voters = (
      select count(distinct user_id) 
      from public.votes 
      where poll_id = new.poll_id
    ),
    last_updated = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for votes table
create trigger update_analytics_on_vote
after insert on public.votes
for each row
execute function public.update_poll_analytics_on_vote();

-- Add indexes for better query performance
create index idx_polls_created_by on public.polls(created_by);
create index idx_polls_is_public on public.polls(is_public);
create index idx_poll_options_poll_id on public.poll_options(poll_id);
create index idx_votes_poll_id on public.votes(poll_id);
create index idx_votes_option_id on public.votes(option_id);
create index idx_votes_user_id on public.votes(user_id);