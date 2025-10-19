import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StandardCalculator from './pages/StandardCalculator';
import PrepaymentCalculator from './pages/PrepaymentCalculator';
import ComparisonPage from './pages/ComparisonPage';
import StepUpEMI from './pages/StepUpEMI';
import RentVsBuy from './pages/RentVsBuy';
import RefinanceCalculator from './pages/RefinanceCalculator';
import TaxBenefitCalculator from './pages/TaxBenefitCalculator';
import FloatingRateCalculator from './pages/FloatingRateCalculator';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              EMI Calculator Pro
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/standard" className="nav-link">Standard</Link>
              </li>
              <li className="nav-item">
                <Link to="/prepayment" className="nav-link">Prepayment</Link>
              </li>
              <li className="nav-item">
                <Link to="/comparison" className="nav-link">Compare</Link>
              </li>
              <li className="nav-item dropdown">
                <span className="nav-link">Advanced ▾</span>
                <ul className="dropdown-menu">
                  <li><Link to="/stepup">Step-up EMI</Link></li>
                  <li><Link to="/rent-vs-buy">Rent vs Buy</Link></li>
                  <li><Link to="/refinance">Refinance</Link></li>
                  <li><Link to="/tax-benefit">Tax Benefits</Link></li>
                  <li><Link to="/floating-rate">Floating Rate</Link></li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/standard" element={<StandardCalculator />} />
          <Route path="/prepayment" element={<PrepaymentCalculator />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/stepup" element={<StepUpEMI />} />
          <Route path="/rent-vs-buy" element={<RentVsBuy />} />
          <Route path="/refinance" element={<RefinanceCalculator />} />
          <Route path="/tax-benefit" element={<TaxBenefitCalculator />} />
          <Route path="/floating-rate" element={<FloatingRateCalculator />} />
          <Route path="*" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <Link to="/" style={{ color: '#4a6bdf', textDecoration: 'none', fontSize: '1.2rem' }}>
                Go to Home
              </Link>
            </div>
          } />
        </Routes>

        <footer className="footer">
          <p>&copy; 2025 EMI Calculator Pro. All rights reserved.</p>
          <p className="disclaimer">
            Disclaimer: This calculator provides estimates only. Actual loan terms may vary.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
