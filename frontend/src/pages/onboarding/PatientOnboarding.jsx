import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dob: '',
    contactNumber: '',
    emergencyContacts: [''],
    medications: [''],
    conditions: '',
    surgeryType: '',
    doctorContact: '',
    doctorEmail: '',
    sleepSchedule: '',
    dietPreferences: '',
    allergies: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus('offline');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmergencyContactChange = (index, value) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index] = value;
    setFormData(prev => ({
      ...prev,
      emergencyContacts: newContacts
    }));
  };

  const handleMedicationChange = (index, value) => {
    const newMedications = [...formData.medications];
    newMedications[index] = value;
    setFormData(prev => ({
      ...prev,
      medications: newMedications
    }));
  };

  // Add a function to download the form data as JSON
  const downloadFormData = () => {
    try {
      // Format the data
      const jsonData = {
        personalInfo: {
          name: formData.name,
          address: formData.address,
          dob: formData.dob,
          contactNumber: formData.contactNumber
        },
        emergencyContacts: formData.emergencyContacts.filter(contact => contact.trim() !== ''),
        medicalInfo: {
          medications: formData.medications.filter(med => med.trim() !== ''),
          conditions: formData.conditions,
          surgeryType: formData.surgeryType
        },
        doctorInfo: {
          contact: formData.doctorContact,
          email: formData.doctorEmail
        },
        routineInfo: {
          sleepSchedule: formData.sleepSchedule,
          dietPreferences: formData.dietPreferences,
          allergies: formData.allergies
        },
        timestamp: new Date().toISOString()
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(jsonData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger click
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return true;
    } catch (error) {
      console.error('Error downloading data:', error);
      return false;
    }
  };

  // Modify handleSubmit to include download option on error
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Format the data for submission
      const formattedData = JSON.stringify({
        personalInfo: {
          name: formData.name,
          address: formData.address,
          dob: formData.dob,
          contactNumber: formData.contactNumber
        },
        emergencyContacts: formData.emergencyContacts.filter(contact => contact.trim() !== ''),
        medicalInfo: {
          medications: formData.medications.filter(med => med.trim() !== ''),
          conditions: formData.conditions,
          surgeryType: formData.surgeryType
        },
        doctorInfo: {
          contact: formData.doctorContact,
          email: formData.doctorEmail
        },
        routineInfo: {
          sleepSchedule: formData.sleepSchedule,
          dietPreferences: formData.dietPreferences,
          allergies: formData.allergies
        }
      });

      console.log('Sending data:', formattedData);

      // Use fetch API with explicit timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('http://localhost:5001/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: formattedData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Server returned an error');
        }
        
        console.log('Success:', responseData);
        alert('Patient data submitted successfully!');
        
        // Set session flag before redirecting
        sessionStorage.setItem('fromFormSubmission', 'true');
        
        // Navigate to dashboard on success
        navigate('/dashboard');
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          setError('Request timed out. Would you like to download your data instead?');
        } else {
          setError(`${fetchError.message}. Would you like to download your data instead?`);
        }
        
        // Offer to download the data
        if (window.confirm('There was an error saving your data to the server. Would you like to download it as a JSON file instead?')) {
          if (downloadFormData()) {
            alert('Data downloaded successfully. You can now proceed to the dashboard.');
            navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setError(`${error.message}. Would you like to download your data instead?`);
      
      // Offer to download the data
      if (window.confirm('There was an error processing your data. Would you like to download it as a JSON file instead?')) {
        if (downloadFormData()) {
          alert('Data downloaded successfully. You can now proceed to the dashboard.');
          navigate('/dashboard');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a test function to check server connection
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Test response status:', response.status);
      const data = await response.json();
      console.log('Test response data:', data);
      
      alert(`Connection test ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Test connection error:', error);
      alert(`Connection test failed: ${error.message}. Please make sure the server is running on port 5001.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Patient Information</h2>
          <p className="mt-2 text-gray-600">Please fill out your information to help us provide better care</p>
          
          {/* Server status indicator */}
          <div className="mt-3 mb-2 flex justify-center items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              Server Status: {serverStatus === 'online' ? 'Connected' : 
                              serverStatus === 'offline' ? 'Disconnected' : 'Checking...'}
            </span>
            <button 
              type="button"
              onClick={checkServerStatus}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
            <button 
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="ml-2 text-xs text-gray-600 hover:text-gray-800"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
          
          {/* Test button for debugging */}
          <button 
            type="button"
            onClick={testConnection}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Test Server Connection
          </button>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs font-mono">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <div><span className="font-bold">Server Status:</span> {serverStatus}</div>
            <div><span className="font-bold">API URL:</span> http://localhost:5001/api/patients</div>
            <div><span className="font-bold">Frontend URL:</span> {window.location.href}</div>
            <div className="mt-2">
              <button 
                type="button" 
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
                onClick={() => {
                  fetch('http://localhost:5001/api/test')
                    .then(res => res.json())
                    .then(data => alert(JSON.stringify(data)))
                    .catch(err => alert('Error: ' + err.message));
                }}
              >
                Test GET
              </button>
              <button 
                type="button" 
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                onClick={() => {
                  fetch('http://localhost:5001/api/patients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: 'data' })
                  })
                    .then(res => res.json())
                    .then(data => alert(JSON.stringify(data)))
                    .catch(err => alert('Error: ' + err.message));
                }}
              >
                Test POST
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                required
                pattern="[0-9]{10}"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="1234567890"
              />
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index}>
                <label htmlFor={`emergencyContact-${index}`} className="block text-sm font-medium text-gray-700">
                  Emergency Contact {index + 1}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    id={`emergencyContact-${index}`}
                    required
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={contact}
                    onChange={(e) => handleEmergencyContactChange(index, e.target.value)}
                  />
                  {index === formData.emergencyContacts.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        emergencyContacts: [...prev.emergencyContacts, '']
                      }))}
                      className="mt-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
            
            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700">Medications</label>
              {formData.medications.map((medication, index) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <input
                    type="text"
                    id={`medication-${index}`}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={medication}
                    onChange={(e) => handleMedicationChange(index, e.target.value)}
                  />
                  {index === formData.medications.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        medications: [...prev.medications, '']
                      }))}
                      className="mt-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="conditions" className="block text-sm font-medium text-gray-700">Medical Conditions</label>
              <textarea
                id="conditions"
                name="conditions"
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.conditions}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="surgeryType" className="block text-sm font-medium text-gray-700">Type of Surgery</label>
              <input
                type="text"
                id="surgeryType"
                name="surgeryType"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.surgeryType}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Doctor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Doctor Information</h3>
            
            <div>
              <label htmlFor="doctorContact" className="block text-sm font-medium text-gray-700">Doctor Contact Number</label>
              <input
                type="tel"
                id="doctorContact"
                name="doctorContact"
                required
                pattern="[0-9]{10}"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.doctorContact}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="doctorEmail" className="block text-sm font-medium text-gray-700">Doctor Email</label>
              <input
                type="email"
                id="doctorEmail"
                name="doctorEmail"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.doctorEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Routine Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Routine Information</h3>
            
            <div>
              <label htmlFor="sleepSchedule" className="block text-sm font-medium text-gray-700">Sleep Schedule</label>
              <input
                type="text"
                id="sleepSchedule"
                name="sleepSchedule"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.sleepSchedule}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dietPreferences" className="block text-sm font-medium text-gray-700">Diet Preferences</label>
              <input
                type="text"
                id="dietPreferences"
                name="dietPreferences"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.dietPreferences}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Information'}
            </button>

            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={downloadFormData}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Download as JSON
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Just navigate to dashboard
                  navigate('/dashboard');
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 