/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const supabaseUrl = url || import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Could not initialize direct Supabase client:', e);
      return null;
    }
  }

  return cachedClient;
}

export function resetSupabaseClient(url: string, key: string): SupabaseClient | null {
  cachedClient = null;
  return getSupabaseClient(url, key);
}
