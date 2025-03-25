from fastapi import APIRouter, HTTPException
import app.db.db_utils as db
from app.models.user import User
import yaml

router = APIRouter()


@router.get("/")
async def begin():
    return {"msg": "hi"}

@router.post("/add_user", response_model=User)
async def add_new_user(user_data: User):
    try:
        existing_user = await db.find_user_email(user_data.email)
        if existing_user:
            return existing_user
        user = await db.add_user(user_data.dict())
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding user: {e}")
    
@router.get("/get_user")
async def find_user_email(email: str):
    try:
        user = await db.find_user_email(email)
        if user:
            return {"exists": True, "user":user}
        return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error finding user: {e}")

@router.post("/{user_id}/state_tax")
async def yaml_parse():
    
    return