import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StandardCalculator = () => {
  const [formData, setFormData] = useState({
    principal: 1000000,
    annual_interest_rate: 8.5,
    tenure_years: 20,
    tenure_months: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('principal') || name.includes('annual_interest_rate')
        ? parseFloat(value) || 0
        : parseInt(value, 10) || 0
    }));
  };

  const calculateEMI = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate', {
        ...formData,
        prepayment_amount: 0,
        prepayment_frequency: 'none'
      });
      setResult(response.data);
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

  const getChartData = () => {
    if (!result?.amortization_schedule) return [];
    const step = Math.max(1, Math.floor(result.amortization_schedule.length / 12));
    return result.amortization_schedule.filter((_, i) => i % step === 0 || i === result.amortization_schedule.length - 1);
  };

  const getPieData = () => {
    if (!result) return [];
    return [
      { name: 'Principal', value: formData.principal },
      { name: 'Interest', value: result.total_interest }
    ];
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Standard EMI Calculator</h1>
        <p>Calculate your monthly EMI, total interest, and view payment schedule</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateEMI} className="calculator-form">
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
            <input
              type="range"
              name="principal"
              value={formData.principal}
              onChange={handleInputChange}
              min="100000"
              max="10000000"
              step="100000"
              className="slider"
            />
            <span className="slider-value">{formatCurrency(formData.principal)}</span>
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
            <input
              type="range"
              name="annual_interest_rate"
              value={formData.annual_interest_rate}
              onChange={handleInputChange}
              min="5"
              max="20"
              step="0.1"
              className="slider"
            />
            <span className="slider-value">{formData.annual_interest_rate}%</span>
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
            <input
              type="range"
              name="tenure_years"
              value={formData.tenure_years}
              onChange={handleInputChange}
              min="1"
              max="40"
              className="slider"
            />
            <span className="slider-value">{formData.tenure_years} years</span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate EMI'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="results">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Monthly EMI</h3>
                <p className="amount">{formatCurrency(result.emi)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Interest</h3>
                <p className="amount">{formatCurrency(result.total_interest)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Payment</h3>
                <p className="amount">{formatCurrency(result.total_payment)}</p>
              </div>
            </div>

            <div className="charts">
              <div className="chart-container">
                <h3>Loan Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Principal Reduction Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(month) => `Month ${month}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="remaining_balance" name="Outstanding Balance" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="amortization-table">
              <h3>Amortization Schedule (First 12 Months)</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Principal (₹)</th>
                      <th>Interest (₹)</th>
                      <th>Total Payment (₹)</th>
                      <th>Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.amortization_schedule.slice(0, 12).map((row, index) => (
                      <tr key={index}>
                        <td>{row.month}</td>
                        <td>{row.principal.toLocaleString()}</td>
                        <td>{row.interest.toLocaleString()}</td>
                        <td>{row.total_payment.toLocaleString()}</td>
                        <td>{row.remaining_balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardCalculator;
