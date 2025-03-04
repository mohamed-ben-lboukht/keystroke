from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import sqlite3
import json

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle de données
class KeystrokeData(BaseModel):
    text_content: str
    user_info: dict

# Connection à la base de données
def get_db():
    conn = sqlite3.connect('backend/database/keystrokes.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes API
@app.post("/api/keystrokes")
async def analyze_keystrokes(data: KeystrokeData):
    return {
        "predictions": {
            "age": 25,
            "handedness": "droitier",
            "gender": "homme",
            "class": "étudiant"
        }
    }

@app.post("/api/contribute")
async def contribute(data: KeystrokeData):
    db = get_db()
    try:
        db.execute(
            "INSERT INTO contributions (text_content, keystroke_data, user_info) VALUES (?, ?, ?)",
            (data.text_content, "{}", json.dumps(data.user_info))
        )
        db.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"Erreur: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

# Servir les fichiers statiques
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    # Créer la base de données si elle n'existe pas
    db = get_db()
    try:
        with open('backend/database/schema.sql', 'r') as f:
            db.executescript(f.read())
        db.commit()
    except Exception as e:
        print(f"Erreur lors de l'initialisation de la base de données: {e}")
    finally:
        db.close()
    
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True) 