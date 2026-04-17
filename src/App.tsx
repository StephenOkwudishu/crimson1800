/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Menu, X, Search, Bell, Settings, Sun, Moon, Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NAV_LINKS, Page } from "./constants";
import { DiasporaGlobe } from "./components/DiasporaGlobe";
import { 
  Dashboard, PresidentialForecast, GovernorshipTracker, InteractiveMaps, 
  HistoricalData, SecurityMonitor, VisualLab,
  LogisticsMonitor, NASSBattlegrounds, SentimentRadar, PVTPortal
} from "./Pages";

// Utility for class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Theme Management ---
type Theme = 'dark' | 'light' | 'system';

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes: { id: Theme; icon: any }[] = [
    { id: 'light', icon: Sun },
    { id: 'dark', icon: Moon },
    { id: 'system', icon: Laptop },
  ];

  return (
    <div className="flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "p-1.5 rounded-full transition-all",
            theme === t.id ? "bg-primary text-black" : "text-on-surface-variant hover:text-white"
          )}
        >
          <t.icon size={14} />
        </button>
      ))}
    </div>
  );
}

// --- Components ---

function Header({ activePage, onPageChange, isMenuOpen, setIsMenuOpen }: { 
  activePage: Page, 
  onPageChange: (p: Page) => void,
  isMenuOpen: boolean,
  setIsMenuOpen: (o: boolean) => void 
}) {
  return (
    <header className="fixed top-0 w-full z-50 nav-blur border-b border-border-subtle flex items-center justify-between px-8 h-16">
      <div className="flex items-center gap-12">
        <span className="text-xl font-bold tracking-tight text-white font-headline cursor-pointer" onClick={() => onPageChange('DASHBOARD')}>
          ELECT<span className="text-primary">INTEL</span>
        </span>
        <nav className="hidden xl:flex items-center gap-8 text-sm font-medium tracking-wide">
          <button 
            onClick={() => onPageChange('DASHBOARD')}
            className={cn("transition-colors pb-5 mt-5 border-b-2", activePage === 'DASHBOARD' ? "text-white border-primary" : "text-on-surface-variant hover:text-white border-transparent")}
          >
            Live_Terminal
          </button>
          <button 
            onClick={() => onPageChange('MAPS')}
            className={cn("transition-colors pb-5 mt-5 border-b-2", activePage === 'MAPS' ? "text-white border-primary" : "text-on-surface-variant hover:text-white border-transparent")}
          >
            Geospatial_Intel
          </button>
          <button 
            onClick={() => onPageChange('SECURITY')}
            className={cn("transition-colors pb-5 mt-5 border-b-2", activePage === 'SECURITY' ? "text-white border-primary" : "text-on-surface-variant hover:text-white border-transparent")}
          >
            Threat_Monitor
          </button>
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <ThemeToggle />
        <div className="hidden md:flex items-center gap-4 text-on-surface-variant">
          <Search className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Bell className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
        <button className="bg-primary text-black px-5 py-2 rounded-full font-headline font-semibold text-[10px] tracking-tight hover:opacity-90 transition-opacity uppercase font-bold">
          Command_Auth
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-primary hover:bg-primary/5 transition-colors lg:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

const SIDEBAR_ITEMS: { id: Page; label: string; icon: string; category?: string }[] = [
  { id: 'DASHBOARD', label: 'Command Center', icon: 'terminal' },
  { id: 'FORECAST', label: 'Presidential', icon: 'analytics' },
  { id: 'GOVERNORSHIP', label: 'States Tracker', icon: 'account_balance' },
  { id: 'MAPS', label: 'Regional Map', icon: 'map' },
  { id: 'SECURITY', label: 'Security Monitor', icon: 'shield', category: 'Intelligence' },
  { id: 'LOGISTICS', label: 'INEC & IReV', icon: 'inventory_2', category: 'Intelligence' },
  { id: 'SENTIMENT', label: 'Sentiment Radar', icon: 'monitoring', category: 'Intelligence' },
  { id: 'HISTORICAL', label: 'Historical Archive', icon: 'history', category: 'Analysis' },
  { id: 'NASS', label: 'NASS Battle', icon: 'groups', category: 'Analysis' },
  { id: 'PVT', label: 'PVT Portal', icon: 'how_to_reg' },
  { id: 'LAB', label: 'Visual Lab', icon: 'query_stats' },
];

function Sidebar({ activePage, onPageChange }: { activePage: Page, onPageChange: (p: Page) => void }) {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-border-subtle flex flex-col py-8 hidden lg:flex">
      <nav className="flex-1 space-y-1 px-4">
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isCategoryStart = item.category && (idx === 0 || SIDEBAR_ITEMS[idx - 1].category !== item.category);
          return (
            <div key={item.id}>
              {item.category && (
                <div className="pt-6 pb-2 px-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">{item.category}</span>
                </div>
              )}
              <button
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                  activePage === item.id 
                    ? "bg-white/5 text-white" 
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                )}
              >
                <span className={cn("material-symbols-outlined text-lg", activePage === item.id && "text-primary")} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span> 
                {item.label}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="px-8 mt-auto">
        <button className="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl font-headline text-xs font-bold tracking-wide hover:bg-primary/20 transition-all">
          EXECUTE INTEL
        </button>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full z-50 nav-blur border-t border-border-subtle flex justify-between items-center px-8 h-10">
      <div>
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-medium">© 2024 SOVEREIGN LENS • SECURE TERMINAL</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">STATUS:</span>
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">OPTIMAL</span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant tabular-nums">LATENCY: 14MS</span>
      </div>
    </footer>
  );
}

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>(() => {
    return (localStorage.getItem('active_page') as Page) || 'DASHBOARD';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePageChange = (p: Page) => {
    setActivePage(p);
    localStorage.setItem('active_page', p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'DASHBOARD': return <Dashboard />;
      case 'FORECAST': return <PresidentialForecast />;
      case 'GOVERNORSHIP': return <GovernorshipTracker />;
      case 'MAPS': return <InteractiveMaps />;
      case 'HISTORICAL': return <HistoricalData />;
      case 'SECURITY': return <SecurityMonitor />;
      case 'LAB': return <VisualLab />;
      case 'LOGISTICS': return <LogisticsMonitor />;
      case 'NASS': return <NASSBattlegrounds />;
      case 'SENTIMENT': return <SentimentRadar />;
      case 'PVT': return <PVTPortal />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen relative font-body text-on-surface select-none",
      isMenuOpen && "overflow-hidden"
    )}>
      <div className="scanline" />
      
      <Header 
        activePage={activePage} 
        onPageChange={handlePageChange} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <Sidebar activePage={activePage} onPageChange={handlePageChange} />

      <main className="lg:ml-64 pt-24 pb-20 px-8 lg:px-12 max-w-7xl mx-auto min-h-screen transition-all">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-2xl lg:hidden flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-bold tracking-tight text-white font-headline">
                ELECT<span className="text-primary">INTEL</span>
              </span>
              <button onClick={() => setIsMenuOpen(false)} className="text-white">
                <X size={32} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "text-2xl font-headline font-bold text-left transition-all",
                    activePage === item.id ? "text-primary pl-4 border-l-4 border-primary" : "text-on-surface-variant"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <DiasporaGlobe 
        className="fixed bottom-12 right-6 z-[1001] w-48 h-48 opacity-40 hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto"
        pusherKey={(import.meta as any).env.VITE_PUSHER_APP_KEY}
        cluster={(import.meta as any).env.VITE_PUSHER_CLUSTER}
      />
    </div>
  );
}
