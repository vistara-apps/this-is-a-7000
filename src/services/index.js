// Service exports for easy importing
export { default as openaiService } from './openaiService.js'
export { default as supabaseService } from './supabaseService.js'
export { default as pinataService } from './pinataService.js'
export { default as stripeService } from './stripeService.js'
export { default as locationService } from './locationService.js'
export { config, validateConfig } from './config.js'

// Initialize services and validate configuration
export const initializeServices = async () => {
  console.log('🚀 Initializing Know Your Rights Hub services...')
  
  // Validate configuration
  const configValid = validateConfig()
  if (!configValid) {
    console.warn('⚠️ Some services may not work properly due to missing configuration')
  }

  // Initialize Stripe if configured
  try {
    const { default: stripeService } = await import('./stripeService.js')
    await stripeService.initialize()
    console.log('✅ Stripe service initialized')
  } catch (error) {
    console.warn('⚠️ Stripe service initialization failed:', error.message)
  }

  // Test Pinata connection if configured
  try {
    const { default: pinataService } = await import('./pinataService.js')
    const authTest = await pinataService.testAuthentication()
    if (authTest.success) {
      console.log('✅ Pinata service connected')
    } else {
      console.warn('⚠️ Pinata authentication failed:', authTest.message)
    }
  } catch (error) {
    console.warn('⚠️ Pinata service test failed:', error.message)
  }

  // Initialize location services
  try {
    const { default: locationService } = await import('./locationService.js')
    const isAvailable = locationService.isGeolocationAvailable()
    if (isAvailable) {
      console.log('✅ Location services available')
    } else {
      console.warn('⚠️ Geolocation not supported by this browser')
    }
  } catch (error) {
    console.warn('⚠️ Location service initialization failed:', error.message)
  }

  console.log('🎯 Service initialization complete')
  
  return {
    configValid,
    timestamp: new Date().toISOString()
  }
}
