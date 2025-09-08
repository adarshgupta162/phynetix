-- Create lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  content_type text not null check (content_type in ('pdf', 'video', 'text')),
  content_url text,
  content_text text,
  order_index integer not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.lessons enable row level security;

-- RLS policies for lessons
create policy "lessons_select_enrolled"
  on public.lessons for select
  using (
    is_active = true and (
      exists (
        select 1 from public.enrollments
        where course_id = lessons.course_id and student_id = auth.uid()
      ) or
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

create policy "lessons_admin_all"
  on public.lessons for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
