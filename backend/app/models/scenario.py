from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, List, TYPE_CHECKING, Union
from app.models.utils import Normal, Fixed


#investment imports users, users import scenarios, scenarios import investment, circular dependency
if TYPE_CHECKING:
    from app.models.investment import Investment, InvestmentType
    from app.models.event_series import EventSeries, Expense
    from app.models.user import User
class LifeExpectancy(BaseModel):
    type: Literal['fixed', 'normal'] #although type is a python keyword, it works under this context
    fixed: Optional[int]
    normal: Optional[Normal]
    
class RothOptimizer(BaseModel):
    is_enable: bool
    start_year: int
    end_year: int

class Scenario(Document):
    user: Link['User']
    name: str
    martial: Literal['couple', 'individual']
    birth_year: List[int]
    life_expectancy: List[LifeExpectancy]
    investment_types: List[Link["InvestmentType"]]
    investment: List[Link["Investment"]]
    event_series: List[Link["EventSeries"]]
    inflation_assume: Union[Fixed, Normal]
    limit_posttax: float
    spending_strat: List[str] #example uses name rather than link
    expense_withdraw: List[str] #example uses name rather than link, also includes in the name "non-retirement" e.g "[S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax]"
    rmd_strat: List[str] #example uses [S&P 500 pre-tax]
    roth_conversion_strat: List[str] #Example uses "[S&P 500 pre-tax]", should we store name as well rather than objectid?
    roth_optimizer: RothOptimizer
    #not sure if this is the intended sharing method
    r_only_share: List[Link["User"]] = []
    wr_only_share: List[Link["User"]] = []
    ignore_state_tax: bool
    fin_goal: float
    state: str = None
    
    class Settings:
        name="scenarios"