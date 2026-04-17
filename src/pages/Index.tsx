import React, { useState, useMemo, useEffect, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, LineChart, Line } from "recharts";
import { toast } from "sonner";
import DiasporaGlobe from "@/components/DiasporaGlobe";

/* ============================================================
   2027 NIGERIAN ELECTIONS — Sovereign Lens Terminal
   Tabbed: MARKETS · SENTIMENT · PRECEDENT
   Real INEC schedule (Electoral Act 2026 revision)
   Real declared/probable candidates
   Light + Dark theme system
   ============================================================ */

// ============================================================
// THEME SYSTEM
// ============================================================
const THEMES = {
  dark: {
    bg: "#050505",
    surface: "rgba(255,255,255,0.025)",
    surfaceSolid: "#0F0F0F",
    border: "rgba(255,255,255,0.06)",
    borderStrong: "rgba(255,255,255,0.12)",
    text: "#F2F2F2",
    textMuted: "rgba(255,255,255,0.55)",
    textFaint: "rgba(255,255,255,0.35)",
    primary: "#26D967",
    secondary: "#6726D9",
    accent: "#D96726",
    cyan: "#26C9D9",
    haze: "radial-gradient(circle at 0% 0%, rgba(38,217,103,0.06) 0%, transparent 40%), radial-gradient(circle at 100% 0%, rgba(103,38,217,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 100%, rgba(217,103,38,0.05) 0%, transparent 40%), #050505",
    grid: "rgba(255,255,255,0.025)",
    chip: "rgba(255,255,255,0.04)",
  },
  light: {
    bg: "#F7F7F5",
    surface: "rgba(255,255,255,0.7)",
    surfaceSolid: "#FFFFFF",
    border: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.16)",
    text: "#0A0A0A",
    textMuted: "rgba(10,10,10,0.65)",
    textFaint: "rgba(10,10,10,0.42)",
    primary: "#0E9F4A",
    secondary: "#5018B5",
    accent: "#C24E12",
    cyan: "#0E8FA0",
    haze: "radial-gradient(circle at 0% 0%, rgba(14,159,74,0.07) 0%, transparent 40%), radial-gradient(circle at 100% 0%, rgba(80,24,181,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 100%, rgba(194,78,18,0.05) 0%, transparent 40%), #F7F7F5",
    grid: "rgba(0,0,0,0.05)",
    chip: "rgba(0,0,0,0.04)",
  },
};

// ============================================================
// 1. STATIC GEO DATA (baked in — APIs in your repos are offline)
// ============================================================
const ZONES = {
  NW: { label: "North West", states: ["Kaduna","Kano","Katsina","Kebbi","Sokoto","Zamfara","Jigawa"] },
  NE: { label: "North East", states: ["Adamawa","Bauchi","Borno","Gombe","Taraba","Yobe"] },
  NC: { label: "North Central", states: ["Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT"] },
  SW: { label: "South West", states: ["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"] },
  SE: { label: "South East", states: ["Abia","Anambra","Ebonyi","Enugu","Imo"] },
  SS: { label: "South South", states: ["Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers"] },
};

// Off-cycle states — no governorship in Feb 2027
const OFF_CYCLE_GOV = new Set(["Anambra","Bayelsa","Edo","Ekiti","Imo","Kogi","Ondo","Osun"]);

const STATES = [
  { name:"Abia", capital:"Umuahia", lat:5.5320, lng:7.4860, zone:"SE", reg: 2114014, lgas: 17 },
  { name:"Adamawa", capital:"Yola", lat:9.3265, lng:12.3984, zone:"NE", reg: 2196566, lgas: 21 },
  { name:"Akwa Ibom", capital:"Uyo", lat:5.0376, lng:7.9128, zone:"SS", reg: 2359685, lgas: 31 },
  { name:"Anambra", capital:"Awka", lat:6.2105, lng:7.0680, zone:"SE", reg: 2655106, lgas: 21 },
  { name:"Bauchi", capital:"Bauchi", lat:10.3158, lng:9.8442, zone:"NE", reg: 2749268, lgas: 20 },
  { name:"Bayelsa", capital:"Yenagoa", lat:4.9267, lng:6.2676, zone:"SS", reg: 1056862, lgas: 8 },
  { name:"Benue", capital:"Makurdi", lat:7.7322, lng:8.5391, zone:"NC", reg: 2777727, lgas: 23 },
  { name:"Borno", capital:"Maiduguri", lat:11.8463, lng:13.1527, zone:"NE", reg: 2515351, lgas: 27 },
  { name:"Cross River", capital:"Calabar", lat:4.9588, lng:8.3269, zone:"SS", reg: 1766466, lgas: 18 },
  { name:"Delta", capital:"Asaba", lat:6.1907, lng:6.7305, zone:"SS", reg: 3221697, lgas: 25 },
  { name:"Ebonyi", capital:"Abakaliki", lat:6.3248, lng:8.1137, zone:"SE", reg: 1597646, lgas: 13 },
  { name:"Edo", capital:"Benin City", lat:6.3409, lng:5.6175, zone:"SS", reg: 2501081, lgas: 18 },
  { name:"Ekiti", capital:"Ado Ekiti", lat:7.6212, lng:5.2210, zone:"SW", reg: 987647, lgas: 16 },
  { name:"Enugu", capital:"Enugu", lat:6.5244, lng:7.5102, zone:"SE", reg: 1944016, lgas: 17 },
  { name:"FCT", capital:"Abuja", lat:9.0765, lng:7.3986, zone:"NC", reg: 1570307, lgas: 6 },
  { name:"Gombe", capital:"Gombe", lat:10.2904, lng:11.1731, zone:"NE", reg: 1761642, lgas: 11 },
  { name:"Imo", capital:"Owerri", lat:5.4527, lng:7.0254, zone:"SE", reg: 2419922, lgas: 27 },
  { name:"Jigawa", capital:"Dutse", lat:11.7565, lng:9.3393, zone:"NW", reg: 2351298, lgas: 27 },
  { name:"Kaduna", capital:"Kaduna", lat:10.5222, lng:7.4383, zone:"NW", reg: 4335208, lgas: 23 },
  { name:"Kano", capital:"Kano", lat:11.9914, lng:8.5317, zone:"NW", reg: 5921370, lgas: 44 },
  { name:"Katsina", capital:"Katsina", lat:12.9908, lng:7.6018, zone:"NW", reg: 3516719, lgas: 34 },
  { name:"Kebbi", capital:"Birnin Kebbi", lat:12.4500, lng:4.1990, zone:"NW", reg: 1893359, lgas: 21 },
  { name:"Kogi", capital:"Lokoja", lat:7.7969, lng:6.7400, zone:"NC", reg: 1932654, lgas: 21 },
  { name:"Kwara", capital:"Ilorin", lat:8.4799, lng:4.5418, zone:"NC", reg: 1695927, lgas: 16 },
  { name:"Lagos", capital:"Ikeja", lat:6.5269, lng:3.5774, zone:"SW", reg: 7060195, lgas: 20 },
  { name:"Nasarawa", capital:"Lafia", lat:8.4923, lng:8.5152, zone:"NC", reg: 1899584, lgas: 13 },
  { name:"Niger", capital:"Minna", lat:9.6177, lng:6.5569, zone:"NC", reg: 2698344, lgas: 25 },
  { name:"Ogun", capital:"Abeokuta", lat:7.1557, lng:3.3450, zone:"SW", reg: 2688305, lgas: 20 },
  { name:"Ondo", capital:"Akure", lat:7.2526, lng:5.1931, zone:"SW", reg: 1832231, lgas: 18 },
  { name:"Osun", capital:"Osogbo", lat:7.7715, lng:4.5560, zone:"SW", reg: 1953028, lgas: 30 },
  { name:"Oyo", capital:"Ibadan", lat:7.3775, lng:3.9470, zone:"SW", reg: 3276675, lgas: 33 },
  { name:"Plateau", capital:"Jos", lat:9.8965, lng:8.8583, zone:"NC", reg: 2598313, lgas: 17 },
  { name:"Rivers", capital:"Port Harcourt", lat:4.8156, lng:7.0498, zone:"SS", reg: 3537190, lgas: 23 },
  { name:"Sokoto", capital:"Sokoto", lat:13.0059, lng:5.2476, zone:"NW", reg: 2172056, lgas: 23 },
  { name:"Taraba", capital:"Jalingo", lat:8.8932, lng:11.3596, zone:"NE", reg: 1777105, lgas: 16 },
  { name:"Yobe", capital:"Damaturu", lat:11.7479, lng:11.9608, zone:"NE", reg: 1485146, lgas: 17 },
  { name:"Zamfara", capital:"Gusau", lat:12.1700, lng:6.6641, zone:"NW", reg: 1934109, lgas: 14 },
];

// ============================================================
// 2. CANDIDATES (real, declared / strongly probable for 2027)
// ============================================================
const PRESIDENTIAL = [
  { id:"tinubu", name:"Bola A. Tinubu", party:"APC", color:"#26D967", initials:"BT",
    role:"Incumbent · 16th President", base:"Lagos · SW", age:74,
    note:"Seeking second term. Declared. Christian VP rumoured." },
  { id:"atiku", name:"Atiku Abubakar", party:"ADC*", color:"#26C9D9", initials:"AA",
    role:"Former Vice President", base:"Adamawa · NE", age:79,
    note:"Joined ADC coalition (Jul 2025) with Obi, Mark, Aregbesola." },
  { id:"obi", name:"Peter Obi", party:"ADC*", color:"#D9A526", initials:"PO",
    role:"Former Anambra Governor", base:"Anambra · SE", age:64,
    note:"Joined ADC coalition. Likely VP or shared ticket." },
  { id:"kwankwaso", name:"R. Kwankwaso", party:"NNPP", color:"#6726D9", initials:"RK",
    role:"Former Kano Governor", base:"Kano · NW", age:69,
    note:"Strong Kano stronghold. Coalition talks ongoing." },
  { id:"sowore", name:"Omoyele Sowore", party:"AAC", color:"#F09EA0", initials:"OS",
    role:"Activist · Sahara Reporters", base:"Ondo · SW", age:54,
    note:"Third presidential bid. Youth-aligned." },
  { id:"amaechi", name:"Rotimi Amaechi", party:"ADC", color:"#D96726", initials:"RA",
    role:"Former Transport Minister", base:"Rivers · SS", age:60,
    note:"Declared. Competing for ADC ticket vs Atiku/Obi." },
  { id:"almustapha", name:"Hamza Al-Mustapha", party:"SDP", color:"#A0A0A0", initials:"HA",
    role:"Fmr Chief Security Officer", base:"Katsina · NW", age:65,
    note:"Declared SDP candidacy. National appeal limited." },
];

