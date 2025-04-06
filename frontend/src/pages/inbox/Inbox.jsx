import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';

const Inbox = () => {
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        const storedEmails = localStorage.getItem('emails');
        if (storedEmails) {
            setEmails(JSON.parse(storedEmails));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                    <h1 className="text-2xl font-bold">Inbox</h1>
                </div>
                <div className="p-6">
                    {emails.length === 0 ? (
                        <p className="text-gray-600">No messages yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {emails.map(email => (
                                <li key={email.id} className="border-b pb-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">{email.subject}</h2>
                                        <p className="text-sm text-gray-500">{moment(email.timestamp).format('MMMM D, YYYY h:mm A')}</p>
                                    </div>
                                    <p className="text-gray-700 mt-2">{email.body}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-3">
                    <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
