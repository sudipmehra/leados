# leados
Lead Intelligence + Audit Outreach OS (codename: LeadOS) is a compliance-first lead discovery,  qualification, audit, and outreach workspace purpose-built for digital marketing and growth  agencies.

LEAD INTELLIGENCE +
AUDIT OUTREACH OS
Product Requirements Document & Technical Specification
Version 1.0  |  March 2026
Prepared for: Cognegiac Solution Pvt. Ltd.
Classification: Internal / Confidential
TABLE OF CONTENTS
A. Product Definition
B. Research-Backed Recommendations
C. Information Architecture & User Flow
D. Database Schema
E. Scoring Engine Design
F. Audit Engine Design
G. Outreach Engine Design
H. Technical Architecture
I. UI/UX Specification
J. Build Plan & Roadmap
K. Code Scaffold Specification
L. MVP Feature List & Developer Handoff
A. PRODUCT DEFINITION
What the Product Is
Lead Intelligence + Audit Outreach OS (codename: LeadOS) is a compliance-first lead discovery, qualification, audit, and outreach workspace purpose-built for digital marketing and growth agencies. It replaces fragmented spreadsheet + manual research workflows with a structured, scored, and auditable pipeline from prospect discovery through outreach.

Who It Is For
Digital marketing agencies (10-100 person teams)
Performance marketing consultancies
SEO/SEM agencies seeking new client acquisition
Branding and creative agencies doing outbound
Growth consultants and freelance strategists
Agency founders and business development leads

Core Use Cases
Discover businesses actively looking for marketing services through public demand signals
Normalize and score discovered leads into a structured, prioritized pipeline
Prepare lightweight pre-sales audits of a prospect's digital presence
Draft personalized outreach messages with audit findings attached
Track the pipeline from discovery through proposal submission
Export leads and audit reports for team collaboration

MVP vs Phase 2 vs Phase 3


Key Constraints & Compliance Principles
All data sourced from publicly accessible, compliant channels only
Source-governed architecture: each connector defines allowed fields, crawl rules, rate limits, and trust scores
robots.txt and Terms of Service respected for all crawled sources
Contact data enrichment through approved API providers only (never fabricated)
All outreach starts as a human-reviewable draft; no automatic sending
Compliance audit log retained for every lead record
LinkedIn data accessed only through official API or manual entry, never scraped
Decision-maker identification through public business directories and team pages only
Admin can disable/block any source at any time
B. RESEARCH-BACKED RECOMMENDATIONS
Recommended Stack


Where Scraping Should NOT Be Used
LinkedIn: Strictly prohibited. Use LinkedIn API or manual entry only.
Facebook/Instagram: Platform ToS prohibit scraping. Use Meta Business API if available.
Google search results: Use Google Custom Search API instead.
Twitter/X: Use official API (v2) for public post search.
Glassdoor, Indeed, private job boards: ToS typically prohibit automated access.
Any source with explicit anti-scraping terms: Default to API or manual entry.

Where APIs/Enrichment Providers Are Better
Company data enrichment: Clearbit, Apollo, or People Data Labs provide structured company data with clear licensing.
Email verification: Hunter.io, ZeroBounce, or NeverBounce for email confidence scoring.
Contact discovery: Apollo.io provides compliant professional contact data with opt-out mechanisms.
Domain/SEO data: Ahrefs API, Moz API, or SimilarWeb for website audit signals.
Technology detection: BuiltWith or Wappalyzer APIs for tech stack analysis.
Social presence: Official platform APIs (where available) for follower counts and activity.

How to Avoid Brittle Architecture
Source connector abstraction: Every data source is a plugin with a defined interface (fetch, normalize, validate, rate-limit).
Graceful degradation: If a source fails, the system continues with remaining sources and flags the failure.
Enrichment as optional layers: Core lead records work without enrichment; enrichment adds fields progressively.
Deduplication at ingestion: Canonical company merging prevents duplicate pipeline entries.
Schema versioning: Database migrations tracked and reversible.
Feature flags: New sources and features can be enabled/disabled without deployment.
C. INFORMATION ARCHITECTURE & USER FLOW
End-to-End Flow
The system follows a linear pipeline with parallel workspaces:

