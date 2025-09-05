# Know Your Rights Hub - API Documentation

This document provides comprehensive documentation for all API integrations and services used in the Know Your Rights Hub application.

## 🔧 Service Architecture

The application uses a service-oriented architecture with the following external APIs:

- **OpenAI API**: Dynamic content generation
- **Supabase**: Database and authentication
- **Stripe**: Payment processing and subscriptions
- **Pinata**: IPFS file storage
- **Browser Geolocation API**: Location services
- **Nominatim (OpenStreetMap)**: Reverse geocoding

## 🤖 OpenAI Service

### Purpose
Generates dynamic, location-specific legal scripts and rights information using AI.

### Configuration
```javascript
// Environment Variables
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Methods

#### `generateScript(scenario, location, language)`
Generates a de-escalation script for a specific scenario.

**Parameters:**
- `scenario` (string): Type of interaction ('traffic', 'detention', 'search', 'recording')
- `location` (object): User's location data
- `language` (string): 'en' or 'es'

**Returns:**
```javascript
{
  text: "Generated script text...",
  generated: true,
  timestamp: Date
}
```

#### `generateRightsGuide(location, language)`
Creates location-specific rights information.

**Parameters:**
- `location` (object): User's location data
- `language` (string): 'en' or 'es'

**Returns:**
```javascript
{
  content: "Rights guide content...",
  generated: true,
  location: location,
  language: language,
  timestamp: Date
}
```

### Fallback Behavior
If OpenAI API is not configured or fails, the service falls back to static, pre-written scripts and guides.

## 🗄️ Supabase Service

### Purpose
Provides data persistence for users, incidents, and legal content with PostgreSQL backend.

### Configuration
```javascript
// Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  subscriptionStatus TEXT DEFAULT 'free',
  location JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### Incident Reports Table
```sql
CREATE TABLE incident_reports (
  incidentId TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(userId),
  timestamp TIMESTAMP,
  recordingUrl TEXT,
  ipfsHash TEXT,
  location JSONB,
  notes TEXT,
  duration INTEGER,
  fileSize INTEGER,
  uploadedAt TIMESTAMP DEFAULT NOW()
);
```

#### Legal Content Table
```sql
CREATE TABLE legal_content (
  contentId TEXT PRIMARY KEY,
  state TEXT,
  type TEXT,
  title TEXT,
  script TEXT,
  guide TEXT,
  languages TEXT[]
);
```

### Methods

#### User Management
- `createUser(userData)`: Create new user
- `updateUser(userId, updates)`: Update user information
- `getUser(userId)`: Retrieve user data

#### Incident Management
- `createIncident(incidentData)`: Save new incident
- `getUserIncidents(userId)`: Get user's incidents
- `deleteIncident(incidentId)`: Remove incident

#### Legal Content Management
- `getLegalContent(state, type)`: Retrieve legal content
- `saveLegalContent(contentData)`: Store legal content

### Fallback Behavior
All methods fall back to localStorage if Supabase is not configured or unavailable.

## 💳 Stripe Service

### Purpose
Handles subscription management and payment processing.

