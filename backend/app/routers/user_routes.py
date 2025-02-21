from fastapi import APIRouter
from app.models.user import UserProfile

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    # Récupérer les données du profil utilisateur
    return {"user_id": user_id, "profile": "data"}
