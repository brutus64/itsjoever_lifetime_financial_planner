from fastapi import APIRouter, HTTPException
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.models.user import User
from app.api.utils.yaml_helper import *
from app.api.utils.scenario_helper import *
from app.db.db_utils import *
from beanie import PydanticObjectId, Link, WriteRules
from bson import DBRef
from beanie.odm.operators.update.array import AddToSet, Pull
from typing import Set
from fastapi import Depends
from beanie import WriteRules
from bson import DBRef
router = APIRouter()



'''------------------------SCENARIO CREATE/DELETE ROUTES------------------------'''
#TESTED WITH NO USER YET
@router.post("/new")
async def new_scenario(user: dict):
    try:
        user_obj = await User.get(user.get("user"))
        scenario_obj = Scenario(user=user_obj)
        await scenario_obj.save()
        print("saved id", scenario_obj.id)
        user_obj.scenarios.append(scenario_obj)
        await user_obj.save()
        # print(user)
        id = PydanticObjectId(scenario_obj.id)
        return {"message":"ok","id":str(id)}
    except Exception as e:
        print(f"Error in new_scenario: {e}")  # Actually print the exception
        raise HTTPException(status_code=400, detail="Error at new scenario creation")

#TESTED WITH NO USER YET
@router.delete("/delete/{scenario_id}")
async def delete_scenario(scenario_id: str):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        scenario = await Scenario.get(scenario_obj_id)
        if not scenario:
            raise HTTPException(status_code=400, detail=f"/delete/scenario_id, scenario does not exist")
        await scenario.delete()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Deleting scenario failed, {e}")


@router.get("/all/{scenario_id}")
async def fetch_scenario(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
                Scenario.id == scenario_id,
                fetch_links=True
            )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        print("FOUND THE SCENARIO",scenario)
        return {"scenario": scenario.model_dump(exclude={
                    "user": {"scenarios"}},mode="json")}
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
'''----------------------------MAIN DATA ROUTES--------------------------------'''
    
