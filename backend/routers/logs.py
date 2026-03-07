from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models import DailyConvoLog, DailySubLog, Event, ModelEntity, Refill
from schemas import (
    DailyConvoLogCreate, DailyConvoLogResponse,
    DailySubLogCreate, DailySubLogResponse,
    EventCreate, EventResponse,
    StatsResponse, ConvoBalanceStat, PlatformStat
)
from utils import row_to_dict, rows_to_list

router = APIRouter(prefix="/models/{model_id}", tags=["logs", "analytics"])

# --- CONVO LOGS ---
@router.get("/logs", response_model=List[DailyConvoLogResponse])
async def get_convo_logs(model_id: str):
    return rows_to_list(DailyConvoLog.select().where(DailyConvoLog.model_id == model_id))

@router.post("/logs", response_model=DailyConvoLogResponse)
async def create_convo_log(model_id: str, log_in: DailyConvoLogCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    log, created = DailyConvoLog.get_or_create(
        model_id=model_id,
        date=log_in.date,
        defaults=log_in.model_dump()
    )
    if not created:
        for key, value in log_in.model_dump(exclude_unset=True).items():
            setattr(log, key, value)
        log.save()
    return row_to_dict(log)

# --- SUB LOGS ---
@router.get("/subs", response_model=List[DailySubLogResponse])
async def get_sub_logs(model_id: str):
    return rows_to_list(DailySubLog.select().where(DailySubLog.model_id == model_id))

@router.post("/subs", response_model=DailySubLogResponse)
async def create_sub_log(model_id: str, sub_in: DailySubLogCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    sub, created = DailySubLog.get_or_create(
        model_id=model_id,
        date=sub_in.date,
        defaults=sub_in.model_dump()
    )
    if not created:
        for key, value in sub_in.model_dump(exclude_unset=True).items():
            setattr(sub, key, value)
        sub.save()
    return row_to_dict(sub)

# --- TIMELINE EVENTS ---
@router.get("/timeline", response_model=List[EventResponse])
async def get_timeline(model_id: str):
    return rows_to_list(Event.select().where(Event.model_id == model_id).order_by(Event.date.desc()))

@router.post("/timeline", response_model=EventResponse)
async def create_timeline_event(model_id: str, event_in: EventCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    data = event_in.model_dump()
    if data.get('date') is None:
        data['date'] = datetime.utcnow()

    event = Event.create(model_id=model_id, **data)
    return row_to_dict(event)

@router.delete("/timeline/{event_id}")
async def delete_timeline_event(model_id: str, event_id: str):
    try:
        event = Event.get(Event.id == event_id, Event.model_id == model_id)
        event.delete_instance()
        return {"success": True}
    except Event.DoesNotExist:
        raise HTTPException(status_code=404, detail="Event not found")

# --- ANALYTICS / STATS ---
@router.get("/stats", response_model=StatsResponse)
async def get_model_stats(model_id: str):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    convo_logs = list(DailyConvoLog.select().where(DailyConvoLog.model_id == model_id))
    refills = list(Refill.select().where(Refill.model_id == model_id))

    today_date = datetime.utcnow().date()

    tw_total_refilled = sum(r.amount for r in refills if r.platform == 'tw')
    ig_total_refilled = sum(r.amount for r in refills if r.platform == 'ig')

    tw_total_spent = sum(l.tw_spent for l in convo_logs)
    ig_total_spent = sum(l.ig_spent for l in convo_logs)

    tw_remaining = tw_total_refilled - tw_total_spent
    ig_remaining = ig_total_refilled - ig_total_spent

    today_logs = [l for l in convo_logs if l.date == today_date]
    tw_spent_today = sum(l.tw_spent for l in today_logs)
    ig_spent_today = sum(l.ig_spent for l in today_logs)

    unique_days = len(set(l.date for l in convo_logs))
    days_divisor = max(unique_days, 1)

    return StatsResponse(
        convoBalance=ConvoBalanceStat(
            tw=max(0, tw_remaining),
            ig=max(0, ig_remaining),
            total=max(0, tw_remaining) + max(0, ig_remaining)
        ),
        twStats=PlatformStat(
            spentToday=tw_spent_today,
            remaining=tw_remaining,
            avgPerDay=tw_total_spent / days_divisor,
            convRate=0.0
        ),
        igStats=PlatformStat(
            spentToday=ig_spent_today,
            remaining=ig_remaining,
            avgPerDay=ig_total_spent / days_divisor,
            convRate=0.0
        )
    )
