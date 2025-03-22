from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, List
from utils import Normal
from investment import Investment, InvestmentType
from event_series import EventSeries, Expense
from user import User

class LifeExpectancy(BaseModel):
    type: Literal['fixed', 'normal'] #although type is a python keyword, it works under this context
    fixed: Optional[int]
    normal: Optional[Normal]
    
class RothOptimizer(BaseModel):
    is_enable: bool
    start_year: int
    end_year: int

class Scenario(Document):
    name: str
    is_married: bool
    birth_year: int
    spouse_birth_year: Optional[int]
    life_expectancy: LifeExpectancy
    spouse_life_expectancy: Optional[LifeExpectancy]
    investment_types: List[Link[InvestmentType]]
    investment: List[Link[Investment]]
    event_series: List[Link[EventSeries]]
    inflation_assume: bool
    init_limit_posttax: float
    spending_strat: List[Link[Expense]]
    expense_withdraw: List[Link[Investment]]
    rmd_strat: List[Link[Investment]]
    roth_conversion_strat: List[Link[Investment]]
    roth_optimizer: RothOptimizer
    #not sure if this is the intended sharing method
    r_only_share: List[Link[User]]
    wr_only_share: List[Link[User]]
    ignore_state_tax: bool
    fin_goal: float
    state: str