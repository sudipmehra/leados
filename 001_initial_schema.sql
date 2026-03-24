-- ═══════════════════════════════════════════════════════════════════
-- LeadOS Database Schema - Supabase PostgreSQL Migration
-- Version: 1.0.0
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption utilities

-- ═══════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE workspace_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE source_type AS ENUM ('directory', 'forum', 'job_board', 'social', 'website', 'api', 'manual');
CREATE TYPE crawl_method AS ENUM ('api', 'rss', 'html_parse', 'manual', 'webhook');
CREATE TYPE compliance_status AS ENUM ('approved', 'review', 'blocked');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE demand_signal AS ENUM ('rfp', 'forum_post', 'job_listing', 'directory', 'social_post', 'website_signal', 'manual');
CREATE TYPE enrichment_status AS ENUM ('none', 'partial', 'complete', 'failed');
CREATE TYPE audit_status AS ENUM ('none', 'in_progress', 'complete');
CREATE TYPE outreach_status AS ENUM ('none', 'drafted', 'sent', 'replied', 'converted');
CREATE TYPE proposal_status AS ENUM ('none', 'preparing', 'sent', 'won', 'lost');
CREATE TYPE confidence_level AS ENUM ('low', 'medium', 'high', 'verified');
CREATE TYPE contact_source AS ENUM ('public_website', 'enrichment_api', 'manual', 'social_profile');
CREATE TYPE outreach_channel AS ENUM ('email', 'linkedin', 'other');
CREATE TYPE template_type AS ENUM ('cold_email', 'followup', 'audit_offer', 'proposal_intro', 'reminder', 'linkedin_message', 'intro_note');
CREATE TYPE draft_status AS ENUM ('draft', 'pending_review', 'approved', 'sent', 'failed');
CREATE TYPE audit_report_status AS ENUM ('draft', 'in_review', 'finalized');
CREATE TYPE compliance_action AS ENUM ('crawl_started', 'crawl_completed', 'crawl_failed', 'lead_created', 'lead_enriched', 'contact_added', 'outreach_sent', 'source_enabled', 'source_disabled', 'source_blocked', 'robots_validated', 'manual_override', 'data_exported', 'admin_action');

-- ═══════════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════════

-- Workspaces (multi-tenant isolation)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan workspace_plan NOT NULL DEFAULT 'free',
    settings JSONB NOT NULL DEFAULT '{
        "scoring_weights": {
            "intent": 0.25,
            "fit": 0.20,
            "accessibility": 0.15,
            "opportunity": 0.20,
            "competition": 0.10,
            "complexity": 0.10
        },
        "max_sends_per_day": 50,
        "duplicate_window_days": 30,
        "default_geographies": [],
        "default_industries": []
    }'::jsonb,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace memberships (many-to-many)
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- ═══════════════════════════════════════════
-- ICP & DISCOVERY
-- ═══════════════════════════════════════════

-- Ideal Customer Profiles
CREATE TABLE ideal_customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    services_needed TEXT[] NOT NULL DEFAULT '{}',
    industries TEXT[] NOT NULL DEFAULT '{}',
    geographies JSONB NOT NULL DEFAULT '{"countries": [], "regions": [], "cities": []}'::jsonb,
    company_sizes TEXT[] NOT NULL DEFAULT '{}',
    business_types TEXT[] NOT NULL DEFAULT '{}',
    keywords TEXT[] NOT NULL DEFAULT '{}',
    intent_phrases TEXT[] NOT NULL DEFAULT '{}',
    exclusions JSONB NOT NULL DEFAULT '{"keywords": [], "domains": [], "industries": []}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Source Connectors
CREATE TABLE source_connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_type source_type NOT NULL,
    crawl_method crawl_method NOT NULL,
    connector_config JSONB NOT NULL DEFAULT '{}'::jsonb,  -- base_url, selectors, api_keys (encrypted), auth
    allowed_fields TEXT[] NOT NULL DEFAULT '{}',
    rate_limit_rpm INTEGER NOT NULL DEFAULT 10,
    trust_score NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (trust_score >= 0 AND trust_score <= 1),
    compliance_status compliance_status NOT NULL DEFAULT 'review',
    robots_txt_url TEXT,
    robots_txt_cache JSONB,  -- Cached parsed robots.txt
    robots_txt_fetched_at TIMESTAMPTZ,
    last_crawl_at TIMESTAMPTZ,
    total_leads_found INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search Jobs
