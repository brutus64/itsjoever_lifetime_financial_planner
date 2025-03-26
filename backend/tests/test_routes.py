from fastapi.testclient import TestClient
from app.main import app  # Import the FastAPI app
import pytest
import asyncio
from app.db.db import init_db

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
    
    
def test_export_scenario(client):
    # test_import_scenario(client)
    res = client.get("/api/scenario/export/Retirement Planning Scenario")
    # assert res.headers.get("content-type") == "application/x-yaml"
    assert res.status_code == 200




# def test_submit_scenario(client):
#     response = client.post(
#         "/api/scenario/create_scenario",
#         json=scenario_data  # Send the data as JSON
#     )
#     assert True