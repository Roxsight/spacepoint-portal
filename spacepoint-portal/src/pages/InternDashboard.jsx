import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../components/DashboardLayout";

const NAV = [
  { path: "/dashboard/intern",          icon: "◈", label: "Overview"  },
  { path: "/dashboard/intern/tasks",    icon: "▦", label: "Tasks"     },
  { path: "/dashboard/intern/projects", icon: "◉", label: "Projects"  },
  { path: "/dashboard/intern/log",      icon: "◫", label: "Work Log"  },
];

const MOCK_TASKS = [
  { id: 1, task: "Draft cohort onboarding email sequence",    project: "Comms",    due: "2026-05-08", priority: "HIGH",   status: "IN PROGRESS" },
  { id: 2, task: "Update SpacePoint ambassador handbook",     project: "Docs",     due: "2026-05-10", priority: "MEDIUM", status: "IN PROGRESS" },
  { id: 3, task: "QA test new portal auth flow",             project: "Product",  due: "2026-05-07", priority: "HIGH",   status: "DONE"        },
  { id: 4, task: "Compile event attendance data Q1",         project: "Ops",      due: "2026-05-12", priority: "LOW",    status: "TODO"        },
  { id: 5, task: "Research space edu programs in SEA",       project: "Research", due: "2026-05-15", priority: "MEDIUM", status: "TODO"        },
  { id: 6, task: "Create social post templates for cohort",  project: "Comms",    due: "2026-05-09", priority: "MEDIUM", status: "REVIEW"      },
];

const MOCK_PROJECTS = [
  { name: "Portal Product",  lead: "Admin Team",     tasks: 8,  done: 5, status: "ACTIVE"  },
  { name: "Comms & Content", lead: "Sarah K.",       tasks: 12, done: 4, status: "ACTIVE"  },
  { name: "Research Stack",  lead: "Dr. Raj P.",     tasks: 6,  done: 1, status: "ACTIVE"  },
  { name: "Event Ops",       lead: "Aisha M.",       tasks: 4,  done: 4, status: "COMPLETE"},
];

const MOCK_LOG = [
  { date: "2026-05-06", task: "QA auth flow testing",          hours: 2.5, project: "Product" },
  { date: "2026-05-05", task: "Ambassador handbook draft",      hours: 3.0, project: "Docs"    },
  { date: "2026-05-04", task: "Email sequence copywriting",    hours: 1.5, project: "Comms"   },
  { date: "2026-05-03", task: "Weekly sync + notes",           hours: 1.0, project: "Ops"     },
];

function StatusBadge({ status }) {
  const map = {
    "IN PROGRESS": "badge-amber", "DONE": "badge-dim",
    "TODO": "badge-dim", "REVIEW": "badge-cyan",
    "ACTIVE": "badge-cyan", "COMPLETE": "badge-dim",
  };
  return <span className={`badge ${map[status] || "badge-dim"}`}>{status}</span>;
}

function PriorityDot({ priority }) {
  const colors = { HIGH: "#FF4D6A", MEDIUM: "#FFB800", LOW: "#55556A" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors[priority] || "#55556A", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.1em", color: colors[priority] || "#55556A" }}>
        {priority}
      </span>
    </div>
  );
}

function MiniProgress({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#00E5FF" : "#FFB800" }} />
      </div>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#55556A", minWidth: 36 }}>
        {done}/{total}
      </span>
    </div>
  );
}

export default function InternDashboard() {
  const [user, setUser] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const totalHours = MOCK_LOG.reduce((a, b) => a + b.hours, 0);
  const doneTasks = MOCK_TASKS.filter((t) => t.status === "DONE").length;

  return (
    <DashboardLayout user={user} role="intern" navItems={NAV} title="Intern Dashboard">

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 }}>
        {[
          { val: MOCK_TASKS.length, label: "Tasks Assigned",  sub: `${doneTasks} completed`,      subColor: "#00E5FF" },
          { val: MOCK_PROJECTS.length, label: "Projects",     sub: "3 active, 1 complete",        subColor: "#55556A" },
          { val: `${totalHours}h`,  label: "Hours This Week", sub: "↑ vs 6h last week",           subColor: "#FFB800" },
          { val: "#04",             label: "Cohort Rank",     sub: "Out of 48 interns",           subColor: "#55556A" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tasks table ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <span className="section-title">My Tasks</span>
          <button className="action-link">+ Log Task</button>
        </div>
        <table className="bt-table">
          <thead>
            <tr>
              {["Task", "Project", "Due", "Priority", "Status", ""].map((h) => (
                <th key={h} className="bt-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_TASKS.map((t) => (
              <tr
                key={t.id}
                className={`bt-tr ${activeRow === t.id ? "active-row" : ""}`}
                onClick={() => setActiveRow(activeRow === t.id ? null : t.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="bt-td" style={{ color: "var(--text)", maxWidth: 280 }}>{t.task}</td>
                <td className="bt-td">{t.project}</td>
                <td className="bt-td">{t.due}</td>
                <td className="bt-td"><PriorityDot priority={t.priority} /></td>
                <td className="bt-td"><StatusBadge status={t.status} /></td>
                <td className="bt-td" style={{ textAlign: "right", color: "#FF4D6A" }}>
                  [ UPDATE ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Two col: Projects + Work log ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

        {/* Projects */}
        <div>
          <div className="section-header">
            <span className="section-title">Projects</span>
          </div>
          <table className="bt-table">
            <thead>
              <tr>
                {["Project", "Lead", "Progress", "Status"].map((h) => (
                  <th key={h} className="bt-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PROJECTS.map((p) => (
                <tr key={p.name} className="bt-tr">
                  <td className="bt-td" style={{ color: "var(--text)" }}>{p.name}</td>
                  <td className="bt-td">{p.lead}</td>
                  <td className="bt-td" style={{ minWidth: 120 }}>
                    <MiniProgress done={p.done} total={p.tasks} />
                  </td>
                  <td className="bt-td"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Work log */}
        <div>
          <div className="section-header">
            <span className="section-title">Work Log</span>
            <button className="action-link">+ Log Hours</button>
          </div>
          <table className="bt-table">
            <thead>
              <tr>
                {["Date", "Task", "Project", "Hrs"].map((h) => (
                  <th key={h} className="bt-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LOG.map((l, i) => (
                <tr key={i} className="bt-tr">
                  <td className="bt-td">{l.date}</td>
                  <td className="bt-td" style={{ color: "var(--text)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.task}</td>
                  <td className="bt-td">{l.project}</td>
                  <td className="bt-td" style={{ color: "#FFB800" }}>{l.hours}h</td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <td className="bt-td" colSpan={3} style={{ color: "#333350", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.14em" }}>WEEK TOTAL</td>
                <td className="bt-td" style={{ color: "#FFB800", fontWeight: 700 }}>{totalHours}h</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}
