# backend/app/routes/patient.py
from flask import Blueprint, jsonify

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')

@patient_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Patient route is working!"})
