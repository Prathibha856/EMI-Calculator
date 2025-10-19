import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Calculator.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TaxBenefitCalculator = () => {
  const [formData, setFormData] = useState({
    principal_paid: 150000,
    interest_paid: 200000,
    property_value: 4000000,
    is_first_home: false,
    tax_regime: 'old',
    annual_income: 1200000
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const calculateTaxBenefit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/tax-benefit', formData);
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

  const getDeductionData = () => {
    if (!result) return [];
    return [
      { name: 'Section 80C (Principal)', value: result.principal_deduction_80c },
      { name: 'Section 24 (Interest)', value: result.interest_deduction_24 },
      { name: 'Section 80EEA (First Home)', value: result.first_home_deduction_80eea }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Tax Benefit Calculator</h1>
        <p>Calculate tax savings on your home loan under Indian Income Tax Act</p>
      </div>
      
      <div className="calculator-container">
        <form onSubmit={calculateTaxBenefit} className="calculator-form">
          <div className="form-section">
            <h3>Loan Payments (Annual)</h3>
            <div className="form-group">
              <label>Principal Paid (₹)</label>
              <input
                type="number"
                name="principal_paid"
                value={formData.principal_paid}
                onChange={handleInputChange}
                min="0"
                step="10000"
              />
              <small>Maximum deduction: ₹1,50,000 under Section 80C</small>
            </div>

            <div className="form-group">
              <label>Interest Paid (₹)</label>
              <input
                type="number"
                name="interest_paid"
                value={formData.interest_paid}
                onChange={handleInputChange}
                min="0"
                step="10000"
              />
              <small>Maximum deduction: ₹2,00,000 under Section 24</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Property & Income Details</h3>
            <div className="form-group">
              <label>Property Value (₹)</label>
              <input
                type="number"
                name="property_value"
                value={formData.property_value}
                onChange={handleInputChange}
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label>Annual Income (₹)</label>
              <input
                type="number"
                name="annual_income"
                value={formData.annual_income}
                onChange={handleInputChange}
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_first_home"
                  checked={formData.is_first_home}
                  onChange={handleInputChange}
                />
                This is my first home (for Section 80EEA benefit)
              </label>
              <small>Additional ₹1,50,000 deduction if property value ≤ ₹45 lakhs</small>
            </div>

            <div className="form-group">
              <label>Tax Regime</label>
              <select
                name="tax_regime"
                value={formData.tax_regime}
                onChange={handleInputChange}
              >
                <option value="old">Old Tax Regime (with deductions)</option>
                <option value="new">New Tax Regime (no deductions)</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Tax Benefits'}
          </button>
        </form>

        {result && (
          <div className="results">
            {formData.tax_regime === 'new' && (
              <div className="info-banner">
                <p>⚠️ Note: New tax regime doesn't allow home loan deductions. Consider switching to the old regime if these deductions benefit you.</p>
              </div>
            )}

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Deduction</h3>
                <p className="amount">{formatCurrency(result.total_deduction)}</p>
              </div>
              <div className="summary-card savings">
                <h3>Tax Saved</h3>
                <p className="amount">{formatCurrency(result.tax_saved)}</p>
              </div>
              <div className="summary-card">
                <h3>Effective Interest Rate</h3>
                <p className="amount">{result.effective_interest_rate.toFixed(2)}%</p>
              </div>
            </div>

            <div className="deduction-breakdown">
              <h3>Deduction Breakdown</h3>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <h4>Section 80C</h4>
                    <span className="section-tag">Principal Repayment</span>
                  </div>
                  <div className="breakdown-content">
                    <div className="breakdown-row">
                      <span>Principal Paid:</span>
                      <strong>{formatCurrency(formData.principal_paid)}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Maximum Limit:</span>
                      <strong>{formatCurrency(150000)}</strong>
                    </div>
                    <div className="breakdown-row highlight">
                      <span>Deduction Allowed:</span>
                      <strong>{formatCurrency(result.principal_deduction_80c)}</strong>
                    </div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <h4>Section 24</h4>
                    <span className="section-tag">Interest Payment</span>
                  </div>
                  <div className="breakdown-content">
                    <div className="breakdown-row">
                      <span>Interest Paid:</span>
                      <strong>{formatCurrency(formData.interest_paid)}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Maximum Limit:</span>
                      <strong>{formatCurrency(200000)}</strong>
                    </div>
                    <div className="breakdown-row highlight">
                      <span>Deduction Allowed:</span>
                      <strong>{formatCurrency(result.interest_deduction_24)}</strong>
                    </div>
                  </div>
                </div>

                {formData.is_first_home && formData.property_value <= 4500000 && (
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <h4>Section 80EEA</h4>
                      <span className="section-tag">First Home Buyer</span>
                    </div>
                    <div className="breakdown-content">
                      <div className="breakdown-row">
                        <span>Additional Interest:</span>
                        <strong>{formatCurrency(Math.max(0, formData.interest_paid - 200000))}</strong>
                      </div>
                      <div className="breakdown-row">
                        <span>Maximum Limit:</span>
                        <strong>{formatCurrency(150000)}</strong>
                      </div>
                      <div className="breakdown-row highlight">
                        <span>Deduction Allowed:</span>
                        <strong>{formatCurrency(result.first_home_deduction_80eea)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="charts">
              <div className="chart-container">
                <h3>Deduction Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getDeductionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getDeductionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Tax Impact</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Without Deduction', amount: formData.interest_paid },
                    { name: 'After Tax Benefit', amount: formData.interest_paid - result.tax_saved }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="insights">
              <h3>Tax Saving Insights</h3>
              <ul>
                <li>
                  <strong>Total Tax Deduction:</strong> You can claim a total deduction of {formatCurrency(result.total_deduction)} under various sections.
                </li>
                <li>
                  <strong>Tax Saved:</strong> Based on your income bracket, you'll save {formatCurrency(result.tax_saved)} in taxes this year.
                </li>
                <li>
                  <strong>Effective Interest Rate:</strong> After considering tax benefits, your effective interest rate is {result.effective_interest_rate.toFixed(2)}%.
                </li>
                {formData.is_first_home && formData.property_value <= 4500000 && (
                  <li>
                    <strong>First Home Benefit:</strong> As a first-time home buyer with property value ≤ ₹45 lakhs, you're eligible for additional ₹1.5 lakh deduction under Section 80EEA.
                  </li>
                )}
                {formData.tax_regime === 'new' && (
                  <li className="warning">
                    <strong>Tax Regime Note:</strong> You've selected the new tax regime which doesn't allow these deductions. Consider the old regime if these benefits exceed the new regime's lower tax rates.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxBenefitCalculator;
