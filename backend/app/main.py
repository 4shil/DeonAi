import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import settings

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Chatbot API")

allow_origins = [origin.strip() for origin in settings.cors_allow_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
