import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = env.supabase.url && env.supabase.serviceRoleKey
  ? createClient(env.supabase.url, env.supabase.serviceRoleKey)
  : null;
