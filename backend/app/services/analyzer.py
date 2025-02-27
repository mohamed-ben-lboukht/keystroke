from typing import List
from app.models.keystroke import KeystrokeData

def analyze_keystrokes(data: List[KeystrokeData]):
    if not data:
        return {
            "error": "No data available"
        }
    
    # Calculate timing features
    total_time = sum(k.release_time - k.press_time for k in data)
    
    # Mock profile based on total typing time
    # This is a placeholder until the ML model is implemented
    profile = {
        "ageRange": "25-35" if total_time < 5000 else "35-45",
        "handedness": "Right",
        "typingExperience": "Advanced" if total_time < 3000 else "Intermediate",
        "consistency": "High" if len(data) > 10 else "Medium"
    }
    
    # Calculate timing statistics
    timings = {
        "pp": [], # Press-to-Press
        "pr": [], # Press-to-Release
        "rr": [], # Release-to-Release
        "rp": []  # Release-to-Press
    }
    
    for i in range(len(data)):
        # Press-to-Release timing for current keystroke
        timings["pr"].append(data[i].release_time - data[i].press_time)
        
        if i > 0:
            # Release-to-Press timing
            timings["rp"].append(data[i].press_time - data[i-1].release_time)
            # Press-to-Press timing
            timings["pp"].append(data[i].press_time - data[i-1].press_time)
            # Release-to-Release timing
            timings["rr"].append(data[i].release_time - data[i-1].release_time)
    
    return {
        "profile": profile,
        "timings": timings,
        "total_time": total_time
    }
