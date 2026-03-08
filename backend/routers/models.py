from fastapi import APIRouter, HTTPException
from typing import List
from models import ModelEntity
from schemas import ModelCreate, ModelUpdate, ModelResponse
from utils import row_to_dict, rows_to_list

router = APIRouter(prefix="/models", tags=["models"])

@router.get("", response_model=List[ModelResponse])
async def get_models():
    return rows_to_list(ModelEntity.select())

@router.post("", response_model=ModelResponse)
async def create_model(model_in: ModelCreate):
    model = ModelEntity.create(**model_in.model_dump())
    return row_to_dict(model)

@router.patch("/{model_id}", response_model=ModelResponse)
async def update_model(model_id: str, updates: ModelUpdate):
    try:
        model = ModelEntity.get(ModelEntity.id == model_id)
        update_data = updates.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(model, key, value)
        model.save()
        return row_to_dict(model)
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

@router.delete("/{model_id}/clear_data")
async def clear_model_data(model_id: str):
    """Deletes all child records (logs, subs, refills, timeline) for a specific model without deleting the model itself."""
    try:
        from models import DailyConvoLog, DailySubLog, Refill, Event
        # Delete child records
        DailyConvoLog.delete().where(DailyConvoLog.model_id == model_id).execute()
        DailySubLog.delete().where(DailySubLog.model_id == model_id).execute()
        Refill.delete().where(Refill.model_id == model_id).execute()
        Event.delete().where(Event.model_id == model_id).execute()
        return {"success": True, "message": "All data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
