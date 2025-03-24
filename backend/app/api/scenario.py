from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
from app.models.investment import *
from app.api.yaml_helper import *
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
        print(data)
        print("=== Imported Scenario ===")
        print(f"Name: {data.get('name')}")
        print(f"Marital Status: {data.get('maritalStatus')}")
        print(f"Birth Years: {data.get('birthYears')}")
        print(f"Life Expectancy: {data.get('lifeExpectancy')}")
        print("\n=== Investment Types ===")
        for investment_type in data.get('investmentTypes', []):
            print(f"  - Name: {investment_type.get('name')}")
            print(f"    Description: {investment_type.get('description')}")
            print(f"    Return Amt or Pct: {investment_type.get('returnAmtOrPct')}")
            print(f"    Return Distribution: {investment_type.get('returnDistribution')}")
            print(f"    Expense Ratio: {investment_type.get('expenseRatio')}")
            print(f"    Income Amt or Pct: {investment_type.get('incomeAmtOrPct')}")
            print(f"    Income Distribution: {investment_type.get('incomeDistribution')}")
            print(f"    Taxability: {investment_type.get('taxability')}")
            print("")
        
        print("\n=== Investments ===")
        for investment in data.get('investments', []):
            print(f"  - Investment Type: {investment.get('investmentType')}")
            print(f"    Value: {investment.get('value')}")
            print(f"    Tax Status: {investment.get('taxStatus')}")
            print(f"    ID: {investment.get('id')}")
            print("")
        
        print("\n=== Event Series ===")
        for event in data.get('eventSeries', []):
            print(f"  - Name: {event.get('name')}")
            print(f"    Start: {event.get('start')}")
            print(f"    Duration: {event.get('duration')}")
            print(f"    Type: {event.get('type')}")
            if event.get('type') == 'income':
                print(f"    Initial Amount: {event.get('initialAmount')}")
                print(f"    Change Amt or Pct: {event.get('changeAmtOrPct')}")
                print(f"    Change Distribution: {event.get('changeDistribution')}")
                print(f"    Inflation Adjusted: {event.get('inflationAdjusted')}")
                print(f"    User Fraction: {event.get('userFraction')}")
                print(f"    Social Security: {event.get('socialSecurity')}")
            elif event.get('type') == 'expense':
                print(f"    Initial Amount: {event.get('initialAmount')}")
                print(f"    Change Amt or Pct: {event.get('changeAmtOrPct')}")
                print(f"    Change Distribution: {event.get('changeDistribution')}")
                print(f"    Inflation Adjusted: {event.get('inflationAdjusted')}")
                print(f"    User Fraction: {event.get('userFraction')}")
                print(f"    Discretionary: {event.get('discretionary')}")
            elif event.get('type') == 'invest':
                print(f"    Asset Allocation: {event.get('assetAllocation')}")
                print(f"    Glide Path: {event.get('glidePath')}")
                print(f"    Asset Allocation 2: {event.get('assetAllocation2')}")
                print(f"    Max Cash: {event.get('maxCash')}")
            elif event.get('type') == 'rebalance':
                print(f"    Asset Allocation: {event.get('assetAllocation')}")
            print("")
        
        print("\n=== Other Details ===")
        print(f"Inflation Assumption: {data.get('inflationAssumption')}")
        print(f"After-Tax Contribution Limit: {data.get('afterTaxContributionLimit')}")
        print(f"Spending Strategy: {data.get('spendingStrategy')}")
        print(f"Expense Withdrawal Strategy: {data.get('expenseWithdrawalStrategy')}")
        print(f"RMD Strategy: {data.get('RMDStrategy')}")
        print(f"Roth Conversion Optimizer: {data.get('RothConversionOpt')}")
        print(f"Roth Conversion Start: {data.get('RothConversionStart')}")
        print(f"Roth Conversion End: {data.get('RothConversionEnd')}")
        print(f"Roth Conversion Strategy: {data.get('RothConversionStrategy')}")
        print(f"Financial Goal: {data.get('financialGoal')}")
        print(f"Residence State: {data.get('residenceState')}")
        name=data.get('name'),
        martial=data.get('martialStatus')
        birth_year=data.get('birthYears')
        life_expectancy=data.get('lifeExpectancy'),
        for investment_type in data.get('investmentTypes'):
            invest_type = create_investment_type_from_yaml(investment_type)
            print("INVEST TYPE")
            print(invest_type)

            
        # scenario = Scenario(
        #     name=name,
        #     martial=martial,
        #     birth_year=birth_year,
        #     life_expectancy=life_expectancy,
        #     investment_types=
            
        # )
        return data
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail="yaml file cannot be parsed for some reason")
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Bad request for importing scenario")
    

    
    
@router.get("/export/{scenario_id}")
async def export_scenario(scenario_id: str):
    pass
    
    