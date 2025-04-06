from fastapi.testclient import TestClient
from app.main import app  # Import the FastAPI app
import pytest
import asyncio
from app.db.db import init_db
import yaml

@pytest.fixture(scope="module")
def client():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(init_db())
    
    with TestClient(app) as test_client:
        yield test_client

# client = TestClient(app)

def test_import_scenario(client):
    file_path = "tests/scenario.yaml"

    with open(file_path, "rb") as file:
        # Simulate a file upload
        response = client.post(
            "/api/scenario/import",
            files={"file": ("scenario.yaml", file, "application/x-yaml")}
        )
    assert response.status_code == 200

    data = response.json()
    assert "name" in data
    assert data["name"] == "Retirement Planning Scenario"
    assert "id" in data
    assert "message" in data
    assert data["name"] == "Retirement Planning Scenario"
    assert data["message"] == "Scenario imported successfully"
    assert isinstance(data["id"], str)
    
def test_export_scenario(client):
    # test_import_scenario(client)
    scenario_name = "Retirement Planning Scenario"
    res = client.get(f"/api/scenario/export/{scenario_name}")
    # assert res.headers.get("content-type") == "application/x-yaml"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "application/x-yaml"
    yaml_content = yaml.safe_load(res.content)

    # Check for key elements in the exported YAML
    assert yaml_content["name"] == scenario_name
    assert "maritalStatus" in yaml_content
    assert "birthYears" in yaml_content
    assert "lifeExpectancy" in yaml_content
    assert "investmentTypes" in yaml_content
    assert "investments" in yaml_content
    assert "eventSeries" in yaml_content
    assert "inflationAssumption" in yaml_content
    assert "spendingStrategy" in yaml_content
    assert "expenseWithdrawalStrategy" in yaml_content
    assert "RMDStrategy" in yaml_content
    assert "financialGoal" in yaml_content
    assert "residenceState" in yaml_content


# def test_delete_user_scenario(client):
#     # Specific IDs from your actual database
#     user_id = "67e324cbf2755219ac0ef544"  
#     scenario_id = "67e37e9b29fd7d9a209ed94a"
#     check_response = client.get(f"/api/scenarios/view/{scenario_id}")
#     if check_response.status_code == 200:
#         print("YES")
#     delete_response = client.delete(f"/api/{user_id}/{scenario_id}")
    
#     assert delete_response.status_code == 200
    
# def test_submit_scenario(client):
#     response = client.post(
#         "/api/scenario/create_scenario",
#         json=scenario_data  # Send the data as JSON
#     )
#     assert True