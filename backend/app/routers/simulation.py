import math
import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SimulationInputs(BaseModel):
    age: float = 35
    gender: str = "male"
    amount: float = 100000
    duration: float = 12
    insurancePeriod: float = 20
    paymentPeriod: float = 20
    paymentMethod: str = "monthly"
    riskRate: float = 3.5
    expectedRate: float = 2.5
    maintenanceCost: float = 5.0


class SimulationDetail(BaseModel):
    label: str
    value: str


class SimulationResult(BaseModel):
    premium: float
    vnb: float
    details: list[SimulationDetail]


@router.post("", response_model=SimulationResult)
def simulate_premium(inputs: SimulationInputs):
    risk_rate = inputs.riskRate / 100
    expected_rate = inputs.expectedRate / 100
    maintenance_cost = inputs.maintenanceCost / 100

    age_factor = 1 + (inputs.age - 30) * 0.02
    period_factor = inputs.insurancePeriod / inputs.paymentPeriod
    risk_factor = 1 + risk_rate * 2
    random_variation = 0.95 + random.random() * 0.1

    base_premium = inputs.amount * age_factor * risk_factor * 0.08 * random_variation
    adjusted_premium = base_premium * period_factor * (1 + maintenance_cost)

    monthly_premium = round(adjusted_premium / 12 / 100) * 100
    yearly_premium = round(adjusted_premium / 100) * 100

    discount_factor = 1 / (1 + expected_rate)
    pv_factor = (1 - math.pow(discount_factor, inputs.insurancePeriod)) / expected_rate
    vnb = round(yearly_premium * pv_factor * 0.15)

    premium = monthly_premium if inputs.paymentMethod == "monthly" else yearly_premium

    return SimulationResult(
        premium=premium,
        vnb=vnb,
        details=[
            SimulationDetail(label="PV 수익률 계산식", value="PV = (CF/(1+r))-I"),
            SimulationDetail(label="CF", value="현금흐름"),
            SimulationDetail(label="r", value="할인율"),
            SimulationDetail(label="I", value="초기 투자비용"),
        ],
    )