// Governorship — major contested 2027 races (illustrative / declared aspirants)
const GOVERNORSHIP = [
  { state:"Kano", candidates:[
    { name:"Abba Kabir Yusuf", party:"NNPP", color:"#6726D9", role:"Incumbent · Re-election" },
    { name:"Nasiru Y. Gawuna", party:"APC", color:"#26D967", role:"2023 runner-up · Likely 2027" },
    { name:"S. Lamido Sanusi", party:"PDP", color:"#26C9D9", role:"Speculative" },
  ]},
  { state:"Lagos", candidates:[
    { name:"Babajide Sanwo-Olu", party:"APC", color:"#26D967", role:"Incumbent · 2nd term ineligible" },
    { name:"Gboyega Soyannwo", party:"APC", color:"#26D967", role:"APC primary frontrunner" },
    { name:"Jandor (Olajide A.)", party:"PDP", color:"#26C9D9", role:"2023 candidate · Returning" },
    { name:"Gbadebo Rhodes-Vivour", party:"LP", color:"#D9A526", role:"2023 LP candidate · Strong urban base" },
  ]},
  { state:"Rivers", candidates:[
    { name:"Sim Fubara", party:"PDP", color:"#26C9D9", role:"Incumbent · Reinstated post-emergency" },
    { name:"Tonye Cole", party:"APC", color:"#26D967", role:"Returning APC contender" },
    { name:"Magnus Abe", party:"SDP", color:"#A0A0A0", role:"Veteran Rivers politician" },
  ]},
  { state:"Kaduna", candidates:[
    { name:"Uba Sani", party:"APC", color:"#26D967", role:"Incumbent · Re-election bid" },
    { name:"Isa Ashiru", party:"PDP", color:"#26C9D9", role:"2023 candidate · Returning" },
  ]},
  { state:"Plateau", candidates:[
    { name:"Caleb Mutfwang", party:"PDP", color:"#26C9D9", role:"Incumbent · Re-election" },
    { name:"Nentawe Yilwatda", party:"APC", color:"#26D967", role:"APC ministerial appointee" },
  ]},
  { state:"Borno", candidates:[
    { name:"Babagana Zulum", party:"APC", color:"#26D967", role:"Incumbent · 2nd term ineligible" },
    { name:"APC primary TBD", party:"APC", color:"#26D967", role:"Successor to be selected" },
  ]},
  { state:"Oyo", candidates:[
    { name:"Seyi Makinde", party:"PDP", color:"#26C9D9", role:"Incumbent · 2nd term ineligible" },
    { name:"PDP primary TBD", party:"PDP", color:"#26C9D9", role:"Likely Makinde-aligned" },
    { name:"Teslim Folarin", party:"APC", color:"#26D967", role:"Senator · 2023 candidate" },
  ]},
  { state:"Delta", candidates:[
    { name:"Sheriff Oborevwori", party:"APC", color:"#26D967", role:"Incumbent (defected from PDP)" },
    { name:"PDP primary TBD", party:"PDP", color:"#26C9D9", role:"Post-defection rebuild" },
  ]},
];

// ============================================================
// 3. INEC OFFICIAL TIMELINE (Electoral Act 2026 revision)
// ============================================================
const INEC_TIMELINE = [
  { stage:"VOTER REG.", date:"2026-04-01", desc:"CVR opens nationwide" },
  { stage:"PRIMARIES",  date:"2026-04-23", desc:"Party primaries window opens" },
  { stage:"NOMINATIONS", date:"2026-07-11", desc:"Submission of candidate forms" },
  { stage:"CAMPAIGNS",  date:"2026-11-18", desc:"Presidential campaign begins" },
  { stage:"PRES. POLL",  date:"2027-01-16", desc:"Presidential & NASS election" },
  { stage:"GOV. POLL",   date:"2027-02-06", desc:"Governorship & State Assembly" },
];

// Live Nigerian time (Africa/Lagos = UTC+1, no DST)
const nowInLagos = () => {
  const s = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
  return new Date(s);
};
const dayDiff = (target) => {
  const now = nowInLagos();
  return Math.round((new Date(target).getTime() - now.getTime()) / (1000*60*60*24));
};
// Resolve stage status against live WAT date
const stageStatus = (idx) => {
  const today = nowInLagos();
  const start = new Date(INEC_TIMELINE[idx].date);
  const next = INEC_TIMELINE[idx + 1] ? new Date(INEC_TIMELINE[idx + 1].date) : null;
  if (today < start) return "PENDING";
  if (!next || today < next) return "ACTIVE";
  return "DONE";
};
// Backward-compat: keep TODAY pointing at live Lagos date
const TODAY = nowInLagos();

// ============================================================
// 4. FORECAST MODEL
// ============================================================
const seedFor = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

const forecastForState = (state) => {
  const r = rng(seedFor(state.name + "v4"));
  let apc, pdp, lp;
  switch (state.zone) {
    case "NW": apc = 38 + r()*22; pdp = 30 + r()*15; lp = 8 + r()*8; break;
    case "NE": apc = 42 + r()*18; pdp = 28 + r()*14; lp = 6 + r()*7; break;
    case "NC": apc = 32 + r()*14; pdp = 26 + r()*12; lp = 18 + r()*12; break;
    case "SW": apc = 40 + r()*18; pdp = 18 + r()*10; lp = 22 + r()*14; break;
    case "SE": apc = 8 + r()*7;  pdp = 14 + r()*8;  lp = 58 + r()*18; break;
    case "SS": apc = 20 + r()*10; pdp = 38 + r()*16; lp = 26 + r()*12; break;
    default:   apc = 30; pdp = 30; lp = 25;
  }
  const oth = Math.max(2, 100 - apc - pdp - lp);
  const t = apc+pdp+lp+oth;
  return {
    APC:+(apc/t*100).toFixed(1), PDP:+(pdp/t*100).toFixed(1),
    LP:+(lp/t*100).toFixed(1), OTH:+(oth/t*100).toFixed(1),
    confidence:+(60+r()*30).toFixed(0), turnout:+(28+r()*22).toFixed(1),
  };
};

const STATE_DATA = STATES.map(s => ({ ...s, forecast: forecastForState(s) }));

const winnerOf = (f) => Object.entries({APC:f.APC, PDP:f.PDP, LP:f.LP}).sort((a,b)=>b[1]-a[1])[0];

const PARTY_COLORS = { APC:"#26D967", PDP:"#26C9D9", LP:"#D9A526", NNPP:"#6726D9", OTH:"rgba(180,180,180,0.5)" };

// National roll-up (voter-weighted)
const NATIONAL = (() => {
  let APC=0,PDP=0,LP=0,OTH=0,W=0;
  STATE_DATA.forEach(s => { const w=s.reg; APC+=s.forecast.APC*w; PDP+=s.forecast.PDP*w; LP+=s.forecast.LP*w; OTH+=s.forecast.OTH*w; W+=w; });
  return { APC:+(APC/W).toFixed(1), PDP:+(PDP/W).toFixed(1), LP:+(LP/W).toFixed(1), OTH:+(OTH/W).toFixed(1), reg:W };
})();

// Synthetic LGAs / wards (deterministic)
const buildLGAs = (state) => {
  const r = rng(seedFor(state.name + "lga"));
  return Array.from({length: state.lgas}, (_, i) => {
    const drift = () => (r() - 0.5) * 14;
    const apc = Math.max(2, state.forecast.APC + drift());
    const pdp = Math.max(2, state.forecast.PDP + drift());
    const lp  = Math.max(2, state.forecast.LP  + drift());
    const oth = Math.max(1, state.forecast.OTH + drift()*0.4);
    const t = apc+pdp+lp+oth;
    return {
      name: i === 0 ? `${state.capital} Central` : `${state.name} LGA ${i+1}`,
      APC:+(apc/t*100).toFixed(1), PDP:+(pdp/t*100).toFixed(1),
      LP:+(lp/t*100).toFixed(1), OTH:+(oth/t*100).toFixed(1),
      wards: 8 + Math.floor(r()*10),
      reg: Math.floor(state.reg / state.lgas * (0.7 + r()*0.6)),
    };
  });
};

const buildWards = (state, lga) => {
  const r = rng(seedFor(state.name + lga.name + "w"));
  return Array.from({length: lga.wards}, (_, i) => {
    const drift = () => (r() - 0.5) * 18;
    const apc = Math.max(1, lga.APC + drift());
    const pdp = Math.max(1, lga.PDP + drift());
    const lp  = Math.max(1, lga.LP  + drift());
    const oth = Math.max(1, lga.OTH + drift()*0.3);
    const t = apc+pdp+lp+oth;
    return {
      name: `Ward ${String.fromCharCode(65+i)}`,
      APC:+(apc/t*100).toFixed(1), PDP:+(pdp/t*100).toFixed(1),
      LP:+(lp/t*100).toFixed(1), OTH:+(oth/t*100).toFixed(1),
      reg: Math.floor(lga.reg / lga.wards * (0.6 + r()*0.8)),
    };
  });
};

// Volatility series
const VOL = (() => {
  const r = rng(424242); const days = 90;
  let apc=41, pdp=30, lp=23; const out = [];
  for (let i = 0; i < days; i++) {
    apc += (r()-0.5)*1.4; pdp += (r()-0.5)*1.2; lp += (r()-0.5)*1.6;
    apc = Math.max(36, Math.min(48, apc));
    pdp = Math.max(26, Math.min(36, pdp));
    lp  = Math.max(18, Math.min(30, lp));
    const t = apc+pdp+lp; const sc = 95.5/t;
    out.push({ day:i, label:`D-${days-i}`, APC:+(apc*sc).toFixed(1), PDP:+(pdp*sc).toFixed(1), LP:+(lp*sc).toFixed(1) });
  }
  return out;
})();

