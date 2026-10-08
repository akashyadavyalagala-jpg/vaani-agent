import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, Float, Text, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Role(str, enum.Enum):
    OWNER = "owner"
    STAFF = "staff"
    VIEWER = "viewer"

class CallStatus(str, enum.Enum):
    COMPLETED = "completed"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"

class Org(Base):
    __tablename__ = "orgs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    users: Mapped[List["User"]] = relationship(back_populates="org")
    agents: Mapped[List["Agent"]] = relationship(back_populates="org")
    api_keys: Mapped[List["ApiKey"]] = relationship(back_populates="org")
    webhooks: Mapped[List["Webhook"]] = relationship(back_populates="org")

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.VIEWER)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    org: Mapped["Org"] = relationship(back_populates="users")

class ApiKey(Base):
    __tablename__ = "api_keys"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    key_hash: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    org: Mapped["Org"] = relationship(back_populates="api_keys")

class Webhook(Base):
    __tablename__ = "webhooks"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    url: Mapped[str] = mapped_column(String, nullable=False)
    events: Mapped[str] = mapped_column(String) # Comma separated
    secret: Mapped[str] = mapped_column(String)
    
    org: Mapped["Org"] = relationship(back_populates="webhooks")

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    active_version_id: Mapped[Optional[str]] = mapped_column(String, nullable=True) # ForeignKey dynamically resolved or handled via query
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    org: Mapped["Org"] = relationship(back_populates="agents")
    versions: Mapped[List["AgentVersion"]] = relationship(back_populates="agent")
    calls: Mapped[List["Call"]] = relationship(back_populates="agent")

class AgentVersion(Base):
    __tablename__ = "agent_versions"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    version_num: Mapped[int] = mapped_column(Integer)
    business_name: Mapped[str] = mapped_column(String)
    greeting: Mapped[str] = mapped_column(String)
    voice: Mapped[str] = mapped_column(String)
    pace: Mapped[float] = mapped_column(Float, default=1.0)
    system_prompt: Mapped[str] = mapped_column(Text)
    faq_data: Mapped[str] = mapped_column(Text) # JSON string
    services_data: Mapped[str] = mapped_column(Text) # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    agent: Mapped["Agent"] = relationship(back_populates="versions")

class Appointment(Base):
    __tablename__ = "appointments"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    service: Mapped[str] = mapped_column(String)
    date: Mapped[str] = mapped_column(String) # YYYY-MM-DD
    time: Mapped[str] = mapped_column(String) # HH:MM
    status: Mapped[str] = mapped_column(String, default="booked")
    idempotency_key: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Call(Base):
    __tablename__ = "calls"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"))
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    status: Mapped[CallStatus] = mapped_column(Enum(CallStatus), default=CallStatus.IN_PROGRESS)
    language_mix: Mapped[Optional[str]] = mapped_column(String) # e.g. "te:80,en:20"
    sentiment: Mapped[Optional[str]] = mapped_column(String)
    outcome: Mapped[Optional[str]] = mapped_column(String) # booked, info_given, handoff, dropped
    duration_sec: Mapped[Optional[int]] = mapped_column(Integer)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    agent: Mapped["Agent"] = relationship(back_populates="calls")
    turns: Mapped[List["Turn"]] = relationship(back_populates="call")

class Turn(Base):
    __tablename__ = "turns"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    call_id: Mapped[str] = mapped_column(ForeignKey("calls.id"))
    role: Mapped[str] = mapped_column(String) # "user", "agent", "system"
    text: Mapped[str] = mapped_column(Text)
    audio_url: Mapped[Optional[str]] = mapped_column(String) # S3 or local path
    latency_vad_ms: Mapped[Optional[int]] = mapped_column(Integer)
    latency_llm_ms: Mapped[Optional[int]] = mapped_column(Integer)
    latency_tts_ms: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    call: Mapped["Call"] = relationship(back_populates="turns")

class ToolCall(Base):
    __tablename__ = "tool_calls"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    turn_id: Mapped[str] = mapped_column(ForeignKey("turns.id"))
    tool_name: Mapped[str] = mapped_column(String)
    arguments: Mapped[str] = mapped_column(Text) # JSON string
    result: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
