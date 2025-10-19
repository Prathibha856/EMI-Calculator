import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Comparison.css';

const ComparisonPage = () => {
  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      name: 'Loan 1',
      principal: 1000000,
      annual_interest_rate: 8.5,
      tenure_years: 20,
      prepayment_amount: 0,
      prepayment_frequency: 'none',
      calculation_method: 'reducing_balance',
      color: '#8884d8',
      result: null
    },
    {
      id: 2,
      name: 'Loan 2',
      principal: 1000000,
      annual_interest_rate: 9.0,
      tenure_years: 15,
      prepayment_amount: 0,
      prepayment_frequency: 'none',
      calculation_method: 'reducing_balance',
      color: '#82ca9d',
      result: null
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const calculateScenario = async (scenario) => {
    try {
      const response = await axios.post('http://localhost:8000/api/calculate/advanced', {
        principal: scenario.principal,
        annual_interest_rate: scenario.annual_interest_rate,
        tenure_years: scenario.tenure_years,
        prepayment_amount: scenario.prepayment_amount || 0,
        prepayment_frequency: scenario.prepayment_frequency || 'none',
        prepayment_start_month: scenario.prepayment_start || 1,
        calculation_method: scenario.calculation_method || 'reducing_balance',
        prepayment_strategy: 'reduce_tenure'
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating scenario:', error);
      return null;
    }
  };

  const calculateAllScenarios = async () => {
    setLoading(true);
    try {
      const updatedScenarios = await Promise.all(
        scenarios.map(async (scenario) => {
          const result = await calculateScenario(scenario);
          return { ...scenario, result };
        })
      );
      setScenarios(updatedScenarios);
    } catch (error) {
      console.error('Error calculating scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAllScenarios();
  }, []);

  const handleInputChange = (id, field, value) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === id 
          ? { 
              ...scenario, 
              [field]: field.includes('principal') || field.includes('prepayment_amount') || field.includes('annual_interest_rate')
                ? parseFloat(value) || 0
                : field.includes('tenure_years') || field.includes('prepayment_start')
                ? parseInt(value, 10) || 0
                : value 
            }
          : scenario
      )
    );
  };

  const addScenario = () => {
    const newId = Math.max(0, ...scenarios.map(s => s.id)) + 1;
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc658'];
    
    setScenarios([
      ...scenarios,
      {
        id: newId,
        name: `Scenario ${newId}`,
        principal: 1000000,
        annual_interest_rate: 8.5,
        tenure_years: 20,
        prepayment_amount: 0,
        prepayment_frequency: 'none',
        color: colors[(newId - 1) % colors.length],
        result: null
      }
    ]);
  };

  const removeScenario = (id) => {
    if (scenarios.length <= 1) return; // Keep at least one scenario
    setScenarios(scenarios.filter(scenario => scenario.id !== id));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSummaryData = () => {
    return scenarios.map(scenario => ({
      name: scenario.name,
      emi: scenario.result?.emi || 0,
      total_interest: scenario.result?.total_interest || 0,
      total_payment: scenario.result?.total_payment || 0,
      tenure_months: scenario.result?.amortization_schedule?.length || 0,
      color: scenario.color
    }));
  };

  const getChartData = () => {
    if (!scenarios.some(s => s.result)) return [];
    
    const maxMonths = Math.max(...scenarios
      .filter(s => s.result)
      .map(s => s.result.amortization_schedule.length)
    );
    
    const data = [];
    const step = Math.max(1, Math.floor(maxMonths / 12));
    
    for (let month = 0; month <= maxMonths; month += step) {
      const point = { month };
      scenarios.forEach(scenario => {
        if (scenario.result) {
          const schedule = scenario.result.amortization_schedule;
          const lastEntry = schedule[Math.min(month, schedule.length - 1)];
          point[scenario.name] = lastEntry ? lastEntry.remaining_balance : 0;
        }
      });
      data.push(point);
    }
    
    return data;
  };

  const getInterestVsPrincipalData = () => {
    return scenarios
      .filter(scenario => scenario.result)
      .map(scenario => ({
        name: scenario.name,
        Principal: scenario.principal,
        Interest: scenario.result.total_interest,
        color: scenario.color
      }));
  };

  return (
    <div className="comparison-page">
      <div className="page-header">
        <h1>Loan Comparison</h1>
        <p>Compare different loan scenarios side by side</p>
      </div>

      <div className="scenarios-container">
        {scenarios.map((scenario, index) => (
          <div key={scenario.id} className="scenario-card" style={{ borderTop: `4px solid ${scenario.color}` }}>
            <div className="scenario-header">
              <input
                type="text"
                value={scenario.name}
                onChange={(e) => handleInputChange(scenario.id, 'name', e.target.value)}
                className="scenario-name"
              />
              {scenarios.length > 1 && (
                <button 
                  onClick={() => removeScenario(scenario.id)}
                  className="remove-scenario"
                  title="Remove scenario"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label>Loan Amount (₹)</label>
              <input
                type="number"
                value={scenario.principal}
                onChange={(e) => handleInputChange(scenario.id, 'principal', e.target.value)}
                min="10000"
                step="10000"
              />
            </div>

            <div className="form-group">
              <label>Interest Rate (% p.a.)</label>
              <input
                type="number"
                value={scenario.annual_interest_rate}
                onChange={(e) => handleInputChange(scenario.id, 'annual_interest_rate', e.target.value)}
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Tenure (Months)</label>
              <input
                type="number"
                value={scenario.tenure_years * 12}
                onChange={(e) => handleInputChange(scenario.id, 'tenure_years', Math.floor(e.target.value / 12))}
                min="12"
                max="480"
                step="12"
              />
            </div>

            <div className="form-group">
              <label>Calculation Method</label>
              <div className="radio-group-inline">
                <label className="radio-inline">
                  <input
                    type="radio"
                    name={`calc_method_${scenario.id}`}
                    value="reducing_balance"
                    checked={scenario.calculation_method === 'reducing_balance'}
                    onChange={(e) => handleInputChange(scenario.id, 'calculation_method', e.target.value)}
                  />
                  <span>Reducing Balance</span>
                </label>
                <label className="radio-inline">
                  <input
                    type="radio"
                    name={`calc_method_${scenario.id}`}
                    value="flat_rate"
                    checked={scenario.calculation_method === 'flat_rate'}
                    onChange={(e) => handleInputChange(scenario.id, 'calculation_method', e.target.value)}
                  />
                  <span>Flat Rate</span>
                </label>
              </div>
            </div>

            {scenario.prepayment_frequency !== 'none' && (
              <div className="form-group">
                <label>Prepayment Amount (₹)</label>
                <input
                  type="number"
                  value={scenario.prepayment_amount}
                  onChange={(e) => handleInputChange(scenario.id, 'prepayment_amount', e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
            )}

            {scenario.prepayment_frequency === 'onetime' && (
              <div className="form-group">
                <label>After (Months)</label>
                <input
                  type="number"
                  value={scenario.prepayment_start || 12}
                  onChange={(e) => handleInputChange(scenario.id, 'prepayment_start', e.target.value)}
                  min="1"
                  max={scenario.tenure_years * 12}
                />
              </div>
            )}

            {scenario.result && (
              <div className="scenario-results">
                <div className="result-item">
                  <span>Monthly EMI:</span>
                  <strong>{formatCurrency(scenario.result.emi)}</strong>
                </div>
                <div className="result-item">
                  <span>Total Interest:</span>
                  <strong>{formatCurrency(scenario.result.total_interest)}</strong>
                </div>
                <div className="result-item">
                  <span>Total Payment:</span>
                  <strong>{formatCurrency(scenario.result.total_payment)}</strong>
                </div>
                <div className="result-item">
                  <span>Loan Tenure:</span>
                  <strong>
                    {Math.floor(scenario.result.amortization_schedule.length / 12)} yrs,{' '}
                    {scenario.result.amortization_schedule.length % 12} mos
                  </strong>
                </div>
              </div>
            )}
          </div>
        ))}

        <button onClick={addScenario} className="add-scenario">
          + Add Scenario
        </button>
      </div>

      <div className="comparison-tabs">
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab-button ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Balance Over Time
        </button>
        <button 
          className={`tab-button ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Cost Breakdown
        </button>
      </div>

      <div className="comparison-results">
        {activeTab === 'summary' && (
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  {scenarios.map(scenario => (
                    <th key={scenario.id} style={{ color: scenario.color }}>
                      {scenario.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly EMI</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.id}>
                      {scenario.result ? formatCurrency(scenario.result.emi) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Total Interest</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.id}>
                      {scenario.result ? formatCurrency(scenario.result.total_interest) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Total Payment</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.id}>
                      {scenario.result ? formatCurrency(scenario.result.total_payment) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Loan Tenure</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.id}>
                      {scenario.result 
                        ? `${Math.floor(scenario.result.amortization_schedule.length / 12)} yrs, ${scenario.result.amortization_schedule.length % 12} mos` 
                        : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'balance' && (
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
                  label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(month) => `${Math.floor(month/12)} years, ${month%12} months`}
                />
                <Legend />
                {scenarios.map(scenario => (
                  <Line
                    key={scenario.id}
                    type="monotone"
                    dataKey={scenario.name}
                    stroke={scenario.color}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="chart-container">
            <h3>Principal vs Interest</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={getInterestVsPrincipalData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => (value / 100000).toFixed(0) + 'L'}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Principal" fill="#8884d8" name="Principal" />
                <Bar dataKey="Interest" fill="#82ca9d" name="Interest" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="actions">
        <button 
          onClick={calculateAllScenarios} 
          className="calculate-button"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Recalculate All'}
        </button>
      </div>
    </div>
  );
};

export default ComparisonPage;
