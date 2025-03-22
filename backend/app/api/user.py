from fastapi import APIRouter

router = APIRouter()

    
@router.get("/")
async def begin():
    return {"msg": "hi"}