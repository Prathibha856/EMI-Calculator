# VPS Deployment Guide - Production Setup

Complete guide for deploying EMI Calculator on a VPS with NGINX reverse proxy, exposing a single port (3000).

---

## 🏗️ Architecture Overview

```
Internet (Port 3000)
        ↓
   NGINX Reverse Proxy
        ↓
    ┌───┴───┐
    ↓       ↓
Frontend  Backend
(Port 80) (Port 8000)
Internal  Internal
```

**Key Features:**
- ✅ Single port exposure (3000)
- ✅ NGINX as reverse proxy
- ✅ Separate containers for frontend and backend
- ✅ Docker Compose orchestration
- ✅ Production-ready configuration

---

## 📋 Prerequisites

### On Your VPS:
- Ubuntu 20.04+ or similar Linux distribution
- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum (4GB recommended)
- 10GB disk space
- Root or sudo access

---

## 🚀 Quick Deployment

### Step 1: Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Upload Project to VPS

**Option A: Using Git**
```bash
# On VPS
cd /opt
sudo git clone <your-repo-url> emi-calculator
cd emi-calculator
```

**Option B: Using SCP**
```bash
# On your local machine
scp -r "EMI-Calculator" user@your-vps-ip:/opt/emi-calculator
```

**Option C: Using SFTP**
```bash
# Use FileZilla, WinSCP, or similar
# Upload entire EMI-Calculator folder to /opt/emi-calculator
```

### Step 3: Configure Environment

```bash
# Navigate to project directory
cd /opt/emi-calculator

# Copy environment file
cp .env.production .env

# Edit if needed
nano .env
```

### Step 4: Build and Start

```bash
# Build and start all services
docker-compose up -d --build

# This will:
# - Build the backend Docker image
# - Build the frontend Docker image
# - Build the nginx Docker image
# - Create a Docker network
# - Start all containers
```

