from beanie import Document, Link
from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional, Union, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.investment import Investment
class EventDate(BaseModel):
    type: Literal['fixed', 'uniform', 'normal', 'start_with', 'end_with']
    # For fixed/uniform/normal distribution
    value: Optional[float] = None
    lower: Optional[float] = None
    upper: Optional[float] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    # For references to other event series, CONSIDER whether keep it as string or not
    event_series: Optional[str] = None 
    
    model_config = ConfigDict(exclude_none=True)
    
class EventAnnualChange(BaseModel):
    type: Literal['fixed', 'uniform', 'normal']   
    is_percent: Optional[bool] = False
    value: Optional[float] = None  # For fixed
    lower: Optional[float] = None  # For uniform
    upper: Optional[float] = None  # For uniform
    mean: Optional[float] = None   # For normal
    stdev: Optional[float] = None  # For normal
    
    model_config = ConfigDict(exclude_none=True)


class FixedInvestment(BaseModel):
    invest_id: Link['Investment']
    percentage: float

class GlideInvestment(BaseModel):
    invest_id: str
    initial: float #both percentages apparently this is non-retirement?
    final: float #apparently this is after tax?

class Invest(BaseModel):
    is_glide: bool = False #if not it's fixed
    assets: Union[List[FixedInvestment], List[GlideInvestment]]
    max_cash: float
    
        
class Rebalance(BaseModel):
    is_glide: bool = False #if not it's fixed
    assets: Union[List[FixedInvestment], List[GlideInvestment]]
    # max_cash: float DOES IT HAVE MAX CASH?

class Income(BaseModel):
    initial_amt: float
    exp_annual_change: EventAnnualChange
    inflation_adjust: bool
    user_split: Optional[float] #split percentage btwn user and spouse
    social_security: bool #social security income or not
    
    model_config = ConfigDict(exclude_none=True)

class Expense(BaseModel):
    initial_amt: float
    exp_annual_change: EventAnnualChange
    inflation_adjust: bool
    user_split: Optional[float] #split percentage btwn user and spouse
    is_discretionary: bool
    
    model_config = ConfigDict(exclude_none=True)

class EventSeries(Document):
    name: str
    description: Optional[str] = None
    start: EventDate
    duration: EventDate
    type: Literal['income', 'expense', 'invest', 'rebalance']
    # details: Union[Link["Income"], Link["Expense"], Link["Invest"], Link["Rebalance"]]
    details: Union[Income, Expense, Invest, Rebalance]
    class Settings:
        name="event_series"
        keep_nulls=False
        