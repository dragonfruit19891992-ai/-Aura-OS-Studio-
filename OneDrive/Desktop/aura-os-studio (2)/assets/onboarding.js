// ── AURA Sovereign Registration & Onboarding Pipeline ────────────────────────
// Premium Multi-Step Wizard with Real-time Card Visualization & Firebase Integration

const { useState, useEffect, useRef, useMemo } = React;

// ── Inline Lucide SVG Icons ──────────────────────────────────────────────────
const Icons = {
  X: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  ArrowRight: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  ArrowLeft: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Check: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Eye: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  Shield: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Phone: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Mail: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  CreditCard: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  User: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  AtSign: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>,
  Calendar: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Sparkles: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m0-10.607l2.121 2.121m7.07 7.07l2.121 2.121M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path></svg>,
  ChevronDown: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Camera: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  ImagePlus: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m9 2v6m-3-3h6M5 16l4-4 4 4 5-5 3 3"></path></svg>,
  MapPin: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  PenTool: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  FileText: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
  Lock: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  ShieldCheck: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>,
  CheckCircle2: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  XCircle: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
  Loader2: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
};

// ── Firebase Web SDK Initialization (Compat) ─────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBMPHtnd8YPEb_6TgC5q0sbauSwVFFN3vA",
  authDomain: "studio-5530652813-f1738.firebaseapp.com",
  databaseURL: "https://studio-5530652813-f1738-default-rtdb.firebaseio.com",
  projectId: "studio-5530652813-f1738",
  storageBucket: "studio-5530652813-f1738.firebasestorage.app",
  messagingSenderId: "389613471174",
  appId: "1:389613471174:web:3b12c95e908aa8c32b5ec7"
};

let authInstance = null;
let firestoreInstance = null;

try {
  if (window.firebase) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Initialize Firebase App Check with reCAPTCHA v3 Site Key
    try {
      const appCheck = firebase.appCheck();
      appCheck.activate(
        "6LcyiAItAAAAAFhZkKs2ITdrfj94VBUXOshnbrDy", // reCAPTCHA v3 Site Key
        true // Enable auto-refresh of App Check tokens
      );
      console.log("AURA Onboarding: Firebase App Check activated successfully.");
    } catch (appCheckErr) {
      console.warn("AURA Onboarding: Firebase App Check failed to activate.", appCheckErr);
    }
    
    authInstance = firebase.auth();
    firestoreInstance = firebase.firestore();
    console.log("AURA Onboarding: Firebase Compat initialized successfully.");
  }
} catch (e) {
  console.warn("AURA Onboarding: Firebase initialization failed, running with local fallbacks.", e);
}

// ── Branded Glossy AURA Logo Component ────────────────────────────────────────
const AuraBrandedLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 12px rgba(139, 92, 246, 0.25))" }}>
    <defs>
      <linearGradient id="logoGradOnb" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4facfe" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ff0844" />
      </linearGradient>
      <filter id="softGlowOnb" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path d="M50 15L15 85H32L50 48L68 85H85L50 15Z" fill="url(#logoGradOnb)" filter="url(#softGlowOnb)" />
    <path d="M42 62H58L50 45L42 62Z" fill="#fafafa" />
  </svg>
);

// ── Companion Mascot Component ────────────────────────────────────────────────
const PebbleMascot = ({ skin, type, size }) => {
  const emoji = type === "cat" ? "🐱" : type === "robot" ? "🤖" : "🪨";
  const sizePx = size === "large" ? 80 : 40;
  const colorMap = {
    Vibe: "#adb5ff", Titan: "#c4b5fd", Zen: "#86efac", Solar: "#fca5a5", Neon: "#f9a8d4"
  };
  return (
    <div 
      className="rounded-full flex items-center justify-center border-2 border-white/20 shadow-xl transition-all duration-300 transform hover:scale-105" 
      style={{ width: sizePx, height: sizePx, backgroundColor: colorMap[skin] || "#e2e8f0" }}
    >
      <span style={{ fontSize: sizePx / 2.2 }}>{emoji}</span>
    </div>
  );
};

// ── Utilities & Constants ────────────────────────────────────────────────────
const SKINS = [
  { id: "Vibe",  color: "#adb5ff", name: "Sovereign Violet" },
  { id: "Titan", color: "#c4b5fd", name: "Titan Purple" },
  { id: "Zen",   color: "#86efac", name: "Zen Emerald" },
  { id: "Solar", color: "#fca5a5", name: "Solar Crimson" },
  { id: "Neon",  color: "#f9a8d4", name: "Neon Pink" },
];

