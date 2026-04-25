import { createClient } from '@supabase/supabase-js';

const VENDOR_URL = import.meta.env.VITE_VENDOR_SUPABASE_URL;
const VENDOR_KEY = import.meta.env.VITE_VENDOR_SUPABASE_ANON_KEY;
const VENDOR_CODE = import.meta.env.VITE_VENDOR_ACCESS_CODE;

function getVendorClient() {
  if (!VENDOR_URL || !VENDOR_KEY) return null;
  return createClient(VENDOR_URL, VENDOR_KEY);
}

/** Verify a code against the env-stored vendor access code */
export function verifyVendorCode(code: string): boolean {
  if (!VENDOR_CODE) return false;
  return code.trim() === VENDOR_CODE.trim();
}

/** Generate a short memorable College ID from the college name */
export function generateCollegeId(name: string): string {
  const stopWords = new Set(['of', 'and', 'the', 'for', 'in', 'at', 'to', 'a', 'an', '&']);
  const initials = name
    .split(/\s+/)
    .filter(w => w.length > 0 && !stopWords.has(w.toLowerCase()))
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 5) || 'COL';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars (0,O,I,1)
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${initials}-${suffix}`;
}

/** Fetch a college's Supabase config by College ID — used by login gateway */
export async function getCollegeConfig(collegeId: string): Promise<{
  supabase_url: string;
  anon_key: string;
  college_name: string;
} | null> {
  const client = getVendorClient();
  if (!client) return null;
  const { data } = await client
    .from('registered_colleges')
    .select('supabase_url, anon_key, college_name')
    .eq('college_id', collegeId.toUpperCase().trim())
    .single();
  return data ?? null;
}

/** Register a new college in the vendor's central registry */
export async function registerCollege(data: {
  college_id: string;
  college_name: string;
  contact_email: string;
  supabase_url: string;
  anon_key: string;
  groq_configured: boolean;
}): Promise<void> {
  const client = getVendorClient();
  if (!client) return; // Silently skip in dev if vendor DB not configured
  await client.from('registered_colleges').insert({
    ...data,
    status: 'active',
    plan: 'free',
  });
}

/** Fetch all colleges for the vendor dashboard */
export async function getAllColleges(): Promise<RegisteredCollege[]> {
  const client = getVendorClient();
  if (!client) return [];
  const { data } = await client
    .from('registered_colleges')
    .select('*')
    .order('setup_completed_at', { ascending: false });
  return (data ?? []) as RegisteredCollege[];
}

/** Ping last_active when a college user logs in */
export async function pingActive(collegeId: string): Promise<void> {
  const client = getVendorClient();
  if (!client) return;
  await client
    .from('registered_colleges')
    .update({ last_active: new Date().toISOString() })
    .eq('college_id', collegeId);
}

export interface RegisteredCollege {
  id: string;
  college_id: string;
  college_name: string;
  contact_email?: string;
  supabase_url?: string;
  anon_key?: string;
  groq_configured: boolean;
  plan: string;
  status: 'active' | 'suspended' | 'trial';
  setup_completed_at: string;
  last_active: string;
}
