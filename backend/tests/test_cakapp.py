"""Backend API tests for CakApp - covers auth, menu, tariff, settings, orders, reports."""
import os
import pytest
import requests
from urllib.parse import quote

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://cak-services.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Public endpoints ----------
def test_settings_default():
    r = requests.get(f"{API}/settings", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["whatsapp_number"] == "6285233962821"


@pytest.mark.parametrize("cat", ["food", "mart", "cakpay"])
def test_menu_categories(cat):
    r = requests.get(f"{API}/menu/{cat}", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert items[0]["category"] == cat
    assert "name" in items[0] and "price" in items[0]


def test_tariff_all():
    r = requests.get(f"{API}/tariff", timeout=15)
    assert r.status_code == 200
    items = r.json()
    services = {i["service"] for i in items}
    assert {"cakride", "cakcar", "caksend"}.issubset(services)


def test_tariff_single():
    r = requests.get(f"{API}/tariff/cakride", timeout=15)
    assert r.status_code == 200
    assert r.json()["service"] == "cakride"


# ---------- Auth ----------
def test_login_wrong_creds():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "bad"}, timeout=15)
    assert r.status_code == 401


def test_admin_me_requires_token():
    r = requests.get(f"{API}/admin/me", timeout=15)
    assert r.status_code == 401


def test_admin_me_with_token(auth_headers):
    r = requests.get(f"{API}/admin/me", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["ok"] is True


# ---------- Orders ----------
def test_create_order_returns_wa_url():
    msg = "Test order #TEST_ABC"
    payload = {
        "service": "cakride",
        "customer_name": "TEST_User",
        "customer_phone": "08123",
        "details": {"from": "A", "to": "B", "distance_km": 3},
        "total": 12500,
        "message": msg,
    }
    r = requests.post(f"{API}/orders", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "order" in d and "whatsapp_url" in d
    assert d["whatsapp_url"].startswith("https://wa.me/")
    assert quote(msg) in d["whatsapp_url"]
    assert d["order"]["total"] == 12500


# ---------- Admin Menu CRUD ----------
def test_menu_crud(auth_headers):
    create = {"name": "TEST_Item", "price": 9999, "category": "food", "description": "tmp", "image": "", "active": True}
    r = requests.post(f"{API}/admin/menu", json=create, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    iid = r.json()["id"]

    # Update
    upd = {**create, "name": "TEST_Item_2", "price": 11111}
    r = requests.put(f"{API}/admin/menu/{iid}", json=upd, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Item_2"

    # Verify visible in public menu (active)
    r = requests.get(f"{API}/menu/food", timeout=15)
    names = [i["name"] for i in r.json()]
    assert "TEST_Item_2" in names

    # Delete
    r = requests.delete(f"{API}/admin/menu/{iid}", headers=auth_headers, timeout=15)
    assert r.status_code == 200

    r = requests.get(f"{API}/menu/food", timeout=15)
    names = [i["name"] for i in r.json()]
    assert "TEST_Item_2" not in names


# ---------- Tariff Update ----------
def test_tariff_update(auth_headers):
    # Save originals
    orig = requests.get(f"{API}/tariff/cakride", timeout=15).json()
    payload = {"base_fare": 7777, "per_km": 3333, "label": "TEST"}
    r = requests.put(f"{API}/admin/tariff/cakride", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["base_fare"] == 7777
    # Restore
    requests.put(f"{API}/admin/tariff/cakride",
                 json={"base_fare": orig["base_fare"], "per_km": orig["per_km"], "label": orig.get("label", "")},
                 headers=auth_headers, timeout=15)


# ---------- Settings Update ----------
def test_settings_update(auth_headers):
    orig = requests.get(f"{API}/settings", timeout=15).json()
    new_num = "6285233962821"  # keep same to avoid breaking other tests
    payload = {"whatsapp_number": new_num, "app_name": orig.get("app_name", "CakApp")}
    r = requests.put(f"{API}/admin/settings", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["whatsapp_number"] == new_num


# ---------- Reports ----------
def test_reports_daily(auth_headers):
    r = requests.get(f"{API}/admin/reports/daily", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "count" in d and "total" in d and "by_service" in d


def test_reports_monthly(auth_headers):
    from datetime import datetime
    now = datetime.utcnow()
    r = requests.get(f"{API}/admin/reports/monthly?year={now.year}&month={now.month}",
                     headers=auth_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "count" in d and "by_day" in d and "by_service" in d
