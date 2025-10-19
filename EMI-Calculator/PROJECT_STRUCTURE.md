# Project Structure

```
EMI-Calculator/
│
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Basic EMI calculator API
│   ├── advanced_main.py              # Advanced features API (USE THIS)
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html               # HTML template
│   │
│   ├── src/
│   │   ├── pages/                   # Page Components
│   │   │   ├── Home.js              # Landing page
│   │   │   ├── StandardCalculator.js      # Basic EMI calculator
│   │   │   ├── PrepaymentCalculator.js    # Prepayment analysis
│   │   │   ├── ComparisonPage.js          # Multi-loan comparison
│   │   │   ├── StepUpEMI.js              # Step-up EMI calculator
│   │   │   ├── RentVsBuy.js              # Rent vs Buy analyzer
│   │   │   ├── RefinanceCalculator.js    # Refinance analysis
│   │   │   ├── TaxBenefitCalculator.js   # Tax benefit calculator
│   │   │   └── FloatingRateCalculator.js # Floating rate calculator
│   │   │
│   │   ├── styles/                  # CSS Stylesheets
│   │   │   ├── Home.css             # Home page styles
│   │   │   ├── Calculator.css       # Calculator page styles
│   │   │   └── Comparison.css       # Comparison page styles
│   │   │
│   │   ├── App.js                   # Main app with routing
│   │   ├── App.css                  # App-level styles (navbar, footer)
│   │   ├── index.js                 # React entry point
│   │   ├── index.css                # Global styles
│   │   └── reportWebVitals.js       # Performance monitoring
│   │
│   └── package.json                 # Node dependencies
│
├── start.bat                        # Windows startup script
├── README.md                        # Project documentation
└── PROJECT_STRUCTURE.md            # This file

```

## Key Files Description

### Backend Files

#### `advanced_main.py` (Primary Backend)
Contains all advanced calculator endpoints:
- `/api/calculate/advanced` - Advanced EMI with prepayments
- `/api/calculate/stepup` - Step-up EMI calculator
- `/api/calculate/tax-benefit` - Tax benefit calculator
- `/api/calculate/rent-vs-buy` - Rent vs Buy analyzer
- `/api/calculate/refinance` - Refinance calculator
- `/api/calculate/floating-rate` - Floating rate calculator

#### `main.py` (Basic Backend)
Simple EMI calculator for backward compatibility.

### Frontend Files

#### Page Components
Each page is a self-contained React component with its own logic and UI:

1. **Home.js** - Landing page with feature cards
2. **StandardCalculator.js** - Basic EMI calculator with sliders
3. **PrepaymentCalculator.js** - Prepayment impact analysis
4. **ComparisonPage.js** - Side-by-side loan comparison
5. **StepUpEMI.js** - Step-up EMI planning
6. **RentVsBuy.js** - Property purchase decision tool
7. **RefinanceCalculator.js** - Refinancing benefit analysis
8. **TaxBenefitCalculator.js** - Indian tax deduction calculator
9. **FloatingRateCalculator.js** - Variable rate loan calculator

#### Styling
- **App.css** - Navigation bar, footer, global app styles
- **Calculator.css** - Shared calculator page styles
- **Comparison.css** - Comparison-specific styles
- **Home.css** - Landing page styles

## Component Hierarchy

```
App (Router)
├── Navbar (Navigation)
├── Routes
│   ├── Home
│   ├── StandardCalculator
│   ├── PrepaymentCalculator
│   ├── ComparisonPage
│   ├── StepUpEMI
│   ├── RentVsBuy
│   ├── RefinanceCalculator
│   ├── TaxBenefitCalculator
│   └── FloatingRateCalculator
└── Footer
```

## Data Flow

1. **User Input** → Form fields in page components
2. **API Call** → Axios POST to FastAPI backend
3. **Processing** → Backend calculates using Pydantic models
4. **Response** → JSON data with calculations
5. **Visualization** → Recharts renders charts
6. **Display** → Results shown in cards, tables, charts

## API Request/Response Flow

```
Frontend Component
    ↓ (User Input)
Axios POST Request
    ↓ (JSON Data)
FastAPI Endpoint
    ↓ (Pydantic Validation)
Calculation Logic
    ↓ (Python Math)
Response Model
    ↓ (JSON Response)
Frontend State Update
    ↓ (React State)
UI Re-render
    ↓ (Display Results)
Charts & Tables
```

## Key Technologies

### Frontend Stack
- **React 18.2** - UI library
- **React Router DOM 7.9** - Routing
- **Recharts 2.15** - Charts
- **Axios** - HTTP client

### Backend Stack
- **FastAPI** - Web framework
- **Pydantic 2.4** - Data validation
- **Uvicorn** - ASGI server

## Development Workflow

1. **Backend Development**
   - Modify `advanced_main.py`
   - Add new endpoints or models
   - Test with FastAPI docs at `/docs`

2. **Frontend Development**
   - Create/modify page components
   - Update routing in `App.js`
   - Style with CSS files
   - Test in browser

3. **Integration**
   - Ensure API endpoints match frontend calls
   - Verify CORS settings
   - Test end-to-end flow

## Running the Application

### Option 1: Automated (Windows)
```bash
start.bat
```

### Option 2: Manual

**Terminal 1 (Backend):**
```bash
cd backend
python advanced_main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

## Port Configuration

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Environment Variables

Currently using default values. For production:
- Set `CORS_ORIGINS` in backend
- Configure `REACT_APP_API_URL` in frontend
- Set production build settings

## Future Additions

When adding new features:

1. **New Calculator Page**
   - Create component in `src/pages/`
   - Add route in `App.js`
   - Create backend endpoint in `advanced_main.py`
   - Add navigation link in navbar

2. **New API Endpoint**
   - Define Pydantic models
   - Create endpoint function
   - Add to FastAPI app
   - Update frontend to call endpoint

3. **New Chart Type**
   - Import from Recharts
   - Add to page component
   - Style in CSS file
   - Format data appropriately

## Best Practices

- Keep components modular and reusable
- Use consistent naming conventions
- Comment complex calculations
- Validate all user inputs
- Handle errors gracefully
- Maintain responsive design
- Test on multiple browsers
- Keep dependencies updated

## Troubleshooting

**Backend won't start:**
- Check Python version (3.8+)
- Verify all dependencies installed
- Check port 8000 availability

**Frontend won't start:**
- Check Node version (14+)
- Run `npm install` again
- Clear npm cache if needed
- Check port 3000 availability

**API calls failing:**
- Verify backend is running
- Check CORS settings
- Inspect browser console
- Test endpoint in `/docs`

**Charts not displaying:**
- Check data format
- Verify Recharts import
- Inspect console for errors
- Ensure data is not empty
