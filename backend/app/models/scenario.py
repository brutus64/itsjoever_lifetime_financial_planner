from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, List, TYPE_CHECKING, Union


#investment imports users, users import scenarios, scenarios import investment, circular dependency
if TYPE_CHECKING:
    from app.models.investment import Investment, InvestmentType
    from app.models.event_series import EventSeries, Expense
    from app.models.user import User
class LifeExpectancy(BaseModel):
    type: Literal['fixed', 'normal'] = "fixed" #although type is a python keyword, it works under this context
    value: Optional[int] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    
class RothOptimizer(BaseModel):
    is_enable: bool = False
    start_year: Optional[int] = None
    end_year: Optional[int] = None

class Inflation(BaseModel):
    type: Literal['fixed', 'normal', 'uniform'] = "fixed"
    value: Optional[float] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
class Scenario(Document):
    user: Optional[Link['User']] = None #DONT HAVE THE DATA RIGHT NOW
    name: Optional[str] = ""
    marital: Literal['couple', 'individual'] = "individual"
    birth_year: List[Optional[int]] = [None,None]
    life_expectancy: List[LifeExpectancy] = [LifeExpectancy(),LifeExpectancy()]
    investment_types: List[Link["InvestmentType"]] = []
    investment: List[Link["Investment"]] = []
    event_series: List[Link["EventSeries"]] = []
    inflation_assume: Inflation = Inflation()
    limit_posttax: Optional[float] = None #change later
    spending_strat: List[Link["EventSeries"]] = []#example uses name rather than link
    expense_withdraw: List[Link["Investment"]] = []#example uses name rather than link, also includes in the name "non-retirement" e.g "[S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax]"
    rmd_strat: List[Link["Investment"]] = [] #example uses [S&P 500 pre-tax]
    roth_conversion_strat: List[Link["Investment"]] = []#Example uses "[S&P 500 pre-tax]", should we store name as well rather than objectid?
    roth_optimizer: RothOptimizer = RothOptimizer()
    #not sure if this is the intended sharing method
    r_only_share: List[Link["User"]] = []
    wr_only_share: List[Link["User"]] = []
    fin_goal: Optional[float] = None
    state: Optional[str] = ""
    
    class Settings:
        name="scenarios"