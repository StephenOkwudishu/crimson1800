import { Users, TrendingUp, CheckCircle2, Shield, Activity, ChevronRight, Info, Globe, ShieldAlert, ArrowUpRight, AlertTriangle, User, MapPin, BarChart3, History, Map as MapIcon, Clock, CheckCircle, Sliders, Play, Settings } from "lucide-react";
import { motion } from "motion/react";
import * as d3 from "d3";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  PieChart, Pie
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIMELINE_DATES } from "./constants";
import { useEffect, useState, useRef, useLayoutEffect } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Shared Internal Components ---

export function MetricCard({ label, value, sub, trend, icon: Icon, colorClass = "text-primary" }: {
  label: string,
  value: string,
  sub: string,
  trend?: { val: string, up: boolean },
  icon: any,
  colorClass?: string
}) {
  return (
    <div className="hud-card p-6 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-mono tracking-[0.2em] text-on-surface-variant uppercase font-bold">{label}</span>
        <div className={cn("p-2 border border-outline-variant transition-all group-hover:border-primary/50 group-hover:bg-primary/5", colorClass)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-3 mb-2">
        <h3 className="text-4xl font-display font-bold text-on-surface tabular-nums glow-accent leading-none">{value}</h3>
        {trend && (
          <span className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.5 border",
            trend.up ? "border-reporting/30 text-reporting bg-reporting/5" : "border-anomaly/30 text-anomaly bg-anomaly/5"
          )}>
            {trend.up ? '+' : '-'}{trend.val}
          </span>
        )}
      </div>
      <p className="text-[9px] font-mono text-on-surface-variant tracking-[0.1em] uppercase opacity-60">{sub}</p>
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
        <span className="text-[11px] font-mono tracking-[0.4em] text-primary uppercase font-bold mb-2">COMMAND_LOCK: PRESIDENTIAL_ELECTION</span>
        <h2 className="text-xl font-display font-bold tracking-[0.05em] text-on-surface/90">SATURDAY, FEBRUARY 20, 2027</h2>
        <div className="flex items-center gap-2 text-[9px] font-mono text-on-surface-variant uppercase tracking-widest mt-2">
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
            <span className="text-5xl md:text-7xl font-display font-bold text-on-surface glow-accent leading-none">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] text-primary mt-3 font-bold">{unit.label}</span>
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
        <span className={cn("px-2 py-0.5 border text-[8px] font-mono font-bold tracking-[0.2em]", statusStyles[status])}>
          {status}
        </span>
        <ChevronRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function SystemTimeline() {
  return (
    <div className="hud-card overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-outline-variant bg-white/5 flex justify-between items-center">
        <div className="terminal-header mb-0 w-full">
          <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">INTEL_LOG: REVISED_SCHEDULE_2027</span>
        </div>
        <div className="flex items-center gap-3">
           <History size={16} className="text-primary/60" />
           <span className="text-[9px] font-mono text-on-surface-variant font-bold uppercase tracking-widest whitespace-nowrap">Ver_R.4.1</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-primary/20">
        {TIMELINE_DATES.map((item, idx) => (
          <TimelineRow key={idx} item={item} />
        ))}
      </div>
      <div className="p-4 bg-white/5 border-t border-outline-variant">
         <button className="btn-secondary w-full flex items-center justify-center gap-3 text-[9px]">
           <Globe size={14} />
           ACCESS EXTERNAL FEC_NETWORKS
         </button>
      </div>
    </div>
  );
}

// --- Page 1: Dashboard ---

