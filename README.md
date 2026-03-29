# EMI-Calculator
# Advanced EMI Calculator Pro

A comprehensive, feature-rich EMI (Equated Monthly Installment) calculator web application built with React and FastAPI. This application provides advanced loan calculation features including prepayment options, loan comparison, tax benefits, refinancing analysis, and more.

## ✨ Features

### Core Calculators
- **Standard EMI Calculator**: Calculate monthly EMI with interactive sliders
- **Prepayment Calculator**: See how prepayments reduce tenure and interest
- **Loan Comparison Tool**: Compare multiple loan scenarios side-by-side
- **Calculation Methods**: Support for both Reducing Balance and Flat Rate calculations
- **Step-up EMI Calculator**: Plan EMI increases to close loans faster
- **Rent vs Buy Analyzer**: Make informed decisions about renting vs buying property
- **Refinance Calculator**: Evaluate if refinancing makes financial sense
- **Tax Benefit Calculator**: Calculate tax savings under Indian Income Tax Act (Sections 80C, 24, 80EEA)
- **Floating Rate Calculator**: Model loans with variable interest rates

### Advanced Features
- ✅ **Multiple Prepayment Options**: One-time, yearly, monthly, quarterly prepayments
- ✅ **Prepayment Strategies**: Choose between EMI reduction or tenure reduction
- ✅ **Interactive Charts**: Pie charts, line charts, bar charts for visual analysis
- ✅ **Detailed Amortization Schedules**: Month-by-month and yearly breakdowns
- ✅ **Tax Benefit Analysis**: Calculate deductions under old and new tax regimes
- ✅ **Break-even Analysis**: For refinancing and rent vs buy decisions
- ✅ **Processing Fees & Penalties**: Factor in all costs for accurate calculations
- ✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ✅ **Real-time Calculations**: Instant results as you adjust parameters
- ✅ **Export Ready**: Print-friendly layouts for reports

## 🛠️ Technology Stack

### Frontend
- **React 18.2**: Modern UI library
- **React Router DOM**: Client-side routing
- **Recharts**: Beautiful, responsive charts
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with modern features

### Backend
- **FastAPI**: High-performance Python web framework
- **Pydantic**: Data validation using Python type hints
- **Uvicorn**: ASGI server for FastAPI
- **Python 3.8+**: Backend programming language

## 🚀 Getting Started

### Prerequisites
- **Option 1 (Docker):** Docker & Docker Compose
- **Option 2 (Manual):** Python 3.8+, Node.js 14+, npm

### Installation

#### 🐳 **Option 1: Docker Deployment**

**A. Local Development (3 containers)**
```bash
# Navigate to project directory
cd EMI-Calculator

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access:**
- Application: http://localhost:3000
- API Documentation: http://localhost:3000/docs

**B. VPS Production Deployment (Single Port)**
```bash
# On VPS
cd /opt/emi-calculator

# Deploy
chmod +x deploy.sh
./deploy.sh
```

**Access:**
- Application: http://your-vps-ip:3000
- Single port exposure (3000)
- NGINX reverse proxy

**See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for complete VPS deployment guide.**  
**See [DOCKER.md](DOCKER.md) for local Docker deployment guide.**

---

#### 💻 **Option 2: Manual Setup**

1. **Clone the repository**
```bash
git clone <repository-url>
cd EMI-Calculator
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python advanced_main.py
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🎯 Usage

### Standard EMI Calculator
1. Enter loan amount, interest rate, and tenure
2. View monthly EMI, total interest, and payment breakdown
3. Analyze the amortization schedule

### Prepayment Calculator
1. Input loan details
2. Configure prepayment amount and frequency
3. Choose between EMI reduction or tenure reduction
4. Compare savings vs standard EMI

### Loan Comparison
1. Add multiple loan scenarios
2. Adjust parameters for each scenario
3. View side-by-side comparison charts
4. Analyze which loan option is best

### Tax Benefit Calculator
1. Enter annual principal and interest paid
2. Specify property value and income
3. Select tax regime (old/new)
4. View tax deductions and savings

### Rent vs Buy Analyzer
1. Input property price and down payment
2. Enter monthly rent and appreciation rates
3. View break-even analysis
4. Get recommendation based on your scenario

### Refinance Calculator
1. Enter current loan details
2. Input new loan terms
3. Factor in processing fees and penalties
4. View break-even period and net savings

### Floating Rate Calculator
1. Enter initial loan details
2. Add expected rate changes over time
3. View EMI variations and total interest
4. Analyze rate change timeline

