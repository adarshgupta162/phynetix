-- Create questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade not null,
  section text not null check (section in ('Physics', 'Chemistry', 'Mathematics')),
  question_type text not null check (question_type in ('mcq_single', 'mcq_multiple', 'numeric', 'comprehension')),
  question_text text not null,
  options jsonb, -- For MCQ options: {"A": "option1", "B": "option2", ...}
  correct_answers jsonb not null, -- For single: ["A"], for multiple: ["A", "C"], for numeric: ["42.5"]
  marks integer not null default 4,
  negative_marks integer default 1,
  order_index integer not null default 0,
  comprehension_passage text, -- For comprehension questions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.questions enable row level security;

-- RLS policies for questions
create policy "questions_select_enrolled"
  on public.questions for select
  using (
    exists (
      select 1 from public.tests t
      join public.enrollments e on t.course_id = e.course_id
      where t.id = questions.test_id and e.student_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "questions_admin_all"
  on public.questions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
