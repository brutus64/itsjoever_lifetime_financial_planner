from app.models.event_series import *
from app.models.scenario import *


'''-----------------INVESTMENT_TYPE------------------'''
def parse_invest_type(invest_type):
    
    #basic data
    invest_type_name = invest_type['name']
    invest_type_description = invest_type['description']
    invest_type_expense_ratio = invest_type['expense_ratio']
    invest_type_tax = invest_type['is_tax_exempt']
    
    #expected annual return
    if invest_type['exp_annual_return']['type'] == 'fixed':
        exp_annual_return_type = 'fixed'
        value = invest_type['exp_annual_return']['fixed']
        is_percent=invest_type['exp_annual_return']['is_percent']
        #invest annual change
        return_iac = {
            'type': exp_annual_return_type,
            'value':value,
            'is_percent': is_percent
        }
    else:
        exp_annual_return_type = 'normal'
        mean = invest_type['exp_annual_return']['mean']
        std = invest_type['exp_annual_return']['stddev']
        is_percent=invest_type['exp_annual_return']['is_percent']
        return_iac = {
            'type':exp_annual_return_type,
            'mean': mean,
            'stdev':std,
            'is_percent':is_percent
        }
        
    #expected annual income
    if invest_type['exp_annual_income']['type'] == 'fixed':
        exp_annual_income_type = 'fixed'
        value = invest_type['exp_annual_income']['fixed']
        is_percent=invest_type['exp_annual_income']['is_percent']
        #invest annual change
        income_iac = {
            'type': exp_annual_income_type,
            'value':value,
            'is_percent': is_percent
        }
    else:
        exp_annual_income_type = 'normal'
        mean = invest_type['exp_annual_income']['mean']
        std = invest_type['exp_annual_income']['stddev']
        is_percent=invest_type['exp_annual_income']['is_percent']
        income_iac = {
            'type':exp_annual_income_type,
            'mean': mean,
            'stdev':std,
            'is_percent':is_percent
        }
    
    #investment_type dictionary
    investment_type = {
        'name': invest_type_name, 
        'description': invest_type_description,
        'exp_annual_return': return_iac,'expense_ratio':invest_type_expense_ratio,'exp_annual_income': income_iac,
        'taxability':invest_type_tax
    }
    return investment_type

'''---------------------------INVESTMENT-------------------------------------'''
def parse_investments(investment):
    invest_type = investment['investment_type']
    tax_status_mapping = {
        'non-retirement': 'non-retirement',
        'pre-tax-retirement': 'pre-tax',
        'after-tax-retirement': 'after-tax'
    }
    tax_status = tax_status_mapping[investment['tax_status']]
    val = investment['value']
    i_id = invest_type+ " " + tax_status #CHECK NOT SURE ABOUT THIS
    
    investment = {
        'invest_type':invest_type,
        'invest_id':i_id,
        'value': val,
        'tax_status':tax_status
    }
    return investment

def parse_event_date(date):
    date_type = date['type']
    ret = {
        'type': date_type,
    }
    if date_type == 'fixed':
        ret['value'] = date['fixed']
    elif date_type == 'uniform':
        ret['lower'] = date['min']
        ret['upper'] = date['max']
    elif date_type == 'normal':
        ret['mean'] = date['mean']
        ret['stdev'] = date['stddev']
    elif date_type == 'start_with' or date_type == 'end_with':
        ret['event_series'] = date['event_series']
    return ret

def parse_event_ann_change(ann_change):
    ann_type = ann_change.get('type', 'fixed')
    change = {
        "type":ann_type,
        "is_percent": False if ann_change.get('is_percent', 'false') == 'false' else True #apparently a string
    }
    if ann_type == 'fixed':
        change['value'] = ann_change.get('fixed', 0)
    elif ann_type == 'uniform':
        change['lower'] = ann_change.get('min', 0)
        change['upper'] = ann_change.get('max', 0)
    elif ann_type == 'normal':
        change['mean'] = ann_change.get('mean', 0)
        change['stdev'] = ann_change.get('stddev', 1)
    # 'exp_annual_change': {'is_percent': 'false', 'type': 'fixed', 'fixed': 0, 'mean': 0, 'stddev': 1, 'min': 0, 'max': 0, 'undefined': '04'}, 
    return change
    
def parse_fixed_investment(initial):
    assets = []
    for invest_id, value in initial.items():
        assets.append(FixedInvestment(
            invest_id=invest_id,
            percentage=float(value) / 100
        ))
    return assets

def parse_glide_investment(initial, final):
    assets = []
    investment_ids = set(initial.keys()) | set(final.keys())
    
    for invest_id in investment_ids:
        initial_pct = float(initial.get(invest_id, 0)) / 100
        final_pct = float(final.get(invest_id, 0)) / 100
        
    assets.append(GlideInvestment(
            invest_id=invest_id,
            initial=initial_pct,
            final=final_pct
        ))
    return assets
    
