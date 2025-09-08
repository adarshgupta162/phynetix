-- Create test attempts table
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  submitted_at timestamp with time zone,
  total_marks integer default 0,
  obtained_marks integer default 0,
  time_spent_seconds integer default 0,
  is_submitted boolean default false,
  question_order jsonb, -- Randomized question order for this attempt
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(test_id, student_id)
);

-- Enable RLS
alter table public.attempts enable row level security;

-- RLS policies for attempts
create policy "attempts_select_own"
  on public.attempts for select
  using (student_id = auth.uid());

create policy "attempts_insert_own"
  on public.attempts for insert
  with check (student_id = auth.uid());

create policy "attempts_update_own"
  on public.attempts for update
  using (student_id = auth.uid());

create policy "attempts_admin_all"
  on public.attempts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
