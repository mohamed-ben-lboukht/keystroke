import sqlite3

DATABASE_FILE = "database/keystrokes.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with open("database/schema.sql", "r") as f:
        schema = f.read()
    conn = get_db_connection()
    conn.executescript(schema)
    conn.commit()
    conn.close()
