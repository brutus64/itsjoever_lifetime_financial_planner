from multiprocessing import Pool
from numpy.random import normal, uniform
from numpy import percentile
from datetime import datetime
from statistics import mean, median
from collections import defaultdict
import os
import sys
import math
import csv
import copy
from app.models.tax import StateTax, FederalTax, CapitalGains, RMDTable, StandardDeduct

LOG_DIRECTORY = f"{sys.path[0]}/logs"
START_YEAR = 2025
SOCIAL_SECURITY_RATE = 0.15
RMD_START_AGE = 74
EARLY_WITHDRAW_AGE = 59
EARLY_WITHDRAW_TAX = 0.1
DECIMAL_PLACES = 2

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
class Investment:
    def __init__(self,investment):
        self.id = investment["id"]
        self.value = investment["value"]
        self.purchase = investment["value"] # amount of money put into the investment
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
        # calculate generated income
        inc = self.exp_inc.generate()
        if self.exp_inc_percent:
            inc = self.value * (inc/100)

        # calculate change in value
        ret_val = self.exp_ret.generate()
        if self.exp_ret_percent:
            self.value *= (1+ret_val/100)
        else:
            self.value += ret_val

        # add income back to investment
        self.value += inc
        self.purchase += inc

        # calculate expenses
        avg = (self.value + start_val) / 2
        self.value -= avg * self.expense_ratio/100
        
        # determine taxability
        return inc if self.taxability and self.tax_status == "non-retirement" else 0
    
class EventSeries:
    def __init__(self,event_series):
        self.id = event_series["id"]
        self.name = event_series["name"] # for graphing and logging
        self.start = event_series["start"] # resolved later
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

    def update(self,year,inflation_rate,omit_spouse):
        # check if active
        if year >= self.start and year < self.start + self.duration:
            # do not adjust in first year
            if year != self.start:
                # calculate annual change
                if self.exp_change_percent:
                    self.amt *= (1+self.exp_change.generate()/100)
                else:
                    self.amt += self.exp_change.generate()
                # adjust for inflation
                if self.inflation_adjust and year != START_YEAR: 
                    self.amt *= inflation_rate
            
            inc = self.amt
            if omit_spouse:
                inc *= self.user_split/100
            inc_ss = inc if self.social_security else 0
        else:
            # if event inactive, still update inflation
            if self.inflation_adjust and year != START_YEAR:
                self.amt *= inflation_rate
            inc = inc_ss = -1

        return inc, inc_ss
        
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

    def update(self,year,inflation_rate,omit_spouse):
        # check if active
        if year >= self.start and year < self.start + self.duration:
            # do not adjust in first year
            if year != self.start:
                # calculate annual change
                if self.exp_change_percent:
                    self.amt *= (1+self.exp_change.generate()/100)
                else:
                    self.amt += self.exp_change.generate()

            # adjust inflation if needed
            if self.inflation_adjust and year != START_YEAR:
                self.amt *= inflation_rate

            exp = self.amt
            if omit_spouse:
                exp *= self.user_split/100
            return exp
        else:
            # if event inactive, still update inflation
            if self.inflation_adjust and year != START_YEAR:
                self.amt *= inflation_rate
            return -1
        
