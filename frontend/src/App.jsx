import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, BookOpen, PlusCircle, ArrowLeftRight,
  BarChart2, Bot, ChevronLeft, ChevronRight, RefreshCw,
  TrendingUp, TrendingDown, Zap, Activity, Layers, Telescope,
  Send, ArrowUp, ArrowDown, CircleDot, Wifi, WifiOff,
  CandlestickChart, Clock, Hash, Target, Sparkles,
  ChevronDown, Info, Shield, Cpu
} from "lucide-react";

// ─── Mock API Layer ───────────────────────────────────────────────────────────
const BASE = "http://localhost:8000";

const MOCK_ORDERS = {
  RELIANCE: {
    buy: [
      { id: 1, stockSymbol: "RELIANCE", quantity: 100, price: 2500, isBuy: true, timestamp: 1 },
      { id: 5, stockSymbol: "RELIANCE", quantity: 60, price: 2480, isBuy: true, timestamp: 5 },
      { id: 9, stockSymbol: "RELIANCE", quantity: 25, price: 2460, isBuy: true, timestamp: 9 },
    ],
    sell: [
      { id: 2, stockSymbol: "RELIANCE", quantity: 40, price: 2490, isBuy: false, timestamp: 2 },
      { id: 6, stockSymbol: "RELIANCE", quantity: 80, price: 2510, isBuy: false, timestamp: 6 },
    ],
  },
  TCS: {
    buy: [
      { id: 3, stockSymbol: "TCS", quantity: 50, price: 3500, isBuy: true, timestamp: 3 },
      { id: 7, stockSymbol: "TCS", quantity: 30, price: 3480, isBuy: true, timestamp: 7 },
    ],
    sell: [
      { id: 4, stockSymbol: "TCS", quantity: 20, price: 3490, isBuy: false, timestamp: 4 },
      { id: 8, stockSymbol: "TCS", quantity: 45, price: 3520, isBuy: false, timestamp: 8 },
    ],
  },
  INFY: {
    buy: [
      { id: 11, stockSymbol: "INFY", quantity: 200, price: 1450, isBuy: true, timestamp: 11 },
    ],
    sell: [
      { id: 12, stockSymbol: "INFY", quantity: 120, price: 1460, isBuy: false, timestamp: 12 },
    ],
  },
};

const MOCK_TRADES = [
  { buyOrderId: 1, sellOrderId: 2, stockSymbol: "RELIANCE", quantity: 40, price: 2500, timestamp: "2025-06-07T09:15:00Z" },
  { buyOrderId: 3, sellOrderId: 4, stockSymbol: "TCS", quantity: 20, price: 3500, timestamp: "2025-06-07T09:18:00Z" },
  { buyOrderId: 5, sellOrderId: 6, stockSymbol: "RELIANCE", quantity: 60, price: 2490, timestamp: "2025-06-07T10:02:00Z" },
  { buyOrderId: 7, sellOrderId: 8, stockSymbol: "TCS", quantity: 30, price: 3480, timestamp: "2025-06-07T10:45:00Z" },
  { buyOrderId: 11, sellOrderId: 12, stockSymbol: "INFY", quantity: 120, price: 1450, timestamp: "2025-06-07T11:20:00Z" },
];

const MOCK_ANALYTICS = {
  total_trades: 5,
  total_volume: 270,
  average_price: 2684,
  stocks_tracked: 3,
  price_history: [
    { time: "09:00", RELIANCE: 2480, TCS: 3460, INFY: 1440 },
    { time: "09:30", RELIANCE: 2495, TCS: 3475, INFY: 1445 },
    { time: "10:00", RELIANCE: 2500, TCS: 3500, INFY: 1450 },
    { time: "10:30", RELIANCE: 2490, TCS: 3480, INFY: 1455 },
    { time: "11:00", RELIANCE: 2510, TCS: 3490, INFY: 1448 },
    { time: "11:30", RELIANCE: 2505, TCS: 3510, INFY: 1460 },
    { time: "12:00", RELIANCE: 2515, TCS: 3505, INFY: 1452 },
  ],
  volume_by_stock: [
    { stock: "RELIANCE", volume: 100 },
    { stock: "TCS", volume: 50 },
    { stock: "INFY", volume: 120 },
  ],
};

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  green: "#00e5b0",
  red: "#ff3d5a",
  blue: "#3b9eff",
  amber: "#ffb347",
  purple: "#9d7fff",
  surface: "#0f1117",
  card: "#161b27",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
};

const STOCK_COLORS = { RELIANCE: "#3b9eff", TCS: "#00e5b0", INFY: "#9d7fff" };

// ─── Ticker Data ─────────────────────────────────────────────────────────────
const FULL_TICKER = [
  { sym: "RELIANCE", price: "2,505", chg: "+0.8%", pos: true },
  { sym: "TCS",      price: "3,510", chg: "+0.9%", pos: true },
  { sym: "INFY",     price: "1,452", chg: "-0.2%", pos: false },
  { sym: "HDFCBANK", price: "1,712", chg: "+0.4%", pos: true },
  { sym: "WIPRO",    price: "482",   chg: "-0.6%", pos: false },
  { sym: "BAJFIN",   price: "6,830", chg: "+1.1%", pos: true },
  { sym: "TITAN",    price: "3,240", chg: "+0.3%", pos: true },
  { sym: "ADANIENT", price: "2,950", chg: "-0.5%", pos: false },
];

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #060910;
      --bg2: #080c13;
      --surface: #0d1117;
      --card: #0f1520;
      --card2: #111827;
      --border: rgba(255,255,255,0.055);
      --border2: rgba(255,255,255,0.035);
      --green: #00e5b0;
      --green-dim: #00b38a;
      --green-glow: rgba(0,229,176,0.18);
      --red: #ff3d5a;
      --red-dim: #cc2244;
      --red-glow: rgba(255,61,90,0.18);
      --blue: #3b9eff;
      --blue-dim: #1d6fc4;
      --blue-glow: rgba(59,158,255,0.15);
      --amber: #ffb347;
      --amber-glow: rgba(255,179,71,0.12);
      --purple: #9d7fff;
      --purple-dim: #6d4fd4;
      --purple-glow: rgba(157,127,255,0.15);
      --text: #e8edf5;
      --text2: #9faab8;
      --muted: #4a5568;
      --muted2: #1e2a3a;
      --font-mono: 'JetBrains Mono', monospace;
      --font-display: 'Syne', sans-serif;
      --r-xl: 16px;
      --r-2xl: 20px;
    }

    html, body { height: 100%; background: var(--bg); overflow: hidden; }

    /* Glass morphism */
    .glass-card {
      background: linear-gradient(145deg,
        rgba(255,255,255,0.045) 0%,
        rgba(255,255,255,0.018) 50%,
        rgba(255,255,255,0.008) 100%
      );
      border: 1px solid var(--border);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .glass-darker {
      background: rgba(6,9,16,0.7);
      border: 1px solid var(--border);
      backdrop-filter: blur(24px);
    }

    /* Depth glow orbs */
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(80px);
    }

    /* KPI Cards */
    .kpi-card {
      background: linear-gradient(145deg,
        rgba(255,255,255,0.05) 0%,
        rgba(255,255,255,0.015) 100%
      );
      border: 1px solid var(--border);
      border-radius: var(--r-2xl);
      position: relative;
      overflow: hidden;
      transition: border-color 0.25s ease, transform 0.2s ease;
    }
    .kpi-card:hover {
      border-color: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
      pointer-events: none;
    }

    /* Buttons */
    .btn-buy {
      background: linear-gradient(135deg, #009970 0%, #00e5b0 100%);
      box-shadow: 0 4px 24px rgba(0,229,176,0.28), inset 0 1px 0 rgba(255,255,255,0.2);
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .btn-buy:hover:not(:disabled) {
      box-shadow: 0 8px 36px rgba(0,229,176,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
      transform: translateY(-2px);
    }
    .btn-buy:active:not(:disabled) { transform: translateY(0); }

    .btn-sell {
      background: linear-gradient(135deg, #b01c36 0%, #ff3d5a 100%);
      box-shadow: 0 4px 24px rgba(255,61,90,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .btn-sell:hover:not(:disabled) {
      box-shadow: 0 8px 36px rgba(255,61,90,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    .btn-sell:active:not(:disabled) { transform: translateY(0); }

    /* Inputs */
    .premium-input {
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.07);
      color: var(--text);
      font-family: var(--font-mono);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .premium-input:focus {
      outline: none;
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(59,158,255,0.1), 0 0 24px rgba(59,158,255,0.08);
    }
    .premium-input::placeholder { color: rgba(255,255,255,0.18); }

    .premium-select {
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.07);
      color: var(--text);
      font-family: var(--font-mono);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%234a5568' d='M5 6L0 0h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }
    .premium-select:focus {
      outline: none;
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(59,158,255,0.1);
    }
    .premium-select option { background: #111827; }

    /* Live ticker */
    .ticker-track {
      display: flex;
      animation: tickerMove 30s linear infinite;
      will-change: transform;
    }
    @keyframes tickerMove {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* Pulse dot */
    .live-dot {
      position: relative;
      display: inline-flex;
      width: 8px;
      height: 8px;
    }
    .live-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--green);
      animation: livePulse 2s ease-out infinite;
    }
    .live-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--green);
    }
    @keyframes livePulse {
      0%   { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.8); opacity: 0; }
    }

    /* Shimmer skeleton */
    .shimmer {
      background: linear-gradient(90deg,
        rgba(255,255,255,0.025) 25%,
        rgba(255,255,255,0.065) 50%,
        rgba(255,255,255,0.025) 75%
      );
      background-size: 200% 100%;
      animation: shimmerAnim 1.8s ease-in-out infinite;
    }
    @keyframes shimmerAnim {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Page transitions */
    .fade-in {
      animation: fadeInUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Staggered children */
    .stagger-1 { animation-delay: 0.04s; opacity: 0; animation-fill-mode: forwards; }
    .stagger-2 { animation-delay: 0.08s; opacity: 0; animation-fill-mode: forwards; }
    .stagger-3 { animation-delay: 0.12s; opacity: 0; animation-fill-mode: forwards; }
    .stagger-4 { animation-delay: 0.16s; opacity: 0; animation-fill-mode: forwards; }

    /* Nav active indicator */
    .nav-active-bar {
      position: absolute;
      left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 22px;
      border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, var(--blue), var(--purple));
      box-shadow: 0 0 10px rgba(59,158,255,0.6);
    }

    /* Depth bars in order book */
    .depth-buy {
      background: linear-gradient(90deg, transparent, rgba(0,229,176,0.1));
    }
    .depth-sell {
      background: linear-gradient(270deg, transparent, rgba(255,61,90,0.1));
    }
    .order-row:hover .depth-fill { opacity: 1 !important; }

    /* Chat bubbles */
    .bubble-user {
      background: linear-gradient(135deg, #1a3a8f 0%, #2563eb 100%);
      box-shadow: 0 4px 16px rgba(37,99,235,0.25);
    }
    .bubble-ai {
      background: rgba(255,255,255,0.038);
      border: 1px solid rgba(255,255,255,0.07);
    }

    /* Typing dots */
    .dot-typing span {
      display: inline-block;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: var(--blue);
      animation: dotBounce 1.4s ease-in-out infinite;
    }
    .dot-typing span:nth-child(2) { animation-delay: 0.2s; }
    .dot-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30%           { transform: translateY(-7px); opacity: 1; }
    }

    /* Scrollbar */
    .scroll-thin::-webkit-scrollbar { width: 3px; }
    .scroll-thin::-webkit-scrollbar-track { background: transparent; }
    .scroll-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
    .scroll-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

    /* Price flash animation */
    @keyframes priceFlashGreen {
      0%, 100% { background: transparent; }
      50%       { background: rgba(0,229,176,0.18); }
    }
    @keyframes priceFlashRed {
      0%, 100% { background: transparent; }
      50%       { background: rgba(255,61,90,0.18); }
    }

    table th { font-family: var(--font-mono); }
    table td { font-family: var(--font-mono); }

    /* Row hover */
    .tbl-row { transition: background 0.15s ease; }
    .tbl-row:hover { background: rgba(255,255,255,0.025) !important; }

    /* Sparkline */
    .sparkline-path { transition: stroke-dashoffset 1s ease; }
  `}</style>
);

// ─── SparklineSVG ─────────────────────────────────────────────────────────────
function SparklineSVG({ positive = true }) {
  const pts = positive
    ? "0,28 8,24 16,20 24,22 32,16 40,18 48,12 56,10 64,14 72,8"
    : "0,10 8,14 16,12 24,18 32,16 40,22 48,20 56,26 64,24 72,28";
  const col = positive ? "#00e5b0" : "#ff3d5a";
  const id = `sg_${positive ? "p" : "n"}`;
  return (
    <svg width="73" height="36" viewBox="0 0 73 36" fill="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.35" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${col}88)` }} />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(255,255,255,0.05)" }} />
        <div className="absolute inset-0 rounded-full animate-spin"
          style={{ border: "2px solid transparent", borderTopColor: "var(--blue)" }} />
      </div>
      <div className="shimmer h-2 w-20 rounded-full" />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, variant = "default" }) {
  const s = {
    default: { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.08)" },
    buy:     { bg: "rgba(0,229,176,0.08)",   color: "#00e5b0",              border: "rgba(0,229,176,0.2)" },
    sell:    { bg: "rgba(255,61,90,0.08)",    color: "#ff3d5a",              border: "rgba(255,61,90,0.2)" },
    info:    { bg: "rgba(59,158,255,0.08)",   color: "#3b9eff",              border: "rgba(59,158,255,0.2)" },
  }[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 6,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ children, action, accent = "blue" }) {
  const accentMap = { blue: "#3b9eff", green: "#00e5b0", purple: "#9d7fff", amber: "#ffb347" };
  const col = accentMap[accent] || "#3b9eff";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.38)",
        fontFamily: "var(--font-mono)",
      }}>
        <span style={{
          width: 2, height: 14, borderRadius: 2,
          background: `linear-gradient(180deg, ${col}, ${col}55)`,
          boxShadow: `0 0 6px ${col}66`,
          display: "inline-block", flexShrink: 0,
        }} />
        {children}
      </h2>
      {action}
    </div>
  );
}

