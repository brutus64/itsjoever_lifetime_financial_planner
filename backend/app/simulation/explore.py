from app.simulation.simulate import simulate_n, Simulation, Tax
from multiprocessing import Pool
from decimal import Decimal

PARAMTER_TYPE_MAP = {"Start Year": "start_year", "Duration": "duration", "Initial Amount": "amt", "Asset Percent": "assets", "Is Enabled": "roth_enable"}
async def explore_start(explore_data):
    

    # if the simulation object is mutated while a pending task is in the queue, will the wrong thing be simulated?

    if explore_data.get("num_params") == 1:
        return await one_param(explore_data)
    elif explore_data.get("num_params") == 2:
        return await two_params(explore_data) 
    raise ValueError

def process_param(parameter,simulation_state): # parameter is dictionary
    # get name of attribute to change
    param_type = PARAMTER_TYPE_MAP[parameter.get("param_type")]

    # get object containing attribute
    param = parameter.get("parameter")
    obj = None
    if param == "Roth Optimizer":
        obj = simulation_state
    else:
        # find event series containing attribute to explore
        for es in simulation_state.event_series:
            if es.id == param:
                obj = es
                break
    if not obj:
        raise ValueError
    
    # create array of values to set
    values = []
    if param_type == "roth_enable":
        values = [True,False]
    elif param_type == "assets":
        start,end,step = Decimal(start),Decimal(end),Decimal(step)
        while start <= end:
            values.append([start,100-start])
            start += step
        
    else:

    
    return obj,param_type,values

async def one_param(explore_data):
    # create simulation object and get tax from db
    simulation_state = Simulation(explore_data.get("scenario"))
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()

    obj,param_type,values = process_param(explore_data.get("params")[0],simulation_state)
    
    

    
    

async def two_params(explore_data):
    # create simulation object and get tax from db
    simulation_state = Simulation(explore_data.get("scenario"))
    tax_data = Tax(simulation_state.state)
    await tax_data.fetch_tax()