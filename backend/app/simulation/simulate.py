from multiprocessing import Pool
from threading import Semaphore
from numpy.random import normal, uniform
from numpy import percentile
from datetime import datetime
from statistics import mean, median
import os
import sys
import math
import csv
import copy
from app.models.tax import StateTax, FederalTax, CapitalGains, RMDTable, StandardDeduct
from collections import defaultdict
# from app.models.simulation import Simulation

LOG_DIRECTORY = f"{sys.path[0]}/logs"
START_YEAR = 2025

# I dont know how to make process pool global without
# running into shutdown issues

# use a centralized Simulator to ensure only one simulation is simulated
# at a time
class Simulator: # is this necessary?
    pass

# using objects will make referencing easier and cleaner
# otherwise, we would have to use .get() and .set() or brackets

# object that may vary between types
class Vary:
    def __init__(self,obj):
        self.type = obj["type"]
        if obj["type"] == "fixed":
            self.value = obj["value"]
        elif obj["type"] == "normal":
            self.mean = obj["mean"]
            self.stdev = obj["stdev"]
        else:
            self.lower = obj["lower"] if "lower" in obj else obj["lower_bound"]
            self.upper = obj["upper"] if "upper" in obj else obj["upper_bound"]
        
    def generate(self):
        if self.type == "fixed":
            return self.value
        elif self.type == "normal":
            return normal(self.mean,self.stdev)
        else:
            return uniform(self.lower,self.upper)

# flatten investment and investment type
# note that there may be new investments created during the simulation
# that would not be in the scenario object
class Investment:
    def __init__(self,investment):
        self.id = investment["id"] # just in case
        self.value = investment["value"]
        self.purchase = investment["value"] # this is the amount of money put into the investment
        self.tax_status = investment["tax_status"]
        self.name = investment["invest_type"]["name"]
        self.exp_ret = Vary(investment["invest_type"]["exp_annual_return"])
        self.exp_ret_percent = investment["invest_type"]["exp_annual_return"]["is_percent"]
        self.exp_inc = Vary(investment["invest_type"]["exp_annual_income"])
        self.exp_inc_percent = investment["invest_type"]["exp_annual_income"]["is_percent"]
        self.taxability = investment["invest_type"]["taxability"]
        self.expense_ratio = investment["invest_type"]["expense_ratio"]
        
    # update investment value, return taxable income
    def update(self):
        start_val = self.value
        # 4a: calculate generated income
        inc = self.exp_inc.generate()
        if self.exp_inc_percent:
            inc = self.value * (inc*0.01)

        # 4d: calculate change in value
        ret_val = self.exp_ret.generate()
        if self.exp_ret_percent:
            self.value *= (1+ret_val*0.01)
        else:
            self.value += ret_val

        # 4c: add income back to investment
        self.value += inc
        self.purchase += inc

        # 4e: calculate expenses
        avg = (self.value + start_val) / 2
        self.value -= avg * self.expense_ratio*0.01
        
        # 4b: determine taxability
        return inc if self.taxability and self.tax_status == "non-retirement" else 0
    
class EventSeries:
    def __init__(self,event_series):
        self.id = event_series["id"]
        self.name = event_series["name"] # for graphing and logging
        self.start = event_series["start"] #resolved later
        self.duration = Vary(event_series["duration"]) # round to nearest integer, must be positive
        
