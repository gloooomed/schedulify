import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { configStore } from '../config/store';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const config = configStore.get();
  const url = config?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
  const key = config?.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase not configured. Please complete setup.');
  }

  _client = createClient(url, key);
  return _client;
}

export function resetSupabaseClient(): void {
  _client = null;
}

// Convenience proxy — use this for all queries
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

// Normalize URL — handles project ID only, missing https://, trailing slashes
function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url.includes('.') && !url.startsWith('http')) {
    url = `https://${url}.supabase.co`;
  }
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
}

// Test connection using the auth endpoint — always available BEFORE schema is run
// This avoids the 404 that happens when the profiles table doesn't exist yet
export async function testSupabaseConnection(
  url: string,
  anonKey: string,
): Promise<{ ok: boolean; normalizedUrl: string }> {
  const normalizedUrl = normalizeSupabaseUrl(url);
  try {
    const client = createClient(normalizedUrl, anonKey, {
      auth: {
        storageKey: `schedulify-test-${Date.now()}`,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    // getSession() hits /auth/v1/token — always exists regardless of schema
    // Any successful response (even "no active session") = valid URL + key
    const { error } = await client.auth.getSession();
    return { ok: !error, normalizedUrl };
  } catch {
    return { ok: false, normalizedUrl };
  }
}
