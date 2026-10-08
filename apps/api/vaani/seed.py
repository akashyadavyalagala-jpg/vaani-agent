import asyncio
import uuid
import random
from datetime import datetime, timedelta
from vaani.database import init_db, AsyncSessionLocal
from vaani.models import Org, User, Agent, AgentVersion, Call, Turn, CallStatus, Appointment, Role, ApiKey

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Create Org
        org_id = str(uuid.uuid4())
        org = Org(id=org_id, name="Demo Clinic")
        session.add(org)

        from passlib.hash import argon2
        
        # Create User
        user = User(
            id=str(uuid.uuid4()),
            org_id=org_id,
            email="demo@vaani.ai",
            password_hash=argon2.hash("demo123"),
            role=Role.OWNER
        )
        session.add(user)

        # Create ApiKey
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            org_id=org_id,
            key_hash="hashed_demo_key",
            name="Default Key"
        )
        session.add(api_key)

        # Create Agent
        agent_id = str(uuid.uuid4())
        agent = Agent(id=agent_id, org_id=org_id, name="Receptionist")
        session.add(agent)

        # Create Agent Version
        version = AgentVersion(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            version_num=1,
            business_name="Demo Clinic",
            greeting="నమస్కారం! నేను డెమో క్లినిక్ నుంచి మాట్లాడుతున్నాను.",
            voice="kavitha",
            pace=1.0,
            system_prompt="You are a helpful receptionist for a clinic...",
            faq_data="[]",
            services_data='[{"name": "Consultation", "duration": 30}]'
        )
        session.add(version)
        await session.flush()
        
        agent.active_version_id = version.id

        # Generate 30 days of realistic calls
        now = datetime.utcnow()
        for i in range(30):
            day = now - timedelta(days=i)
            # 5-15 calls per day
            num_calls = random.randint(5, 15)
            for _ in range(num_calls):
                call_id = str(uuid.uuid4())
                call_duration = random.randint(30, 300)
                call_time = day.replace(hour=random.randint(9, 17), minute=random.randint(0, 59))
                
                # Randomized outcome
                outcomes = ["booked", "info_given", "handoff", "dropped"]
                weights = [0.4, 0.4, 0.1, 0.1]
                outcome = random.choices(outcomes, weights=weights)[0]
                
                call = Call(
                    id=call_id,
                    org_id=org_id,
                    agent_id=agent_id,
                    status=CallStatus.COMPLETED,
                    language_mix="te:80,en:20",
                    sentiment=random.choice(["positive", "neutral", "negative"]),
                    outcome=outcome,
                    duration_sec=call_duration,
                    started_at=call_time,
                    completed_at=call_time + timedelta(seconds=call_duration)
                )
                session.add(call)

                # Add some turns to the call
                turn_time = call_time
                for _ in range(3):
                    t1 = Turn(
                        id=str(uuid.uuid4()),
                        call_id=call_id,
                        role="user",
                        text="నమస్కారం, నాకు అపాయింట్‌మెంట్ కావాలి.",
                        created_at=turn_time
                    )
                    turn_time += timedelta(seconds=2)
                    t2 = Turn(
                        id=str(uuid.uuid4()),
                        call_id=call_id,
                        role="agent",
                        text="నమస్కారం! తప్పకుండా, మీకు ఏ రోజు కావాలి?",
                        latency_vad_ms=400,
                        latency_llm_ms=800,
                        latency_tts_ms=300,
                        created_at=turn_time
                    )
                    turn_time += timedelta(seconds=5)
                    session.add_all([t1, t2])

                # If booked, create appointment
                if outcome == "booked":
                    appt = Appointment(
                        id=str(uuid.uuid4()),
                        org_id=org_id,
                        name=f"Patient {random.randint(100,999)}",
                        phone=f"98{random.randint(10000000,99999999)}",
                        service="Consultation",
                        date=day.strftime("%Y-%m-%d"),
                        time=f"{random.randint(9, 17):02d}:00",
                        status="booked"
                    )
                    session.add(appt)

        await session.commit()
        print(f"Database seeded successfully with Org ID: {org_id}")

if __name__ == "__main__":
    asyncio.run(seed_data())
