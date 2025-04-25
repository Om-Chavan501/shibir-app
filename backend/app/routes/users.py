from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from bson import ObjectId

from app.models.user import User, UserUpdate
from app.utils.auth import get_current_user, get_admin_user, get_password_hash
from app.utils.db import users_collection

router = APIRouter()

@router.get("/users/me", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=User)
async def update_user_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    # Filter out None values
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update user document
    result = await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User update failed"
        )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    return updated_user

@router.get("/users", response_model=List[User])
async def get_users(skip: int = 0, limit: int = 100, role: Optional[str] = None, current_user: User = Depends(get_admin_user)):
    # Only admin can get list of users
    query = {}
    if role:
        query["role"] = role
    
    users = await users_collection.find(query).skip(skip).limit(limit).to_list(limit)
    return users

@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_admin_user)):
    # Only admin can get user details
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid user ID")
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user