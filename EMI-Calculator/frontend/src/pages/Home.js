import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>EMI Calculator</h1>
      <p className="subtitle">Calculate your loan EMIs with ease</p>
      
      <div className="feature-cards">
        <Link to="/standard" className="feature-card">
          <h2>Standard EMI Calculator</h2>
          <p>Calculate your monthly EMI, total interest, and view payment schedule</p>
        </Link>
        
        <Link to="/prepayment" className="feature-card">
          <h2>Prepayment Calculator</h2>
          <p>See how prepayments can reduce your loan tenure and interest</p>
        </Link>
        
        <Link to="/comparison" className="feature-card">
          <h2>Loan Comparison</h2>
          <p>Compare different loan scenarios side by side</p>
        </Link>
      </div>
      
      <div className="quick-links">
        <h3>Quick Links</h3>
        <ul>
          <li><Link to="/about">How to use this calculator</Link></li>
          <li><a href="#faq">FAQs</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
