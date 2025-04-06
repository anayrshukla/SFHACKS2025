import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientOnboarding({ setPatientId }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dob: '',
    contactNumber: '',
    emergencyContacts: [''],
    medications: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const submissionData = {
      personalInfo: {
        name: formData.name,
        address: formData.address,
        dob: formData.dob,
        contactNumber: formData.contactNumber
      },
      emergencyContacts: formData.emergencyContacts.filter(contact => contact.trim() !== ''),
      medicalInfo: {
        medications: formData.medications
          .split(',')
          .map(med => med.trim())
          .filter(med => med !== ''),
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
    };

    try {
      const res = await fetch('http://localhost:5001/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      const insertedId = data.data?.insertedId;
      if (insertedId) {
        if (setPatientId) {
          setPatientId(insertedId);
        } else {
          localStorage.setItem('patientId', insertedId);
        }
      }

      alert('Submission successful!');
      sessionStorage.setItem('fromFormSubmission', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Patient Onboarding</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="date" name="dob" placeholder="DOB" value={formData.dob} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="text" name="surgeryType" placeholder="Surgery Type" value={formData.surgeryType} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="text" name="sleepSchedule" placeholder="Sleep Schedule" value={formData.sleepSchedule} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="text" name="dietPreferences" placeholder="Diet Preferences" value={formData.dietPreferences} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="text" name="doctorContact" placeholder="Doctor Contact" value={formData.doctorContact} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <input type="email" name="doctorEmail" placeholder="Doctor Email" value={formData.doctorEmail} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          <textarea name="conditions" placeholder="Medical Conditions" value={formData.conditions} onChange={handleChange} className="w-full px-4 py-2 border rounded" rows="2" />
          <textarea name="allergies" placeholder="Allergies" value={formData.allergies} onChange={handleChange} className="w-full px-4 py-2 border rounded" rows="2" />
          <textarea name="medications" placeholder="Medications (comma separated)" value={formData.medications} onChange={handleChange} className="w-full px-4 py-2 border rounded" rows="2" />
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
