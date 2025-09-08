-- Create tests table
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  duration_minutes integer not null default 180,
  total_marks integer not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tests enable row level security;

-- RLS policies for tests
create policy "tests_select_enrolled"
  on public.tests for select
  using (
    is_active = true and (
      exists (
        select 1 from public.enrollments
        where course_id = tests.course_id and student_id = auth.uid()
      ) or
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

create policy "tests_admin_all"
  on public.tests for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
