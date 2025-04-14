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

        # create default cash investment type
        DEFAULT_CASH_TYPE = {
            "name":"cash",
            "description":"default cash investment",
            "exp_annual_return":{
                "is_percent":False,
                "type":"fixed",
                "value":0,
                "mean":0,
                "stdev":1
            },
            "exp_annual_income":{
                "is_percent":False,
                "type":"fixed",
                "value":0,
                "mean":0,
                "stdev":1
            },
            "expense_ratio": 0,
            "taxability":False
        }

        invest_type = InvestmentType(**DEFAULT_CASH_TYPE)
        await invest_type.insert()
        db_ref = DBRef(collection="investment_types", id=invest_type.id)
        scenario_obj.investment_types.append(Link(ref = db_ref,document_class=InvestmentType))

        # create default cash investment
        DEFAULT_CASH_INVESTMENT = {
            "invest_type": invest_type.id,
            "invest_id":"",
            "value": 0,
            "tax_status": "non-retirement",
        }

        investment = Investment(**DEFAULT_CASH_INVESTMENT)
        await investment.insert()
        db_ref = DBRef(collection="investments", id=investment.id)
        scenario_obj.investment.append(Link(ref = db_ref,document_class=Investment))

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
            fetch_links=True,
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")

        # strategies are not in order
        scenario_unfetched = await Scenario.find_one(
            Scenario.id == scenario_id 
        )
        correct_rmd = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.rmd_strat)}
        correct_roth = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.roth_conversion_strat)}
        correct_spend = {es.ref.id:i for i,es in enumerate(scenario_unfetched.spending_strat)}
        correct_withdraw = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.expense_withdraw)}
        scenario.rmd_strat.sort(key=lambda inv:correct_rmd[inv.id])
        scenario.roth_conversion_strat.sort(key=lambda inv:correct_roth[inv.id])
        scenario.spending_strat.sort(key=lambda es:correct_spend[es.id])
        scenario.expense_withdraw.sort(key=lambda inv:correct_withdraw[inv.id])

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
            "limit_posttax": float(scenario.get('limit_posttax')) if scenario.get('limit_posttax') else None,
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
    print(investment_type)
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
        scen_id = PydanticObjectId(scenario_id)
        invest_id = PydanticObjectId(invest_type_id)
        scenario = await Scenario.get(scen_id,fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=400, detail="DELETE investment_type scenario does not exist")

        # check to see if there are any investments that are using this investment type
        for inv in scenario.investment:
            if inv.invest_type.id == invest_id:
                print("Investment type is being used in an investment")
                raise HTTPException(status_code=400, detail="DELETE investment_type investment type in use")

        # delete investment type from scenario first
        dbref = DBRef(collection="investment_types", id=invest_id)
        res = await Scenario.find_one(Scenario.id == scen_id).update(
            Pull({
                    "investment_types": dbref,
                })
        )
        print(res)

        # delete actual investment type
        invest_type = await InvestmentType.get(invest_id)
        print(invest_type)
        delete_res = await invest_type.delete()
        print("DELETE", delete_res)

        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete investment error {e}")

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
        scenario = await Scenario.get(scenario_obj_id,fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=400, detail= "PUT investment scenario does not exist")
        existing_investment = await Investment.get(invest_obj_id)
        if not existing_investment:
            raise HTTPException(status_code=404, detail="Investment not found")

        # if the new investment data is pre-tax -> must error if used in event series
        # if the new investment data is not pre-tax -> must remove from rmd and roth
        if investment["tax_status"] == "pre-tax":
            if existing_investment.tax_status != "pre-tax":
                for es in scenario.event_series:
                    if es.type == "invest" or es.type == "rebalance":
                        for asset in es.details.assets:
                            if asset.invest_id.ref.id == invest_obj_id:
                                print("Investment is being used in event series")
                                raise HTTPException(status_code=400, detail="PUT investment investment in use")
        else:
            dbref = DBRef(collection="investments", id=invest_obj_id)
            await Scenario.find_one(Scenario.id == scenario_obj_id).update(
                Pull({
                        "rmd_strat": dbref,
                        "roth_conversion_strat": dbref,
                    })
            )
        
        invest_obj = Investment(**investment)
        await existing_investment.update({"$set":invest_obj})

        updated_scenario = await Scenario.get(scenario_obj_id, fetch_links=True)
        return updated_scenario.model_dump(include={'investment'}, mode="json")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update investment error, {e}")
    