@router.get("/main/{scenario_id}")
async def fetch_main(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
            Scenario.id == scenario_id,
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return {"scenario": scenario.model_dump(include={'id','name','marital','birth_year','life_expectancy','inflation_assume','limit_posttax','fin_goal','state'},mode="json")}
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")

@router.put("/main/{scenario_id}")
async def update_main(scenario_id: str, scenario: dict):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        print(scenario)

        update_data = {
            "name": scenario.get('name', existing_scenario.name),
            "marital": scenario.get('marital', existing_scenario.marital),
            "birth_year": [int(year) if year else None for year in scenario.get('birth_year')],
            "life_expectancy": parse_life_expectancy(scenario.get('life_expectancy', [])),
            "inflation_assume": Inflation(**parse_inflation(scenario.get('inflation_assume', {}))),
            "fin_goal": float(scenario.get('fin_goal')) if scenario.get('fin_goal') else None,
            "state": scenario.get('state', existing_scenario.state)
        }
        print(update_data)

        # Update the scenario
        await existing_scenario.update({"$set": update_data})

        return {"message": "Scenario updated successfully"}
    except Exception as e:
        print(f"Error in update_main: {e}")
        raise HTTPException(status_code=400, detail="Error updating main")

'''----------------------------INVESTMENT TYPE ROUTES--------------------------------'''
# fetch all investment types and investments associated with a scenario
@router.get("/investments/{scenario_id}")
async def fetch_investments(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
            Scenario.id == scenario_id,
            fetch_links=True
        )
        print("Hello")
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return {"scenario": scenario.model_dump(include={'investment_types','investment'},mode="json")}
    except ValueError as e: #occurs if pydantic conversion fails
        print(e)
        raise HTTPException(status_code=400, detail="Invalid scenario ID format")

@router.post("/investment_type/{scenario_id}")
async def create_invest_type(scenario_id: str, investment_type: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="POST investment_type, scenario does not exist")
        invest_type = InvestmentType(**investment_type)
        await invest_type.insert()
        db_ref = DBRef(collection="investment_types", id=invest_type.id)
        scenario.investment_types.append(Link(ref = db_ref,document_class=InvestmentType))
        await scenario.save(link_rule=WriteRules.WRITE)
        updated_scenario = await Scenario.get(scenario.id, fetch_links=True)
        return updated_scenario.model_dump(include={'investment_types'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error posting investment type, {e}")
    

@router.put("/investment_type/{scenario_id}/{invest_type_id}") #requires investment id
async def update_invest_type(scenario_id: str, invest_type_id: str, investment: dict):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        invest_obj_id = PydanticObjectId(invest_type_id)
        existing_investment_type = await InvestmentType.get(invest_obj_id)
        if not existing_investment_type:
            raise HTTPException(status_code=404, detail="Investment not found")
        
        invest_type_obj = InvestmentType(**investment)
        await existing_investment_type.update({"$set":invest_type_obj})

        updated_scenario = await Scenario.get(scenario_obj_id, fetch_links=True)
        return updated_scenario.model_dump(include={'investment_types','investment'}, mode="json")
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=f"Error updating investment type, {e}")
        
@router.delete("/investment_type/{scenario_id}/{invest_type_id}")
async def delete_invest_type(scenario_id: str, invest_type_id: str):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        invest_type_obj_id = PydanticObjectId(invest_type_id)
        
        # get the scenario
        scenario = await Scenario.get(scenario_obj_id)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        # delete the investment type
        await InvestmentType.get(invest_type_obj_id).delete()
        
        # potentially does not work
        await scenario.update({"$pull": {"investment_types":{"$ref": "investment_types", "$id": invest_type_obj_id}}})
        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting investment type, {e}")

'''---------------------------INVESTMENT ROUTES-------------------------------------'''
@router.post("/investment/{scenario_id}")
async def create_invest(scenario_id: str, investment: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail= "POST create investment, scenario does not exist")
        investment = Investment(**investment)
        await investment.insert()
        db_ref = DBRef(collection="investments", id=investment.id)
        scenario.investment.append(Link(ref = db_ref,document_class=Investment))
        await scenario.save(link_rule=WriteRules.WRITE)
        updated_scenario = await Scenario.get(scenario.id, fetch_links=True)
        return updated_scenario.model_dump(include={'investment'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Create investment error, {e}")

@router.put("/investment/{scenario_id}/{investment_id}") #requires investment id
async def update_invest(scenario_id: str, investment: dict, investment_id: str):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        invest_obj_id = PydanticObjectId(investment_id)
        existing_investment = await Investment.get(invest_obj_id)
        if not existing_investment:
            raise HTTPException(status_code=404, detail="Investment not found")
        
        invest_obj = Investment(**investment)
        await existing_investment.update({"$set":invest_obj})

        updated_scenario = await Scenario.get(scenario_obj_id, fetch_links=True)
        return updated_scenario.model_dump(include={'investment'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update investment error, {e}")
    
@router.delete("/investment/{scenario_id}/{investment_id}")
async def delete_invest(scenario_id: str, investment_id: str):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        investment_obj_id = PydanticObjectId(investment_id)
        
        # get the scenario
        scenario = await Scenario.get(scenario_obj_id)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        # delete the investment type
        await Investment.get(investment_obj_id).delete()
        
        # potentially does not work
        await scenario.update({"$pull": {"investments":{"$ref": "investments", "$id": investment_obj_id}}})
        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting investment type, {e}")

'''-------------------------------EVENT SERIES ROUTES--------------------------------'''
@router.get("/event_series/{scenario_id}")
async def get_event_series(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        scenario = await Scenario.get(scenario_id, fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=400, detail="get Eventseries scenario does not exist")
        return scenario.model_dump(include={'event_series'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"get Eventseries does not work: {e}")

@router.post("/event_series/{scenario_id}")
async def create_event_series(scenario_id: str, event_data: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="POST event series scenario does not exist")
        print("EVENT_DATA", event_data)
        event = parse_events(event_data)
        print("EVENT", event)
        event_series = EventSeries(**event)
        await event_series.insert()
        print("After insert", event_series)
        db_ref = DBRef(collection="event_series", id=event_series.id)
        scenario.event_series.append(Link(ref = db_ref,document_class=EventSeries))
        await scenario.save(link_rule=WriteRules.WRITE)
        updated_scenario = await Scenario.get(scenario.id, fetch_links=True)
        return updated_scenario.model_dump(include={'event_series'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Create event series error, {e}")

@router.put("/event_series/{scenario_id}/{event_series_id}") #requires event series id
async def update_event_series(scenario_id: str, event_series_id: str, event_data: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="PUT event series scenario does not exist")
        event_series = await EventSeries.get(PydanticObjectId(event_series_id))
        #NOT SURE IF THIS WORKS
        print("attemp to parse")
        #works with keeping it as a dictionary it does validation and conversion between types for us in set
        new_event_series = parse_events(event_data)
        print(new_event_series)
        print("Parse success?")
        await event_series.update({"$set":new_event_series})
        print("updated")
        updated_scenario = await Scenario.get(PydanticObjectId(scenario_id), fetch_links=True)
        return updated_scenario.model_dump(include={'event_series'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update event series error, {e}")

@router.delete("/event_series/{scenario_id}/{event_series_id}")
async def delete_event_series(scenario_id: str, event_series_id: str):
    try:
        scen_id = PydanticObjectId(scenario_id)
        event_id = PydanticObjectId(event_series_id)
        scenario = await Scenario.get(scen_id)
        if not scenario:
            raise HTTPException(status_code=400, detail="DELETE event series scenario does not exist")
        event_series = await EventSeries.get(event_id)
        print(event_series)
        delete_res = await event_series.delete()
        print("DELETE", delete_res)
        dbref = DBRef(collection="event_series", id=event_id)
        
        res = await Scenario.find_one(Scenario.id == scen_id).update(
            Pull({
                    "event_series": dbref,
                    "spending_strat": dbref,
                })
        )
        print(res)
        # # Update the scenario with the filtered list
        # scenario.event_series = filtered_events
        # await scenario.save()

        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete event series error {e}")

'''-------------------------------STRATEGIES ROUTES--------------------------------'''

@router.get("/rmdroth/{scenario_id}")
async def fetch_rmd_roth(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
            Scenario.id == scenario_id,
            fetch_links=True
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return scenario.model_dump(include={'investment','rmd_strat','roth_conversion_strat','roth_optimizer'},mode="json")
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")

@router.put("/rmd/{scenario_id}")
async def update_rmd(scenario_id: str, rmd_strat):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        print(rmd_strat) # should be an array of ids

        update_data = {
            "rmd_strat": rmd_strat.strategy
        }

        # Update the scenario
        await existing_scenario.update({"$set": update_data})

        return {"message": "Scenario updated successfully"} # will be sent using save button, no send back
    except Exception as e:
        print(f"Error in update_rmd: {e}")
        raise HTTPException(status_code=400, detail="Error updating rmd")

@router.put("/roth/{scenario_id}")
async def update_roth(scenario_id: str, roth_data):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        print(roth_data)

        # Update the scenario
        await existing_scenario.update({"$set": roth_data})

        return {"message": "Scenario updated successfully"} # will be sent using save button, no send back
    except Exception as e:
        print(f"Error in update_roth: {e}")
        raise HTTPException(status_code=400, detail="Error updating roth")
