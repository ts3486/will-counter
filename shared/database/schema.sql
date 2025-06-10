-- Will Counter Database Schema
-- This file contains the database schema for the Will Counter application

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  auth0_id text unique not null,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  preferences jsonb default '{"soundEnabled": true, "notificationEnabled": true, "theme": "light"}'::jsonb
);

-- Enable Row Level Security for users
alter table users enable row level security;

-- Create policy for users
create policy "Users can only access their own data"
  on users for all
  using (auth.jwt() ->> 'sub' = auth0_id);

-- Will counts table
create table if not exists will_counts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  date date not null,
  count integer default 0,
  timestamps timestamp with time zone[] default array[]::timestamp with time zone[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Enable Row Level Security for will_counts
alter table will_counts enable row level security;

-- Create policy for will_counts
create policy "Users can only access their own counts"
  on will_counts for all
  using (auth.jwt() ->> 'sub' = (select auth0_id from users where id = user_id));

-- Create indexes for better performance
create index if not exists idx_users_auth0_id on users(auth0_id);
create index if not exists idx_users_email on users(email);
create index if not exists idx_will_counts_user_id on will_counts(user_id);
create index if not exists idx_will_counts_date on will_counts(date);
create index if not exists idx_will_counts_user_date on will_counts(user_id, date);

-- Create updated_at trigger function
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for will_counts updated_at
create trigger set_timestamp
  before update on will_counts
  for each row
  execute procedure trigger_set_timestamp();

-- Create function to get or create today's count
create or replace function get_or_create_today_count(p_user_id uuid)
returns will_counts as $$
declare
  result will_counts;
begin
  select * into result
  from will_counts
  where user_id = p_user_id and date = current_date;
  
  if not found then
    insert into will_counts (user_id, date, count, timestamps)
    values (p_user_id, current_date, 0, array[]::timestamp with time zone[])
    returning * into result;
  end if;
  
  return result;
end;
$$ language plpgsql security definer;

-- Create function to increment will count
create or replace function increment_will_count(p_user_id uuid)
returns will_counts as $$
declare
  result will_counts;
begin
  -- Get or create today's record
  select * into result from get_or_create_today_count(p_user_id);
  
  -- Update count and add timestamp
  update will_counts
  set 
    count = count + 1,
    timestamps = array_append(timestamps, timezone('utc'::text, now())),
    updated_at = timezone('utc'::text, now())
  where id = result.id
  returning * into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- Create function to get user statistics
create or replace function get_user_statistics(p_user_id uuid, p_days integer default 30)
returns table (
  date date,
  count integer,
  total_sessions integer
) as $$
begin
  return query
  select 
    wc.date,
    wc.count,
    array_length(wc.timestamps, 1) as total_sessions
  from will_counts wc
  where wc.user_id = p_user_id
    and wc.date >= current_date - interval '1 day' * p_days
  order by wc.date desc;
end;
$$ language plpgsql security definer;