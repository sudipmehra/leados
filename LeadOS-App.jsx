import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Filter, ChevronDown, ChevronRight, ChevronLeft, Plus, Download, Settings, BarChart3,
  Target, Zap, Mail, FileText, Globe, Users, Eye, Star, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, AlertCircle, XCircle, MoreHorizontal, ExternalLink, Linkedin,
  Phone, MapPin, Building2, TrendingUp, Shield, Activity, Layers, Send, Copy,
  RefreshCw, PlayCircle, PauseCircle, X, Check, Edit3, Trash2, Archive, Tag,
  Radar, Gauge, Brain, Lightbulb, Megaphone, Palette, Code2, MousePointerClick,
  LayoutDashboard, Compass, Inbox, FileSearch, PenTool, Database, Lock, Bot,
  ChevronUp, Hash, Sparkles, CircleDot, Info, Boxes
} from "lucide-react";

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const T = {
  bg: "#FAFBFC", surface: "#FFFFFF", surfaceAlt: "#F1F5F9",
  border: "#E2E8F0", borderLight: "#F1F5F9",
  primary: "#0F172A", primaryLight: "#1E293B",
  accent: "#0EA5E9", accentLight: "#E0F2FE", accentDark: "#0284C7",
  success: "#10B981", successLight: "#D1FAE5",
  warn: "#F59E0B", warnLight: "#FEF3C7",
  error: "#EF4444", errorLight: "#FEE2E2",
  purple: "#8B5CF6", purpleLight: "#EDE9FE",
  text: "#0F172A", textSecondary: "#64748B", textMuted: "#94A3B8",
  radius: "10px", radiusSm: "6px", radiusLg: "14px",
};

// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════
const MOCK_LEADS = [
  { id: "1", company: "NovaTech Solutions", website: "novatech.io", industry: "SaaS", country: "India", city: "Bangalore", service: ["SEO", "Content Marketing"], trigger: "Posted on Clutch looking for SEO agency", signal: "rfp", discovered: "2026-03-20", leadScore: 87, intent: 92, fit: 85, access: 78, opp: 88, comp: 82, complex: 90, status: "qualified", enrichment: "complete", audit: "complete", outreach: "drafted", contact: { name: "Priya Sharma", title: "VP Marketing", email: "priya@novatech.io", confidence: 0.92, linkedin: "linkedin.com/in/priyasharma" }, explanation: "Strong RFP signal on Clutch with explicit SEO budget mention. SaaS industry aligns with ICP. Decision-maker publicly identified." },
  { id: "2", company: "GreenLeaf Organics", website: "greenleaforganics.com", industry: "D2C / FMCG", country: "India", city: "Mumbai", service: ["Social Media", "Performance Marketing"], trigger: "Forum post asking for social media agency recommendations", signal: "forum_post", discovered: "2026-03-19", leadScore: 74, intent: 78, fit: 72, access: 65, opp: 75, comp: 88, complex: 72, status: "new", enrichment: "partial", audit: "none", outreach: "none", contact: { name: "Rohan Mehta", title: "Founder", email: "rohan@greenleaf.com", confidence: 0.78, linkedin: "" }, explanation: "Active forum inquiry for social media help. D2C brand with growth signals. Moderate competition in organic food niche." },
  { id: "3", company: "Apex Financial Advisors", website: "apexfa.in", industry: "Financial Services", country: "India", city: "Delhi NCR", service: ["Website Revamp", "SEO"], trigger: "Outdated website detected with no mobile responsiveness", signal: "website_signal", discovered: "2026-03-18", leadScore: 69, intent: 60, fit: 80, access: 70, opp: 72, comp: 65, complex: 68, status: "qualified", enrichment: "complete", audit: "in_progress", outreach: "none", contact: { name: "Vikram Singh", title: "Managing Director", email: "vikram@apexfa.in", confidence: 0.85, linkedin: "linkedin.com/in/vikramsingh" }, explanation: "Website quality signals indicate strong need for revamp. Financial services industry is a good fit. Decision-maker identified through public team page." },
  { id: "4", company: "CloudPeak Analytics", website: "cloudpeak.co", industry: "Data Analytics", country: "USA", city: "Austin", service: ["PPC", "Lead Generation"], trigger: "Job posting for Growth Marketing Manager", signal: "job_listing", discovered: "2026-03-17", leadScore: 63, intent: 55, fit: 68, access: 55, opp: 80, comp: 60, complex: 55, status: "new", enrichment: "none", audit: "none", outreach: "none", contact: { name: "", title: "", email: "", confidence: 0, linkedin: "" }, explanation: "Job posting suggests they are building marketing capability. High opportunity score due to company size and funding signals. Contact not yet enriched." },
  { id: "5", company: "Urbane Interiors", website: "urbaneinteriors.com", industry: "Home & Living", country: "India", city: "Hyderabad", service: ["Branding", "Social Media", "Content Marketing"], trigger: "Instagram post asking followers for agency recommendations", signal: "social_post", discovered: "2026-03-21", leadScore: 81, intent: 88, fit: 76, access: 82, opp: 70, comp: 90, complex: 85, status: "qualified", enrichment: "complete", audit: "none", outreach: "none", contact: { name: "Ananya Reddy", title: "Creative Director", email: "ananya@urbane.com", confidence: 0.88, linkedin: "linkedin.com/in/ananyareddy" }, explanation: "Direct social media post requesting agency help. Multi-service need (branding + social + content). Low competition in interior design niche." },
  { id: "6", company: "FitTrack Pro", website: "fittrackpro.app", industry: "Health & Fitness", country: "India", city: "Pune", service: ["Performance Marketing", "SEO"], trigger: "Posted budget for digital marketing on public procurement board", signal: "rfp", discovered: "2026-03-15", leadScore: 91, intent: 95, fit: 90, access: 85, opp: 92, comp: 78, complex: 88, status: "qualified", enrichment: "complete", audit: "complete", outreach: "sent", contact: { name: "Arjun Patel", title: "CEO", email: "arjun@fittrackpro.app", confidence: 0.95, linkedin: "linkedin.com/in/arjunpatel" }, explanation: "Explicit RFP with budget allocation. Health-tech with strong product-market fit signals. CEO directly accessible. High conversion probability." },
  { id: "7", company: "Meridian Legal Partners", website: "meridianlegal.in", industry: "Legal Services", country: "India", city: "Chennai", service: ["Website Revamp", "Content Marketing"], trigger: "Competitor analysis shows no online presence", signal: "website_signal", discovered: "2026-03-16", leadScore: 58, intent: 45, fit: 65, access: 60, opp: 55, comp: 75, complex: 50, status: "new", enrichment: "partial", audit: "none", outreach: "none", contact: { name: "Deepa Krishnan", title: "Senior Partner", email: "", confidence: 0.40, linkedin: "" }, explanation: "Weak online presence compared to competitors. Legal services industry growing in digital adoption. Contact identification difficult." },
  { id: "8", company: "SnapCart Technologies", website: "snapcart.tech", industry: "E-commerce", country: "Singapore", city: "Singapore", service: ["SEO", "PPC", "Performance Marketing"], trigger: "Community post about scaling from 10K to 100K users", signal: "forum_post", discovered: "2026-03-20", leadScore: 77, intent: 80, fit: 82, access: 70, opp: 85, comp: 55, complex: 72, status: "qualified", enrichment: "complete", audit: "none", outreach: "drafted", contact: { name: "Wei Lin", title: "Head of Growth", email: "wei@snapcart.tech", confidence: 0.90, linkedin: "linkedin.com/in/weilin" }, explanation: "Clear growth intent. E-commerce with strong fit for performance marketing. SEA market with moderate competition." },
];

