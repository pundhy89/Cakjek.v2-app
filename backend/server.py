from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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

class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str
    description: Optional[str] = ""
    image: Optional[str] = ""
    active: bool = True

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
    app_name: str = "CakApp"

class SettingsUpdate(BaseModel):
    whatsapp_number: str
    app_name: Optional[str] = "CakApp"

class OrderCreate(BaseModel):
    service: str  # cakride|cakcar|cakfood|caksend|cakmart|cakpay
    customer_name: str
    customer_phone: str
    details: dict  # service-specific
    total: float
    message: str  # whatsapp text

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
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"
_active_tokens: set = set()

def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    token = authorization.split(" ", 1)[1]
    if token not in _active_tokens:
        raise HTTPException(401, "Invalid token")
    return token

@api_router.post("/admin/login")
async def admin_login(req: LoginReq):
    if req.username == ADMIN_USERNAME and req.password == ADMIN_PASSWORD:
        token = secrets.token_urlsafe(24)
        _active_tokens.add(token)
        return {"token": token, "username": req.username}
    raise HTTPException(401, "Invalid credentials")

@api_router.get("/admin/me")
async def admin_me(_: str = Depends(require_admin)):
    return {"ok": True, "username": ADMIN_USERNAME}

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
async def get_menu(category: str):
    items = await db.menu.find({"category": category, "active": True}, {"_id": 0}).to_list(500)
    return items

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
    order = Order(**payload.model_dump())
    await db.orders.insert_one(order.model_dump())
    s = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    wa = (s or {}).get("whatsapp_number", "6285233962821")
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
    return {"message": "CakApp API"}

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

@app.on_event("startup")
async def on_startup():
    await seed()

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
