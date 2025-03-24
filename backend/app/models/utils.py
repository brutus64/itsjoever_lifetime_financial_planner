from pydantic import BaseModel
from typing import Union

class Fixed(BaseModel):
    amt: float
    is_percent: bool
    
class Normal(BaseModel):
    mean: float
    stdev: float
    is_percent: bool #for investment_types NOT FOR 

class Uniform(BaseModel):
    lower_bound: Union[int, float] #start_year = int, duration = float
    upper_bound: Union[int, float]
    is_percent: bool #only for certain situations (NOT FOR START_YEAR)
    