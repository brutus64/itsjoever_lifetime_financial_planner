from fastapi import APIRouter, HTTPException
import app.db.db_utils as db
from app.models.user import User
from app.models.scenario import Scenario
from beanie import PydanticObjectId
import yaml

router = APIRouter()



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

#NOT TESTED
@router.delete("/{user_id}/{scenario_name}")
async def delete_user_scenario(user_id: str, scenario_name: str):
    try:
        user_obj_id = PydanticObjectId(user_id)
        user = await User.get(user_obj_id, fetch_links=True)
        if not user:
            raise HTTPException(status_code=404, detail="User does not exist")
        scenario = await Scenario.find_one(
            Scenario.user.id == user_obj_id,
            Scenario.name == scenario_name
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        await scenario.delete()
        user = await User.get(user_obj_id)
        if user:
            user.scenarios = [s for s in user.scenarios if s.id != scenario.id]
            await user.save()
        return {"message": f"Scenario {scenario_name} deleted."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

#NOT TESTED
@router.get("/scenarios/{user_id}/{scenario_name}")
async def fetch_user_scenario(user_id:str, scenario_name: str):
    try:
        user_obj_id = PydanticObjectId(user_id)
        scenario = await Scenario.find_one(
                Scenario.user.id == user_obj_id,
                Scenario.name == scenario_name,
                fetch_links=True
            )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return {"scenario": scenario.model_dump()}
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")

#NOT TESTED
@router.get("/scenarios/{user_id}")
async def fetch_user_scenarios(user_id: str):
    user_obj_id = PydanticObjectId(user_id)
    user = await User.get(user_obj_id, fetch_links=True)
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    return {"scenarios": [scenario.model_dump() for scenario in user.scenarios]} #returns just the user's scenarios in dictionary form

@router.post("/{user_id}/state_tax")
async def yaml_parse():
    
    return