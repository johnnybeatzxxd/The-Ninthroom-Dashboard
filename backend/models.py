import uuid
from datetime import datetime
from peewee import *
from database import db

class BaseModel(Model):
    class Meta:
        database = db

class ModelEntity(BaseModel):
    id = TextField(primary_key=True, default=lambda: str(uuid.uuid4()))
    name = CharField(max_length=255)
    color = CharField(max_length=50, default="#00C4FF")
    status = CharField(max_length=50, default="active")
    created_at = DateTimeField(default=datetime.utcnow)

    class Meta:
        table_name = "models"

class DailyConvoLog(BaseModel):
    id = TextField(primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = ForeignKeyField(ModelEntity, backref='convo_logs', on_delete='CASCADE')
    date = DateField()
    tw_spent = IntegerField(default=0)
    ig_spent = IntegerField(default=0)
    tw_remaining = IntegerField(default=0)
    ig_remaining = IntegerField(default=0)
    note = TextField(null=True)

    class Meta:
        table_name = "convo_logs"
        indexes = (
            (('model_id', 'date'), True), # Unique constraint per model per date
        )

class DailySubLog(BaseModel):
    id = TextField(primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = ForeignKeyField(ModelEntity, backref='sub_logs', on_delete='CASCADE')
    date = DateField()
    tw_subs = IntegerField(default=0)
    ig_subs = IntegerField(default=0)
    total = IntegerField(default=0)

    class Meta:
        table_name = "sub_logs"
        indexes = (
            (('model_id', 'date'), True),
        )

class Refill(BaseModel):
    id = TextField(primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = ForeignKeyField(ModelEntity, backref='refills', on_delete='CASCADE')
    date = DateTimeField(default=datetime.utcnow)
    platform = CharField(max_length=10) # 'tw' or 'ig'
    amount = IntegerField(default=0)
    cost = FloatField(default=0.0)

    class Meta:
        table_name = "refills"

class Event(BaseModel):
    id = TextField(primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = ForeignKeyField(ModelEntity, backref='events', on_delete='CASCADE')
    date = DateTimeField(default=datetime.utcnow)
    category = CharField(max_length=100)
    text = TextField()

    class Meta:
        table_name = "events"

class Goal(BaseModel):
    model_id = ForeignKeyField(ModelEntity, primary_key=True, backref='goals', on_delete='CASCADE')
    target_subs = IntegerField(default=0)
    tw_target = IntegerField(default=0)
    ig_target = IntegerField(default=0)

    class Meta:
        table_name = "goals"

class Setting(BaseModel):
    model_id = ForeignKeyField(ModelEntity, primary_key=True, backref='settings', on_delete='CASCADE')
    tw_accounts = IntegerField(default=0)
    ig_accounts = IntegerField(default=0)
    cost_tw = FloatField(default=0.0)
    cost_ig = FloatField(default=0.0)

    class Meta:
        table_name = "settings"

class GlobalSetting(BaseModel):
    key = CharField(primary_key=True, max_length=100)
    value = TextField(default="")

    class Meta:
        table_name = "global_settings"
