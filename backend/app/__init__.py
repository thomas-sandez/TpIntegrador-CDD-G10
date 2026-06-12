from flask import Flask
from flask_cors import CORS
from app.config import DevelopmentConfig

#Imports de blueprints
from app.routes.prueba import prueba_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    CORS(app)


    app.register_blueprint(prueba_bp, url_prefix='/api/prueba')

    return app