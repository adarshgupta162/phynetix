-- Insert sample admin user (this will be created when an admin signs up)
-- Sample course data
insert into public.courses (id, title, description, created_by, is_active) values
  ('550e8400-e29b-41d4-a716-446655440001', 'JEE Main Preparation', 'Complete preparation course for JEE Main examination covering Physics, Chemistry, and Mathematics', '550e8400-e29b-41d4-a716-446655440000', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'NEET Preparation', 'Comprehensive NEET preparation with focus on Biology, Physics, and Chemistry', '550e8400-e29b-41d4-a716-446655440000', true)
on conflict (id) do nothing;

-- Sample lessons
insert into public.lessons (course_id, title, description, content_type, content_url, order_index) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Introduction to Mechanics', 'Basic concepts of mechanics and motion', 'video', 'https://example.com/mechanics-intro', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'Organic Chemistry Basics', 'Fundamental concepts of organic chemistry', 'pdf', 'https://example.com/organic-basics.pdf', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'Calculus Fundamentals', 'Introduction to differential and integral calculus', 'video', 'https://example.com/calculus-intro', 3)
on conflict do nothing;

-- Sample test
insert into public.tests (id, course_id, title, description, duration_minutes, total_marks) values
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'JEE Main Mock Test 1', 'Full-length mock test covering all subjects', 180, 300)
on conflict (id) do nothing;

-- Sample questions
insert into public.questions (test_id, section, question_type, question_text, options, correct_answers, marks, order_index) values
  ('550e8400-e29b-41d4-a716-446655440010', 'Physics', 'mcq_single', 'What is the SI unit of force?', '{"A": "Newton", "B": "Joule", "C": "Watt", "D": "Pascal"}', '["A"]', 4, 1),
  ('550e8400-e29b-41d4-a716-446655440010', 'Chemistry', 'mcq_multiple', 'Which of the following are noble gases?', '{"A": "Helium", "B": "Neon", "C": "Oxygen", "D": "Argon"}', '["A", "B", "D"]', 4, 2),
  ('550e8400-e29b-41d4-a716-446655440010', 'Mathematics', 'numeric', 'Find the derivative of x² + 3x + 2 at x = 2', '{}', '["7"]', 4, 3)
on conflict do nothing;
