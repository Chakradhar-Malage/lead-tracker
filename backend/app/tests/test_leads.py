def _create_lead(client, name="Jane Doe", email="jane@example.com", phone="1234567890"):
    return client.post(
        "/api/leads", json={"name": name, "email": email, "phone": phone}
    )


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_create_lead_success(client):
    resp = _create_lead(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Jane Doe"
    assert body["email"] == "jane@example.com"
    assert body["phone"] == "1234567890"
    assert body["status"] == "NEW"
    assert "id" in body and "created_at" in body


def test_create_lead_invalid_email_rejected(client):
    resp = _create_lead(client, email="not-an-email")
    assert resp.status_code == 422


def test_create_lead_blank_name_rejected(client):
    resp = _create_lead(client, name="   ")
    assert resp.status_code == 422


def test_list_leads_returns_all(client):
    _create_lead(client, name="Alice", email="alice@example.com")
    _create_lead(client, name="Bob", email="bob@example.com")

    resp = client.get("/api/leads")
    assert resp.status_code == 200
    names = {lead["name"] for lead in resp.json()}
    assert names == {"Alice", "Bob"}


def test_list_leads_newest_first(client):
    _create_lead(client, name="Alice", email="alice@example.com")
    _create_lead(client, name="Bob", email="bob@example.com")

    resp = client.get("/api/leads")
    names_in_order = [lead["name"] for lead in resp.json()]
    # Bob was created after Alice, so should appear first.
    assert names_in_order == ["Bob", "Alice"]


def test_search_leads_by_name(client):
    _create_lead(client, name="Alice Smith", email="alice@example.com")
    _create_lead(client, name="Bob Jones", email="bob@example.com")

    resp = client.get("/api/leads", params={"search": "alice"})
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["name"] == "Alice Smith"


def test_search_leads_by_email(client):
    _create_lead(client, name="Alice Smith", email="alice@example.com")
    _create_lead(client, name="Bob Jones", email="bob@example.com")

    resp = client.get("/api/leads", params={"search": "bob@example.com"})
    results = resp.json()
    assert len(results) == 1
    assert results[0]["name"] == "Bob Jones"


def test_search_leads_by_phone(client):
    _create_lead(client, name="Alice", email="alice@example.com", phone="5551234")
    _create_lead(client, name="Bob", email="bob@example.com", phone="5559999")

    resp = client.get("/api/leads", params={"search": "1234"})
    results = resp.json()
    assert len(results) == 1
    assert results[0]["name"] == "Alice"


def test_filter_leads_by_status(client):
    lead_id = _create_lead(client, name="Alice", email="alice@example.com").json()["id"]
    _create_lead(client, name="Bob", email="bob@example.com")
    client.patch(f"/api/leads/{lead_id}/status", json={"status": "QUALIFIED"})

    resp = client.get("/api/leads", params={"status": "QUALIFIED"})
    results = resp.json()
    assert len(results) == 1
    assert results[0]["name"] == "Alice"


def test_update_lead_status_success(client):
    lead_id = _create_lead(client).json()["id"]

    resp = client.patch(f"/api/leads/{lead_id}/status", json={"status": "CONVERTED"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "CONVERTED"


def test_update_lead_status_invalid_value_rejected(client):
    lead_id = _create_lead(client).json()["id"]

    resp = client.patch(f"/api/leads/{lead_id}/status", json={"status": "NOT_A_STATUS"})
    assert resp.status_code == 422


def test_update_status_for_missing_lead_returns_404(client):
    resp = client.patch(
        "/api/leads/does-not-exist/status", json={"status": "CONTACTED"}
    )
    assert resp.status_code == 404
