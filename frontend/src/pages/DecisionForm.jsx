import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { submitAnalysis } from '../api/client';

const PLACEHOLDERS = [
  'Best laptop for coding under ₹70k',
  'Phone with great camera and battery',
  'Laptop for gaming and college',
  'Best tablet for note taking',
];

const DEFAULT_FACTORS = {
  cpu_score: 0.24,
  gpu_score: 0.16,
  battery: 0.20,
  portability: 0.18,
  display: 0.12,
  thermals: 0.06,
  build_quality: 0.04,
};

const PRODUCTS = [
  {
    id: 1,
    name: 'Lenovo LOQ 15',
    price: 72000,
    cpu_score: 8.8,
    gpu_score: 8.5,
    battery: 5.5,
    portability: 4.5,
    display: 7.5,
    thermals: 8.2,
    build_quality: 7.0,
    creator_score: 7.8,
    student_score: 6.5,
    gaming_score: 9.0,
    image: 'https://via.placeholder.com/520x320?text=Lenovo+LOQ+15',
  },
  {
    id: 2,
    name: 'ASUS Vivobook 15',
    price: 58000,
    cpu_score: 7.2,
    gpu_score: 4.5,
    battery: 8.4,
    portability: 8.0,
    display: 7.0,
    thermals: 6.8,
    build_quality: 7.5,
    weight: 1.7,
    creator_score: 6.2,
    student_score: 9.0,
    gaming_score: 4.0,
    image: 'https://via.placeholder.com/520x320?text=ASUS+Vivobook+15',
  },
  {
    id: 3,
    name: 'MacBook Air M2',
    price: 95000,
    cpu_score: 9.0,
    gpu_score: 6.8,
    battery: 9.8,
    portability: 9.5,
    display: 9.2,
    thermals: 9.1,
    build_quality: 9.5,
    weight: 1.24,
    creator_score: 9.0,
    student_score: 9.5,
    gaming_score: 3.5,
    image: 'https://via.placeholder.com/520x320?text=MacBook+Air+M2',
  },
  {
    id: 4,
    name: 'HP Victus',
    price: 68000,
    cpu_score: 8.1,
    gpu_score: 8.0,
    battery: 5.8,
    portability: 5.0,
    display: 7.3,
    thermals: 7.8,
    build_quality: 6.8,
    weight: 2.3,
    creator_score: 7.0,
    student_score: 6.0,
    gaming_score: 8.5,
    image: 'https://via.placeholder.com/520x320?text=HP+Victus',
  },
  {
    id: 5,
    name: 'Acer Aspire Lite',
    price: 42000,
    cpu_score: 6.0,
    gpu_score: 3.0,
    battery: 7.2,
    portability: 7.8,
    display: 6.2,
    thermals: 6.0,
    build_quality: 6.1,
    weight: 1.6,
    creator_score: 4.8,
    student_score: 8.2,
    gaming_score: 2.5,
    image: 'https://via.placeholder.com/520x320?text=Acer+Aspire+Lite',
  },
];

const highlightMap = [
  { factor: 'battery', label: 'Long battery life' },
  { factor: 'portability', label: 'Easy to carry' },
  { factor: 'cpu_score', label: 'Strong performance' },
  { factor: 'gpu_score', label: 'Great graphics' },
  { factor: 'display', label: 'Premium screen' },
  { factor: 'build_quality', label: 'Solid build' },
];

function extractBudget(text) {
  const moneyMatch = text.match(/₹\s*([0-9,]+)/) || text.match(/rs\.?\s*([0-9,]+)/i) || text.match(/([0-9]{4,6})/);
  if (!moneyMatch) return 70000;
  return parseInt(moneyMatch[1].replace(/,/g, ''), 10) || 70000;
}

export default function DecisionForm({ onResultsReady, onBackHome }) {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adjustedFactors, setAdjustedFactors] = useState(DEFAULT_FACTORS);
  const [constraints, setConstraints] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const budget = useMemo(() => extractBudget(query), [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!query.trim()) {
      setError('Describe what you need in plain language.');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        user_needs: query.trim(),
        budget,
        factors: adjustedFactors,
        products: PRODUCTS,
        constraints: constraints.trim() ? [constraints.trim()] : undefined,
      };

      const response = await submitAnalysis(requestData);
      onResultsReady(response);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (factor, value) => {
    setAdjustedFactors((prev) => ({ ...prev, [factor]: Number(value) }));
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBackHome} className="btn btn-secondary px-4 py-2">
            ← Back home
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Budget inferred: ₹{budget.toLocaleString()}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-8 shadow-2xl"
        >
          <div className="space-y-4 mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-500 dark:text-sky-300">Smart recommendation</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white">
              Tell OptiChoice what you need. We’ll do the rest.
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
              No need to list every option. No manual priorities. Just describe your use case, budget, and what matters most.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="query" className="sr-only">What are you looking for?</label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-lg text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500 dark:text-slate-400">
              <p>Start with a conversational prompt like “best laptop for remote work and light gaming.”</p>
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="font-semibold text-primary hover:text-primary-dark"
              >
                {advancedOpen ? 'Hide advanced preferences' : 'Show advanced preferences'}
              </button>
            </div>

            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.35 }}
                className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  {['battery', 'portability', 'cpu_score', 'gpu_score'].map((factor) => (
                    <div key={factor} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <span>{factor.replace('_', ' ').toUpperCase()}</span>
                        <span>{adjustedFactors[factor].toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={adjustedFactors[factor]}
                        onChange={(e) => handleSliderChange(factor, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label htmlFor="constraints" className="text-sm font-medium text-slate-700 dark:text-slate-200">Hard constraints</label>
                  <textarea
                    id="constraints"
                    rows={3}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. must be under 1.7kg, must support stylus, must have at least 512GB"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Advanced mode is optional. Use it only when you want to tune the recommendation carefully.
                </p>
              </motion.div>
            )}

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full rounded-3xl py-4 text-lg shadow-xl"
            >
              {loading ? 'Finding your best option...' : 'Find My Best Option'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">What happens next?</p>
            <ul className="space-y-2">
              <li>• OptiChoice reads your prompt, infers budget and priorities, and scores products.</li>
              <li>• You get a clear best match, strong alternatives, and tradeoff guidance.</li>
              <li>• No manual option lists, no sliders unless you want them.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
