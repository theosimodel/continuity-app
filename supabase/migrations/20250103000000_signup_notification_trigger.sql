-- Enable pg_net extension for HTTP requests from Postgres
create extension if not exists pg_net with schema extensions;

-- Create function to notify on new signup
create or replace function notify_new_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  edge_function_url text;
  payload jsonb;
begin
  -- Construct the Edge Function URL
  -- Replace YOUR_PROJECT_REF with your actual Supabase project reference
  edge_function_url := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/notify-signup';

  -- If the setting isn't available, use a direct URL pattern
  if edge_function_url is null or edge_function_url = '/functions/v1/notify-signup' then
    -- You'll need to update this with your actual project URL after deployment
    edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-signup';
  end if;

  -- Build the payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'profiles',
    'schema', 'public',
    'record', jsonb_build_object(
      'id', NEW.id,
      'username', NEW.username,
      'created_at', NEW.created_at
    )
  );

  -- Make async HTTP request to Edge Function
  perform net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  return NEW;
end;
$$;

-- Create trigger on profiles table
drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
  after insert on profiles
  for each row
  execute function notify_new_signup();

-- Add comment for documentation
comment on function notify_new_signup() is 'Sends email notification when a new user signs up via Edge Function';
