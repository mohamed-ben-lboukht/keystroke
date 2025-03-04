from flask_socketio import SocketIO, emit, join_room, leave_room
from app import app

socketio = SocketIO(app, cors_allowed_origins="*")
rooms = {}

@socketio.on('join')
def handle_join(data):
    room = data['room']
    join_room(room)
    emit('user_joined', {"message": f"Un joueur a rejoint la salle {room}"}, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    emit('receive_message', {"sender": data['sender'], "text": data['text']}, room=room)

@socketio.on('disconnect')
def handle_disconnect():
    emit('user_left', {"message": "Un joueur a quitté le chat"}, broadcast=True)
