import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../components/DashboardLayout";

const NAV = [
  { path: "/dashboard/instructor",          icon: "◈", label: "Overview" },
  { path: "/dashboard/instructor/sessions", icon: "▦", label: "Sessions" },
  { path: "/dashboard/instructor/students", icon: "◉", label: "Students" },
  { path: "/dashboard/instructor/resources",icon: "◫", label: "Resources" },
];

// ─── Mock data (replace with Supabase queries) ───────────────────────────────
const MOCK_SESSIONS = [
  { id: 1, date: "2026-05-10", title: "Orbital Mechanics 101",    students: 24, status: "UPCOMING"   },
  { id: 2, date: "2026-05-08", title: "Lunar South Pole Deep Dive",students: 18, status: "COMPLETED" },
  { id: 3, date: "2026-05-06", title: "Space Policy Workshop",    students: 31, status: "COMPLETED"  },
  { id: 4, date: "2026-05-15", title: "Propulsion Systems",       students: 0,  status: "DRAFT"      },
  { id: 5, date: "2026-05-20", title: "Astrobiology Fundamentals",students: 0,  status: "DRAFT"      },
];

const MOCK_STUDENTS = [
  { id: 1, name: "Priya Nair",      email: "priya@example.com",  progress: 87, status: "ACTIVE"   },
  { id: 2, name: "James Okafor",    email: "james@example.com",  progress: 72, status: "ACTIVE"   },
  { id: 3, name: "Sofia Reyes",     email: "sofia@example.com",  progress: 94, status: "ACTIVE"   },
  { id: 4, name: "Chen Wei",        email: "chen@example.com",   progress: 45, status: "AT RISK"  },
  { id: 5, name: "Amara Diallo",    email: "amara@example.com",  progress: 100,status: "COMPLETE" },
  { id: 6, name: "Lucas Petrov",    email: "lucas@example.com",  progress: 60, status: "ACTIVE"   },
];

function StatusBadge({ status }) {
  const map = {
    UPCOMING: "badge-cyan", COMPLETED: "badge-dim",
    DRAFT: "badge-dim", ACTIVE: "badge-cyan",
    "AT RISK": "badge-red", COMPLETE: "badge-amber",
  };
  return <span className={`badge ${map[status] || "badge-dim"}`}>{status}</span>;
}

function ProgressBar({ val }) {
  const color = val >= 80 ? "#00E5FF" : val >= 50 ? "#FFB800" : "#FF4D6A";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#55556A", minWidth: 28 }}>
        {val}%
      </span>
    </div>
  );
}

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <DashboardLayout user={user} role="instructor" navItems={NAV} title="Instructor Dashboard">

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 }}>
        {[
          { val: "3",    label: "Sessions Run",    sub: "↑ 1 this week",        subColor: "#00E5FF" },
          { val: "73",   label: "Students Active",  sub: "Across all sessions",  subColor: "#55556A" },
          { val: "4.8",  label: "Avg Rating",       sub: "Out of 5.0",           subColor: "#FFB800" },
          { val: "VII",  label: "Current Cohort",   sub: "Jun 15 intake",        subColor: "#55556A" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Sessions table ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <span className="section-title">Sessions</span>
          <button className="action-link">+ New Session</button>
        </div>
        <table className="bt-table">
          <thead>
            <tr>
              {["Date", "Session", "Students", "Status", ""].map((h) => (
                <th key={h} className="bt-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_SESSIONS.map((s) => (
              <tr
                key={s.id}
                className={`bt-tr ${activeRow === s.id ? "active-row" : ""}`}
                onClick={() => setActiveRow(activeRow === s.id ? null : s.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="bt-td">{s.date}</td>
                <td className="bt-td" style={{ color: "var(--text)" }}>{s.title}</td>
                <td className="bt-td">{s.students || "—"}</td>
                <td className="bt-td"><StatusBadge status={s.status} /></td>
                <td className="bt-td" style={{ textAlign: "right", color: "var(--cyan)" }}>
                  [ MANAGE ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Student roster ── */}
      <div>
        <div className="section-header">
          <span className="section-title">Student Roster</span>
          <button className="action-link">Export CSV</button>
        </div>
        <table className="bt-table">
          <thead>
            <tr>
              {["Name", "Email", "Progress", "Status", ""].map((h) => (
                <th key={h} className="bt-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map((s) => (
              <tr key={s.id} className="bt-tr">
                <td className="bt-td" style={{ color: "var(--text)" }}>{s.name}</td>
                <td className="bt-td">{s.email}</td>
                <td className="bt-td" style={{ minWidth: 160 }}><ProgressBar val={s.progress} /></td>
                <td className="bt-td"><StatusBadge status={s.status} /></td>
                <td className="bt-td" style={{ textAlign: "right", color: "var(--cyan)" }}>
                  [ VIEW ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </DashboardLayout>
  );
}
