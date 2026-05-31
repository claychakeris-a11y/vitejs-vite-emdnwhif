// @ts-nocheck
// @ts-nocheck
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://oyggssogwjerhaybhaps.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Z2dzc29nd2plcmhheWJoYXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0ODIsImV4cCI6MjA5NTc3MjQ4Mn0.RI62XIes5Y-xYtdAg-Nq8vVNI4C2QG9KeYPpVBt1TDE";
const STRIPE_BASIC = "https://buy.stripe.com/bJe5kDfwM5Og8CR82KcAo00";

// Supabase auth helpers
async function supabaseRequest(path, method, body) {
  const res = await fetch(SUPABASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON, "Authorization": "Bearer " + SUPABASE_ANON },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function signUp(email, password) {
  return supabaseRequest("/auth/v1/signup", "POST", { email, password });
}

async function signIn(email, password) {
  return supabaseRequest("/auth/v1/token?grant_type=password", "POST", { email, password });
}

async function resetPassword(email) {
  return supabaseRequest("/auth/v1/recover", "POST", { email });
}

const BEACHES = [
  {
    id: "iop", name: "Isle of Palms", short: "IOP", emoji: "🏄",
    lat: 32.7874, lon: -79.7715, color: "#0ea5e9", bg: "#f0f9ff", border: "#7dd3fc",
    description: "Known for consistent sandbars and the county park break. Best at low to mid incoming tide with NE swell.",
    hotspot: "County Park beach access", fishing: "Pompano and whiting off the pier",
    bestSwell: "NE to E at 8s+", bestWind: "W or NW offshore", bestTide: "Low to mid incoming",
    surflineUrl: "https://www.surfline.com/surf-report/isle-of-palms/5842041f4e65fad6a7708b46",
  },
  {
    id: "sullivan", name: "Sullivan's Island", short: "Sullivan's", emoji: "🌊",
    lat: 32.7654, lon: -79.8364, color: "#8b5cf6", bg: "#f5f3ff", border: "#c4b5fd",
    description: "Quieter and more consistent than IOP. Great for longboarding. Works well on smaller NE swells.",
    hotspot: "Station 22.5 access — uncrowded", fishing: "Redfish and flounder surf fishing",
    bestSwell: "NE at 9s+", bestWind: "W or SW offshore", bestTide: "Mid incoming to high",
    surflineUrl: "https://www.surfline.com/surf-report/sullivans-island/5842041f4e65fad6a7708b7e",
  },
  {
    id: "folly", name: "Folly Beach", short: "Folly", emoji: "🤙",
    lat: 32.6554, lon: -79.9403, color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d",
    description: "The Edge of America. Most consistent break in the Charleston area. Pier works at all tides.",
    hotspot: "Folly Pier area — works at all tides", fishing: "Best pier fishing in Charleston",
    bestSwell: "Any E to NE at 7s+", bestWind: "W or NW offshore", bestTide: "Mid to high near pier",
    surflineUrl: "https://www.surfline.com/surf-report/folly-beach/5842041f4e65fad6a7708882",
  },
];

const WIND_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function degToDir(deg) { return WIND_DIRS[Math.round(deg / 22.5) % 16]; }
function mpsToMph(mps) { return Math.round(mps * 2.237); }
function metersToFeet(m) { return (m * 3.281).toFixed(1); }

function getSurfScore(waveH, period, windMph, isOffshore) {
  let s = 0;
  const ft = waveH * 3.281;
  if (ft < 0.5) s = 0; else if (ft < 1) s = 1; else if (ft < 2) s = 2;
  else if (ft < 3) s = 3; else if (ft < 4) s = 4; else s = 5;
  if (period >= 12) s += 2; else if (period >= 10) s += 1.5;
  else if (period >= 8) s += 1; else if (period < 6) s -= 1;
  if (isOffshore && windMph < 5) s += 1; else if (isOffshore) s += 0.5;
  else if (windMph > 15) s -= 1;
  return Math.max(0, Math.min(10, Math.round(s)));
}

function getSurfLabel(score) {
  if (score >= 8) return { label: "EPIC",  color: "#dc2626", emoji: "🔥", score };
  if (score >= 6) return { label: "GOOD",  color: "#16a34a", emoji: "✅", score };
  if (score >= 4) return { label: "FAIR",  color: "#d97706", emoji: "👍", score };
  if (score >= 2) return { label: "POOR",  color: "#6b7280", emoji: "😐", score };
  return                { label: "FLAT",  color: "#9ca3af", emoji: "😴", score };
}

function getFishLabel(waveH, windMph) {
  const ft = waveH * 3.281;
  if (ft > 4 || windMph > 20) return { label: "Rough", color: "#dc2626" };
  if (ft > 2 || windMph > 15) return { label: "Okay",  color: "#d97706" };
  return { label: "Great", color: "#16a34a" };
}

function getMockData(id) {
  const base = {
    iop:      { wave_height: 0.6, wave_period: 8,  wave_direction: 45,  windspeed: 4.5, winddirection: 270, temperature: 27 },
    sullivan: { wave_height: 0.5, wave_period: 7,  wave_direction: 50,  windspeed: 5.0, winddirection: 260, temperature: 27 },
    folly:    { wave_height: 0.7, wave_period: 9,  wave_direction: 40,  windspeed: 4.0, winddirection: 280, temperature: 27 },
  };
  return base[id] || base.iop;
}

const MOCK_TIDES = [
  { type: "H", height: "5.4", time: "6:12 AM" },
  { type: "L", height: "0.8", time: "12:34 PM" },
  { type: "H", height: "5.7", time: "6:48 PM" },
  { type: "L", height: "0.6", time: "1:02 AM" },
];

function WaveAnimation({ color, height }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setOffset(o => (o + 1) % 200), 50);
    return () => clearInterval(iv);
  }, []);
  const waveCount = Math.max(1, Math.min(5, Math.round(parseFloat(height))));
  return (
    <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0 }}>
      {[...Array(waveCount)].map((_, i) => (
        <path key={i}
          d={`M ${-offset + i * 40} 60 Q ${-offset + i * 40 + 50} ${40 - i * 5} ${-offset + i * 40 + 100} 60 Q ${-offset + i * 40 + 150} ${80 - i * 5} ${-offset + i * 40 + 200} 60 Q ${-offset + i * 40 + 250} ${40 - i * 5} ${-offset + i * 40 + 300} 60 Q ${-offset + i * 40 + 350} ${80 - i * 5} ${-offset + i * 40 + 400} 60 L 400 80 L 0 80 Z`}
          fill={color} opacity={0.15 + i * 0.05}
        />
      ))}
    </svg>
  );
}

