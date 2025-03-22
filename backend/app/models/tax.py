from beanie import Document
from pydantic import BaseModel
from typing import List

class Bracket(BaseModel):
    min_income: float
    max_income: float
    rate: float
    
class Distribution(BaseModel):
    age: int
    distribution_period: float
class FederalTax(Document):
    year_from: int
    single_bracket: List[Bracket]
    married_bracket: List[Bracket]
    class Settings:
        name="federal_taxes"        
class StateTax(Document):
    year_from: int
    state: str
    single_bracket: List[Bracket]
    married_bracket: List[Bracket]
        
    class Settings:
        name="state_taxes"
    
class StandardDeduct(Document):
    year_from: int
    single_deduct: float
    married_deduct: float
    # head_house_deduct: float
    class Settings:
        name="standard_deductions"
class CapitalGains(Document):
    year_from: int
    single_bracket: List[Bracket]
    married_bracket: List[Bracket]
    class Settings:
        name="capital_gains"   
class RMDTable(Document):
    year_from: int
    table: List[Distribution]
    class Settings:
        name="rmd_table"