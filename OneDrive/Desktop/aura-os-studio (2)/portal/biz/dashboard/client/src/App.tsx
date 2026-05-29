/* ─────────────────────────────────────────────────────────────
   AURA Client Job Site Portal
   Facebook-style feed · Job site evidence · Milestones · Invoices
   Isolated per client per business. AURA white theme.
───────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Receipt, MapPin, CreditCard, Bell,
  MessageSquare, Search, Plus, MoreHorizontal,
  TrendingUp, CheckCircle2, Clock, ChevronRight, ChevronDown,
  LogOut, Activity, Camera, Zap, DollarSign, Package, Eye,
  X, Building2, Image as ImageIcon, Star, Shield, Hash,
  AlertCircle, Upload, Layers, Calendar, ArrowUpRight,
  HardHat, ThumbsUp, Send, Filter, LayoutGrid, Briefcase,
  Lock, CheckSquare, PlayCircle, Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = (() => {
  const b = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  if (b && b !== "/") return b.replace(/\/[^/]+$/, "");
  return "";
})();

/* ── Types ────────────────────────────────────────────────── */
interface PortalMember { id: string; name: string; email: string; role: string; businessId: string; businessName: string; slug: string; }
interface Job { id: string; title: string; status: string; siteLocation?: string; category?: string; quotedPriceCents?: string; quotedHours?: string; description?: string; createdAt?: string; completedAt?: string; startDate?: string; endDate?: string; }
interface FeedPost { id: string; job_id?: string; client_id?: string; posted_by_type: string; posted_by_name?: string; content?: string; media_url?: string; media_caption?: string; media_tag?: string; milestone_id?: string; is_marketing_ok?: boolean; created_at: string; job_title?: string; job_status?: string; site_location?: string; }
interface Milestone { id: string; job_id: string; job_title?: string; title: string; description?: string; status: string; order_num: number; target_date?: string; completed_at?: string; approved_at?: string; site_location?: string; }
interface Invoice { id: string; invoice_number: string; job_id?: string; job_title?: string; line_items: { description: string; qty: number; unit_price_cents: number }[]; subtotal_cents: number; tax_cents: number; total_cents: number; status: string; due_date?: string; paid_at?: string; created_at: string; notes?: string; }
interface Quote { id: string; order_type: string; status: string; total: string; subtotal: string; tax: string; items_json: { name: string; qty: number; price: number }[]; client_name?: string; due_date?: string; cutoff_time?: string; notes?: string; created_at: string; quote_id?: string; payment_method?: string; }

type Nav = "feed" | "jobs" | "milestones" | "invoices" | "quotes" | "media" | "profile";

