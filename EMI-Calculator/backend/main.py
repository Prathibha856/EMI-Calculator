from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import math

app = FastAPI(title="EMI Calculator API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EMICalculationRequest(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_years: int
    tenure_months: int = 0
    prepayment_amount: float = 0
    prepayment_frequency: str = "none"  # 'none', 'yearly', 'onetime'

class EMICalculationResponse(BaseModel):
    emi: float
    total_interest: float
    total_payment: float
    amortization_schedule: List[dict]

@app.post("/api/calculate", response_model=EMICalculationResponse)
async def calculate_emi(request: EMICalculationRequest):
    try:
        principal = request.principal
        monthly_rate = (request.annual_interest_rate / 100) / 12
        total_months = (request.tenure_years * 12) + request.tenure_months
        
        # Calculate EMI
        if monthly_rate > 0:
            emi = principal * monthly_rate * ((1 + monthly_rate) ** total_months) / ((1 + monthly_rate) ** total_months - 1)
        else:
            emi = principal / total_months
        
        # Generate amortization schedule
        schedule = []
        remaining_principal = principal
        total_interest = 0
        
        for month in range(1, total_months + 1):
            interest_payment = remaining_principal * monthly_rate
            principal_payment = emi - interest_payment
            
            # Handle prepayments
            prepayment = 0
            if request.prepayment_frequency == 'yearly' and month % 12 == 0:
                prepayment = request.prepayment_amount
            elif request.prepayment_frequency == 'onetime' and month == 1:
                prepayment = request.prepayment_amount
            
            principal_payment += prepayment
            remaining_principal -= principal_payment
            
            # Avoid negative remaining principal due to large prepayments
            if remaining_principal < 0:
                principal_payment += remaining_principal
                remaining_principal = 0
            
            total_interest += interest_payment
            
            schedule.append({
                'month': month,
                'principal': round(principal_payment, 2),
                'interest': round(interest_payment, 2),
                'total_payment': round(principal_payment + interest_payment, 2),
                'remaining_balance': round(max(0, remaining_principal), 2)
            })
            
            if remaining_principal <= 0:
                break
        
        return {
            'emi': round(emi, 2),
            'total_interest': round(total_interest, 2),
            'total_payment': round(principal + total_interest, 2),
            'amortization_schedule': schedule
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
