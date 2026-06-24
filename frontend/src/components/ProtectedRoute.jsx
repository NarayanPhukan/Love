import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="center-content" style={{ minHeight: '100vh' }}>
        <div className="handwriting" style={{ fontSize: '1.8rem', color: 'var(--ink-forest)' }}>
          🌿 Tending the garden...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
