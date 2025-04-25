from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import List, Dict
from datetime import datetime
import random
import string
from app.models.user import UserCreate, User, Token, LoginCredentials
from app.utils.auth import (
    authenticate_user, create_access_token, get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, verify_password
)
from app.utils.db import users_collection, parse_mongo_doc, serialize_id
from app.utils.email import send_password_reset, send_otp_email
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Store OTPs with expiry time (in-memory storage - in production use Redis)
otp_store = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

@router.post("/auth/register", response_model=User)
async def register_user(user: UserCreate):
    # Check if user already exists
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create new user
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()  # Set the current UTC datetime
    
    new_user = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    
    # Convert ObjectId to string before returning
    if created_user:
        created_user["_id"] = str(created_user["_id"])
    
    return created_user

@router.post("/auth/login", response_model=Token)
async def login(credentials: LoginCredentials):
    user = await authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/auth/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest):
    # Check if user exists
    user = await users_collection.find_one({"email": request.email})
    if not user:
        # Don't reveal that the email doesn't exist for security reasons
        return {"message": "If your email is registered, you will receive a password reset OTP"}
    
    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP with expiry (30 minutes)
    expiry_time = datetime.utcnow() + timedelta(minutes=30)
    otp_store[request.email] = {"otp": otp, "expiry": expiry_time}
    
    # Send OTP email
    await send_otp_email(request.email, user["full_name"], otp)
    
    return {"message": "Password reset OTP has been sent to your email"}

@router.post("/auth/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest):
    # Check if OTP exists and is valid
    if request.email not in otp_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please request a new one."
        )
    
    otp_data = otp_store[request.email]
    if otp_data["expiry"] < datetime.utcnow():
        # Remove expired OTP
        del otp_store[request.email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    if otp_data["otp"] != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # OTP is valid, update password
    hashed_password = get_password_hash(request.new_password)
    result = await users_collection.update_one(
        {"email": request.email},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password update failed"
        )
    
    # Clear OTP
    del otp_store[request.email]
    
    return {"message": "Password has been reset successfully"}

@router.post("/auth/change-password", status_code=status.HTTP_200_OK)
async def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user)):
    # Get current user with password
    user = await users_collection.find_one({"_id": serialize_id(current_user.id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify old password
    if not verify_password(request.old_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    # Update password
    hashed_password = get_password_hash(request.new_password)
    result = await users_collection.update_one(
        {"_id": serialize_id(current_user.id)},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password update failed"
        )
    
    return {"message": "Password updated successfully"}