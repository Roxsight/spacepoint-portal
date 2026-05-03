import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const GATES = [
  {
    number: 1,
    title: "Onboarding Form",
    desc: "Complete the SpacePoint onboarding form",
    icon: "📋",
  },
  {
    number: 2,
    title: "Technical Assessment",
    desc: "Submit answers to technical questions",
    icon: "🧪",
  },
  {
    number: 3,
    title: "Scenario Challenges",
    desc: "Submit case study solutions",
    icon: "🎯",
  },
  {
    number: 4,
    title: "Teaching Certification",
    desc: "Shadow a live session as trainee",
    icon: "🎓",
  },
  {
    number: 5,
    title: "Field Certification",
    desc: "Lead a live session independently",
    icon: "🚀",
  },
];

const SIDEBAR = [
  { id: "journey", label: "Progress Journey", icon: "⚡" },
  { id: "satkit", label: "SatKit Academy", icon: "🛸" },
  { id: "crm", label: "Partnership CRM", icon: "🤝" },
  { id: "credentials", label: "My Credentials", icon: "🏆" },
  { id: "leaderboard", label: "Leaderboard", icon: "📊" },
];

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const [active, setActive] = useState("journey");
  const [gates, setGates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGates();
    loadLeads();
  }, []);

  async function loadGates() {
    const { data } = await supabase
      .from("instructor_gates")
      .select("*")
      .eq("user_id", profile.id)
      .order("gate_number");
    setGates(data || []);
    setLoading(false);
  }

  async function loadLeads() {
    const { data } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    setLeads(data || []);
  }

  async function submitGate(gateNumber, text, url) {
    await supabase
      .from("instructor_gates")
      .update({
        submission_text: text,
        submission_url: url,
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id)
      .eq("gate_number", gateNumber);
    loadGates();
  }

  async function markGateOneSubmitted() {
    await supabase
      .from("instructor_gates")
      .update({
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id)
      .eq("gate_number", 1);
    loadGates();
  }

  async function submitLead(lead) {
    await supabase.from("crm_leads").insert({ ...lead, user_id: profile.id });
    loadLeads();
  }

  function signOut() {
    supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Sidebar */}
      <div
        className="w-64 flex flex-col"
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <h1 className="text-lg glow-text" style={{ color: "var(--accent)" }}>
            SPACEPOINT
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Instructor Portal
          </p>
        </div>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--accent)",
              }}
            >
              🎓
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {profile?.full_name}
              </p>
              <p className="text-xs" style={{ color: "var(--accent)" }}>
                {profile?.level || "Cadet"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: "var(--text-muted)" }}>XP</span>
              <span style={{ color: "var(--accent)" }}>
                {profile?.xp_points || 0}
              </span>
            </div>
            <div
              className="h-1 rounded-full"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  background: "var(--accent)",
                  width: `${Math.min((profile?.xp_points || 0) / 10, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {SIDEBAR.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left w-full transition-all"
              style={{
                background:
                  active === item.id ? "rgba(0,180,255,0.1)" : "transparent",
                color:
                  active === item.id ? "var(--accent)" : "var(--text-muted)",
                border:
                  active === item.id
                    ? "1px solid rgba(0,180,255,0.3)"
                    : "1px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={signOut}
            className="w-full text-xs py-2 rounded"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {active === "journey" && (
          <JourneyView
            gates={gates}
            loading={loading}
            onGateOneSubmit={markGateOneSubmitted}
            onSubmit={submitGate}
          />
        )}
        {active === "satkit" && <SatKitView />}
        {active === "crm" && <CRMView leads={leads} onSubmit={submitLead} />}
        {active === "credentials" && (
          <CredentialsView profile={profile} gates={gates} />
        )}
        {active === "leaderboard" && <LeaderboardView />}
      </div>
    </div>
  );
}

function OldGateCard({ gate, gateInfo, onGateOneSubmit, onSubmit }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const statusColor = {
    locked: "var(--text-muted)",
    active: "var(--accent)",
    pending: "#f59e0b",
    passed: "#10b981",
    failed: "#ef4444",
  };

  const statusIcon = {
    locked: "🔒",
    active: "⚡",
    pending: "⏳",
    passed: "✅",
    failed: "❌",
  };

  return (
    <div
      className="p-6 rounded-xl mb-4"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${gate?.status === "active" ? "var(--accent)" : "var(--border)"}`,
        boxShadow:
          gate?.status === "active" ? "0 0 20px var(--accent-glow)" : "none",
        opacity: gate?.status === "locked" ? 0.5 : 1,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{gateInfo.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                GATE {gateInfo.number}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${statusColor[gate?.status]}20`,
                  color: statusColor[gate?.status],
                }}
              >
                {statusIcon[gate?.status]} {gate?.status?.toUpperCase()}
              </span>
            </div>
            <h3
              className="font-bold mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {gateInfo.title}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {gateInfo.desc}
            </p>
          </div>
        </div>
        {gate?.status === "active" && (
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: "var(--accent)", color: "#020a1a" }}
          >
            SUBMIT
          </button>
        )}
        {gate?.status === "passed" && gate?.admin_feedback && (
          <div
            className="text-xs px-3 py-1 rounded"
            style={{ background: "#10b98120", color: "#10b981" }}
          >
            Score: {gate.quality_score}/100
          </div>
        )}
      </div>

      {open && gate?.status === "active" && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {gateInfo.number === 1 ? (
            <div className="flex flex-col gap-3">
              <a
                href="https://forms.gle/7CJChtLJ9EKXdZUSA"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-lg text-center font-bold text-sm glow"
                style={{ background: "var(--accent)", color: "#020a1a" }}
              >
                OPEN ONBOARDING FORM
              </a>
              <button
                onClick={() => {
                  onGateOneSubmit();
                  setOpen(false);
                }}
                className="w-full py-3 rounded-lg text-center font-bold text-sm"
                style={{
                  background: "transparent",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                }}
              >
                MARK AS SUBMITTED
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your submission here..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                style={{
                  background: "#071428",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Link to document or portfolio (optional)"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{
                  background: "#071428",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => {
                  onSubmit(gateInfo.number, text, url);
                  setOpen(false);
                }}
                disabled={!text}
                className="py-3 rounded-lg font-bold text-sm"
                style={{
                  background: "var(--accent)",
                  color: "#020a1a",
                  opacity: !text ? 0.5 : 1,
                }}
              >
                SUBMIT FOR REVIEW
              </button>
            </div>
          )}
        </div>
      )}

      {gate?.admin_feedback && (
        <div
          className="mt-3 p-3 rounded-lg text-xs"
          style={{ background: "#071428", color: "var(--text-muted)" }}
        >
          <span style={{ color: "var(--accent)" }}>Admin Feedback: </span>
          {gate.admin_feedback}
        </div>
      )}
    </div>
  );
}

function GateCard({ gate, gateInfo, onSubmit }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const statusColor = {
    locked: '#6b9ab8',
    active: '#00b4ff',
    pending: '#f59e0b',
    passed: '#10b981',
    failed: '#ef4444'
  };

  const statusIcon = {
    locked: '', active: '⚡', pending: '⏳', passed: '✅', failed: '❌'
  };

  async function handleSubmit() {
    await onSubmit(gateInfo.number, text, url);
    setSubmitted(true);
  }

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      background: '#0c1f3a',
      border: gate?.status === 'active' ? '1px solid #00b4ff' : '1px solid #1a3a5f',
      boxShadow: gate?.status === 'active' ? '0 0 20px rgba(0,180,255,0.2)' : 'none',
      opacity: gate?.status === 'locked' ? 0.5 : 1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: gate?.status === 'active' ? '1rem' : 0 }}>
        <span style={{ fontSize: '1.5rem' }}>{gateInfo.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#6b9ab8', fontWeight: 'bold' }}>GATE {gateInfo.number}</span>
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', background: statusColor[gate?.status] + '20', color: statusColor[gate?.status] }}>
              {statusIcon[gate?.status]} {gate?.status?.toUpperCase()}
            </span>
          </div>
          <p style={{ color: '#e8f4fd', fontWeight: 'bold', margin: 0 }}>{gateInfo.title}</p>
          <p style={{ color: '#6b9ab8', fontSize: '0.8rem', margin: 0 }}>{gateInfo.desc}</p>
        </div>
        {gate?.status === 'passed' && gate?.quality_score && (
          <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '8px', background: '#10b98120', color: '#10b981' }}>
            Score: {gate.quality_score}/100
          </span>
        )}
      </div>

      {gate?.status === 'active' && !submitted && (
        <div style={{ borderTop: '1px solid #1a3a5f', paddingTop: '1rem' }}>
          {gateInfo.number === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="https://forms.gle/7CJChtLJ9EKXdZUSA" target="_blank" rel="noreferrer"
                style={{ display: 'block', padding: '0.75rem', background: '#00b4ff', color: '#020a1a', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.85rem' }}>
                OPEN ONBOARDING FORM ↗
              </a>
              <button onClick={handleSubmit}
                style={{ padding: '0.75rem', background: 'transparent', border: '1px solid #00b4ff', color: '#00b4ff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                ✓ MARK AS SUBMITTED
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Write your submission here..."
                rows={4}
                style={{ width: '100%', padding: '0.75rem', background: '#071428', border: '1px solid #1a3a5f', borderRadius: '8px', color: '#e8f4fd', fontSize: '0.85rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
              <input value={url} onChange={e => setUrl(e.target.value)}
                placeholder="Link to document or portfolio (optional)"
                style={{ width: '100%', padding: '0.75rem', background: '#071428', border: '1px solid #1a3a5f', borderRadius: '8px', color: '#e8f4fd', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={handleSubmit} disabled={!text}
                style={{ padding: '0.75rem', background: text ? '#00b4ff' : '#1a3a5f', color: text ? '#020a1a' : '#6b9ab8', border: 'none', borderRadius: '8px', cursor: text ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '0.85rem' }}>
                SUBMIT FOR REVIEW
              </button>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div style={{ borderTop: '1px solid #1a3a5f', paddingTop: '1rem', color: '#f59e0b', fontSize: '0.85rem' }}>
          ⏳ Submitted — awaiting admin review
        </div>
      )}

      {gate?.status === 'pending' && (
        <div style={{ borderTop: '1px solid #1a3a5f', paddingTop: '1rem', color: '#f59e0b', fontSize: '0.85rem' }}>
          ⏳ Awaiting admin review
        </div>
      )}

      {gate?.admin_feedback && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#071428', borderRadius: '8px', fontSize: '0.8rem', color: '#6b9ab8' }}>
          <span style={{ color: '#00b4ff' }}>Admin Feedback: </span>{gate.admin_feedback}
        </div>
      )}
    </div>
  );
}

function JourneyView({ gates, loading, onGateOneSubmit, onSubmit }) {
  if (loading)
    return (
      <div style={{ color: "var(--text-muted)" }}>Loading your journey...</div>
    );

  return (
    <div>
      <h2
        className="text-2xl font-black mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        PROGRESS JOURNEY
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Complete each gate to advance your certification
      </p>
      {gates.length === 0 ? (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Your gates are being initialized. Please wait or refresh.
          </p>
        </div>
      ) : (
        GATES.map((gateInfo) => (
          <GateCard
            key={gateInfo.number}
            gateInfo={gateInfo}
            gate={gates.find((g) => g.gate_number === gateInfo.number)}
            onGateOneSubmit={onGateOneSubmit}
            onSubmit={onSubmit}
          />
        ))
      )}
    </div>
  );
}

function SatKitView() {
  return (
    <div>
      <h2
        className="text-2xl font-black mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        SATKIT ACADEMY
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        View-only training materials — IP Protected
      </p>
      <div
        className="p-8 rounded-xl text-center"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="text-4xl mb-4">🔒</div>
        <p style={{ color: "var(--text-muted)" }}>
          Content unlocks after Gate 2 approval
        </p>
      </div>
    </div>
  );
}

function CRMView({ leads, onSubmit }) {
  const [form, setForm] = useState({
    partner_name: "",
    contact_email: "",
    organization: "",
    country: "",
    potential_value: "",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);

  const statusColors = {
    submitted: "#6b9ab8",
    "under review": "#f59e0b",
    approved: "#10b981",
    "proposal requested": "var(--accent)",
    closed: "#6b7280",
  };

  async function handleSubmit() {
    await onSubmit(form);
    setForm({
      partner_name: "",
      contact_email: "",
      organization: "",
      country: "",
      potential_value: "",
      notes: "",
    });
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2
            className="text-2xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            PARTNERSHIP CRM
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Submit and track partnership leads
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-bold glow"
          style={{ background: "var(--accent)", color: "#020a1a" }}
        >
          + NEW LEAD
        </button>
      </div>

      {showForm && (
        <div
          className="p-6 rounded-xl mb-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent)",
          }}
        >
          <h3
            className="font-bold mb-4 text-sm"
            style={{ color: "var(--accent)" }}
          >
            SUBMIT NEW LEAD
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                key: "partner_name",
                label: "PARTNER NAME",
                placeholder: "Organization name",
              },
              {
                key: "contact_email",
                label: "CONTACT EMAIL",
                placeholder: "contact@org.com",
              },
              {
                key: "organization",
                label: "ORGANIZATION TYPE",
                placeholder: "University / Corp / NGO",
              },
              { key: "country", label: "COUNTRY", placeholder: "Country" },
              {
                key: "potential_value",
                label: "POTENTIAL VALUE",
                placeholder: "$5,000 / Partnership",
              },
            ].map((f) => (
              <div key={f.key}>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "#071428",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label
                className="text-xs mb-1 block"
                style={{ color: "var(--text-muted)" }}
              >
                NOTES
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{
                  background: "#071428",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 rounded-lg text-sm font-bold"
            style={{ background: "var(--accent)", color: "#020a1a" }}
          >
            SUBMIT LEAD
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {leads.length === 0 ? (
          <div
            className="p-8 rounded-xl text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>No leads submitted yet</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {lead.partner_name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {lead.organization} · {lead.country}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: `${statusColors[lead.status]}20`,
                    color: statusColors[lead.status],
                  }}
                >
                  {lead.status?.toUpperCase()}
                </span>
                {lead.status === "proposal requested" && (
                  <button
                    className="text-xs px-3 py-1 rounded glow"
                    style={{ background: "var(--accent)", color: "#020a1a" }}
                  >
                    UPLOAD PROPOSAL
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CredentialsView({ profile, gates }) {
  const passed = gates.filter((g) => g.status === "passed").length;
  const pct = Math.round((passed / 5) * 100);
  const badges = [
    "Cadet",
    "Provisional Trainer",
    "Certified Trainer",
    "Master Trainer",
  ];

  return (
    <div>
      <h2
        className="text-2xl font-black mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        MY CREDENTIALS
      </h2>
      <div
        className="p-6 rounded-xl mb-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: "var(--accent-glow)",
              border: "2px solid var(--accent)",
            }}
          >
            🎓
          </div>
          <div>
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {profile?.full_name}
            </h3>
            <p style={{ color: "var(--accent)" }}>
              {profile?.level || "Cadet"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {profile?.organization} · {profile?.country}
            </p>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: "var(--text-muted)" }}>Journey Progress</span>
          <span style={{ color: "var(--accent)" }}>{pct}%</span>
        </div>
        <div
          className="h-2 rounded-full"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-2 rounded-full transition-all"
            style={{ background: "var(--accent)", width: `${pct}%` }}
          />
        </div>
        <div
          className="flex justify-between mt-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{passed} gates cleared</span>
          <span>{profile?.xp_points || 0} XP</span>
        </div>
      </div>

      <h3
        className="font-bold mb-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        BADGES
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {badges.map((badge, i) => {
          const earned = passed >= i * 1.2;
          return (
            <div
              key={badge}
              className="p-4 rounded-xl text-center"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${earned ? "var(--accent)" : "var(--border)"}`,
                opacity: earned ? 1 : 0.4,
              }}
            >
              <div className="text-3xl mb-2">⭐</div>
              <p
                className="text-xs font-bold"
                style={{
                  color: earned ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {badge}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeaderboardView() {
  const [data, setData] = useState([]);
  useEffect(() => {
    supabase
      .from("profiles")
      .select("full_name, xp_points, level, country")
      .eq("role", "instructor")
      .order("xp_points", { ascending: false })
      .limit(10)
      .then(({ data }) => setData(data || []));
  }, []);

  return (
    <div>
      <h2
        className="text-2xl font-black mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        LEADERBOARD
      </h2>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="grid grid-cols-4 px-6 py-3 text-xs font-bold"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span>RANK</span>
          <span>NAME</span>
          <span>LEVEL</span>
          <span>XP</span>
        </div>
        {data.map((user, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-6 py-4 text-sm"
            style={{
              borderBottom: "1px solid var(--border)",
              background: i % 2 === 0 ? "var(--bg-card)" : "transparent",
            }}
          >
            <span
              style={{ color: i < 3 ? "var(--accent)" : "var(--text-muted)" }}
            >
              #{i + 1}
            </span>
            <span style={{ color: "var(--text-primary)" }}>
              {user.full_name}
            </span>
            <span style={{ color: "var(--text-muted)" }}>{user.level}</span>
            <span style={{ color: "var(--accent)" }}>{user.xp_points}</span>
          </div>
        ))}
        {data.length === 0 && (
          <div
            className="px-6 py-8 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No instructors yet
          </div>
        )}
      </div>
    </div>
  );
}
