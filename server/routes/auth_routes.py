from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import get_db
from models.user import User
from utils.auth import (
    get_password_hash,
    create_access_token,
    authenticate_user,
    get_current_user,
)

router = APIRouter(prefix="/api", tags=["Authentication"])

@router.post("/register")
async def register(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(None),
    db: Session = Depends(get_db),
) -> Any:
    """Register a new user"""
    # Check if username exists
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check if email exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "status": "success",
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    """Login user"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Get current user profile"""
    return {
        "status": "success",
        "user": current_user.to_dict(),
    }

@router.put("/me")
async def update_profile(
    full_name: str = Body(None),
    email: str = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update user profile"""
    if full_name:
        current_user.full_name = full_name
    if email:
        current_user.email = email
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "status": "success",
        "message": "Profile updated",
        "user": current_user.to_dict(),
    }