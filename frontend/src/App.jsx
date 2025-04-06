import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PatientOnboarding from './pages/onboarding/PatientOnboarding';
import Dashboard from './pages/dashboard/Dashboard';
import SchedulePage from './pages/schedule/SchedulePage';
import Inbox from './pages/inbox/Inbox';
import { v4 as uuidv4 } from 'uuid';

function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);

            if (user) {
                const hasWelcomeEmail = localStorage.getItem('hasWelcomeEmail');
                if (!hasWelcomeEmail) {
                    addWelcomeEmail();
                    localStorage.setItem('hasWelcomeEmail', 'true');
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const addWelcomeEmail = () => {
        const welcomeEmail = {
            id: uuidv4(),
            subject: 'Welcome to Your Recovery Journey!',
            body: 'Thank you for joining our platform. We are here to support you every step of the way.',
            timestamp: new Date().toISOString()
        };
        const storedEmails = localStorage.getItem('emails');
        const emails = storedEmails ? JSON.parse(storedEmails) : [];
        const updatedEmails = [welcomeEmail, ...emails];
        localStorage.setItem('emails', JSON.stringify(updatedEmails));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/onboarding"
                    element={user ? <PatientOnboarding setPatientId={(id) => localStorage.setItem('patientId', id)} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                    path="/schedule/:patientId"
                    element={user ? <SchedulePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/inbox"
                    element={user ? <Inbox /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
}

export default App;
