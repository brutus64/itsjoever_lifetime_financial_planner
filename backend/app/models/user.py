from beanie import Document, Link
from typing import List
from scenario import Scenario
import datetime

#Beanie automatically handles _id from MongoDB by default, it is seen as .id field
class User(Document):
    name: str
    email: str
    hashed_password: str
    session: str
    scenarios: List[Link[Scenario]]
    age: int
    birthday: datetime
    shared_r_scenarios: List[Link[Scenario]]
    shared_rw_scenarios: List[Link[Scenario]]
    
    class Settings: #collection naming
        name = "users"
    #To be implemented for API Documentation  
    # class Config: