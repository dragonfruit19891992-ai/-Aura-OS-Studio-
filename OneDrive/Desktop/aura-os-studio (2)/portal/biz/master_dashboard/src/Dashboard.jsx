import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Plus, ArrowRight, Settings, Users, MonitorSmartphone, ShoppingCart, Globe, Briefcase, Map, DollarSign, BookOpen, ShieldCheck, Zap, Search, RefreshCw, MoreVertical, Mail, Phone, Server, HardDrive, Wifi, Download, Cloud, Package, Target, Sparkles, TrendingUp, Activity, Scale, Brain, FileText, ChevronRight, Save, BarChart3, PieChart, Info, AlertTriangle, Fingerprint, Compass, Landmark, LayoutGrid, Heart, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- INLINE SVG ICONS ---
const TrashIcon = ({ size = 12, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PlusIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ExternalLinkIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

const CopyIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


const BUSINESSES = [
  { id: 'b_acme_plumb', name: 'Acme Plumbing Co.', role: 'Owner', revenue: '$14,230', status: 'Active', color: '#2563eb' },
  { id: 'b_acme_hvac', name: 'Acme HVAC Services', role: 'Owner', revenue: '$8,450', status: 'Active', color: '#0ea5e9' },
  { id: 'b_luxe_cafe', name: 'Luxe Coffee', role: 'Owner', revenue: '$3,120', status: 'Pending Setup', color: '#f59e0b' },
];

const DUMMY_USERS = [
  { id: '1', identifier: 'bill.jenkins@acme.com', providers: ['mail'], created: 'May 27, 2026', signedIn: 'May 28, 2026', uid: 'tKzOo2sqrpY5T...' },
  { id: '2', identifier: 'tom.fixer@acme.com', providers: ['mail', 'phone'], created: 'May 28, 2026', signedIn: 'May 29, 2026', uid: 'xP9vL1mNqR4w...' }
];

const DUMMY_CLIENTS = [
  { id: 'c1', name: 'Westview Devs', email: 'billing@westview.com', type: 'Company', phone: '(555) 123-4567', address: '1200 Ridge Rd, Toronto, ON M5V 2N2, Canada', joined: 'Mar 15, 2026' },
  { id: 'c2', name: 'Sarah Jenkins', email: 'sarah.j@email.com', type: 'Personal', phone: '(555) 987-6543', address: '44 Main St, Montreal, QC H2W 1Y4, Canada', joined: 'Apr 22, 2026' }
];

const DUMMY_EMPLOYEES = [
  { id: 'e1', name: 'Bill Jenkins', email: 'bill.jenkins@acme.com', role: 'Senior Plumber', department: 'Field Services', phone: '(555) 123-4567', status: 'active', hiredAt: '2023-01-15', payType: 'hourly', hourlyRate: 45, ytdGross: 35000, vacationBal: 40, sickBal: 16 },
  { id: 'e2', name: 'Tom Fixer', email: 'tom.fixer@acme.com', role: 'HVAC Tech', department: 'Field Services', phone: '(555) 987-6543', status: 'active', hiredAt: '2024-03-22', payType: 'hourly', hourlyRate: 42, ytdGross: 28000, vacationBal: 80, sickBal: 40 }
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INITIAL_ROADMAP = { 
  purpose: "", 
  integrity: "", 
  compFlaw: "", 
  moat: "", 
  feeling: "", 
  service: "", 
  y1: "", 
  y5: "",
  y5_goal: "Establish cross-provincial commerce with regional Ontario and Quebec tax automation, supporting $1M CAD annual run-rate.",
  y5_image: "Seen by clients as the most transparent, legally secure, and efficient local partner in North America.",
  y5_points: [
    { text: "Launch premium physical product collection using local suppliers", lowBudget: "15000", highBudget: "30000" },
    { text: "Automate provincial tax invoicing for cross-border logistics", lowBudget: "5000", highBudget: "10000" }
  ],
  y2_goal: "Scale local field plumbing services across regional boundaries into adjacent territories.",
  y2_image: "Acknowledged as the highest-rated local contractor with 100% on-time dispatch transparency.",
  y2_points: [
    { text: "Deploy standard invoicing mobile POS tools for field employees", lowBudget: "2000", highBudget: "5000" },
    { text: "Hire senior regional operations dispatch manager", lowBudget: "8000", highBudget: "12000" }
  ]
};
const INITIAL_SEASONALITY = [1, 0.9, 0.9, 1, 1.1, 1.2, 1.2, 1.1, 1, 1.1, 1.3, 1.5];

const INITIAL_NODES = [
  { id: "ottawa", city: "Ottawa", country: "Canada", ip: "142.122.9.21", ping: "22ms", compliance: "100%", status: "Active", primary: true, details: "HQ Sovereign Controller" },
  { id: "quebec", city: "Quebec", country: "Canada", ip: "192.16.88.105", ping: "38ms", compliance: "98.9%", status: "Active", primary: false, details: "Francophone Hub" },
  { id: "usa", city: "New York", country: "United States", ip: "62.4.119.54", ping: "74ms", compliance: "99.5%", status: "Active", primary: false, details: "US Sovereign Relay" }
];

const AGENTS = [
  { id: "treasury", name: "AuraTreasury-v1", type: "Financial", task: "SOV$ Balance Auditor", active: true, load: "12%", logs: ["Ledger audit complete.", "Next block verification in 4s."] },
  { id: "legal", name: "AuraLegal-v2", type: "Compliance", task: "G7 Treaty Guard", active: true, load: "5%", logs: ["Ontario, Canada treaty standards: VERIFIED.", "E-Signature validity index is 1.00."] },
  { id: "guardian", name: "NodeGuardian-v3", type: "Security", task: "Intrusion Decimator", active: true, load: "28%", logs: ["No intrusion signatures detected.", "Firewall layers operating securely."] }
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    name: "Classic Leather Satchel",
    sku: "CLS-LTH-01",
    category: "Goods & Accessories",
    selling_price: 189.00,
    overhead_cost_cents: 1250,      // $12.50
    packaging_cost_cents: 450,       // $4.50
    shipping_inbound_cents: 800,     // $8.00
    
    // Bill of Materials
    materials: [
      { id: "mat-1", material_name: "Premium Full-Grain Leather", quantity: 1.5, unit: "sq ft", cost_per_unit: 18.50, supplier: "Tandy Leather", notes: "Grade-A vegetable tanned" },
      { id: "mat-2", material_name: "Solid Brass Buckles & Hardware Set", quantity: 1, unit: "set", cost_per_unit: 14.20, supplier: "Buckleguy Co.", notes: "Corrosion-resistant brass" },
      { id: "mat-3", material_name: "Heavy Duty Waxed Polyester Thread", quantity: 50, unit: "meters", cost_per_unit: 0.08, supplier: "Fil Au Chinois", notes: "0.8mm gauge" }
    ],
    
    // Labor requirements
    labor: [
      { id: "lab-1", role_name: "Master Leather Artisan (Cutting & Prep)", hours_per_unit: 1.5, hourly_rate: 32.00, num_workers: 1 },
      { id: "lab-2", role_name: "Assembly & Stitching Technician", hours_per_unit: 2.2, hourly_rate: 24.50, num_workers: 1 }
    ],

    // Supply Chain Parameters
    supplier_name: "Tandy Leather Supply",
    supplier_url: "https://www.tandyleather.com",
    supplier_contact: "sales@tandyleather.com | (800) 555-0192",
    supplier_lead_days: 5,
    order_frequency: "weekly",
    last_ordered_at: "2026-05-15",
    next_expected_at: "2026-06-03",
    delivery_notes: "Leave palette by Dock C; requires forklift assistance.",

    // Access Control
    client_access: true,
    employee_access: true,
    manager_access: true,
    admin_only: false,
    restricted_notes: "Available for public preorder and retail stock placement.",

    // Regulations
    requires_certification: true,
    inspection_required: true,
    expiry_tracking: false,
    perishable: false,
    certification_notes: "CITES certification required for international leather transit.",
    legal_restrictions: "Subject to structural state import tariffs in certain jurisdictions.",
    regulatory_notes: "Treat only with REACH-compliant water repellants."
  },
  {
    id: "prod-002",
    name: "Artisanal Rosemary Sourdough",
    sku: "SOU-RSM-04",
    category: "Food & Beverage",
    selling_price: 9.50,
    overhead_cost_cents: 85,        // $0.85
    packaging_cost_cents: 60,        // $0.60
    shipping_inbound_cents: 20,      // $0.20
    
    materials: [
      { id: "mat-4", material_name: "Organic Unbleached Flour", quantity: 0.5, unit: "kg", cost_per_unit: 1.90, supplier: "Arva Flour Mills", notes: "Stone ground heritage wheat" },
      { id: "mat-5", material_name: "Wild Fermentation Starter Cult", quantity: 1, unit: "unit", cost_per_unit: 0.15, supplier: "In-house Starter", notes: "Maintained daily" },
      { id: "mat-6", material_name: "Fresh Organic Rosemary Sprigs", quantity: 3, unit: "sprig", cost_per_unit: 0.25, supplier: "Greenhouse Farms", notes: "Locally sourced harvest" }
    ],
    
    labor: [
      { id: "lab-3", role_name: "Bakehouse Shift Supervisor", hours_per_unit: 0.05, hourly_rate: 26.00, num_workers: 1 },
      { id: "lab-4", role_name: "Prep Baker & Kneading Crew", hours_per_unit: 0.15, hourly_rate: 18.00, num_workers: 2 }
    ],

    supplier_name: "Arva Flour Distributors",
    supplier_url: "https://www.arvaflourmill.com",
    supplier_contact: "orders@arvaflour.ca | 1-888-555-5511",
    supplier_lead_days: 2,
    order_frequency: "daily",
    last_ordered_at: "2026-05-28",
    next_expected_at: "2026-05-30",
    delivery_notes: "Deliver before 5:00 AM directly into temperature-controlled dry storage.",

    client_access: true,
    employee_access: true,
    manager_access: true,
    admin_only: false,
    restricted_notes: "Unrestricted internal ordering and public shelf placement.",

    requires_certification: false,
    inspection_required: true,
    expiry_tracking: true,
    perishable: true,
    certification_notes: "Local Public Health Food Safety Standard Certificate required.",
    legal_restrictions: "Traceability codes mandatory for batch recall safety.",
    regulatory_notes: "Sell within 36 hours of baking. Maintain clean room humidity under 45%."
  },
  {
    id: "prod-003",
    name: "Aerospace Grade Titanium Bicycle Stem",
    sku: "CYC-TI-STEM",
    category: "Sports & Engineering",
    selling_price: 340.00,
    overhead_cost_cents: 3500,     // $35.00
    packaging_cost_cents: 1200,     // $12.00
    shipping_inbound_cents: 1500,    // $15.00
    
    materials: [
      { id: "mat-7", material_name: "Grade 5 (Ti-6Al-4V) Rod Stock", quantity: 0.8, unit: "kg", cost_per_unit: 55.00, supplier: "Titanium Metal Supply", notes: "Cert of analysis required" },
      { id: "mat-8", material_name: "Premium Nitrile O-Ring Washers", quantity: 2, unit: "units", cost_per_unit: 0.75, supplier: "Parker Seals", notes: "Chemical resistant" },
      { id: "mat-9", material_name: "Laser Engraving Consumables", quantity: 1, unit: "job", cost_per_unit: 2.10, supplier: "L-Tech Inc.", notes: "Gas and protective lens depreciation" }
    ],
    
    labor: [
      { id: "lab-5", role_name: "CNC Machinist Operator", hours_per_unit: 0.8, hourly_rate: 35.00, num_workers: 1 },
      { id: "lab-6", role_name: "Quality Assurance & Stress Metrology", hours_per_unit: 0.4, hourly_rate: 45.00, num_workers: 1 }
    ],

    supplier_name: "Global Titanium Alloys",
    supplier_url: "https://www.globaltitanium.com",
    supplier_contact: "contracts@globalti.com",
    supplier_lead_days: 14,
    order_frequency: "monthly",
    last_ordered_at: "2026-05-10",
    next_expected_at: "2026-06-15",
    delivery_notes: "Drop-off at receiving bay 2. CoC documents must physically arrive attached with packaging list.",

    client_access: true,
    employee_access: false,
    manager_access: true,
    admin_only: false,
    restricted_notes: "Restricted from low-level employee POS. High value aerospace stock control protocols apply.",

    requires_certification: true,
    inspection_required: true,
    expiry_tracking: false,
    perishable: false,
    certification_notes: "ISO 9001 Manufacturing Audit & Stress Test certifications required.",
    legal_restrictions: "Banned for export to embargoed nations per ITAR safety standards.",
    regulatory_notes: "Subject to torque testing threshold. Serial identification numbers must be stamped per unit."
  }
];

const getClientTaxRate = (address) => {
  if (!address) return { rate: 0.15, name: "Default Flat Tax", details: "15% flat fallback rate" };
  const addr = address.toLowerCase();
  if (addr.includes("on") || addr.includes("ontario") || addr.includes("toronto")) {
    return { rate: 0.13, name: "Ontario HST", details: "13% Harmonized Sales Tax" };
  }
  if (addr.includes("qc") || addr.includes("quebec") || addr.includes("montreal")) {
    return { rate: 0.14975, name: "Quebec GST + QST", details: "14.975% combined rate (5% GST + 9.975% QST)" };
  }
  if (addr.includes("usa") || addr.includes("united states") || addr.includes("ny") || addr.includes("new york")) {
    return { rate: 0.08875, name: "NY Sales Tax", details: "8.875% combined state and city sales tax" };
  }
  return { rate: 0.05, name: "Canada GST Only", details: "5% federal Goods and Services Tax" };
};

export default function Dashboard() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState(() => {
    const saved = localStorage.getItem('aura_businesses');
    return saved ? JSON.parse(saved) : []; // Starts empty (no company)
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('opscost_employees');
    return saved ? JSON.parse(saved) : []; // Starts empty (no employees)
  });

  useEffect(() => {
    localStorage.setItem('opscost_employees', JSON.stringify(employees));
  }, [employees]);

  // 5-Step Wizard Onboarding States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardCallingName, setWizardCallingName] = useState("");
  const [wizardSlug, setWizardSlug] = useState("");
  const [wizardIndustry, setWizardIndustry] = useState("");
  const [wizardBizEmail, setWizardBizEmail] = useState("");
  const [wizardBizPhone, setWizardBizPhone] = useState("");
  const [wizardStreetAddr, setWizardStreetAddr] = useState("");
  const [wizardCity, setWizardCity] = useState("");
  const [wizardProvince, setWizardProvince] = useState("");
  const [wizardPostalCode, setWizardPostalCode] = useState("");
  const [wizardCountry, setWizardCountry] = useState("");
  
  const plansList = [
    { id: "free", label: "Solo Free Plan", price: 0, services: "Core Drive, Public Job Board (Max 2 Employees)" },
    { id: "professional", label: "Professional Cloud Plan", price: 75, services: "Managed cloud infrastructure via Firebase. Standard tools, backups & analytics. ($75/mo per employee)" },
    { id: "sovereign", label: "Sovereign Local Node Plan", price: 55, services: "Host locally on your NAS (Pebble). 100% Data sovereignty, lower rate, linked IP network. ($55/mo per employee)" }
  ];
  const [selectedPlan, setSelectedPlan] = useState(plansList[1]); // Default to Professional Growth
  const [wizardSignature, setWizardSignature] = useState("");
  const [wizardAgreed, setWizardAgreed] = useState(false);
  
  const [wizardPrimaryColor, setWizardPrimaryColor] = useState("#6366f1");
  const [wizardWelcomeHeading, setWizardWelcomeHeading] = useState("Join our exceptional team");
  const [wizardWelcomeSubheading, setWizardWelcomeSubheading] = useState("We are looking for creative thinkers and problem solvers to help shape the future.");
  const [wizardThemeMode, setWizardThemeMode] = useState("light");
  const [wizardArchitecture, setWizardArchitecture] = useState("service_pro");
  const [wizardSubStep, setWizardSubStep] = useState("select"); // "select" or "customize"
  
  const [wizardAdminName, setWizardAdminName] = useState("");
  const [wizardAdminPassword, setWizardAdminPassword] = useState("");
  const [wizardAgreeToTerms, setWizardAgreeToTerms] = useState(false);
  const [isWizardSubmitting, setIsWizardSubmitting] = useState(false);

  // Stripe-like Upfront Payment Gateway Toggles & Webhook Dispatches
  const [newPaymentModal, setNewPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: "4242 4242 4242 4242", expiry: "12/28", cvc: "424", zip: "K1P 5M9" });
  const [pendingEmployee, setPendingEmployee] = useState(null); // buffer employee while card registers

  const [webhookEvents, setWebhookEvents] = useState(() => {
    const saved = localStorage.getItem('aura_webhook_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aura_webhook_events', JSON.stringify(webhookEvents));
  }, [webhookEvents]);

  // Employee Addition Dialog Form States
  const [newEmployeeModal, setNewEmployeeModal] = useState(false);
  const [empForm, setEmpForm] = useState({ name: "", email: "", role: "", department: "", phone: "", payType: "hourly", hourlyRate: "35", vacationBal: "40", sickBal: "40" });

  const [activePanel, setActivePanel] = useState('main');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [jobTab, setJobTab] = useState('All Jobs');
  const [empTab, setEmpTab] = useState('Overview');
  const [settingsTab, setSettingsTab] = useState('Pebble Settings');
  const [activeTier, setActiveTier] = useState('cloud');
  const [hasConnectedHub, setHasConnectedHub] = useState(false);
  const [showHubError, setShowHubError] = useState(false);
  const [hubInput, setHubInput] = useState('');
  const [posTab, setPosTab] = useState('Products');
  
  // Product Cost & Operations BOM Calculator States
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('opscost_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [selectedProductId, setSelectedProductId] = useState("prod-001");
  const [costTab, setCostTab] = useState("cost");
  const [searchQuery, setSearchQuery] = useState("");
  const [newProductModal, setNewProductModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [pointForm, setPointForm] = useState({ text: "", lowBudget: "", highBudget: "" });

  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem('opscost_milestones');
    const DEFAULT_MILESTONES = [
      { id: "m-1", title: "1-Year Anniversary Gala & Staff Banquet", category: "Event", lowBudget: 3000, highBudget: 6000, targetDate: "July 15, 2026", notes: "Celebrate local business growth with staff, plumbing partners, and loyal community clients." },
      { id: "m-2", title: "Annual Christmas Staff Dinner & Outing", category: "Internal Event", lowBudget: 1500, highBudget: 3000, targetDate: "December 18, 2026", notes: "Reward technicians and field operations staff with holiday bonuses and dinner." },
      { id: "m-3", title: "Scale to 1,000 Client Accounts Milestone", category: "Operational Goal", lowBudget: 5000, highBudget: 10000, targetDate: "March 30, 2027", notes: "Marketing outreach and local plumbing loyalty promotions to secure client base." },
      { id: "m-4", title: "Local Hospital Charity Donation & Golf Event", category: "Charity & Donation", lowBudget: 2500, highBudget: 5000, targetDate: "September 10, 2026", notes: "Sponsor a hole at the community tournament and donate portion of winter plumbing profits." }
    ];
    return saved ? JSON.parse(saved) : DEFAULT_MILESTONES;
  });

  const [newMilestoneModal, setNewMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", category: "Event", lowBudget: "", highBudget: "", targetDate: "", notes: "" });

  const [regionalConfig, setRegionalConfig] = useState(() => {
    const saved = localStorage.getItem('opscost_regional_config');
    const DEFAULT_CONFIG = {
      currency: "CAD",
      country: "Canada",
      targetCountry: "United States",
      federalTaxRate: "5", // % (like GST)
      provincialTaxRate: "8", // % (like PST/HST ON)
      taxId: "CRA-837482910-RT0001",
      legalStructure: "Corporation"
    };
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [newRegionalModal, setNewRegionalModal] = useState(false);
  const [regionalForm, setRegionalForm] = useState({
    currency: "CAD",
    country: "Canada",
    targetCountry: "United States",
    federalTaxRate: "5",
    provincialTaxRate: "8",
    taxId: "CRA-837482910-RT0001",
    legalStructure: "Corporation"
  });

  useEffect(() => {
    localStorage.setItem('opscost_regional_config', JSON.stringify(regionalConfig));
  }, [regionalConfig]);

  // Form States for BOM calculator
  const [matForm, setMatForm] = useState({ material_name: "", quantity: "", unit: "", cost_per_unit: "", supplier: "", notes: "" });
  const [matSaving, setMatSaving] = useState(false);
  const [laborForm, setLaborForm] = useState({ role_name: "", hours_per_unit: "", hourly_rate: "", num_workers: "" });
  const [laborSaving, setLaborSaving] = useState(false);
  const [extSaving, setExtSaving] = useState(false);
  const [prodForm, setProdForm] = useState({ name: "", sku: "", category: "Goods & Accessories", selling_price: "" });

  const [blueprintTab, setBlueprintTab] = useState('Business Overview');
  const [roadmap, setRoadmap] = useState(INITIAL_ROADMAP);
  const [marketGrowth, setMarketGrowth] = useState(5);
  const [seasonality, setSeasonality] = useState(INITIAL_SEASONALITY);
  
  // G7 Corporate Treasury States
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [agents, setAgents] = useState(AGENTS);
  const [balance, setBalance] = useState(45230.15);
  const [speed, setSpeed] = useState(2);
  const [logs, setLogs] = useState([
    "[System Initialization] Core G7 compliance node initialized in Ottawa, CA.",
    "[Audit Compliance] Standard Ontario-G7 corporate compliance standards verified.",
    "[AURA Ledger] Ledger block TX-1042 signed cryptographic confirmation."
  ]);
  const [ledgerBlocks, setLedgerBlocks] = useState([
    { block: 1042, hash: "REF-9281a", type: "Enterprise Service Invoice Payout", amount: "$5,820.00 CAD", status: "Settled", time: "10 min ago" },
    { block: 1041, hash: "REF-8422f", type: "Ottawa Corporate Office Rental Payout", amount: "-$1,250.00 CAD", status: "Settled", time: "18 min ago" },
    { block: 1040, hash: "REF-7381d", type: "Node Lease - Montreal Server Cluster", amount: "-$75.00 CAD", status: "Settled", time: "1 hour ago" }
  ]);
  const [sigSigned, setSigSigned] = useState(true);

  // AI Simulated Agent Audits (Uptime & Safety Indicators)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeBots = agents.filter(a => a.active);
      if (activeBots.length === 0) return;

      const randomAgent = activeBots[Math.floor(Math.random() * activeBots.length)];

      setAgents(prev => prev.map(a => {
        if (a.id === randomAgent.id) {
          const fakeLoad = Math.floor(Math.random() * 15) + 3 + "%";
          const freshLog = `Compliance check complete at sequence: ${Math.floor(Math.random() * 9000 + 1000)}`;
          return { ...a, load: fakeLoad, logs: [freshLog, ...a.logs.slice(0, 1)] };
        }
        return a;
      }));

    }, 6000 / speed);
    return () => clearInterval(interval);
  }, [agents, speed]);

  // Sync G7 Server Nodes dynamically to Client Billing Address
  useEffect(() => {
    const defaultNodes = [
      { id: "ottawa", city: "Ottawa", country: "Canada", ip: "142.122.9.21", ping: "22ms", compliance: "100%", status: "Active", primary: true, details: "HQ Sovereign Controller" }
    ];
    
    const clientRegionStr = (selectedClient?.address || selectedBusiness?.name || '').toLowerCase();
    
    if (clientRegionStr.includes('usa') || clientRegionStr.includes('new york') || clientRegionStr.includes('us')) {
      defaultNodes.push({ id: "usa", city: "New York", country: "United States", ip: "62.4.119.54", ping: "74ms", compliance: "99.5%", status: "Active", primary: false, details: "US Sovereign Relay" });
    } else if (clientRegionStr.includes('quebec') || clientRegionStr.includes('montreal')) {
      defaultNodes.push({ id: "quebec", city: "Quebec", country: "Canada", ip: "192.16.88.105", ping: "38ms", compliance: "98.9%", status: "Active", primary: false, details: "Francophone Hub" });
    } else {
      defaultNodes.push({ id: "toronto", city: "Toronto", country: "Canada", ip: "192.16.88.105", ping: "38ms", compliance: "98.9%", status: "Active", primary: false, details: "Local Failover Hub" });
    }
    
    setNodes(defaultNodes);
  }, [selectedClient, selectedBusiness]);

  const EMP_TABS = ['Overview', 'Identity', 'Employment', 'Pay', 'Time Off', 'Audit Log'];
  const SETTINGS_TABS = ['Pebble Settings', 'Account Settings', 'True Oath API Settings', 'Payment and Billing', 'Others'];
  const navigate = useNavigate();

  const financials = useMemo(() => {
    const baseAnnualRevenue = 1800000; 
    const baseExpenses = 1200000;
    const growthFactor = 1 + (marketGrowth / 100);
    const adjustedRevenue = baseAnnualRevenue * growthFactor;
    const adjustedExpenses = baseExpenses * (1 + (marketGrowth * 0.02 / 100)); 
    const monthlyBaseRev = adjustedRevenue / 12;
    const monthlyData = MONTHS.map((name, i) => {
      const rawVal = seasonality[i];
      const mult = (rawVal === '.' || rawVal === '' || rawVal === undefined) ? 1.0 : (parseFloat(rawVal) || 0);
      return {
        name,
        revenue: monthlyBaseRev * mult,
        profit: (monthlyBaseRev * mult) - (adjustedExpenses / 12)
      };
    });
    const totalRevenue = monthlyData.reduce((acc, m) => acc + (parseFloat(m.revenue) || 0), 0);
    const totalProfit = totalRevenue - adjustedExpenses;
    return { totalRevenue, totalProfit, adjustedExpenses, monthlyData };
  }, [marketGrowth, seasonality]);

  const activeTax = useMemo(() => {
    const address = selectedClient ? selectedClient.address : (selectedBusiness ? selectedBusiness.name : '');
    return getClientTaxRate(address);
  }, [selectedClient, selectedBusiness]);

  // Save entire portfolio to localStorage on change
  useEffect(() => {
    localStorage.setItem('opscost_products', JSON.stringify(products));
  }, [products]);

  // Current active product
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Safe getter helper: gets fields dynamically from the active product
  const EF = (field) => {
    if (!selectedProduct) return "";
    const val = selectedProduct[field];
    return val !== undefined ? val : "";
  };

  // Safe setter helper: updates fields on-the-fly for the active product
  const setEF = (field, value) => {
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // --- ACTIONS ---
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.selling_price) {
      triggerToast("Please provide product name and base selling price.", "error");
      return;
    }
    const newId = `prod-${Date.now()}`;
    const newProd = {
      id: newId,
      name: prodForm.name,
      sku: prodForm.sku || `SKU-${Math.floor(Math.random()*10000)}`,
      category: prodForm.category,
      selling_price: parseFloat(prodForm.selling_price) || 0,
      overhead_cost_cents: 0,
      packaging_cost_cents: 0,
      shipping_inbound_cents: 0,
      materials: [],
      labor: [],
      
      supplier_name: "",
      supplier_url: "",
      supplier_contact: "",
      supplier_lead_days: 7,
      order_frequency: "on-demand",
      last_ordered_at: "",
      next_expected_at: "",
      delivery_notes: "",

      client_access: true,
      employee_access: true,
      manager_access: true,
      admin_only: false,
      restricted_notes: "",

      requires_certification: false,
      inspection_required: false,
      expiry_tracking: false,
      perishable: false,
      certification_notes: "",
      legal_restrictions: "",
      regulatory_notes: ""
    };

    setProducts(prev => [...prev, newProd]);
    setSelectedProductId(newId);
    setNewProductModal(false);
    setProdForm({ name: "", sku: "", category: "Goods & Accessories", selling_price: "" });
    triggerToast(`"${newProd.name}" created successfully!`);
  };

  const addMaterial = () => {
    if (!matForm.material_name) return;
    setMatSaving(true);
    
    setTimeout(() => {
      const newMaterial = {
        id: `mat-${Date.now()}`,
        material_name: matForm.material_name,
        quantity: parseFloat(matForm.quantity) || 1,
        unit: matForm.unit || "unit",
        cost_per_unit: parseFloat(matForm.cost_per_unit) || 0,
        supplier: matForm.supplier || "",
        notes: matForm.notes || ""
      };

      setProducts(prev => prev.map(p => {
        if (p.id === selectedProductId) {
          return {
            ...p,
            materials: [...(p.materials || []), newMaterial]
          };
        }
        return p;
      }));

      setMatForm({
        material_name: "",
        quantity: "",
        unit: "",
        cost_per_unit: "",
        supplier: "",
        notes: ""
      });
      setMatSaving(false);
      triggerToast("Added material to bill of materials.");
    }, 400);
  };

  const deleteMaterial = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        return {
          ...p,
          materials: (p.materials || []).filter(m => m.id !== id)
        };
      }
      return p;
    }));
    triggerToast("Material removed.", "info");
  };

  const addLabor = () => {
    if (!laborForm.role_name) return;
    setLaborSaving(true);

    setTimeout(() => {
      const newLabor = {
        id: `lab-${Date.now()}`,
        role_name: laborForm.role_name,
        hours_per_unit: parseFloat(laborForm.hours_per_unit) || 0,
        hourly_rate: parseFloat(laborForm.hourly_rate) || 0,
        num_workers: parseInt(laborForm.num_workers) || 1
      };

      setProducts(prev => prev.map(p => {
        if (p.id === selectedProductId) {
          return {
            ...p,
            labor: [...(p.labor || []), newLabor]
          };
        }
        return p;
      }));

      setLaborForm({
        role_name: "",
        hours_per_unit: "",
        hourly_rate: "",
        num_workers: ""
      });
      setLaborSaving(false);
      triggerToast("Added labor allocation role.");
    }, 400);
  };

  const deleteLabor = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        return {
          ...p,
          labor: (p.labor || []).filter(l => l.id !== id)
        };
      }
      return p;
    }));
    triggerToast("Labor role allocation removed.", "info");
  };

  const saveExt = (fields) => {
    setExtSaving(true);
    setTimeout(() => {
      setProducts(prev => prev.map(p => {
        if (p.id === selectedProductId) {
          return { ...p, ...fields };
        }
        return p;
      }));
      setExtSaving(false);
      triggerToast("Saved settings & parameters successfully!");
    }, 500);
  };

  const deleteActiveProduct = () => {
    if (products.length <= 1) {
      triggerToast("Cannot delete the only remaining product.", "error");
      return;
    }
    const name = selectedProduct.name;
    const remaining = products.filter(p => p.id !== selectedProductId);
    setProducts(remaining);
    setSelectedProductId(remaining[0].id);
    triggerToast(`"${name}" was deleted.`, "info");
  };

  // --- CALCULATIONS (USING YOUR SPECIFIED FORMULAS) ---
  const materials = selectedProduct?.materials || [];
  const labor = selectedProduct?.labor || [];

  const matTotal = materials.reduce((acc, m) => {
    return acc + (parseFloat(m.quantity || 1) * parseFloat(m.cost_per_unit || 0));
  }, 0);

  const laborTotal = labor.reduce((acc, l) => {
    return acc + (parseFloat(l.hours_per_unit || 0) * parseFloat(l.hourly_rate || 0) * (parseInt(l.num_workers) || 1));
  }, 0);

  const overhead = (parseFloat(EF("overhead_cost_cents")) || 0) / 100;
  const packaging = (parseFloat(EF("packaging_cost_cents")) || 0) / 100;
  const shipping = (parseFloat(EF("shipping_inbound_cents")) || 0) / 100;

  const trueCost = matTotal + laborTotal + overhead + packaging + shipping;
  const sellingPrice = parseFloat(selectedProduct?.selling_price || 0);
  const margin = sellingPrice > 0 ? ((sellingPrice - trueCost) / sellingPrice) * 100 : 0;
  const priceDisplay = `$${sellingPrice.toFixed(2)}`;

  // Filtered products list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- STYLING DEFINITIONS (PRESERVING YOUR PATTERNS BUT ELEVATING TO MODERN STANDARD) ---
  const sCard = "bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6";
  const sLabel = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1";
  const sInput = "w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder-slate-400";
  
  const sSection = (title) => (
    <div className="flex items-center gap-2 mb-3 mt-4">
      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">{title}</h3>
    </div>
  );

  // Copy product report structure
  const copyFormattedReport = () => {
    const reportText = `
OpsCost Pro Operational Report
--------------------------------------
Product: ${selectedProduct.name}
SKU: ${selectedProduct.sku}
Category: ${selectedProduct.category}
Base Selling Price: $${sellingPrice.toFixed(2)}

Cost Summary:
- Materials Cost: $${matTotal.toFixed(2)}
- Labor Cost: $${laborTotal.toFixed(2)}
- Overhead & Logistics: $${(overhead+packaging+shipping).toFixed(2)}
--------------------------------------
TRUE COST / UNIT: $${trueCost.toFixed(2)}
GROSS MARGIN: ${margin.toFixed(1)}%
PROFIT MARGIN: $${(sellingPrice - trueCost).toFixed(2)}

Supply Chain:
- Primary Supplier: ${EF("supplier_name") || "N/A"}
- Lead Time: ${EF("supplier_lead_days") || "7"} days
- Order Interval: ${EF("order_frequency") || "On Demand"}

Access Control Checklist:
- Clients: ${EF("client_access") ? "Authorized" : "Restricted"}
- Employees: ${EF("employee_access") ? "Authorized" : "Restricted"}
- Managers: ${EF("manager_access") ? "Authorized" : "Restricted"}
- Admins Only: ${EF("admin_only") ? "Authorized Only" : "Standard"}

Report Generated on: ${new Date().toLocaleDateString("en-US")}
    `.trim();

    // Use document.execCommand fallback as requested for iframe support
    const tempEl = document.createElement("textarea");
    tempEl.value = reportText;
    document.body.appendChild(tempEl);
    tempEl.select();
    try {
      document.execCommand('copy');
      triggerToast("Formatted specifications copied to clipboard!");
    } catch (err) {
      triggerToast("Clipboard copy failed.", "error");
    }
    document.body.removeChild(tempEl);
  };


  const updateRoadmap = (field, value) => {
    setRoadmap(prev => ({ ...prev, [field]: value }));
  };

  const addPointGoal = (type) => {
    if (!pointForm.text.trim()) {
      triggerToast("Please enter a milestone description.", "error");
      return;
    }
    const pointsField = `${type}_points`;
    const newItem = {
      text: pointForm.text.trim(),
      lowBudget: pointForm.lowBudget || "0",
      highBudget: pointForm.highBudget || "0"
    };
    setRoadmap(prev => ({
      ...prev,
      [pointsField]: [...(prev[pointsField] || []), newItem]
    }));
    setPointForm({ text: "", lowBudget: "", highBudget: "" });
    triggerToast("Milestone added to list!");
  };

  const deletePointGoal = (type, index) => {
    const pointsField = `${type}_points`;
    setRoadmap(prev => ({
      ...prev,
      [pointsField]: (prev[pointsField] || []).filter((_, idx) => idx !== index)
    }));
    triggerToast("Milestone removed.");
  };

  useEffect(() => {
    localStorage.setItem('opscost_milestones', JSON.stringify(milestones));
  }, [milestones]);

  const handleAddMilestone = (e) => {
    if (e) e.preventDefault();
    if (!milestoneForm.title.trim()) {
      triggerToast("Please enter a milestone title.", "error");
      return;
    }
    const newM = {
      id: `m-${Date.now()}`,
      title: milestoneForm.title.trim(),
      category: milestoneForm.category,
      lowBudget: Number(milestoneForm.lowBudget) || 0,
      highBudget: Number(milestoneForm.highBudget) || 0,
      targetDate: milestoneForm.targetDate.trim() || "TBD",
      notes: milestoneForm.notes.trim() || ""
    };
    setMilestones(prev => [newM, ...prev]);
    setMilestoneForm({ title: "", category: "Event", lowBudget: "", highBudget: "", targetDate: "", notes: "" });
    setNewMilestoneModal(false);
    triggerToast("Corporate milestone added successfully!");
  };

  const handleDeleteMilestone = (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    triggerToast("Milestone removed.");
  };

  const handleSaveRegionalConfig = (e) => {
    if (e) e.preventDefault();
    setRegionalConfig({ ...regionalForm });
    setNewRegionalModal(false);
    triggerToast("Corporate regional tax settings updated!");
  };

  // Onboarding Wizard - Pre-populate with beautiful, functional sandbox parameters
  const loadDemoData = () => {
    setWizardName("Bouchard Consulting Inc.");
    setWizardCallingName("Bouchard Consulting");
    setWizardSlug("bouchard-consulting");
    setWizardIndustry("Consulting & Advisory");
    setWizardBizEmail("contact@bouchard.co");
    setWizardBizPhone("+1 (613) 555-0100");
    setWizardStreetAddr("123 O'Connor St, Suite 400");
    setWizardCity("Ottawa");
    setWizardProvince("ON");
    setWizardPostalCode("K1P 5M9");
    setWizardCountry("Canada");
    setWizardWelcomeHeading("Elevate your career with Bouchard");
    setWizardWelcomeSubheading("We are looking for creative thinkers and problem solvers to help shape the future.");
    setWizardSignature("Arthur Bouchard");
    setWizardAgreed(true);
    setWizardAdminName("Arthur Bouchard");
    setWizardAdminPassword("SovereignNode2026!");
    setWizardAgreeToTerms(true);
    triggerToast("Demo parameters loaded! Switch through steps to review.");
  };

  const handleLaunchPortal = (e) => {
    if (e) e.preventDefault();
    setIsWizardSubmitting(true);

    // Simulate SSL & DNS container provisioning
    setTimeout(() => {
      setIsWizardSubmitting(false);
      
      const newBiz = {
        id: `b_${wizardSlug || Date.now()}`,
        name: wizardName,
        callingName: wizardCallingName || wizardName,
        slug: wizardSlug,
        industry: wizardIndustry,
        email: wizardBizEmail,
        phone: wizardBizPhone,
        address: `${wizardStreetAddr}, ${wizardCity}, ${wizardProvince} ${wizardPostalCode}, ${wizardCountry}`,
        revenue: selectedPlan.id === "free" ? "$0" : (selectedPlan.id === "professional" ? "$8,450" : "$14,230"),
        status: "Active",
        color: wizardPrimaryColor,
        plan: selectedPlan.id,
        adminName: wizardAdminName,
        signature: wizardSignature,
        themeMode: wizardThemeMode,
        welcomeHeading: wizardWelcomeHeading,
        welcomeSubheading: wizardWelcomeSubheading
      };

      setBusinesses(prev => {
        const updated = [...prev, newBiz];
        localStorage.setItem('aura_businesses', JSON.stringify(updated));
        return updated;
      });

      // Synchronize regional settings immediately to match the newly deployed business
      const newConfig = {
        currency: selectedPlan.id === "free" ? "CAD" : (wizardCountry.toLowerCase().includes("us") ? "USD" : "CAD"),
        country: wizardCountry || "Canada",
        targetCountry: wizardCountry.toLowerCase().includes("us") ? "Canada" : "United States",
        federalTaxRate: wizardCountry.toLowerCase().includes("us") ? "0" : "5",
        provincialTaxRate: wizardCountry.toLowerCase().includes("us") ? "8.875" : "8",
        taxId: wizardCountry.toLowerCase().includes("us") ? "EIN-837482910" : "CRA-837482910-RT0001",
        legalStructure: "Corporation"
      };
      setRegionalConfig(newConfig);
      setRegionalForm(newConfig);

      // Trigger Webhook audit log event for new deployment
      const initialEvents = [
        {
          id: `wh-${Date.now()}-1`,
          event: "customer.created",
          timestamp: new Date().toLocaleTimeString(),
          details: `SSO Profile created for ${wizardAdminName} (${wizardBizEmail})`,
          status: "delivered"
        },
        {
          id: `wh-${Date.now()}-2`,
          event: "subscription.created",
          timestamp: new Date().toLocaleTimeString(),
          details: `Active subscription started for tier [${selectedPlan.label}]`,
          status: "delivered"
        }
      ];
      setWebhookEvents(initialEvents);

      // Reset Wizard
      setIsWizardOpen(false);
      setWizardStep(1);
      setWizardName("");
      setWizardCallingName("");
      setWizardSlug("");
      setWizardIndustry("");
      setWizardBizEmail("");
      setWizardBizPhone("");
      setWizardStreetAddr("");
      setWizardCity("");
      setWizardProvince("");
      setWizardPostalCode("");
      setWizardCountry("");
      setWizardSignature("");
      setWizardAgreed(false);
      setWizardAdminName("");
      setWizardAdminPassword("");
      setWizardAgreeToTerms(false);

      // Auto-focus and select
      setSelectedBusiness(newBiz);
      setActivePanel('main');
      triggerToast("Sovereign business network deployed!");
    }, 2000);
  };

  // Intercept employee creation if adding the 3rd employee
  const handleSaveEmployee = (e) => {
    if (e) e.preventDefault();
    if (!empForm.name || !empForm.email) {
      triggerToast("Please provide employee name and email address.", "error");
      return;
    }

    const newEmp = {
      id: `e-${Date.now()}`,
      name: empForm.name,
      email: empForm.email,
      role: empForm.role || "Technician",
      department: empForm.department || "Field Services",
      phone: empForm.phone || "(555) 010-0220",
      status: "active",
      hiredAt: new Date().toISOString().split('T')[0],
      payType: empForm.payType,
      hourlyRate: parseFloat(empForm.hourlyRate) || 25,
      ytdGross: 0,
      vacationBal: parseInt(empForm.vacationBal) || 40,
      sickBal: parseInt(empForm.sickBal) || 40
    };

    // UPFRONT BILLING THRESHOLD INTERCEPTION:
    // If the roster has 2 or more employees, adding a 3rd requires upfront subscription payment card authorization!
    if (employees.length >= 2) {
      setPendingEmployee(newEmp);
      setNewEmployeeModal(false);
      setNewPaymentModal(true); // Fire CC Billing overlay!
      triggerToast("Roster threshold exceeded. Upfront payment authorization required.", "warning");
    } else {
      // Free addition (under 2 employees)
      setEmployees(prev => [...prev, newEmp]);
      setNewEmployeeModal(false);
      setEmpForm({ name: "", email: "", role: "", department: "", phone: "", payType: "hourly", hourlyRate: "35", vacationBal: "40", sickBal: "40" });
      triggerToast("Employee added to free roster tier!");
    }
  };

  // Process Credit Card Payment and fire Webhooks
  const handleProcessCCPayment = (e) => {
    if (e) e.preventDefault();
    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setNewPaymentModal(false);

      let finalEmployee = pendingEmployee;
      if (pendingEmployee) {
        // Complete the roster addition
        setEmployees(prev => [...prev, pendingEmployee]);
        finalEmployee = pendingEmployee;
        setPendingEmployee(null);
      } else {
        // If they just upgraded via payments setting tab
        finalEmployee = { name: "Billing Authorized Profile" };
      }

      // Upgrade active business tier to "Professional Growth" dynamically!
      if (selectedBusiness) {
        const upgraded = { ...selectedBusiness, plan: "professional", revenue: "$24,580", status: "Active" };
        setSelectedBusiness(upgraded);
        setBusinesses(prev => prev.map(b => b.id === selectedBusiness.id ? upgraded : b));
      }

      // Add a paid ledger item to the Corporate Financial Ledger!
      const newBlock = {
        block: ledgerBlocks.length + 1043,
        hash: `TX-${Math.random().toString(36).substring(2, 7)}`,
        type: `Subscription Activation - Professional Cloud Upgrade Upfront (${finalEmployee.name})`,
        amount: `$75.00 ${regionalConfig.currency}`,
        status: "Settled",
        time: "Just now"
      };
      setLedgerBlocks(prev => [newBlock, ...prev]);

      // Fire Stripe Webhook Logs
      const freshEvents = [
        {
          id: `wh-${Date.now()}-a`,
          event: "payment_intent.succeeded",
          timestamp: new Date().toLocaleTimeString(),
          details: `Upfront subscription charge of $75.00 ${regionalConfig.currency} succeeded (Visa **** 4242)`,
          status: "delivered"
        },
        {
          id: `wh-${Date.now()}-b`,
          event: "customer.subscription.updated",
          timestamp: new Date().toLocaleTimeString(),
          details: `Subscription tier upgraded to [Professional Cloud Plan]`,
          status: "delivered"
        },
        {
          id: `wh-${Date.now()}-c`,
          event: "invoice.payment_succeeded",
          timestamp: new Date().toLocaleTimeString(),
          details: `Invoice INV-2026-UPFRONT marked as PAID. Roster limit unlocked.`,
          status: "delivered"
        }
      ];
      setWebhookEvents(prev => [...freshEvents, ...prev]);

      triggerToast("Payment captured successfully! Professional Roster Activated.");
    }, 2500);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (selectedEmployee?.id === id) setSelectedEmployee(null);
    triggerToast("Employee removed from roster.");
  };

  const systemLinks = [
    { title: 'Business Blueprint', desc: 'Plan & Financials', icon: BookOpen, action: 'blueprint', color: 'text-slate-600', bg: 'bg-slate-100', completed: true },
    { title: 'POS Settings', desc: 'Add items & customize', icon: ShoppingCart, action: 'pos', color: 'text-emerald-600', bg: 'bg-emerald-100', completed: false },
    { title: 'Pebble Settings', desc: 'Link personal devices', icon: Zap, action: 'pebble', color: 'text-cyan-600', bg: 'bg-cyan-100', completed: false },
  ];

  const portalLinks = [
    { title: 'Client Portal', desc: 'Templates & Webhooks', icon: Users, action: 'client_portal', color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'True Oath / Staff', desc: 'Security & pass resets', icon: ShieldCheck, action: 'staff_portal', color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-8">
      
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-slate-900">AURA<span className="font-light text-slate-500">Sovereign</span></h1>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Master Selector</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-slate-900">Bill Jenkins</p>
            <p className="text-xs text-slate-500">Enterprise Owner</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
            <img src="https://ui-avatars.com/api/?name=Bill+Jenkins&background=6366f1&color=fff" alt="Bill" />
          </div>
          <button 
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-500 hover:text-sky-600 flex items-center justify-center font-black text-2xl cursor-pointer transition-all border-0 shadow-sm shadow-sky-50 shrink-0 ml-2"
            title="Provision New Business"
          >
            +
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tight">Welcome back, Bill.</h2>
        <p className="text-lg text-slate-500 mb-10">Select a business from your portfolio to access its systems.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Dynamic Business Cards */}
          {businesses.map(b => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={b.id} 
              onClick={() => setSelectedBusiness(b)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-bl-full transition-transform group-hover:scale-150" style={{ from: b.color || '#6366f1', to: '#000' }} />
              
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: (b.color || '#6366f1') + '15', color: b.color || '#6366f1' }}>
                <Building2 className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-1 text-slate-900">{b.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">ID: {b.id}</p>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <div>
                  <p className="text-xs text-slate-500">30-Day Revenue</p>
                  <p className="font-bold text-slate-900">{b.revenue || "$0"}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.plan === 'free' ? 'bg-slate-100 text-slate-650' : 'bg-emerald-100 text-emerald-700'}`}>
                  {b.plan === 'free' ? 'Solo Free' : 'Active'}
                </div>
              </div>
            </motion.div>
          ))}
 
          {/* Create New Business Card Trigger */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="rounded-2xl p-6 border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center text-center min-h-[250px] group bg-white"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">Create New Business</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">Deploy a new architecture to the Sovereign network.</p>
          </motion.div>

        </div>
      </main>

      {/* Modal Overlay for Selected Business */}
      <AnimatePresence>
        {selectedBusiness && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBusiness(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              style={{ minHeight: '600px' }}
            >
              <AnimatePresence mode="wait">
                {activePanel === 'main' ? (
                  <motion.div 
                    key="main"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 blur-3xl rounded-full" />
                <h2 className="text-3xl font-black mb-1 relative z-10">{selectedBusiness.name}</h2>
                <p className="text-slate-400 relative z-10 mb-6">Accessing architecture for ID: {selectedBusiness.id}</p>
                
                {/* Global Business Integrity Score */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col w-56">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Integrity Score</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white">1,240</span>
                       <span className="text-sm text-emerald-400 font-bold">IP</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                       <div className="bg-emerald-400 h-full w-[24%]" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 mt-2">1,260 IP to Level 3 ($50/mo)</span>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col w-48">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Current Tier</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-emerald-400">$65</span>
                       <span className="text-sm text-slate-400 font-bold">/mo</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold mt-3 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Level 2 Unlocked</span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                  <button onClick={() => navigate(`/business_overlook?business_id=${selectedBusiness.id}`)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-full text-sm transition-colors shadow-lg shadow-indigo-900/50">
                    <Map className="w-4 h-4" /> Business Overlook
                  </button>
                  <button onClick={() => navigate(`/pnl?business_id=${selectedBusiness.id}`)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-sm transition-colors shadow-lg shadow-emerald-900/50">
                    <DollarSign className="w-4 h-4" /> P&L
                  </button>
                  <button onClick={() => { setSelectedBusiness(null); setActivePanel('main'); }} className="text-slate-400 hover:text-white font-bold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm backdrop-blur-md transition-colors">Close</button>
                </div>
              </div>
              
              <div className="p-8">
                {/* System Operations */}
                <div className="mb-8">
                  <p className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">System Operations</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {systemLinks.map((link) => (
                      <div 
                        key={link.title}
                        onClick={() => setActivePanel(link.action)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all group cursor-pointer bg-white relative overflow-hidden"
                      >
                        {link.completed && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg} ${link.color}`}>
                          <link.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {link.title}
                          </h4>
                          <p className="text-xs text-slate-500">{link.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portal Configurations */}
                <div>
                  <p className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Portal Configurations</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portalLinks.map((link) => (
                      <div 
                        key={link.title}
                        onClick={() => setActivePanel(link.action)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all group cursor-pointer bg-white"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg} ${link.color}`}>
                          <link.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {link.title} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </h4>
                          <p className="text-xs text-slate-500">{link.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="panel"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                    className="w-full h-full bg-white flex flex-col absolute inset-0"
                  >
                    {activePanel !== 'blueprint' && activePanel !== 'pos' && (
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900">
                          {activePanel === 'staff_portal' && 'True Oath Auth Engine'}
                          {activePanel === 'client_portal' && 'Client Portal Configuration'}
                          {activePanel === 'pebble' && 'Pebble Settings'}
                        </h2>
                        <button onClick={() => setActivePanel('main')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                          Back to Dashboard
                        </button>
                      </div>
                    )}
                    <div className={activePanel === 'blueprint' || activePanel === 'pos' ? "w-full h-full flex flex-col flex-1 overflow-hidden" : "p-8 flex-1"}>
                      {activePanel === 'staff_portal' ? (
                        <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[500px] relative">
                           {/* Left Pane: Roster */}
                           <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                              <div className="p-4 border-b border-slate-200">
                                <div className="relative">
                                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input type="text" placeholder="Search employees..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto">
                                {employees.length === 0 ? (
                                  <div className="p-8 text-center text-slate-400">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
                                    <p className="text-[10px] font-black uppercase text-slate-500">Roster Empty</p>
                                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">No active team members. Click the button below to register a technician.</p>
                                  </div>
                                ) : (
                                  employees.map(emp => (
                                    <div 
                                      key={emp.id} 
                                      onClick={() => setSelectedEmployee(emp)}
                                      className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedEmployee?.id === emp.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100'}`}
                                    >
                                      <h4 className="font-bold text-slate-900">{emp.name}</h4>
                                      <p className="text-xs text-slate-500">{emp.role}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                                <button 
                                  onClick={() => {
                                    setEmpForm({ name: "", email: "", role: "", department: "", phone: "", payType: "hourly", hourlyRate: "35", vacationBal: "40", sickBal: "40" });
                                    setNewEmployeeModal(true);
                                  }}
                                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border-0"
                                >
                                  <PlusIcon size={12} /> Add Employee
                                </button>
                              </div>
                           </div>

                          {/* Right Pane: Details */}
                          <div className="w-2/3 flex flex-col bg-white overflow-hidden">
                             {selectedEmployee ? (
                                <div className="flex flex-col h-full">
                                  {/* Header */}
                                  <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shrink-0">
                                    <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/20">
                                        <span className="text-xl font-black">{selectedEmployee.name.charAt(0)}</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <h2 className="text-xl font-black">{selectedEmployee.name}</h2>
                                          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedEmployee.status}</span>
                                        </div>
                                        <p className="text-sm text-indigo-200">{selectedEmployee.role} · {selectedEmployee.department}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-slate-300">
                                          <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {selectedEmployee.email}</span>
                                          <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {selectedEmployee.phone}</span>
                                          <span className="text-emerald-400 font-bold">${selectedEmployee.hourlyRate}/hr</span>
                                        </div>
                                      </div>
                                      <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Edit</button>
                                    </div>
                                  </div>
                                  
                                  {/* Tabs */}
                                  <div className="flex px-6 pt-4 border-b border-slate-200 bg-slate-50 shrink-0 gap-6 overflow-x-auto scrollbar-hide">
                                     {EMP_TABS.map(tab => (
                                       <button 
                                         key={tab}
                                         onClick={() => setEmpTab(tab)}
                                         className={`text-sm font-bold pb-3 border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${empTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'}`}
                                       >
                                         {tab}
                                       </button>
                                     ))}
                                  </div>

                                  {/* Content */}
                                  <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
                                     {empTab === 'Overview' && (
                                        <div className="space-y-6">
                                          <div className="grid grid-cols-4 gap-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                                              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Vacation Left</p>
                                              <p className="text-xl font-black text-blue-600 mt-1">{selectedEmployee.vacationBal}h</p>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                                              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Sick Left</p>
                                              <p className="text-xl font-black text-emerald-600 mt-1">{selectedEmployee.sickBal}h</p>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Personal Left</p>
                                              <p className="text-xl font-black text-amber-600 mt-1">16h</p>
                                            </div>
                                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                                              <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">YTD Gross</p>
                                              <p className="text-xl font-black text-purple-600 mt-1">${selectedEmployee.ytdGross.toLocaleString()}</p>
                                            </div>
                                          </div>

                                          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Employment Summary</h4>
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase w-32">Role</span>
                                                <span className="text-sm font-bold text-slate-900 flex-1">{selectedEmployee.role}</span>
                                              </div>
                                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase w-32">Department</span>
                                                <span className="text-sm font-bold text-slate-900 flex-1">{selectedEmployee.department}</span>
                                              </div>
                                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase w-32">Employee ID</span>
                                                <span className="text-sm font-bold text-slate-900 font-mono flex-1">{selectedEmployee.id}</span>
                                              </div>
                                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase w-32">Hired</span>
                                                <span className="text-sm font-bold text-slate-900 flex-1">{selectedEmployee.hiredAt}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                     )}
                                     {empTab !== 'Overview' && (
                                       <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                         <ShieldCheck className="w-12 h-12 mb-4 text-slate-200" />
                                         <p className="italic">{empTab} panel is ready for integration.</p>
                                       </div>
                                     )}
                                  </div>
                                </div>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                                   <Users className="w-12 h-12 mb-4 text-slate-200" />
                                   <p className="italic">Select an employee from the roster to view details.</p>
                                </div>
                             )}
                          </div>
                        </div>
                      ) : activePanel === 'client_portal' ? (
                        <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[500px] relative">
                          {/* Left Pane: Roster */}
                          <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                            <div className="p-4 border-b border-slate-200">
                               <div className="relative">
                                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                 <input type="text" placeholder="Search clients..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                               </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              {DUMMY_CLIENTS.map(client => (
                                 <div 
                                   key={client.id} 
                                   onClick={() => setSelectedClient(client)}
                                   className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100'}`}
                                 >
                                   <h4 className="font-bold text-slate-900">{client.name}</h4>
                                   <p className="text-xs text-slate-500">{client.email}</p>
                                 </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Right Pane: Details */}
                          <div className="w-2/3 p-6 flex flex-col bg-white overflow-y-auto">
                             {selectedClient ? (
                                <>
                                  <div className="flex justify-between items-start mb-6">
                                    <div>
                                      <h2 className="text-2xl font-black text-slate-900">{selectedClient.name}</h2>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className={`inline-block text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${selectedClient.type === 'Company' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{selectedClient.type}</span>
                                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded uppercase tracking-wider"><ShieldCheck className="w-3 h-3"/> Integrity: 98/100</span>
                                      </div>
                                    </div>
                                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Edit Client</button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Details</p>
                                       <p className="text-sm text-slate-700 mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> {selectedClient.email}</p>
                                       <p className="text-sm text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {selectedClient.phone}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Info</p>
                                       <p className="text-sm text-slate-700 flex items-start gap-2"><Building2 className="w-4 h-4 text-slate-400 mt-0.5"/> <span>{selectedClient.address}</span></p>
                                    </div>
                                  </div>

                                  <div className="flex gap-6 border-b border-slate-200 mb-6">
                                     {['All Jobs', 'Ongoing', 'Finished', 'Overdue', 'Paid'].map(tab => (
                                       <button 
                                         key={tab}
                                         onClick={() => setJobTab(tab)}
                                         className={`text-sm font-bold pb-3 border-b-2 -mb-[2px] transition-colors ${jobTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'}`}
                                       >
                                         {tab}
                                       </button>
                                     ))}
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-4">
                                      <h3 className="font-bold text-slate-900 text-lg">Linked Job Sites</h3>
                                      <button onClick={() => setIsAddSiteModalOpen(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 transition-colors"><Plus className="w-4 h-4"/> Add Site</button>
                                    </div>
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                                       <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                       <p className="text-slate-500 font-medium">No job sites linked yet.</p>
                                       <p className="text-xs text-slate-400 mt-1">Sites linked here will automatically sync to the GPS Map & P&L.</p>
                                    </div>
                                  </div>
                                </>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                   <Users className="w-12 h-12 mb-4 text-slate-200" />
                                   <p className="italic">Select a client from the roster to view details.</p>
                                </div>
                             )}
                          </div>

                          {/* Add Site Modal */}
                          {isAddSiteModalOpen && (
                             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                 className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                               >
                                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                   <h3 className="font-black text-xl text-slate-900">Add New Job Site</h3>
                                   <button onClick={() => setIsAddSiteModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                                 </div>
                                 <div className="p-6 space-y-4">
                                   <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Site Name</label>
                                     <input type="text" placeholder="e.g. The Overlook Apts" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                   </div>
                                   <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GPS Address</label>
                                     <input type="text" placeholder="123 Main St..." className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                     <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quoted Price ($)</label>
                                       <input type="number" placeholder="0.00" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                     </div>
                                     <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Hours</label>
                                       <input type="number" placeholder="0" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                     </div>
                                   </div>
                                 </div>
                                 <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                   <button onClick={() => setIsAddSiteModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200">Cancel</button>
                                   <button onClick={() => setIsAddSiteModalOpen(false)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2"><Map className="w-4 h-4"/> Create Site</button>
                                 </div>
                               </motion.div>
                             </div>
                          )}
                        </div>
                      ) : activePanel === 'pebble' ? (
                        <div className="w-full h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col relative">
                           {/* Tabs Header */}
                           <div className="px-6 pt-6 bg-white border-b border-slate-200 shrink-0">
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-slate-600"/> Master Settings</h3>
                             <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                               {SETTINGS_TABS.map(tab => (
                                 <button 
                                   key={tab}
                                   onClick={() => setSettingsTab(tab)}
                                   className={`text-sm font-bold pb-3 border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${settingsTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'}`}
                                 >
                                   {tab}
                                 </button>
                               ))}
                             </div>
                           </div>

                           {/* Content Area */}
                           <div className="p-6 overflow-y-auto flex-1">
                             {settingsTab === 'Pebble Settings' && (
                               <div className="space-y-6">
                                 <AnimatePresence>
                                   {showHubError && (
                                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-rose-600 mt-0.5" />
                                        <div>
                                          <h4 className="font-bold text-rose-900">No Hardware Detected</h4>
                                          <p className="text-sm text-rose-700 mt-1">You must link a Sovereign Node (Pebble) hub at the bottom of this page before activating the hardware discount tier.</p>
                                        </div>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                                 <div className="grid grid-cols-2 gap-6">
                                    {/* Cloud Tier */}
                                    <div 
                                      onClick={() => { setActiveTier('cloud'); setShowHubError(false); }}
                                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${activeTier === 'cloud' ? 'bg-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                                    >
                                      {activeTier === 'cloud' && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-5 rounded-bl-full" />}
                                      <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`p-3 rounded-xl ${activeTier === 'cloud' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                           <Cloud className={`w-6 h-6 ${activeTier === 'cloud' ? 'text-indigo-600' : 'text-slate-500'}`}/>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${activeTier === 'cloud' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                          {activeTier === 'cloud' ? 'Active' : 'Available'}
                                        </span>
                                      </div>
                                      <h4 className="text-lg font-black text-slate-900 relative z-10">Aura Cloud Premium</h4>
                                      <p className="text-sm text-slate-500 mt-1 relative z-10">Fully managed cloud infrastructure via Firebase. No hardware required.</p>
                                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                                         <span className="font-bold text-slate-400">Rate Tier</span>
                                         <span className="font-black text-lg text-slate-900">$75<span className="text-sm font-medium text-slate-500">/mo per emp.</span></span>
                                      </div>
                                    </div>

                                    {/* Pebble Tier */}
                                    <div 
                                      onClick={() => {
                                        if (hasConnectedHub) {
                                          setActiveTier('pebble');
                                          setShowHubError(false);
                                        } else {
                                          setShowHubError(true);
                                        }
                                      }}
                                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${activeTier === 'pebble' ? 'bg-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                                    >
                                      {activeTier === 'pebble' && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-5 rounded-bl-full" />}
                                      <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`p-3 rounded-xl ${activeTier === 'pebble' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                           <HardDrive className={`w-6 h-6 ${activeTier === 'pebble' ? 'text-indigo-600' : 'text-slate-500'}`}/>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${activeTier === 'pebble' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                          <Wifi className="w-3 h-3"/> {activeTier === 'pebble' ? 'Active' : 'Recommended'}
                                        </span>
                                      </div>
                                      <h4 className="text-lg font-black text-slate-900 relative z-10">Sovereign Node (Pebble)</h4>
                                      <p className="text-sm text-slate-500 mt-1 relative z-10">Host locally on your NAS. You own your data and reduce operational overhead.</p>
                                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                                         <span className="font-bold text-slate-400">Rate Tier</span>
                                         <span className={`font-black text-lg ${activeTier === 'pebble' ? 'text-emerald-600' : 'text-slate-900'}`}>$55<span className={`text-sm font-medium ${activeTier === 'pebble' ? 'text-emerald-600/70' : 'text-slate-500'}`}>/mo per emp.</span></span>
                                      </div>
                                    </div>
                                 </div>

                                 {/* Sync/Publish to Cloud (Only visible when Pebble is active) */}
                                 {activeTier === 'pebble' && (
                                   <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl border border-indigo-900 p-6 shadow-lg text-white">
                                     <div className="flex justify-between items-center">
                                        <div>
                                          <h4 className="font-black text-lg mb-1 flex items-center gap-2"><Cloud className="w-5 h-5 text-indigo-400"/> Push Local Data to Firebase</h4>
                                          <p className="text-sm text-indigo-200/80 max-w-xl">
                                            If you want to migrate off your local hub or manually backup to the cloud, you can push your local data to Firebase. You will only be billed for the data volume you transfer.
                                          </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                           <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Pending Sync Volume</p>
                                           <p className="text-3xl font-black text-white">6.2 <span className="text-lg text-indigo-400 font-bold">GB</span></p>
                                           <p className="text-sm font-bold text-emerald-400 mt-1">Est. Cost: $18.50</p>
                                        </div>
                                     </div>
                                     <div className="mt-6 pt-6 border-t border-white/10 flex gap-4">
                                       <button className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
                                         Confirm & Push Data
                                       </button>
                                       <button className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                                         Set Auto-Push Limit ($50)
                                       </button>
                                     </div>
                                   </div>
                                 )}

                                 {/* Failover Configurations */}
                                 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                   <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                      <Server className="w-5 h-5 text-indigo-600" />
                                      <h4 className="font-black text-slate-900 text-lg">Uptime & Failover Logic</h4>
                                   </div>
                                   
                                   <div className="divide-y divide-slate-100">
                                      <div className="p-6 flex items-start gap-4">
                                        <div className="mt-1">
                                          <input type="radio" name="failover" id="failover-pay" defaultChecked className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                          <label htmlFor="failover-pay" className="font-bold text-slate-900 block mb-1">Enable Pay-As-You-Go Cloud Failover (Recommended)</label>
                                          <p className="text-sm text-slate-500">
                                            If your local Pebble loses power or internet, the Master Selector automatically reroutes your traffic to Firebase. Your business never goes offline. 
                                            <strong> Warning: You will be charged standard cloud rates only for the duration of the downtime.</strong>
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="p-6 flex items-start gap-4">
                                        <div className="mt-1">
                                          <input type="radio" name="failover" id="failover-strict" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                          <label htmlFor="failover-strict" className="font-bold text-slate-900 block mb-1">Strict Offline Mode (No Failover)</label>
                                          <p className="text-sm text-slate-500">
                                            If your local Pebble goes down, your systems stay down. No cloud backups, no SOS data piggybacking. You will never incur unexpected cloud hosting charges.
                                          </p>
                                        </div>
                                      </div>
                                   </div>
                                 </div>

                                 {/* Pair Hardware */}
                                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Pair New Hardware</h4>
                                    <div className="flex gap-4">
                                      <input 
                                        type="text" 
                                        value={hubInput}
                                        onChange={(e) => setHubInput(e.target.value)}
                                        placeholder="Enter Node IP or Serial Key (e.g. 192.168.1.100)" 
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                      />
                                      <button 
                                        onClick={() => {
                                          if (hubInput.length > 5) {
                                            setHasConnectedHub(true);
                                            setShowHubError(false);
                                            setActiveTier('pebble');
                                            setHubInput('');
                                          }
                                        }}
                                        className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
                                      >
                                        Verify & Link
                                      </button>
                                    </div>
                                    <AnimatePresence>
                                      {hasConnectedHub && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                          <HardDrive className="w-4 h-4"/>
                                          Hub Successfully Linked & Verified. You are now eligible for the Hardware Discount.
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                 </div>

                                 {/* G7 Sovereign Node Arrays */}
                                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                      <div>
                                        <h4 className="font-black text-slate-900 text-lg uppercase flex items-center gap-2">
                                          <Globe className="w-5 h-5 text-indigo-600" /> G7 Geographic Sovereignty Arrays
                                        </h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">Deploy self-governed computational workspace instances.</p>
                                      </div>
                                      <div className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4"/> Geolocation Synced
                                      </div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                      {nodes.map(node => (
                                        <div key={node.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-all">
                                          <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl flex items-center justify-center ${node.primary ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                              <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-slate-900">{node.city}</h4>
                                                <span className="text-[10px] font-mono text-slate-400">({node.country})</span>
                                                {node.primary && (
                                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                                                    Central Anchor
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{node.ip}</p>
                                            </div>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs font-mono">
                                            <div>
                                              <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Latency</div>
                                              <div className="text-slate-900 font-semibold">{node.ping}</div>
                                            </div>
                                            <div>
                                              <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Compliance</div>
                                              <div className="text-emerald-600 font-bold">{node.compliance}</div>
                                            </div>
                                            <div>
                                              <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Status</div>
                                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${node.status === "Active" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                 </div>

                                 {/* AI Agent Controller Matrix */}
                                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                                      <div>
                                        <h4 className="font-black text-slate-900 text-lg uppercase flex items-center gap-2">
                                          <Brain className="w-5 h-5 text-indigo-600" /> AI Agent Autonomous Matrix
                                        </h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">Continuous system health, ledger validation, and auditing.</p>
                                      </div>
                                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Automation Freq:</span>
                                        <input 
                                          type="range" min="1" max="5" value={speed} 
                                          onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                          className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                        />
                                        <span className="text-xs font-black text-indigo-600 w-6 text-right">{speed}x</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {agents.map((agent) => (
                                        <div key={agent.id} className={`border rounded-xl p-4 transition-all duration-300 ${agent.active ? "bg-white border-indigo-100 shadow-sm" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                                          <div className="flex items-center justify-between mb-3">
                                            <span className="text-[9px] uppercase tracking-wider font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                              {agent.type}
                                            </span>
                                            <button 
                                              onClick={() => {
                                                setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, active: !a.active } : a));
                                              }}
                                              className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 flex items-center ${agent.active ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"}`}
                                            >
                                              <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                                            </button>
                                          </div>
                                          <h4 className="text-sm font-black text-slate-900 tracking-tight">{agent.name}</h4>
                                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5 mb-4">{agent.task}</p>
                                          <div className="pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-[10px] mb-2">
                                              <span className="text-slate-500 font-bold">Process Load:</span>
                                              <span className="text-slate-900 font-mono font-black">{agent.active ? agent.load : "0%"}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 h-10 overflow-hidden">
                                              <p className="text-[9px] font-mono text-emerald-600 leading-tight">
                                                {agent.active ? agent.logs[0] : "Agent offline. Autonomous state paused."}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                 </div>
                               </div>
                             )}

                             {settingsTab === 'Others' && (
                               <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                                    <HardDrive className="w-8 h-8 text-indigo-600" />
                                  </div>
                                  <h4 className="font-black text-slate-900 text-xl mb-2">Pebble Node OS (USB Boot)</h4>
                                  <p className="text-slate-500 max-w-lg mx-auto mb-8">
                                    Download the encrypted OS image to convert any blank NAS or server into a Sovereign Node. Flash this image to a USB drive and keep it plugged into your hardware 24/7 for automatic patching and updates.
                                  </p>
                                  <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200">
                                    <Download className="w-5 h-5"/> Download .img File (1.2GB)
                                  </button>
                               </div>
                             )}

                             {settingsTab === 'Account Settings' && (
                               <div className="space-y-6">
                                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                                    <div>
                                      <h4 className="font-black text-xl text-slate-900">Subscription & Employee Billing</h4>
                                      <p className="text-slate-500 text-sm mt-1">First 2 employees are always included free on your primary company account.</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">Pebble Discount Active</span>
                                      <p className="text-sm font-bold text-slate-400">Rate: <span className="text-slate-900">$55/mo</span> per extra emp.</p>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                                      <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Staff Enrolled</p>
                                      <p className="text-4xl font-black text-slate-900">12</p>
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center relative overflow-hidden">
                                      <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 relative z-10" />
                                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 relative z-10">Included (Free)</p>
                                      <p className="text-4xl font-black text-emerald-700 relative z-10">-2</p>
                                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
                                    </div>
                                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center relative overflow-hidden">
                                      <DollarSign className="w-8 h-8 text-indigo-400 mx-auto mb-2 relative z-10" />
                                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 relative z-10">Billable Employees</p>
                                      <p className="text-4xl font-black text-indigo-700 relative z-10">10</p>
                                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50" />
                                    </div>
                                 </div>

                                 <div className="bg-slate-900 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl shadow-slate-900/20">
                                   <div>
                                      <p className="text-slate-400 font-bold mb-1">Estimated Monthly Run-Rate</p>
                                      <p className="text-sm text-slate-500 max-w-sm">Calculated at $55/mo for 10 billable employees across all linked Aura services.</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-5xl font-black text-emerald-400">$550<span className="text-xl text-slate-500">/mo</span></p>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {settingsTab === 'Payment and Billing' && (
                                <div className="space-y-6 text-left">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    
                                    {/* Left: Subscription Summary */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                                      <div>
                                        <div className="flex justify-between items-start mb-4">
                                          <div>
                                            <span className="text-[10px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">Active Subcontract</span>
                                            <h4 className="text-xl font-black text-slate-900 mt-1">
                                              {selectedBusiness?.plan === 'free' ? 'Solo Free Plan' : 'Professional Growth Tier'}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Sovereign Node Billing Identity</p>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-black text-xl text-indigo-700 font-mono">
                                              {selectedBusiness?.plan === 'free' ? '$0' : '$49'}<span className="text-xs font-semibold text-slate-400">/mo</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 border border-slate-250/50 rounded-xl space-y-2 mt-4 text-xs font-semibold text-slate-600">
                                          <div className="flex justify-between">
                                            <span>Roster Seat Usage:</span>
                                            <span className="text-slate-900 font-black">{employees.length} Employees</span>
                                          </div>
                                          <div className="flex justify-between border-t border-slate-200/50 pt-2">
                                            <span>Free Tier Limits:</span>
                                            <span className="text-slate-900 font-black">2 Seats Max</span>
                                          </div>
                                          <div className="flex justify-between border-t border-slate-200/50 pt-2">
                                            <span>Billing Currency:</span>
                                            <span className="text-indigo-600 font-black font-mono">{regionalConfig.currency}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                                        {selectedBusiness?.plan === 'free' ? (
                                          <button 
                                            onClick={() => {
                                              setPendingEmployee(null);
                                              setNewPaymentModal(true);
                                            }}
                                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all border-0 cursor-pointer shadow-sm shadow-indigo-100"
                                          >
                                            Upgrade Upfront ($49/mo)
                                          </button>
                                        ) : (
                                          <div className="flex-1 text-center py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-150 uppercase tracking-widest flex items-center justify-center gap-1">
                                            ✓ Billing Authorized Upfront
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Live Stripe Webhook Log Terminal */}
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between text-white h-[320px]">
                                      <div>
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                                            <h4 className="font-mono text-xs uppercase tracking-widest font-black text-slate-300">Live Stripe Webhooks</h4>
                                          </div>
                                          <span className="text-[9px] font-mono text-slate-500 uppercase">HTTPS POST POSTback</span>
                                        </div>

                                        <div className="overflow-y-auto max-h-[190px] space-y-2.5 font-mono text-[10px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                                          {webhookEvents.length === 0 ? (
                                            <div className="text-center py-10 text-slate-500 italic">
                                              No webhook events dispatched.<br/>Try adding a 3rd employee to trigger a payment dispatch log.
                                            </div>
                                          ) : (
                                            webhookEvents.map(evt => (
                                              <div key={evt.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-[9px]">
                                                  <span className="text-sky-400 font-bold">{evt.event}</span>
                                                  <span className="text-slate-500">{evt.timestamp}</span>
                                                </div>
                                                <p className="text-slate-350 leading-relaxed font-medium mt-0.5">{evt.details}</p>
                                                <span className="text-[8px] text-emerald-400 uppercase font-black tracking-widest self-end mt-0.5">Status: {evt.status}</span>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>

                                      <div className="border-t border-slate-900 pt-3 text-[9px] text-slate-500 font-mono flex justify-between items-center">
                                        <span>endpoint: https://aurame.ca/webhooks/stripe</span>
                                        <button 
                                          onClick={() => { setWebhookEvents([]); triggerToast("Webhook logs cleared."); }}
                                          className="text-[8px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors text-slate-400 cursor-pointer border-0 font-mono uppercase"
                                        >
                                          Clear Log
                                        </button>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              )}

                             {settingsTab !== 'Pebble Settings' && settingsTab !== 'Account Settings' && settingsTab !== 'Others' && settingsTab !== 'Payment and Billing' && (
                               <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                 <ShieldCheck className="w-12 h-12 mb-4 text-slate-200" />
                                 <p className="italic">{settingsTab} panel is ready for integration.</p>
                               </div>
                             )}
                           </div>
                        </div>                      ) : activePanel === 'pos' ? (
                        <div className="w-full h-full flex flex-col bg-white overflow-hidden">
                          {/* Top Header & Navigation Bar */}
                          <div className="border-b border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                            <div>
                              <h2 className="text-2xl font-black text-slate-900">Product Operations Cost & Labor Manager (BOM)</h2>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Sovereign Supply Chain & Compliance Module</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={copyFormattedReport}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-indigo-500 rounded-lg text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all cursor-pointer bg-white"
                              >
                                <CopyIcon size={12} /> Copy Spec Sheet
                              </button>
                              <button 
                                onClick={() => setNewProductModal(true)}
                                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm shadow-indigo-100 transition-all cursor-pointer"
                              >
                                <PlusIcon size={12} /> New Product
                              </button>
                            </div>
                          </div>

                          {/* Dual-Column Dashboard Workspace */}
                          <div className="flex-1 flex overflow-hidden">
                            {/* Left Column: Product Selector Roster (30% width) */}
                            <div className="w-1/3 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col h-full overflow-hidden shrink-0">
                              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Product Portfolio</h3>
                              
                              {/* Search */}
                              <div className="relative mb-3">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                                  <SearchIcon size={13} />
                                </span>
                                <input 
                                  type="text" 
                                  placeholder="Search specs or SKU..." 
                                  value={searchQuery}
                                  onChange={e => setSearchQuery(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition-all font-medium placeholder-slate-400"
                                />
                              </div>

                              {/* Portfolio List */}
                              <div className="overflow-y-auto flex-1 pr-1 space-y-2">
                                {filteredProducts.length === 0 ? (
                                  <div className="text-center py-8 text-slate-400 text-[11px] font-medium">No catalog items matching search.</div>
                                ) : (
                                  filteredProducts.map(p => {
                                    const pMatTotal = (p.materials || []).reduce((acc, m) => acc + (parseFloat(m.quantity || 1) * parseFloat(m.cost_per_unit || 0)), 0);
                                    const pLabTotal = (p.labor || []).reduce((acc, l) => acc + (parseFloat(l.hours_per_unit || 0) * parseFloat(l.hourly_rate || 0) * (parseInt(l.num_workers) || 1)), 0);
                                    const pOver = ((p.overhead_cost_cents || 0) + (p.packaging_cost_cents || 0) + (p.shipping_inbound_cents || 0)) / 100;
                                    const pTrueCost = pMatTotal + pLabTotal + pOver;
                                    const pMargin = p.selling_price > 0 ? ((p.selling_price - pTrueCost) / p.selling_price) * 100 : 0;

                                    return (
                                      <div 
                                        key={p.id}
                                        onClick={() => setSelectedProductId(p.id)}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                                          p.id === selectedProductId 
                                            ? "border-indigo-600 bg-indigo-50/20 shadow-sm" 
                                            : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex justify-between items-start gap-1">
                                          <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest">{p.category}</span>
                                          <span className="text-[10px] font-mono font-bold text-slate-400">{p.sku}</span>
                                        </div>
                                        <p className="text-[11px] font-extrabold text-slate-800 truncate mt-0.5">{p.name}</p>
                                        
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-slate-100">
                                          <span className="text-[10px] text-slate-500 font-medium">Retail: <strong className="text-slate-850 font-mono">${p.selling_price.toFixed(2)}</strong></span>
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono ${
                                            pMargin >= 40 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : pMargin >= 15 ? "bg-amber-50 text-amber-650 border border-amber-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                          }`}>
                                            {pMargin >= 0 ? `${pMargin.toFixed(0)}%` : "Loss"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Sidebar Footer with delete */}
                              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-3 shrink-0">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                  <span>Catalog size: {products.length} items</span>
                                  <button 
                                    onClick={deleteActiveProduct} 
                                    className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 font-bold cursor-pointer bg-transparent border-0 outline-none"
                                  >
                                    <TrashIcon size={11} /> Delete SKU
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setActivePanel('main')}
                                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer border-0 font-sans"
                                >
                                  Go Back to Dashboard
                                </button>
                              </div>
                            </div>

                            {/* Right Column: Details Workspace (70% width) */}
                            <div className="w-2/3 p-6 overflow-y-auto h-full bg-slate-50/30">
                              {/* Selected Product Title & Pricing */}
                              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-605 border border-indigo-100 rounded-full text-[9px] font-bold uppercase tracking-wider">{selectedProduct.category}</span>
                                      <span className="text-[11px] font-mono text-slate-400">SKU: {selectedProduct.sku}</span>
                                    </div>
                                    <h2 className="text-lg font-black text-slate-800 mt-1">{selectedProduct.name}</h2>
                                  </div>
                                  <div className="text-left sm:text-right shrink-0">
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Base Selling Price</span>
                                    <div className="relative mt-1 flex items-center">
                                      <span className="absolute left-2.5 text-xs font-bold text-slate-400 font-mono">$</span>
                                      <input 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={selectedProduct.selling_price || ""}
                                        onChange={e => setEF("selling_price", parseFloat(e.target.value) || 0)}
                                        className="pl-6 text-left sm:text-right text-sm font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none w-28 font-mono focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Tabs selection */}
                                <div className="flex border-t border-slate-100 mt-5 pt-3 gap-1">
                                  {[
                                    { id: "cost", label: "Cost & Labor Allocation" },
                                    { id: "supply", label: "Supply Chain & Transit" },
                                    { id: "access", label: "Access & Regulation" }
                                  ].map(t => (
                                    <button
                                      key={t.id}
                                      onClick={() => setCostTab(t.id)}
                                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                                        costTab === t.id 
                                          ? "bg-slate-900 text-white shadow-sm" 
                                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                                      }`}
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Tab Contents */}
                              <div className="transition-all duration-300">
                                {costTab === "cost" && (
                                  <div>
                                    {sSection("Bill of Materials")}
                                    <div className={sCard}>
                                      {materials.length === 0 && <p className="m-0 mb-3.5 text-[10px] text-slate-400 text-center font-bold">No materials mapped to this item yet.</p>}
                                      {materials.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-none">
                                          <div className="flex-1">
                                            <p className="m-0 text-[11px] font-extrabold text-slate-800">{m.material_name}</p>
                                            <p className="m-0 text-[9px] text-slate-400">
                                              {m.quantity} {m.unit} × ${parseFloat(m.cost_per_unit||0).toFixed(2)} {m.supplier ? `· ${m.supplier}` : ""}
                                            </p>
                                          </div>
                                          <span className="text-xs font-bold text-sky-500 font-mono pr-2">
                                            ${(parseFloat(m.quantity||1)*parseFloat(m.cost_per_unit||0)).toFixed(2)}
                                          </span>
                                          <button 
                                            onClick={() => deleteMaterial(m.id)} 
                                            className="w-5 h-5 rounded-md bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/80 transition-colors flex items-center justify-center cursor-pointer border-0"
                                            title="Remove material"
                                          >
                                            <TrashIcon size={10} />
                                          </button>
                                        </div>
                                      ))}
                                      
                                      {/* Add Material Panel */}
                                      <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="m-0 mb-2 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Add Material / Raw Ingredient</p>
                                        <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                                          <div className="col-span-2">
                                            <input value={matForm.material_name} onChange={e=>setMatForm(f=>({...f,material_name:e.target.value}))} placeholder="Material name *" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={matForm.quantity} onChange={e=>setMatForm(f=>({...f,quantity:e.target.value}))} placeholder="Qty" type="number" min="0" step="any" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={matForm.unit} onChange={e=>setMatForm(f=>({...f,unit:e.target.value}))} placeholder="Unit (e.g. g)" className={sInput} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                                          <div>
                                            <input value={matForm.cost_per_unit} onChange={e=>setMatForm(f=>({...f,cost_per_unit:e.target.value}))} placeholder="Cost/unit $" type="number" min="0" step="any" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={matForm.supplier} onChange={e=>setMatForm(f=>({...f,supplier:e.target.value}))} placeholder="Supplier" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={matForm.notes} onChange={e=>setMatForm(f=>({...f,notes:e.target.value}))} placeholder="Notes" className={sInput} />
                                          </div>
                                        </div>
                                        <button 
                                          onClick={addMaterial} 
                                          disabled={matSaving || !matForm.material_name}
                                          className="px-4 py-1.5 rounded-lg border-0 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white text-[10px] font-black cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-sky-100"
                                        >
                                          {matSaving ? "Saving…" : <> <PlusIcon size={10} /> Add Material </>}
                                        </button>
                                      </div>
                                    </div>

                                    {sSection("Labor Allocation & Metrology")}
                                    <div className={sCard}>
                                      {labor.length === 0 && <p className="m-0 mb-3.5 text-[10px] text-slate-400 text-center font-bold">No labor requirements mapped to this SKU.</p>}
                                      {labor.map(l => (
                                        <div key={l.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-none">
                                          <div className="flex-1">
                                            <p className="m-0 text-[11px] font-extrabold text-slate-800">{l.role_name}</p>
                                            <p className="m-0 text-[9px] text-slate-400">
                                              {l.num_workers} worker{parseInt(l.num_workers)!==1?"s":""} × {l.hours_per_unit}h @ ${parseFloat(l.hourly_rate||0).toFixed(2)}/h
                                            </p>
                                          </div>
                                          <span className="text-xs font-bold text-violet-500 font-mono pr-2">
                                            ${((parseFloat(l.hours_per_unit)||0)*(parseFloat(l.hourly_rate)||0)*(parseInt(l.num_workers)||1)).toFixed(2)}
                                          </span>
                                          <button 
                                            onClick={() => deleteLabor(l.id)} 
                                            className="w-5 h-5 rounded-md bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/80 transition-colors flex items-center justify-center cursor-pointer border-0"
                                            title="Remove role"
                                          >
                                            <TrashIcon size={10} />
                                          </button>
                                        </div>
                                      ))}
                                      
                                      {/* Add Labor Panel */}
                                      <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="m-0 mb-2 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Allocate Labor Role</p>
                                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                                          <div className="col-span-2">
                                            <input value={laborForm.role_name} onChange={e=>setLaborForm(f=>({...f,role_name:e.target.value}))} placeholder="Role *" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={laborForm.hours_per_unit} onChange={e=>setLaborForm(f=>({...f,hours_per_unit:e.target.value}))} placeholder="Hrs/unit" type="number" min="0" step="any" className={sInput} />
                                          </div>
                                          <div>
                                            <input value={laborForm.hourly_rate} onChange={e=>setLaborForm(f=>({...f,hourly_rate:e.target.value}))} placeholder="$/hour" type="number" min="0" step="any" className={sInput} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 mb-3">
                                          <div>
                                            <input value={laborForm.num_workers} onChange={e=>setLaborForm(f=>({...f,num_workers:e.target.value}))} placeholder="# Workers" type="number" min="1" className={sInput} />
                                          </div>
                                        </div>
                                        <button 
                                          onClick={addLabor} 
                                          disabled={laborSaving || !laborForm.role_name}
                                          className="px-4 py-1.5 rounded-lg border-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white text-[10px] font-black cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-violet-100"
                                        >
                                          {laborSaving ? "Saving…" : <> <PlusIcon size={10} /> Add Role </>}
                                        </button>
                                      </div>
                                    </div>

                                    {sSection("Overhead & Fixed Logistics")}
                                    <div className={sCard}>
                                      <div className="grid grid-cols-3 gap-2.5 mb-3">
                                        <div>
                                          <label className={sLabel}>Overhead Alloc ($)</label>
                                          <input 
                                            value={(EF("overhead_cost_cents")||0)/100||""} 
                                            onChange={e=>setEF("overhead_cost_cents",Math.round(parseFloat(e.target.value||"0")*100))} 
                                            type="number" 
                                            min="0" 
                                            step="any"
                                            placeholder="0.00" 
                                            className={sInput} 
                                          />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Packaging Alloc ($)</label>
                                          <input 
                                            value={(EF("packaging_cost_cents")||0)/100||""} 
                                            onChange={e=>setEF("packaging_cost_cents",Math.round(parseFloat(e.target.value||"0")*100))} 
                                            type="number" 
                                            min="0" 
                                            step="any"
                                            placeholder="0.00" 
                                            className={sInput} 
                                          />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Inbound Freight ($)</label>
                                          <input 
                                            value={(EF("shipping_inbound_cents")||0)/100||""} 
                                            onChange={e=>setEF("shipping_inbound_cents",Math.round(parseFloat(e.target.value||"0")*100))} 
                                            type="number" 
                                            min="0" 
                                            step="any"
                                            placeholder="0.00" 
                                            className={sInput} 
                                          />
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => saveExt({ 
                                          overhead_cost_cents: EF("overhead_cost_cents")||0, 
                                          packaging_cost_cents: EF("packaging_cost_cents")||0, 
                                          shipping_inbound_cents: EF("shipping_inbound_cents")||0 
                                        })} 
                                        disabled={extSaving}
                                        className="px-4 py-2 rounded-xl border-0 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-black tracking-wider uppercase cursor-pointer transition-colors"
                                      >
                                        {extSaving ? "Saving…" : "Save Overhead Parameters"}
                                      </button>
                                    </div>

                                    {/* --- TRUE COST SUMMARY (Calculated metrics) --- */}
                                    {trueCost > 0 && (
                                      <div className={`rounded-2xl p-5 border transition-all ${
                                        margin >= 40 ? "bg-emerald-50/40 border-emerald-100" : margin >= 15 ? "bg-amber-50/30 border-amber-100" : "bg-rose-50/40 border-rose-100"
                                      }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">True Margins Breakdown</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3.5 mb-4">
                                          {[
                                            { label: "Materials", val: `$${matTotal.toFixed(2)}`, color: "text-sky-500" },
                                            { label: "Labor Allocation", val: `$${laborTotal.toFixed(2)}`, color: "text-violet-500" },
                                            { label: "Freight + Fixed", val: `$${(overhead+packaging+shipping).toFixed(2)}`, color: "text-slate-500" },
                                            { label: "True Cost / Unit", val: `$${trueCost.toFixed(2)}`, color: "text-rose-600" },
                                            { label: "Base Selling Price", val: priceDisplay, color: "text-emerald-600" },
                                            { label: "Gross Margin", val: `${margin.toFixed(1)}%`, color: margin >= 40 ? "text-emerald-600" : margin >= 15 ? "text-amber-500" : "text-rose-600" },
                                          ].map(s => (
                                            <div key={s.label} className="text-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                              <p className="m-0 mb-0.5 text-[8px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                                              <p className={`m-0 text-xs font-black font-mono ${s.color}`}>{s.val}</p>
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <div className="flex justify-between mb-1.5">
                                            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono">Cost Share: {margin >= 100 ? '0' : (100 - Math.max(0, margin)).toFixed(1)}%</span>
                                            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono">Net Profit Margin: {Math.max(0, margin).toFixed(1)}%</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-slate-200/50 overflow-hidden flex border border-slate-100">
                                            <div 
                                              className="h-full bg-rose-500 transition-all duration-500" 
                                              style={{ width: `${Math.min(100, Math.max(0, 100 - margin))}%` }} 
                                            />
                                            <div 
                                              className="h-full bg-emerald-500 transition-all duration-500" 
                                              style={{ width: `${Math.min(100, Math.max(0, margin))}%` }} 
                                            />
                                          </div>
                                          <p className="m-0 mt-2 text-[10px] text-center font-bold text-slate-500">
                                            {margin >= 0 ? `${(100-margin).toFixed(1)}% operational cost → ${margin.toFixed(1)}% net profit per unit sold` : "Selling below operational cost — optimize your parameters!"}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* --- SUPPLY CHAIN TAB --- */}
                                {costTab === "supply" && (
                                  <div>
                                    {sSection("Primary Supplier Specifications")}
                                    <div className={sCard}>
                                      <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                          <label className={sLabel}>Supplier Entity Name</label>
                                          <input value={EF("supplier_name")} onChange={e=>setEF("supplier_name",e.target.value)} placeholder="e.g. Tandy Leather Inc." className={sInput} />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Supplier Website Portal</label>
                                          <input value={EF("supplier_url")} onChange={e=>setEF("supplier_url",e.target.value)} placeholder="https://supplier.com" className={sInput} />
                                        </div>
                                      </div>
                                      <div className="mb-3">
                                        <label className={sLabel}>Contact Channels</label>
                                        <input value={EF("supplier_contact")} onChange={e=>setEF("supplier_contact",e.target.value)} placeholder="Email / phone / account rep..." className={sInput} />
                                      </div>
                                      {EF("supplier_url") && (
                                        <a 
                                          href={EF("supplier_url")} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg no-underline transition-all cursor-pointer mb-2"
                                        >
                                          Launch Supplier Portal <ExternalLinkIcon size={10} />
                                        </a>
                                      )}
                                    </div>

                                    {sSection("Replenishment & Transit Matrix")}
                                    <div className={sCard}>
                                      <div className="grid grid-cols-3 gap-2.5 mb-3">
                                        <div>
                                          <label className={sLabel}>Lead Window (days)</label>
                                          <input value={EF("supplier_lead_days")||"7"} onChange={e=>setEF("supplier_lead_days",parseInt(e.target.value)||7)} type="number" min="0" className={sInput} />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Order Interval Frequency</label>
                                          <select value={EF("order_frequency")||"on-demand"} onChange={e=>setEF("order_frequency",e.target.value)} className={`${sInput} bg-white h-[28px]`}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="on-demand">On Demand</option>
                                            <option value="irregular">Irregular</option>
                                            <option value="seasonal">Seasonal</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className={sLabel}>Last Order Dispatched</label>
                                          <input value={EF("last_ordered_at")||""} onChange={e=>setEF("last_ordered_at",e.target.value)} type="date" className={sInput} />
                                        </div>
                                      </div>
                                      <div className="mb-3">
                                        <label className={sLabel}>Expected Port Arrival</label>
                                        <input value={EF("next_expected_at")||""} onChange={e=>setEF("next_expected_at",e.target.value)} type="date" className={sInput} />
                                      </div>
                                      <div className="mb-4">
                                        <label className={sLabel}>Custom Terminal/Delivery Notes</label>
                                        <textarea value={EF("delivery_notes")} onChange={e=>setEF("delivery_notes",e.target.value)} rows={3} placeholder="Special delivery instructions, cargo bay clearance requirements..." className={`${sInput} resize-none`} />
                                      </div>
                                      <button 
                                        onClick={() => saveExt({ 
                                          supplier_name: EF("supplier_name"), 
                                          supplier_url: EF("supplier_url"), 
                                          supplier_contact: EF("supplier_contact"), 
                                          supplier_lead_days: EF("supplier_lead_days")||7, 
                                          order_frequency: EF("order_frequency"), 
                                          last_ordered_at: EF("last_ordered_at")||null, 
                                          next_expected_at: EF("next_expected_at")||null, 
                                          delivery_notes: EF("delivery_notes") 
                                        })} 
                                        disabled={extSaving}
                                        className="px-4 py-2 rounded-xl border-0 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-black tracking-wider uppercase cursor-pointer transition-colors"
                                      >
                                        {extSaving ? "Saving…" : "Save Replenishment Matrix"}
                                      </button>
                                    </div>

                                    {selectedProduct.order_frequency && (
                                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 flex items-center justify-between">
                                        <p className="m-0 text-[10px] font-bold text-sky-700 leading-relaxed font-sans">
                                          🚚 Next scheduled replenishment arrival: <strong>{selectedProduct.next_expected_at ? new Date(selectedProduct.next_expected_at).toLocaleDateString("en-US") : "unspecified"}</strong> <br />
                                          Cadence: <strong className="uppercase font-mono">{selectedProduct.order_frequency}</strong> · Supplier Lead Buffer: <strong>{selectedProduct.supplier_lead_days ?? 7} days</strong>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* --- ACCESS & REGULATION TAB --- */}
                                {costTab === "access" && (
                                  <div>
                                    {sSection("Access Control Privileges")}
                                    <div className={sCard}>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Define store visibility permissions:</p>
                                      <div className="space-y-2">
                                        {[
                                          { key: "client_access", label: "Client Visibility", desc: "Visible and purchasable on public client storefront portals" },
                                          { key: "employee_access", label: "Employee Access", desc: "Authorized for employee internal POS ordering & stock logs" },
                                          { key: "manager_access", label: "Manager Override", desc: "Managers can override allocation quotas & order limits" },
                                          { key: "admin_only", label: "Strict Admin Only", desc: "Restrict configuration and editing purely to account root administrator" }
                                        ].map(opt => (
                                          <div key={opt.key} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            <input 
                                              type="checkbox" 
                                              id={opt.key} 
                                              checked={!!selectedProduct[opt.key]}
                                              onChange={e => setEF(opt.key, e.target.checked)}
                                              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500/20 focus:ring-2 mt-0.5"
                                            />
                                            <div>
                                              <label htmlFor={opt.key} className="text-xs font-black text-slate-900 block cursor-pointer">{opt.label}</label>
                                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{opt.desc}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="mt-3.5">
                                        <label className={sLabel}>Restricted Allocation Instructions / Notes</label>
                                        <textarea value={EF("restricted_notes")} onChange={e=>setEF("restricted_notes",e.target.value)} rows={3} placeholder="Define special staff rules, handling constraints, or security credentials needed..." className={`${sInput} resize-none`} />
                                      </div>
                                    </div>

                                    {sSection("Regulatory & Standard Clearances")}
                                    <div className={sCard}>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Compliance Auditing checklist:</p>
                                      <div className="grid grid-cols-2 gap-3 mb-4">
                                        {[
                                          { key: "requires_certification", label: "CoC / Testing Certified", desc: "Requires ISO/G7 certificate of compliance" },
                                          { key: "inspection_required", label: "Terminal Inspection Required", desc: "Must be custom-inspected before staging" },
                                          { key: "expiry_tracking", label: "Batch Expiry Tracking", desc: "Enforce shelf-life limits & recall tracking" },
                                          { key: "perishable", label: "Perishable / Temp Guard", desc: "Requires temperature-controlled storage" }
                                        ].map(opt => (
                                          <div key={opt.key} className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <input 
                                              type="checkbox" 
                                              id={opt.key} 
                                              checked={!!selectedProduct[opt.key]}
                                              onChange={e => setEF(opt.key, e.target.checked)}
                                              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500/20 focus:ring-2 mt-0.5"
                                            />
                                            <div>
                                              <label htmlFor={opt.key} className="text-[11px] font-extrabold text-slate-800 block cursor-pointer">{opt.label}</label>
                                              <span className="text-[8px] font-bold text-slate-400 block mt-0.5">{opt.desc}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="space-y-3">
                                        <div>
                                          <label className={sLabel}>Regulatory Certifications Notes</label>
                                          <input value={EF("certification_notes")} onChange={e=>setEF("certification_notes",e.target.value)} placeholder="Required certificates, FDA numbers, health safety standards..." className={sInput} />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Jurisdictional Import / Export Restrictions</label>
                                          <input value={EF("legal_restrictions")} onChange={e=>setEF("legal_restrictions",e.target.value)} placeholder="Tariff rules, ITAR constraints, regional embargo checks..." className={sInput} />
                                        </div>
                                        <div>
                                          <label className={sLabel}>Standard Operating Procedures (SOP) Notes</label>
                                          <textarea value={EF("regulatory_notes")} onChange={e=>setEF("regulatory_notes",e.target.value)} rows={3} placeholder="Humidity controls, storage conditions, audit intervals..." className={`${sInput} resize-none`} />
                                        </div>
                                      </div>
                                      
                                      <button 
                                        onClick={() => saveExt({ 
                                          client_access: EF("client_access"),
                                          employee_access: EF("employee_access"),
                                          manager_access: EF("manager_access"),
                                          admin_only: EF("admin_only"),
                                          restricted_notes: EF("restricted_notes"),
                                          requires_certification: EF("requires_certification"),
                                          inspection_required: EF("inspection_required"),
                                          expiry_tracking: EF("expiry_tracking"),
                                          perishable: EF("perishable"),
                                          certification_notes: EF("certification_notes"),
                                          legal_restrictions: EF("legal_restrictions"),
                                          regulatory_notes: EF("regulatory_notes")
                                        })} 
                                        disabled={extSaving}
                                        className="px-4 py-2 rounded-xl border-0 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-black tracking-wider uppercase cursor-pointer transition-colors mt-4"
                                      >
                                        {extSaving ? "Saving…" : "Save Permissions & Regs"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* New Product Modal Popup */}
                          {newProductModal && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-105"
                              >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                  <h3 className="font-black text-lg text-slate-900">Create New Catalog Product</h3>
                                  <button onClick={() => setNewProductModal(false)} className="text-slate-400 hover:text-slate-650 font-bold cursor-pointer bg-transparent border-0 outline-none">Close</button>
                                </div>
                                <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-left">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Product Name *</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={prodForm.name}
                                      onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))}
                                      placeholder="e.g. Solid Brass Premium Buckle" 
                                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Product SKU (Optional)</label>
                                    <input 
                                      type="text" 
                                      value={prodForm.sku}
                                      onChange={e => setProdForm(p => ({ ...p, sku: e.target.value }))}
                                      placeholder="e.g. HARD-BRS-50" 
                                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium" 
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Category</label>
                                      <select 
                                        value={prodForm.category}
                                        onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="Goods & Accessories">Goods & Accessories</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Sports & Engineering">Sports & Engineering</option>
                                        <option value="Services & Support">Services & Support</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Selling Price ($) *</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        required
                                        value={prodForm.selling_price}
                                        onChange={e => setProdForm(p => ({ ...p, selling_price: e.target.value }))}
                                        placeholder="0.00" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                      />
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-6">
                                    <button type="button" onClick={() => setNewProductModal(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 text-sm cursor-pointer border-0 bg-transparent">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2 text-sm cursor-pointer shadow-sm border-0"><PlusIcon size={12}/> Create Product</button>
                                  </div>
                                </form>
                              </motion.div>
                            </div>
                          )}

                          {/* New Milestone Modal Popup */}
                          {newMilestoneModal && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                              >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                  <h3 className="font-black text-lg text-slate-900">Add Corporate Milestone</h3>
                                  <button onClick={() => setNewMilestoneModal(false)} className="text-slate-400 hover:text-slate-655 font-bold cursor-pointer bg-transparent border-0 outline-none">Close</button>
                                </div>
                                <form onSubmit={handleAddMilestone} className="p-6 space-y-4 text-left">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Milestone Title / Event Name *</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={milestoneForm.title}
                                      onChange={e => setMilestoneForm(p => ({ ...p, title: e.target.value }))}
                                      placeholder="e.g. Christmas Staff Outing / Gala Banquet" 
                                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium" 
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Category</label>
                                      <select 
                                        value={milestoneForm.category}
                                        onChange={e => setMilestoneForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="Event">Event / Celebration</option>
                                        <option value="Internal Event">Internal Staff Event</option>
                                        <option value="Operational Goal">Operational Target</option>
                                        <option value="Charity & Donation">Charity & Donation</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Estimated Target Date *</label>
                                      <input 
                                        type="text" 
                                        required
                                        value={milestoneForm.targetDate}
                                        onChange={e => setMilestoneForm(p => ({ ...p, targetDate: e.target.value }))}
                                        placeholder="e.g. July 5th (within 2 yrs)" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-sans" 
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Low-End Budget ($ CAD)</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={milestoneForm.lowBudget}
                                        onChange={e => setMilestoneForm(p => ({ ...p, lowBudget: e.target.value }))}
                                        placeholder="Low-end cost limit" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">High-End Budget ($ CAD)</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={milestoneForm.highBudget}
                                        onChange={e => setMilestoneForm(p => ({ ...p, highBudget: e.target.value }))}
                                        placeholder="High-end cost limit" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Description & Goals</label>
                                    <textarea 
                                      value={milestoneForm.notes}
                                      onChange={e => setMilestoneForm(p => ({ ...p, notes: e.target.value }))}
                                      rows={3}
                                      placeholder="Outline details, persuasion strategies or purpose of this corporate event..."
                                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium resize-none font-sans" 
                                    />
                                  </div>

                                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-6">
                                    <button type="button" onClick={() => setNewMilestoneModal(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 text-sm cursor-pointer border-0 bg-transparent">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2 text-sm cursor-pointer shadow-sm border-0"><PlusIcon size={12}/> Record Milestone</button>
                                  </div>
                                </form>
                              </motion.div>
                            </div>
                          )}

                          {/* Regional & Tax Config Modal Popup */}
                          {newRegionalModal && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                              >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" /> Regional & Tax Settings
                                  </h3>
                                  <button onClick={() => setNewRegionalModal(false)} className="text-slate-400 hover:text-slate-655 font-bold cursor-pointer bg-transparent border-0 outline-none">Close</button>
                                </div>
                                <form onSubmit={handleSaveRegionalConfig} className="p-6 space-y-4 text-left">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Base Currency</label>
                                      <select 
                                        value={regionalForm.currency}
                                        onChange={e => setRegionalForm(p => ({ ...p, currency: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="CAD">CAD ($ CAD)</option>
                                        <option value="USD">USD ($ USD)</option>
                                        <option value="GBP">GBP (£ GBP)</option>
                                        <option value="EUR">EUR (€ EUR)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Legal Structure</label>
                                      <select 
                                        value={regionalForm.legalStructure}
                                        onChange={e => setRegionalForm(p => ({ ...p, legalStructure: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="Corporation">Corporation (Inc.)</option>
                                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        <option value="LLC">Limited Liability Company (LLC)</option>
                                        <option value="Partnership">Partnership</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Operational Country</label>
                                      <select 
                                        value={regionalForm.country}
                                        onChange={e => setRegionalForm(p => ({ ...p, country: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="Canada">Canada</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Target Expansion Country</label>
                                      <select 
                                        value={regionalForm.targetCountry}
                                        onChange={e => setRegionalForm(p => ({ ...p, targetCountry: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium bg-white h-[38px]"
                                      >
                                        <option value="United States">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Germany">Germany</option>
                                        <option value="Australia">Australia</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Corporate Federal Tax (%)</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                        value={regionalForm.federalTaxRate}
                                        onChange={e => setRegionalForm(p => ({ ...p, federalTaxRate: e.target.value }))}
                                        placeholder="e.g. 5 for GST" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Corporate Prov/State Tax (%)</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                        value={regionalForm.provincialTaxRate}
                                        onChange={e => setRegionalForm(p => ({ ...p, provincialTaxRate: e.target.value }))}
                                        placeholder="e.g. 8 for ON PST" 
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-sans">Tax Registry ID / Business Number *</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={regionalForm.taxId}
                                      onChange={e => setRegionalForm(p => ({ ...p, taxId: e.target.value }))}
                                      placeholder="e.g. CRA-837482910-RT0001 / EIN" 
                                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium font-mono" 
                                    />
                                  </div>

                                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-6">
                                    <button type="button" onClick={() => setNewRegionalModal(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 text-sm cursor-pointer border-0 bg-transparent">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2 text-sm cursor-pointer shadow-sm border-0"><CheckIcon size={12}/> Save Configurations</button>
                                  </div>
                                </form>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      ) : activePanel === 'blueprint' ? (
                        <div className="w-full h-full flex flex-col overflow-hidden bg-white">
                          {/* Top Header & Tabs */}
                          <div className="border-b border-slate-200">
                            <div className="p-6 pb-0">
                               <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-2xl font-black text-slate-900">Business Blueprint</h2>
                                 <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => setActivePanel('main')} 
                                     className="text-xs font-bold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all cursor-pointer border-0"
                                   >
                                     Go back to dashboard
                                   </button>
                                   <button 
                                      onClick={() => {
                                        setRegionalForm({ ...regionalConfig });
                                        setNewRegionalModal(true);
                                      }}
                                      className="text-xs font-bold bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer border-0"
                                    >
                                      Regional & Tax Settings
                                    </button>
                                 </div>
                               </div>
                               <div className="flex gap-6 overflow-x-auto">
                                 {['Business Overview', 'SWOT Analysis', '5-Year Goals', '2-Year Goals', 'Milestones', 'Financials'].map(tab => (
                                   <button 
                                     key={tab}
                                     onClick={() => setBlueprintTab(tab)}
                                     className={`text-sm font-bold pb-4 border-b-2 transition-colors whitespace-nowrap ${blueprintTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'}`}
                                   >
                                     {tab}
                                   </button>
                                 ))}
                               </div>
                            </div>
                          </div>
                          
                          {/* Content Area */}
                          <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto">
                             {blueprintTab === 'Business Overview' && (
                                <div className="space-y-6 text-left max-w-4xl mx-auto">
                                  <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase text-slate-900 leading-none">DNA & Integrity</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Define your non-negotiables.</p>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-600 ml-1">Core Purpose (The 'Why')</label>
                                      <textarea 
                                        value={roadmap.purpose}
                                        onChange={e => updateRoadmap('purpose', e.target.value)}
                                        placeholder="e.g. To empower families through sovereign technology..."
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-24 resize-none shadow-sm"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-600 ml-1">Integrity Standards</label>
                                      <textarea 
                                        value={roadmap.integrity}
                                        onChange={e => updateRoadmap('integrity', e.target.value)}
                                        placeholder="What will you NEVER do to make a profit?..."
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-24 resize-none shadow-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                             )}

                             {blueprintTab === 'SWOT Analysis' && (
                                <div className="space-y-6 text-left max-w-4xl mx-auto">
                                  <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase text-slate-900 leading-none">The Market Moat</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">How do you make competitors irrelevant?</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-600 ml-1">Competitor Flaws (Threats/Weaknesses)</label>
                                      <textarea 
                                        value={roadmap.compFlaw}
                                        onChange={e => updateRoadmap('compFlaw', e.target.value)}
                                        placeholder="What are they doing wrong that customers hate?..."
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-24 resize-none shadow-sm"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-600 ml-1">Unfair Advantage (Strengths/Moat)</label>
                                      <textarea 
                                        value={roadmap.moat}
                                        onChange={e => updateRoadmap('moat', e.target.value)}
                                        placeholder="Why can't they copy you in 6 months?..."
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-24 resize-none shadow-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                             )}

                             {blueprintTab === '5-Year Goals' && (
                                <div className="space-y-6 text-left max-w-6xl mx-auto">
                                  <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase text-slate-900 leading-none">5-Year Vision Blueprint</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Long-term target projections, brand perceptions, and point-form milestones.</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* Left Column: Descriptions */}
                                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                      <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">1. Year 5 Corporate Goal</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">What do you want to accomplish in 5 years?</p>
                                        <textarea 
                                          value={roadmap.y5_goal || ""}
                                          onChange={e => updateRoadmap('y5_goal', e.target.value)}
                                          placeholder="e.g. Expand services across North America, automating provincial tax allocations..."
                                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-28 resize-none shadow-inner"
                                        />
                                      </div>

                                      <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">2. Brand Image & Client Perception</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">What do you want your clients to perceive about your image?</p>
                                        <textarea 
                                          value={roadmap.y5_image || ""}
                                          onChange={e => updateRoadmap('y5_image', e.target.value)}
                                          placeholder="e.g. Seen as the most transparent, legally secure, and reliable contractor..."
                                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-28 resize-none shadow-inner"
                                        />
                                      </div>
                                    </div>

                                    {/* Right Column: Point-form Goals & Milestones */}
                                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                      <div>
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">3. Point-Form Velocity Goals</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Add specific itemized targets with budget ranges</p>
                                      </div>

                                      {/* Points List */}
                                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                        {(roadmap.y5_points || []).length === 0 ? (
                                          <p className="text-xs font-medium text-slate-400 text-center py-4">No specific milestones mapped yet.</p>
                                        ) : (
                                          (roadmap.y5_points || []).map((pt, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 break-words leading-tight">{pt.text}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                                                    Est: ${Number(pt.lowBudget).toLocaleString()} - ${Number(pt.highBudget).toLocaleString()} CAD
                                                  </span>
                                                </div>
                                              </div>
                                              <button 
                                                onClick={() => deletePointGoal('y5', idx)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                                                title="Delete Goal"
                                              >
                                                <TrashIcon size={14} />
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      {/* Inline Point-form Add Form */}
                                      <div className="pt-4 border-t border-slate-100 space-y-3">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Milestone Target</label>
                                          <input 
                                            type="text"
                                            value={pointForm.text}
                                            onChange={e => setPointForm(p => ({ ...p, text: e.target.value }))}
                                            placeholder="e.g. Purchase extra work vehicles..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Low Budget ($)</label>
                                            <input 
                                              type="number"
                                              value={pointForm.lowBudget}
                                              onChange={e => setPointForm(p => ({ ...p, lowBudget: e.target.value }))}
                                              placeholder="Low boundary"
                                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">High Budget ($)</label>
                                            <input 
                                              type="number"
                                              value={pointForm.highBudget}
                                              onChange={e => setPointForm(p => ({ ...p, highBudget: e.target.value }))}
                                              placeholder="High boundary"
                                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                            />
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => addPointGoal('y5')}
                                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer border-0 font-sans"
                                        >
                                          <PlusIcon size={12}/> Add Milestone
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                             {blueprintTab === '2-Year Goals' && (
                                <div className="space-y-6 text-left max-w-6xl mx-auto">
                                  <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase text-slate-900 leading-none">2-Year Step Velocity</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Immediate short-term stepping stones, client trust strategies, and point milestones.</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* Left Column: Descriptions */}
                                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                      <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">1. Year 2 Corporate Goal</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">What do you want to accomplish in 2 years?</p>
                                        <textarea 
                                          value={roadmap.y2_goal || ""}
                                          onChange={e => updateRoadmap('y2_goal', e.target.value)}
                                          placeholder="e.g. Establish cross-provincial commerce with regional Ontario and Quebec tax automation..."
                                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-28 resize-none shadow-inner"
                                        />
                                      </div>

                                      <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">2. Brand Image & Client Perception</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">What do you want your clients to perceive about your image?</p>
                                        <textarea 
                                          value={roadmap.y2_image || ""}
                                          onChange={e => updateRoadmap('y2_image', e.target.value)}
                                          placeholder="e.g. Acknowledged as the highest-rated local contractor with 100% on-time dispatch transparency..."
                                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/20 transition-all h-28 resize-none shadow-inner"
                                        />
                                      </div>
                                    </div>

                                    {/* Right Column: Point-form Goals & Milestones */}
                                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                      <div>
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">3. Point-Form Velocity Goals</label>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Add specific itemized targets with budget ranges</p>
                                      </div>

                                      {/* Points List */}
                                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                        {(roadmap.y2_points || []).length === 0 ? (
                                          <p className="text-xs font-medium text-slate-400 text-center py-4">No specific milestones mapped yet.</p>
                                        ) : (
                                          (roadmap.y2_points || []).map((pt, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 break-words leading-tight">{pt.text}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                                                    Est: ${Number(pt.lowBudget).toLocaleString()} - ${Number(pt.highBudget).toLocaleString()} CAD
                                                  </span>
                                                </div>
                                              </div>
                                              <button 
                                                onClick={() => deletePointGoal('y2', idx)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                                                title="Delete Goal"
                                              >
                                                <TrashIcon size={14} />
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      {/* Inline Point-form Add Form */}
                                      <div className="pt-4 border-t border-slate-100 space-y-3">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Milestone Target</label>
                                          <input 
                                            type="text"
                                            value={pointForm.text}
                                            onChange={e => setPointForm(p => ({ ...p, text: e.target.value }))}
                                            placeholder="e.g. Deploy standard invoicing tools..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Low Budget ($)</label>
                                            <input 
                                              type="number"
                                              value={pointForm.lowBudget}
                                              onChange={e => setPointForm(p => ({ ...p, lowBudget: e.target.value }))}
                                              placeholder="Low boundary"
                                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">High Budget ($)</label>
                                            <input 
                                              type="number"
                                              value={pointForm.highBudget}
                                              onChange={e => setPointForm(p => ({ ...p, highBudget: e.target.value }))}
                                              placeholder="High boundary"
                                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-500/10 transition-all font-mono"
                                            />
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => addPointGoal('y2')}
                                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer border-0 font-sans"
                                        >
                                          <PlusIcon size={12}/> Add Milestone
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                             {blueprintTab === 'Financials' && (
                                <div className="space-y-6 text-left max-w-6xl mx-auto">
                                  <header className="text-left flex items-center justify-between">
                                    <div>
                                      <h3 className="text-2xl font-black uppercase text-slate-900 leading-none">Financials & Treasury</h3>
                                      <p className="text-xs font-bold text-slate-400 uppercase mt-2">Corporate Financial Ledger</p>
                                    </div>
                                  </header>

                                  {/* Corporate Cash Balance Display */}
                                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center justify-between">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                                    <div className="relative z-10">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                                          <DollarSign className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-black text-indigo-200 uppercase tracking-widest font-mono">Available Cash Balance ({regionalConfig.currency})</span>
                                      </div>
                                      <span className="text-4xl font-black font-mono text-emerald-400 tracking-tight">${balance.toLocaleString("en-CA", { minimumFractionDigits: 2 })} {regionalConfig.currency}</span>
                                      <div className="mt-2 text-[10px] text-indigo-300">
                                        <span>Liquid cash on hand available for business operations ({regionalConfig.legalStructure} in {regionalConfig.country})</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                                    {[
                                      { label: `Projected Revenue (${regionalConfig.currency})`, val: financials.totalRevenue, color: 'text-slate-900', icon: DollarSign, details: 'Estimated annual collections' },
                                      { label: `Op Expenses (${regionalConfig.currency})`, val: financials.adjustedExpenses, color: 'text-rose-500', icon: Activity, details: 'Fixed overhead + payroll run-rate' },
                                      { label: `Net Op Income (${regionalConfig.currency})`, val: financials.totalProfit, color: 'text-emerald-600', icon: TrendingUp, details: 'Gross revenue minus operational costs' },
                                      { 
                                        label: `Corp Tax Liability`, 
                                        val: financials.totalProfit > 0 
                                          ? financials.totalProfit * (((parseFloat(regionalConfig.federalTaxRate) || 0) + (parseFloat(regionalConfig.provincialTaxRate) || 0)) / 100) 
                                          : 0, 
                                        color: 'text-indigo-600', 
                                        icon: Scale, 
                                        details: `${((parseFloat(regionalConfig.federalTaxRate) || 0) + (parseFloat(regionalConfig.provincialTaxRate) || 0))}% Combined Corp Tax for ${regionalConfig.taxId}` 
                                      }
                                    ].map((stat, i) => (
                                      <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[110px]">
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <stat.icon size={14} className="text-slate-400" />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</p>
                                          </div>
                                          <h3 className={`text-xl font-black ${stat.color}`}>${Math.round(stat.val).toLocaleString()}</h3>
                                        </div>
                                        {stat.details && (
                                          <p className="text-[9px] text-slate-400 mt-2 font-semibold font-sans leading-none">{stat.details}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                      <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Globe size={14}/> Market Growth</h4>
                                        <div className="flex items-center gap-4">
                                          <input 
                                            type="range" min="-50" max="100" value={marketGrowth}
                                            onChange={e => setMarketGrowth(parseInt(e.target.value))}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                          />
                                          <span className="text-sm font-bold text-indigo-600 w-10 text-right">{marketGrowth}%</span>
                                        </div>
                                      </div>

                                      <div className="pt-6 border-t border-slate-50 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14}/> Seasonal Multipliers</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                          {MONTHS.map((m, i) => (
                                            <div key={m} className="space-y-1">
                                              <p className="text-[9px] font-bold text-slate-400 uppercase text-center">{m}</p>
                                              <input 
                                                type="text" 
                                                value={seasonality[i] !== undefined ? seasonality[i] : ""}
                                                onChange={e => {
                                                  const newSeason = [...seasonality];
                                                  newSeason[i] = e.target.value;
                                                  setSeasonality(newSeason);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-bold text-center text-slate-900 outline-none focus:border-indigo-400 transition-all font-mono"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[320px]">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><BarChart3 size={14}/> Monthly Revenue Curve</h4>
                                      <div className="flex-grow flex items-end gap-1.5 md:gap-3 px-2 pb-2 min-h-[220px]">
                                        {financials.monthlyData.map((m, i) => {
                                          const maxRev = Math.max(...financials.monthlyData.map(d => parseFloat(d.revenue) || 1));
                                          const height = maxRev > 0 ? ((parseFloat(m.revenue) || 0) / maxRev) * 100 : 0;
                                          return (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end" style={{ height: '220px' }}>
                                              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-10 pointer-events-none translate-y-2 group-hover:translate-y-0">
                                                ${Math.round(parseFloat(m.revenue) || 0).toLocaleString()}
                                              </div>
                                              <motion.div 
                                                initial={{ height: 0 }} 
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: i * 0.03, type: "spring", stiffness: 120 }}
                                                className="w-full bg-indigo-50 group-hover:bg-indigo-600 rounded-t-lg transition-colors cursor-pointer" 
                                              />
                                              <p className="text-[8px] font-black text-slate-400 uppercase mt-2 group-hover:text-slate-955 transition-colors">{m.name}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Corporate Treasury Ledger Table */}
                                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
                                    <div className="flex items-center justify-between mb-6">
                                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        <Server className="w-4 h-4 text-indigo-600" /> Corporate Treasury Ledger
                                      </h4>
                                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">Live Audit Trail</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left">
                                        <thead>
                                          <tr className="border-b border-slate-100">
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Operation / Source</th>
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Reference</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                          {ledgerBlocks.map((block, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                              <td className="py-4 text-[10px] font-black text-indigo-600 font-mono">TX-{block.block}</td>
                                              <td className="py-4 text-[10px] font-medium text-slate-500 whitespace-nowrap">{block.time}</td>
                                              <td className="py-4 text-xs font-bold text-slate-900">{block.type}</td>
                                              <td className={`py-4 text-xs font-black font-mono text-right whitespace-nowrap ${block.amount.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>{block.amount}</td>
                                              <td className="py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${block.status === 'Validated' || block.status === 'Paid' || block.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                  {(block.status === 'Validated' || block.status === 'Paid' || block.status === 'Settled') && <ShieldCheck className="w-3 h-3" />} {block.status}
                                                </span>
                                              </td>
                                              <td className="py-4 text-[9px] font-mono text-slate-400 text-right">{block.hash}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                             )}
                                      {blueprintTab === 'Milestones' && (
                                <div className="space-y-6 text-left max-w-6xl mx-auto">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-1">
                                      <h4 className="text-xl font-black uppercase text-slate-900 leading-none">Corporate Milestones & Events</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Track internal target dates, team celebrations, charity sponsorships, and customer milestones.</p>
                                    </div>
                                    <button 
                                      onClick={() => setNewMilestoneModal(true)}
                                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 w-full sm:w-auto justify-center"
                                    >
                                      <PlusIcon size={12}/> Add Milestone
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    {milestones.length === 0 ? (
                                      <div className="col-span-2 bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 shadow-sm flex flex-col items-center">
                                        <BookOpen className="w-12 h-12 mb-3 text-slate-200" />
                                        <p className="font-bold text-slate-800">No Milestones Recorded</p>
                                        <p className="text-xs text-slate-400 mt-1">Record your company anniversaries, charity events, and staff dinners to calculate corporate budgets.</p>
                                      </div>
                                    ) : (
                                      milestones.map((m) => {
                                        let catColor = "bg-slate-50 text-slate-600 border-slate-100";
                                        if (m.category === "Event") catColor = "bg-blue-50 text-blue-600 border-blue-100";
                                        else if (m.category === "Internal Event") catColor = "bg-purple-50 text-purple-600 border-purple-100";
                                        else if (m.category === "Operational Goal") catColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                        else if (m.category === "Charity & Donation") catColor = "bg-amber-50 text-amber-600 border-amber-100";

                                        return (
                                          <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative">
                                            <div>
                                              <div className="flex items-start justify-between gap-4 mb-3">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${catColor}`}>
                                                  {m.category}
                                                </span>
                                                <button 
                                                  onClick={() => handleDeleteMilestone(m.id)}
                                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent opacity-0 group-hover:opacity-100"
                                                  title="Delete Milestone"
                                                >
                                                  <TrashIcon size={12} />
                                                </button>
                                              </div>
                                              <h5 className="font-extrabold text-sm text-slate-900 leading-snug mb-1.5">{m.title}</h5>
                                              {m.notes && (
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{m.notes}</p>
                                              )}
                                            </div>

                                            <div className="border-t border-slate-100 pt-4 mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                              <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Target Timeline</p>
                                                <p className="text-[11px] font-extrabold text-slate-800">{m.targetDate}</p>
                                              </div>
                                              <div className="text-right sm:text-right">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Projected Budget</p>
                                                <span className="text-[11px] font-black text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                                                  ${Number(m.lowBudget).toLocaleString()} - ${Number(m.highBudget).toLocaleString()} CAD
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                             
                             {blueprintTab !== 'Business Overview' && blueprintTab !== 'SWOT Analysis' && blueprintTab !== '5-Year Goals' && blueprintTab !== '2-Year Goals' && blueprintTab !== 'Financials' && blueprintTab !== 'Milestones' && (
                               <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                 <BookOpen className="w-12 h-12 mb-4 text-slate-200" />
                                 <p className="italic">{blueprintTab} content is ready for integration.</p>
                               </div>
                             )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Setup Wizard Overlay */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!isWizardSubmitting) setIsWizardOpen(false); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[90vh] max-h-[780px]"
            >
              {/* Wizard Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 opacity-20 blur-2xl rounded-full" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm tracking-wider">
                    A
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wide uppercase">AURA Master Provisioner</h2>
                    <p className="text-[10px] text-slate-400">Sovereign Portal & Recruiting Board Registry</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <button 
                    onClick={loadDemoData} 
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-900 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  >
                    ⚡ Auto-Fill Demo Data
                  </button>
                  <span className="text-xs text-slate-500">|</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold uppercase">
                    Step {wizardStep} of 5
                  </span>
                </div>
              </div>

              {/* Wizard Steps indicator bar */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                {[
                  { num: 1, label: "Business Details" },
                  { num: 2, label: "Service Agreement" },
                  { num: 3, label: "Choose Architecture" },
                  { num: 4, label: "Root Administrator" },
                  { num: 5, label: "Deploy Portal" }
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => { if (!isWizardSubmitting && (s.num < wizardStep || wizardName)) setWizardStep(s.num); }}
                    disabled={s.num > wizardStep && !wizardName}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap px-2 py-1 rounded ${
                      wizardStep === s.num 
                        ? "text-indigo-650 bg-indigo-50" 
                        : wizardStep > s.num 
                          ? "text-emerald-600 hover:text-emerald-700" 
                          : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                      wizardStep === s.num 
                        ? "bg-indigo-600 text-white" 
                        : wizardStep > s.num 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-200 text-slate-500"
                    }`}>
                      {wizardStep > s.num ? "✓" : s.num}
                    </span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Wizard Content (Scrollable) */}
              <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50">
                {isWizardSubmitting ? (
                  <div className="text-center py-20 px-4 flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                    <h3 className="text-xl font-black text-slate-900 mb-2">Deploying Sovereign Node...</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Provisioning DNS, SSL certificates, and G7 ledger parameters</p>
                    
                    <div className="w-64 bg-slate-200 h-1.5 rounded-full mt-6 overflow-hidden">
                      <div className="bg-indigo-650 h-full animate-infinite-scroll w-1/3 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={wizardStep === 5 ? handleLaunchPortal : (e) => e.preventDefault()} className="space-y-6">
                    
                    {/* STEP 1: Business details */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 max-w-xl mx-auto">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 mb-1">Corporate Profile & Domain Allocation</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Provide formal registration name and select your sovereign URL slug.</p>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Business Name *</label>
                            <input 
                              type="text"
                              value={wizardName} 
                              onChange={e => { setWizardName(e.target.value); setWizardSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }}
                              placeholder="Bouchard Consulting Inc." 
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Calling / Friendly Name</label>
                            <input 
                              type="text"
                              value={wizardCallingName} 
                              onChange={e => setWizardCallingName(e.target.value)}
                              placeholder={wizardName || "e.g. Bouchard Consulting"} 
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sovereign Slug (URL Subdomain) *</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">@</span>
                              <input 
                                type="text"
                                value={wizardSlug} 
                                onChange={e => setWizardSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, ''))}
                                placeholder="bouchard-consulting" 
                                className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-bold text-indigo-650"
                                required
                              />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Address: owner@{wizardSlug || "business"}.aurame.ca</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Industry Vertical</label>
                              <input 
                                type="text"
                                value={wizardIndustry} 
                                onChange={e => setWizardIndustry(e.target.value)}
                                placeholder="Consulting, Tech, Retail..." 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Business Email</label>
                              <input 
                                type="email"
                                value={wizardBizEmail} 
                                onChange={e => setWizardBizEmail(e.target.value)}
                                placeholder="hello@company.com" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Registered Address</label>
                            <input 
                              type="text"
                              value={wizardStreetAddr} 
                              onChange={e => setWizardStreetAddr(e.target.value)}
                              placeholder="123 O'Connor St, Suite 400" 
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">City</label>
                              <input 
                                type="text"
                                value={wizardCity} 
                                onChange={e => setWizardCity(e.target.value)}
                                placeholder="Ottawa" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Province</label>
                              <input 
                                type="text"
                                value={wizardProvince} 
                                onChange={e => setWizardProvince(e.target.value)}
                                placeholder="ON" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Postal Code</label>
                              <input 
                                type="text"
                                value={wizardPostalCode} 
                                onChange={e => setWizardPostalCode(e.target.value)}
                                placeholder="K1P 5M9" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Country</label>
                              <input 
                                type="text"
                                value={wizardCountry} 
                                onChange={e => setWizardCountry(e.target.value)}
                                placeholder="Canada" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Business Phone</label>
                              <input 
                                type="text"
                                value={wizardBizPhone} 
                                onChange={e => setWizardBizPhone(e.target.value)}
                                placeholder="+1 (613) 555-0100" 
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* STEP 2: Service agreement & Plan subscription */}
                    {wizardStep === 2 && (
                      <div className="space-y-6 max-w-2xl mx-auto">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 mb-1">Select Subscription Tier & Sign Covenant</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Every paid plan requires upfront payment capture. Roster size limit binds at 2 employees for Free tier.</p>
                        </div>

                        {/* Subscription Tier Cards */}
                        <div className="grid grid-cols-3 gap-4">
                          {plansList.map((plan) => (
                            <div 
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              className={`p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all ${
                                selectedPlan.id === plan.id 
                                  ? "border-indigo-650 bg-indigo-50/20 text-indigo-950 shadow-md" 
                                  : "border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-black uppercase tracking-wider truncate">{plan.label.split(' ')[0]}</span>
                                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black">
                                  {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">{plan.services}</p>
                            </div>
                          ))}
                        </div>

                        {/* Contract text block */}
                        <div className="bg-[#fafafa] border border-slate-200 rounded-2xl p-5 max-h-[220px] overflow-y-auto text-xs text-slate-650 leading-relaxed space-y-3 font-medium">
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-200">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">A</div>
                            <div>
                              <p className="font-extrabold text-slate-900 leading-none">AURA Sovereign Business Agreement</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Ontario, CA · G7 Sovereign Network</p>
                            </div>
                          </div>
                          
                          <p><strong>Parties:</strong> This Platform Service Covenant is entered by and between <strong>Aurame Technologies Inc.</strong> ("AURA") and the subscribing business entity <strong>{wizardName || "Business Owner"}</strong> ("Subscriber").</p>
                          <p><strong>§ 1. Services & Plan:</strong> The Subscriber chooses the <strong>{selectedPlan.label}</strong>. For paid tiers ($49 or $149 USD/CAD), Subscriber agrees to authorize an upfront recurring charge, which secures hosting, G7 compliant nodes, and legal payroll ledgers.</p>
                          <p><strong>§ 2. Roster limit & seat scaling:</strong> The Free plan permits a maximum of <strong>2 employees</strong>. In order to register a 3rd employee or scale payroll, Subscriber must authorize upfront payment. Professional plan unlocks full roster parameters.</p>
                          <p><strong>§ 3. No Data Loss Protection:</strong> In the event of subscription downgrade or billing failure, Subscriber accounts are immediately transitioned to the Solo Free Plan. All database columns, inventory specs, client histories, and compliance logs are preserved in full—no structural data is deleted.</p>
                          <p><strong>§ 4. Data Sovereignty:</strong> Subscriber maintains 100% legal ownership of files, blueprints, and assets. AURA will never sell or monetize corporate records.</p>
                        </div>

                        {/* Signature input field */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Type full legal name to sign *</label>
                            <input 
                              type="text"
                              value={wizardSignature} 
                              onChange={e => { setWizardSignature(e.target.value); if (!wizardAdminName) setWizardAdminName(e.target.value); }}
                              placeholder="e.g. Arthur Bouchard" 
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-serif font-bold italic text-indigo-650 text-base"
                              required
                            />
                          </div>

                          <label className="flex items-start gap-2.5 cursor-pointer pb-1.5 select-none">
                            <input 
                              type="checkbox"
                              checked={wizardAgreed}
                              onChange={e => setWizardAgreed(e.target.checked)}
                              className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              required
                            />
                            <span className="text-[10px] text-slate-500 leading-normal font-semibold">
                              I have read, understood, and sign this Sovereign Service Covenant.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Choose your architecture */}
                    {wizardStep === 3 && (
                      <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-full justify-between">
                        
                        {wizardSubStep === "select" ? (
                          /* SUB-STEP A: Template Architecture Selection (Screenshot Matching!) */
                          <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center max-w-2xl mx-auto">
                              <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Choose your architecture.</h4>
                              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Select an Apple-grade template engineered for conversion. We automatically wire up your Sovereign POS and Webhooks in the background.
                              </p>
                            </div>

                            {/* 3-Column Templates Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                              
                              {/* 1. Luxe Minimal */}
                              <div 
                                onClick={() => setWizardArchitecture("luxe_minimal")}
                                className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[300px] bg-white ${
                                  wizardArchitecture === "luxe_minimal"
                                    ? "border-indigo-600 shadow-[0_12px_24px_rgba(99,102,241,0.08)] bg-indigo-50/5"
                                    : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                                }`}
                              >
                                {/* representational visual layout mock */}
                                <div className="aspect-[4/3] bg-slate-50 rounded-xl border border-slate-150 p-3.5 flex flex-col justify-between shrink-0 mb-4 select-none">
                                  {/* Header wireframe */}
                                  <div className="flex items-center justify-between">
                                    <div className="w-10 h-2 bg-slate-300 rounded" />
                                    <div className="flex gap-1.5">
                                      <div className="w-4 h-2 bg-slate-200 rounded" />
                                      <div className="w-4 h-2 bg-slate-200 rounded" />
                                    </div>
                                  </div>
                                  {/* Middle visual */}
                                  <div className="flex flex-col items-center justify-center py-2">
                                    <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                    </div>
                                  </div>
                                  {/* Footer wireframe */}
                                  <div className="w-full h-1.5 bg-slate-200 rounded-sm" />
                                </div>

                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-800 text-sm">Luxe Minimal</h5>
                                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                                    Perfect for high-end services and agencies.
                                  </p>
                                </div>
                              </div>

                              {/* 2. Service Pro (Selected by Default!) */}
                              <div 
                                onClick={() => setWizardArchitecture("service_pro")}
                                className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[300px] bg-white ${
                                  wizardArchitecture === "service_pro"
                                    ? "border-indigo-600 shadow-[0_12px_32px_rgba(99,102,241,0.15)] bg-indigo-50/10 scale-[1.02]"
                                    : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                                }`}
                              >
                                {/* representational visual layout mock */}
                                <div className="aspect-[4/3] bg-slate-50 rounded-xl border border-slate-150 p-3.5 flex flex-col justify-between shrink-0 mb-4 select-none">
                                  {/* Header wireframe */}
                                  <div className="flex items-center justify-between">
                                    <div className="w-12 h-2 bg-slate-400 rounded" />
                                    <div className="w-6 h-3.5 bg-indigo-100 rounded border border-indigo-200" />
                                  </div>
                                  {/* Middle visual */}
                                  <div className="flex flex-col items-center justify-center py-2">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                                    </div>
                                  </div>
                                  {/* Footer wireframe */}
                                  <div className="flex gap-1">
                                    <div className="w-8 h-1.5 bg-slate-200 rounded-sm" />
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-sm" />
                                  </div>
                                </div>

                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                    <span>Service Pro</span>
                                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Active</span>
                                  </h5>
                                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                                    Built for trades, plumbers, and local businesses.
                                  </p>
                                </div>
                              </div>

                              {/* 3. Creator Studio */}
                              <div 
                                onClick={() => setWizardArchitecture("creator_studio")}
                                className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[300px] bg-white ${
                                  wizardArchitecture === "creator_studio"
                                    ? "border-indigo-600 shadow-[0_12px_24px_rgba(99,102,241,0.08)] bg-indigo-50/5"
                                    : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                                }`}
                              >
                                {/* representational visual layout mock */}
                                <div className="aspect-[4/3] bg-slate-50 rounded-xl border border-slate-150 p-3.5 flex flex-col justify-between shrink-0 mb-4 select-none">
                                  {/* Header wireframe */}
                                  <div className="flex items-center justify-between">
                                    <div className="w-8 h-2 bg-slate-300 rounded" />
                                    <div className="w-3 h-3 bg-slate-300 rounded-full" />
                                  </div>
                                  {/* Middle visual */}
                                  <div className="flex flex-col items-center justify-center py-2">
                                    <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                                    </div>
                                  </div>
                                  {/* Footer wireframe */}
                                  <div className="w-2/3 h-1.5 bg-slate-200 rounded-sm" />
                                </div>

                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-800 text-sm">Creator Studio</h5>
                                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                                    For artists, designers, and modern brands.
                                  </p>
                                </div>
                              </div>

                            </div>

                            {/* Continue to Customization Action Button */}
                            <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-6">
                              <button
                                type="button"
                                onClick={() => setWizardSubStep("customize")}
                                className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-0 flex items-center gap-2 shadow-lg shadow-slate-900/10"
                              >
                                <span>Continue to Customization</span>
                                <span className="text-xs">➔</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* SUB-STEP B: Visual Branding, Greetings & Live Studio Sync */
                          <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div>
                                <h4 className="text-lg font-black text-slate-900">Tailor Portal Brand & Aesthetics</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Customize accent styling for your select architecture ({wizardArchitecture.replace('_', ' ')}).</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setWizardSubStep("select")}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-lg border-0 cursor-pointer transition-all"
                              >
                                ⬅ Change Architecture
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                              
                              {/* Left Column: Visual Customization Controls */}
                              <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Branding Configurator</h5>
                                
                                {/* Accent Palette Color */}
                                <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Accent Palette Color</label>
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="color" 
                                      value={wizardPrimaryColor}
                                      onChange={e => setWizardPrimaryColor(e.target.value)}
                                      className="w-10 h-10 p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-white"
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                      {["#6366f1", "#0ea5e9", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#1e293b"].map((c) => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => setWizardPrimaryColor(c)}
                                          className="w-6 h-6 rounded-full border border-slate-200 transition-all hover:scale-110 shrink-0"
                                          style={{ backgroundColor: c, outline: wizardPrimaryColor === c ? '2px solid #6366f1' : 'none' }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Theme Selection */}
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setWizardThemeMode("light")}
                                    className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all ${
                                      wizardThemeMode === "light" 
                                        ? "border-indigo-650 bg-indigo-50/20 text-indigo-950" 
                                        : "border-slate-200 hover:bg-slate-50 text-slate-500"
                                    }`}
                                  >
                                    ☀️ Theme: Light Canvas
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setWizardThemeMode("dark")}
                                    className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all ${
                                      wizardThemeMode === "dark" 
                                        ? "border-indigo-650 bg-slate-900 text-slate-105" 
                                        : "border-slate-200 hover:bg-slate-50 text-slate-500"
                                    }`}
                                  >
                                    🌙 Theme: Dark Canvas
                                  </button>
                                </div>

                                {/* Quick Palette Presets */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Signature Theme Presets</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { label: "Royal Obsidian", color: "#1e293b", mode: "dark" },
                                      { label: "Frost Glass", color: "#10b981", mode: "light" },
                                      { label: "Nordic Slate", color: "#f59e0b", mode: "light" },
                                      { label: "G7 Indigo", color: "#6366f1", mode: "dark" }
                                    ].map((p) => (
                                      <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => { setWizardPrimaryColor(p.color); setWizardThemeMode(p.mode); }}
                                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-650 flex items-center justify-between transition-all cursor-pointer"
                                      >
                                        <span>{p.label}</span>
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Hello Text Inputs */}
                                <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Job Board Welcome Heading</label>
                                  <input 
                                    type="text"
                                    value={wizardWelcomeHeading}
                                    onChange={e => setWizardWelcomeHeading(e.target.value)}
                                    placeholder="Join our exceptional team"
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Welcome Subheading</label>
                                  <textarea 
                                    value={wizardWelcomeSubheading}
                                    onChange={e => setWizardWelcomeSubheading(e.target.value)}
                                    placeholder="We are looking for creative thinkers..."
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium h-16 resize-none"
                                  />
                                </div>
                              </div>

                              {/* Right Column: G7 Coding Studio Live Preview */}
                              <div className="space-y-4">
                                
                                {/* Studio Sync Details explainer */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white">
                                  <div className="flex items-start gap-2.5">
                                    <span className="text-base text-indigo-400">🔗</span>
                                    <div>
                                      <h6 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">G7 Studio Sync & Dynamic Chat Provisioning</h6>
                                      <p className="text-[10px] text-slate-300 leading-relaxed font-semibold mt-1">
                                        Once launched, your custom colors, selected template <strong>({wizardArchitecture})</strong>, and administrative credentials will automatically integrate into **My Chat** and **My Coding Studio**.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Simulated Coding Studio Mockup Card */}
                                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-xl overflow-hidden text-left font-mono text-[9px] h-[220px] flex flex-col text-neutral-400">
                                  
                                  {/* Header Tab Bar */}
                                  <div className="bg-[#181818] border-b border-neutral-900 px-3 py-2 flex items-center justify-between text-neutral-500 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                      <span className="ml-2 text-neutral-400 font-bold uppercase tracking-wider text-[8px]">My Coding Studio</span>
                                    </div>
                                    <span className="text-[8px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-black">
                                      @{wizardSlug || "business"}.aurame.ca
                                    </span>
                                  </div>

                                  {/* Workspace Workspace */}
                                  <div className="flex-1 flex overflow-hidden">
                                    {/* Left Folder tree */}
                                    <div className="w-1/4 bg-[#151515] border-r border-neutral-900 p-2.5 space-y-2 select-none">
                                      <div className="font-bold text-neutral-500 uppercase text-[8px]">Blueprints</div>
                                      <div className="space-y-1 text-neutral-400">
                                        <p className="flex items-center gap-1"><span className="text-yellow-500">📁</span> src</p>
                                        <p className="flex items-center gap-1 pl-2 text-indigo-400 font-bold">● config.json</p>
                                        <p className="flex items-center gap-1 pl-2">📄 index.html</p>
                                        <p className="flex items-center gap-1 pl-2">📄 styles.css</p>
                                      </div>
                                    </div>

                                    {/* Code Editor Content */}
                                    <div className="flex-1 bg-[#1e1e1e] p-3 overflow-y-auto space-y-1.5 select-text scrollbar-none">
                                      <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-850 pb-1 mb-1.5 text-[8px]">
                                        <span>config.json</span>
                                        <span className="text-emerald-400">● Mapped & Active</span>
                                      </div>
                                      
                                      <pre className="text-neutral-300 leading-normal font-medium">
{`{
  "business_name": "${wizardName || "Bouchard Consulting"}",
  "subdomain": "${wizardSlug || "bouchard-consulting"}",
  "template": "${wizardArchitecture}",
  "theme_accent": "`}<span style={{ color: wizardPrimaryColor }}>{wizardPrimaryColor}</span>{`",
  "theme_canvas": "${wizardThemeMode}",
  "studio_sync": true
}`}
                                      </pre>

                                      <div className="mt-2 p-2 rounded border border-neutral-800/80 bg-neutral-900/50 flex flex-col gap-0.5">
                                        <span className="text-[8px] text-neutral-500 font-black uppercase">Live Aesthetic Preview</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <div 
                                            className="w-16 h-3 rounded text-[7px] text-white flex items-center justify-center font-sans font-bold" 
                                            style={{ backgroundColor: wizardPrimaryColor }}
                                          >
                                            Accent
                                          </div>
                                          <span className="text-neutral-500">template:</span>
                                          <span className="text-neutral-350">{wizardArchitecture}</span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>

                                  {/* Footer Terminal status bar */}
                                  <div className="bg-[#181818] border-t border-neutral-900 px-3 py-1.5 flex items-center justify-between text-neutral-500 shrink-0 text-[8px]">
                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> connected to aurame.ca/studio</span>
                                    <span>UTF-8</span>
                                  </div>

                                </div>

                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* STEP 4: Admin credentials setup */}
                    {wizardStep === 4 && (
                      <div className="space-y-4 max-w-xl mx-auto">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 mb-1">Create Administrative Owner Key</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Secure root key used to deploy ledger edits, view bills of materials, and adjust payroll sheets.</p>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Root Administrator Name *</label>
                            <input 
                              type="text"
                              value={wizardAdminName}
                              onChange={e => setWizardAdminName(e.target.value)}
                              placeholder="Arthur Bouchard"
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Owner Portal Password *</label>
                            <input 
                              type="password"
                              value={wizardAdminPassword}
                              onChange={e => setWizardAdminPassword(e.target.value)}
                              placeholder="Choose secure master password"
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                              required
                            />
                          </div>

                          <label className="flex items-start gap-2.5 cursor-pointer pt-2 select-none">
                            <input 
                              type="checkbox"
                              checked={wizardAgreeToTerms}
                              onChange={e => setWizardAgreeToTerms(e.target.checked)}
                              className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              required
                            />
                            <span className="text-[10px] text-slate-500 leading-normal font-semibold">
                              I authorize AURA to serve dynamic traffic on subdomain <strong>@{wizardSlug || "business"}.aurame.ca</strong>.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Provisioning Review */}
                    {wizardStep === 5 && (
                      <div className="space-y-4 max-w-xl mx-auto">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 mb-1">Examine Provisioning Blueprint</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Confirm all configurations below. Paid tiers will initiate secure sandboxed Stripe checkout.</p>
                        </div>

                        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 text-xs font-semibold">
                          <div className="p-3 bg-slate-50 font-black text-slate-700 flex justify-between items-center">
                            <span>AURA Deploy Blueprint</span>
                            <span className="text-[9px] uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">Awaiting Host</span>
                          </div>
                          
                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">Business Name</span>
                            <span className="col-span-2 text-slate-900 font-extrabold">{wizardName}</span>
                          </div>

                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">Target Plan</span>
                            <span className="col-span-2 text-indigo-650 font-extrabold">{selectedPlan.label} ({selectedPlan.price === 0 ? "Free Plan" : `$${selectedPlan.price}/mo`})</span>
                          </div>

                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">Allocated Domain</span>
                            <span className="col-span-2 font-mono text-indigo-600 font-bold">@{wizardSlug}.aurame.ca</span>
                          </div>

                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">Industry Segment</span>
                            <span className="col-span-2 text-slate-800">{wizardIndustry || "General Practice"}</span>
                          </div>

                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">Administrator</span>
                            <span className="col-span-2 text-slate-800">{wizardAdminName}</span>
                          </div>

                          <div className="p-3.5 grid grid-cols-3 gap-2">
                            <span className="text-slate-400 uppercase text-[9px]">E-Signature</span>
                            <span className="col-span-2 text-indigo-605 font-bold italic font-serif text-sm">{wizardSignature}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-550 leading-relaxed font-semibold">
                          <span className="text-indigo-600">💡</span>
                          <p>Ready to deploy. SSL and DNS records take ~2 seconds to compile. The system will auto-configure regional Canadian GST/HST corporate tax nodes on activation.</p>
                        </div>
                      </div>
                    )}

                    {/* Wizard Action Footer Panel */}
                    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                      {wizardStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (wizardStep === 3 && wizardSubStep === "customize") {
                              setWizardSubStep("select");
                            } else {
                              setWizardStep(prev => prev - 1);
                            }
                          }}
                          className="px-5 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-black uppercase transition-all cursor-pointer bg-white"
                        >
                          Back
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure new node</span>
                      )}

                      {wizardStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (wizardStep === 3 && wizardSubStep === "select") {
                              setWizardSubStep("customize");
                            } else {
                              setWizardStep(prev => prev + 1);
                            }
                          }}
                          disabled={
                            (wizardStep === 1 && (!wizardName || !wizardSlug)) ||
                            (wizardStep === 2 && (!wizardSignature || !wizardAgreed))
                          }
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-white border-0 ${
                            ((wizardStep === 1 && (!wizardName || !wizardSlug)) || (wizardStep === 2 && (!wizardSignature || !wizardAgreed)))
                              ? "bg-slate-300 cursor-not-allowed"
                              : "bg-indigo-650 hover:bg-indigo-700 shadow-md cursor-pointer"
                          }`}
                        >
                          {wizardStep === 3 && wizardSubStep === "select" ? "Continue" : "Next Step"}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isWizardSubmitting || !wizardAgreeToTerms}
                          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-white flex items-center gap-2 border-0 ${
                            isWizardSubmitting || !wizardAgreeToTerms
                              ? "bg-indigo-300 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
                          }`}
                        >
                          Launch Portal Now
                        </button>
                      )}
                    </div>

                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Employee Form Modal */}
      <AnimatePresence>
        {newEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNewEmployeeModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <h3 className="text-lg font-black text-slate-900 mb-1">Add Team Member</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Register new employee to payroll roster.</p>
              
              <form onSubmit={handleSaveEmployee} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    value={empForm.name} 
                    onChange={e => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Tom Fixer"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <input 
                    type="email" 
                    value={empForm.email} 
                    onChange={e => setEmpForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tom@acme.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Role Title</label>
                    <input 
                      type="text" 
                      value={empForm.role} 
                      onChange={e => setEmpForm(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g. HVAC Tech"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Department</label>
                    <input 
                      type="text" 
                      value={empForm.department} 
                      onChange={e => setEmpForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Field Services"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Hourly Wage ($ CAD)</label>
                    <input 
                      type="number" 
                      value={empForm.hourlyRate} 
                      onChange={e => setEmpForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="35"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone</label>
                    <input 
                      type="text" 
                      value={empForm.phone} 
                      onChange={e => setEmpForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 987-6543"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                  ⚠️ Note: Registering more than 2 employees to this business requires an upfront subscription authorization of $75.00 CAD/month.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setNewEmployeeModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stripe Secure Payment Authorization Modal */}
      <AnimatePresence>
        {newPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!isPaying) setNewPaymentModal(false); }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
            >
              {/* Stripe Top Panel */}
              <div className="bg-indigo-750 p-6 text-white shrink-0 relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 blur-xl rounded-full" />
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase text-indigo-200 tracking-wider bg-indigo-900/50 px-2 py-0.5 rounded">🔒 Secure Gateway</span>
                  <h3 className="text-lg font-black mt-1">AURA Subscription Authorization</h3>
                </div>
                <div className="relative z-10 font-black text-xs bg-white/10 px-3 py-1 rounded-lg">
                  Stripe Verified
                </div>
              </div>

              {/* Stripe CC Body */}
              <div className="p-6 overflow-y-auto">
                {isPaying ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-650 animate-spin mb-4" />
                    <h4 className="font-extrabold text-slate-800">Processing Upfront Charge...</h4>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Authorizing credit card and dispatching webhook ledger events</p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessCCPayment} className="space-y-5">
                    {/* Interception warning message */}
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="text-[11px] font-black text-amber-900 uppercase">Upfront Payroll Billing Required</p>
                        <p className="text-[10px] text-amber-800 leading-relaxed font-semibold mt-1">
                          You are adding a <strong>3rd employee</strong> which exceeds the free roster boundaries. To complete registration, you must authorize upfront payment for the <strong>Professional Cloud Plan ($75.00 CAD / month)</strong> immediately.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="text-slate-400 uppercase text-[9px] mb-0.5">Subscription Tier</p>
                        <p className="text-slate-800 font-extrabold">Professional Cloud Subcontract</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 uppercase text-[9px] mb-0.5">Due Upfront</p>
                        <p className="text-indigo-650 font-black font-mono text-sm">$75.00 CAD</p>
                      </div>
                    </div>

                    {/* Credit Card inputs */}
                    <div className="space-y-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder={selectedBusiness?.adminName || "Arthur Bouchard"} 
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Credit Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={paymentForm.cardNumber}
                            onChange={e => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                            placeholder="4242 4242 4242 4242" 
                            className="w-full pl-3.5 pr-12 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono font-bold text-slate-800"
                            required
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VISA</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Expiry</label>
                          <input 
                            type="text" 
                            value={paymentForm.expiry}
                            onChange={e => setPaymentForm(prev => ({ ...prev, expiry: e.target.value }))}
                            placeholder="MM/YY" 
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-center font-bold"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">CVC</label>
                          <input 
                            type="password" 
                            value={paymentForm.cvc}
                            onChange={e => setPaymentForm(prev => ({ ...prev, cvc: e.target.value }))}
                            placeholder="***" 
                            maxLength={4}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-center"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Billing Zip/Postal</label>
                          <input 
                            type="text" 
                            value={paymentForm.zip}
                            onChange={e => setPaymentForm(prev => ({ ...prev, zip: e.target.value }))}
                            placeholder="K1P 5M9" 
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-center font-bold"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 font-bold uppercase tracking-wider">
                      <span>🔒 SSL Enforced · PCI-DSS Compliant</span>
                      <span>Stripe Inc. © 2026</span>
                    </div>

                    {/* Pay button */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100 mt-4">
                      <button 
                        type="button" 
                        onClick={() => setNewPaymentModal(false)}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-black uppercase transition-all cursor-pointer bg-white"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-2 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 shadow-md shadow-indigo-100"
                      >
                        Pay &amp; Authorize Upfront
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-bounce transition-all duration-300 bg-white border-slate-100">
          <div className={`p-1.5 rounded-lg ${
            toastMessage.type === 'error' ? 'bg-red-50 text-red-500' : 
            toastMessage.type === 'warning' ? 'bg-amber-50 text-amber-500' :
            toastMessage.type === 'info' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
          }`}>
            {toastMessage.type === 'error' ? <span className="text-xs font-bold">⚠️</span> : <CheckIcon size={14} />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{toastMessage.text}</p>
          </div>
        </div>
      )}

    </div>
  );
}
