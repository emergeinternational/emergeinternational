
-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the course scraper to run every 14 days
SELECT cron.schedule(
  'auto-course-scraper',
  '0 0 */14 * *',  -- At midnight every 14 days
  $$
  SELECT net.http_post(
    url:='https://dqfnetchkvnzrtacgvfw.supabase.co/functions/v1/course-scraper',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZm5ldGNoa3ZuenJ0YWNndmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODkyNTgsImV4cCI6MjA2MTA2NTI1OH0.h6eC1M8Kxt1r-kATr_dXNfL41jQFd8khGqf7XLSupvg"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);
