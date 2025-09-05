import React, { createContext, useContext, useState, useEffect } from 'react'
import { locationService, supabaseService, stripeService } from '../services'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: `user_${Date.now()}`,
    subscriptionStatus: 'free', // 'free' or 'premium'
    location: null,
    createdAt: new Date().toISOString()
  })
  
  const [language, setLanguage] = useState('en') // 'en' or 'es'
  const [incidents, setIncidents] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [legalContent, setLegalContent] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize user and location on app load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get location with enhanced service
        const location = await locationService.getLocationWithFallback()
        
        // Update user with location
        const updatedUser = {
          ...user,
          location
        }
        setUser(updatedUser)

        // Try to load existing user data from Supabase
        const existingUser = await supabaseService.getUser(updatedUser.userId)
        if (existingUser) {
          setUser(existingUser)
        } else {
          // Create new user in Supabase
          await supabaseService.createUser(updatedUser)
        }

        // Load user's incidents
        const userIncidents = await supabaseService.getUserIncidents(updatedUser.userId)
        setIncidents(userIncidents)

        // Check subscription status
        const subscriptionStatus = await stripeService.getSubscriptionStatus(updatedUser.userId)
        if (subscriptionStatus.status === 'active') {
          setUser(prev => ({ ...prev, subscriptionStatus: 'premium' }))
        }

      } catch (error) {
        console.error('Error initializing user:', error)
        // Set fallback location if everything fails
        setUser(prev => ({
          ...prev,
          location: { state: 'General', country: 'US', city: 'Unknown' }
        }))
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [])

  // Save user changes to Supabase
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      await supabaseService.updateUser(user.userId, updates)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Add incident with Supabase integration
  const addIncident = async (incidentData) => {
    try {
      const newIncident = await supabaseService.createIncident({
        ...incidentData,
        userId: user.userId
      })
      setIncidents(prev => [newIncident, ...prev])
      return newIncident
    } catch (error) {
      console.error('Error adding incident:', error)
      // Fallback to local state
      const localIncident = {
        ...incidentData,
        incidentId: `incident_${Date.now()}`,
        userId: user.userId,
        timestamp: new Date().toISOString()
      }
      setIncidents(prev => [localIncident, ...prev])
      return localIncident
    }
  }

  // Delete incident
  const deleteIncident = async (incidentId) => {
    try {
      await supabaseService.deleteIncident(incidentId)
      setIncidents(prev => prev.filter(incident => incident.incidentId !== incidentId))
    } catch (error) {
      console.error('Error deleting incident:', error)
    }
  }

  const value = {
    user,
    setUser,
    updateUser,
    language,
    setLanguage,
    incidents,
    setIncidents,
    addIncident,
    deleteIncident,
    isRecording,
    setIsRecording,
    legalContent,
    setLegalContent,
    loading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
