from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from vaani.database import get_session
from vaani.models import Call, Turn, Appointment, Agent, AgentVersion, Org, CallStatus

router = APIRouter()

# Dependency to mock auth and get org_id
async def get_current_org_id(session: AsyncSession = Depends(get_session)):
    query = select(Org).where(Org.name == "Demo Clinic")
    result = await session.execute(query)
    org = result.scalar_one_or_none()
    if org:
        return org.id
    return "62a49410-8632-4fb6-995c-fbe009c3313c" # Fallback

@router.post("/sessions/new")
async def create_session(
    org_id: str = Depends(get_current_org_id),
    session: AsyncSession = Depends(get_session)
):
    # Find the agent for this org
    query = select(Agent).where(Agent.org_id == org_id)
    result = await session.execute(query)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=500, detail="No agent configured for org")
        
    call_id = str(uuid.uuid4())
    call = Call(
        id=call_id,
        org_id=org_id,
        agent_id=agent.id,
        status=CallStatus.IN_PROGRESS,
    )
    session.add(call)
    await session.commit()
    
    return {"session_id": call_id}

@router.get("/analytics/overview")
async def get_overview(
    days: int = 7,
    org_id: str = Depends(get_current_org_id),
    session: AsyncSession = Depends(get_session)
):
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Total Calls
    total_calls_q = await session.execute(
        select(func.count(Call.id)).where(Call.org_id == org_id, Call.started_at >= since_date)
    )
    total_calls = total_calls_q.scalar_one()
    
    # Bookings
    bookings_q = await session.execute(
        select(func.count(Appointment.id)).where(Appointment.org_id == org_id, Appointment.created_at >= since_date)
    )
    bookings = bookings_q.scalar_one()
    
    # Completion Rate
    completed_calls_q = await session.execute(
        select(func.count(Call.id)).where(Call.org_id == org_id, Call.status == CallStatus.COMPLETED, Call.started_at >= since_date)
    )
    completed_calls = completed_calls_q.scalar_one()
    completion_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0
    
    # Daily trend (mocked structure)
    import random
    daily_trend = []
    for i in range(days):
        d = datetime.utcnow() - timedelta(days=i)
        c = random.randint(15, 45)
        b = random.randint(3, max(3, c // 3))
        daily_trend.append({"date": d.strftime("%Y-%m-%d"), "calls": c, "bookings": b})
        
    return {
        "metrics": {
            "total_calls": total_calls,
            "bookings": bookings,
            "completion_rate": round(completion_rate, 1),
            "average_latency_ms": 1200 # mocked
        },
        "daily_trend": daily_trend[::-1]
    }

@router.get("/calls")
async def list_calls(
    cursor: Optional[str] = None,
    limit: int = 50,
    org_id: str = Depends(get_current_org_id),
    session: AsyncSession = Depends(get_session)
):
    query = select(Call).where(Call.org_id == org_id).order_by(desc(Call.started_at)).limit(limit)
    if cursor:
        query = query.where(Call.started_at < datetime.fromisoformat(cursor))
        
    result = await session.execute(query)
    calls = result.scalars().all()
    
    next_cursor = calls[-1].started_at.isoformat() if calls else None
    
    return {
        "data": [
            {
                "id": c.id,
                "status": c.status.value,
                "language": c.language_mix,
                "outcome": c.outcome,
                "sentiment": c.sentiment,
                "duration_sec": c.duration_sec,
                "started_at": c.started_at.isoformat()
            } for c in calls
        ],
        "next_cursor": next_cursor
    }

@router.get("/calls/{call_id}")
async def get_call(
    call_id: str,
    org_id: str = Depends(get_current_org_id),
    session: AsyncSession = Depends(get_session)
):
    # Fetch Call
    call_q = await session.execute(select(Call).where(Call.id == call_id, Call.org_id == org_id))
    call = call_q.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
        
    # Fetch Turns
    turns_q = await session.execute(select(Turn).where(Turn.call_id == call_id).order_by(Turn.created_at))
    turns = turns_q.scalars().all()
    
    return {
        "id": call.id,
        "status": call.status.value,
        "outcome": call.outcome,
        "sentiment": call.sentiment,
        "duration_sec": call.duration_sec,
        "started_at": call.started_at.isoformat(),
        "turns": [
            {
                "id": t.id,
                "role": t.role,
                "text": t.text,
                "latency_vad_ms": t.latency_vad_ms,
                "latency_llm_ms": t.latency_llm_ms,
                "latency_tts_ms": t.latency_tts_ms,
                "created_at": t.created_at.isoformat()
            } for t in turns
        ]
    }
