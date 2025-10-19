# 🚀 Quick Start Guide - EMI Calculator

Complete guide to run the EMI Calculator on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Python 3.8+** installed
- **Node.js 14+** and npm installed
- **Git** (optional, for cloning)

---

## ⚡ Quick Start (3 Options)

### **Option 1: Docker (Recommended - Easiest)**

If you have Docker installed, this is the fastest way:

```bash
# Navigate to project directory
cd "f:\EMI Calculator\EMI-Calculator"

# Build and start all services
docker-compose up -d --build

# View logs (optional)
docker-compose logs -f

# Access the application
# Open browser: http://localhost:3000
```

**That's it!** The application is now running.

To stop:
```bash
docker-compose down
```

---

### **Option 2: Manual Setup (Development)**

#### **Step 1: Start Backend (FastAPI)**

Open **Terminal 1** (PowerShell or CMD):

```powershell
# Navigate to backend directory
cd "f:\EMI Calculator\EMI-Calculator\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn advanced_main:app --reload --host 0.0.0.0 --port 8000
```

**Backend is now running at:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

---

#### **Step 2: Start Frontend (React)**

Open **Terminal 2** (new terminal window):

```powershell
# Navigate to frontend directory
cd "f:\EMI Calculator\EMI-Calculator\frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

**Frontend is now running at:** http://localhost:3000

The browser should automatically open. If not, navigate to http://localhost:3000

---

### **Option 3: Production Build**

For production-like environment:

```powershell
# Backend (Terminal 1)
cd "f:\EMI Calculator\EMI-Calculator\backend"
.\venv\Scripts\activate
uvicorn advanced_main:app --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd "f:\EMI Calculator\EMI-Calculator\frontend"
npm run build
npx serve -s build -l 3000
```

---

## 🎯 Access Points

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | API endpoints |
| **API Docs (Swagger)** | http://localhost:8000/docs | Interactive API documentation |
| **API Docs (ReDoc)** | http://localhost:8000/redoc | Alternative API documentation |

---

## 🔧 Troubleshooting

### **Issue: Port Already in Use**

**Backend (Port 8000):**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
uvicorn advanced_main:app --reload --port 8001
```

