import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const RentVsBuy = () => {
  const [formData, setFormData] = useState({
    property_price: 5000000,
    down_payment: 1000000,
    loan_amount: 4000000,
    annual_interest_rate: 8.5,
    tenure_years: 20,
    monthly_rent: 25000,
    rent_increase_percent: 5,
    property_appreciation_percent: 5,
    maintenance_cost_percent: 1
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

  const calculateRentVsBuy = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/rent-vs-buy', formData);
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
        category: 'Total Cost',
        Renting: result.net_cost_renting,
        Buying: result.net_cost_buying
      }
    ];
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Rent vs Buy Calculator</h1>
        <p>Make an informed decision: Should you rent or buy a property?</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateRentVsBuy} className="calculator-form">
          <div className="form-section">
            <h3>Property Details</h3>
            <div className="form-group">
              <label>Property Price (₹)</label>
              <input
                type="number"
                name="property_price"
                value={formData.property_price}
                onChange={handleInputChange}
                min="100000"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label>Down Payment (₹)</label>
              <input
                type="number"
                name="down_payment"
                value={formData.down_payment}
                onChange={handleInputChange}
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label>Loan Amount (₹)</label>
              <input
                type="number"
                name="loan_amount"
                value={formData.loan_amount}
                onChange={handleInputChange}
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label>Interest Rate (% p.a.)</label>
              <input
                type="number"
                name="annual_interest_rate"
                value={formData.annual_interest_rate}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Loan Tenure (Years)</label>
              <input
                type="number"
                name="tenure_years"
                value={formData.tenure_years}
                onChange={handleInputChange}
                min="1"
                max="40"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Rental & Appreciation</h3>
            <div className="form-group">
              <label>Monthly Rent (₹)</label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleInputChange}
                min="1000"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label>Annual Rent Increase (%)</label>
              <input
                type="number"
                name="rent_increase_percent"
                value={formData.rent_increase_percent}
                onChange={handleInputChange}
                min="0"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>Property Appreciation (%)</label>
              <input
                type="number"
                name="property_appreciation_percent"
                value={formData.property_appreciation_percent}
                onChange={handleInputChange}
                min="0"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>Maintenance Cost (% of property value)</label>
              <input
                type="number"
                name="maintenance_cost_percent"
                value={formData.maintenance_cost_percent}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Compare Rent vs Buy'}
          </button>
        </form>

        {result && (
          <div className="results">
            <div className={`recommendation-banner ${result.recommendation.toLowerCase()}`}>
              <h2>Recommendation: {result.recommendation}</h2>
              <p>Break-even point: Year {result.break_even_year}</p>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Rent Paid</h3>
                <p className="amount">{formatCurrency(result.total_rent_paid)}</p>
              </div>
              <div className="summary-card">
                <h3>Total EMI Paid</h3>
                <p className="amount">{formatCurrency(result.total_emi_paid)}</p>
              </div>
              <div className="summary-card">
                <h3>Property Value After {formData.tenure_years} Years</h3>
                <p className="amount">{formatCurrency(result.property_value_after_years)}</p>
              </div>
            </div>

            <div className="comparison-grid">
              <div className="comparison-box">
                <h3>Renting</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Total Rent Paid:</span>
                    <strong>{formatCurrency(result.total_rent_paid)}</strong>
                  </div>
                  <div className="cost-item total">
                    <span>Net Cost:</span>
                    <strong>{formatCurrency(result.net_cost_renting)}</strong>
                  </div>
                </div>
              </div>

              <div className="comparison-box">
                <h3>Buying</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Down Payment:</span>
                    <strong>{formatCurrency(formData.down_payment)}</strong>
                  </div>
                  <div className="cost-item">
                    <span>Total EMI Paid:</span>
                    <strong>{formatCurrency(result.total_emi_paid)}</strong>
                  </div>
                  <div className="cost-item positive">
                    <span>Property Value:</span>
                    <strong>-{formatCurrency(result.property_value_after_years)}</strong>
                  </div>
                  <div className="cost-item total">
                    <span>Net Cost:</span>
                    <strong>{formatCurrency(result.net_cost_buying)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Cost Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Renting" fill="#ff8042" />
                  <Bar dataKey="Buying" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="insights">
              <h3>Key Insights</h3>
              <ul>
                <li>
                  <strong>Break-even Year:</strong> You'll break even in year {result.break_even_year} if you buy the property.
                </li>
                <li>
                  <strong>Net Savings:</strong> {result.recommendation === 'Buy' 
                    ? `Buying saves you ${formatCurrency(result.net_cost_renting - result.net_cost_buying)} over ${formData.tenure_years} years.`
                    : `Renting saves you ${formatCurrency(result.net_cost_buying - result.net_cost_renting)} over ${formData.tenure_years} years.`
                  }
                </li>
                <li>
                  <strong>Property Appreciation:</strong> Your property is expected to appreciate by {formatCurrency(result.property_value_after_years - formData.property_price)} over {formData.tenure_years} years.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentVsBuy;
