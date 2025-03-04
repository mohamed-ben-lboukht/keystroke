class Message:
    def __init__(self, id, game_id, sender_id, text, timestamp):
        self.id = id
        self.game_id = game_id
        self.sender_id = sender_id
        self.text = text
        self.timestamp = timestamp

    @staticmethod
    def create(game_id, sender_id, text):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO messages (game_id, sender_id, text) VALUES (?, ?, ?)", (game_id, sender_id, text))
        conn.commit()
        message_id = cursor.lastrowid
        conn.close()
        return message_id

    @staticmethod
    def get_by_game(game_id):
        conn = get_db_connection()
        messages = conn.execute("SELECT * FROM messages WHERE game_id = ?", (game_id,)).fetchall()
        conn.close()
        return [dict(msg) for msg in messages]
