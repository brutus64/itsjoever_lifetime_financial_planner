from beanie import Document, Link
from pydantic import BaseModel
from typing import Literal, Optional
from utils import Fixed, Normal
from user import User

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
    is_tax_exempt: bool
    
class Investment(Document):
    investment_type: Link[InvestmentType]
    user: Link[User]
    value: float
    tax_status: Literal['non-retirement','pre-tax-retirement','after-tax-retirement']

    