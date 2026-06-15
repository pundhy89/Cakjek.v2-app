from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------- Models ----------
class LoginReq(BaseModel):
    username: str
    password: str

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    category: str  # food | mart | cakpay
    description: Optional[str] = ""
    image: Optional[str] = ""
    active: bool = True
    merchant_id: Optional[str] = None  # for food items

class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str
    description: Optional[str] = ""
    image: Optional[str] = ""
    active: bool = True
    merchant_id: Optional[str] = None

class Merchant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: str = ""
    address: str = ""
    description: str = ""
    delivery_fee: float = 5000
    rating: float = 4.5
    active: bool = True

class MerchantCreate(BaseModel):
    name: str
    image: Optional[str] = ""
    address: Optional[str] = ""
    description: Optional[str] = ""
    delivery_fee: Optional[float] = 5000
    rating: Optional[float] = 4.5
    active: Optional[bool] = True

class Tariff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: str  # cakride | cakcar | caksend
    base_fare: float
    per_km: float
    label: str = ""

class TariffUpdate(BaseModel):
    base_fare: float
    per_km: float
    label: Optional[str] = ""

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    whatsapp_number: str = "6285233962821"
    app_name: str = "CakJek"
    service_center_lat: float = -7.2575
    service_center_lng: float = 112.7521
    service_radius_km: float = 20.0
    mart_delivery_fee: float = 7000.0

class SettingsUpdate(BaseModel):
    whatsapp_number: str
    app_name: Optional[str] = "CakJek"
    service_center_lat: Optional[float] = -7.2575
    service_center_lng: Optional[float] = 112.7521
    service_radius_km: Optional[float] = 20.0
    mart_delivery_fee: Optional[float] = 7000.0

class Banner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: str = ""
    code: str = ""
    color_from: str = "#fb923c"
    color_to: str = "#ec4899"
    image: str = ""
    order_idx: int = 0
    active: bool = True
    start_date: Optional[str] = None  # YYYY-MM-DD
    end_date: Optional[str] = None    # YYYY-MM-DD

class BannerCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    code: Optional[str] = ""
    color_from: Optional[str] = "#fb923c"
    color_to: Optional[str] = "#ec4899"
    image: Optional[str] = ""
    order_idx: Optional[int] = 0
    active: Optional[bool] = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class OrderCreate(BaseModel):
    service: str  # cakride|cakcar|cakfood|caksend|cakmart|cakpay|cakkost|cakrent
    customer_name: str
    customer_phone: str
    details: dict  # service-specific
    total: float
    message: str  # whatsapp text

class Kost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str = ""
    description: str = ""
    facilities: str = ""  # comma-separated, e.g., "AC, WiFi, Kamar mandi dalam"
    price_day: float = 0
    price_week: float = 0
    price_month: float = 0
    image: str = ""
    available: bool = True
    active: bool = True

class KostCreate(BaseModel):
    name: str
    address: Optional[str] = ""
    description: Optional[str] = ""
    facilities: Optional[str] = ""
    price_day: Optional[float] = 0
    price_week: Optional[float] = 0
    price_month: Optional[float] = 0
    image: Optional[str] = ""
    available: Optional[bool] = True
    active: Optional[bool] = True

class Rent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str = "mobil"  # mobil | motor
    description: str = ""
    image: str = ""
    # Lepas kunci / tanpa sopir
    price_day: float = 0
    price_week: float = 0
    price_month: float = 0
    # Plus sopir (khusus mobil)
    allow_with_driver: bool = False
    price_with_driver_day: float = 0
    price_with_driver_week: float = 0
    price_with_driver_month: float = 0
    available: bool = True
    active: bool = True

class RentCreate(BaseModel):
    name: str
    type: Optional[str] = "mobil"
    description: Optional[str] = ""
    image: Optional[str] = ""
    price_day: Optional[float] = 0
    price_week: Optional[float] = 0
    price_month: Optional[float] = 0
    allow_with_driver: Optional[bool] = False
    price_with_driver_day: Optional[float] = 0
    price_with_driver_week: Optional[float] = 0
    price_with_driver_month: Optional[float] = 0
    available: Optional[bool] = True
    active: Optional[bool] = True