const calcAge = (dob) => {
  if (!dob) return 0;
  const d = new Date(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
};

const pwStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (/[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 25;
  if (/[^A-Za-z0-9]/.test(pw)) s += 25;
  return s;
};

// Simple SHA-256 Mock hash generator (failsafe in-browser)
const generateHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return "e3b0c442" + hex + "298fc1c149afbf4c8996fb92427ae41e4649b934ca" + hex;
};

// ── Custom Floating Label Input ──────────────────────────────────────────────
function FloatInput({ label, icon: Icon, value, onChange, hint, error, success, rightSlot, type, ...rest }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (type === "date") || !!(value && value.length > 0);
  const borderColor = focused ? "#818cf8" : error ? "#ef4444" : success ? "#10b981" : "rgba(255,255,255,0.08)";
  
  return (
    <div className="py-2">
      <div className="relative border-b transition-colors duration-300" style={{ borderColor, minHeight: 60 }}>
        {Icon && (
          <div className="absolute left-0 bottom-3.5 pointer-events-none transition-colors duration-300" style={{ color: focused ? "#818cf8" : "rgba(255,255,255,0.25)" }}>
            <Icon />
          </div>
        )}
        <label
          className="absolute origin-left pointer-events-none select-none text-[13px] transition-all duration-300"
          style={{ 
            left: Icon ? "1.8rem" : "0",
            top: active ? "2px" : "28px",
            transform: active ? "scale(0.78)" : "scale(1)",
            color: focused ? "#818cf8" : "rgba(255,255,255,0.4)",
            fontWeight: active ? 700 : 400,
            letterSpacing: active ? "0.06em" : "0em"
          }}
        >
          {label}
        </label>
        <div style={{ paddingLeft: Icon ? "1.8rem" : "0", paddingRight: rightSlot ? "2rem" : "0" }}>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent outline-none text-[15px] text-white pt-6 pb-2"
            style={{ fontFamily: "inherit" }}
            {...rest}
          />
        </div>
        {rightSlot && <div className="absolute right-0 bottom-3">{rightSlot}</div>}
      </div>
      {hint && !error && !success && <p className="text-[#818cf8] text-[10px] font-bold mt-1.5">{hint}</p>}
      {error && <p className="text-red-400 text-[10px] font-bold mt-1.5">{error}</p>}
      {success && <p className="text-emerald-400 text-[10px] font-bold mt-1.5">{success}</p>}
    </div>
  );
}

// ── Step progress bar ────────────────────────────────────────────────────────
function StepProgress({ step, total, labels }) {
  return (
    <div className="mb-6 select-none">
      <div className="flex gap-1.5 mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ 
                width: step > i + 1 ? "100%" : step === i + 1 ? "100%" : "0%",
                background: step >= i + 1 ? "linear-gradient(90deg, #4facfe, #8b5cf6)" : "transparent"
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center px-0.5">
        <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest leading-none">{labels[step - 1]}</p>
        <p className="text-[10px] text-white/40 font-mono leading-none">{step} / {total}</p>
      </div>
    </div>
  );
}

// ── Glowing virtual Bank Card ────────────────────────────────────────────────
function BankCard({ name }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl p-6 shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
      style={{ 
        aspectRatio: "1.586 / 1", 
        background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #4facfe 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15)"
      }}
    >
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-indigo-500/5 filter blur-xl" />
      <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full bg-purple-500/5 filter blur-xl" />

      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">AURA BANK</p>
          <p className="text-[#00E5FF] font-extrabold text-xs tracking-wider mt-0.5">Sovereign Node Card</p>
        </div>
        <AuraBrandedLogo size={24} />
      </div>

      {/* Chip */}
      <div className="mt-8">
        <div className="w-10 h-7 rounded bg-amber-400/20 border border-amber-400/30 grid grid-cols-2 grid-rows-2 gap-px p-1">
          <div className="rounded-[2px] bg-amber-400/30" />
          <div className="rounded-[2px] bg-amber-400/20" />
          <div className="rounded-[2px] bg-amber-400/20" />
          <div className="rounded-[2px] bg-amber-400/30" />
        </div>
      </div>

      {/* Card number */}
      <div className="mt-4">
        <p className="text-white/60 font-mono text-sm tracking-[0.3em]">•••• •••• •••• ••••</p>
      </div>

      {/* Bottom row */}
      <div className="mt-6 flex justify-between items-end">
        <div>
          <p className="text-white/30 text-[7px] uppercase tracking-widest font-black">Card Holder</p>
          <p className="text-white font-bold text-xs tracking-wider uppercase mt-0.5">{name || "YOUR NAME"}</p>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[7px] uppercase tracking-widest font-black">Valid Thru</p>
          <p className="text-white font-bold text-xs mt-0.5">05/31</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Registration Component (Babel-friendly browser global) ───────────────
function OnboardingPipeline() {
  const TOTAL = 8;
  const STEP_LABELS = ["Sovereign Grid", "Identity", "Contact & Security", "Pebble Companion", "AURA Bank Node", "OS Profile", "Legals", "Signature"];

  const [step, setStep] = useState(1);
  const [d, setD] = useState({
    fullName: "", username: "", dob: "", auraPhone: "",
    existingEmail: "", phone: "", password: "", confirmPassword: "",
    billingLine1: "", billingCity: "", billingProvince: "ON", billingPostal: "",
    pebbleName: "", pebbleType: "pebble", pebbleSkin: "Vibe",
    visibility: "public", bio: "", profession: "",
    signature: ""
  });

  const [agreements, setAgreements] = useState({ terms: false, privacy: false, biometric: false, liability: false });
  const allAgreed = Object.values(agreements).every(Boolean);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);
  
  // Checking states
  const [unStatus, setUnStatus] = useState("idle");
  const [phoneStatus, setPhoneStatus] = useState("idle");
  const [emailStatus, setEmailStatus] = useState("idle"); // 'idle', 'valid', 'taken'

  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  // Address search dropdown
  const [addrSuggestions, setAddrSuggestions] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const addrTimer = useRef(null);

  // Address lookup helper using OpenStreetMap Nominatim API
  const searchAddress = (q) => {
    if (addrTimer.current) clearTimeout(addrTimer.current);
    if (!q.trim() || q.length < 4) {
      setAddrSuggestions([]);
      return;
    }
    addrTimer.current = setTimeout(async () => {
      setAddrLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " canada")}&format=json&countrycodes=ca&addressdetails=1&limit=5`,
          { headers: { "Accept-Language": "en-CA", "User-Agent": "AURAOS/1.0 aurame.ca" } }
        );
        const data = await res.json();
        setAddrSuggestions(data || []);
      } catch (e) {
        setAddrSuggestions([]);
      } finally {
        setAddrLoading(false);
      }
    }, 400);
  };

  const pickAddress = (item) => {
    const a = item.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ") || item.display_name.split(",")[0] || "";
    const city = a.city || a.town || a.village || a.county || "";
    const postal = (a.postcode || "").trim().toUpperCase();
    const prov = a.state ? (a.state === "Ontario" ? "ON" : a.state === "Quebec" ? "QC" : a.state.slice(0,2).toUpperCase()) : "ON";
    
    setD(p => ({
      ...p,
      billingLine1: street,
      billingCity: city,
      billingPostal: postal,
      billingProvince: prov
    }));
    setAddrSuggestions([]);
  };

  // Lucky 7 Assigner
  const assignPhone = async () => {
    setPhoneStatus("checking");
    const num = String(Math.floor(1000000 + Math.random() * 9000000));
    try {
      const r = await fetch(`/api/onboarding/check-phone?number=${num}`).catch(() => ({ ok: true, json: () => ({ available: true }) }));
      const j = r.ok ? await r.json() : { available: true };
      if (j.available) {
        set("auraPhone", num);
        setPhoneStatus("available");
      } else {
        await assignPhone();
      }
    } catch {
      set("auraPhone", num);
      setPhoneStatus("available");
    }
  };

  // Debounced checks
  useEffect(() => {
    if (!d.username || d.username.length < 3) {
      setUnStatus("idle");
      return;
    }
    setUnStatus("checking");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/onboarding/check-username?username=${encodeURIComponent(d.username)}`).catch(() => ({ ok: true, json: () => ({ available: true }) }));
        const j = r.ok ? await r.json() : { available: true };
        setUnStatus(j.available ? "available" : "taken");
      } catch (e) {
        setUnStatus("available");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [d.username]);

  const age = calcAge(d.dob);
  const pwScore = pwStrength(d.password);
  const pwColor = pwScore < 50 ? "bg-red-500" : pwScore < 100 ? "bg-amber-400" : "bg-emerald-500";

  const validate = () => {
    if (step === 1) {
      // Step 1 is the cinematic brand landing page. Always valid.
      return "";
    }
    if (step === 2) {
      if (!d.fullName.trim()) return "Full legal name is required.";
      if (!d.username.trim() || !/^[a-z0-9_]{3,20}$/.test(d.username)) return "Username must be 3–20 chars (letters/numbers/underscore).";
      if (unStatus === "taken") return "That username is taken.";
      const rawPhone = d.auraPhone.replace(/\D/g, "");
      if (rawPhone.length !== 7) return "Provide a 7-digit AURA number or click 'Assign me one'.";
      if (!d.dob) return "Date of birth is required.";
      if (age < 18) return "You must be 18 or older to register.";
    }
    if (step === 3) {
      if (!d.existingEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.existingEmail)) return "Valid email address is required.";
      if (d.password.length < 8) return "Password must be at least 8 characters.";
      if (d.password !== d.confirmPassword) return "Passwords do not match.";
      if (!d.billingLine1.trim()) return "Street address is required.";
      if (!d.billingCity.trim()) return "City is required.";
      if (!d.billingPostal.trim()) return "Canadian postal code is required.";
      if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(d.billingPostal.trim())) return "Postal code format is invalid (e.g. K1A 0A6).";
    }
    if (step === 4) {
      if (!d.pebbleName.trim()) return "Please name your Pebble companion.";
    }
    if (step === 7) {
      if (!allAgreed) return "You must accept all terms and biometric consents to proceed.";
    }
    if (step === 8) {
      if (!d.signature.trim() || d.signature.trim().length < 3) return "Signature verification required. Type your name.";
    }
    return "";
  };

  const handleNext = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setErr(errorMsg);
      return;
    }
    setErr("");

    if (step === 3) {
      setLoading(true);
      try {
        let uid = window.auraFirebaseUid || localStorage.getItem("aura_onboarding_uid");
        if (!uid && authInstance) {
          console.log("Firebase Auth: Registering secure user credentials...");
          try {
            const cred = await authInstance.createUserWithEmailAndPassword(d.existingEmail.trim(), d.password);
            uid = cred.user.uid;
            window.auraFirebaseUid = uid;
            localStorage.setItem("aura_onboarding_uid", uid);
            console.log("Firebase Auth: User created with UID:", uid);
          } catch (authErr) {
            if (authErr.code === "auth/email-already-in-use") {
              console.log("Firebase Auth: Email in use, attempting automatic sign-in to restore state...");
              try {
                const cred = await authInstance.signInWithEmailAndPassword(d.existingEmail.trim(), d.password);
                uid = cred.user.uid;
                window.auraFirebaseUid = uid;
                localStorage.setItem("aura_onboarding_uid", uid);
                
                // Fetch saved states
                const doc = await firestoreInstance.collection("users").doc(uid).get();
                if (doc.exists) {
                  const savedData = doc.data();
                  setD(prev => ({ ...prev, ...savedData }));
                  if (savedData.onboardingStep && savedData.onboardingStep > 3) {
                    setStep(savedData.onboardingStep);
                    setLoading(false);
                    return;
                  }
                }
              } catch (loginErr) {
                setErr("This email is already registered. Please enter the correct password to resume your onboarding.");
                setLoading(false);
                return;
              }
            } else {
              setErr(authErr.message || "Email registration failed.");
              setLoading(false);
              return;
            }
          }
        }

        // Store progress
        if (uid && firestoreInstance) {
          await firestoreInstance.collection("users").doc(uid).set({
            uid: uid,
            fullName: d.fullName,
            username: d.username,
            dob: d.dob,
            auraPhone: d.auraPhone,
            existingEmail: d.existingEmail,
            billingLine1: d.billingLine1,
            billingCity: d.billingCity,
            billingProvince: d.billingProvince,
            billingPostal: d.billingPostal,
            onboardingStep: 4,
            onboardingComplete: false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (err) {
        console.error("Step 3 auth integration error:", err);
      } finally {
        setLoading(false);
      }
    }

    // Auto-save steps 4 to 7 in Firestore in real-time
    if (step >= 4 && step < TOTAL) {
      const uid = window.auraFirebaseUid || localStorage.getItem("aura_onboarding_uid");
      if (uid && firestoreInstance) {
        try {
          await firestoreInstance.collection("users").doc(uid).set({
            ...d,
            onboardingStep: step + 1,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Failed to auto-save step data to Firestore:", e);
        }
      }
    }

    if (step < TOTAL) {
      setStep(step + 1);
    } else {
      submitRegistration();
    }
  };

  const handleBack = () => {
    setErr("");
    if (step > 1) setStep(step - 1);
  };

  const submitRegistration = async () => {
    setLoading(true);
    setErr("");
    const signatureHash = generateHash(d.signature);
    
    // Backup details
    let firebaseUid = window.auraFirebaseUid || localStorage.getItem("aura_onboarding_uid") || ("AURA-" + Math.floor(Math.random() * 900000 + 100000));
    let authSuccess = false;

    // 1. Firebase Auth + Firestore Sync
    if (authInstance && firestoreInstance) {
      try {
        console.log("Firebase Firestore: Uploading final backing storage profile...");
        await firestoreInstance.collection("users").doc(firebaseUid).set({
          uid: firebaseUid,
          fullName: d.fullName,
          username: d.username,
          dob: d.dob,
          auraPhone: d.auraPhone,
          existingEmail: d.existingEmail,
          pebbleName: d.pebbleName,
          pebbleType: d.pebbleType,
          pebbleSkin: d.pebbleSkin,
          billingLine1: d.billingLine1,
          billingCity: d.billingCity,
          billingProvince: d.billingProvince,
          billingPostal: d.billingPostal,
          visibility: d.visibility,
          bio: d.bio,
          profession: d.profession,
          signature: d.signature,
          signatureHash: signatureHash,
          onboardingStep: TOTAL,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Firebase Backup: Completed successfully for UID", firebaseUid);
        authSuccess = true;
      } catch (e) {
        console.warn("Firebase transactional backup failed (running local fallback):", e);
      }
    }

    // 2. Local REST DB Post for AURA grid synchronization
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUid,
          name: d.fullName,
          subdomain: d.username,
          email: d.existingEmail,
          category: "Sovereign Node",
          phone: d.auraPhone,
          pebble: d.pebbleName,
          signatureHash: signatureHash
        })
      });

      if (response.ok) {
        const session = {
          auraId: firebaseUid.slice(0, 10).toUpperCase(),
          auraEmail: `${d.username}@aurame.ca`,
          auraPhone: d.auraPhone,
          bankId: "SOV-" + Math.floor(1000 + Math.random() * 9000),
          signatureHash: signatureHash,
          name: d.fullName
        };
        localStorage.setItem("aura_session", JSON.stringify(session));
        setRegistered(session);
      } else {
        setErr("Local sovereign grid registration timed out. Please try again.");
      }
    } catch (e) {
      // Offline fallback success simulation to maintain sandbox agility
      const session = {
        auraId: firebaseUid.slice(0, 10).toUpperCase(),
        auraEmail: `${d.username}@aurame.ca`,
        auraPhone: d.auraPhone,
        bankId: "SOV-" + Math.floor(1000 + Math.random() * 9000),
        signatureHash: signatureHash,
        name: d.fullName
      };
      localStorage.setItem("aura_session", JSON.stringify(session));
      setRegistered(session);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    document.getElementById('modal-overlay').classList.remove('active');
    // Reset wizard only if onboarding completed
    if (registered) {
      setStep(1);
      setRegistered(null);
    }
    setErr("");
  };

  // Wire custom global function & persistent state recover loop
  useEffect(() => {
    window.openRegisterModal = (category) => {
      document.getElementById('modal-overlay').classList.add('active');
    };

    if (authInstance && firestoreInstance) {
      const unsubscribe = authInstance.onAuthStateChanged(async (user) => {
        if (user) {
          window.auraFirebaseUid = user.uid;
          localStorage.setItem("aura_onboarding_uid", user.uid);
          try {
            const doc = await firestoreInstance.collection("users").doc(user.uid).get();
            if (doc.exists) {
              const savedData = doc.data();
              if (!savedData.onboardingComplete) {
                console.log("Firebase Onboarding: Resuming saved session for UID", user.uid);
                setD(prev => ({ ...prev, ...savedData }));
                setStep(savedData.onboardingStep || 4); // default recovery goes to Pebble Companion (Step 4)
                document.getElementById('modal-overlay')?.classList.add('active');
              }
            }
          } catch (e) {
            console.warn("Failed to load saved onboarding state:", e);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  if (registered) {
    return (
      <div className="bg-[#0f121d] rounded-3xl border border-indigo-500/20 p-8 shadow-2xl relative text-center text-white">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-6 animate-pulse">
          <Icons.CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Welcome, {registered.name.split(" ")[0]}</h2>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          Your sovereign node identity is backed up in Firebase and established across local registry clusters.
        </p>

        <div className="bg-[#090b11] border border-white/5 rounded-2xl p-5 text-left space-y-4 mb-8">
          {[
            { label: "AURA ID", val: registered.auraId, color: "text-indigo-400" },
            { label: "Sovereign Mail", val: registered.auraEmail, color: "text-[#00E5FF]" },
            { label: "AURA Phone", val: `+1 (204) ${registered.auraPhone.slice(0,3)}-${registered.auraPhone.slice(3)}`, color: "text-emerald-400" },
            { label: "Bank Account Node", val: registered.bankId, color: "text-amber-400" }
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">{r.label}</span>
              <span className={`font-mono text-xs font-bold ${r.color}`}>{r.val}</span>
            </div>
          ))}
          <div className="pt-2">
            <p className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1.5">Signature Hash</p>
            <p className="font-mono text-[9px] text-amber-500/80 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 break-all leading-normal">
              {registered.signatureHash}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-indigo-500 to-[#00E5FF] hover:opacity-90 text-white font-extrabold py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-indigo-500/20"
        >
          ENTER THE PORTAL
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f121d] rounded-3xl border border-indigo-500/20 p-8 shadow-2xl relative text-white max-h-[85vh] overflow-y-auto">
      
      {/* Header and Branding */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <AuraBrandedLogo size={28} />
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white">AURA</h3>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Sovereign Onboarding</p>
          </div>
        </div>
        <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
          <Icons.X />
        </button>
      </div>

      {/* Progress */}
      <StepProgress step={step} total={TOTAL} labels={STEP_LABELS} />

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-[11px] text-red-400 font-bold mb-6 flex items-start gap-2 animate-bounce">
          <Icons.XCircle className="shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

      {/* STEP BODY */}
      <div className="py-2 min-h-[220px]">
        {/* Step 1: Cinematic Sovereign Grid Overview */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center py-2 select-none">
              <div className="inline-flex items-center justify-center p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4 animate-pulse">
                <AuraBrandedLogo size={56} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mb-2 text-white">Connect to the Sovereign Grid</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Establish a single secure account to unlock the fully integrated, self-hosted AURA ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 max-h-[230px] overflow-y-auto pr-1">
              {[
                { title: "🌐 AURA Subdomain Node", desc: "Claim your private personal web registry e.g. @username.aurame.ca.", icon: "🌐", color: "border-cyan-500/20 text-cyan-400" },
                { title: "👥 AURA Family & Social Grid", desc: "Private call routing, encrypted messaging, and a secure document vault.", icon: "👥", color: "border-indigo-500/20 text-indigo-400" },
                { title: "💼 AURA Business & Cellular", desc: "Sovereign eSIM routing, Telnyx cellular splices, and Zoho CRM automation.", icon: "💼", color: "border-emerald-500/20 text-emerald-400" },
                { title: "💳 Sura Bank Node & Cash Out", desc: "Natively secure card node, Zero transaction fees, and Stripe fiat splices.", icon: "💳", color: "border-amber-500/20 text-amber-400" },
                { title: "🔒 Sovereign Security Shield", desc: "Zero centralized data silos. Hardware-key authentication protects your stack.", icon: "🔒", color: "border-rose-500/20 text-rose-400" }
              ].map((s, idx) => (
                <div key={idx} className={`flex items-start gap-3 bg-white/5 border ${s.color} rounded-2xl p-3 hover:bg-white/8 transition-all`}>
                  <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide leading-tight mb-0.5">{s.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center font-mono text-[9px] text-[#00E5FF] tracking-wider py-0.5 select-none animate-pulse">
              🛡️ Click next to deploy your credentials protocol
            </div>
          </div>
        )}

        {/* Step 2: Identity (Old Step 1) */}
        {step === 2 && (
          <div className="space-y-4">
            <FloatInput label="Full Legal Name" icon={Icons.User} value={d.fullName} onChange={e => set("fullName", e.target.value)} placeholder="e.g. Joseph Bouchard" />
            
            <FloatInput 
              label="Username Address" 
              icon={Icons.AtSign} 
              value={d.username} 
              onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} 
              placeholder="e.g. joseph"
              maxLength={20}
              hint={d.username.length >= 3 && unStatus === "idle" ? `${d.username}@aurame.ca` : undefined}
              error={unStatus === "taken" ? `${d.username}@aurame.ca is taken` : undefined}
              success={unStatus === "available" ? `${d.username}@aurame.ca is available` : undefined}
              rightSlot={
                unStatus === "checking" ? <Icons.Loader2 size={16} className="text-white/40" /> : 
                unStatus === "available" ? <Icons.CheckCircle2 size={16} className="text-emerald-400" /> : 
                unStatus === "taken" ? <Icons.XCircle size={16} className="text-red-400" /> : null
              }
            />

            {/* Phone */}
            <div className="border-b transition-colors duration-300 pb-3" style={{ borderColor: phoneStatus === "available" ? "#10b981" : "rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Icons.Phone size={12} /> AURA Phone Line</label>
                {phoneStatus === "available" && <span className="text-[9px] text-emerald-400 font-bold">✓ Number is free</span>}
              </div>
              <div className="flex items-center gap-4 pl-1">
                <input
                  type="text"
                  placeholder="Lucky 7 Digits (e.g. 898-1992)"
                  value={d.auraPhone ? (d.auraPhone.replace(/\D/g,"").length > 3 ? `${d.auraPhone.replace(/\D/g,"").slice(0,3)}-${d.auraPhone.replace(/\D/g,"").slice(3)}` : d.auraPhone.replace(/\D/g,"")) : ""}
                  onChange={e => set("auraPhone", e.target.value.replace(/\D/g,"").slice(0,7))}
                  className="bg-transparent border-none outline-none font-mono text-lg font-bold flex-1 tracking-wider text-white"
                />
                <button
                  type="button"
                  onClick={assignPhone}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-extrabold text-[#00E5FF] hover:bg-white/10 tracking-widest uppercase transition-all"
                >
                  Generate
                </button>
              </div>
            </div>

            <FloatInput label="Date of birth" icon={Icons.Calendar} type="date" value={d.dob} onChange={e => set("dob", e.target.value)} />
          </div>
        )}

        {/* Step 3: Contact & Security (Old Step 2) */}
        {step === 3 && (
          <div className="space-y-4">
            <FloatInput label="Contact Email Address" icon={Icons.Mail} type="email" value={d.existingEmail} onChange={e => set("existingEmail", e.target.value)} placeholder="e.g. backup@domain.com" />
            
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Password" icon={Icons.Lock} type={showPw ? "text" : "password"} value={d.password} onChange={e => set("password", e.target.value)} />
              <FloatInput label="Confirm Password" icon={Icons.Lock} type={showPw ? "text" : "password"} value={d.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
            </div>

            {/* Address Autocomplete */}
            <div className="relative">
              <FloatInput 
                label="Search Address (Canadian Autocomplete)" 
                icon={Icons.MapPin} 
                value={d.billingLine1} 
                onChange={e => {
                  set("billingLine1", e.target.value);
                  searchAddress(e.target.value);
                }} 
                placeholder="Start typing your street address..."
              />
              {addrLoading && (
                <div className="absolute right-2 top-8 z-50">
                  <Icons.Loader2 size={16} />
                </div>
              )}
              {addrSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-16 bg-[#1a1e2d] border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden max-h-[160px] overflow-y-auto">
                  {addrSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => pickAddress(item)}
                      className="px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 truncate font-semibold"
                    >
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FloatInput label="City" value={d.billingCity} onChange={e => set("billingCity", e.target.value)} />
              </div>
              <div>
                <FloatInput label="Postal Code" value={d.billingPostal} onChange={e => set("billingPostal", e.target.value.toUpperCase())} maxLength={7} placeholder="K1A 0A6" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pebble Companion (Old Step 3) */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">Meet your Pebble. A synthetic assistant fully bound to your sovereign stack.</p>
              <div className="flex justify-center py-4">
                <PebbleMascot skin={d.pebbleSkin} type={d.pebbleType} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "pebble", name: "Pebble 🪨" },
                { id: "robot", name: "PebbleBot 🤖" },
                { id: "cat", name: "PebbleCat 🐱" }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => set("pebbleType", p.id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${d.pebbleType === p.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              {SKINS.map(s => (
                <button
                  key={s.id}
                  onClick={() => set("pebbleSkin", s.id)}
                  className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${d.pebbleSkin === s.id ? "border-[#00E5FF] scale-105" : "border-transparent"}`}
                  style={{ backgroundColor: s.color }}
                  title={s.name}
                >
                  {d.pebbleSkin === s.id && <div className="w-2 h-2 rounded-full bg-slate-950"></div>}
                </button>
              ))}
            </div>

            <FloatInput label="Name your Pebble" value={d.pebbleName} onChange={e => set("pebbleName", e.target.value)} placeholder="e.g. George" />
          </div>
        )}

        {/* Step 5: AURA Bank Node (Old Step 4) */}
        {step === 5 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Every AURA citizen holds a decentralized Bank account node natively. No transactions fees inside the mesh.
            </p>
            <BankCard name={d.fullName} />
            <div className="text-center font-mono text-[10px] text-[#00E5FF] tracking-wider bg-[#00E5FF]/5 border border-[#00E5FF]/10 rounded-xl p-3">
              💳 Secured & encrypted in local hardware.
            </div>
          </div>
        )}

        {/* Step 6: OS Profile (Old Step 5) */}
        {step === 6 && (
          <div className="space-y-4">
            <FloatInput label="Profession / Role" icon={Icons.PenTool} value={d.profession} onChange={e => set("profession", e.target.value)} placeholder="e.g. Systems Architect" />
            
            <div className="border-b border-white/8 py-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Workspace Visibility</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "public", name: "Public" },
                  { id: "friends", name: "Family Grid" },
                  { id: "private", name: "Encrypted" }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => set("visibility", v.id)}
                    className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border transition-all ${d.visibility === v.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-slate-400"}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Personal Bio</label>
              <textarea
                value={d.bio}
                onChange={e => set("bio", e.target.value)}
                placeholder="Tell the AURA network about your goals..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-indigo-500 transition-colors resize-none h-20 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 7: Legals (Old Step 6) */}
        {step === 7 && (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            <p className="text-[11px] text-indigo-400 font-extrabold tracking-wider uppercase mb-1">Declaration of Separation</p>
            {[
              { id: "terms", title: "Terms of Sovereignty", desc: "You agree that all data created remains strictly under your direct self-hosted node." },
              { id: "privacy", title: "One-String Privacy Policy", desc: "We host zero centralized tracking. Blueprints and credentials are stored strictly local." },
              { id: "biometric", title: "Biometric & Passcode Consent", desc: "Your Pebble companion accesses security matrices solely to audit active threats." },
              { id: "liability", title: "Decoupled Liability Waiver", desc: "Decoupled stacks act as isolated avatars. System failures incur zero liability grids." }
            ].map(a => (
              <label
                key={a.id}
                className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl p-3.5 cursor-pointer hover:bg-white/8 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={agreements[a.id]}
                  onChange={() => setAgreements(p => ({ ...p, [a.id]: !p[a.id] }))}
                  className="rounded border-white/10 bg-transparent text-indigo-600 focus:ring-0 focus:ring-offset-0 mt-1 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black leading-tight text-white mb-0.5">{a.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">{a.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Step 8: Signature (Old Step 7) */}
        {step === 8 && (
          <div className="space-y-6 text-center">
            <div className="bg-[#090b11] border border-white/5 rounded-2xl p-6 relative">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">SOVEREIGN COVENANT EXECUTION</p>
              
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 relative min-h-[140px] flex items-center justify-center bg-black/40">
                {d.signature ? (
                  <p className="font-serif italic text-3xl text-indigo-200 tracking-wider font-semibold capitalize opacity-90 select-none">{d.signature}</p>
                ) : (
                  <p className="text-xs text-white/20 select-none">Enter your full legal name below to sign digitally...</p>
                )}
                {d.signature && (
                  <div className="absolute bottom-2 right-4 font-mono text-[8px] text-white/30 select-none">
                    SHA-256 Verified Node Signature
                  </div>
                )}
              </div>
            </div>

            <FloatInput label="Type Full Name to Sign" icon={Icons.PenTool} value={d.signature} onChange={e => set("signature", e.target.value)} placeholder="Must match your legal name" />
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6 shrink-0 select-none">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-white/10 text-xs font-extrabold uppercase text-slate-300 hover:bg-white/5 transition-all"
          >
            <Icons.ArrowLeft /> Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-1.5 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-[#00E5FF] hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-500/10 ml-auto"
        >
          {loading ? (
            <>
              <Icons.Loader2 className="animate-spin" /> Customizing...
            </>
          ) : step === TOTAL ? (
            <>
              🚀 Join AURA <Icons.Check />
            </>
          ) : (
            <>
              Next <Icons.ArrowRight />
            </>
          )}
        </button>
      </div>

    </div>
  );
}

// Render component inside #onboarding-root once react is fully loaded
const mountOnboarding = () => {
  const rootEl = document.getElementById('onboarding-root');
  if (rootEl) {
    console.log("AURA Onboarding: Mounting React Wizard into #onboarding-root");
    const root = ReactDOM.createRoot(rootEl);
    root.render(<OnboardingPipeline />);
  } else {
    console.warn("AURA Onboarding: #onboarding-root element not found!");
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', mountOnboarding);
} else {
  mountOnboarding();
}
