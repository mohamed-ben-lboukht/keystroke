from database.db import get_db_connection

class User:
    def __init__(self, id, username, score, created_at):
        self.id = id
        self.username = username
        self.score = score
        self.created_at = created_at

    @staticmethod
    def get_by_id(user_id):
        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        return User(**user) if user else None

    @staticmethod
    def create(username):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username) VALUES (?)", (username,))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id

    @staticmethod
    def update_score(user_id, score):
        conn = get_db_connection()
        conn.execute("UPDATE users SET score = score + ? WHERE id = ?", (score, user_id))
        conn.commit()
        conn.close()