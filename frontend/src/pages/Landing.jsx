import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const [form, setForm] = useState('login') // login | signup | forgot
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [status, setStatus] = useState('')
  const [statusErr, setStatusErr] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [showSignupPw, setShowSignupPw] = useState(false)

  const { login, signup, forgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setStatus('Fill in all fields'); setStatusErr(true); return }
    setLoading(true); setStatus('')
    try {
      await login(loginEmail, loginPassword)
      navigate('/app')
    } catch (e) {
      setStatus(e.response?.data?.message || e.message); setStatusErr(true)
    } finally { setLoading(false) }
  }

  const handleSignup = async () => {
    if (!signupEmail || !signupPhone || !signupPassword) { setStatus('Fill in all fields'); setStatusErr(true); return }
    if (signupPassword.length < 6) { setStatus('Password: 6+ characters'); setStatusErr(true); return }
    setLoading(true); setStatus('')
    try {
      await signup(signupEmail, signupPassword, signupPhone)
      navigate('/app')
    } catch (e) {
      setStatus(e.response?.data?.message || e.message); setStatusErr(true)
    } finally { setLoading(false) }
  }

  const handleForgot = async () => {
    if (!forgotEmail) { setStatus('Enter your email'); setStatusErr(true); return }
    setLoading(true); setStatus('')
    try {
      await forgotPassword(forgotEmail)
      setStatus('Reset link sent! Check your email.'); setStatusErr(false)
    } catch (e) {
      setStatus(e.response?.data?.message || e.message); setStatusErr(true)
    } finally { setLoading(false) }
  }

  return (
    <div id="landing-page" className="center-content">
      {/* Background Decorations */}
      <div className="bg-decor bg-decor-top-left" style={{ position: 'absolute', top: '10%', left: '20%', transform: 'rotate(-15deg)', filter: 'blur(4px)', opacity: 0.8, zIndex: -1 }}>
        <div style={{ width: 200, height: 260, background: "url('https://images.unsplash.com/photo-1610433245464-90fb495f8e56?q=80&w=600&auto=format&fit=crop') center/cover", border: '8px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}></div>
      </div>
      <div className="bg-decor bg-decor-bottom-right" style={{ position: 'absolute', bottom: '5%', right: '15%', transform: 'rotate(10deg)', filter: 'blur(2px)', opacity: 0.9, zIndex: -1 }}>
        <div style={{ width: 180, height: 240, background: "url('https://images.unsplash.com/photo-1596700810793-7925e0b62e49?q=80&w=600&auto=format&fit=crop') center/cover", border: '8px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}></div>
      </div>
      <div className="bg-decor" style={{ position: 'absolute', top: '40%', right: '25%', transform: 'rotate(45deg)', filter: 'blur(6px)', opacity: 0.6, zIndex: -1 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 140, color: 'var(--pressed-sage)' }}>energy_savings_leaf</span>
      </div>

      {/* Top Nav */}
      <div className="top-nav">
        <div className="top-nav-brand"><span className="material-symbols-outlined">eco</span> Botanical Diary</div>
        <a href="#" className="top-nav-link" onClick={(e) => { e.preventDefault(); setForm('login'); setStatus('') }}>Sign In</a>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Login Form */}
        {form === 'login' && (
          <div id="login-form">
            <h1 className="auth-title headline">Welcome Home</h1>
            <p className="auth-subtitle handwriting">Your memories are waiting to be tended.</p>

            <div className="form-group">
              <div className="form-label-row"><label className="label-text">Email Address</label></div>
              <div className="input-wrapper">
                <input type="email" className="input-field" placeholder="name@heirloom.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="label-text">Password</label>
                <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setForm('forgot'); setStatus('') }}>Forgot Password?</a>
              </div>
              <div className="input-wrapper">
                <input type={showLoginPw ? 'text' : 'password'} className="input-field" placeholder="........"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button type="button" className="pw-toggle input-icon" onClick={() => setShowLoginPw(!showLoginPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span className="material-symbols-outlined">{showLoginPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button className="btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? 'Opening...' : 'Enter the Garden'}
            </button>
            {status && <div className="auth-status" style={{ marginTop: 12, color: statusErr ? '#c45c5c' : 'var(--sage)' }}>{status}</div>}

            <div className="auth-separator"><span className="material-symbols-outlined">local_florist</span></div>
            <button className="btn-secondary" onClick={() => { setForm('signup'); setStatus('') }}>Join Our Story</button>
          </div>
        )}

        {/* Signup Form */}
        {form === 'signup' && (
          <div id="signup-form">
            <h1 className="auth-title headline">Begin Your Story</h1>
            <p className="auth-subtitle handwriting">Cultivate your memories in a private digital herbarium.</p>

            <div className="form-group">
              <div className="form-label-row"><label className="label-text">Email Address</label></div>
              <div className="input-wrapper">
                <input type="email" className="input-field" placeholder="name@heirloom.com"
                  value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                <span className="material-symbols-outlined input-icon">mail</span>
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-row"><label className="label-text">Phone Number</label></div>
              <div className="input-wrapper">
                <input type="tel" className="input-field" placeholder="+1 (555) 000-0000"
                  value={signupPhone} onChange={e => setSignupPhone(e.target.value)} />
                <span className="material-symbols-outlined input-icon">call</span>
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-row"><label className="label-text">Secret Password</label></div>
              <div className="input-wrapper">
                <input type={showSignupPw ? 'text' : 'password'} className="input-field" placeholder="........"
                  value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                <button type="button" className="pw-toggle input-icon" onClick={() => setShowSignupPw(!showSignupPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span className="material-symbols-outlined">{showSignupPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button className="btn-primary" onClick={handleSignup} disabled={loading}>
              {loading ? 'Sending...' : 'Create Diary'}
            </button>
            {status && <div className="auth-status" style={{ marginTop: 12, color: statusErr ? '#c45c5c' : 'var(--sage)' }}>{status}</div>}

            <div className="auth-separator"><span className="material-symbols-outlined">local_florist</span></div>
            <p className="auth-terms">By joining, you agree to our <a href="#">Garden Rules</a> and <a href="#">Privacy Soil</a>.</p>
            <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => { setForm('login'); setStatus('') }}>Back to Login</button>
          </div>
        )}

        {/* Forgot Password Form */}
        {form === 'forgot' && (
          <div id="forgot-form">
            <h1 className="auth-title headline">Reset Password</h1>
            <p className="auth-subtitle handwriting">Enter your email to reset password.</p>
            <div className="form-group">
              <div className="form-label-row"><label className="label-text">Email Address</label></div>
              <div className="input-wrapper">
                <input type="email" className="input-field" placeholder="name@heirloom.com"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgot()} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleForgot} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {status && <div className="auth-status" style={{ marginTop: 12, color: statusErr ? '#c45c5c' : 'var(--sage)' }}>{status}</div>}
            <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => { setForm('login'); setStatus('') }}>Back to Login</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="auth-footer">
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Security</a>
          <a href="#">Our Story</a>
        </div>
        <div className="copyright">© 2024 Botanical Diary. A Living Heirloom.</div>
      </div>
    </div>
  )
}
