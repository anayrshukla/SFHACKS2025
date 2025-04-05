# backend/app/routes/chatbot.py
from flask import Blueprint, jsonify

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

@chatbot_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Chatbot route is working!"})
