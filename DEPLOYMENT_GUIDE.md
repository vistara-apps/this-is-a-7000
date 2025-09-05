# Know Your Rights Hub - Deployment Guide

This guide provides step-by-step instructions for deploying the Know Your Rights Hub application to production.

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)
### 2. Static Site Deployment (Vercel, Netlify)
### 3. Traditional Server Deployment

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)

### Step 1: Environment Configuration

Create a production `.env` file:

```bash
# Production Environment Variables
VITE_ENVIRONMENT=production

# API Keys (Replace with your production keys)
VITE_OPENAI_API_KEY=sk-prod-your-openai-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key

# App Configuration
VITE_APP_NAME=Know Your Rights Hub
VITE_APP_VERSION=1.0.0
```

### Step 2: Docker Configuration

The application includes a production-ready Dockerfile:

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Build and Deploy

```bash
# Build the Docker image
docker build -t know-your-rights-hub:latest .

# Run the container
docker run -d \
  --name kyrh-app \
  -p 80:80 \
  -p 443:443 \
  --env-file .env \
  know-your-rights-hub:latest
```

### Step 4: Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - kyrh-network

  # Optional: Add a reverse proxy
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - kyrh-network

networks:
  kyrh-network:
    driver: bridge
```

Deploy with Docker Compose:

```bash
docker-compose up -d
```

## 🌐 Static Site Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Configure Environment Variables:**
```bash
# Set environment variables in Vercel dashboard or CLI
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_PINATA_API_KEY
vercel env add VITE_PINATA_SECRET_KEY
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Vercel Configuration (`vercel.json`):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_ENVIRONMENT": "production"
  }
}
```

### Netlify Deployment

1. **Build Configuration (`netlify.toml`):**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

2. **Deploy via Git:**
- Connect your GitHub repository to Netlify
- Set environment variables in Netlify dashboard
- Deploy automatically on push to main branch

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Step 2: Database Schema

Run the following SQL in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  subscriptionStatus TEXT DEFAULT 'free' CHECK (subscriptionStatus IN ('free', 'premium')),
  location JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Incident Reports table
CREATE TABLE incident_reports (
  incidentId TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  recordingUrl TEXT,
  ipfsHash TEXT,
  location JSONB,
  notes TEXT,
  duration INTEGER CHECK (duration >= 0),
  fileSize INTEGER CHECK (fileSize >= 0),
  uploadedAt TIMESTAMP DEFAULT NOW()
);

-- Legal Content table
CREATE TABLE legal_content (
  contentId TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  script TEXT,
  guide TEXT,
  languages TEXT[] DEFAULT ARRAY['en'],
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_subscription ON users(subscriptionStatus);
CREATE INDEX idx_incidents_user ON incident_reports(userId);
CREATE INDEX idx_incidents_timestamp ON incident_reports(timestamp DESC);
CREATE INDEX idx_legal_content_state ON legal_content(state);
CREATE INDEX idx_legal_content_type ON legal_content(type);

-- Row Level Security Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = userId);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = userId);

CREATE POLICY "Users can view own incidents" ON incident_reports
  FOR SELECT USING (auth.uid()::text = userId);

CREATE POLICY "Users can insert own incidents" ON incident_reports
  FOR INSERT WITH CHECK (auth.uid()::text = userId);

CREATE POLICY "Users can delete own incidents" ON incident_reports
  FOR DELETE USING (auth.uid()::text = userId);

CREATE POLICY "Legal content is publicly readable" ON legal_content
  FOR SELECT TO public USING (true);
```

### Step 3: Seed Data

Insert initial legal content:

```sql
-- Insert basic legal content for common states
INSERT INTO legal_content (contentId, state, type, title, script, guide, languages) VALUES
('general_traffic_en', 'General', 'traffic', 'Traffic Stop Rights', 
 'Officer, I understand you stopped me. I want to exercise my right to remain silent. I will provide my license, registration, and insurance as required by law.',
 'During a traffic stop, you have the right to remain silent beyond providing required documents. You can refuse consent to search your vehicle.',
 ARRAY['en']),
('general_traffic_es', 'General', 'traffic', 'Derechos en Paradas de Tráfico',
 'Oficial, entiendo que me detuvo. Quiero ejercer mi derecho a permanecer en silencio. Proporcionaré mi licencia, registro y seguro según lo requiere la ley.',
 'Durante una parada de tráfico, tienes derecho a permanecer en silencio más allá de proporcionar los documentos requeridos.',
 ARRAY['es']);
```

