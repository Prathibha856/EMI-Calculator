import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const PrepaymentCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    principal: 1000000,
    annual_interest_rate: 8.5,
    tenure_years: 20,
    prepayment_amount: 50000,
    prepayment_frequency: 'yearly',
    prepayment_start: 12,
    calculation_method: 'reducing_balance',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('principal') || name.includes('prepayment_amount') || name.includes('annual_interest_rate')
        ? parseFloat(value) || 0
        : name.includes('tenure_years') || name.includes('prepayment_start')
        ? parseInt(value, 10) || 0
        : value
    }));
  };

  const calculateEMI = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // First get standard EMI (without prepayment)
      const standardResponse = await axios.post('http://localhost:8000/api/calculate', {
        ...formData,
        prepayment_amount: 0,
        prepayment_frequency: 'none'
      });
      
      // Then get EMI with prepayment
      const prepaymentResponse = await axios.post('http://localhost:8000/api/calculate', formData);
      
      setResult({
        standard: standardResponse.data,
        withPrepayment: prepaymentResponse.data
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error calculating EMI');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateEMI();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getComparisonData = () => {
    if (!result) return [];
    
    const standard = result.standard;
    const withPrepayment = result.withPrepayment;
    
    return [
      {
        name: 'Standard EMI',
        emi: standard.emi,
        total_interest: standard.total_interest,
        total_payment: standard.total_payment,
        tenure_months: standard.amortization_schedule.length
      },
      {
        name: 'With Prepayment',
        emi: withPrepayment.emi,
        total_interest: withPrepayment.total_interest,
        total_payment: withPrepayment.total_payment,
        tenure_months: withPrepayment.amortization_schedule.length
      },
      {
        name: 'Savings',
        emi: standard.emi - withPrepayment.emi,
        total_interest: standard.total_interest - withPrepayment.total_interest,
        total_payment: standard.total_payment - withPrepayment.total_payment,
        tenure_months: standard.amortization_schedule.length - withPrepayment.amortization_schedule.length,
        isSavings: true
      }
    ];
  };

  const getChartData = () => {
    if (!result) return [];
    
    const standard = result.standard.amortization_schedule;
    const withPrepayment = result.withPrepayment.amortization_schedule;
    
    // Get data points for chart (every 12 months)
    const data = [];
    const maxMonths = Math.max(standard.length, withPrepayment.length);
    
    for (let i = 0; i < maxMonths; i += 12) {
      if (i < standard.length || i < withPrepayment.length) {
        data.push({
          month: i,
          standard_balance: i < standard.length ? standard[i].remaining_balance : 0,
          prepayment_balance: i < withPrepayment.length ? withPrepayment[i].remaining_balance : 0
        });
      }
    }
    
    return data;
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Prepayment Calculator</h1>
        <p>See how prepayments can reduce your loan tenure and interest</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateEMI} className="calculator-form">
          <div className="form-section">
            <h3>Loan Details</h3>
            <div className="form-group">
              <label>Loan Amount (₹)</label>
              <input
                type="number"
                name="principal"
                value={formData.principal}
                onChange={handleInputChange}
                min="10000"
                step="10000"
              />
            </div>

            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
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
            <h3>Prepayment Details</h3>
            <div className="form-group">
              <label>Prepayment Amount (₹)</label>
              <input
                type="number"
                name="prepayment_amount"
                value={formData.prepayment_amount}
                onChange={handleInputChange}
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label>Prepayment Frequency</label>
              <select
                name="prepayment_frequency"
                value={formData.prepayment_frequency}
                onChange={handleInputChange}
              >
                <option value="yearly">Yearly</option>
                <option value="onetime">One-time</option>
              </select>
            </div>

            {formData.prepayment_frequency === 'onetime' && (
              <div className="form-group">
                <label>Start Prepayment from Month</label>
                <input
                  type="number"
                  name="prepayment_start"
                  value={formData.prepayment_start}
                  onChange={handleInputChange}
                  min="1"
                  max={formData.tenure_years * 12}
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Calculation Method</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="calculation_method"
                  value="reducing_balance"
                  checked={formData.calculation_method === 'reducing_balance'}
                  onChange={handleInputChange}
                />
                <span>Reducing Balance</span>
                <small>Interest calculated on outstanding balance (most common)</small>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="calculation_method"
                  value="flat_rate"
                  checked={formData.calculation_method === 'flat_rate'}
                  onChange={handleInputChange}
                />
                <span>Flat Rate</span>
                <small>Interest calculated on original principal</small>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Prepayment Impact'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="results">
            <div className="comparison-cards">
              {getComparisonData().map((item, index) => (
                <div key={index} className={`comparison-card ${item.isSavings ? 'savings' : ''}`}>
                  <h3>{item.name}</h3>
                  <div className="comparison-metric">
                    <span>Monthly EMI</span>
                    <strong>{formatCurrency(item.emi)}</strong>
                  </div>
                  <div className="comparison-metric">
                    <span>Total Interest</span>
                    <strong>{formatCurrency(item.total_interest)}</strong>
                  </div>
                  <div className="comparison-metric">
                    <span>Total Payment</span>
                    <strong>{formatCurrency(item.total_payment)}</strong>
                  </div>
                  <div className="comparison-metric">
                    <span>Loan Tenure</span>
                    <strong>{Math.floor(item.tenure_months / 12)} yrs, {item.tenure_months % 12} mos</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-container">
              <h3>Loan Balance Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(month) => `${Math.floor(month/12)} years, ${month%12} months`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="standard_balance" 
                    name="Standard EMI" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prepayment_balance" 
                    name="With Prepayment" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepaymentCalculator;
