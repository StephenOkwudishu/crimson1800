// Visitor geolocation + Realtime broadcast.
// Resolves the caller's IP to approximate lat/lng via ip-api.com, then
// broadcasts the anonymized location to all clients subscribed to the
// "diaspora-uplink" channel. IPs are NEVER stored.

import { corsHeaders } from "npm:@supabase/supabase-js/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract caller IP (ephemeral — not stored)
    const xff = req.headers.get("x-forwarded-for") || "";
    const ip = xff.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";

    let geo: any = null;
    if (ip && !ip.startsWith("127.") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
      try {
        const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
        if (r.ok) {
          const d = await r.json();
          if (d.status === "success") geo = d;
        }
      } catch (e) {
        console.warn("ip-api lookup failed", e);
      }
    }

    // Fallback: ip-api on the function's egress IP (will be the edge's IP, not caller)
    if (!geo) {
      try {
        const r = await fetch("http://ip-api.com/json/?fields=status,country,countryCode,city,lat,lon");
        if (r.ok) {
          const d = await r.json();
          if (d.status === "success") geo = d;
        }
      } catch {}
    }

    if (!geo) {
      return new Response(JSON.stringify({ error: "geolocation_unavailable" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const visitor = {
      id: `v-${crypto.randomUUID()}`,
      lat: geo.lat,
      lng: geo.lon,
      city: geo.city,
      country: geo.countryCode || geo.country,
      ts: Date.now(),
    };

    // Broadcast via Supabase Realtime so all clients see the new pulse
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);
      const channel = supabase.channel("diaspora-uplink");
      await new Promise<void>((resolve) => {
        channel.subscribe((status: string) => {
          if (status === "SUBSCRIBED") resolve();
        });
        // safety timeout
        setTimeout(() => resolve(), 1500);
      });
      await channel.send({
        type: "broadcast",
        event: "new-visitor",
        payload: visitor,
      });
      await supabase.removeChannel(channel);
    } catch (e) {
      console.warn("broadcast failed", e);
    }

    return new Response(JSON.stringify(visitor), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("visitor-location error", error);
    const msg = error instanceof Error ? error.message : "unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