1. CONFIGURE: Define ICP (Ideal Customer Profile) with service needs, industry, geography, company size, and intent keywords.
2. DISCOVER: Run search jobs against configured source connectors. Each connector follows its own compliance rules.
3. NORMALIZE: Raw discoveries are cleaned, deduplicated, and stored as structured lead records.
4. SCORE: The priority engine evaluates each lead across 6 dimensions and produces a composite score.
5. AUDIT: For high-priority leads, generate a lightweight digital presence audit.
6. DRAFT: Create personalized outreach messages using audit findings and lead context.
7. REVIEW: Human reviews all drafts, edits as needed, approves for sending.
8. SEND/EXPORT: Deliver via Resend or export for external CRM/email tools.
9. TRACK: Monitor outreach activity, follow-ups, and pipeline progression.

Screen Map

D. DATABASE SCHEMA
Core Tables Overview
The schema is designed for PostgreSQL (Supabase) with Row Level Security. All tables include created_at, updated_at timestamps and soft-delete support.

users


workspaces


ideal_customer_profiles


source_connectors


search_jobs


leads (core table)


lead_contacts


audit_reports


outreach_drafts


Additional Tables
outreach_activity: Tracks opens, replies, bounces per sent message
compliance_logs: Immutable log of every source access, crawl, and data processing action
exported_files: Registry of all exports with format, date, and download URL
manual_overrides: Audit trail of all manual edits to scores, statuses, or contacts
tags: Workspace-scoped tag definitions for leads
saved_views: Stored filter/sort configurations for the pipeline table
source_crawl_runs: Per-run log for each source connector execution

Key Indexes
leads: (workspace_id, lead_score DESC) for priority sorting
leads: (workspace_id, industry, country) for filtered discovery
leads: GIN index on tags, likely_service_needed for array containment queries
leads: trigram index on company_name for fuzzy search
lead_contacts: (lead_id, is_decision_maker) for contact lookup
search_jobs: (workspace_id, status) for job monitoring
compliance_logs: (workspace_id, created_at DESC) for audit trail
E. SCORING ENGINE DESIGN
Scoring Dimensions
Each lead is evaluated across 6 dimensions on a 0-100 scale. Each dimension has a configurable weight that sums to 1.0 for the final composite score.



Composite Score Formula
Final Priority Score = (Intent x 0.25) + (Fit x 0.20) + (Accessibility x 0.15) + (Opportunity x 0.20) + (Competition x 0.10) + (Complexity x 0.10)

Note: Competition and Complexity are inverse-scored. A LOWER competition environment produces a HIGHER competition score. A SIMPLER engagement produces a HIGHER complexity score. This ensures all dimensions align directionally: higher = better.

Score Explanation Layer
Every score stores a JSON explanation object:

{ "intent": { "score": 85, "reasons": ["RFP explicitly requests SEO services", "Posted within last 7 days", "Budget range mentioned"] }, "fit": { "score": 72, "reasons": ["SaaS industry matches ICP", "India geography matches", "Company size: 50-200 employees"] }, ... }

Score Examples

F. AUDIT ENGINE DESIGN
Automation Levels


Audit Template Structure
Each audit module follows a consistent structure:
Module name and description
Automated data points (populated by system)
AI-generated analysis (editable by user)
Manual observation fields (free text)
Score or rating (1-5 or pass/fail)
Recommendations (editable list)
Evidence links and screenshots (attachable)

Audit Output Formats
Internal Summary: Full detailed audit with all notes and scores for team use
Client Snapshot: Polished, abbreviated version focusing on findings and opportunities
PDF Export: Branded PDF suitable for email attachment
Proposal Input: Structured data that feeds into the outreach and proposal engines
G. OUTREACH ENGINE DESIGN
Data Requirements for Personalization
Company name and website
Contact name and designation
Industry and geography
Specific need or demand signal
Audit findings (if audit completed)
Quick-win recommendations
Source of discovery (for context)
Any public context about the company (recent news, growth signals)

Template Types


Review and Approval Flow
1. System generates draft using template + lead data + audit findings
2. Draft enters 'pending_review' status and appears in the Outreach Studio
3. User reviews, edits, personalizes the draft
4. User clicks 'Approve' which moves status to 'approved'
5. Approved drafts can be sent via Resend integration or copied for manual sending
6. All sent messages are logged with timestamp, channel, and delivery status

Anti-Spam and Approval Safeguards
No automatic sending: Every message requires explicit human approval
Rate limiting: Maximum sends per day configurable at workspace level
Duplicate detection: System warns if a contact has been messaged within a configurable window
Unsubscribe handling: System tracks opt-outs and blocks re-contact
Approval chain: Managers can require review before team members send
Compliance logging: Every sent message logged with full context
H. TECHNICAL ARCHITECTURE
System Architecture Layers
Architecture Diagram (text representation):

