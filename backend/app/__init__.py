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

    CORS(app)
    db.init_app(app)

    app.register_blueprint(prueba_bp, url_prefix='/api/prueba')
    app.register_blueprint(controlador_algoritmos_bp, url_prefix='/api/algoritmos')
    app.register_blueprint(controlador_imagenes_bp, url_prefix='/api/imagenes')

    return app