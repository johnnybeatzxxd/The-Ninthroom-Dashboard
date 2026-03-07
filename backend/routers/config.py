from fastapi import APIRouter, HTTPException
from models import Goal, Setting, ModelEntity
from schemas import GoalCreateUpdate, GoalResponse, SettingCreateUpdate, SettingResponse

router = APIRouter(prefix="/models/{model_id}", tags=["config"])

# --- GOALS ---
@router.get("/goals", response_model=GoalResponse)
async def get_goals(model_id: str):
    try:
        goal = Goal.get(Goal.model_id == model_id)
        return goal
    except Goal.DoesNotExist:
        # Return default zeros if no explicitly set goals
        return {"model_id": model_id, "target_subs": 0, "tw_target": 0, "ig_target": 0}

@router.put("/goals", response_model=GoalResponse)
async def update_goals(model_id: str, goal_in: GoalCreateUpdate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    goal, created = Goal.get_or_create(
        model_id=model_id,
        defaults=goal_in.model_dump()
    )
    if not created:
        for key, value in goal_in.model_dump(exclude_unset=True).items():
            setattr(goal, key, value)
        goal.save()
    return goal

# --- SETTINGS ---
@router.get("/settings", response_model=SettingResponse)
async def get_settings(model_id: str):
    try:
        setting = Setting.get(Setting.model_id == model_id)
        return setting
    except Setting.DoesNotExist:
        return {"model_id": model_id, "tw_accounts": 0, "ig_accounts": 0, "cost_tw": 0.0, "cost_ig": 0.0}

@router.put("/settings", response_model=SettingResponse)
async def update_settings(model_id: str, setting_in: SettingCreateUpdate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    setting, created = Setting.get_or_create(
        model_id=model_id,
        defaults=setting_in.model_dump()
    )
    if not created:
        for key, value in setting_in.model_dump(exclude_unset=True).items():
            setattr(setting, key, value)
        setting.save()
    return setting
