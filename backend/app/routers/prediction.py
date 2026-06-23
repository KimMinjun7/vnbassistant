from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PredictionInputs(BaseModel):
    product: str = "암보험"
    age: float = 40
    gender: str = "M"
    channel: str = "GA"
    amount: float = 5000


class PredictionResult(BaseModel):
    vnb: float
    margin: float
    ape: float


PRODUCT_BASE_VNB = {
    "암보험": 180,
    "종신보험": 95,
    "연금보험": 62,
}

CHANNEL_FACTOR = {
    "GA": 1.08,
    "방카": 0.94,
    "TM": 1.00,
    "대면": 1.04,
}


@router.post("", response_model=PredictionResult)
def predict_vnb(inputs: PredictionInputs):
    base = PRODUCT_BASE_VNB.get(inputs.product, 100)
    age_factor = 1 + (40 - inputs.age) * 0.004
    channel_factor = CHANNEL_FACTOR.get(inputs.channel, 1.0)
    amount_factor = inputs.amount / 5000

    vnb = round(base * age_factor * channel_factor * amount_factor)
    margin = round((vnb / (inputs.amount * 0.15)) * 100 * 10) / 10
    ape = round(inputs.amount * 0.12)

    return PredictionResult(vnb=vnb, margin=margin, ape=ape)
