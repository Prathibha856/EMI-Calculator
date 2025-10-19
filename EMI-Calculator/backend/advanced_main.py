from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date, datetime
from enum import Enum
import math

app = FastAPI(title="Advanced EMI Calculator API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class PrepaymentType(str, Enum):
    NONE = "none"
    ONETIME = "onetime"
    YEARLY = "yearly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class PrepaymentStrategy(str, Enum):
    REDUCE_EMI = "reduce_emi"
    REDUCE_TENURE = "reduce_tenure"

class TaxRegime(str, Enum):
    OLD = "old"
    NEW = "new"

class CalculationMethod(str, Enum):
    REDUCING_BALANCE = "reducing_balance"
    FLAT_RATE = "flat_rate"

# Request Models
class AdvancedEMIRequest(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_years: int
    tenure_months: int = 0
    prepayment_amount: float = 0
    prepayment_frequency: PrepaymentType = PrepaymentType.NONE
    prepayment_start_month: int = 1
    prepayment_strategy: PrepaymentStrategy = PrepaymentStrategy.REDUCE_TENURE
    calculation_method: CalculationMethod = CalculationMethod.REDUCING_BALANCE
    step_up_emi_percent: float = 0
    step_up_frequency: int = 12  # months
    processing_fee: float = 0
    processing_fee_percent: float = 0
    prepayment_penalty_percent: float = 0

class StepUpEMIRequest(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_years: int
    initial_emi: float
    step_up_amount: float = 0
    step_up_percent: float = 0
    step_up_frequency: int = 12  # months

class RentVsBuyRequest(BaseModel):
    property_price: float
    down_payment: float
    loan_amount: float
    annual_interest_rate: float
    tenure_years: int
    monthly_rent: float
    rent_increase_percent: float = 5
    property_appreciation_percent: float = 5
    maintenance_cost_percent: float = 1

class RefinanceRequest(BaseModel):
    current_principal: float
    current_interest_rate: float
    current_remaining_months: int
    new_interest_rate: float
    new_tenure_years: int
    processing_fee: float
    prepayment_penalty_percent: float = 0

class TaxBenefitRequest(BaseModel):
    principal_paid: float
    interest_paid: float
    property_value: float
    is_first_home: bool = False
    tax_regime: TaxRegime = TaxRegime.OLD
    annual_income: float

class FloatingRateRequest(BaseModel):
    principal: float
    initial_interest_rate: float
    tenure_years: int
    rate_changes: List[Dict[str, float]]  # [{"month": 12, "new_rate": 8.5}]

# Response Models
class AmortizationEntry(BaseModel):
    month: int
    emi: float
    principal: float
    interest: float
    prepayment: float
    total_payment: float
    remaining_balance: float
    cumulative_interest: float
    cumulative_principal: float

class AdvancedEMIResponse(BaseModel):
    emi: float
    total_interest: float
    total_payment: float
    actual_tenure_months: int
    processing_fee: float
    total_cost: float
    amortization_schedule: List[AmortizationEntry]
    yearly_summary: List[Dict]
    savings_vs_standard: Optional[Dict] = None

class TaxBenefitResponse(BaseModel):
    principal_deduction_80c: float
    interest_deduction_24: float
    first_home_deduction_80eea: float
    total_deduction: float
    tax_saved: float
    effective_interest_rate: float

class RentVsBuyResponse(BaseModel):
    total_rent_paid: float
    total_emi_paid: float
    property_value_after_years: float
    net_cost_buying: float
    net_cost_renting: float
    recommendation: str
    break_even_year: int

class RefinanceResponse(BaseModel):
    current_emi: float
    new_emi: float
    monthly_savings: float
    total_interest_current: float
    total_interest_new: float
    interest_savings: float
    processing_fee: float
    prepayment_penalty: float
    total_cost_of_refinance: float
    break_even_months: int
    net_savings: float
    recommendation: str

# Helper Functions
def calculate_emi(principal: float, monthly_rate: float, months: int) -> float:
    """Calculate EMI using reducing balance method (standard formula)"""
    if monthly_rate > 0:
        return principal * monthly_rate * ((1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)
    return principal / months

def calculate_flat_rate_emi(principal: float, annual_rate: float, months: int) -> tuple:
    """
    Calculate EMI using flat rate method
    Returns: (emi, total_interest, monthly_principal, monthly_interest)
    """
    # Total interest = Principal × Rate × Time
    total_interest = principal * (annual_rate / 100) * (months / 12)
    total_amount = principal + total_interest
    emi = total_amount / months
    monthly_principal = principal / months
    monthly_interest = total_interest / months
    
    return emi, total_interest, monthly_principal, monthly_interest

def calculate_tax_rate(income: float) -> float:
    """Calculate tax rate based on income (simplified Indian tax slabs)"""
    if income <= 250000:
        return 0
    elif income <= 500000:
        return 5
    elif income <= 750000:
        return 10
    elif income <= 1000000:
        return 15
    elif income <= 1250000:
        return 20
    elif income <= 1500000:
        return 25
    else:
        return 30

# API Endpoints
@app.post("/api/calculate", response_model=AdvancedEMIResponse)
@app.post("/api/calculate/advanced", response_model=AdvancedEMIResponse)
async def calculate_advanced_emi(request: AdvancedEMIRequest):
    """Advanced EMI calculation with prepayment options, step-up EMI, and detailed analysis"""
    try:
        principal = request.principal
        monthly_rate = (request.annual_interest_rate / 100) / 12
        total_months = (request.tenure_years * 12) + request.tenure_months
        
        # Calculate processing fee
        processing_fee = request.processing_fee
        if request.processing_fee_percent > 0:
            processing_fee += (principal * request.processing_fee_percent / 100)
        
        # Calculate initial EMI based on method
        if request.calculation_method == CalculationMethod.FLAT_RATE:
            # Flat rate calculation
            base_emi, total_interest_flat, monthly_principal_flat, monthly_interest_flat = calculate_flat_rate_emi(
                principal, request.annual_interest_rate, total_months
            )
            current_emi = base_emi
        else:
            # Reducing balance (default)
            base_emi = calculate_emi(principal, monthly_rate, total_months)
            current_emi = base_emi
        
        # Generate amortization schedule
        schedule = []
        remaining_principal = principal
        total_interest = 0
        cumulative_interest = 0
        cumulative_principal = 0
        month = 1
        
        while remaining_principal > 0.01 and month <= total_months * 2:  # Safety limit
            # Apply step-up EMI (only for reducing balance)
            if request.calculation_method == CalculationMethod.REDUCING_BALANCE:
                if request.step_up_emi_percent > 0 and month > 1 and (month - 1) % request.step_up_frequency == 0:
                    current_emi = current_emi * (1 + request.step_up_emi_percent / 100)
            
            # Calculate interest and principal for this month
            if request.calculation_method == CalculationMethod.FLAT_RATE:
                # Flat rate: fixed interest per month
                interest_payment = monthly_interest_flat
                principal_payment = min(monthly_principal_flat, remaining_principal)
            else:
                # Reducing balance: interest on remaining principal
                interest_payment = remaining_principal * monthly_rate
                principal_payment = min(current_emi - interest_payment, remaining_principal)
            
            # Handle prepayments
            prepayment = 0
            if request.prepayment_amount > 0 and month >= request.prepayment_start_month:
                if request.prepayment_frequency == PrepaymentType.ONETIME and month == request.prepayment_start_month:
                    prepayment = min(request.prepayment_amount, remaining_principal - principal_payment)
                elif request.prepayment_frequency == PrepaymentType.YEARLY and (month - request.prepayment_start_month) % 12 == 0:
                    prepayment = min(request.prepayment_amount, remaining_principal - principal_payment)
                elif request.prepayment_frequency == PrepaymentType.MONTHLY and month >= request.prepayment_start_month:
                    prepayment = min(request.prepayment_amount, remaining_principal - principal_payment)
                elif request.prepayment_frequency == PrepaymentType.QUARTERLY and (month - request.prepayment_start_month) % 3 == 0:
                    prepayment = min(request.prepayment_amount, remaining_principal - principal_payment)
            
            # Apply prepayment penalty
            if prepayment > 0 and request.prepayment_penalty_percent > 0:
                penalty = prepayment * request.prepayment_penalty_percent / 100
                prepayment -= penalty
            
            # Update remaining principal
            total_principal_payment = principal_payment + prepayment
            remaining_principal -= total_principal_payment
            
            # Handle strategy for prepayment
            if prepayment > 0 and request.prepayment_strategy == PrepaymentStrategy.REDUCE_EMI and remaining_principal > 0:
                remaining_months = total_months - month
                if remaining_months > 0:
                    current_emi = calculate_emi(remaining_principal, monthly_rate, remaining_months)
            
            total_interest += interest_payment
            cumulative_interest += interest_payment
            cumulative_principal += total_principal_payment
            
            schedule.append(AmortizationEntry(
                month=month,
                emi=round(current_emi, 2),
                principal=round(principal_payment, 2),
                interest=round(interest_payment, 2),
                prepayment=round(prepayment, 2),
                total_payment=round(current_emi + prepayment, 2),
                remaining_balance=round(max(0, remaining_principal), 2),
                cumulative_interest=round(cumulative_interest, 2),
                cumulative_principal=round(cumulative_principal, 2)
            ))
            
            month += 1
            
            if remaining_principal <= 0:
                break
        
        # Calculate yearly summary
        yearly_summary = []
        for year in range(1, (len(schedule) // 12) + 2):
            year_data = [s for s in schedule if (s.month - 1) // 12 + 1 == year]
            if year_data:
                yearly_summary.append({
                    'year': year,
                    'principal_paid': round(sum(s.principal + s.prepayment for s in year_data), 2),
                    'interest_paid': round(sum(s.interest for s in year_data), 2),
                    'total_paid': round(sum(s.total_payment for s in year_data), 2),
                    'remaining_balance': round(year_data[-1].remaining_balance, 2)
                })
        
        # Calculate savings vs standard EMI
        standard_total_interest = (base_emi * total_months) - principal
        savings = {
            'interest_saved': round(standard_total_interest - total_interest, 2),
            'months_saved': total_months - len(schedule),
            'total_saved': round((base_emi * total_months) - (total_interest + principal), 2)
        }
        
        return AdvancedEMIResponse(
            emi=round(base_emi, 2),
            total_interest=round(total_interest, 2),
            total_payment=round(principal + total_interest, 2),
            actual_tenure_months=len(schedule),
            processing_fee=round(processing_fee, 2),
            total_cost=round(principal + total_interest + processing_fee, 2),
            amortization_schedule=schedule,
            yearly_summary=yearly_summary,
            savings_vs_standard=savings
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculate/stepup", response_model=AdvancedEMIResponse)
async def calculate_step_up_emi(request: StepUpEMIRequest):
    """Calculate EMI with step-up feature"""
    try:
        principal = request.principal
        monthly_rate = (request.annual_interest_rate / 100) / 12
        total_months = request.tenure_years * 12
        
        current_emi = request.initial_emi
        schedule = []
        remaining_principal = principal
        total_interest = 0
        cumulative_interest = 0
        cumulative_principal = 0
        month = 1
        
        while remaining_principal > 0.01 and month <= total_months * 2:
            interest_payment = remaining_principal * monthly_rate
            
            # Apply step-up
            if month > 1 and (month - 1) % request.step_up_frequency == 0:
                if request.step_up_amount > 0:
                    current_emi += request.step_up_amount
                elif request.step_up_percent > 0:
                    current_emi = current_emi * (1 + request.step_up_percent / 100)
            
            principal_payment = min(current_emi - interest_payment, remaining_principal)
            remaining_principal -= principal_payment
            
            total_interest += interest_payment
            cumulative_interest += interest_payment
            cumulative_principal += principal_payment
            
            schedule.append(AmortizationEntry(
                month=month,
                emi=round(current_emi, 2),
                principal=round(principal_payment, 2),
                interest=round(interest_payment, 2),
                prepayment=0,
                total_payment=round(current_emi, 2),
                remaining_balance=round(max(0, remaining_principal), 2),
                cumulative_interest=round(cumulative_interest, 2),
                cumulative_principal=round(cumulative_principal, 2)
            ))
            
            month += 1
            
            if remaining_principal <= 0:
                break
        
        yearly_summary = []
        for year in range(1, (len(schedule) // 12) + 2):
            year_data = [s for s in schedule if (s.month - 1) // 12 + 1 == year]
            if year_data:
                yearly_summary.append({
                    'year': year,
                    'principal_paid': round(sum(s.principal for s in year_data), 2),
                    'interest_paid': round(sum(s.interest for s in year_data), 2),
                    'total_paid': round(sum(s.total_payment for s in year_data), 2),
                    'remaining_balance': round(year_data[-1].remaining_balance, 2)
                })
        
        return AdvancedEMIResponse(
            emi=round(request.initial_emi, 2),
            total_interest=round(total_interest, 2),
            total_payment=round(principal + total_interest, 2),
            actual_tenure_months=len(schedule),
            processing_fee=0,
            total_cost=round(principal + total_interest, 2),
            amortization_schedule=schedule,
            yearly_summary=yearly_summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculate/tax-benefit", response_model=TaxBenefitResponse)
async def calculate_tax_benefit(request: TaxBenefitRequest):
    """Calculate tax benefits on home loan"""
    try:
        # Section 80C - Principal repayment (max 1.5 lakh)
        principal_deduction = min(request.principal_paid, 150000)
        
        # Section 24 - Interest deduction (max 2 lakh)
        interest_deduction = min(request.interest_paid, 200000)
        
        # Section 80EEA - Additional interest deduction for first home (max 1.5 lakh)
        first_home_deduction = 0
        if request.is_first_home and request.property_value <= 4500000:
            first_home_deduction = min(request.interest_paid - 200000, 150000) if request.interest_paid > 200000 else 0
        
        # Total deduction
        if request.tax_regime == TaxRegime.NEW:
            # New tax regime doesn't allow these deductions
            total_deduction = 0
            principal_deduction = 0
            interest_deduction = 0
            first_home_deduction = 0
        else:
            total_deduction = principal_deduction + interest_deduction + first_home_deduction
        
        # Calculate tax saved
        tax_rate = calculate_tax_rate(request.annual_income)
        tax_saved = total_deduction * (tax_rate / 100)
        
        # Calculate effective interest rate
        effective_interest = request.interest_paid - tax_saved
        effective_rate = (effective_interest / request.principal_paid * 100) if request.principal_paid > 0 else 0
        
        return TaxBenefitResponse(
            principal_deduction_80c=round(principal_deduction, 2),
            interest_deduction_24=round(interest_deduction, 2),
            first_home_deduction_80eea=round(first_home_deduction, 2),
            total_deduction=round(total_deduction, 2),
            tax_saved=round(tax_saved, 2),
            effective_interest_rate=round(effective_rate, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculate/rent-vs-buy", response_model=RentVsBuyResponse)
async def calculate_rent_vs_buy(request: RentVsBuyRequest):
    """Compare renting vs buying a property"""
    try:
        # Calculate EMI
        monthly_rate = (request.annual_interest_rate / 100) / 12
        total_months = request.tenure_years * 12
        emi = calculate_emi(request.loan_amount, monthly_rate, total_months)
        
        # Calculate totals
        total_emi_paid = emi * total_months
        total_rent_paid = 0
        current_rent = request.monthly_rent
        
        for year in range(request.tenure_years):
            total_rent_paid += current_rent * 12
            current_rent = current_rent * (1 + request.rent_increase_percent / 100)
        
        # Property value after years
        property_value_after = request.property_price * ((1 + request.property_appreciation_percent / 100) ** request.tenure_years)
        
        # Maintenance costs
        maintenance_cost = request.property_price * (request.maintenance_cost_percent / 100) * request.tenure_years
        
        # Net costs
        net_cost_buying = request.down_payment + total_emi_paid + maintenance_cost - property_value_after
        net_cost_renting = total_rent_paid
        
        # Find break-even year
        break_even_year = request.tenure_years
        for year in range(1, request.tenure_years + 1):
            rent_cost = sum(request.monthly_rent * ((1 + request.rent_increase_percent / 100) ** y) * 12 for y in range(year))
            buy_cost = request.down_payment + (emi * 12 * year) + (request.property_price * request.maintenance_cost_percent / 100 * year)
            property_val = request.property_price * ((1 + request.property_appreciation_percent / 100) ** year)
            
            if (buy_cost - property_val) < rent_cost:
                break_even_year = year
                break
        
        recommendation = "Buy" if net_cost_buying < net_cost_renting else "Rent"
        
        return RentVsBuyResponse(
            total_rent_paid=round(total_rent_paid, 2),
            total_emi_paid=round(total_emi_paid, 2),
            property_value_after_years=round(property_value_after, 2),
            net_cost_buying=round(net_cost_buying, 2),
            net_cost_renting=round(net_cost_renting, 2),
            recommendation=recommendation,
            break_even_year=break_even_year
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculate/refinance", response_model=RefinanceResponse)
async def calculate_refinance(request: RefinanceRequest):
    """Calculate refinancing benefits"""
    try:
        # Current loan details
        current_monthly_rate = (request.current_interest_rate / 100) / 12
        current_emi = calculate_emi(request.current_principal, current_monthly_rate, request.current_remaining_months)
        current_total_interest = (current_emi * request.current_remaining_months) - request.current_principal
        
        # New loan details
        new_monthly_rate = (request.new_interest_rate / 100) / 12
        new_total_months = request.new_tenure_years * 12
        new_emi = calculate_emi(request.current_principal, new_monthly_rate, new_total_months)
        new_total_interest = (new_emi * new_total_months) - request.current_principal
        
        # Calculate costs
        prepayment_penalty = request.current_principal * (request.prepayment_penalty_percent / 100)
        total_cost_of_refinance = request.processing_fee + prepayment_penalty
        
        # Calculate savings
        monthly_savings = current_emi - new_emi
        interest_savings = current_total_interest - new_total_interest
        net_savings = interest_savings - total_cost_of_refinance
        
        # Break-even calculation
        break_even_months = int(total_cost_of_refinance / monthly_savings) if monthly_savings > 0 else 999
        
        recommendation = "Refinance" if net_savings > 0 and break_even_months < new_total_months else "Don't Refinance"
        
        return RefinanceResponse(
            current_emi=round(current_emi, 2),
            new_emi=round(new_emi, 2),
            monthly_savings=round(monthly_savings, 2),
            total_interest_current=round(current_total_interest, 2),
            total_interest_new=round(new_total_interest, 2),
            interest_savings=round(interest_savings, 2),
            processing_fee=round(request.processing_fee, 2),
            prepayment_penalty=round(prepayment_penalty, 2),
            total_cost_of_refinance=round(total_cost_of_refinance, 2),
            break_even_months=break_even_months,
            net_savings=round(net_savings, 2),
            recommendation=recommendation
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculate/floating-rate")
async def calculate_floating_rate(request: FloatingRateRequest):
    """Calculate EMI with floating interest rates"""
    try:
        principal = request.principal
        total_months = request.tenure_years * 12
        current_rate = request.initial_interest_rate
        
        schedule = []
        remaining_principal = principal
        total_interest = 0
        
        for month in range(1, total_months + 1):
            # Check for rate changes
            for change in request.rate_changes:
                if change['month'] == month:
                    current_rate = change['new_rate']
            
            monthly_rate = (current_rate / 100) / 12
            
            # Recalculate EMI with new rate
            remaining_months = total_months - month + 1
            emi = calculate_emi(remaining_principal, monthly_rate, remaining_months)
            
            interest_payment = remaining_principal * monthly_rate
            principal_payment = min(emi - interest_payment, remaining_principal)
            remaining_principal -= principal_payment
            total_interest += interest_payment
            
            schedule.append({
                'month': month,
                'interest_rate': round(current_rate, 2),
                'emi': round(emi, 2),
                'principal': round(principal_payment, 2),
                'interest': round(interest_payment, 2),
                'remaining_balance': round(max(0, remaining_principal), 2)
            })
            
            if remaining_principal <= 0:
                break
        
        return {
            'total_interest': round(total_interest, 2),
            'total_payment': round(principal + total_interest, 2),
            'amortization_schedule': schedule
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "Advanced EMI Calculator API",
        "version": "2.0",
        "endpoints": [
            "/api/calculate/advanced",
            "/api/calculate/stepup",
            "/api/calculate/tax-benefit",
            "/api/calculate/rent-vs-buy",
            "/api/calculate/refinance",
            "/api/calculate/floating-rate"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
