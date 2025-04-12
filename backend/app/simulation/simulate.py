from multiprocessing import Pool
from threading import Semaphore
from numpy.random import normal, uniform
from datetime import datetime
from statistics import mean, median
import os
import sys
import math
import csv
from app.models.tax import StateTax, FederalTax, CapitalGains, RMDTable, StandardDeduct
# from app.models.simulation import Simulation

LOG_DIRECTORY = f"{sys.path[0]}/logs"
START_YEAR = 2025
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
        self.taxability = investment["invest_type"]["taxability"]
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
    
    async def fetch_tax(self):
        self.federal_tax = await FederalTax.find_one()
        self.state_tax = await StateTax.find_one(StateTax.state == self.state)
        self.capital_gains = await CapitalGains.find_one()
        self.rmd = await RMDTable.find_one()

    def calculate_rmd(self,age):
        pass

    def calculate_tax(self,is_married):
        pass


# store simulation state from scenario
class Simulation:
    def __init__(self,scenario):
        self.investments = [Investment(investment) for investment in scenario.get("investment")]
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
    #         result = pool.apply_async(simulate,args=(simulation_state,tax_data,))
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
    agg_results = {}
    

    # store aggregated results in db to be viewed later
    # return id of simulation set
    return ""


# one simulation in a set of simulations
# each simulation would have to make a copy of each investment
# returns a list of YearlyResults objects
def simulate(simulation: Simulation,tax_data: Tax):
    res = [] # yearly data

    # resolve event series durations and start times (in that order)
    simulation.resolve_event_time()

    # resolve life expectancy to determine main loop range
    simulation.user_life = math.floor(0.5+simulation.user_life.generate())
    if simulation.is_married:
        simulation.spouse_life = math.floor(0.5+simulation.spouse_life.generate())

    # main loop
    for year in range(START_YEAR,simulation.user_birth + simulation.user_life):
        pass



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
    res = [] # yearly data
    with open(f"{LOG_DIRECTORY}/{user}_{cur_time}.log","w") as fin_log, \
         open(f"{LOG_DIRECTORY}/{user}_{cur_time}.csv","w") as inv_log:
        inv_writer = csv.writer(inv_log)
        title_row = ["year"] + [f"{investment.name} - {investment.tax_status}" for investment in simulation.investments]
        inv_writer.writerow(title_row) # title row


        # from here on, same as simulate except with logging

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
            # Step 1: Inflation


            # Step 2: Income


            # Step 3: RMD


            # Step 4: Investments


            # Step 5: Roth


            # Step 6: Expenses and Taxes


            # Step 7: Discretionary Expenses


            # Step 8: Invest


            # Step 9: Rebalance


            # Step 10: Results
            pass

    return res

# testing
# if __name__ == "__main__":
#     vary = Vary({"type":"uniform","mean":4,"stdev":5,"value":17,"lower":19,"upper":21})
#     print(vary.generate())
