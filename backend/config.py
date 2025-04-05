# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017'
    MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME') or 'sfhacks_db'
    
    # Add any other configuration variables your services might need
    PDF_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