**Frontend (Port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or set a different port
set PORT=3001 && npm start
```

---

### **Issue: Module Not Found (Backend)**

```powershell
# Make sure virtual environment is activated
cd "f:\EMI Calculator\EMI-Calculator\backend"
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt

# If still issues, upgrade pip
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

### **Issue: Dependencies Not Installing (Frontend)**

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

---

### **Issue: CORS Errors**

If you see CORS errors in browser console:

1. Check that backend is running on port 8000
2. Check frontend is running on port 3000
3. Verify `advanced_main.py` has correct CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### **Issue: Backend Not Starting**

```powershell
# Check Python version (must be 3.8+)
python --version

# Check if all dependencies installed
pip list

# Try running with verbose output
uvicorn advanced_main:app --reload --log-level debug
```

---

### **Issue: Frontend Not Starting**

```powershell
# Check Node version (must be 14+)
node --version
npm --version

# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install

# Try with verbose output
npm start --verbose
```

---

## 📊 Verify Installation

### **Test Backend:**

```powershell
# Test if backend is running
curl http://localhost:8000

# Should return: {"message": "Welcome to Advanced EMI Calculator API"}
```

Or open in browser: http://localhost:8000/docs

---

### **Test Frontend:**

Open browser: http://localhost:3000

You should see:
- Navigation bar with calculator options
- Home page with calculator cards
- Responsive design

---

## 🎨 Development Workflow

### **Recommended Setup:**

1. **Terminal 1**: Backend server
   ```powershell
   cd "f:\EMI Calculator\EMI-Calculator\backend"
   .\venv\Scripts\activate
   uvicorn advanced_main:app --reload --port 8000
   ```

2. **Terminal 2**: Frontend server
   ```powershell
   cd "f:\EMI Calculator\EMI-Calculator\frontend"
   npm start
   ```

3. **Browser**: http://localhost:3000

4. **Code Editor**: VS Code or your preferred editor

---

### **Hot Reload:**

Both backend and frontend support hot reload:
- **Backend**: Changes to `.py` files auto-reload
- **Frontend**: Changes to `.js`, `.jsx`, `.css` files auto-reload

Just save your changes and see them instantly!

---

## 🧪 Running Tests

### **Backend Tests:**

```powershell
cd "f:\EMI Calculator\EMI-Calculator\backend"
.\venv\Scripts\activate
pytest test_calculations.py -v
```

### **Frontend Tests:**

```powershell
cd "f:\EMI Calculator\EMI-Calculator\frontend"
npm test
```

---

## 🐳 Docker Commands Reference

### **Start Services:**
```bash
docker-compose up -d
```

### **Stop Services:**
```bash
docker-compose down
```

### **View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### **Rebuild After Code Changes:**
```bash
docker-compose down
docker-compose up -d --build
```

### **Check Status:**
```bash
docker-compose ps
```

### **Access Container Shell:**
```bash
# Backend
docker exec -it emi-calculator-backend bash

# Frontend
docker exec -it emi-calculator-frontend sh
```

---

## 📝 Environment Variables

### **Backend (.env):**

Create `backend/.env` (optional):
```env
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### **Frontend (.env.local):**

Create `frontend/.env.local` (optional):
```env
REACT_APP_API_URL=http://localhost:8000/api
NODE_ENV=development
```

---

## 🚀 Production Deployment

For VPS deployment, see:
- **[VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)** - Complete VPS deployment guide
- **[DOCKER.md](DOCKER.md)** - Docker deployment details

---

## 📱 Testing the Application

### **1. Standard Calculator:**
- Navigate to http://localhost:3000
- Click "Standard Calculator"
- Enter loan details
- Click "Calculate EMI"
- Verify results and charts

### **2. Prepayment Calculator:**
- Click "Prepayment Calculator"
- Enter loan and prepayment details
- Select calculation method (Reducing Balance or Flat Rate)
- Click "Calculate Prepayment Impact"
- Compare with/without prepayment

### **3. Loan Comparison:**
- Click "Loan Comparison"
- Modify loan scenarios
- Click "Compare Loans"
- View detailed comparison

---

## ⚡ Quick Commands Cheat Sheet

### **Start Development (Manual):**
```powershell
# Terminal 1 - Backend
cd "f:\EMI Calculator\EMI-Calculator\backend"
.\venv\Scripts\activate
uvicorn advanced_main:app --reload

# Terminal 2 - Frontend
cd "f:\EMI Calculator\EMI-Calculator\frontend"
npm start
```

### **Start Development (Docker):**
```bash
cd "f:\EMI Calculator\EMI-Calculator"
docker-compose up -d
```

### **Stop Everything:**
```bash
# Docker
docker-compose down

# Manual: Press Ctrl+C in both terminals
```

### **View Logs:**
```bash
# Docker
docker-compose logs -f

# Manual: Check terminal output
```

---

## 🎯 Next Steps

After running the application:

1. ✅ **Explore Features**: Try all calculator types
2. ✅ **Test Calculations**: Verify accuracy with known values
3. ✅ **Customize**: Modify code to fit your needs
4. ✅ **Deploy**: Follow VPS_DEPLOYMENT.md for production

---

## 📞 Need Help?

### **Common Issues:**
- Port conflicts → Change ports in commands
- Dependencies → Reinstall with `pip install -r requirements.txt` or `npm install`
- CORS errors → Check backend CORS settings
- Module not found → Activate virtual environment

### **Resources:**
- **API Documentation**: http://localhost:8000/docs
- **Project Documentation**: See README.md
- **Deployment Guide**: See VPS_DEPLOYMENT.md

---

## ✅ Success Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000/docs
- [ ] Calculators working correctly
- [ ] Charts displaying properly

---

**You're all set! Happy calculating! 🎉**