# income event series
class Income(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        self.amt = event_series["details"]["initial_amt"]
        self.exp_change = Vary(event_series["details"]["exp_annual_change"])
        self.exp_change_percent = event_series["details"]["exp_annual_change"]["is_percent"]
        self.inflation_adjust = event_series["details"]["inflation_adjust"]
        self.user_split = event_series["details"]["user_split"]
        self.social_security = event_series["details"]["social_security"]
        
# expense event seriess
class Expense(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        self.amt = event_series["details"]["initial_amt"]
        self.exp_change = Vary(event_series["details"]["exp_annual_change"])
        self.exp_change_percent = event_series["details"]["exp_annual_change"]["is_percent"]
        self.inflation_adjust = event_series["details"]["inflation_adjust"]
        self.user_split = event_series["details"]["user_split"]
        self.is_discretionary = event_series["details"]["is_discretionary"]
        
# invest event series
class Invest(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        self.max_cash = event_series["details"]["max_cash"]
        # assets will be stored in a size-3 array: [investment object, start, end] (for fixed, start = end)
        if event_series["details"]["is_glide"]:
            self.assets = [] 
            for asset in event_series["details"]["assets"]:
                investment = asset["invest_id"]["id"]
                initial = asset["initial"]
                final = asset["final"]
                self.assets.append([investment,initial,final])
        else:
            self.assets = [[asset["invest_id"]["id"],asset["initial"],asset["final"]] for asset in event_series["details"]["assets"]]
    
# rebalance event series
class Rebalance(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        # assets will be stored in a size-3 array: [investment object, start, end] (for fixed, start = end)
        if event_series["details"]["is_glide"]:
            self.assets = [] 
            for asset in event_series["details"]["assets"]:
                investment = asset["invest_id"]["id"]
                initial = asset["initial"]
                final = asset["final"]
                self.assets.append([investment,initial,final])
        else:
            self.assets = [[asset["invest_id"]["id"],asset["initial"],asset["final"]] for asset in event_series["details"]["assets"]]

class Tax: # store tax rates and rmds
    def __init__(self,state):
        self.state = state
        self.early_withdrawal = 0.1
    
    async def fetch_tax(self):
        self.federal_tax = await FederalTax.find_one()
        self.state_tax = await StateTax.find_one(StateTax.state == self.state)
        self.capital_gains = await CapitalGains.find_one()
        self.standard_deductions = await StandardDeduct.find_one()
        self.rmd = await RMDTable.find_one()

    def calculate_rmd(self,age):
        pass

    def calculate_tax(self,is_married):
        pass


# store simulation state from scenario
class Simulation:
    def __init__(self,scenario):
        self.investments = [Investment(investment) for investment in scenario.get("investment")]
        self.new_investments = [] # for new investments created during the simulation (dont forget to add these to regular investments at the end)
        # create a reference to the cash investment
        for investment in self.investments:
            if investment.name == "cash":
                self.cash = investment 
                break
        self.event_series = [] # used later on to resolve event series start dates
        self.income = []
        self.expenses = []
        self.invest_strat = []
        self.rebalance = []
        for es in scenario.get("event_series"):
            t = es.get("type")
            if t == "income":
                inc = Income(es)
                self.event_series.append(inc)
                self.income.append(inc)
            elif t == "expense":
                exp = Expense(es)
                self.event_series.append(exp)
                self.expenses.append(exp)
            elif t == "invest":
                inv = Invest(es)
                self.event_series.append(inv)
                self.invest_strat.append(inv)
            elif t == "rebalance":
                re = Rebalance(es)
                self.event_series.append(re)
                self.rebalance.append(re)
        
        # resolve ids to object references
        # places that require Investment objects: invest/rebalance event series, and strategies
        id_to_obj = {investment.id:investment for investment in self.investments}
        for es in self.invest_strat:
            for asset in es.assets:
                asset[0] = id_to_obj[asset[0]]
        for es in self.rebalance:
            for asset in es.assets:
                asset[0] = id_to_obj[asset[0]]
        self.expense_withdraw = [id_to_obj[investment["id"]] for investment in scenario.get("expense_withdraw")]
        self.rmd_strat = [id_to_obj[investment["id"]] for investment in scenario.get("rmd_strat")]
        
        self.roth_strat = [id_to_obj[investment["id"]] for investment in scenario.get("roth_conversion_strat")]
        self.roth_enable = scenario.get("roth_optimizer").get("is_enable")
        if self.roth_enable:
            self.roth_start = scenario.get("roth_optimizer").get("start_year")
            self.roth_end = scenario.get("roth_optimizer").get("end_year")
        
        # places that require Event series objects: spending strategy
        id_to_obj = {es.id:es for es in self.expenses if es.is_discretionary}
        self.spending_strat = [id_to_obj[es["id"]] for es in scenario.get("spending_strat")]
        # other important data
        self.name = scenario.get("name") # needed?
        self.fin_goal = scenario.get("fin_goal")
        self.inflation = Vary(scenario.get("inflation_assume"))
        self.limit_posttax = scenario.get("limit_posttax")
        self.user_birth = scenario.get("birth_year")[0]
        self.user_life = Vary(scenario.get("life_expectancy")[0])
        self.is_married = scenario.get("marital") == "couple"
        if self.is_married:
            self.spouse_birth = scenario.get("birth_year")[1]
            self.spouse_life = Vary(scenario.get("life_expectancy")[1])
        self.state = scenario.get("state")
    
    # dfs to get a fixed year for event start times
    def resolve_event_time(self):
        # resolve durations
        for es in self.event_series:
            es.duration = max(1,math.floor(es.duration.generate() + 0.5))
        # resolve ids
        # starts_with and ends_with are both ids
        id_to_es = {es.id:es for es in self.event_series}
        visited = set() # visited during dfs, but may not be resolved
        resolved = set()
        def dfs(es):
            if es.id in resolved: # Start date already resolved
                return es.start 
            if es.id in visited: # Cycle detected, set to default
                resolved.add(es.id)
                return 2025 
            visited.add(es.id)
            if es.start["type"] == "start_with": 
                es.start = dfs(id_to_es[es.start["event_series"]])
            elif es.start["type"] == "end_with":
                es.start = dfs(id_to_es[es.start["event_series"]]) + id_to_es[es.start["event_series"]].duration
            else:
                es.start = math.floor(0.5+Vary(es.start).generate())
            resolved.add(es.id)
            return es.start

        for es in self.event_series:
            dfs(es)

# data for a particular year in a simulation
class YearlyResults:
    def __init__(self,year):
        self.year = year
        self.success = False
        self.investments = [] # list of tuples (investment identifier, value)
        self.total_investments = 0
        self.income = [] # list of tuples (income identifier, value)
        self.total_income = 0
        self.expenses = [] # not including taxes, list of tuples (expense identifier, value)
        self.taxes = [] # list of tuples (tax identifier, value)
        self.total_expenses = 0 # includes expense event series and taxes
        self.early_withdrawal_tax = 0 
        self.discretionary_percent = 0 # discretionary expenses paid / total discretionary



# set of n simulations
async def simulate_n(scenario,n,user):
    # get tax data for scenario's state, federal tax, and rmd table
    
    # two processes do not use the same address space, so it is
    # actually fine to create the simulation objects in the
    # simulate_n function, then pass them in to simulate()
    # using a big dictionary is too annoying
    # create simulation objects based on scenario objects that will
    # change over time

    simulation_state = Simulation(scenario)
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()
    # testing:
    simulate_log(simulation_state,tax_data,user)

    # spawn processes
    # results = []
    # with Pool() as pool:
    #     log_result = pool.apply_async(simulate_log,args=(simulation_state,tax_data,user,))
    #     results.append(log_result)
    #     for _ in range(n-1):
    #         result = pool.apply_async(simulate,args=(simulation_state,tax_data,None,None,))
    #         results.append(result)
    #     # get all simulation results
    #     print("Getting results...")
    #     results = [result.get() for result in results]
    # print(results)
    # aggregate results by category, then year
    # calculate success probability in each year for chart 4.1
    # the "totals", early-withdrawal, and percent-total-discretion must store
    # all values across the n simulations for chart 4.2
    # for individual investment, expense (including taxes), and income, only 
    # store the mean and medians for chart 4.3
    # aggregated = aggregate(results)

    # store aggregated results in db to be viewed later
    # return id of simulation set
    return ""

# nesting hell
def aggregate(results):
    agg_results = {}

    # Chart 4.1: Probability of success
    # Chart 5.1 also needs this
    success_totals = defaultdict(lambda:[0,0]) # year -> [successes,total]
    for result in results:
        for yearly_result in result:
            if yearly_result.success:
                success_totals[yearly_result.year][0] += 1
            success_totals[yearly_result.year][1] += 1
    agg_results["success"] = {year:(successes/total) for year,(successes,total) in success_totals.items()}

    # Chart 4.2: Percentiles
    # 4.2a: Total investments
    # 4.2b: Total income
    # 4.2c: Total expenses
    # 4.2d: Early withdrawal
    # 4.2e: Percent discretionary
    # Chart 5.1 only needs the median of total investments
    # category --> year --> percentiles
    percentiles = {}
    yearly_arrays = {}
    categories = ["total_investments","total_income","total_expenses","early_withdrawal","percent_discretionary"]
    desired_percents = list(range(0,101,10)) # every 10-th percentile

    for category in categories:
        percentiles[category] = {}
        yearly_arrays[category] = defaultdict(list)

    # there is probably a data analysis library out there
    for result in results:
        for yr in result:
            year = yr.year
            yearly_arrays["total_investments"][year].append(yr.total_investments)
            yearly_arrays["total_income"][year].append(yr.total_income)
            yearly_arrays["total_expenses"][year].append(yr.total_expenses)
            yearly_arrays["early_withdrawal"][year].append(yr.early_withdrawal)
            yearly_arrays["percent_discretionary"][year].append(yr.percent_discretionary)
    
    # find percentiles for every category in every year
    for category in categories:
        for year,values in yearly_arrays[category].items():
            percentiles[category][year] = percentile(values,desired_percents) # need to convert to list?
    agg_results["percentiles"] = percentiles
        
    # Chart 4.3: Breakdowns
    # 4.3a: total investment by investment
    # 4.3b: total income by event series
    # 4.3c: total expense by event series
    # Note: mean of total values equals the sum of means of its sub-parts
    # Note 2: median total value does not necessarily equal sum of medians of its sub-parts
    # Thus, we cannot re-use results from 4.2
    # category --> year --> individual parts --> mean/median
    breakdowns = defaultdict(lambda:defaultdict(dict)) # mean, median
    yearly_arrays = defaultdict(lambda:defaultdict(lambda:defaultdict(list)))
    for result in results:
        for yr in result:
            year = yr.year
            for investment,value in yr.investments:
                yearly_arrays["investments"][year][investment].append(value)

            for es,value in yr.income:
                yearly_arrays["income"][year][es].append(value)

            for es,value in yr.expenses:
                yearly_arrays["expenses"][year][es].append(value)

            for tax,value in yr.taxes:
                yearly_arrays["expenses"][year][tax].append(value)
    
    categories = ["investments","income","expenses"]
    for category in categories:
        for year, instances in yearly_arrays[category].items():
            for instance,values in instances.items():
                breakdowns[category][year][instance] = [mean(values),median(values)]
    agg_results["breakdowns"] = breakdowns

    return agg_results

def fin_format(year,trans_type,amt,details):
    return f"{year}\t{trans_type}\t{round(amt,2)}\t{details}\n"

def fin_write(fin_log,msg):
    if fin_log:
        fin_log.write(msg)

def inv_write(inv_writer,year,investments):
    if inv_writer:
        row = [year] + [investment.value for investment in investments]
        inv_writer.writerow(row)

# one simulation in a set of simulations
# each simulation would have to make a copy of each investment
# returns a list of YearlyResults objects
def simulate(simulation: Simulation,tax_data: Tax, fin_log, inv_writer):
    res = [] # yearly data
    # resolve event series durations and start times (in that order)
    simulation.resolve_event_time()

    # resolve life expectancy to determine main loop range
    simulation.user_life = math.floor(0.5+simulation.user_life.generate())
    if simulation.is_married:
        simulation.spouse_life = math.floor(0.5+simulation.spouse_life.generate())

    # tax values from previous year
    prev_income = 0 # income
    prev_ss = 0 # social security
    prev_ew = 0 # early withdrawals
    prev_cg = 0 # capital gains
    
    # main loop
    for year in range(START_YEAR,simulation.user_birth + simulation.user_life):
        year_result = YearlyResults(year)
        user_age = year - simulation.user_birth
        spouse_age = year-simulation.spouse_birth if simulation.is_married else None
        spouse_alive = simulation.is_married and year < simulation.spouse_birth + simulation.spouse_life

        cur_income = 0
        cur_ss = 0  # Social Security benefits
        cur_cg = 0  # Capital gains
        cur_ew = 0  # Early withdrawals from retirement accounts

        # Step 1: Inflation
        inflation_rate = 1 + simulation.inflation.generate() / 100
        
        if year != START_YEAR:
            # Update all brackets
            for bracket in tax_data.federal_tax.single_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
            for bracket in tax_data.federal_tax.married_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
            if tax_data.state_tax:
                tax_data.state_tax.single_deduct *= inflation_rate
                tax_data.state_tax.married_deduct *= inflation_rate
                for bracket in tax_data.state_tax.single_bracket:
                    bracket.min_income *= inflation_rate
                    bracket.max_income *= inflation_rate
                for bracket in tax_data.state_tax.married_bracket:
                    bracket.min_income *= inflation_rate
                    bracket.max_income *= inflation_rate
            for bracket in tax_data.capital_gains.single_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
            for bracket in tax_data.capital_gains.married_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
            tax_data.standard_deductions.single_deduct *= inflation_rate
            tax_data.standard_deductions.married_deduct *= inflation_rate
            simulation.limit_posttax *= inflation_rate
        
        # Step 2: Income
        for income in simulation.income:
            # check to see if it is active
            if year >= income.start and year < income.start + income.duration:
                # do not do the following actions on the first year
                if year != income.start:
                    # calculate annual change
                    if income.exp_change_percent:
                        income.amt *= (1+income.exp_change.generate()/100)
                    else:
                        income.amt += income.exp_change.generate()

                    # adjust inflation if needed
                    if income.inflation_adjust and year != START_YEAR:
                        income.amt *= inflation_rate
                
                inc = income.amt
                # omit spouse percentage
                if simulation.is_married and not spouse_alive:
                    inc *= income.user_split

                # update cash investment
                simulation.cash.value += inc
                fin_write(fin_log,fin_format(year,"income",inc,income.name))
                
                # update income
                cur_income += inc
                # update ss
                if income.social_security:
                    cur_ss += inc
                
        # Step 3: RMD
        if user_age >= 74:
            # get distribution period
            dist_period = -1
            for entry in tax_data.rmd.table:
                if entry.age == user_age:
                    dist_period = entry.distribution_period
                    break
            
            # sum values of pre-tax investments
            pre_value = 0
            for investment in simulation.investments:
                if investment.tax_status == "pre-tax" and investment.value > 0:
                    pre_value += investment.value
            
            rmd = pre_value / dist_period
            cur_income += rmd

            # we need a way of pre-making transfer-in-kind investments for investments in rmd and roth
            # note: pre-tax is not affected by capital-gains

            # pay the rmd
            for investment in simulation.rmd_strat:
                if rmd == 0:
                    break
                if investment.value <= 0:
                    continue

                # find the target investment, creating one if needed
                target = None
                for candidate in simulation.investments:
                    if candidate.name == investment.name and candidate.tax_status == "non-retirement":
                        target = candidate
                        break
                if not target:
                    target = copy.copy(investment) # only shallow-copy is necessary
                    target.tax_status = "non-retirement"
                    target.value = 0
                    target.purchase = 0
                
                # transfer amounts
                withdraw_amt = min(rmd,investment.value)
                target.value += withdraw_amt
                investment.value -= withdraw_amt
                rmd -= withdraw_amt
                if investment.purchase > investment.value:
                    # transfer the purchase amount
                    diff = investment.purchase - investment.value
                    target.purchase += diff
                    investment.purchase -= diff
                fin_write(fin_log,fin_format(year,"RMD",withdraw_amt,investment.name))
                if rmd == 0:
                    break

        # Step 4: Investments
        for investment in simulation.investments:
            # no logging required
            # update() returns the taxable income from interest and dividends
            taxable_income = investment.update()
            cur_income += taxable_income

        # Step 5: Roth
        # determine if roth optimizer is active for current year
        
        if simulation.roth_enable and year >= simulation.roth_start and year < simulation.roth_end:
            # determine which brackets and deductions
            if spouse_alive:
                cur_deduction = tax_data.standard_deductions.married_deduct
                brackets = tax_data.federal_tax.married_bracket
            else:
                cur_deduction = tax_data.standard_deductions.single_deduct
                brackets = tax_data.federal_tax.single_bracket
            cur_federal_income = cur_income - 0.15*cur_ss

            # find the upper-limit of the user's tax brackets
            upper_limit = 0
            for bracket in brackets:
                if bracket.max_income >= cur_federal_income:
                    upper_limit = bracket.max_income
                    break
            roth_conversion = upper_limit - (cur_federal_income - min(cur_deduction,cur_federal_income))
            cur_income += roth_conversion
            # transfer pre-tax to after-tax based on strategy
            for investment in simulation.roth_strat:
                if roth_conversion == 0:
                    break
                if investment.value <= 0:
                    continue

                # find the target investment, creating one if needed
                target = None
                for candidate in simulation.investments:
                    if candidate.name == investment.name and candidate.tax_status == "after-tax":
                        target = candidate
                        break
                if not target:
                    target = copy.copy(investment) # only shallow-copy is necessary
                    target.tax_status = "after-tax"
                    target.value = 0
                    target.purchase = 0
                
                # transfer amounts
                transfer_amt = min(roth_conversion,investment.value)
                target.value += transfer_amt
                investment.value -= transfer_amt
                roth_conversion -= transfer_amt
                if investment.purchase > investment.value:
                    # transfer the purchase amount
                    diff = investment.purchase - investment.value
                    target.purchase += diff
                    investment.purchase -= diff
                
                fin_write(fin_log,fin_format(year,"Roth",transfer_amt,investment.name))



            


        # Step 6: Expenses and Taxes


        # Step 7: Discretionary Expenses
        total_assets = total_inv_value(simulation.investments)
        withdraw_index = 0
        for disc_event in simulation.spending_strat:
            if total_assets <= simulation.fin_goal:
                break
            amt = min(disc_event.amt, total_assets - simulation.fin_goal)
            while amt > 0 and withdraw_index < len(simulation.expense_withdraw):
                investment = simulation.expense_withdraw[withdraw_index]
                w = min(amt, investment.value)
                amt -= w
                investment.value -= w
                total_assets -= w
                if investment.value ==0:
                    withdraw_index+=1

        # Step 8: Invest
        for invest_strategy in simulation.invest_strat:
            execess_cash = simulation.cash.value - invest_strategy.max_cash
            if execess_cash > 0:
                total_years = invest_strategy.duration
                years_elapsed = year - invest_strategy.start
                progress = years_elapsed / total_years if total_years > 0 else 1
                after_tax_total = 0
                for asset_info in invest_strategy.assets:
                    investment, initial_pct, final_pct = asset_info
                    current_pct = initial_pct + progress * (final_pct - initial_pct)
                    if investment.tax_status == "after-tax":
                        after_tax_total += execess_cash * (current_pct / 100)
                scale_down = 1
                scale_up = 1
                if simulation.limit_posttax < after_tax_total:
                    scale_down = simulation.limit_posttax / after_tax_total
                    leftover = after_tax_total - simulation.limit_posttax
                    scale_up = 1 + leftover / (execess_cash - after_tax_total) if (execess_cash - after_tax_total) > 0 else 1
                for asset_info in invest_strategy.assets:
                    investment, initial_pct, final_pct = asset_info
                    current_pct = initial_pct + progress * (final_pct - initial_pct)
                    
                    amt = execess_cash * (current_pct / 100)
                    
                    if investment.tax_status == "after-tax":
                        amt *= scale_down
                    else:
                        amt *= scale_up
                    
                    # Update investment
                    investment.value += amt
                    investment.purchase += amt  
                    simulation.cash.value -= amt

        # Step 9: Rebalance
        

        # Step 10: Results

    return res

# will be the exact same as simulate(), but with logging
# this will make the other simulations more efficient
# as it avoids using if-statements everywhere
def simulate_log(simulation,tax_data,user):
    # create log directory if it doesn't already exist
    if not os.path.exists(LOG_DIRECTORY):
        os.makedirs(LOG_DIRECTORY)
    
    # create two log files
    cur_time = datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
    
    with open(f"{LOG_DIRECTORY}/{user}_{cur_time}.log","w") as fin_log, \
         open(f"{LOG_DIRECTORY}/{user}_{cur_time}.csv","w") as inv_log:
        inv_writer = csv.writer(inv_log)
        title_row = ["year"] + [f"{investment.name} - {investment.tax_status}" for investment in simulation.investments]
        inv_writer.writerow(title_row) # title row

        # from here on, same as simulate except with logging
        res = simulate(simulation,tax_data,fin_log,inv_writer)
    return res



# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# Get the total value for list of investments
def total_inv_value(investments):
    total = 0
    for inv in investments:
        total += inv.value

    return total