const FEED = [
  { tag:"SIGNAL", region:"Kano State", t:"14:22", color:"primary", msg:"Surge in youth registrations across Central Kano. Kwankwaso primary turnout exceeds 2023 baseline by 18%." },
  { tag:"COALITION", region:"ADC Front", t:"13:58", color:"cyan", msg:"Atiku-Obi joint declaration framework finalised. ADC primary calendar set for May 14-22." },
  { tag:"INEC", region:"Logistics", t:"13:45", color:"accent", msg:"BVAS distribution to geopolitical hubs confirmed 85% complete nationwide. NE lagging at 72%." },
  { tag:"SIGNAL", region:"South East", t:"13:12", color:"primary", msg:"LP grassroots organising in Anambra wards shows 92% confidence band — highest of any cluster nationally." },
  { tag:"MARKET", region:"Lagos", t:"12:48", color:"secondary", msg:"Lagos bellwether contract repriced: APC 44.1 (-0.3), LP 28.9 (+0.6). Liquidity depth: ₦1.2B." },
  { tag:"INEC", region:"Voter Reg.", t:"12:21", color:"accent", msg:"Total registered: 94.2M. 38% under-35. CVC collection at 71%. CVR window closes Jan 2027." },
  { tag:"DEFECTION", region:"Delta", t:"11:55", color:"primary", msg:"Governor Oborevwori (PDP→APC) defection ripples: 4 House members follow. PDP base recalibrating." },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Index() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("MARKETS");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const t = THEMES[theme];

  return (
    <div style={{ minHeight:"100vh", background:t.haze, color:t.text, fontFamily:"'Manrope', sans-serif", WebkitFontSmoothing:"antialiased", transition:"background 0.4s, color 0.4s" }}>
      <Style theme={t} />
      <TopNav theme={t} themeName={theme} setTheme={setTheme} tab={tab} setTab={setTab} />

      <main style={{ paddingTop: 88, paddingBottom: 56, paddingLeft: 32, paddingRight: 32, maxWidth: 1480, margin:"0 auto" }}>
        <div key={tab} className="feed-in">
          {tab === "MARKETS"   && <MarketsView theme={t} tick={tick} />}
          {tab === "SENTIMENT" && <SentimentView theme={t} tick={tick} />}
          {tab === "PRECEDENT" && <PrecedentView theme={t} />}
        </div>
        <Footer theme={t} />
      </main>
      <DiasporaGlobe theme={t} />
    </div>
  );
}

