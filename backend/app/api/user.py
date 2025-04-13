from fastapi import APIRouter, HTTPException, Request, Body, UploadFile, File, Form
from fastapi.responses import JSONResponse
import app.db.db_utils as db
from app.models.user import User
from app.models.scenario import Scenario
from app.models.tax import *
from beanie import PydanticObjectId, Link
import uuid
from bson import DBRef
import yaml

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
        response = JSONResponse(content={
            "message": "Successful login",
            "user": {
                "id": str(user.id),
                "name": str(user.name),
                "email": user.email
            }
        })
        response.set_cookie(
            key="user_id", 
            value=str(user.id),
            httponly=True,
            samesite="none",
            secure=False,  # Set to True in production
            max_age=86400
        )
        return response
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
async def share_scenario(scenario_id: str, data: dict = Body(...)):
    user_email = data.get("user_email")
    perm = data.get("perm")
    user = await User.find_one(User.email == user_email)
    if not user:
        raise HTTPException(status_code=400, detail="Share scenario user email does not exist in this app.")
    scenario = await Scenario.get(PydanticObjectId(scenario_id))
    if not scenario:
        raise HTTPException(status_code=400, detail="Share scenario somehow has non-existent scenario_id, which should be impossible.")
    scenario_link = Link(ref=DBRef(collection="scenarios", id=PydanticObjectId(scenario_id)),document_class=Scenario)
    user_link = Link(DBRef(collection="users", id=PydanticObjectId(user.id)),document_class=User)
    if perm == "read":
        user.shared_r_scenarios.append(scenario_link)
        scenario.r_only_share.append(user_link)
    elif perm == "read_write":
        user.shared_rw_scenarios.append(scenario_link)
        scenario.wr_only_share.append(user_link)
    await user.save()
    await scenario.save()
    return {"success": True}

@router.get("/scenarios/share/{user_id}")
async def get_shared_scenarios(user_id: str):
    try:
        user_obj_id = PydanticObjectId(user_id)
        # print("USER", user_obj_id)
        user = await User.get(user_obj_id, fetch_links=True)
        # print("PRINT", user)
        if not user:
            raise HTTPException(status_code=404, detail="User does not exist")
        read_only_scenarios, read_write_scenarios = [], []
        for scenario in user.shared_r_scenarios:
            await scenario.fetch_all_link()
        for scenario in user.shared_rw_scenarios:
            await scenario.fetch_all_link()
        read_only_scenarios = [scenario.model_dump(exclude={
                    "user": {"scenarios"}},mode="json")
                for scenario in user.shared_r_scenarios]
        read_write_scenarios = [scenario.model_dump(exclude={
                    "user": {"scenarios"}},mode="json") 
                for scenario in user.shared_rw_scenarios]
        return {
            "read_only": read_only_scenarios,
            "read_write": read_write_scenarios
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in getting shared scenarios: {e}")

@router.post("/state_tax/import/{user_email}")
async def state_tax_yaml_parse(user_email: str, state: str = Form(...), file: UploadFile = File(...)):
    try:
        user = await User.find_one(User.email == user_email)
        if not user:
            raise HTTPException(status_code=400, detail="Import state tax route doesn't have a valid user.")
        if not file.filename.endswith(('.yaml', '.yml')):
            raise HTTPException(status_code=400, detail="Import state tax only accepts YAML files.")
        print("PASSED")
        content = await file.read()
        data = yaml.safe_load(content)
        single, married = [], []
        base_add = False
        # print("START READ", content)
        for arr in data.get('single'):
            print(arr)
            base = arr.get("base",0)
            if base != 0:
                base_add = True
            bracket = StateBracket(
                min_income=arr['min_income'],
                max_income=arr['max_income'],
                base=base,
                rate=arr['rate']
            )
            single.append(bracket)
        for arr in data.get('married'):
            base = arr.get("base", 0)
            if base != 0:
                base_add = True
            bracket = StateBracket(
                min_income=arr['min_income'],
                max_income=arr['max_income'],
                base=base,
                rate=arr['rate']
            )
            married.append(bracket)
        print("SINGLE", single)
        print("MARRIED", married)
        #failed here
        print(state)
        state_bracket = StateTax(
            user_id=str(user.id),
            state=state,
            year_from=2025,
            base_add=base_add,
            single_bracket=single,
            married_bracket=married
        )
        await state_bracket.save()
        print("SAVED")
        all_state_taxes = await StateTax.find_many({}).to_list()
        own_state_taxes = []
        for state_tax in all_state_taxes:
            if  state_tax.user_id in ['all', str(user.id)]:
                own_state_taxes.append(state_tax)
        return { 
            "success": True,
            "state_taxes": own_state_taxes
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import state tax failed: {e}")
    
@router.get("/state_tax/exists/{user_id}")
async def state_tax_exist(user_id: str, state: str):
    try:
        all_state_taxes = await StateTax.find_many({})
        for state_tax in all_state_taxes:
            if state_tax.state == state and state_tax.user_id in ['all',user_id]:
                return {"exists": True}
        return {"exists": False}        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"State tax grab has an error, {e}")
    
@router.get("/state_tax/get_all")
async def all_state_tax(user_email: str):
    try:
        print(user_email)
        taxes = []
        try:
            all_state_taxes = await StateTax.find_many({}).to_list()
            print(f"Retrieved state taxes: {all_state_taxes}")
        except Exception as db_error:
            print(f"Error retrieving state taxes: {db_error}")
            raise HTTPException(status_code=500, detail=f"Database error: {db_error}")
        
        user = await User.find_one(User.email == user_email)
        if not user:
            raise HTTPException(status_code=400, detail="Import state tax route doesn't have a valid user.")
        for state_tax in all_state_taxes:
            if  state_tax.user_id in ['all',str(user.id)]:
                taxes.append(state_tax)
        print("STATE TAXES RETURNED RAAAH", taxes)
        print(len(taxes))
        return {"state_tax": taxes}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting all state taxes, {e}")