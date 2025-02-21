import numpy as np

def analyze_keystrokes(user_id: str):
    # Charger les frappes de l'utilisateur
    keystroke_data = load_keystrokes(user_id)
    
    if not keystroke_data:
        return {"error": "No data available"}
    
    # Calculer des statistiques simples
    press_durations = [k.release_time - k.press_time for k in keystroke_data]
    avg_press_duration = np.mean(press_durations)

    return {"user_id": user_id, "avg_press_duration": avg_press_duration}
