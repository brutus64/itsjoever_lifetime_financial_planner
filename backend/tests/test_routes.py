from fastapi.testclient import TestClient
from app.main import app  # Import the FastAPI app
import pytest
import asyncio
from app.db.db import init_db
import uuid
from datetime import datetime, date
from app.models.user import User
from json import dumps
import yaml

@pytest.fixture(scope="module")
def client():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(init_db())
    
    with TestClient(app) as test_client:
        yield test_client

# client = TestClient(app)

# def test_import_scenario(client):
#     file_path = "tests/scenario.yaml"

#     with open(file_path, "rb") as file:
#         # Simulate a file upload
#         response = client.post(
#             "/api/scenariosimport",
#             files={"file": ("scenario.yaml", file, "application/x-yaml")}
#         )
#     assert response.status_code == 200

#     data = response.json()
#     assert "name" in data
#     assert data["name"] == "Retirement Planning Scenario"
#     assert "id" in data
#     assert "message" in data
#     assert data["name"] == "Retirement Planning Scenario"
#     assert data["message"] == "Scenario imported successfully"
#     assert isinstance(data["id"], str)
    
# def test_export_scenario(client):
#     # test_import_scenario(client)  
#     scenario_name = "Retirement Planning Scenario"
#     res = client.get(f"/api/scenarios/export/{scenario_name}")
#     # assert res.headers.get("content-type") == "application/x-yaml"
#     assert res.status_code == 200
#     assert res.headers["Content-Type"] == "application/x-yaml"
#     yaml_content = yaml.safe_load(res.content)

#     # Check for key elements in the exported YAML
#     assert yaml_content["name"] == scenario_name
#     assert "maritalStatus" in yaml_content
#     assert "birthYears" in yaml_content
#     assert "lifeExpectancy" in yaml_content
#     assert "investmentTypes" in yaml_content
#     assert "investments" in yaml_content
#     assert "eventSeries" in yaml_content
#     assert "inflationAssumption" in yaml_content
#     assert "spendingStrategy" in yaml_content
#     assert "expenseWithdrawalStrategy" in yaml_content
#     assert "RMDStrategy" in yaml_content
#     assert "financialGoal" in yaml_content
#     assert "residenceState" in yaml_content
def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def test_event_series_post(client):
    user_email = f"test_event_flow_41a3a898-b0ae-454f-bda5-6bdbaa918029@test.com"
    user_data = User(
        name="test_user",
        email=user_email,
        session="",
        scenarios=[],
        age=30,
        birthday=datetime.now(),
        shared_r_scenarios=[],
        shared_rw_scenarios=[],
    )
    
    # Convert user_data to dict and handle the datetime serialization manually
    user_dict = user_data.model_dump()
    user_dict["birthday"] = user_dict["birthday"].isoformat() 
    user_res = client.post("/api/add_user", json=user_dict)
    assert user_res.status_code == 200
    print("USER", user_res)
    user = user_res.json()
    user_id = user['_id']
    # print(user_id)
    user_dict = {
        "user": user_id
    }
    # scenario_create_res = client.post("/api/scenarios/new", json=user_dict)
    # assert scenario_create_res.status_code == 200
    # scenario = scenario_create_res.json()
    # scenario_id = scenario['id']
    # print(scenario_id)
    scenario_id = '67f321d034280518758d0ee6'
    sample_event_form = {
        "type": "income",
        "name": "cash",
        "description": "haha",
        "start_year": {
            "type": "fixed",
            "value": 2025
        },
        "duration": {
            "type": "uniform",
            "lower": 20,
            "upper": 40
        },
        "initial_amt": 2000.0,
        "exp_annual_change": {
            "is_percent": False,
            "type": "fixed",
            "value": 500,
        },
        "inflation_adjust": False,
        "user_split": 50.0,
        "social_security": True,
    }
    event_post_res = client.post(f"/api/scenarios/event_series/{scenario_id}", json=sample_event_form)
    assert event_post_res.status_code == 200
    events = event_post_res.json()
    print(events)
    newest_event = events['event_series'][-1]['id']
    print(newest_event)
    sample_put_event_form = {
        "type": "income",
        "name": "joe",
        "description": "rent paid to me",
        "start_year": {
            "type": "normal",
            "mean": 2030,
            "stdev": 4
        },
        "duration": {
            "type": "uniform",
            "lower": 15,
            "upper": 30
        },
        "initial_amt": 5000.0,
        "exp_annual_change": {
            "is_percent": True,
            "type": "uniform",
            "lower": 50,
            "upper": 100
        },
        "inflation_adjust": True,
        "user_split": 100.0,
        "social_security": False,
    }
    event_put_res = client.put(f"/api/scenarios/event_series/{scenario_id}/{newest_event}", json=sample_put_event_form)
    assert event_put_res.status_code == 200
    events = event_put_res.json()
    print(events)
    # const defaultGenericEventForm = {
    # // INCOME/EXPENSE/INVEST/REBALANCE
    # type: "",
    # name: "",
    # description: "",
    # start_year: {
    #     type: "", //  "fixed", "uniform", "normal", "start_with", "end_with"
    #     value: 2025,
    #     lower: 0,
    #     upper: 100,
    #     mean: 0,
    #     stdev: 1,
    #     start_with: "", // if type is "start_with" or "end_with"
    #     end_with: ""
    # },
    # duration: {
    #     type: "", //fixed, uniform, normal
    #     value: 0,
    #     lower: 0,
    #     upper: 0,
    #     mean: 0,
    #     stdev: 1,
    # },

    # // INCOME/EXPENSE
    # initial_amt: 0.0,
    # exp_annual_change: {
    #     is_percent: null,
    #     type: "", // either "fixed" or "normal" or "uniform"
    #     value: 0,
    #     mean:0,
    #     stdev:1,
    #     lower: 0,
    #     upper: 0
    # },
    # inflation_adjust: false,
    # user_split: 100.0,
    # // INCOME
    # social_security: false,
    # // EXPENSE
    # is_discretionary: false,
    
    # // INVEST/REBALANCE
    # is_glide: false,
    # initial: {}, //key = "investment_type tax_status", value = percentage AKA asset_allocation1
    # final: {}, //key = "investment_type tax_status", value = percentage AKA asset_allocation2
    # initial_allocation_data: {}, // used to display % in frontend; stores entirety of input's value parameter (eg in InitialAssetAllocationCard)
    # final_allocation_data: {},

    # // INVEST
    # max_cash: 0.0,
    # // REBALANCE
    # tax_status: "non-retirement"

