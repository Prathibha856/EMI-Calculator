# Docker Deployment Guide

Complete guide for deploying the EMI Calculator using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB free disk space
- Ports 80 and 8000 available

---

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project directory
cd "EMI-Calculator"

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option 2: Manual Docker Build

#### Build Backend
```bash
cd backend
docker build -t emi-calculator-backend .
docker run -d -p 8000:8000 --name backend emi-calculator-backend
```

#### Build Frontend
```bash
cd frontend
docker build -t emi-calculator-frontend .
docker run -d -p 80:80 --name frontend emi-calculator-frontend
```

---

## 📁 Docker Files Overview

### 1. **Backend Dockerfile**
```
backend/
├── Dockerfile          # Python FastAPI container
├── .dockerignore      # Exclude unnecessary files
└── requirements.txt   # Python dependencies
```

**Features:**
- Python 3.9 slim base image
- Optimized for production
- Health checks included
- Runs on port 8000

### 2. **Frontend Dockerfile**
```
frontend/
├── Dockerfile         # Multi-stage build (Node + Nginx)
├── .dockerignore     # Exclude node_modules
├── nginx.conf        # Nginx reverse proxy config
└── package.json      # Node dependencies
```

**Features:**
- Multi-stage build (smaller image)
- Nginx for serving static files
- Gzip compression enabled
- React Router support
- Runs on port 80

### 3. **Docker Compose**
```
docker-compose.yml     # Orchestrates both services
```

**Features:**
- Automatic networking
- Health checks
- Auto-restart
- Volume management

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:80
PYTHONUNBUFFERED=1
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=/api
NODE_ENV=production
```

---

## 📊 Docker Compose Services

### Service: backend
- **Image**: Built from `./backend/Dockerfile`
- **Port**: 8000
- **Health Check**: HTTP GET to `/`
- **Restart**: unless-stopped

### Service: frontend
- **Image**: Built from `./frontend/Dockerfile`
- **Port**: 80
- **Depends On**: backend
- **Health Check**: HTTP GET to `/`
- **Restart**: unless-stopped

---

## 🛠️ Common Commands

### Build and Start
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Build and start together
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop and Remove
```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Check Status
```bash
# View running containers
docker-compose ps

# View resource usage
docker stats
```

---

## 🔍 Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error starting userland proxy: listen tcp 0.0.0.0:80: bind: address already in use
```

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :80

# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead
```

### Issue: Build Fails

**Solution:**
```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Backend Not Accessible

**Solution:**
```bash
# Check backend logs
docker-compose logs backend

# Check if backend is running
docker-compose ps

# Restart backend
docker-compose restart backend
```

### Issue: Frontend Shows 404

**Solution:**
```bash
# Check nginx configuration
docker exec -it emi-calculator-frontend cat /etc/nginx/conf.d/default.conf

# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

---

## 🚀 Production Deployment

### 1. Update CORS Settings

**backend/advanced_main.py:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Your production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Use Environment Variables

**Create .env file:**
```bash
# Backend
PORT=8000
CORS_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### 3. Enable HTTPS (with Nginx)

**Add SSL configuration to nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

### 4. Deploy to Cloud

#### AWS ECS
```bash
# Push images to ECR
docker tag emi-calculator-backend:latest <aws-account>.dkr.ecr.region.amazonaws.com/emi-backend
docker push <aws-account>.dkr.ecr.region.amazonaws.com/emi-backend
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/emi-backend
gcloud run deploy --image gcr.io/PROJECT-ID/emi-backend
```

#### Azure Container Instances
```bash
# Create container
az container create --resource-group myResourceGroup \
  --name emi-calculator \
  --image emi-calculator-backend
```

---

## 📈 Performance Optimization

### 1. Multi-stage Builds
✅ Already implemented in frontend Dockerfile

### 2. Layer Caching
```dockerfile
# Copy package files first (cached layer)
COPY package*.json ./
RUN npm install

# Copy source code (changes frequently)
COPY . .
```

### 3. Image Size Reduction
```bash
# Use alpine images
FROM python:3.9-alpine
FROM node:18-alpine

# Remove unnecessary files
RUN rm -rf /var/cache/apk/*
```

### 4. Nginx Optimization
✅ Gzip compression enabled
✅ Static asset caching
✅ Security headers

---

## 🔒 Security Best Practices

### 1. Non-root User
```dockerfile
# Add to Dockerfile
RUN adduser -D appuser
USER appuser
```

### 2. Security Scanning
```bash
# Scan images for vulnerabilities
docker scan emi-calculator-backend
docker scan emi-calculator-frontend
```

### 3. Update Base Images
```bash
# Regularly rebuild with latest base images
docker-compose build --pull
```

### 4. Secrets Management
```bash
# Use Docker secrets (Swarm mode)
echo "secret_value" | docker secret create api_key -
```

---

## 📊 Monitoring

### Health Checks
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' emi-calculator-backend
docker inspect --format='{{.State.Health.Status}}' emi-calculator-frontend
```

### Resource Usage
```bash
# Monitor resources
docker stats emi-calculator-backend emi-calculator-frontend
```

### Logs
```bash
# Export logs
docker-compose logs > deployment.log
```

---

## 🎯 Deployment Checklist

- [ ] Build Docker images successfully
- [ ] Test locally with docker-compose
- [ ] Update CORS settings for production
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Enable health checks
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all API endpoints
- [ ] Test frontend routes
- [ ] Verify security headers
- [ ] Check performance metrics
- [ ] Document deployment process
- [ ] Set up backup strategy

---

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Review configuration files
4. Check network connectivity

---

**Last Updated:** October 19, 2025  
**Docker Version:** 20.10+  
**Docker Compose Version:** 2.0+  
**Status:** ✅ Production Ready