### Step 5: Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3000/health
```

### Step 6: Access Application

```
http://your-vps-ip:3000
```

---

## 🔧 Detailed Configuration

### NGINX Reverse Proxy Routes

| URL Pattern | Proxied To | Purpose |
|-------------|------------|---------|
| `/api/*` | `backend:8000/api/*` | Backend API |
| `/docs` | `backend:8000/docs` | API Documentation |
| `/redoc` | `backend:8000/redoc` | Alternative API Docs |
| `/openapi.json` | `backend:8000/openapi.json` | OpenAPI Schema |
| `/health` | NGINX | Health check |
| `/*` | `frontend:80/*` | Frontend SPA |

### Container Architecture

#### 1. Backend Container
- **Image**: Python 3.9 slim
- **Internal Port**: 8000
- **Exposed**: No (internal only)
- **Purpose**: FastAPI application

#### 2. Frontend Container
- **Image**: Nginx Alpine
- **Internal Port**: 80
- **Exposed**: No (internal only)
- **Purpose**: Serve React build

#### 3. NGINX Container
- **Image**: Nginx Alpine
- **External Port**: 3000
- **Internal Port**: 3000
- **Purpose**: Reverse proxy

---

## 🛠️ Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose up -d --build
```

### Check Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

---

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow application port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. SSL/HTTPS Setup (Recommended)

**Install Certbot:**
```bash
sudo apt install certbot
```

**Update NGINX configuration for SSL:**

Create `nginx/nginx-ssl.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of your nginx config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Update docker-compose.yml:**
```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 3. Update CORS for Production

Edit `backend/advanced_main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Backend health
docker exec emi-calculator-backend curl http://localhost:8000/

# Frontend health
docker exec emi-calculator-frontend curl http://localhost/
```

### Log Management

```bash
# View logs
docker-compose logs --tail=100 -f

# Export logs
docker-compose logs > deployment-$(date +%Y%m%d).log

# Clear logs (if too large)
docker-compose down
docker system prune -a
docker-compose up -d
```

### Backup Strategy

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/emi-calculator-$DATE.tar.gz /opt/emi-calculator

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs rm -f
```

### Auto-restart on Reboot

```bash
# Containers already configured with restart: unless-stopped
# They will auto-start on VPS reboot

# To verify:
docker-compose ps
```

---

## 🔄 Update Deployment

### Update Code

```bash
# Pull latest code
cd /opt/emi-calculator
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Verify
docker-compose ps
docker-compose logs -f
```

### Zero-Downtime Update (Advanced)

```bash
# Build new images
docker-compose build

# Start new containers
docker-compose up -d --no-deps --build nginx

# Verify new version
curl http://localhost:3000/health

# If successful, old containers are automatically replaced
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8080:3000"
```

### Issue: Containers Won't Start

```bash
# Check logs
docker-compose logs

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Issue: Cannot Access from Browser

```bash
# Check if containers are running
docker-compose ps

# Check firewall
sudo ufw status

# Check NGINX logs
docker-compose logs nginx

# Test locally on VPS
curl http://localhost:3000
```

### Issue: API Calls Failing

```bash
# Check backend logs
docker-compose logs backend

# Check NGINX proxy
docker-compose logs nginx | grep api

# Test backend directly
docker exec emi-calculator-backend curl http://localhost:8000/
```

### Issue: Frontend Shows Blank Page

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend

# Check browser console for errors
```

---

## 📈 Performance Optimization

### 1. Enable Caching

Already configured in `nginx/nginx.conf`:
- Static asset caching (1 year)
- Gzip compression
- Browser caching headers

### 2. Resource Limits

Add to `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        memory: 256M
```

### 3. Scaling (if needed)

```bash
# Scale backend (multiple instances)
docker-compose up -d --scale backend=3

# Update nginx upstream for load balancing
```

---

## 🌐 Domain Configuration

### 1. Point Domain to VPS

In your domain registrar (GoDaddy, Namecheap, etc.):
```
Type: A Record
Name: @
Value: YOUR_VPS_IP
TTL: 3600
```

### 2. Update NGINX Configuration

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 3. Obtain SSL Certificate

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Production Checklist

### Pre-Deployment
- [ ] VPS provisioned and accessible
- [ ] Docker and Docker Compose installed
- [ ] Project files uploaded to VPS
- [ ] Environment variables configured
- [ ] Firewall rules set

### Deployment
- [ ] Images built successfully
- [ ] Containers started without errors
- [ ] Health checks passing
- [ ] Application accessible on port 3000
- [ ] All routes working (frontend + API)

### Post-Deployment
- [ ] SSL certificate installed (if using domain)
- [ ] Domain pointing to VPS
- [ ] CORS configured for production domain
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Auto-restart configured

### Testing
- [ ] Frontend loads correctly
- [ ] All calculators functional
- [ ] API endpoints responding
- [ ] Charts rendering
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check logs for errors
- Monitor resource usage
- Verify backups

**Monthly:**
- Update system packages
- Review security updates
- Check SSL certificate expiry

**As Needed:**
- Deploy code updates
- Scale resources
- Optimize performance

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Rebuild
docker-compose up -d --build

# Health
curl http://localhost:3000/health
```

### File Locations

```
/opt/emi-calculator/          # Application root
├── docker-compose.yml        # Orchestration
├── .env                      # Environment config
├── nginx/                    # NGINX config
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # Backend code
│   └── Dockerfile
└── frontend/                 # Frontend code
    └── Dockerfile
```

### Access Points

- **Application**: http://your-vps-ip:3000
- **API Docs**: http://your-vps-ip:3000/docs
- **Health Check**: http://your-vps-ip:3000/health

---

**Deployment Type**: VPS with Docker Compose  
**Architecture**: NGINX + Frontend + Backend  
**Port Exposure**: Single port (3000)  
**Status**: ✅ Production Ready  
**Last Updated**: October 19, 2025