[Browser/Client] <-> [Next.js App (Vercel)] <-> [Supabase (Postgres + Auth + Storage + Edge Functions)]
                                             <-> [n8n Workflow Engine]
                                             <-> [Resend Email API]
                                             <-> [Enrichment APIs (Apollo/Hunter/PDL)]
                                             <-> [Crawler Workers (rate-limited, compliance-aware)]

Frontend Structure
Next.js 14+ with App Router for file-based routing
TypeScript throughout for type safety
Tailwind CSS + shadcn/ui for design system
React Query (TanStack Query) for server state management
Zustand for client-side state (UI state, filters)
React Hook Form + Zod for form handling and validation
Recharts for data visualization
React Email for outreach template previews

Backend Structure
Supabase PostgreSQL as primary data store
Row Level Security (RLS) for workspace-level data isolation
Supabase Auth for authentication (email/password + Google OAuth)
Supabase Edge Functions for serverless API endpoints
Next.js API Routes for complex business logic
Supabase Realtime for live discovery progress updates

Crawler/Connector Architecture
Each source connector is a module implementing the SourceConnector interface:

interface SourceConnector { name: string; type: SourceType; crawlMethod: CrawlMethod; config: ConnectorConfig; validateCompliance(): Promise<ComplianceResult>; fetchLeads(query: ICPQuery): Promise<RawLead[]>; normalizeLeads(raw: RawLead[]): Lead[]; getRateLimit(): RateLimit; getTrustScore(): number; }

Connectors are registered in the source_connectors table and loaded dynamically. Each connector manages its own rate limiting, error handling, and compliance validation.

Queue/Jobs Architecture
Discovery jobs: Queued via Supabase Edge Functions, processed with concurrency limits
Enrichment jobs: Background enrichment via API calls, results written back to leads table
Audit generation: Triggered per-lead, runs automated checks and stores results
Email sending: Queued with rate limiting, processed via Resend API
Export generation: Background file creation, stored in Supabase Storage

