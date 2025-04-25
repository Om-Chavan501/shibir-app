from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.registration import Registration, RegistrationCreate, RegistrationUpdate
from app.models.user import User
from app.utils.auth import get_current_user, get_admin_user
from app.utils.db import registrations_collection, workshops_collection, users_collection
from app.utils.email import send_registration_confirmation, send_registration_approval

router = APIRouter()

@router.post("/registrations", response_model=Registration)
async def create_registration(registration: RegistrationCreate):
    # Validate workshop exists and is open for registration
    try:
        workshop = await workshops_collection.find_one({"_id": ObjectId(registration.workshop_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid workshop ID")
    
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    if workshop["registration_deadline"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
    
    if workshop["status"] not in ["upcoming", "ongoing"]:
        raise HTTPException(status_code=400, detail="Workshop is not open for registration")
    
    if workshop["registered_count"] >= workshop["max_participants"]:
        raise HTTPException(status_code=400, detail="Workshop is already full")
    
    current_user = 0
    # If user is logged in, use their data
    if current_user:
        registration.user_id = str(current_user.id)
        
        # Check if user already registered
        existing_reg = await registrations_collection.find_one({
            "workshop_id": registration.workshop_id,
            "user_id": registration.user_id
        })
        
        if existing_reg:
            raise HTTPException(
                status_code=400,
                detail="You have already registered for this workshop"
            )
    else:
        # For guest registration, check if email already registered
        existing_reg = await registrations_collection.find_one({
            "workshop_id": registration.workshop_id,
            "email": registration.email
        })
        
        if existing_reg:
            raise HTTPException(
                status_code=400,
                detail="This email is already registered for this workshop"
            )
    
    # Create registration
    registration_dict = registration.dict()
    registration_dict["created_at"] = datetime.utcnow()
    
    # Set additional fields
    registration_dict["amount_paid"] = workshop["fee"]
    
    result = await registrations_collection.insert_one(registration_dict)
    
    # Update workshop registration count
    await workshops_collection.update_one(
        {"_id": ObjectId(registration.workshop_id)},
        {"$inc": {"registered_count": 1}}
    )
    
    # Send confirmation email
    await send_registration_confirmation(
        registration.email,
        registration.full_name,
        workshop["title"]
    )
    
    # Retrieve the registration and convert _id to string
    new_registration = await registrations_collection.find_one({"_id": result.inserted_id})
    new_registration["_id"] = str(new_registration["_id"])
    
    return new_registration

@router.get("/registrations/me", response_model=List[Registration])
async def get_my_registrations(current_user: User = Depends(get_current_user)):
    # Get all registrations for the current user
    registrations = []
    
    if current_user:
        registrations = await registrations_collection.find(
            {"user_id": str(current_user.id)}
        ).to_list(1000)
    
    for registration in registrations:
        registration["_id"] = str(registration["_id"])

    return registrations

@router.get("/registrations/{registration_id}", response_model=Registration)
async def get_registration(registration_id: str, current_user: User = Depends(get_current_user)):
    try:
        registration = await registrations_collection.find_one({"_id": ObjectId(registration_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid registration ID")
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Ensure user can only view their own registrations unless they're admin
    if current_user.role != "admin" and (
        not registration.get("user_id") or 
        str(registration.get("user_id")) != str(current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this registration")
    
    return registration

@router.put("/registrations/{registration_id}", response_model=Registration)
async def update_registration_status(
    registration_id: str, 
    update: RegistrationUpdate,
    current_user: User = Depends(get_admin_user)
):
    try:
        registration = await registrations_collection.find_one({"_id": ObjectId(registration_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid registration ID")
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Filter out None values
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update registration
    result = await registrations_collection.update_one(
        {"_id": ObjectId(registration_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Registration not updated")
    
    # Fetch updated registration
    updated_registration = await registrations_collection.find_one({"_id": ObjectId(registration_id)})
    
    # If registration status was changed to approved, send email
    if update.registration_status == "approved":
        # Get workshop details
        workshop = await workshops_collection.find_one({"_id": ObjectId(registration["workshop_id"])})
        
        if workshop:
            # Send approval email
            await send_registration_approval(
                updated_registration["email"],
                updated_registration["full_name"],
                workshop["title"],
                workshop["start_date"].strftime("%Y-%m-%d %H:%M")
            )
    
    return updated_registration

@router.delete("/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_registration(registration_id: str, current_user: User = Depends(get_current_user)):
    try:
        registration = await registrations_collection.find_one({"_id": ObjectId(registration_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid registration ID")
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Ensure user can only cancel their own registrations unless they're admin
    if current_user.role != "admin" and (
        not registration.get("user_id") or 
        str(registration.get("user_id")) != str(current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this registration")
    
    # Delete registration
    result = await registrations_collection.delete_one({"_id": ObjectId(registration_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Decrease workshop registration count
    await workshops_collection.update_one(
        {"_id": ObjectId(registration["workshop_id"])},
        {"$inc": {"registered_count": -1}}
    )