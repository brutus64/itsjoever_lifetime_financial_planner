from multiprocessing import Pool
from threading import Semaphore
from numpy.random import normal, uniform
from datetime import datetime
import os
import sys


LOG_DIRECTORY = f"{sys.path[0]}/logs"
print(LOG_DIRECTORY)
# i dont know how to make process pool global without
# running into shutdown issues

# use a centralized Simulator to ensure only one simulation is simulated
# at a time
class Simulator: # is this necessary?
    pass

# set of n simulations
def simulate_n(scenario,n,user):
    pass

# one simulation of a set of simulations
# each simulation would have to make a copy of each investment
def simulate(scenario):
    pass

# will be the exact same as simulate(), but with logging
# this will make the other simulations more efficient
# as it avoids using if-statements everywhere
def simulate_log(scenario,user):
    if not os.path.exists(LOG_DIRECTORY):
        os.makedirs(LOG_DIRECTORY)
    print("Is this working?")
    with open(f"{LOG_DIRECTORY}/{user}_{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}.log","w") as log:
        log.write("Test")
    

# testing
if __name__ == "__main__":
    simulate_log({},"Jeff")
