// Configuration for API services
export const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  },
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY,
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY,
    baseURL: 'https://api.pinata.cloud'
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Know Your Rights Hub',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  }
}

// Validation function to check if required environment variables are set
export const validateConfig = () => {
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL', 
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_PINATA_API_KEY',
    'VITE_PINATA_SECRET_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    console.warn('Please check your .env file and ensure all required variables are set')
    return false
  }
  
  return true
}
