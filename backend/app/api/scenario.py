from fastapi import APIRouter

router = APIRouter("/scenario")

@router.get("/")
async def hello():
    pass