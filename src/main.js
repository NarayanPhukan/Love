import './style.css'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseKey)

document.querySelector('#app').innerHTML = `
  <!-- Landing Page -->
  <div id="landing-page">
    <div class="petals-container" id="petals"></div>
    <div class="book-cover">
      <h1 class="book-title">The Botanical Diary of Us</h1>
      <p class="book-quote">“Some people preserve flowers in books. We preserved moments.”</p>
      
      <div class="lock-mechanism" id="auth-container">
        <input type="text" id="auth-input" class="secret-input" placeholder="Phone or Email..." />
        <button id="send-otp-btn" class="open-btn">Send OTP</button>
      </div>
      <div class="lock-mechanism hidden" id="otp-container">
        <input type="text" id="otp-input" class="secret-input" placeholder="Enter OTP..." />
        <button id="verify-btn" class="open-btn">Verify & Open Diary</button>
      </div>
    </div>
  </div>

  <!-- Main Experience -->
  <div id="main-app">
    <!-- Left Sidebar (Timeline) -->
    <div class="sidebar glass">
      <h3 style="color: var(--primary-accent); margin-bottom: 20px; font-family: var(--font-heading);">Our Journey</h3>
      <div class="timeline-vine" id="timeline">
        <!-- Nodes injected by JS -->
      </div>
    </div>

    <!-- Center Content -->
    <div class="center-content">
      <div class="nav-tabs">
        <button class="nav-tab active" data-target="diary-view">Diary</button>
        <button class="nav-tab" data-target="stats-view">Love Stats</button>
      </div>

      <!-- Diary View -->
      <div id="diary-view" class="diary-spread">
        <div class="diary-page left">
          <div class="diary-date">18 June 2026</div>
          <div class="diary-day-count">Day 142 of Us</div>
          
          <img src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Rose" class="pressed-flower" />
          <div class="flower-meaning">Rose • A deeply romantic day</div>
          
          <div class="handwritten-note" style="bottom: 40px; right: 40px;">I love you...</div>
        </div>
        <div class="diary-page right">
          <p class="diary-text">
            Today was nothing short of magical. We walked through the botanical gardens just as the sun began to set. The way the golden light caught your eyes made me fall in love all over again. 
            <br><br>
            We talked about our future, our dreams, and somehow, standing there among the blooming roses, everything felt perfectly aligned. I pressed one of the fallen petals into this diary so we can always remember the warmth of this evening.
          </p>
        </div>
      </div>

      <!-- Stats View -->
      <div id="stats-view">
        <div class="stats-grid">
          <div class="stat-card glass">
            <div class="stat-value">142</div>
            <div class="stat-label">Days Together</div>
          </div>
          <div class="stat-card glass">
            <div class="stat-value">8,402</div>
            <div class="stat-label">Messages</div>
          </div>
          <div class="stat-card glass">
            <div class="stat-value">314</div>
            <div class="stat-label">Photos Shared</div>
          </div>
        </div>
        
        <div class="future-section">
          <h2 class="future-title">Future Letters</h2>
          <div style="font-size: 3rem; cursor: pointer; display: inline-block; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">💌</div>
        </div>
        
        <div class="empty-pages">
          “These pages are empty because we haven’t lived them yet.”
        </div>
      </div>
    </div>

    <!-- Right Panel (Media) -->
    <div class="right-panel">
      <div class="polaroid">
        <div class="washi-tape"></div>
        <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Memory" />
        <div class="polaroid-caption">Sunset walk</div>
      </div>

      <div class="audio-player">
        <div class="audio-flower-btn">▶</div>
        <div class="waveform"></div>
      </div>
    </div>
  </div>
`

// Generate falling petals
function createPetals() {
  const container = document.getElementById('petals');
  for (let i = 0; i < 30; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animation = `drift ${Math.random() * 5 + 5}s linear infinite`;
    petal.style.animationDelay = Math.random() * 5 + 's';
    petal.style.background = Math.random() > 0.5 ? 'var(--soft-highlight)' : 'var(--gold-accent)';
    container.appendChild(petal);
  }
}
createPetals();

// Setup Timeline
function setupTimeline() {
  const timeline = document.getElementById('timeline');
  const events = ['First Met', 'First Date', 'The Kiss', 'Garden Walk'];
  
  events.forEach((evt, i) => {
    const node = document.createElement('div');
    node.className = 'timeline-node' + (i === events.length - 1 ? ' active' : '');
    node.style.top = (i * 100) + 'px';
    
    const label = document.createElement('div');
    label.className = 'timeline-label';
    label.innerText = evt;
    
    node.appendChild(label);
    timeline.appendChild(node);
  });
}
setupTimeline();

// Navigation Tabs
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    // Remove active class
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    // Add to clicked
    e.target.classList.add('active');
    
    // Hide all views
    document.getElementById('diary-view').style.display = 'none';
    document.getElementById('stats-view').style.display = 'none';
    
    // Show target view
    const target = e.target.getAttribute('data-target');
    const view = document.getElementById(target);
    view.style.display = target === 'stats-view' ? 'block' : 'flex';
    // Small fade effect
    view.style.animation = 'fadeIn 0.5s ease';
  });
});

// Unlock Mechanism (OTP)
let authType = 'email';

document.getElementById('send-otp-btn').addEventListener('click', async () => {
  const inputVal = document.getElementById('auth-input').value;
  if (!inputVal) return;
  
  try {
    const isPhone = /^\\+?[0-9\\s]+$/.test(inputVal);
    authType = isPhone ? 'phone' : 'email';
    
    if(!supabaseUrl.includes('placeholder')) {
      const { error } = await supabase.auth.signInWithOtp({
        [authType]: inputVal
      });
      if (error) throw error;
    }
    
    // Show OTP input
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('otp-container').classList.remove('hidden');
  } catch(e) {
    console.error('Error sending OTP:', e);
    alert('Error sending OTP. Check console for details.');
  }
});

document.getElementById('verify-btn').addEventListener('click', async () => {
  const inputVal = document.getElementById('auth-input').value;
  const otpVal = document.getElementById('otp-input').value;
  if (!otpVal) return;

  try {
    if(!supabaseUrl.includes('placeholder')) {
      const { data, error } = await supabase.auth.verifyOtp({
        [authType]: inputVal,
        token: otpVal,
        type: authType === 'phone' ? 'sms' : 'email'
      });
      if (error) throw error;
    }
    
    // Unlock
    const landing = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');
    
    landing.style.opacity = '0';
    setTimeout(() => {
      landing.style.display = 'none';
      mainApp.style.display = 'flex';
      setTimeout(() => {
        mainApp.style.opacity = '1';
      }, 50);
    }, 1500);
  } catch(e) {
    console.error('Error verifying OTP:', e);
    alert('Invalid OTP');
  }
});
