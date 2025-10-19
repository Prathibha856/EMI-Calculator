"""
Unit tests for EMI Calculator
Testing core calculation logic, edge cases, and validation
"""

import pytest
from fastapi.testclient import TestClient
from advanced_main import app, calculate_emi

client = TestClient(app)


class TestEMICalculations:
    """Test core EMI calculation logic"""
    
    def test_standard_emi_calculation(self):
        """Test standard EMI formula with known values"""
        principal = 1000000
        monthly_rate = (8.5 / 100) / 12
        months = 240
        
        emi = calculate_emi(principal, monthly_rate, months)
        
        # Expected EMI for 10L @ 8.5% for 20 years ≈ 8678
        assert 8670 <= emi <= 8685, f"EMI {emi} not in expected range"
    
    def test_zero_interest_rate(self):
        """Test EMI calculation with zero interest"""
        principal = 1000000
        monthly_rate = 0
        months = 240
        
        emi = calculate_emi(principal, monthly_rate, months)
        
        # With 0% interest, EMI should be principal/months
        expected = principal / months
        assert abs(emi - expected) < 1, f"EMI {emi} != {expected}"
    
    def test_very_short_tenure(self):
        """Test EMI with very short tenure (1 month)"""
        principal = 100000
        monthly_rate = (10 / 100) / 12
        months = 1
        
        emi = calculate_emi(principal, monthly_rate, months)
        
        # EMI should be approximately principal + 1 month interest
        assert emi > principal, "EMI should be greater than principal"
    
    def test_very_long_tenure(self):
        """Test EMI with very long tenure (40 years)"""
        principal = 5000000
        monthly_rate = (8.5 / 100) / 12
        months = 480
        
        emi = calculate_emi(principal, monthly_rate, months)
        
        # EMI should be reasonable for 40-year loan
        assert 30000 <= emi <= 40000, f"EMI {emi} not in expected range"


