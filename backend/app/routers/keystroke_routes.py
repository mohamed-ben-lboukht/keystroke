from fastapi import APIRouter, HTTPException
from app.models.keystroke import KeystrokeData
from app.services.analyzer import analyze_keystrokes
from typing import List
import logging

router = APIRouter(prefix="/api", tags=["Keystroke Analysis"])

# Configure logging
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def analyze_keystrokes_data(data: List[KeystrokeData]):
    try:
        if not data:
            raise HTTPException(status_code=400, detail="No keystroke data provided")
            
        # Log incoming data for debugging
        logger.debug(f"Received keystroke data with {len(data)} entries")
        
        # Print keystroke data as placeholder for ML model
        print("Received Keystroke Data:")
        for keystroke in data:
            print(f"Key: {keystroke.key}, Press Time: {keystroke.press_time}, Release Time: {keystroke.release_time}")
        
        result = analyze_keystrokes(data)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing keystroke data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
