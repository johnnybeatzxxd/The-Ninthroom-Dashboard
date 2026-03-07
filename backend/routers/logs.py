from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models import DailyConvoLog, DailySubLog, Event, ModelEntity, Refill, Setting
from schemas import (
    DailyConvoLogCreate, DailyConvoLogResponse,
    DailySubLogCreate, DailySubLogResponse,
    EventCreate, EventResponse,
    StatsResponse, ConvoBalanceStat, PlatformStat
)

router = APIRouter(prefix="/models/{model_id}", tags=["logs", "analytics"])

# --- CONVO LOGS ---
@router.get("/logs", response_model=List[DailyConvoLogResponse])
async def get_convo_logs(model_id: str):
    return list(DailyConvoLog.select().where(DailyConvoLog.model_id == model_id))

@router.post("/logs", response_model=DailyConvoLogResponse)
async def create_convo_log(model_id: str, log_in: DailyConvoLogCreate):
    # Check if model exists
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")
        
    # Create or update log for the date
    log, created = DailyConvoLog.get_or_create(
        model_id=model_id,
        date=log_in.date,
        defaults=log_in.model_dump()
    )
    if not created:
        for key, value in log_in.model_dump(exclude_unset=True).items():
            setattr(log, key, value)
        log.save()
    return log

# --- SUB LOGS ---
@router.get("/subs", response_model=List[DailySubLogResponse])
async def get_sub_logs(model_id: str):
    return list(DailySubLog.select().where(DailySubLog.model_id == model_id))

@router.post("/subs", response_model=DailySubLogResponse)
async def create_sub_log(model_id: str, sub_in: DailySubLogCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")
        
    # Create or update sub log for the date
    sub, created = DailySubLog.get_or_create(
        model_id=model_id,
        date=sub_in.date,
        defaults=sub_in.model_dump()
    )
    if not created:
        for key, value in sub_in.model_dump(exclude_unset=True).items():
            setattr(sub, key, value)
        sub.save()
    return sub

# --- TIMELINE EVENTS ---
@router.get("/timeline", response_model=List[EventResponse])
async def get_timeline(model_id: str):
    return list(Event.select().where(Event.model_id == model_id).order_by(Event.date.desc()))

@router.post("/timeline", response_model=EventResponse)
async def create_timeline_event(model_id: str, event_in: EventCreate):
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")
        
    data = event_in.model_dump()
    if data.get('date') is None:
        data['date'] = datetime.utcnow()
        
    event = Event.create(model_id=model_id, **data)
    return event

# DELETE is usually on the resource itself, but API might expect it under models if nested
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
    # This replaces `getOverviewStats` from frontend api.js
    if not ModelEntity.select().where(ModelEntity.id == model_id).exists():
        raise HTTPException(status_code=404, detail="Model not found")

    convo_logs = list(DailyConvoLog.select().where(DailyConvoLog.model_id == model_id))
    refills = list(Refill.select().where(Refill.model_id == model_id))
    
    today_date = datetime.utcnow().date()
    
    # Calculate Totals
    tw_total_refilled = sum(r.amount for r in refills if r.platform == 'tw')
    ig_total_refilled = sum(r.amount for r in refills if r.platform == 'ig')
    
    tw_total_spent = sum(l.tw_spent for l in convo_logs)
    ig_total_spent = sum(l.ig_spent for l in convo_logs)
    
    tw_remaining = tw_total_refilled - tw_total_spent
    ig_remaining = ig_total_refilled - ig_total_spent
    
    # Today's spent
    today_logs = [l for l in convo_logs if l.date == today_date]
    tw_spent_today = sum(l.tw_spent for l in today_logs)
    ig_spent_today = sum(l.ig_spent for l in today_logs)
    
    # Average Per Day
    unique_days_logged = len(set(l.date for l in convo_logs))
    days_divisor = max(unique_days_logged, 1)
    
    tw_avg_per_day = tw_total_spent / days_divisor
    ig_avg_per_day = ig_total_spent / days_divisor
    
    # Conversion Rate calculation (Optional: extend this logic if needed based on subs)
    # Using simple 0.0 for now as in the original frontend mock, or you can join DailySubLog
    # if you want real conversion rate calculation based on previous logic.
    tw_conv_rate = 0.0
    ig_conv_rate = 0.0

    return StatsResponse(
        convoBalance=ConvoBalanceStat(
            tw=max(0, tw_remaining),
            ig=max(0, ig_remaining),
            total=max(0, tw_remaining) + max(0, ig_remaining)
        ),
        twStats=PlatformStat(
            spentToday=tw_spent_today,
            remaining=tw_remaining,
            avgPerDay=tw_avg_per_day,
            convRate=tw_conv_rate
        ),
        igStats=PlatformStat(
            spentToday=ig_spent_today,
            remaining=ig_remaining,
            avgPerDay=ig_avg_per_day,
            convRate=ig_conv_rate
        )
    )
