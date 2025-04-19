-- Create words table
create table words (
  id text primary key,
  word text not null,
  translation text not null,
  example text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table words enable row level security;

-- Create a policy that allows all operations for all users (including unauthenticated)
create policy "Allow all operations for all users" on words
  for all
  using (true)
  with check (true); 