function WindArrow({ deg, color, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${deg}deg)` }}>
      <polygon points="16,2 20,20 16,17 12,20" fill={color} opacity="0.9"/>
      <polygon points="16,30 20,12 16,15 12,12" fill={color} opacity="0.4"/>
    </svg>
  );
}

function CamWidget({ beach, data }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const windMph    = mpsToMph(data.windspeed);
  const windDir    = degToDir(data.winddirection);
  const isOffshore = data.winddirection >= 180 && data.winddirection <= 360;
  const heightFt   = metersToFeet(data.wave_height);
  const period     = Math.round(data.wave_period);
  const score      = getSurfScore(data.wave_height, period, windMph, isOffshore);
  const surf       = getSurfLabel(score);
  const tempF      = Math.round(data.temperature * 9/5 + 32);
  const hour = time.getHours();
  const isNight = hour < 6 || hour >= 20;
  const isDawnDusk = (hour >= 6 && hour < 8) || (hour >= 18 && hour < 20);
  const sky1 = isNight ? "#0c1445" : isDawnDusk ? "#c2410c" : "#1a6bb5";
  const sky2 = isNight ? "#1a237e" : isDawnDusk ? "#f97316" : "#42a5f5";
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${beach.color}50`, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
      <div style={{ height: 190, position: "relative", background: `linear-gradient(180deg, ${sky1} 0%, ${sky2} 45%, #1565c0 65%, #0d47a1 80%, #01579b 100%)`, overflow: "hidden" }}>
        {isNight && [...Array(18)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 2, height: 2, background: "#fff", borderRadius: "50%", top: `${(i * 13 + 5) % 42}%`, left: `${(i * 19 + 3) % 100}%`, opacity: 0.7 }} />
        ))}
        <div style={{ position: "absolute", top: 18, right: 36, width: isNight ? 26 : 34, height: isNight ? 26 : 34, borderRadius: "50%", background: isNight ? "#f5f0e8" : "#ffd54f", boxShadow: isNight ? "0 0 10px #f5f0e860" : "0 0 20px #ffd54f80" }} />
        <WaveAnimation color={beach.color} height={heightFt} />
        <div style={{ position: "absolute", top: 10, left: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#fff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>● LIVE CAM</span>
        </div>
        <div style={{ position: "absolute", top: 10, right: 12 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#fff", fontWeight: 700, background: "rgba(0,0,0,0.45)", borderRadius: 6, padding: "3px 8px" }}>{beach.short}</span>
        </div>
        <div style={{ position: "absolute", bottom: 88, left: 12 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.7)", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
            {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 88, right: 12, background: surf.color, borderRadius: 8, padding: "3px 10px" }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#fff", fontWeight: 800 }}>{surf.label}</span>
        </div>
      </div>
      <div style={{ background: "#0c1c2c", padding: "12px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4 }}>
          {[{ label: "WAVES", value: `${heightFt}ft`, icon: "🌊" }, { label: "PERIOD", value: `${period}s`, icon: "⏱️" }, { label: "WIND", value: `${windMph}mph`, icon: "💨" }, { label: "DIR", arrow: true }, { label: "TEMP", value: `${tempF}°F`, icon: "🌡️" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</div>
              {s.arrow ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <WindArrow deg={data.winddirection} color={isOffshore ? "#4ade80" : "#f87171"} size={24} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: isOffshore ? "#4ade80" : "#f87171" }}>{windDir}</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, marginBottom: 1 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#f5f0e8" }}>{s.value}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#0a1520", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>SURF QUALITY</span>
        <div style={{ flex: 1, height: 5, background: "#1e3a5f", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${surf.score * 10}%`, background: surf.color, borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: surf.color, whiteSpace: "nowrap" }}>{surf.score}/10</span>
      </div>
      <div style={{ background: "#0f1e30", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#64748b", marginBottom: 2 }}>Want the real video cam?</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#f5f0e8", fontWeight: 600 }}>View on Surfline ↗</div>
        </div>
        <a href={beach.surflineUrl} target="_blank" rel="noopener noreferrer"
          style={{ background: "#0ea5e9", color: "#fff", borderRadius: 8, padding: "8px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, display: "inline-block", textDecoration: "none" }}>
          Open →
        </a>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, border }) {
  return (
    <div style={{ padding: "13px 8px", textAlign: "center", borderRight: border ? "1px solid #f0ede6" : "none" }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{value}</div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#9b9590", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function BeachCard({ beach, data, tides }) {
  const [open, setOpen] = useState(false);
  const windMph    = mpsToMph(data.windspeed);
  const windDir    = degToDir(data.winddirection);
  const isOffshore = data.winddirection >= 180 && data.winddirection <= 360;
  const period     = Math.round(data.wave_period);
  const heightFt   = metersToFeet(data.wave_height);
  const score      = getSurfScore(data.wave_height, period, windMph, isOffshore);
  const surf       = getSurfLabel(score);
  const fish       = getFishLabel(data.wave_height, windMph);
  const tempF      = Math.round(data.temperature * 9/5 + 32);
  const periodColor = period >= 11 ? "#16a34a" : period >= 8 ? "#d97706" : "#dc2626";
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${beach.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden" }}>
      <div style={{ background: beach.bg, padding: "14px 18px", borderBottom: `1px solid ${beach.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{beach.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{beach.name}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6b7280" }}>{beach.description.split(".")[0]}.</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: surf.color }}>{surf.emoji} {surf.label}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: beach.color }}>{heightFt}ft</div>
          </div>
          <span style={{ color: "#c4bdb5", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: open ? "1px solid #f0ede6" : "none" }}>
        <StatBox label="WAVES"   value={`${heightFt}ft`}  sub={`${period}s period`}                       border />
        <StatBox label="WIND"    value={`${windMph}mph`}   sub={`${windDir} ${isOffshore ? "🟢" : "🔴"}`} border />
        <StatBox label="SURF"    value={surf.label}        sub={`${score}/10`}                             border />
        <StatBox label="FISHING" value={fish.label}        sub="🎣"                                        border={false} />
      </div>
      {open && (
        <div style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "#f8f6f1", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>🌊 Waves</div>
              {[["Height", `${heightFt} ft`], ["Period", <span style={{ color: periodColor, fontWeight: 700 }}>{period}s {period >= 11 ? "🟢" : period >= 8 ? "🟡" : "🔴"}</span>], ["Direction", degToDir(data.wave_direction)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ede8e0" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7280" }}>{k}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8f6f1", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>💨 Wind</div>
              {[["Speed", `${windMph} mph`], ["Direction", windDir], ["Condition", <span style={{ color: isOffshore ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{isOffshore ? "Offshore 🟢" : "Onshore 🔴"}</span>]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ede8e0" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7280" }}>{k}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>🌊 Today's Tides</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tides.slice(0, 4).map((t, i) => (
                <div key={i} style={{ background: t.type === "H" ? "#eff6ff" : "#fefce8", border: `1px solid ${t.type === "H" ? "#93c5fd" : "#fde047"}`, borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 70 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: t.type === "H" ? "#1d4ed8" : "#a16207" }}>{t.type === "H" ? "HIGH" : "LOW"}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{t.height}ft</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6b7280" }}>{t.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["🌡️ Air Temp", `${tempF}°F`], ["🎣 Fishing", fish.label], ["🏄 Best Tide", beach.bestTide]].map(([k, v]) => (
              <div key={k} style={{ background: beach.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#9b9590", marginBottom: 4 }}>{k}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AUTH SCREENS ─────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const cameFromStripe = localStorage.getItem("surf_came_from_stripe") === "true";
  const [mode, setMode]       = useState(cameFromStripe ? "signup" : "paywall"); // paywall | login | signup | reset
  // Clear the flag once we've used it
  useEffect(() => { if (cameFromStripe) localStorage.removeItem("surf_came_from_stripe"); }, []);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    if (!email || (!password && mode !== "reset")) { setError("Please fill in all fields."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "signup") {
        const res = await signUp(email, password);
        if (res.error) { setError(res.error.message); }
        else { setSuccess("Account created! Check your email to confirm, then sign in."); setMode("login"); }
      } else if (mode === "login") {
        const res = await signIn(email, password);
        if (res.error) { setError(res.error.message); }
        else if (res.access_token) { onAuth(res); }
        else { setError("Login failed. Please try again."); }
      } else {
        const res = await resetPassword(email);
        if (res.error) { setError(res.error.message); }
        else { setSuccess("Password reset email sent! Check your inbox."); }
      }
    } catch (e) { setError("Something went wrong. Try again."); }
    setLoading(false);
  }

  const inputStyle = { width: "100%", background: "#f8f6f1", border: "1.5px solid #e8e3da", borderRadius: 10, padding: "12px 14px", fontFamily: "'Inter',sans-serif", fontSize: 15, color: "#1a1a1a", outline: "none", marginBottom: 12 };

  // ── PAYWALL PAGE ──────────────────────────────────────
  if (mode === "paywall") return (
    <div style={{ background: "#0c1c2c", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;font-family:'Inter',sans-serif;}`}</style>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: "#f5f0e8", marginBottom: 6 }}>🌊 Charleston Surf</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#64748b", marginBottom: 24 }}>IOP · Sullivan's Island · Folly Beach</div>
          <div style={{ display: "inline-block", background: "#0ea5e920", border: "1px solid #0ea5e940", borderRadius: 20, padding: "5px 16px", marginBottom: 18, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#7dd3fc", fontWeight: 600 }}>CHARLESTON'S SURF REPORT</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 700, lineHeight: 1.1, color: "#f5f0e8", marginBottom: 14 }}>Know Before<br /><span style={{ color: "#0ea5e9" }}>You Go.</span></h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: "#94a3b8", fontSize: 16, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>Live wave, wind, tide and cam conditions for all 3 Charleston beaches — in one place.</p>
        </div>

        {/* Blurred preview cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[["🏄","IOP","1.2ft","FAIR"],["🌊","Sullivan's","0.9ft","POOR"],["🤙","Folly","1.5ft","FAIR"]].map(([emoji, name, height, rating]) => (
            <div key={name} style={{ background: "#1e3a5f", border: "1px solid #2d5a8e", borderRadius: 12, padding: "14px 10px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#7dd3fc", marginBottom: 6 }}>{name}</div>
              <div style={{ filter: "blur(5px)" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#f5f0e8" }}>{height}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#d97706" }}>{rating}</div>
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18 }}>🔒</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#475569", textAlign: "center", marginBottom: 24 }}>Subscribe to unlock live conditions ↑</div>

        {/* Plan card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Full Access</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: "#0ea5e9" }}>$2.99</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#9b9590" }}>/month</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590", marginBottom: 2 }}>All</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#0ea5e9" }}>3 beaches 🏄</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 14px", marginBottom: 22 }}>
            {["✅ Live wave & wind data","✅ Animated cam widget","✅ NOAA tide chart","✅ Surf & fishing ratings","✅ Surfline cam links","✅ Beach guide & hot spots","✅ Works on any device","✅ Unlimited daily checks"].map((f, i) => (
              <div key={i} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#374151", fontWeight: 500 }}>{f}</div>
            ))}
          </div>
          <a href={STRIPE_BASIC} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", background: "#0ea5e9", color: "#fff", borderRadius: 12, padding: "15px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, textAlign: "center", boxShadow: "0 4px 16px #0ea5e944", textDecoration: "none" }}>
            Subscribe for $2.99/month →
          </a>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => setMode("login")} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#64748b", fontWeight: 500, cursor: "pointer" }}>
            Already subscribed? Sign in →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0c1c2c", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;font-family:'Inter',sans-serif;} input{font-family:'Inter',sans-serif;}`}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", marginBottom: 4 }}>🌊 Charleston Surf</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#64748b" }}>IOP · Sullivan's · Folly</div>
      </div>

      {/* Wave illustration */}
      <div style={{ height: 120, position: "relative", overflow: "hidden", marginTop: 20 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0c1c2c 0%, #1565c0 60%, #01579b 100%)" }} />
        <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
          <path d="M0 40 Q50 20 100 40 Q150 60 200 40 Q250 20 300 40 Q350 60 400 40 L400 80 L0 80Z" fill="#0ea5e9" opacity="0.3"/>
          <path d="M0 50 Q50 30 100 50 Q150 70 200 50 Q250 30 300 50 Q350 70 400 50 L400 80 L0 80Z" fill="#0ea5e9" opacity="0.2"/>
        </svg>
      </div>

      {/* Auth card */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "0 20px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
            {mode === "login" ? "Welcome back 🤙" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#9b9590", marginBottom: 22, lineHeight: 1.5 }}>
            {mode === "login" ? "Sign in to access live surf conditions." : mode === "signup" ? "Subscribe below then create your account." : "We'll send you a reset link."}
          </p>

          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</div>}
          {success && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#15803d", fontWeight: 500 }}>{success}</div>}

          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor="#0ea5e9"} onBlur={e => e.target.style.borderColor="#e8e3da"} />
          {mode !== "reset" && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor="#0ea5e9"} onBlur={e => e.target.style.borderColor="#e8e3da"} onKeyDown={e => e.key === "Enter" && handleSubmit()} />}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", background: loading ? "#7dd3fc" : "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16, boxShadow: "0 4px 14px #0ea5e944" }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Link →"}
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {mode === "login" && <>
              <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#0ea5e9", fontWeight: 600 }}>Don't have an account? Sign up</button>
              <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#9b9590", fontWeight: 500 }}>Forgot password?</button>
            </>}
            {mode === "signup" && <>
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#0ea5e9", fontWeight: 600 }}>Already have an account? Sign in</button>
              <div style={{ marginTop: 8, background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: 10, padding: "12px 14px", width: "100%" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#0369a1", fontWeight: 600, marginBottom: 6 }}>📋 How to get access:</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#0369a1", lineHeight: 1.6 }}>1. Subscribe for $2.99/month below<br/>2. Come back and create your account<br/>3. Sign in on any device anytime</div>
                <a href={STRIPE_BASIC} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", background: "#0ea5e9", color: "#fff", borderRadius: 8, padding: "9px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, textAlign: "center", marginTop: 10, textDecoration: "none" }}>
                  Subscribe for $2.99/month →
                </a>
              </div>
            </>}
            {mode === "reset" && <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#0ea5e9", fontWeight: 600 }}>Back to sign in</button>}
          </div>

          {mode === "login" && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0ede6", textAlign: "center" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#9b9590", marginBottom: 8 }}>Don't have an account yet?</div>
              <a href={STRIPE_BASIC} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", background: "#0c1c2c", color: "#fff", borderRadius: 8, padding: "9px 20px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Subscribe for $2.99/month →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [beachData, setBeachData] = useState({});
  const [tides, setTides]         = useState(MOCK_TIDES);
  const [loading, setLoading]     = useState(true);
  const [usingLive, setUsingLive] = useState(false);
  const [buoy, setBuoy]           = useState(null);
  const [weather, setWeather]     = useState(null);
  const [updated, setUpdated]     = useState(null);
  const [tab, setTab]             = useState("conditions");
  const [camBeach, setCamBeach]   = useState("iop");

  // Check for existing session in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("surf_session");
    if (saved) {
      try { setUser(JSON.parse(saved)); return; } catch {}
    }
    // Check for ?paid=true redirect from Stripe — send straight to signup
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      // Will be handled in AuthScreen defaulting to signup
      localStorage.setItem("surf_came_from_stripe", "true");
    }
  }, []);

  function handleAuth(session) {
    setUser(session);
    localStorage.setItem("surf_session", JSON.stringify(session));
  }

  function handleSignOut() {
    setUser(null);
    localStorage.removeItem("surf_session");
  }

  async function loadData() {
    setLoading(true);
    const results = {};
    let gotLive = false;
    for (const beach of BEACHES) {
      try {
        const [wRes, mRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lon}&current=temperature_2m,windspeed_10m,winddirection_10m&timezone=America/New_York`),
          fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${beach.lat}&longitude=${beach.lon}&current=wave_height,wave_direction,wave_period&timezone=America/New_York`),
        ]);
        const wJson = await wRes.json();
        const mJson = await mRes.json();
        if (wJson.current && mJson.current) {
          results[beach.id] = { wave_height: mJson.current.wave_height || 0.5, wave_period: mJson.current.wave_period || 8, wave_direction: mJson.current.wave_direction || 45, windspeed: wJson.current.windspeed_10m || 5, winddirection: wJson.current.winddirection_10m || 270, temperature: wJson.current.temperature_2m || 27 };
          gotLive = true;
        } else { results[beach.id] = getMockData(beach.id); }
      } catch { results[beach.id] = getMockData(beach.id); }
    }
    try {
      const today = new Date().toISOString().split("T")[0].replace(/-/g,"");
      const tRes = await fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${today}&range=24&station=8665530&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=web_services&format=json`);
      const tJson = await tRes.json();
      if (tJson.predictions) {
        const now = new Date();
        const upcoming = tJson.predictions.filter(p => new Date(p.t) > now).map(p => ({ type: p.type, height: parseFloat(p.v).toFixed(1), time: new Date(p.t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }));
        if (upcoming.length > 0) setTides(upcoming);
      }
    } catch {}

    // Fetch general weather for Charleston
    try {
      const wxRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=32.776&longitude=-79.931&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,windspeed_10m,winddirection_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=America/New_York&forecast_days=3");
      const wxJson = await wxRes.json();
      if (wxJson.current) setWeather(wxJson);
    } catch {}

    // Fetch NOAA Buoy 41004 (Charleston offshore buoy)
    try {
      const buoyRes = await fetch("https://www.ndbc.noaa.gov/data/realtime2/41004.txt");
      const buoyText = await buoyRes.text();
      const lines = buoyText.trim().split("\n");
      // Line 0 is headers, line 1 is units, line 2 is most recent data
      if (lines.length >= 3) {
        const headers = lines[0].replace(/#/g,"").trim().split(/\s+/);
        const values  = lines[2].trim().split(/\s+/);
        const get = (key) => {
          const i = headers.indexOf(key);
          return i >= 0 ? values[i] : "MM";
        };
        const wvht  = get("WVHT");
        const dpd   = get("DPD");
        const mwd   = get("MWD");
        const wtmp  = get("WTMP");
        const wspd  = get("WSPD");
        const wdir  = get("WDIR");
        const atmp  = get("ATMP");
        setBuoy({ wvht, dpd, mwd, wtmp, wspd, wdir, atmp, raw: lines[2] });
      }
    } catch { /* keep null buoy */ }
    setBeachData(results); setUsingLive(gotLive);
    setUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    setLoading(false);
  }

  useEffect(() => { if (user) loadData(); }, [user]);

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const overallScore = Object.keys(beachData).length > 0
    ? Math.round(BEACHES.map(b => { const d = beachData[b.id]; if (!d) return 0; return getSurfScore(d.wave_height, d.wave_period, mpsToMph(d.windspeed), d.winddirection >= 180); }).reduce((a, c) => a + c, 0) / BEACHES.length)
    : null;
  const overall = overallScore !== null ? getSurfLabel(overallScore) : null;

  const GS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:#f0f4f8;} button{cursor:pointer;font-family:'Inter',sans-serif;} a{text-decoration:none;}`;

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>
      <style>{GS}</style>
      <div style={{ background: "#0c1c2c", padding: "0 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#f5f0e8" }}>🌊 Charleston Surf</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#64748b", marginTop: 2 }}>IOP · Sullivan's · Folly{updated && ` · Updated ${updated}`}{!usingLive && !loading && " · Sample data"}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadData} style={{ background: "#1e3a5f", border: "1px solid #2d5a8e", borderRadius: 8, padding: "8px 12px", color: "#7dd3fc", fontSize: 13, fontWeight: 600 }}>{loading ? "..." : "↻"}</button>
              <button onClick={handleSignOut} style={{ background: "#1e3a5f", border: "1px solid #2d5a8e", borderRadius: 8, padding: "8px 12px", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Sign Out</button>
            </div>
          </div>
          {overall && !loading && (
            <div style={{ background: "#1e3a5f", border: "1px solid #2d5a8e", borderRadius: 12, padding: "12px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Overall Conditions</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: overall.color }}>{overall.emoji} {overall.label}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#64748b", marginBottom: 4 }}>Surf Score</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "#7dd3fc" }}>{overallScore}<span style={{ fontSize: 14, color: "#64748b" }}>/10</span></div>
              </div>
            </div>
          )}
          {loading && <div style={{ background: "#1e3a5f", borderRadius: 12, padding: "14px 18px", marginBottom: 14, textAlign: "center" }}><div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#7dd3fc" }}>🌊 Loading live conditions...</div></div>}
          <div style={{ display: "flex", gap: 4 }}>
            {[["conditions","🌊 Conditions"],["cams","📷 Cams"],["tides","🌊 Tides"],["buoy","📡 Buoy"],["weather","⛅ Weather"],["guide","📖 Guide"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? "#f0f4f8" : "transparent", border: "none", borderRadius: "10px 10px 0 0", padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: tab === id ? "#1a1a1a" : "#64748b" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 60px" }}>
        {tab === "conditions" && (
          <div>
            {BEACHES.map(beach => <BeachCard key={beach.id} beach={beach} data={beachData[beach.id] || getMockData(beach.id)} tides={tides} />)}
            <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Wave Period Guide</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["🔴","6s or less","Wind chop — choppy & weak"],["🟡","7–8s","Short period — mushy"],["🟡","9–10s","Decent — some shape"],["🟢","11–12s","Good groundswell"],["🔵","13s+","Excellent — rare for SC 🔥"],["🟢","Offshore wind","Grooms waves = better shape"]].map(([dot, period, desc]) => (
                  <div key={period} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, marginTop: 2 }}>{dot}</span>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{period}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#9b9590" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "cams" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {BEACHES.map(b => (
                <button key={b.id} onClick={() => setCamBeach(b.id)} style={{ flex: 1, background: camBeach === b.id ? b.color : "#fff", border: `1.5px solid ${camBeach === b.id ? b.color : "#e8e3da"}`, borderRadius: 10, padding: "10px 8px", color: camBeach === b.id ? "#fff" : "#6b7280", fontWeight: 700, fontSize: 13 }}>
                  {b.emoji} {b.short}
                </button>
              ))}
            </div>
            <CamWidget beach={BEACHES.find(b => b.id === camBeach)} data={beachData[camBeach] || getMockData(camBeach)} />
            <div style={{ marginTop: 14, background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "14px 18px" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>All Live Cams</div>
              {BEACHES.map(b => (
                <a key={b.id} href={b.surflineUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: b.bg, borderRadius: 10, marginBottom: 8, border: `1px solid ${b.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{b.name}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6b7280" }}>View live video on Surfline</div>
                    </div>
                  </div>
                  <div style={{ background: b.color, color: "#fff", borderRadius: 8, padding: "6px 12px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13 }}>Open ↗</div>
                </a>
              ))}
            </div>
          </div>
        )}
        {tab === "tides" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 16, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Charleston Tide Chart</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#9b9590", marginBottom: 18 }}>NOAA Station 8665530 · Applies to all three beaches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tides.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: t.type === "H" ? "#eff6ff" : "#fefce8", border: `1px solid ${t.type === "H" ? "#93c5fd" : "#fde047"}`, borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: t.type === "H" ? "#1d4ed8" : "#a16207", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{t.type}</div>
                      <div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700 }}>{t.type === "H" ? "High Tide" : "Low Tide"}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7280" }}>{t.time}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: t.type === "H" ? "#1d4ed8" : "#a16207" }}>{t.height} ft</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Tide Tips</div>
              {[["🏄","Surfing","Low to mid incoming tide is the sweet spot. Sandbars are defined and waves have more push."],["🎣","Fishing","2 hours before and after high tide is prime. Fish move with the tidal flow."],["🏖️","Swimming","Mid tide is safest. Low tide can expose hazardous sandbars and rip currents."],["📏","SC Tidal Range","Charleston has a 5–6 ft tidal range — one of the largest on the East Coast. Tide dramatically affects conditions."]].map(([emoji, label, tip]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0ede6" }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590", lineHeight: 1.5 }}>{tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "buoy" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 16, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0c1c2c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📡</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>NOAA Buoy 41004</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7280" }}>Charleston Offshore · ~41 miles SE of Charleston</div>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6b7280", lineHeight: 1.65, marginBottom: 20 }}>
                Buoy 41004 is the primary offshore buoy for the Charleston area. It measures raw ocean swell before it reaches the beach — what you see here is what's coming your way in the next few hours.
              </p>

              {buoy ? (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Wave Height", value: buoy.wvht !== "MM" ? `${(parseFloat(buoy.wvht) * 3.281).toFixed(1)} ft` : "N/A", sub: `${buoy.wvht}m raw`, icon: "🌊", color: "#0ea5e9" },
                      { label: "Dominant Period", value: buoy.dpd !== "MM" ? `${buoy.dpd}s` : "N/A", sub: parseFloat(buoy.dpd) >= 10 ? "Good swell 🟢" : parseFloat(buoy.dpd) >= 7 ? "Decent 🟡" : "Wind chop 🔴", icon: "⏱️", color: "#8b5cf6" },
                      { label: "Wind Speed", value: buoy.wspd !== "MM" ? `${Math.round(parseFloat(buoy.wspd) * 1.944)} kts` : "N/A", sub: `${buoy.wspd} m/s`, icon: "💨", color: "#f59e0b" },
                      { label: "Water Temp", value: buoy.wtmp !== "MM" ? `${Math.round(parseFloat(buoy.wtmp) * 9/5 + 32)}°F` : "N/A", sub: `${buoy.wtmp}°C`, icon: "🌡️", color: "#16a34a" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#f8f6f1", borderRadius: 12, padding: "16px 18px" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.icon} {s.label}</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590" }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Swell direction */}
                  {buoy.mwd !== "MM" && (
                    <div style={{ background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: 12, padding: "14px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#0369a1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Mean Wave Direction</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0ea5e9" }}>{degToDir(parseFloat(buoy.mwd))} ({buoy.mwd}°)</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#0369a1", marginTop: 4 }}>
                          {parseFloat(buoy.mwd) >= 0 && parseFloat(buoy.mwd) <= 135 ? "NE/E swell — good for SC beaches 🟢" : "SW/W swell — less ideal for SC 🟡"}
                        </div>
                      </div>
                      <div style={{ fontSize: 40 }}>🧭</div>
                    </div>
                  )}

                  {/* Air temp */}
                  {buoy.atmp !== "MM" && (
                    <div style={{ background: "#f8f6f1", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6b7280", fontWeight: 500 }}>🌡️ Air Temperature</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>{Math.round(parseFloat(buoy.atmp) * 9/5 + 32)}°F</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#9b9590", fontWeight: 500, marginBottom: 8 }}>Buoy data unavailable right now</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#c4bdb5" }}>NDBC may be offline or rate limiting. Try refreshing.</div>
                </div>
              )}
            </div>

            {/* Buoy explainer */}
            <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 20px", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How To Read Buoy Data</div>
              {[
                ["📡", "What is a buoy?", "A floating sensor anchored offshore that measures raw ocean conditions in real time. Buoy 41004 sits 41 miles SE of Charleston and is the most relevant for our beaches."],
                ["🌊", "Wave Height (WVHT)", "Significant wave height in meters — converted to feet here. This is the average of the top 1/3 of all waves. Actual max waves will be higher."],
                ["⏱️", "Dominant Period (DPD)", "Seconds between wave sets. Higher = better quality. 10s+ means real groundswell is arriving. Under 7s is wind chop."],
                ["🧭", "Wave Direction (MWD)", "Where the swell is coming FROM. For SC beaches, NE to E (45°–90°) is ideal as it hits our coastline at the right angle."],
                ["⚡", "Buoy vs Beach", "Buoy readings are offshore — by the time swell reaches the beach it loses about 20-30% of its height depending on tide and sandbars."],
              ].map(([emoji, label, tip]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0ede6" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590", lineHeight: 1.55 }}>{tip}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Link to NDBC */}
            <a href="https://www.ndbc.noaa.gov/station_page.php?station=41004" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0c1c2c", border: "1px solid #1e3a5f", borderRadius: 14, padding: "16px 20px", textDecoration: "none" }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#64748b", marginBottom: 3 }}>View full buoy data on NOAA</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: "#7dd3fc", fontWeight: 700 }}>NDBC Station 41004 ↗</div>
              </div>
              <span style={{ fontSize: 24 }}>📡</span>
            </a>
          </div>
        )}

        {tab === "weather" && (
          <div>
            {/* Weather code helper */}
            {(() => {
              const WX_ICONS = { 0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️", 61:"🌧️", 63:"🌧️", 65:"🌧️", 71:"🌨️", 73:"🌨️", 75:"❄️", 80:"🌦️", 81:"🌧️", 82:"⛈️", 95:"⛈️", 96:"⛈️", 99:"⛈️" };
              const WX_DESC = { 0:"Clear Sky", 1:"Mainly Clear", 2:"Partly Cloudy", 3:"Overcast", 45:"Foggy", 48:"Foggy", 51:"Light Drizzle", 53:"Drizzle", 55:"Heavy Drizzle", 61:"Light Rain", 63:"Rain", 65:"Heavy Rain", 71:"Light Snow", 73:"Snow", 75:"Heavy Snow", 80:"Light Showers", 81:"Showers", 82:"Heavy Showers", 95:"Thunderstorm", 96:"Thunderstorm", 99:"Thunderstorm" };
              const UVI_COLOR = (uv) => uv <= 2 ? "#16a34a" : uv <= 5 ? "#d97706" : uv <= 7 ? "#ea580c" : "#dc2626";
              const UVI_LABEL = (uv) => uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : "Very High";

              if (!weather) return (
                <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 16, padding: "28px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⛅</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#9b9590" }}>Loading weather data...</div>
                </div>
              );

              const c = weather.current;
              const d = weather.daily;
              const code = c.weather_code || 0;
              const icon = WX_ICONS[code] || "🌤️";
              const desc = WX_DESC[code] || "Clear";
              const tempF = Math.round(c.temperature_2m * 9/5 + 32);
              const feelsF = Math.round(c.apparent_temperature * 9/5 + 32);
              const uv = c.uv_index || 0;
              const humidity = c.relative_humidity_2m || 0;
              const cloud = c.cloud_cover || 0;
              const precip = c.precipitation || 0;

              return (
                <div>
                  {/* Current conditions hero */}
                  <div style={{ background: "linear-gradient(135deg, #0c1c2c, #1e3a5f)", border: "1px solid #2d5a8e", borderRadius: 20, padding: "28px 24px", marginBottom: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 700, color: "#f5f0e8", marginBottom: 4 }}>{tempF}°F</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, color: "#7dd3fc", fontWeight: 600, marginBottom: 4 }}>{desc}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#64748b" }}>Feels like {feelsF}°F · Charleston, SC</div>
                  </div>

                  {/* Stat grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[
                      { icon: "💧", label: "Humidity",    value: `${humidity}%`,     sub: humidity > 80 ? "Very humid" : humidity > 60 ? "Humid" : "Comfortable" },
                      { icon: "☁️",  label: "Cloud Cover", value: `${cloud}%`,        sub: cloud > 80 ? "Overcast" : cloud > 40 ? "Partly cloudy" : "Mostly clear" },
                      { icon: "🌧️", label: "Precip Now",  value: `${precip}mm`,      sub: precip > 0 ? "Currently raining" : "Dry right now" },
                      { icon: "🕶️", label: "UV Index",    value: `${uv} ${UVI_LABEL(uv)}`, sub: uv > 5 ? "Wear sunscreen!" : "Minimal risk" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 18px" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.icon} {s.label}</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590" }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* UV bar */}
                  <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>🕶️ UV Index</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: UVI_COLOR(uv) }}>{uv} — {UVI_LABEL(uv)}</span>
                    </div>
                    <div style={{ height: 8, background: "linear-gradient(90deg, #16a34a, #eab308, #ea580c, #dc2626)", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ position: "relative", height: 16 }}>
                      <div style={{ position: "absolute", left: `${Math.min(uv/12*100,100)}%`, top: 0, transform: "translateX(-50%)" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: UVI_COLOR(uv), border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#9b9590" }}>
                      <span>Low</span><span>Moderate</span><span>High</span><span>Very High</span>
                    </div>
                  </div>

                  {/* 3-day forecast */}
                  <div style={{ background: "#fff", border: "1px solid #e8e3da", borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#9b9590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>3-Day Forecast</div>
                    {d && d.temperature_2m_max && [0,1,2].map(i => {
                      const dayCode = i === 0 ? code : 1;
                      const dayIcon = WX_ICONS[dayCode] || "🌤️";
                      const maxF = Math.round(d.temperature_2m_max[i] * 9/5 + 32);
                      const minF = Math.round(d.temperature_2m_min[i] * 9/5 + 32);
                      const rain = d.precipitation_sum[i] || 0;
                      const uvMax = d.uv_index_max[i] || 0;
                      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(Date.now() + i*86400000).toLocaleDateString("en-US",{weekday:"short"});
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid #f0ede6" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                            <span style={{ fontSize: 24 }}>{dayIcon}</span>
                            <div>
                              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{dayName}</div>
                              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#9b9590" }}>{rain > 0 ? `${rain.toFixed(1)}mm rain` : "No rain"} · UV {uvMax}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{maxF}°</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#9b9590", marginLeft: 4 }}>{minF}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === "guide" && (
          <div>
            {BEACHES.map(beach => (
              <div key={beach.id} style={{ background: "#fff", border: `1.5px solid ${beach.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 26 }}>{beach.emoji}</span>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>{beach.name}</div>
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>{beach.description}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["Best Swell", beach.bestSwell],["Best Wind", beach.bestWind],["Best Tide", beach.bestTide],["Hot Spot", beach.hotspot],["Fishing", beach.fishing]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: beach.bg, borderRadius: 8 }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{k}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#1a1a1a", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#c4bdb5" }}>Data from Open-Meteo & NOAA · Always verify conditions before entering water</p>
        </div>
      </div>
    </div>
  );
}
