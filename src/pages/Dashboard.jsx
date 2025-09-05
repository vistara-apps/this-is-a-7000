import React from 'react'
import { useApp } from '../context/AppContext'
import LegalCard from '../components/LegalCard'
import { Shield, MapPin, Clock, Star } from 'lucide-react'

const Dashboard = () => {
  const { user, language } = useApp()

  const quickStats = [
    { 
      title: language === 'en' ? 'Your Location' : 'Tu Ubicación', 
      value: user.location?.state || 'Unknown',
      icon: MapPin,
      color: 'text-blue-500'
    },
    { 
      title: language === 'en' ? 'Incidents Recorded' : 'Incidentes Grabados', 
      value: '0',
      icon: Clock,
      color: 'text-green-500'
    },
    { 
      title: language === 'en' ? 'Rights Accessed' : 'Derechos Consultados', 
      value: '3',
      icon: Shield,
      color: 'text-purple-500'
    },
  ]

  const quickActions = [
    {
      title: language === 'en' ? 'Know Your Rights' : 'Conoce Tus Derechos',
      description: language === 'en' 
        ? 'Access location-specific legal information' 
        : 'Accede a información legal específica de tu ubicación',
      action: 'View Rights Guide'
    },
    {
      title: language === 'en' ? 'De-escalation Scripts' : 'Scripts de Desescalada',
      description: language === 'en' 
        ? 'Pre-written phrases to help navigate interactions' 
        : 'Frases pre-escritas para ayudar a navegar interacciones',
      action: 'Browse Scripts'
    },
    {
      title: language === 'en' ? 'Emergency Recording' : 'Grabación de Emergencia',
      description: language === 'en' 
        ? 'Quick access to incident documentation' 
        : 'Acceso rápido a documentación de incidentes',
      action: 'Start Recording'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="gradient-bg text-white rounded-xl p-6">
        <h2 className="text-display mb-2">
          {language === 'en' ? 'Welcome Back' : 'Bienvenido de Nuevo'}
        </h2>
        <p className="text-lg opacity-90">
          {language === 'en' 
            ? 'Instant legal clarity when you need it most.' 
            : 'Claridad legal instantánea cuando más la necesitas.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-surface rounded-lg p-6 shadow-card">
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-caption text-text-secondary">{stat.title}</p>
                  <p className="text-heading text-text-primary">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-heading text-text-primary">
          {language === 'en' ? 'Quick Actions' : 'Acciones Rápidas'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <LegalCard
              key={index}
              title={action.title}
              content={
                <div>
                  <p className="mb-4">{action.description}</p>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    {action.action}
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>

      {/* Upgrade Notice for Free Users */}
      {user.subscriptionStatus === 'free' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h4 className="font-medium text-text-primary">
                {language === 'en' ? 'Upgrade to Premium' : 'Actualizar a Premium'}
              </h4>
              <p className="text-text-secondary mt-1">
                {language === 'en' 
                  ? 'Get unlimited recordings, advanced scripts, and priority support for $5/month.' 
                  : 'Obtén grabaciones ilimitadas, scripts avanzados y soporte prioritario por $5/mes.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard