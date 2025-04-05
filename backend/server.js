const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({
  limit: '10mb'
}));

// MongoDB connection
const uri = "mongodb+srv://anaytest2:sfhacks@recovai.xvktxbr.mongodb.net/?retryWrites=true&w=majority&appName=RecovAI";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

// API endpoint to save patient data
app.post('/api/patients', async (req, res) => {
  try {
    // Log the raw request
    console.log('\n=== Raw Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const database = client.db("RecovAI");
    const collection = database.collection("patients_data");
    
    // Check if request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Error: Empty request body');
      return res.status(400).json({
        success: false,
        error: 'Request body is empty or not properly formatted'
      });
    }
    
    // Log the raw request body
    console.log('\n=== Raw Request Body ===');
    console.log(JSON.stringify(req.body, null, 2));
    
    // Ensure the data is in proper JSON format
    const patientData = {
      personalInfo: {
        name: req.body.personalInfo?.name || '',
        address: req.body.personalInfo?.address || '',
        dob: req.body.personalInfo?.dob || '',
        contactNumber: req.body.personalInfo?.contactNumber || ''
      },
      emergencyContacts: Array.isArray(req.body.emergencyContacts) ? req.body.emergencyContacts : [],
      medicalInfo: {
        medications: Array.isArray(req.body.medicalInfo?.medications) ? req.body.medicalInfo.medications : [],
        conditions: req.body.medicalInfo?.conditions || '',
        surgeryType: req.body.medicalInfo?.surgeryType || ''
      },
      doctorInfo: {
        contact: req.body.doctorInfo?.contact || '',
        email: req.body.doctorInfo?.email || ''
      },
      routineInfo: {
        sleepSchedule: req.body.routineInfo?.sleepSchedule || '',
        dietPreferences: req.body.routineInfo?.dietPreferences || '',
        allergies: req.body.routineInfo?.allergies || ''
      },
      createdAt: new Date()
    };
    
    // Log the processed data
    console.log('\n=== Processed Patient Data ===');
    console.log(JSON.stringify(patientData, null, 2));
    
    // Save to MongoDB
    const result = await collection.insertOne(patientData);
    
    // Log the MongoDB result
    console.log('\n=== MongoDB Insert Result ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('Inserted document with ID:', result.insertedId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Patient data saved successfully',
      data: {
        insertedId: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('\n=== Error Saving Patient Data ===');
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add a health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API is working',
    timestamp: new Date() 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 