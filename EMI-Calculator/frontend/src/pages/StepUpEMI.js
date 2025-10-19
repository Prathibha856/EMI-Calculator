import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const StepUpEMI = () => {
  const [formData, setFormData] = useState({
    principal: 1000000,
    annual_interest_rate: 8.5,
    tenure_years: 20,
    initial_emi: 8500,
    step_up_amount: 0,
    step_up_percent: 5,
    step_up_frequency: 12
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

  const calculateStepUpEMI = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/stepup', formData);
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

  const getYearlyEMIData = () => {
    if (!result?.amortization_schedule) return [];
    
    const yearlyData = [];
    for (let year = 1; year <= Math.ceil(result.amortization_schedule.length / 12); year++) {
      const yearSchedule = result.amortization_schedule.filter(
        s => Math.floor((s.month - 1) / 12) + 1 === year
      );
      if (yearSchedule.length > 0) {
        yearlyData.push({
          year,
          avg_emi: Math.round(yearSchedule.reduce((sum, s) => sum + s.emi, 0) / yearSchedule.length),
          principal: Math.round(yearSchedule.reduce((sum, s) => sum + s.principal, 0)),
          interest: Math.round(yearSchedule.reduce((sum, s) => sum + s.interest, 0))
        });
      }
    }
    return yearlyData;
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Step-up EMI Calculator</h1>
        <p>Increase your EMI periodically to save on interest and close your loan faster</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateStepUpEMI} className="calculator-form">
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

            <div className="form-group">
              <label>Initial EMI (₹)</label>
              <input
                type="number"
                name="initial_emi"
                value={formData.initial_emi}
                onChange={handleInputChange}
                min="1000"
                step="100"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Step-up Configuration</h3>
            <div className="form-group">
              <label>Step-up by Amount (₹)</label>
              <input
                type="number"
                name="step_up_amount"
                value={formData.step_up_amount}
                onChange={handleInputChange}
                min="0"
                step="100"
              />
            </div>

            <div className="form-group">
              <label>OR Step-up by Percentage (%)</label>
              <input
                type="number"
                name="step_up_percent"
                value={formData.step_up_percent}
                onChange={handleInputChange}
                min="0"
                step="1"
              />
            </div>

            <div className="form-group">
              <label>Step-up Frequency (Months)</label>
              <select
                name="step_up_frequency"
                value={formData.step_up_frequency}
                onChange={handleInputChange}
              >
                <option value="12">Yearly</option>
                <option value="6">Half-yearly</option>
                <option value="3">Quarterly</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Step-up EMI'}
          </button>
        </form>

        {result && (
          <div className="results">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Initial EMI</h3>
                <p className="amount">{formatCurrency(result.emi)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Interest</h3>
                <p className="amount">{formatCurrency(result.total_interest)}</p>
              </div>
              <div className="summary-card">
                <h3>Actual Tenure</h3>
                <p className="amount">
                  {Math.floor(result.actual_tenure_months / 12)} yrs {result.actual_tenure_months % 12} mos
                </p>
              </div>
              <div className="summary-card savings">
                <h3>Interest Saved</h3>
                <p className="amount">{formatCurrency(result.savings_vs_standard?.interest_saved || 0)}</p>
              </div>
            </div>

            <div className="chart-container">
              <h3>EMI Progression Over Years</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getYearlyEMIData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="avg_emi" fill="#8884d8" name="Average EMI" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Principal vs Interest (Yearly)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getYearlyEMIData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="principal" stackId="a" fill="#82ca9d" name="Principal" />
                  <Bar dataKey="interest" stackId="a" fill="#ffc658" name="Interest" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {result.yearly_summary && (
              <div className="amortization-table">
                <h3>Yearly Summary</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Principal Paid (₹)</th>
                        <th>Interest Paid (₹)</th>
                        <th>Total Paid (₹)</th>
                        <th>Remaining Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearly_summary.map((row, index) => (
                        <tr key={index}>
                          <td>{row.year}</td>
                          <td>{row.principal_paid.toLocaleString()}</td>
                          <td>{row.interest_paid.toLocaleString()}</td>
                          <td>{row.total_paid.toLocaleString()}</td>
                          <td>{row.remaining_balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepUpEMI;
