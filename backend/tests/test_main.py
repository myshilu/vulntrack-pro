import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import init_db
from app.main import app
from app.seed import seed_demo_data


def _login(client: TestClient, email: str = "demo@vulntrack.local", password: str = "Demo123!") -> dict:
    response = client.post("/api/auth/login", data={"username": email, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _sample_report(title: str = "Test report") -> dict:
    return {
        "title": title,
        "vulnerability_type": "CSRF",
        "severity": "Low",
        "status": "New",
        "affected_url": "http://example.com/contact",
        "endpoint": "/contact",
        "http_method": "POST",
        "vulnerable_parameter": "csrf_token",
        "description": "CSRF token is missing.",
        "steps_to_reproduce": "Submit POST without token.",
        "actual_result": "Request accepted.",
        "expected_result": "Request should be rejected.",
        "impact": "Attackers can trick users into submitting forms.",
        "remediation": "Implement CSRF protection.",
        "raw_request": None,
        "raw_response": None,
        "notes": None,
    }


def test_core_api_flow():
    init_db()
    seed_demo_data()
    with TestClient(app) as client:
        assert client.get("/api/health").json() == {"status": "ok"}

        headers = _login(client)
        me = client.get("/api/auth/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["email"] == "demo@vulntrack.local"

        reports = client.get("/api/reports", headers=headers)
        assert reports.status_code == 200
        assert len(reports.json()) >= 5

        created = client.post("/api/reports", json=_sample_report(), headers=headers)
        assert created.status_code == 201
        report_id = created.json()["id"]

        updated = client.patch(f"/api/reports/{report_id}/status", params={"new_status": "Triaged"}, headers=headers)
        assert updated.status_code == 200
        assert updated.json()["status_history"][-1]["new_status"] == "Triaged"

        stats = client.get("/api/dashboard/stats", headers=headers)
        assert stats.status_code == 200
        assert stats.json()["total_reports"] >= 6

        assert client.get("/api/reports").status_code == 401


def test_user_cannot_access_another_users_report():
    init_db()
    seed_demo_data()
    with TestClient(app) as client:
        demo_headers = _login(client)
        created = client.post("/api/reports", json=_sample_report("Private report"), headers=demo_headers)
        report_id = created.json()["id"]

        other_email = "other-user@vulntrack.local"
        client.post("/api/auth/register", json={"email": other_email, "password": "Other123!"})
        other_headers = _login(client, other_email, "Other123!")

        response = client.get(f"/api/reports/{report_id}", headers=other_headers)
        assert response.status_code == 403
