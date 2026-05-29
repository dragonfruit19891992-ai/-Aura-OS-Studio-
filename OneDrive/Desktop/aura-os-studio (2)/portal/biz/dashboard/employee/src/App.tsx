/* ─────────────────────────────────────────────────────────────
   EmployeePortalDashboard — Cinematic staff portal
   Real GPS tracking · Live map · HR data · Radio · Wages
───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, LogOut, MapPin, Activity, Clock, Shield, Radio,
  DollarSign, Briefcase, ChevronRight, Bell, User, Map,
  CheckCircle2, FileText, Wifi, WifiOff, AlertCircle, Star,
  Building2, Calendar, Phone, Hash, ArrowUpRight, Loader2,
} from "lucide-react";

const API = (() => {
  const b = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  if (b && b !== "/") return b.replace(/\/[^/]+$/, "");
  return "";
})();

interface PortalMember { id: string; name: string; email: string; role: string; department?: string; businessId: string; businessName: string; slug: string; }
interface HREmployee { id: string; name: string; role: string; department?: string; hourlyRate?: number; payType?: string; radioExt?: string; phone?: string; hiredAt?: string; status?: string; notes?: string; isOwner?: string; isPinned?: string; }
interface MemberLocation { id: string; name: string; role: string; department?: string; lat: string; lng: string; lastLogin?: string; }

type Tab = "dashboard" | "map" | "profile" | "schedule";

interface Props { member: PortalMember; onLogout: () => void; slug: string; }

export default function EmployeePortalDashboard({ member, onLogout, slug }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [hrData, setHrData] = useState<{ member: PortalMember; employee: HREmployee | null } | null>(null);
  const [locations, setLocations] = useState<MemberLocation[]>([]);
  const [tracking, setTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/portal/${member.businessId}/members/${member.id}/hr-profile`)
      .then(r => r.json())
      .then(d => setHrData(d))
      .catch(() => {});
  }, [member]);

  const sendLocation = useCallback(async (lat: number, lng: number) => {
    lastPos.current = { lat, lng };
    await fetch(`${API}/api/portal/${member.businessId}/members/${member.id}/location`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    }).catch(() => {});
  }, [member]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setTracking(false); return; }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    );
    locationInterval.current = setInterval(() => {
      if (lastPos.current) sendLocation(lastPos.current.lat, lastPos.current.lng);
    }, 30000);
  }, [sendLocation]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (locationInterval.current) clearInterval(locationInterval.current);
    setTracking(false);
    await fetch(`${API}/api/portal/${member.businessId}/members/${member.id}/location/clear`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}",
    }).catch(() => {});
  }, [member]);

  useEffect(() => {
    startTracking();
    return () => { stopTracking(); };
  }, [startTracking, stopTracking]);

  const fetchLocations = useCallback(() => {
    fetch(`${API}/api/portal/${member.businessId}/active-locations`)
      .then(r => r.json())
      .then(d => setLocations(d.locations || []))
      .catch(() => {});
  }, [member]);

  useEffect(() => {
    fetchLocations();
    const t = setInterval(fetchLocations, 15000);
    return () => clearInterval(t);
  }, [fetchLocations]);

  const handleLogout = async () => {
    await stopTracking();
    onLogout();
  };

  useEffect(() => {
    if (tab !== "map") return;
    if (typeof window === "undefined") return;

    const initMap = () => {
      if (!mapRef.current) return;
      const L = (window as any).L;
      if (!L) return;
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }

      const style = document.createElement("style");
      style.textContent = `
        .emp-map .leaflet-container { background:#0f172a !important; }
        .emp-map .leaflet-control-attribution { display:none !important; }
        .emp-map .leaflet-control-zoom { border:none !important; background:rgba(15,23,42,0.9) !important; border-radius:10px !important; overflow:hidden; }
        .emp-map .leaflet-control-zoom a { color:#a5b4fc !important; background:transparent !important; border:none !important; border-bottom:1px solid rgba(255,255,255,0.07) !important; width:30px !important; height:30px !important; line-height:30px !important; }
        .emp-map .leaflet-popup-content-wrapper { background:rgba(2,6,23,0.97) !important; border:1px solid rgba(99,102,241,0.4) !important; border-radius:14px !important; color:#fff !important; backdrop-filter:blur(20px); }
        .emp-map .leaflet-popup-tip { background:rgba(2,6,23,0.97) !important; }
        .emp-map .leaflet-popup-close-button { color:#475569 !important; }
        .emp-pulse { animation: empPulse 2s ease-in-out infinite; }
        @keyframes empPulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.4); opacity:0.6; } }
      `;
      document.head.appendChild(style);

      const center = lastPos.current
        ? [lastPos.current.lat, lastPos.current.lng]
        : [45.4215, -75.6972];

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
      leafletMapRef.current = map;

      const maptilerKey = import.meta.env.NEXT_PUBLIC_MAPTILER_KEY || "";
      if (maptilerKey) {
        L.tileLayer(`https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${maptilerKey}`, { maxZoom: 20 }).addTo(map);
      } else {
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }).addTo(map);
      }

      map.setView(center as [number, number], 14);
      updateMarkers(map, L);
    };

    const updateMarkers = (map: any, L: any) => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      locations.forEach(loc => {
        const isMe = loc.id === member.id;
        const color = isMe ? "#6366f1" : (loc.role === "employee" ? "#10b981" : "#f59e0b");
        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;">
            <div class="${isMe ? "emp-pulse" : ""}" style="width:${isMe ? 18 : 14}px;height:${isMe ? 18 : 14}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 4px ${color}33;"></div>
          </div>`,
          iconSize: [isMe ? 18 : 14, isMe ? 18 : 14],
          iconAnchor: [(isMe ? 18 : 14) / 2, (isMe ? 18 : 14) / 2],
        });
        const marker = L.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="padding:4px 2px;">
              <p style="margin:0;font-size:12px;font-weight:800;color:#f1f5f9;">${loc.name}${isMe ? " (You)" : ""}</p>
              <p style="margin:2px 0 0;font-size:10px;color:#6366f1;font-weight:700;text-transform:uppercase;">${loc.role}${loc.department ? ` · ${loc.department}` : ""}</p>
            </div>
          `);
        markersRef.current.push(marker);
      });

      if (lastPos.current && !locations.some(l => l.id === member.id)) {
        const myIcon = L.divIcon({
          className: "",
          html: `<div class="emp-pulse" style="width:18px;height:18px;border-radius:50%;background:#6366f1;border:2px solid white;box-shadow:0 0 0 4px #6366f133;"></div>`,
          iconSize: [18, 18], iconAnchor: [9, 9],
        });
        const m = L.marker([lastPos.current.lat, lastPos.current.lng], { icon: myIcon })
          .addTo(map).bindPopup(`<div style="padding:4px 2px;"><p style="margin:0;font-size:12px;font-weight:800;color:#f1f5f9;">${member.name} (You)</p><p style="margin:2px 0 0;font-size:10px;color:#6366f1;font-weight:700;text-transform:uppercase;">${member.role}</p></div>`);
        markersRef.current.push(m);
      }
    };

    const L = (window as any).L;
    if (L) { initMap(); return; }

    if (!document.getElementById("leaflet-css-emp")) {
      const css = document.createElement("link");
      css.id = "leaflet-css-emp"; css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }
    if (!document.getElementById("leaflet-js-emp")) {
      const js = document.createElement("script");
      js.id = "leaflet-js-emp";
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.onload = initMap;
      document.head.appendChild(js);
    }

    return () => { if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; } };
  }, [tab, locations, member]);

  const emp = hrData?.employee;
  const hourlyRate = emp?.hourlyRate ? (emp.hourlyRate / 100).toFixed(2) : null;
  const radioExt = emp?.radioExt ?? "—";
  const department = emp?.department || member.department || "—";
  const role = emp?.role || member.role || "employee";
  const hiredDate = emp?.hiredAt ? new Date(emp.hiredAt).toLocaleDateString("en-CA") : "—";

  const timeStr = currentTime.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* ── HEADER ── */}
      <header style={{ height: 68, background: "rgba(15,23,42,0.98)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#6366f1,#7c3aed)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <Zap size={18} fill="currentColor" style={{ color: "white" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "white", lineHeight: 1 }}>{member.businessName}</p>
            <p style={{ margin: "1px 0 0", fontSize: 9, color: "#6366f1", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Employee Portal</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "white", fontFamily: "monospace" }}>{timeStr}</p>
            <p style={{ margin: 0, fontSize: 9, color: "#475569", fontWeight: 600 }}>{dateStr}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: tracking ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", border: `1px solid ${tracking ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
            {tracking ? <Wifi size={12} style={{ color: "#10b981" }} /> : <WifiOff size={12} style={{ color: "#ef4444" }} />}
            <span style={{ fontSize: 10, fontWeight: 800, color: tracking ? "#10b981" : "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {tracking ? "Live" : "Offline"}
            </span>
          </div>

          <button onClick={() => setNotifications(n => !n)} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={15} style={{ color: "#94a3b8" }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "white" }}>{member.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "white" }}>{member.name}</p>
              <p style={{ margin: 0, fontSize: 9, color: "#6366f1", fontWeight: 700, textTransform: "capitalize" }}>{role}</p>
            </div>
          </div>

          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── NAV TABS ── */}
      <div style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", padding: "0 28px", flexShrink: 0 }}>
        {([
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "map", label: "Fleet Map", icon: Map },
          { id: "profile", label: "My Profile", icon: User },
          { id: "schedule", label: "Schedule", icon: Calendar },
        ] as { id: Tab; label: string; icon: React.FC<{ size: number; style?: React.CSSProperties }> }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.15s",
            color: tab === id ? "#6366f1" : "#475569",
            borderBottom: `3px solid ${tab === id ? "#6366f1" : "transparent"}`,
          }}>
            <Icon size={13} style={{ opacity: tab === id ? 1 : 0.6 }} /> {label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                {[
                  { label: "Radio Extension", value: radioExt, sub: "Assigned line", icon: Radio, accent: "#6366f1", bg: "rgba(99,102,241,0.12)" },
                  { label: "Hourly Wage", value: hourlyRate ? `$${hourlyRate}/hr` : "Salaried", sub: emp?.payType || "hourly", icon: DollarSign, accent: "#10b981", bg: "rgba(16,185,129,0.12)" },
                  { label: "GPS Status", value: tracking ? "Tracking" : "Offline", sub: `${locations.filter(l => l.role !== "client").length} on field`, icon: MapPin, accent: tracking ? "#10b981" : "#ef4444", bg: tracking ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "20px 22px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <s.icon size={18} style={{ color: s.accent }} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "white", fontFamily: s.label === "Radio Extension" ? "monospace" : "inherit" }}>{s.value}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 9, color: "#475569", fontWeight: 600 }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ padding: "22px 24px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>Quick Access</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { name: "Fleet Map", icon: Map, color: "#6366f1", action: () => setTab("map") },
                    { name: "My Profile", icon: User, color: "#0ea5e9", action: () => setTab("profile") },
                    { name: "Radio: " + radioExt, icon: Radio, color: "#10b981", action: () => {} },
                    { name: "Schedule", icon: Calendar, color: "#f59e0b", action: () => setTab("schedule") },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} style={{ padding: "18px 10px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.3)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <item.icon size={20} style={{ color: item.color }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "center" }}>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ padding: "22px 24px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>Activity Feed</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { title: "Portal Login", desc: "Employee portal access granted", time: "Just now", icon: CheckCircle2, color: "#10b981" },
                    { title: "GPS Tracking Started", desc: tracking ? "Location broadcasting active" : "Location broadcast paused", time: "Now", icon: MapPin, color: "#6366f1" },
                    { title: "Session Active", desc: `Logged in as ${role} · ${member.businessName}`, time: new Date().toLocaleTimeString(), icon: Shield, color: "#f59e0b" },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <a.icon size={15} style={{ color: a.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "white" }}>{a.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "#475569" }}>{a.desc}</p>
                      </div>
                      <span style={{ fontSize: 9, color: "#334155", fontWeight: 700 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Employee card */}
              <div style={{ padding: "24px", borderRadius: 20, background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", border: "1px solid rgba(99,102,241,0.3)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(99,102,241,0.15)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 15, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{member.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "white" }}>{emp?.name || member.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#a5b4fc", fontWeight: 700, textTransform: "capitalize" }}>{role}</p>
                  </div>
                </div>
                {[
                  { label: "Department", value: department },
                  { label: "Radio Ext.", value: radioExt, mono: true },
                  { label: "Hourly Rate", value: hourlyRate ? `$${hourlyRate}/hr` : "Salaried" },
                  { label: "Hired", value: hiredDate },
                ].map(f => (
                  <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 700 }}>{f.label}</span>
                    <span style={{ fontSize: 11, color: "white", fontWeight: 800, fontFamily: f.mono ? "monospace" : "inherit" }}>{f.value}</span>
                  </div>
                ))}
                {emp?.isOwner === "true" && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <Star size={11} style={{ color: "#f59e0b" }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase" }}>Business Owner</span>
                  </div>
                )}
              </div>

              {/* Live locations */}
              <div style={{ padding: "20px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>Active on Field</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>{locations.length} tracked</span>
                </div>
                {locations.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 11, color: "#334155", textAlign: "center", padding: "14px 0" }}>No field locations yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {locations.slice(0, 5).map(loc => (
                      <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: loc.id === member.id ? "#6366f1" : "#10b981", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "white" }}>{loc.name}{loc.id === member.id ? " (You)" : ""}</p>
                          <p style={{ margin: 0, fontSize: 9, color: "#475569" }}>{loc.role}{loc.department ? ` · ${loc.department}` : ""}</p>
                        </div>
                        <button onClick={() => setTab("map")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1", padding: 2 }}>
                          <Map size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setTab("map")} style={{ width: "100%", marginTop: 12, padding: "8px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#6366f1", fontSize: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Map size={12} /> Open Full Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAP TAB */}
        {tab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 900, color: "white" }}>Fleet Map — Live Tracking</p>
                <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{locations.length} active location{locations.length !== 1 ? "s" : ""} · Updates every 15s</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={fetchLocations} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  <Activity size={12} /> Refresh
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: tracking ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${tracking ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {tracking ? <Wifi size={12} style={{ color: "#10b981" }} /> : <WifiOff size={12} style={{ color: "#ef4444" }} />}
                  <span style={{ fontSize: 10, fontWeight: 800, color: tracking ? "#10b981" : "#ef4444" }}>
                    {tracking ? "Broadcasting Location" : "Location Offline"}
                  </span>
                </div>
              </div>
            </div>

            <div className="emp-map" ref={mapRef} style={{ height: 500, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#0a0f1e" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {locations.map(loc => (
                <div key={loc.id} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${loc.id === member.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: loc.id === member.id ? "#6366f1" : "#10b981" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "white" }}>{loc.name}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 9, color: "#475569", textTransform: "uppercase", fontWeight: 700 }}>{loc.role}{loc.department ? ` · ${loc.department}` : ""}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 9, color: "#334155", fontFamily: "monospace" }}>{parseFloat(loc.lat).toFixed(4)}°N, {parseFloat(loc.lng).toFixed(4)}°W</p>
                </div>
              ))}
              {locations.length === 0 && (
                <div style={{ gridColumn: "1/-1", padding: "30px", textAlign: "center", color: "#334155" }}>
                  <MapPin size={28} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 13, margin: 0, fontWeight: 700 }}>No live locations yet</p>
                  <p style={{ fontSize: 11, margin: "4px 0 0" }}>Allow GPS in your browser and wait for the map to update</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* ID Card */}
              <div style={{ padding: "28px", borderRadius: 24, background: "linear-gradient(135deg,#1e1b4b,#312e81)", border: "1px solid rgba(99,102,241,0.4)", gridColumn: "1/-1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(99,102,241,0.4)", flexShrink: 0 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: "white" }}>{member.name[0]?.toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "white" }}>{emp?.name || member.name}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{role}</span>
                      {department !== "—" && <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: 10, fontWeight: 700 }}>{department}</span>}
                      {emp?.isOwner === "true" && <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(245,158,11,0.2)", color: "#fbbf24", fontSize: 10, fontWeight: 800 }}>OWNER</span>}
                      {emp?.isPinned === "true" && <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(16,185,129,0.2)", color: "#6ee7b7", fontSize: 10, fontWeight: 800 }}>PINNED</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, color: "#6b7280", fontWeight: 700 }}>Radio Extension</p>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#6366f1", fontFamily: "monospace" }}>{radioExt}</p>
                  </div>
                </div>
              </div>

              {/* HR Details */}
              <div style={{ padding: "22px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>Employment Details</p>
                {[
                  { icon: DollarSign, label: "Hourly Rate", value: hourlyRate ? `$${hourlyRate}/hr CAD` : "Salaried", color: "#10b981" },
                  { icon: Briefcase, label: "Pay Type", value: emp?.payType || "hourly", color: "#6366f1" },
                  { icon: Calendar, label: "Hired", value: hiredDate, color: "#f59e0b" },
                  { icon: Activity, label: "Status", value: emp?.status || "active", color: "#10b981" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12, color: "white", fontWeight: 800, textTransform: "capitalize" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portal Access */}
              <div style={{ padding: "22px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569" }}>Portal Access</p>
                {[
                  { icon: Building2, label: "Business", value: member.businessName, color: "#6366f1" },
                  { icon: Hash, label: "Portal Slug", value: `${member.slug}.aurame.ca`, color: "#0ea5e9", mono: true },
                  { icon: Radio, label: "Radio Ext.", value: radioExt, color: "#10b981", mono: true },
                  { icon: Phone, label: "Phone", value: emp?.phone || member.email || "—", color: "#f59e0b" },
                ].map(({ icon: Icon, label, value, color, mono }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12, color: "white", fontWeight: 800, fontFamily: mono ? "monospace" : "inherit" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {emp?.notes && (
                <div style={{ gridColumn: "1/-1", padding: "20px 22px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#6366f1" }}>Manager Notes</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{emp.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab === "schedule" && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ padding: "32px", borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <Calendar size={40} style={{ color: "#6366f1", opacity: 0.5, display: "block", margin: "0 auto 16px" }} />
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: "white" }}>Schedule Module</p>
              <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>Your shifts and upcoming tasks will appear here.</p>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                {[
                  { day: "Today", event: "Active Shift", time: "Active now", color: "#10b981" },
                  { day: "Tomorrow", event: "Regular Shift", time: "09:00 — 17:00", color: "#6366f1" },
                  { day: "This Week", event: "Team Sync", time: "Friday 14:00", color: "#f59e0b" },
                ].map(s => (
                  <div key={s.day} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "white" }}>{s.event}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 9, color: "#475569" }}>{s.day}</p>
                    </div>
                    <span style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
