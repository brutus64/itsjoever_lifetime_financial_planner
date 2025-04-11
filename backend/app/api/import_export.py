from fastapi import APIRouter, HTTPException, File, UploadFile, Request
from app.models.scenario import Scenario
from app.models.investment import Investment, InvestmentType
from app.models.event_series import EventSeries
from app.api.utils.yaml_helper import *
from app.api.utils.scenario_helper import *
from app.db.db_utils import *
import yaml
import os
from fastapi.responses import FileResponse
from bson import DBRef

router = APIRouter()

@router.post("/import")
async def import_scenario(request: Request, file: UploadFile = File(...)):
    try:
        user = None
        if request:
            user_id = request.session.get("user_id")
            print("user id found:", user_id)
            if user_id:
                user = await User.get(PydanticObjectId(user_id))
                print("user obj found", user)
        if not file.filename.endswith(('.yaml', '.yml')):
            raise HTTPException(status_code=400, detail="Importing scenarios only accepts YAML files.")
        content = await file.read()
        data = yaml.safe_load(content)
        
        investtype_ids = []
        invest_ids = []
        event_ids = []
        for investment_type in data.get('investmentTypes'):
            invest_type = create_investment_type_from_yaml(investment_type)
            await invest_type.save()
            investtype_ids.append(invest_type)
        
        for investment in data.get('investments'):
            invest = create_investment_from_yaml(investment, investtype_ids) 
            await invest.save()
            invest_ids.append(invest)
                
        event_series = []
        event_series_map = {}
        for event in data.get('eventSeries'):
            #REQUIRE INVESTMENT ID MAPPED PROPERLY!
            e = create_event_from_yaml(event, invest_ids)
            await e.save()
            event_series.append(e)
            event_ids.append(e.id)
            event_series_map[e.name] = e 
        
        #2nd pass
        for event in event_series:
            if event.start.type in ["start_with", "end_with"] and event.start.event_series:
                referenced_event = event_series_map.get(event.start.event_series) #is the name
                if referenced_event:
                    event.start.event_series = str(referenced_event.id)
            
            if event.duration.type in ["start_with", "end_with"] and event.duration.event_series:
                referenced_event = event_series_map.get(event.duration.event_series) #is the name
                if referenced_event:
                    event.duration.event_series = str(referenced_event.id)
            
            await event.save()
            

        investments = await Investment.find_all().to_list()
        spending_strat = await eventnames_to_id(data.get('spendingStrategy'), event_series)
        expense_withdraw = await investmentnames_to_id(data.get('expenseWithdrawalStrategy'),investments)
        rmd_strat = await investmentnames_to_id(data.get('RMDStrategy'), investments)
        roth_conversion_strat = await investmentnames_to_id(data.get('RothConversionStrategy'), investments)
        
        scenario = Scenario(
            user=user,
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
        await scenario.save()
        print("SCENARIO ID = ", str(scenario.id))
        all_scenarios = []
        if user:
            scenario_ref = Link(
                ref=DBRef(collection="scenarios", id=scenario.id),
                document_class=Scenario
            )
            if not hasattr(user, "scenarios") or user.scenarios is None:
                user.scenarios = []
            user.scenarios.append(scenario_ref)
            await user.save()
            user = await User.get(PydanticObjectId(user_id), fetch_links=True)
            all_scenarios = user.scenarios
        print("ALL SCENARIOS", all_scenarios)
        return {
            "name": scenario.name,
            "id": str(scenario.id),
            "message": "Scenario imported successfully",
            "scenarios": all_scenarios
        }
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail="yaml file cannot be parsed for some reason")
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Bad request for importing scenario")
    

    
    
@router.get("/export/{scenario_id}") #Fix scenario_id
async def export_scenario(scenario_id: str):
    try:
        print("EXPORT SCENARIO_ID", scenario_id)
        scenario = await Scenario.get(PydanticObjectId(scenario_id), fetch_links=True)
        if not scenario:
            raise HTTPException(status_code=404, detail=f"Scenario: {scenario_id} does not exist.")

        investment_types = []
        for type_id in scenario.investment_types:
            investment_types.append(invest_type_to_yaml(type_id))

        investments = []
        for invest_id in scenario.investment:
            investments.append(invest_to_yaml(invest_id))
        
        event_series = []
        for event in scenario.event_series:
            event_res = await event_to_yaml(event, scenario.event_series)
            event_series.append(event_res)
        
        spending_strategy = []
        for event in scenario.spending_strat:
            if hasattr(event, 'name'):
                spending_strategy.append(event.name)
        
        expense_withdraw_strategy = []
        for invest in scenario.expense_withdraw:
            if hasattr(invest, 'invest_id'):
                expense_withdraw_strategy.append(invest.invest_type.name + " " + invest.tax_status)
        
        rmd_strategy = []
        for invest in scenario.rmd_strat:
            if hasattr(invest, 'invest_id'):
                rmd_strategy.append(invest.invest_type.name + " " + invest.tax_status)
        
        roth_conversion_strategy = []
        for invest in scenario.roth_conversion_strat:
            if hasattr(invest, 'invest_id'):
                roth_conversion_strategy.append(invest.invest_type.name + " " + invest.tax_status)
        
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
                
        yaml_content = yaml.dump(yaml_data, sort_keys=False, default_flow_style=False)
        
        #set up at directory exports
        export_dir = os.path.join(os.getcwd(), "exports")
        os.makedirs(export_dir, exist_ok=True)
        file_path = os.path.join(export_dir, f"{scenario_id}.yaml")
        
        #write it
        with open(file_path, "w") as f:
            f.write(yaml_content)
        # print(f"YAML file saved at: {file_path}")
        
        return FileResponse(
            path=file_path,
            filename=f"{scenario_id}.yaml",
            media_type="application/x-yaml"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting {scenario_id}")
    
    