from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.api.yaml_helper import *
from beanie.operators import Set
from app.db.db_utils import *
import yaml
import os
from fastapi.responses import FileResponse

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
    
# @router.post("/create_scenario")
# async def create_scenario(scenario: Scenario):
#     try:
        
#         created_scenario = await scenario.insert()
#         return {"message": "success"}
#     except Exception as e:
#         print(f"Error in create_scenario: {e}")  # Actually print the exception
#         raise 
@router.post("/create_scenario")
async def create_scenario(scenario:  dict):
    try:
        # 
        user = scenario['user']
        print(user)
        name = scenario['name']
        print(name)
        marital= scenario['marital']
        print(marital)
        birth_year = scenario['birth_year']
        print(birth_year)
        life_expectancy = scenario['life_expectancy']
        print(life_expectancy)
        inflation_assume = scenario['inflation_assume']
        print(inflation_assume)
        limit_posttax=scenario['limit_posttax']
        print(limit_posttax)
        roth_optimizer= scenario['roth_optimizer']
        print(roth_optimizer)
        r_only_share = scenario['r_only_share']
        print(r_only_share)
        wr_only_share =scenario['wr_only_share']
        print(wr_only_share)
        fin_goal = scenario['fin_goal']
        print(fin_goal)
        # investment_types: List[Link["InvestmentType"]]
        investment_types = scenario['investment_types']
        print(investment_types)
        # investment: List[Link["Investment"]]
        # event_series: List[Link["EventSeries"]]
        # spending_strat: List[Link["EveDntSeries"]] #example uses name rather than link
        # expense_withdraw: List[Link["Investment"]] #example uses name rather than link, also includes in the name "non-retirement" e.g "[S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax]"
        # rmd_strat: List[Link["Investment"]] #example uses [S&P 500 pre-tax]
        # roth_conversion_strat: List[Link["Investment"]] #Example uses "[S&P 500 pre-tax]", should we store name as well rather than objectid?
        
        
        return {"message":"success"}
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

        print("\n\n\n BEGINNING OF EXPORT")
        print(scenario)
        #handle InvestmentType, Investment, EventSeries
        
        investment_types = []
        for type_id in scenario.investment_types:
            print("\n\n\n ", type_id)
            investment_types.append(invest_type_to_yaml(type_id))
        # print("INVESTMENT TYPES:", investment_types)
        
        investments = []
        for invest_id in scenario.investment:
            print("\n\n\n INVEST", invest_id)
            investments.append(invest_to_yaml(invest_id))
        event_series = []
        for event in scenario.event_series:
            event_series.append(event_to_yaml(event))
        
        print("\n\n\n",event_series)
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
        print(f"YAML file saved at: {file_path}")
        
        return FileResponse(
            path=file_path,
            filename=f"{scenario_name}.yaml",
            media_type="application/x-yaml"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting {scenario_name}")
    
    