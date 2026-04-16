/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Menu, X, Activity, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NAV_LINKS, Page } from "./constants";
import { Dashboard, PresidentialForecast, GovernorshipTracker, InteractiveMaps, HistoricalData, SecurityMonitor, VisualLab } from "./Pages";
import { PneumaticBackground } from "./components/PneumaticBackground";

// Utility for class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

function Header({ activePage, onPageChange, isMenuOpen, setIsMenuOpen }: { 
  activePage: Page, 
  onPageChange: (p: Page) => void,
  isMenuOpen: boolean,
  setIsMenuOpen: (o: boolean) => void 
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/30 backdrop-blur-2xl border-b border-outline-variant flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="p-1.5 border border-primary/30 bg-primary/5">
          <Activity className="w-5 h-5 text-primary animate-pulse-glow" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold tracking-[0.2em] text-primary text-sm md:text-base leading-none">
            NIGERIA 2027
          </span>
          <span className="font-mono text-[9px] text-on-surface-variant tracking-[0.1em] uppercase">
            ELECTION INTELLIGENCE v5.1.0
          </span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1">
        {NAV_LINKS.map(link => (
          <button
            key={link.id}
            onClick={() => onPageChange(link.id)}
            className={cn(
              "px-4 py-2 font-mono text-[10px] tracking-widest transition-all relative overflow-hidden group",
              activePage === link.id ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {link.label}
            {activePage === link.id && (
              <motion.div 
                layoutId="nav-active"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_12px_rgba(0,240,255,0.6)]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-outline-variant bg-surface-container-low/50">
          <div className="w-2 h-2 rounded-full bg-reporting animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] text-on-surface pt-0.5 font-mono font-bold uppercase">
            SYSTEM_SYNC: ACTIVE
          </span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-primary hover:bg-primary/5 transition-colors lg:hidden"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const [time, setTime] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 border-t border-outline-variant bg-black/30 backdrop-blur-xl flex items-center justify-between px-6 text-[10px] font-mono font-bold tracking-[0.2em] text-on-surface-variant z-[60]">
      <div className="flex gap-8">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-reporting" />
          CORE_IO: NOMINAL
        </span>
        <span className="hidden md:inline flex items-center gap-2 text-primary/80">
          <Lock size={12} className="text-primary" />
          ENCRYPTION: AES_XTS_512
        </span>
      </div>
      <div className="flex gap-8 uppercase">
        <span className="opacity-60 tabular-nums">{time}</span>
        <span className="bg-primary/10 text-primary px-2 border border-primary/20">
          VSI_CONFIDENCE: 99.1%
        </span>
      </div>
    </footer>
  );
}

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-close menu on resize if it's open
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
      default: return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen relative font-sans text-text-primary",
      isMenuOpen && "overflow-hidden"
    )}>
      <PneumaticBackground />
      
      {/* Visual Overlays */}
      <div className="scanline" />
      {/* Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/98 backdrop-blur-2xl lg:hidden h-screen"
          >
            <div className="flex flex-col h-full p-8 px-6">
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" />
                  <span className="font-display font-bold tracking-[0.2em] text-primary">NIGERIA 2027</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <X size={32} />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {NAV_LINKS.map((link, idx) => (
                  <motion.button
                    key={link.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setActivePage(link.id);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "text-left text-2xl font-mono font-bold tracking-[0.2em] transition-all uppercase",
                      activePage === link.id ? "text-primary translate-x-4" : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {link.label}
                    {activePage === link.id && (
                      <div className="h-[2px] w-12 bg-primary mt-2 shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
                    )}
                  </motion.button>
                ))}
              </nav>
              
              <div className="mt-auto pt-8 border-t border-outline-variant">
                <div className="flex items-center gap-4 text-on-surface-variant font-mono text-[10px] font-bold tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-reporting animate-pulse" />
                  SYSTEM_STATUS: ENCRYPTED
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        activePage={activePage} 
        onPageChange={setActivePage} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main className="pt-24 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
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

      <Footer />
    </div>
  );
}
