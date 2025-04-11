from multiprocessing import Pool
from threading import Semaphore
from numpy.random import normal, uniform
from datetime import datetime
from statistics import mean, median
import os
import sys


LOG_DIRECTORY = f"{sys.path[0]}/logs"
print(LOG_DIRECTORY)

# I dont know how to make process pool global without
# running into shutdown issues

# use a centralized Simulator to ensure only one simulation is simulated
# at a time
class Simulator: # is this necessary?
    pass

# classes for scenario objects

# flatten investment and investment type
# note that there may be new investments created during the simulation
# that would not be in the scenario object
class Investment:
    def __init__(self,investment):
        pass
        
# flatten event series and income event series
class Income:
    def __init__(self,event_series):
        pass

class Tax: # tax brackets
    pass

# flatten event series and expense event series
class Expense:
    pass


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
        

# set of n simulations
def simulate_n(scenario,n,user):
    # get tax data for scenario's state

    # spawn processes
    results = []
    with Pool() as pool:
        log_result = pool.apply_async(simulate_log,args=(scenario,user,))
        results.append(log_result)
        for _ in range(n-1):
            result = pool.apply_async(simulate,args=(scenario,))
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
def simulate(scenario):
    res = [] #yearly data

    # using a big dictionary is too annoying
    # create simulation objects based on scenario objects that will
    # change over time


    return res

# will be the exact same as simulate(), but with logging
# this will make the other simulations more efficient
# as it avoids using if-statements everywhere
def simulate_log(scenario,user):
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
    simulate_n({},10000,"Jeff")