const SOURCES = [
  { id: "1", name: "Clutch.co", type: "directory", trust: 0.92, status: "approved", method: "api", lastCrawl: "2h ago", leads: 342 },
  { id: "2", name: "Reddit (r/marketing)", type: "forum", trust: 0.75, status: "approved", method: "api", lastCrawl: "4h ago", leads: 128 },
  { id: "3", name: "Upwork Public Listings", type: "job_board", trust: 0.80, status: "approved", method: "html_parse", lastCrawl: "1h ago", leads: 256 },
  { id: "4", name: "Google Custom Search", type: "api", trust: 0.95, status: "approved", method: "api", lastCrawl: "30m ago", leads: 891 },
  { id: "5", name: "IndiaMART", type: "directory", trust: 0.70, status: "review", method: "html_parse", lastCrawl: "6h ago", leads: 67 },
  { id: "6", name: "ProductHunt", type: "directory", trust: 0.85, status: "approved", method: "api", lastCrawl: "3h ago", leads: 45 },
];

const AUDIT_MODULES = [
  { name: "Website Quality", score: 68, status: "auto", items: ["Performance: 72/100", "Accessibility: 65/100", "Best Practices: 78/100", "SEO: 82/100"] },
  { name: "SEO Basics", score: 45, status: "auto", items: ["Missing H1 on 3 pages", "No meta descriptions on 5 pages", "Sitemap present", "robots.txt configured"] },
  { name: "Technical SEO", score: 52, status: "auto", items: ["HTTPS: Yes", "Mobile-friendly: Partial", "Core Web Vitals: Needs improvement", "Structured data: Missing"] },
  { name: "Social Presence", score: 60, status: "semi", items: ["Instagram: Active (2.3K followers)", "LinkedIn: Present but inactive", "Twitter: Not found", "Facebook: Present"] },
  { name: "Content Review", score: 35, status: "ai", items: ["Blog last updated 4 months ago", "No content calendar visible", "Topic coverage is narrow", "No video content"] },
  { name: "Conversion Funnel", score: 40, status: "manual", items: ["No clear CTA above fold", "Contact form buried on page 5", "No lead magnets", "No chatbot or live support"] },
];

