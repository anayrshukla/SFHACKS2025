import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SchedulePage = () => {
  const { patientId } = useParams();
  const [schedule, setSchedule] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/schedule/${patientId}`);
        const data = await res.json();
        if (data.success) {
          setSchedule(data.schedule);
        } else {
          setSchedule('Failed to load schedule.');
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setSchedule('Server error while loading schedule.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [patientId]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Your Daily Wellness Schedule</h1>
      {loading ? (
        <p>Loading schedule...</p>
      ) : (
        <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono text-sm">
          {schedule}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
