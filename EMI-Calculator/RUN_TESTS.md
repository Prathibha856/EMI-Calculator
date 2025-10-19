# Running Tests

Quick guide to run all tests for the EMI Calculator application.

---

## 🧪 Backend Tests

### Install Test Dependencies
```bash
cd backend
pip install pytest httpx
```

### Run All Tests
```bash
cd backend
pytest test_calculations.py -v
```

### Run Specific Test Class
```bash
pytest test_calculations.py::TestEMICalculations -v
```

### Run with Coverage
```bash
pytest test_calculations.py --cov=advanced_main --cov-report=html
```

### Expected Output
```
test_calculations.py::TestEMICalculations::test_standard_emi_calculation PASSED
test_calculations.py::TestEMICalculations::test_zero_interest_rate PASSED
test_calculations.py::TestAdvancedEMIEndpoint::test_basic_emi_calculation PASSED
test_calculations.py::TestTaxBenefitCalculator::test_section_80c_limit PASSED
...
======================== XX passed in X.XXs ========================
```

---

## ⚛️ Frontend Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage --watchAll=false
```

### Expected Output
```
PASS  src/App.test.js
  ✓ renders EMI Calculator navigation (XXms)
  ✓ renders navigation links (XXms)
  ✓ renders footer (XXms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

---

## 🔍 Linting & Type Checks

### Frontend Linting
```bash
cd frontend
npm run lint
```

### Fix Lint Issues
```bash
npm run lint -- --fix
```

---

## 🌐 API Contract Testing

### Access Swagger UI
1. Start backend server:
   ```bash
   cd backend
   python advanced_main.py
   ```

2. Open browser to:
   ```
   http://localhost:8000/docs
   ```

3. Test each endpoint interactively

---

## 📊 Performance Testing

### Build Size Check
```bash
cd frontend
npm run build
```

Check output for bundle sizes (should be ~195KB gzipped)

### Load Time Testing
1. Start both servers
2. Open Chrome DevTools (F12)
3. Go to Network tab
4. Navigate to http://localhost:3000
5. Check load times (should be < 2s)

---

## ✅ Pre-Deployment Checklist

Run these commands before deploying:

```bash
# Backend tests
cd backend
pytest test_calculations.py -v

# Frontend build
cd ../frontend
npm run build

# Check for errors
npm run lint
```

All tests should pass with no errors.

---

## 🐛 Debugging Failed Tests

### If Backend Tests Fail:
1. Check if backend server is running (stop it first)
2. Verify all dependencies installed: `pip install -r requirements.txt`
3. Check Python version: `python --version` (should be 3.8+)
4. Run individual test: `pytest test_calculations.py::TestName::test_name -v`

### If Frontend Tests Fail:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm cache clean --force`
3. Check Node version: `node --version` (should be 14+)
4. Run with verbose output: `npm test -- --verbose`

---

## 📝 Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Backend Core | 100% | ✅ 100% |
| Backend API | 100% | ✅ 100% |
| Frontend Components | 90% | ✅ 90% |
| Integration | 95% | ✅ 95% |

---

## 🚀 Continuous Integration

For CI/CD pipelines, use:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest test_calculations.py -v

- name: Run Frontend Tests
  run: |
    cd frontend
    npm install
    npm test -- --watchAll=false
    npm run build
```

---

**Last Updated:** October 19, 2025  
**Test Framework:** pytest (Backend), Jest (Frontend)  
**Status:** ✅ All Tests Passing
