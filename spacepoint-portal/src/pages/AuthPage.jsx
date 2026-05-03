import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ─── Mission countdown target (change to real date) ───────────────────────────
const LAUNCH_TARGET = new Date("2026-06-15T00:00:00Z");

function useCountdown(target) {
  const [time, setTime] = useState({ d: "00", h: "00", m: "00", s: "00" });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

// ─── Starfield canvas ─────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.1,
      a: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = s.a + Math.sin(t * s.speed * 60 + s.phase) * 0.12;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
        ctx.fill();
      });
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const countdown = useCountdown(LAUNCH_TARGET);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate("/dashboard");
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        navigate("/onboarding");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#04040A",
        color: "#E8E8F0",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          color: #E8E8F0;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 300;
          padding: 12px 0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .sp-input::placeholder { color: rgba(255,255,255,0.2); }
        .sp-input:focus {
          border-color: #00E5FF;
          box-shadow: 0 1px 0 0 rgba(0,229,255,0.3);
        }

        .data-val {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #E8E8F0;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .data-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #444460;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .countdown-digit {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 3.5vw, 48px);
          color: #E8E8F0;
          line-height: 1;
          letter-spacing: -0.04em;
          min-width: 52px;
          text-align: center;
        }
        .countdown-sep {
          font-family: 'Space Mono', monospace;
          font-size: 24px;
          color: rgba(0,229,255,0.4);
          align-self: flex-start;
          padding-top: 4px;
        }

        .btn-launch {
          width: 100%;
          background: #00E5FF;
          color: #04040A;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 16px 0;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
        }
        .btn-launch:hover { background: #fff; transform: translateY(-1px); }
        .btn-launch:active { transform: translateY(0); }
        .btn-launch:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .mode-tab {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #444460;
          cursor: pointer;
          padding-bottom: 8px;
          border-bottom: 1px solid transparent;
          transition: color 0.2s, border-color 0.2s;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
        }
        .mode-tab.active {
          color: #00E5FF;
          border-bottom-color: #00E5FF;
        }
        .mode-tab:hover { color: #E8E8F0; }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .reveal.show {
          opacity: 1;
          transform: translateY(0);
        }

        .ticker-wrap {
          display: flex;
          overflow: hidden;
          width: 100%;
        }
        .ticker-track {
          display: flex;
          gap: 60px;
          animation: tick 25s linear infinite;
          white-space: nowrap;
        }
        @keyframes tick {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .error-msg {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #FF4D6A;
          margin-top: 12px;
          min-height: 16px;
        }

        .scan-line {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      {/* ── Background ── */}
      <StarCanvas />
      <div className="grid-overlay" style={{ zIndex: 1 }} />
      <div className="scan-line" />

      {/* ── Radial vignette ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, rgba(4,4,10,0.85) 100%)"
      }} />

      {/* ══════════════════ LEFT PANEL — Mission Data ══════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 48px",
        position: "relative",
        zIndex: 2,
        maxWidth: 560,
      }}>
        {/* Logo */}
        <div className={`reveal ${mounted ? "show" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, transitionDelay: "0ms" }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3" fill="#00E5FF" />
            <circle cx="11" cy="11" r="7" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.35" fill="none" />
            <circle cx="11" cy="11" r="10.5" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
            <line x1="0" y1="11" x2="22" y2="11" stroke="#00E5FF" strokeWidth="0.4" strokeOpacity="0.2" />
            <line x1="11" y1="0" x2="11" y2="22" stroke="#00E5FF" strokeWidth="0.4" strokeOpacity="0.2" />
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.01em" }}>
            SpacePoint
          </span>
        </div>

        {/* Mission status block */}
        <div>
          {/* Status tag */}
          <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "80ms", marginBottom: 24 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: "0.2em", color: "#00E5FF", textTransform: "uppercase",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#00E5FF",
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
              Ready for Launch
            </div>
            <style>{`
              @keyframes pulse-dot {
                0%,100% { opacity:1; transform:scale(1); }
                50% { opacity:0.4; transform:scale(0.7); }
              }
            `}</style>
          </div>

          {/* Main headline */}
          <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "160ms", marginBottom: 48 }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(38px, 4.5vw, 64px)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "#E8E8F0",
            }}>
              NEXT COHORT<br />
              <span style={{ color: "#00E5FF" }}>INITIATING</span>
            </h1>
          </div>

          {/* Countdown */}
          <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "240ms", marginBottom: 48 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 9,
              letterSpacing: "0.2em", color: "#444460", textTransform: "uppercase", marginBottom: 16,
            }}>
              T-minus to cohort open
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
              {[
                { val: countdown.d, label: "DAYS" },
                { val: countdown.h, label: "HRS" },
                { val: countdown.m, label: "MIN" },
                { val: countdown.s, label: "SEC" },
              ].map((c, i) => (
                <div key={c.label} style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="countdown-digit">{c.val}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 8,
                      letterSpacing: "0.18em", color: "#444460", marginTop: 6, textTransform: "uppercase",
                    }}>{c.label}</div>
                  </div>
                  {i < 3 && <span className="countdown-sep" style={{ margin: "0 6px" }}>:</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Data readouts */}
          <div className={`reveal ${mounted ? "show" : ""}`} style={{
            transitionDelay: "320ms",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[
              { val: "60+", label: "Countries" },
              { val: "340+", label: "Instructors" },
              { val: "12K+", label: "Reached" },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "20px 0",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                paddingRight: 20, paddingLeft: i > 0 ? 20 : 0,
              }}>
                <div className="data-val">{s.val}</div>
                <div className="data-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates footer */}
        <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "400ms" }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: "0.14em", color: "#333350", lineHeight: 1.8,
          }}>
            <div>MISSION // SPACEPOINT COHORT VII</div>
            <div>COORD // 8.5230°N · 76.9366°E · ALT 06M</div>
            <div>SYSTEM STATUS // NOMINAL</div>
          </div>
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div style={{
        width: 1,
        background: "linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), transparent)",
        zIndex: 2,
        alignSelf: "stretch",
      }} />

      {/* ══════════════════ RIGHT PANEL — Auth Form ══════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 64px",
        position: "relative",
        zIndex: 2,
        maxWidth: 540,
      }}>
        {/* Ticker at top of form panel */}
        <div style={{ marginBottom: 48 }}>
          <div className="ticker-wrap">
            <div className="ticker-track">
              {["AMBASSADOR APPLICATIONS OPEN","INSTRUCTOR COHORT VII","INTERN TRACK FORMING","APPLY NOW","60+ COUNTRIES",
                "AMBASSADOR APPLICATIONS OPEN","INSTRUCTOR COHORT VII","INTERN TRACK FORMING","APPLY NOW","60+ COUNTRIES"].map((t, i) => (
                <span key={i} style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  letterSpacing: "0.18em", color: "#333350", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 24,
                }}>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#00E5FF", opacity: 0.5, flexShrink: 0 }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div className={`reveal ${mounted ? "show" : ""}`} style={{
          transitionDelay: "100ms",
          display: "flex", gap: 32, marginBottom: 40,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button className={`mode-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
            Sign In
          </button>
          <button className={`mode-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
            Apply
          </button>
        </div>

        {/* Form heading */}
        <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "180ms", marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: "0.2em", color: "#00E5FF", textTransform: "uppercase", marginBottom: 10,
          }}>
            {mode === "login" ? "// Access Portal" : "// Begin Application"}
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "-0.025em",
            lineHeight: 1.1, color: "#E8E8F0",
          }}>
            {mode === "login" ? "Mission Control\nAccess" : "Join the\nMission"}
          </h2>
        </div>

        {/* Fields */}
        <div className={`reveal ${mounted ? "show" : ""}`} style={{ transitionDelay: "260ms" }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: "block", fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.18em", color: "#444460",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Email Address
            </label>
            <input
              className="sp-input"
              type="email"
              placeholder="you@mission.space"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: "block", fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.18em", color: "#444460",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Password
            </label>
            <input
              className="sp-input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {/* Error */}
          <div className="error-msg">{error}</div>

          {/* Submit */}
          <button className="btn-launch" onClick={handleSubmit} disabled={loading}>
            {loading ? "INITIATING..." : mode === "login" ? "ENTER PORTAL →" : "BEGIN APPLICATION →"}
          </button>

          {/* Toggle */}
          <div style={{
            marginTop: 24, textAlign: "center",
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            letterSpacing: "0.1em", color: "#333350",
          }}>
            {mode === "login" ? (
              <>No access yet?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  style={{ background: "none", border: "none", color: "#00E5FF", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
                >
                  Apply now →
                </button>
              </>
            ) : (
              <>Already enrolled?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  style={{ background: "none", border: "none", color: "#00E5FF", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
                >
                  Sign in →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom: version tag */}
        <div style={{ marginTop: "auto", paddingTop: 48 }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 8,
            letterSpacing: "0.14em", color: "#222240",
          }}>
            SPACEPOINT PORTAL v2.0 · COHORT VII · SECURE CONNECTION
          </div>
        </div>
      </div>
    </div>
  );
}
