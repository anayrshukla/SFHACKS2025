import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    // Check if user is redirected from form submission
    const fromForm = sessionStorage.getItem('fromFormSubmission');
    if (fromForm) {
      sessionStorage.removeItem('fromFormSubmission');
    }
    
    // You could fetch patient count or other data from the server here
    // For now, we'll just set a placeholder
    setPatientCount(Math.floor(Math.random() * 10) + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          </div>
          
          <div className="p-6">
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
              <p className="font-medium">Your information has been successfully saved!</p>
              <p className="text-sm mt-1">Our healthcare team will be in touch with you shortly.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Next Steps</h3>
                <p className="text-blue-800">Complete your healthcare provider verification</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Upcoming Events</h3>
                <p className="text-blue-800">No scheduled appointments</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Actions</h3>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => navigate('/onboarding')}
                >
                  Update Information
                </button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recovery Journey</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Thank you for registering with our platform. Your healthcare journey is important to us.
                  We'll be using the information you provided to personalize your experience and ensure
                  you receive the best care possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 