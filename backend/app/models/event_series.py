from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, Union, List

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
    
class EventAnnualChange(BaseModel):
    type: Literal['fixed', 'uniform', 'normal']   
    is_percent: Optional[bool] = False
    value: Optional[float] = None  # For fixed
    lower: Optional[float] = None  # For uniform
    upper: Optional[float] = None  # For uniform
    mean: Optional[float] = None   # For normal
    stdev: Optional[float] = None  # For normal
class FixedInvestment(BaseModel):
    invest_id: str
    percentage: float

class GlideInvestment(BaseModel):
    invest_id: str
    initial: float #both percentages apparently this is non-retirement?
    final: float #apparently this is after tax?

class Invest(Document):
    is_glide: bool = False #if not it's fixed
    assets: Union[List[FixedInvestment], List[GlideInvestment]]
    max_cash: float
    
    class Settings:
        name="invest_events"
        
class Rebalance(Document):
    is_glide: bool = False #if not it's fixed
    assets: Union[List[FixedInvestment], List[GlideInvestment]]
    # max_cash: float DOES IT HAVE MAX CASH?

    class Settings:
        name="rebalance_events"
class Income(Document):
    initial_amt: float
    exp_annual_change: EventAnnualChange
    inflation_adjust: bool
    user_split: Optional[float] #split percentage btwn user and spouse
    social_security: bool #social security income or not
    
    class Settings:
        name="income_events"

class Expense(Document):
    initial_amt: float
    exp_annual_change: EventAnnualChange
    inflation_adjust: bool
    user_split: Optional[float] #split percentage btwn user and spouse
    is_discretionary: bool
    
    class Settings:
        name="expense_events"

class EventSeries(Document):
    name: str
    description: Optional[str] = None
    start: EventDate
    duration: EventDate
    type: Literal['income', 'expense', 'invest', 'rebalance']
    # details_links: Union[Link["Income"], Link["Expense"], Link["Invest"], Link["Rebalance"]]
    details: Union[Income, Expense, Invest, Rebalance]
    class Settings:
        name="event_series"
        keep_nulls=False
        