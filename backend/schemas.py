from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional, List

class ModelCreate(BaseModel):
    name: str
    color: Optional[str] = "#00C4FF"
    status: Optional[str] = "active"

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None

class ModelResponse(ModelCreate):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DailyConvoLogCreate(BaseModel):
    date: date
    tw_spent: Optional[int] = 0
    ig_spent: Optional[int] = 0
    tw_remaining: Optional[int] = 0
    ig_remaining: Optional[int] = 0
    note: Optional[str] = None

class DailyConvoLogResponse(DailyConvoLogCreate):
    id: str
    model_id: str
    model_config = ConfigDict(from_attributes=True)

class DailySubLogCreate(BaseModel):
    date: date
    tw_subs: Optional[int] = 0
    ig_subs: Optional[int] = 0
    total: Optional[int] = 0

class DailySubLogResponse(DailySubLogCreate):
    id: str
    model_id: str
    model_config = ConfigDict(from_attributes=True)

class RefillCreate(BaseModel):
    date: Optional[datetime] = None
    platform: str # 'tw' or 'ig'
    amount: Optional[int] = 0
    cost: Optional[float] = 0.0

class RefillResponse(RefillCreate):
    id: str
    model_id: str
    date: datetime
    model_config = ConfigDict(from_attributes=True)

class EventCreate(BaseModel):
    date: Optional[datetime] = None
    category: str
    text: str

class EventResponse(EventCreate):
    id: str
    model_id: str
    date: datetime
    model_config = ConfigDict(from_attributes=True)

class GoalCreateUpdate(BaseModel):
    target_subs: Optional[int] = 0
    tw_target: Optional[int] = 0
    ig_target: Optional[int] = 0

class GoalResponse(GoalCreateUpdate):
    model_id: str
    model_config = ConfigDict(from_attributes=True)

class SettingCreateUpdate(BaseModel):
    tw_accounts: Optional[int] = 0
    ig_accounts: Optional[int] = 0
    cost_tw: Optional[float] = 0.0
    cost_ig: Optional[float] = 0.0

class SettingResponse(SettingCreateUpdate):
    model_id: str
    model_config = ConfigDict(from_attributes=True)

# Dashboard Summary Stats Response
class ConvoBalanceStat(BaseModel):
    tw: int
    ig: int
    total: int

class PlatformStat(BaseModel):
    spentToday: int
    remaining: int
    avgPerDay: float
    convRate: float

class StatsResponse(BaseModel):
    convoBalance: ConvoBalanceStat
    twStats: PlatformStat
    igStats: PlatformStat