// ============================================================
// STYLE
// ============================================================
const Style = ({theme}) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; }
    .glass { background: ${theme.surface}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ${theme.border}; transition: background 0.3s, border-color 0.3s; }
    .premium-shadow { box-shadow: 0 10px 40px -10px rgba(0,0,0,${theme.bg === "#050505" ? 0.6 : 0.08}); }
    .nav-blur { background: ${theme.bg === "#050505" ? "rgba(5,5,5,0.72)" : "rgba(247,247,245,0.78)"}; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .head { font-family: 'Inter', sans-serif; }
    .pulse-dot { width:6px; height:6px; border-radius:50%; background:${theme.primary}; box-shadow:0 0 0 0 ${theme.primary}99; animation: pulse 1.6s infinite; }
    @keyframes pulse { 0%{box-shadow:0 0 0 0 ${theme.primary}99;} 70%{box-shadow:0 0 0 10px ${theme.primary}00;} 100%{box-shadow:0 0 0 0 ${theme.primary}00;} }
    @keyframes mapPing { 0%{r:6; opacity:0.6;} 100%{r:18; opacity:0;} }
    @keyframes feedIn { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }
    .feed-in { animation: feedIn 0.4s ease-out; }
    button { font-family: inherit; }
    button.btn { transition: all 0.15s ease; cursor: pointer; }
    button.btn:hover { transform: translateY(-1px); }
    .clickable:hover { background: ${theme.bg === "#050505" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}; }
    ::selection { background:${theme.primary}; color:#000; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.borderStrong}; border-radius: 3px; }
    .recharts-default-tooltip { background: ${theme.surfaceSolid} !important; border: 1px solid ${theme.borderStrong} !important; border-radius: 8px !important; color: ${theme.text} !important; }
    .recharts-tooltip-label { color: ${theme.text} !important; }
    .recharts-tooltip-item { color: ${theme.text} !important; }
  `}</style>
);

// ============================================================
// TOP NAV with tabs and theme toggle
// ============================================================
const TopNav = ({theme, themeName, setTheme, tab, setTab}) => (
  <header className="nav-blur" style={{
    position:"fixed", top:0, width:"100%", zIndex:50,
    borderBottom:`1px solid ${theme.border}`,
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"0 32px", height:64
  }}>
    <div style={{display:"flex", alignItems:"center", gap:48}}>
      <div className="head" style={{fontSize:18, fontWeight:800, letterSpacing:"-0.02em", display:"flex", alignItems:"center", gap:8}}>
        <span style={{display:"inline-block", width:8, height:8, background:theme.primary, borderRadius:1}}/>
        <span>SOVEREIGN<span style={{color:theme.primary}}>LENS</span></span>
        <span style={{fontSize:9, color:theme.textFaint, marginLeft:8, fontFamily:"'JetBrains Mono', monospace", letterSpacing:"0.15em"}}>v4.2 / NG</span>
      </div>
      <nav style={{display:"flex", alignItems:"center", gap:4}}>
        {["MARKETS","SENTIMENT","PRECEDENT"].map(l => (
          <button key={l} onClick={()=>setTab(l)} className="btn"
            style={{
              padding:"8px 16px", border:"none", background:"transparent",
              color: tab===l ? theme.text : theme.textMuted,
              fontSize:11, fontWeight:700, letterSpacing:"0.15em",
              fontFamily:"'JetBrains Mono', monospace",
              borderBottom: tab===l ? `2px solid ${theme.primary}` : "2px solid transparent",
              borderRadius:0,
              paddingBottom: tab===l ? 6 : 8
            }}>{l}</button>
        ))}
      </nav>
    </div>
    <div style={{display:"flex", alignItems:"center", gap:16}}>
      <span className="mono" style={{fontSize:10, color:theme.textFaint, letterSpacing:"0.1em"}}>2027 FORECAST · LIVE</span>
      <ThemeToggle theme={theme} themeName={themeName} setTheme={setTheme} />
      <button
        className="btn"
        onClick={() => toast("Wallet integration coming soon", {
          description: "Sovereign Lens trades will be settled on-chain in the next release.",
        })}
        style={{background:theme.text, color:theme.bg, padding:"8px 18px", borderRadius:999, border:"none", fontWeight:600, fontSize:11, letterSpacing:"-0.01em"}}
      >
        Connect Wallet
      </button>
    </div>
  </header>
);

const ThemeToggle = ({theme, themeName, setTheme}) => (
  <div style={{display:"flex", padding:3, background:theme.chip, borderRadius:999, border:`1px solid ${theme.border}`}}>
    {["light","dark"].map(t => (
      <button key={t} onClick={()=>setTheme(t)} className="btn"
        style={{
          padding:"5px 10px", border:"none",
          background: themeName === t ? (t === "dark" ? "#222" : "#fff") : "transparent",
          color: themeName === t ? (t === "dark" ? "#fff" : "#000") : theme.textMuted,
          fontSize:10, fontWeight:700, letterSpacing:"0.1em", borderRadius:999,
          fontFamily:"'JetBrains Mono', monospace",
          display:"flex", alignItems:"center", gap:5
        }}>
        {t === "dark" ? "◐" : "◑"} {t.toUpperCase()}
      </button>
    ))}
  </div>
);

// ============================================================
// COMMON CARDS
// ============================================================
const Card = ({children, style, theme}) => (
  <div className="glass premium-shadow" style={{borderRadius:24, padding:28, ...style}}>{children}</div>
);

const CardHeader = ({title, subtitle, children, theme}) => (
  <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16}}>
    <div>
      <h3 className="head" style={{fontSize:14, fontWeight:700, letterSpacing:"-0.01em", margin:0}}>{title}</h3>
      {subtitle && <p style={{fontSize:11, color:theme.textMuted, margin:"4px 0 0", letterSpacing:"0.02em"}}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Stat = ({label, value, tone, theme}) => (
  <div style={{textAlign:"right"}}>
    <div className="mono" style={{fontSize:9, letterSpacing:"0.15em", color:theme.textMuted, textTransform:"uppercase", marginBottom:4}}>{label}</div>
    <div className="head" style={{fontSize:24, fontWeight:700, color: tone || theme.text, letterSpacing:"-0.02em"}}>{value}</div>
  </div>
);

// ============================================================
// MARKETS VIEW (main dashboard)
// ============================================================
const MarketsView = ({theme, tick}) => {
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [selectedState, setSelectedState] = useState(null);
  const [selectedLGA, setSelectedLGA] = useState(null);
  const [hoverState, setHoverState] = useState(null);
  const [marketMode, setMarketMode] = useState("PRES"); // PRES | GOV
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [govStateFilter, setGovStateFilter] = useState(GOVERNORSHIP[0].state);
  const drillRef = useRef(null);

  // Smooth-scroll to drill-down when a state is selected from the map
  useEffect(() => {
    if (selectedState && drillRef.current) {
      drillRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedState]);

  const filteredStates = useMemo(() => zoneFilter === "ALL" ? STATE_DATA : STATE_DATA.filter(s => s.zone === zoneFilter), [zoneFilter]);
  const lgas = useMemo(() => selectedState ? buildLGAs(selectedState) : [], [selectedState]);
  const wards = useMemo(() => selectedState && selectedLGA ? buildWards(selectedState, selectedLGA) : [], [selectedState, selectedLGA]);

  const presDays = dayDiff("2027-01-16");
  const govDays  = dayDiff("2027-02-06");

  return (
    <>
      <ViewHeader theme={theme} eyebrow="LIVE TERMINAL"
        title="2027 Nigerian Elections"
        subtitle={`Geopositioned forecast across ${STATE_DATA.length} federal units · 774 LGAs · ${(NATIONAL.reg/1e6).toFixed(1)}M registered voters`}>
        <div style={{display:"flex", gap:24}}>
          <Stat theme={theme} label="Volume (24h)" value="₦14.2B" />
          <Stat theme={theme} label="Pres. Election" value={`T-${presDays}d`} tone={theme.primary}/>
          <Stat theme={theme} label="Gov. Election" value={`T-${govDays}d`} tone={theme.accent}/>
        </div>
      </ViewHeader>

      {/* KPI ROW */}
      <KpiRow theme={theme} />

      {/* CANDIDATE MARKET — President / Governor toggle */}
      <Card theme={theme} style={{marginBottom:32}}>
        <CardHeader theme={theme}
          title="Candidate Market · Win Probability"
          subtitle="Real declared / strongly probable 2027 candidates · Click any card to inspect">
          <div style={{display:"flex", gap:4, padding:4, background:theme.chip, borderRadius:999}}>
            {[{k:"PRES", l:"Presidential"}, {k:"GOV", l:"Governorship"}].map(opt => (
              <button key={opt.k} onClick={()=>{setMarketMode(opt.k); setSelectedCandidate(null);}} className="btn"
                style={{
                  padding:"6px 14px", borderRadius:999, border:"none",
                  background: marketMode===opt.k ? theme.text : "transparent",
                  color: marketMode===opt.k ? theme.bg : theme.textMuted,
                  fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  fontFamily:"'JetBrains Mono', monospace"
                }}>{opt.l}</button>
            ))}
          </div>
        </CardHeader>

        {marketMode === "PRES" ? (
          <PresidentialMarket theme={theme} selected={selectedCandidate} setSelected={setSelectedCandidate}/>
        ) : (
          <GovernorshipMarket theme={theme} stateFilter={govStateFilter} setStateFilter={setGovStateFilter}/>
        )}
      </Card>

      {/* MAP + INTEL */}
      <section style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24, marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Geopositioned Forecast Heat Map" subtitle="36 states + FCT · weighted by registered voters · click to drill">
            <ZoneToggle zoneFilter={zoneFilter} setZoneFilter={setZoneFilter} theme={theme}/>
          </CardHeader>
          <NigeriaMap states={filteredStates} hoverState={hoverState} setHoverState={setHoverState}
            selectedState={selectedState} onSelect={(s)=>{setSelectedState(s); setSelectedLGA(null);}}
            tick={tick} theme={theme}/>
          <MapLegend theme={theme}/>
        </Card>

        <Card theme={theme} style={{display:"flex", flexDirection:"column"}}>
          <CardHeader theme={theme} title="Intelligence Terminal" subtitle="LIVE · cross-source signals">
            <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
              <span className="pulse-dot"/>
              <span style={{fontSize:9, letterSpacing:"0.2em", color:theme.primary, fontWeight:700, fontFamily:"'JetBrains Mono', monospace"}}>STREAMING</span>
            </span>
          </CardHeader>
          <IntelFeed tick={tick} theme={theme}/>
        </Card>
      </section>

      {/* DRILL-DOWN */}
      <section ref={drillRef} style={{marginBottom:32, scrollMarginTop:88}}>
        <DrillDown state={selectedState} lgas={lgas} selectedLGA={selectedLGA} setSelectedLGA={setSelectedLGA} wards={wards} theme={theme}/>
      </section>

      {/* INEC SCHEDULE */}
      <section style={{marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="INEC Schedule Terminal" subtitle="Electoral Act 2026 — revised timeline"/>
          <InecTimeline theme={theme}/>
        </Card>
      </section>

      {/* VOLATILITY + ZONES */}
      <section style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:24, marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Volatility & Odds — 90 Day Window" subtitle="Rolling weighted national forecast"/>
          <VolatilityChart theme={theme}/>
        </Card>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Geopolitical Cluster Strength" subtitle="6 zones · voter-weighted aggregation"/>
          <ZoneAggregation theme={theme}/>
        </Card>
      </section>
    </>
  );
};

// ----- View header -----
const ViewHeader = ({theme, eyebrow, title, subtitle, children}) => (
  <div style={{marginBottom:40, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap"}}>
    <div>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
        <span style={{width:6, height:6, borderRadius:"50%", background:theme.primary}}/>
        <span className="mono" style={{fontSize:10, fontWeight:700, letterSpacing:"0.15em", color:theme.primary}}>{eyebrow}</span>
      </div>
      <h1 className="head" style={{fontSize:48, fontWeight:800, letterSpacing:"-0.025em", margin:0, lineHeight:1}}>{title}</h1>
      <p style={{color:theme.textMuted, fontSize:14, marginTop:12, maxWidth:600}}>{subtitle}</p>
    </div>
    {children}
  </div>
);

// ----- KPI ROW -----
const KpiRow = ({theme}) => {
  const cards = [
    { party:"APC", v:NATIONAL.APC, dlt:"+1.2", color:PARTY_COLORS.APC, name:"All Progressives Congress" },
    { party:"ADC*", v:NATIONAL.PDP, dlt:"+0.8", color:PARTY_COLORS.PDP, name:"ADC Coalition (Atiku · Obi)" },
    { party:"LP",  v:NATIONAL.LP,  dlt:"-0.4", color:PARTY_COLORS.LP, name:"Labour Party" },
    { party:"OTH", v:NATIONAL.OTH, dlt:"+0.0", color:PARTY_COLORS.OTH, name:"NNPP · SDP · AAC · Others" },
  ];
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24}}>
      {cards.map(c => (
        <div key={c.party} className="glass premium-shadow" style={{padding:24, borderRadius:20, position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", inset:0, background:`radial-gradient(circle at top right, ${c.color}20, transparent 60%)`, pointerEvents:"none"}}/>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, position:"relative"}}>
            <span className="mono" style={{fontSize:11, fontWeight:700, color:theme.textMuted, letterSpacing:"0.2em"}}>{c.party}</span>
            <span className="mono" style={{fontSize:10, fontWeight:700, color: parseFloat(c.dlt) > 0 ? theme.primary : parseFloat(c.dlt) < 0 ? theme.accent : theme.textFaint}}>
              {parseFloat(c.dlt) > 0 ? "+" : ""}{c.dlt}%
            </span>
          </div>
          <div className="head" style={{fontSize:36, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6, position:"relative"}}>{c.v}%</div>
          <div style={{fontSize:10, color:theme.textFaint, marginBottom:10, height:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.name}</div>
          <div style={{height:3, width:"100%", background:theme.chip, borderRadius:999, overflow:"hidden"}}>
            <div style={{height:"100%", background:c.color, width:`${c.v}%`, borderRadius:999, transition:"width 0.6s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// PRESIDENTIAL MARKET
// ============================================================
const PresidentialMarket = ({theme, selected, setSelected}) => {
  const r = rng(98765);
  const cards = PRESIDENTIAL.map((c, i) => {
    const baseProbs = [42.8, 24.3, 16.1, 7.2, 3.4, 4.1, 2.1];
    const prob = baseProbs[i] || 1.0;
    const yesPrice = (prob/100).toFixed(2);
    const noPrice  = (1 - prob/100).toFixed(2);
    const dlt = ((r() - 0.5) * 4).toFixed(1);
    return { ...c, prob, yesPrice, noPrice, dlt };
  });

  return (
    <>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12, marginBottom: selected ? 24 : 0}}>
        {cards.map(c => {
          const isSel = selected?.id === c.id;
          return (
            <div key={c.id} onClick={()=>setSelected(isSel ? null : c)} className="btn"
              style={{
                padding:18, borderRadius:14, position:"relative",
                background: isSel ? `linear-gradient(135deg, ${c.color}18, transparent)` : theme.chip,
                border: `1px solid ${isSel ? c.color+"60" : theme.border}`,
                cursor:"pointer", transition:"all 0.2s"
              }}>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
                <div style={{width:36, height:36, borderRadius:"50%",
                  background:`linear-gradient(135deg, ${c.color}, ${c.color}80)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:800, color:"#000",
                  fontFamily:"'Inter', sans-serif"}}>{c.initials}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:700, color:theme.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.name}</div>
                  <div className="mono" style={{fontSize:9, color:c.color, letterSpacing:"0.1em", fontWeight:700}}>{c.party}</div>
                </div>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10}}>
                <div className="head" style={{fontSize:28, fontWeight:800, letterSpacing:"-0.02em", color:c.color}}>{c.prob}%</div>
                <div className="mono" style={{fontSize:9, color: parseFloat(c.dlt) > 0 ? theme.primary : theme.accent, fontWeight:700}}>
                  {parseFloat(c.dlt) > 0 ? "+" : ""}{c.dlt}%
                </div>
              </div>
              <div style={{display:"flex", gap:6}}>
                <button className="btn" style={{flex:1, padding:"6px 0", borderRadius:6, border:"none",
                  background: theme.primary+"22", color:theme.primary, fontSize:10, fontWeight:700,
                  fontFamily:"'JetBrains Mono', monospace"}} onClick={(e)=>{e.stopPropagation();}}>YES ${c.yesPrice}</button>
                <button className="btn" style={{flex:1, padding:"6px 0", borderRadius:6, border:"none",
                  background: theme.accent+"22", color:theme.accent, fontSize:10, fontWeight:700,
                  fontFamily:"'JetBrains Mono', monospace"}} onClick={(e)=>{e.stopPropagation();}}>NO ${c.noPrice}</button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{padding:20, background:theme.chip, borderRadius:14, border:`1px solid ${selected.color}30`, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, animation:"feedIn 0.3s"}}>
          <div>
            <div className="mono" style={{fontSize:9, color:theme.textMuted, letterSpacing:"0.2em", marginBottom:8}}>PROFILE</div>
            <div className="head" style={{fontSize:18, fontWeight:800, marginBottom:4}}>{selected.name}</div>
            <div style={{fontSize:11, color:theme.textMuted, marginBottom:6}}>{selected.role}</div>
            <div className="mono" style={{fontSize:10, color:theme.textFaint, letterSpacing:"0.1em"}}>{selected.base.toUpperCase()} · AGE {selected.age}</div>
          </div>
          <div>
            <div className="mono" style={{fontSize:9, color:theme.textMuted, letterSpacing:"0.2em", marginBottom:8}}>STRATEGIC NOTE</div>
            <div style={{fontSize:12, lineHeight:1.55, color:theme.text}}>{selected.note}</div>
          </div>
          <div>
            <div className="mono" style={{fontSize:9, color:theme.textMuted, letterSpacing:"0.2em", marginBottom:8}}>MARKET DEPTH</div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <Row label="Implied probability" value={`${selected.prob}%`} theme={theme}/>
              <Row label="24h volume" value="₦2.1B" theme={theme}/>
              <Row label="Open interest" value="₦8.7B" theme={theme}/>
              <Row label="Bid-ask spread" value="0.04" theme={theme}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Row = ({label, value, theme}) => (
  <div style={{display:"flex", justifyContent:"space-between", fontSize:11}}>
    <span style={{color:theme.textMuted}}>{label}</span>
    <span className="mono" style={{color:theme.text, fontWeight:700}}>{value}</span>
  </div>
);

