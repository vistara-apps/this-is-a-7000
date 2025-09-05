class LocationService {
  constructor() {
    this.currentLocation = null
    this.watchId = null
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          }

          try {
            // Try to get state/region information
            const stateInfo = await this.reverseGeocode(location.latitude, location.longitude)
            location.state = stateInfo.state
            location.country = stateInfo.country
            location.city = stateInfo.city
          } catch (error) {
            console.warn('Could not reverse geocode location:', error)
            location.state = 'Unknown'
          }

          this.currentLocation = location
          resolve(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
          
          // Provide fallback location
          const fallbackLocation = {
            latitude: null,
            longitude: null,
            state: 'General',
            country: 'US',
            city: 'Unknown',
            accuracy: null,
            timestamp: new Date(),
            error: error.message
          }

          this.currentLocation = fallbackLocation
          resolve(fallbackLocation)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KnowYourRightsHub/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const data = await response.json()
      
      return {
        state: data.address?.state || data.address?.region || 'Unknown',
        country: data.address?.country_code?.toUpperCase() || 'US',
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        county: data.address?.county || null,
        postcode: data.address?.postcode || null
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      
      // Fallback to state detection based on coordinates
      return this.getStateFromCoordinates(latitude, longitude)
    }
  }

  getStateFromCoordinates(latitude, longitude) {
    // Simple state detection for US based on coordinate ranges
    // This is a basic implementation - in production you'd use a proper service
    const stateRanges = {
      'California': { latMin: 32.5, latMax: 42.0, lonMin: -124.5, lonMax: -114.1 },
      'Texas': { latMin: 25.8, latMax: 36.5, lonMin: -106.6, lonMax: -93.5 },
      'Florida': { latMin: 24.4, latMax: 31.0, lonMin: -87.6, lonMax: -80.0 },
      'New York': { latMin: 40.5, latMax: 45.0, lonMin: -79.8, lonMax: -71.9 },
      'Illinois': { latMin: 36.9, latMax: 42.5, lonMin: -91.5, lonMax: -87.0 },
      // Add more states as needed
    }

    for (const [state, range] of Object.entries(stateRanges)) {
      if (latitude >= range.latMin && latitude <= range.latMax &&
          longitude >= range.lonMin && longitude <= range.lonMax) {
        return {
          state,
          country: 'US',
          city: 'Unknown'
        }
      }
    }

    return {
      state: 'General',
      country: 'US',
      city: 'Unknown'
    }
  }

  watchLocation(callback) {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      return null
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        }

        try {
          const stateInfo = await this.reverseGeocode(location.latitude, location.longitude)
          location.state = stateInfo.state
          location.country = stateInfo.country
          location.city = stateInfo.city
        } catch (error) {
          location.state = 'Unknown'
        }

        this.currentLocation = location
        callback(location)
      },
      (error) => {
        console.error('Location watch error:', error)
        callback({
          latitude: null,
          longitude: null,
          state: 'General',
          error: error.message
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000 // 10 minutes
      }
    )

    return this.watchId
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  getStoredLocation() {
    const stored = localStorage.getItem('kyrh_last_location')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }
    return null
  }

  storeLocation(location) {
    try {
      localStorage.setItem('kyrh_last_location', JSON.stringify(location))
    } catch (error) {
      console.error('Error storing location:', error)
    }
  }

  async getLocationWithFallback() {
    // Try to get current location
    try {
      const location = await this.getCurrentLocation()
      this.storeLocation(location)
      return location
    } catch (error) {
      console.error('Failed to get current location:', error)
      
      // Try stored location
      const stored = this.getStoredLocation()
      if (stored) {
        return stored
      }

      // Final fallback
      return {
        latitude: null,
        longitude: null,
        state: 'General',
        country: 'US',
        city: 'Unknown',
        accuracy: null,
        timestamp: new Date(),
        fallback: true
      }
    }
  }

  // Get legal jurisdiction information based on location
  getLegalJurisdiction(location) {
    if (!location || !location.state) {
      return {
        state: 'General',
        hasSpecificLaws: false,
        jurisdiction: 'federal'
      }
    }

    // States with specific laws that might affect rights
    const statesWithSpecificLaws = {
      'California': {
        hasSpecificLaws: true,
        recordingLaws: 'two-party-consent',
        stopAndFrisk: 'limited',
        specialNotes: 'Strong privacy protections'
      },
      'New York': {
        hasSpecificLaws: true,
        recordingLaws: 'one-party-consent',
        stopAndFrisk: 'restricted',
        specialNotes: 'Stop and frisk limitations'
      },
      'Texas': {
        hasSpecificLaws: true,
        recordingLaws: 'one-party-consent',
        stopAndFrisk: 'allowed',
        specialNotes: 'Open carry state'
      },
      'Florida': {
        hasSpecificLaws: true,
        recordingLaws: 'two-party-consent',
        stopAndFrisk: 'allowed',
        specialNotes: 'Stand your ground laws'
      }
    }

    const stateInfo = statesWithSpecificLaws[location.state]
    
    return {
      state: location.state,
      hasSpecificLaws: !!stateInfo,
      jurisdiction: stateInfo ? 'state' : 'federal',
      ...stateInfo
    }
  }

  // Check if location services are available
  isGeolocationAvailable() {
    return 'geolocation' in navigator
  }

  // Get permission status
  async getPermissionStatus() {
    if (!navigator.permissions) {
      return 'unknown'
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Error checking geolocation permission:', error)
      return 'unknown'
    }
  }
}

export default new LocationService()
