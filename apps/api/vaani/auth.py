import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import jwt
from passlib.hash import argon2

from vaani.database import get_session
from vaani.models import User, Org, Role

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    org_id: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    query = select(User).where(User.email == req.email)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not argon2.verify(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "org_id": user.org_id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer", user_id=user.id, org_id=user.org_id)

@router.post("/guest", response_model=Token)
async def guest_login(session: AsyncSession = Depends(get_session)):
    # For guest mode we just return a token for the seeded default org/user
    # In a real app we might create an ephemeral user or restrict capabilities
    query = select(User).where(User.email == "demo@vaani.ai")
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Seed data not found"
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "org_id": user.org_id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer", user_id=user.id, org_id=user.org_id)