CREATE TABLE search_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    icp_id UUID NOT NULL REFERENCES ideal_customer_profiles(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'queued',
    sources_used UUID[] NOT NULL DEFAULT '{}',
    query_params JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Snapshot of ICP params at job time
    total_discovered INTEGER NOT NULL DEFAULT 0,
    total_qualified INTEGER NOT NULL DEFAULT 0,
    total_duplicates INTEGER NOT NULL DEFAULT 0,
    total_rejected INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Source Crawl Runs (per-source execution log)
CREATE TABLE source_crawl_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_job_id UUID NOT NULL REFERENCES search_jobs(id) ON DELETE CASCADE,
    source_connector_id UUID NOT NULL REFERENCES source_connectors(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'queued',
    leads_found INTEGER NOT NULL DEFAULT 0,
    pages_crawled INTEGER NOT NULL DEFAULT 0,
    errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    robots_txt_respected BOOLEAN NOT NULL DEFAULT true,
    rate_limit_respected BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- LEADS
-- ═══════════════════════════════════════════

-- Main leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Company info
    company_name TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    
    -- Source info
    source_connector_id UUID REFERENCES source_connectors(id) ON DELETE SET NULL,
    source_url TEXT,
    source_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Screenshots, snippets, raw data
    
    -- Location
    country TEXT,
    region TEXT,
    city TEXT,
    
    -- Classification
    industry TEXT,
    company_size TEXT,  -- micro, small, medium, large, enterprise
    business_type TEXT,
    
    -- Need
    likely_service_needed TEXT[] NOT NULL DEFAULT '{}',
    trigger_keyword TEXT,
    need_summary TEXT,
    demand_signal_type demand_signal NOT NULL DEFAULT 'manual',
    
    -- Timestamps
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Scoring (computed by scoring engine, stored for fast queries)
    lead_score NUMERIC(5,2) DEFAULT 0,
    intent_score NUMERIC(3,2) DEFAULT 0,
    fit_score NUMERIC(3,2) DEFAULT 0,
    accessibility_score NUMERIC(3,2) DEFAULT 0,
    opportunity_score NUMERIC(3,2) DEFAULT 0,
    competition_score NUMERIC(3,2) DEFAULT 0,
    complexity_score NUMERIC(3,2) DEFAULT 0,
    score_explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    scored_at TIMESTAMPTZ,
    
    -- Pipeline status
    enrichment_status enrichment_status NOT NULL DEFAULT 'none',
    audit_status audit_status NOT NULL DEFAULT 'none',
    outreach_status outreach_status NOT NULL DEFAULT 'none',
    proposal_status proposal_status NOT NULL DEFAULT 'none',
    confidence_level confidence_level NOT NULL DEFAULT 'low',
    
    -- Assignment
    owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Organization
    tags TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    
    -- Deduplication
    canonical_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    domain_hash TEXT,  -- Normalized domain for dedup
    
    -- Soft delete
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    
    -- Search job reference
    search_job_id UUID REFERENCES search_jobs(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lead Contacts
CREATE TABLE lead_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    full_name TEXT,
    designation TEXT,
    department TEXT,
    
    email TEXT,
    email_confidence NUMERIC(3,2) DEFAULT 0 CHECK (email_confidence >= 0 AND email_confidence <= 1),
    email_verified_at TIMESTAMPTZ,
    
    phone TEXT,
    phone_type TEXT,  -- office, mobile, etc.
    
    linkedin_url TEXT,
    twitter_url TEXT,
    
    source contact_source NOT NULL DEFAULT 'manual',
    source_url TEXT,
    
    is_decision_maker BOOLEAN NOT NULL DEFAULT false,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    enrichment_provider TEXT,  -- apollo, hunter, manual, etc.
    enrichment_data JSONB,     -- Raw enrichment response
    
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- AUDIT
-- ═══════════════════════════════════════════

CREATE TABLE audit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    template_id TEXT NOT NULL DEFAULT 'standard_v1',
    status audit_report_status NOT NULL DEFAULT 'draft',
    
    -- Module results (array of module objects)
    modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    /*
    Module structure:
    {
        "module_id": "website_quality",
        "module_name": "Website Quality",
        "automation_level": "semi_automated",
        "score": 68,
        "max_score": 100,
        "status": "complete",
        "automated_data": {...},
        "ai_analysis": "...",
        "manual_notes": "...",
        "findings": [...],
        "recommendations": [...],
        "evidence_urls": [...]
    }
    */
    
    summary TEXT,
    quick_wins JSONB NOT NULL DEFAULT '[]'::jsonb,
    thirty_day_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Internal vs client-facing
    internal_notes TEXT,
    client_snapshot JSONB,  -- Formatted for client sharing
    
    -- Exports
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,
    
    created_by UUID REFERENCES user_profiles(id),
    reviewed_by UUID REFERENCES user_profiles(id),
    finalized_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- OUTREACH
-- ═══════════════════════════════════════════

CREATE TABLE outreach_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES lead_contacts(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    channel outreach_channel NOT NULL DEFAULT 'email',
    template_type template_type NOT NULL DEFAULT 'cold_email',
    
    subject TEXT,
    body TEXT NOT NULL,
    
    -- Context
    personalization_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_used JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Approval workflow
    status draft_status NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    
    -- Sending
    sent_at TIMESTAMPTZ,
    send_provider TEXT,  -- resend, manual, etc.
    send_result JSONB,
    message_id TEXT,     -- Provider message ID for tracking
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_draft_id UUID REFERENCES outreach_drafts(id),
    
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach Activity tracking
CREATE TABLE outreach_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draft_id UUID NOT NULL REFERENCES outreach_drafts(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL,  -- sent, delivered, opened, clicked, replied, bounced, unsubscribed
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- COMPLIANCE & GOVERNANCE
-- ═══════════════════════════════════════════

CREATE TABLE compliance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    action compliance_action NOT NULL,
    entity_type TEXT NOT NULL,  -- lead, contact, source, outreach, etc.
    entity_id UUID,
    
    actor_id UUID REFERENCES user_profiles(id),
    actor_type TEXT NOT NULL DEFAULT 'user',  -- user, system, automation
    
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_connector_id UUID REFERENCES source_connectors(id),
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NOTE: No updated_at - compliance logs are immutable
);

-- Manual Overrides audit trail
CREATE TABLE manual_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    
    overridden_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppressed/blocked contacts
CREATE TABLE contact_suppressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    email TEXT,
    domain TEXT,
    reason TEXT NOT NULL,  -- unsubscribed, bounced, manual_block, spam_complaint
    
    suppressed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    suppressed_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(workspace_id, email)
);

-- ═══════════════════════════════════════════
-- ORGANIZATION & VIEWS
-- ═══════════════════════════════════════════

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6B7280',
    UNIQUE(workspace_id, name)
);

CREATE TABLE saved_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exported_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    file_name TEXT NOT NULL,
    file_format TEXT NOT NULL,  -- csv, xlsx, json, pdf
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    
    entity_type TEXT NOT NULL,  -- leads, audit, outreach
    filters_used JSONB NOT NULL DEFAULT '{}'::jsonb,
    record_count INTEGER NOT NULL DEFAULT 0,
    
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ  -- Auto-cleanup for storage management
);

-- ═══════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════

-- Leads: Priority sorting
CREATE INDEX idx_leads_workspace_score ON leads(workspace_id, lead_score DESC) WHERE NOT is_archived;
CREATE INDEX idx_leads_workspace_status ON leads(workspace_id, outreach_status, audit_status) WHERE NOT is_archived;
CREATE INDEX idx_leads_workspace_industry ON leads(workspace_id, industry, country) WHERE NOT is_archived;

-- Leads: Array search
CREATE INDEX idx_leads_services ON leads USING GIN(likely_service_needed) WHERE NOT is_archived;
CREATE INDEX idx_leads_tags ON leads USING GIN(tags) WHERE NOT is_archived;

-- Leads: Fuzzy search
CREATE INDEX idx_leads_company_trgm ON leads USING GIN(company_name gin_trgm_ops);

-- Leads: Deduplication
CREATE INDEX idx_leads_domain_hash ON leads(workspace_id, domain_hash) WHERE domain_hash IS NOT NULL;

-- Leads: Discovery date
CREATE INDEX idx_leads_discovered ON leads(workspace_id, discovered_at DESC) WHERE NOT is_archived;

-- Contacts
CREATE INDEX idx_contacts_lead ON lead_contacts(lead_id);
CREATE INDEX idx_contacts_dm ON lead_contacts(lead_id, is_decision_maker) WHERE is_decision_maker = true;
CREATE INDEX idx_contacts_email ON lead_contacts(workspace_id, email) WHERE email IS NOT NULL;

-- Audit reports
CREATE INDEX idx_audits_lead ON audit_reports(lead_id);
CREATE INDEX idx_audits_workspace_status ON audit_reports(workspace_id, status);

-- Outreach
CREATE INDEX idx_outreach_lead ON outreach_drafts(lead_id);
CREATE INDEX idx_outreach_workspace_status ON outreach_drafts(workspace_id, status);
CREATE INDEX idx_outreach_activity_draft ON outreach_activity(draft_id, occurred_at DESC);

-- Search jobs
CREATE INDEX idx_jobs_workspace_status ON search_jobs(workspace_id, status);

-- Compliance logs (append-only, query by time)
CREATE INDEX idx_compliance_workspace_time ON compliance_logs(workspace_id, created_at DESC);
CREATE INDEX idx_compliance_entity ON compliance_logs(entity_type, entity_id);

-- Source connectors
CREATE INDEX idx_sources_workspace ON source_connectors(workspace_id, is_enabled);

-- Suppressions
CREATE INDEX idx_suppressions_email ON contact_suppressions(workspace_id, email);
CREATE INDEX idx_suppressions_domain ON contact_suppressions(workspace_id, domain);

-- ═══════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all mutable tables
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_icps_updated BEFORE UPDATE ON ideal_customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sources_updated BEFORE UPDATE ON source_connectors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON search_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON lead_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_audits_updated BEFORE UPDATE ON audit_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_outreach_updated BEFORE UPDATE ON outreach_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_views_updated BEFORE UPDATE ON saved_views FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Domain hash function for deduplication
CREATE OR REPLACE FUNCTION compute_domain_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.website IS NOT NULL THEN
        NEW.domain_hash = MD5(
            LOWER(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(NEW.website, '^https?://(www\.)?', ''),
                    '/.*$', ''
                )
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_domain_hash BEFORE INSERT OR UPDATE OF website ON leads FOR EACH ROW EXECUTE FUNCTION compute_domain_hash();

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideal_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_crawl_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exported_files ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- Workspace-scoped policies (members can access their workspace data)
CREATE POLICY "Members access workspace" ON workspaces FOR ALL USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Generic workspace-scoped read policy template
-- Applied to all workspace-scoped tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'ideal_customer_profiles', 'source_connectors', 'search_jobs',
        'leads', 'lead_contacts', 'audit_reports', 'outreach_drafts',
        'outreach_activity', 'compliance_logs', 'manual_overrides',
        'contact_suppressions', 'tags', 'saved_views', 'exported_files'
    ]
    LOOP
        EXECUTE format(
            'CREATE POLICY "Workspace member access" ON %I FOR ALL USING (
                workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
            )',
            tbl
        );
    END LOOP;
