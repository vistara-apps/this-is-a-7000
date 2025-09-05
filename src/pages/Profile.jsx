import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { stripeService } from '../services'
import { User, MapPin, Star, Settings, Shield, CreditCard, Loader, CheckCircle } from 'lucide-react'

const Profile = () => {
  const { user, language, updateUser } = useApp()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState(null)
  const [pricingPlans, setPricingPlans] = useState({})

  useEffect(() => {
    // Load pricing plans and subscription details
    const loadSubscriptionData = async () => {
      try {
        const plans = stripeService.getPricingPlans()
        setPricingPlans(plans)

        const subscriptionStatus = await stripeService.getSubscriptionStatus(user.userId)
        setSubscriptionDetails(subscriptionStatus)
      } catch (error) {
        console.error('Error loading subscription data:', error)
      }
    }

    loadSubscriptionData()
  }, [user.userId])

  const handleUpgrade = async () => {
    setLoading(true)
    
    try {
      // Create Stripe checkout session
      const result = await stripeService.createCheckoutSession(
        pricingPlans.premium.id,
        user.userId
      )

      if (result.success) {
        if (result.simulated) {
          // For demo purposes, immediately upgrade
          await updateUser({ subscriptionStatus: 'premium' })
          alert(language === 'en' 
            ? 'Upgraded to Premium! You now have access to all features.' 
            : '¡Actualizado a Premium! Ahora tienes acceso a todas las funciones.')
        }
        // In real implementation, user would be redirected to Stripe Checkout
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert(language === 'en' 
        ? 'Error upgrading subscription. Please try again.' 
        : 'Error al actualizar suscripción. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
      setShowUpgrade(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionDetails?.subscriptionId) return

    const confirmed = confirm(language === 'en' 
      ? 'Are you sure you want to cancel your subscription?' 
      : '¿Estás seguro de que quieres cancelar tu suscripción?')

    if (!confirmed) return

    setLoading(true)

    try {
      const result = await stripeService.cancelSubscription(subscriptionDetails.subscriptionId)
      
      if (result.success) {
        await updateUser({ subscriptionStatus: 'free' })
        setSubscriptionDetails(prev => ({ ...prev, status: 'cancelled' }))
        alert(language === 'en' 
          ? 'Subscription cancelled successfully.' 
          : 'Suscripción cancelada exitosamente.')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert(language === 'en' 
        ? 'Error cancelling subscription. Please try again.' 
        : 'Error al cancelar suscripción. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const features = {
    free: [
      {
        en: 'Basic rights information',
        es: 'Información básica de derechos'
      },
      {
        en: '3 de-escalation scripts',
        es: '3 scripts de desescalada'
      },
      {
        en: 'Limited recording storage',
        es: 'Almacenamiento limitado de grabaciones'
      }
    ],
    premium: [
      {
        en: 'Advanced location-specific rights',
        es: 'Derechos avanzados específicos de ubicación'
      },
      {
        en: 'Unlimited custom scripts',
        es: 'Scripts personalizados ilimitados'
      },
      {
        en: 'Unlimited recording storage',
        es: 'Almacenamiento ilimitado de grabaciones'
      },
      {
        en: 'Priority support',
        es: 'Soporte prioritario'
      },
      {
        en: 'Ad-free experience',
        es: 'Experiencia sin anuncios'
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-display text-text-primary mb-2">
          {language === 'en' ? 'Profile' : 'Perfil'}
        </h2>
        <p className="text-body text-text-secondary">
          {language === 'en' 
            ? 'Manage your account and subscription' 
            : 'Administra tu cuenta y suscripción'}
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="ml-4">
            <h3 className="text-heading text-text-primary">
              {language === 'en' ? 'User Account' : 'Cuenta de Usuario'}
            </h3>
            <p className="text-text-secondary">ID: {user.userId}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-text-secondary">
                {language === 'en' ? 'Location' : 'Ubicación'}
              </p>
              <p className="font-medium text-text-primary">
                {user.location?.state || 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Shield className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-text-secondary">
                {language === 'en' ? 'Account Type' : 'Tipo de Cuenta'}
              </p>
              <p className={`font-medium ${
                user.subscriptionStatus === 'premium' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {user.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-heading text-text-primary mb-4">
          {language === 'en' ? 'Subscription' : 'Suscripción'}
        </h3>
        
        {user.subscriptionStatus === 'free' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-text-primary">
                    {language === 'en' ? 'Free Plan' : 'Plan Gratuito'}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {language === 'en' 
                      ? 'Limited features - Upgrade for full access' 
                      : 'Funciones limitadas - Actualiza para acceso completo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {language === 'en' ? 'Upgrade' : 'Actualizar'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text-primary mb-3">
                  {language === 'en' ? 'Current Features' : 'Funciones Actuales'}
                </h4>
                <ul className="space-y-2">
                  {features.free.map((feature, index) => (
                    <li key={index} className="text-text-secondary text-sm">
                      • {feature[language]}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-3">
                  {language === 'en' ? 'Premium Features' : 'Funciones Premium'}
                </h4>
                <ul className="space-y-2">
                  {features.premium.map((feature, index) => (
                    <li key={index} className="text-green-600 text-sm">
                      • {feature[language]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <Star className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-text-primary">
                {language === 'en' ? 'Premium Plan Active' : 'Plan Premium Activo'}
              </p>
              <p className="text-text-secondary text-sm">
                {language === 'en' 
                  ? 'You have access to all features' 
                  : 'Tienes acceso a todas las funciones'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-heading text-text-primary mb-4">
          {language === 'en' ? 'Settings' : 'Configuraciones'}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-text-primary">
                {language === 'en' ? 'Notifications' : 'Notificaciones'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-text-primary">
                {language === 'en' ? 'Location Services' : 'Servicios de Ubicación'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-heading text-text-primary mb-4">
              {language === 'en' ? 'Upgrade to Premium' : 'Actualizar a Premium'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">$5</div>
                <div className="text-text-secondary">
                  {language === 'en' ? 'per month' : 'por mes'}
                </div>
              </div>
              
              <ul className="space-y-2">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-center text-text-primary">
                    <Star className="h-4 w-4 text-green-500 mr-2" />
                    {feature[language]}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleUpgrade}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Subscribe Now' : 'Suscríbete Ahora'}
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