// ─── KPI / Stat Card ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = "#3b9eff", pulse = false, sparkline, delay = 0 }) {
  return (
    <div className={`kpi-card fade-in`} style={{ padding: "20px 22px", animationDelay: `${delay}s` }}>
      {/* Background glow orb */}
      <div className="glow-orb" style={{
        width: 120, height: 120,
        background: color, opacity: 0.06,
        top: -30, right: -20,
      }} />
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          fontFamily: "var(--font-mono)",
        }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}18`, border: `1px solid ${color}28`,
        }}>
          {Icon && <Icon size={15} color={color} strokeWidth={2} />}
        </div>
      </div>
      {/* Value */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1,
              fontFamily: "var(--font-display)", letterSpacing: "-0.03em",
            }}>{value}</span>
            {pulse && (
              <span style={{ position: "relative", display: "inline-flex" }}>
                <span className="live-dot" />
              </span>
            )}
          </div>
          {sub && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-mono)" }}>{sub}</span>}
        </div>
        {sparkline !== undefined && (
          <div style={{ opacity: 0.75, marginBottom: 2 }}>
            <SparklineSVG positive={sparkline} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
function Dashboard({ analytics }) {
  if (!analytics) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {[0,1,2,3].map(i => (
        <div key={i} className="kpi-card" style={{ padding: "20px 22px", height: 120 }}>
          <div className="shimmer" style={{ height: 10, width: 80, borderRadius: 4, marginBottom: 16 }} />
          <div className="shimmer" style={{ height: 28, width: 60, borderRadius: 4, marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 8, width: 100, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}
      className="xl:grid-cols-4">
      <StatCard label="Total Trades" value={analytics.total_trades}
        icon={Zap} color="#3b9eff" sub="Matched orders" pulse sparkline={true} delay={0} />
      <StatCard label="Total Volume" value={analytics.total_volume.toLocaleString()}
        icon={BarChart2} color="#00e5b0" sub="Units traded" sparkline={true} delay={0.05} />
      <StatCard label="Avg Trade Price" value={`₹${analytics.average_price.toLocaleString()}`}
        icon={TrendingUp} color="#ffb347" sub="Weighted mean" sparkline={false} delay={0.1} />
      <StatCard label="Stocks Tracked" value={analytics.stocks_tracked}
        icon={Layers} color="#9d7fff" sub="Active symbols" sparkline={true} delay={0.15} />
    </div>
  );
}

// ─── Order Entry Form ─────────────────────────────────────────────────────────
function OrderForm({ onSubmitSuccess }) {
  const [form, setForm] = useState({ stockSymbol: "RELIANCE", quantity: "", price: "", isBuy: true });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const symbols = ["RELIANCE", "TCS", "INFY", "HDFC", "ICICIBANK"];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.quantity || !form.price) { setStatus({ type: "error", msg: "Quantity and price are required." }); return; }
    setLoading(true);
    setStatus(null);
    const res = await apiFetch("/order", {
      method: "POST",
      body: JSON.stringify({ ...form, quantity: +form.quantity, price: +form.price }),
    });
    setLoading(false);
    if (res === null) {
      setStatus({ type: "success", msg: `${form.isBuy ? "Buy" : "Sell"} order for ${form.quantity} × ${form.stockSymbol} @ ₹${form.price} submitted (demo mode).` });
      onSubmitSuccess?.();
    } else {
      setStatus({ type: "success", msg: "Order submitted successfully." });
      onSubmitSuccess?.();
    }
  }

  const orderValue = form.quantity && form.price ? (+form.quantity * +form.price) : 0;
  const isBuy = form.isBuy;

  return (
    <div className="glass-card fade-in" style={{ borderRadius: 20, overflow: "hidden" }}>
      {/* Buy / Sell toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        {[true, false].map(buy => (
          <button key={String(buy)}
            onClick={() => setForm(f => ({ ...f, isBuy: buy }))}
            style={{
              flex: 1, padding: "16px 0",
              fontSize: 12, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.3s ease",
              background: form.isBuy === buy
                ? buy
                  ? "linear-gradient(135deg, #009970, #00e5b0)"
                  : "linear-gradient(135deg, #b01c36, #ff3d5a)"
                : "transparent",
              color: form.isBuy === buy ? "#fff" : "rgba(255,255,255,0.22)",
              boxShadow: form.isBuy === buy
                ? buy
                  ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 24px rgba(0,229,176,0.22)"
                  : "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 24px rgba(255,61,90,0.22)"
                : "none",
            }}>
            {buy
              ? <><TrendingUp size={14} strokeWidth={2.5} /> BUY</>
              : <><TrendingDown size={14} strokeWidth={2.5} /> SELL</>
            }
          </button>
        ))}
      </div>

      <div style={{ padding: "24px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Symbol */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
              Instrument
            </label>
            <select value={form.stockSymbol}
              onChange={e => setForm(f => ({ ...f, stockSymbol: e.target.value }))}
              className="premium-select"
              style={{ width: "100%", borderRadius: 12, padding: "11px 16px", fontSize: 13 }}>
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Qty + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                Quantity
              </label>
              <input type="number" min="1" value={form.quantity} placeholder="100"
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="premium-input"
                style={{ width: "100%", borderRadius: 12, padding: "11px 16px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                Price (₹)
              </label>
              <input type="number" min="1" value={form.price} placeholder="2500"
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="premium-input"
                style={{ width: "100%", borderRadius: 12, padding: "11px 16px", fontSize: 13 }} />
            </div>
          </div>

          {/* Order Value */}
          {orderValue > 0 && (
            <div style={{
              borderRadius: 12, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em", textTransform: "uppercase" }}>Order Value</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>
                ₹{orderValue.toLocaleString()}
              </span>
            </div>
          )}

          {/* Status */}
          {status && (
            <div style={{
              borderRadius: 12, padding: "13px 16px", fontSize: 12, fontWeight: 500,
              fontFamily: "var(--font-mono)",
              display: "flex", alignItems: "center", gap: 8,
              background: status.type === "success" ? "rgba(0,229,176,0.07)" : "rgba(255,61,90,0.07)",
              border: `1px solid ${status.type === "success" ? "rgba(0,229,176,0.22)" : "rgba(255,61,90,0.22)"}`,
              color: status.type === "success" ? "var(--green)" : "var(--red)",
            }}>
              {status.type === "success"
                ? <Shield size={13} strokeWidth={2} />
                : <Info size={13} strokeWidth={2} />}
              {status.msg}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={isBuy ? "btn-buy" : "btn-sell"}
            style={{
              width: "100%", padding: "14px 0",
              borderRadius: 12, fontWeight: 700, fontSize: 12,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              fontFamily: "var(--font-mono)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {loading
              ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg> Submitting…</>
              : <>{isBuy ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                  Submit {isBuy ? "Buy" : "Sell"} Order</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Order Book ───────────────────────────────────────────────────────────────
function OrderLevelBar({ price, qty, maxQty, side }) {
  const pct = Math.round((qty / maxQty) * 100);
  const isGreen = side === "buy";
  return (
    <div className="order-row"
      style={{ position: "relative", display: "flex", alignItems: "center",
        gap: 12, padding: "7px 16px", cursor: "default", transition: "background 0.15s ease" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {/* Depth fill */}
      <div className={`depth-fill ${isGreen ? "depth-buy" : "depth-sell"}`}
        style={{
          position: "absolute", inset: "0",
          [isGreen ? "right" : "left"]: 0,
          width: `${pct}%`, opacity: 0.9,
          transition: "opacity 0.15s ease",
        }} />
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
        color: isGreen ? "var(--green)" : "var(--red)", flex: 1, position: "relative", zIndex: 1,
      }}>₹{price.toLocaleString()}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11,
        color: "rgba(255,255,255,0.45)", position: "relative", zIndex: 1 }}>
        {qty.toLocaleString()}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, width: 32, textAlign: "right",
        color: "rgba(255,255,255,0.18)", position: "relative", zIndex: 1 }}>
        {pct}%
      </span>
    </div>
  );
}

function OrderBook({ orders }) {
  if (!orders) return <Spinner />;
  const stocks = Object.keys(orders);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {stocks.map((symbol, idx) => {
        const { buy, sell } = orders[symbol];
        const maxBuy  = Math.max(...buy.map(o => o.quantity), 1);
        const maxSell = Math.max(...sell.map(o => o.quantity), 1);
        const spread  = sell[0] && buy[0] ? (sell[0].price - buy[0].price) : null;
        const color   = STOCK_COLORS[symbol] || "#3b9eff";
        return (
          <div key={symbol} className={`glass-card fade-in stagger-${idx + 1}`}
            style={{ borderRadius: 18, overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
              background: "rgba(255,255,255,0.015)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${color}18`, border: `1px solid ${color}28`,
                  fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-mono)",
                }}>{symbol[0]}</div>
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 13,
                  fontFamily: "var(--font-display)" }}>{symbol}</span>
                <Badge variant="info">NSE</Badge>
              </div>
              {spread !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-mono)", marginBottom: 2 }}>Spread</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)",
                    fontFamily: "var(--font-mono)" }}>₹{spread}</div>
                </div>
              )}
            </div>
            {/* Bid/Ask columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ borderRight: "1px solid var(--border)" }}>
                <div style={{
                  padding: "7px 16px", display: "flex", justifyContent: "space-between",
                  borderBottom: "1px solid var(--border2)",
                  background: "rgba(0,229,176,0.04)",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                    BID
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-mono)" }}>
                    QTY · DEPTH
                  </span>
                </div>
                {buy.length === 0
                  ? <p style={{ textAlign: "center", padding: "16px 0", fontSize: 11,
                      color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-mono)" }}>No bid orders</p>
                  : buy.map(o => <OrderLevelBar key={o.id} price={o.price} qty={o.quantity} maxQty={maxBuy} side="buy" />)
                }
              </div>
              <div>
                <div style={{
                  padding: "7px 16px", display: "flex", justifyContent: "space-between",
                  borderBottom: "1px solid var(--border2)",
                  background: "rgba(255,61,90,0.04)",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: "var(--red)", fontFamily: "var(--font-mono)" }}>
                    ASK
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-mono)" }}>
                    QTY · DEPTH
                  </span>
                </div>
                {sell.length === 0
                  ? <p style={{ textAlign: "center", padding: "16px 0", fontSize: 11,
                      color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-mono)" }}>No ask orders</p>
                  : sell.map(o => <OrderLevelBar key={o.id} price={o.price} qty={o.quantity} maxQty={maxSell} side="sell" />)
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trade History ────────────────────────────────────────────────────────────
function TradeHistory({ trades }) {
  const [filter, setFilter] = useState("ALL");
  const symbols  = ["ALL", ...new Set(trades?.map(t => t.stockSymbol) || [])];
  const filtered = filter === "ALL" ? trades : trades?.filter(t => t.stockSymbol === filter);

  if (!trades) return <Spinner />;

  return (
    <div className="glass-card fade-in" style={{ borderRadius: 18, overflow: "hidden" }}>
      {/* Header + filter */}
      <div style={{
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.015)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowLeftRight size={14} color="rgba(255,255,255,0.35)" strokeWidth={2} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>Execution Log</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {symbols.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: "5px 12px", borderRadius: 8,
                fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                fontFamily: "var(--font-mono)", cursor: "pointer",
                transition: "all 0.2s ease",
                background: filter === s ? "var(--blue)" : "rgba(255,255,255,0.04)",
                color: filter === s ? "#fff" : "rgba(255,255,255,0.32)",
                border: filter === s ? "1px solid rgba(59,158,255,0.4)" : "1px solid transparent",
                boxShadow: filter === s ? "0 0 14px rgba(59,158,255,0.22)" : "none",
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border2)" }}>
              {[
                { label: "Buy ID", icon: <ArrowUp size={9} color="var(--green)" /> },
                { label: "Sell ID", icon: <ArrowDown size={9} color="var(--red)" /> },
                { label: "Symbol", icon: <CandlestickChart size={9} color="rgba(255,255,255,0.3)" /> },
                { label: "Qty", icon: <Hash size={9} color="rgba(255,255,255,0.3)" /> },
                { label: "Price", icon: <Target size={9} color="var(--amber)" /> },
                { label: "Time", icon: <Clock size={9} color="rgba(255,255,255,0.3)" /> },
              ].map(({ label, icon }) => (
                <th key={label} style={{
                  padding: "11px 18px", textAlign: "left",
                  fontSize: 9, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {icon}{label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered?.map((t, i) => (
              <tr key={i} className="tbl-row"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.028)" }}>
                <td style={{ padding: "12px 18px", fontSize: 11, color: "var(--green)",
                  fontFamily: "var(--font-mono)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <span style={{ opacity: 0.4 }}>#</span>{t.buyOrderId}
                  </span>
                </td>
                <td style={{ padding: "12px 18px", fontSize: 11, color: "var(--red)",
                  fontFamily: "var(--font-mono)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <span style={{ opacity: 0.4 }}>#</span>{t.sellOrderId}
                  </span>
                </td>
                <td style={{ padding: "12px 18px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: STOCK_COLORS[t.stockSymbol] || "#3b9eff",
                      boxShadow: `0 0 6px ${STOCK_COLORS[t.stockSymbol] || "#3b9eff"}88`,
                      display: "inline-block",
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fff",
                      fontFamily: "var(--font-mono)" }}>{t.stockSymbol}</span>
                  </span>
                </td>
                <td style={{ padding: "12px 18px", fontSize: 11,
                  color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono)" }}>
                  {t.quantity.toLocaleString()}
                </td>
                <td style={{ padding: "12px 18px", fontSize: 12, fontWeight: 700,
                  color: "var(--amber)", fontFamily: "var(--font-mono)" }}>
                  ₹{t.price.toLocaleString()}
                </td>
                <td style={{ padding: "12px 18px", fontSize: 10,
                  color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)" }}>
                  {new Date(t.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
              </tr>
            ))}
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center",
                  fontSize: 12, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-mono)" }}>
                  No trades found for {filter}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Market Analytics ─────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 11,
  color: "#e8edf5",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontFamily: "'JetBrains Mono', monospace",
  padding: "8px 12px",
};

function MarketAnalytics({ analytics }) {
  if (!analytics) return <Spinner />;
  const { price_history, volume_by_stock } = analytics;
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Price History */}
      <div className="glass-card" style={{ borderRadius: 18, padding: "22px 24px" }}>
        <SectionHeader accent="blue">Price History — Intraday</SectionHeader>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={price_history} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <defs>
              {Object.entries(STOCK_COLORS).map(([sym, col]) => (
                <linearGradient key={sym} id={`lg_${sym}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={col} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={col} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.035)" />
            <XAxis dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", paddingTop: 14,
              color: "rgba(255,255,255,0.4)" }} />
            {Object.entries(STOCK_COLORS).map(([sym, col]) => (
              <Line key={sym} type="monotone" dataKey={sym} stroke={col} strokeWidth={2.2}
                dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: col }}
                style={{ filter: `drop-shadow(0 0 5px ${col}88)` }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Volume Bar */}
        <div className="glass-card" style={{ borderRadius: 18, padding: "22px 24px" }}>
          <SectionHeader accent="green">Volume by Stock</SectionHeader>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volume_by_stock} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b9eff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b9eff" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.035)" vertical={false} />
              <XAxis dataKey="stock"
                tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
              <Bar dataKey="volume" fill="url(#barGrad)" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area chart */}
        <div className="glass-card" style={{ borderRadius: 18, padding: "22px 24px" }}>
          <SectionHeader accent="purple">Cumulative — RELIANCE</SectionHeader>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={price_history} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5b0" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#00e5b0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.035)" />
              <XAxis dataKey="time"
                tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="RELIANCE" stroke="#00e5b0" fill="url(#areaGrad)"
                strokeWidth={2.2} dot={false}
                style={{ filter: "drop-shadow(0 0 6px rgba(0,229,176,0.5))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Share bars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {analytics.volume_by_stock.map(({ stock, volume }) => {
          const total = analytics.total_volume;
          const pct   = Math.round((volume / total) * 100);
          const color = STOCK_COLORS[stock] || "#3b9eff";
          return (
            <div key={stock} className="glass-card"
              style={{ borderRadius: 16, padding: "18px 20px", transition: "border-color 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: color,
                    boxShadow: `0 0 8px ${color}88`, display: "inline-block",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff",
                    fontFamily: "var(--font-display)" }}>{stock}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}66, ${color})`,
                  boxShadow: `0 0 10px ${color}55`,
                  transition: "width 1s ease",
                }} />
              </div>
              <p style={{ fontSize: 10, marginTop: 8, color: "rgba(255,255,255,0.22)",
                fontFamily: "var(--font-mono)" }}>{volume} units</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "Hello! I'm your AI Stock Exchange assistant powered by RAG + Gemini. Ask me anything about orders, the matching engine, price-time priority, or market mechanics.",
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const SUGGESTIONS = [
    "How does the matching engine work?",
    "Explain price-time priority",
    "What is an order book?",
    "How are trades executed?",
  ];

  async function sendMessage(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    setLoading(true);
    const res = await apiFetch("/ask", { method: "POST", body: JSON.stringify({ question: q }) });
    let answer;
    if (res?.answer) {
      answer = res.answer;
    } else {
      answer = await fetchAIAnswer(q);
    }
    setMessages(m => [...m, { role: "assistant", text: answer, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    setLoading(false);
  }

  async function fetchAIAnswer(q) {
  try {
    const res = await fetch(
      `${BASE}/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: q,
        }),
      }
    );

    const data = await res.json();

    return (
      data.answer ||
      "No answer received."
    );
  } catch (error) {
    console.error(error);

    return "Failed to reach AI backend.";
  }
}

  return (
    <div className="glass-card fade-in" style={{ borderRadius: 20, display: "flex", flexDirection: "column", height: 580 }}>
      {/* AI Header */}
      <div style={{
        padding: "16px 22px", display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(90deg, rgba(109,40,217,0.06), rgba(59,158,255,0.04))",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: "linear-gradient(135deg, #5b21b6, #2563eb)",
          boxShadow: "0 0 24px rgba(109,40,217,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={18} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>
            AI Market Assistant
          </p>
          <p style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            RAG · Gemini 2.5 Flash · FAISS
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scroll-thin"
        style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} style={{
              display: "flex", gap: 12,
              flexDirection: isUser ? "row-reverse" : "row",
            }}>
              {/* Avatar */}
              <div style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 12,
                background: isUser
                  ? "linear-gradient(135deg, #1e40af, #3b82f6)"
                  : "linear-gradient(135deg, #5b21b6, #2563eb)",
                boxShadow: isUser
                  ? "0 4px 14px rgba(59,130,246,0.3)"
                  : "0 4px 14px rgba(109,40,217,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isUser
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>U</span>
                  : <Cpu size={14} color="#fff" strokeWidth={2} />
                }
              </div>
              {/* Bubble */}
              <div className={isUser ? "bubble-user" : "bubble-ai"}
                style={{
                  maxWidth: "78%", borderRadius: 18,
                  borderTopRightRadius: isUser ? 4 : 18,
                  borderTopLeftRadius: isUser ? 18 : 4,
                  padding: "12px 16px",
                  fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.88)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                {msg.text}
                <div style={{ fontSize: 9, marginTop: 6,
                  color: isUser ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.2)",
                  fontFamily: "var(--font-mono)" }}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 12,
              background: "linear-gradient(135deg, #5b21b6, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Cpu size={14} color="#fff" strokeWidth={2} />
            </div>
            <div className="bubble-ai" style={{ borderRadius: 18, borderTopLeftRadius: 4, padding: "14px 18px" }}>
              <div className="dot-typing" style={{ display: "flex", gap: 4 }}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 20px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              style={{
                fontSize: 11, padding: "7px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-mono)", cursor: "pointer",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(157,127,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(157,127,255,0.22)";
                e.currentTarget.style.color = "var(--purple)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask about orders, matching engine, analytics…"
            className="premium-input"
            style={{ flex: 1, borderRadius: 14, padding: "12px 16px", fontSize: 13 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              background: loading || !input.trim()
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, #1d4ed8, #3b9eff)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: loading || !input.trim() ? "none" : "0 4px 18px rgba(59,158,255,0.3)",
              color: loading || !input.trim() ? "rgba(255,255,255,0.2)" : "#fff",
            }}>
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { id: "orders",    label: "Order Book",   icon: BookOpen },
  { id: "place",     label: "Place Order",  icon: PlusCircle },
  { id: "trades",    label: "Trade History",icon: ArrowLeftRight },
  { id: "analytics", label: "Analytics",    icon: BarChart2 },
  { id: "ai",        label: "AI Assistant", icon: Bot },
];

function Sidebar({ active, onSelect, collapsed, onToggle }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      display: "flex", flexDirection: "column", height: "100%", flexShrink: 0,
      background: "linear-gradient(180deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.01) 100%)",
      borderRight: "1px solid var(--border)",
      backdropFilter: "blur(24px)",
      transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Brand */}
      <div style={{
        padding: "14px 14px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          boxShadow: "0 0 20px rgba(59,99,235,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CandlestickChart size={16} color="#fff" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em",
              fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              StockSim AI
            </p>
            <p style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
              Exchange
            </p>
          </div>
        )}
        <button onClick={onToggle}
          style={{
            marginLeft: "auto", flexShrink: 0,
            width: 24, height: 24, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", color: "rgba(255,255,255,0.25)",
            transition: "color 0.15s ease, background 0.15s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
          {collapsed
            ? <ChevronRight size={13} strokeWidth={2.5} />
            : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onSelect(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 12,
                background: isActive ? "rgba(59,158,255,0.09)" : "transparent",
                color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)",
                border: isActive ? "1px solid rgba(59,158,255,0.16)" : "1px solid transparent",
                cursor: "pointer", position: "relative",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; } }}>
              {isActive && <span className="nav-active-bar" />}
              <Icon size={15} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                  fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        {!collapsed ? (
          <div style={{
            borderRadius: 12, padding: "11px 14px",
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)",
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
              Backend Status
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WifiOff size={11} color="var(--amber)" strokeWidth={2} />
              <span style={{ fontSize: 10, color: "var(--amber)", fontFamily: "var(--font-mono)" }}>Demo mode</span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WifiOff size={13} color="var(--amber)" strokeWidth={2} />
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Live Market Ticker Strip ─────────────────────────────────────────────────
function TickerStrip() {
  const doubled = [...FULL_TICKER, ...FULL_TICKER];
  return (
    <div style={{
      height: 32, overflow: "hidden", display: "flex", alignItems: "center",
      borderBottom: "1px solid var(--border)",
      background: "rgba(0,0,0,0.45)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        paddingLeft: 12, paddingRight: 0,
        borderRight: "1px solid var(--border)",
        flexShrink: 0, height: "100%",
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          fontFamily: "var(--font-mono)", paddingRight: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span className="live-dot" />
          LIVE
        </span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div className="ticker-track" style={{ display: "flex", gap: 0 }}>
          {doubled.map(({ sym, price, chg, pos }, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0 24px",
              borderRight: "1px solid rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 600,
                color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>{sym}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff",
                fontFamily: "var(--font-mono)" }}>₹{price}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 5,
                fontFamily: "var(--font-mono)",
                color: pos ? "var(--green)" : "var(--red)",
                background: pos ? "rgba(0,229,176,0.08)" : "rgba(255,61,90,0.08)",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                {pos ? <TrendingUp size={9} strokeWidth={2.5} /> : <TrendingDown size={9} strokeWidth={2.5} />}
                {chg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders]       = useState(null);
  const [trades, setTrades]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    const [o, t, a] = await Promise.all([
      apiFetch("/orders"),
      apiFetch("/trades"),
      apiFetch("/analytics"),
    ]);
    setOrders(o || MOCK_ORDERS);
    setTrades(t || MOCK_TRADES);
    setAnalytics(a || MOCK_ANALYTICS);
  }, []);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  function renderPage() {
    const pageTitle = NAV_ITEMS.find(n => n.id === page);

    switch (page) {
      case "dashboard":
        return (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>
                Market Overview
              </h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>
                Live simulation — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <StatCard label="Total Trades" value={analytics?.total_trades ?? "—"}
                icon={Zap} color="#3b9eff" sub="Matched orders" pulse sparkline={true} delay={0} />
              <StatCard label="Total Volume" value={analytics ? analytics.total_volume.toLocaleString() : "—"}
                icon={BarChart2} color="#00e5b0" sub="Units traded" sparkline={true} delay={0.05} />
              <StatCard label="Avg Trade Price" value={analytics ? `₹${analytics.average_price.toLocaleString()}` : "—"}
                icon={TrendingUp} color="#ffb347" sub="Weighted mean" sparkline={false} delay={0.1} />
              <StatCard label="Stocks Tracked" value={analytics?.stocks_tracked ?? "—"}
                icon={Layers} color="#9d7fff" sub="Active symbols" sparkline={true} delay={0.15} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <div>
                <SectionHeader action={
                  <button onClick={() => setPage("orders")}
                    style={{
                      fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--blue)", fontFamily: "var(--font-mono)",
                      background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#7bc0ff"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--blue)"}>
                    View all →
                  </button>
                }>Order Book Snapshot</SectionHeader>
                <OrderBook orders={orders} />
              </div>
              <div>
                <SectionHeader action={
                  <button onClick={() => setPage("trades")}
                    style={{
                      fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--blue)", fontFamily: "var(--font-mono)",
                      background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#7bc0ff"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--blue)"}>
                    View all →
                  </button>
                }>Recent Trades</SectionHeader>
                <div className="glass-card" style={{ borderRadius: 18, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                        {["Symbol", "Qty", "Price", "Time"].map(h => (
                          <th key={h} style={{ padding: "10px 18px", textAlign: "left",
                            fontSize: 9, fontWeight: 600, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(trades || []).slice(-4).reverse().map((t, i) => (
                        <tr key={i} className="tbl-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.028)" }}>
                          <td style={{ padding: "11px 18px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                width: 5, height: 5, borderRadius: "50%", display: "inline-block",
                                background: STOCK_COLORS[t.stockSymbol] || "#3b9eff",
                                boxShadow: `0 0 6px ${STOCK_COLORS[t.stockSymbol] || "#3b9eff"}`,
                              }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff",
                                fontFamily: "var(--font-mono)" }}>{t.stockSymbol}</span>
                            </span>
                          </td>
                          <td style={{ padding: "11px 18px", fontSize: 11,
                            color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)" }}>
                            {t.quantity}
                          </td>
                          <td style={{ padding: "11px 18px", fontSize: 12, fontWeight: 700,
                            color: "var(--amber)", fontFamily: "var(--font-mono)" }}>
                            ₹{t.price.toLocaleString()}
                          </td>
                          <td style={{ padding: "11px 18px", fontSize: 10,
                            color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>
                            {new Date(t.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>Order Book</h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>Live bid & ask orders per instrument</p>
            </div>
            <OrderBook orders={orders} />
          </div>
        );

      case "place":
        return (
          <div className="fade-in" style={{ maxWidth: 480 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>Place Order</h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>Submit a new buy or sell order to the exchange</p>
            </div>
            <OrderForm onSubmitSuccess={() => setRefreshKey(k => k + 1)} />
          </div>
        );

      case "trades":
        return (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>Trade History</h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>All executed matches from the matching engine</p>
            </div>
            <TradeHistory trades={trades} />
          </div>
        );

      case "analytics":
        return (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>Market Analytics</h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>Intraday charts, volume breakdown & stock metrics</p>
            </div>
            <MarketAnalytics analytics={analytics} />
          </div>
        );

      case "ai":
        return (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                fontFamily: "var(--font-display)", marginBottom: 4 }}>AI Assistant</h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em" }}>Ask questions powered by RAG · FAISS · Gemini 2.5 Flash</p>
            </div>
            <AIAssistant />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <GlobalStyles />
      <div style={{
        display: "flex", height: "100vh",
        background: "var(--bg)", fontFamily: "var(--font-mono)",
        color: "var(--text)", overflow: "hidden",
      }}>
        <Sidebar active={page} onSelect={setPage} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Live Ticker Strip */}
          <TickerStrip />

          {/* Top Bar */}
          <header style={{
            flexShrink: 0,
            height: 50,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(24px)",
          }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11,
              color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "rgba(255,255,255,0.14)" }}>NSE Sim</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                {NAV_ITEMS.find(n => n.id === page)?.label}
              </span>
            </div>

            {/* Right: refresh */}
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", borderRadius: 9,
                fontSize: 11, cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                transition: "all 0.18s ease",
                fontFamily: "var(--font-mono)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
              <RefreshCw size={12} strokeWidth={2.5} />
              Refresh
            </button>
          </header>

          {/* Main content */}
          <main className="scroll-thin"
            style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "var(--bg)" }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
