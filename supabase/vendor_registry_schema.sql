-- =====================================================
-- Run this ONE TIME in YOUR (vendor) Supabase project
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE registered_colleges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id      TEXT NOT NULL UNIQUE,          -- e.g. "DIT-K2X9" — shared with users
  college_name    TEXT NOT NULL,
  contact_email   TEXT,
  supabase_url    TEXT,
  anon_key        TEXT,                          -- public anon key (safe to store)
  groq_configured BOOLEAN DEFAULT FALSE,
  plan            TEXT DEFAULT 'free',
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','trial')),
  setup_completed_at TIMESTAMPTZ DEFAULT NOW(),
  last_active     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registered_colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON registered_colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON registered_colleges FOR SELECT USING (true);
CREATE POLICY "allow_update" ON registered_colleges FOR UPDATE USING (true);
