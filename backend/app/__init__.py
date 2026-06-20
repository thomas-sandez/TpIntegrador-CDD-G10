import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import DevelopmentConfig

#Imports de blueprints
from app.routes.prueba import prueba_bp
from app.routes.ControladorAlgoritmos import controlador_algoritmos_bp
from app.routes.ControladorImagenes import controlador_imagenes_bp


db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='static')
    app.config.from_object(DevelopmentConfig)

    # CORS: en Railway se configura ALLOWED_ORIGINS con la URL del frontend
    # Ej: https://mi-frontend.railway.app
    # En local, se permite todo para facilitar el desarrollo
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*')
    origins = [o.strip() for o in allowed_origins.split(',')] if allowed_origins != '*' else '*'
    CORS(app, origins=origins)

    db.init_app(app)

    app.register_blueprint(prueba_bp, url_prefix='/api/prueba')
    app.register_blueprint(controlador_algoritmos_bp, url_prefix='/api/algoritmos')
    app.register_blueprint(controlador_imagenes_bp, url_prefix='/api/imagenes')

    return app