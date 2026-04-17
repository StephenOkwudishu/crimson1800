import { Users, TrendingUp, CheckCircle2, Shield, Activity, ChevronRight, Info, Globe, ShieldAlert, ArrowUpRight, AlertTriangle, User, MapPin, BarChart3, History, Map as MapIcon, Clock, CheckCircle, Sliders, Play, Settings, X, Search, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as d3 from "d3";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  PieChart, Pie, ScatterChart, Scatter, ZAxis, AreaChart, Area,
  ReferenceLine, Legend
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIMELINE_DATES, SECURITIES_DATA, ELECTION_EVENTS, STATE_MONITOR_MAPPING, SECURITIES_TICKERS } from "./constants";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { fetchIReVData, fetchDataphyteData, fetchStearsData, fetchIncidentReports, fetchSecuritiesData } from "./services/apiService";
import { generateHealthMetrics, generateLogisticsData, generateIReVStream, STATES } from "./services/mockDataService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Custom Hooks ---

function usePolling(intervalMs: number = 60000) {
  const [lastSync, setLastSync] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setLastSync(new Date());
        setIsSyncing(false);
      }, 2000); // UI feedback duration
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { lastSync, isSyncing };
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };

  return [storedValue, setValue] as const;
}

function SecuritiesGraph() {
  const [data, setData] = useState(SECURITIES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTickers, setActiveTickers] = useState<string[]>(['ASI', 'EUROBOND', 'NGE']);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // In a real app, we'd loop through tickers and merge data. 
      // For the demo, we fetch one and merge with mock if failed.
      const tickerData = await fetchSecuritiesData(SECURITIES_TICKERS.ASI);
      // Simulate merging live data into the history
      if (tickerData && !tickerData.mock) {
         // Process Alpha Vantage format... 
         // For now, if we get real data, we shift/push mock data to show "live" updates
      }
      setData(prev => [...prev]); // Trigger re-render with whatever we have
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="hud-card p-10">
      <div className="p-0 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center bg-white/2 mb-10 gap-4">
        <div className="terminal-header border-none mb-0 flex items-center gap-3">
          <span className="text-micro !text-primary !tracking-[0.4em] font-bold uppercase">MARKET_CATALYST_OVERLAY</span>
          {isLoading && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
        </div>
        <div className="flex gap-2 p-2">
          {Object.entries(SECURITIES_TICKERS).map(([key, ticker]) => (
            <button 
              key={key}
              onClick={() => setActiveTickers(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])}
              className={cn(
                "px-3 py-1 border text-[9px] font-bold tracking-widest transition-all",
                activeTickers.includes(key) ? "border-primary text-primary bg-primary/10" : "border-white/5 text-on-surface-variant hover:border-white/20"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#00f0ff" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#ffd19d" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B1326', border: '1px solid #00f0ff' }}
              labelStyle={{ color: '#00f0ff', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
              labelFormatter={(label) => {
                const event = ELECTION_EVENTS.find(e => e.date === label);
                return event ? `${label} — ${event.description}` : label;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontStyle: 'mono' }} />
            
            {ELECTION_EVENTS.map(event => (
              <ReferenceLine 
                key={event.date} 
                x={event.date} 
                stroke="#ffd19d" 
                strokeDasharray="3 3" 
                label={{ value: event.description, position: 'top', fill: '#ffd19d', fontSize: 10, fontWeight: 'bold' }}
              />
            ))}

            {activeTickers.includes('ASI') && <Line yAxisId="left" type="monotone" dataKey="NGSE:ASI" stroke="#00f0ff" strokeWidth={3} dot={false} name="NGX ASI" />}
            {activeTickers.includes('BANKING') && <Line yAxisId="left" type="monotone" dataKey="NGSE:BANKING" stroke="#26D967" strokeWidth={2} dot={false} name="NGX BANKING" />}
            {activeTickers.includes('NGE') && <Line yAxisId="left" type="monotone" dataKey="NGE" stroke="#6726D9" strokeWidth={2} dot={false} name="MSCI NGERIA ETF" />}
            {activeTickers.includes('EUROBOND') && <Line yAxisId="right" type="monotone" dataKey="Yield" stroke="#ffd19d" strokeWidth={2} dot={false} name="2027 EUROBOND YIELD (%)" />}
            {activeTickers.includes('AFK') && <Line yAxisId="left" type="monotone" dataKey="AFK" stroke="#D96726" strokeWidth={2} dot={false} name="VANECK AFRICA ETF" />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Shared Internal Components ---

function LiveTicker() {
  const alerts = [
    "BVAS deployment delayed in Rivers State due to logistical constraints.",
    "Youth turnout projection increases by 4% in Lagos metropolitan area.",
    "Security cordon optimized around INEC headquarters in Abuja.",
    "Official turnout index tracking at 62.4% in North-Central corridor.",
    "Independent observers validate PVT upload protocols for 8,000 units.",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 h-10 flex items-center overflow-hidden mb-8">
      <div className="bg-primary text-black text-[9px] font-bold px-4 h-full flex items-center tracking-widest uppercase z-10 shrink-0">
        LIVE_ALERT
      </div>
      <div className="flex-1 whitespace-nowrap py-1">
        <motion.p
          key={index}
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          className="text-[11px] font-mono text-primary font-bold inline-block"
        >
          {alerts[index]} --- STATUS: {index % 2 === 0 ? 'CRITICAL' : 'MONITORING'} --- SIGNAL_LATENCY: {14 + index}MS --- {alerts[(index + 1) % alerts.length]}
        </motion.p>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, sub, trend, icon: Icon, colorClass = "text-primary" }: {
  label: string,
  value: string,
  sub: string,
  trend?: { val: string, up: boolean },
  icon: any,
  colorClass?: string
}) {
  return (
    <div className="glass-card p-6 rounded-2xl premium-shadow hover:bg-white/[0.05] transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">{label}</span>
        {trend && (
           <span className={cn("text-[10px] font-bold", trend.up ? "text-primary" : "text-delayed")}>
             {trend.up ? '+' : '-'}{trend.val}
           </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1 tabular-nums">{value}</h3>
      <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: parseInt(value) > 0 ? `${value}%` : '40%' }}
          className={cn("h-full", colorClass === "text-primary" ? "bg-primary" : colorClass === "text-reporting" ? "bg-reporting" : colorClass === "text-delayed" ? "bg-delayed" : "bg-primary")} 
        />
      </div>
      <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mt-4 opacity-60 font-medium">{sub}</p>
    </div>
  );
}

function CountdownTimer() {
  const targetDate = new Date("2027-02-20T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(targetDate - Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="hud-card p-8 flex flex-col md:flex-row items-center gap-12 bg-black/40 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
        <span className="text-micro !text-primary !tracking-[0.4em] mb-2 font-bold">COMMAND_LOCK: PRESIDENTIAL_ELECTION</span>
        <h2 className="text-xl text-huge !tracking-[0.05em] text-on-surface/90">SATURDAY, FEBRUARY 20, 2027</h2>
        <div className="flex items-center gap-2 text-micro !text-[9px] mt-2">
           <div className="w-1.5 h-1.5 rounded-full bg-reporting animate-pulse" />
           REAL_TIME_ORBITAL_SYNC
        </div>
      </div>
      <div className="flex gap-6 md:gap-12 relative z-10 tabular-nums">
        {[
          { label: 'DAYS', value: days },
          { label: 'HOURS', value: hours },
          { label: 'MINUTES', value: minutes },
          { label: 'SECONDS', value: seconds },
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl text-huge text-on-surface glow-accent leading-none">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-micro !text-primary !tracking-[0.3em] mt-3 font-bold">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ item }: { item: any, key?: any }) {
  const today = new Date("2026-04-16");
  const eventDate = new Date(item.date);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'PENDING' | 'APPROACHING' | 'LIVE' | 'COMPLETED' = 'PENDING';
  
  if (diffDays < 0) {
    status = 'COMPLETED';
  } else if (diffDays === 0) {
    status = 'LIVE';
  } else if (diffDays <= 14) {
    status = 'APPROACHING';
  }

  const statusStyles = {
    COMPLETED: "text-reporting border-reporting/30 bg-reporting/5 line-through opacity-40",
    LIVE: "text-primary border-primary/30 bg-primary/5 animate-pulse glow-accent",
    APPROACHING: "text-delayed border-delayed/30 bg-delayed/5",
    PENDING: "text-on-surface-variant border-outline-variant bg-white/5 opacity-30"
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-5 border-b border-outline-variant last:border-0 transition-all group hover:bg-white/5",
      status === 'COMPLETED' && "grayscale opacity-60"
    )}>
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === 'COMPLETED' ? "bg-reporting" : 
          status === 'LIVE' ? "bg-primary shadow-[0_0_8px_var(--color-primary)]" :
          status === 'APPROACHING' ? "bg-delayed" : "bg-on-surface-variant"
        )} />
        <div className="flex flex-col">
          <span className={cn("text-[10px] font-mono font-bold tabular-nums tracking-widest", 
            status === 'COMPLETED' ? "text-on-surface-variant" : "text-primary"
          )}>
            {item.date}
          </span>
          <span className={cn("text-sm font-sans font-bold tracking-tight", 
            status === 'COMPLETED' ? "text-on-surface-variant" : "text-on-surface"
          )}>
            {item.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={cn("px-2 py-0.5 border text-micro !text-[8px] !tracking-[0.2em] font-bold", statusStyles[status])}>
          {status}
        </span>
        <ChevronRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function SystemTimeline() {
  const steps = [
    { label: 'PUBLICATION', date: '2026-01-16', status: 'Done', done: true },
    { label: 'PRIMARIES', date: '2026-04-23', status: 'Done', done: true },
    { label: 'CAMPAIGNS', date: '2026-11-18', status: 'Active', active: true, done: true },
    { label: 'ELECTION', date: '2027-01-16', status: 'T-275 Days', done: false },
    { label: 'GOV_POLLS', date: '2027-03-06', status: 'T-324 Days', done: false }
  ];

  return (
    <section className="mb-12">
      <div className="glass-card p-10 rounded-2xl premium-shadow overflow-hidden relative">
        <div className="flex items-center gap-3 mb-10">
          <span className="material-symbols-outlined text-white/40">event_upcoming</span>
          <h2 className="text-sm font-bold tracking-[0.05em] text-white uppercase">INEC Schedule Terminal</h2>
        </div>
        <div className="relative px-4">
          <div className="absolute top-1.5 left-0 right-0 h-[2px] bg-white/5"></div>
          <div className="absolute top-1.5 left-0 h-[2px] bg-primary" style={{ width: '50%' }}></div>
          <div className="flex justify-between relative">
            {steps.map((step, idx) => (
              <div key={idx} className={cn("flex flex-col items-center gap-4", !step.done && !step.active && "opacity-30")}>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  step.active ? "bg-white ring-4 ring-white/10 animate-pulse" : (step.done ? "bg-primary ring-4 ring-primary/10" : "bg-white/20")
                )} />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-white mb-1">{step.label}</p>
                  <p className="text-[8px] font-mono text-on-surface-variant mb-1">{step.date}</p>
                  <span className={cn("text-[9px] uppercase", step.active ? "text-primary font-bold" : "text-on-surface-variant")}>
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Page 1: Dashboard ---

// --- Live Intel Feed Connection Simulation ---
function LiveIntelFeed() {
  const [updates, setUpdates] = useState([
    { id: 1, time: '14:28:10', type: 'SIGNAL: KANO', text: 'Massive surge in youth registrations detected in Central Kano. Sentiment shifting toward LP candidate.' },
    { id: 2, time: '14:27:04', type: 'MARKET: PDP ODDS', text: 'PDP win probability in South-South markets dropped 2% following intra-party dispute.' },
  ]);

  useEffect(() => {
    const texts = [
      "Voter registration in Lagos exceeding bandwidth capacity.",
      "Oyo State ballot allocation validated - 4.2M units.",
      "Rivers State security coord requested additional SIGINT nodes.",
      "Anambra election logistics synced with FEC-Net.",
      "New coalition intent detected in Kaduna Central.",
    ];
    const types = ["INEC: LOGISTICS", "SEC: ALERT", "POLL: SWIFT", "MARKET: VOLATILITY"];
    
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newUpdate = {
        id: Date.now(),
        time: timeStr,
        type: types[Math.floor(Math.random() * types.length)],
        text: texts[Math.floor(Math.random() * texts.length)]
      };
      setUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="xl:col-span-5 glass-card rounded-2xl premium-shadow flex flex-col">
      <div className="p-8 border-b border-border-subtle flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Intelligence Terminal</h3>
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
      </div>
      <div className="p-6 flex-1 overflow-y-auto max-h-[360px] space-y-4">
        {updates.map((update, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={update.id} 
            className="group cursor-default"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{update.type}</span>
              <span className="text-[9px] text-on-surface-variant">{update.time}</span>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant group-hover:text-white transition-colors">{update.text}</p>
          </motion.div>
        ))}
      </div>
      <div className="p-6 pt-0">
        <div className="relative">
          <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-white/20" placeholder="Ask intelligence bot..." type="text"/>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
        </div>
      </div>
    </div>
  );
}

function GeopoliticalStrength() {
  return (
    <div className="xl:col-span-7 glass-card p-8 rounded-2xl premium-shadow">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-lg font-bold text-white tracking-tight">Geopolitical Cluster Strength</h3>
        <div className="flex bg-white/5 p-1 rounded-full gap-1">
          <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">North</button>
          <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">South</button>
        </div>
      </div>
      <div className="space-y-10">
        {[
          { label: 'South West', confidence: '58%', apc: 48, pdp: 25, lp: 20, voters: '4.2M' },
          { label: 'South East', confidence: '92%', apc: 12, pdp: 18, lp: 68, voters: '3.8M' },
          { label: 'South South', confidence: '74%', apc: 30, pdp: 45, lp: 22, voters: '4.5M' },
        ].map((region) => (
          <div key={region.label}>
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-medium text-white tracking-wide">{region.label}</span>
              <span className={cn("text-[10px] font-bold uppercase", parseInt(region.confidence) > 80 ? "text-secondary" : "text-primary")}>
                {region.confidence} Confidence
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${region.apc}%` }}></div>
              <div className="h-full bg-secondary" style={{ width: `${region.pdp}%` }}></div>
              <div className="h-full bg-accent" style={{ width: `${region.lp}%` }}></div>
              <div className="h-full bg-white/10 flex-1"></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                {region.apc > region.lp && region.apc > region.pdp ? 'APC Lead Cluster' : region.lp > region.pdp ? 'LP Stronghold' : 'PDP Mainline'}
              </span>
              <span className="text-[9px] text-on-surface-variant uppercase">{region.voters} Reg. Voters</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketSentiment() {
  return (
    <div className="lg:col-span-4 glass-card p-6 rounded-2xl premium-shadow">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold tracking-tight text-white">Market Sentiment</h3>
        <span className="material-symbols-outlined text-on-surface-variant text-sm">info</span>
      </div>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Liquidity Depth</span>
            <span className="text-[10px] font-bold text-primary uppercase">High</span>
          </div>
          <div className="flex items-end gap-[2px] h-10">
            {[30, 45, 60, 80, 70, 100].map((h, i) => (
              <div key={i} className={cn("flex-1 rounded-sm", i > 2 ? "bg-primary" : "bg-white/10")} style={{ height: `${h}%`, opacity: 0.4 + (i * 0.1) }}></div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Volatility Index</span>
            <span className="text-[10px] font-bold text-secondary uppercase">Moderate</span>
          </div>
          <div className="flex items-end gap-[2px] h-10">
            {[20, 30, 50, 40, 60, 45].map((h, i) => (
              <div key={i} className={cn("flex-1 rounded-sm", i > 1 ? "bg-secondary" : "bg-white/10")} style={{ height: `${h}%`, opacity: 0.4 + (i * 0.1) }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { isSyncing, lastSync } = usePolling(60000);
  const [healthMetrics, setHealthMetrics] = useState(generateHealthMetrics());
  const [activeWidgets, setActiveWidgets] = useLocalStorage<string[]>('dashboard_active_widgets', [
    'METRICS', 'TIMER', 'INTEL', 'TIMELINE', 'SECOPS', 'HEALTH'
  ]);
  const [irevData, setIrevData] = useState<any>(null);

  useEffect(() => {
    async function updateDashboard() {
      const data = await fetchIReVData();
      setIrevData(data);
      setHealthMetrics(generateHealthMetrics());
    }
    updateDashboard();
  }, [lastSync]);

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const widgetConfig = [
    { id: 'HEALTH', label: 'ELECTION_HEALTH' },
    { id: 'TIMER', label: 'COUNTDOWN' },
    { id: 'INTEL', label: 'INTEL_FEED' },
    { id: 'TIMELINE', label: 'SCHEDULE' },
    { id: 'SECOPS', label: 'MACRO_RADAR' },
  ];

  return (
    <div className="space-y-8 pb-16">
      <LiveTicker />

      {/* Hero Header */}
      <div className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5", isSyncing && "border-primary/40")}>
              <span className={cn("w-1.5 h-1.5 rounded-full bg-primary", isSyncing && "animate-pulse shadow-[0_0_8px_var(--color-primary)]")}></span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                {isSyncing ? "Establishing_Satellite_Sync..." : `Terminal_Online // Last_Update: ${lastSync.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
          <h1 className="font-headline text-5xl lg:text-8xl font-bold tracking-tighter text-white uppercase glow-accent leading-[0.85]">
            HEALTH <br /> <span className="text-primary italic">PROGRESS</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-start xl:items-end gap-6 text-left xl:text-right">
          <div className="flex flex-wrap gap-2 max-w-md xl:justify-end">
            {widgetConfig.map(w => (
              <button 
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={cn(
                  "px-3 py-1.5 border text-[9px] font-bold tracking-widest transition-all rounded-md",
                  activeWidgets.includes(w.id) 
                    ? "border-primary text-primary bg-primary/10" 
                    : "border-white/5 text-on-surface-variant hover:border-white/20"
                )}
              >
                {activeWidgets.includes(w.id) ? '●' : '○'} {w.label}
              </button>
            ))}
          </div>
          <div className="flex gap-12">
            <div>
              <span className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold uppercase mb-1 block">Registered Base</span>
              <p className="text-3xl font-bold text-white tabular-nums tracking-tight">93.5M</p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold uppercase mb-1 block">Live_Accredited</span>
              <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                {irevData ? (irevData.accreditedVoters / 1000000).toFixed(2) + 'M' : '3.44M'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {activeWidgets.includes('TIMER') && (
          <motion.div layout key="widget-timer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-12">
            <CountdownTimer />
          </motion.div>
        )}

        {activeWidgets.includes('HEALTH') && (
          <motion.div layout key="widget-health" className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="hud-card p-6 bg-primary/5 border-primary/20">
                <span className="text-micro !text-primary block mb-2 font-bold tracking-[0.2em]">REGISTERED_VOTERS</span>
                <div className="text-3xl font-headline font-bold">{(healthMetrics.registeredVoters / 1000000).toFixed(2)}M</div>
                <div className="text-[10px] font-mono text-on-surface-variant mt-2 border-t border-white/5 pt-2">+4.2% YoY GROWTH</div>
             </div>
             <div className="hud-card p-6">
                <span className="text-micro !text-delayed block mb-2 font-bold tracking-[0.2em]">PVC_COLLECTION</span>
                <div className="text-3xl font-headline font-bold">{healthMetrics.pvcsCollected.toFixed(1)}%</div>
                <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                   <div className="h-full bg-delayed" style={{ width: `${healthMetrics.pvcsCollected}%` }} />
                </div>
             </div>
             <div className="hud-card p-6">
                <span className="text-micro !text-reporting block mb-2 font-bold tracking-[0.2em]">IReV_UPLOAD_RATE</span>
                <div className="text-3xl font-headline font-bold">{healthMetrics.irevSuccessRate.toFixed(1)}%</div>
                <div className="text-[10px] font-mono text-on-surface-variant mt-2">12,402 / 176,846 PUs</div>
             </div>
             <div className="hud-card p-6 border-l-4 border-l-anomaly">
                <span className="text-micro !text-anomaly block mb-2 font-bold tracking-[0.2em]">SECURITY_INCIDENTS</span>
                <div className="text-3xl font-headline font-bold text-anomaly">{healthMetrics.securityIncidents}</div>
                <div className="text-[10px] font-mono text-on-surface-variant mt-2">ACLED SIMULATION: ACTIVE</div>
             </div>
          </motion.div>
        )}
        
        {activeWidgets.includes('SECOPS') && (
          <motion.div layout key="widget-secops" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4 space-y-4">
             <div className="hud-card p-6">
                <h3 className="text-xs font-bold text-on-surface-variant mb-6 uppercase tracking-widest">Macro_Radar</h3>
                <div className="space-y-4">
                  {[
                    { label: 'GDP Growth', val: '4.2%' },
                    { label: 'Unemployment', val: '4.9%' },
                    { label: 'Foreign Reserves', val: '$45.5B' }
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase">{m.label}</span>
                      <span className="text-xs font-bold text-primary">{m.val}</span>
                    </div>
                  ))}
                </div>
             </div>
             <MarketSentiment />
          </motion.div>
        )}

        {activeWidgets.includes('TIMELINE') && (
          <motion.div layout key="widget-timeline" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-12">
            <SystemTimeline />
          </motion.div>
        )}

        {activeWidgets.includes('POLLS') && (
          <motion.div layout key="widget-polls" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="hud-card p-8 lg:col-span-2">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Voter Registration Leaderboard</h3>
                    <span className="text-micro text-primary">TOP_PERFORMING_STATES</span>
                </div>
                <div className="space-y-6">
                    {[
                      { state: 'Jigawa', count: '201,047', pct: 100 },
                      { state: 'Lagos', count: '181,095', pct: 90 },
                      { state: 'Kano', count: '177,681', pct: 88 },
                    ].map(s => (
                      <div key={s.state} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface font-bold uppercase tracking-wider">{s.state}</span>
                          <span className="text-primary font-mono">{s.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} className="h-full bg-primary" />
                        </div>
                      </div>
                    ))}
                </div>
             </div>
             <div className="hud-card p-8 bg-secondary/5">
                <h3 className="text-micro text-on-surface-variant mb-6 uppercase tracking-[0.3em]">Gender_Distribution</h3>
                <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                              data={[{v:55.86, fill:'#6726D9'}, {v:44.14, fill:'#26D967'}]} 
                              dataKey="v" innerRadius={35} outerRadius={45} stroke="none"
                              startAngle={90} endAngle={450}
                            >
                            <Cell fill="#6726D9" />
                            <Cell fill="#26D967" />
                            </Pie>
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Women: 55.86%</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Men: 44.14%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <h3 className="text-micro text-on-surface-variant mb-4 uppercase tracking-[0.3em]">Occupational_Breakdown</h3>
                    <div className="space-y-2">
                        {[
                          { label: 'Students', val: '35.92%' },
                          { label: 'Business', val: '20.40%' },
                          { label: 'Farming/Fishing', val: '18.28%' }
                        ].map(o => (
                          <div key={o.label} className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-on-surface-variant uppercase">{o.label}</span>
                            <span className="text-white font-bold">{o.val}</span>
                          </div>
                        ))}
                    </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeWidgets.includes('INTEL') && (
          <motion.div layout key="widget-intel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-12">
            <LiveIntelFeed />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Page 2: Presidential Forecast ---

const INITIAL_PROBABILITY_DATA = [
  { name: 'Bola Tinubu (APC)', value: 42, color: '#00f0ff' },
  { name: 'ADC Candidate', value: 38, color: '#ffd19d' },
  { name: 'Omoyele Sowore', value: 8, color: '#ffb4ab' },
  { name: 'Others', value: 12, color: '#bbcbb8' },
];

export function PresidentialForecast() {
  const [data, setData] = useState(INITIAL_PROBABILITY_DATA);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [youthTurnout, setYouthTurnout] = useState(55);
  const [northWestSwing, setNorthWestSwing] = useState(0);

  const runSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    
    // Fake progress for visual effect
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    setTimeout(() => {
      // Logic for 1000 iterations: base numbers + random variance
      // This is simulated but reflects the concept
      let apcSum = 0, adcSum = 0, soworeSum = 0, othersSum = 0;
      
      for (let i = 0; i < 1000; i++) {
        const randA = Math.random() * 5 - 2.5; 
        const randB = Math.random() * 5 - 2.5;
        
        apcSum += 42 + (northWestSwing * 0.5) + randA;
        adcSum += 38 + (youthTurnout * 0.1) + randB;
        soworeSum += 8 + (Math.random() * 2 - 1);
        othersSum += 12 + (Math.random() * 2 - 1);
      }

      const total = apcSum + adcSum + soworeSum + othersSum;
      
      const newData = [
        { ...data[0], value: Number(((apcSum / total) * 100).toFixed(1)) },
        { ...data[1], value: Number(((adcSum / total) * 100).toFixed(1)) },
        { ...data[2], value: Number(((soworeSum / total) * 100).toFixed(1)) },
        { ...data[3], value: Number(((othersSum / total) * 100).toFixed(1)) },
      ];
      
      setData(newData);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 hud-card p-8 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          {isSimulating && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center border border-primary/20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-primary font-bold tracking-[0.4em] uppercase">Running Monte Carlo: 1k Iterations...</span>
              </div>
            </div>
          )}

          <div className="relative w-[280px] h-[280px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data} 
                  innerRadius={100} 
                  outerRadius={125} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-micro !tracking-[0.3em] mb-2">MODE: {isSimulating ? "COMPUTING" : "STABLE"}</span>
              <span className="text-5xl text-huge text-on-surface glow-accent leading-none">{data[0].value}</span>
              <span className="text-micro !text-primary mt-1 font-bold">{data[0].value > 40 ? "LEAD_SIGNA_HI" : "THREAT_DETECTED"}</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-8">
            <div className="terminal-header flex justify-between items-center">
              <span className="text-micro !text-primary !tracking-[0.4em] italic font-bold">PROBABILITY_BAND_INTEL</span>
              <button 
                onClick={runSimulation}
                disabled={isSimulating}
                className="bg-primary text-black px-4 py-1 rounded-sm text-[9px] font-bold tracking-widest uppercase hover:opacity-90 disabled:opacity-50 transition-all"
              >
                RUN_SIMULATION
              </button>
            </div>
            <div className="space-y-6">
              {data.map((candidate) => (
                <div key={candidate.name} className="space-y-2">
                  <div className="flex justify-between items-center text-micro !tracking-wider">
                    <span className="text-on-surface uppercase">{candidate.name}</span>
                    <span className="text-primary tabular-nums">{candidate.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      key={candidate.value}
                      initial={{ width: 0 }}
                      animate={{ width: `${candidate.value}%` }}
                      style={{ backgroundColor: candidate.color }}
                      className="h-full shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border-l-4 border-l-delayed bg-white/5 rounded-2xl premium-shadow">
          <div className="terminal-header">
             <span className="text-micro !text-delayed !tracking-[0.4em] font-bold">ASSUMPTION_ENGINE</span>
          </div>
          <div className="space-y-10 mt-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-widest">Youth Turnout (SW)</span>
                <span className="text-primary font-mono text-xs">{youthTurnout}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={youthTurnout} 
                onChange={(e) => setYouthTurnout(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer border-none"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-widest">North-West Swing</span>
                <span className="text-primary font-mono text-xs">{northWestSwing > 0 ? '+' : ''}{northWestSwing}%</span>
              </div>
              <input 
                type="range" min="-20" max="20" value={northWestSwing} 
                onChange={(e) => setNorthWestSwing(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer border-none"
              />
            </div>
            <div className="p-6 bg-white/5 border border-outline-variant text-[11px] font-mono leading-relaxed opacity-60 italic">
              *Adjusting inputs will invalidate current projection state. User must re-run simulation to update probabilities.
            </div>
          </div>
        </div>
      </div>

      <div className="hud-card overflow-hidden">
        <div className="p-8 border-b border-outline-variant flex justify-between items-end bg-white/5">
           <div>
            <div className="terminal-header mb-2 border-none">
                <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">THRESHOLD_MATRIX: THE 25%_RULE</span>
            </div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Cross-referencing legal benchmarks with projected sentiment</p>
           </div>
           <div className="flex gap-8">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                 <span className="text-[10px] font-mono text-on-surface-variant font-bold">SECURE</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-delayed" />
                 <span className="text-[10px] font-mono text-on-surface-variant font-bold">TOSS-UP</span>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-white/2">
              <tr>
                <th className="px-8 py-6 text-micro !text-primary !tracking-[0.3em] font-bold">REGION_STATE_ID</th>
                <th className="px-8 py-6 text-micro !text-primary !tracking-[0.3em] font-bold">TINUBU(APC)</th>
                <th className="px-8 py-6 text-micro !text-primary !tracking-[0.3em] font-bold">COALITION(ADC)</th>
                <th className="px-8 py-6 text-micro !text-primary !tracking-[0.3em] font-bold">2023_SWING</th>
                <th className="px-8 py-6 text-micro !text-primary !tracking-[0.3em] font-bold text-right">CON_GRADE</th>
              </tr>
            </thead>
            <tbody className="text-[11px] divide-y divide-outline-variant/50">
              {[
                { state: "LAGOS (SW)", t: "54.2%", c: "38.1%", swing: "+4.2%", conf: "A" },
                { state: "KANO (NW)", t: "38.5%", c: "41.2%", swing: "-3.1%", conf: "B" },
                { state: "RIVERS (SS)", t: "28.1%", c: "45.7%", swing: "+12.4%", conf: "C" },
                { state: "FCT (NC)", t: "21.4%", c: "55.2%", swing: "-2.1%", conf: "A" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-8 py-6 font-bold text-on-surface flex items-center gap-4">
                    <MapPin size={14} className="text-primary opacity-40" />
                    {row.state}
                  </td>
                  <td className="px-8 py-6 tabular-nums font-bold text-primary">{row.t}</td>
                  <td className="px-8 py-6 tabular-nums font-bold text-delayed">{row.c}</td>
                  <td className="px-8 py-6 tabular-nums text-on-surface-variant font-bold">{row.swing}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={cn(
                      "px-3 py-1 border text-[10px] font-bold tracking-widest",
                      row.conf === 'A' ? "border-reporting/40 text-reporting bg-reporting/5" :
                      row.conf === 'B' ? "border-primary/40 text-primary bg-primary/5" : "border-anomaly/40 text-anomaly bg-anomaly/5"
                    )}>
                      GRADE_{row.conf}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Page 3: Governorship Tracker ---

const GOVERNOR_STATES = [
  { state: 'LAGOS', incumbent: 'Sanwo-Olu', party: 'APC', status: 'TERM-LIMITED', battleground: false, risk: 'LOW', approval: 68, gdp: '$33B', unemployment: '14.2%', broker: 'Tinubu Allied' },
  { state: 'KANO', incumbent: 'Yusuf', party: 'NNPP', status: 'ELIGIBLE', battleground: true, risk: 'HIGH', approval: 54, gdp: '$12B', unemployment: '24.1%', broker: 'Kwankwaso Allied' },
  { state: 'RIVERS', incumbent: 'Fubara', party: 'PDP', status: 'ELIGIBLE', battleground: true, risk: 'CRITICAL', approval: 42, gdp: '$21B', unemployment: '31.5%', broker: 'Independent' },
  { state: 'KADUNA', incumbent: 'Sani', party: 'APC', status: 'ELIGIBLE', battleground: true, risk: 'MEDIUM', approval: 59, gdp: '$10B', unemployment: '28.4%', broker: 'El-Rufai Legacy' },
  { state: 'ANAMBRA', incumbent: 'Soludo', party: 'APGA', status: 'ELIGIBLE', battleground: true, risk: 'MEDIUM', approval: 72, gdp: '$9.5B', unemployment: '12.8%', broker: 'Technical' },
  { state: 'OYO', incumbent: 'Makinde', party: 'PDP', status: 'TERM-LIMITED', battleground: false, risk: 'LOW', approval: 75, gdp: '$11B', unemployment: '15.2%', broker: 'Mainline' },
  { state: 'EDO', incumbent: 'Okpebholo', party: 'APC', status: 'ELIGIBLE', battleground: true, risk: 'HIGH', approval: 48, gdp: '$8.2B', unemployment: '22.1%', broker: 'Unified' },
];

export function GovernorshipTracker() {
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'RISK'>('NAME');
  const [search, setSearch] = useState('');

  const filteredStates = GOVERNOR_STATES
    .filter(s => {
      const matchesSearch = s.state.toLowerCase().includes(search.toLowerCase()) || s.incumbent.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || s.party === filter || s.status === filter || (filter === 'BATTLEGROUND' && s.battleground);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'RISK') {
        const riskMap = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return (riskMap[b.risk as keyof typeof riskMap] || 0) - (riskMap[a.risk as keyof typeof riskMap] || 0);
      }
      return a.state.localeCompare(b.state);
    });

  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            STATE_LEVEL <br /> 
            <span className="text-secondary">POWER_MAP</span>
          </motion.h1>
          <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-secondary/30 pl-6">
            Monitoring executive leadership across the 36 states. Tracking succession battlegrounds and incumbent durability indices for the March 2027 cycle.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="STATES_CONTESTED" value="28" sub="SUB-NATIONAL TOTALS" icon={MapIcon} />
        <MetricCard label="INCUMBENTS_QUAL" value="12" sub="RE-ELECTION STATUS" icon={User} colorClass="text-reporting" />
        <MetricCard label="EXIT_PROTOCOL" value="16" sub="OPEN SEAT CONTESTS" icon={AlertTriangle} colorClass="text-delayed" />
        <MetricCard label="OFF-CYCLE_REM" value="08" sub="ACTIVE WAIT-LISTS" icon={History} />
      </div>

      <div className="hud-card p-0 overflow-hidden">
        <div className="p-8 border-b border-outline-variant bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="terminal-header mb-0">
              <span className="text-micro !text-primary !tracking-[0.4em] font-bold">EXECUTIVE_STATUS_MATRIX_V1</span>
           </div>
           <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <input 
                  type="text" placeholder="Search state or incumbent..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-white/20"
                />
              </div>
              <select 
                value={filter} onChange={e => setFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] font-bold text-on-surface-variant outline-none"
              >
                <option value="ALL">FILTER: ALL_REGIONS</option>
                <option value="APC">PARTY: APC</option>
                <option value="PDP">PARTY: PDP</option>
                <option value="BATTLEGROUND">TYPE: BATTLEGROUND</option>
                <option value="TERM-LIMITED">STATUS: TERM_LIMITED</option>
                <option value="ELIGIBLE">STATUS: ELIGIBLE</option>
              </select>
              <select 
                value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] font-bold text-on-surface-variant outline-none"
              >
                <option value="NAME">SORT: BY_NAME</option>
                <option value="RISK">SORT: BY_RISK</option>
              </select>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-outline-variant/10">
          {filteredStates.map((g) => (
            <div key={g.state} className="p-8 border-r border-b border-outline-variant/20 hover:bg-white/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-display font-bold text-on-surface tracking-tighter">{g.state}</span>
                    <span className="text-[9px] font-mono font-bold text-primary border border-primary/20 bg-primary/5 px-1.5 py-0.5">{g.gdp}</span>
                  </div>
                  {g.battleground && (
                    <span className="text-micro !text-anomaly font-bold flex items-center gap-1 mt-1">
                      <ShieldAlert size={10} /> BATTLEGROUND
                    </span>
                  )}
                </div>
                <div className={cn("px-2 py-0.5 text-[9px] font-mono font-bold uppercase border", 
                   g.party === 'APC' ? "border-primary/40 text-primary bg-primary/5" : 
                   g.party === 'PDP' ? "border-secondary/40 text-secondary bg-secondary/5" : 
                   "border-on-surface-variant")}>
                  {g.party}
                </div>
              </div>
              <div className="space-y-6 relative z-10 mb-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-micro !text-on-surface-variant font-bold !tracking-widest opacity-60">INCUMBENT_ID</span>
                    <p className="text-lg font-sans font-bold text-on-surface">{g.incumbent}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold text-on-surface-variant uppercase opacity-40">Approval</span>
                    <p className={cn("text-sm font-bold", g.approval > 60 ? "text-primary" : g.approval > 45 ? "text-delayed" : "text-anomaly")}>{g.approval}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-on-surface-variant uppercase font-bold tracking-widest opacity-40">RISK_COORD</span>
                    <span className={cn("text-[10px] font-bold", 
                      g.risk === 'CRITICAL' ? "text-anomaly" : g.risk === 'HIGH' ? "text-delayed" : "text-reporting"
                    )}>{g.risk}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-mono text-on-surface-variant uppercase font-bold tracking-widest opacity-40">BROKER</span>
                    <span className="text-[10px] font-bold text-primary/80">{g.broker}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className={cn("text-micro !font-bold px-2 py-1 !tracking-widest uppercase", 
                  g.status === 'TERM-LIMITED' ? "text-delayed bg-delayed/10 border border-delayed/20" : "text-reporting bg-reporting/10 border border-reporting/20"
                )}>{g.status}</span>
                <span className="text-[9px] font-mono text-on-surface-variant opacity-40">UE: {g.unemployment}</span>
              </div>
              
              <div className="mt-8 flex gap-2 relative z-10 border-t border-white/5 pt-4">
                <button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(g.incumbent + " " + g.state + " governor")}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 text-[9px] font-bold tracking-widest uppercase hover:bg-primary hover:text-black transition-all group/btn"
                >
                  <Search size={12} className="group-hover/btn:scale-110 transition-transform" />
                  SEARCH_POV
                </button>
                <button 
                  onClick={() => {
                    const monitorUrl = STATE_MONITOR_MAPPING[g.state] || 
                                     `https://www.premiumtimesng.com/tag/${encodeURIComponent(g.state.toLowerCase().replace(/ /g, '-'))}`;
                    window.open(monitorUrl, '_blank');
                  }}
                  className="px-4 flex items-center justify-center bg-white/5 border border-white/10 text-on-surface hover:border-secondary hover:text-secondary transition-all"
                  title="Monitor Situation"
                >
                  <Globe size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Page 4: Interactive Maps ---

const MAP_REGIONS = [
  { id: 'north-west', name: 'NORTH WEST', party: 'APC', shift: -2.4, color: '#00f0ff' },
  { id: 'north-east', name: 'NORTH EAST', party: 'APC', shift: 1.2, color: '#00f0ff' },
  { id: 'north-central', name: 'NORTH CENTRAL', party: 'PDP', shift: 4.8, color: '#ffd19d' },
  { id: 'south-west', name: 'SOUTH WEST', party: 'APC', shift: 8.5, color: '#00f0ff' },
  { id: 'south-east', name: 'SOUTH EAST', party: 'LP', partyName: 'LABOUR', shift: 12.1, color: '#26D967' },
  { id: 'south-south', name: 'SOUTH SOUTH', party: 'PDP', shift: -1.5, color: '#ffd19d' },
];

export function InteractiveMaps() {
  const [selectedRegion, setSelectedRegion] = useState(MAP_REGIONS[0]);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [layers, setLayers] = useState({ 
    heatmap: false, 
    infra: false, 
    security: false,
    demographics: false 
  });
  
  const securityIncidents = [
    { x: 100, y: 150, severity: 'HIGH', label: 'Protest' },
    { x: 250, y: 120, severity: 'LOW', label: 'Ballot Snatching' },
    { x: 320, y: 280, severity: 'MED', label: 'Logistics Delay' },
  ];

  const drillDownData = [
    { name: 'Alimosho', lean: 'APC', margin: '+12%', voters: '650k' },
    { name: 'Mushin', lean: 'APC', margin: '+24%', voters: '380k' },
    { name: 'Ikeja', lean: 'ADC', margin: '+8%', voters: '320k' },
    { name: 'Ojo', lean: 'ADC', margin: '+15%', voters: '410k' },
    { name: 'Lagos Island', lean: 'APC', margin: '+28%', voters: '220k' },
  ];

  const toggleLayer = (l: keyof typeof layers) => setLayers(prev => ({ ...prev, [l]: !prev[l] }));

  return (
    <div className="space-y-12 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 hud-card p-0 flex flex-col relative overflow-hidden min-h-[700px]">
          {/* Overlay Layers */}
          {layers.heatmap && <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10" />}
          {layers.infra && (
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
               <svg width="100%" height="100%">
                  <pattern id="infra" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.5" fill="#00f0ff" />
                    <line x1="20" y1="0" x2="20" y2="40" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="4 4" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#infra)" />
               </svg>
            </div>
          )}

          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="50" cy="50" r="1" fill="white" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>

          <div className="p-8 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center bg-white/5 relative z-20 gap-4">
            <div className="terminal-header border-none mb-0">
               <span className="text-micro !text-primary !tracking-[0.4em] font-bold">GEOSPATIAL_INTEL: REALVOTE_OVERLAY</span>
            </div>
            <div className="flex gap-4">
              {['heatmap', 'security', 'infra'].map(l => (
                <button 
                  key={l}
                  onClick={() => toggleLayer(l as any)}
                  className={cn(
                    "px-3 py-1 border text-[9px] font-bold tracking-widest uppercase transition-all",
                    (layers as any)[l] ? "border-primary text-primary bg-primary/10" : "border-white/10 text-on-surface-variant hover:border-primary/40"
                  )}
                >
                  LAYER_{l}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative p-12">
            {/* Visualizing Nigeria as a set of tech-hexagons or geometric blocks for the Sovereign style */}
            <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
              <svg viewBox="0 0 400 350" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                {/* Simplified Schematic Map of Nigeria Regions */}
                <g className="selection-none">
                  {/* North West */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[0])}
                    d="M60,40 L190,40 L190,140 L130,190 L60,150 Z" 
                    fill={selectedRegion.id === 'north-west' ? 'rgba(0,240,255,0.4)' : 'rgba(0,240,255,0.1)'}
                    stroke="rgba(0,240,255,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                  {/* North East */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[1])}
                    d="M190,40 L370,40 L370,140 L290,190 L190,140 Z" 
                    fill={selectedRegion.id === 'north-east' ? 'rgba(0,240,255,0.4)' : 'rgba(0,240,255,0.1)'}
                    stroke="rgba(0,240,255,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                  {/* North Central */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[2])}
                    d="M60,150 L130,190 L190,140 L290,190 L250,250 L130,250 Z" 
                    fill={selectedRegion.id === 'north-central' ? 'rgba(255,209,157,0.4)' : 'rgba(255,209,157,0.1)'}
                    stroke="rgba(255,209,157,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                  {/* South West */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[3])}
                    d="M50,160 L130,250 L90,310 L40,290 Z" 
                    fill={selectedRegion.id === 'south-west' ? 'rgba(0,240,255,0.4)' : 'rgba(0,240,255,0.1)'}
                    stroke="rgba(0,240,255,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                  {/* South East */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[4])}
                    d="M190,250 L290,250 L310,310 L190,310 Z" 
                    fill={selectedRegion.id === 'south-east' ? 'rgba(38,217,103,0.4)' : 'rgba(38,217,103,0.1)'}
                    stroke="rgba(38,217,103,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                  {/* South South */}
                  <motion.path 
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedRegion(MAP_REGIONS[5])}
                    d="M90,310 L130,250 L190,250 L190,310 L310,310 L310,340 L90,340 Z" 
                    fill={selectedRegion.id === 'south-south' ? 'rgba(255,209,157,0.4)' : 'rgba(255,209,157,0.1)'}
                    stroke="rgba(255,209,157,0.5)" strokeWidth="1"
                    className="map-realistic-path-segment"
                  />
                </g>

                {layers.security && securityIncidents.map((s, idx) => (
                    <g key={idx}>
                        <circle cx={s.x} cy={s.y} r="4" fill={s.severity === 'HIGH' ? '#ff4d4d' : s.severity === 'MED' ? '#ffcc00' : '#00f0ff'} className="animate-pulse" />
                        <text x={s.x + 8} y={s.y + 4} fill="white" fontSize="6" className="font-mono opacity-60 uppercase">{s.label}</text>
                    </g>
                ))}
                
                {/* HUD Elements over the map */}
                <circle cx="215" cy="180" r="3" fill="#00f0ff" className="animate-pulse" />
                <text x="225" y="185" fill="#00f0ff" fontSize="8" className="font-mono font-bold uppercase tracking-widest opacity-60">ABJ_NODE_01</text>
              </svg>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 border-t border-outline-variant flex items-center justify-center gap-6">
            <span className="text-micro !text-reporting flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-reporting animate-pulse" />
              ORBITAL_READY
            </span>
            <span className="text-micro !text-on-surface-variant opacity-40"> | </span>
            <span className="text-micro !text-primary flex items-center gap-2">
              LATENCY: 14MS
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="hud-card p-6 border-l-4 border-l-primary">
            <div className="terminal-header">
              <span className="text-micro !text-primary !tracking-[0.4em] font-bold">REGION_FOCUS: {selectedRegion.name}</span>
            </div>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <span className="text-micro !text-on-surface-variant opacity-60">DOMINANT_PARTY</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-huge">{selectedRegion.party}</span>
                  <span className={cn("text-xs font-mono font-bold px-2 py-0.5 border", 
                    selectedRegion.shift > 0 ? "border-reporting/40 text-reporting" : "border-anomaly/40 text-anomaly"
                  )}>
                    {selectedRegion.shift > 0 ? '↑' : '↓'} {Math.abs(selectedRegion.shift)}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white/10 border border-outline-variant rounded">
                <span className="text-micro !text-primary block mb-2">TERRAIN_ANALYSIS</span>
                <p className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
                  Significant volatility detected in urban nodes. Demographic shifts among 18-35 age band indicates a potential +12% swing in the {selectedRegion.name} corridor.
                </p>
              </div>
              <button 
                onClick={() => setShowDrillDown(true)} 
                className="bg-primary text-black w-full py-3 rounded-lg text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all"
              >
                DRILL_SUB_NODES
              </button>
            </div>
          </div>

          <div className="hud-card p-6">
            <div className="terminal-header">
              <span className="text-micro !text-on-surface-variant !tracking-[0.4em] font-bold">LEGEND_KEYS</span>
            </div>
            <div className="mt-4 space-y-3">
              {MAP_REGIONS.map(reg => (
                <div key={reg.id} onClick={() => setSelectedRegion(reg)} className={cn(
                  "flex items-center justify-between p-3 border cursor-pointer transition-all",
                  selectedRegion.id === reg.id ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/5" : "bg-white/2 border-outline-variant/30 hover:border-outline-variant"
                )}>
                  <span className="text-[10px] font-mono font-bold text-on-surface">{reg.name}</span>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: reg.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDrillDown && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowDrillDown(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="hud-card w-full max-w-2xl relative z-10 p-0 overflow-hidden"
             >
                <div className="p-8 border-b border-outline-variant flex justify-between items-center bg-white/5">
                  <div className="terminal-header mb-0">
                    <span className="text-micro !text-primary !tracking-[0.4em] font-bold">SUB_NODE_EXPLORER: {selectedRegion.name}_LGAS</span>
                  </div>
                  <button onClick={() => setShowDrillDown(false)} className="text-white hover:text-primary"><X size={20}/></button>
                </div>
                <div className="p-0 overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-white/10 border-b border-outline-variant">
                        <tr>
                          <th className="px-8 py-4 text-[10px] font-bold text-primary tracking-widest uppercase">LGA_NAME</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-primary tracking-widest uppercase">PARTY_LEAN</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-primary tracking-widest uppercase text-right">REG_VOTERS</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] divide-y divide-white/5">
                        {drillDownData.map((lga, i) => (
                          <tr key={i} className="hover:bg-primary/5">
                            <td className="px-8 py-4 font-bold text-on-surface">{lga.name}</td>
                            <td className="px-8 py-4 h-full flex items-center gap-4">
                              <span className={cn("font-bold", lga.lean === 'APC' ? "text-primary" : "text-delayed")}>{lga.lean}</span>
                              <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] text-on-surface-variant">{lga.margin}</span>
                            </td>
                            <td className="px-8 py-4 text-right tabular-nums text-on-surface-variant font-bold">{lga.voters}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
                <div className="p-6 bg-primary/5 text-center border-t border-primary/20">
                   <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-[0.4em]">CAUTION: MOCK_DATA_ENVIROMENT_ACTIVE</span>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Page 5: Historical Data ---

const COMPARATIVE_DATA = [
  { year: '1999', turnout: 52.3, apc: 0, pdp: 52.8 },
  { year: '2003', turnout: 69.1, apc: 0, pdp: 61.9 },
  { year: '2007', turnout: 57.5, apc: 0, pdp: 69.6 },
  { year: '2011', turnout: 53.7, apc: 0, pdp: 58.9 },
  { year: '2015', turnout: 43.7, apc: 53.9, pdp: 44.9 },
  { year: '2019', turnout: 34.7, apc: 53.2, pdp: 41.2 },
  { year: '2023', turnout: 26.7, apc: 36.6, pdp: 29.1, lp: 25.4 },
  { year: '2027 (PROJ)', turnout: 41.2, apc: 42.1, pdp: 28.5, lp: 27.2 },
];

const SWING_STATES = [
  { state: 'Lagos', delta: '+12.4%', lean: 'TOWARDS_COALITION', significance: 'CRITICAL' },
  { state: 'Kano', delta: '-8.2%', lean: 'TOWARDS_PDP', significance: 'HIGH' },
  { state: 'Rivers', delta: '+15.5%', lean: 'TOWARDS_APC', significance: 'HIGH' },
  { state: 'Plateau', delta: '+9.1%', lean: 'TOWARDS_APC', significance: 'MEDIUM' },
];

export function HistoricalData() {
  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            PRECEDENT_ <br /> 
            <span className="text-primary">ARCHIVE</span>
          </motion.h1>
          <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Analyzing electoral patterns across four cycles. Deconstructing voter behavior, participation decay, and the emergence of multiparty corridors.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 hud-card p-8">
          <div className="terminal-header flex justify-between items-center">
            <span className="text-micro !text-primary !tracking-[0.4em] font-bold">MULTI_CYCLE_TURNOUT_INTEGRITY</span>
          </div>
          <div className="h-[400px] mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPARATIVE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="year" stroke="#666" fontSize={10} tickLine={false} axisLine={false} offset={10} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', border: '1px solid #2a2a2a' }} labelStyle={{ color: '#white', fontFamily: 'JetBrains Mono' }} />
                <Line type="monotone" dataKey="turnout" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4, fill: '#00f0ff' }} name="Turnout %" />
                <Line type="monotone" dataKey="apc" stroke="#26D967" strokeWidth={2} strokeDasharray="5 5" name="APC Vote Share" />
                <Line type="monotone" dataKey="pdp" stroke="#6726D9" strokeWidth={2} strokeDasharray="5 5" name="PDP Vote Share" />
                {COMPARATIVE_DATA.some(d => d.lp) && <Line type="monotone" dataKey="lp" stroke="#D96726" strokeWidth={2} name="LP Vote Share" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="hud-card p-6">
              <div className="terminal-header">
                <span className="text-micro !text-primary !tracking-[0.4em] font-bold">SWING_SENSITIVITY_INDEX</span>
              </div>
              <div className="mt-6 space-y-4">
                 {SWING_STATES.map((state) => (
                   <div key={state.state} className="group p-4 bg-white/5 border border-white/5 hover:border-primary/40 transition-all cursor-default">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-tight">{state.state}</span>
                         <span className={cn("text-[10px] font-mono font-bold tabular-nums", state.delta.startsWith('+') ? "text-reporting" : "text-anomaly")}>
                           {state.delta}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-on-surface-variant uppercase opacity-40">
                         <span>{state.lean}</span>
                         <span className="text-primary font-bold">{state.significance}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="p-6 glass-card bg-primary/5 border border-primary/20">
              <span className="text-micro !text-primary block mb-2 font-bold uppercase tracking-[0.4em]">TURNOUT_EROSION_INDEX</span>
              <p className="text-[10px] font-mono text-on-surface-variant leading-relaxed italic">
                 "Participation decay from 69.1% (2003) to 26.72% (2023) indicates a structural trust deficit. Baseline 2027 recovery assumes 12.4M new registrants within the digital corridor."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Page 6: Security Monitor ---

const SECURITY_EVENTS = [
  { id: 1, type: 'KIDNAP', zone: 'KADUNA', time: '14:20', severity: 'HIGH' },
  { id: 2, type: 'CLASH', zone: 'PLATEAU', time: '11:05', severity: 'MED' },
  { id: 3, type: 'PROTEST', zone: 'LAGOS', time: '09:45', severity: 'LOW' },
];

export function SecurityMonitor() {
  const [events, setEvents] = useState(SECURITY_EVENTS);
  const [activeTab, setActiveTab] = useState<'FEED' | 'MAP'>('FEED');

  useEffect(() => {
    async function initEvents() {
      const liveEvents = await fetchIncidentReports();
      setEvents(prev => [...liveEvents, ...prev]);
    }
    initEvents();

    const types = ['KIDNAP', 'CIVIL_UNREST', 'VOTER_INTIMIDATION', 'LOGISTICS_THEFT', 'CYBER_ATTACK'];
    const zones = ['KANO', 'IMO', 'LAGOS', 'RIVERS', 'BORNO', 'KADUNA'];
    const severities = ['HIGH', 'MED', 'LOW'];

    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: severities[Math.floor(Math.random() * severities.length)],
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const zoneCoords: Record<string, { x: number, y: number }> = {
    'NORTH WEST': { x: 120, y: 100 },
    'NORTH EAST': { x: 280, y: 100 },
    'NORTH CENTRAL': { x: 180, y: 180 },
    'SOUTH WEST': { x: 100, y: 250 },
    'SOUTH EAST': { x: 250, y: 280 },
    'SOUTH SOUTH': { x: 200, y: 310 },
    'KANO': { x: 160, y: 80 },
    'LAGOS': { x: 80, y: 270 },
    'RIVERS': { x: 190, y: 310 },
    'PLATEAU': { x: 210, y: 180 },
    'KADUNA': { x: 160, y: 140 },
    'BORNO': { x: 320, y: 80 },
    'IMO': { x: 230, y: 280 },
  };

  return (
    <div className="space-y-12 pb-16">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-auto">
          <MetricCard label="ACLED_INCIDENTS_24H" value={String(events.length + 12)} sub="REAL_TIME_STREAM" icon={ShieldAlert} colorClass="text-anomaly" />
          <MetricCard label="HOTSPOT_THREAT_LVL" value="7.2" sub="SIGINT_SCALE: 1-10" icon={Activity} colorClass="text-delayed" />
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('FEED')}
            className={cn("px-6 py-2 rounded text-[10px] font-bold tracking-widest transition-all", activeTab === 'FEED' ? "bg-white text-black" : "text-on-surface-variant hover:text-white")}
          >
            SIT_FEED
          </button>
          <button 
            onClick={() => setActiveTab('MAP')}
            className={cn("px-6 py-2 rounded text-[10px] font-bold tracking-widest transition-all", activeTab === 'MAP' ? "bg-white text-black" : "text-on-surface-variant hover:text-white")}
          >
            THREAT_MAP
          </button>
        </div>
      </div>
      
      {activeTab === 'FEED' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hud-card p-0 overflow-hidden text-sm">
          <div className="p-8 border-b border-outline-variant items-center flex justify-between bg-white/5">
            <span className="text-micro !text-primary !tracking-[0.4em] font-bold">ACLED_FEED_STREAMING_LOG</span>
            <div className="flex items-center gap-2 text-micro !text-reporting !font-bold">
                <div className="w-2 h-2 rounded-full bg-reporting animate-pulse" />
                POLLING_SATELLITE_NODES
            </div>
          </div>
          <div className="divide-y divide-outline-variant/30 max-h-[600px] overflow-y-auto font-mono">
            {events.map(ev => (
              <motion.div 
                layout 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                key={ev.id} 
                className="p-8 flex justify-between items-center hover:bg-white/5 transition-all"
              >
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-on-surface text-lg tracking-tight uppercase">{ev.type} DETECTED / {ev.zone}</h4>
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-on-surface-variant" />
                    <p className="text-on-surface-variant font-mono text-[10px] tracking-widest uppercase">{ev.time} WAT_ZONE</p>
                  </div>
                </div>
                <span className={cn(
                  "px-4 py-1.5 text-[10px] font-mono font-bold border tracking-widest uppercase", 
                  ev.severity === 'HIGH' ? "text-anomaly border-anomaly/40 bg-anomaly/5" : 
                  ev.severity === 'MED' ? "text-delayed border-delayed/40 bg-delayed/5" : "text-primary border-primary/40 bg-primary/5"
                )}>
                  {ev.severity}_SEVERITY
                </span>
              </motion.div>
            ))}
          </div>
          <div className="p-4 bg-anomaly/5 border-t border-anomaly/20 text-center">
              <span className="text-[9px] font-mono font-bold text-anomaly uppercase tracking-[0.4em]">CAUTION: DATA SUBJECT TO SIGINT VERIFICATION</span>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="hud-card p-0 min-h-[600px] relative overflow-hidden bg-white/2">
           <div className="p-8 border-b border-outline-variant items-center flex justify-between">
            <span className="text-micro !text-anomaly !tracking-[0.4em] font-bold">THREAT_GEOSPATIAL_DISTRIBUTION</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="relative w-full max-w-xl aspect-square">
              <svg viewBox="0 0 400 350" className="w-full h-full opacity-30 grayscale brightness-200">
                <path d="M60,40 L190,40 L190,140 L130,190 L60,150 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
                <path d="M190,40 L370,40 L370,140 L290,190 L190,140 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
                <path d="M60,150 L130,190 L190,140 L290,190 L250,250 L130,250 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
                <path d="M50,160 L130,250 L90,310 L40,290 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
                <path d="M190,250 L290,250 L310,310 L190,310 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
                <path d="M90,310 L130,250 L190,250 L190,310 L310,310 L310,340 L90,340 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="0.5" />
              </svg>
              {events.map((ev) => {
                const coords = zoneCoords[ev.zone] || { x: 200, y: 150 };
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute"
                    style={{ left: coords.x, top: coords.y }}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full animate-ping absolute -translate-x-1/2 -translate-y-1/2",
                      ev.severity === 'HIGH' ? "bg-anomaly" : ev.severity === 'MED' ? "bg-delayed" : "bg-primary"
                    )} />
                    <div className={cn(
                      "w-3 h-3 rounded-full absolute -translate-x-1/2 -translate-y-1/2 shadow-lg",
                      ev.severity === 'HIGH' ? "bg-anomaly" : ev.severity === 'MED' ? "bg-delayed" : "bg-primary"
                    )} title={`${ev.type} at ${ev.zone}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- Page 7: Visual Lab ---

const SOURCE_TEXT = `
/**
 * MISSION: SOVEREIGN LENS
 * VERSION: 5.1.0
 */

// ARCHITECTURAL TOKENS
const SURFACE = "#0B1326";
const PRIMARY = "#00F0FF";
const ACCENTS = ["#26D967", "#6726D9", "#D96726"];

function RenderSovereignCore() {
  const [entropy, setEntropy] = useState(0.85);
  // D3.js ASCII Grid Processing...
}
`;


export function VisualLab() {
  const [minOpacity, setMinOpacity] = useState(0.05);
  const [maxOpacity, setMaxOpacity] = useState(0.5);
  const [speed, setSpeed] = useState(4);
  const [activeDataset, setActiveDataset] = useState('VOTER_DENSITY');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const lines = SOURCE_TEXT.split('\n').filter(l => l.trim() !== '');
    
    const xPositions = [30, 160, 320, 480, 640];
    
    svg.selectAll("text")
      .data(lines)
      .enter()
      .append("text")
      .attr("x", (d, i) => xPositions[i % xPositions.length])
      .attr("y", (d, i) => (i * 15) % height + 30)
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", 9)
      .attr("fill", "#00f0ff")
      .attr("font-weight", "bold")
      .attr("opacity", 0.6)
      .text(d => d.slice(0, 25));

    // Scatter simulation points based on activeDataset
    const points = d3.range(50).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4 + 2
    }));

    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", activeDataset === 'VOTER_DENSITY' ? "#26D967" : "#00f0ff")
      .attr("opacity", 0.4);

    svg.append("g")
      .attr("stroke", "rgba(0, 240, 255, 0.1)")
      .attr("stroke-width", 0.5)
      .selectAll("line")
      .data(d3.range(0, width, 40))
      .enter()
      .append("line")
      .attr("x1", d => d)
      .attr("x2", d => d)
      .attr("y1", 0)
      .attr("y2", height);

  }, [activeDataset]);

  const handleExport = (type: 'PNG' | 'JSON' | 'EMBED') => {
    alert(`Generating ${type} export package... [SIGINT_AUTH_REQUIRED]`);
  };

  return (
    <div className="space-y-12 pb-16">
      <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            COMMAND_ <br /> 
            <span className="text-primary">CENTER</span>
          </motion.h1>
           <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Aggregated market and electoral intelligence. Tracking Nigerian All-Share Index and Eurobond yields against key election milestones.
          </p>
        </div>
      </section>

      <SecuritiesGraph />

      <div className="hud-card p-0 border-l-4 border-l-primary overflow-hidden">
        <div className="p-8 border-b border-outline-variant bg-surface-container-low/40 flex justify-between items-center">
           <div className="terminal-header mb-0">
              <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">VISUAL_LAB: DYNAMIC_SYNTHESIS_ENGINE</span>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => handleExport('PNG')}
                className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all font-mono"
              >
                EXPORT_PNG
              </button>
              <button 
                onClick={() => handleExport('EMBED')}
                className="px-3 py-1 bg-primary text-black text-[9px] font-bold tracking-widest uppercase hover:opacity-90 transition-all font-mono"
              >
                GENERATE_EMBED
              </button>
           </div>
        </div>
        
        <div 
          className="relative h-[500px] animate-triadic"
          style={{
            background: 'linear-gradient(-45deg, #26D967, #6726D9, #D96726)',
            backgroundSize: '400% 400%'
          }}
        >
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-[6px] z-0" />
          
          <motion.div 
            className="absolute inset-0 flex items-center justify-center p-12 z-10"
            animate={{ opacity: [minOpacity, maxOpacity, minOpacity] }}
            transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg ref={svgRef} viewBox="0 0 800 400" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
          </motion.div>

          <div className="absolute inset-0 z-20 pointer-events-none">
             <div className="absolute top-8 left-8 p-4 border border-primary/20 bg-black/40 backdrop-blur-md">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">X_COORD_INTEL</span>
                <div className="mt-2 text-2xl font-headline font-bold text-on-surface">329.01</div>
             </div>
             <div className="absolute bottom-8 right-8 p-4 border border-primary/20 bg-black/40 backdrop-blur-md">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">SIG_FREQUENCY</span>
                <div className="mt-2 text-2xl font-headline font-bold text-on-surface tabular-nums">{(1/speed).toFixed(2)}_HZ</div>
             </div>
          </div>
        </div>

        <div className="p-12 border-t border-outline-variant">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <span className="text-micro !text-primary block font-bold tracking-[0.4em] uppercase">PARAMETER_CONTROLS</span>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                       <span>Min_Opacity</span>
                       <span className="text-primary">{(minOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="0.3" step="0.01" value={minOpacity} onChange={e => setMinOpacity(parseFloat(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                       <span>Max_Opacity</span>
                       <span className="text-primary">{(maxOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.4" max="1" step="0.05" value={maxOpacity} onChange={e => setMaxOpacity(parseFloat(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                       <span>Oscillation_Period</span>
                       <span className="text-primary">{speed}s</span>
                    </div>
                    <input type="range" min="1" max="10" step="0.5" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full accent-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <span className="text-micro !text-primary block font-bold tracking-[0.4em] uppercase">DATASET_CROSS_TAB</span>
                 <div className="space-y-4">
                    {['VOTER_DENSITY', 'TURNOUT_HISTORICAL', 'SECURITY_INCIDENTS'].map(ds => (
                      <button 
                        key={ds}
                        onClick={() => setActiveDataset(ds)}
                        className={cn("w-full p-4 border text-[10px] font-mono font-bold tracking-widest uppercase transition-all text-left flex justify-between items-center group",
                        activeDataset === ds ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 hover:border-white/20"
                      )}>
                        {ds}
                        <ChevronRight size={14} className={cn("group-hover:translate-x-1 transition-transform", activeDataset === ds ? "text-black" : "text-primary")} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                <span className="text-micro !text-primary block font-bold tracking-[0.4em] uppercase">TERMINAL_STDOUT</span>
                <div className="hud-card p-6 bg-black/40 border border-white/10 min-h-[200px] max-h-[200px] overflow-y-auto">
                   <div className="font-mono text-[9px] text-on-surface-variant space-y-2 leading-relaxed">
                      <p className="text-primary">{`[${new Date().toLocaleTimeString()}] SYNTHESIS_INITIALIZED`}</p>
                      <p>{`> Loading d3-force simulation...`}</p>
                      <p>{`> Rendering canvas layers: 3`}</p>
                      <p>{`> Seed_Entropy: 0.829`}</p>
                      <p className="text-delayed italic">{`// WARNING: High oscillator frequency detected`}</p>
                      <p>{`> Establishing websocket link...`}</p>
                      <p className="text-reporting font-bold">{`[STATUS] SYNC_COMPLETE`}</p>
                      <p className="animate-pulse">{`> Awaiting console input..._`}</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
// --- Page 8: INEC Logistics & IReV Monitor ---

const IREV_UPLOAD_DATA = [
  { time: '10:00', uploadRate: 45 },
  { time: '12:00', uploadRate: 62 },
  { time: '14:00', uploadRate: 88 },
  { time: '16:00', uploadRate: 92 },
  { time: '18:00', uploadRate: 95 },
  { time: '20:00', uploadRate: 99 },
];

const BVAS_INCIDENTS = [
  { id: 1, issue: 'Failed to authenticate voter', code: 'E-503', location: 'PU 007, Ward 3, LGA Bwari', time: '14:22', status: 'UNRESOLVED', details: 'Biometric hashing mismatch detected. Possible firmware inconsistency in BVAS unit #BV-8821.' },
  { id: 2, issue: 'Network timeout during transmission', code: 'E-408', location: 'PU 012, Ward 1, LGA Gwagwalada', time: '15:05', status: 'RESOLVED', details: 'Insufficient signal strength at transmission point. Results successfully uploaded via secondary satellite uplink at 15:42.' },
  { id: 3, issue: 'Biometric capture failure', code: 'E-501', location: 'PU 003, Ward 5, LGA Kuje', time: '16:10', status: 'UNRESOLVED', details: 'Optical sensor malfunctioning due to environmental heat. Replacement unit dispatched via mobile rapid response team.' },
];

export function LogisticsMonitor() {
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [irevStats, setIrevStats] = useState<any>(null);
  const [logisticsData, setLogisticsData] = useState(generateLogisticsData());
  const [irevStream, setIrevStream] = useState(generateIReVStream());

  useEffect(() => {
    async function updateStats() {
      const data = await fetchIReVData();
      setIrevStats(data);
    }
    updateStats();

    const interval = setInterval(() => {
      setIrevStream(prev => [generateIReVStream()[0], ...prev.slice(0, 9)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            IREV_ <br /> 
            <span className="text-primary">DEPLOYMENT</span>
          </motion.h1>
          <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Real-time monitoring of polling unit deployment and result transmission status across the 774 Local Government Areas.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard label="BUDGET_TOTAL" value="N273B" sub="TOTAL 2027 ELECTION" trend={{ val: "14%", up: true }} icon={Shield} />
        <MetricCard label="TECH_INVEST" value="N209B" sub="E-POLL_INFRASTRUCTURE" trend={{ val: "42%", up: true }} icon={Activity} />
        <MetricCard label="AD-HOC_STAFF" value="450K" sub="CORPS_MEMBERS_ACTIVE" trend={{ val: "5K", up: true }} icon={Users} colorClass="text-reporting" />
        <MetricCard label="IReV_LATENCY" value="14ms" sub="SAT_UPLOAD_VERIFIED" icon={CheckCircle2} colorClass="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <div className="hud-card p-8">
                <div className="terminal-header flex justify-between items-center">
                    <span className="text-micro !text-primary !tracking-[0.4em] font-bold uppercase">Material_Deployment_Atlas</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-9 gap-2 mt-8">
                    {logisticsData.map(d => (
                        <div key={d.state} className={cn("p-2 border text-[8px] font-mono font-bold flex flex-col items-center justify-center gap-1", 
                            d.materialStatus === 'OPTIMAL' ? "bg-primary/5 border-primary/20 text-primary" : "bg-anomaly/5 border-anomaly/20 text-anomaly"
                        )}>
                            <span>{d.state.substring(0, 3)}</span>
                            <div className="w-full h-0.5 bg-white/5">
                                <div className={cn("h-full", d.materialStatus === 'OPTIMAL' ? "bg-primary" : "bg-anomaly")} style={{ width: `${d.completion}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hud-card p-8">
              <div className="terminal-header flex justify-between items-center">
                <span className="text-micro !text-primary !tracking-[0.4em] font-bold">UPLOAD_DECELERATION_MATRIX</span>
              </div>
              <div className="h-[300px] mt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={IREV_UPLOAD_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', border: '1px solid #2a2a2a' }} />
                    <Area type="monotone" dataKey="uploadRate" stroke="#00f0ff" fill="url(#colorLogistics)" />
                    <defs>
                      <linearGradient id="colorLogistics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>

        <div className="space-y-6">
           <div className="hud-card p-6 bg-primary/5 border border-primary/20">
              <span className="text-micro !text-primary block mb-1 uppercase font-bold tracking-widest">IReV_Live_Stream</span>
              <div className="mt-4 space-y-2 overflow-hidden">
                {irevStream.map((s, i) => (
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        key={s.id + i} 
                        className="flex justify-between items-center text-[9px] font-mono border-b border-white/5 pb-2"
                    >
                        <span className="text-primary">{s.id}</span>
                        <span className="opacity-40">{s.state}</span>
                        <span className="text-reporting">OK</span>
                    </motion.div>
                ))}
              </div>
           </div>
           
           <div className="hud-card p-6 border-l-4 border-l-anomaly">
              <span className="text-micro !text-anomaly block mb-1">BVAS_TIMEOUTS_DET</span>
              <div className="text-4xl text-huge tabular-nums text-anomaly">412</div>
              <div className="mt-2 text-[10px] font-mono text-on-surface-variant uppercase mb-6">Zones: NC, NW, SS</div>
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">RECENT_INCIDENTS_REPORT:</span>
                {BVAS_INCIDENTS.map(incident => (
                  <div 
                    key={incident.id} 
                    onClick={() => setSelectedIncident(incident)}
                    className="p-3 bg-white/5 border border-white/5 hover:border-anomaly/40 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-bold text-on-surface uppercase truncate">{incident.issue}</span>
                      <span className="text-[9px] font-mono text-on-surface-variant italic">{incident.location}</span>
                    </div>
                    <ChevronRight size={14} className="text-on-surface-variant group-hover:text-anomaly shrink-0" />
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedIncident(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="hud-card w-full max-w-lg relative z-10 p-0 overflow-hidden border-anomaly/20"
             >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-anomaly/5">
                  <div className="terminal-header mb-0">
                    <span className="text-micro !text-anomaly !tracking-[0.4em] font-bold uppercase">INCIDENT_SIGINT_REPORT: {selectedIncident.code}</span>
                  </div>
                  <button onClick={() => setSelectedIncident(null)} className="text-white hover:text-anomaly"><X size={20}/></button>
                </div>
                <div className="p-8 space-y-8 h-full">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-micro opacity-40 block mb-1">ISSUE_TYPE</span>
                      <span className="text-sm font-bold text-on-surface uppercase">{selectedIncident.issue}</span>
                    </div>
                    <div>
                      <span className="text-micro opacity-40 block mb-1">UNIT_REPORT_TIME</span>
                      <span className="text-sm font-mono text-on-surface">{selectedIncident.time} WAT</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-micro opacity-40 block mb-1">GEO_LOCATION</span>
                    <span className="text-sm font-bold text-primary uppercase">{selectedIncident.location}</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <span className="text-micro !text-anomaly block mb-2 font-bold tracking-widest">DETAILED_LOG_ENTRY</span>
                    <p className="text-[11px] font-mono text-on-surface-variant leading-relaxed">
                      {selectedIncident.details}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-micro opacity-40 uppercase">STATUS:</span>
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest",
                      selectedIncident.status === 'RESOLVED' ? "bg-reporting/20 text-reporting" : "bg-anomaly/20 text-anomaly"
                    )}>
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-anomaly/5 flex justify-end border-t border-anomaly/10">
                   <button onClick={() => setSelectedIncident(null)} className="btn-secondary !text-anomaly !border-anomaly/40 hover:!bg-anomaly/20">ACKNOWLEDGE_REPORT</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Page 9: National Assembly Battlegrounds ---

const SENATE_BATTLEGROUNDS = [
  { zone: 'Lagos Central', incumbent: 'APC', challenger: 'LP', probability: '62% FLIP', margin: '4k' },
  { zone: 'Kano Central', incumbent: 'NNPP', challenger: 'APC', probability: '15% FLIP', margin: '42k' },
  { zone: 'Rivers South-East', incumbent: 'APC', challenger: 'PDP', probability: '44% FLIP', margin: '12k' },
];

const HOUSE_BATTLEGROUNDS = [
  { zone: 'Bwari/Kuje', incumbent: 'LP', challenger: 'APC', probability: '48% RETENTION', margin: '1.2k' },
  { zone: 'Ikeja', incumbent: 'APC', challenger: 'ADC', probability: '32% FLIP', margin: '8k' },
  { zone: 'Enugu North', incumbent: 'LP', challenger: 'PDP', probability: '72% RETENTION', margin: '19k' },
];

export function NASSBattlegrounds() {
  const [activeTab, setActiveTab] = useState<'SENATE' | 'HOUSE'>('SENATE');
  const grounds = activeTab === 'SENATE' ? SENATE_BATTLEGROUNDS : HOUSE_BATTLEGROUNDS;

  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            PARLIAMENT_ <br /> 
            <span className="text-primary">FRAY</span>
          </motion.h1>
           <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Tracking critical contests in the National Assembly. Monitoring the shift in legislative plurality across the 109 Senate zones and 360 Federal Constituencies.
          </p>
        </div>
      </section>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('SENATE')} className={cn("px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all", activeTab === 'SENATE' ? "bg-primary text-black" : "bg-white/5 text-on-surface hover:bg-white/10")}>SENATE</button>
        <button onClick={() => setActiveTab('HOUSE')} className={cn("px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all", activeTab === 'HOUSE' ? "bg-primary text-black" : "bg-white/5 text-on-surface hover:bg-white/10")}>HOUSE_OF_REPS</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {grounds.map((zone, i) => (
             <div key={i} className="hud-card p-6 flex justify-between items-center group hover:border-primary/40 transition-all cursor-default relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                <div>
                   <span className="text-micro !text-primary !tracking-[0.4em] font-bold block mb-1">UNIT: {zone.zone}</span>
                   <div className="flex items-center gap-4">
                      <span className="text-sm font-headline font-bold text-on-surface">{zone.incumbent}</span>
                      <span className="text-[10px] font-mono text-on-surface-variant opacity-40">VS</span>
                      <span className="text-sm font-headline font-bold text-primary">{zone.challenger}</span>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-huge text-primary">{zone.probability}</div>
                   <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold">Margin: {zone.margin} votes</div>
                </div>
             </div>
           ))}
        </div>
        <div className="hud-card p-8 border-l-4 border-l-delayed bg-delayed/5">
           <div className="terminal-header">
              <span className="text-micro !text-delayed !tracking-[0.4em] font-bold">MAJORITY_CHASE_V2</span>
           </div>
           <div className="mt-8 space-y-12">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-micro font-bold uppercase tracking-widest">APC_SEATS (EST)</span>
                    <span className="text-2xl text-huge tabular-nums">54/109</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary w-[49.5%]" />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-micro font-bold uppercase tracking-widest">OPPOSITION_BLOCK</span>
                    <span className="text-2xl text-huge tabular-nums">55/109</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-secondary w-[50.5%]" />
                 </div>
              </div>
              <p className="text-[10px] font-mono text-on-surface-variant leading-relaxed border-t border-white/5 pt-6 italic">
                 "Legislative plurality is currently balanced on a knife-edge. 9 seats in the North-Central belt are classified as 'High Volatility' following the latest Q3 coalition shifts."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Page 10: Disinformation & Sentiment Radar ---

const SENTIMENT_KEYWORDS = [
  { word: 'INFLATION', volume: 85, sentiment: 'NEGATIVE' },
  { word: 'SECURITY', volume: 72, sentiment: 'NEGATIVE' },
  { word: 'REFORM', volume: 64, sentiment: 'POSITIVE' },
  { word: 'YOUTH_VOICE', volume: 91, sentiment: 'POSITIVE' },
  { word: 'SUBSIDY', volume: 78, sentiment: 'MIXED' },
];

const ISSUE_SALIENCE = [
  { issue: 'Economy/Cost of Living', value: 48, color: '#00f0ff' },
  { issue: 'Security', value: 35, color: '#ffb4ab' },
  { issue: 'Governance/Corruption', value: 12, color: '#bbcbb8' },
  { issue: 'Infrastructure', value: 5, color: '#26D967' },
];

export function SentimentRadar() {
  const [externalAnalysis, setExternalAnalysis] = useState<any>(null);
  const [mockTweets, setMockTweets] = useState([
    { user: '@NaijaVoter', text: 'INEC confirms BVAS readiness for 2027. #NigeriaDecides', sentiment: 'POSITIVE' },
    { user: '@LagosToday', text: 'Voter registration density in Alimosho reaches record high.', sentiment: 'POSITIVE' },
    { user: '@AlertNG', text: 'Unverified claims about result manipulation circulating on WhatsApp. Be vigilant.', sentiment: 'NEGATIVE' },
  ]);

  useEffect(() => {
    async function loadPlatforms() {
      const stears = await fetchStearsData();
      const dataphyte = await fetchDataphyteData('sentiment');
      setExternalAnalysis({ stears, dataphyte });
    }
    loadPlatforms();

    const interval = setInterval(() => {
        setMockTweets(prev => [prev[prev.length-1], ...prev.slice(0, prev.length-1)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            SENTIMENT_ <br /> 
            <span className="text-primary">CORE</span>
          </motion.h1>
           <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Neural mapping of national discourse. Tracking disinformation vectors and emotional resonance across digital town squares.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="hud-card p-6 bg-secondary/5 border-secondary/20">
              <div className="terminal-header">
                <span className="text-micro !text-secondary !tracking-[0.4em] font-bold">DIGITAL_PULSE: LIVE_X_SCRAPE_SIM</span>
              </div>
              <div className="mt-8 space-y-4">
                 {mockTweets.map((t, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="p-4 bg-white/5 border border-white/5 flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold">TX</div>
                        <div className="flex-1">
                            <span className="text-[10px] font-bold text-secondary">{t.user}</span>
                            <p className="text-xs text-on-surface-variant mt-1">{t.text}</p>
                        </div>
                        <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", t.sentiment === 'POSITIVE' ? "bg-primary/20 text-primary" : "bg-anomaly/20 text-anomaly")}>
                            {t.sentiment}
                        </span>
                    </motion.div>
                 ))}
              </div>
           </div>

           <div className="hud-card p-8">
              <div className="terminal-header">
                  <span className="text-micro !text-primary !tracking-[0.4em] font-bold">TOPIC_VOLUME_SALIENCE</span>
              </div>
              <div className="h-[400px] mt-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ISSUE_SALIENCE} layout="vertical" margin={{ left: 40, right: 40 }}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="issue" type="category" stroke="#666" fontSize={10} width={120} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0F0F0F', border: '1px solid #2a2a2a' }} />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {ISSUE_SALIENCE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="hud-card p-8">
              <div className="terminal-header">
                  <span className="text-micro !text-primary !tracking-[0.4em] font-bold">KEYWORD_SENTIMENT_CLUSTERS</span>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                  {SENTIMENT_KEYWORDS.map(kw => (
                    <div key={kw.word} className="p-4 border border-white/5 bg-white/2 hover:border-primary/40 transition-all cursor-default">
                      <div className="text-[10px] font-mono text-on-surface-variant mb-2 uppercase tracking-widest">{kw.word}</div>
                      <div className="flex items-end gap-3">
                          <span className="text-3xl font-huge leading-none">{kw.volume}%</span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded uppercase", 
                            kw.sentiment === 'POSITIVE' ? "bg-primary/20 text-primary" : 
                            kw.sentiment === 'NEGATIVE' ? "bg-anomaly/20 text-anomaly" : "bg-delayed/20 text-delayed"
                          )}>
                            {kw.sentiment}
                          </span>
                      </div>
                    </div>
                  ))}
              </div>
           </div>
        </div>
        
        <div className="space-y-6">
           <div className="hud-card p-6 border-l-4 border-l-anomaly">
              <div className="terminal-header">
                  <span className="text-micro !text-anomaly !tracking-[0.4em] font-bold">MISINFORMATION_ALERTS</span>
              </div>
              <div className="mt-6 space-y-4">
                  <div className="p-4 bg-anomaly/5 border border-anomaly/20">
                    <span className="text-micro !text-anomaly font-bold block mb-1 uppercase tracking-widest">[FACT_CHECK_HUB]</span>
                    <p className="text-xs text-on-surface leading-relaxed font-bold italic">"REPORTS OF BVAS BYPASS IN AKURE VERIFIED AS FALSE."</p>
                    <p className="text-[10px] text-on-surface-variant mt-2">Source: CDD Fact Check • Ver. ID: CV-9921</p>
                  </div>
                  {[1, 2].map(i => (
                    <div key={i} className="p-3 bg-white/5 border border-white/10 text-[10px] font-sans">
                      <div className="text-anomaly font-bold mb-1 uppercase tracking-widest">[FALSE_NARRATIVE_DET]</div>
                      <p className="text-on-surface-variant leading-relaxed">Claims regarding BVAS exclusion in North-East clusters verified as artificial disinformation vector.</p>
                    </div>
                  ))}
              </div>
           </div>

           <div className="hud-card p-6 bg-primary/5 border border-primary/20">
              <h3 className="text-micro text-primary mb-4 uppercase font-bold tracking-[0.2em]">Regional_Sentiment_Bias</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-on-surface-variant">NORTH_WEST</span>
                    <span className="text-primary">62% POSITIVE</span>
                 </div>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[62%]" />
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-on-surface-variant">SOUTH_EAST</span>
                    <span className="text-delayed">88% SKEPTICAL</span>
                 </div>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-delayed w-[88%]" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Page 11: Parallel Vote Tabulation (PVT) Portal ---

export function PVTPortal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [liveBenchmark, setLiveBenchmark] = useState<any>(null);

  useEffect(() => {
    async function loadBenchmark() {
      const data = await fetchIReVData();
      setLiveBenchmark(data);
    }
    loadBenchmark();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl text-huge leading-[0.9] text-on-surface mb-6 glow-accent uppercase"
          >
            PARALLEL_ <br /> 
            <span className="text-primary">TALLY</span>
          </motion.h1>
           <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Citizen-led data verification. Submit and compare polling unit results directly against official transmissions to detect statistical anomalies.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hud-card p-8 border-l-4 border-l-primary">
           <div className="terminal-header mb-8">
              <span className="text-micro !text-primary !tracking-[0.4em] font-bold">AGENT_UPLOAD_INTERFACE</span>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-micro opacity-40">PU_CODE</label>
                    <input type="text" placeholder="24-11-04-032" className="w-full bg-white/5 border border-white/10 p-3 text-xs font-mono text-primary outline-none focus:border-primary/40" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-micro opacity-40">TOTAL_ACCREDITED</label>
                    <input type="number" placeholder="450" className="w-full bg-white/5 border border-white/10 p-3 text-xs font-mono text-primary outline-none focus:border-primary/40" required />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-micro opacity-40">RESULT_IMAGE_HASH (MOCK)</label>
                 <div className="w-full h-32 border-2 border-dashed border-white/10 flex items-center justify-center rounded-lg bg-white/2 hover:bg-white/5 transition-all cursor-pointer">
                    <span className="text-micro opacity-40">DRAG_DROP_FORM_EC8A</span>
                 </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 rounded-xl font-headline text-xs font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                  success ? "bg-reporting text-black" : "bg-primary text-black hover:opacity-90"
                )}
              >
                {isSubmitting ? "TRANSMITTING..." : success ? "UPLOAD_SUCCESSFUL" : "EXECUTE_DATA_COMMIT"}
              </button>
           </form>
        </div>

        <div className="hud-card p-8">
           <div className="terminal-header mb-8">
              <span className="text-micro !text-on-surface-variant !tracking-[0.4em] font-bold">PVT_VS_OFFICIAL_DRIFT</span>
           </div>
           <div className="space-y-8">
              <div className="p-6 bg-white/2 border border-white/5">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-headline font-bold">AGGREGATE_DISCREPANCY</span>
                    <span className="text-micro text-reporting font-bold tracking-widest">+0.042%</span>
                 </div>
                 <div className="flex gap-1 h-3">
                    <div className="flex-1 bg-primary/40 rounded-sm" />
                    <div className="flex-1 bg-primary rounded-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]" />
                    <div className="flex-1 bg-primary/40 rounded-sm" />
                    <div className="flex-1 bg-white/10 rounded-sm" />
                    <div className="flex-1 bg-white/10 rounded-sm" />
                 </div>
                 <p className="mt-4 text-[10px] font-mono text-on-surface-variant leading-relaxed">
                   Current PVT sample (n=12,440) shows high correlation with official IReV benchmarks. No significant systemic deviation detected at the current confidence interval.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border border-white/10">
                    <span className="text-micro opacity-40 block mb-1">VERIFIED_AGENTS</span>
                    <span className="text-2xl text-huge tabular-nums">14,281</span>
                 </div>
                 <div className="p-4 border border-white/10">
                    <span className="text-micro opacity-40 block mb-1">CONFIDENCE</span>
                    <span className="text-2xl text-huge tabular-nums">98.2%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
