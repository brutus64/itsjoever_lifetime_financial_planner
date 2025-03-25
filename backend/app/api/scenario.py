from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.api.yaml_helper import *
from beanie.operators import Set
from app.db.db_utils import *

import yaml

router = APIRouter(prefix="/scenario")


@router.post("/create_event_series")
async def create_event_series():
    try:
        pass
    except Exception as e:
        pass

@router.post("/create_investment")
async def create_investment():
    try:
        pass
    except Exception as e:
        pass
    
@router.post("/create_scenario")
async def create_scenario(scenario: Scenario):
    try:
        
        scenario.user = scenario.user.user.id
        created_scenario = await scenario.insert()
        return {"message": "success"}
    except Exception as e:
        print(f"Error in create_scenario: {e}")  # Actually print the exception
        raise 

@router.get("/{scenario_id}")
async def fetch_scenario(scenario_id: str):
    try:
        scenario = await Scenario.get(scenario_id) #get is a specialized function for getting id
        if not scenario:
            raise HTTPException(status_code=404, detail=f"Scenario not found with id:{scenario_id}")
        return {"scenario": scenario}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scenario not found, bad request, error: {e}")

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
            print("INVEST TYPE")
            print(invest_type)
            print("MODEL DUMP: ", invest_type.model_dump(exclude={"id", "name"}))
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
            print(investment)
            invest = create_investment_from_yaml(investment)
            print("INVEST", invest)
            
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
            print(event)
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
        
        
        print("INVESTTYPE ID", investtype_ids)
        print("INVEST ID", invest_ids)
        print("EVENT ID", event_ids)
        investments = await Investment.find_all().to_list()
        print(investments)
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
            scenario_data = scenario.model_dump(exclude={"id", "name"})
            for key, value in scenario_data.items():
                setattr(scenario_exists, key, value)
            await scenario_exists.save()
        else:
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
    

    
    
@router.get("/export/{scenario_id}")
async def export_scenario(scenario_id: str):
    pass
    
    