## 📊 API Endpoints

### Advanced EMI Calculation
```
POST /api/calculate/advanced
```
Calculate EMI with advanced features including prepayments, step-up EMI, and processing fees.

### Step-up EMI
```
POST /api/calculate/stepup
```
Calculate EMI with periodic increases.

### Tax Benefits
```
POST /api/calculate/tax-benefit
```
Calculate tax deductions and savings on home loans.

### Rent vs Buy
```
POST /api/calculate/rent-vs-buy
```
Compare renting vs buying a property.

### Refinance Analysis
```
POST /api/calculate/refinance
```
Evaluate refinancing benefits.

### Floating Rate
```
POST /api/calculate/floating-rate
```
Calculate EMI with variable interest rates.

## 🎨 Features Breakdown

### 1. Prepayment Options
- **Lump Sum**: One-time prepayment at any month
- **Yearly**: Annual prepayments
- **Monthly**: Regular monthly additional payments
- **Quarterly**: Prepayments every 3 months
- **Strategy Selection**: Reduce EMI or reduce tenure

### 2. Interactive Charts
- **Pie Charts**: Principal vs Interest breakdown
- **Line Charts**: Balance reduction over time, rate changes
- **Bar Charts**: Yearly payment breakdown, comparison charts
- **Responsive**: Auto-adjust to screen size

### 3. Tax Benefits (India)
- **Section 80C**: Principal repayment deduction (up to ₹1.5 lakh)
- **Section 24**: Interest payment deduction (up to ₹2 lakh)
- **Section 80EEA**: First home buyer benefit (up to ₹1.5 lakh)
- **Tax Regime Comparison**: Old vs New regime analysis

### 4. Advanced Analysis
- **Break-even Calculations**: For refinancing and rent vs buy
- **Effective Interest Rate**: After tax benefits
- **Total Cost Analysis**: Including all fees and penalties
- **Savings Projections**: Interest saved, tenure reduced

## 🔒 Security & Privacy
- All calculations performed client-side and server-side
- No data storage or tracking
- No personal information collected
- CORS enabled for secure API communication

## 📱 Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced experience
- Touch-friendly controls
- Print-ready reports

## 🚧 Future Enhancements
- [ ] PDF report generation
- [ ] Email/SMS sharing
- [ ] Scenario saving (local storage)
- [ ] Multi-currency support
- [ ] Loan comparison with up to 5 scenarios
- [ ] Amortization heatmap visualization
- [ ] AI-powered loan recommendations
- [ ] Integration with real-time interest rates
- [ ] Multi-language support
- [ ] Dark mode theme

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

## 📚 Additional Documentation

### Deployment Guides
- **[VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)** - 🚀 VPS deployment with NGINX reverse proxy (Production)
- **[DOCKER.md](DOCKER.md)** - 🐳 Local Docker deployment guide
- **[DOCKER-IMPLEMENTATION.md](DOCKER-IMPLEMENTATION.md)** - 📋 Docker implementation plan & architecture

### Technical Documentation
- **[TESTING.md](TESTING.md)** - 🧪 Complete testing & validation strategy
- **[FASTAPI_FEATURES.md](FASTAPI_FEATURES.md)** - ⚡ FastAPI features & architecture
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - 🏗️ Architecture and file organization
- **[FEATURES_SUMMARY.md](FEATURES_SUMMARY.md)** - ✨ Complete features overview
- **[FLAT_RATE_IMPLEMENTATION.md](FLAT_RATE_IMPLEMENTATION.md)** - 💰 Flat Rate vs Reducing Balance implementation

### Project Management
- **[TODO.md](TODO.md)** - ✅ Project completion checklist
- **[RUN_TESTS.md](RUN_TESTS.md)** - 🔬 How to run tests
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 📋 Deployment checklist
- **[KEY_TAKEAWAYS.md](KEY_TAKEAWAYS.md)** - 🎯 Key learnings & future enhancements

## 📞 Support
For issues, questions, or suggestions, please open an issue on GitHub.

## ⚠️ Disclaimer
This calculator provides estimates only. Actual loan terms, EMIs, and tax benefits may vary based on lender policies, individual circumstances, and current tax laws. Please consult with financial advisors and tax professionals for personalized advice.

## 🙏 Acknowledgments
- Built with React and FastAPI
- Charts powered by Recharts
- Icons and UI inspired by modern design principles

---

**Made with ❤️ for better financial planning**
