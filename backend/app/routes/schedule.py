# backend/app/routes/schedule.py
from flask import Blueprint, jsonify

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedule')

@schedule_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Schedule route is working!"})
