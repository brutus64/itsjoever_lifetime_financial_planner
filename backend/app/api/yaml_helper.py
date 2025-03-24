from app.models.scenario import Scenario
from app.models.investment import *
import yaml

def create_investment_type_from_yaml(yaml_data):
    # Parse the return distribution
    exp_annual_return, exp_annual_income = None, None
    return_distribution = yaml_data.get("returnDistribution", {})
    if return_distribution.get("type") == "fixed":
        exp_annual_return = InvestAnnualChange(
            type="fixed",
            fixed=Fixed(
                amt=return_distribution.get("value"),
                is_percent= True if yaml_data.get('returnAmtOrPct') == 'percent' else False
            ),
            normal=None
        )
    elif return_distribution.get("type") == "normal":
        exp_annual_return = InvestAnnualChange(
            type="normal",
            fixed=None,
            normal=Normal(
                mean=return_distribution.get("mean"),
                stdev=return_distribution.get("stdev"),
                is_percent= True if yaml_data.get('returnAmtOrPct') == 'percent' else False
            )
        )
    else:
        raise ValueError("Invalid returnDistribution type")

    # Parse the income distribution
    income_distribution = yaml_data.get("incomeDistribution", {})
    if income_distribution.get("type") == "fixed":
        exp_annual_income = InvestAnnualChange(
            type="fixed",
            fixed=Fixed(
                amt=income_distribution.get("value"),
                is_percent= True if yaml_data.get('incomeAmtOrPct') == 'percent' else False # Assuming it's not a percentage for fixed values
            ),
            normal=None
        )
    elif income_distribution.get("type") == "normal":
        exp_annual_income = InvestAnnualChange(
            type="normal",
            fixed=None,
            normal=Normal(
                mean=income_distribution.get("mean"),
                stdev=income_distribution.get("stdev"),
                is_percent= True if yaml_data.get('incomeAmtOrPct') == 'percent' else False  # Assuming it's a percentage for normal distributions
            )
        )
    else:
        raise ValueError("Invalid incomeDistribution type")

    # Create the InvestmentType object
    investment_type = InvestmentType(
        name=yaml_data.get("name"),
        description=yaml_data.get("description"),
        exp_annual_return=exp_annual_return,
        expense_ratio=yaml_data.get("expenseRatio"),
        exp_annual_income=exp_annual_income,
        taxability=yaml_data.get("taxability")
    )

    return investment_type