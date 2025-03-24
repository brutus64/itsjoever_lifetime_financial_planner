from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, Union, List
from app.models.utils import Fixed, Uniform, Normal
from app.models.investment import Investment

class Start(BaseModel):
    type: Literal['fixed', 'uniform', 'normal', 'start_with', 'end_with']
    fixed: Optional[int]
    uniform: Optional[Uniform]
    normal: Optional[Normal]
    start_with: Optional[Link["EventSeries"]] #is it supposed to be id or name? Line 83 scenario.yaml
    end_with: Optional[Link["EventSeries"]] #same tangent, is it supposed to be id or name? Line 83 scenario.yaml
    
class Duration(BaseModel):
    type: Literal['fixed', 'uniform', 'normal']
    fixed: Optional[int]
    uniform: Optional[Uniform]
    normal: Optional[Normal]

#change in amount of income/expense over time (not capital gains or dividends/interest)
class EventAnnualChange(BaseModel):
    type: Literal['fixed', 'uniform', 'normal']
    fixed: Optional[Fixed]
    uniform: Optional[Uniform]
    normal: Optional[Normal]

class FixedInvestment(BaseModel):
    investment: Link["Investment"]
    percentage: float

class GlideInvestment(BaseModel):
    investment: Link["Investment"]
    initial: float #both percentages apparently this is non-retirement?
    final: float #apparently this is after tax?
    
class AssetAlloc(BaseModel):
    type: Literal['fixed', 'glide']
    fixed: Optional[List[FixedInvestment]]
    glide: Optional[List[GlideInvestment]]

class Invest(Document):
    asset_alloc: AssetAlloc
    max_cash: float
    
    class Settings:
        name="invest_events"
    
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
    inflation_adjustment: bool
    user_split: Optional[float] #split percentage btwn user and spouse
    is_discretionary: bool
    
    class Settings:
        name="expense_events"

class Rebalance(Document):
    asset_alloc: AssetAlloc
    max_cash: float

    class Settings:
        name="rebalance_events"
class EventSeries(Document):
    name: str
    description: Optional[str]
    start: Start
    duration: Duration
    type: Literal['income', 'expense', 'invest', 'rebalance']
    details: Union[Link["Income"], Link["Expense"], Link["Invest"], Link["Rebalance"]]
    class Settings:
        name="event_series"
        