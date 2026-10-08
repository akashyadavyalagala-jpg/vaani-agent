from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class ToneDial(str, Enum):
    FORMAL = "formal"   # Uses "మీరు" (Mīru), polite register
    WARM = "warm"       # More friendly, standard spoken

class BusinessService(BaseModel):
    name: str
    duration_minutes: int
    description: Optional[str] = None

class WorkingHours(BaseModel):
    open_time: str # "HH:MM"
    close_time: str # "HH:MM"
    days_open: List[str] # ["Monday", "Tuesday", ...]

class BusinessConfig(BaseModel):
    name: str = "Vaani Default Clinic"
    type: str = "clinic"
    working_hours: WorkingHours = WorkingHours(
        open_time="09:00", 
        close_time="17:00", 
        days_open=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    )
    services: List[BusinessService] = [
        BusinessService(name="General Consultation", duration_minutes=30),
        BusinessService(name="Follow-up", duration_minutes=15)
    ]
    faqs: Dict[str, str] = {
        "Where are you located?": "మేము హైదరాబాద్ లోని బంజారాహిల్స్ లో ఉన్నాము.",
        "Do you accept insurance?": "అవునండి, మేము ప్రధాన ఇన్సూరెన్స్ కంపెనీలను ఆమోదిస్తాము."
    }
    languages: List[str] = ["Telugu", "English"]
    greeting: str = "నమస్కారం! వాణి క్లినిక్ కి స్వాగతం. నేను మీకు ఎలా సహాయపడగలను?"
    voice: str = "kavitha_te_conversation"
    pace: float = 1.0
    tone_dial: ToneDial = ToneDial.FORMAL
    handoff_phone_number: str = "+919876543210"
    forbidden_topics: List[str] = ["medical diagnosis", "prescribing medicines", "politics"]
