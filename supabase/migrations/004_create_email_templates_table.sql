-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rejection', 'offer', 'invite')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_email_templates_type ON email_templates(type);

-- Enable Row Level Security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Enable all access to email_templates" 
  ON email_templates 
  FOR ALL 
  USING (true);

-- Create trigger to auto-update last_updated timestamp
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_template_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_timestamp();

-- Insert seed data (3 default templates)
INSERT INTO email_templates (name, type, subject, body) VALUES
  (
    'Interview Invite',
    'invite',
    'Interview Invitation - {{role}} Position at Dutient',
    'Dear {{name}},

We are pleased to invite you for an interview for the {{role}} position at Dutient.

Interview Details:
Date: {{date}}
Time: {{time}}
Location: {{location}}

Please confirm your availability by replying to this email.

We look forward to meeting you!

Best regards,
Dutient HR Team'
  ),
  (
    'Rejection Email',
    'rejection',
    'Application Status - {{role}} Position',
    'Dear {{name}},

Thank you for your interest in the {{role}} position at Dutient and for taking the time to interview with us.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest in Dutient and wish you the best in your job search.

Best regards,
Dutient HR Team'
  ),
  (
    'Offer Letter',
    'offer',
    'Job Offer - {{role}} Position at Dutient',
    'Dear {{name}},

Congratulations! We are delighted to extend an offer for the {{role}} position at Dutient.

Offer Details:
Position: {{role}}
Start Date: {{date}}
Salary: {{salary}}
Benefits: Comprehensive health insurance, flexible work hours, professional development opportunities

Please review the attached offer letter and respond within 5 business days.

We are excited about the prospect of you joining our team!

Best regards,
Dutient HR Team'
  );
