from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.api.yaml_helper import *
from beanie.operators import Set

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
        created_scenario = await scenario.insert()
        return {"message": "success"}
    except Exception as e:
        pass

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
        
        for investment_type in data.get('investmentTypes'):
            invest_type = create_investment_type_from_yaml(investment_type)
            print("INVEST TYPE")
            print(invest_type)
            print("MODEL DUMP: ", invest_type.model_dump(exclude={"id", "name"}))
            res = await InvestmentType.find_one(InvestmentType.name == invest_type.name).upsert(
                Set(invest_type.model_dump(exclude={"id", "name"})),
                on_insert=invest_type
            )
            # print(f"Post insert/update: {res}")

        for investment in data.get('investments'):
            print(investment)
            invest = create_investment_from_yaml(investment)
            print("INVEST", invest)
            res = await Investment.find_one(Investment.invest_id == invest.invest_id).upsert(
                Set(invest.model_dump(exclude={'id'})),
                on_insert=invest
            )
            print("result:", res)
            
            # print("INVESTMENT")
            # print(invest)
        for event in data.get('eventSeries'):
            print(event)
            e = await create_event_from_yaml(event)
            res = await EventSeries.find_one(e.id == EventSeries.id).upsert(
                Set(e.model_dump(exclude={'id'})),
                on_insert=e
            )
            print("event result:", res)
        
        # scenario = Scenario(
        #     name=data.get('name'),
        #     martial=data.get('martialStatus'),
        #     birth_year=data.get('birthYears'),
        #     life_expectancy=data.get('lifeExpectancy'),
        #     investment_types=,
        #     investment,
        #     event_series,
        #     inflation_assume,
        #     limit_posttax,
        #     spending_strat,
        #     expense_withdraw,
        #     rmd_strat,
        #     roth_conversion_strat,
        #     roth_optimizer,
        #     ignore_state_tax,
        #     fin_goal,
        #     state  
        # )
        return
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail="yaml file cannot be parsed for some reason")
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Bad request for importing scenario")
    

    
    
@router.get("/export/{scenario_id}")
async def export_scenario(scenario_id: str):
    pass
    
    