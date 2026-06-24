import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import SettingsSidebar from './components/SettingsSidebar'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Garden from './pages/Garden'
import Gallery from './pages/Gallery'
import EntryForm from './pages/EntryForm'
import Letters from './pages/Letters'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import ProfileSetup from './pages/ProfileSetup'
import InviteView from './pages/InviteView'
import JoinView from './pages/JoinView'

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [currentView, setCurrentView] = useState('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { logout, isNewUser, setIsNewUser } = useAuth()
  const navigate = useNavigate()

  // If new user, show profile setup first
  if (isNewUser) {
    return <ProfileSetup onDone={() => { setIsNewUser(false); setCurrentView('home') }} />
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    if (['home', 'chat', 'garden', 'gallery'].includes(view)) {
      setActiveTab(view)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentView(tab)
  }

  const handleLeave = async () => {
    if (confirm('Leave the Garden?')) {
      logout()
      navigate('/')
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home onNavigate={handleNavigate} />
      case 'chat': return <Chat onNavigate={handleNavigate} />
      case 'garden': return <Garden />
      case 'gallery': return <Gallery />
      case 'entry-form': return <EntryForm onDone={() => handleNavigate('garden')} />
      case 'letters': return <Letters />
      case 'profile': return <Profile onNavigate={handleNavigate} />
      case 'admin': return <AdminPanel />
      case 'profile-setup': return <ProfileSetup onDone={() => handleNavigate('home')} />
      case 'invite': return <InviteView onNavigate={handleNavigate} />
      case 'join': return <JoinView onNavigate={handleNavigate} onConnected={() => handleNavigate('chat')} />
      default: return <Home onNavigate={handleNavigate} />
    }
  }

  return (
    <div id="main-app" className="home-layout" style={{ display: 'flex' }}>
      <div className="home-bg"></div>
      <SettingsSidebar
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onManageCodes={() => { setSettingsOpen(false); handleNavigate('invite') }}
        onAdmin={() => { setSettingsOpen(false); handleNavigate('admin') }}
        onLeave={handleLeave}
      />
      <TopNav
        onMenuClick={() => setSettingsOpen(true)}
        onAvatarClick={() => handleNavigate('profile')}
      />
      <div className="home-content-scroll">
        {renderView()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
