from fastapi import APIRouter
import yaml

router = APIRouter()

    
@router.get("/")
async def begin():
    return {"msg": "hi"}


@router.post("/{user_id}/state_tax")
async def yaml_parse():
    
    return