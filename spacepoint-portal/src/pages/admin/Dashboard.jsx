import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const colors = {
  page: '#020a1a',
  card: '#0c1f3a',
  border: '#1a3a5f',
  accent: '#00b4ff',
  primary: '#e8f4fd',
  muted: '#6b9ab8',
  warning: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444'
}

const navItems = [
  'Overview',
  'Approvals',
  'Assign Tasks',
  'Content Library',
  'Global Leaderboard',
  'User Management'
]

const roles = ['instructor', 'ambassador', 'intern', 'admin']

const pageStyle = {
  minHeight: '100vh',
  background: colors.page,
  color: colors.primary,
  display: 'flex',
  fontFamily: 'inherit'
}

const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px'
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#071428',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  color: colors.primary,
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
}

const buttonStyle = {
  padding: '0.7rem 1rem',
  background: colors.accent,
  color: colors.page,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.8rem'
}

const secondaryButtonStyle = {
  ...buttonStyle,
  background: 'transparent',
  color: colors.accent,
  border: `1px solid ${colors.accent}`
}

const dangerButtonStyle = {
  ...buttonStyle,
  background: colors.danger,
  color: 'white'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('Overview')
  const [stats, setStats] = useState({
    users: 0,
    pendingGates: 0,
    submittedLeads: 0,
    pendingSubmissions: 0
  })
  const [profiles, setProfiles] = useState([])
  const [pendingGates, setPendingGates] = useState([])
  const [pendingLeads, setPendingLeads] = useState([])
  const [contentItems, setContentItems] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [approvalsTab, setApprovalsTab] = useState('gates')
  const [leaderboardRole, setLeaderboardRole] = useState('all')
  const [gateReviews, setGateReviews] = useState({})
  const [taskForm, setTaskForm] = useState({ userId: '', title: '', dueDate: '' })
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'video',
    url: '',
    tag: 'Onboarding'
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [leaderboardRole])

  async function loadAll() {
    setLoading(true)
    await Promise.all([
      loadStats(),
      loadProfiles(),
      loadPendingGates(),
      loadPendingLeads(),
      loadContent(),
      loadLeaderboard()
    ])
    setLoading(false)
  }

  async function loadDashboard() {
    await loadAll()
  }

  async function loadStats() {
    const [users, gates, leads, submissions] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('instructor_gates').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('crm_leads').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    setStats({
      users: users.count || 0,
      pendingGates: gates.count || 0,
      submittedLeads: leads.count || 0,
      pendingSubmissions: submissions.count || 0
    })
  }

  async function loadProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setProfiles(data || [])
  }

  async function loadPendingGates() {
    const { data } = await supabase
      .from('instructor_gates')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })

    setPendingGates(data || [])
  }

  async function loadPendingLeads() {
    const { data } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })

    setPendingLeads(data || [])
  }

  async function loadContent() {
    const { data } = await supabase
      .from('content_library')
      .select('*')
      .order('created_at', { ascending: false })

    setContentItems(data || [])
  }

  async function loadLeaderboard() {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('xp_points', { ascending: false })
      .limit(50)

    if (leaderboardRole !== 'all') {
      query = query.eq('role', leaderboardRole)
    }

    const { data } = await query
    setLeaderboard(data || [])
  }

  function reviewFor(gateId) {
    return gateReviews[gateId] || { rating: 5, feedback: '' }
  }

  function updateGateReview(gateId, updates) {
    setGateReviews(current => ({
      ...current,
      [gateId]: {
        ...reviewFor(gateId),
        ...updates
      }
    }))
  }

  async function approveGate(gate) {
    const review = reviewFor(gate.id)

    await supabase
      .from('instructor_gates')
      .update({
        status: 'passed',
        quality_score: review.rating * 20,
        admin_feedback: review.feedback
      })
      .eq('id', gate.id)

    if (gate.gate_number < 5) {
      await supabase
        .from('instructor_gates')
        .update({ status: 'active' })
        .eq('user_id', gate.user_id)
        .eq('gate_number', gate.gate_number + 1)
    }

    setMessage('Gate approved and next gate unlocked.')
    await loadAll()
  }

  async function rejectGate(gate) {
    const review = reviewFor(gate.id)

    await supabase
      .from('instructor_gates')
      .update({
        status: 'failed',
        quality_score: review.rating * 20,
        admin_feedback: review.feedback
      })
      .eq('id', gate.id)

    setMessage('Gate rejected.')
    await loadAll()
  }

  async function approveLead(lead) {
    await supabase
      .from('crm_leads')
      .update({ status: 'proposal requested' })
      .eq('id', lead.id)

    setMessage('Lead moved to proposal requested.')
    await loadAll()
  }

  async function rejectLead(lead) {
    await supabase
      .from('crm_leads')
      .update({ status: 'closed' })
      .eq('id', lead.id)

    setMessage('Lead closed.')
    await loadAll()
  }

  async function assignTask(e) {
    e.preventDefault()
    if (!taskForm.userId || !taskForm.title) return

    await supabase.from('todos').insert({
      user_id: taskForm.userId,
      assigned_to: taskForm.userId,
      title: taskForm.title,
      due_date: taskForm.dueDate || null,
      status: 'open'
    })

    setTaskForm({ userId: '', title: '', dueDate: '' })
    setMessage('Task assigned.')
  }

  async function addContent(e) {
    e.preventDefault()
    if (!contentForm.title || !contentForm.url) return

    await supabase.from('content_library').insert({
      title: contentForm.title,
      type: contentForm.type,
      url: contentForm.url,
      tag: contentForm.tag
    })

    setContentForm({ title: '', type: 'video', url: '', tag: 'Onboarding' })
    setMessage('Content added.')
    await loadContent()
  }

  async function deleteContent(itemId) {
    await supabase.from('content_library').delete().eq('id', itemId)
    setMessage('Content deleted.')
    await loadContent()
  }

  async function changeRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setMessage('User role updated.')
    await loadDashboard()
  }

  async function addXp(user) {
    await supabase
      .from('profiles')
      .update({ xp_points: (user.xp_points || 0) + 50 })
      .eq('id', user.id)

    setMessage('50 XP added.')
    await loadDashboard()
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nonAdminProfiles = profiles.filter(user => user.role !== 'admin')

  return (
    <div style={pageStyle}>
      <aside style={{
        width: '270px',
        background: colors.card,
        borderRight: `1px solid ${colors.border}`,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '1.25rem' }}>
          <h1 style={{ color: colors.accent, fontFamily: 'Orbitron, monospace', fontSize: '1.1rem', margin: 0 }}>
            SPACEPOINT
          </h1>
          <p style={{ color: colors.muted, fontSize: '0.8rem', margin: '0.35rem 0 0' }}>Command Center</p>
        </div>

        <div style={{ borderBottom: `1px solid ${colors.border}`, padding: '1rem 0' }}>
          <p style={{ color: colors.primary, fontWeight: 700, margin: 0 }}>{profile?.full_name || 'Admin'}</p>
          <p style={{ color: colors.accent, fontSize: '0.75rem', margin: '0.25rem 0 0' }}>Administrator</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveView(item)}
              style={{
                textAlign: 'left',
                padding: '0.8rem 0.9rem',
                borderRadius: '8px',
                border: activeView === item ? `1px solid ${colors.accent}` : '1px solid transparent',
                background: activeView === item ? 'rgba(0, 180, 255, 0.12)' : 'transparent',
                color: activeView === item ? colors.accent : colors.muted,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <button onClick={signOut} style={secondaryButtonStyle}>Sign Out</button>
      </aside>

      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: colors.primary, fontFamily: 'Orbitron, monospace', margin: 0 }}>{activeView}</h2>
            <p style={{ color: colors.muted, margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
              Manage SpacePoint operations
            </p>
          </div>
          <button onClick={loadDashboard} style={secondaryButtonStyle}>Refresh</button>
        </header>

        {message && (
          <div style={{ ...cardStyle, borderColor: colors.accent, color: colors.accent, padding: '0.8rem 1rem', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        {loading && <p style={{ color: colors.muted }}>Loading admin data...</p>}
        {!loading && activeView === 'Overview' && <Overview stats={stats} />}
        {!loading && activeView === 'Approvals' && (
          <Approvals
            approvalsTab={approvalsTab}
            setApprovalsTab={setApprovalsTab}
            pendingGates={pendingGates}
            pendingLeads={pendingLeads}
            reviewFor={reviewFor}
            updateGateReview={updateGateReview}
            approveGate={approveGate}
            rejectGate={rejectGate}
            approveLead={approveLead}
            rejectLead={rejectLead}
          />
        )}
        {!loading && activeView === 'Assign Tasks' && (
          <AssignTasks
            users={nonAdminProfiles}
            form={taskForm}
            setForm={setTaskForm}
            onSubmit={assignTask}
          />
        )}
        {!loading && activeView === 'Content Library' && (
          <ContentLibrary
            items={contentItems}
            form={contentForm}
            setForm={setContentForm}
            onSubmit={addContent}
            onDelete={deleteContent}
          />
        )}
        {!loading && activeView === 'Global Leaderboard' && (
          <GlobalLeaderboard
            role={leaderboardRole}
            setRole={setLeaderboardRole}
            rows={leaderboard}
          />
        )}
        {!loading && activeView === 'User Management' && (
          <UserManagement
            users={profiles}
            onRoleChange={changeRole}
            onAddXp={addXp}
          />
        )}
      </main>
    </div>
  )
}

function Overview({ stats }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
      <StatCard label="Total Users" value={stats.users} />
      <StatCard label="Pending Gates" value={stats.pendingGates} />
      <StatCard label="Submitted Leads" value={stats.submittedLeads} />
      <StatCard label="Pending Submissions" value={stats.pendingSubmissions} />
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{ ...cardStyle, padding: '1.25rem' }}>
      <p style={{ color: colors.muted, margin: 0, fontSize: '0.75rem', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: colors.accent, margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{value}</p>
    </div>
  )
}

function Approvals(props) {
  const {
    approvalsTab,
    setApprovalsTab,
    pendingGates,
    pendingLeads,
    reviewFor,
    updateGateReview,
    approveGate,
    rejectGate,
    approveLead,
    rejectLead
  } = props

  return (
    <section style={{ ...cardStyle, padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button onClick={() => setApprovalsTab('gates')} style={approvalsTab === 'gates' ? buttonStyle : secondaryButtonStyle}>
          Gate Submissions
        </button>
        <button onClick={() => setApprovalsTab('leads')} style={approvalsTab === 'leads' ? buttonStyle : secondaryButtonStyle}>
          Partnership Leads
        </button>
      </div>

      {approvalsTab === 'gates' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pendingGates.length === 0 && <EmptyState text="No pending gate submissions." />}
          {pendingGates.map(gate => {
            const review = reviewFor(gate.id)
            return (
              <article key={gate.id} style={{ ...cardStyle, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ color: colors.primary, margin: 0 }}>
                      {gate.profiles?.full_name || gate.profiles?.email || gate.user_id}
                    </h3>
                    <p style={{ color: colors.muted, margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
                      Gate {gate.gate_number} submitted for review
                    </p>
                  </div>
                  <Stars
                    value={review.rating}
                    onChange={rating => updateGateReview(gate.id, { rating })}
                  />
                </div>
                <textarea
                  value={review.feedback}
                  onChange={e => updateGateReview(gate.id, { feedback: e.target.value })}
                  placeholder="Write admin feedback..."
                  rows={3}
                  style={{ ...inputStyle, marginTop: '1rem', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={() => approveGate(gate)} style={buttonStyle}>Approve</button>
                  <button onClick={() => rejectGate(gate)} style={dangerButtonStyle}>Reject</button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {approvalsTab === 'leads' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pendingLeads.length === 0 && <EmptyState text="No submitted partnership leads." />}
          {pendingLeads.map(lead => (
            <article key={lead.id} style={{ ...cardStyle, padding: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: colors.primary, margin: 0 }}>{lead.partner_name || lead.organization || lead.name || 'Partnership Lead'}</h3>
                <p style={{ color: colors.muted, margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
                  {lead.contact_email || lead.email || 'No email'} - {lead.country || 'No country'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => approveLead(lead)} style={buttonStyle}>Approve</button>
                <button onClick={() => rejectLead(lead)} style={dangerButtonStyle}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Stars({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          style={{
            background: 'transparent',
            border: 'none',
            color: star <= value ? colors.accent : colors.border,
            cursor: 'pointer',
            fontSize: '1.35rem',
            padding: 0
          }}
        >
          *
        </button>
      ))}
    </div>
  )
}

function AssignTasks({ users, form, setForm, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ ...cardStyle, padding: '1rem', display: 'grid', gap: '1rem', maxWidth: '680px' }}>
      <Field label="User">
        <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} style={inputStyle}>
          <option value="">Select user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.full_name || user.email || user.id}</option>
          ))}
        </select>
      </Field>
      <Field label="Task Title">
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Due Date">
        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
      </Field>
      <button type="submit" style={{ ...buttonStyle, opacity: form.userId && form.title ? 1 : 0.55 }} disabled={!form.userId || !form.title}>
        Assign Task
      </button>
    </form>
  )
}

function ContentLibrary({ items, form, setForm, onSubmit, onDelete }) {
  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <form onSubmit={onSubmit} style={{ ...cardStyle, padding: '1rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Title">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
          </Field>
          <Field label="URL">
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Tag">
            <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} style={inputStyle}>
              <option value="Onboarding">Onboarding</option>
              <option value="Advanced">Advanced</option>
              <option value="Reference">Reference</option>
            </select>
          </Field>
        </div>
        <button type="submit" style={{ ...buttonStyle, opacity: form.title && form.url ? 1 : 0.55 }} disabled={!form.title || !form.url}>
          Add Content
        </button>
      </form>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {items.length === 0 && <EmptyState text="No content has been added yet." />}
        {items.map(item => (
          <article key={item.id} style={{ ...cardStyle, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h3 style={{ color: colors.primary, margin: 0 }}>{item.title}</h3>
              <p style={{ color: colors.muted, margin: '0.3rem 0 0', fontSize: '0.85rem' }}>{item.type} - {item.tag}</p>
            </div>
            <button onClick={() => onDelete(item.id)} style={dangerButtonStyle}>Delete</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function GlobalLeaderboard({ role, setRole, rows }) {
  return (
    <section style={{ ...cardStyle, padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['all', 'instructor', 'ambassador', 'intern'].map(item => (
          <button key={item} onClick={() => setRole(item)} style={role === item ? buttonStyle : secondaryButtonStyle}>
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      <DataTable
        columns={['Rank', 'Name', 'Role', 'XP']}
        rows={rows.map((user, index) => [
          index + 1,
          user.full_name || user.email || user.id,
          user.role || 'none',
          user.xp_points || 0
        ])}
      />
    </section>
  )
}

function UserManagement({ users, onRoleChange, onAddXp }) {
  return (
    <section style={{ ...cardStyle, padding: '1rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Name', 'Email', 'Role', 'XP Points', 'Actions'].map(column => (
              <th key={column} style={thStyle}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={tdStyle}>{user.full_name || 'Unnamed'}</td>
              <td style={tdStyle}>{user.email || 'No email'}</td>
              <td style={tdStyle}>
                <select value={user.role || ''} onChange={e => onRoleChange(user.id, e.target.value)} style={{ ...inputStyle, minWidth: '150px' }}>
                  <option value="">No role</option>
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
              <td style={tdStyle}>{user.xp_points || 0}</td>
              <td style={tdStyle}>
                <button onClick={() => onAddXp(user)} style={buttonStyle}>+50 XP</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ color: colors.muted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
      {children}
    </label>
  )
}

function DataTable({ columns, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(column => <th key={column} style={thStyle}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex} style={tdStyle}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState text="No rows to show." />}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center', color: colors.muted }}>
      {text}
    </div>
  )
}

const thStyle = {
  color: colors.muted,
  borderBottom: `1px solid ${colors.border}`,
  padding: '0.75rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  textTransform: 'uppercase'
}

const tdStyle = {
  color: colors.primary,
  borderBottom: `1px solid ${colors.border}`,
  padding: '0.75rem',
  fontSize: '0.85rem'
}
