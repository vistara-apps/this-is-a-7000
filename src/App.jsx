import React, { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import RightsGuide from './pages/RightsGuide'
import Scripts from './pages/Scripts'
import IncidentRecorder from './pages/IncidentRecorder'
import Profile from './pages/Profile'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'rights':
        return <RightsGuide />
      case 'scripts':
        return <Scripts />
      case 'recorder':
        return <IncidentRecorder />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppProvider>
      <AppShell currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </AppShell>
    </AppProvider>
  )
}

export default App