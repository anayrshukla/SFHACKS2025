import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const fromForm = sessionStorage.getItem('fromFormSubmission');
    if (fromForm) {
      sessionStorage.removeItem('fromFormSubmission');
    }
    setPatientCount(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text: userInput }];
    setChatHistory(newHistory);
    setUserInput('');

    try {
      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();
      if (data.success) {
        setChatHistory([...newHistory, { sender: 'gemini', text: data.response }]);
      } else {
        setChatHistory([...newHistory, { sender: 'gemini', text: 'Sorry, something went wrong.' }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { sender: 'gemini', text: 'Server error occurred.' }]);
    }
  };

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

            <div className="border-t pt-6 mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recovery Journey</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <p className="text-gray-700">
                  Thank you for registering with our platform. Your healthcare journey is important to us.
                  We'll be using the information you provided to personalize your experience and ensure
                  you receive the best care possible.
                </p>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">Recovery Chat Assistant</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'text-blue-700' : 'text-green-700'}`}>
                      <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Gemini'}:</span> {msg.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Ask something..."
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Send
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