class AdminCredsUpdate(BaseModel):
    current_password: str
    new_username: str
    new_password: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: str
    customer_name: str
    customer_phone: str
    details: dict
    total: float
    message: str
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ---------- Auth ----------
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin"
_active_tokens: set = set()

async def _get_admin_creds():
    doc = await db.admin_creds.find_one({"id": "admin"}, {"_id": 0})
    if not doc:
        doc = {"id": "admin", "username": DEFAULT_ADMIN_USERNAME, "password": DEFAULT_ADMIN_PASSWORD}
        await db.admin_creds.insert_one(doc)
    return doc

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

def _extract_coords(details: dict):
    """Yield (label, lat, lng) for any coords-like dict found in details."""
    if not isinstance(details, dict):
        return
    keys = ["pickup_coords", "destination_coords", "address_coords", "pickupCoords", "destinationCoords", "addressCoords"]
    for k in keys:
        v = details.get(k)
        if isinstance(v, dict) and "lat" in v and "lng" in v:
            try:
                yield k, float(v["lat"]), float(v["lng"])
            except (TypeError, ValueError):
                continue

def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    token = authorization.split(" ", 1)[1]
    if token not in _active_tokens:
        raise HTTPException(401, "Invalid token")
    return token

@api_router.post("/admin/login")
async def admin_login(req: LoginReq):
    creds = await _get_admin_creds()
    if req.username == creds["username"] and req.password == creds["password"]:
        token = secrets.token_urlsafe(24)
        _active_tokens.add(token)
        return {"token": token, "username": req.username}
    raise HTTPException(401, "Invalid credentials")

@api_router.get("/admin/me")
async def admin_me(_: str = Depends(require_admin)):
    creds = await _get_admin_creds()
    return {"ok": True, "username": creds["username"]}

@api_router.put("/admin/credentials")
async def admin_update_creds(payload: AdminCredsUpdate, _: str = Depends(require_admin)):
    creds = await _get_admin_creds()
    if payload.current_password != creds["password"]:
        raise HTTPException(400, "Password lama salah")
    new_username = (payload.new_username or "").strip()
    new_password = (payload.new_password or "").strip()
    if not new_username or not new_password:
        raise HTTPException(400, "Username dan password baru wajib diisi")
    if len(new_password) < 4:
        raise HTTPException(400, "Password minimal 4 karakter")
    await db.admin_creds.update_one(
        {"id": "admin"},
        {"$set": {"username": new_username, "password": new_password}},
        upsert=True,
    )
    return {"ok": True, "username": new_username}

# ---------- Settings ----------
@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one(s.model_dump())
        return s.model_dump()
    return doc

@api_router.put("/admin/settings")
async def update_settings(payload: SettingsUpdate, _: str = Depends(require_admin)):
    upd = payload.model_dump()
    await db.settings.update_one({"id": "settings"}, {"$set": upd}, upsert=True)
    doc = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return doc

# ---------- Menu ----------
@api_router.get("/menu/{category}")
async def get_menu(category: str, merchant_id: Optional[str] = None):
    q = {"category": category, "active": True}
    if merchant_id:
        q["merchant_id"] = merchant_id
    items = await db.menu.find(q, {"_id": 0}).to_list(500)
    return items

@api_router.get("/merchants")
async def get_merchants():
    items = await db.merchants.find({"active": True}, {"_id": 0}).to_list(200)
    return items

