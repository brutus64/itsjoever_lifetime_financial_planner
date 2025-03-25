from app.models.scenario import *
from app.models.investment import *
from app.models.event_series import *
from beanie.operators import Set, And
import yaml

'''----------------- INVESTMENT TYPE & INVESTMENT ---------------'''

def create_investment_type_from_yaml(data):
    # Parse the return distribution
    exp_annual_return, exp_annual_income = None, None
    return_distribution = data.get("returnDistribution", {})
    if return_distribution.get("type") == "fixed":
        exp_annual_return = InvestAnnualChange(
            type="fixed",
            fixed=Fixed(
                amt=return_distribution.get("value"),
                is_percent= True if data.get('returnAmtOrPct') == 'percent' else False
            ),
            normal=None
        )
    elif return_distribution.get("type") == "normal":
        exp_annual_return = InvestAnnualChange(
            type="normal",
            fixed=None,
            normal=Normal(
                mean=return_distribution.get("mean"),
                stdev=return_distribution.get("stdev"),
                is_percent= True if data.get('returnAmtOrPct') == 'percent' else False
            )
        )
    else:
        raise ValueError("Invalid returnDistribution type")

    # Parse the income distribution
    income_distribution = data.get("incomeDistribution", {})
    if income_distribution.get("type") == "fixed":
        exp_annual_income = InvestAnnualChange(
            type="fixed",
            fixed=Fixed(
                amt=income_distribution.get("value"),
                is_percent= True if data.get('incomeAmtOrPct') == 'percent' else False # Assuming it's not a percentage for fixed values
            ),
            normal=None
        )
    elif income_distribution.get("type") == "normal":
        exp_annual_income = InvestAnnualChange(
            type="normal",
            fixed=None,
            normal=Normal(
                mean=income_distribution.get("mean"),
                stdev=income_distribution.get("stdev"),
                is_percent= True if data.get('incomeAmtOrPct') == 'percent' else False  # Assuming it's a percentage for normal distributions
            )
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
    print("EXPECTED ANNUAL:", exp_ann)
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
    elif date_type in ["start_with, end_with"]:
        date.event_series = data.get('eventSeries')
    return date

def create_assetalloc(data):
    glide = data.get('glidePath')
    asset1 = data.get('assetAllocation')
    asset2 = data.get('assetAllocation2')
    print("ASSETTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:", asset1)
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
            detail_id = exists.id
        else:
            await income.save() #edits the income now to have id
            detail_id = income.id
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
            detail_id = exists.id
        else:
            await expense.save() #edits the income now to have id
            detail_id = expense.id
            
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
            detail_id = exists.id
        else:
            # Insert new document
            await invest.save()
            detail_id = invest.id
            
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
            detail_id = exists.id
        else:
            # Insert new document
            await rebalance.save()
            detail_id = rebalance.id
    print("ID IN THE END:", detail_id)
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
    length = 2 if data.get('martialStatus') == 'couple' else 1
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
        inflation.lower_bound = inflation.get('lower')
        inflation.upper_bound = inflation.get('upper')
    return inflation
 
def parse_roth_opt(data):
    return RothOptimizer(
        is_enable=data.get('RothConversionOpt'),
        start_year=data.get('RothConversionStart'),
        end_year=data.get('RothConversionEnd')
    )