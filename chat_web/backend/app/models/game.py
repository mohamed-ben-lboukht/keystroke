class Game:
    def __init__(self, id, player1_id, player2_id, winner_id, character_to_guess, duration, created_at):
        self.id = id
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.winner_id = winner_id
        self.character_to_guess = character_to_guess
        self.duration = duration
        self.created_at = created_at

    @staticmethod
    def create(player1_id, player2_id, character_to_guess):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO games (player1_id, player2_id, character_to_guess, duration) VALUES (?, ?, ?, 300)", (player1_id, player2_id, character_to_guess))
        conn.commit()
        game_id = cursor.lastrowid
        conn.close()
        return game_id

    @staticmethod
    def set_winner(game_id, winner_id):
        conn = get_db_connection()
        conn.execute("UPDATE games SET winner_id = ? WHERE id = ?", (winner_id, game_id))
        conn.commit()
        conn.close()