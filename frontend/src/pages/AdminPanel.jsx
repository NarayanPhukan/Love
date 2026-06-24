import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function AdminPanel() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.email !== 'developeruserr30@gmail.com') return

    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user])

  if (user?.email !== 'developeruserr30@gmail.com') {
    return (
      <div className="center-content">
        <div className="headline" style={{ color: 'var(--ink-forest)' }}>Restricted Area</div>
      </div>
    )
  }

  if (loading) {
    return <div className="center-content handwriting">Loading system data...</div>
  }

  if (error) {
    return <div className="center-content label-text" style={{ color: '#c45c5c' }}>{error}</div>
  }

  return (
    <div className="dashboard-container" style={{ paddingBottom: 100 }}>
      <div className="dash-header">
        <div className="dash-welcome" style={{ color: 'var(--pressed-sage)' }}>SYSTEM CONTROL</div>
        <div className="dash-name">Developer Admin Panel</div>
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>
        <div className="section-title">Global Statistics</div>
      </div>
      <div className="action-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="action-card" style={{ padding: 24 }}>
          <div className="stat-number headline">{stats?.totalUsers || 0}</div>
          <div className="action-label" style={{ fontWeight: 'bold' }}>Total Users</div>
          <div className="label-text" style={{ marginTop: 4, opacity: 0.6, fontSize: '0.65rem' }}>{stats?.verifiedUsers || 0} Verified</div>
        </div>
        <div className="action-card" style={{ padding: 24 }}>
          <div className="stat-number headline">{stats?.totalEntries || 0}</div>
          <div className="action-label" style={{ fontWeight: 'bold' }}>Total Memories</div>
        </div>
        <div className="action-card" style={{ padding: 24 }}>
          <div className="stat-number headline">{stats?.totalMedia || 0}</div>
          <div className="action-label" style={{ fontWeight: 'bold' }}>Media Files</div>
        </div>
        <div className="action-card" style={{ padding: 24 }}>
          <div className="stat-number headline">{stats?.totalLetters || 0}</div>
          <div className="action-label" style={{ fontWeight: 'bold' }}>Future Letters</div>
        </div>
        <div className="action-card" style={{ padding: 24 }}>
          <div className="stat-number headline">{stats?.totalConnections || 0}</div>
          <div className="action-label" style={{ fontWeight: 'bold' }}>Active Garden Links</div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 48 }}>
        <div className="section-title">User Directory</div>
      </div>
      
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--linen-surface)', borderBottom: '1px solid rgba(47,79,62,0.1)' }}>
              <th style={{ padding: '16px 24px', fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pressed-sage)' }}>Email</th>
              <th style={{ padding: '16px 24px', fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pressed-sage)' }}>Name</th>
              <th style={{ padding: '16px 24px', fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pressed-sage)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pressed-sage)' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id} style={{ borderBottom: i === users.length - 1 ? 'none' : '1px solid rgba(47,79,62,0.05)' }}>
                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ink-forest)' }}>{u.email}</td>
                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>{u.fullName || '—'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: 12, 
                    fontSize: '0.7rem', 
                    fontFamily: 'var(--font-label)', 
                    textTransform: 'uppercase', 
                    background: u.isVerified ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                    color: u.isVerified ? '#2E7D32' : '#E65100'
                  }}>
                    {u.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
