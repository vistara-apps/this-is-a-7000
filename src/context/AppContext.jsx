import React, { createContext, useContext, useState, useEffect } from 'react'

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
    userId: 'user_1',
    subscriptionStatus: 'free', // 'free' or 'premium'
    location: null
  })
  
  const [language, setLanguage] = useState('en') // 'en' or 'es'
  const [incidents, setIncidents] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [legalContent, setLegalContent] = useState(null)

  // Get user's location on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUser(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              state: 'California' // Mock - would normally reverse geocode
            }
          }))
        },
        (error) => {
          console.warn('Location access denied:', error)
          // Set default location
          setUser(prev => ({
            ...prev,
            location: { state: 'General' }
          }))
        }
      )
    }
  }, [])

  const value = {
    user,
    setUser,
    language,
    setLanguage,
    incidents,
    setIncidents,
    isRecording,
    setIsRecording,
    legalContent,
    setLegalContent
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}