/* ── Helpers ──────────────────────────────────────────────── */
const fmtMoney = (cents: number | string | undefined) =>
  cents != null ? `$${(Number(cents) / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "—";
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const JOB_STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  estimate:    { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b", label: "Estimate" },
  approved:    { bg: "#ede9fe", text: "#7c3aed", dot: "#8b5cf6", label: "Approved" },
  in_progress: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e", label: "In Progress" },
  scheduled:   { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6", label: "Scheduled" },
  completed:   { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: "Completed" },
  cancelled:   { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444", label: "Cancelled" },
};

const MEDIA_TAG_COLOR: Record<string, { bg: string; text: string }> = {
  before:   { bg: "#dbeafe", text: "#1d4ed8" },
  progress: { bg: "#ede9fe", text: "#7c3aed" },
  after:    { bg: "#dcfce7", text: "#15803d" },
  issue:    { bg: "#fee2e2", text: "#dc2626" },
  approval: { bg: "#fef9c3", text: "#a16207" },
};

/* ── Avatar ───────────────────────────────────────────────── */
function Avatar({ name, size = 36, bg = "#0f172a" }: { name: string; size?: number; bg?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: size * 0.36, color: "white", letterSpacing: "0.01em" }}>
      {initials}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
interface Props { member: PortalMember; onLogout: () => void; slug: string; businessName: string; }

export default function ClientPortalDashboard({ member, onLogout, slug, businessName }: Props) {
  const [nav, setNav]           = useState<Nav>("feed");
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [feed, setFeed]         = useState<FeedPost[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [media, setMedia]       = useState<FeedPost[]>([]);
  const [quotes, setQuotes]     = useState<Quote[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading]   = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  /* Post composer */
  const [postText, setPostText]       = useState("");
  const [postMedia, setPostMedia]     = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postTag, setPostTag]         = useState("progress");
  const [postJobId, setPostJobId]     = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting]         = useState(false);

  const bizId = member.businessId;
  const clientId = member.id;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/jobs`);
      const d = await r.json();
      setJobs(d.jobs || []);
    } catch {} finally { setLoading(false); }
  }, [bizId, clientId]);

  const fetchFeed = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/feed`);
      const d = await r.json();
      setFeed(Array.isArray(d) ? d : []);
    } catch {}
  }, [bizId, clientId]);

  const fetchInvoices = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/invoices`);
      const d = await r.json();
      setInvoices(Array.isArray(d) ? d : []);
    } catch {}
  }, [bizId, clientId]);

  const fetchMilestones = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/milestones`);
      const d = await r.json();
      setMilestones(Array.isArray(d) ? d : []);
    } catch {}
  }, [bizId, clientId]);

  const fetchMedia = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/media`);
      const d = await r.json();
      setMedia(Array.isArray(d) ? d : []);
    } catch {}
  }, [bizId, clientId]);

  const fetchQuotes = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/quotes`);
      const d = await r.json();
      setQuotes(Array.isArray(d) ? d : []);
    } catch {}
  }, [bizId, clientId]);

  useEffect(() => {
    fetchJobs(); fetchFeed(); fetchInvoices(); fetchMilestones(); fetchMedia(); fetchQuotes();
  }, [fetchJobs, fetchFeed, fetchInvoices, fetchMilestones, fetchMedia, fetchQuotes]);

  useEffect(() => {
    if (nav === "feed") fetchFeed();
    if (nav === "invoices") fetchInvoices();
    if (nav === "milestones") fetchMilestones();
    if (nav === "media") fetchMedia();
    if (nav === "quotes") fetchQuotes();
  }, [nav]);

  const submitPost = async () => {
    if (!postText.trim() && !postMedia.trim()) return;
    setPosting(true);
    try {
      const r = await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: postJobId || undefined,
          content: postText.trim() || undefined,
          media_url: postMedia.trim() || undefined,
          media_caption: postCaption.trim() || undefined,
          media_tag: postTag,
          posted_by_name: member.name,
          is_marketing_ok: true,
        }),
      });
      const post = await r.json();
      setFeed(f => [post, ...f]);
      setPostText(""); setPostMedia(""); setPostCaption(""); setPostJobId(""); setShowComposer(false);
    } catch {} finally { setPosting(false); }
  };

  const approveMilestone = async (milestoneId: string) => {
    await fetch(`${API}/api/portal/${bizId}/clients/${clientId}/milestones/${milestoneId}/approve`, { method: "POST" });
    fetchMilestones();
  };

  const activeJobs    = jobs.filter(j => j.status === "in_progress" || j.status === "approved" || j.status === "scheduled");
  const estimateJobs  = jobs.filter(j => j.status === "estimate");
  const completedJobs = jobs.filter(j => j.status === "completed" || j.status === "cancelled");
  const totalQuoted   = jobs.reduce((s, j) => s + Number(j.quotedPriceCents || 0), 0);
  const paidTotal     = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total_cents || 0), 0);

  /* ── NAV ITEMS ── */
  const NAV_ITEMS: { id: Nav; icon: React.FC<any>; label: string; badge?: number }[] = [
    { id: "feed",       icon: MessageSquare, label: "Job Feed",    badge: feed.filter(p => p.posted_by_type === "employee").length || undefined },
    { id: "jobs",       icon: Briefcase,     label: "My Jobs",     badge: activeJobs.length || undefined },
    { id: "milestones", icon: Flag,          label: "Milestones",  badge: milestones.filter(m => m.status === "awaiting_approval").length || undefined },
    { id: "invoices",   icon: Receipt,       label: "Invoices",    badge: invoices.filter(i => i.status === "sent" || i.status === "overdue").length || undefined },
    { id: "quotes",     icon: FileText,      label: "Quotes & Orders", badge: quotes.filter(q => q.status === "pending").length || undefined },
    { id: "media",      icon: ImageIcon,     label: "Job Media",   badge: media.length || undefined },
    { id: "profile",    icon: Building2,     label: "My Profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", fontFamily: "system-ui,-apple-system,sans-serif", color: "#0f172a" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isScrolled ? "rgba(255,255,255,0.95)" : "white",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: isScrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
        padding: "0 20px", height: 56,
        display: "flex", alignItems: "center", gap: 16,
        transition: "all 0.2s",
      }}>
        {/* AURA brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0f172a,#334155)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.25)" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>AURA</div>
            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: -1 }}>Client Portal</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input placeholder={`Search ${businessName} jobs & docs…`}
            style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12, outline: "none", boxSizing: "border-box", color: "#0f172a" }} />
        </div>

        {/* Business badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <Shield size={12} style={{ color: "#22c55e" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#0f172a" }}>{businessName}</span>
          <span style={{ fontSize: 9, color: "#94a3b8" }}>· Verified</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Notif bell */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setNotifOpen(v => !v)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={16} style={{ color: "#475569" }} />
          </button>
          {(estimateJobs.length > 0 || milestones.filter(m => m.status === "awaiting_approval").length > 0) && (
            <div style={{ position: "absolute", top: -1, right: -1, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "white" }}>
              {estimateJobs.length + milestones.filter(m => m.status === "awaiting_approval").length}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={member.name} size={34} bg="#0f172a" />
          <div style={{ display: "none" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{member.name}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Client</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px", display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{ width: 240, flexShrink: 0, position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Profile card */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ height: 60, background: "linear-gradient(135deg,#0f172a,#1e293b,#334155)" }} />
            <div style={{ padding: "0 16px 16px", marginTop: -28 }}>
              <Avatar name={member.name} size={52} bg="#0f172a" />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{member.name}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{member.email}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <div style={{ padding: "2px 8px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 9, fontWeight: 800, color: "#15803d" }}>
                    ● Active Client
                  </div>
                  <div style={{ padding: "2px 8px", borderRadius: 99, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 9, fontWeight: 700, color: "#64748b" }}>
                    {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "8px" }}>
            {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => (
              <button key={id} onClick={() => setNav(id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                background: nav === id ? "#f1f5f9" : "transparent",
                color: nav === id ? "#0f172a" : "#64748b",
                fontWeight: nav === id ? 700 : 500, fontSize: 13,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: nav === id ? "#0f172a" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s" }}>
                  <Icon size={15} style={{ color: nav === id ? "white" : "#94a3b8" }} />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {badge != null && (
                  <span style={{ padding: "1px 6px", borderRadius: 99, background: nav === id ? "#0f172a" : "#f1f5f9", color: nav === id ? "white" : "#64748b", fontSize: 9, fontWeight: 800 }}>{badge}</span>
                )}
              </button>
            ))}

            <div style={{ margin: "6px 0", borderTop: "1px solid #f1f5f9" }} />

            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LogOut size={14} style={{ color: "#ef4444" }} />
              </div>
              Sign Out
            </button>
          </div>

          {/* Financial snapshot */}
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 16, padding: "16px", color: "white" }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8", marginBottom: 8 }}>Financial Summary</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>{fmtMoney(totalQuoted)}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12 }}>Total quoted value</div>
            <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: "#64748b" }}>Paid</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#22c55e" }}>{fmtMoney(paidTotal)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#64748b" }}>Outstanding</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{fmtMoney(totalQuoted - paidTotal)}</div>
              </div>
            </div>
          </div>

          {/* Encryption badge */}
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={12} style={{ color: "#22c55e" }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#0f172a" }}>100% Isolated</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Your data is business-private</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ── FEED ── */}
          {nav === "feed" && (
            <>
              {/* Stories bar */}
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                <button onClick={() => setShowComposer(true)} style={{ width: 100, height: 130, borderRadius: 14, border: "2px dashed #cbd5e1", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={16} style={{ color: "#0f172a" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textAlign: "center", lineHeight: 1.2 }}>Post Update</span>
                </button>
                {jobs.map(job => {
                  const s = JOB_STATUS[job.status] || JOB_STATUS.estimate;
                  return (
                    <button key={job.id} onClick={() => { setSelectedJob(job); }}
                      style={{ position: "relative", width: 100, height: 130, borderRadius: 14, border: selectedJob?.id === job.id ? "3px solid #0f172a" : "1px solid #e2e8f0", background: "linear-gradient(135deg,#0f172a,#334155)", overflow: "hidden", cursor: "pointer", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 10, transition: "all 0.15s" }}>
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, boxShadow: `0 0 4px ${s.dot}` }} />
                      </div>
                      <HardHat size={20} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "rgba(255,255,255,0.08)" }} />
                      <div style={{ position: "relative" }}>
                        <div style={{ fontSize: 7, fontWeight: 800, color: s.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</div>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "white", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{job.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Post Composer */}
              <AnimatePresence>
                {showComposer && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 16 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <Avatar name={member.name} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{member.name} · <span style={{ color: "#94a3b8", fontWeight: 500 }}>Client</span></div>
                        <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Share a photo, comment, or question about your job…"
                          rows={3}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", outline: "none", color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit" }} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <input value={postMedia} onChange={e => setPostMedia(e.target.value)} placeholder="Photo URL (optional)"
                        style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", color: "#0f172a" }} />
                      <select value={postJobId} onChange={e => setPostJobId(e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", color: "#0f172a", background: "white" }}>
                        <option value="">No specific job</option>
                        {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                      </select>
                    </div>
                    {postMedia && (
                      <div style={{ marginBottom: 12 }}>
                        <img src={postMedia} alt="preview" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      {["before","progress","after","issue","approval"].map(tag => (
                        <button key={tag} onClick={() => setPostTag(tag)}
                          style={{ padding: "4px 10px", borderRadius: 99, border: `1px solid ${postTag === tag ? "#0f172a" : "#e2e8f0"}`, background: postTag === tag ? "#0f172a" : "transparent", color: postTag === tag ? "white" : "#64748b", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setShowComposer(false)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                      <button onClick={submitPost} disabled={posting || (!postText.trim() && !postMedia.trim())}
                        style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#0f172a", fontSize: 12, fontWeight: 800, color: "white", cursor: "pointer", opacity: posting ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <Send size={12} /> {posting ? "Posting…" : "Post"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick post bar when composer closed */}
              {!showComposer && (
                <div onClick={() => setShowComposer(true)} style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <Avatar name={member.name} size={34} />
                  <div style={{ flex: 1, padding: "8px 14px", borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 13, color: "#94a3b8" }}>
                    Share a job update, photo, or question…
                  </div>
                  <Camera size={16} style={{ color: "#94a3b8" }} />
                  <ImageIcon size={16} style={{ color: "#94a3b8" }} />
                </div>
              )}

              {/* Feed Posts */}
              {feed.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: "50px 20px", textAlign: "center" }}>
                  <MessageSquare size={40} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No posts yet</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Your team will share job updates, progress photos, and milestones here</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {feed.map(post => <FeedPostCard key={post.id} post={post} member={member} />)}
                </div>
              )}
            </>
          )}

          {/* ── JOBS ── */}
          {nav === "jobs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Active", count: activeJobs.length, color: "#22c55e" },
                  { label: "Estimates", count: estimateJobs.length, color: "#f59e0b" },
                  { label: "Completed", count: completedJobs.length, color: "#94a3b8" },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ padding: "8px 16px", borderRadius: 10, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{count} {label}</span>
                  </div>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading jobs…</div>
              ) : jobs.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 50, textAlign: "center" }}>
                  <Briefcase size={36} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No jobs yet</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Service jobs from {businessName} will appear here</p>
                </div>
              ) : (
                jobs.map(job => <JobCard key={job.id} job={job} milestones={milestones.filter(m => m.job_id === job.id)} />)
              )}
            </div>
          )}

          {/* ── MILESTONES ── */}
          {nav === "milestones" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionHeader icon={Flag} title="Project Milestones" subtitle="Track phase-by-phase progress and approve completed stages" />
              {milestones.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 50, textAlign: "center" }}>
                  <Flag size={36} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No milestones set</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Your team will add project phases and milestones here</p>
                </div>
              ) : (
                (() => {
                  const byJob: Record<string, Milestone[]> = {};
                  milestones.forEach(m => { if (!byJob[m.job_id]) byJob[m.job_id] = []; byJob[m.job_id].push(m); });
                  return Object.entries(byJob).map(([jobId, ms]) => (
                    <div key={jobId} style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                        <Briefcase size={14} style={{ color: "#0f172a" }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{ms[0].job_title}</span>
                        {ms[0].site_location && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#94a3b8" }}><MapPin size={10} />{ms[0].site_location}</span>}
                      </div>
                      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {ms.map((m, idx) => <MilestoneRow key={m.id} milestone={m} idx={idx} total={ms.length} onApprove={approveMilestone} />)}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          )}

          {/* ── INVOICES ── */}
          {nav === "invoices" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionHeader icon={Receipt} title="Invoices & Payments" subtitle="Real invoices from your jobs. Review, download, and pay online." />
              {invoices.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 50, textAlign: "center" }}>
                  <Receipt size={36} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No invoices yet</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Invoices from {businessName} will appear here</p>
                </div>
              ) : (
                invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)
              )}
            </div>
          )}

          {/* ── QUOTES & ORDERS ── */}
          {nav === "quotes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionHeader icon={FileText} title="Quotes & Orders" subtitle="Quotes submitted by the team on your behalf, and orders placed for your account" />
              {quotes.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 50, textAlign: "center" }}>
                  <FileText size={36} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No quotes or orders yet</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>When your team submits quotes or orders for your account, they'll appear here</p>
                </div>
              ) : (
                quotes.map(q => {
                  const typeColor: Record<string, { bg: string; text: string }> = {
                    quote:     { bg: "#fef3c7", text: "#d97706" },
                    client:    { bg: "#dbeafe", text: "#1d4ed8" },
                    "next-day":{ bg: "#ede9fe", text: "#7c3aed" },
                    emergency: { bg: "#fee2e2", text: "#dc2626" },
                    employee:  { bg: "#dcfce7", text: "#15803d" },
                    standard:  { bg: "#f1f5f9", text: "#64748b" },
                  };
                  const statusColor: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", fulfilled: "#22c55e", cancelled: "#ef4444" };
                  const tc = typeColor[q.order_type] || typeColor.standard;
                  return (
                    <div key={q.id} style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={18} style={{ color: tc.text }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ padding: "2px 8px", borderRadius: 99, background: tc.bg, color: tc.text, fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>
                              {q.order_type.replace("-", " ")}
                            </span>
                            <span style={{ padding: "2px 8px", borderRadius: 99, background: (statusColor[q.status] || "#94a3b8") + "18", color: statusColor[q.status] || "#94a3b8", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
                              {q.status}
                            </span>
                            {q.quote_id && <span style={{ fontSize: 9, color: "#94a3b8" }}>Ref: {q.quote_id}</span>}
                          </div>
                          {q.notes && <p style={{ margin: "0 0 4px", fontSize: 12, color: "#0f172a" }}>{q.notes}</p>}
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {q.due_date && <span style={{ fontSize: 10, color: "#94a3b8" }}><Calendar size={10} style={{ display: "inline" }} /> Due {fmtDate(q.due_date)}</span>}
                            {q.cutoff_time && <span style={{ fontSize: 10, color: "#94a3b8" }}>Cutoff: {q.cutoff_time}</span>}
                            <span style={{ fontSize: 10, color: "#cbd5e1", marginLeft: "auto" }}>{timeAgo(q.created_at)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>${parseFloat(q.total || "0").toFixed(2)}</div>
                        </div>
                      </div>
                      {(q.items_json || []).length > 0 && (
                        <div style={{ borderTop: "1px solid #f8fafc", paddingTop: 10 }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Line Items</div>
                          {(q.items_json || []).map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc", fontSize: 12 }}>
                              <span style={{ color: "#0f172a" }}>{item.qty}× {item.name}</span>
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>${(item.qty * (item.price || 0)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── MEDIA ── */}
          {nav === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SectionHeader icon={ImageIcon} title="Job Media Gallery" subtitle="All photos from your job sites — before, during, and after" />
              {media.length === 0 ? (
                <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 50, textAlign: "center" }}>
                  <ImageIcon size={36} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No photos yet</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Your team will upload job site photos here as work progresses</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {media.map(m => (
                    <div key={m.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", background: "#f1f5f9" }}>
                      <img src={m.media_url!} alt={m.media_caption || "Job photo"} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)" }} />
                      {m.media_tag && (
                        <div style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", borderRadius: 99, background: (MEDIA_TAG_COLOR[m.media_tag] || MEDIA_TAG_COLOR.progress).bg, color: (MEDIA_TAG_COLOR[m.media_tag] || MEDIA_TAG_COLOR.progress).text, fontSize: 8, fontWeight: 800, textTransform: "uppercase" }}>
                          {m.media_tag}
                        </div>
                      )}
                      {m.is_marketing_ok && (
                        <div style={{ position: "absolute", top: 8, right: 8 }}>
                          <Star size={12} style={{ color: "#f59e0b" }} fill="#f59e0b" />
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px" }}>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "white", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.media_caption || m.job_title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{timeAgo(m.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {nav === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionHeader icon={Building2} title="My Profile" subtitle="Your client account details" />
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <Avatar name={member.name} size={64} bg="#0f172a" />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{member.email}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 10, fontWeight: 800, color: "#15803d" }}>Verified Client</span>
                      <span style={{ padding: "3px 10px", borderRadius: 99, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 10, fontWeight: 700, color: "#64748b" }}>{businessName}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Active Jobs", value: activeJobs.length },
                    { label: "Total Jobs", value: jobs.length },
                    { label: "Pending Invoices", value: invoices.filter(i => i.status === "sent").length },
                    { label: "Photos Shared", value: media.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ── RIGHT RAIL ── */}
        <aside style={{ width: 280, flexShrink: 0, position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Active Job Detail */}
          {selectedJob ? (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", background: "linear-gradient(135deg,#0f172a,#1e293b)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.04em" }}>JOB DETAIL</div>
                <button onClick={() => setSelectedJob(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={14} /></button>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{selectedJob.title}</div>
                    {selectedJob.siteLocation && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 10, color: "#64748b" }}>
                        <MapPin size={10} /> {selectedJob.siteLocation}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "3px 8px", borderRadius: 8, background: (JOB_STATUS[selectedJob.status] || JOB_STATUS.estimate).bg, color: (JOB_STATUS[selectedJob.status] || JOB_STATUS.estimate).text, fontSize: 9, fontWeight: 800 }}>
                    {(JOB_STATUS[selectedJob.status] || JOB_STATUS.estimate).label}
                  </div>
                </div>
                {selectedJob.description && <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{selectedJob.description}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {selectedJob.quotedPriceCents && (
                    <div style={{ padding: "10px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700, marginBottom: 2 }}>QUOTED</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>{fmtMoney(selectedJob.quotedPriceCents)}</div>
                    </div>
                  )}
                  {selectedJob.quotedHours && (
                    <div style={{ padding: "10px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700, marginBottom: 2 }}>EST. HOURS</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>{selectedJob.quotedHours}h</div>
                    </div>
                  )}
                </div>
                {selectedJob.startDate && (
                  <div style={{ marginTop: 10, fontSize: 10, color: "#64748b" }}>
                    <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />
                    {fmtDate(selectedJob.startDate)} {selectedJob.endDate && `→ ${fmtDate(selectedJob.endDate)}`}
                  </div>
                )}
                {/* Milestones for this job */}
                {milestones.filter(m => m.job_id === selectedJob.id).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Milestones</div>
                    {milestones.filter(m => m.job_id === selectedJob.id).map((m, idx) => (
                      <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: m.status === "completed" || m.status === "approved" ? "#22c55e" : m.status === "in_progress" ? "#3b82f6" : m.status === "awaiting_approval" ? "#f59e0b" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {(m.status === "completed" || m.status === "approved") ? <CheckCircle2 size={10} color="white" /> : <span style={{ fontSize: 8, fontWeight: 900, color: m.status === "pending" ? "#94a3b8" : "white" }}>{idx + 1}</span>}
                        </div>
                        <span style={{ fontSize: 10, color: "#0f172a", fontWeight: m.status === "in_progress" ? 700 : 500 }}>{m.title}</span>
                        {m.status === "awaiting_approval" && (
                          <button onClick={() => approveMilestone(m.id)} style={{ marginLeft: "auto", padding: "2px 7px", borderRadius: 6, border: "none", background: "#0f172a", color: "white", fontSize: 8, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Approve</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", padding: 20, textAlign: "center" }}>
              <Briefcase size={24} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 8px" }} />
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Click a job card to see details</p>
            </div>
          )}

          {/* Pending Approvals */}
          {milestones.filter(m => m.status === "awaiting_approval").length > 0 && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #fde68a", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", background: "#fffbeb", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={14} style={{ color: "#d97706" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#92400e" }}>Awaiting Your Approval</span>
              </div>
              <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {milestones.filter(m => m.status === "awaiting_approval").map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{m.title}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{m.job_title}</div>
                    </div>
                    <button onClick={() => approveMilestone(m.id)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#0f172a", color: "white", fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
                      ✓ Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invoices */}
          {invoices.filter(i => i.status === "sent" || i.status === "overdue").length > 0 && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>Outstanding Invoices</span>
              </div>
              <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {invoices.filter(i => i.status === "sent" || i.status === "overdue").map(inv => (
                  <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>{inv.invoice_number}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{inv.job_title || "General"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: inv.status === "overdue" ? "#ef4444" : "#0f172a" }}>{fmtMoney(inv.total_cents)}</div>
                      <div style={{ fontSize: 9, color: inv.status === "overdue" ? "#ef4444" : "#94a3b8", fontWeight: 700 }}>{inv.status === "overdue" ? "OVERDUE" : "DUE " + fmtDate(inv.due_date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media highlights */}
          {media.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>Recent Photos</span>
                <button onClick={() => setNav("media")} style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              <div style={{ padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                {media.slice(0, 6).map(m => (
                  <div key={m.id} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "#f1f5f9" }}>
                    <img src={m.media_url!} alt={m.media_caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AURA encryption notice */}
          <div style={{ padding: "12px 14px", borderRadius: 14, background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Shield size={14} style={{ color: "#22c55e" }} />
              <span style={{ fontSize: 11, fontWeight: 800 }}>AURA Secure Portal</span>
            </div>
            <p style={{ margin: 0, fontSize: 9, color: "#64748b", lineHeight: 1.5 }}>
              This portal is 100% isolated to your account with {businessName}. No other client can see your jobs, photos, or financial data.
            </p>
          </div>
        </aside>
      </div>

      {/* Notifications dropdown */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: "fixed", top: 64, right: 60, width: 320, borderRadius: 16, background: "white", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Notifications</span>
              <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} style={{ color: "#94a3b8" }} /></button>
            </div>
            {estimateJobs.map(j => (
              <div key={j.id} onClick={() => { setNav("jobs"); setNotifOpen(false); }} style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={13} style={{ color: "#d97706" }} /></div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Quote ready: {j.title}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{fmtMoney(j.quotedPriceCents)} · Awaiting approval</p>
                </div>
              </div>
            ))}
            {milestones.filter(m => m.status === "awaiting_approval").map(m => (
              <div key={m.id} onClick={() => { setNav("milestones"); setNotifOpen(false); }} style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckSquare size={13} style={{ color: "#22c55e" }} /></div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Approve milestone: {m.title}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{m.job_title}</p>
                </div>
              </div>
            ))}
            {estimateJobs.length === 0 && milestones.filter(m => m.status === "awaiting_approval").length === 0 && (
              <p style={{ padding: "24px 16px", margin: 0, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>You're all caught up!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.FC<any>; title: string; subtitle: string }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: 14, background: "white", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} style={{ color: "white" }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function FeedPostCard({ post, member }: { post: FeedPost; member: PortalMember }) {
  const isEmployee = post.posted_by_type === "employee";
  const [liked, setLiked] = useState(false);
  const tagStyle = MEDIA_TAG_COLOR[post.media_tag || "progress"] || MEDIA_TAG_COLOR.progress;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: isEmployee ? "#0f172a" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isEmployee ? <HardHat size={16} color="white" /> : (
              <span style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8" }}>{(post.posted_by_name || "C").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{post.posted_by_name || (isEmployee ? "Team" : "You")}</span>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 99, background: isEmployee ? "#f1f5f9" : "#dbeafe", color: isEmployee ? "#475569" : "#1d4ed8", fontWeight: 700 }}>{isEmployee ? "Team Update" : "Your Post"}</span>
              {post.job_title && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#94a3b8" }}>
                  <Briefcase size={9} /> {post.job_title}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
              {timeAgo(post.created_at)}
              {post.site_location && <span> · <MapPin size={9} style={{ display: "inline" }} /> {post.site_location}</span>}
            </div>
          </div>
          {post.media_tag && (
            <div style={{ padding: "3px 9px", borderRadius: 99, background: tagStyle.bg, color: tagStyle.text, fontSize: 9, fontWeight: 800, textTransform: "uppercase", flexShrink: 0, alignSelf: "flex-start" }}>
              {post.media_tag}
            </div>
          )}
        </div>

        {post.content && (
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#0f172a", lineHeight: 1.6 }}>{post.content}</p>
        )}
      </div>

      {post.media_url && (
        <img src={post.media_url} alt={post.media_caption || "Job photo"}
          style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}

      {post.media_caption && (
        <div style={{ padding: "10px 16px", background: "#f8fafc", fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
          {post.media_caption}
        </div>
      )}

      {post.is_marketing_ok && (
        <div style={{ padding: "6px 16px", background: "#fffbeb", borderTop: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 6 }}>
          <Star size={11} style={{ color: "#f59e0b" }} fill="#f59e0b" />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#92400e" }}>Flagged as marketing-worthy</span>
        </div>
      )}

      <div style={{ padding: "8px 16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 4 }}>
        <button onClick={() => setLiked(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: liked ? "#eff6ff" : "transparent", color: liked ? "#2563eb" : "#64748b", fontSize: 12, fontWeight: liked ? 700 : 500, cursor: "pointer" }}>
          <ThumbsUp size={13} fill={liked ? "#2563eb" : "none"} /> {liked ? "Liked" : "Like"}
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
          <MessageSquare size={13} /> Comment
        </button>
        {post.is_marketing_ok && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#94a3b8" }}>
            <Eye size={11} /> Available for portfolio
          </div>
        )}
      </div>
    </motion.div>
  );
}

function JobCard({ job, milestones }: { job: Job; milestones: Milestone[] }) {
  const [open, setOpen] = useState(false);
  const s = JOB_STATUS[job.status] || JOB_STATUS.estimate;
  const done = milestones.filter(m => m.status === "completed" || m.status === "approved").length;
  const total = milestones.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : (job.status === "completed" ? 100 : 0);

  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {job.status === "completed" ? <CheckCircle2 size={18} style={{ color: s.text }} /> :
           job.status === "in_progress" ? <Activity size={18} style={{ color: s.text }} /> :
           job.status === "estimate" ? <Clock size={18} style={{ color: s.text }} /> :
           <Briefcase size={18} style={{ color: s.text }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{job.title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ padding: "3px 9px", borderRadius: 7, background: s.bg, color: s.text, fontSize: 9, fontWeight: 800 }}>{s.label}</span>
              {job.quotedPriceCents && <span style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>{fmtMoney(job.quotedPriceCents)}</span>}
            </div>
          </div>
          {job.siteLocation && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 10, color: "#94a3b8" }}>
              <MapPin size={10} /> {job.siteLocation}
            </div>
          )}
          {total > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700 }}>Progress</span>
                <span style={{ fontSize: 9, color: "#0f172a", fontWeight: 800 }}>{done}/{total} phases · {pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: pct === 100 ? "#22c55e" : "#0f172a", transition: "width 0.4s" }} />
              </div>
            </div>
          )}
        </div>
        <ChevronDown size={14} style={{ color: "#94a3b8", flexShrink: 0, marginTop: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f1f5f9" }}>
              {job.description && <p style={{ margin: "12px 0 10px", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{job.description}</p>}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {job.quotedHours && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700 }}>EST HOURS</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{job.quotedHours}h</div>
                  </div>
                )}
                {job.startDate && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700 }}>START DATE</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{fmtDate(job.startDate)}</div>
                  </div>
                )}
                {job.endDate && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700 }}>END DATE</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{fmtDate(job.endDate)}</div>
                  </div>
                )}
              </div>
              {milestones.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Phase Milestones</div>
                  {milestones.map((m, idx) => <MilestoneRow key={m.id} milestone={m} idx={idx} total={milestones.length} compact />)}
                </div>
              )}
              {job.status === "estimate" && (
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#fef3c7", border: "1px solid #fde68a" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", marginBottom: 2 }}>Quote Awaiting Approval</div>
                  <div style={{ fontSize: 10, color: "#a16207" }}>Contact {""} to accept or discuss this estimate</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MilestoneRow({ milestone: m, idx, total, onApprove, compact }: { milestone: Milestone; idx: number; total: number; onApprove?: (id: string) => void; compact?: boolean }) {
  const statusDot: Record<string, string> = {
    pending: "#e2e8f0", in_progress: "#3b82f6", awaiting_approval: "#f59e0b", approved: "#22c55e", completed: "#22c55e",
  };
  const statusLabel: Record<string, string> = {
    pending: "Pending", in_progress: "In Progress", awaiting_approval: "Awaiting Approval", approved: "Approved", completed: "Completed",
  };
  const done = m.status === "completed" || m.status === "approved";

  return (
    <div style={{ display: "flex", gap: 10, alignItems: compact ? "center" : "flex-start", padding: compact ? "4px 0" : "8px 0", borderBottom: idx < total - 1 ? "1px solid #f8fafc" : "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#0f172a" : statusDot[m.status] || "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", border: m.status === "in_progress" ? "2px solid #3b82f6" : "none" }}>
          {done ? <CheckCircle2 size={12} color="white" /> : m.status === "in_progress" ? <PlayCircle size={10} color="white" /> : <span style={{ fontSize: 8, fontWeight: 900, color: "#94a3b8" }}>{idx + 1}</span>}
        </div>
        {!compact && idx < total - 1 && <div style={{ width: 1, height: 16, background: "#e2e8f0", margin: "3px 0" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: done ? 600 : 700, color: done ? "#94a3b8" : "#0f172a", textDecoration: done ? "line-through" : "none" }}>{m.title}</span>
          {!compact && (
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: statusDot[m.status] + "20", color: statusDot[m.status], fontWeight: 700 }}>{statusLabel[m.status]}</span>
          )}
          {onApprove && m.status === "awaiting_approval" && (
            <button onClick={() => onApprove(m.id)} style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 8, border: "none", background: "#0f172a", color: "white", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>
              ✓ Approve
            </button>
          )}
        </div>
        {!compact && m.description && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{m.description}</p>}
        {!compact && m.target_date && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>Target: {fmtDate(m.target_date)}</div>}
      </div>
    </div>
  );
}

function InvoiceCard({ invoice: inv }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const statusColor: Record<string, { bg: string; text: string }> = {
    draft:   { bg: "#f1f5f9", text: "#64748b" },
    sent:    { bg: "#dbeafe", text: "#1d4ed8" },
    paid:    { bg: "#dcfce7", text: "#15803d" },
    overdue: { bg: "#fee2e2", text: "#dc2626" },
    void:    { bg: "#f1f5f9", text: "#94a3b8" },
  };
  const sc = statusColor[inv.status] || statusColor.draft;

  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Receipt size={18} style={{ color: sc.text }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{inv.invoice_number}</span>
            <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: sc.bg, color: sc.text, fontWeight: 800 }}>{inv.status.toUpperCase()}</span>
            {inv.job_title && <span style={{ fontSize: 10, color: "#94a3b8" }}>· {inv.job_title}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              {inv.status === "paid" ? `Paid ${fmtDate(inv.paid_at)}` : `Due ${fmtDate(inv.due_date)}`}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: inv.status === "overdue" ? "#dc2626" : "#0f172a", fontFamily: "monospace" }}>{fmtMoney(inv.total_cents)}</div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 16px" }}>
              {/* Line items */}
              {(inv.line_items || []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Line Items</div>
                  {(inv.line_items || []).map((li, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f8fafc", fontSize: 12 }}>
                      <span style={{ color: "#0f172a" }}>{li.qty}× {li.description}</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmtMoney(li.qty * li.unit_price_cents)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>Subtotal: {fmtMoney(inv.subtotal_cents)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Tax: {fmtMoney(inv.tax_cents)}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Total: {fmtMoney(inv.total_cents)}</div>
              </div>
              {inv.notes && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#64748b", fontStyle: "italic" }}>{inv.notes}</p>}
              {inv.status !== "paid" && inv.status !== "void" && (
                <div style={{ marginTop: 14 }}>
                  <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#0f172a", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                    Pay Online · {fmtMoney(inv.total_cents)}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
