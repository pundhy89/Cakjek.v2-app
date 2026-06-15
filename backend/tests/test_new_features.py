"""Backend tests for CakJek new features: service toggles, banners (desc/link),
admin credentials change, kost/rent endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

DEFAULT_SERVICES = ["cakride", "cakcar", "cakfood", "cakmart", "caksend", "cakpay", "cakkost", "cakrent"]


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=10)
    assert r.status_code == 200, f"admin/admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ------- Service toggles -------
class TestServiceToggles:
    def test_get_services_default(self):
        r = requests.get(f"{API}/services", timeout=10)
        assert r.status_code == 200
        data = r.json()
        for k in DEFAULT_SERVICES:
            assert k in data, f"missing service {k}"
            assert isinstance(data[k], bool)

    def test_put_requires_auth(self):
        r = requests.put(f"{API}/admin/services", json={"services": {"cakpay": False}}, timeout=10)
        assert r.status_code == 401

    def test_toggle_off_then_on(self, auth_headers):
        # turn cakpay off
        r = requests.put(f"{API}/admin/services", json={"services": {"cakpay": False}}, headers=auth_headers, timeout=10)
        assert r.status_code == 200
        upd = r.json()
        assert upd["cakpay"] is False
        # confirm GET reflects
        g = requests.get(f"{API}/services", timeout=10).json()
        assert g["cakpay"] is False
        # turn back on
        r2 = requests.put(f"{API}/admin/services", json={"services": {"cakpay": True}}, headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["cakpay"] is True

    def test_unknown_keys_ignored(self, auth_headers):
        r = requests.put(
            f"{API}/admin/services",
            json={"services": {"bogus_service": True, "another": False}},
            headers=auth_headers, timeout=10
        )
        assert r.status_code == 200
        data = r.json()
        assert "bogus_service" not in data
        assert "another" not in data
        # ensure all real keys still present
        for k in DEFAULT_SERVICES:
            assert k in data

    def test_restore_all_true(self, auth_headers):
        all_on = {k: True for k in DEFAULT_SERVICES}
        r = requests.put(f"{API}/admin/services", json={"services": all_on}, headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        for k in DEFAULT_SERVICES:
            assert data[k] is True


# ------- Banners with description + link -------
class TestBanners:
    def test_create_banner_with_desc_link(self, auth_headers):
        payload = {
            "title": "TEST_PROMO_BANNER",
            "subtitle": "Subtitle test",
            "description": "Multi line\ndescription content",
            "link": "https://example.com/promo",
            "code": "TESTCODE",
            "color_from": "#fb923c",
            "color_to": "#ec4899",
            "order_idx": 99,
            "active": True,
        }
        r = requests.post(f"{API}/admin/banners", json=payload, headers=auth_headers, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == "TEST_PROMO_BANNER"
        assert data["description"] == "Multi line\ndescription content"
        assert data["link"] == "https://example.com/promo"
        bid = data["id"]

        # public GET /banners returns it
        g = requests.get(f"{API}/banners", timeout=10)
        assert g.status_code == 200
        found = [b for b in g.json() if b["id"] == bid]
        assert len(found) == 1
        assert found[0]["description"] == "Multi line\ndescription content"
        assert found[0]["link"] == "https://example.com/promo"

        # cleanup
        d = requests.delete(f"{API}/admin/banners/{bid}", headers=auth_headers, timeout=10)
        assert d.status_code == 200


# ------- Admin credentials change -------
class TestAdminCreds:
    def test_change_then_revert(self):
        # login as admin/admin
        r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=10)
        assert r.status_code == 200
        tok = r.json()["token"]
        h = {"Authorization": f"Bearer {tok}"}

        # change to admin2/admin2
        r2 = requests.put(
            f"{API}/admin/credentials",
            json={"current_password": "admin", "new_username": "admin2", "new_password": "admin2"},
            headers=h, timeout=10,
        )
        assert r2.status_code == 200, r2.text

        # old login fails
        old = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=10)
        assert old.status_code == 401

        # new login works
        new = requests.post(f"{API}/admin/login", json={"username": "admin2", "password": "admin2"}, timeout=10)
        assert new.status_code == 200
        new_tok = new.json()["token"]

        # revert to admin/admin
        rev = requests.put(
            f"{API}/admin/credentials",
            json={"current_password": "admin2", "new_username": "admin", "new_password": "admin"},
            headers={"Authorization": f"Bearer {new_tok}"}, timeout=10,
        )
        assert rev.status_code == 200, rev.text

        # confirm reverted
        final = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "admin"}, timeout=10)
        assert final.status_code == 200


# ------- Kost endpoints -------
class TestKost:
    def test_list_kost_public(self):
        r = requests.get(f"{API}/kost", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        if items:
            k = items[0]
            for f in ["price_day", "price_week", "price_month"]:
                assert f in k

    def test_crud_kost(self, auth_headers):
        payload = {
            "name": "TEST_Kost",
            "address": "Jl. Test 1",
            "description": "Test desc",
            "facilities": "AC, WiFi",
            "price_day": 50000,
            "price_week": 280000,
            "price_month": 800000,
            "active": True,
            "available": True,
        }
        c = requests.post(f"{API}/admin/kost", json=payload, headers=auth_headers, timeout=10)
        assert c.status_code == 200, c.text
        kid = c.json()["id"]
        assert c.json()["price_day"] == 50000

        # update
        u = requests.put(f"{API}/admin/kost/{kid}", json={**payload, "price_day": 60000}, headers=auth_headers, timeout=10)
        assert u.status_code == 200
        assert u.json()["price_day"] == 60000

        # delete
        d = requests.delete(f"{API}/admin/kost/{kid}", headers=auth_headers, timeout=10)
        assert d.status_code == 200


# ------- Rent endpoints -------
class TestRent:
    def test_list_rent_public(self):
        r = requests.get(f"{API}/rent", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        if items:
            it = items[0]
            for f in ["price_day", "price_week", "price_month", "allow_with_driver"]:
                assert f in it

    def test_crud_rent_with_driver(self, auth_headers):
        payload = {
            "name": "TEST_Rent_Avanza",
            "type": "mobil",
            "description": "Test rent",
            "price_day": 300000,
            "price_week": 1800000,
            "price_month": 6500000,
            "allow_with_driver": True,
            "price_with_driver_day": 500000,
            "price_with_driver_week": 3000000,
            "price_with_driver_month": 11000000,
            "available": True,
            "active": True,
        }
        c = requests.post(f"{API}/admin/rent", json=payload, headers=auth_headers, timeout=10)
        assert c.status_code == 200, c.text
        rid = c.json()["id"]
        assert c.json()["price_with_driver_day"] == 500000
        assert c.json()["allow_with_driver"] is True

        # delete
        d = requests.delete(f"{API}/admin/rent/{rid}", headers=auth_headers, timeout=10)
        assert d.status_code == 200
