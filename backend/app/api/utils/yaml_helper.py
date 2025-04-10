from app.models.scenario import *
from app.models.investment import *
from app.models.event_series import *
from beanie.operators import And
from beanie import PydanticObjectId, Link
from bson import DBRef
'''----------------- INVESTMENT TYPE & INVESTMENT ---------------'''

def create_investment_type_from_yaml(data):
    # Parse the return distribution
    try:        
        exp_annual_return, exp_annual_income = None, None
        return_distribution = data.get("returnDistribution", {})
        if return_distribution.get("type") == "fixed":
            exp_annual_return = InvestAnnualChange(
                type="fixed",
                value=return_distribution.get("value"),
                is_percent=True if data.get('returnAmtOrPct') == 'percent' else False,
            )
        elif return_distribution.get("type") == "normal":
            exp_annual_return = InvestAnnualChange(
                type="normal",
                fixed=None,
                mean=return_distribution.get("mean"),
                stdev=return_distribution.get("stdev"),
                is_percent=True if data.get('returnAmtOrPct') == 'percent' else False
            )
        else:
            raise ValueError("Invalid returnDistribution type")

        # Parse the income distribution
        income_distribution = data.get("incomeDistribution", {})
        if income_distribution.get("type") == "fixed":
            exp_annual_income = InvestAnnualChange(
                type="fixed",
                value=income_distribution.get("value"),
                is_percent=True if data.get('incomeAmtOrPct') == 'percent' else False
            )
        elif income_distribution.get("type") == "normal":
            exp_annual_income = InvestAnnualChange(
                type="normal",
                mean=income_distribution.get("mean"),
                stdev=income_distribution.get("stdev"),
                is_percent=True if data.get('incomeAmtOrPct') == 'percent' else False
            )
        else:
            raise ValueError("Invalid incomeDistribution type")

        # Create the InvestmentType object
        investment_type = InvestmentType(
            name=data.get("name"),
            description=data.get("description"),
            exp_annual_return=exp_annual_return,
            expense_ratio=data.get("expenseRatio"),
            exp_annual_income=exp_annual_income,
            taxability=data.get("taxability")
        )

        return investment_type
    except Exception as e:
        print(f"ERROR AT YAML -> INVESTMENT: {e}")


def create_investment_from_yaml(data, invest_types):
    name = data.get('investmentType')
    obj = None
    for types in invest_types:
        if types.name == name:
            obj = types
    db_ref = DBRef(collection="investment_types", id=PydanticObjectId(obj.id))
    investment = Investment(
        invest_type=Link(ref=db_ref, document_class=InvestmentType), #ERROR should be a link, need to match
        invest_id=data.get('id'),
        value=data.get('value'),
        tax_status=data.get('taxStatus'),
    )

    return investment



'''
-----------------------EVENT-SERIES----------------------
'''



def create_exp_annual(data): #for income and expense
    dist = data.get('changeDistribution')
    dist_type = dist.get('type')
    exp_ann = EventAnnualChange(
        type=dist_type,
        is_percent = True if data.get('changeAmtOrPct') == 'percent' else False
    )
    if dist_type == 'fixed':
        exp_ann.value = dist.get('value')
    elif dist_type == 'uniform':
        exp_ann.lower = dist.get('lower')
        exp_ann.upper = dist.get('upper')
    elif dist_type == 'normal':
        exp_ann.mean = dist.get('mean')
        exp_ann.stdev = dist.get('stdev')
    # print("EXPECTED ANNUAL:", exp_ann)
    return exp_ann

def event_date_parse(data):
    date_type = data.get('type')
    if date_type == 'startWith':
        date_type = 'start_with'
    if date_type == 'endWith':
        date_type = 'end_with'
    date = EventDate(
        type=date_type
    )
    if date_type == 'fixed':
        date.value = data.get('value')
    elif date_type == 'uniform':
        date.lower = data.get('lower')
        date.upper = data.get('upper')
    elif date_type == 'normal':
        date.mean = data.get('mean')
        date.stdev = data.get('stdev')
    elif date_type in ["start_with", "end_with"]: 
        date.event_series = data.get('eventSeries') #convert later with 2 pass
        
    return date

