
-- This SQL file is for reference only, the actual function is created directly in our SQL migration

-- Create or replace function to create automation logs table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_automation_logs_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create automation_logs table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Enable RLS on the table
  ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
  
  -- Create policy for select access
  DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.automation_logs;
  CREATE POLICY "Allow select for authenticated users"
    ON public.automation_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');
    
  -- Create policy for insert access
  DROP POLICY IF EXISTS "Allow insert for service role" ON public.automation_logs;
  CREATE POLICY "Allow insert for service role"
    ON public.automation_logs
    FOR INSERT
    WITH CHECK (true);
END;
$$;
