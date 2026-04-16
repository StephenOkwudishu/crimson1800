import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GRID_SIZE = 4;
const TOTAL_DIMPLES = GRID_SIZE * GRID_SIZE;

export const PneumaticBackground: React.FC = () => {
  const [inflatedIndices, setInflatedIndices] = useState<Set<number>>(new Set());
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [config, setConfig] = useState({
    minOpacity: 0.4,
    maxOpacity: 0.7,
    oscillationSpeed: 12, // seconds per cycle
  });
  const [currentPattern, setCurrentPattern] = useState(0);
  const dimpleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sine wave oscillation for opacity
  const [currentOpacity, setCurrentOpacity] = useState(config.minOpacity);

  useEffect(() => {
    let startTime = Date.now();
    const animateOpacity = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const t = (elapsed % config.oscillationSpeed) / config.oscillationSpeed;
      const sine = (Math.sin(2 * Math.PI * t - Math.PI / 2) + 1) / 2;
      const opacity = config.minOpacity + sine * (config.maxOpacity - config.minOpacity);
      setCurrentOpacity(opacity);
      requestAnimationFrame(animateOpacity);
    };
    const req = requestAnimationFrame(animateOpacity);
    return () => cancelAnimationFrame(req);
  }, [config]);

  // Pattern Cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPattern((p) => (p + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate pattern states
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const phase = (now % 4000) / 4000;
      const newInflated = new Set<number>();

      switch (currentPattern) {
        case 0: // Zig-Zag (Snake)
          {
            const step = Math.floor(phase * TOTAL_DIMPLES);
            const row = Math.floor(step / GRID_SIZE);
            const col = row % 2 === 0 ? step % GRID_SIZE : (GRID_SIZE - 1) - (step % GRID_SIZE);
            newInflated.add(row * GRID_SIZE + col);
          }
          break;
        case 1: // Diagonal Wipe
          {
            const band = Math.floor(phase * 7); // x+y range is 0 to 6
            for (let i = 0; i < TOTAL_DIMPLES; i++) {
              const r = Math.floor(i / GRID_SIZE);
              const c = i % GRID_SIZE;
              if (r + c === band) newInflated.add(i);
            }
          }
          break;
        case 2: // Spiral
          {
            const spiralOrder = [
              0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, // Outer
              5, 6, 10, 9 // Inner
            ];
            const idx = Math.floor(phase * spiralOrder.length);
            newInflated.add(spiralOrder[idx]);
          }
          break;
        case 3: // Checkerboard
          {
            const flip = phase > 0.5;
            for (let i = 0; i < TOTAL_DIMPLES; i++) {
              const r = Math.floor(i / GRID_SIZE);
              const c = i % GRID_SIZE;
              if (((r + c) % 2 === 0) !== flip) newInflated.add(i);
            }
          }
          break;
        case 4: // Rows/Columns
          {
            const subPhase = phase * 8;
            if (subPhase < 4) {
              const row = Math.floor(subPhase);
              for (let c = 0; c < GRID_SIZE; c++) newInflated.add(row * GRID_SIZE + c);
            } else {
              const col = Math.floor(subPhase - 4);
              for (let r = 0; r < GRID_SIZE; r++) newInflated.add(r * GRID_SIZE + col);
            }
          }
          break;
        case 5: // Quarter
          {
            const quarter = Math.floor(phase * 4);
            const startRow = quarter < 2 ? 0 : 2;
            const startCol = quarter % 2 === 0 ? 0 : 2;
            for (let r = startRow; r < startRow + 2; r++) {
              for (let c = startCol; c < startCol + 2; c++) {
                newInflated.add(r * GRID_SIZE + c);
              }
            }
          }
          break;
      }
      setInflatedIndices(newInflated);
    }, 50);
    return () => clearInterval(interval);
  }, [currentPattern]);

  return (
    <>
      <div 
        className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
        style={{ opacity: currentOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-hud-green via-hud-purple to-hud-orange bg-[length:400%_400%] animate-triadic" />
        
        {/* Semi-transparent dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        
        <div className="grid grid-cols-4 grid-rows-4 gap-12 p-24 h-full w-full opacity-60">
          {Array.from({ length: TOTAL_DIMPLES }).map((_, i) => {
            const isPatternInflated = inflatedIndices.has(i);
            
            // Mouse Proximity logic
            let isMouseInflated = false;
            if (dimpleRefs.current[i]) {
              const rect = dimpleRefs.current[i]!.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const dist = Math.sqrt(Math.pow(centerX - mousePos.x, 2) + Math.pow(centerY - mousePos.y, 2));
              if (dist < 150) isMouseInflated = true;
            }

            return (
              <div
                key={i}
                ref={(el) => (dimpleRefs.current[i] = el)}
                className={cn(
                  "dimple aspect-square",
                  (isPatternInflated || isMouseInflated) ? "inflated" : "deflated"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="fixed bottom-12 right-6 z-[1000] hud-card p-5 w-72 space-y-5 bg-black/60 hidden md:block">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          [ DIAGNOSTICS: ATMO_LOG_V5 ]
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex justify-between text-[10px] font-mono font-bold text-on-surface uppercase tracking-tight">
              <span>MIN_ALPHA</span>
              <span className="text-primary">{config.minOpacity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0.05" max="0.30" step="0.01" 
              value={config.minOpacity}
              onChange={(e) => setConfig(prev => ({ ...prev, minOpacity: parseFloat(e.target.value) }))}
              className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex justify-between text-[10px] font-mono font-bold text-on-surface uppercase tracking-tight">
              <span>MAX_ALPHA</span>
              <span className="text-primary">{config.maxOpacity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0.30" max="0.70" step="0.01" 
              value={config.maxOpacity}
              onChange={(e) => setConfig(prev => ({ ...prev, maxOpacity: parseFloat(e.target.value) }))}
              className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex justify-between text-[10px] font-mono font-bold text-on-surface uppercase tracking-tight">
              <span>OSC_FREQ</span>
              <span className="text-primary">{config.oscillationSpeed}s</span>
            </label>
            <input 
              type="range" min="4" max="24" step="1" 
              value={config.oscillationSpeed}
              onChange={(e) => setConfig(prev => ({ ...prev, oscillationSpeed: parseInt(e.target.value) }))}
              className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer border-none"
            />
          </div>
        </div>
        <div className="pt-4 border-t border-outline-variant flex justify-between items-center text-[9px] font-mono text-on-surface-variant font-bold">
          <span>PATTERN: 0{currentPattern + 1} // 06</span>
          <span className="flex items-center gap-2 text-reporting">
            <div className="w-1.5 h-1.5 rounded-full bg-reporting animate-pulse" />
            CORE_HEALTH: NOMINAL
          </span>
        </div>
      </div>
    </>
  );
};
