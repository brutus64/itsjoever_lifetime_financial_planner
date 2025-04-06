from fastapi import APIRouter, HTTPException
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.models.user import User
from app.api.utils.yaml_helper import *
from app.api.utils.scenario_helper import *
from app.db.db_utils import *
from beanie import PydanticObjectId
from beanie.odm.operators.update.array import AddToSet
from typing import Set
from fastapi import Depends
router = APIRouter()



'''------------------------SCENARIO CREATE/DELETE ROUTES------------------------'''
#TESTED WITH NO USER YET
@router.get("/init")
async def init_scenario():
    #user: User = Depends(get_current_user)
    #some way to link the user
    #get user's len of scenarios and call it "Draft ", len(scenarios)
    scenario = Scenario()
    scenario = await scenario.insert()
    return { "id": str(scenario.id) }

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

'''----------------------------INVESTMENT TYPE ROUTES--------------------------------'''

@router.post("/{scenario_id}/investment_type")
async def create_invest_type(scenario_id: str, investment_type: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="POST investment_type, scenario does not exist")
        invest_type = InvestmentType(**investment_type)
        await invest_type.insert()
        await scenario.update(AddToSet({Scenario.investment_types: invest_type}))
        updated_scenario = await Scenario.get(scenario.id)
        return {"scenario": updated_scenario.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error posting investment type, {e}")
    

@router.put("/{scenario_id}/investment_type/{invest_type_id}") #requires investment id
async def update_invest_type(scenario_id: str, invest_type_id: str, investment: dict):
    try:
        invest_type = await InvestmentType.get(PydanticObjectId(invest_type_id))
        await invest_type.update(Set(investment))
        invest_type = await InvestmentType.get(PydanticObjectId(invest_type_id))
        return {"investment_type": invest_type}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating investment type, {e}")
        
@router.delete("/{scenario_id}/investment_type/{invest_type_id}")
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
@router.post("/{scenario_id}/investment")
async def create_invest(scenario_id: str, investment: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail= "POST create investment cenario does not exist")
        investment = Investment(**investment)
        await investment.insert()
        await scenario.update(AddToSet({Scenario.investment: investment}))
        updated_scenario = await Scenario.get(scenario.id)
        return { "scenario": updated_scenario }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Create investment error, {e}")

@router.put("/{scenario_id}/investment/{investment_id}") #requires investment id
async def update_invest(scenario_id: str, investment: dict, investment_id: str):
    try:
        scenario = await Scenario.get(scenario_id)
        if not scenario:
            raise HTTPException(status_code=400, detail="UPDATE investment scenario not found")
        investments = await InvestmentType.get(PydanticObjectId(investment_id))
        #MAY BE WRONG MIGHT NEED TO PARSE IT
        await investments.update(Set(investment))
        return {"investment": investments}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update investment error, {e}")
    
@router.delete("/{scenario_id}/investment/{investment_id}")
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

@router.post("/{scenario_id}/event_series")
async def create_event_series(scenario_id: str, event_data: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="POST event series scenario does not exist")
        event = parse_events(event_data)
        event_series = EventSeries(**event)
        await event_series.insert()
        await scenario.update(AddToSet({Scenario.event_series: event_series}))
        return { "event_series": event_series }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Create event series error, {e}")

@router.put("/{scenario_id}/event_series/{event_series_id}") #requires event series id
async def update_event_series(scenario_id: str, event_series_id: str, event_data: dict):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="PUT event series scenario does not exist")
        event_series = await EventSeries.get(PydanticObjectId(event_series_id))
        #NOT SURE IF THIS WORKS
        new_event_series = EventSeries(**parse_events(event_data))
        await event_series.update(Set(new_event_series))
        return { "event_series": event_series}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update event series error, {e}")

@router.delete("/{scenario_id}/event_series/{event_series_id}")
async def delete_event_series(scenario_id: str, event_series_id: str):
    try:
        scenario = await Scenario.get(PydanticObjectId(scenario_id))
        if not scenario:
            raise HTTPException(status_code=400, detail="DELETE event series scenario does not exist")
        await EventSeries.get(PydanticObjectId(event_series_id)).delete()
        # potentially does not work
        await scenario.update({"$pull": {"event_series":{"$ref": "event_series", "$id": event_series_id}}})
        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete event series error {e}")


