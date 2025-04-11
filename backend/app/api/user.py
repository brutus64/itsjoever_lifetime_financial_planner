from fastapi import APIRouter, HTTPException, Request
import app.db.db_utils as db
from app.models.user import User
from app.models.scenario import Scenario
from beanie import PydanticObjectId
import yaml
import uuid
from bson import DBRef

router = APIRouter()



@router.post("/login")
async def login(request: Request, user_data: User):
    try:
        user = await User.find_one(User.email == user_data.email)
        if not user:
            user = await db.add_user(user_data.models_dump())
        print("user obj:", user)
        session_id = str(uuid.uuid4())
        request.session['user_id'] = str(user.id)
        request.session['session_id'] = str(session_id)
        #requires checking if we need ot add new user or get user, then add a session to it.
        return {
            "message": "Successful login",
            "user": {
                "id": str(user.id),
                "name": str(user.name),
                "email": user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="/api/login error")
    
@router.post("/add_user", response_model=User)
async def add_new_user(user_data: User):
    try:
        print(user_data)
        existing_user = await db.find_user_email(user_data.email)
        if existing_user:
            return existing_user
        user = await db.add_user(user_data.model_dump())
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

@router.delete("/{user_id}/{scenario_id}")
async def delete_user_scenario(user_id: str, scenario_id: str):
    try:
        user_obj_id = PydanticObjectId(user_id)
        scenario_obj_id = PydanticObjectId(scenario_id)
        user = await User.get(user_obj_id, fetch_links=True)
        if not user:
            raise HTTPException(status_code=404, detail="User does not exist")
        scenario = await Scenario.find_one(
            Scenario.id == scenario_obj_id,
            Scenario.user.id == user_obj_id  # Match linked user reference
        )
        print("USER", user)
        print("SCENARIO", scenario)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        await scenario.delete()
        user = await User.get(user_obj_id)
        if user:
            user.scenarios = [
                link for link in user.scenarios 
                if link.ref.id != scenario_obj_id
            ]
            await user.save()
        return {"message": f"Scenario {scenario_id} deleted."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")



@router.get("/{user_id}/scenarios")
async def fetch_user_scenarios(user_id: str):
    try:
        user_obj_id = PydanticObjectId(user_id)
        # print("USER", user_obj_id)
        user = await User.get(user_obj_id, fetch_links=True)
        # print("PRINT", user)
        if not user:
            raise HTTPException(status_code=404, detail="User does not exist")
        
        for scenario in user.scenarios:
            await scenario.fetch_all_links()
        scenarios = [scenario.model_dump(exclude={
                    "user": {"scenarios"}},mode="json")  #scenario's user field ignores user's scenario so no circular dependency
                    #mode='json' means format to json or try to at least, if its DBRef shown it will error I think
                for scenario in user.scenarios] 
        #need to avaoid user since it does a circular link_grab between user and scenario
        # print("WOW", scenarios)
        return {"scenario": scenarios}
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
@router.post("/share/{scenario_id}")
async def share_scenario(request: Request, scenario_id: str, perm: str):
    pass

   
@router.post("/{user_id}/state_tax")
async def yaml_parse():
    
    return