from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///./keystrokes.db"
engine = create_engine(DATABASE_URL)
