from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.scenario import Scenario
import yaml

router = APIRouter(prefix="/scenario")


@router.post("/create_event_series")
async def create_event_series():
    try:
        pass
    except Exception as e:
        pass

@router.post("/create_investment")
async def create_investment():
    try:
        pass
    except Exception as e:
        pass
    
@router.post("/create_scenario")
async def create_scenario(scenario: Scenario):
    try:
        created_scenario = await scenario.insert()
        return {"message": "success"}
    except Exception as e:
        pass

@router.get("/{scenario_id}")
async def fetch_scenario(scenario_id: str):
    try:
        scenario = await Scenario.get(scenario_id) #get is a specialized function for getting id
        if not scenario:
            raise HTTPException(status_code=404, detail=f"Scenario not found with id:{scenario_id}")
        return {"scenario": scenario}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scenario not found, bad request, error: {e}")

@router.post("/import")
async def import_scenario(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.yaml', '.yml')):
            raise HTTPException(status_code=400, detail="Importing scenarios only accepts YAML files.")
        content = await file.read()
        data = yaml.safe_load(content)
        print(data)
        return data
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail="yaml file cannot be parsed for some reason")
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Bad request for importing scenario")
    

    
    
@router.get("/export/{scenario_id}")
async def export_scenario(scenario_id: str):
    pass
    
    