#NOT TESTED
#MOSt LIKELY PHASING OUT
#update existing scenario given its id
@router.put("/update_scenario/{scenario_id}")
async def update_scenario(scenario_id: str, scenario: dict):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")

        #update investment types
        new_investment_type_ids = []
        for it in scenario.get('investment_types', []):
            investment_type = parse_invest_type(it)
            it_db_obj = await InvestmentType.find_one(InvestmentType.name == investment_type['name'])
            if not it_db_obj:
                it_db_obj = InvestmentType(**investment_type)
                await it_db_obj.insert()
            new_investment_type_ids.append(it_db_obj.id)

        #update investments
        new_investment_ids = []
        investment_id_map = {}
        for i in scenario.get('investment', []):
            investment = parse_investments(i)
            inv_db_obj = await Investment.find_one(Investment.invest_id == investment['invest_id'])
            if not inv_db_obj:
                inv_db_obj = Investment(**investment)
                await inv_db_obj.insert()
            new_investment_ids.append(inv_db_obj.id)
            investment_id_map[investment['invest_id']] = inv_db_obj.id

        #update event series
        new_event_series_ids = []
        event_series_id_map = {}
        for e in scenario.get('event_series', []):
            event = parse_events(e)
            event_obj = await EventSeries.find_one(EventSeries.name == event['name'])
            if not event_obj:
                event_obj = EventSeries(**event)
                await event_obj.insert()
            new_event_series_ids.append(event_obj.id)
            event_series_id_map[event['name']] = event_obj.id

        update_data = {
            "name": scenario.get('name', existing_scenario.name),
            "marital": scenario.get('marital', existing_scenario.marital),
            "birth_year": [int(year) for year in scenario.get('birth_year', existing_scenario.birth_year)],
            "life_expectancy": parse_life_expectancy(scenario.get('life_expectancy', [])),
            "investment_types": new_investment_type_ids,
            "investment": new_investment_ids,
            "event_series": new_event_series_ids,
            "inflation_assume": Inflation(**parse_inflation(scenario.get('inflation_assume', {}))),
            "limit_posttax": float(scenario.get('limit_posttax', existing_scenario.limit_posttax)),
            "spending_strat": [event_series_id_map.get(name, name) for name in scenario.get('spending_strat', [])],
            "expense_withdraw": [investment_id_map.get(name, name) for name in scenario.get('expense_withdraw', [])],
            "rmd_strat": [investment_id_map.get(name, name) for name in scenario.get('rmd_strat', [])],
            "roth_conversion_strat": [investment_id_map.get(name, name) for name in scenario.get('roth_conversion_strat', [])],
            "roth_optimizer": RothOptimizer(**parse_roth_optimizer(scenario.get('roth_optimizer', {}))),
            "fin_goal": float(scenario.get('fin_goal', existing_scenario.fin_goal)),
            "state": scenario.get('state', existing_scenario.state)
        }

        # Update the scenario
        await existing_scenario.update({"$set": update_data})

        return {"message": "Scenario updated successfully"}

    except Exception as e:
        print(f"Error in update_scenario: {e}")
        raise HTTPException(status_code=400, detail="Error updating scenario")


