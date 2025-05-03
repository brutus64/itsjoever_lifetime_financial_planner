from fastapi import APIRouter, HTTPException
from app.simulation.simulate import simulate_start
from app.simulation.explore import explore_start
import json
router = APIRouter()

@router.post("/")
async def simulate(sim_data:dict):
    try:
        results = await simulate_start(**sim_data)
        return results
    except Exception as e:
        print(f"Error in simulate: {e}") 
        raise HTTPException(status_code=400, detail="Error at simulation request")

@router.post("/exploration")
async def explore(explore_data:dict):
    try:
        print(explore_data) 
        results = await explore_start(explore_data)
        return results
    except Exception as e:
        print(f"Error in explore: {e}") 
        raise HTTPException(status_code=400, detail="Error at explore request")