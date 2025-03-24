from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional, TYPE_CHECKING
from app.models.utils import Fixed, Normal
from app.models.scenario import Scenario
# from app.models.user import User

#investment imports users, users import scenarios, scenarios import investment, circular dependency
if TYPE_CHECKING:
    from app.models.user import User

#capital gain/loss or dividends/interest, tied to value of investment, not to be confused with annual change in event series
class InvestAnnualChange(BaseModel):
    type: Literal['fixed', 'normal']
    fixed: Optional[Fixed]
    normal: Optional[Normal]
    #may need to enforce either-or relationship

class InvestmentType(Document):
    name: str
    description: str
    exp_annual_return: InvestAnnualChange
    expense_ratio: float
    exp_annual_income: InvestAnnualChange
    taxability: bool
    
    class Settings:
        name="investment_types"
    
class Investment(Document):
    # user: Link["User"] #not in example but necessary to know who it belongs to?
    #OR
    # scenario: Link["Scenario"] #NOT SURE IF NEEDED RIGHT NOW
    invest_type: str #name to investment_type
    invest_id: Optional[str] #name to investment + tax status?
    value: float
    tax_status: Literal['non-retirement','pre-tax','after-tax']

    class Settings:
        name="investments"