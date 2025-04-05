# backend/app/routes/pdf.py
from flask import Blueprint, jsonify

pdf_bp = Blueprint('pdf', __name__, url_prefix='/api/pdf')

@pdf_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "PDF route is working!"})
