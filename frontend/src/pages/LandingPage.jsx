import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">Recov.ai</h1>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            Sign In
          </button>
        </nav>
        
        <main className="py-20">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-blue-900 mb-6">
              Welcome to Recov.ai
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Your AI-powered post-surgery recovery companion. We provide personalized care plans, real-time health monitoring, and instant access to medical support when you need it most.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
