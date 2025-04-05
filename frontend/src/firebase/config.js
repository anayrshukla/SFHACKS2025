import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8KCLQEtq7M359g4H2qd_mct0TEphggHo",
  authDomain: "vytalai.firebaseapp.com",
  projectId: "vytalai",
  storageBucket: "vytalai.firebasestorage.app",
  messagingSenderId: "890833201403",
  appId: "1:890833201403:web:d92a6ba3897734c6d4a85e",
  measurementId: "G-T8XL1X2J6Q"
};

let app;
let analytics;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Only initialize analytics in browser environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    console.log('Analytics initialized successfully');
  }
  
  auth = getAuth(app);
  console.log('Auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, analytics };
export default app; 