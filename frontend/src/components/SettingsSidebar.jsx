import { useAuth } from '../context/AuthContext'

export default function SettingsSidebar({ isOpen, onClose, onManageCodes, onAdmin, onLeave }) {
  const { user } = useAuth()

  return (
    <div
      id="settings-sidebar"
      className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target.classList.contains('sidebar-overlay')) onClose() }}
    >
      <div className="settings-panel">
        <div className="settings-top-bar">
          <button className="icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="settings-title headline" style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Settings</h2>
          <div className="app-avatar" style={{ width: 32, height: 32, border: 'none' }}></div>
        </div>
        <div className="settings-content">
          <div className="settings-header-text" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="label-text" style={{ color: '#6B7B71', letterSpacing: '0.1em', marginBottom: 8 }}>SANCTUARY MANAGEMENT</div>
            <h1 className="headline" style={{ fontSize: '2.2rem', color: 'var(--ink-forest)', marginBottom: 16, fontStyle: 'italic' }}>Curating your space</h1>
          </div>

          {/* Admin Panel (Developer Only) */}
          {user?.email === 'developeruserr30@gmail.com' && (
            <div className="settings-card" style={{ border: '2px solid var(--pressed-sage)' }}>
              <div className="sc-header">
                <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>admin_panel_settings</span>
                <h3>System Control</h3>
              </div>
              <div className="sc-item clickable" onClick={onAdmin}>
                <div>
                  <div className="sc-item-title" style={{ fontSize: '0.9rem', color: '#c45c5c' }}>Developer Dashboard</div>
                  <div className="sc-item-desc">Access global metrics and user directory</div>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#8C6A66' }}>chevron_right</span>
              </div>
            </div>
          )}

          {/* Garden Privacy */}
          <div className="settings-card">
            <div className="sc-header">
              <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>park</span>
              <h3>Garden Privacy</h3>
            </div>
            <div className="sc-item">
              <div>
                <div className="sc-item-title">Private Sanctuary Mode</div>
                <div className="sc-item-desc">Restrict all outside views of your garden</div>
              </div>
              <div className="toggle active"><div className="toggle-knob"><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#3B82F6', marginTop: 3, marginLeft: 3 }}>check</span></div></div>
            </div>
            <div className="sc-item clickable" onClick={onManageCodes}>
              <div>
                <div className="sc-item-title" style={{ fontSize: '0.9rem' }}>Manage Connection Codes</div>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#8C6A66' }}>chevron_right</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-card">
            <div className="sc-header">
              <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>notifications</span>
              <h3>Notifications</h3>
            </div>
            <div className="sc-item">
              <div>
                <div className="sc-item-title">New Memory Alerts</div>
                <div className="sc-item-desc">Daily whispers to record your thoughts</div>
              </div>
              <div className="toggle active"><div className="toggle-knob"><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#3B82F6', marginTop: 3, marginLeft: 3 }}>check</span></div></div>
            </div>
            <div className="sc-item">
              <div>
                <div className="sc-item-title">Partner Whispers</div>
                <div className="sc-item-desc">When shared diary entries are updated</div>
              </div>
              <div className="toggle"><div className="toggle-knob"></div></div>
            </div>
          </div>

          {/* Display */}
          <div className="settings-card">
            <div className="sc-header">
              <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>palette</span>
              <h3>Display & Aesthetic</h3>
            </div>
            <div className="sc-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="sc-item-title" style={{ marginBottom: 8 }}>Handwriting Font</div>
              <div style={{ width: '100%', padding: 12, border: '1px solid rgba(47,79,62,0.2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.85rem' }}>Caveat (Organic)</span>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>expand_more</span>
              </div>
            </div>
            <div className="sc-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 24 }}>
              <div className="sc-item-title" style={{ marginBottom: 12 }}>Background Texture</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '2px solid var(--ink-forest)', background: '#f7f3ed' }}></div>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#eaddce' }}></div>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#f4f1ea' }}></div>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#f2f5f4' }}></div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="settings-card">
            <div className="sc-header">
              <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>shield</span>
              <h3>Security</h3>
            </div>
            <div className="sc-item clickable">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined" style={{ color: '#8C6A66', fontSize: '1.2rem' }}>lock</span>
                <div>
                  <div className="sc-item-title" style={{ fontSize: '0.9rem' }}>Change Secret Password</div>
                  <div className="sc-item-desc" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updated 4 months ago</div>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#8C6A66' }}>chevron_right</span>
            </div>
            <div className="sc-item clickable">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined" style={{ color: '#8C6A66', fontSize: '1.2rem' }}>key</span>
                <div>
                  <div className="sc-item-title" style={{ fontSize: '0.9rem' }}>Two-Factor Seeds</div>
                  <div className="sc-item-desc" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active via Authenticator</div>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#8C6A66' }}>chevron_right</span>
            </div>
          </div>

          {/* About */}
          <div className="settings-card">
            <div className="sc-header">
              <span className="material-symbols-outlined sc-icon" style={{ color: 'var(--ink-forest)' }}>info</span>
              <h3>About</h3>
            </div>
            <div className="sc-item-title">Our Story</div>
            <div className="sc-item-desc" style={{ fontStyle: 'italic', lineHeight: 1.6, marginBottom: 24 }}>
              Botanical Diary was founded on the belief that memories, like rare orchids, require the right atmosphere to truly thrive. We craft digital heirlooms that age with grace.
            </div>
            <div className="sc-item-title">Garden Rules</div>
            <div className="sc-item-desc" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>radio_button_unchecked</span> Privacy & Data Preservation
            </div>
            <div className="sc-item-desc" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>radio_button_unchecked</span> Community Soil Guidelines
            </div>
          </div>

          {/* Footer */}
          <div className="settings-footer" style={{ textAlign: 'center', marginTop: 24 }}>
            <div className="leaf-divider" style={{ display: 'flex', alignItems: 'center', color: '#8C6A66', marginBottom: 24 }}>
              <span style={{ flex: 1, borderBottom: '1px solid rgba(47,79,62,0.1)', marginRight: 16 }}></span>
              <span className="material-symbols-outlined">eco</span>
              <span style={{ flex: 1, borderBottom: '1px solid rgba(47,79,62,0.1)', marginLeft: 16 }}></span>
            </div>
            <button onClick={onLeave} className="btn-primary" style={{ background: 'var(--ink-forest)', borderRadius: 24, padding: '16px 32px', width: 'auto' }}>Leave the Garden</button>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#8C6A66', textTransform: 'uppercase', marginTop: 16 }}>V. 2.4.1 — ESTABLISHED 1924</div>
          </div>
        </div>
      </div>
    </div>
  )
}