def create_assetalloc(data, investments):
    glide = data.get('glidePath')
    asset1 = data.get('assetAllocation')
    asset2 = data.get('assetAllocation2')
    # print("ASSETTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:", asset1)
    arr = []
    for key, value in asset1.items():
        invest = None
        #should be name of investment + " " + tax_status
        #should match invest_id
        obj = None
        for inv in investments:
            if key == inv.invest_id:
                obj = inv
        #need name from 
        
        #CHECK: ISSUE HERE
        if glide:
            invest = GlideInvestment(
                invest_id=Link(ref=DBRef(collection="investments", id=PydanticObjectId(obj.id)), document_class=Investment),
                initial=value,
                final=asset2.get(key,1-value)
            )
        else:
            invest = FixedInvestment(
                invest_id=Link(ref=DBRef(collection="investments", id=PydanticObjectId(obj.id)), document_class=Investment),
                percentage=value
            )
        arr.append(invest) 
        #need to validate it == 1 later
    return arr

def create_event_from_yaml(data, investments):
    event_type = data.get('type')
    detail = None
    if event_type == 'income':
        detail = Income(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction')*100,
            social_security=data.get('socialSecurity')
        )
    elif event_type == 'expense':
        detail = Expense(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction')*100,
            is_discretionary=data.get('discretionary')
        )
            
    elif event_type == 'invest':
        detail = Invest(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data, investments),
            max_cash=data.get('maxCash')
        )
    elif event_type == 'rebalance':
        detail = Rebalance(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data, investments)
        )
    # print("ID IN THE END:", detail_id)
    # print("EVENTFROMYAML START/DURATION", data.get('start'), data.get('duration'))
    event = EventSeries(
        name=data.get('name'),
        description=data.get('description'),
        start=event_date_parse(data.get('start')),
        duration=event_date_parse(data.get('duration')),
        type=event_type,
        details=detail
    )
    return event

'''-----------------------SCENARIO PARSING-----------------------'''
def parse_life(data):
    life_data = data.get('lifeExpectancy')
    # print("\n\n\n LIFE DATA:", life_data, "\n\n\n")
    length = 2 if data.get('maritalStatus') == 'couple' else 1
    # print(length)
    arr = []
    for i in range(length):
        dist_type = life_data[i].get('type')
        life = LifeExpectancy(
            type=dist_type
        )
        if dist_type == 'fixed':
            life.value = life_data[i].get('value')
        elif dist_type == 'normal':
            life.mean = life_data[i].get('mean')
            life.stdev = life_data[i].get('stdev')
        arr.append(life)
    # print(arr)
    return arr

def parse_inflation_assumption(data):
    inflat = data.get('inflationAssumption')
    inflat_type = inflat.get('type')
    inflation = Inflation(type=inflat_type)
    if inflat_type == 'fixed':
        inflation.value = inflat.get('value')
    elif inflat_type == 'normal':
        inflation.mean = inflat.get('mean')
        inflation.stdev = inflat.get('stdev')
    elif inflat_type == 'uniform':
        inflation.lower_bound = inflat.get('lower')
        inflation.upper_bound = inflat.get('upper')
    return inflation
 
def parse_roth_opt(data):
    return RothOptimizer(
        is_enable=data.get('RothConversionOpt'),
        start_year=data.get('RothConversionStart'),
        end_year=data.get('RothConversionEnd')
    )
    
'''-------------EXPORT SCENARIO-------------------'''

