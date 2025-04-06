const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const uri = "mongodb+srv://anaytest2:sfhacks@recovai.xvktxbr.mongodb.net/?retryWrites=true&w=majority&appName=RecovAI";
const client = new MongoClient(uri);

// Gemini API setup
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Save patient data
app.post('/api/patients', async (req, res) => {
  try {
    console.log('\n=== Raw Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const database = client.db("RecovAI");
    const collection = database.collection("patients_data");

    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Error: Empty request body');
      return res.status(400).json({
        success: false,
        error: 'Request body is empty or not properly formatted'
      });
    }

    console.log('\n=== Raw Request Body ===');
    console.log(JSON.stringify(req.body, null, 2));

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

    console.log('\n=== Processed Patient Data ===');
    console.log(JSON.stringify(patientData, null, 2));

    const result = await collection.insertOne(patientData);
    console.log('\n=== MongoDB Insert Result ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('Inserted document with ID:', result.insertedId);

    res.status(201).json({ 
      success: true, 
      message: 'Patient data saved successfully',
      data: { insertedId: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('\n=== Error Saving Patient Data ===');
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gemini chatbot route
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Define personality
    const personalityPrompt = `
    You are a friendly and empathetic medical assistant named CareBot.
    You speak with warmth and clarity. Be concise but kind.
    If someone asks about a medical issue, offer basic advice and encourage them to see a doctor.
    Don't use technical jargon unless asked to explain it.
    `;

    // Combine system prompt and user input
    const fullPrompt = `${personalityPrompt}\n\nUser: ${prompt}\nCareBot:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, response: text });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'API is working', timestamp: new Date() });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
