/* Supabase connection for the hub.
   Both values are public by design (every visitor's browser receives them); what they can do is
   limited by the RLS policies in supabase/setup.sql (read only).
   NEVER put the secret key / service_role key here.

   Where to find them in Supabase: the "Connect" button at the top of the project,
   or Project Settings > Data API (Project URL) and Project Settings > API Keys (publishable key).
   Leave them empty to use the data built into js/app.js. */
window.DPP_CONFIG = {
  supabaseUrl: 'https://rjbxvvhxvfpwazgenryn.supabase.co',   // e.g. 'https://rjbxvvhxvfpwazgenryn.supabase.co'
  supabaseKey: 'sb_publishable_8IRRh7NgcntBvUr-4N1V0w_PeKT75tl',   // 'sb_publishable_...'  (a legacy "anon" key also works)
};
