from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://madeingoun:madeingoun@localhost:5432/madeingoun"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: str = "http://localhost:3000"

    SUPPORTED_LANGUAGES: List[str] = ["ar", "fr"]
    DEFAULT_LANGUAGE: str = "fr"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    OPENAI_API_KEY: str = ""

    S3_BUCKET: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT: str = ""
    S3_REGION: str = "us-east-1"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@madeingoun.ma"

    OTP_EXPIRE_MINUTES: int = 5
    OTP_RATE_LIMIT_MAX: int = 3
    OTP_RATE_LIMIT_WINDOW_SECONDS: int = 900

    CMI_CLIENT_ID: str = ""
    CMI_STORE_KEY: str = ""
    CMI_BASE_URL: str = "https://testpayment.cmi.co.ma/fim/est3Dgate"
    CMI_OK_URL: str = "http://localhost:3000/fr/payment/success"
    CMI_FAIL_URL: str = "http://localhost:3000/fr/payment/fail"
    CMI_CALLBACK_URL: str = "http://localhost:8000/payment/cmi/callback"

    AMANA_API_KEY: str = ""
    AMANA_API_URL: str = "https://api-sandbox.amana.ma/v1"
    AMANA_WEBHOOK_SECRET: str = ""

    PLATFORM_COMMISSION_RATE: float = 0.05
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
