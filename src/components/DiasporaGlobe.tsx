import { useEffect, useRef, useState, useCallback } from "react";
import Globe from "react-globe.gl";
import { supabase } from "@/integrations/supabase/client";

/**
 * DiasporaGlobe — fixed-corner SIGINT widget showing live visitor pulses.
 * - Calls the visitor-location edge function to geolocate the current viewer.
 * - Subscribes to the "diaspora-uplink" Realtime channel for broadcasts from
 *   other clients, so every connected viewer sees each new node materialize
 *   in real time.
 *
 * Privacy: IP addresses are used ephemerally for geolocation only and never
 * persisted. Only approximate lat/lng/city/country are broadcast.
 */

type Visitor = {
  id: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  ts: number;
};

const PULSE_LIFE = 3500; // ms — expanding ring duration
const DOT_LIFE = 60_000; // ms — persistent glow duration

// A few seeded diaspora hotspots so the globe never feels empty.
const SEED_NODES: Visitor[] = [
  { id: "seed-london", lat: 51.5074, lng: -0.1278, city: "London", country: "UK", ts: Date.now() },
  { id: "seed-houston", lat: 29.7604, lng: -95.3698, city: "Houston", country: "US", ts: Date.now() },
  { id: "seed-toronto", lat: 43.6532, lng: -79.3832, city: "Toronto", country: "CA", ts: Date.now() },
  { id: "seed-dubai", lat: 25.2048, lng: 55.2708, city: "Dubai", country: "AE", ts: Date.now() },
  { id: "seed-lagos", lat: 6.5244, lng: 3.3792, city: "Lagos", country: "NG", ts: Date.now() },
];

export default function DiasporaGlobe({ theme }: { theme: any }) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const [size, setSize] = useState(220);
  const [minimized, setMinimized] = useState(false);
  const [pulses, setPulses] = useState<Visitor[]>([]);
  const [dots, setDots] = useState<Visitor[]>(SEED_NODES);
  const [totalNodes, setTotalNodes] = useState(SEED_NODES.length);
  const [hovered, setHovered] = useState(false);

  const cyan = "#00f0ff";

  const addVisitor = useCallback((v: Visitor) => {
    setPulses((p) => [...p, v]);
    setDots((d) => {
      // de-dupe by id
      const filtered = d.filter((x) => x.id !== v.id);
      return [...filtered, v];
    });
    setTotalNodes((n) => n + 1);

    // expire pulse — track timeout so we can clean up on unmount
    const pulseTo = window.setTimeout(() => {
      setPulses((p) => p.filter((x) => x.id !== v.id));
    }, PULSE_LIFE);
    timeoutsRef.current.push(pulseTo);

    // expire dot (but keep seeds forever)
    if (!v.id.startsWith("seed-")) {
      const dotTo = window.setTimeout(() => {
        setDots((d) => d.filter((x) => x.id !== v.id));
      }, DOT_LIFE);
      timeoutsRef.current.push(dotTo);
    }
  }, []);

  // Cleanup any pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // Configure globe controls once mounted
  useEffect(() => {
    if (!globeEl.current) return;
    const controls = globeEl.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;
    controls.enablePan = false;
    // Center initial view on Nigeria
    globeEl.current.pointOfView({ lat: 9.082, lng: 8.6753, altitude: 2.4 }, 0);
  }, [minimized]);

  // Geolocate current visitor + subscribe to broadcasts
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("visitor-location", {
          body: {},
        });
        if (!cancelled && !error && data?.lat != null && data?.lng != null) {
          // Self-pulse immediately (broadcast also arrives but de-dupe handles it)
          addVisitor({
            id: data.id || `self-${Date.now()}`,
            lat: data.lat,
            lng: data.lng,
            city: data.city,
            country: data.country,
            ts: Date.now(),
          });
        }
      } catch (e) {
        console.warn("[DiasporaGlobe] geolocation failed", e);
      }
    })();

    const channel = supabase
      .channel("diaspora-uplink")
      .on("broadcast", { event: "new-visitor" }, (payload: any) => {
        const v = payload?.payload as Visitor;
        if (v?.lat != null && v?.lng != null) addVisitor(v);
      })
      .subscribe();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [addVisitor]);

  // Responsive size
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setSize(w < 480 ? 160 : w < 768 ? 190 : 240);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="mono"
        style={{
          position: "fixed",
          top: 96,
          right: 16,
          zIndex: 60,
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${cyan}66`,
          color: cyan,
          padding: "8px 12px",
          fontSize: 10,
          letterSpacing: "0.18em",
          borderRadius: 8,
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          boxShadow: `0 0 16px ${cyan}33`,
        }}
        aria-label="Open Diaspora Globe"
      >
        ▲ SIGINT_UPLINK
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        top: 96,
        right: 16,
        width: size,
        zIndex: 60,
        borderRadius: 14,
        padding: 10,
        background: "rgba(5,8,12,0.55)",
        border: `1px solid ${cyan}40`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${cyan}22, inset 0 0 24px ${cyan}11`,
        fontFamily: "'JetBrains Mono', monospace",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: cyan,
              boxShadow: `0 0 8px ${cyan}`,
              animation: "diasporaPulse 1.6s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 8, letterSpacing: "0.22em", color: cyan, fontWeight: 700 }}>
            SIGINT: GLOBAL UPLINK
          </span>
        </div>
        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimize globe"
          style={{
            background: "transparent",
            border: "none",
            color: `${cyan}aa`,
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ─
        </button>
      </div>

      {/* Globe */}
      <div style={{ position: "relative", width: size - 20, height: size - 20, margin: "0 auto" }}>
        <Globe
          ref={globeEl}
          width={size - 20}
          height={size - 20}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor={cyan}
          atmosphereAltitude={0.18}
          showGlobe
          globeImageUrl={null as any}
          showGraticules
          // Subtle dark sphere with cyan grid
          // @ts-ignore
          globeMaterial={undefined}
          pointsData={dots}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={() => cyan}
          pointAltitude={0.01}
          pointRadius={0.45}
          pointsMerge={false}
          ringsData={pulses}
          ringLat={(d: any) => d.lat}
          ringLng={(d: any) => d.lng}
          ringColor={() => (t: number) => `rgba(0,240,255,${1 - t})`}
          ringMaxRadius={4}
          ringPropagationSpeed={2}
          ringRepeatPeriod={PULSE_LIFE}
          enablePointerInteraction={false}
        />
      </div>

      {/* HUD overlay */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 8,
          letterSpacing: "0.18em",
          color: `${cyan}cc`,
        }}
      >
        <span>DIASPORA NODES</span>
        <span style={{ color: cyan, fontWeight: 700 }}>{totalNodes.toString().padStart(3, "0")}</span>
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: -22,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 7,
            letterSpacing: "0.2em",
            color: `${cyan}88`,
          }}
        >
          ANON GEOLOCATION · NO IP STORED
        </div>
      )}

      <style>{`
        @keyframes diasporaPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
