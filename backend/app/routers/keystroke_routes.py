from fastapi import APIRouter
from app.models.keystroke import KeystrokeData
from app.services.analyzer import analyze_keystrokes
from app.services.storage import store_keystrokes
from typing import List

router = APIRouter(prefix="/keystrokes", tags=["Keystroke Analysis"])

@router.post("/")
async def collect_keystrokes(data: List[KeystrokeData]):
    store_keystrokes(data)
    return {"message": "Keystrokes stored successfully"}

@router.get("/analyze/{user_id}")
async def analyze_user_keystrokes(user_id: str):
    result = analyze_keystrokes(user_id)
    return {"message": "Analysis complete", "result": result}
