from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.auth import UserResponse
from app.services.auth_service import user_to_response

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser):
    return user_to_response(user)
