import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #04040A;
    --surface:   #08080F;
    --border:    rgba(255,255,255,0.07);
    --text:      #E8E8F0;
    --muted:     #55556A;
    --cyan:      #00E5FF;
    --amber:     #FFB800;
    --red:       #FF4D6A;
  }

  body { background: var(--bg); }

  .db-sidebar-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--muted); text-decoration: none; cursor: pointer;
    border: none; background: none; width: 100%;
    transition: color 0.15s, background 0.15s;
    border-left: 2px solid transparent;
  }
  .db-sidebar-link:hover { color: var(--text); background: rgba(255,255,255,0.02); }
  .db-sidebar-link.active {
    color: var(--cyan); border-left-color: var(--cyan);
    background: rgba(0,229,255,0.04);
  }

  /* Brutalist table */
  .bt-table { width: 100%; border-collapse: collapse; }
  .bt-th {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 0.18em; text-transform: uppercase; color: #333350;
    padding: 10px 16px; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .bt-td {
    font-family: 'Space Mono', monospace; font-size: 11px;
    letter-spacing: 0.04em; color: var(--muted);
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.1s;
  }
  .bt-tr:hover .bt-td { background: rgba(255,255,255,0.02); }
  .bt-tr.active-row .bt-td { background: var(--cyan); color: #04040A; }

  .badge {
    display: inline-block;
    font-family: 'Space Mono', monospace; font-size: 8px;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 3px 8px;
  }
  .badge-cyan    { color: var(--cyan);  border: 1px solid rgba(0,229,255,0.25); }
  .badge-amber   { color: var(--amber); border: 1px solid rgba(255,184,0,0.25); }
  .badge-red     { color: var(--red);   border: 1px solid rgba(255,77,106,0.25); }
  .badge-dim     { color: var(--muted); border: 1px solid var(--border); }

  .stat-card {
    padding: 24px 20px;
    border: 1px solid var(--border);
    background: var(--surface);
  }
  .stat-val {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 36px; letter-spacing: -0.03em; line-height: 1;
    color: var(--text);
  }
  .stat-label {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--muted); margin-top: 8px;
  }
  .stat-sub {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 0.1em; margin-top: 6px;
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 0 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0;
  }
  .section-title {
    font-family: 'Space Mono', monospace; font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted);
  }
  .action-link {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 0.14em; color: var(--cyan);
    cursor: pointer; background: none; border: none;
    text-transform: uppercase;
  }
  .action-link:hover { text-decoration: underline; }
`;

export default function DashboardLayout({ children, user, role, navItems, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  const roleColors = {
    instructor: "#00E5FF",
    ambassador: "#FFB800",
    intern: "#FF4D6A",
    admin: "#A78BFA",
  };
  const accentColor = roleColors[role] || "#00E5FF";

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{STYLES}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3" fill={accentColor} />
            <circle cx="11" cy="11" r="7" stroke={accentColor} strokeWidth="1" strokeOpacity="0.3" fill="none" />
            <circle cx="11" cy="11" r="10.5" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>SpacePoint</span>
        </div>

        {/* Role badge */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: accentColor, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: accentColor,
              animation: "pulse-dot 2.5s ease-in-out infinite",
            }} />
            {role}
          </div>
          <style>{`@keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`db-sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              style={{ '--accent': accentColor }}
            >
              <span style={{ opacity: 0.5, fontSize: 13 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: "0.1em", color: "var(--muted)",
            marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: "100%", background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted)", cursor: "pointer",
              fontFamily: "'Space Mono', monospace", fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "8px 0", transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.target.style.color = "#FF4D6A"; e.target.style.borderColor = "rgba(255,77,106,0.3)"; }}
            onMouseLeave={e => { e.target.style.color = "var(--muted)"; e.target.style.borderColor = "var(--border)"; }}
          >
            {signingOut ? "Signing out..." : "[ Sign Out ]"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          height: 56, padding: "0 32px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--surface)",
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 16, letterSpacing: "-0.01em",
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: "0.14em", color: "var(--muted)",
          }}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
