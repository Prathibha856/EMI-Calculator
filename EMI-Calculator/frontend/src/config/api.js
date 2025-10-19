// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.NODE_ENV === 'production' 
                     ? '/api' 
                     : 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  CALCULATE_ADVANCED: `${API_BASE_URL}/calculate/advanced`,
  CALCULATE_STEPUP: `${API_BASE_URL}/calculate/stepup`,
  CALCULATE_TAX_BENEFIT: `${API_BASE_URL}/calculate/tax-benefit`,
  CALCULATE_RENT_VS_BUY: `${API_BASE_URL}/calculate/rent-vs-buy`,
  CALCULATE_REFINANCE: `${API_BASE_URL}/calculate/refinance`,
  CALCULATE_FLOATING_RATE: `${API_BASE_URL}/calculate/floating-rate`,
};

export default API_BASE_URL;
