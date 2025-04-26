
// This file defines the cron job that will trigger the course-refresh function every two weeks
// In a real production environment, this would be configured in the Supabase dashboard

/*
To set up this cronjob in Supabase:

1. Enable pg_cron and pg_net extensions in your Supabase project
2. Execute the following SQL:

select
cron.schedule(
  'course-refresh-biweekly',
  '0 0 1,15 * *', -- Run at midnight on the 1st and 15th of each month
  $$
  select
    net.http_post(
        url:='https://dqfnetchkvnzrtacgvfw.supabase.co/functions/v1/course-refresh',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}',
        body:='{"action": "refresh", "preserve_invalid": true}'::jsonb
    ) as request_id;
  $$
);

*/

// This is just a reference file to document the cron job setup
// The actual implementation would be done through SQL in the Supabase console
export {};
