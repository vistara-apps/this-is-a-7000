# Know Your Rights Hub

**Instant legal clarity when you need it most.**

A comprehensive web application that empowers individuals with immediate, location-specific legal information and documentation tools for interactions with law enforcement.

## 🚀 Features

### Core Features
- **On-Demand Rights Guides**: Location-specific legal information tailored to your current state
- **De-escalation Scripts**: Pre-written, legally sound phrases in English and Spanish
- **Incident Recorder**: Quick-access audio/video recording with secure storage
- **Shareable Rights Cards**: Mobile-optimized summaries of critical legal information

### Advanced Features (Premium)
- **AI-Generated Custom Scripts**: Powered by OpenAI for personalized de-escalation phrases
- **Unlimited Recording Storage**: Secure, decentralized storage via IPFS/Pinata
- **Location-Specific Legal Content**: Enhanced rights information based on state laws
- **Priority Support**: Direct access to legal resources and support

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: React Context API
- **APIs**: OpenAI, Supabase, Stripe, Pinata
- **Storage**: Supabase (PostgreSQL), IPFS via Pinata
- **Payments**: Stripe Subscriptions
- **Deployment**: Docker-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- API keys for the following services:
  - OpenAI API (for script generation)
  - Supabase (for data persistence)
  - Stripe (for subscription management)
  - Pinata (for decentralized file storage)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/this-is-a-7000.git
cd this-is-a-7000
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# API Keys - Replace with your actual keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here

# App Configuration
VITE_APP_NAME=Know Your Rights Hub
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

### 3. Database Setup (Supabase)

Create the following tables in your Supabase database:

```sql
-- Users table
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  subscriptionStatus TEXT DEFAULT 'free',
  location JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Incident Reports table
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

-- Legal Content table
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

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### API Service Configuration

The app includes fallback mechanisms for all external services:

- **OpenAI**: Falls back to static scripts if API key not configured
- **Supabase**: Falls back to localStorage if database not available
- **Stripe**: Simulates subscription flow for development
- **Pinata**: Uses local blob URLs if IPFS not configured

### Location Services

The app uses multiple location detection methods:
1. Browser Geolocation API
2. Reverse geocoding via Nominatim (OpenStreetMap)
3. Coordinate-based state detection fallback
4. Cached location from localStorage

## 🏗 Architecture

### Service Layer
- `openaiService`: AI-powered script generation
- `supabaseService`: Data persistence with localStorage fallback
- `pinataService`: Decentralized file storage
- `stripeService`: Subscription management
- `locationService`: Enhanced geolocation with fallbacks

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── context/            # React Context for state management
├── services/           # API service integrations
└── main.jsx           # Application entry point
```

## 🎨 Design System

The app follows a comprehensive design system with:
- **Colors**: Accessible color palette with semantic naming
- **Typography**: Responsive text scales
- **Spacing**: Consistent spacing system
- **Components**: Modular, reusable components
- **Motion**: Smooth animations and transitions

## 🔒 Security & Privacy

- **Data Encryption**: All sensitive data encrypted at rest
- **IPFS Storage**: Decentralized, immutable file storage
- **Location Privacy**: Optional location sharing with user consent
- **Secure Authentication**: Row-level security in Supabase
- **HTTPS Only**: All API communications over HTTPS

## 📱 Mobile Optimization

- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large touch targets for mobile use
- **Offline Capability**: Core features work without internet
- **PWA Ready**: Can be installed as a mobile app

## 🌍 Internationalization

Currently supports:
- **English** (en)
- **Spanish** (es)

Easy to extend for additional languages by updating the language files.

## 🚀 Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t know-your-rights-hub .

# Run the container
docker run -p 3000:3000 know-your-rights-hub
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

```bash
# Production environment variables
VITE_ENVIRONMENT=production
VITE_OPENAI_API_KEY=prod_openai_key
VITE_SUPABASE_URL=prod_supabase_url
# ... other production keys
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Intelligent caching strategies
- **CDN Ready**: Static assets optimized for CDN delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: support@knowyourrightsHub.com

## 🙏 Acknowledgments

- OpenAI for AI-powered content generation
- Supabase for backend infrastructure
- Stripe for payment processing
- Pinata for IPFS storage
- OpenStreetMap for geocoding services

---

**⚠️ Legal Disclaimer**: This application provides general legal information and should not be considered as legal advice. Always consult with a qualified attorney for specific legal situations.
