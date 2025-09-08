-- Create answers table
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.attempts(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  selected_answers jsonb, -- Student's selected answers
  is_correct boolean,
  marks_awarded integer default 0,
  time_spent_seconds integer default 0,
  is_marked_for_review boolean default false,
  answered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(attempt_id, question_id)
);

-- Enable RLS
alter table public.answers enable row level security;

-- RLS policies for answers
create policy "answers_select_own"
  on public.answers for select
  using (
    exists (
      select 1 from public.attempts
      where id = answers.attempt_id and student_id = auth.uid()
    )
  );

create policy "answers_insert_own"
  on public.answers for insert
  with check (
    exists (
      select 1 from public.attempts
      where id = answers.attempt_id and student_id = auth.uid()
    )
  );

create policy "answers_update_own"
  on public.answers for update
  using (
    exists (
      select 1 from public.attempts
      where id = answers.attempt_id and student_id = auth.uid()
    )
  );

create policy "answers_admin_all"
  on public.answers for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