### Configuration
```javascript
// Environment Variables
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### Methods

#### `initialize()`
Loads Stripe.js and initializes the Stripe object.

#### `createCheckoutSession(priceId, userId, successUrl, cancelUrl)`
Creates a Stripe Checkout session for subscription.

**Parameters:**
- `priceId` (string): Stripe price ID for the subscription
- `userId` (string): User identifier
- `successUrl` (string): Redirect URL on success
- `cancelUrl` (string): Redirect URL on cancellation

#### `cancelSubscription(subscriptionId)`
Cancels an active subscription.

#### `getSubscriptionStatus(userId)`
Retrieves current subscription status for a user.

### Pricing Plans
```javascript
{
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic rights information',
      '3 de-escalation scripts',
      'Limited recording storage'
    ]
  },
  premium: {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 5,
    interval: 'month',
    features: [
      'Advanced location-specific rights',
      'Unlimited custom scripts',
      'Unlimited recording storage',
      'Priority support',
      'Ad-free experience'
    ]
  }
}
```

### Fallback Behavior
Simulates subscription flow for development/demo purposes when Stripe is not configured.

## 📁 Pinata Service

### Purpose
Provides decentralized file storage via IPFS for incident recordings and documents.

### Configuration
```javascript
// Environment Variables
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
```

### Methods

#### `uploadFile(file, metadata)`
Uploads a file to IPFS via Pinata.

**Parameters:**
- `file` (File): File object to upload
- `metadata` (object): File metadata

**Returns:**
```javascript
{
  success: true,
  ipfsHash: "QmHash...",
  pinSize: 1024,
  timestamp: "2024-01-01T00:00:00Z",
  url: "https://gateway.pinata.cloud/ipfs/QmHash...",
  metadata: {...}
}
```

#### `uploadJSON(jsonData, metadata)`
Uploads JSON data to IPFS.

#### `listPinnedFiles(userId)`
Lists all files pinned for a specific user.

#### `unpinFile(ipfsHash)`
Removes a file from IPFS pinning.

### Fallback Behavior
Creates local blob URLs and stores references in localStorage when Pinata is not configured.

## 📍 Location Service

### Purpose
Provides enhanced geolocation services with multiple fallback methods.

### Methods

#### `getCurrentLocation()`
Gets the user's current location with reverse geocoding.

**Returns:**
```javascript
{
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  state: "California",
  country: "US",
  city: "San Francisco",
  timestamp: Date
}
```

#### `getLegalJurisdiction(location)`
Determines legal jurisdiction and relevant laws based on location.

**Returns:**
```javascript
{
  state: "California",
  hasSpecificLaws: true,
  jurisdiction: "state",
  recordingLaws: "two-party-consent",
  stopAndFrisk: "limited",
  specialNotes: "Strong privacy protections"
}
```

#### `watchLocation(callback)`
Continuously monitors location changes.

#### `getLocationWithFallback()`
Gets location with multiple fallback strategies:
1. Current GPS location
2. Cached location from localStorage
3. Default fallback location

### Reverse Geocoding
Uses Nominatim (OpenStreetMap) API for converting coordinates to addresses:

```javascript
// API Endpoint
https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1
```

## 🔄 Service Integration Patterns

### Error Handling
All services implement consistent error handling:

```javascript
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('Service error:', error)
  return fallbackMethod()
}
```

### Fallback Strategies
1. **API Unavailable**: Use static data or localStorage
2. **Network Issues**: Cache and retry mechanisms
3. **Authentication Failures**: Graceful degradation
4. **Rate Limiting**: Queue and retry with backoff

### Configuration Validation
Services validate configuration on initialization:

```javascript
export const validateConfig = () => {
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    // ... other required variables
  ]
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    return false
  }
  
  return true
}
```

## 🚀 Service Initialization

Services are initialized on app startup:

```javascript
export const initializeServices = async () => {
  console.log('🚀 Initializing Know Your Rights Hub services...')
  
  // Validate configuration
  const configValid = validateConfig()
  
  // Initialize each service
  await stripeService.initialize()
  await pinataService.testAuthentication()
  
  // Test location services
  const isLocationAvailable = locationService.isGeolocationAvailable()
  
  return { configValid, timestamp: new Date().toISOString() }
}
```

## 🔒 Security Considerations

### API Key Management
- All API keys are stored as environment variables
- Keys are validated on service initialization
- No API keys are exposed in client-side code

### Data Privacy
- User location data is optional and user-controlled
- Incident recordings are encrypted before storage
- IPFS provides immutable, decentralized storage
- Supabase implements row-level security

### CORS and Security Headers
- All API calls use HTTPS
- Proper CORS configuration for external APIs
- Content Security Policy headers implemented

## 📊 Rate Limiting and Quotas

### OpenAI API
- Rate limits: 3 requests/minute for free tier
- Quota management for premium users
- Fallback to static content when limits exceeded

### Pinata IPFS
- File size limits: 100MB per file
- Monthly bandwidth quotas
- Automatic cleanup of old files

### Geolocation Services
- Nominatim: 1 request/second limit
- Caching to reduce API calls
- Fallback to coordinate-based detection

## 🧪 Testing and Development

### Mock Services
Development mode includes mock implementations:

```javascript
// Mock OpenAI responses
const mockGenerateScript = (scenario, location, language) => {
  return {
    text: "Mock generated script for " + scenario,
    generated: false,
    timestamp: new Date()
  }
}
```

### Service Health Checks
Built-in health checks for all services:

```javascript
const healthCheck = async () => {
  const results = {
    openai: await openaiService.testConnection(),
    supabase: await supabaseService.testConnection(),
    stripe: await stripeService.testAuthentication(),
    pinata: await pinataService.testAuthentication()
  }
  
  return results
}
```

## 📈 Performance Optimization

### Caching Strategies
- Location data cached for 5 minutes
- Generated scripts cached for 1 hour
- Legal content cached for 24 hours

### Lazy Loading
- Services loaded on-demand
- Heavy operations deferred until needed
- Progressive enhancement approach

### Bundle Optimization
- Tree shaking for unused API methods
- Dynamic imports for service modules
- Minimal bundle size for core functionality

---

For more detailed implementation examples, see the individual service files in `/src/services/`.
