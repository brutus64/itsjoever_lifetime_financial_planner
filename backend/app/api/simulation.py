from fastapi import APIRouter, HTTPException
router = APIRouter()

@router.post("/")
async def simulate(sim_data:dict):
    try:
        # add simulation request to some queue
        print(sim_data)
        return {"message":"ok","id":str(id)}
    except Exception as e:
        print(f"Error in simulate: {e}") 
        raise HTTPException(status_code=400, detail="Error at simulation request")