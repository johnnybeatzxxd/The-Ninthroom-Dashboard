from fastapi import APIRouter, HTTPException
from typing import List
from models import ModelEntity
from schemas import ModelCreate, ModelUpdate, ModelResponse

router = APIRouter(prefix="/models", tags=["models"])

@router.get("", response_model=List[ModelResponse])
async def get_models():
    return list(ModelEntity.select())

@router.post("", response_model=ModelResponse)
async def create_model(model_in: ModelCreate):
    model = ModelEntity.create(**model_in.model_dump())
    return model

@router.patch("/{model_id}", response_model=ModelResponse)
async def update_model(model_id: str, updates: ModelUpdate):
    try:
        model = ModelEntity.get(ModelEntity.id == model_id)
        update_data = updates.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(model, key, value)
        model.save()
        return model
    except ModelEntity.DoesNotExist:
        raise HTTPException(status_code=404, detail="Model not found")

@router.delete("/{model_id}")
async def delete_model(model_id: str):
    try:
        model = ModelEntity.get(ModelEntity.id == model_id)
        model.delete_instance()
        return {"success": True}
    except ModelEntity.DoesNotExist:
        raise HTTPException(status_code=404, detail="Model not found")
