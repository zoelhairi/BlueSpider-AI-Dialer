-- ==============================================================================
-- Supabase PostgreSQL Schema for Vapi Voice AI Platform
-- Integrates Assistants, Phone Numbers, Campaigns, Call Logs, RBAC, and Webhooks
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & RBAC
CREATE TYPE user_role AS ENUM ('super_admin', 'campaign_manager', 'analyst', 'viewer');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'campaign_manager',
    department TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VAPI ASSISTANTS TABLE
CREATE TABLE IF NOT EXISTS assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vapi_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    model_config JSONB NOT NULL DEFAULT '{"provider": "openai", "model": "gpt-4o", "temperature": 0.7, "maxTokens": 300, "systemPrompt": ""}'::jsonb,
    voice_config JSONB NOT NULL DEFAULT '{"provider": "11labs", "voiceId": "21m00Tcm4TlvDq8ikWAM", "speed": 1.0}'::jsonb,
    transcriber_config JSONB NOT NULL DEFAULT '{"provider": "deepgram", "model": "nova-2", "language": "en"}'::jsonb,
    first_message TEXT,
    first_message_mode TEXT DEFAULT 'assistant-speaks-first',
    end_call_phrases TEXT[] DEFAULT ARRAY['goodbye', 'have a great day'],
    recording_enabled BOOLEAN DEFAULT true,
    server_url TEXT,
    silence_timeout_seconds INT DEFAULT 30,
    max_duration_seconds INT DEFAULT 600,
    synced_to_vapi BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PHONE NUMBERS TABLE
CREATE TABLE IF NOT EXISTS phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vapi_id TEXT UNIQUE,
    number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider TEXT DEFAULT 'vapi' CHECK (provider IN ('twilio', 'vonage', 'vapi')),
    assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    synced_to_vapi BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGNS TABLE
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');
CREATE TYPE campaign_type AS ENUM ('outbound', 'inbound');

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vapi_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    type campaign_type DEFAULT 'outbound',
    status campaign_status DEFAULT 'draft',
    phone_number_id UUID REFERENCES phone_numbers(id) ON DELETE SET NULL,
    assistant_id UUID REFERENCES assistants(id) ON DELETE RESTRICT,
    audience_count INT DEFAULT 0,
    completed_calls INT DEFAULT 0,
    successful_calls INT DEFAULT 0,
    failed_calls INT DEFAULT 0,
    concurrent_calls INT DEFAULT 3,
    retry_attempts INT DEFAULT 1,
    retry_interval_minutes INT DEFAULT 15,
    schedule_start TIMESTAMPTZ,
    schedule_end TIMESTAMPTZ,
    synced_to_vapi BOOLEAN DEFAULT false,
    synced_to_supabase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAMPAIGN CONTACTS QUEUE
CREATE TABLE IF NOT EXISTS campaign_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    company TEXT,
    variables JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'completed', 'failed', 'voicemail', 'no-answer', 'busy')),
    call_id UUID,
    call_duration_seconds INT DEFAULT 0,
    call_outcome TEXT,
    retry_count INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CALL LOGS & RECORDINGS TABLE
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vapi_call_id TEXT UNIQUE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    phone_number TEXT NOT NULL,
    type TEXT DEFAULT 'outboundPhoneCall',
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    cost NUMERIC(10, 4) DEFAULT 0.0000,
    cost_breakdown JSONB DEFAULT '{"transport": 0, "stt": 0, "llm": 0, "tts": 0, "vapi": 0}'::jsonb,
    end_reason TEXT,
    transcript JSONB DEFAULT '[]'::jsonb,
    recording_url TEXT,
    analysis JSONB DEFAULT '{"summary": "", "structuredData": {}, "successEvaluation": false, "userSentiment": "neutral"}'::jsonb,
    latency_metrics JSONB DEFAULT '{"ttftMs": 0, "llmLatencyMs": 0, "ttsLatencyMs": 0}'::jsonb,
    synced_to_vapi BOOLEAN DEFAULT true,
    synced_to_supabase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_call_logs_campaign_id ON call_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_vapi_call_id ON call_logs(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_status ON campaign_contacts(campaign_id, status);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read data
CREATE POLICY "Allow authenticated read on assistants" ON assistants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on campaigns" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on call_logs" ON call_logs FOR SELECT TO authenticated USING (true);

-- Allow service role or admins to modify
CREATE POLICY "Allow admin full access on campaigns" ON campaigns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'campaign_manager'))
);