#investment type -> yaml format
def invest_type_to_yaml(invest_type):
    # print("HI YO")
    #invest type is a beanie document don't use .get() since it queries for id
    # print(invest_type.name)
    res = { #basic fields
        'name':invest_type.name,
        'description':invest_type.description,
        'expenseRatio':invest_type.expense_ratio,
        'taxability':invest_type.taxability
    }
    #returnDistribution stuff
    return_dist = invest_type.exp_annual_return
    res['returnAmtOrPct']= "percent" if return_dist.is_percent else "amount" #false set to "amount" otherwise set to "percent"
    return_dist_type = return_dist.type
    if return_dist_type == 'fixed':
        res['returnDistribution'] = {
            "type": return_dist_type,
            "value": return_dist.value
        }
    elif return_dist_type == 'normal':
        res['returnDistribution'] = {
            "type": return_dist_type,
            "mean": return_dist.mean,
            "stdev": return_dist.stdev   
        }
    
    #incomeDistribution stuff
    income_dist = invest_type.exp_annual_income
    res['incomeAmtOrPct']="percent" if income_dist.is_percent else "amount" #false set to "amount" otherwise set to "percent"
    income_dist_type = income_dist.type
    if income_dist_type == 'fixed':
        res['incomeDistribution'] = {
            "type": income_dist_type,
            "value": income_dist.value 
        }
    elif income_dist_type == 'normal':
        res['incomeDistribution'] = {
            "type": income_dist_type,
            "mean": income_dist.mean,
            "stdev": income_dist.stdev   
        }
    return res

def invest_to_yaml(invest):
    try:
        if invest.invest_type.name == "cash":
            invest_id = "cash"
        else:
            invest_id = invest.invest_type.name + " " + invest.tax_status
        return {
            "investmentType": invest.invest_type.name,
            "value": invest.value,
            "taxStatus": invest.tax_status,
            "id": invest_id
        }
    except Exception as e:
        print(f"error at invest_to_yaml: {e}")

def start_end_to_yaml(event_id, all_events, time_type):
    event_name = None
    for event in all_events:
        if event_id == str(event.id):
            event_name = event.name
        return {
            "type": time_type,
            "eventSeries": event_name
        }

