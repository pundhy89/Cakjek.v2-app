"""Backend API tests for CakApp NEW features: kost, rent, admin credentials, cakkost/cakrent orders."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://bug-repair-15.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Public Kost ----------
def test_list_kost_seeded():
    r = requests.get(f"{API}/kost", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 3, f"expected >=3 seed kost, got {len(items)}"
    sample = items[0]
    for key in ["id", "name", "address", "facilities", "price_month", "image", "available", "active"]:
        assert key in sample, f"missing key {key} in kost: {sample}"


# ---------- Public Rent ----------
def test_list_rent_seeded():
    r = requests.get(f"{API}/rent", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 4, f"expected >=4 seed rent, got {len(items)}"


def test_list_rent_filter_mobil():
    r = requests.get(f"{API}/rent?type=mobil", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert all(i["type"] == "mobil" for i in items), f"non-mobil leaked: {items}"
    assert len(items) >= 1


def test_list_rent_filter_motor():
    r = requests.get(f"{API}/rent?type=motor", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert all(i["type"] == "motor" for i in items)
    assert len(items) >= 1


# ---------- Admin Kost CRUD ----------
def test_admin_kost_unauthorized():
    r = requests.get(f"{API}/admin/kost", timeout=15)
    assert r.status_code == 401
    r = requests.post(f"{API}/admin/kost", json={"name": "x"}, timeout=15)
    assert r.status_code == 401


def test_admin_kost_crud(auth_headers):
    payload = {
        "name": "TEST_Kost_Mawar",
        "address": "Jl Test 1",
        "description": "Kost uji",
        "facilities": "AC, WiFi",
        "price_month": 850000,
        "image": "",
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/kost", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["name"] == "TEST_Kost_Mawar"
    assert created["price_month"] == 850000
    kid = created["id"]

    # appears in public list
    items = requests.get(f"{API}/kost", timeout=15).json()
    assert any(i["id"] == kid for i in items)

    # admin list
    items_admin = requests.get(f"{API}/admin/kost", headers=auth_headers, timeout=15).json()
    assert any(i["id"] == kid for i in items_admin)

    # update
    upd = {**payload, "name": "TEST_Kost_Melati", "price_month": 999000}
    r = requests.put(f"{API}/admin/kost/{kid}", json=upd, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Kost_Melati"
    assert r.json()["price_month"] == 999000

    # delete
    r = requests.delete(f"{API}/admin/kost/{kid}", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    items = requests.get(f"{API}/kost", timeout=15).json()
    assert not any(i["id"] == kid for i in items)


# ---------- Admin Rent CRUD ----------
def test_admin_rent_unauthorized():
    r = requests.post(f"{API}/admin/rent", json={"name": "x"}, timeout=15)
    assert r.status_code == 401


def test_admin_rent_mobil_with_driver(auth_headers):
    payload = {
        "name": "TEST_Avanza",
        "type": "mobil",
        "description": "Mobil keluarga",
        "image": "",
        "price_day": 300000,
        "price_with_driver": 450000,
        "allow_with_driver": True,
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/rent", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["type"] == "mobil"
    assert d["allow_with_driver"] is True
    assert d["price_with_driver"] == 450000
    rid = d["id"]

    # cleanup
    r = requests.delete(f"{API}/admin/rent/{rid}", headers=auth_headers, timeout=15)
    assert r.status_code == 200


def test_admin_rent_motor(auth_headers):
    payload = {
        "name": "TEST_Beat",
        "type": "motor",
        "description": "Motor matic",
        "image": "",
        "price_day": 75000,
        "price_with_driver": 0,
        "allow_with_driver": False,
        "available": True,
        "active": True,
    }
    r = requests.post(f"{API}/admin/rent", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["type"] == "motor"
    assert d["allow_with_driver"] is False
    rid = d["id"]
    requests.delete(f"{API}/admin/rent/{rid}", headers=auth_headers, timeout=15)


# ---------- Admin Credentials Change ----------
def test_admin_credentials_change_and_restore():
    # 1) login old
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
    assert r.status_code == 200
    token1 = r.json()["token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # 2) wrong current_password => 400
    r = requests.put(f"{API}/admin/credentials", json={
        "current_password": "wrong",
        "new_username": "admin2",
        "new_password": "admin2",
    }, headers=headers1, timeout=15)
    assert r.status_code == 400

    # 3) new password too short => 400
    r = requests.put(f"{API}/admin/credentials", json={
        "current_password": "admin",
        "new_username": "admin2",
        "new_password": "ad",
    }, headers=headers1, timeout=15)
    assert r.status_code == 400

    # 4) happy path -> admin2/admin2
    r = requests.put(f"{API}/admin/credentials", json={
        "current_password": "admin",
        "new_username": "admin2",
        "new_password": "admin2",
    }, headers=headers1, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json()["username"] == "admin2"

    try:
        # old creds should fail
        r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
        assert r.status_code == 401

        # new creds work
        r = requests.post(f"{API}/admin/login", json={"username": "admin2", "password": "admin2"}, timeout=15)
        assert r.status_code == 200
        token2 = r.json()["token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # 5) restore back to admin/admin (CRITICAL)
        r = requests.put(f"{API}/admin/credentials", json={
            "current_password": "admin2",
            "new_username": "admin",
            "new_password": "admin",
        }, headers=headers2, timeout=15)
        assert r.status_code == 200, r.text
    finally:
        # Safety net: try restoring with both possible passwords
        for pwd in ("admin2", "admin"):
            lr = requests.post(f"{API}/admin/login", json={"username": "admin2", "password": pwd}, timeout=15)
            if lr.status_code == 200:
                tk = lr.json()["token"]
                requests.put(f"{API}/admin/credentials", json={
                    "current_password": pwd,
                    "new_username": "admin",
                    "new_password": "admin",
                }, headers={"Authorization": f"Bearer {tk}"}, timeout=15)
                break

    # final verify
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
    assert r.status_code == 200, "FAILED to restore admin/admin - subsequent tests will break"


# ---------- Orders for cakkost / cakrent ----------
def test_order_cakkost():
    # pick a real kost
    items = requests.get(f"{API}/kost", timeout=15).json()
    assert items, "need at least one kost"
    kost = items[0]
    payload = {
        "service": "cakkost",
        "customer_name": "TEST_KostUser",
        "customer_phone": "08120000001",
        "details": {
            "kost_id": kost["id"],
            "kost_name": kost["name"],
            "move_in": "2026-02-01",
            "months": 2,
        },
        "total": kost["price_month"] * 2,
        "message": "Booking kost TEST",
    }
    r = requests.post(f"{API}/orders", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["whatsapp_url"].startswith("https://wa.me/")
    assert d["order"]["service"] == "cakkost"


def test_order_cakrent():
    items = requests.get(f"{API}/rent?type=mobil", timeout=15).json()
    assert items
    veh = items[0]
    days = 3
    unit_price = veh.get("price_with_driver") if veh.get("allow_with_driver") else veh["price_day"]
    payload = {
        "service": "cakrent",
        "customer_name": "TEST_RentUser",
        "customer_phone": "08120000002",
        "details": {
            "rent_id": veh["id"],
            "vehicle": veh["name"],
            "type": veh["type"],
            "with_driver": bool(veh.get("allow_with_driver")),
            "start_date": "2026-02-05",
            "days": days,
            "unit_price": unit_price,
        },
        "total": unit_price * days,
        "message": "Booking rent TEST",
    }
    r = requests.post(f"{API}/orders", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["whatsapp_url"].startswith("https://wa.me/")
    assert d["order"]["service"] == "cakrent"
