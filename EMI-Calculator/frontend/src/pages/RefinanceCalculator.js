import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const RefinanceCalculator = () => {
  const [formData, setFormData] = useState({
    current_principal: 3000000,
    current_interest_rate: 9.5,
    current_remaining_months: 180,
    new_interest_rate: 8.0,
    new_tenure_years: 15,
    processing_fee: 10000,
    prepayment_penalty_percent: 2
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateRefinance = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/refinance', formData);
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getComparisonData = () => {
    if (!result) return [];
    return [
      {
        category: 'Monthly EMI',
        Current: result.current_emi,
        New: result.new_emi
      },
      {
        category: 'Total Interest',
        Current: result.total_interest_current,
        New: result.total_interest_new
      }
    ];
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Refinance Calculator</h1>
        <p>Evaluate if refinancing your loan makes financial sense</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateRefinance} className="calculator-form">
          <div className="form-section">
            <h3>Current Loan Details</h3>
            <div className="form-group">
              <label>Outstanding Principal (₹)</label>
              <input
                type="number"
                name="current_principal"
                value={formData.current_principal}
                onChange={handleInputChange}
                min="10000"
                step="10000"
              />
            </div>

            <div className="form-group">
              <label>Current Interest Rate (% p.a.)</label>
              <input
                type="number"
                name="current_interest_rate"
                value={formData.current_interest_rate}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Remaining Months</label>
              <input
                type="number"
                name="current_remaining_months"
                value={formData.current_remaining_months}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>New Loan Details</h3>
            <div className="form-group">
              <label>New Interest Rate (% p.a.)</label>
              <input
                type="number"
                name="new_interest_rate"
                value={formData.new_interest_rate}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>New Tenure (Years)</label>
              <input
                type="number"
                name="new_tenure_years"
                value={formData.new_tenure_years}
                onChange={handleInputChange}
                min="1"
                max="40"
              />
            </div>

            <div className="form-group">
              <label>Processing Fee (₹)</label>
              <input
                type="number"
                name="processing_fee"
                value={formData.processing_fee}
                onChange={handleInputChange}
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label>Prepayment Penalty (%)</label>
              <input
                type="number"
                name="prepayment_penalty_percent"
                value={formData.prepayment_penalty_percent}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Refinance Benefits'}
          </button>
        </form>

        {result && (
          <div className="results">
            <div className={`recommendation-banner ${result.recommendation.toLowerCase().replace(' ', '-')}`}>
              <h2>{result.recommendation}</h2>
              {result.recommendation === 'Refinance' && (
                <p>You'll break even in {result.break_even_months} months</p>
              )}
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Monthly Savings</h3>
                <p className="amount">{formatCurrency(result.monthly_savings)}</p>
              </div>
              <div className="summary-card">
                <h3>Interest Savings</h3>
                <p className="amount">{formatCurrency(result.interest_savings)}</p>
              </div>
              <div className="summary-card">
                <h3>Refinance Cost</h3>
                <p className="amount">{formatCurrency(result.total_cost_of_refinance)}</p>
              </div>
              <div className={`summary-card ${result.net_savings > 0 ? 'savings' : ''}`}>
                <h3>Net Savings</h3>
                <p className="amount">{formatCurrency(result.net_savings)}</p>
              </div>
            </div>

            <div className="comparison-grid">
              <div className="comparison-box">
                <h3>Current Loan</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Monthly EMI:</span>
                    <strong>{formatCurrency(result.current_emi)}</strong>
                  </div>
                  <div className="cost-item">
                    <span>Interest Rate:</span>
                    <strong>{formData.current_interest_rate}%</strong>
                  </div>
                  <div className="cost-item">
                    <span>Remaining Months:</span>
                    <strong>{formData.current_remaining_months}</strong>
                  </div>
                  <div className="cost-item total">
                    <span>Total Interest:</span>
                    <strong>{formatCurrency(result.total_interest_current)}</strong>
                  </div>
                </div>
              </div>

              <div className="comparison-box">
                <h3>New Loan</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Monthly EMI:</span>
                    <strong>{formatCurrency(result.new_emi)}</strong>
                  </div>
                  <div className="cost-item">
                    <span>Interest Rate:</span>
                    <strong>{formData.new_interest_rate}%</strong>
                  </div>
                  <div className="cost-item">
                    <span>New Tenure:</span>
                    <strong>{formData.new_tenure_years * 12} months</strong>
                  </div>
                  <div className="cost-item">
                    <span>Processing Fee:</span>
                    <strong>{formatCurrency(result.processing_fee)}</strong>
                  </div>
                  <div className="cost-item">
                    <span>Prepayment Penalty:</span>
                    <strong>{formatCurrency(result.prepayment_penalty)}</strong>
                  </div>
                  <div className="cost-item total">
                    <span>Total Interest:</span>
                    <strong>{formatCurrency(result.total_interest_new)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Comparison: Current vs New Loan</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Current" fill="#ff8042" />
                  <Bar dataKey="New" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="insights">
              <h3>Analysis</h3>
              <ul>
                <li>
                  <strong>Monthly Savings:</strong> You'll save {formatCurrency(result.monthly_savings)} per month by refinancing.
                </li>
                <li>
                  <strong>Break-even Period:</strong> {result.break_even_months < 999 
                    ? `You'll recover the refinancing costs in ${result.break_even_months} months (${Math.floor(result.break_even_months / 12)} years, ${result.break_even_months % 12} months).`
                    : 'Refinancing may not be beneficial as the break-even period is too long.'
                  }
                </li>
                <li>
                  <strong>Total Interest Savings:</strong> You'll save {formatCurrency(result.interest_savings)} in interest over the loan tenure.
                </li>
                <li>
                  <strong>Net Benefit:</strong> After accounting for all costs, your net {result.net_savings > 0 ? 'savings' : 'loss'} will be {formatCurrency(Math.abs(result.net_savings))}.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefinanceCalculator;