Security Model
Authentication: Supabase Auth with JWT tokens
Authorization: RLS policies enforce workspace-level data isolation
API key storage: Encrypted at rest in workspace settings (Supabase Vault)
Rate limiting: Per-user and per-workspace limits on API calls
CORS: Strict origin policies on all API endpoints
Input validation: Zod schemas on all API inputs
Audit trail: Immutable compliance_logs table for all data operations
I. UI/UX SPECIFICATION
Design Direction
Style: Modern SaaS, clean information hierarchy, light theme with subtle depth
Typography: Geist Sans for headings, system sans-serif for body
Colors: Deep navy primary (#0F172A), teal accent (#0EA5E9), warm grays for surfaces
Layout: Sidebar navigation, content area with card/table layouts, slide-out drawers for detail
Interactions: Smooth transitions, skeleton loading states, keyboard navigation support
Density: Comfortable spacing for scanning, compact mode toggle for power users

Page-by-Page Description

Dashboard: Command center with 4 stat cards (total leads, qualified, audited, outreach sent), recent leads table, pending actions queue, source health indicators, and a pipeline funnel visualization.

ICP Builder: Multi-step form with service category checkboxes, industry autocomplete, geography map/picker, company size slider, keyword tag input, intent phrase builder, and a preview of matching criteria.

Source Configuration: Grid of source cards showing name, type, trust score badge, compliance status indicator, last crawl time, and toggle switch. Clicking opens a detail panel with rate limits, allowed fields, and crawl history.

Discovery Run: Launch panel with ICP selector and source checklist. After launch, shows a live progress view with per-source progress bars, discovered count ticker, and a streaming results preview table.

Lead Pipeline: Full-width data table with columns for company, score, industry, geography, service needed, status, and actions. Supports column sorting, faceted filtering, bulk selection, export, and saved views. Click-to-expand rows reveal a detail drawer.

Lead Detail: Side drawer (or full page) with tabs: Overview (company info, scores, need summary), Contacts (decision-maker cards), Audit (embedded audit workspace), Outreach (draft history), Activity (timeline of all actions).

Audit Workspace: Module-based layout where each audit section is a collapsible card. Automated findings are pre-populated; manual sections have rich text editors. A sidebar shows the overall audit health score and export options.

Outreach Studio: Template selector on the left, live preview on the right. Variable chips show personalization fields. Bottom bar has Save Draft, Submit for Review, and Send buttons with status indicators.

States
Empty States: Illustrated placeholders with actionable CTAs (e.g., 'No leads yet. Create an ICP and run your first discovery.')
Loading States: Skeleton screens for tables and cards, progress indicators for long operations
Error States: Inline error messages with retry actions, toast notifications for transient errors
Success States: Subtle success toasts, status badge updates, confetti for milestone achievements
J. BUILD PLAN & ROADMAP
Phase 1: MVP (Weeks 1-10)


Phase 2: Automation (Weeks 11-18)


Phase 3: Scale (Weeks 19-30)


What to Mock First
Source connectors: Use mock data generators that return realistic lead objects before building real connectors
Enrichment: Mock enrichment responses to build the UI flow before subscribing to APIs
Audit automation: Use static example data for audit modules before integrating Lighthouse/PageSpeed
Email sending: Log to console/database before connecting Resend

What to Productionize Later
Real source crawling: Only after compliance layer is thoroughly tested
Email deliverability optimization: After basic sending works
Semantic search: After core keyword search is stable
n8n workflows: After manual workflows are validated by users
K. CODE SCAFFOLD SPECIFICATION
Folder Structure
lead-os/
  src/
    app/ (Next.js App Router)
      (auth)/ - login, signup, forgot-password
      (dashboard)/ - layout with sidebar
        dashboard/ - main dashboard page
        leads/ - pipeline table, [id]/ detail page
        discovery/ - ICP builder, run launcher, results
        audit/ - [leadId]/ audit workspace
        outreach/ - draft studio, templates
        sources/ - source configuration
        exports/ - export center
        reports/ - analytics dashboard
        settings/ - workspace, team, integrations, compliance
      api/ - Next.js API routes
    components/ - Reusable UI components
      ui/ - shadcn/ui base components
      leads/ - Lead-specific components
      audit/ - Audit module components
      outreach/ - Outreach components
      scoring/ - Score display components
      layout/ - Sidebar, header, navigation
    lib/ - Core business logic
      scoring/ - Scoring engine
      audit/ - Audit engine
      connectors/ - Source connector modules
      enrichment/ - Enrichment provider integrations
      outreach/ - Template engine, draft generator
      compliance/ - Compliance validation, logging
    types/ - TypeScript type definitions
    hooks/ - Custom React hooks
    utils/ - Utility functions
    config/ - Configuration constants
  supabase/ - Database migrations, seed data, edge functions
  n8n/ - Workflow JSON templates
  tests/ - Test suites

Environment Variables

L. MVP FEATURE LIST & DEVELOPER HANDOFF
MVP Feature Checklist


Developer Handoff Notes
Start with Supabase project setup and run the migration SQL to create all tables
Implement auth flow first; all other features depend on authenticated workspace context
Build the lead pipeline table early since it is the most used screen and validates the data model
Scoring engine should be a pure function module in lib/scoring/ that can be unit tested independently
Audit modules should be pluggable: each module exports a consistent interface (run, render, export)
Use React Query for all data fetching; avoid manual fetch/useEffect patterns
shadcn/ui components should be installed via CLI and customized in components/ui/
All API routes should validate inputs with Zod schemas before processing
Mock all external API calls (enrichment, Lighthouse, etc.) with realistic fixtures during Phase 1
Compliance logging should be implemented from day 1, not retrofitted later

Future Enhancements (Post-MVP)
AI-powered lead scoring that learns from conversion outcomes
Automated competitor analysis module in audits
Multi-channel outreach sequences with automatic follow-up scheduling
Chrome extension for manual lead capture while browsing
Slack integration for lead alerts and team notifications
White-label audit PDF exports with agency branding
Client portal for sharing audit results and proposals
API access for headless lead submission from external tools
Zapier/Make integration for connecting to existing agency tools
Mobile-responsive design for lead review on the go

Final Recommendations

1. MVP Recommendation: Focus on manual lead entry + scoring + audit + outreach drafting. This delivers immediate value without requiring any external API subscriptions. Add automated discovery in Phase 2 once the core workflow is validated.

2. Strongest Technical Stack: Next.js 14 + Supabase + Tailwind + shadcn/ui. This combination provides the fastest path to a production-grade application with authentication, real-time features, and a polished UI out of the box.

3. Fastest Prototype Path: Build the lead pipeline table and scoring engine first. Use mock data to demonstrate the full workflow. This can be demoed within 2-3 weeks and validates the core value proposition.

4. Safest Compliance-First Path: Start with zero scraping. Use manual entry + API enrichment only. Add source connectors incrementally, each with a compliance review before activation. Maintain immutable compliance logs from day 1.

5. Best Long-Term Scalable Path: Invest early in the source connector abstraction layer and the scoring engine modularity. These two systems are the hardest to refactor later. A clean connector interface allows adding new sources without touching core code. A configurable scoring engine allows agencies to tune for their specific ICP without code changes.
