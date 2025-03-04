from flask import Flask
from flask_cors import CORS
from app.routes import routes_bp
from app.sockets import socketio

app = Flask(__name__)
CORS(app)  # Activer CORS pour permettre les requêtes du frontend

app.register_blueprint(routes_bp)

socketio.init_app(app)  # Initialiser Socket.IO avec Flask
