import './style.css'
import './app.css'
import './chat.css'
import './home.css'
import * as db from './db.js'
import { loadGoogleAuth, authorizeGoogle, isGoogleAuthed } from './gdrive.js'

const FLOWERS = {
  rose: { emoji: '🌹', label: 'Rose · Romantic day' },
  sunflower: { emoji: '🌻', label: 'Sunflower · Joyful day' },
  lily: { emoji: '🪷', label: 'Lily · Peaceful day' },
  orchid: { emoji: '🌺', label: 'Orchid · Special memory' },
  jasmine: { emoji: '🌸', label: 'Jasmine · Late-night talk' },
}
const MOODS = ['romantic','joyful','peaceful','special','emotional']

let currentEntries = []
let currentEntry = null

// ===== RENDER =====
document.querySelector('#app').innerHTML = `
<div id="landing-page" class="center-content">
  <div class="bg-decor bg-decor-top-left" style="position:absolute; top:10%; left:20%; transform:rotate(-15deg); filter:blur(4px); opacity:0.8; z-index:-1;">
    <div style="width: 200px; height: 260px; background: url('https://images.unsplash.com/photo-1610433245464-90fb495f8e56?q=80&w=600&auto=format&fit=crop') center/cover; border: 8px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></div>
  </div>
  <div class="bg-decor bg-decor-bottom-right" style="position:absolute; bottom:5%; right:15%; transform:rotate(10deg); filter:blur(2px); opacity:0.9; z-index:-1;">
    <div style="width: 180px; height: 240px; background: url('https://images.unsplash.com/photo-1596700810793-7925e0b62e49?q=80&w=600&auto=format&fit=crop') center/cover; border: 8px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></div>
  </div>
  <div class="bg-decor" style="position:absolute; top:40%; right:25%; transform:rotate(45deg); filter:blur(6px); opacity:0.6; z-index:-1;">
    <span class="material-symbols-outlined" style="font-size: 140px; color: var(--pressed-sage);">energy_savings_leaf</span>
  </div>

  <div class="top-nav">
    <div class="top-nav-brand"><span class="material-symbols-outlined">eco</span> Botanical Diary</div>
    <a href="#" class="top-nav-link" id="nav-signin-btn">Sign In</a>
  </div>

  <div class="auth-card">
    <div class="brand-icon" style="display:none;"><span class="material-symbols-outlined" style="font-size:inherit;">eco</span></div>
    <div class="brand-title" style="display:none;">Botanical Diary</div>
    
    <div id="login-form">
      <h1 class="auth-title headline">Welcome Home</h1>
      <p class="auth-subtitle handwriting">Your memories are waiting to be tended.</p>
      
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Email Address</label></div>
        <div class="input-wrapper">
          <input type="email" id="login-email" class="input-field" placeholder="name@heirloom.com" />
        </div>
      </div>
      
      <div class="form-group">
        <div class="form-label-row">
          <label class="label-text">Password</label>
          <a href="#" id="forgot-btn" class="forgot-link">Forgot Password?</a>
        </div>
        <div class="input-wrapper">
          <input type="password" id="login-password" class="input-field" placeholder="........" />
          <button type="button" class="pw-toggle input-icon" data-target="login-password" style="background:none;border:none;cursor:pointer;padding:0;"><span class="material-symbols-outlined">visibility</span></button>
        </div>
      </div>
      
      <button id="login-btn" class="btn-primary">Enter the Garden</button>
      <div class="auth-status" id="login-status"></div>
      
      <div class="auth-separator"><span class="material-symbols-outlined">local_florist</span></div>
      
      <button id="toggle-signup" class="btn-secondary">Join Our Story</button>
    </div>

    <div id="signup-form" class="hidden">
      <h1 class="auth-title headline">Begin Your Story</h1>
      <p class="auth-subtitle handwriting">Cultivate your memories in a private digital herbarium.</p>
      
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Email Address</label></div>
        <div class="input-wrapper">
          <input type="email" id="signup-email" class="input-field" placeholder="name@heirloom.com" />
          <span class="material-symbols-outlined input-icon">mail</span>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Phone Number</label></div>
        <div class="input-wrapper">
          <input type="tel" id="signup-phone" class="input-field" placeholder="+1 (555) 000-0000" />
          <span class="material-symbols-outlined input-icon">call</span>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Secret Password</label></div>
        <div class="input-wrapper">
          <input type="password" id="signup-password" class="input-field" placeholder="........" />
          <button type="button" class="pw-toggle input-icon" data-target="signup-password" style="background:none;border:none;cursor:pointer;padding:0;"><span class="material-symbols-outlined">visibility</span></button>
        </div>
      </div>
      
      <button id="signup-btn" class="btn-primary">Create Diary</button>
      <div class="auth-status" id="signup-status"></div>
      
      <div class="auth-separator"><span class="material-symbols-outlined">local_florist</span></div>
      
      <p class="auth-terms">By joining, you agree to our <a href="#">Garden Rules</a> and <a href="#">Privacy Soil</a>.</p>
      <button id="toggle-login" class="btn-secondary" style="margin-top:16px;">Back to Login</button>
    </div>

    <div id="forgot-form" class="hidden">
      <h1 class="auth-title headline">Reset Password</h1>
      <p class="auth-subtitle handwriting">Enter your email to reset password.</p>
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Email Address</label></div>
        <div class="input-wrapper">
          <input type="email" id="forgot-email" class="input-field" placeholder="name@heirloom.com" />
        </div>
      </div>
      <button id="reset-btn" class="btn-primary">Send Reset Link</button>
      <div class="auth-status" id="forgot-status"></div>
      <button id="forgot-back-btn" class="btn-secondary" style="margin-top:16px;">Back to Login</button>
    </div>

    <div id="otp-form" class="hidden">
      <h1 class="auth-title headline">Verify Code</h1>
      <p class="auth-subtitle handwriting">We sent a code to your email.</p>
      <div class="form-group">
        <div class="form-label-row"><label class="label-text">Code</label></div>
        <div class="input-wrapper">
          <input type="text" id="otp-input" class="input-field" placeholder="Enter code" maxlength="8" />
        </div>
      </div>
      <button id="verify-btn" class="btn-primary">Verify & Enter</button>
      <div class="auth-status" id="otp-status"></div>
      <button id="back-btn" class="btn-secondary" style="margin-top:16px;">Back</button>
    </div>
  </div>
  
  <div class="auth-footer">
    <div class="footer-links">
      <a href="#">Privacy</a>
      <a href="#">Security</a>
      <a href="#">Our Story</a>
    </div>
    <div class="copyright">© 2024 Botanical Diary. A Living Heirloom.</div>
  </div>
</div>

<div id="main-app" class="hidden home-layout">
  <div class="home-bg"></div>
  
  <!-- Settings Sidebar -->
  <div id="settings-sidebar" class="sidebar-overlay">
    <div class="settings-panel">
      <div class="settings-top-bar">
        <button id="close-settings-btn" class="icon-btn"><span class="material-symbols-outlined">arrow_back</span></button>
        <h2 class="settings-title headline" style="font-size:1.5rem;font-weight:600;margin:0;">Settings</h2>
        <div class="app-avatar" style="width:32px;height:32px;border:none;"></div>
      </div>
      <div class="settings-content">
        <div class="settings-header-text" style="text-align:center; margin-bottom:16px;">
          <div class="label-text" style="color:#6B7B71;letter-spacing:0.1em;margin-bottom:8px;">SANCTUARY MANAGEMENT</div>
          <h1 class="headline" style="font-size:2.2rem;color:var(--ink-forest);margin-bottom:16px;font-style:italic;">Curating your space</h1>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <span class="material-symbols-outlined sc-icon" style="color:var(--ink-forest);">park</span>
            <h3>Garden Privacy</h3>
          </div>
          <div class="sc-item">
            <div>
              <div class="sc-item-title">Private Sanctuary Mode</div>
              <div class="sc-item-desc">Restrict all outside views of your garden</div>
            </div>
            <div class="toggle active"><div class="toggle-knob"><span class="material-symbols-outlined" style="font-size:14px;color:#3B82F6;margin-top:3px;margin-left:3px;">check</span></div></div>
          </div>
          <div class="sc-item clickable" id="settings-manage-codes">
            <div>
              <div class="sc-item-title" style="font-size:0.9rem;">Manage Connection Codes</div>
            </div>
            <span class="material-symbols-outlined" style="color:#8C6A66;">chevron_right</span>
          </div>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <span class="material-symbols-outlined sc-icon" style="color:var(--ink-forest);">notifications</span>
            <h3>Notifications</h3>
          </div>
          <div class="sc-item">
            <div>
              <div class="sc-item-title">New Memory Alerts</div>
              <div class="sc-item-desc">Daily whispers to record your thoughts</div>
            </div>
            <div class="toggle active"><div class="toggle-knob"><span class="material-symbols-outlined" style="font-size:14px;color:#3B82F6;margin-top:3px;margin-left:3px;">check</span></div></div>
          </div>
          <div class="sc-item">
            <div>
              <div class="sc-item-title">Partner Whispers</div>
              <div class="sc-item-desc">When shared diary entries are updated</div>
            </div>
            <div class="toggle"><div class="toggle-knob"></div></div>
          </div>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <span class="material-symbols-outlined sc-icon" style="color:var(--ink-forest);">palette</span>
            <h3>Display & Aesthetic</h3>
          </div>
          <div class="sc-item" style="flex-direction:column; align-items:flex-start;">
            <div class="sc-item-title" style="margin-bottom:8px;">Handwriting Font</div>
            <div style="width:100%; padding:12px; border:1px solid rgba(47,79,62,0.2); border-radius:8px; display:flex; justify-content:space-between; box-sizing:border-box;">
              <span style="font-family:var(--font-label); font-size:0.85rem;">Caveat (Organic)</span>
              <span class="material-symbols-outlined" style="font-size:1.2rem;">expand_more</span>
            </div>
          </div>
          <div class="sc-item" style="flex-direction:column; align-items:flex-start; margin-top:24px;">
            <div class="sc-item-title" style="margin-bottom:12px;">Background Texture</div>
            <div style="display:flex; gap:12px;">
              <div style="width:48px;height:48px;border-radius:8px;border:2px solid var(--ink-forest);background:#f7f3ed;"></div>
              <div style="width:48px;height:48px;border-radius:8px;border:1px solid rgba(0,0,0,0.1);background:#eaddce;"></div>
              <div style="width:48px;height:48px;border-radius:8px;border:1px solid rgba(0,0,0,0.1);background:#f4f1ea;"></div>
              <div style="width:48px;height:48px;border-radius:8px;border:1px solid rgba(0,0,0,0.1);background:#f2f5f4;"></div>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <span class="material-symbols-outlined sc-icon" style="color:var(--ink-forest);">shield</span>
            <h3>Security</h3>
          </div>
          <div class="sc-item clickable">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="material-symbols-outlined" style="color:#8C6A66;font-size:1.2rem;">lock</span>
              <div>
                <div class="sc-item-title" style="font-size:0.9rem;">Change Secret Password</div>
                <div class="sc-item-desc" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;">Updated 4 months ago</div>
              </div>
            </div>
            <span class="material-symbols-outlined" style="color:#8C6A66;">chevron_right</span>
          </div>
          <div class="sc-item clickable">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="material-symbols-outlined" style="color:#8C6A66;font-size:1.2rem;">key</span>
              <div>
                <div class="sc-item-title" style="font-size:0.9rem;">Two-Factor Seeds</div>
                <div class="sc-item-desc" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;">Active via Authenticator</div>
              </div>
            </div>
            <span class="material-symbols-outlined" style="color:#8C6A66;">chevron_right</span>
          </div>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <span class="material-symbols-outlined sc-icon" style="color:var(--ink-forest);">info</span>
            <h3>About</h3>
          </div>
          <div class="sc-item-title">Our Story</div>
          <div class="sc-item-desc" style="font-style:italic; line-height:1.6; margin-bottom:24px;">
            Botanical Diary was founded on the belief that memories, like rare orchids, require the right atmosphere to truly thrive. We craft digital heirlooms that age with grace.
          </div>
          <div class="sc-item-title">Garden Rules</div>
          <div class="sc-item-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="material-symbols-outlined" style="font-size:1rem;">radio_button_unchecked</span> Privacy & Data Preservation
          </div>
          <div class="sc-item-desc" style="display:flex;align-items:center;gap:8px;">
            <span class="material-symbols-outlined" style="font-size:1rem;">radio_button_unchecked</span> Community Soil Guidelines
          </div>
        </div>

        <div class="settings-footer" style="text-align:center;margin-top:24px;">
          <div class="leaf-divider" style="display:flex;align-items:center;color:#8C6A66;margin-bottom:24px;"><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-right:16px;"></span><span class="material-symbols-outlined">eco</span><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-left:16px;"></span></div>
          <button id="settings-leave-btn" class="btn-primary" style="background:var(--ink-forest);border-radius:24px;padding:16px 32px;width:auto;">Leave the Garden</button>
          <div class="settings-version" style="font-family:var(--font-label);font-size:0.65rem;letter-spacing:0.1em;color:#8C6A66;text-transform:uppercase;margin-top:16px;">V. 2.4.1 — ESTABLISHED 1924</div>
        </div>

      </div>
    </div>
  </div>

  <div class="app-top-nav">
    <div class="app-top-left">
      <button class="app-menu-btn" id="app-menu-btn"><span class="material-symbols-outlined">menu</span></button>
      <span class="app-title">Botanical Diary</span>
    </div>
    <div class="app-top-right">
      <button class="app-action-btn"><span class="material-symbols-outlined" style="font-size:1.2rem;">push_pin</span></button>
      <div class="app-avatar" id="app-avatar-btn" title="Logout" style="cursor:pointer"></div>
    </div>
  </div>

  <div class="home-content-scroll">
    <!-- Home / Dashboard View -->
    <div id="home-view" class="dashboard-container">
      <div class="dash-header">
        <div class="dash-welcome">Welcome Back</div>
        <div class="dash-name">Good Morning, Eleanor</div>
      </div>

      <div class="hero-card">
        <span class="material-symbols-outlined hero-flower-mark">local_florist</span>
        <div class="hero-quote">"The heart is a secret garden, and today, it yearns to speak."</div>
        <div class="hero-question">What bloom captured your heart today?</div>
        <button class="hero-btn" id="hero-tend-btn"><span class="material-symbols-outlined" style="font-size:1.2rem">edit_note</span> Tend your story</button>
      </div>

      <div class="section-header">
        <div class="section-title">Quick Tending</div>
      </div>
      <div class="action-grid">
        <div class="action-card" id="nav-plant-btn">
          <div class="action-icon-wrap"><span class="material-symbols-outlined">photo_camera</span></div>
          <div class="action-label">Plant A Memory</div>
        </div>
        <div class="action-card" id="nav-whisper-btn">
          <div class="action-icon-wrap"><span class="material-symbols-outlined">menu_book</span></div>
          <div class="action-label">Whisper</div>
        </div>
        <div class="action-card" id="nav-greenhouse-btn">
          <div class="action-icon-wrap"><span class="material-symbols-outlined">water_drop</span></div>
          <div class="action-label">Water Greenhouse</div>
        </div>
        <div class="action-card" id="nav-shared-btn">
          <div class="action-icon-wrap"><span class="material-symbols-outlined">groups</span></div>
          <div class="action-label">Shared Roots</div>
        </div>
      </div>

      <div class="section-header" style="margin-top:48px;">
        <div class="section-title">Recent Petals</div>
        <a href="#" class="section-link">View Garden <span class="material-symbols-outlined" style="font-size:1rem;">arrow_forward</span></a>
      </div>
      <div class="recent-petals-grid">
        <div class="petal-photo-card">
          <img class="petal-photo" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" />
        </div>
        <div class="petal-quote-card">
          <div class="quote-mark">"</div>
          <div class="quote-text">I was just thinking about how our garden has grown. Not just the physical one, but the space we've built here. Thank you for tending to my roots when I...</div>
        </div>
      </div>
    </div>

    <div class="app-view-container">
      <!-- Chat View -->
      <div id="chat-view">
        <!-- Connection Setup (shown when not connected) -->
        <div id="connect-setup" class="connect-setup">
          <div class="connect-card" style="cursor:pointer;" onclick="showView('join-view')">
            <div class="connect-icon" style="font-size:3rem; margin-bottom:16px;">🌿</div>
            <h2 class="connect-title" style="font-family:var(--font-headline); color:var(--ink-forest); font-size:1.8rem; margin-bottom:8px;">You haven't connected yet</h2>
            <p class="connect-sub" style="font-family:var(--font-body); font-size:1rem; color:#8C6A66; text-decoration:underline; font-weight:600;">Click here to connect</p>
            <!-- Hidden elements to prevent JS errors from existing logic -->
            <div style="display:none !important;">
              <button id="generate-link-btn" class="hidden"></button>
              <div id="invite-link-box" class="hidden">
                <input id="invite-link" type="text" />
                <button id="copy-link-btn"></button>
              </div>
              <input id="invite-code-input" class="hidden" />
              <button id="accept-link-btn" class="hidden"></button>
              <div id="connect-status" class="hidden"></div>
            </div>
          </div>
        </div>

        <!-- Chat (shown when connected) -->
        <div id="chat-connected" class="hidden">
          <div class="chat-container">
            <div class="chat-header">
              <div class="chat-header-avatar"></div>
              <div class="chat-header-info">
                <span class="chat-header-name" id="chat-partner-name">The Greenhouse</span>
                <span class="chat-header-status" id="chat-partner-status">GROWING SINCE MAY '24</span>
              </div>
              <button class="chat-header-action" title="Disappearing messages"><span class="material-symbols-outlined" style="font-size:1.3rem;">timer</span></button>
              <button class="chat-header-action" title="More"><span class="material-symbols-outlined" style="font-size:1.3rem;">more_vert</span></button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-bar">
              <button class="chat-icon-btn" id="chat-plus-btn" title="Attach"><span class="material-symbols-outlined">add</span></button>
              <input type="file" id="chat-media-input" accept="image/*,video/*,audio/*" hidden />
              <div class="chat-input-wrap">
                <input type="text" id="chat-input" class="chat-text-input" placeholder="Whisper something..." />
                <button class="chat-icon-btn" id="chat-camera-btn" title="Camera"><span class="material-symbols-outlined">photo_camera</span></button>
                <input type="file" id="chat-gallery-input" accept="image/*,video/*" hidden />
                <button class="chat-icon-btn" id="chat-mic-btn" title="Voice note"><span class="material-symbols-outlined">mic</span></button>
              </div>
              <button class="chat-send-btn" id="chat-send-btn"><span class="material-symbols-outlined" style="font-size:1.2rem;">send</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Diary / Garden View -->
      <div id="diary-view" class="hidden dashboard-container" style="background:var(--linen-surface); min-height:100vh; padding-bottom:120px; overflow-x:hidden;">
        
        <!-- Header Image Decoration (Top Right) -->
        <img src="https://images.unsplash.com/photo-1603531046184-a1df1649f872?q=80&w=300&auto=format&fit=crop" style="position:absolute; top:-20px; right:-40px; width:180px; height:240px; object-fit:cover; opacity:0.8; transform:rotate(10deg); filter:sepia(0.3) saturate(0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.05); z-index:0; pointer-events:none; border: 4px solid #fff; border-bottom: 24px solid #fff; mix-blend-mode: multiply;" />

        <div style="position:relative; z-index:1; padding-top:24px;">
          <h1 class="headline" style="font-size:2.4rem; color:var(--ink-forest); margin-bottom:8px; line-height:1.2; border-bottom:1px solid rgba(47,79,62,0.15); padding-bottom:12px; margin-right:100px;">August 24, 2024 - A Day in Bloom</h1>
          <p class="handwriting" style="font-size:1.4rem; color:#8C6A66; line-height:1.5; margin-top:16px; max-width:90%;">
            A collection of whispers, light, and the quiet moments between us. Today felt like the first breath of autumn, preserved here forever.
          </p>

          <!-- Polaroid Photo -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 48px 12px; box-shadow:0 12px 32px rgba(0,0,0,0.08); display:inline-block; transform:rotate(-2deg); margin:32px auto; text-align:center; position:relative; left:50%; transform:translateX(-50%) rotate(-2deg); width:85%; max-width:320px; transition:transform 0.3s ease;">
            <div style="width:100%; aspect-ratio:1; background:url('https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=600&auto=format&fit=crop') center/cover; margin-bottom:16px;"></div>
            <div class="handwriting" style="font-size:1.6rem; color:var(--ink-forest);">Photo of the Day</div>
            <div style="font-family:var(--font-label); font-size:0.7rem; color:#8C6A66; letter-spacing:0.05em; text-transform:uppercase; margin-top:4px;">Sunset at the Conservatory</div>
          </div>
          
          <div style="text-align:center; margin-bottom:32px;">
            <span style="display:inline-block; width:6px; height:6px; background:#A6B4A1; border-radius:50%; margin:0 4px;"></span>
            <span style="display:inline-block; width:6px; height:6px; background:rgba(166,180,161,0.4); border-radius:50%; margin:0 4px;"></span>
            <span style="display:inline-block; width:6px; height:6px; background:rgba(166,180,161,0.4); border-radius:50%; margin:0 4px;"></span>
          </div>

          <!-- Sentiment Card -->
          <div style="background:rgba(255,255,255,0.6); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border-radius:16px; padding:24px; box-shadow:0 4px 16px rgba(0,0,0,0.03); margin-bottom:24px; position:relative; border:1px solid rgba(47,79,62,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <span class="label-text" style="color:#8C6A66; letter-spacing:0.1em; font-size:0.75rem;">TOP SHARED SENTIMENT</span>
              <span class="material-symbols-outlined" style="color:rgba(140,106,102,0.2); font-size:2rem;">favorite</span>
            </div>
            <div style="display:flex; gap:16px;">
              <span class="headline" style="font-size:3rem; color:var(--ink-forest); opacity:0.6; line-height:0.8;">"</span>
              <p style="font-family:var(--font-headline); font-size:1.25rem; color:var(--ink-forest); line-height:1.5;">
                "There's a specific kind of peace in the way we talk about the future—like it's a garden we're already planting together."
              </p>
            </div>
            <div style="display:flex; align-items:center; margin-top:24px; gap:16px;">
              <div style="flex:1; height:1px; background:rgba(47,79,62,0.1);"></div>
              <span style="background:var(--blush-light); color:#8C6A66; font-family:var(--font-label); font-size:0.65rem; font-weight:700; letter-spacing:0.1em; padding:6px 12px; border-radius:12px;">NOSTALGIC & HOPEFUL</span>
            </div>
          </div>

          <!-- Voice Snippet Card -->
          <div style="background:rgba(255,255,255,0.4); border-radius:16px; border:1px solid rgba(47,79,62,0.1); padding:20px; margin-bottom:40px;">
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
              <button class="icon-btn" style="background:var(--ink-forest); color:#fff; width:40px; height:40px; flex-shrink:0;">
                <span class="material-symbols-outlined" style="font-size:1.2rem;">play_arrow</span>
              </button>
              <div style="flex:1;">
                <div class="label-text" style="color:var(--ink-forest); letter-spacing:0.1em; font-size:0.75rem; margin-bottom:2px;">SNIPPET OF VOICE</div>
                <div style="font-size:0.7rem; color:#8C6A66;">0:42 DURATION</div>
              </div>
              <div style="display:flex; align-items:flex-end; gap:3px; height:24px; opacity:0.4;">
                <div style="width:3px; height:40%; background:var(--ink-forest); border-radius:2px;"></div>
                <div style="width:3px; height:70%; background:var(--ink-forest); border-radius:2px;"></div>
                <div style="width:3px; height:100%; background:var(--ink-forest); border-radius:2px;"></div>
                <div style="width:3px; height:50%; background:var(--ink-forest); border-radius:2px;"></div>
                <div style="width:3px; height:80%; background:var(--ink-forest); border-radius:2px;"></div>
                <div style="width:3px; height:30%; background:var(--ink-forest); border-radius:2px;"></div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px;">
              <div class="label-text" style="font-size:0.6rem; color:#8C6A66; margin-bottom:8px;">TRANSCRIPT</div>
              <p style="font-family:var(--font-body); font-style:italic; font-size:0.9rem; color:var(--ink-forest); line-height:1.5; margin:0;">
                "...you know, the way the light hits the moss here reminded me of that morning in the library. I think we should go back when the lilies are actually in bloom..."
              </p>
            </div>
          </div>

          <!-- Whispers Log -->
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
            <span class="material-symbols-outlined" style="color:#8C6A66; font-size:1.4rem;">menu_book</span>
            <span class="label-text" style="color:var(--ink-forest); letter-spacing:0.1em;">THE DAY'S WHISPERS</span>
          </div>

          <div style="background:rgba(255,255,255,0.6); border-radius:16px; border:1px solid rgba(47,79,62,0.05); padding:24px; margin-bottom:32px;">
            
            <div style="margin-bottom:24px;">
              <div style="font-size:0.6rem; color:#8C6A66; font-family:var(--font-label); letter-spacing:0.1em; margin-bottom:8px;">10:14 AM • YOU</div>
              <p class="handwriting" style="font-size:1.3rem; color:var(--ink-forest); line-height:1.4; margin:0;">
                The light in the conservatory is perfect right now. It feels like we're inside a giant emerald.
              </p>
            </div>

            <div style="margin-bottom:24px;">
              <div style="font-size:0.6rem; color:#8C6A66; font-family:var(--font-label); letter-spacing:0.1em; margin-bottom:8px;">10:16 AM • HIM</div>
              <p class="handwriting" style="font-size:1.3rem; color:#8C6A66; line-height:1.4; margin:0;">
                I'm watching the way the shadows of the ferns dance on your notebook. Don't move, I want to remember this exactly.
              </p>
            </div>

            <div style="margin-bottom:8px;">
              <div style="font-size:0.6rem; color:#8C6A66; font-family:var(--font-label); letter-spacing:0.1em; margin-bottom:8px;">2:45 PM • YOU</div>
              <p class="handwriting" style="font-size:1.3rem; color:var(--ink-forest); line-height:1.4; margin:0;">
                Found a pressed leaf from last autumn in my pocket. A little piece of time travel.
              </p>
            </div>

          </div>

          <!-- Tags -->
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:48px;">
            <span style="background:rgba(47,79,62,0.06); color:var(--ink-forest); font-family:var(--font-label); font-size:0.65rem; font-weight:700; letter-spacing:0.1em; padding:8px 16px; border-radius:16px;">#BOTANICALS</span>
            <span style="background:rgba(47,79,62,0.06); color:var(--ink-forest); font-family:var(--font-label); font-size:0.65rem; font-weight:700; letter-spacing:0.1em; padding:8px 16px; border-radius:16px;">#AFTERNOON_LIGHT</span>
            <span style="background:rgba(47,79,62,0.06); color:var(--ink-forest); font-family:var(--font-label); font-size:0.65rem; font-weight:700; letter-spacing:0.1em; padding:8px 16px; border-radius:16px;">#WHISPERS</span>
          </div>
          
        </div>
      </div>

      <!-- New/Edit Entry Form -->
      <div id="entry-form-view" class="hidden">
        <div class="entry-form glass-form">
          <h2 class="auth-title headline">New Entry</h2>
          <p class="auth-subtitle handwriting">Chronicle a new memory...</p>
          
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Date</label></div>
            <input type="date" id="ef-date" class="input-field" />
          </div>
          <div class="form-group" style="display:flex;gap:16px;">
            <div style="flex:1;">
              <div class="form-label-row"><label class="label-text">Mood</label></div>
              <select id="ef-mood" class="input-field"><option value="">Mood...</option>${MOODS.map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
            </div>
            <div style="flex:1;">
              <div class="form-label-row"><label class="label-text">Flower</label></div>
              <select id="ef-flower" class="input-field"><option value="">Flower...</option>${Object.entries(FLOWERS).map(([k,v])=>`<option value="${k}">${v.emoji} ${v.label}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Title</label></div>
            <input type="text" id="ef-title" class="input-field" placeholder="A day to remember" />
          </div>
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Story</label></div>
            <textarea id="ef-text" class="input-field textarea" placeholder="Write your heart out..." rows="6"></textarea>
          </div>
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Media</label></div>
            <input type="file" id="ef-media" class="input-field" accept="image/*,video/*,audio/*" multiple />
          </div>
          
          <div class="form-actions">
            <button id="ef-save" class="btn-primary">Save Entry</button>
            <button id="ef-cancel" class="btn-secondary">Cancel</button>
          </div>
          <div class="auth-status" id="ef-status"></div>
        </div>
      </div>

      <!-- Stats View -->
      <div id="stats-view" class="hidden">
        <div class="stats-grid" id="stats-grid"></div>
        <div class="empty-pages handwriting">"These pages are empty because we haven't lived them yet."</div>
      </div>

      <!-- Letters View -->
      <!-- Gallery View -->
      <div id="gallery-view" class="hidden dashboard-container" style="background:var(--linen-surface); min-height:100vh; padding-bottom:120px; overflow-x:hidden; position:relative;">
        
        <!-- Header Text -->
        <div style="text-align:center; padding-top:40px; margin-bottom:48px;">
          <div style="display:inline-block; background:var(--blush-light); color:#8C6A66; font-family:var(--font-label); font-size:0.65rem; font-weight:700; letter-spacing:0.1em; padding:6px 16px; border-radius:16px; margin-bottom:16px;">
            A LIVING HEIRLOOM
          </div>
          <h1 class="headline" style="font-size:3rem; color:var(--ink-forest); margin-bottom:16px; line-height:1.1;">Memories<br>Gallery</h1>
          <p style="font-family:var(--font-headline); font-style:italic; font-size:1.1rem; color:var(--ink-forest); opacity:0.8; max-width:80%; margin:0 auto; line-height:1.4;">
            "In every pressed petal and captured light, a fragment of the soul resides."
          </p>
          <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin-top:24px; opacity:0.6;">
            <div style="height:1px; width:60px; background:rgba(47,79,62,0.3);"></div>
            <span class="material-symbols-outlined" style="color:var(--ink-forest); font-size:1.2rem;">local_florist</span>
            <div style="height:1px; width:60px; background:rgba(47,79,62,0.3);"></div>
          </div>
        </div>

        <!-- Gallery Grid/List -->
        <div style="display:flex; flex-direction:column; align-items:center; gap:40px;">

          <!-- Polaroid 1 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(-1deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">JUNE 14</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">The morning the jasmine finally bloomed by the window sill.</div>
          </div>

          <!-- Polaroid 2 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(2deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">OCT 02</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">Lost in the whispers of the ancient pines.</div>
          </div>

          <!-- Polaroid 3 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(-1.5deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1518080838128-4ce68fdfb6e7?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">NOV 22</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">A secret shared between the pages of time.</div>
          </div>

      <!-- Profile Setup View -->
      <div id="profile-setup-view" class="hidden dashboard-container" style="background:var(--linen-surface); min-height:100vh; padding-top:40px; padding-bottom:80px; display:flex; flex-direction:column; align-items:center; overflow-y:auto; overflow-x:hidden;">
        
        <!-- Header Text -->
        <div style="text-align:center; margin-bottom:32px;">
          <h1 class="headline" style="font-size:2rem; color:var(--ink-forest); margin-bottom:24px;">Botanical Diary</h1>
          <h2 class="headline" style="font-size:1.8rem; color:var(--ink-forest); margin-bottom:8px;">Tending Your Profile</h2>
          <p class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">Every gardener leaves a unique mark upon the earth...</p>
        </div>

        <!-- Main Card -->
        <div style="background:#fff; border-radius:24px; padding:40px 32px; width:90%; max-width:400px; box-shadow:0 12px 48px rgba(0,0,0,0.04); position:relative; overflow:hidden;">
          
          <!-- Leaf Decor -->
          <span class="material-symbols-outlined" style="position:absolute; top:-24px; right:-24px; font-size:8rem; color:var(--pressed-sage); opacity:0.15; transform:rotate(45deg); pointer-events:none;">energy_savings_leaf</span>

          <!-- Photo Upload -->
          <div style="text-align:center; margin-bottom:32px; position:relative; z-index:1;">
            <div style="position:relative; display:inline-block;">
              <div style="width:120px; height:120px; border-radius:50%; border:2px dashed rgba(166,180,161,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#8C6A66; background:transparent; cursor:pointer; transition:all 0.3s ease;">
                <span class="material-symbols-outlined" style="font-size:2rem; margin-bottom:4px; color:var(--pressed-sage);">local_florist</span>
                <span style="font-family:var(--font-label); font-size:0.7rem; font-weight:700; letter-spacing:0.05em; color:var(--pressed-sage);">Plant a Photo</span>
              </div>
              <button class="icon-btn" style="position:absolute; bottom:0; right:0; background:var(--ink-forest); color:#fff; width:36px; height:36px; box-shadow:0 4px 12px rgba(47,79,62,0.2);">
                <span class="material-symbols-outlined" style="font-size:1rem;">camera_alt</span>
              </button>
            </div>
            <p class="handwriting" style="font-size:1.2rem; color:var(--ink-forest); margin-top:24px;">"A face that reflects the beauty of your inner garden"</p>
          </div>

          <!-- Form Fields -->
          <div class="form-group" style="margin-bottom:32px; position:relative; z-index:1;">
            <label class="headline" style="font-size:1.4rem; color:var(--ink-forest); display:block; margin-bottom:8px;">How shall we call you?</label>
            <input type="text" id="profile-setup-name" class="input-field" style="border:none; border-bottom:1px solid rgba(47,79,62,0.3); border-radius:0; padding:12px 0; background:transparent; font-family:var(--font-body); font-size:1rem; box-shadow:none; outline:none;" placeholder="E.g. Clara Thorne">
            <p class="handwriting" style="font-size:1.1rem; color:var(--ink-forest); margin-top:8px;">Your chosen pseudonym or given name.</p>
          </div>

          <div class="form-group" style="margin-bottom:40px; position:relative; z-index:1;">
            <label class="headline" style="font-size:1.4rem; color:var(--ink-forest); display:block; margin-bottom:8px;">Your Rooted Location</label>
            <div style="position:relative;">
              <input type="text" id="profile-setup-location" class="input-field" style="border:none; border-bottom:1px solid rgba(47,79,62,0.3); border-radius:0; padding:12px 32px 12px 0; background:transparent; font-family:var(--font-body); font-size:1rem; box-shadow:none; outline:none;" placeholder="London, United Kingdom">
              <span class="material-symbols-outlined" style="position:absolute; right:0; top:50%; transform:translateY(-50%); color:var(--pressed-sage);">location_on</span>
            </div>
            <p class="handwriting" style="font-size:1.1rem; color:var(--ink-forest); margin-top:8px;">To help us identify your local flora.</p>
          </div>

          <!-- Divider -->
          <div style="display:flex; align-items:center; justify-content:center; margin-bottom:40px; gap:16px;">
            <div style="height:1px; flex:1; background:rgba(47,79,62,0.1);"></div>
            <span class="material-symbols-outlined" style="color:var(--pressed-sage); font-size:1.5rem;">local_florist</span>
            <div style="height:1px; flex:1; background:rgba(47,79,62,0.1);"></div>
          </div>

          <!-- Actions -->
          <div style="text-align:center;">
            <button class="btn-primary" id="profile-setup-save-btn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:16px; border-radius:24px; font-family:var(--font-label); letter-spacing:0.05em; margin-bottom:16px; box-shadow:0 8px 24px rgba(47,79,62,0.2);">
              Enter the Garden <span class="material-symbols-outlined" style="font-size:1.2rem;">arrow_forward</span>
            </button>
            <button class="btn-secondary" id="profile-setup-skip-btn" style="background:transparent; border:none; color:var(--ink-forest); font-family:var(--font-label); letter-spacing:0.05em; font-size:0.8rem; box-shadow:none;">Skip for now</button>
          </div>

        </div>
      </div>

      <!-- Polaroid 4 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(1.5deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">AUG 15</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">Where the sky touches the stillness of the water.</div>
          </div>

          <!-- Polaroid 5 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(-2deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">DEC 04</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">Keys to a room I haven't visited in years.</div>
          </div>

          <!-- Polaroid 6 -->
          <div class="polaroid-card" style="background:#fff; padding:12px 12px 32px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); width:85%; max-width:320px; text-align:center; position:relative; transform:rotate(1deg); transition:transform 0.3s ease;">
            <div style="position:relative; width:100%; aspect-ratio:1; margin-bottom:16px;">
              <img src="https://images.unsplash.com/photo-1596404987673-9c869ea4a367?q=80&w=600&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); color:#fff; font-family:var(--font-label); font-size:0.6rem; letter-spacing:0.1em; padding:4px 8px; border-radius:12px;">MAR 11</div>
            </div>
            <div class="handwriting" style="font-size:1.4rem; color:var(--ink-forest); line-height:1.4;">The scent of roses in the old garden wall.</div>
          </div>

        </div>
        
        <!-- FAB Add Button -->
        <button class="icon-btn" style="position:fixed; bottom:100px; right:24px; background:var(--ink-forest); color:#fff; width:56px; height:56px; box-shadow:0 8px 24px rgba(47,79,62,0.3); z-index:100;">
          <span class="material-symbols-outlined" style="font-size:1.8rem;">add</span>
        </button>

      </div>

      <div id="letters-view" class="hidden">
        <div class="letters-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
          <h2 class="headline">Future Letters <span class="material-symbols-outlined" style="vertical-align:middle;font-size:1.8rem;color:var(--petal-dust)">mail</span></h2>
          <button class="btn-primary" id="new-letter-btn" style="width:auto;margin:0;padding:12px 24px;">+ Write Letter</button>
        </div>
        <div id="letter-form" class="hidden entry-form glass-form" style="margin-bottom:24px;">
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Message</label></div>
            <textarea id="lf-msg" class="input-field textarea" placeholder="Write a letter to the future..." rows="4"></textarea>
          </div>
          <div class="form-group">
            <div class="form-label-row"><label class="label-text">Delivery Date</label></div>
            <input type="date" id="lf-date" class="input-field" />
          </div>
          <div class="form-actions">
            <button id="lf-save" class="btn-primary">Seal & Send</button>
            <button id="lf-cancel" class="btn-secondary">Cancel</button>
          </div>
        </div>
        <div id="letters-list"></div>
        <div id="letters-list"></div>
      </div>

      <!-- Profile View -->
      <div id="profile-view" class="hidden dashboard-container" style="text-align:center;">
        <div class="profile-header">
          <div class="profile-avatar-large">
            <div class="status-dot"></div>
          </div>
          <h2 class="profile-name headline">Evelyn Thorne</h2>
          <p class="profile-role handwriting">Head Botanist</p>
          <p class="profile-member-since label-text" style="color:var(--pressed-sage);margin-top:8px;text-transform:none;">Member since 1924</p>
          <button class="hero-btn" style="margin-top:24px;" id="edit-profile-btn"><span class="material-symbols-outlined" style="font-size:1.2rem">edit</span> Edit Garden Profile</button>
        </div>

        <div class="profile-divider">
          <span>Garden Stats</span>
        </div>

        <div class="action-grid profile-stats" style="grid-template-columns: repeat(3, 1fr);">
          <div class="action-card">
            <div class="action-icon-wrap" style="background:transparent; color:var(--ink-forest); margin-bottom:0;"><span class="material-symbols-outlined">menu_book</span></div>
            <div class="stat-number headline">124</div>
            <div class="action-label" style="text-transform:none; font-weight:700;">Memories Planted</div>
          </div>
          <div class="action-card">
            <div class="action-icon-wrap" style="background:transparent; color:var(--ink-forest); margin-bottom:0;"><span class="material-symbols-outlined">calendar_today</span></div>
            <div class="stat-number headline">342</div>
            <div class="action-label" style="text-transform:none; font-weight:700;">Days Tending</div>
          </div>
          <div class="action-card">
            <div class="action-icon-wrap" style="background:transparent; color:var(--ink-forest); margin-bottom:0;"><span class="material-symbols-outlined">eco</span></div>
            <div class="stat-number headline">12</div>
            <div class="action-label" style="text-transform:none; font-weight:700;">Shared Blooms</div>
          </div>
        </div>

        <div class="profile-divider">
          <span>Personal Flora</span>
        </div>
        <div class="flora-tags">
          <span class="flora-tag">Gratitude</span>
          <span class="flora-tag">Midnight Thoughts</span>
          <span class="flora-tag">Sunday Walks</span>
          <span class="flora-tag">Rainy Afternoons</span>
          <span class="flora-tag">Seedlings</span>
          <span class="flora-tag">Wanderlust</span>
        </div>

        <div class="profile-divider">
          <span>Recent Bloom</span>
        </div>
        <div class="recent-bloom-card">
          <div class="rb-pin"><span class="material-symbols-outlined">push_pin</span></div>
          <div class="rb-photo"></div>
        </div>
        
        <button class="btn-secondary" id="logout-btn" style="margin-top:64px; border-color:var(--petal-dust); color:var(--pressed-sage);">Sign Out</button>
      </div>
      
      <!-- Invite View -->
      <div id="invite-view" class="hidden dashboard-container" style="text-align:center; position:relative; overflow:hidden;">
        <span class="material-symbols-outlined" style="position:absolute; top:-50px; left:-100px; font-size:400px; color:var(--ink-forest); opacity:0.05; pointer-events:none; z-index:0;">local_florist</span>
        <span class="material-symbols-outlined" style="position:absolute; bottom:-50px; right:-100px; font-size:400px; color:var(--ink-forest); opacity:0.05; pointer-events:none; z-index:0;">eco</span>
        
        <div class="invite-header-bar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 48px; position:relative; z-index:1;">
          <button class="icon-btn" id="invite-back-btn"><span class="material-symbols-outlined">arrow_back</span></button>
          <h2 class="headline" style="font-size:1.5rem; margin:0; flex:1;">Invite to Your Garden</h2>
          <div class="app-avatar" style="width:32px; height:32px; border:none; margin:0;"></div>
        </div>

        <div class="invite-content" style="position:relative; z-index:1;">
          <h1 class="headline" style="font-size:1.8rem; color:var(--ink-forest); margin-bottom:16px;">Share Your Sanctuary</h1>
          <p style="color:#5C6B61; line-height:1.6; margin-bottom:48px; max-width:400px; margin-left:auto; margin-right:auto;">
            Invite a trusted companion to witness the growth of your memories. Together, you can tend to this digital herbarium.
          </p>

          <div class="invite-code-card">
            <div class="label-text" style="color:#8C6A66; margin-bottom:24px; letter-spacing:0.1em;">UNIQUE GARDEN CODE</div>
            <div id="invite-code-display" class="invite-code-text headline" style="font-size:1.8rem; letter-spacing:0.2em; margin-bottom:32px; color:var(--ink-forest);">BLOOM-1234</div>
            
            <div class="leaf-divider" style="display:flex;align-items:center;color:#8C6A66;margin-bottom:32px; opacity:0.6;"><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-right:16px;"></span><span class="material-symbols-outlined" style="font-size:1.2rem;">local_florist</span><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-left:16px;"></span></div>

            <div class="handwriting" style="color:#FFB6C1; font-size:1.8rem; margin-bottom:48px; text-shadow:0 1px 2px rgba(0,0,0,0.05);">
              "In every garden, there is a story waiting to be told."
            </div>

            <button id="invite-copy-btn" class="btn-secondary" style="border-radius:24px; padding:12px 32px; border-color:rgba(47,79,62,0.2); background:transparent; display:inline-flex; align-items:center; gap:8px;">
              <span class="material-symbols-outlined" style="font-size:1.2rem;">content_copy</span> Copy Code
            </button>
          </div>

          <div class="invite-actions" style="margin-top:48px; max-width:400px; margin-left:auto; margin-right:auto;">
            <button id="invite-share-btn" class="btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:12px; border-radius:8px; padding:16px; margin-bottom:16px;">
              <span class="material-symbols-outlined">share</span> SHARE INVITE LINK
            </button>
            <div style="display:flex; gap:16px;">
              <button id="invite-email-btn" class="btn-secondary" style="flex:1; display:flex; justify-content:center; align-items:center; gap:8px; border-radius:8px; background:transparent;">
                <span class="material-symbols-outlined" style="font-size:1.2rem;">mail</span> EMAIL
              </button>
              <button id="invite-message-btn" class="btn-secondary" style="flex:1; display:flex; justify-content:center; align-items:center; gap:8px; border-radius:8px; background:transparent;">
                <span class="material-symbols-outlined" style="font-size:1.2rem;">chat</span> MESSAGE
              </button>
            </div>
            
            <p style="color:#8C6A66; font-size:0.85rem; line-height:1.6; margin-top:32px; opacity:0.8;">
              Your invite link expires in 24 hours. Privacy is<br>our most cherished blossom.
            </p>
            <button onclick="showView('join-view')" style="margin-top:24px; background:transparent; border:none; color:var(--ink-forest); font-family:var(--font-label); letter-spacing:0.1em; font-size:0.85rem; text-decoration:underline; cursor:pointer;">
              HAVE A CODE?
            </button>
          </div>
        </div>
      </div>
      <!-- Join View -->
      <div id="join-view" class="hidden dashboard-container" style="text-align:center; position:relative; overflow:hidden; min-height:100vh; padding-bottom: 120px;">
        <span class="material-symbols-outlined" style="position:absolute; top:20%; left:-50px; font-size:300px; color:var(--ink-forest); opacity:0.04; pointer-events:none; z-index:0; transform: rotate(15deg);">eco</span>
        <span class="material-symbols-outlined" style="position:absolute; bottom:10%; right:-80px; font-size:400px; color:var(--ink-forest); opacity:0.04; pointer-events:none; z-index:0; transform: rotate(-10deg);">local_florist</span>
        
        <div class="invite-header-bar" style="display:flex; align-items:center; margin-bottom: 48px; position:relative; z-index:1;">
          <button class="icon-btn" id="join-back-btn"><span class="material-symbols-outlined">arrow_back</span></button>
          <h2 class="handwriting" style="font-size:1.8rem; margin:0; flex:1; color:var(--ink-forest);">Botanical Diary</h2>
          <div style="width:24px;"></div>
        </div>

        <div class="invite-content" style="position:relative; z-index:1;">
          <div class="join-code-card">
            <span class="material-symbols-outlined" style="font-size:3rem; color:var(--ink-forest); margin-bottom:16px;">home</span>
            <h1 class="headline" style="font-size:2rem; color:var(--ink-forest); margin-bottom:16px;">Join a Greenhouse</h1>
            <p class="handwriting" style="font-size:1.4rem; color:#5C6B61; line-height:1.4; margin-bottom:32px; max-width:280px; margin-left:auto; margin-right:auto;">
              Enter the code shared with you to start growing your story together.
            </p>

            <div class="code-inputs" style="display:flex; justify-content:center; gap:8px; margin-bottom:24px;">
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
              <input type="text" maxlength="1" class="code-box" placeholder="•" />
            </div>

            <div class="leaf-divider" style="display:flex;align-items:center;color:#8C6A66;margin-bottom:24px; opacity:0.6;"><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-right:16px;"></span><span class="material-symbols-outlined" style="font-size:1.2rem;">eco</span><span style="flex:1;border-bottom:1px solid rgba(47,79,62,0.1);margin-left:16px;"></span></div>

            <p class="label-text" style="color:#8C6A66; margin-bottom:32px; letter-spacing:0.05em; text-transform:none;">
              Codes are 8 characters long and expire after 24 hours
            </p>

            <div class="polaroid-preview" style="background:#fff; padding:8px 8px 32px 8px; box-shadow:0 8px 24px rgba(0,0,0,0.1); display:inline-block; transform:rotate(-3deg); margin-bottom:48px;">
              <div style="width:160px; height:100px; background:url('https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?q=80&w=400&auto=format&fit=crop') center/cover;"></div>
              <div class="handwriting" style="font-size:1.1rem; color:#5C6B61; margin-top:8px;">Your space awaits...</div>
            </div>

            <div id="join-status" class="label-text" style="color:#c45c5c; margin-bottom:16px;"></div>

            <button id="join-connect-btn" class="btn-primary" style="width:100%; border-radius:8px; padding:16px; margin-bottom:16px; font-weight:600; letter-spacing:0.05em;">
              Connect
            </button>
          </div>

          <p style="color:#5C6B61; font-weight:600; margin-top:32px; font-size:0.9rem;">
            Can't find the code? <a href="#" style="color:#5C6B61; text-decoration:underline;">Contact the gardener</a>
          </p>
        </div>

        <div class="join-footer" style="margin-top:64px; position:relative; z-index:1;">
          <div class="handwriting" style="font-size:1.6rem; color:var(--ink-forest); margin-bottom:16px;">Botanical Diary</div>
          <div style="display:flex; justify-content:center; gap:24px; margin-bottom:24px; font-family:var(--font-label); font-weight:700; font-size:0.85rem; color:#5C6B61; letter-spacing:0.05em;">
            <a href="#" style="color:inherit; text-decoration:none;">Privacy</a>
            <a href="#" style="color:inherit; text-decoration:none;">Security</a>
            <a href="#" style="color:inherit; text-decoration:underline;">Our Story</a>
          </div>
          <div style="color:#8C6A66; font-size:0.75rem; font-family:var(--font-label); font-weight:700; letter-spacing:0.05em;">
            © 2024 Botanical Diary. A Living Heirloom.
          </div>
        </div>
      </div>
    </div> <!-- /app-view-container -->
  </div> <!-- /home-content-scroll -->

  <!-- Bottom Navigation -->
  <div class="bottom-nav">
    <div class="nav-item active" data-target="home-view">
      <span class="material-symbols-outlined nav-item-icon">menu_book</span>
      <span class="nav-item-label">JOURNAL</span>
    </div>
    <div class="nav-item" data-target="chat-view">
      <span class="material-symbols-outlined nav-item-icon">chat_bubble_outline</span>
      <span class="nav-item-label">CHAT</span>
    </div>
    <div class="nav-item" data-target="diary-view">
      <span class="material-symbols-outlined nav-item-icon">local_florist</span>
      <span class="nav-item-label">GARDEN</span>
    </div>
    <div class="nav-item" data-target="gallery-view">
      <span class="material-symbols-outlined nav-item-icon">collections</span>
      <span class="nav-item-label">MEMORIES</span>
    </div>
  </div>
</div>
`

// Background decor handles the background visuals now

// ===== HELPERS =====
const $ = id => document.getElementById(id)
window.$ = $;
const setStatus = (id, msg, err=false) => { const e=$(id); e.textContent=msg; e.style.color=err?'#c45c5c':'var(--sage)' }
window.setStatus = setStatus;
const showForm = id => ['login-form','signup-form','otp-form','forgot-form'].forEach(f => $(f).classList.toggle('hidden', f!==id))
window.showForm = showForm;
const showView = id => ['home-view','chat-view','diary-view','entry-form-view','stats-view','letters-view','profile-view','invite-view','join-view','gallery-view','profile-setup-view'].forEach(f => $(f).classList.toggle('hidden', f!==id))
window.showView = showView;

function formatDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) }

function unlockDiary(instant = false, isNewUser = false) {
  const l = $('landing-page'), m = $('main-app')
  const targetView = isNewUser ? 'profile-setup-view' : 'home-view'
  if (instant) {
    l.style.display = 'none'
    m.classList.remove('hidden')
    m.style.display = 'flex'
    m.style.opacity = '1'
    showView(targetView)
    loadApp()
  } else {
    l.style.opacity = '0'
    setTimeout(() => { 
      l.style.display='none'; 
      m.classList.remove('hidden');
      m.style.display='flex'; 
      requestAnimationFrame(()=>m.style.opacity='1'); 
      showView(targetView);
      loadApp() 
    }, 1000)
  }
}

// Check for existing session on page load
if (db.supabase) {
  db.supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) unlockDiary(true)
  })
}

// ===== AUTH =====
$('toggle-login').onclick = () => showForm('login-form')
$('toggle-signup').onclick = () => showForm('signup-form')
const navBtn = $('nav-signin-btn')
if (navBtn) navBtn.onclick = (e) => { e.preventDefault(); showForm('login-form') }

let signupEmail = ''

$('login-btn').onclick = async () => {
  const email=$('login-email').value.trim(), pw=$('login-password').value
  if (!email||!pw) return setStatus('login-status','Fill in all fields',true)
  if (!db.supabase) { unlockDiary(); return }
  $('login-btn').disabled=true; $('login-btn').textContent='Opening...'
  try { await db.login(email,pw); unlockDiary() }
  catch(e) { setStatus('login-status',e.message,true) }
  finally { $('login-btn').disabled=false; $('login-btn').textContent='Open Our Diary' }
}

$('signup-btn').onclick = async () => {
  const email=$('signup-email').value.trim(), phone=$('signup-phone').value.trim(), pw=$('signup-password').value
  if (!email||!phone||!pw) return setStatus('signup-status','Fill in all fields',true)
  if (pw.length<6) return setStatus('signup-status','Password: 6+ characters',true)
  signupEmail = email
  if (!db.supabase) { showForm('otp-form'); setStatus('otp-status','Demo — enter any digits'); return }
  $('signup-btn').disabled=true; $('signup-btn').textContent='Sending...'
  try {
    const result = await db.signUp(email,pw,phone)
    if (result.autoConfirmed) { unlockDiary(false, true) }
    else { showForm('otp-form'); setStatus('otp-status',`Code sent to ${email}`) }
  }
  catch(e) { setStatus('signup-status',e.message,true) }
  finally { $('signup-btn').disabled=false; $('signup-btn').textContent='Create Account' }
}

// Forgot password
$('forgot-btn').onclick = () => showForm('forgot-form')
$('forgot-back-btn').onclick = () => showForm('login-form')
$('reset-btn').onclick = async () => {
  const email = $('forgot-email').value.trim()
  if (!email) return setStatus('forgot-status','Enter your email',true)
  if (!db.supabase) return setStatus('forgot-status','Demo mode',true)
  $('reset-btn').disabled=true; $('reset-btn').textContent='Sending...'
  try { await db.resetPassword(email); setStatus('forgot-status','Reset link sent! Check your email.') }
  catch(e) { setStatus('forgot-status',e.message,true) }
  finally { $('reset-btn').disabled=false; $('reset-btn').textContent='Send Reset Link' }
}

$('verify-btn').onclick = async () => {
  const token=$('otp-input').value.trim()
  if (!token) return setStatus('otp-status','Enter the code',true)
  if (!db.supabase) { unlockDiary(false, true); return }
  try { await db.verifyOtp(signupEmail,token); unlockDiary(false, true) }
  catch(e) { setStatus('otp-status',e.message,true) }
}

$('back-btn').onclick = () => { showForm('signup-form'); $('otp-input').value='' }

// Password show/hide toggle
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.onclick = () => {
    const input = $(btn.dataset.target)
    const isHidden = input.type === 'password'
    input.type = isHidden ? 'text' : 'password'
    const span = btn.querySelector('.material-symbols-outlined')
    if (span) span.textContent = isHidden ? 'visibility_off' : 'visibility'
  }
})

// ===== TABS =====
document.querySelectorAll('.nav-item[data-target]').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'))
    t.classList.add('active')
    showView(t.dataset.target)
    if (t.dataset.target === 'chat-view') loadChat()
    if (t.dataset.target === 'stats-view') loadStats()
    if (t.dataset.target === 'letters-view') loadLetters()
  }
})

// Wire up the new dashboard buttons
$('hero-tend-btn').onclick = () => initNewEntryForm()
$('nav-plant-btn').onclick = () => initNewEntryForm()
$('nav-whisper-btn').onclick = () => { showView('chat-view'); loadChat(); }
$('nav-greenhouse-btn').onclick = () => { showView('chat-view'); loadChat(); }
$('nav-shared-btn').onclick = () => showView('join-view')

$('app-avatar-btn').onclick = () => showView('profile-view')
$('logout-btn').onclick = async () => { if(confirm('Sign out of your diary?')) { if(db.supabase) await db.logout(); location.reload() } }

$('app-menu-btn').onclick = () => $('settings-sidebar').classList.add('open')
$('close-settings-btn').onclick = () => $('settings-sidebar').classList.remove('open')
$('settings-sidebar').onclick = (e) => { if(e.target === $('settings-sidebar')) $('settings-sidebar').classList.remove('open') }
$('settings-leave-btn').onclick = async () => { if(confirm('Leave the Garden?')) { if(db.supabase) await db.logout(); location.reload() } }

async function loadInviteCode() {
  if (!db.supabase) {
    $('invite-code-display').textContent = 'DEMO-1234';
    return;
  }
  try {
    let conn = await db.getConnection();
    if (!conn) conn = await db.createConnection();
    $('invite-code-display').textContent = conn.invite_code || 'BLOOM-1234';
  } catch(e) {
    console.error('Failed to get invite code:', e);
  }
}

$('settings-manage-codes').onclick = async () => {
  $('settings-sidebar').classList.remove('open');
  await loadInviteCode();
  showView('invite-view');
}
$('invite-back-btn').onclick = () => {
  showView('profile-view');
}
$('join-back-btn').onclick = () => {
  showView('home-view');
}

// ===== LOAD APP =====
let chatChannel = null
async function loadApp() {
  loadGoogleAuth()
  if (!db.supabase) { renderEntries([]); return }
  try {
    currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
    loadChat()
  }
  catch(e) { console.error(e) }
}

// ===== CHAT =====
let currentUserId = null
let currentConnectionId = null

async function loadChat() {
  if (!db.supabase) return
  try {
    const user = await db.getUser()
    currentUserId = user?.id

    // Check URL for invite code
    const urlParams = new URLSearchParams(window.location.search)
    const connectCode = urlParams.get('connect')
    if (connectCode) {
      // Remove code from URL
      window.history.replaceState({}, '', window.location.pathname)
      try {
        await db.acceptConnection(connectCode)
      } catch(e) {
        setStatus('connect-status', e.message, true)
      }
    }

    // Check for existing connection
    const conn = await db.getConnection()
    if (conn && conn.status === 'connected') {
      // Connected! Show chat
      currentConnectionId = conn.id
      $('connect-setup').classList.add('hidden')
      $('chat-connected').classList.remove('hidden')

      // Show partner name
      const rel = await db.getRelationshipInfo().catch(() => null)
      if (rel?.partner_name) $('chat-partner-name').textContent = rel.partner_name

      const messages = await db.getMessages(conn.id, 100)
      renderMessages(messages)
      if (chatChannel) db.unsubscribeFromMessages(chatChannel)
      chatChannel = db.subscribeToMessages(conn.id, msg => appendMessage(msg))
    } else if (conn && conn.status === 'pending') {
      // Waiting for partner
      $('connect-setup').classList.remove('hidden')
      $('chat-connected').classList.add('hidden')
      $('invite-link-box').classList.remove('hidden')
      $('invite-link').value = db.getInviteLink(conn.invite_code)
    } else {
      // No connection — show setup
      $('connect-setup').classList.remove('hidden')
      $('chat-connected').classList.add('hidden')
    }
  } catch(e) { console.error('Chat load error:', e) }
}

// Connection handlers
$('generate-link-btn').onclick = async () => {
  if (!db.supabase) return
  $('generate-link-btn').disabled = true
  $('generate-link-btn').textContent = 'Generating...'
  try {
    const conn = await db.createConnection()
    $('invite-link').value = db.getInviteLink(conn.invite_code)
    $('invite-link-box').classList.remove('hidden')
    $('generate-link-btn').classList.add('hidden')
  } catch(e) {
    setStatus('connect-status', e.message, true)
  } finally {
    $('generate-link-btn').disabled = false
    $('generate-link-btn').textContent = '✨ Generate Connection Link'
  }
}

$('copy-link-btn').onclick = () => {
  navigator.clipboard.writeText($('invite-link').value)
  $('copy-link-btn').textContent = '✅ Copied!'
  setTimeout(() => $('copy-link-btn').textContent = '📋 Copy', 2000)
}

$('accept-link-btn').onclick = async () => {
  let code = $('invite-code-input').value.trim()
  if (!code) return setStatus('connect-status', 'Enter an invite code', true)
  // Extract code from URL if pasted full link
  if (code.includes('connect=')) code = new URL(code).searchParams.get('connect')
  $('accept-link-btn').disabled = true
  $('accept-link-btn').textContent = 'Connecting...'
  try {
    await db.acceptConnection(code)
    setStatus('connect-status', '💕 Connected! Loading chat...')
    setTimeout(() => loadChat(), 1000)
  } catch(e) {
    setStatus('connect-status', e.message, true)
  } finally {
    $('accept-link-btn').disabled = false
    $('accept-link-btn').textContent = 'Connect'
  }
}

function renderMessages(messages) {
  const box = $('chat-messages')
  box.innerHTML = ''
  if (!messages.length) {
    box.innerHTML = '<div class="chat-empty"><div class="chat-empty-icon">💕</div><p>No messages yet</p><p class="chat-empty-sub">Say something beautiful to start your story</p></div>'
    return
  }
  let lastDate = ''
  messages.forEach((m, i) => {
    const msgDate = new Date(m.created_at).toLocaleDateString()
    if (msgDate !== lastDate) {
      lastDate = msgDate
      const sep = document.createElement('div')
      sep.className = 'chat-date-sep'
      const today = new Date().toLocaleDateString()
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
      sep.textContent = msgDate === today ? 'Today' : msgDate === yesterday ? 'Yesterday' : new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      box.appendChild(sep)
    }
    appendMessage(m, false)
  })
  box.scrollTop = box.scrollHeight
}

function appendMessage(msg, scroll = true) {
  const box = $('chat-messages')
  const empty = box.querySelector('.chat-empty')
  if (empty) empty.remove()
  const isMine = msg.user_id === currentUserId
  
  const row = document.createElement('div')
  row.className = `chat-row ${isMine ? 'mine' : 'theirs'}`

  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  let mediaHtml = ''
  if (msg.media_url) {
    if (msg.media_type === 'photo') mediaHtml = `<img src="${msg.media_url}" class="chat-media-img" alt="photo" onclick="window.open('${msg.media_url}','_blank')" />`
    else if (msg.media_type === 'video') mediaHtml = `<video src="${msg.media_url}" class="chat-media-img" controls></video>`
    else if (msg.media_type === 'audio') mediaHtml = `<audio src="${msg.media_url}" controls style="max-width:220px"></audio>`
    else mediaHtml = `<a href="${msg.media_url}" target="_blank" class="chat-file-link">📎 File</a>`
  }

  const isHeart = msg.content === '❤️' && !msg.media_url

  row.innerHTML = `
    ${!isMine ? '<div class="chat-avatar-sm"></div>' : ''}
    <div class="chat-bubble ${isMine ? 'mine' : 'theirs'} ${isHeart ? 'heart-msg' : ''} ${msg.media_url ? 'has-media' : ''}">
      ${mediaHtml}
      ${msg.content ? `<p class="chat-text">${isHeart ? '<span class="big-heart">❤️</span>' : msg.content}</p>` : ''}
      <span class="chat-time">${time}</span>
    </div>
  `
  box.appendChild(row)
  if (scroll) box.scrollTop = box.scrollHeight
}

// Chat input — toggle send btn between heart and arrow
const chatInput = $('chat-input')
const chatSendBtn = $('chat-send-btn')

chatInput.oninput = () => {
  const hasText = !!chatInput.value.trim()
  chatSendBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.2rem;">${hasText ? 'send' : 'favorite'}</span>`
  chatSendBtn.classList.toggle('has-text', hasText)
}

// Initial state
chatSendBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.2rem;">favorite</span>`

chatSendBtn.onclick = async () => {
  if (!currentConnectionId) return
  const text = chatInput.value.trim()
  if (!text) {
    try { await db.sendMessage(currentConnectionId, '❤️') } catch(e) { console.error(e) }
    return
  }
  chatInput.value = ''
  chatSendBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.2rem;">favorite</span>`
  chatSendBtn.classList.remove('has-text')
  try { await db.sendMessage(currentConnectionId, text) }
  catch(e) { console.error('Send error:', e) }
}

chatInput.onkeydown = (e) => { if (e.key === 'Enter' && chatInput.value.trim()) chatSendBtn.click() }

// Media handlers
$('chat-plus-btn').onclick = () => $('chat-media-input').click()
$('chat-camera-btn').onclick = () => $('chat-gallery-input').click()

async function handleMediaUpload(e) {
  if (!currentConnectionId) return
  const file = e.target.files[0]
  if (!file) return
  try { await db.sendMediaMessage(currentConnectionId, file) }
  catch(err) { console.error('Media send error:', err); alert('Failed to send: ' + err.message) }
  finally { e.target.value = '' }
}

$('chat-media-input').onchange = handleMediaUpload
$('chat-gallery-input').onchange = handleMediaUpload



// ===== TIMELINE =====
function renderTimeline() {
  const tl = $('timeline'); 
  if (!tl) return;
  tl.innerHTML = ''
  currentEntries.slice(0, 12).forEach((entry, i) => {
    const node = document.createElement('div')
    node.className = 'timeline-node' + (i === 0 ? ' active' : '')
    node.style.top = i * 60 + 'px'
    const fl = FLOWERS[entry.flower_type]
    const label = document.createElement('div')
    label.className = 'timeline-label'
    label.textContent = (fl ? fl.emoji + ' ' : '') + formatDate(entry.entry_date)
    node.appendChild(label)
    node.onclick = () => viewEntry(entry.id)
    tl.appendChild(node)
  })
}

// ===== VIEW ENTRY =====
async function viewEntry(id) {
  const entry = currentEntries.find(e => e.id === id) || (db.supabase ? await db.getEntry(id) : null)
  if (!entry) return
  currentEntry = entry
  const fl = FLOWERS[entry.flower_type] || { emoji: '🌿', label: 'A day to remember' }
  const rel = db.supabase ? await db.getRelationshipInfo() : null
  let dayCount = ''
  if (rel?.start_date) { dayCount = `Day ${Math.floor((new Date(entry.entry_date) - new Date(rel.start_date)) / 86400000)} of Us` }

  $('diary-content').innerHTML = `
    <div class="diary-page left">
      <div class="diary-date">${formatDate(entry.entry_date)}</div>
      ${dayCount ? `<div class="diary-day-count">${dayCount}</div>` : ''}
      <div class="flower-badge">${fl.emoji}</div>
      <div class="flower-meaning">${fl.label}</div>
      ${entry.mood ? `<div class="mood-tag">${entry.mood}</div>` : ''}
    </div>
    <div class="diary-page right">
      ${entry.title ? `<h3 class="entry-title">${entry.title}</h3>` : ''}
      <p class="diary-text">${(entry.diary_text||'').replace(/\n/g,'<br>')}</p>
      <div class="entry-actions">
        <button class="btn-icon" id="edit-entry-btn">✏️ Edit</button>
        <button class="btn-icon danger" id="delete-entry-btn">🗑️ Delete</button>
      </div>
    </div>
  `
  showView('diary-view')
  $('edit-entry-btn').onclick = () => openEditForm(entry)
  $('delete-entry-btn').onclick = () => deleteEntryHandler(entry.id)

  // Load media
  if (db.supabase) {
    const media = await db.getMediaForEntry(entry.id)
    renderMedia(media)
  }
}

function renderMedia(media) {
  const mp = $('media-panel')
  if (!media.length) { mp.innerHTML = '<p class="empty-msg">No media yet</p>'; return }
  mp.innerHTML = media.map(m => {
    if (m.file_type === 'photo') return `<div class="polaroid"><img src="${m.file_url}" alt=""/>${m.caption?`<div class="polaroid-caption">${m.caption}</div>`:''}</div>`
    if (m.file_type === 'video') return `<video src="${m.file_url}" controls class="media-video"></video>`
    if (m.file_type === 'audio') return `<div class="audio-player"><div class="audio-flower-btn">▶</div><audio src="${m.file_url}" controls class="audio-el"></audio></div>`
    return ''
  }).join('')
}

function renderEntries(entries) {
  if (!entries.length) {
    $('diary-content').innerHTML = '<p class="empty-msg">Your diary is empty. Create your first entry! ✨</p>'
    return
  }
  viewEntry(entries[0].id)
}

// ===== NEW ENTRY =====
function initNewEntryForm() {
  $('ef-date').value = new Date().toISOString().split('T')[0]
  $('ef-mood').value = ''; $('ef-flower').value = ''; $('ef-title').value = ''; $('ef-text').value = ''
  $('ef-save').dataset.editId = ''
  const title = document.querySelector('#entry-form-view .auth-title')
  if (title) title.textContent = 'New Entry'
  showView('entry-form-view')
}

function openEditForm(entry) {
  $('ef-date').value = entry.entry_date
  $('ef-mood').value = entry.mood || ''
  $('ef-flower').value = entry.flower_type || ''
  $('ef-title').value = entry.title || ''
  $('ef-text').value = entry.diary_text || ''
  $('ef-save').dataset.editId = entry.id
  document.querySelector('.form-title').textContent = 'Edit Entry'
  showView('entry-form-view')
}

$('ef-save').onclick = async () => {
  const data = { entry_date: $('ef-date').value, mood: $('ef-mood').value||null, flower_type: $('ef-flower').value||null, title: $('ef-title').value, diary_text: $('ef-text').value }
  if (!data.entry_date || !data.diary_text) return setStatus('ef-status','Date and text required',true)
  if (!db.supabase) { showView('diary-view'); return }
  $('ef-save').disabled = true
  try {
    const editId = $('ef-save').dataset.editId
    if (editId) { await db.updateEntry(editId, data) } else { const entry = await db.createEntry(data); const files = $('ef-media').files; for(const f of files) await db.uploadMedia(f, entry.id) }
    currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
    showView('diary-view')
  } catch(e) { setStatus('ef-status', e.message, true) }
  finally { $('ef-save').disabled = false }
}

$('ef-cancel').onclick = () => showView('diary-view')

async function deleteEntryHandler(id) {
  if (!confirm('Delete this entry?')) return
  if (!db.supabase) return
  await db.deleteEntry(id)
  currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
}

// ===== STATS =====
async function loadStats() {
  if (!db.supabase) { $('stats-grid').innerHTML = '<p class="empty-msg">Connect Supabase to see stats</p>'; return }
  const s = await db.getStats()
  $('stats-grid').innerHTML = [
    ['💕',s.daysTogether,'Days Together'], ['📖',s.totalEntries,'Diary Entries'], ['📸',s.photos,'Photos'],
    ['🎥',s.videos,'Videos'], ['🎙️',s.voiceNotes,'Voice Notes'], ['💌',s.letters,'Future Letters']
  ].map(([icon,val,label]) => `<div class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-value">${val}</div><div class="stat-label">${label}</div></div>`).join('')
}

// ===== LETTERS =====
async function loadLetters() {
  if (!db.supabase) { $('letters-list').innerHTML = '<p class="empty-msg">Connect Supabase for letters</p>'; return }
  const letters = await db.getLetters()
  const today = new Date().toISOString().split('T')[0]
  $('letters-list').innerHTML = letters.length ? letters.map(l => {
    const canOpen = l.deliver_date <= today
    return `<div class="letter-card ${l.is_opened?'opened':'sealed'}">
      <div class="letter-date">📅 ${formatDate(l.deliver_date)}</div>
      ${l.is_opened ? `<p class="letter-msg">${l.message}</p>` : `<p class="letter-sealed">🔒 Sealed until ${formatDate(l.deliver_date)}</p>`}
      ${canOpen && !l.is_opened ? `<button class="auth-btn btn-sm open-letter-btn" data-id="${l.id}">Open Letter</button>` : ''}
      <button class="btn-icon danger delete-letter-btn" data-id="${l.id}">🗑️</button>
    </div>`
  }).join('') : '<p class="empty-msg">No future letters yet</p>'

  $('letters-list').querySelectorAll('.open-letter-btn').forEach(b => { b.onclick = async () => { await db.openLetter(b.dataset.id); loadLetters() } })
  $('letters-list').querySelectorAll('.delete-letter-btn').forEach(b => { b.onclick = async () => { if(confirm('Delete?')) { await db.deleteLetter(b.dataset.id); loadLetters() } } })
}

$('new-letter-btn').onclick = () => $('letter-form').classList.toggle('hidden')
$('lf-cancel').onclick = () => $('letter-form').classList.add('hidden')
$('lf-save').onclick = async () => {
  const msg=$('lf-msg').value, date=$('lf-date').value
  if (!msg||!date) return
  if (!db.supabase) return
  await db.createLetter(msg, date)
  $('lf-msg').value=''; $('lf-date').value=''; $('letter-form').classList.add('hidden')
  loadLetters()
}

// ===== INVITE VIEW FUNCTIONS =====
$('invite-copy-btn').onclick = () => {
  const code = $('invite-code-display').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const origHtml = $('invite-copy-btn').innerHTML;
    $('invite-copy-btn').innerHTML = '<span class="material-symbols-outlined" style="font-size:1.2rem;">check</span> Copied!';
    setTimeout(() => { $('invite-copy-btn').innerHTML = origHtml; }, 2000);
  });
};

$('invite-share-btn').onclick = () => {
  const code = $('invite-code-display').textContent;
  if (navigator.share) {
    navigator.share({
      title: 'Join my Botanical Diary',
      text: `Join my garden with this unique code: ${code}`,
      url: window.location.href,
    }).catch(console.error);
  } else {
    alert(`Share this code: ${code}`);
  }
};

$('invite-email-btn').onclick = () => {
  const code = $('invite-code-display').textContent;
  const subject = encodeURIComponent('Join my Botanical Diary');
  const body = encodeURIComponent(`Join my garden with this unique code: ${code}\n\n${window.location.href}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

$('invite-message-btn').onclick = () => {
  const code = $('invite-code-display').textContent;
  const body = encodeURIComponent(`Join my Botanical Diary garden with this unique code: ${code}`);
  window.location.href = `sms:?&body=${body}`;
};

$('invite-back-btn').onclick = () => showView('home-view');

// ===== JOIN VIEW FUNCTIONS =====
const codeBoxes = document.querySelectorAll('#join-view .code-box');
codeBoxes.forEach((box, i) => {
  box.onkeyup = (e) => {
    if (e.key !== 'Backspace' && box.value !== '') {
      if (i < codeBoxes.length - 1) codeBoxes[i+1].focus();
    } else if (e.key === 'Backspace') {
      if (i > 0) codeBoxes[i-1].focus();
    }
  };
});

$('join-connect-btn').onclick = async () => {
  const code = Array.from(codeBoxes).map(b => b.value).join('');
  if (code.length < 8) return setStatus('join-status', 'Enter 8-character code', true);
  if (!db.supabase) return setStatus('join-status', 'Demo mode', true);
  
  $('join-connect-btn').disabled = true;
  $('join-connect-btn').textContent = 'Connecting...';
  try {
    await db.acceptConnection(code);
    setStatus('join-status', 'Connected!', false);
    setTimeout(() => { showView('chat-view'); loadChat(); }, 1000);
  } catch(e) {
    setStatus('join-status', e.message, true);
  } finally {
    $('join-connect-btn').disabled = false;
    $('join-connect-btn').textContent = 'Connect';
  }
};

$('profile-setup-save-btn').onclick = async () => {
  const name = $('profile-setup-name').value.trim();
  const loc = $('profile-setup-location').value.trim();
  
  const btn = $('profile-setup-save-btn');
  btn.disabled = true;
  btn.textContent = 'Planting...';

  try {
    if (db.supabase) {
      await db.updateProfile({ full_name: name, location: loc });
    }
    showView('home-view');
  } catch(e) {
    console.error('Failed to save profile:', e);
    alert('Failed to save profile. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Enter the Garden <span class="material-symbols-outlined" style="font-size:1.2rem;">arrow_forward</span>';
  }
};

$('profile-setup-skip-btn').onclick = () => {
  showView('home-view');
};

// ===== GALLERY VIEW FUNCTIONS =====
const galleryAddBtn = document.querySelector('#gallery-view .icon-btn[style*="bottom:24px"]');
if (galleryAddBtn) {
  galleryAddBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        alert('Ready to plant a new memory! (Upload logic goes here)');
      }
    };
    input.click();
  };
}
