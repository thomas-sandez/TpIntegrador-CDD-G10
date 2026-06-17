import os
from dotenv import load_dotenv
import secrets

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:

    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)

    # Configuración de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, '../app.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True