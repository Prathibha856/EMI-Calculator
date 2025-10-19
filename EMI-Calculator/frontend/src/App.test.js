import { render, screen } from '@testing-library/react';
import App from './App';

test('renders EMI Calculator navigation', () => {
  render(<App />);
  const logoElement = screen.getByText(/EMI Calculator Pro/i);
  expect(logoElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  const standardLink = screen.getByText(/Standard/i);
  const prepaymentLink = screen.getByText(/Prepayment/i);
  const compareLink = screen.getByText(/Compare/i);
  
  expect(standardLink).toBeInTheDocument();
  expect(prepaymentLink).toBeInTheDocument();
  expect(compareLink).toBeInTheDocument();
});

test('renders footer', () => {
  render(<App />);
  const footerText = screen.getByText(/© 2025 EMI Calculator Pro/i);
  expect(footerText).toBeInTheDocument();
});
