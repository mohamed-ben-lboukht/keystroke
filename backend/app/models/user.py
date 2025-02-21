from pydantic import BaseModel

class UserProfile(BaseModel):
    user_id: str
    age: int
    gender: str
    handedness: str  # Right-handed or Left-handed
