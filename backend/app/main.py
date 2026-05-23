from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import (
    admin,
    ai,
    auth,
    buyer_addresses,
    categories,
    orders,
    products,
    search,
    sellers,
    users,
)
from app.routers.delivery_amana import router as delivery_amana_router
from app.routers.payment_cmi import router as payment_cmi_router
from app.routers.seller_chatbot import router as seller_chatbot_router
from app.routers.seller_notifications import router as seller_notifications_router
from app.routers.seller_orders import router as seller_orders_router
from app.routers.seller_profile import router as seller_profile_router
from app.routers.seller_wallet import router as seller_wallet_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Made in GON API",
    description="Marketplace API for Guelmim-Oued Noun artisans",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sellers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(buyer_addresses.router)
app.include_router(categories.router)
app.include_router(search.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(seller_profile_router)
app.include_router(seller_chatbot_router)
app.include_router(seller_orders_router)
app.include_router(seller_wallet_router)
app.include_router(seller_notifications_router)
app.include_router(payment_cmi_router)
app.include_router(delivery_amana_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "made-in-goun"}
