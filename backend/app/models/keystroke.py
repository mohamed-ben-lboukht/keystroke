from pydantic import BaseModel
from typing import List

class KeystrokeData(BaseModel):
    user_id: str
    key: str
    press_time: float
    release_time: float
