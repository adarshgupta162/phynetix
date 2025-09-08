-- Create enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, course_id)
);

-- Enable RLS
alter table public.enrollments enable row level security;

-- RLS policies for enrollments
create policy "enrollments_select_own"
  on public.enrollments for select
  using (student_id = auth.uid());

create policy "enrollments_insert_own"
  on public.enrollments for insert
  with check (student_id = auth.uid());

create policy "enrollments_admin_all"
  on public.enrollments for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