// ═══════════════════════════════════════════
// STYLE HELPERS
// ═══════════════════════════════════════════
const scoreColor = (s) => s >= 80 ? T.success : s >= 60 ? T.accent : s >= 40 ? T.warn : T.error;
const scoreBg = (s) => s >= 80 ? T.successLight : s >= 60 ? T.accentLight : s >= 40 ? T.warnLight : T.errorLight;
const statusConfig = {
  new: { color: T.textMuted, bg: T.surfaceAlt, icon: CircleDot, label: "New" },
  qualified: { color: T.accent, bg: T.accentLight, icon: CheckCircle2, label: "Qualified" },
  audited: { color: T.purple, bg: T.purpleLight, icon: FileSearch, label: "Audited" },
  contacted: { color: T.success, bg: T.successLight, icon: Send, label: "Contacted" },
};
const signalLabels = { rfp: "RFP / Procurement", forum_post: "Forum Post", job_listing: "Job Listing", social_post: "Social Post", website_signal: "Website Signal", directory: "Directory Listing" };

// ═══════════════════════════════════════════
// MICRO COMPONENTS
// ═══════════════════════════════════════════
function Badge({ children, color = T.textSecondary, bg = T.surfaceAlt, style = {} }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: "0.02em", ...style }}>{children}</span>;
}

function ScorePill({ score, size = "md" }) {
  const s = size === "sm" ? { fontSize: 11, padding: "1px 6px", minWidth: 28 } : { fontSize: 13, padding: "3px 10px", minWidth: 36 };
  return <span style={{ ...s, display: "inline-flex", justifyContent: "center", borderRadius: 6, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: scoreColor(score), background: scoreBg(score) }}>{score}</span>;
}

function IconBtn({ icon: Icon, onClick, active, size = 18, tooltip }) {
  return <button onClick={onClick} title={tooltip} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: T.radiusSm, border: "none", background: active ? T.accentLight : "transparent", color: active ? T.accent : T.textSecondary, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => { if(!active) e.target.style.background = T.surfaceAlt; }} onMouseLeave={e => { if(!active) e.target.style.background = "transparent"; }}><Icon size={size} /></button>;
}

function Btn({ children, variant = "primary", onClick, icon: Icon, style = {}, small }) {
  const variants = {
    primary: { bg: T.primary, color: "#fff", border: "none" },
    accent: { bg: T.accent, color: "#fff", border: "none" },
    outline: { bg: "transparent", color: T.text, border: `1px solid ${T.border}` },
    ghost: { bg: "transparent", color: T.textSecondary, border: "none" },
    success: { bg: T.success, color: "#fff", border: "none" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "5px 10px" : "7px 14px", borderRadius: T.radiusSm, fontSize: small ? 12 : 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: v.bg, color: v.color, border: v.border, ...style }}
      onMouseEnter={e => { e.target.style.opacity = "0.9"; }} onMouseLeave={e => { e.target.style.opacity = "1"; }}>
      {Icon && <Icon size={small ? 13 : 15} />}{children}
    </button>
  );
}

function Card({ children, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 20, ...style }}>{children}</div>;
}

function StatCard({ label, value, change, changeDir = "up", icon: Icon, color = T.accent }) {
  return (
    <Card style={{ flex: 1, minWidth: 180 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
          {change && <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 6, fontSize: 12, fontWeight: 600, color: changeDir === "up" ? T.success : T.error }}>
            {changeDir === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}
          </div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: T.radiusSm, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </Card>
  );
}

function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: T.radiusSm, border: "none", background: active ? T.primary : "transparent", color: active ? "#fff" : T.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
      {label}{count !== undefined && <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: active ? "rgba(255,255,255,0.2)" : T.surfaceAlt }}>{count}</span>}
    </button>
  );
}

