from fastapi import APIRouter, HTTPException
from app.simulation.simulate import simulate_n
router = APIRouter()

@router.post("/")
async def simulate(sim_data:dict):
    try:
        # print(sim_data)
        id = await simulate_n(**sim_data)
        return {"message":"ok","id":str(id)}
    except Exception as e:
        print(f"Error in simulate: {e}") 
        raise HTTPException(status_code=400, detail="Error at simulation request")