END $$;

-- source_crawl_runs access through search_jobs
CREATE POLICY "Workspace member access crawl runs" ON source_crawl_runs FOR ALL USING (
    search_job_id IN (
        SELECT id FROM search_jobs WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    )
);

-- ═══════════════════════════════════════════
-- SEED DATA: DEFAULT SOURCE CONNECTORS
-- ═══════════════════════════════════════════

-- These are templates; actual workspace-specific connectors are created on setup
-- Note: This is for documentation purposes; in production, seeds run per-workspace

COMMENT ON TABLE leads IS 'Core lead records with scoring, status tracking, and deduplication support';
COMMENT ON TABLE source_connectors IS 'Registered data sources with compliance controls and rate limits';
COMMENT ON TABLE compliance_logs IS 'Immutable audit trail for all data access and processing operations';
COMMENT ON TABLE lead_contacts IS 'Decision-maker contacts with confidence scoring and source tracking';
COMMENT ON TABLE audit_reports IS 'Digital presence audit reports with modular structure';
COMMENT ON TABLE outreach_drafts IS 'Outreach message drafts with approval workflow';
COMMENT ON COLUMN leads.score_explanation IS 'JSON object with per-dimension scoring rationale';
COMMENT ON COLUMN leads.source_evidence IS 'Raw evidence from source: screenshots, snippets, query results';
COMMENT ON COLUMN leads.canonical_id IS 'Self-referencing FK for deduplication merge chains';
COMMENT ON COLUMN source_connectors.trust_score IS 'Admin-assigned trust score from 0.00 to 1.00';
