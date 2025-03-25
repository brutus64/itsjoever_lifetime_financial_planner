#put db actions here, then import to other files as app.db.db_utils

from fastapi import APIRouter
from app.models.user import User
from beanie import PydanticObjectId
from app.models.event_series import EventSeries
from app.models.investment import Investment

# add a user to User db
async def add_user(user_data: dict) -> User:
    user = User(**user_data)
    await user.insert()
    return user

# delete a user with user_id from User db
async def delete_user(user_id: PydanticObjectId) -> bool:
    deleted_user = await User.get(user_id)
    if deleted_user:
        await deleted_user.delete()
        return True
    
    return False

# search for a user with email
async def find_user_email(email: str) -> User | None:
        return await User.find_one(User.email==email, fetch_links=True)


# search for user with username
async def find_user_name(username: str) -> User  | None:
    return await User.find_one(User.name == username, fetch_links=True)



'''---------FOR SCENARIO IMPORT/EXPORT-------------'''
#map event series names to ids (used in import)
async def eventnames_to_id(names,event_series):
    if not names:
        return []
    
    event_ids = []
    if not event_series:
        event_series = await EventSeries.find({"name": {"$in": names}}).to_list()
    
    mapping = {event.name: event.id for event in event_series}
    
    for name in names:
        if name in mapping:
            event_ids.append(mapping[name])
    return event_ids

async def investmentnames_to_id(names,invests):
    if not names:
        return []

    invest_ids = []
    # If invests not provided, fetch them from database
    if not invests:
        invests = await Investment.find({"invest_id": {"$in": names}}).to_list()
    
    # Create mapping from invest_id to MongoDB ObjectID
    mapping = {invest.invest_id: invest.id for invest in invests}
    
    # Map each name to its MongoDB ObjectID
    for name in names:
        if name in mapping:
            invest_ids.append(mapping[name])
    
    return invest_ids