import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PatientOnboarding from './pages/onboarding/PatientOnboarding';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          element={user ? <PatientOnboarding /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <div>Dashboard (Coming Soon)</div> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