async def event_to_yaml(event,all_events):
    try:
        res = {
            "name": event.name,
            "type": event.type
        }
        #get description if exist
        if event.description:
            res['description'] = event.description
        
        #process the start and duration
        start = event.start
        if start.type == 'fixed':
            res['start'] = {
                "type": start.type,
                "value": start.value
            }
        elif start.type == 'uniform':
            res['start'] = {
                "type": start.type,
                "lower": start.lower,
                "upper": start.upper
            }
        elif start.type == 'normal':
            res['start'] = {
                "type": start.type,
                "mean": start.mean,
                "stdev": start.stdev
            }
        elif start.type == 'start_with': #wrong
            event_id = start.event_series
            res['start'] = start_end_to_yaml(event_id, all_events, "startWith")
        
        elif start.type == 'end_with':
            event_id = start.event_series

            res['start'] = start_end_to_yaml(event_id, all_events, "endWith")
        
        duration = event.duration
        if duration.type == 'fixed':
            res['duration'] = {
                "type": duration.type,
                "value": duration.value
            }
        elif duration.type == 'uniform':
            res['duration'] = {
                "type": duration.type,
                "lower": duration.lower,
                "upper": duration.upper
            }
        elif duration.type == 'normal':
            res['duration'] = {
                "type": duration.type,
                "mean": duration.mean,
                "stdev": duration.stdev
            }
        elif duration.type == 'start_with':
            event_id = duration.event_series
            res['duration'] = start_end_to_yaml(event_id, all_events, "startWith")
        elif duration.type == 'end_with':
            event_id = duration.event_series
            res['duration'] = start_end_to_yaml(event_id, all_events, "endWith")
        
        #process by type 
        event_type = event.type
        
        if event_type == 'income':
            income = event.details
            res["initialAmount"] = income.initial_amt
            res["inflationAdjusted"] = income.inflation_adjust
            res["userFraction"] = income.user_split/100
            res["socialSecurity"] = income.social_security
            
            if income.exp_annual_change:
                res["changeAmtOrPct"] = "percent" if income.exp_annual_change.is_percent else "amount"
                
                if income.exp_annual_change.type == "fixed":
                    res["changeDistribution"] = {
                        "type": "fixed",
                        "value": income.exp_annual_change.value
                    }
                elif income.exp_annual_change.type == "uniform":
                    res["changeDistribution"] = {
                        "type": "uniform",
                        "lower": income.exp_annual_change.lower,
                        "upper": income.exp_annual_change.upper
                    }
                elif income.exp_annual_change.type == "normal":
                    res["changeDistribution"] = {
                        "type": "normal",
                        "mean": income.exp_annual_change.mean,
                        "stdev": income.exp_annual_change.stdev
                    }
            
        elif event_type == 'expense':
            expense = event.details
            res["initialAmount"] = expense.initial_amt
            res["inflationAdjusted"] = expense.inflation_adjust
            res["userFraction"] = expense.user_split/100
            res["discretionary"] = expense.is_discretionary
            
            if expense.exp_annual_change:
                res["changeAmtOrPct"] = "percent" if expense.exp_annual_change.is_percent else "amount"
                
                if expense.exp_annual_change.type == "fixed":
                    res["changeDistribution"] = {
                        "type": "fixed",
                        "value": expense.exp_annual_change.value
                    }
                elif expense.exp_annual_change.type == "uniform":
                    res["changeDistribution"] = {
                        "type": "uniform",
                        "lower": expense.exp_annual_change.lower,
                        "upper": expense.exp_annual_change.upper
                    }
                elif expense.exp_annual_change.type == "normal":
                    res["changeDistribution"] = {
                        "type": "normal",
                        "mean": expense.exp_annual_change.mean,
                        "stdev": expense.exp_annual_change.stdev
                    }
        elif event_type == 'invest':
            invest = event.details
            res["glidePath"] = invest.is_glide
            
            if invest.is_glide:
                alloc1 = {}
                alloc2 = {}
                for asset in invest.assets:
                    asset_id = PydanticObjectId(asset.invest_id.ref.id)
                    asset_obj = await Investment.get(asset_id, fetch_links=True)
                    asset_name = asset_obj.invest_type.name + " " + asset_obj.tax_status
                    alloc1[asset_name] = asset.initial
                    alloc2[asset_name] = asset.final
                res["assetAllocation"] = alloc1
                res["assetAllocation2"] = alloc2
            else:
                allocation = {}
                for asset in invest.assets:
                    asset_id = PydanticObjectId(asset.invest_id.ref.id)
                    asset_obj = await Investment.get(asset_id, fetch_links=True)
                    asset_name = asset_obj.invest_type.name + " " + asset_obj.tax_status
                    allocation[asset_name] = asset.percentage
                res["assetAllocation"] = allocation
            
            res["maxCash"] = invest.max_cash
        elif event_type == 'rebalance':
            rebalance = event.details
            res["glidePath"] = rebalance.is_glide
            
            if rebalance.is_glide:
                alloc1 = {}
                alloc2 = {}
                for asset in rebalance.assets:
                    asset_id = PydanticObjectId(asset.invest_id.ref.id)
                    asset_obj = await Investment.get(asset_id, fetch_links=True)
                    asset_name = asset_obj.invest_type.name + " " + asset_obj.tax_status
                    alloc1[asset_name] = asset.initial
                    alloc2[asset_name] = asset.final
                res["assetAllocation"] = alloc1
                res["assetAllocation2"] = alloc2
            else:
                allocation = {}
                for asset in rebalance.assets:
                    asset_id = PydanticObjectId(asset.invest_id.ref.id)
                    asset_obj = await Investment.get(asset_id, fetch_links=True)
                    asset_name = asset_obj.invest_type.name + " " + asset_obj.tax_status
                    allocation[asset_name] = asset.percentage
                res["assetAllocation"] = allocation
        return res
    except Exception as e:
        print(f"error at event_to_yaml {e}")
        
def life_to_yaml(data):
    arr = []
    for life in data:
        if life.type == 'fixed':
            arr.append({"type":life.type, "value":life.value})
        elif life.type == 'normal':
            arr.append({"type":life.type, "mean":life.mean, "stdev":life.stdev})
    return arr
def inflat_to_yaml(data):
    if data.type == 'fixed':
        return {"type": data.type, "value": data.value}
    elif data.type == 'normal':
        return {
            "type": data.type, 
            "mean": data.mean, 
            "stdev": data.stdev
                }
    elif data.type == 'uniform':
        return {
            "type": data.type, 
            "lower": data.lower_bound, 
            "upper": data.upper_bound
                }
    return None