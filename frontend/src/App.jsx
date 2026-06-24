import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import VerifyEmail from './pages/VerifyEmail'
import MainApp from './MainApp'
import './styles/style.css'
import './styles/app.css'
import './styles/home.css'
import './styles/chat.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="center-content" style={{ minHeight: '100vh' }}>
        <div className="handwriting" style={{ fontSize: '1.8rem', color: 'var(--ink-forest)' }}>🌿 Tending the garden...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/app/*" element={
        <ProtectedRoute><MainApp /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
