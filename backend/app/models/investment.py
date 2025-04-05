from beanie import Document
from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional, TYPE_CHECKING, Any
# from app.models.scenario import Scenario
# from app.models.user import User

#investment imports users, users import scenarios, scenarios import investment, circular dependency
if TYPE_CHECKING:
    from app.models.user import User

#capital gain/loss or dividends/interest, tied to value of investment, not to be confused with annual change in event series
class InvestAnnualChange(BaseModel):
    type: Literal['fixed', 'normal']
    value: Optional[float] = None
    mean: Optional[float] = None
    stdev: Optional[float] = None
    is_percent: bool = False
    
    model_config = ConfigDict(exclude_none=True)

    # #may need to enforce either-or relationship
    # def dict(self, *args, **kwargs) -> dict[str, Any]:
    #     """
    #         Override the default dict method to exclude None values in the response
    #     """
    #     kwargs.pop('exclude_none', None)
    #     return super().model_dump(*args, exclude_none=True, **kwargs)

    # class Config:
    #     exclude_none = True
class InvestmentType(Document):
    name: str
    description: str
    exp_annual_return: InvestAnnualChange
    expense_ratio: float
    exp_annual_income: InvestAnnualChange
    taxability: bool
    
    class Settings:
        name="investment_types"
        keep_nulls = False

class Investment(Document):
    # user: Link["User"] #not in example but necessary to know who it belongs to?
    #OR
    # scenario: Link["Scenario"] #NOT SURE IF NEEDED RIGHT NOW
    invest_type: str #name to investment_type -- # KEEP AS invest_type, frontend changed to invest_type
    invest_id: Optional[str] #name to investment + tax status?
    value: float
    tax_status: Literal['non-retirement','pre-tax','after-tax']

    class Settings:
        name="investments"