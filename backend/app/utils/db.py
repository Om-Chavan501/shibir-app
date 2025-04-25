import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
database_name = os.getenv("DATABASE_NAME")

client = AsyncIOMotorClient(mongodb_uri)
db = client[database_name]

# Collections
users_collection = db.users
workshops_collection = db.workshops
registrations_collection = db.registrations
testimonials_collection = db.testimonials

async def init_db():
    # Create indexes for performance
    await users_collection.create_index("email", unique=True)
    await workshops_collection.create_index("id", unique=True)
    await registrations_collection.create_index([("user_id", 1), ("workshop_id", 1)], unique=True, sparse=True)

# Helper functions for ObjectId conversion
def serialize_id(id_str):
    """Convert string ID to ObjectId if valid"""
    try:
        return ObjectId(id_str)
    except:
        return None

def parse_mongo_doc(doc):
    """Convert MongoDB _id to string in document"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def serialize_list(cursor):
    """Convert _id to string in a list of documents"""
    result = []
    async for doc in cursor:
        result.append(parse_mongo_doc(doc))
    return result

# Additional helper function
def convert_object_ids(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert string IDs to ObjectIds in a dictionary before inserting into MongoDB
    """
    result = {}
    for key, value in data.items():
        if key == "_id" and isinstance(value, str):
            try:
                result[key] = ObjectId(value)
            except:
                result[key] = value
        elif key.endswith("_id") and isinstance(value, str):
            try:
                result[key] = ObjectId(value)
            except:
                result[key] = value
        else:
            result[key] = value
    return result