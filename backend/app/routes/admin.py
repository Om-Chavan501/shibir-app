from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from bson import ObjectId
from datetime import datetime, timedelta

from app.models.user import User, UserUpdate
from app.models.registration import Registration
from app.utils.auth import get_admin_user
from app.utils.db import (
    workshops_collection, 
    registrations_collection, 
    users_collection,
    testimonials_collection
)

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def admin_dashboard(current_user: User = Depends(get_admin_user)):
    """
    Get admin dashboard statistics
    """
    # Count totals
    total_workshops = await workshops_collection.count_documents({})
    total_users = await users_collection.count_documents({})
    total_registrations = await registrations_collection.count_documents({})
    
    # Count upcoming workshops
    upcoming_workshops = await workshops_collection.count_documents({
        "start_date": {"$gt": datetime.utcnow()}
    })
    
    # Count pending registrations
    pending_registrations = await registrations_collection.count_documents({
        "registration_status": "pending"
    })
    
    # Get registration counts for last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_registrations = []
    
    for i in range(7):
        date = seven_days_ago + timedelta(days=i)
        next_date = date + timedelta(days=1)
        count = await registrations_collection.count_documents({
            "created_at": {
                "$gte": date,
                "$lt": next_date
            }
        })
        daily_registrations.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "total_workshops": total_workshops,
        "total_users": total_users,
        "total_registrations": total_registrations,
        "upcoming_workshops": upcoming_workshops,
        "pending_registrations": pending_registrations,
        "daily_registrations": daily_registrations
    }

@router.get("/users", response_model=List[User])
async def admin_get_users(current_user: User = Depends(get_admin_user)):
    """
    Get all users for admin management
    """
    users = await users_collection.find().to_list(1000)

    for user in users:
        user["_id"]=str(user["_id"])

    return users

@router.put("/users/{user_id}", response_model=User)
async def admin_update_user(user_id: str, user_update: UserUpdate, current_user: User = Depends(get_admin_user)):
    """
    Update user details as admin
    """
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=404, detail="Invalid user ID")
    
    # Check if user exists
    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if admin is trying to update their own user
    if str(user["_id"]) == str(current_user.id):
        raise HTTPException(status_code=403, detail="Admin cannot update their own user details")
    

    # Filter out None values
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update user
    result = await users_collection.update_one(
        {"_id": user_obj_id},
        {"$set": update_data}
    )
    
    # if result.modified_count == 0:
    if not result:
        raise HTTPException(status_code=400, detail="User update failed")
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": user_obj_id})

    updated_user["_id"] = str(updated_user["_id"])

    return updated_user

@router.get("/registrations", response_model=List[Registration])
async def admin_get_registrations(current_user: User = Depends(get_admin_user)):
    """
    Get all registrations for admin management
    """
    registrations = await registrations_collection.find().to_list(1000)
    for registration in registrations:
        registration["_id"]=str(registration["_id"])
    return registrations

@router.post("/export/registrations/{workshop_id}")
async def export_workshop_registrations(workshop_id: str, current_user: User = Depends(get_admin_user)):
    """
    Export workshop registrations as CSV
    """
    try:
        workshop = await workshops_collection.find_one({"_id": ObjectId(workshop_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid workshop ID")
    
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Get all registrations for this workshop
    registrations = await registrations_collection.find(
        {"workshop_id": workshop_id}
    ).to_list(1000)
    
    if not registrations:
        raise HTTPException(status_code=404, detail="No registrations found for this workshop")
    
    # Create CSV content
    csv_header = "Full Name,Email,Grade,School,Phone,Parent Name,Parent Phone,Status,Payment Status,Registration Date\n"
    csv_rows = []
    
    for reg in registrations:
        created_at = reg.get("created_at", datetime.utcnow()).strftime("%Y-%m-%d")
        row = f"\"{reg['full_name']}\",\"{reg['email']}\",{reg['grade']},\"{reg['school']}\",\"{reg['phone']}\",\"{reg['parent_name']}\",\"{reg['parent_phone']}\",{reg['registration_status']},{reg['payment_status']},{created_at}"
        csv_rows.append(row)
    
    csv_content = csv_header + "\n".join(csv_rows)
    
    return {
        "filename": f"workshop_{workshop_id}_registrations.csv",
        "content": csv_content,
        "workshop_title": workshop["title"]
    }