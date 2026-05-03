import { supabase } from '../config/supabase.js';

export async function saveLead(payload) {
  if (!supabase) return { saved: false, reason: 'Supabase não configurado.' };
  const { data, error } = await supabase.from('flight_leads').insert(payload).select().single();
  if (error) throw error;
  return { saved: true, data };
}
