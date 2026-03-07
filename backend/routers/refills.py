from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models import Refill, ModelEntity
from schemas import RefillCreate, RefillResponse

router = APIRouter(prefix="/models/{model_id}/refills", tags=["refills"])

@router.get("", response_model=List[RefillResponse])
async def get_refills(model_id: str):
    return list(Refill.select().where(Refill.model_id == model_id).order_by(Refill.date.desc()))

@router.post("", response_model=RefillResponse)
async def create_refill(model_id: str, refill_in: RefillCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    data = refill_in.model_dump()
    if data.get('date') is None:
        data['date'] = datetime.utcnow()
        
    refill = Refill.create(model_id=model_id, **data)
    return refill
