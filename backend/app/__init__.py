# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.patient import patient_bp
    from app.routes.pdf import pdf_bp
    from app.routes.schedule import schedule_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(pdf_bp)
    app.register_blueprint(schedule_bp)
    
    return app
