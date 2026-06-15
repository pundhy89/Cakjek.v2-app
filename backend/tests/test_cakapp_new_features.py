"""Backend API tests for CakApp duration-tier pricing (Harian/Mingguan/Bulanan) + kost/rent/orders."""
import os
import pytest
import requests

def _load_backend_url():
    if "REACT_APP_BACKEND_URL" in os.environ:
        return os.environ["REACT_APP_BACKEND_URL"]
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env")
    with open(env_path) as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("REACT_APP_BACKEND_URL not found")

BASE = _load_backend_url().rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Public Kost: 3-tier pricing ----------
def test_list_kost_has_three_tier_prices():
    r = requests.get(f"{API}/kost", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 3
    for k in items:
        for key in ["id", "name", "price_day", "price_week", "price_month"]:
            assert key in k, f"missing {key} in kost {k.get('name')}"


def test_list_kost_melati_default_prices():
    items = requests.get(f"{API}/kost", timeout=15).json()
    melati = next((k for k in items if "Melati" in k["name"]), None)
    assert melati, "Seed Kost Melati No. 7 not found"
    assert melati["price_day"] == 50000
    assert melati["price_week"] == 280000
    assert melati["price_month"] == 850000


# ---------- Public Rent: 3-tier + with-driver ----------
def test_list_rent_seeded_has_4():
    items = requests.get(f"{API}/rent", timeout=15).json()
    assert len(items) >= 4


def test_rent_mobil_has_6_prices():
    items = requests.get(f"{API}/rent?type=mobil", timeout=15).json()
    assert len(items) >= 2
    for v in items:
        assert v["type"] == "mobil"
        for k in ["price_day", "price_week", "price_month",
                  "price_with_driver_day", "price_with_driver_week", "price_with_driver_month"]:
            assert k in v, f"missing {k} in {v.get('name')}"
            assert v[k] > 0, f"{v.get('name')}.{k} should be >0, got {v[k]}"
        assert v.get("allow_with_driver") is True


def test_rent_motor_no_driver_prices():
    items = requests.get(f"{API}/rent?type=motor", timeout=15).json()
    assert len(items) >= 2
    for v in items:
        assert v["type"] == "motor"
        for k in ["price_day", "price_week", "price_month"]:
            assert v[k] > 0
        assert v.get("allow_with_driver") is False, f"{v['name']} should not allow driver"


# ---------- Admin Kost CRUD ----------
def test_admin_kost_unauthorized():
    assert requests.get(f"{API}/admin/kost", timeout=15).status_code == 401
    assert requests.post(f"{API}/admin/kost", json={"name": "x"}, timeout=15).status_code == 401


def test_admin_kost_crud_three_tier(auth_headers):
    payload = {
        "name": "TEST_Kost_3Tier",
        "address": "Jl Test",
        "description": "Uji 3 tarif",
        "facilities": "AC, WiFi",
        "price_day": 60000,
        "price_week": 350000,
        "price_month": 1100000,
        "image": "",
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/kost", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["price_day"] == 60000
    assert created["price_week"] == 350000
    assert created["price_month"] == 1100000
    kid = created["id"]

    # Update: weekly price -> 0 (unavailable)
    upd = {**payload, "price_week": 0}
    r = requests.put(f"{API}/admin/kost/{kid}", json=upd, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    # GET-after-PUT
    items = requests.get(f"{API}/admin/kost", headers=auth_headers, timeout=15).json()
    fetched = next(i for i in items if i["id"] == kid)
    assert fetched["price_week"] == 0
    assert fetched["price_day"] == 60000
    assert fetched["price_month"] == 1100000

    # cleanup
    requests.delete(f"{API}/admin/kost/{kid}", headers=auth_headers, timeout=15)


# ---------- Admin Rent CRUD ----------
def test_admin_rent_unauthorized():
    assert requests.post(f"{API}/admin/rent", json={"name": "x"}, timeout=15).status_code == 401


def test_admin_rent_mobil_six_prices(auth_headers):
    payload = {
        "name": "TEST_Avanza_6P",
        "type": "mobil",
        "description": "Mobil test 6 tarif",
        "image": "",
        "price_day": 300000,
        "price_week": 1800000,
        "price_month": 6500000,
        "allow_with_driver": True,
        "price_with_driver_day": 500000,
        "price_with_driver_week": 3200000,
        "price_with_driver_month": 11500000,
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/rent", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["type"] == "mobil"
    assert d["allow_with_driver"] is True
    assert d["price_day"] == 300000
    assert d["price_week"] == 1800000
    assert d["price_month"] == 6500000
    assert d["price_with_driver_day"] == 500000
    assert d["price_with_driver_week"] == 3200000
    assert d["price_with_driver_month"] == 11500000
    rid = d["id"]

    # GET-after-POST verifies persistence
    items = requests.get(f"{API}/rent?type=mobil", timeout=15).json()
    fetched = next(i for i in items if i["id"] == rid)
    assert fetched["price_with_driver_month"] == 11500000

    requests.delete(f"{API}/admin/rent/{rid}", headers=auth_headers, timeout=15)


def test_admin_rent_motor_zeroes_driver_prices(auth_headers):
    """Per spec: motor must have allow_with_driver forced to False AND
    price_with_driver_* must be zero, even if admin sends non-zero values."""
    payload = {
        "name": "TEST_Motor_BadDriver",
        "type": "motor",
        "description": "Motor (driver fields should be ignored)",
        "image": "",
        "price_day": 80000,
        "price_week": 480000,
        "price_month": 1600000,
        "allow_with_driver": True,  # should be forced false
        "price_with_driver_day": 200000,  # should be zeroed
        "price_with_driver_week": 1200000,
        "price_with_driver_month": 4000000,
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/rent", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    rid = d["id"]
    try:
        assert d["type"] == "motor"
        assert d["allow_with_driver"] is False, "motor must force allow_with_driver=False"
        assert d["price_with_driver_day"] == 0
        assert d["price_with_driver_week"] == 0
        assert d["price_with_driver_month"] == 0
        # lepas-kunci prices preserved
        assert d["price_day"] == 80000
        assert d["price_week"] == 480000
        assert d["price_month"] == 1600000
    finally:
        requests.delete(f"{API}/admin/rent/{rid}", headers=auth_headers, timeout=15)


# ---------- Orders ----------
def test_order_cakkost_weekly_qty3():
    items = requests.get(f"{API}/kost", timeout=15).json()
    kost = items[0]
    unit = kost["price_week"]
    qty = 3
    payload = {
        "service": "cakkost",
        "customer_name": "TEST_KostUser",
        "customer_phone": "08120000001",
        "details": {
            "kost_id": kost["id"], "kost_name": kost["name"],
            "duration": "week", "qty": qty, "unit_price": unit,
            "move_in": "2026-02-01",
        },
        "total": unit * qty,
        "message": "Booking kost TEST",
    }
    r = requests.post(f"{API}/orders", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["order"]["total"] == unit * qty
    assert d["whatsapp_url"].startswith("https://wa.me/")


def test_order_cakrent_with_driver_monthly_qty2(auth_headers):
    items = requests.get(f"{API}/rent?type=mobil", timeout=15).json()
    veh = next((v for v in items if v.get("allow_with_driver")), None)
    assert veh, "need at least one mobil with driver"
    unit = veh["price_with_driver_month"]
    qty = 2
    payload = {
        "service": "cakrent",
        "customer_name": "TEST_RentUser",
        "customer_phone": "08120000002",
        "details": {
            "rent_id": veh["id"], "vehicle": veh["name"], "type": veh["type"],
            "with_driver": True, "duration": "month", "qty": qty, "unit_price": unit,
            "start_date": "2026-02-05",
        },
        "total": unit * qty,
        "message": "Booking rent TEST",
    }
    r = requests.post(f"{API}/orders", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["order"]["total"] == unit * qty

    # Persists in admin
    orders = requests.get(f"{API}/admin/orders", headers=auth_headers, timeout=15).json()
    assert any(o["id"] == d["order"]["id"] for o in orders)


# ---------- Migration sanity ----------
def test_no_legacy_price_with_driver_field():
    """Old field should be migrated to price_with_driver_day at startup."""
    items = requests.get(f"{API}/rent", timeout=15).json()
    for v in items:
        assert "price_with_driver" not in v, f"legacy field still present in {v['name']}"
