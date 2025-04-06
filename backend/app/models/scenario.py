from beanie import Document, Link
from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional, List, TYPE_CHECKING, Union


#investment imports users, users import scenarios, scenarios import investment, circular dependency
if TYPE_CHECKING:
    from app.models.investment import Investment, InvestmentType
    from app.models.event_series import EventSeries, Expense
    from app.models.user import User
class LifeExpectancy(BaseModel):
    type: Literal['fixed', 'normal'] #although type is a python keyword, it works under this context
    value: Optional[int] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    
    model_config = ConfigDict(exclude_none=True)

    # class Config:
    #     exclude_none = True
    
class RothOptimizer(BaseModel):
    is_enable: bool
    start_year: int
    end_year: int

class Inflation(BaseModel):
    type: Literal['fixed', 'normal', 'uniform']
    value: Optional[float] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    
    model_config = ConfigDict(exclude_none=True)
    # class Config:
    #     exclude_none = True
    
class Scenario(Document):
    user: Optional[Link['User']] = None #DONT HAVE THE DATA RIGHT NOW
    name: str = ""
    marital: Literal['couple', 'individual'] = 'individual'
    birth_year: List[int] = []
    life_expectancy: List[LifeExpectancy] = []
    investment_types: List[Link["InvestmentType"]] = []
    investment: List[Link["Investment"]] = []
    event_series: List[Link["EventSeries"]] = []
    inflation_assume: Inflation = None
    limit_posttax: float = 0
    spending_strat: List[Link["EventSeries"]] = [] #example uses name rather than link
    expense_withdraw: List[Link["Investment"]] = []#example uses name rather than link, also includes in the name "non-retirement" e.g "[S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax]"
    rmd_strat: List[Link["Investment"]] = []#example uses [S&P 500 pre-tax]
    roth_conversion_strat: List[Link["Investment"]] = [] #Example uses "[S&P 500 pre-tax]", should we store name as well rather than objectid?
    roth_optimizer: RothOptimizer = None
    #not sure if this is the intended sharing method
    r_only_share: List[Link["User"]] = []
    wr_only_share: List[Link["User"]] = []
    fin_goal: float = 0
    state: str = None
    
    class Settings:
        name="scenarios"
        keep_nulls = False
