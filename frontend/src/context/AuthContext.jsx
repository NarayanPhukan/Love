import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('botanical-token'))
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data); setLoading(false) })
        .catch(() => { logout(); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('botanical-token', data.token)
    setToken(data.token)
    setUser(data)
    setIsNewUser(false)
    return data
  }

  const signup = async (email, password, phone) => {
    const { data } = await api.post('/auth/signup', { email, password, phone })
    localStorage.setItem('botanical-token', data.token)
    setToken(data.token)
    setUser(data)
    setIsNewUser(true)
    return data
  }

  const logout = () => {
    localStorage.removeItem('botanical-token')
    localStorage.removeItem('botanical-user')
    setToken(null)
    setUser(null)
    setIsNewUser(false)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, isNewUser, setIsNewUser,
      login, signup, logout, updateUser, forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
