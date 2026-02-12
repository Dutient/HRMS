-- Seed data for testing Candidate Card design
-- Only run this in development/staging environments

-- Insert sample candidates with all required fields
INSERT INTO candidates (
  name,
  email,
  phone,
  location,
  role,
  experience,
  skills,
  status,
  source,
  applied_date,
  match_score,
  summary,
  avatar_url
) VALUES
(
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+1-555-0101',
  'San Francisco, CA',
  'Senior Frontend Developer',
  5,
  ARRAY['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GDPR'],
  'Interview',
  'LinkedIn',
  CURRENT_DATE - INTERVAL '2 days',
  92,
  'Experienced frontend developer with expertise in React ecosystem and strong focus on user experience.',
  NULL
),
(
  'Michael Chen',
  'michael.chen@example.com',
  '+1-555-0102',
  'New York, NY',
  'Full Stack Engineer',
  7,
  ARRAY['Node.js', 'React', 'Python', 'AWS', 'Docker'],
  'New',
  'Bulk Upload',
  CURRENT_DATE,
  85,
  'Full-stack engineer with strong backend experience and cloud infrastructure knowledge.',
  NULL
),
(
  'Emily Rodriguez',
  'emily.rodriguez@example.com',
  '+1-555-0103',
  'Austin, TX',
  'DevOps Engineer',
  4,
  ARRAY['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Python'],
  'Screening',
  'Referral',
  CURRENT_DATE - INTERVAL '5 days',
  78,
  'DevOps specialist with focus on automation and cloud infrastructure optimization.',
  NULL
),
(
  'David Park',
  'david.park@example.com',
  '+1-555-0104',
  'Seattle, WA',
  'Backend Developer',
  3,
  ARRAY['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'GDPR'],
  'Talent Pool',
  'LinkedIn',
  CURRENT_DATE - INTERVAL '30 days',
  88,
  'Backend developer with strong database design skills and API development experience.',
  NULL
),
(
  'Jessica Williams',
  'jessica.williams@example.com',
  '+1-555-0105',
  'Boston, MA',
  'UI/UX Designer',
  6,
  ARRAY['Figma', 'Adobe XD', 'React', 'CSS', 'Accessibility'],
  'Selected',
  'Indeed',
  CURRENT_DATE - INTERVAL '14 days',
  95,
  'Creative designer with strong technical skills and focus on accessible, user-centered design.',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE candidates IS 'Contains seed data for testing Candidate Card UI components';
