from jose import jwt

SECRET_KEY = "secret"

def create_token(user_id: str):
    return jwt.encode({"user_id": user_id}, SECRET_KEY)
