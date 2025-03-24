from fastapi.testclient import TestClient
from app.main import app  # Import the FastAPI app

client = TestClient(app)

def test_import_scenario():
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