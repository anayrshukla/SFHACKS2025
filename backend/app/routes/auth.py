# backend/app/routes/auth.py
from flask import Blueprint, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Auth route is working!"})
