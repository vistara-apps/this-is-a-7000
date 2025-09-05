import React from 'react'
import { Shield, FileText, MessageSquare, Video, User, Menu } from 'lucide-react'
import { useApp } from '../context/AppContext'

const AppShell = ({ children, currentPage, setCurrentPage }) => {
  const { user, language, setLanguage } = useApp()

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Shield },
    { id: 'rights', name: 'Rights Guide', icon: FileText },
    { id: 'scripts', name: 'Scripts', icon: MessageSquare },
    { id: 'recorder', name: 'Record', icon: Video },
    { id: 'profile', name: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold">Know Your Rights Hub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-sm ${
                    language === 'en' ? 'bg-white text-purple-600' : 'text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1 rounded text-sm ${
                    language === 'es' ? 'bg-white text-purple-600' : 'text-white'
                  }`}
                >
                  ES
                </button>
              </div>
              
              {/* Subscription Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.subscriptionStatus === 'premium' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-black'
              }`}>
                {user.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-surface shadow-card border-r">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell