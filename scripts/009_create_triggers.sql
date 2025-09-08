-- Create trigger function for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create function to update timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers to all tables
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger courses_updated_at before update on public.courses
  for each row execute function public.handle_updated_at();

create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.handle_updated_at();

create trigger tests_updated_at before update on public.tests
  for each row execute function public.handle_updated_at();

create trigger questions_updated_at before update on public.questions
  for each row execute function public.handle_updated_at();

create trigger attempts_updated_at before update on public.attempts
  for each row execute function public.handle_updated_at();

create trigger answers_updated_at before update on public.answers
  for each row execute function public.handle_updated_at();
