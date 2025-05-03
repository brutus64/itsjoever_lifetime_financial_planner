from app.simulation.simulate import simulate_n, aggregate, Simulation, Tax
from multiprocessing import Pool
from decimal import Decimal
from copy import deepcopy


PARAMTER_TYPE_MAP = {"Start Year": "start", "Duration": "duration", "Initial Amount": "amt", "Asset Percent": "assets", "Is Enabled": "roth_enable"}
LOG_EXPLORATION = False
async def explore_start(explore_data):
    # if the simulation object is mutated while a pending task is in the queue, will the wrong thing be simulated?
    # Answer: YES

    if explore_data.get("num_params") == 1:
        return await one_param(explore_data)
    elif explore_data.get("num_params") == 2:
        return await two_params(explore_data) 
    raise ValueError

async def one_param(explore_data):
    # create simulation object and get tax from db
    simulation_state = Simulation(explore_data.get("scenario"))
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()

    obj,param_name,param_type,values = process_param(explore_data.get("params")[0],simulation_state)
    # spawn processes to handle tasks
    with Pool() as pool:
        results = {}
        for val in values:
            modify_sim(obj,param_type,val)
            results[val] = await simulate_n(deepcopy(simulation_state),explore_data.get("n"),explore_data.get("user"),tax_data,LOG_EXPLORATION,pool)
        
        # wait for results and aggregate them (per parameter)
        print("Getting results...")
        for val in values:
            results[val] = aggregate([result.get() for result in results[val]])
            results[val]["fin_goal"] = simulation_state.fin_goal
    
    # aggregate exploration results
    explore_agg = aggregate_one(results)

    # return the parameter names, types, and results (for the whole exploration and each individual scenario combination)
    return {"param1": f"{param_name} {explore_data.get('params')[0].get('param_type')}", "param2": None, "explore_results":explore_agg,"individual_results":results}
            
    
async def two_params(explore_data):
    # create simulation object and get tax from db
    simulation_state = Simulation(explore_data.get("scenario"))
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()

    obj_1,param_name_1,param_type_1,values_1 = process_param(explore_data.get("params")[0],simulation_state)
    obj_2,param_name_2,param_type_2,values_2 = process_param(explore_data.get("params")[1],simulation_state)
    
    # spawn processes to handle tasks
    with Pool() as pool:
        results = {}
        for val in values_1:
            modify_sim(obj_1,param_type_1,val)
            inner_results = {}
            for val2 in values_2:
                modify_sim(obj_2,param_type_2,val2)
                inner_results[val2] = await simulate_n(deepcopy(simulation_state),explore_data.get("n"),explore_data.get("user"),tax_data,LOG_EXPLORATION,pool)
            results[val] = inner_results
        
        # wait for tasks to finish
        print("Getting results...")
        for val in values_1:
            for val2 in values_2:
                results[val][val2] = aggregate([result.get() for result in results[val][val2]])
                results[val][val2]["fin_goal"] = simulation_state.fin_goal

    # aggregate exploration results
    explore_agg = aggregate_two(results)

    # return the parameter names, types, and results (for the whole exploration and each individual scenario combination)
    return {"param1": f"{param_name_1} {explore_data.get('params')[0].get('param_type')}", "param2": f"{param_name_2} {explore_data.get('params')[1].get('param_type')}", "explore_results":explore_agg,"individual_results":results}


def process_param(parameter,simulation_state): # parameter is dictionary
    # get name of attribute to change
    param_type = PARAMTER_TYPE_MAP[parameter.get("param_type")]

    # get object containing attribute
    param = parameter.get("parameter")
    obj = None
    if param == "Roth Optimizer":
        obj = simulation_state
        param_name = param
    else:
        # find event series containing attribute to explore
        for es in simulation_state.event_series:
            if es.id == param:
                obj = es
                param_name = es.name
                break
    if not obj:
        raise ValueError
    
    # create array of values to set
    values = []
    if param_type == "roth_enable":
        values = [True,False]
    else:
        start = parameter.get("start")
        end = parameter.get("end")
        step = parameter.get("step")
        while start <= end:
            values.append(start)
            start += step
    
    return obj,param_name,param_type,values

def modify_sim(obj,param_type,val):
    if param_type == "assets":
        obj.assets[0][1] = obj.assets[0][2] = val/100
        obj.assets[1][1] = obj.assets[1][2] = 1-val/100
    elif param_type == "start": # still a dictionary
        obj.start["type"] = "fixed"
        obj.start["value"] = val
    elif param_type == "duration": # Vary object
        obj.duration.type = "fixed"
        obj.duration.value = val
    else:
        setattr(obj,param_type,val)

def aggregate_one(results):
    agg_results = {}

    # Chart 5.1: Multi-line
    multi_line = {"success":{},"total_investments":{}}
    for val,result in results.items():
        # record success probability by year
        multi_line["success"][val] = {}
        for year,prob in result["success"].items():
            multi_line["success"][val][year] = prob
        
        # record total investments by year
        multi_line["total_investments"][val] = {}
        for year,percentiles in result["percentiles"]["total_investments"].items():
            multi_line["total_investments"][val][year] = percentiles[5]
    agg_results["multi_line"] = multi_line

    # Chart 5.2: Param vs Quantity
    param_function = {"final_success":{},"final_investments":{}}
    for val,result in results.items():
        final_year = max(result["success"].keys())

        # record final prob
        param_function["final_success"][val] = result["success"][final_year]

        # record final median
        param_function["final_investments"][val] = result["percentiles"]["total_investments"][final_year][5]

    agg_results["param_function"] = param_function

    return agg_results
    

def aggregate_two(results):
    agg_results = {}

    # Chart 6.1 and 6.2: Two Param vs Quantity
    for val_1,outer_result in results.items():
        agg_results[val_1] = {}
        for val_2,result in outer_result.items():
            final_year = max(result["success"].keys())
            agg_results[val_1][val_2] = {}
            # record final prob
            agg_results[val_1][val_2]["final_success"] = results[val_1][val_2]["success"][final_year]
            # record final total investments median
            agg_results[val_1][val_2]["final_investments"] = results[val_1][val_2]["percentiles"]["total_investments"][final_year][5]
    return agg_results