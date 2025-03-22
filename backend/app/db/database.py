from beanie import init_beanie, Document
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

class TestModel(Document):
    name: str

async def init_db():
    conn_string = os.getenv("MONGODB_URL")
    print(conn_string)
    client = motor.motor_asyncio.AsyncIOMotorClient(conn_string)
    await init_beanie(database=client.db_name, document_models=[TestModel])

# mongodb+srv://dannywang723:<db_password>@lfp.oyz0k.mongodb.net/?retryWrites=true&w=majority&appName=lfp