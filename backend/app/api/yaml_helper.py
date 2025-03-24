from app.models.scenario import Scenario
from app.models.investment import *
from app.models.event_series import *
from beanie.operators import Set
import yaml

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
    income, expense, invest, rebalance, res = None, None, None, None, None
    if event_type == 'income':
        income = Income(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction'),
            social_security=data.get('socialSecurity')
        )
        res = await Income.find_one(income.id == Income.id).upsert(
            Set(income.model_dump(exclude={'id'})),
            on_insert=income
        )
        print("INCOME RES:", res)
    elif event_type == 'expense':
        expense = Expense(
            initial_amt=data.get('initialAmount'),
            exp_annual_change= create_exp_annual(data),
            inflation_adjust=data.get('inflationAdjusted'),
            user_split=data.get('userFraction'),
            is_discretionary=data.get('discretionary')
        )
        res = await Expense.find_one(expense.id == Expense.id).upsert(
            Set(expense.model_dump(exclude={'id'})),
            on_insert=expense
        )
        print("EXPENSE", res)
    elif event_type == 'invest':
        invest = Invest(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data),
            max_cash=data.get('maxCash')
        )
        res = await Invest.find_one(invest.id == Invest.id).upsert(
            Set(invest.model_dump(exclude={'id'})),
            on_insert=invest
        )
        print("INVEST", res)
    elif event_type == 'rebalance':
        rebalance = Rebalance(
            is_glide=data.get('glidePath', False),
            assets=create_assetalloc(data)
        )
        res = await Rebalance.find_one(rebalance.id == Rebalance.id).upsert(
            Set(rebalance.model_dump(exclude={'id'})),
            on_insert=rebalance
        )
        print("REBALANCE", res)
    print("ID IN THE END:", res.id)
    event = EventSeries(
        name=data.get('name'),
        description=data.get('description'),
        start=event_date_parse(data.get('start')),
        duration=event_date_parse(data.get('duration')),
        type=event_type,
        details=res.id
    )
    return event