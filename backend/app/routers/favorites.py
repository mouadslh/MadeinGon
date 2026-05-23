"""Favoris / wishlist — endpoints CRUD pour le rôle USER.

| Méthode | Chemin                       | Description                          |
|---------|------------------------------|--------------------------------------|
| GET     | `/favorites`                 | Liste les favoris de l'utilisateur   |
| GET     | `/favorites/ids`             | Liste légère (uniquement les IDs)    |
| POST    | `/favorites/{product_id}`    | Ajoute un produit aux favoris        |
| DELETE  | `/favorites/{product_id}`    | Retire un produit des favoris        |
| GET     | `/favorites/{product_id}`    | Vérifie si un produit est favori     |

Tous nécessitent un token JWT valide (`CurrentUser`).
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.product import Product
from app.models.wishlist import Wishlist
from app.schemas.favorite import (
    FavoriteItem,
    FavoriteListResponse,
    FavoriteProduct,
    FavoriteToggleResponse,
)

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=FavoriteListResponse)
async def list_favorites(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Liste paginée (limit/offset à ajouter plus tard si besoin)."""
    stmt = (
        select(Wishlist, Product)
        .join(Product, Product.id == Wishlist.product_id)
        .options(selectinload(Product.images))
        .where(Wishlist.user_id == user.id)
        .order_by(Wishlist.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    items = [
        FavoriteItem(
            product_id=w.product_id,
            created_at=w.created_at,
            product=FavoriteProduct.model_validate(p),
        )
        for w, p in rows
    ]
    return FavoriteListResponse(items=items, total=len(items))


@router.get("/ids", response_model=List[UUID])
async def list_favorite_ids(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Optimisation : ne renvoyer que les IDs (utile pour hydrater l'UI)."""
    rows = await db.execute(
        select(Wishlist.product_id).where(Wishlist.user_id == user.id)
    )
    return [r[0] for r in rows.all()]


@router.get("/{product_id}", response_model=FavoriteToggleResponse)
async def is_favorite(
    product_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user.id, Wishlist.product_id == product_id
        )
    )
    return FavoriteToggleResponse(
        product_id=product_id,
        is_favorited=existing.scalar_one_or_none() is not None,
    )


@router.post(
    "/{product_id}",
    response_model=FavoriteToggleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_favorite(
    product_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user.id, Wishlist.product_id == product_id
        )
    )
    if existing.scalar_one_or_none() is None:
        db.add(Wishlist(user_id=user.id, product_id=product_id))
        await db.flush()
    return FavoriteToggleResponse(product_id=product_id, is_favorited=True)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    product_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Wishlist).where(
            Wishlist.user_id == user.id, Wishlist.product_id == product_id
        )
    )
    return None
