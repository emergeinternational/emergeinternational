
-- Create a table to track our automation runs if it doesn't exist
CREATE TABLE IF NOT EXISTS public.education_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant access to the service role
GRANT ALL ON public.education_automation_logs TO service_role;

-- Enable RLS
ALTER TABLE public.education_automation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service_role full access
CREATE POLICY "Service Role Full Access"
  ON public.education_automation_logs
  USING (true)
  WITH CHECK (true);

-- Create CRON job to run our function every 7 days
SELECT cron.schedule(
  'education-automation-weekly',
  '0 0 */7 * *', -- At midnight every 7 days
  $$
  SELECT net.http_post(
    url:='https://dqfnetchkvnzrtacgvfw.supabase.co/functions/v1/education-automation',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZm5ldGNoa3ZuenJ0YWNndmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODkyNTgsImV4cCI6MjA2MTA2NTI1OH0.h6eC1M8Kxt1r-kATr_dXNfL41jQFd8khGqf7XLSupvg"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Note: The above assumes pg_cron and pg_net extensions are enabled
-- You may need to enable them via console if not already enabled
