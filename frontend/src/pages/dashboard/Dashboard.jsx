import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
    const navigate = useNavigate();
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');

    const showNextTaskNotification = () => {
        const scheduleMarkdown = localStorage.getItem('patientSchedule');
        if (!scheduleMarkdown) {
            alert('No schedule data found.');
            return;
        }

        const lines = scheduleMarkdown.split('\n').slice(2);
        const now = new Date();

        const events = lines.map(line => {
            const match = line.match(/\|\s*(\d{1,2}:\d{2} [AP]M)\s*\|\s*(.+?)\s*\|/);
            if (!match) return null;

            const [, timeStr, activity] = match;
            const [hourStr, minuteStr, period] = timeStr.match(/(\d+):(\d+) ([AP]M)/).slice(1);
            let hour = parseInt(hourStr);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            const eventTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hour,
                minuteStr
            );

            if (eventTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
            }

            return { time: eventTime, activity };
        }).filter(Boolean).filter(event => event.time >= now);

        if (events.length > 0) {
            const nextEvent = events[0];
            const taskEmail = {
                id: uuidv4(),
                subject: 'Next Task Reminder',
                body: `Your next task is: ${nextEvent.activity} at ${nextEvent.time.toLocaleTimeString()}`,
                timestamp: new Date().toISOString()
            };
            const storedEmails = localStorage.getItem('emails');
            const emails = storedEmails ? JSON.parse(storedEmails) : [];
            const updatedEmails = [taskEmail, ...emails];
            localStorage.setItem('emails', JSON.stringify(updatedEmails));
        } else {
            alert('No upcoming tasks found today.');
        }
    };

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
            <div className="max-w-7xl mx-auto">
                {/* Top Navigation */}
                <div className="flex justify-end mb-8">
                    <Link to="/inbox" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Inbox
                    </Link>
                </div>

                <div className="flex gap-8">
                    {/* Left Section - Dashboard Info */}
                    <div className="flex-1">
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
                                        {(() => {
                                            const scheduleMarkdown = localStorage.getItem('patientSchedule');
                                            if (!scheduleMarkdown) return <p className="text-blue-800">No schedule data found</p>;

                                            const lines = scheduleMarkdown.split('\n').slice(2);
                                            const now = new Date(); // Current time in local timezone (PST)

                                            const events = lines.map(line => {
                                                const match = line.match(/\|\s*(\d{1,2}:\d{2} [AP]M)\s*\|\s*(.+?)\s*\|/);
                                                if (!match) return null;

                                                const [, timeStr, activity] = match;
                                                const [hourStr, minuteStr, period] = timeStr.match(/(\d+):(\d+) ([AP]M)/).slice(1);

                                                // Convert to 24-hour format
                                                let hour = parseInt(hourStr);
                                                if (period === 'PM' && hour !== 12) hour += 12;
                                                if (period === 'AM' && hour === 12) hour = 0;

                                                // Create date object in local timezone (PST)
                                                const eventTime = new Date(
                                                    now.getFullYear(),
                                                    now.getMonth(),
                                                    now.getDate(),
                                                    hour,
                                                    minuteStr
                                                );

                                                // If event time has already passed today, show for tomorrow
                                                if (eventTime < now) {
                                                    eventTime.setDate(eventTime.getDate() + 1);
                                                }

                                                return { time: eventTime, activity };
                                            }).filter(Boolean).filter(event => event.time >= now);

                                            const upcoming = events.slice(0, 3);

                                            return upcoming.length > 0 ? (
                                                <ul className="text-blue-800 space-y-1">
                                                    {upcoming.map((e, i) => (
                                                        <li key={i}>
                                                            {e.activity} @ {e.time.toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-blue-800">No upcoming events today</p>
                                            );
                                        })()}


                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Actions</h3>
                                        <button
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            onClick={() => navigate('/onboarding')}
                                        >
                                            Update Information
                                        </button>
                                        <button
                                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => {
                                                const patientId = localStorage.getItem('patientId');
                                                if (patientId) {
                                                    navigate(`/schedule/${patientId}`);
                                                } else {
                                                    alert('No patient ID found.');
                                                }
                                            }}
                                        >
                                            View Your Daily Schedule
                                        </button>
                                        <button
                                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                            onClick={showNextTaskNotification}
                                        >
                                            Show Next Task
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Chat Assistant */}
                    <div className="w-1/3">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <h2 className="text-xl font-bold text-gray-900 p-4 border-b">Recovery Chat Assistant</h2>
                            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'text-blue-700' : 'text-gray-700'}`}>
                                            <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Helper'}:</span> {msg.text}
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
        </div >
    );
};

export default Dashboard;