# invest event series
class Invest(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        self.max_cash = event_series["details"]["max_cash"]
        # list of size-3 array: [investment object, start, end] (for fixed, start = end)
        if event_series["details"]["is_glide"]:
            self.assets = [] 
            for asset in event_series["details"]["assets"]:
                investment = asset["invest_id"]["id"]
                initial = asset["initial"]
                final = asset["final"]
                self.assets.append([investment,initial,final])
        else:
            self.assets = [[asset["invest_id"]["id"],asset["percentage"],asset["percentage"]] for asset in event_series["details"]["assets"]]

    def run_invest(self,cash,year,limit,fin_log):
        total_invested = 0
        excess_cash = cash - self.max_cash
        if excess_cash > 0:
            # calculate total of after-tax amounts
            after_tax_total = 0
            years_elapsed = year - self.start
            for investment,start,end in self.assets:
                if investment.tax_status == "after-tax":
                    # calculate glide percentage and invest value
                    yearly_change = (end-start) / (self.duration-1) if self.duration != 1 else 0
                    percent = start + years_elapsed*yearly_change

                    # calculate expected investment amount
                    after_tax_total += excess_cash * percent
            
            # determine scale factor according to limit_posttax
            scale_up = 1
            scale_down = 1
            if limit < after_tax_total:
                scale_down = limit / after_tax_total
                leftover = after_tax_total - limit
                scale_up = (1 + leftover / (excess_cash - after_tax_total)) if (excess_cash - after_tax_total) > 0 else 1
            
            # perform investments
            for investment,start,end in self.assets:
                # calculate glide percentage
                yearly_change = (end-start) / (self.duration-1) if self.duration != 1 else 0
                percent = start + years_elapsed*yearly_change
                # calculate invest amount
                invest_amt = excess_cash * percent
                if investment.tax_status == "after-tax":
                    invest_amt *= scale_down
                else:
                    invest_amt *= scale_up
                    
                # Update investment and cash investment values
                investment.value += invest_amt
                investment.purchase += invest_amt  
                total_invested += invest_amt
                fin_write(fin_log,fin_format(year,"invest",invest_amt,investment.name))
        return total_invested
    
# rebalance event series
class Rebalance(EventSeries):
    def __init__(self,event_series):
        super().__init__(event_series)
        # list of size-3 array: [investment object, start, end] (for fixed, start = end)
        if event_series["details"]["is_glide"]:
            self.assets = [] 
            for asset in event_series["details"]["assets"]:
                investment = asset["invest_id"]["id"]
                initial = asset["initial"]
                final = asset["final"]
                self.assets.append([investment,initial,final])
        else:
            self.assets = [[asset["invest_id"]["id"],asset["percentage"],asset["percentage"]] for asset in event_series["details"]["assets"]]

    def run_rebalance(self,year,fin_log,age):
        cg = income = ew = 0
        # check if active
        if year >= self.start and year < self.start + self.duration:
            # find the total value of the investments to rebalance
            total_value = 0
            for investment,_,_ in self.assets:
                total_value += investment.value
            # performing rebalancing
            for investment,start,end in self.assets:
                # calculate glide percentage and target value
                year_diff = year - self.start # how many years passed since start of event series
                yearly_change = (end-start) / (self.duration-1) if self.duration != 1 else 0
                percent = start + year_diff*yearly_change
                target = percent * total_value

                if target >= investment.value: # buy
                    amt = target - investment.value
                    investment.value += amt
                    investment.purchase += amt
                    fin_write(fin_log,fin_format(year,"rebalance",amt,f"buy {investment.name}"))
                else: # sell
                    amt = investment.value - target
                    # pay capital gains if non-retirement, regular tax if pre-tax
                    if investment.tax_status == "non-retirement":
                        fraction = amt / investment.value
                        cg += max(0,fraction * (investment.value - investment.purchase))
                        investment.purchase *= (1-fraction)
                    elif investment.tax_status == "pre-tax":
                        income += amt
                    # pay early withdrawal tax
                    if age < EARLY_WITHDRAW_AGE and investment.tax_status != "non-retirement":
                        ew += amt
                    investment.value -= amt
                    fin_write(fin_log,fin_format(year,"rebalance",amt,f"sell {investment.name}"))
        return cg,income,ew

class Tax: # store tax rates and rmds
    def __init__(self,state):
        self.state = state
        self.early_withdrawal = EARLY_WITHDRAW_TAX
    
    async def fetch_tax(self):
        self.federal_tax = await FederalTax.find_one()
        self.state_tax = await StateTax.find_one(StateTax.state == self.state)
        self.capital_gains = await CapitalGains.find_one()
        self.standard_deductions = await StandardDeduct.find_one()
        self.rmd = await RMDTable.find_one()

    def adjust_tax(self,inflation_rate):
        # Update all brackets
        for bracket in self.federal_tax.single_bracket:
            bracket.min_income *= inflation_rate
            bracket.max_income *= inflation_rate
        for bracket in self.federal_tax.married_bracket:
            bracket.min_income *= inflation_rate
            bracket.max_income *= inflation_rate
        if self.state_tax:
            self.state_tax.single_deduct *= inflation_rate
            self.state_tax.married_deduct *= inflation_rate
            for bracket in self.state_tax.single_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
            for bracket in self.state_tax.married_bracket:
                bracket.min_income *= inflation_rate
                bracket.max_income *= inflation_rate
        for bracket in self.capital_gains.single_bracket:
            bracket.min_income *= inflation_rate
            bracket.max_income *= inflation_rate
        for bracket in self.capital_gains.married_bracket:
            bracket.min_income *= inflation_rate
            bracket.max_income *= inflation_rate
        self.standard_deductions.single_deduct *= inflation_rate
        self.standard_deductions.married_deduct *= inflation_rate

    def calculate_tax(self,prev_income,prev_ss,prev_cg,prev_ew,is_married):
        prev_fed_inc = prev_income - SOCIAL_SECURITY_RATE*prev_ss
        tax_values = {}
        tax_values["federal income"] = self.calculate_federal_tax(prev_fed_inc, is_married)
        tax_values["state income"] = self.calculate_state_tax(prev_income, is_married)
        tax_values["federal capital gains"] = self.calculate_capital_gains_tax(prev_income, prev_cg, is_married)
        tax_values["state capital gains"] = self.calculate_state_tax(prev_cg, is_married)
        tax_values["early withdrawal tax"] = self.early_withdrawal * prev_ew
        return tax_values

    def calculate_federal_tax(self, income, is_married):
        if not self.federal_tax or income <= 0:
            return 0
        brackets = self.federal_tax.married_bracket if is_married else self.federal_tax.single_bracket

        tax = 0
        # min_income <= income < max_income
        # pay tax as percentage of income in tax brackets
        for bracket in brackets:
            # calculates full tax bracket
            if(bracket.max_income < income and bracket.max_income != brackets[-1].max_income):
                tax += (bracket.max_income - bracket.min_income) * (bracket.rate/100)
            # calculates partial tax bracket
            elif(bracket.min_income <= income and (income < bracket.max_income or bracket.max_income == brackets[-1].max_income)):
                tax += (income - bracket.min_income) * (bracket.rate/100)
            else:
                break
        
        return tax

    def calculate_state_tax(self, income, is_married):
        if not self.state_tax or income <= 0:
            return 0
        brackets = self.state_tax.married_bracket if is_married else self.state_tax.single_bracket

        # min_income < income <= max_income
        for bracket in brackets:
            if bracket.min_income < income and (income <= bracket.max_income or bracket.max_income == brackets[-1].max_income):
                base = bracket.base if self.state_tax.base_add else -bracket.base
                tax = (income - bracket.min_income) * (bracket.rate/100) + base
                return tax
                
    def calculate_capital_gains_tax(self, income, capital_gains, is_married):
        if capital_gains <= 0 or income <= 0:
            return 0
        brackets = self.capital_gains.married_bracket if is_married else self.capital_gains.single_bracket

        # min_income <= income < max_income
        percent = None
        for bracket in brackets:
            if bracket.min_income < income and (income <= bracket.max_income or bracket.max_income == brackets[-1].max_income):
                percent = (bracket.rate/100)
                break
        tax = percent * capital_gains
        return max(0, tax) # capital gains tax can't be negative

# store simulation state
class Simulation:
    def __init__(self,scenario):
        self.investments = [Investment(investment) for investment in scenario.get("investment")]
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

        # used during simulation for taxes
        self.reset_taxes()
    
    # dfs to get a fixed year for event start times
    def resolve_event_time(self):
        # resolve durations
        for es in self.event_series:
            es.duration = max(1,math.floor(es.duration.generate() + 0.5))
        # resolve ids
        id_to_es = {es.id:es for es in self.event_series}
        visited = set() # visited during dfs, but may not be resolved
        resolved = set()
        def dfs(es):
            if es.id in resolved: # Start date already resolved
                return es.start 
            if es.id in visited: # Cycle detected, set to default
                resolved.add(es.id)
                return START_YEAR
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

    def reset_taxes(self):
        self.inc = 0
        self.ss = 0
        self.cg = 0
        self.ew = 0

    def perform_rmd(self,age,rmd_table,fin_log,year):
        if age >= RMD_START_AGE:
            # get distribution period
            dist_period = -1
            for entry in rmd_table:
                if entry.age == age:
                    dist_period = entry.distribution_period
                    break
            
            # sum values of pre-tax investments
            pre_value = 0
            for investment in self.investments:
                if investment.tax_status == "pre-tax" and investment.value > 0:
                    pre_value += investment.value
            
            if dist_period != -1:
                rmd = pre_value / dist_period
            else:
                rmd = 0

            # pay the rmd
            for investment in self.rmd_strat:
                if rmd <= 0:
                    break
                if investment.value <= 0:
                    continue

                # find the corresponding non-retirement investment, creating one if needed
                target = None
                for candidate in self.investments:
                    if candidate.name == investment.name and candidate.tax_status == "non-retirement":
                        target = candidate
                        break
                if not target:
                    target = copy.copy(investment) # only shallow-copy is necessary
                    target.tax_status = "non-retirement"
                    target.value = 0
                    target.purchase = 0
                    self.investments.append(target)
                
                # transfer amounts
                withdraw_amt = min(rmd,investment.value)
                f = withdraw_amt / investment.value
                target.value += withdraw_amt
                investment.value -= withdraw_amt
                rmd -= withdraw_amt
                self.inc += withdraw_amt

                # update purchase
                purchase_amt = f * investment.purchase
                investment.purchase -= purchase_amt
                target.purchase += withdraw_amt
                
                # write to log
                fin_write(fin_log,fin_format(year,"RMD",withdraw_amt,investment.name))
    
    def perform_roth(self,year,spouse_alive,tax_data,fin_log):
        fed_income = self.inc - SOCIAL_SECURITY_RATE*self.ss
        # determine if roth optimizer is active
        if self.roth_enable and year >= self.roth_start and year < self.roth_end:
            # determine brackets and deductions
            if spouse_alive:
                cur_deduction = tax_data.standard_deductions.married_deduct
                brackets = tax_data.federal_tax.married_bracket
            else:
                cur_deduction = tax_data.standard_deductions.single_deduct
                brackets = tax_data.federal_tax.single_bracket

            # find the upper-limit of the user's tax brackets
            upper_limit = 0
            for bracket in brackets:
                if bracket.max_income >= fed_income:
                    upper_limit = bracket.max_income
                    break
            if upper_limit == 0: # user is in the highest bracket, do not perform conversions?
                roth_conversion = 0
            else:
                roth_conversion = upper_limit - (fed_income - min(cur_deduction,fed_income))

            # transfer pre-tax to after-tax based on strategy
            for investment in self.roth_strat:
                if roth_conversion <= 0:
                    break
                if investment.value <= 0:
                    continue

                # find the target investment, creating one if needed
                target = None
                for candidate in self.investments:
                    if candidate.name == investment.name and candidate.tax_status == "after-tax":
                        target = candidate
                        break
                if not target:
                    target = copy.copy(investment) # only shallow-copy is necessary
                    target.tax_status = "after-tax"
                    target.value = 0
                    target.purchase = 0
                    self.investments.append(target)
                
                # transfer amounts
                transfer_amt = min(roth_conversion,investment.value)
                f = transfer_amt / investment.value
                target.value += transfer_amt
                investment.value -= transfer_amt
                roth_conversion -= transfer_amt
                self.inc += transfer_amt

                # update purchase (for completeness)
                purchase_amt = f * investment.purchase
                investment.purchase -= purchase_amt
                target.purchase += transfer_amt
                
                # write to log
                fin_write(fin_log,fin_format(year,"Roth",transfer_amt,investment.name))
    
    # withdraw amt from investments based on an withdrawal strategy
    def perform_withdrawals(self,amt,age):
        # withdraw from cash investment first
        cash_investment_withdrawal = min(self.cash.value,amt)
        amt -= cash_investment_withdrawal
        self.cash.value -= cash_investment_withdrawal
        
        # withdraw as much as possible
        for investment in self.expense_withdraw:
            if amt <= 0:
                break
            if investment.value <= 0:
                continue
            
            withdraw = min(investment.value,amt) # max amt to withdraw
            investment.value -= withdraw
            amt -= withdraw

            # determine if withdrawal is taxed
            if investment.tax_status == "non-retirement":
                fraction = withdraw/investment.value
                self.cg += fraction * (investment.value - investment.purchase)
                investment.purchase *= (1-fraction)
            elif investment.tax_status == "pre-tax":
                self.inc += withdraw
            if age < EARLY_WITHDRAW_AGE and investment.tax_status != "non-retirement":
                self.ew += withdraw 
        return amt # amount leftover
    
    def perform_spending(self,age,year,spouse_alive,fin_log,year_result):
        # determine the total value of all investments
        total_assets = 0
        for inv in self.investments:
            total_assets += inv.value

        # pay as much discretionary expenses as possible
        total_disc_paid = 0
        for disc_event in self.spending_strat:
            # check if active
            if year < disc_event.start or year >= disc_event.start + disc_event.duration:
                continue

            # check if financial goal violated
            if total_assets <= self.fin_goal:
                break

            # omit spouse percentage from expense amount
            expense_amt = disc_event.amt
            if not spouse_alive:
                expense_amt *= disc_event.user_split/100
            
            # get maximum amount that can be paid for current discretionary expense
            amt = min(expense_amt, total_assets - self.fin_goal)

            # sell investments to pay expenses
            amt_left = self.perform_withdrawals(amt,age)

            # update amounts
            disc_paid = amt - amt_left
            total_assets -= disc_paid
            total_disc_paid += disc_paid

            # log payment
            fin_write(fin_log,fin_format(year,"expense",disc_paid,f"{disc_event.name} disc"))
            year_result.expenses.append((disc_event.name,round(disc_paid,DECIMAL_PLACES)))

            # take money from cash investment first
            cash_amt = min(self.cash.value,amt)
            self.cash.value -= cash_amt
            amt -= cash_amt
            total_assets -= cash_amt
        
        return total_disc_paid

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
    # create simulation object and get tax from db
    simulation_state = Simulation(scenario)
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()

    # spawn processes
    results = []
    with Pool() as pool:
        log_result = pool.apply_async(simulate_log,args=(simulation_state,tax_data,user,))
        results.append(log_result)
        for _ in range(n-1):
            result = pool.apply_async(simulate,args=(simulation_state,tax_data,None,None,))
            results.append(result)
        # get all simulation results
        print("Getting results...")
        results = [result.get() for result in results]
    
    # aggregate results for displaying on graphs
    aggregated = aggregate(results)
    return aggregated

# aggregate data across all n simulations
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
    categories = ["total_investments","total_income","total_expenses","early_withdrawal_tax","discretionary_percent"]
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
            yearly_arrays["early_withdrawal_tax"][year].append(yr.early_withdrawal_tax)
            yearly_arrays["discretionary_percent"][year].append(yr.discretionary_percent)
    
    # find percentiles for every category in every year
    for category in categories:
        for year,values in yearly_arrays[category].items():
            percentiles[category][year] = percentile(values,desired_percents).tolist() # need to convert to list?
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

# format string for displaying lines in log file
def fin_format(year,trans_type,amt,details):
    return f"{year}\t{trans_type}\t{round(amt,DECIMAL_PLACES)}\t{details}\n"

# write to log file, if fin_log is not None
def fin_write(fin_log,msg):
    if fin_log:
        fin_log.write(msg)

# write line to csv file, if inv_writer is not None
def inv_write(inv_writer, year, investments):
    if inv_writer:
        row = [year] + [round(investment.value,DECIMAL_PLACES) for investment in investments]
        inv_writer.writerow(row)

# one simulation in a set of simulations
# each simulation would have to make a copy of each investment
# returns a list of YearlyResults objects
def simulate(simulation, tax_data, fin_log, inv_writer):
    res = [] # yearly data

    simulation.resolve_event_time() # resolve durations and start times

    # resolve life expectancies
    simulation.user_life = math.floor(0.5+simulation.user_life.generate())
    if simulation.is_married:
        simulation.spouse_life = math.floor(0.5+simulation.spouse_life.generate())
    
    # main loop
    for year in range(START_YEAR,simulation.user_birth + simulation.user_life):
        year_result = YearlyResults(year) # stores results

        user_age = year - simulation.user_birth # determine age
        spouse_alive = simulation.is_married and year < simulation.spouse_birth + simulation.spouse_life

        # Pre Step 6: Calculate prev years tax before tax bracket is updated
        tax_values = tax_data.calculate_tax(simulation.inc,simulation.ss,simulation.cg,simulation.ew,spouse_alive)
        simulation.reset_taxes() # reset taxes to record new year taxes

        # record tax values
        year_result.early_withdrawal_tax = round(tax_values["early withdrawal tax"],DECIMAL_PLACES)
        if year != START_YEAR: # record tax values
            for tax, value in tax_values.items():
                year_result.taxes.append((tax,round(value,DECIMAL_PLACES)))

        # Step 1: Inflation
        inflation_rate = 1 + simulation.inflation.generate() / 100
        if year != START_YEAR:
            tax_data.adjust_tax(inflation_rate) # updates brackets
            simulation.limit_posttax *= inflation_rate
        
        # Step 2: Income
        for income in simulation.income:
            inc, inc_ss = income.update(year,inflation_rate,not spouse_alive)
            if inc != -1 and inc_ss != -1: # returns -1,-1 if inactive
                # update yearly income and cash investment
                simulation.inc += inc
                simulation.ss += inc_ss
                simulation.cash.value += inc

                # record income
                fin_write(fin_log,fin_format(year,"income",inc,income.name))
                year_result.income.append((income.name,round(inc,DECIMAL_PLACES)))

        # Step 3: RMD
        simulation.perform_rmd(user_age,tax_data.rmd.table,fin_log,year) # will update income

        # Step 4: Investments
        for investment in simulation.investments:
            simulation.inc += investment.update() # returns taxable income

        # Step 5: Roth
        simulation.perform_roth(year,spouse_alive,tax_data,fin_log) # will update income

        # Step 6: Expenses and Taxes
        # Update all expense event series based on annual change
        total_non_disc = 0
        total_disc = 0
        for expense in simulation.expenses:
            exp = expense.update(year,inflation_rate,not spouse_alive)
            if expense.is_discretionary:
                total_disc += exp
            elif exp != -1: # returned -1 if inactive
                fin_write(fin_log,fin_format(year,"expense",exp,f"{expense.name} non-disc"))
                year_result.expenses.append((expense.name,round(exp,DECIMAL_PLACES)))
                total_non_disc += exp

        # sum up previous year taxes and log them
        total_prev_tax = sum(tax_values.values())
        for tax_type,value in tax_values.items():
            fin_write(fin_log,fin_format(year,"tax",value,tax_type))

        # calculate total payment and perform withdrawals to pay off
        total_payment = total_prev_tax + total_non_disc
        amt_left = simulation.perform_withdrawals(total_payment,user_age) # will update income

        if amt_left > 0: # could not pay all taxes and expenses, end simulation
            inv_write(inv_writer,year,simulation.investments) # log all investment values (debugging)
            return res

        # Step 7: Discretionary Expenses
        total_disc_paid = simulation.perform_spending(user_age,year,spouse_alive,fin_log,year_result) # will update income
        
        # total expenses = discretionary paid + non-discretionary + taxes
        year_result.total_expenses = total_disc_paid + total_payment
        year_result.discretionary_percent = round(total_disc_paid / total_disc,DECIMAL_PLACES) if total_disc != 0 else 0

        # Step 8: Invest
        for invest in simulation.invest_strat:
            if year >= invest.start and year < invest.start + invest.duration:
                cash_spent = invest.run_invest(simulation.cash.value,year,simulation.limit_posttax,fin_log)
                simulation.cash.value -= cash_spent
                break

        # Step 9: Rebalance
        for reb in simulation.rebalance:
            cg,income,ew = reb.run_rebalance(year,fin_log,user_age)
            simulation.cg += cg
            simulation.inc += income
            simulation.ew += ew

        # Step 10: Results
        inv_write(inv_writer,year,simulation.investments) # write investments to csv file

        # record income (including income from investments)
        year_result.total_income = round(simulation.inc,DECIMAL_PLACES)

        # record individual investment values and total investments
        total_investments = 0
        for investment in simulation.investments:
            total_investments += investment.value
            year_result.investments.append((f"{investment.name} {investment.tax_status}",round(investment.value,DECIMAL_PLACES)))
        year_result.total_investments = round(total_investments,DECIMAL_PLACES)

        year_result.success = total_investments >= simulation.fin_goal # financial goal met
        res.append(year_result) # append data
    return res

# runs a simulation that will log results
def simulate_log(simulation,tax_data,user):
    # create log directory if it doesn't already exist
    if not os.path.exists(LOG_DIRECTORY):
        os.makedirs(LOG_DIRECTORY)
    
    # create two log files
    cur_time = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    
    with open(f"{LOG_DIRECTORY}/{user}_{cur_time}.log","w") as fin_log, \
         open(f"{LOG_DIRECTORY}/{user}_{cur_time}.csv","w") as inv_log:
        # write the title row of the .csv file
        inv_writer = csv.writer(inv_log)
        title_row = ["year"] + [f"{investment.name} - {investment.tax_status}" for investment in simulation.investments]
        inv_writer.writerow(title_row)

        res = simulate(simulation,tax_data,fin_log,inv_writer)
    return res