## 💳 Stripe Configuration

### Step 1: Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get your publishable and secret keys

### Step 2: Create Products and Prices

```bash
# Using Stripe CLI
stripe products create --name="Know Your Rights Hub Premium" --description="Premium subscription with unlimited features"

stripe prices create \
  --product=prod_XXXXXXXXXX \
  --unit-amount=500 \
  --currency=usd \
  --recurring-interval=month \
  --nickname="Premium Monthly"
```

### Step 3: Configure Webhooks

Set up webhooks for subscription events:

```javascript
// Webhook endpoint: https://yourdomain.com/api/stripe/webhook
// Events to listen for:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

## 📁 IPFS/Pinata Configuration

### Step 1: Create Pinata Account

1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Generate API keys
3. Configure CORS settings

### Step 2: IPFS Gateway Configuration

Configure custom IPFS gateway (optional):

```javascript
// In pinataService.js
const CUSTOM_GATEWAY = 'https://your-custom-gateway.com/ipfs/'

// Update URL generation
url: `${CUSTOM_GATEWAY}${result.IpfsHash}`
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt (Recommended):**
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

2. **Nginx SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Content Security Policy

Add CSP headers:

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' 
        https://api.openai.com 
        https://*.supabase.co 
        https://api.stripe.com 
        https://api.pinata.cloud 
        https://nominatim.openstreetmap.org;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
" always;
```

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Error Tracking (Sentry):**
```javascript
// Install Sentry
npm install @sentry/react @sentry/tracing

// Configure in main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

2. **Performance Monitoring:**
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Server Monitoring

1. **Health Check Endpoint:**
```javascript
// Add to your server
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION
  });
});
```

2. **Log Aggregation:**
```bash
# Using Docker logs
docker logs -f kyrh-app

# Using journalctl for systemd
journalctl -u kyrh-app -f
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
        VITE_PINATA_API_KEY: ${{ secrets.PINATA_API_KEY }}
        VITE_PINATA_SECRET_KEY: ${{ secrets.PINATA_SECRET_KEY }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull origin main
          docker-compose down
          docker-compose up -d --build
```

## 🚨 Backup and Recovery

### Database Backups

```bash
# Automated Supabase backups (built-in)
# Manual backup via CLI
supabase db dump --db-url="postgresql://..." > backup.sql

# Restore from backup
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

### File Storage Backups

```bash
# IPFS files are automatically distributed
# Keep local copies of important files
# Regular sync with backup IPFS node
```

## 📈 Performance Optimization

### CDN Configuration

1. **Cloudflare Setup:**
- Add your domain to Cloudflare
- Configure caching rules
- Enable Brotli compression
- Set up page rules for static assets

2. **Cache Headers:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Regular maintenance
VACUUM ANALYZE;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading:**
```bash
# Check if .env file exists and has correct format
cat .env

# Verify variables are available
echo $VITE_OPENAI_API_KEY
```

2. **CORS Issues:**
```javascript
// Check API endpoints allow your domain
// Verify Supabase CORS settings
// Update Pinata CORS configuration
```

3. **Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

4. **SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew
```

### Logs and Debugging

```bash
# Application logs
docker logs kyrh-app

# Nginx logs
docker exec kyrh-app tail -f /var/log/nginx/access.log
docker exec kyrh-app tail -f /var/log/nginx/error.log

# System logs
journalctl -u docker -f
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Check application logs for errors
   - Monitor SSL certificate expiration
   - Review performance metrics

2. **Monthly:**
   - Update dependencies
   - Review and rotate API keys
   - Database maintenance and optimization
   - Backup verification

3. **Quarterly:**
   - Security audit
   - Performance optimization review
   - Disaster recovery testing

### Emergency Procedures

1. **Service Outage:**
   - Check service status
   - Review recent deployments
   - Rollback if necessary
   - Communicate with users

2. **Security Incident:**
   - Isolate affected systems
   - Rotate compromised credentials
   - Audit access logs
   - Notify relevant parties

---

For additional support, create an issue in the GitHub repository or contact the development team.
