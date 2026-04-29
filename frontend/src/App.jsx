import { useState, useEffect } from 'react';
import Home from './pages/Home';
import DecisionForm from './pages/DecisionForm';
import Results from './pages/Results';
import { healthCheck } from './api/client';
import './styles/globals.css';

export default function App() {
  const [page, setPage] = useState('home'); // 'home', 'form', 'results'
  const [results, setResults] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(true);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setApiHealthy(healthy);
    };
    checkHealth();
  }, []);

  const handleNavigateToForm = () => {
    setPage('form');
    window.scrollTo(0, 0);
  };

  const handleResultsReady = (resultsData) => {
    setResults(resultsData);
    setPage('results');
    window.scrollTo(0, 0);
  };

  const handleNewDecision = () => {
    setPage('form');
    window.scrollTo(0, 0);
  };

  const handleBackHome = () => {
    setPage('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {!apiHealthy && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 max-w-5xl mx-auto">
            ⚠️ Backend API is not responding. Make sure the FastAPI server is running on port 8000.
          </p>
        </div>
      )}

      {page === 'home' && <Home onNavigateToForm={handleNavigateToForm} />}
      {page === 'form' && (
        <DecisionForm onResultsReady={handleResultsReady} onBackHome={handleBackHome} />
      )}
      {page === 'results' && <Results results={results} onNewDecision={handleNewDecision} />}
    </div>
  );
}