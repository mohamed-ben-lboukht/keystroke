from fastapi import FastAPI
from app.routers import keystroke_routes, user_routes

app = FastAPI(title="Keystroke Analyzer API")

# Inclure les routes
app.include_router(keystroke_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def root():
    return {"message": "Keystroke API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
