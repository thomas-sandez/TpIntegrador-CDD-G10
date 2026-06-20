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

    # CORS: permite todos los orígenes por defecto (útil para deploy público del TP).
    # Para restringir, setear ALLOWED_ORIGINS=https://mi-frontend.railway.app en Railway.
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*')
    origins = [o.strip() for o in allowed_origins.split(',')] if allowed_origins != '*' else '*'
    CORS(
        app,
        origins=origins,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization', 'Accept'],
        supports_credentials=False,
    )

    # Garantiza headers CORS en TODAS las respuestas (incluyendo errores 4xx/5xx).
    # flask-cors a veces omite los headers en respuestas de error.
    @app.after_request
    def add_cors_headers(response):
        origin = os.environ.get('ALLOWED_ORIGINS', '*')
        response.headers['Access-Control-Allow-Origin'] = origin if origin != '*' else '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
        return response

    db.init_app(app)

    app.register_blueprint(prueba_bp, url_prefix='/api/prueba')
    app.register_blueprint(controlador_algoritmos_bp, url_prefix='/api/algoritmos')
    app.register_blueprint(controlador_imagenes_bp, url_prefix='/api/imagenes')

    return app