@api_router.get("/merchants/{merchant_id}")
async def get_merchant(merchant_id: str):
    doc = await db.merchants.find_one({"id": merchant_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@api_router.get("/admin/merchants")
async def admin_list_merchants(_: str = Depends(require_admin)):
    return await db.merchants.find({}, {"_id": 0}).to_list(200)

@api_router.post("/admin/merchants")
async def admin_create_merchant(payload: MerchantCreate, _: str = Depends(require_admin)):
    m = Merchant(**payload.model_dump())
    await db.merchants.insert_one(m.model_dump())
    return m.model_dump()

@api_router.put("/admin/merchants/{mid}")
async def admin_update_merchant(mid: str, payload: MerchantCreate, _: str = Depends(require_admin)):
    await db.merchants.update_one({"id": mid}, {"$set": payload.model_dump()})
    return await db.merchants.find_one({"id": mid}, {"_id": 0})

@api_router.delete("/admin/merchants/{mid}")
async def admin_delete_merchant(mid: str, _: str = Depends(require_admin)):
    await db.merchants.delete_one({"id": mid})
    return {"ok": True}

@api_router.get("/admin/menu/{category}")
async def admin_get_menu(category: str, _: str = Depends(require_admin)):
    items = await db.menu.find({"category": category}, {"_id": 0}).to_list(500)
    return items

@api_router.post("/admin/menu")
async def admin_create_menu(payload: MenuItemCreate, _: str = Depends(require_admin)):
    item = MenuItem(**payload.model_dump())
    await db.menu.insert_one(item.model_dump())
    return item.model_dump()

@api_router.put("/admin/menu/{item_id}")
async def admin_update_menu(item_id: str, payload: MenuItemCreate, _: str = Depends(require_admin)):
    await db.menu.update_one({"id": item_id}, {"$set": payload.model_dump()})
    doc = await db.menu.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@api_router.delete("/admin/menu/{item_id}")
async def admin_delete_menu(item_id: str, _: str = Depends(require_admin)):
    await db.menu.delete_one({"id": item_id})
    return {"ok": True}

# ---------- Tariff ----------
@api_router.get("/tariff")
async def get_tariffs():
    items = await db.tariff.find({}, {"_id": 0}).to_list(50)
    return items

@api_router.get("/tariff/{service}")
async def get_tariff(service: str):
    doc = await db.tariff.find_one({"service": service}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Tariff not found")
    return doc

@api_router.put("/admin/tariff/{service}")
async def admin_update_tariff(service: str, payload: TariffUpdate, _: str = Depends(require_admin)):
    upd = payload.model_dump()
    upd["service"] = service
    await db.tariff.update_one({"service": service}, {"$set": upd}, upsert=True)
    doc = await db.tariff.find_one({"service": service}, {"_id": 0})
    return doc

# ---------- Orders ----------
@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    s = await db.settings.find_one({"id": "settings"}, {"_id": 0}) or {}
    radius = float(s.get("service_radius_km", 20))
    c_lat = float(s.get("service_center_lat", -7.2575))
    c_lng = float(s.get("service_center_lng", 112.7521))
    if radius > 0:
        for label, lat, lng in _extract_coords(payload.details):
            d = haversine_km(c_lat, c_lng, lat, lng)
            if d > radius:
                raise HTTPException(
                    status_code=400,
                    detail=f"Lokasi '{label}' di luar area servis ({d:.1f} km dari pusat, batas {radius:.0f} km).",
                )
    order = Order(**payload.model_dump())
    await db.orders.insert_one(order.model_dump())
    wa = s.get("whatsapp_number", "6285233962821")
    wa_url = f"https://wa.me/{wa}?text={quote(order.message)}"
    return {"order": order.model_dump(), "whatsapp_url": wa_url}

@api_router.get("/admin/orders")
async def admin_list_orders(_: str = Depends(require_admin)):
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, status: str, _: str = Depends(require_admin)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"ok": True}

# ---------- CakKost ----------
@api_router.get("/kost")
async def list_kost():
    items = await db.kost.find({"active": True}, {"_id": 0}).to_list(500)
    return items

@api_router.get("/admin/kost")
async def admin_list_kost(_: str = Depends(require_admin)):
    return await db.kost.find({}, {"_id": 0}).to_list(500)

@api_router.post("/admin/kost")
async def admin_create_kost(payload: KostCreate, _: str = Depends(require_admin)):
    k = Kost(**payload.model_dump())
    await db.kost.insert_one(k.model_dump())
    return k.model_dump()

@api_router.put("/admin/kost/{kid}")
async def admin_update_kost(kid: str, payload: KostCreate, _: str = Depends(require_admin)):
    await db.kost.update_one({"id": kid}, {"$set": payload.model_dump()})
    return await db.kost.find_one({"id": kid}, {"_id": 0})

@api_router.delete("/admin/kost/{kid}")
async def admin_delete_kost(kid: str, _: str = Depends(require_admin)):
    await db.kost.delete_one({"id": kid})
    return {"ok": True}

# ---------- CakRent ----------
@api_router.get("/rent")
async def list_rent(type: Optional[str] = None):
    q = {"active": True}
    if type:
        q["type"] = type
    items = await db.rent.find(q, {"_id": 0}).to_list(500)
    return items

@api_router.get("/admin/rent")
async def admin_list_rent(_: str = Depends(require_admin)):
    return await db.rent.find({}, {"_id": 0}).to_list(500)

@api_router.post("/admin/rent")
async def admin_create_rent(payload: RentCreate, _: str = Depends(require_admin)):
    r = Rent(**payload.model_dump())
    await db.rent.insert_one(r.model_dump())
    return r.model_dump()

@api_router.put("/admin/rent/{rid}")
async def admin_update_rent(rid: str, payload: RentCreate, _: str = Depends(require_admin)):
    await db.rent.update_one({"id": rid}, {"$set": payload.model_dump()})
    return await db.rent.find_one({"id": rid}, {"_id": 0})

@api_router.delete("/admin/rent/{rid}")
async def admin_delete_rent(rid: str, _: str = Depends(require_admin)):
    await db.rent.delete_one({"id": rid})
    return {"ok": True}

# ---------- Reports ----------
@api_router.get("/admin/reports/daily")
async def reports_daily(date: Optional[str] = None, _: str = Depends(require_admin)):
    # date format YYYY-MM-DD; if None, today
    if not date:
        date = datetime.now(timezone.utc).date().isoformat()
    start = date + "T00:00:00"
    end = date + "T23:59:59"
    docs = await db.orders.find({"created_at": {"$gte": start, "$lte": end}}, {"_id": 0}).to_list(2000)
    by_service: dict = {}
    total = 0.0
    for d in docs:
        by_service[d["service"]] = by_service.get(d["service"], {"count": 0, "total": 0.0})
        by_service[d["service"]]["count"] += 1
        by_service[d["service"]]["total"] += d.get("total", 0)
        total += d.get("total", 0)
    return {
        "date": date,
        "count": len(docs),
        "total": total,
        "by_service": by_service,
        "orders": docs,
    }

@api_router.get("/admin/reports/monthly")
async def reports_monthly(year: int, month: int, _: str = Depends(require_admin)):
    start = f"{year:04d}-{month:02d}-01T00:00:00"
    # compute next month
    if month == 12:
        ny, nm = year + 1, 1
    else:
        ny, nm = year, month + 1
    end = f"{ny:04d}-{nm:02d}-01T00:00:00"
    docs = await db.orders.find({"created_at": {"$gte": start, "$lt": end}}, {"_id": 0}).to_list(5000)
    by_day: dict = {}
    by_service: dict = {}
    total = 0.0
    for d in docs:
        day = d["created_at"][:10]
        by_day[day] = by_day.get(day, {"count": 0, "total": 0.0})
        by_day[day]["count"] += 1
        by_day[day]["total"] += d.get("total", 0)
        by_service[d["service"]] = by_service.get(d["service"], {"count": 0, "total": 0.0})
        by_service[d["service"]]["count"] += 1
        by_service[d["service"]]["total"] += d.get("total", 0)
        total += d.get("total", 0)
    return {
        "year": year,
        "month": month,
        "count": len(docs),
        "total": total,
        "by_day": by_day,
        "by_service": by_service,
    }

@api_router.get("/")
async def root():
    return {"message": "CakJek API"}

# ---------- Banners ----------
@api_router.get("/banners")
async def get_banners():
    today = datetime.now(timezone.utc).date().isoformat()
    items = await db.banners.find({"active": True}, {"_id": 0}).sort("order_idx", 1).to_list(50)
    visible = []
    for b in items:
        s = b.get("start_date")
        e = b.get("end_date")
        if s and today < s:
            continue
        if e and today > e:
            continue
        visible.append(b)
    return visible

@api_router.get("/admin/banners")
async def admin_list_banners(_: str = Depends(require_admin)):
    items = await db.banners.find({}, {"_id": 0}).sort("order_idx", 1).to_list(50)
    return items

@api_router.post("/admin/banners")
async def admin_create_banner(payload: BannerCreate, _: str = Depends(require_admin)):
    b = Banner(**payload.model_dump())
    await db.banners.insert_one(b.model_dump())
    return b.model_dump()

@api_router.put("/admin/banners/{banner_id}")
async def admin_update_banner(banner_id: str, payload: BannerCreate, _: str = Depends(require_admin)):
    await db.banners.update_one({"id": banner_id}, {"$set": payload.model_dump()})
    doc = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@api_router.delete("/admin/banners/{banner_id}")
async def admin_delete_banner(banner_id: str, _: str = Depends(require_admin)):
    await db.banners.delete_one({"id": banner_id})
    return {"ok": True}

# ---------- Seed ----------
async def seed():
    # settings
    if not await db.settings.find_one({"id": "settings"}):
        await db.settings.insert_one(Settings().model_dump())
    # tariffs
    defaults = [
        {"service": "cakride", "base_fare": 5000, "per_km": 2500, "label": "Ojek Motor"},
        {"service": "cakcar", "base_fare": 10000, "per_km": 4500, "label": "Mobil"},
        {"service": "caksend", "base_fare": 8000, "per_km": 3000, "label": "Kurir"},
    ]
    for t in defaults:
        existing = await db.tariff.find_one({"service": t["service"]})
        if not existing:
            await db.tariff.insert_one(Tariff(**t).model_dump())
    # menu food
    if await db.menu.count_documents({"category": "food"}) == 0:
        food = [
            ("Nasi Goreng Spesial", 18000, "Nasi goreng dengan telur dan ayam suwir", "https://images.unsplash.com/photo-1611506168759-1e69a83b5a53?w=400"),
            ("Mie Ayam Bakso", 15000, "Mie ayam plus 3 bakso sapi", "https://images.unsplash.com/photo-1680674774705-90b4904b3a7f?w=400"),
            ("Ayam Geprek", 17000, "Ayam crispy sambal bawang", "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400"),
            ("Soto Ayam", 14000, "Soto ayam kuah bening", "https://images.unsplash.com/photo-1604908554049-01361e7b8a3a?w=400"),
            ("Es Teh Manis", 5000, "Teh manis dingin segar", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"),
            ("Es Jeruk", 7000, "Jeruk peras segar", "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400"),
        ]
        for n, p, d, img in food:
            await db.menu.insert_one(MenuItem(name=n, price=p, description=d, image=img, category="food").model_dump())
    # menu mart
    if await db.menu.count_documents({"category": "mart"}) == 0:
        mart = [
            ("Beras Premium 5kg", 65000, "Beras putih premium", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"),
            ("Minyak Goreng 2L", 32000, "Minyak goreng kemasan", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400"),
            ("Gula Pasir 1kg", 14000, "Gula pasir putih", "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400"),
            ("Telur 1kg", 28000, "Telur ayam segar", "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400"),
            ("Susu UHT 1L", 18000, "Susu segar UHT", "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400"),
            ("Indomie Goreng x5", 15000, "Mie instan 5 bungkus", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400"),
        ]
        for n, p, d, img in mart:
            await db.menu.insert_one(MenuItem(name=n, price=p, description=d, image=img, category="mart").model_dump())
    # cakpay packages
    if await db.menu.count_documents({"category": "cakpay"}) == 0:
        packages = [
            ("Top Up 20.000", 20000, "Saldo dompet Rp 20.000", ""),
            ("Top Up 50.000", 50000, "Saldo dompet Rp 50.000", ""),
            ("Top Up 100.000", 100000, "Saldo dompet Rp 100.000", ""),
            ("Pulsa 10.000", 11000, "Pulsa semua operator", ""),
            ("Pulsa 25.000", 26000, "Pulsa semua operator", ""),
            ("Token Listrik 50.000", 51500, "PLN prabayar", ""),
        ]
        for n, p, d, img in packages:
            await db.menu.insert_one(MenuItem(name=n, price=p, description=d, image=img, category="cakpay").model_dump())
    # merchants for Cakfood
    if await db.merchants.count_documents({}) == 0:
        mlist = [
            {"name": "Warung Bu Endang", "address": "Jl. Pahlawan 12, Surabaya", "description": "Masakan rumahan khas Jawa Timur", "delivery_fee": 5000, "rating": 4.8, "image": "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400"},
            {"name": "Bakso Pak Slamet", "address": "Jl. Diponegoro 45", "description": "Bakso & mie ayam mantap", "delivery_fee": 6000, "rating": 4.7, "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"},
            {"name": "Ayam Geprek Mas Eko", "address": "Jl. Kertajaya 88", "description": "Geprek sambal level 1-10", "delivery_fee": 4500, "rating": 4.6, "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400"},
            {"name": "Es Segeerrr", "address": "Jl. Kayoon 5", "description": "Aneka minuman dingin", "delivery_fee": 4000, "rating": 4.5, "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"},
        ]
        ids = []
        for m in mlist:
            obj = Merchant(**m)
            await db.merchants.insert_one(obj.model_dump())
            ids.append(obj.id)
        # Re-tag existing food items round-robin across merchants if no merchant_id
        food_docs = await db.menu.find({"category": "food", "merchant_id": None}, {"_id": 0}).to_list(200)
        for i, f in enumerate(food_docs):
            await db.menu.update_one({"id": f["id"]}, {"$set": {"merchant_id": ids[i % len(ids)]}})
    # CakKost
    if await db.kost.count_documents({}) == 0:
        klist = [
            {"name": "Kost Melati No. 7", "address": "Jl. Melati 7, Surabaya", "description": "Dekat kampus, lingkungan tenang.", "facilities": "AC, WiFi, Kamar mandi dalam, Parkir motor", "price_day": 50000, "price_week": 280000, "price_month": 850000, "image": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600"},
            {"name": "Kost Putra Bahagia", "address": "Jl. Diponegoro 22", "description": "Khusus putra, dekat pasar.", "facilities": "Kipas angin, WiFi, Dapur bersama", "price_day": 40000, "price_week": 220000, "price_month": 650000, "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600"},
            {"name": "Kost Putri Anggrek", "address": "Jl. Anggrek 14", "description": "Khusus putri, ada CCTV.", "facilities": "AC, WiFi, KM dalam, Laundry", "price_day": 70000, "price_week": 400000, "price_month": 1200000, "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"},
        ]
        for k in klist:
            await db.kost.insert_one(Kost(**k).model_dump())
    # CakRent
    if await db.rent.count_documents({}) == 0:
        rlist = [
            {"name": "Honda Beat 2022", "type": "motor", "description": "Motor matic irit, helm 2 disediakan.", "price_day": 75000, "price_week": 450000, "price_month": 1500000, "allow_with_driver": False, "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600"},
            {"name": "Yamaha NMAX 2023", "type": "motor", "description": "Matic premium, nyaman jarak jauh.", "price_day": 150000, "price_week": 900000, "price_month": 3000000, "allow_with_driver": False, "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600"},
            {"name": "Toyota Avanza 2022", "type": "mobil", "description": "MPV 7 penumpang, bensin penuh.", "price_day": 350000, "price_week": 2100000, "price_month": 7500000, "price_with_driver_day": 550000, "price_with_driver_week": 3500000, "price_with_driver_month": 12000000, "allow_with_driver": True, "image": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600"},
            {"name": "Daihatsu Xenia 2021", "type": "mobil", "description": "Irit BBM, AC dingin.", "price_day": 325000, "price_week": 1900000, "price_month": 7000000, "price_with_driver_day": 525000, "price_with_driver_week": 3300000, "price_with_driver_month": 11500000, "allow_with_driver": True, "image": "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600"},
        ]
        for r in rlist:
            await db.rent.insert_one(Rent(**r).model_dump())
    # Banners
    if await db.banners.count_documents({}) == 0:
        bdefaults = [
            {"title": "Diskon 40% semua layanan!", "subtitle": "Berlaku untuk pelanggan baru", "code": "CAKJEK", "color_from": "#fb923c", "color_to": "#ec4899", "order_idx": 0},
            {"title": "Gratis ongkir Cakfood", "subtitle": "Minimum belanja Rp 30.000", "code": "FREEONGKIR", "color_from": "#10b981", "color_to": "#06b6d4", "order_idx": 1},
            {"title": "Cashback Cakpay 10%", "subtitle": "Top-up minimum Rp 50.000", "code": "PAY10", "color_from": "#6366f1", "color_to": "#a855f7", "order_idx": 2},
        ]
        for b in bdefaults:
            await db.banners.insert_one(Banner(**b).model_dump())

@app.on_event("startup")
async def on_startup():
    await seed()
    # Migrate old rent docs: price_with_driver → price_with_driver_day
    async for d in db.rent.find({"price_with_driver": {"$exists": True}}, {"id": 1, "price_with_driver": 1}):
        await db.rent.update_one(
            {"id": d["id"]},
            {
                "$set": {"price_with_driver_day": d.get("price_with_driver", 0)},
                "$unset": {"price_with_driver": ""},
            },
        )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
