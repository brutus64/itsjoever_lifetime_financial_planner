from pydantic import BaseModel
from typing import Union

class Fixed(BaseModel):
    amt: float
    is_percent: bool
    
class Normal(BaseModel):
    mean: float
    stddev: float
    is_percent: bool

class Uniform(BaseModel):
    lower_bound: Union[int, float] #start_year = int, duration = float
    upper_bound: Union[int, float]
    