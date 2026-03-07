from fastapi import APIRouter
from pydantic import BaseModel
from models import GlobalSetting

router = APIRouter(prefix="/global", tags=["global"])


class PinPayload(BaseModel):
    pin: str


@router.get("/pin")
async def get_pin():
    try:
        row = GlobalSetting.get_by_id("pin")
        return {"pin": row.value}
    except GlobalSetting.DoesNotExist:
        return {"pin": "1234"}


@router.put("/pin")
async def set_pin(payload: PinPayload):
    GlobalSetting.insert(key="pin", value=payload.pin).on_conflict(
        conflict_target=[GlobalSetting.key],
        update={GlobalSetting.value: payload.pin}
    ).execute()
    return {"pin": payload.pin}