'''--------------------------------EVENT SERIES-------------------------------------------'''
def parse_events(event):
    # print("Parse events currently")
    # print(event)
    #processing needed:
    start = EventDate(**parse_event_date(event['start_year']))
    duration = EventDate(**parse_event_date(event['duration']))
    
    #separation needed:
    event_type = event['type']
    details = {}
    if event_type == 'income':
        details = Income(
            initial_amt=float(event.get('initial_amt', 0)),
            exp_annual_change= EventAnnualChange(**parse_event_ann_change(event.get('exp_annual_change', {}))),
            user_split=float(event.get('user_split', 0)),
            social_security= event.get('social_security'),
            inflation_adjust= event.get('inflation_adjust') #NOTHING
        )
    elif event_type == 'expense':
        details = Expense(
            initial_amt=float(event.get('initial_amt', 0)),
            exp_annual_change=EventAnnualChange(**parse_event_ann_change(event.get('exp_annual_change', {}))),
            user_split=float(event.get('user_split', 0)),
            is_discretionary=event.get('is_discretionary'),
            inflation_adjust=event.get('inflation_adjust', False)#NOTHING

        )
    #NEED TO FIX THE STUFF HERE
    elif event_type == 'invest':
        assets = []
        is_glide = event.get('is_glide', False)
        
        if not is_glide: #FixedInvestment
            assets = parse_fixed_investment(event.get('initial', {}))
        else:
            assets = parse_glide_investment(
                event.get('initial', {}),
                event.get('final', {})
            )
        
        details = Invest(
            is_glide=is_glide,
            assets=assets,
            max_cash=float(event.get('max_cash',0))
        )
    elif event_type == 'rebalance':
        is_glide = event.get('is_glide', False)
        if not is_glide: #FixedInvestment
            assets = parse_fixed_investment(event.get('initial', {}))
        else:
            assets = parse_glide_investment(
                event.get('initial', {}),
                event.get('final', {})
            )
        details = Rebalance(
            is_glide=is_glide,
            assets=assets
        )
        
        # event.tax_status #APPARENTLY Rebalance has tax-status
        #I guess if we do need tax_status just grab from event_series initial_allocation 2nd half after "|" and just not store in db?
        
    return {
        'name': event.get('name',''),
        'descripton': event.get('description', ''),
        'start': start,
        'duration': duration,
        'type': event_type,
        'details': details
    }

def parse_float(f):
    return float(f) if f else None

def parse_life_expectancy(life_expect):
    # print("LIFE EXPECTANCY")
    # print(life_expect)
    res = []
    
    for life in life_expect:
        life_type = life.get('type')
        if life_type == 'fixed':
            res.append(LifeExpectancy(
                type='fixed',
                value=parse_float(life.get('value'))
            ))
        elif life_type == 'normal':
            res.append(LifeExpectancy(
                type='normal',
                mean=parse_float(life.get('mean')),
                stdev=parse_float(life.get('stdev'))
            ))
        elif life_type == 'uniform':
            res.append(LifeExpectancy(
                type='uniform',
                lower=parse_float(life.get('min')),
                upper=parse_float(life.get('max'))
            ))
        
    return res

def parse_inflation(inflation):
    # print("INFLATION")
    # print(inflation)
    inflation_type = inflation.get('type', 'fixed')
    res = {'type': inflation_type}
    
    if inflation_type == 'fixed':
        fixed_value = inflation.get('value')
        res['value'] = parse_float(fixed_value)
    elif inflation_type == 'normal':
        res['mean'] = parse_float(inflation.get('mean'))
        res['stdev'] = parse_float(inflation.get('stdev'))
    elif inflation_type == 'uniform':
        res['lower'] = parse_float(inflation.get('min'))
        res['upper'] = parse_float(inflation.get('max'))
    
    return res
def parse_roth_optimizer(optimizer):
    # print("OPTIMIZER")
    # print(optimizer)
    is_enable = optimizer.get('is_enable', False)
    if isinstance(is_enable, str): #could be string for all I know
        is_enable = is_enable.lower() == 'true'
    
    start_year = optimizer.get('start_year', 2025)
    if isinstance(start_year, str): #could be string for all I know
        if start_year.strip() == '':
            start_year = 2025
        else:
            try:
                start_year = int(start_year)
            except ValueError:
                start_year = 2025
    
    end_year = optimizer.get('end_year', 2040)
    if isinstance(end_year, str): #could be string for all I know
        if end_year.strip() == '':
            end_year = 2040
        else:
            try:
                end_year = int(end_year)
            except ValueError:
                end_year = 2040
    
    return {
        'is_enable': is_enable,
        'start_year': start_year,
        'end_year': end_year
    }