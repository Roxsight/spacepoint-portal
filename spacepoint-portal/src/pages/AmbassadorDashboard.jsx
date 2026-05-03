import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../components/DashboardLayout";

const NAV = [
  { path: "/dashboard/ambassador",         icon: "◈", label: "Overview"  },
  { path: "/dashboard/ambassador/events",  icon: "▦", label: "Events"    },
  { path: "/dashboard/ambassador/chapters",icon: "◉", label: "Chapters"  },
  { path: "/dashboard/ambassador/reach",   icon: "◫", label: "Outreach"  },
];

const MOCK_EVENTS = [
  { id: 1, date: "2026-05-12", event: "Space Careers Panel — NIT Trichy",  location: "Trichy, IN",   attendees: 140, status: "UPCOMING"   },
  { id: 2, date: "2026-05-03", event: "Astronomy Outreach — Govt College",  location: "TVM, IN",      attendees: 88,  status: "COMPLETED" },
  { id: 3, date: "2026-04-28", event: "SpacePoint Intro Webinar",           location: "Remote",       attendees: 310, status: "COMPLETED" },
  { id: 4, date: "2026-05-20", event: "ISRO Visitor Talk Coordination",     location: "Bangalore, IN",attendees: 0,   status: "PLANNING"  },
  { id: 5, date: "2026-06-01", event: "National Space Day Campus Drive",    location: "TVM, IN",      attendees: 0,   status: "PLANNING"  },
];

const MOCK_CHAPTERS = [
  { id: 1, university: "NIT Trichy",        lead: "Priya N.",   members: 24, status: "ACTIVE"   },
  { id: 2, university: "IIST Trivandrum",   lead: "Arjun M.",   members: 18, status: "ACTIVE"   },
  { id: 3, university: "TKM Engineering",   lead: "Riya T.",    members: 9,  status: "FORMING"  },
  { id: 4, university: "CUSAT Kochi",       lead: "Unassigned", members: 0,  status: "PROPOSED" },
];

const MOCK_REFERRALS = [
  { name: "Meera S.",    role: "Instructor", date: "2026-04-15", status: "APPROVED" },
  { name: "Vikram P.",   role: "Intern",     date: "2026-04-22", status: "PENDING"  },
  { name: "Anita K.",    role: "Ambassador", date: "2026-04-30", status: "PENDING"  },
];

function StatusBadge({ status }) {
  const map = {
    UPCOMING: "badge-amber", COMPLETED: "badge-dim", PLANNING: "badge-dim",
    ACTIVE: "badge-cyan", FORMING: "badge-amber", PROPOSED: "badge-dim",
    APPROVED: "badge-cyan", PENDING: "badge-amber",
  };
  return <span className={`badge ${map[status] || "badge-dim"}`}>{status}</span>;
}

export default function AmbassadorDashboard() {
  const [user, setUser] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <DashboardLayout user={user} role="ambassador" navItems={NAV} title="Ambassador Dashboard">

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 }}>
        {[
          { val: "5",    label: "Events Run",      sub: "↑ 2 vs last month", subColor: "#FFB800" },
          { val: "538",  label: "People Reached",  sub: "Across all events",  subColor: "#55556A" },
          { val: "3",    label: "Chapters Active", sub: "1 forming",          subColor: "#00E5FF" },
          { val: "3",    label: "Referrals Sent",  sub: "1 approved",         subColor: "#55556A" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Events table ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <span className="section-title">Events</span>
          <button className="action-link">+ Log Event</button>
        </div>
        <table className="bt-table">
          <thead>
            <tr>
              {["Date", "Event", "Location", "Attendees", "Status", ""].map((h) => (
                <th key={h} className="bt-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENTS.map((e) => (
              <tr
                key={e.id}
                className={`bt-tr ${activeRow === e.id ? "active-row" : ""}`}
                onClick={() => setActiveRow(activeRow === e.id ? null : e.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="bt-td">{e.date}</td>
                <td className="bt-td" style={{ color: "var(--text)", maxWidth: 280 }}>{e.event}</td>
                <td className="bt-td">{e.location}</td>
                <td className="bt-td">{e.attendees || "—"}</td>
                <td className="bt-td"><StatusBadge status={e.status} /></td>
                <td className="bt-td" style={{ textAlign: "right", color: "#FFB800" }}>
                  [ VIEW ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Two-col: Chapters + Referrals ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

        {/* Chapters */}
        <div>
          <div className="section-header">
            <span className="section-title">Chapters</span>
            <button className="action-link">+ Propose</button>
          </div>
          <table className="bt-table">
            <thead>
              <tr>
                {["University", "Lead", "Members", "Status"].map((h) => (
                  <th key={h} className="bt-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CHAPTERS.map((c) => (
                <tr key={c.id} className="bt-tr">
                  <td className="bt-td" style={{ color: "var(--text)" }}>{c.university}</td>
                  <td className="bt-td">{c.lead}</td>
                  <td className="bt-td">{c.members || "—"}</td>
                  <td className="bt-td"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referrals */}
        <div>
          <div className="section-header">
            <span className="section-title">My Referrals</span>
            <button className="action-link">+ Refer</button>
          </div>
          <table className="bt-table">
            <thead>
              <tr>
                {["Name", "Track", "Date", "Status"].map((h) => (
                  <th key={h} className="bt-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_REFERRALS.map((r, i) => (
                <tr key={i} className="bt-tr">
                  <td className="bt-td" style={{ color: "var(--text)" }}>{r.name}</td>
                  <td className="bt-td">{r.role}</td>
                  <td className="bt-td">{r.date}</td>
                  <td className="bt-td"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}
