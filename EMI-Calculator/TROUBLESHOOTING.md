# 🔧 Troubleshooting Guide

Common issues and their solutions for the EMI Calculator.

---

## ❌ "Not Found" Error in Frontend

### **Symptom:**
Red box showing "Not Found" when clicking on calculators.

### **Cause:**
Backend API endpoint not available or not responding.

### **Solution:**

#### **Step 1: Check if Backend is Running**
```powershell
# Test backend
curl http://localhost:8000

# Or open in browser
http://localhost:8000/docs
```

If you get an error, backend is not running.

#### **Step 2: Start Backend**
```powershell
# Option 1: Use the batch file
double-click start-backend.bat

# Option 2: Manual
cd "f:\EMI Calculator\EMI-Calculator\backend"
.\venv\Scripts\activate
uvicorn advanced_main:app --reload --host 0.0.0.0 --port 8000
```

#### **Step 3: Verify Backend is Working**
Open: http://localhost:8000/docs

You should see the Swagger API documentation.

#### **Step 4: Restart Frontend**
```powershell
# Stop frontend (Ctrl+C in terminal)
# Then restart
npm start
```

---

## ❌ Backend Won't Start

### **Error: "uvicorn: command not found"**

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate
pip install uvicorn fastapi pydantic
```

---

### **Error: "No module named 'fastapi'"**

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

### **Error: "Port 8000 is already in use"**

**Solution 1: Kill the process**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution 2: Use different port**
```powershell
uvicorn advanced_main:app --reload --port 8001
```

Then update frontend to use port 8001:
```javascript
// In frontend/src/pages/*.js
axios.post('http://localhost:8001/api/calculate', ...)
```

---

## ❌ Frontend Won't Start

### **Error: "npm: command not found"**

**Solution:**
Install Node.js from https://nodejs.org/

---

### **Error: "Port 3000 is already in use"**

**Solution 1: Kill the process**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2: Use different port**
```powershell
set PORT=3001 && npm start
```

---

### **Error: "Module not found"**

**Solution:**
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
```

---

## ❌ CORS Errors

### **Symptom:**
Browser console shows: "Access to XMLHttpRequest blocked by CORS policy"

### **Solution:**

Check `backend/advanced_main.py` has correct CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If you changed frontend port to 3001:
```python
allow_origins=["http://localhost:3001"],
```

---

## ❌ API Errors

### **Error: "404 Not Found" for /api/calculate**

**Solution:**
The endpoint was fixed. Make sure you have the latest `advanced_main.py`:

```python
@app.post("/api/calculate", response_model=AdvancedEMIResponse)
@app.post("/api/calculate/advanced", response_model=AdvancedEMIResponse)
async def calculate_advanced_emi(request: AdvancedEMIRequest):
    # ...
```

Restart backend after changes.

---

### **Error: "422 Unprocessable Entity"**

**Cause:** Invalid data sent to API.

**Solution:**
Check the request data matches the expected format:

```javascript
{
  "principal": 1000000,
  "annual_interest_rate": 8.5,
  "tenure_years": 20,
  "tenure_months": 0,
  "prepayment_amount": 0,
  "prepayment_frequency": "none"
}
```

---

## ❌ Charts Not Displaying

### **Symptom:**
Results show but charts are blank.

### **Solution:**

1. Check browser console for errors
2. Verify recharts is installed:
```powershell
cd frontend
npm install recharts
```

3. Clear cache and restart:
```powershell
npm start
```

---

## ❌ Calculation Results Incorrect

### **Solution:**

1. Check input values are valid
2. Test with known values:
   - Principal: ₹10,00,000
   - Rate: 8.5%
   - Tenure: 20 years
   - Expected EMI: ~₹8,678

3. Check backend logs for errors
4. Verify calculation method (Reducing Balance vs Flat Rate)

---

## ❌ Virtual Environment Issues

### **Error: "venv\Scripts\activate : cannot be loaded"**

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
cd backend
.\venv\Scripts\activate
```

---

### **Error: "No module named 'venv'"**

**Solution:**
```powershell
# Install venv
python -m pip install virtualenv

# Create new venv
python -m venv venv
```

---

## ❌ Docker Issues

### **Error: "docker-compose: command not found"**

**Solution:**
Install Docker Desktop from https://www.docker.com/products/docker-desktop

---

### **Error: "Cannot connect to Docker daemon"**

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully start
3. Try again

---

### **Error: "Port is already allocated"**

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove containers
docker-compose rm -f

# Start fresh
docker-compose up -d --build
```

---

## ✅ Quick Health Check

Run these commands to verify everything is working:

### **1. Check Python**
```powershell
python --version
# Should show: Python 3.8 or higher
```

### **2. Check Node.js**
```powershell
node --version
# Should show: v14.0.0 or higher

npm --version
# Should show: 6.0.0 or higher
```

### **3. Check Backend**
```powershell
curl http://localhost:8000
# Should return: {"message": "Advanced EMI Calculator API", ...}
```

### **4. Check Frontend**
Open browser: http://localhost:3000
- Should see home page with calculator cards
- Navigation should work
- No errors in browser console (F12)

### **5. Test Calculation**
1. Click "Standard Calculator"
2. Enter values
3. Click "Calculate EMI"
4. Should see results and charts

---

## 🆘 Still Having Issues?

### **Collect Information:**

1. **Error Message**: Copy exact error text
2. **Browser Console**: Press F12, check Console tab
3. **Backend Logs**: Check terminal running backend
4. **Frontend Logs**: Check terminal running frontend

### **Common Checks:**

- [ ] Backend running on port 8000?
- [ ] Frontend running on port 3000?
- [ ] Virtual environment activated?
- [ ] Dependencies installed?
- [ ] Correct directory?
- [ ] No firewall blocking?

### **Reset Everything:**

```powershell
# Stop all services
# Press Ctrl+C in both terminals

# Backend
cd backend
rm -r venv
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -r node_modules
rm package-lock.json
npm install

# Start again
# Terminal 1: uvicorn advanced_main:app --reload
# Terminal 2: npm start
```

---

## 📝 Logs Location

### **Backend Logs:**
- Visible in terminal running uvicorn
- Check for Python errors, import errors, etc.

### **Frontend Logs:**
- Browser Console (F12 → Console tab)
- Terminal running npm start
- Check for compilation errors, module errors

### **Docker Logs:**
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```

---

## 🎯 Prevention Tips

1. **Always activate virtual environment** before running backend
2. **Check ports** before starting services
3. **Keep dependencies updated** but test after updates
4. **Use the batch files** for consistent startup
5. **Check both terminals** for errors

---

**Most issues are solved by:**
1. ✅ Restarting backend
2. ✅ Clearing browser cache
3. ✅ Reinstalling dependencies
4. ✅ Checking port conflicts
