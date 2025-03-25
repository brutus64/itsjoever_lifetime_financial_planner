from beanie import init_beanie, Document
import motor.motor_asyncio
import os
from dotenv import load_dotenv
from app.models.event_series import EventSeries, Invest, Expense, Income, Rebalance
from app.models.investment import Investment, InvestmentType
from app.models.scenario import Scenario
from app.models.user import User
from app.models.tax import StateTax, FederalTax, RMDTable, CapitalGains, StandardDeduct
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
    db = client.db_name
    await init_beanie(database=db, document_models=[EventSeries, Invest, Expense, Income, Rebalance, Investment, InvestmentType, Scenario, User, StateTax, FederalTax, RMDTable, CapitalGains, StandardDeduct])
    # creates collection if not existed
    
    for model in [EventSeries, Invest, Expense, Income, Rebalance, Investment, InvestmentType, Scenario, User, StateTax, FederalTax, RMDTable, CapitalGains, StandardDeduct]:
        collection_name = model.get_collection_name()
        if collection_name not in await db.list_collection_names():
            await db.create_collection(collection_name)
            print(f"Created collection: {collection_name}")