function ProgressBar({ value, color = T.accent, height = 6 }) {
  return <div style={{ width: "100%", height, borderRadius: height, background: T.surfaceAlt, overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", borderRadius: height, background: color, transition: "width 0.5s ease" }} /></div>;
}

// ═══════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════
function Sidebar({ activeView, setActiveView }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "leads", label: "Lead Pipeline", icon: Inbox },
    { id: "audit", label: "Audit Studio", icon: FileSearch },
    { id: "outreach", label: "Outreach", icon: PenTool },
    { id: "sources", label: "Sources", icon: Database },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <div style={{ width: 220, minWidth: 220, height: "100vh", background: T.primary, display: "flex", flexDirection: "column", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}, #6366F1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radar size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>LeadOS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.05em" }}>INTELLIGENCE + OUTREACH</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(item => {
          const active = activeView === item.id;
          return (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: active ? "rgba(255,255,255,0.1)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s", width: "100%" }}
              onMouseEnter={e => { if(!active) e.target.style.background = "rgba(255,255,255,0.05)"; }} onMouseLeave={e => { if(!active) e.target.style.background = "transparent"; }}>
              <item.icon size={17} />{item.label}
              {item.id === "leads" && <span style={{ marginLeft: "auto", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: T.accent, color: "#fff" }}>8</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #EF4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>S</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Sudip</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Cognegiac</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════
function DashboardView({ setActiveView }) {
  const recentLeads = MOCK_LEADS.slice(0, 5);
  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>Pipeline overview and pending actions</p>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Leads" value="847" change="+23 this week" icon={Users} color={T.accent} />
        <StatCard label="Qualified" value="312" change="+12 this week" icon={Target} color={T.success} />
        <StatCard label="Audits Done" value="48" change="+5 this week" icon={FileSearch} color={T.purple} />
        <StatCard label="Outreach Sent" value="156" change="+18 this week" icon={Send} color="#F59E0B" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>Top Priority Leads</h3>
            <Btn variant="ghost" small onClick={() => setActiveView("leads")}>View All <ChevronRight size={13} /></Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentLeads.map(lead => (
              <div key={lead.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: T.radiusSm, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <ScorePill score={lead.leadScore} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.company}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{lead.service.join(", ")}</div>
                </div>
                <Badge color={statusConfig[lead.status]?.color} bg={statusConfig[lead.status]?.bg}>{statusConfig[lead.status]?.label}</Badge>
                <div style={{ fontSize: 11, color: T.textMuted, minWidth: 50, textAlign: "right" }}>{lead.discovered.slice(5)}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 14px" }}>Pending Actions</h3>
            {[
              { label: "Review 3 new leads", icon: Eye, color: T.accent },
              { label: "Complete audit for Apex FA", icon: FileSearch, color: T.purple },
              { label: "Send outreach to SnapCart", icon: Send, color: T.success },
              { label: "Follow up with FitTrack", icon: RefreshCw, color: T.warn },
            ].map((action, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${action.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><action.icon size={14} color={action.color} /></div>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{action.label}</span>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 14px" }}>Source Health</h3>
            {SOURCES.slice(0, 4).map(src => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: src.status === "approved" ? T.success : T.warn }} />
                <span style={{ flex: 1, fontSize: 12, color: T.text }}>{src.name}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>{src.lastCrawl}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LEAD PIPELINE VIEW
// ═══════════════════════════════════════════
function LeadPipelineView({ onSelectLead }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let result = [...MOCK_LEADS];
    if (search) result = result.filter(l => l.company.toLowerCase().includes(search.toLowerCase()) || l.industry.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") result = result.filter(l => l.status === statusFilter);
    result.sort((a, b) => {
      const key = sortBy === "score" ? "leadScore" : sortBy === "date" ? "discovered" : "company";
      const mul = sortDir === "desc" ? -1 : 1;
      return key === "company" ? mul * a[key].localeCompare(b[key]) : key === "discovered" ? mul * a[key].localeCompare(b[key]) : mul * (a[key] - b[key]);
    });
    return result;
  }, [search, statusFilter, sortBy, sortDir]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Lead Pipeline</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>{filtered.length} leads in pipeline</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" icon={Download} small>Export</Btn>
          <Btn variant="accent" icon={Plus} small>Add Lead</Btn>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, background: T.surfaceAlt, borderRadius: T.radiusSm, padding: "6px 10px" }}>
            <Search size={15} color={T.textMuted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, industries..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: T.text, width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ id: "all", label: "All" }, { id: "new", label: "New" }, { id: "qualified", label: "Qualified" }].map(f => (
              <Tab key={f.id} label={f.label} active={statusFilter === f.id} onClick={() => setStatusFilter(f.id)} count={f.id === "all" ? MOCK_LEADS.length : MOCK_LEADS.filter(l => l.status === f.id).length} />
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {[
                  { label: "Score", key: "score", width: 70 },
                  { label: "Company", key: "company", width: 200 },
                  { label: "Industry", key: "industry", width: 130 },
                  { label: "Location", key: "location", width: 130 },
                  { label: "Services Needed", key: "services", width: 180 },
                  { label: "Signal", key: "signal", width: 130 },
                  { label: "Status", key: "status", width: 100 },
                  { label: "Contact", key: "contact", width: 120 },
                  { label: "", key: "actions", width: 40 },
                ].map(col => (
                  <th key={col.key} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", cursor: col.key !== "actions" ? "pointer" : "default", width: col.width, whiteSpace: "nowrap" }}
                    onClick={() => { if (col.key === "score") { setSortBy("score"); setSortDir(d => d === "desc" ? "asc" : "desc"); } }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      {col.label}
                      {col.key === "score" && sortBy === "score" && (sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} onClick={() => onSelectLead(lead)} style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 12px" }}><ScorePill score={lead.leadScore} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: T.text }}>{lead.company}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{lead.website}</div>
                  </td>
                  <td style={{ padding: "10px 12px", color: T.textSecondary }}>{lead.industry}</td>
                  <td style={{ padding: "10px 12px", color: T.textSecondary }}><span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><MapPin size={12} />{lead.city}, {lead.country}</span></td>
                  <td style={{ padding: "10px 12px" }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{lead.service.map(s => <Badge key={s} color={T.accent} bg={T.accentLight}>{s}</Badge>)}</div></td>
                  <td style={{ padding: "10px 12px" }}><Badge>{signalLabels[lead.signal]}</Badge></td>
                  <td style={{ padding: "10px 12px" }}><Badge color={statusConfig[lead.status]?.color} bg={statusConfig[lead.status]?.bg}>{statusConfig[lead.status]?.label}</Badge></td>
                  <td style={{ padding: "10px 12px" }}>
                    {lead.contact.name ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{lead.contact.name}</div>
                        <div style={{ fontSize: 10, color: T.textMuted }}>{lead.contact.title}</div>
                      </div>
                    ) : <span style={{ fontSize: 11, color: T.textMuted }}>Not enriched</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}><IconBtn icon={MoreHorizontal} size={15} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// LEAD DETAIL DRAWER
// ═══════════════════════════════════════════
function LeadDetailDrawer({ lead, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!lead) return null;
  const dims = [
    { label: "Intent", value: lead.intent, icon: Zap },
    { label: "Fit", value: lead.fit, icon: Target },
    { label: "Access", value: lead.access, icon: Users },
    { label: "Opportunity", value: lead.opp, icon: TrendingUp },
    { label: "Competition", value: lead.comp, icon: Shield },
    { label: "Complexity", value: lead.complex, icon: Layers },
  ];
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 520, height: "100vh", background: T.surface, borderLeft: `1px solid ${T.border}`, boxShadow: "-8px 0 30px rgba(0,0,0,0.08)", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ScorePill score={lead.leadScore} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>{lead.company}</h2>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{lead.website} &middot; {lead.industry} &middot; {lead.city}</div>
        </div>
        <IconBtn icon={X} onClick={onClose} />
      </div>

      <div style={{ display: "flex", gap: 4, padding: "10px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
        {["overview", "scoring", "audit", "outreach", "contact"].map(t => (
          <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Need Summary</div>
              <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>{lead.trigger}</p>
            </Card>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Why This Lead Ranks High</div>
              <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>{lead.explanation}</p>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Signal Type", value: signalLabels[lead.signal] },
                { label: "Discovered", value: lead.discovered },
                { label: "Enrichment", value: lead.enrichment },
                { label: "Audit Status", value: lead.audit },
              ].map(item => (
                <Card key={item.label} style={{ padding: 12 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginTop: 4, textTransform: "capitalize" }}>{item.value}</div>
                </Card>
              ))}
            </div>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Services Needed</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{lead.service.map(s => <Badge key={s} color={T.accent} bg={T.accentLight} style={{ fontSize: 12, padding: "4px 10px" }}>{s}</Badge>)}</div>
            </Card>
          </div>
        )}

        {tab === "scoring" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Final Priority Score</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor(lead.leadScore), fontVariantNumeric: "tabular-nums" }}>{lead.leadScore}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>out of 100</div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {dims.map(dim => (
                <Card key={dim.label} style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <dim.icon size={14} color={T.textMuted} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{dim.label}</span>
                    </div>
                    <ScorePill score={dim.value} size="sm" />
                  </div>
                  <ProgressBar value={dim.value} color={scoreColor(dim.value)} />
                </Card>
              ))}
            </div>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Score Rationale</div>
              <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>{lead.explanation}</p>
            </Card>
          </div>
        )}

        {tab === "audit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lead.audit === "none" ? (
              <Card style={{ padding: 40, textAlign: "center" }}>
                <FileSearch size={40} color={T.textMuted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>No Audit Yet</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Generate a digital presence audit for this lead</div>
                <Btn variant="accent" icon={Sparkles}>Generate Audit</Btn>
              </Card>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Audit Modules</div>
                  <Btn variant="outline" icon={Download} small>Export PDF</Btn>
                </div>
                {AUDIT_MODULES.map(mod => (
                  <Card key={mod.name} style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{mod.name}</span>
                        <Badge color={mod.status === "auto" ? T.accent : mod.status === "ai" ? T.purple : T.warn} bg={mod.status === "auto" ? T.accentLight : mod.status === "ai" ? T.purpleLight : T.warnLight}>
                          {mod.status === "auto" ? "Automated" : mod.status === "ai" ? "AI-Assisted" : mod.status === "semi" ? "Semi-Auto" : "Manual"}
                        </Badge>
                      </div>
                      <ScorePill score={mod.score} size="sm" />
                    </div>
                    <ProgressBar value={mod.score} color={scoreColor(mod.score)} height={4} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
                      {mod.items.map((item, i) => (
                        <div key={i} style={{ fontSize: 11, color: T.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 3, height: 3, borderRadius: "50%", background: T.textMuted }} />{item}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "outreach" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Draft Outreach</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {["Cold Intro", "Audit Offer", "Follow-up", "LinkedIn Connect"].map(t => (
                  <Btn key={t} variant="outline" small>{t}</Btn>
                ))}
              </div>
              <div style={{ background: T.surfaceAlt, borderRadius: T.radiusSm, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 4 }}>Subject: Quick SEO audit of {lead.website} — 3 quick wins inside</div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
{`Hi ${lead.contact.name || "[Name]"},

I came across ${lead.company} while researching ${lead.industry.toLowerCase()} companies investing in digital growth.

I noticed a few opportunities on your site that could improve your search visibility. We put together a quick audit snapshot — the highlights:

• ${lead.audit !== "none" ? "SEO basics score: 45/100 — several quick fixes available" : "Your site has room for improvement in core web vitals"}
• Content freshness could be improved
• Conversion path has some gaps worth addressing

Would it be helpful if I shared the full findings? No strings attached — just thought it might be useful.

Best,
Sudip
Cognegiac Solution Pvt. Ltd.`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn variant="outline" icon={Edit3} small>Edit</Btn>
                <Btn variant="outline" icon={Copy} small>Copy</Btn>
                <Btn variant="success" icon={Check} small>Approve & Queue</Btn>
              </div>
            </Card>
            {lead.outreach === "sent" && (
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Outreach Activity</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <CheckCircle2 size={14} color={T.success} />
                  <span style={{ fontSize: 12, color: T.text }}>Cold intro sent on Mar 16</span>
                  <Badge color={T.success} bg={T.successLight}>Delivered</Badge>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <Eye size={14} color={T.accent} />
                  <span style={{ fontSize: 12, color: T.text }}>Opened on Mar 17</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "contact" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {lead.contact.name ? (
              <Card style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {lead.contact.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{lead.contact.name}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{lead.contact.title} at {lead.company}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <Badge color={T.text}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{lead.contact.confidence >= 0.9 ? <CheckCircle2 size={10} color={T.success} /> : <AlertCircle size={10} color={T.warn} />} Confidence: {Math.round(lead.contact.confidence * 100)}%</span>
                      </Badge>
                      <Badge color={lead.contact.email ? T.success : T.textMuted} bg={lead.contact.email ? T.successLight : T.surfaceAlt}>{lead.contact.email ? "Email found" : "No email"}</Badge>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {lead.contact.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textSecondary }}>
                          <Mail size={13} color={T.textMuted} />{lead.contact.email}
                        </div>
                      )}
                      {lead.contact.linkedin && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.accent }}>
                          <Linkedin size={13} />{lead.contact.linkedin}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${T.borderLight}`, marginTop: 14, paddingTop: 12, fontSize: 11, color: T.textMuted }}>
                  <Lock size={10} style={{ marginRight: 4 }} />Source: Public team page &middot; Enriched via Apollo API
                </div>
              </Card>
            ) : (
              <Card style={{ padding: 40, textAlign: "center" }}>
                <Users size={40} color={T.textMuted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>No Contact Identified</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Run enrichment to find decision-makers</div>
                <Btn variant="accent" icon={Search}>Enrich Contact</Btn>
              </Card>
            )}
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Suggested Roles to Target</div>
              {["Founder / CEO", "VP Marketing", "Head of Growth", "Digital Marketing Manager", "Brand Manager"].map(role => (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12, color: T.textSecondary }}>
                  <CircleDot size={10} color={T.textMuted} />{role}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DISCOVERY VIEW
// ═══════════════════════════════════════════
function DiscoveryView() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (running && progress < 100) {
      const t = setTimeout(() => setProgress(p => Math.min(p + Math.random() * 15, 100)), 800);
      return () => clearTimeout(t);
    }
    if (progress >= 100) setRunning(false);
  }, [running, progress]);

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>Discovery Engine</h1>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px" }}>Search for leads matching your Ideal Customer Profile</p>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>ICP Configuration</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "Services", value: "SEO, Performance Marketing, Content" },
            { label: "Industries", value: "SaaS, E-commerce, D2C" },
            { label: "Geography", value: "India, Singapore, UAE" },
            { label: "Company Size", value: "Small, Medium" },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{f.label}</div>
              <div style={{ padding: "8px 10px", background: T.surfaceAlt, borderRadius: T.radiusSm, fontSize: 13, color: T.text }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Intent Keywords</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["looking for SEO agency", "need digital marketing help", "hiring marketing agency", "RFP marketing services", "social media agency recommendations"].map(kw => (
              <Badge key={kw} color={T.accent} bg={T.accentLight} style={{ padding: "4px 8px" }}>{kw}</Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Active Sources</div>
          <Btn variant="ghost" small>Manage Sources</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {SOURCES.filter(s => s.status === "approved").map(src => (
            <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: T.surfaceAlt, borderRadius: T.radiusSm }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.success }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{src.name}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>Trust: {Math.round(src.trust * 100)}%</div>
              </div>
              <Check size={14} color={T.success} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <Btn variant={running ? "outline" : "accent"} icon={running ? PauseCircle : PlayCircle} onClick={() => { if (!running) { setProgress(0); setRunning(true); } else setRunning(false); }}>
          {running ? "Pause Discovery" : progress >= 100 ? "Run Again" : "Start Discovery"}
        </Btn>
        {(running || progress > 0) && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: T.textSecondary }}>{running ? "Searching across 5 sources..." : progress >= 100 ? "Discovery complete" : "Paused"}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} color={progress >= 100 ? T.success : T.accent} />
          </div>
        )}
      </div>

      {progress >= 100 && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>Discovery Results</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ textAlign: "center", padding: 10, background: T.surfaceAlt, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>23</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Raw Leads</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: T.successLight, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.success }}>14</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Qualified</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: T.warnLight, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.warn }}>6</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Duplicates</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: T.errorLight, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.error }}>3</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Rejected</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary }}>14 new leads have been added to your pipeline. Review and score them in the Lead Pipeline.</div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SOURCES VIEW
// ═══════════════════════════════════════════
function SourcesView() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Source Configuration</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>Manage compliant data sources and connectors</p>
        </div>
        <Btn variant="accent" icon={Plus} small>Add Source</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {SOURCES.map(src => (
          <Card key={src.id} style={{ cursor: "pointer", transition: "border-color 0.15s", borderColor: T.border }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.accent} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{src.name}</div>
                <Badge color={T.textMuted} style={{ marginTop: 4 }}>{src.type.replace("_", " ")}</Badge>
              </div>
              <Badge color={src.status === "approved" ? T.success : T.warn} bg={src.status === "approved" ? T.successLight : T.warnLight}>
                {src.status === "approved" ? <><CheckCircle2 size={10} /> Approved</> : <><AlertCircle size={10} /> Review</>}
              </Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Trust Score", value: `${Math.round(src.trust * 100)}%` },
                { label: "Method", value: src.method.replace("_", " ").toUpperCase() },
                { label: "Total Leads", value: src.leads.toString() },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textMuted }}>
              <Clock size={11} />Last crawl: {src.lastCrawl}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// AUDIT STUDIO VIEW
// ═══════════════════════════════════════════
function AuditStudioView() {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>Audit Studio</h1>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px" }}>Generate and manage digital presence audits</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <StatCard label="Audits Complete" value="48" icon={FileSearch} color={T.purple} />
        <StatCard label="In Progress" value="5" icon={Clock} color={T.warn} />
        <StatCard label="Avg Score" value="54" icon={Gauge} color={T.accent} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Recent Audits</div>
        {MOCK_LEADS.filter(l => l.audit !== "none").map(lead => (
          <div key={lead.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <ScorePill score={lead.leadScore} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{lead.company}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{lead.website}</div>
            </div>
            <Badge color={lead.audit === "complete" ? T.success : T.warn} bg={lead.audit === "complete" ? T.successLight : T.warnLight}>
              {lead.audit === "complete" ? "Complete" : "In Progress"}
            </Badge>
            <div style={{ fontSize: 11, color: T.textMuted }}>{lead.discovered}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// OUTREACH VIEW
// ═══════════════════════════════════════════
function OutreachView() {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>Outreach Studio</h1>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px" }}>Draft, review, and manage outreach messages</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <StatCard label="Drafts" value="12" icon={Edit3} color={T.textSecondary} />
        <StatCard label="Pending Review" value="4" icon={Clock} color={T.warn} />
        <StatCard label="Sent" value="156" icon={Send} color={T.success} />
        <StatCard label="Replied" value="23" icon={Mail} color={T.accent} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Outreach Queue</div>
          <Btn variant="accent" icon={PenTool} small>New Draft</Btn>
        </div>
        {MOCK_LEADS.filter(l => l.outreach !== "none").map(lead => (
          <div key={lead.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{lead.company}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{lead.contact.name || "No contact"} &middot; {lead.contact.email || "No email"}</div>
            </div>
            <Badge color={lead.outreach === "sent" ? T.success : lead.outreach === "drafted" ? T.warn : T.textMuted} bg={lead.outreach === "sent" ? T.successLight : lead.outreach === "drafted" ? T.warnLight : T.surfaceAlt}>
              {lead.outreach.charAt(0).toUpperCase() + lead.outreach.slice(1)}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// REPORTS VIEW
// ═══════════════════════════════════════════
function ReportsView() {
  const funnelData = [
    { label: "Discovered", value: 847, width: 100, color: T.surfaceAlt, textColor: T.text },
    { label: "Qualified", value: 312, width: 75, color: T.accentLight, textColor: T.accent },
    { label: "Audited", value: 48, width: 40, color: T.purpleLight, textColor: T.purple },
    { label: "Outreach Sent", value: 156, width: 55, color: T.warnLight, textColor: "#D97706" },
    { label: "Replied", value: 23, width: 20, color: T.successLight, textColor: T.success },
    { label: "Converted", value: 8, width: 12, color: T.success, textColor: "#fff" },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>Reports</h1>
      <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px" }}>Pipeline analytics and performance metrics</p>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 20 }}>Pipeline Funnel</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {funnelData.map(stage => (
            <div key={stage.label} style={{ width: `${stage.width}%`, minWidth: 120, padding: "10px 16px", background: stage.color, borderRadius: T.radiusSm, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <span style={{ fontSize: 12, fontWeight: 600, color: stage.textColor }}>{stage.label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: stage.textColor, fontVariantNumeric: "tabular-nums" }}>{stage.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Source Performance</div>
          {SOURCES.slice(0, 4).map(src => (
            <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500 }}>{src.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{src.leads}</span>
              <div style={{ width: 80 }}><ProgressBar value={src.leads / 8.91} color={T.accent} height={4} /></div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Industry Breakdown</div>
          {[
            { industry: "SaaS", count: 234, pct: 28 },
            { industry: "E-commerce", count: 189, pct: 22 },
            { industry: "D2C / FMCG", count: 145, pct: 17 },
            { industry: "Financial Services", count: 98, pct: 12 },
            { industry: "Health & Fitness", count: 87, pct: 10 },
          ].map(item => (
            <div key={item.industry} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500 }}>{item.industry}</span>
              <span style={{ fontSize: 12, color: T.textMuted }}>{item.pct}%</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, minWidth: 30, textAlign: "right" }}>{item.count}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SETTINGS VIEW
// ═══════════════════════════════════════════
function SettingsView() {
  const [settingsTab, setSettingsTab] = useState("general");
  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 20px" }}>Settings</h1>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["general", "scoring", "integrations", "compliance", "team"].map(t => (
          <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={settingsTab === t} onClick={() => setSettingsTab(t)} />
        ))}
      </div>
      {settingsTab === "general" && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Workspace Settings</div>
          {[
            { label: "Workspace Name", value: "Cognegiac Growth OS" },
            { label: "Default Geography", value: "India, UAE, Singapore" },
            { label: "Max Sends/Day", value: "50" },
            { label: "Duplicate Window", value: "30 days" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ fontSize: 13, color: T.textSecondary }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.value}</span>
            </div>
          ))}
        </Card>
      )}
      {settingsTab === "scoring" && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Scoring Weights</div>
          {[
            { dim: "Intent Score", weight: 0.25 },
            { dim: "Fit Score", weight: 0.20 },
            { dim: "Accessibility Score", weight: 0.15 },
            { dim: "Opportunity Score", weight: 0.20 },
            { dim: "Competition Score", weight: 0.10 },
            { dim: "Complexity Score", weight: 0.10 },
          ].map(item => (
            <div key={item.dim} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ flex: 1, fontSize: 13, color: T.text }}>{item.dim}</span>
              <ProgressBar value={item.weight * 100} color={T.accent} height={4} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text, minWidth: 40, textAlign: "right" }}>{(item.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 11, color: T.textMuted }}>Weights must sum to 100%. Adjust to match your agency priorities.</div>
        </Card>
      )}
      {settingsTab === "integrations" && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>API Integrations</div>
          {[
            { name: "Resend (Email)", status: "connected", icon: Mail },
            { name: "Apollo.io (Enrichment)", status: "not_connected", icon: Users },
            { name: "Hunter.io (Email Verify)", status: "not_connected", icon: Search },
            { name: "Google PageSpeed API", status: "connected", icon: Globe },
            { name: "n8n Workflows", status: "not_connected", icon: Zap },
          ].map(item => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <item.icon size={16} color={T.textMuted} />
              <span style={{ flex: 1, fontSize: 13, color: T.text }}>{item.name}</span>
              <Badge color={item.status === "connected" ? T.success : T.textMuted} bg={item.status === "connected" ? T.successLight : T.surfaceAlt}>
                {item.status === "connected" ? "Connected" : "Not Connected"}
              </Badge>
              <Btn variant="ghost" small>{item.status === "connected" ? "Configure" : "Connect"}</Btn>
            </div>
          ))}
        </Card>
      )}
      {settingsTab === "compliance" && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Compliance Log</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: T.accentLight, borderRadius: T.radiusSm, marginBottom: 14 }}>
            <Shield size={16} color={T.accent} />
            <span style={{ fontSize: 12, color: T.accent, fontWeight: 500 }}>All source access and data processing operations are logged immutably.</span>
          </div>
          {[
            { action: "Crawl completed: Clutch.co", time: "2 hours ago", type: "crawl" },
            { action: "Lead enriched via Apollo API: NovaTech Solutions", time: "3 hours ago", type: "enrichment" },
            { action: "Source disabled by admin: IndiaMART", time: "1 day ago", type: "admin" },
            { action: "robots.txt validated: ProductHunt", time: "2 days ago", type: "compliance" },
            { action: "Outreach sent: FitTrack Pro (approved by Sudip)", time: "3 days ago", type: "outreach" },
          ].map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: log.type === "crawl" ? T.accent : log.type === "enrichment" ? T.purple : log.type === "admin" ? T.warn : log.type === "compliance" ? T.success : T.textMuted }} />
              <span style={{ flex: 1, fontSize: 12, color: T.text }}>{log.action}</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>{log.time}</span>
            </div>
          ))}
        </Card>
      )}
      {settingsTab === "team" && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>Team Members</div>
          {[
            { name: "Sudip", role: "Admin", email: "sudip@cognegiac.com" },
            { name: "Abhishek Banerjee", role: "Admin", email: "abhishek@cognegiac.com" },
          ].map(member => (
            <div key={member.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{member.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{member.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{member.email}</div>
              </div>
              <Badge>{member.role}</Badge>
            </div>
          ))}
          <Btn variant="outline" icon={Plus} small style={{ marginTop: 12 }}>Invite Member</Btn>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function LeadOS() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedLead, setSelectedLead] = useState(null);

  const handleSelectLead = useCallback((lead) => setSelectedLead(lead), []);
  const handleCloseLead = useCallback(() => setSelectedLead(null), []);

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <Sidebar activeView={activeView} setActiveView={(v) => { setActiveView(v); setSelectedLead(null); }} />
      <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {activeView === "dashboard" && <DashboardView setActiveView={setActiveView} />}
        {activeView === "leads" && <LeadPipelineView onSelectLead={handleSelectLead} />}
        {activeView === "discovery" && <DiscoveryView />}
        {activeView === "sources" && <SourcesView />}
        {activeView === "audit" && <AuditStudioView />}
        {activeView === "outreach" && <OutreachView />}
        {activeView === "reports" && <ReportsView />}
        {activeView === "settings" && <SettingsView />}
      </main>
      {selectedLead && <LeadDetailDrawer lead={selectedLead} onClose={handleCloseLead} />}
    </div>
  );
}
