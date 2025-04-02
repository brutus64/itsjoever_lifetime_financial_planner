from app.models.scenario import *
from app.models.investment import *
from app.models.event_series import *
from beanie.operators import And

'''----------------- INVESTMENT TYPE & INVESTMENT ---------------'''

def create_investment_type_from_yaml(data):
    # Parse the return distribution
    exp_annual_return, exp_annual_income = None, None
    return_distribution = data.get("returnDistribution", {})
    if return_distribution.get("type") == "fixed":
        exp_annual_return = InvestAnnualChange(
            type="fixed",
            value=return_distribution.get("value"),
            is_percent=True if data.get('returnAmtOrPct') == 'percent' else False,
            normal=None
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


def create_investment_from_yaml(data):
    investment = Investment(
        invest_type=data.get('investmentType'),
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
        date.event_series = data.get('eventSeries')
    return date

def create_assetalloc(data):
    glide = data.get('glidePath')
    asset1 = data.get('assetAllocation')
    asset2 = data.get('assetAllocation2')
    # print("ASSETTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:", asset1)
    arr = []
    for key, value in asset1.items():
        invest = None
        if glide:
            invest = GlideInvestment(
                invest_id=key,
                initial=value,
                final=asset2.get(key,1-value)
            )
        else:
            invest = FixedInvestment(
                invest_id=key,
                percentage=value
            )
        arr.append(invest) 
        #need to validate it == 1 later
    return arr

async def create_event_from_yaml(data):
    event_type = data.get('type')
    detail_id = None
    income, expense, invest, rebalance, res = None, None, None, None, None
    if event_type == 'income':
        income = Income(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction'),
            social_security=data.get('socialSecurity')
        )
        #NEED FIX
        exists = await Income.find_one(
            And(
                Income.initial_amt == income.initial_amt,
                Income.user_split == income.user_split
            )
        )
        if exists:
            exists.exp_annual_change = income.exp_annual_change
            exists.inflation_adjust = income.inflation_adjust
            exists.social_security = income.social_security
            await exists.save()
            detail_id = exists
        else:
            await income.save() #edits the income now to have id
            detail_id = income
    elif event_type == 'expense':
        expense = Expense(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction'),
            is_discretionary=data.get('discretionary')
        )
        exists = await Expense.find_one(
            And(
                Expense.initial_amt == expense.initial_amt,
                Expense.user_split == expense.user_split
            )
        )
        if exists:
            exists.exp_annual_change = expense.exp_annual_change
            exists.inflation_adjust = expense.inflation_adjust
            exists.is_discretionary = expense.is_discretionary
            await exists.save()
            detail_id = exists
        else:
            await expense.save() #edits the income now to have id
            detail_id = expense
            
    elif event_type == 'invest':
        invest = Invest(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data),
            max_cash=data.get('maxCash')
        )
        #NEED FIX
        exists = await Invest.find_one(
            And(
                Invest.is_glide == invest.is_glide,
                Invest.max_cash == invest.max_cash
            )
        )
        
        if exists:
            await exists.update({"$set": invest.model_dump(exclude={'id'})})
            detail_id = exists
        else:
            # Insert new document
            await invest.save()
            detail_id = invest
            
    elif event_type == 'rebalance':
        rebalance = Rebalance(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data)
        )
        # For rebalance, similar to invest
        exists = await Rebalance.find_one(
            Rebalance.is_glide == rebalance.is_glide
        )
        
        if exists:
            # Update exists document
            await exists.update({"$set": rebalance.model_dump(exclude={'id'})})
            detail_id = exists
        else:
            # Insert new document
            await rebalance.save()
            detail_id = rebalance
    # print("ID IN THE END:", detail_id)
    # print("EVENTFROMYAML START/DURATION", data.get('start'), data.get('duration'))
    event = EventSeries(
        name=data.get('name'),
        description=data.get('description'),
        start=event_date_parse(data.get('start')),
        duration=event_date_parse(data.get('duration')),
        type=event_type,
        details=detail_id #NEED FIX
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
    return {
        "investmentType": invest.invest_type,
        "value": invest.value,
        "taxStatus": invest.tax_status,
        "id": invest.invest_id
    }

def event_to_yaml(event):
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
    elif start.type == 'start_with':
        res['start'] = {
            "type": "startWith",
            "eventSeries": start.event_series
        }
    elif start.type == 'end_with':
        res['start'] = {
            "type": "endWith",
            "eventSeries": start.event_series
        }
    
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
        res['duration'] = {
            "type": "startWith",
            "eventSeries": duration.event_series
        }
    elif duration.type == 'end_with':
        res['duration'] = {
            "type": "endWith",
            "eventSeries": duration.event_series
        }
    
    #process by type 
    event_type = event.type
    
    if event_type == 'income':
        income = event.details
        res["initialAmount"] = income.initial_amt
        res["inflationAdjusted"] = income.inflation_adjust
        res["userFraction"] = income.user_split
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
        res["userFraction"] = expense.user_split
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
                alloc1[asset.invest_id] = asset.initial
                alloc2[asset.invest_id] = asset.final
            res["assetAllocation"] = alloc1
            res["assetAllocation2"] = alloc2
        else:
            allocation = {}
            for asset in invest.assets:
                allocation[asset.invest_id] = asset.percentage
            res["assetAllocation"] = allocation
        
        res["maxCash"] = invest.max_cash
    elif event_type == 'rebalance':
        rebalance = event.details
        res["glidePath"] = rebalance.is_glide
        
        if rebalance.is_glide:
            alloc1 = {}
            alloc2 = {}
            for asset in rebalance.assets:
                alloc1[asset.invest_id] = asset.initial
                alloc2[asset.invest_id] = asset.final
            res["assetAllocation"] = alloc1
            res["assetAllocation2"] = alloc2
        else:
            allocation = {}
            for asset in rebalance.assets:
                allocation[asset.invest_id] = asset.percentage
            res["assetAllocation"] = allocation
    
    return res

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