@router.post("/create_scenario")
async def create_scenario(scenario:  dict):
    try:
        # print(scenario)

        investment_types = scenario['investment_types']
        investment_type_ids = []
        for it in investment_types:
            investment_type = parse_invest_type(it)
            it_db_obj = InvestmentType(**investment_type)
            await it_db_obj.insert()
            investment_type_ids.append(it_db_obj.id)
        
        # investment: List[Link["Investment"]]
        investments = scenario['investment']
        investment_ids = []
        investment_id_map = {}  #map investment names to IDs

        for i in investments:
            investment = parse_investments(i)
            inv_db_obj = Investment(**investment)
            inv = await inv_db_obj.insert()
            investment_ids.append(inv.id)
            investment_id_map[investment['invest_id']] = inv.id
        # print('\n\n\n INVESTMENT MAPPING', investment_id_map)
        
        # print(investment_ids)

        event_series = scenario['event_series']
        event_series_ids = []
        event_series_id_map = {}
        for e in event_series:
            event = await parse_events(e)
            event_obj = EventSeries(**event)
            event_res = await event_obj.insert()
            event_series_ids.append(event_res.id)
            event_series_id_map[event['name']] = event_res.id
        
        # #Need to parse
        parsed_life_expectancy = parse_life_expectancy(scenario.get('life_expectancy', []))
        parsed_inflation = Inflation(**parse_inflation(scenario.get('inflation_assume', {})))
        parsed_roth_optimizer = RothOptimizer(**parse_roth_optimizer(scenario.get('roth_optimizer', {})))
        #NOT TESTED
        spending_strat_ids = []
        for event_name in scenario.get('spending_strat', []):
            if event_name in event_series_id_map:
                spending_strat_ids.append(event_series_id_map[event_name])
        #NOT TESTED
        expense_withdraw_ids = []
        for invest_name in scenario.get('expense_withdraw', []):
            # print("invest_name", invest_name)
            if invest_name in investment_id_map:
                expense_withdraw_ids.append(investment_id_map[invest_name])
        # print("DID EXPENSE GET ID", expense_withdraw_ids)
        #NOT TESTED
        rmd_strat_ids = []
        for invest_name in scenario.get('rmd_strat', []):
            invest_name = invest_name + " pre-tax"
            # print("RMD_STRAT", invest_name)
            if invest_name in investment_id_map:
                rmd_strat_ids.append(investment_id_map[invest_name])
        #NOT TESTED
        roth_conversion_strat_ids = []
        for invest_name in scenario.get('roth_conversion_strat', []):
            invest_name = invest_name + " pre-tax"
            # print("ROTH_CONVERSION", invest_name)
            if invest_name in investment_id_map:
                roth_conversion_strat_ids.append(investment_id_map[invest_name])
        
        user = await User.get(scenario.get('user'))
        if not user:
            raise ValueError("User not found")
        # print(user)
        scenario_obj = Scenario(
            user=user,
            name=scenario.get('name'),
            marital=scenario.get('marital'),
            birth_year=[int(year) for year in scenario.get('birth_year', [])],
            life_expectancy=parsed_life_expectancy,
            investment_types=investment_type_ids,
            investment=investment_ids,
            event_series=event_series_ids,
            inflation_assume=parsed_inflation,
            limit_posttax=float(scenario.get('limit_posttax', 0)),
            spending_strat=spending_strat_ids,
            expense_withdraw=expense_withdraw_ids,
            rmd_strat=rmd_strat_ids,
            roth_conversion_strat=roth_conversion_strat_ids,
            roth_optimizer=parsed_roth_optimizer,
            r_only_share=[],  # Empty at creation time
            wr_only_share=[],  # Empty at creation time
            fin_goal=float(scenario.get('fin_goal', 0)),
            state=scenario.get('state')
        )
        await scenario_obj.save()
        # print("saved id", scenario_obj.id)
        user.scenarios.append(scenario_obj)
        await user.save()
        # print(user)
        id = PydanticObjectId(scenario_obj.id)
        return {"message":"success","id":str(id)}
    except Exception as e:
        print(f"Error in create_scenario: {e}")  # Actually print the exception
        raise HTTPException(status_code=400, detail="Error at scenario creation")

#NOT TESTED NOT SURE IF NEEDED AT ALL, DONE AT USER NO? OR DO WE USE THIS FOR GUESTS?
# @router.get("/{scenario_id}")
# async def fetch_scenario(scenario_id: str):
#     try:
#         scenario = await Scenario.get(scenario_id) #get is a specialized function for getting id
#         if not scenario:
#             raise HTTPException(status_code=404, detail=f"Scenario not found with id:{scenario_id}")
#         return {"scenario": scenario}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Scenario not found, bad request, error: {e}")