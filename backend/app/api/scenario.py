from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.api.yaml_helper import *
from app.api.scenario_helper import *
from app.db.db_utils import *
import yaml
import os
from fastapi.responses import FileResponse
from beanie import PydanticObjectId

router = APIRouter()

#NOT TESTED
#update existing scenario given its id

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
            event = await parse_events(e)
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
    
@router.get("/main/{scenario_id}")
async def fetch_main(scenario_id: str):
    try:
        scenario_id = PydanticObjectId(scenario_id)
        
        scenario = await Scenario.find_one(
            Scenario.id == scenario_id,
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        print("FOUND THE SCENARIO",scenario)
        return {"scenario": scenario.model_dump(include={'id','name','marital','birth_year','life_expectancy','inflation_assume','limit_posttax','fin_goal','state'},mode="json")}
    except ValueError: #occurs if pydantic conversion fails
        raise HTTPException(status_code=400, detail="Invalid user ID format")


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

@router.post("/import")
async def import_scenario(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.yaml', '.yml')):
            raise HTTPException(status_code=400, detail="Importing scenarios only accepts YAML files.")
        content = await file.read()
        data = yaml.safe_load(content)
        
        #NEED TO IMPORT INVESTMENT_TYPES FIRST
        #THEN INVESTMENTS
        #THEN EVENT SERIES
        #THEN SCENARIO ITSELF
        investtype_ids = []
        invest_ids = []
        event_ids = []
        for investment_type in data.get('investmentTypes'):
            invest_type = create_investment_type_from_yaml(investment_type)
            # print("INVEST TYPE")
            # print(invest_type)
            # print("MODEL DUMP: ", invest_type.model_dump(exclude={"id", "name"}))
            exists = await InvestmentType.find_one(InvestmentType.name == invest_type.name)
            if exists:
                update_data = invest_type.model_dump(exclude={"id"})
                for key, value in update_data.items():
                    setattr(exists, key, value)
                await exists.save()
                investtype_ids.append(exists.id)
            else:
                await invest_type.save()
                investtype_ids.append(invest_type.id)    
            # res = await InvestmentType.find_one(InvestmentType.name == invest_type.name).upsert(
            #     Set(invest_type.model_dump(exclude={"id", "name"})),
            #     on_insert=invest_type
            # )
            # investtype_ids.append(res.id)
            # print(f"Post insert/update: {res}")
        
        for investment in data.get('investments'):
            # print(investment)
            invest = create_investment_from_yaml(investment)
            # print("INVEST", invest)
            
            exists = await Investment.find_one(Investment.invest_id == invest.invest_id)
            
            if exists:
                # Update fields manually
                update_data = invest.model_dump(exclude={"id"})
                for key, value in update_data.items():
                    setattr(exists, key, value)
                
                await exists.save()
                invest_ids.append(exists.id)
            else:
                # Save new
                await invest.save()
                invest_ids.append(invest.id)
                
        event_series = []
        for event in data.get('eventSeries'):
            # print(event)
            #NEED FIX SHOULD BE FIXED WITH NAME
            e = await create_event_from_yaml(event)
            exists = await EventSeries.find_one(EventSeries.name == e.name)
            
            if exists:
                # Update fields manually
                update_data = e.model_dump(exclude={"id"})
                for key, value in update_data.items():
                    setattr(exists, key, value)
                
                await exists.save()
                event_series.append(exists)
                event_ids.append(exists.id)
            else:
                # Save new
                await e.save()
                event_series.append(e)
                event_ids.append(e.id)
        
        
        # print("INVESTTYPE ID", investtype_ids)
        # print("INVEST ID", invest_ids)
        # print("EVENT ID", event_ids)
        investments = await Investment.find_all().to_list()
        # print(investments)
        spending_strat = await eventnames_to_id(data.get('spendingStrategy'), event_series)
        expense_withdraw = await investmentnames_to_id(data.get('expenseWithdrawalStrategy'),investments)
        rmd_strat = await investmentnames_to_id(data.get('RMDStrategy'), investments)
        roth_conversion_strat = await investmentnames_to_id(data.get('RothConversionStrategy'), investments)
        
        scenario = Scenario(
            name=data.get('name'),
            marital=data.get('maritalStatus'),
            birth_year=data.get('birthYears'),
            life_expectancy=parse_life(data),
            # GRAB ID FROM PREVIOUS RUNS
            investment_types= investtype_ids,
            investment=invest_ids,
            event_series=event_ids,
            inflation_assume=parse_inflation_assumption(data),
            limit_posttax=data.get('afterTaxContributionLimit'),
        #REQUIRES MAPPING NAME -> OBJECT ID REF
            spending_strat= spending_strat,
            expense_withdraw= expense_withdraw,
            rmd_strat= rmd_strat,
            roth_conversion_strat= roth_conversion_strat,
        #NEED TO PARSE with true and dates
            roth_optimizer=parse_roth_opt(data),
            fin_goal=data.get('financialGoal'),
            state=data.get('residenceState')
        )
        scenario_exists = await Scenario.find_one(Scenario.name == scenario.name)
        if scenario_exists:
            scenario_data = scenario.model_dump(exclude={"id"})
            for key, value in scenario_data.items():
                setattr(scenario_exists, key, value)
            print("SCENARIO UPDATED")
            print("SCENARIO ID = ", str(scenario_exists.id))
            await scenario_exists.save()
        else:
            print("SCENARIO SAVED")
            print("SCENARIO ID = ", str(scenario.id))
            await scenario.save()
        
        return {
            "name": scenario.name,
            "id": str(scenario.id),
            "message": "Scenario imported successfully"
        }
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail="yaml file cannot be parsed for some reason")
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Bad request for importing scenario")
    

    
    
@router.get("/export/{scenario_name}")
async def export_scenario(scenario_name: str):
    try:
        scenario = await Scenario.find_one(Scenario.name == scenario_name, fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=404, detail=f"Scenario: {scenario_name} does not exist.")

        # print("\n\n\n BEGINNING OF EXPORT")
        # print(scenario)
        #handle InvestmentType, Investment, EventSeries
        
        investment_types = []
        for type_id in scenario.investment_types:
            # print("\n\n\n ", type_id)
            investment_types.append(invest_type_to_yaml(type_id))
        # print("INVESTMENT TYPES:", investment_types)
        
        investments = []
        for invest_id in scenario.investment:
            # print("\n\n\n INVEST", invest_id)
            investments.append(invest_to_yaml(invest_id))
        event_series = []
        for event in scenario.event_series:
            event_series.append(event_to_yaml(event))
        
        # print("\n\n\n",event_series)
        #Scenario no processing needed: name, marital, birth_years, after tax contrib, financialGoal, residenceState
        
        #Scenario processing needed: life_expectancy, inflation_assume, spending_strat, expense_withdraw, rmd_strat, roth_opt, roth_conversion_strat
        spending_strategy = []
        for event in scenario.spending_strat:
            if hasattr(event, 'name'):
                spending_strategy.append(event.name)
        
        expense_withdraw_strategy = []
        for invest in scenario.expense_withdraw:
            if hasattr(invest, 'invest_id'):
                expense_withdraw_strategy.append(invest.invest_id)
        
        rmd_strategy = []
        for invest in scenario.rmd_strat:
            if hasattr(invest, 'invest_id'):
                rmd_strategy.append(invest.invest_id)
        
        roth_conversion_strategy = []
        for invest in scenario.roth_conversion_strat:
            if hasattr(invest, 'invest_id'):
                roth_conversion_strategy.append(invest.invest_id)
        
        yaml_data = {
            "name": scenario.name,
            "maritalStatus": scenario.marital,
            "birthYears": scenario.birth_year,
            "lifeExpectancy": life_to_yaml(scenario.life_expectancy),
            "investmentTypes": investment_types,
            "investments": investments,
            "eventSeries": event_series,
            "inflationAssumption": inflat_to_yaml(scenario.inflation_assume),
            "afterTaxContributionLimit": scenario.limit_posttax,
            "spendingStrategy": spending_strategy,
            "expenseWithdrawalStrategy": expense_withdraw_strategy,
            "RMDStrategy": rmd_strategy,
        }
        if scenario.roth_optimizer:
            yaml_data["RothConversionOpt"] = scenario.roth_optimizer.is_enable
            yaml_data["RothConversionStart"] = scenario.roth_optimizer.start_year
            yaml_data["RothConversionEnd"] = scenario.roth_optimizer.end_year
        else:
            yaml_data["RothConversionOpt"] = False
        yaml_data["RothConversionStrategy"] = roth_conversion_strategy
        yaml_data["financialGoal"] = scenario.fin_goal
        yaml_data["residenceState"] = scenario.state
        
        # print("\n\n\n YAML:", yaml_data)
        
        yaml_content = yaml.dump(yaml_data, sort_keys=False, default_flow_style=False)
        
        #set up at directory exports
        export_dir = os.path.join(os.getcwd(), "exports")
        os.makedirs(export_dir, exist_ok=True)
        file_path = os.path.join(export_dir, f"{scenario_name}.yaml")
        
        #write it
        with open(file_path, "w") as f:
            f.write(yaml_content)
        # print(f"YAML file saved at: {file_path}")
        
        return FileResponse(
            path=file_path,
            filename=f"{scenario_name}.yaml",
            media_type="application/x-yaml"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting {scenario_name}")
    
    