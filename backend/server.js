const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const uri = "mongodb+srv://anaytest2:sfhacks@recovai.xvktxbr.mongodb.net/?retryWrites=true&w=majority&appName=RecovAI";
const client = new MongoClient(uri);
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
connectToMongoDB();

// Save patient and schedule
app.post('/api/patients', async (req, res) => {
  try {
    const database = client.db("RecovAI");
    const collection = database.collection("patients_data");

    const patientData = {
      personalInfo: req.body.personalInfo || {},
      emergencyContacts: req.body.emergencyContacts || [],
      medicalInfo: req.body.medicalInfo || {},
      doctorInfo: req.body.doctorInfo || {},
      routineInfo: req.body.routineInfo || {},
      createdAt: new Date()
    };

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
    const schedulePrompt = `
You are a kind and professional medical assistant named Aurora. Based on the following patient data,
please generate a personalized daily schedule in Markdown table format. Prioritize medication timings,
meals, rest, and wellness activities. Respond ONLY with a table.

Patient Info:
${JSON.stringify(patientData, null, 2)}
    `;
    const result = await model.generateContent(schedulePrompt);
    const response = await result.response;
    const scheduleText = response.text();

    patientData.generatedSchedule = scheduleText;

    const insertResult = await collection.insertOne(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient and schedule saved successfully',
      data: { insertedId: insertResult.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get schedule by patient ID
app.get('/api/schedule/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const database = client.db("RecovAI");
    const collection = database.collection("patients_data");

    const patient = await collection.findOne({ _id: new ObjectId(patientId) });
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    res.json({ success: true, schedule: patient.generatedSchedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔥 NEW: Chat endpoint for Gemini chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
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
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
