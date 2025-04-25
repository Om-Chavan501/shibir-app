from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.workshop import Workshop, WorkshopCreate, WorkshopUpdate
from app.models.user import User
from app.utils.auth import get_current_user, get_admin_user
from app.utils.db import workshops_collection, registrations_collection, serialize_id, parse_mongo_doc, serialize_list

router = APIRouter()

@router.get("/workshops", response_model=List[Workshop])
async def get_workshops(
    skip: int = 0, 
    limit: int = 20,
    status: Optional[str] = None,
    grade: Optional[int] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None
):
    # Build query filters
    query = {}
    if status:
        query["status"] = status
    if grade:
        query["eligible_grades"] = grade
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    # Get workshops
    cursor = workshops_collection.find(query).sort("start_date", 1).skip(skip).limit(limit)
    workshops = await serialize_list(cursor)
    return workshops

@router.get("/workshops/{workshop_id}", response_model=Workshop)
async def get_workshop(workshop_id: str):
    obj_id = serialize_id(workshop_id)
    if not obj_id:
        raise HTTPException(status_code=404, detail="Invalid workshop ID")
    
    workshop = await workshops_collection.find_one({"_id": obj_id})
    
    if workshop is None:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    return parse_mongo_doc(workshop)

@router.post("/workshops", response_model=Workshop)
async def create_workshop(workshop: WorkshopCreate, current_user: User = Depends(get_admin_user)):
    workshop_dict = workshop.model_dump()
    workshop_dict["created_at"] = datetime.utcnow()
    workshop_dict["registered_count"] = 0
    
    result = await workshops_collection.insert_one(workshop_dict)
    created_workshop = await workshops_collection.find_one({"_id": result.inserted_id})
    
    return parse_mongo_doc(created_workshop)

@router.put("/workshops/{workshop_id}", response_model=Workshop)
async def update_workshop(workshop_id: str, workshop_update: WorkshopUpdate, current_user: User = Depends(get_admin_user)):
    obj_id = serialize_id(workshop_id)
    if not obj_id:
        raise HTTPException(status_code=404, detail="Invalid workshop ID")
    
    # Filter out None values
    update_data = {k: v for k, v in workshop_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update workshop
    result = await workshops_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Workshop not found or no changes made"
        )
    
    # Get updated workshop
    updated_workshop = await workshops_collection.find_one({"_id": obj_id})
    return parse_mongo_doc(updated_workshop)

@router.delete("/workshops/{workshop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workshop(workshop_id: str, current_user: User = Depends(get_admin_user)):
    obj_id = serialize_id(workshop_id)
    if not obj_id:
        raise HTTPException(status_code=404, detail="Invalid workshop ID")
    
    # Check if workshop exists
    workshop = await workshops_collection.find_one({"_id": obj_id})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Check if there are any registrations
    registrations = await registrations_collection.count_documents({"workshop_id": workshop_id})
    if registrations > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete workshop with active registrations ({registrations} found)"
        )
    
    # Delete workshop
    result = await workshops_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workshop not found")