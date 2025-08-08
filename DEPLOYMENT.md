# 🚀 BibleChat Deployment Guide

## Option 1: Railway.app (Recommended - Easiest)

### Prerequisites
- GitHub account
- Railway account (free tier available)
- Your existing Supabase database

### Steps:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial BibleChat API"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy on Railway**
- Go to [railway.app](https://railway.app)
- Click "New Project" → "Deploy from GitHub"
- Select your BibleChat repository
- Railway will auto-detect Node.js

3. **Set Environment Variables in Railway**
Click on your service → Variables → Add these:
```
DATABASE_URL=your_database_url_from_supabase
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret-key-change-this
CORS_ORIGIN=https://your-frontend-domain.com
```

4. **Your API will be live at:**
```
https://biblechat-api.up.railway.app
```

---

## Option 2: Render.com (Free Tier)

### Steps:

1. **Create render.yaml**
```yaml
services:
  - type: web
    name: biblechat-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        value: your_database_url
      - key: OPENAI_API_KEY
        value: your_openai_key
      - key: NODE_ENV
        value: production
```

2. **Deploy**
- Push to GitHub
- Go to [render.com](https://render.com)
- New → Web Service → Connect GitHub
- Select your repo
- Free tier: 750 hours/month

---

## Option 3: Vercel (Serverless)

### Prerequisites
- Need to convert Express to Next.js API routes

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Create vercel.json**
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

3. **Deploy**
```bash
vercel --prod
```

---

## Option 4: DigitalOcean App Platform

### Steps:

1. **Create app.yaml**
```yaml
name: biblechat-api
services:
- name: api
  github:
    repo: YOUR_GITHUB_REPO
    branch: main
  build_command: npm run build
  run_command: npm start
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: OPENAI_API_KEY
    value: YOUR_KEY
```

2. **Deploy via DigitalOcean**
- $5/month for basic droplet
- Includes SSL automatically

---

## Option 5: Heroku (Paid - $7/month)

1. **Add Procfile**
```
web: npm start
```

2. **Deploy**
```bash
heroku create biblechat-api
heroku config:set DATABASE_URL=your_db_url
heroku config:set OPENAI_API_KEY=your_key
git push heroku main
```

---

## Frontend Deployment (Svelte UI)

### Deploy to Vercel (Free & Fast)

1. **Build command in package.json**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

2. **Update API URL for production**
Create `.env.production`:
```
VITE_API_URL=https://biblechat-api.up.railway.app/api/v1
VITE_API_KEY=your_api_key_here
```

3. **Deploy**
```bash
cd biblechat-ui
npm run build
vercel --prod
```

---

## 🔒 Production Checklist

### Security Updates Needed:

1. **Generate new API keys**
```javascript
// In your database
INSERT INTO api_keys (key_hash, user_id, name) 
VALUES ('$2b$10$hashedkey', 'user-id', 'production-key');
```

2. **Update environment variables**
- Change JWT_SECRET
- Use production API keys
- Set proper CORS origins

3. **Enable HTTPS only**
- All providers above include SSL

4. **Add rate limiting**
- Already implemented in code

5. **Add monitoring**
```bash
# Add Sentry for error tracking
SENTRY_DSN=your_sentry_dsn
```

---

## 📊 Cost Comparison

| Provider | Free Tier | Paid | SSL | Auto-deploy |
|----------|-----------|------|-----|-------------|
| Railway | 500 hrs/mo | $5/mo | ✅ | ✅ |
| Render | 750 hrs/mo | $7/mo | ✅ | ✅ |
| Vercel | Unlimited* | $20/mo | ✅ | ✅ |
| DigitalOcean | No | $5/mo | ✅ | ✅ |
| Heroku | No | $7/mo | ✅ | ✅ |

*Vercel free has execution limits

---

## 🚀 Quick Start (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway link

# 4. Deploy
railway up

# 5. Get your URL
railway open
```

Your API will be live in under 5 minutes!

---

## API Usage After Deployment

Your Spiritual Journey app can now use:
```javascript
const API_URL = 'https://biblechat-api.up.railway.app/api/v1';

// Same code, just different URL
const response = await fetch(`${API_URL}/chat`, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "What does the Bible say about hope?"
  })
});
```

---

## Support & Monitoring

1. **Health Check Endpoint**
```
https://your-api.com/health
```

2. **API Documentation**
```
https://your-api.com/api-docs
```

3. **Logs**
- Railway: `railway logs`
- Render: Dashboard → Logs
- Vercel: `vercel logs`

---

## Need Help?

- Database is already on Supabase ✅
- API is production-ready ✅
- Just need to deploy!

Choose Railway for the easiest deployment with generous free tier.