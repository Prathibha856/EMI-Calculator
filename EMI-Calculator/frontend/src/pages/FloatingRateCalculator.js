import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const FloatingRateCalculator = () => {
  const [formData, setFormData] = useState({
    principal: 2000000,
    initial_interest_rate: 8.5,
    tenure_years: 20
  });

  const [rateChanges, setRateChanges] = useState([
    { month: 12, new_rate: 8.75 },
    { month: 24, new_rate: 9.0 }
  ]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleRateChangeInput = (index, field, value) => {
    const updated = [...rateChanges];
    updated[index][field] = parseFloat(value) || 0;
    setRateChanges(updated);
  };

  const addRateChange = () => {
    setRateChanges([...rateChanges, { month: 36, new_rate: 8.5 }]);
  };

  const removeRateChange = (index) => {
    setRateChanges(rateChanges.filter((_, i) => i !== index));
  };

  const calculateFloatingRate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/floating-rate', {
        ...formData,
        rate_changes: rateChanges
      });
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

  const getChartData = () => {
    if (!result?.amortization_schedule) return [];
    const step = Math.max(1, Math.floor(result.amortization_schedule.length / 24));
    return result.amortization_schedule.filter((_, i) => i % step === 0 || i === result.amortization_schedule.length - 1);
  };

  const getRateChangeData = () => {
    if (!result?.amortization_schedule) return [];
    const step = Math.max(1, Math.floor(result.amortization_schedule.length / 24));
    return result.amortization_schedule.filter((_, i) => i % step === 0 || i === result.amortization_schedule.length - 1);
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Floating Rate Calculator</h1>
        <p>Calculate EMI with variable interest rates over time</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateFloatingRate} className="calculator-form">
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
              <label>Initial Interest Rate (% p.a.)</label>
              <input
                type="number"
                name="initial_interest_rate"
                value={formData.initial_interest_rate}
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
            <h3>Rate Changes</h3>
            <p className="section-description">Add expected interest rate changes over the loan tenure</p>
            
            {rateChanges.map((change, index) => (
              <div key={index} className="rate-change-row">
                <div className="form-group">
                  <label>After Month</label>
                  <input
                    type="number"
                    value={change.month}
                    onChange={(e) => handleRateChangeInput(index, 'month', e.target.value)}
                    min="1"
                    max={formData.tenure_years * 12}
                  />
                </div>
                <div className="form-group">
                  <label>New Rate (%)</label>
                  <input
                    type="number"
                    value={change.new_rate}
                    onChange={(e) => handleRateChangeInput(index, 'new_rate', e.target.value)}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeRateChange(index)}
                  className="remove-btn"
                  title="Remove rate change"
                >
                  ×
                </button>
              </div>
            ))}
            
            <button type="button" onClick={addRateChange} className="add-btn">
              + Add Rate Change
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Floating Rate EMI'}
          </button>
        </form>

        {result && (
          <div className="results">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Initial EMI</h3>
                <p className="amount">{formatCurrency(result.amortization_schedule[0]?.emi || 0)}</p>
              </div>
              <div className="summary-card">
                <h3>Final EMI</h3>
                <p className="amount">
                  {formatCurrency(result.amortization_schedule[result.amortization_schedule.length - 1]?.emi || 0)}
                </p>
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

            <div className="chart-container">
              <h3>Interest Rate Changes Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getRateChangeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Interest Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: 'EMI (₹)', angle: 90, position: 'insideRight' }}
                    tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Interest Rate') return value.toFixed(2) + '%';
                      return formatCurrency(value);
                    }}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="stepAfter" 
                    dataKey="interest_rate" 
                    name="Interest Rate" 
                    stroke="#ff8042" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="emi" 
                    name="EMI" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Outstanding Balance Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month"
                    label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'}
                    label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="remaining_balance" 
                    name="Outstanding Balance" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rate-change-timeline">
              <h3>Rate Change Timeline</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker start"></div>
                  <div className="timeline-content">
                    <strong>Month 1</strong>
                    <p>Initial Rate: {formData.initial_interest_rate}%</p>
                    <p>EMI: {formatCurrency(result.amortization_schedule[0]?.emi || 0)}</p>
                  </div>
                </div>
                
                {rateChanges.sort((a, b) => a.month - b.month).map((change, index) => {
                  const scheduleEntry = result.amortization_schedule.find(s => s.month === change.month);
                  return (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <strong>Month {change.month}</strong>
                        <p>New Rate: {change.new_rate}%</p>
                        {scheduleEntry && <p>New EMI: {formatCurrency(scheduleEntry.emi)}</p>}
                      </div>
                    </div>
                  );
                })}
                
                <div className="timeline-item">
                  <div className="timeline-marker end"></div>
                  <div className="timeline-content">
                    <strong>Month {result.amortization_schedule.length}</strong>
                    <p>Loan Closed</p>
                    <p>Total Interest Paid: {formatCurrency(result.total_interest)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="amortization-table">
              <h3>Payment Schedule (Selected Months)</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Interest Rate (%)</th>
                      <th>EMI (₹)</th>
                      <th>Principal (₹)</th>
                      <th>Interest (₹)</th>
                      <th>Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChartData().map((row, index) => (
                      <tr key={index}>
                        <td>{row.month}</td>
                        <td>{row.interest_rate.toFixed(2)}</td>
                        <td>{row.emi.toLocaleString()}</td>
                        <td>{row.principal.toLocaleString()}</td>
                        <td>{row.interest.toLocaleString()}</td>
                        <td>{row.remaining_balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="insights">
              <h3>Floating Rate Analysis</h3>
              <ul>
                <li>
                  <strong>Rate Volatility:</strong> Your interest rate will change {rateChanges.length} time(s) during the loan tenure.
                </li>
                <li>
                  <strong>EMI Impact:</strong> Your EMI will vary from {formatCurrency(Math.min(...result.amortization_schedule.map(s => s.emi)))} to {formatCurrency(Math.max(...result.amortization_schedule.map(s => s.emi)))}.
                </li>
                <li>
                  <strong>Total Interest:</strong> With the projected rate changes, you'll pay {formatCurrency(result.total_interest)} in total interest.
                </li>
                <li>
                  <strong>Planning Tip:</strong> Keep a buffer for EMI increases. Consider fixing your rate if you expect significant rate hikes.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingRateCalculator;
