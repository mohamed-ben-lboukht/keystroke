from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from app.models import User, Game, Message

routes_bp = Blueprint('routes', __name__)

@routes_bp.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@routes_bp.route("/games", methods=["POST"])
def create_game():
    data = request.json
    game_id = Game.create(data['player1_id'], data['player2_id'], data['character_to_guess'])
    return jsonify({"game_id": game_id}), 201

@routes_bp.route("/messages/<int:game_id>", methods=["GET"])
def get_messages(game_id):
    messages = Message.get_by_game(game_id)
    return jsonify(messages)