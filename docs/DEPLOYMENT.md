# Lendora AI - Deployment Guide

Complete guide for deploying Lendora AI to various platforms.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Vercel Deployment](#vercel-deployment)
3. [GitHub Actions CI/CD](#github-actions-cicd)
4. [Environment Variables](#environment-variables)
5. [Production Checklist](#production-checklist)

---

## Docker Deployment

### Quick Start

```bash
# Build and run full stack
docker-compose up -d

# Or use production compose
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Build Individual Services

```bash
# Backend only
docker build -f Dockerfile.backend -t lendora-backend:latest .

# Frontend only
docker build -f Dockerfile.frontend -t lendora-frontend:latest .

# Full stack (single container)
docker build -f Dockerfile -t lendora-full:latest .
```

### Run Individual Containers

```bash
# Backend
docker run -d \
  -p 8000:8000 \
  -e PORT=8000 \
  -e HYDRA_MODE=auto \
  lendora-backend:latest

# Frontend
docker run -d \
  -p 80:80 \
  lendora-frontend:latest
```

---

## Vercel Deployment

### Frontend Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend/Dashboard
   vercel
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_WS_URL
   ```

4. **Configure `vercel.json`:**
   - Update `your-backend-url.vercel.app` with your actual backend URL
   - Set up API proxy routes

### Backend Deployment (Serverless)

1. **Deploy Backend:**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables:**
   ```bash
   vercel env add OLLAMA_BASE_URL
   vercel env add HYDRA_NODE_URL
   vercel env add HYDRA_MODE
   # ... add all required env vars
   ```

3. **Note:** 
   - Ollama cannot run on Vercel (serverless limitation)
   - Use external Ollama service or disable AI agents
   - Hydra node must be external

---

## GitHub Actions CI/CD

### Setup

1. **Enable GitHub Actions** in your repository settings

2. **Set Secrets** (Settings > Secrets and variables > Actions):
   - `GITHUB_TOKEN` (automatically available)
   - Add any required API keys

3. **Workflow runs automatically** on push to main/master

### Manual Deployment

```bash
# Push to trigger deployment
git push origin main
```

### View Deployment Status

- Go to Actions tab in GitHub
- View workflow runs and logs

---

## Environment Variables

### Required for Backend

```env
PORT=8000
HOST=0.0.0.0
OLLAMA_BASE_URL=http://localhost:11434
HYDRA_NODE_URL=ws://127.0.0.1:4001
HYDRA_MODE=auto
```

### Optional (Advanced Features)

```env
# Midnight Network
MIDNIGHT_API_URL=https://testnet-api.midnight.network
MIDNIGHT_API_KEY=your_api_key
MIDNIGHT_NETWORK=testnet

# PyCardano
BLOCKFROST_PROJECT_ID=your_project_id
CARDANO_NETWORK=testnet

# Credit Oracle
CREDIT_ORACLE_URL=https://api.oracle.com
CREDIT_ORACLE_API_KEY=your_api_key
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

---

## Production Checklist

### Before Deployment

- [ ] Set all environment variables
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Test all endpoints
- [ ] Verify WebSocket connections
- [ ] Test wallet connections
- [ ] Verify AI agent functionality
- [ ] Set up backup strategy

### Security

- [ ] Use strong API keys
- [ ] Enable HTTPS only
- [ ] Configure rate limiting
- [ ] Set up DDoS protection
- [ ] Review CORS settings
- [ ] Secure environment variables
- [ ] Enable security headers

### Performance

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Optimize Docker images
- [ ] Configure resource limits
- [ ] Set up load balancing (if needed)

---

## Platform-Specific Notes

### Vercel

**Limitations:**
- No persistent storage (use external database)
- Ollama cannot run (use external service)
- WebSocket support is limited (consider alternatives)

**Recommendations:**
- Deploy frontend to Vercel
- Deploy backend to Railway, Render, or Fly.io
- Use external Ollama service

### Railway

**Recommended for:**
- Full-stack deployment
- Persistent storage
- WebSocket support

**Deployment:**
```bash
railway login
railway init
railway up
```

### Render

**Recommended for:**
- Docker deployments
- Auto-scaling
- WebSocket support

**Deployment:**
- Connect GitHub repository
- Select docker-compose.yml
- Configure environment variables

### Fly.io

**Recommended for:**
- Global distribution
- Low latency
- Docker support

**Deployment:**
```bash
flyctl launch
flyctl deploy
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Check health
curl http://localhost:8000/health

# Verify environment variables
docker-compose exec backend env
```

### Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs frontend

# Verify build
docker-compose exec frontend ls -la /usr/share/nginx/html

# Check API connection
curl http://localhost/api/health
```

### WebSocket Issues

- Verify WebSocket URL is correct
- Check CORS settings
- Verify proxy configuration
- Test WebSocket connection directly

---

## Monitoring

### Health Checks

- Backend: `GET /health`
- Frontend: `GET /` (should return index.html)

### Logs

```bash
# Docker
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Metrics

- Monitor API response times
- Track WebSocket connections
- Monitor agent execution times
- Track error rates

---

## Support

For deployment issues, check:
- [GitHub Issues](https://github.com/your-repo/Lendora-AI/issues)
- [Documentation](./README.md)
- [Advanced Features](./ADVANCED_FEATURES.md)