// ============================================================
// GOVERNORSHIP MARKET
// ============================================================
const GovernorshipMarket = ({theme, stateFilter, setStateFilter}) => {
  const race = GOVERNORSHIP.find(g => g.state === stateFilter);
  const r = rng(seedFor(stateFilter + "gov"));
  const cands = race.candidates.map((c, i) => {
    const baseProbs = [48, 28, 16, 8];
    const noise = (r()-0.5)*6;
    return { ...c, prob: Math.max(2, +(baseProbs[i] + noise).toFixed(1)) };
  });

  return (
    <>
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${theme.border}`}}>
        <span className="mono" style={{fontSize:10, color:theme.textMuted, letterSpacing:"0.2em", padding:"6px 12px 6px 0", alignSelf:"center"}}>STATE:</span>
        {GOVERNORSHIP.map(g => (
          <button key={g.state} onClick={()=>setStateFilter(g.state)} className="btn"
            style={{
              padding:"6px 12px", borderRadius:8, border:"none",
              background: stateFilter===g.state ? theme.text : theme.chip,
              color: stateFilter===g.state ? theme.bg : theme.textMuted,
              fontSize:10, fontWeight:700, letterSpacing:"0.05em",
              fontFamily:"'JetBrains Mono', monospace"
            }}>{g.state.toUpperCase()}</button>
        ))}
      </div>

      <div style={{marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <div className="head" style={{fontSize:20, fontWeight:800, letterSpacing:"-0.02em"}}>{stateFilter} Governorship</div>
          <div style={{fontSize:11, color:theme.textMuted}}>
            {OFF_CYCLE_GOV.has(stateFilter) ? "OFF-CYCLE — next race not in 2027" : "Election: 6 February 2027"}
          </div>
        </div>
        <div className="mono" style={{fontSize:10, color:theme.textFaint, letterSpacing:"0.1em"}}>{cands.length} CANDIDATES</div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:12}}>
        {cands.map((c, i) => (
          <div key={i} style={{padding:18, borderRadius:14, background:theme.chip, border:`1px solid ${theme.border}`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14}}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.name}</div>
                <div className="mono" style={{fontSize:9, color:c.color, letterSpacing:"0.15em", fontWeight:700}}>{c.party}</div>
              </div>
              <div className="head" style={{fontSize:22, fontWeight:800, color:c.color, letterSpacing:"-0.02em"}}>{c.prob}%</div>
            </div>
            <div style={{fontSize:11, color:theme.textMuted, marginBottom:12, lineHeight:1.4}}>{c.role}</div>
            <div style={{height:3, background:theme.chip, borderRadius:999, overflow:"hidden", border:`1px solid ${theme.border}`}}>
              <div style={{height:"100%", width:`${c.prob}%`, background:c.color, borderRadius:999}}/>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ============================================================
// MAP
// ============================================================
const NigeriaMap = ({states, hoverState, setHoverState, selectedState, onSelect, tick, theme}) => {
  const W = 760, H = 520;
  const project = (lat, lng) => {
    const x = ((lng - 2.5) / (14.7 - 2.5)) * (W - 80) + 40;
    const y = ((14 - lat) / (14 - 4)) * (H - 80) + 40;
    return [x, y];
  };
  const maxReg = Math.max(...STATE_DATA.map(s => s.reg));
  const radius = (reg) => 8 + (reg / maxReg) * 26;
  const dotColor = (s) => PARTY_COLORS[winnerOf(s.forecast)[0]];

  return (
    <div style={{position:"relative", width:"100%", aspectRatio:`${W}/${H}`, borderRadius:16, overflow:"hidden", background:theme.bg === "#050505" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.4)"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"100%", display:"block"}}>
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.grid} strokeWidth="0.5"/>
          </pattern>
          {Object.entries(PARTY_COLORS).map(([p, c]) => (
            <radialGradient key={p} id={`glow-${p}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity="0.6"/>
              <stop offset="60%" stopColor={c} stopOpacity="0.15"/>
              <stop offset="100%" stopColor={c} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        <rect width={W} height={H} fill="url(#mapgrid)"/>
        <NigeriaOutline project={project} theme={theme}/>
        <ZoneHulls project={project} theme={theme}/>

        {/* Glow halos */}
        {states.map(s => {
          const [x,y] = project(s.lat, s.lng);
          const r = radius(s.reg);
          const winner = winnerOf(s.forecast)[0];
          return <circle key={`halo-${s.name}`} cx={x} cy={y} r={r * 1.8} fill={`url(#glow-${winner})`} pointerEvents="none"/>;
        })}

        {/* State dots */}
        {states.map(s => {
          const [x,y] = project(s.lat, s.lng);
          const r = radius(s.reg);
          const isSelected = selectedState?.name === s.name;
          const isHover = hoverState?.name === s.name;
          const color = dotColor(s);
          const winner = winnerOf(s.forecast);
          return (
            <g key={s.name} style={{cursor:"pointer"}}
               onMouseEnter={() => setHoverState(s)}
               onMouseLeave={() => setHoverState(null)}
               onClick={() => onSelect(s)}>
              {(isSelected || isHover) && (
                <circle cx={x} cy={y} r={r+6} fill="none" stroke={color} strokeWidth="1" opacity="0.6" style={{animation:"mapPing 1.4s ease-out infinite"}}/>
              )}
              <circle cx={x} cy={y} r={r} fill={color} fillOpacity={isSelected ? 0.95 : 0.7}
                stroke={isSelected ? theme.text : color} strokeWidth={isSelected ? 2 : 0.5}/>
              <circle cx={x} cy={y} r={r * 0.4} fill={theme.text} opacity={isSelected || isHover ? 0.9 : 0.4}/>
              {(isSelected || isHover) && (
                <g>
                  <rect x={x+r+8} y={y-22} width="130" height="46" rx="6" fill={theme.surfaceSolid} stroke={theme.borderStrong}/>
                  <text x={x+r+16} y={y-7} fill={theme.text} fontSize="11" fontWeight="700" fontFamily="Inter">{s.name}</text>
                  <text x={x+r+16} y={y+7} fill={color} fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">{winner[0]} {winner[1].toFixed(1)}%</text>
                  <text x={x+r+16} y={y+19} fill={theme.textFaint} fontSize="8" fontFamily="JetBrains Mono">{(s.reg/1e6).toFixed(2)}M REG</text>
                </g>
              )}
            </g>
          );
        })}

        <g transform={`translate(20, 20)`}>
          <text fill={theme.textFaint} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="2">N ↑</text>
        </g>
        <g transform={`translate(${W-110}, ${H-20})`}>
          <text fill={theme.textFaint} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="2">SCALE 1:5M</text>
        </g>
      </svg>

      <div style={{position:"absolute", top:16, right:16, display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:theme.bg === "#050505" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)", borderRadius:999, border:`1px solid ${theme.border}`}}>
        <span className="pulse-dot"/>
        <span className="mono" style={{fontSize:9, color:theme.primary, letterSpacing:"0.2em", fontWeight:700}}>SYNC {String(tick).padStart(4,"0")}</span>
      </div>
    </div>
  );
};

const NigeriaOutline = ({project, theme}) => {
  const fixed = [
    [13.5, 13.5],[14.0, 13.0],[14.6, 12.4],[14.5, 11.5],[14.0, 10.5],[13.9, 9.5],[13.0, 8.5],
    [12.0, 7.4],[11.5, 6.7],[11.5, 6.0],[10.5, 4.5],[9.0, 3.0],[7.5, 2.7],[6.5, 2.7],
    [5.5, 3.5],[4.5, 5.5],[4.2, 6.5],[4.3, 7.8],[4.5, 8.2],[5.5, 8.8],[6.5, 9.0],[7.5, 9.5],
    [8.0, 10.0],[8.5, 11.5],[9.5, 12.5],[10.5, 13.5],[11.5, 13.7],[12.5, 13.6],[13.5, 13.5]
  ];
  const d = fixed.map(([lat, lng], i) => {
    const [x, y] = project(lat, lng);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
  return <path d={d} fill={theme.bg === "#050505" ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0.015)"} stroke={theme.borderStrong} strokeWidth="1" strokeDasharray="2 3"/>;
};

const ZoneHulls = ({project, theme}) => {
  return Object.entries(ZONES).map(([k, z]) => {
    const ss = STATE_DATA.filter(s => s.zone === k);
    const cx = ss.reduce((a,s)=>a+s.lng,0)/ss.length;
    const cy = ss.reduce((a,s)=>a+s.lat,0)/ss.length;
    const [x, y] = project(cy, cx);
    return (
      <g key={k}>
        <circle cx={x} cy={y} r="80" fill={theme.primary} opacity="0.025"/>
        <text x={x} y={y-50} textAnchor="middle" fill={theme.textFaint} fontSize="9" fontWeight="700" fontFamily="JetBrains Mono" letterSpacing="2">{k}</text>
      </g>
    );
  });
};

const MapLegend = ({theme}) => (
  <div style={{display:"flex", gap:24, justifyContent:"space-between", marginTop:20, flexWrap:"wrap"}}>
    <div style={{display:"flex", gap:16}}>
      {[["APC","#26D967"],["PDP","#26C9D9"],["LP","#D9A526"]].map(([p,c]) => (
        <div key={p} style={{display:"flex", alignItems:"center", gap:6}}>
          <div style={{width:10, height:10, borderRadius:"50%", background:c}}/>
          <span className="mono" style={{fontSize:10, color:theme.textMuted, letterSpacing:"0.1em"}}>{p}</span>
        </div>
      ))}
    </div>
    <div className="mono" style={{fontSize:9, color:theme.textFaint, letterSpacing:"0.15em"}}>
      DOT SIZE = REGISTERED VOTERS · COLOR = LEADING PARTY
    </div>
  </div>
);

const ZoneToggle = ({zoneFilter, setZoneFilter, theme}) => (
  <div style={{display:"flex", gap:4, padding:4, background:theme.chip, borderRadius:999}}>
    {[{k:"ALL",l:"All"}, ...Object.entries(ZONES).map(([k])=>({k, l:k}))].map(opt => (
      <button key={opt.k} className="btn" onClick={()=>setZoneFilter(opt.k)}
        style={{
          padding:"6px 12px", borderRadius:999, border:"none",
          background: zoneFilter===opt.k ? theme.text : "transparent",
          color: zoneFilter===opt.k ? theme.bg : theme.textMuted,
          fontSize:10, fontWeight:700, letterSpacing:"0.1em",
          fontFamily:"'JetBrains Mono', monospace"
        }}>{opt.l}</button>
    ))}
  </div>
);

// ============================================================
// INTEL FEED
// ============================================================
const IntelFeed = ({tick, theme}) => {
  const items = useMemo(() => {
    const arr = [...FEED];
    for (let i = 0; i < tick % FEED.length; i++) arr.push(arr.shift());
    return arr;
  }, [tick]);

  const colorOf = (k) => ({primary:theme.primary, secondary:theme.secondary, accent:theme.accent, cyan:theme.cyan})[k] || theme.primary;

  return (
    <div style={{flex:1, overflow:"auto", maxHeight:480, paddingRight:8, marginRight:-8}}>
      {items.map((it, idx) => (
        <div key={`${tick}-${idx}`} className="feed-in" style={{padding:"14px 0", borderBottom:`1px solid ${theme.border}`}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <span className="mono" style={{fontSize:9, fontWeight:700, color:colorOf(it.color), letterSpacing:"0.15em"}}>{it.tag}</span>
              <span style={{fontSize:11, color:theme.text, fontWeight:600}}>{it.region}</span>
            </div>
            <span className="mono" style={{fontSize:9, color:theme.textFaint}}>{it.t}</span>
          </div>
          <p style={{fontSize:12, lineHeight:1.55, color:theme.textMuted, margin:0}}>{it.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// DRILL-DOWN
// ============================================================
const DrillDown = ({state, lgas, selectedLGA, setSelectedLGA, wards, theme}) => {
  if (!state) {
    return (
      <Card theme={theme}>
        <div style={{textAlign:"center", padding:"40px 20px", color:theme.textFaint}}>
          <div className="mono" style={{fontSize:11, letterSpacing:"0.2em", marginBottom:8}}>SELECT A STATE FROM THE MAP</div>
          <div style={{fontSize:13}}>Drill down into LGAs and wards to inspect granular forecasts.</div>
        </div>
      </Card>
    );
  }
  const winner = winnerOf(state.forecast);
  const winnerColor = PARTY_COLORS[winner[0]];

  return (
    <Card theme={theme}>
      <div style={{display:"grid", gridTemplateColumns:"320px 1fr 1fr", gap:24}}>
        <div style={{borderRight:`1px solid ${theme.border}`, paddingRight:24}}>
          <div className="mono" style={{fontSize:9, letterSpacing:"0.2em", color:theme.textMuted, marginBottom:8}}>STATE FORECAST</div>
          <div className="head" style={{fontSize:30, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4}}>{state.name}</div>
          <div style={{fontSize:11, color:theme.textMuted, marginBottom:20}}>
            {state.capital} · {ZONES[state.zone].label} · {(state.reg/1e6).toFixed(2)}M registered
            {OFF_CYCLE_GOV.has(state.name) && <span style={{display:"inline-block", marginLeft:8, padding:"2px 6px", borderRadius:4, background:theme.accent+"22", color:theme.accent, fontSize:9, fontWeight:700, letterSpacing:"0.1em", fontFamily:"'JetBrains Mono', monospace"}}>OFF-CYCLE GOV</span>}
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:20}}>
            {["APC","PDP","LP","OTH"].map(p => (
              <div key={p}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                  <span className="mono" style={{fontSize:10, color:theme.textMuted, letterSpacing:"0.1em"}}>{p}</span>
                  <span className="mono" style={{fontSize:11, color:theme.text, fontWeight:700}}>{state.forecast[p]}%</span>
                </div>
                <div style={{height:4, background:theme.chip, borderRadius:999, overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${state.forecast[p]}%`, background:PARTY_COLORS[p], borderRadius:999, transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{padding:14, background:`linear-gradient(135deg, ${winnerColor}18, transparent)`, border:`1px solid ${winnerColor}40`, borderRadius:12}}>
            <div className="mono" style={{fontSize:9, color:winnerColor, letterSpacing:"0.2em", marginBottom:4}}>FORECAST WINNER</div>
            <div className="head" style={{fontSize:22, fontWeight:800, color:winnerColor}}>{winner[0]}</div>
            <div className="mono" style={{fontSize:11, color:theme.textMuted, marginTop:4}}>
              CONFIDENCE {state.forecast.confidence}% · TURNOUT {state.forecast.turnout}%
            </div>
          </div>
        </div>

        <div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:theme.textMuted}}>LGAs · {lgas.length}</div>
            <div className="mono" style={{fontSize:9, color:theme.textFaint}}>SCROLL ↓</div>
          </div>
          <div style={{maxHeight:380, overflow:"auto", paddingRight:8, marginRight:-8}}>
            {lgas.map((lga) => {
              const w = winnerOf(lga);
              const isSel = selectedLGA?.name === lga.name;
              return (
                <button key={lga.name} className="clickable" onClick={()=>setSelectedLGA(lga)}
                  style={{
                    width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:4,
                    background: isSel ? theme.chip : "transparent",
                    border: isSel ? `1px solid ${PARTY_COLORS[w[0]]}40` : `1px solid transparent`,
                    borderRadius:8, cursor:"pointer", color:theme.text,
                    display:"flex", alignItems:"center", gap:12,
                    transition:"all 0.15s"
                  }}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:600, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{lga.name}</div>
                    <div style={{display:"flex", height:3, borderRadius:999, overflow:"hidden", background:theme.chip}}>
                      <div style={{width:`${lga.APC}%`, background:PARTY_COLORS.APC}}/>
                      <div style={{width:`${lga.PDP}%`, background:PARTY_COLORS.PDP}}/>
                      <div style={{width:`${lga.LP}%`, background:PARTY_COLORS.LP}}/>
                      <div style={{width:`${lga.OTH}%`, background:PARTY_COLORS.OTH}}/>
                    </div>
                  </div>
                  <div style={{textAlign:"right", minWidth:50}}>
                    <div className="mono" style={{fontSize:10, fontWeight:700, color:PARTY_COLORS[w[0]]}}>{w[0]}</div>
                    <div className="mono" style={{fontSize:9, color:theme.textFaint}}>{w[1].toFixed(0)}%</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:theme.textMuted}}>WARDS · {selectedLGA ? wards.length : 0}</div>
            {selectedLGA && (<div className="mono" style={{fontSize:9, color:theme.textMuted}}>{selectedLGA.name.length > 22 ? selectedLGA.name.slice(0,20)+"…" : selectedLGA.name}</div>)}
          </div>
          {selectedLGA ? (
            <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:6, maxHeight:380, overflow:"auto", paddingRight:8, marginRight:-8}}>
              {wards.map(w => {
                const ww = winnerOf(w);
                return (
                  <div key={w.name} style={{padding:10, background:theme.chip, borderRadius:8, border:`1px solid ${theme.border}`}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                      <span className="mono" style={{fontSize:9, color:theme.textMuted, fontWeight:700, letterSpacing:"0.1em"}}>{w.name}</span>
                      <span className="mono" style={{fontSize:10, color:PARTY_COLORS[ww[0]], fontWeight:700}}>{ww[0]}</span>
                    </div>
                    <div style={{height:2.5, background:theme.bg === "#050505" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius:999, display:"flex", overflow:"hidden", marginBottom:6}}>
                      <div style={{width:`${w.APC}%`, background:PARTY_COLORS.APC}}/>
                      <div style={{width:`${w.PDP}%`, background:PARTY_COLORS.PDP}}/>
                      <div style={{width:`${w.LP}%`, background:PARTY_COLORS.LP}}/>
                    </div>
                    <div className="mono" style={{fontSize:8, color:theme.textFaint}}>{(w.reg/1000).toFixed(1)}K REG</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{padding:"40px 20px", textAlign:"center", color:theme.textFaint}}>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.15em"}}>SELECT AN LGA TO DRILL FURTHER ↓</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// INEC TIMELINE
// ============================================================
const InecTimeline = ({theme}) => {
  // Re-render every 30s so the clock + car position stay live
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = nowInLagos();
  const startTs = new Date(INEC_TIMELINE[0].date).getTime();
  const endTs = new Date(INEC_TIMELINE[INEC_TIMELINE.length - 1].date).getTime();
  const span = endTs - startTs;
  const nowTs = now.getTime();
  // Position of the "now" car along the rail (0..1)
  const progress = Math.max(0, Math.min(1, (nowTs - startTs) / span));
  // Rail lives between the centers of first and last node columns
  const cellPct = 100 / INEC_TIMELINE.length;
  const railLeftPct = cellPct / 2;
  const railRightPct = 100 - cellPct / 2;
  const carLeftPct = railLeftPct + progress * (railRightPct - railLeftPct);

  const watClock = now.toLocaleString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }) + " WAT";

  return (
    <div style={{position:"relative", padding:"24px 16px 20px"}}>
      {/* Live WAT clock */}
      <div className="mono" style={{
        position:"absolute", top:0, right:16, fontSize:9, letterSpacing:"0.18em",
        color:theme.textFaint, display:"flex", alignItems:"center", gap:6
      }}>
        <span style={{
          width:6, height:6, borderRadius:"50%", background:theme.primary,
          boxShadow:`0 0 8px ${theme.primary}`, animation:"pulse 1.6s infinite"
        }}/>
        LIVE · {watClock}
      </div>

      {/* Base rail */}
      <div style={{position:"absolute", top:52, left:`${railLeftPct}%`, right:`${100-railRightPct}%`, height:2, background:theme.chip}}/>
      {/* Progress fill up to "now" */}
      <div style={{
        position:"absolute", top:52, left:`${railLeftPct}%`,
        width:`${(carLeftPct - railLeftPct)}%`, height:2,
        background:`linear-gradient(90deg, ${theme.primary}, ${theme.cyan})`,
        boxShadow:`0 0 8px ${theme.primary}66`
      }}/>

      {/* NOW marker / "car" */}
      <div style={{
        position:"absolute", top:38, left:`${carLeftPct}%`,
        transform:"translateX(-50%)", display:"flex", flexDirection:"column",
        alignItems:"center", gap:4, transition:"left 0.6s ease", zIndex:2
      }}>
        <div className="mono" style={{
          fontSize:8, fontWeight:700, letterSpacing:"0.2em", color:theme.cyan,
          padding:"2px 6px", borderRadius:4,
          background:`${theme.cyan}1a`, border:`1px solid ${theme.cyan}55`,
          whiteSpace:"nowrap", textShadow:`0 0 8px ${theme.cyan}`
        }}>
          ◆ NOW
        </div>
        <div style={{
          width:0, height:0,
          borderLeft:"5px solid transparent",
          borderRight:"5px solid transparent",
          borderTop:`6px solid ${theme.cyan}`,
          filter:`drop-shadow(0 0 4px ${theme.cyan})`
        }}/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:`repeat(${INEC_TIMELINE.length}, 1fr)`, gap:8, position:"relative", marginTop:36}}>
        {INEC_TIMELINE.map((s, i) => {
          const days = dayDiff(s.date);
          const status = stageStatus(i);
          const isDone = status === "DONE";
          const isActive = status === "ACTIVE";
          return (
            <div key={s.stage} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:14, opacity: !isDone && !isActive && days > 60 ? 0.5 : 1}}>
              <div style={{
                width:14, height:14, borderRadius:"50%",
                background: isActive ? theme.text : isDone ? theme.primary : theme.borderStrong,
                boxShadow: isActive ? `0 0 0 4px ${theme.text}22` : isDone ? `0 0 0 4px ${theme.primary}22` : "none",
                animation: isActive ? "pulse 1.6s infinite" : "none"
              }}/>
              <div style={{textAlign:"center"}}>
                <div className="mono" style={{fontSize:10, fontWeight:700, color:theme.text, letterSpacing:"0.1em", marginBottom:2}}>{s.stage}</div>
                <div className="mono" style={{fontSize:9, color:theme.textFaint, marginBottom:4}}>{s.date}</div>
                <div className="mono" style={{fontSize:9, fontWeight:700, color: isDone ? theme.primary : isActive ? theme.text : theme.textFaint, letterSpacing:"0.1em"}}>
                  {isDone ? "DONE" : isActive ? "ACTIVE" : days > 0 ? `T-${days}d` : "PASSED"}
                </div>
                <div style={{fontSize:9, color:theme.textMuted, marginTop:6, lineHeight:1.4, maxWidth:120, margin:"6px auto 0"}}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// VOLATILITY CHART
// ============================================================
const VolatilityChart = ({theme}) => (
  <div style={{height:300}}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={VOL} margin={{top:10, right:10, left:-20, bottom:0}}>
        <defs>
          <linearGradient id="apcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.primary} stopOpacity={0.3}/>
            <stop offset="100%" stopColor={theme.primary} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="pdpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.cyan} stopOpacity={0.3}/>
            <stop offset="100%" stopColor={theme.cyan} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="lpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9A526" stopOpacity={0.3}/>
            <stop offset="100%" stopColor="#D9A526" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke={theme.textFaint} tick={{fontSize:9, fontFamily:"JetBrains Mono"}} interval={14} axisLine={false} tickLine={false}/>
        <YAxis stroke={theme.textFaint} tick={{fontSize:9, fontFamily:"JetBrains Mono"}} domain={[15,50]} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{background:theme.surfaceSolid, border:`1px solid ${theme.borderStrong}`, borderRadius:8, fontSize:11, color:theme.text}} labelStyle={{color:theme.text, fontFamily:"JetBrains Mono", fontSize:10}} itemStyle={{fontFamily:"JetBrains Mono", fontSize:10}}/>
        <ReferenceLine y={NATIONAL.APC} stroke={theme.primary} strokeDasharray="2 4" opacity={0.3}/>
        <Area type="monotone" dataKey="APC" stroke={theme.primary} strokeWidth={2} fill="url(#apcGrad)"/>
        <Area type="monotone" dataKey="PDP" stroke={theme.cyan} strokeWidth={2} fill="url(#pdpGrad)"/>
        <Area type="monotone" dataKey="LP"  stroke="#D9A526" strokeWidth={2} fill="url(#lpGrad)"/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ============================================================
// ZONE AGGREGATION
// ============================================================
const ZoneAggregation = ({theme}) => {
  const stats = useMemo(() => Object.entries(ZONES).map(([k, z]) => {
    const ss = STATE_DATA.filter(s => s.zone === k);
    let APC=0,PDP=0,LP=0,W=0;
    ss.forEach(s => { APC+=s.forecast.APC*s.reg; PDP+=s.forecast.PDP*s.reg; LP+=s.forecast.LP*s.reg; W+=s.reg; });
    return { key:k, label:z.label, APC:+(APC/W).toFixed(1), PDP:+(PDP/W).toFixed(1), LP:+(LP/W).toFixed(1), reg:W, states:ss.length };
  }), []);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:18}}>
      {stats.map(z => {
        const winner = z.APC > z.PDP && z.APC > z.LP ? "APC" : z.LP > z.PDP ? "LP" : "PDP";
        return (
          <div key={z.key}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:6}}>
              <div>
                <span style={{fontSize:12, fontWeight:600, color:theme.text}}>{z.label}</span>
                <span className="mono" style={{fontSize:9, color:theme.textFaint, marginLeft:8, letterSpacing:"0.1em"}}>{z.states} STATES · {(z.reg/1e6).toFixed(1)}M</span>
              </div>
              <span className="mono" style={{fontSize:10, fontWeight:700, color:PARTY_COLORS[winner], letterSpacing:"0.1em"}}>{winner} {Math.max(z.APC, z.PDP, z.LP).toFixed(1)}%</span>
            </div>
            <div style={{height:5, background:theme.chip, borderRadius:999, display:"flex", overflow:"hidden"}}>
              <div style={{width:`${z.APC}%`, background:PARTY_COLORS.APC, transition:"width 0.6s"}}/>
              <div style={{width:`${z.PDP}%`, background:PARTY_COLORS.PDP, transition:"width 0.6s"}}/>
              <div style={{width:`${z.LP}%`, background:PARTY_COLORS.LP, transition:"width 0.6s"}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// SENTIMENT VIEW
// ============================================================
const SentimentView = ({theme, tick}) => {
  const topics = [
    { name:"Economy / Cost of Living", volume:92, sentiment:-0.61, color:theme.cyan },
    { name:"Security / Banditry", volume:78, sentiment:-0.52, color:"#F09EA0" },
    { name:"Governance / Corruption", volume:54, sentiment:-0.34, color:"#A0A0A0" },
    { name:"Subsidy / Petrol", volume:67, sentiment:-0.28, color:theme.accent },
    { name:"Infrastructure", volume:32, sentiment:+0.18, color:theme.primary },
    { name:"Youth / Tech", volume:48, sentiment:+0.42, color:theme.secondary },
  ];

  const keywords = [
    { k:"INFLATION", v:85, label:"NEGATIVE", tone:"neg" },
    { k:"SECURITY", v:72, label:"NEGATIVE", tone:"neg" },
    { k:"REFORM", v:64, label:"POSITIVE", tone:"pos" },
    { k:"YOUTH_VOICE", v:91, label:"POSITIVE", tone:"pos" },
    { k:"SUBSIDY", v:78, label:"MIXED", tone:"mix" },
    { k:"DIASPORA", v:58, label:"POSITIVE", tone:"pos" },
  ];

  const factCheck = [
    { t:"FALSE_NARRATIVE_DET", body:"Claims regarding BVAS exclusion in North-East clusters verified as artificial disinformation vector originating from 12 coordinated accounts." },
    { t:"COORDINATED_INAUTHENTIC", body:"~340 accounts amplifying #ResignTinubu hashtag traced to single network operating since Jan 2026. Flagged for platform review." },
    { t:"DEEPFAKE_AUDIO_DET", body:"Viral audio purporting Atiku withdrawal confirmed AI-synthesized. Voiceprint mismatch confidence: 94.8%." },
  ];

  const regional = [
    { region:"NORTH_WEST", v:62, label:"POSITIVE", color:theme.primary },
    { region:"NORTH_EAST", v:48, label:"NEUTRAL", color:theme.cyan },
    { region:"NORTH_CENTRAL", v:55, label:"MIXED", color:"#D9A526" },
    { region:"SOUTH_WEST", v:71, label:"POSITIVE", color:theme.primary },
    { region:"SOUTH_EAST", v:88, label:"SKEPTICAL", color:theme.accent },
    { region:"SOUTH_SOUTH", v:64, label:"MIXED", color:theme.secondary },
  ];

  const toneColor = (tone) => tone === "pos" ? theme.primary : tone === "neg" ? "#F09EA0" : theme.accent;

  return (
    <>
      <ViewHeader theme={theme} eyebrow="DISCOURSE INTELLIGENCE"
        title="Sentiment Core"
        subtitle="Neural mapping of national discourse. Tracking disinformation vectors and emotional resonance across digital town squares.">
        <div style={{display:"flex", gap:24}}>
          <Stat theme={theme} label="Signals / hr" value="14.2K"/>
          <Stat theme={theme} label="Sources" value="847"/>
          <Stat theme={theme} label="Net sentiment" value="-0.31" tone={theme.accent}/>
        </div>
      </ViewHeader>

      {/* Topic salience */}
      <section style={{display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24, marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Topic Volume × Salience" subtitle="Last 24 hours · normalized share of national discourse"/>
          <div style={{display:"flex", flexDirection:"column", gap:18}}>
            {topics.map(t => (
              <div key={t.name}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{fontSize:12, color:theme.text, fontWeight:500}}>{t.name}</span>
                  <span className="mono" style={{fontSize:10, color: t.sentiment > 0 ? theme.primary : theme.accent, fontWeight:700}}>
                    {t.sentiment > 0 ? "+" : ""}{t.sentiment.toFixed(2)} · vol {t.volume}
                  </span>
                </div>
                <div style={{height:24, background:theme.chip, borderRadius:6, overflow:"hidden", position:"relative"}}>
                  <div style={{height:"100%", width:`${t.volume}%`, background:`linear-gradient(90deg, ${t.color}cc, ${t.color}66)`, borderRadius:6}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card theme={theme}>
          <CardHeader theme={theme} title="Fact-Check Alerts" subtitle="Active disinformation tracking">
            <span className="mono" style={{fontSize:9, color:theme.accent, letterSpacing:"0.2em", fontWeight:700}}>● {factCheck.length} ACTIVE</span>
          </CardHeader>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {factCheck.map((f, i) => (
              <div key={i} style={{padding:14, background:theme.chip, borderRadius:10, borderLeft:`3px solid ${theme.accent}`}}>
                <div className="mono" style={{fontSize:9, fontWeight:700, color:theme.accent, letterSpacing:"0.15em", marginBottom:6}}>[{f.t}]</div>
                <div style={{fontSize:11, color:theme.textMuted, lineHeight:1.5}}>{f.body}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Keywords + regional */}
      <section style={{display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24, marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Keyword Sentiment Clusters" subtitle="Salience-weighted sentiment by keyword"/>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
            {keywords.map(k => (
              <div key={k.k} style={{padding:16, background:theme.chip, borderRadius:10, border:`1px solid ${theme.border}`}}>
                <div className="mono" style={{fontSize:10, color:theme.textMuted, letterSpacing:"0.15em", fontWeight:700, marginBottom:6}}>{k.k}</div>
                <div style={{display:"flex", alignItems:"baseline", gap:8}}>
                  <span className="head" style={{fontSize:24, fontWeight:800, letterSpacing:"-0.02em"}}>{k.v}%</span>
                  <span className="mono" style={{fontSize:9, padding:"3px 6px", borderRadius:4, background:toneColor(k.tone)+"22", color:toneColor(k.tone), fontWeight:700, letterSpacing:"0.1em"}}>{k.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card theme={theme}>
          <CardHeader theme={theme} title="Regional Sentiment Bias" subtitle="6 geopolitical zones"/>
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {regional.map(r => (
              <div key={r.region}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:5}}>
                  <span className="mono" style={{fontSize:10, color:theme.text, fontWeight:600, letterSpacing:"0.1em"}}>{r.region}</span>
                  <span className="mono" style={{fontSize:10, color:r.color, fontWeight:700}}>{r.v}% {r.label}</span>
                </div>
                <div style={{height:4, background:theme.chip, borderRadius:999, overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${r.v}%`, background:r.color, borderRadius:999}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
};

// ============================================================
// PRECEDENT VIEW
// ============================================================
const PrecedentView = ({theme}) => {
  const turnoutData = [
    { year:"1999", turnout:52.3, integrity:65 },
    { year:"2003", turnout:69.1, integrity:58 },
    { year:"2007", turnout:57.5, integrity:42 },
    { year:"2011", turnout:53.7, integrity:71 },
    { year:"2015", turnout:43.7, integrity:78 },
    { year:"2019", turnout:34.8, integrity:64 },
    { year:"2023", turnout:26.7, integrity:55 },
    { year:"2027 (P)", turnout:38.4, integrity:72 },
  ];

  const swingStates = [
    { state:"Lagos", swing:"+12.4", direction:"TOWARDS COALITION", urgency:"CRITICAL", color:theme.cyan },
    { state:"Kano", swing:"-8.2", direction:"TOWARDS NNPP", urgency:"HIGH", color:theme.secondary },
    { state:"Rivers", swing:"+15.5", direction:"TOWARDS APC", urgency:"HIGH", color:theme.primary },
    { state:"Plateau", swing:"+9.1", direction:"TOWARDS APC", urgency:"MEDIUM", color:theme.primary },
    { state:"Kaduna", swing:"-4.7", direction:"TOWARDS COALITION", urgency:"MEDIUM", color:theme.cyan },
    { state:"Delta", swing:"+11.2", direction:"TOWARDS APC", urgency:"HIGH", color:theme.primary },
  ];

  const urgencyColor = (u) => u === "CRITICAL" ? theme.accent : u === "HIGH" ? theme.primary : "#D9A526";

  return (
    <>
      <ViewHeader theme={theme} eyebrow="HISTORICAL ARCHIVE"
        title="Precedent Archive"
        subtitle="Analyzing electoral patterns across seven cycles. Deconstructing voter behavior, participation decay, and the emergence of multiparty corridors."/>

      <section style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24, marginBottom:32}}>
        <Card theme={theme}>
          <CardHeader theme={theme} title="Multi-Cycle Turnout × Integrity" subtitle="National turnout (line) and electoral integrity score (markers)"/>
          <div style={{height:340}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={turnoutData} margin={{top:20, right:30, left:-10, bottom:0}}>
                <XAxis dataKey="year" stroke={theme.textFaint} tick={{fontSize:10, fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
                <YAxis stroke={theme.textFaint} tick={{fontSize:10, fontFamily:"JetBrains Mono"}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:theme.surfaceSolid, border:`1px solid ${theme.borderStrong}`, borderRadius:8, fontSize:11}}/>
                <Line type="monotone" dataKey="turnout" stroke={theme.cyan} strokeWidth={2.5} dot={{r:4, fill:theme.cyan}} name="Turnout %"/>
                <Line type="monotone" dataKey="integrity" stroke={theme.primary} strokeWidth={2} strokeDasharray="4 4" dot={{r:3, fill:theme.primary}} name="Integrity %"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div style={{display:"flex", flexDirection:"column", gap:24}}>
          <Card theme={theme}>
            <CardHeader theme={theme} title="Swing Sensitivity Index" subtitle="Top movers vs 2023 baseline"/>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {swingStates.map(s => (
                <div key={s.state} style={{padding:12, background:theme.chip, borderRadius:8, border:`1px solid ${theme.border}`}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4}}>
                    <span style={{fontSize:13, fontWeight:700}}>{s.state}</span>
                    <span className="mono" style={{fontSize:13, fontWeight:700, color:s.color}}>{s.swing}%</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span className="mono" style={{fontSize:9, color:theme.textMuted, letterSpacing:"0.1em"}}>{s.direction}</span>
                    <span className="mono" style={{fontSize:9, color:urgencyColor(s.urgency), fontWeight:700, letterSpacing:"0.1em"}}>{s.urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card theme={theme} style={{borderLeft:`3px solid ${theme.primary}`}}>
            <div className="mono" style={{fontSize:10, color:theme.primary, letterSpacing:"0.2em", fontWeight:700, marginBottom:10}}>TURNOUT EROSION INDEX</div>
            <div style={{fontSize:12, lineHeight:1.6, color:theme.textMuted, fontStyle:"italic", fontFamily:"'JetBrains Mono', monospace"}}>
              "Participation decay from 69.1% (2003) to 26.7% (2023) indicates a structural trust deficit. Baseline 2027 recovery assumes 12.4M new registrants within the digital corridor — predominantly under-35 first-time voters."
            </div>
          </Card>
        </div>
      </section>

      {/* Cycle comparison table */}
      <Card theme={theme} style={{marginBottom:32}}>
        <CardHeader theme={theme} title="Cycle-on-Cycle Forecast Δ" subtitle="Projected 2027 vs realized 2023"/>
        <div style={{overflow:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${theme.border}`}}>
                {["Zone","2023 Leader","2023 Share","2027 Leader (P)","2027 Share (P)","Δ"].map(h => (
                  <th key={h} className="mono" style={{padding:"12px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:theme.textMuted, letterSpacing:"0.15em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["NW", "APC", "62.1%", "APC", "58.3%", "-3.8"],
                ["NE", "APC", "58.4%", "APC", "55.2%", "-3.2"],
                ["NC", "LP",  "31.8%", "APC", "38.1%", "+6.3"],
                ["SW", "APC", "44.7%", "APC", "47.2%", "+2.5"],
                ["SE", "LP",  "84.2%", "LP",  "71.4%", "-12.8"],
                ["SS", "PDP", "48.3%", "PDP", "45.8%", "-2.5"],
              ].map((row, i) => (
                <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}}>
                  {row.map((cell, j) => (
                    <td key={j} className={j > 0 ? "mono" : "head"} style={{
                      padding:"14px 16px",
                      color: j === 5 ? (cell.startsWith("+") ? theme.primary : theme.accent) : theme.text,
                      fontWeight: j === 0 || j === 5 ? 700 : 500,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

// ============================================================
// FOOTER
// ============================================================
const Footer = ({theme}) => (
  <div style={{marginTop:24, padding:"16px 0", borderTop:`1px solid ${theme.border}`, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
    <span className="mono" style={{fontSize:9, letterSpacing:"0.2em", color:theme.textFaint}}>
      © 2026 SOVEREIGN LENS · 2027 FORECAST MODEL v4.2 · DATA: INEC OFFICIAL · WIKIPEDIA · STATES-CITIES API
    </span>
    <div style={{display:"flex", gap:24}}>
      <span className="mono" style={{fontSize:9, letterSpacing:"0.2em", color:theme.textFaint}}>STATUS: <span style={{color:theme.primary, fontWeight:700}}>OPTIMAL</span></span>
      <span className="mono" style={{fontSize:9, letterSpacing:"0.2em", color:theme.textFaint}}>LATENCY: 24MS</span>
    </div>
  </div>
);
