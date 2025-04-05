from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
mongo_uri = "mongodb+srv://anaytest2:sfhacks@recovai.xvktxbr.mongodb.net/?retryWrites=true&w=majority&appName=RecovAI"
client = MongoClient(mongo_uri)
db = client["RecovAI"]
collection = db["patients_data"]

@app.route('/api/patients', methods=['POST'])
def save_patient_data():
    try:
        # Get the JSON data from the request
        data = request.json
        print(data)
        
        # Log the raw request data
        print("\n=== Raw Request Data ===")
        print(json.dumps(data, indent=2))
        
        # Ensure data is in the correct format
        patient_data = {
            "personalInfo": {
                "name": data.get("personalInfo", {}).get("name", ""),
                "address": data.get("personalInfo", {}).get("address", ""),
                "dob": data.get("personalInfo", {}).get("dob", ""),
                "contactNumber": data.get("personalInfo", {}).get("contactNumber", "")
            },
            "emergencyContacts": data.get("emergencyContacts", []),
            "medicalInfo": {
                "medications": data.get("medicalInfo", {}).get("medications", []),
                "conditions": data.get("medicalInfo", {}).get("conditions", ""),
                "surgeryType": data.get("medicalInfo", {}).get("surgeryType", "")
            },
            "doctorInfo": {
                "contact": data.get("doctorInfo", {}).get("contact", ""),
                "email": data.get("doctorInfo", {}).get("email", "")
            },
            "routineInfo": {
                "sleepSchedule": data.get("routineInfo", {}).get("sleepSchedule", ""),
                "dietPreferences": data.get("routineInfo", {}).get("dietPreferences", ""),
                "allergies": data.get("routineInfo", {}).get("allergies", "")
            },
            "createdAt": datetime.now()
        }
        
        # Log the processed data
        print("\n=== Processed Patient Data ===")
        # Can't directly use json.dumps with datetime objects, so we'll print parts separately
        print(json.dumps({k: v for k, v in patient_data.items() if k != 'createdAt'}, indent=2))
        print(f"createdAt: {patient_data['createdAt']}")
        
        # Insert the data into MongoDB
        result = collection.insert_one(patient_data)
        
        # Log the MongoDB result
        print("\n=== MongoDB Insert Result ===")
        print(f"Inserted document with ID: {result.inserted_id}")
        
        # Return success response
        return jsonify({
            "success": True,
            "message": "Patient data saved successfully",
            "data": {"insertedId": str(result.inserted_id)}
        }), 201
        
    except Exception as e:
        # Log the error
        print("\n=== Error Saving Patient Data ===")
        print(f"Error: {str(e)}")
        
        # Return error response
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Connecting to MongoDB...")
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
    
    # Start the Flask server
    app.run(host='0.0.0.0', port=3000, debug=True) 