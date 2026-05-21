import { createClient } from '@supabase/supabase-js';

const getSupabaseEnv = () => {
  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;

  return {
    url: url && url.startsWith('http') ? url : 'https://wbmtexiwvoecogeohhdu.supabase.co',
    key: key && key.length > 20 ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibXRleGl3dm9lY29nZW9oaGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTM3MDYsImV4cCI6MjA5NDg4OTcwNn0.nZSaoKa5KLtPIysHw8E8Ac5Vnd-ig_t9RUM2oPPzfbU'
  };
};

const config = getSupabaseEnv();

if (!(import.meta as any).env?.VITE_SUPABASE_URL) {
  console.log('Supabase: Using default project URL');
}

export const supabase = createClient(config.url, config.key);