export function Dashboard() {
  return (
    <div className="space-y-12 pb-16">
      {/* Editorial Header Section */}
      <section className="flex flex-col md:flex-row gap-12 items-end">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter text-on-surface mb-6 glow-accent uppercase"
          >
            ELECTION <br /> 
            <span className="text-primary">DASHBOARD</span>
          </motion.h1>
          <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
            Refining the noise of political discourse into a surgically precise narrative. Mission-critical intelligence for the 2027 Nigerian general elections.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <CountdownTimer />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="REGISTERED VOTERS" 
          value="93.5M" 
          sub="SOURCE: INEC CVR (2026)" 
          trend={{ val: "4.2M", up: true }}
          icon={Users}
        />
        <MetricCard 
          label="PVC COLLECTION RATE" 
          value="87.4%" 
          sub="STATUS: VALIDATED DATA" 
          trend={{ val: "2.1%", up: true }}
          icon={CheckCircle2}
          colorClass="text-reporting"
        />
        <MetricCard 
          label="PROJECTED TURNOUT" 
          value="62.3%" 
          sub="CONFIDENCE: MODERATE (MT-2)" 
          icon={TrendingUp}
          colorClass="text-delayed"
        />
        <MetricCard 
          label="SYSTEM INTEGRITY" 
          value="98.4%" 
          sub="VALID SOURCE INDEX (VSI)" 
          icon={Shield}
          colorClass="text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SystemTimeline />
        </div>

        <div className="hud-card p-0 flex flex-col">
          <div className="p-6 border-b border-outline-variant bg-white/5">
            <div className="terminal-header mb-0">
              <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary">POLL_DIGEST_V1.1</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="p-6 bg-surface-container-highest border border-outline-variant mb-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <BarChart3 size={48} />
              </div>
              <h4 className="text-2xl font-display font-bold text-on-surface mb-6 uppercase tracking-tight">INCUMBENT APPROVAL / 42.8%</h4>
              <div className="flex gap-[2px] h-3 bg-surface-container-low mb-3">
                <div className="h-full bg-primary w-[42.8%] shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                <div className="h-full bg-anomaly/30 w-[38.2%]" />
                <div className="h-full bg-white/5 w-[19%]" />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-on-surface-variant font-bold uppercase tracking-widest">
                <span>APPROVE</span>
                <span>DISAPPROVE</span>
                <span>UNDECIDED</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 border border-delayed/30 bg-delayed/5 text-delayed">
                   <Info size={16} />
                </div>
                <div>
                  <h5 className="text-[10px] font-mono font-bold text-delayed uppercase mb-1">INTEL_ALERT</h5>
                  <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">Coalition (ADC) intent tracker shows 8% growth in North-Central corridor. Data validated with secondary sources.</p>
                </div>
              </div>
              
              <div className="p-5 bg-primary/5 border border-primary/20">
                 <div className="flex items-center gap-3 mb-3">
                   <Globe size={16} className="text-primary animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">LIVE_MARKET_SENTIMENT</span>
                 </div>
                 <p className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
                   Polymarket Gamma index predicts "High Competition" in the SW zone following candidate alignment shifts.
                 </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-outline-variant">
               <button className="btn-primary w-full">ACCESS FULL REPUTATION MATRIX</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Page 2: Presidential Forecast ---

const PROBABILITY_DATA = [
  { name: 'Bola Tinubu (APC)', value: 42, color: '#00f0ff' },
  { name: 'ADC Candidate', value: 38, color: '#ffd19d' },
  { name: 'Omoyele Sowore', value: 8, color: '#ffb4ab' },
  { name: 'Others', value: 12, color: '#bbcbb8' },
];

export function PresidentialForecast() {
  return (
    <div className="space-y-12 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 hud-card p-8 flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-[280px] h-[280px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={PROBABILITY_DATA} 
                  innerRadius={100} 
                  outerRadius={125} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {PROBABILITY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[12px] font-mono tracking-[0.3em] text-on-surface-variant uppercase mb-2">MODE: ACTIVE</span>
              <span className="text-5xl font-display font-bold text-on-surface glow-accent leading-none">42.0</span>
              <span className="text-[10px] font-mono text-primary mt-1 font-bold">LEAD_SIGNA_HI</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-8">
            <div className="terminal-header">
              <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary italic uppercase">PROBABILITY_BAND_INTEL</span>
            </div>
            <div className="space-y-6">
              {PROBABILITY_DATA.map((candidate) => (
                <div key={candidate.name} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold">
                    <span className="text-on-surface uppercase tracking-wider">{candidate.name}</span>
                    <span className="text-primary tabular-nums">{candidate.value}.0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
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

        <div className="hud-card p-8 border-l-4 border-l-delayed bg-surface-container/30">
          <div className="terminal-header">
             <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-delayed uppercase">METHOD_LOG_V2.1.X</span>
          </div>
          <div className="space-y-6 mt-6">
            <div className="flex items-start gap-5">
              <div className="p-3 border border-delayed/30 bg-delayed/5 text-delayed">
                <BarChart3 size={18} />
              </div>
              <p className="text-[12px] text-on-surface-variant leading-relaxed font-sans">
                Model: Bayesian Hierarchical combining Afrobarometer (R10), World Bank Economic Sentiment, and Historical Partisan Lean.
              </p>
            </div>
            <div className="p-6 bg-surface-container-highest border border-outline-variant text-[11px] font-mono leading-relaxed">
              <span className="text-primary block mb-3 font-bold tracking-[0.2em]">[!] DATA_NOISE: ELEVATED</span>
              Candidate preferences as of April 2026 are highly volatile. Model weights rely on "Issue Salience" as primary driver.
            </div>
          </div>
        </div>
      </div>

      <div className="hud-card overflow-hidden">
        <div className="p-8 border-b border-outline-variant flex justify-between items-end bg-surface-container-low/40">
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
          <table className="w-full text-left font-mono">
            <thead className="text-[10px] text-primary tracking-[0.3em] font-bold border-b border-outline-variant bg-surface-container-low/20">
              <tr>
                <th className="px-8 py-6 uppercase">REGION_STATE_ID</th>
                <th className="px-8 py-6 uppercase">TINUBU(APC)</th>
                <th className="px-8 py-6 uppercase">COALITION(ADC)</th>
                <th className="px-8 py-6 uppercase">2023_SWING</th>
                <th className="px-8 py-6 uppercase text-right">CON_GRADE</th>
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
  { state: 'LAGOS', incumbent: 'Sanwo-Olu', party: 'APC', status: 'TERM-LIMITED' },
  { state: 'KANO', incumbent: 'Yusuf', party: 'NNPP', status: 'ELIGIBLE' },
  { state: 'RIVERS', incumbent: 'Fubara', party: 'PDP', status: 'ELIGIBLE' },
  { state: 'KADUNA', incumbent: 'Sani', party: 'APC', status: 'ELIGIBLE' },
  { state: 'ANAMBRA', incumbent: 'Soludo', party: 'APGA', status: 'TERM-LIMITED' },
  { state: 'OYO', incumbent: 'Makinde', party: 'PDP', status: 'TERM-LIMITED' },
  { state: 'EDO', incumbent: 'Okpebholo', party: 'APC', status: 'ELIGIBLE' },
  { state: 'BENUE', incumbent: 'Alia', party: 'APC', status: 'ELIGIBLE' },
];

export function GovernorshipTracker() {
  return (
    <div className="space-y-12 pb-16">
       <section className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter text-on-surface mb-6 glow-accent"
          >
            STATE_LEVEL <br /> 
            <span className="text-delayed">POWER_MAP</span>
          </motion.h1>
          <p className="text-sm font-sans text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-delayed/30 pl-6">
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
        <div className="p-8 border-b border-outline-variant bg-surface-container-low/40">
           <div className="terminal-header mb-0">
              <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">EXECUTIVE_STATUS_MATRIX_V1</span>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-outline-variant/10">
          {GOVERNOR_STATES.map((g) => (
            <div key={g.state} className="p-8 border-r border-b border-outline-variant/20 hover:bg-white/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <span className="text-2xl font-display font-bold text-on-surface tracking-tighter">{g.state}</span>
                <div className={cn("px-2 py-0.5 text-[9px] font-mono font-bold uppercase border", 
                  g.party === 'APC' ? "border-primary/40 text-primary" : 
                  g.party === 'PDP' ? "border-delayed/40 text-delayed" : "border-on-surface-variant")}>
                  {g.party}
                </div>
              </div>
              <div className="space-y-2 relative z-10 mb-8">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest opacity-60">INCUMBENT_ID</span>
                <p className="text-lg font-sans font-bold text-on-surface">{g.incumbent}</p>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className={cn("text-[10px] font-mono font-bold px-2 py-1 tracking-widest uppercase", 
                  g.status === 'TERM-LIMITED' ? "text-delayed bg-delayed/10" : "text-reporting bg-reporting/10"
                )}>{g.status}</span>
                <ArrowUpRight size={18} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Page 4: Interactive Maps ---

export function InteractiveMaps() {
  return (
    <div className="space-y-12 pb-16">
      <div className="hud-card p-12 min-h-[700px] flex flex-col relative overflow-hidden">
        {/* Background circuit pattern suggestion */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>

        <div className="terminal-header border-none mb-12">
           <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">GEOSPATIAL_INTEL: REALVOTE_OVERLAY</span>
        </div>
        
        <div className="flex-1 border border-outline-variant bg-surface-container-low/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden group rounded-lg">
           <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none p-40">
              <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 4" />
                <path d="M20,30 L40,25 L60,35 L80,30 L85,50 L70,75 L40,85 L20,70 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                <motion.circle 
                  animate={{ r: [2, 5, 2], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  cx="45" cy="40" r="2" fill="currentColor" 
                />
              </svg>
           </div>
           
           <div className="flex flex-col items-center gap-8 text-center z-10 px-6 max-w-md">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border border-primary/20 bg-primary/5 rounded-full flex items-center justify-center relative"
              >
                <div className="absolute inset-2 border border-primary/40 rounded-full animate-pulse" />
                <MapIcon size={40} className="text-primary glow-accent" />
              </motion.div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold text-on-surface tracking-tighter uppercase">MAP_CORE_INITIALIZING</h3>
                <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-[0.3em] leading-relaxed">AUTHENTICATING_NODES: OK<br />BUFFERING_GEO_ASSETS: 89%</p>
              </div>
              <button className="btn-primary">FORCE_SYNC_GEODATA</button>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Page 5: Historical Data ---

const TURNOUT_HISTORY = [
  { year: '1999', turnout: 52.3 },
  { year: '2003', turnout: 69.1 },
  { year: '2007', turnout: 57.5 },
  { year: '2011', turnout: 53.7 },
  { year: '2015', turnout: 43.7 },
  { year: '2019', turnout: 34.8 },
  { year: '2023', turnout: 28.6 },
];

export function HistoricalData() {
  return (
    <div className="space-y-12 pb-16">
      <div className="hud-card p-12">
        <div className="terminal-header border-none mb-12">
          <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">CHRONOS_INTEL: TURNOUT_EROSION_INDEX (1999-2023)</span>
        </div>
        <div className="h-[500px] mt-12 group">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TURNOUT_HISTORY}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="#bbcbb8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={20}
                style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
              />
              <YAxis 
                stroke="#bbcbb8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}%`} 
                style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(11, 19, 38, 0.95)', 
                  border: '1px solid rgba(0, 240, 255, 0.2)', 
                  borderRadius: '4px',
                  color: '#f8f9fa',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '10px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="turnout" 
                stroke="#00f0ff" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#00f0ff', stroke: '#0b1326', strokeWidth: 2 }} 
                activeDot={{ r: 8, fill: '#00f0ff', stroke: '#ffffff', strokeWidth: 2 }}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-12 p-8 bg-surface-container-highest border border-outline-variant flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="space-y-2 max-w-lg">
              <h4 className="text-xl font-display font-bold text-on-surface uppercase tracking-tight">System Observation</h4>
              <p className="text-[12px] font-sans text-on-surface-variant leading-relaxed opacity-80">
                Data shows a deterministic correlation between institutional trust erosion and primary turnout metrics. The 2015-2023 shift represents the most significant volatility in the sub-national cycle.
              </p>
           </div>
           <button className="btn-secondary">DOWNLOAD_RAW_DATASET_CSV</button>
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
  return (
    <div className="space-y-12 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard label="ACLED_INCIDENTS_24H" value="14" sub="7_VERIFIED | 7_PENDING" icon={ShieldAlert} colorClass="text-anomaly" />
        <MetricCard label="HOTSPOT_THREAT_LVL" value="7.2" sub="SIGINT_SCALE: 1-10" icon={Activity} colorClass="text-delayed" />
      </div>
      
      <div className="hud-card p-0 overflow-hidden text-sm">
        <div className="p-8 border-b border-outline-variant items-center flex justify-between bg-surface-container-low/40">
           <span className="text-primary font-mono font-bold tracking-[0.4em] uppercase text-xs">ACLED_FEED_STREAMING_LOG</span>
           <div className="flex items-center gap-2 text-reporting text-[9px] font-mono font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-reporting animate-pulse" />
              LIVE_STREAMING
           </div>
        </div>
        <div className="divide-y divide-outline-variant/30">
          {SECURITY_EVENTS.map(ev => (
            <div key={ev.id} className="p-8 flex justify-between items-center hover:bg-white/5 transition-all">
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
            </div>
          ))}
        </div>
        <div className="p-4 bg-anomaly/5 border-t border-anomaly/20 text-center">
            <span className="text-[9px] font-mono font-bold text-anomaly uppercase tracking-[0.4em]">CAUTION: DATA SUBJECT TO SIGINT VERIFICATION</span>
        </div>
      </div>
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

  }, []);

  return (
    <div className="space-y-12 pb-16">
      <div className="hud-card p-0 border-l-4 border-l-primary overflow-hidden">
        <div className="p-8 border-b border-outline-variant bg-surface-container-low/40">
           <div className="terminal-header mb-0">
              <span className="text-[11px] font-mono tracking-[0.4em] font-bold text-primary uppercase">VISUAL_LAB: DYNAMIC_SYNTHESIS_ENGINE</span>
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

          {/* HUD Instrumentation */}
          <div className="absolute inset-0 z-20 pointer-events-none">
             <div className="absolute top-8 left-8 p-4 border border-primary/20 bg-black/40 backdrop-blur-md">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">X_COORD_INTEL</span>
                <div className="mt-2 text-2xl font-display font-bold text-on-surface">329.01</div>
             </div>
             <div className="absolute bottom-8 right-8 p-4 border border-primary/20 bg-black/40 backdrop-blur-md">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">SIG_FREQUENCY</span>
                <div className="mt-2 text-2xl font-display font-bold text-on-surface tabular-nums">{(1/speed).toFixed(2)}_HZ</div>
             </div>
          </div>
        </div>

        <div className="p-12 border-t border-outline-variant">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">MIN_ALPHA</span>
                  <span className="text-[10px] font-mono font-bold text-primary">{(minOpacity * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={minOpacity} onChange={(e) => setMinOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">MAX_ALPHA</span>
                  <span className="text-[10px] font-mono font-bold text-primary">{(maxOpacity * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={maxOpacity} onChange={(e) => setMaxOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">OSC_PERIOD</span>
                  <span className="text-[10px] font-mono font-bold text-primary">{speed}s</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
