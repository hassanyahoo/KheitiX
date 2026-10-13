import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize and export the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Log an irrigation event to the `irrigation_logs` table in Supabase
 * and persist locally for offline resilience.
 */
export async function logIrrigationEvent({
  fieldId,
  fieldName,
  crop,
  areaAcres,
  soilType,
  amountMm,
  litres,
}) {
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];

  const logPayload = {
    field_id: fieldId,
    field_name: fieldName,
    crop,
    area_acres: areaAcres,
    soil_type: soilType,
    amount_mm: amountMm,
    litres,
    date: dateStr,
    created_at: timestamp,
  };

  // 1. Attempt Supabase insertion if valid URL is present
  const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('irrigation_logs')
        .insert([logPayload]);

      if (error) {
        console.warn('Supabase insertion notice:', error.message);
      } else {
        console.log('Successfully recorded to Supabase irrigation_logs table:', data);
      }
    } catch (err) {
      console.warn('Supabase network error (using local storage):', err);
    }
  }

  // 2. Persist locally to localStorage so records are always preserved
  try {
    const LOCAL_LOGS_KEY = 'khetix_irrigation_logs';
    const existingRaw = localStorage.getItem(LOCAL_LOGS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem(
      LOCAL_LOGS_KEY,
      JSON.stringify([{ id: `log-${Date.now()}`, ...logPayload }, ...existing])
    );
  } catch (err) {
    console.warn('LocalStorage logging failed:', err);
  }

  return { success: true, date: dateStr };
}
