import { useState } from 'react';
import { submitDecision } from '../api/client';

const COMMON_PRIORITIES = [
  'Price',
  'Performance',
  'Battery Life',
  'Build Quality',
  'Brand',
  'Customer Support',
  'Durability',
  'Ease of Use',
  'Warranty',
  'Availability',
];

export default function DecisionForm({ onResultsReady, onBackHome }) {
  const [formData, setFormData] = useState({
    decision_question: '',
    options: '',
    budget: '',
    priorities: [],
    constraints: [],
  });

  const [customPriority, setCustomPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePriorityToggle = (priority) => {
    setFormData((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const handleAddCustomPriority = () => {
    if (customPriority.trim() && !formData.priorities.includes(customPriority.trim())) {
      setFormData((prev) => ({
        ...prev,
        priorities: [...prev.priorities, customPriority.trim()],
      }));
      setCustomPriority('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.decision_question.trim()) {
      setError('Please enter your decision question.');
      return;
    }

    if (!formData.options.trim()) {
      setError('Please enter at least one option.');
      return;
    }

    if (!formData.budget || formData.budget <= 0) {
      setError('Please enter a valid budget.');
      return;
    }

    if (formData.priorities.length === 0) {
      setError('Please select at least one priority.');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        decision_question: formData.decision_question.trim(),
        options: formData.options.split('\n').map((opt) => opt.trim()).filter(Boolean),
        budget: parseFloat(formData.budget),
        priorities: formData.priorities,
        constraints: formData.constraints.length > 0 ? formData.constraints : undefined,
      };

      const response = await submitDecision(requestData);
      onResultsReady(response);
    } catch (err) {
      setError(err.message || 'Failed to get recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBackHome} className="btn btn-secondary mb-6">
          ← Back Home
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Make Your Decision</h1>
          <p className="text-gray-600 mb-8">
            Tell us about your decision, and we'll give you ranked recommendations based on your priorities.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Decision Question */}
            <div className="form-group">
              <label htmlFor="decision_question" className="form-label">
                What are you deciding on? *
              </label>
              <input
                id="decision_question"
                name="decision_question"
                type="text"
                placeholder="e.g., Which laptop should I buy for college?"
                value={formData.decision_question}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Options */}
            <div className="form-group">
              <label htmlFor="options" className="form-label">
                Your options (one per line) *
              </label>
              <textarea
                id="options"
                name="options"
                placeholder={'e.g.:\nDell XPS 13\nMacBook Air M3\nLenovo ThinkPad X1'}
                value={formData.options}
                onChange={handleInputChange}
                className="form-textarea"
                rows={4}
              />
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget" className="form-label">
                Your budget (₹) *
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                placeholder="e.g., 100000"
                value={formData.budget}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Priorities */}
            <div className="form-group">
              <label className="form-label">What matters most to you? (select or add) *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {COMMON_PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePriorityToggle(priority)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      formData.priorities.includes(priority)
                        ? 'border-[#2c5aa0] bg-[#2c5aa0] text-white'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-[#2c5aa0]'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>

              {/* Custom Priority */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom priority..."
                  value={customPriority}
                  onChange={(e) => setCustomPriority(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPriority();
                    }
                  }}
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPriority}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>

              {formData.priorities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.priorities.map((priority) => (
                    <div
                      key={priority}
                      className="bg-[#2c5aa0] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {priority}
                      <button
                        type="button"
                        onClick={() => handlePriorityToggle(priority)}
                        className="font-bold hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg py-3"
            >
              {loading ? 'Analyzing your options...' : 'Get My Recommendation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
