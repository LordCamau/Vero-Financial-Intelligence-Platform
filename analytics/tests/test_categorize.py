from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_categorize_netflix():
    response = client.post("/categorize", json={"merchant": "Netflix", "amount": 12.99, "type": "debit"})
    assert response.status_code == 200
    assert response.json()["category"] == "Subscriptions"
