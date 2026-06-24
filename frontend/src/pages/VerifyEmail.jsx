import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('Verifying your email...')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link.')
      setError(true)
      return
    }

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('Email verified successfully! Opening the garden gates...')
        setTimeout(() => navigate('/'), 3000)
      })
      .catch((err) => {
        setStatus(err.response?.data?.message || 'Verification failed. Please try again.')
        setError(true)
      })
  }, [token, navigate])

  return (
    <div className="center-content" style={{ minHeight: '100vh', textAlign: 'center' }}>
      <div className="auth-card" style={{ padding: '64px 40px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: error ? '#c45c5c' : 'var(--pressed-sage)', marginBottom: 24 }}>
          {error ? 'error' : 'mark_email_read'}
        </span>
        <h1 className="headline" style={{ marginBottom: 16 }}>{error ? 'Verification Failed' : 'Welcome'}</h1>
        <p className="handwriting" style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
          {status}
        </p>
        {error && (
          <button className="btn-secondary" style={{ marginTop: 32 }} onClick={() => navigate('/')}>
            Return to Login
          </button>
        )}
      </div>
    </div>
  )
}
