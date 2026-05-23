"""Drop public schema and recreate all tables from SQLAlchemy models.

Use only in dev when migrations are out of sync with models.
Run: python -m scripts.reset_schema_from_models
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text

from app.core.database import Base, engine
from app.models import *  # noqa: F401, F403


async def reset():
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)
    print("Schema recreated from models.")


if __name__ == "__main__":
    asyncio.run(reset())