@router.delete("/investment/{scenario_id}/{investment_id}")
async def delete_invest(scenario_id: str, investment_id: str):
    try:
        scen_id = PydanticObjectId(scenario_id)
        invest_id = PydanticObjectId(investment_id)
        scenario = await Scenario.get(scen_id, fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=400, detail="DELETE investment scenario does not exist")

        # check to see if there are any event series that are using this investment
        for es in scenario.event_series:
            if es.type == "invest" or es.type == "rebalance":
                for asset in es.details.assets:
                    if asset.invest_id.ref.id == invest_id:
                        print("Investment is being used in event series")
                        raise HTTPException(status_code=400, detail="DELETE investment investment in use")
        
        # delete investment from scenario first
        dbref = DBRef(collection="investments", id=invest_id)
        res = await Scenario.find_one(Scenario.id == scen_id).update(
            Pull({
                    "investment": dbref,
                    "rmd_strat": dbref,
                    "roth_conversion_strat": dbref,
                    "expense_withdraw": dbref
                })
        )
        print(res)

        # delete actual investment
        investment = await Investment.get(invest_id)
        print(investment)
        delete_res = await investment.delete()
        print("DELETE", delete_res)

        return { "success": True }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete investment error {e}")

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
        scen_id = PydanticObjectId(scenario_id)
        event_id = PydanticObjectId(event_series_id)
        scenario = await Scenario.get(scen_id)
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

        # If new expense event series is not a discretionary expense, remove from spending strategy (just in case)
        print(event_data)
        if (event_data["type"] == "expense" and not event_data["is_discretionary"]):
            print("It changed")
            dbref = DBRef(collection="event_series", id=event_id)
            await Scenario.find_one(Scenario.id == scen_id).update(
                Pull({
                        "spending_strat": dbref,
                    })
            )
        
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
            fetch_links=True # THIS DOESN'T PRESERVE THE ORDER AHHHHHHHHHH
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        scenario_unfetched = await Scenario.find_one(
            Scenario.id == scenario_id 
        )#this has order preserved
        correct_rmd = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.rmd_strat)}
        correct_roth = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.roth_conversion_strat)}
        scenario.rmd_strat.sort(key=lambda inv:correct_rmd[inv.id])
        scenario.roth_conversion_strat.sort(key=lambda inv:correct_roth[inv.id])

        
        return scenario.model_dump(include={'rmd_strat','investment','roth_conversion_strat','roth_optimizer'}, mode="json")
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")

@router.put("/rmdroth/{scenario_id}")
async def update_rmd_roth(scenario_id: str, rmd_roth_data: dict):
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        print("Hello")
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        # transform all id to links
        existing_scenario.rmd_strat = [Link(ref = DBRef(collection="investments", id=PydanticObjectId(id)),document_class=Investment) for id in rmd_roth_data.get("rmd_strat")]
        existing_scenario.roth_conversion_strat = [Link(ref = DBRef(collection="investments", id=PydanticObjectId(id)),document_class=Investment) for id in rmd_roth_data.get("roth_conversion_strat")]
        existing_scenario.roth_optimizer = rmd_roth_data.get("roth_optimizer")
        existing_scenario.roth_optimizer["start_year"] = int(rmd_roth_data.get("roth_optimizer").get("start_year")) if rmd_roth_data.get("roth_optimizer").get("start_year") else None

        existing_scenario.roth_optimizer["end_year"] = int(rmd_roth_data.get("roth_optimizer").get("end_year")) if rmd_roth_data.get("roth_optimizer").get("end_year") else None

        await existing_scenario.save(link_rule=WriteRules.WRITE)

        return {"message": "RMD and Roth updated successfully"} # will be sent using save button, no send back
    except Exception as e:
        print(f"Error in update_rmd_roth: {e}")
        raise HTTPException(status_code=400, detail="Error updating rmd and roth")

@router.get("/spendwith/{scenario_id}")
async def fetch_spend_withdraw(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
            Scenario.id == scenario_id,
            fetch_links=True # THIS DOESN'T PRESERVE THE ORDER AHHHHHHHHHH
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        scenario_unfetched = await Scenario.find_one(
            Scenario.id == scenario_id 
        )#this has order preserved
        correct_spend = {es.ref.id:i for i,es in enumerate(scenario_unfetched.spending_strat)}
        correct_withdraw = {inv.ref.id:i for i,inv in enumerate(scenario_unfetched.expense_withdraw)}
        scenario.spending_strat.sort(key=lambda es:correct_spend[es.id])
        scenario.expense_withdraw.sort(key=lambda inv:correct_withdraw[inv.id])
        
        return scenario.model_dump(include={'spending_strat','expense_withdraw','event_series','investment'}, mode="json")
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")

@router.put("/spendwith/{scenario_id}")
async def update_spend_withdraw(scenario_id: str, strategy_data: dict):
    print(strategy_data)
    try:
        scenario_obj_id = PydanticObjectId(scenario_id)
        
        existing_scenario = await Scenario.get(scenario_obj_id)
        if not existing_scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")

        # transform all id to links
        existing_scenario.spending_strat = [Link(ref = DBRef(collection="event_series", id=PydanticObjectId(id)),document_class=EventSeries) for id in strategy_data.get("spending_strat")]
        existing_scenario.expense_withdraw = [Link(ref = DBRef(collection="investments", id=PydanticObjectId(id)),document_class=Investment) for id in strategy_data.get("expense_withdraw")]

        await existing_scenario.save(link_rule=WriteRules.WRITE)

        return {"message": "Strategies updated successfully"} # will be sent using save button, no send back
    except Exception as e:
        print(f"Error in update_spend_withdraw: {e}")
        raise HTTPException(status_code=400, detail="Error updating strategies")