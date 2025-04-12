from multiprocessing import Pool
from threading import Semaphore
from numpy.random import normal, uniform
from datetime import datetime
from statistics import mean, median
import os
import sys
import math
# from app.models.tax import StateTax, FederalTax, CapitalGains, RMDTable, StandardDeduct
# from app.models.simulation import Simulation

LOG_DIRECTORY = f"{sys.path[0]}/logs"
print(LOG_DIRECTORY)

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
        self.taxability = investment["taxability"]
        self.expense_ratio = investment["invest_type"]["expense_ratio"]
        
    # update investment value, return income
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
        avg = (self.value + start_val) // 2
        self.value -= avg * self.expense_ratio
        
        return inc
    
# note: for all event series, there is no need to store the start year or duration
# as a Vary object since it is only sampled once in the beginning.
# This is also the case for life expectancy
        
# income event series
class Income:
    def __init__(self,event_series):
        self.id = event_series["id"] # just in case
        self.amt = event_series["details"]["initial_amt"]
        self.exp_change = Vary(event_series["details"]["exp_annual_change"])
        self.exp_change_percent = event_series["details"]["exp_annual_change"]["is_percent"]
        self.inflation_adjust = event_series["details"]["inflation_adjust"]
        self.user_split = event_series["details"]["user_split"]
        self.social_security = event_series["details"]["social_security"]
        self.name = event_series["name"]
        self.start = event_series["start"] #resolved later
        self.duration = max(0,math.floor(0.5+Vary(event_series["duration"]).generate())) # round to nearest integer, cannot be negative

# expense event seriess
class Expense:
    def __init__(self,event_series):
        self.id = event_series["id"] # just in case
        self.amt = event_series["details"]["initial_amt"]
        self.exp_change = Vary(event_series["details"]["exp_annual_change"])
        self.exp_change_percent = event_series["details"]["exp_annual_change"]["is_percent"]
        self.inflation_adjust = event_series["details"]["inflation_adjust"]
        self.user_split = event_series["details"]["user_split"]
        self.is_discretionary = event_series["details"]["is_discretionary"]
        self.name = event_series["name"]
        self.start = event_series["start"] #resolved later
        self.duration = max(0,math.floor(0.5+Vary(event_series["duration"]).generate())) # round to nearest integer, cannot be negative

class Tax: # tax brackets
    pass

class Invest:
    pass

class Rebalance:
    pass

# store simulation state
class Simulation:
    def __init__(self,scenario):
        self.investments = [Investment(investment) for investment in scenario.get("investment")]
        event_series = [] # only used here
        self.income = []
        self.expenses = []
        for es in scenario.get("event_series"):
            t = es.get("type")
            if t == "income":
                inc = Income(es)
                event_series.append(inc)
                self.income.append(inc)
            elif t == "expense":
                exp = Expense(es)
                event_series.append(exp)
                self.expenses.append(exp)
            elif t == "invest":
                inv = Invest(es)
                event_series.append(inv)
                self.invest_strat.append(inv)
            elif t == "rebalance":
                re = Rebalance(es)
                event_series.append(re)
                self.rebalance.append(re)
        resolve_event_start(event_series)

        # places that require Investment objects: invest/rebalance event series, strategies, 
        

# data for a particular year in a simulation
# create a copy of each scenario object
class YearlyResults:
    def __init__(self):
        self.investments = [] # list of tuples (investment identifier, value)
        self.total_investments = 0
        self.income = [] # list of tuples (income identifier, value)
        self.total_income = 0
        self.expenses = [] # not including taxes, list of tuples (expense identifier, value)
        self.taxes = [] # list of tuples (tax identifier, value)
        self.total_expenses = 0 # includes expense event series and taxes
        self.early_withdrawal_tax = 0 
        self.discretionary_percent = 0 # discretionary expenses paid / total discretionary

# dfs to get a fixed year for event start times
def resolve_event_start(event_series):
    visited = set() # visited during dfs, but may not be resolved
    resolved = set()
    def dfs(es):
        if es in resolved: # Start date already resolved
            return es.start 
        if es in visited: # Cycle detected, set to default
            es.start = 2025
            resolved.add(es.id)
            return 2025 
        visited.add(es.id)
        if es.start["type"] == "start_with": 
            es.start = dfs(es.start["event_series"])
        elif es.start["type"] == "end_with":
            es.start = dfs(es.start["event_series"]) + 1
        else:
            es.start = math.floor(0.5+Vary(es.start).generate())
        resolved.add(es.id)
        return es.start

    for es in event_series:
        if es.start["type"] == "start_with" or es.start["type"] == "end_with":
            dfs(es)
        else:
            es.start



# set of n simulations
def simulate_n(scenario,n,user):
    # get tax data for scenario's state, federal tax, and rmd table
    
    # two processes do not use the same address space, so it is
    # actually fine to create the simulation objects in the
    # simulate_n function, then pass them in to simulate()
    # using a big dictionary is too annoying
    # create simulation objects based on scenario objects that will
    # change over time

    


    # spawn processes
    results = []
    with Pool() as pool:
        log_result = pool.apply_async(simulate_log,args=(scenario,tax_data,user,))
        results.append(log_result)
        for _ in range(n-1):
            result = pool.apply_async(simulate,args=(scenario,tax_data,))
            results.append(result)
        # get all simulation results
        print("Getting results...")
        results = [result.get() for result in results]
    print(results)
    # aggregate results by category, then year
    # calculate success probability in each year for chart 4.1
    # the "totals", early-withdrawal, and percent-total-discretion must store
    # all values across the n simulations for chart 4.2
    # for individual investment, expense (including taxes), and income, only 
    # store the mean and medians for chart 4.3
    agg_results = {}
    

    # store aggregated results in db to be viewed later
    # return id of simulation set



# one simulation in a set of simulations
# each simulation would have to make a copy of each investment
# returns a list of YearlyResults objects
def simulate(scenario, tax_data):
    res = [] #yearly data
    


    return res

# will be the exact same as simulate(), but with logging
# this will make the other simulations more efficient
# as it avoids using if-statements everywhere
def simulate_log(scenario,tax_data,user):
    # create log directory if it doesn't already exist
    if not os.path.exists(LOG_DIRECTORY):
        os.makedirs(LOG_DIRECTORY)
    
    # create two log files
    cur_time = datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
    with open(f"{LOG_DIRECTORY}/{user}_{cur_time}.log","w") as fin_log, \
         open(f"{LOG_DIRECTORY}/{user}_{cur_time}.csv","w") as inv_log:
        fin_log.write("Test")
        inv_log.write("Test")
    res = 1

    return res

# testing
if __name__ == "__main__":
    vary = Vary({"type":"uniform","mean":4,"stdev":5,"value":17,"lower":19,"upper":21})
    print(vary.generate())
