#put db actions here, then import to other files as app.db.db_utils

from fastapi import APIRouter
from app.models.user import User
from beanie import PydanticObjectId

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
    return await User.find_one(User.email==email)


# search for user with username
# async def find_user_name(username: str) -> User  | None:
#     return await User.find_one(name == username)