class TestAdvancedEMIEndpoint:
    """Test advanced EMI calculation API endpoint"""
    
    def test_basic_emi_calculation(self):
        """Test basic EMI calculation via API"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 1000000,
            "annual_interest_rate": 8.5,
            "tenure_years": 20,
            "prepayment_amount": 0,
            "prepayment_frequency": "none",
            "prepayment_start_month": 1,
            "prepayment_strategy": "reduce_tenure",
            "step_up_emi_percent": 0,
            "processing_fee": 0,
            "prepayment_penalty_percent": 0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "emi" in data
        assert "total_interest" in data
        assert "amortization_schedule" in data
        assert 8670 <= data["emi"] <= 8685
    
    def test_with_yearly_prepayment(self):
        """Test EMI with yearly prepayment"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 1000000,
            "annual_interest_rate": 8.5,
            "tenure_years": 20,
            "prepayment_amount": 50000,
            "prepayment_frequency": "yearly",
            "prepayment_start_month": 12,
            "prepayment_strategy": "reduce_tenure",
            "step_up_emi_percent": 0,
            "processing_fee": 0,
            "prepayment_penalty_percent": 0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # With prepayment, tenure should be less than 240 months
        assert data["actual_tenure_months"] < 240
        assert data["savings_vs_standard"]["interest_saved"] > 0
    
    def test_with_processing_fee(self):
        """Test EMI calculation with processing fee"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 1000000,
            "annual_interest_rate": 8.5,
            "tenure_years": 20,
            "prepayment_amount": 0,
            "prepayment_frequency": "none",
            "processing_fee": 10000,
            "processing_fee_percent": 0,
            "prepayment_penalty_percent": 0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["processing_fee"] == 10000
        assert data["total_cost"] > data["total_payment"]
    
    def test_invalid_principal(self):
        """Test API with invalid principal amount"""
        response = client.post("/api/calculate/advanced", json={
            "principal": -1000000,  # Negative principal
            "annual_interest_rate": 8.5,
            "tenure_years": 20
        })
        
        # Should handle gracefully (either 400 or calculate with abs value)
        assert response.status_code in [200, 400, 422]


class TestTaxBenefitCalculator:
    """Test tax benefit calculation logic"""
    
    def test_section_80c_limit(self):
        """Test Section 80C principal deduction limit"""
        response = client.post("/api/calculate/tax-benefit", json={
            "principal_paid": 200000,  # More than limit
            "interest_paid": 100000,
            "property_value": 5000000,
            "is_first_home": False,
            "tax_regime": "old",
            "annual_income": 1200000
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Section 80C limit is 1.5 lakh
        assert data["principal_deduction_80c"] == 150000
    
    def test_section_24_limit(self):
        """Test Section 24 interest deduction limit"""
        response = client.post("/api/calculate/tax-benefit", json={
            "principal_paid": 100000,
            "interest_paid": 300000,  # More than limit
            "property_value": 5000000,
            "is_first_home": False,
            "tax_regime": "old",
            "annual_income": 1200000
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Section 24 limit is 2 lakh
        assert data["interest_deduction_24"] == 200000
    
    def test_first_home_benefit(self):
        """Test Section 80EEA first home buyer benefit"""
        response = client.post("/api/calculate/tax-benefit", json={
            "principal_paid": 100000,
            "interest_paid": 250000,
            "property_value": 4000000,  # Less than 45 lakh
            "is_first_home": True,
            "tax_regime": "old",
            "annual_income": 1200000
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should get additional 80EEA benefit
        assert data["first_home_deduction_80eea"] > 0
    
    def test_new_tax_regime_no_deductions(self):
        """Test that new tax regime doesn't allow deductions"""
        response = client.post("/api/calculate/tax-benefit", json={
            "principal_paid": 150000,
            "interest_paid": 200000,
            "property_value": 5000000,
            "is_first_home": False,
            "tax_regime": "new",
            "annual_income": 1200000
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # New regime should have zero deductions
        assert data["total_deduction"] == 0
        assert data["tax_saved"] == 0


class TestRefinanceCalculator:
    """Test refinance calculation logic"""
    
    def test_refinance_with_lower_rate(self):
        """Test refinancing with lower interest rate"""
        response = client.post("/api/calculate/refinance", json={
            "current_principal": 3000000,
            "current_interest_rate": 9.5,
            "current_remaining_months": 180,
            "new_interest_rate": 8.0,
            "new_tenure_years": 15,
            "processing_fee": 10000,
            "prepayment_penalty_percent": 2
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # New EMI should be less than current EMI
        assert data["new_emi"] < data["current_emi"]
        assert data["monthly_savings"] > 0
        assert data["interest_savings"] > 0
    
    def test_refinance_not_beneficial(self):
        """Test refinancing when not beneficial"""
        response = client.post("/api/calculate/refinance", json={
            "current_principal": 1000000,
            "current_interest_rate": 8.0,
            "current_remaining_months": 60,
            "new_interest_rate": 8.5,  # Higher rate
            "new_tenure_years": 5,
            "processing_fee": 50000,  # High fee
            "prepayment_penalty_percent": 3
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should recommend not to refinance
        assert "Don't Refinance" in data["recommendation"]


class TestRentVsBuyCalculator:
    """Test rent vs buy analysis"""
    
    def test_rent_vs_buy_basic(self):
        """Test basic rent vs buy calculation"""
        response = client.post("/api/calculate/rent-vs-buy", json={
            "property_price": 5000000,
            "down_payment": 1000000,
            "loan_amount": 4000000,
            "annual_interest_rate": 8.5,
            "tenure_years": 20,
            "monthly_rent": 25000,
            "rent_increase_percent": 5,
            "property_appreciation_percent": 5,
            "maintenance_cost_percent": 1
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_rent_paid" in data
        assert "total_emi_paid" in data
        assert "recommendation" in data
        assert data["recommendation"] in ["Buy", "Rent"]
    
    def test_high_rent_scenario(self):
        """Test scenario with very high rent"""
        response = client.post("/api/calculate/rent-vs-buy", json={
            "property_price": 3000000,
            "down_payment": 500000,
            "loan_amount": 2500000,
            "annual_interest_rate": 8.5,
            "tenure_years": 15,
            "monthly_rent": 50000,  # Very high rent
            "rent_increase_percent": 8,
            "property_appreciation_percent": 6,
            "maintenance_cost_percent": 1
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # High rent should favor buying
        assert data["recommendation"] == "Buy"


class TestFloatingRateCalculator:
    """Test floating rate calculation"""
    
    def test_floating_rate_with_changes(self):
        """Test floating rate with multiple rate changes"""
        response = client.post("/api/calculate/floating-rate", json={
            "principal": 2000000,
            "initial_interest_rate": 8.5,
            "tenure_years": 20,
            "rate_changes": [
                {"month": 12, "new_rate": 8.75},
                {"month": 24, "new_rate": 9.0},
                {"month": 36, "new_rate": 8.5}
            ]
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_interest" in data
        assert "amortization_schedule" in data
        assert len(data["amortization_schedule"]) > 0
        
        # Verify rate changes are reflected
        schedule = data["amortization_schedule"]
        assert schedule[11]["interest_rate"] == 8.75
        assert schedule[23]["interest_rate"] == 9.0


class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_very_large_loan(self):
        """Test with very large loan amount"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 100000000,  # 10 crore
            "annual_interest_rate": 8.5,
            "tenure_years": 30,
            "prepayment_amount": 0,
            "prepayment_frequency": "none"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["emi"] > 0
    
    def test_very_small_loan(self):
        """Test with very small loan amount"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 10000,
            "annual_interest_rate": 8.5,
            "tenure_years": 1,
            "prepayment_amount": 0,
            "prepayment_frequency": "none"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["emi"] > 0
    
    def test_prepayment_exceeds_balance(self):
        """Test prepayment amount exceeding remaining balance"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 100000,
            "annual_interest_rate": 8.5,
            "tenure_years": 10,
            "prepayment_amount": 200000,  # More than principal
            "prepayment_frequency": "onetime",
            "prepayment_start_month": 1
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should handle gracefully - loan closes immediately
        assert data["actual_tenure_months"] <= 1


class TestAmortizationSchedule:
    """Test amortization schedule accuracy"""
    
    def test_schedule_sum_equals_loan(self):
        """Test that sum of principal payments equals loan amount"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 1000000,
            "annual_interest_rate": 8.5,
            "tenure_years": 10,
            "prepayment_amount": 0,
            "prepayment_frequency": "none"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        schedule = data["amortization_schedule"]
        total_principal = sum(entry["principal"] for entry in schedule)
        
        # Total principal should equal loan amount (within rounding)
        assert abs(total_principal - 1000000) < 10
    
    def test_final_balance_is_zero(self):
        """Test that final balance in schedule is zero"""
        response = client.post("/api/calculate/advanced", json={
            "principal": 500000,
            "annual_interest_rate": 9.0,
            "tenure_years": 5,
            "prepayment_amount": 0,
            "prepayment_frequency": "none"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        schedule = data["amortization_schedule"]
        final_balance = schedule[-1]["remaining_balance"]
        
        # Final balance should be zero (or very close)
        assert final_balance < 1


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
