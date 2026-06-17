from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import DevelopmentConfig

#Imports de blueprints
from app.routes.prueba import prueba_bp


db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    CORS(app)
    db.init_app(app)


    app.register_blueprint(prueba_bp, url_prefix='/api/prueba')

    return app