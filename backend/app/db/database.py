from beanie import init_beanie, Document
import motor.motor_asyncio
import os
from dotenv import load_dotenv
from app.models.event_series import EventSeries, Invest, Expense, Income, Rebalance
from app.models.investment import Investment, InvestmentType
from app.models.scenario import Scenario
from app.models.user import User
load_dotenv()

Scenario.model_rebuild()
InvestmentType.model_rebuild()
Investment.model_rebuild()
EventSeries.model_rebuild()
Expense.model_rebuild()
Income.model_rebuild()
Rebalance.model_rebuild()
User.model_rebuild()

async def init_db():
    conn_string = os.getenv("MONGODB_URL")
    print(conn_string)
    client = motor.motor_asyncio.AsyncIOMotorClient(conn_string)
    await init_beanie(database=client.db_name, document_models=[EventSeries, Invest, Expense, Income, Rebalance, Investment, InvestmentType, Scenario, User])