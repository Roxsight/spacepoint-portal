import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_complete')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      navigate('/onboarding')
      return
    }

    if (!profile.onboarding_complete) {
      navigate('/onboarding')
      return
    }

    const routes = {
      instructor: '/instructor',
      ambassador: '/ambassador',
      intern: '/intern',
      admin: '/admin'
    }

    navigate(routes[profile.role] || '/onboarding')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '400px', background: '#0c1f3a', border: '1px solid #1a3a5f', borderRadius: '16px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></div>
          <h1 style={{ color: '#00b4ff', fontFamily: 'Orbitron, monospace', fontSize: '1.5rem' }}>SPACEPOINT</h1>
          <p style={{ color: '#6b9ab8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Mission Control Access</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#6b9ab8', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', background: '#071428', border: '1px solid #1a3a5f', borderRadius: '8px', color: '#e8f4fd', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#6b9ab8', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', background: '#071428', border: '1px solid #1a3a5f', borderRadius: '8px', color: '#e8f4fd', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', background: '#00b4ff', color: '#020a1a', border: 'none', borderRadius: '8px', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {loading ? 'AUTHENTICATING...' : 'LAUNCH'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1.5rem', color: '#6b9ab8' }}>
          New to SpacePoint?{' '}
          <span onClick={() => navigate('/signup')} style={{ color: '#00b4ff', cursor: 'pointer' }}>
            Begin Your Journey
          </span>
        </p>
      </div>
    </div>
  )
}
