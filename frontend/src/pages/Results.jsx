import ResultCard from '../components/ResultCard';

export default function Results({ results, onNewDecision }) {
  if (!results) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onNewDecision} className="btn btn-secondary mb-8">
          ← Make Another Decision
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Your Recommendations</h1>
          {results.processing_notes && (
            <p className="text-gray-600 italic">{results.processing_notes}</p>
          )}
        </div>

        {/* Results Cards */}
        <div className="grid md:grid-cols-1 gap-6 mb-8">
          {/* Rank 1 - Best Pick */}
          {results.rank_1 && (
            <ResultCard
              rank="🏆 #1 PICK"
              option={results.rank_1}
              title="Best Choice"
              color="success"
            />
          )}

          {/* Rank 2 - Runner Up */}
          {results.rank_2 && (
            <ResultCard
              rank="🥈 #2 RUNNER-UP"
              option={results.rank_2}
              title="Strong Alternative"
              color="warning"
            />
          )}

          {/* Caution */}
          {results.caution && (
            <ResultCard
              rank="⚠️ CAUTION"
              option={results.caution}
              title="Consider Carefully"
              color="danger"
            />
          )}
        </div>

        {/* Explanation */}
        <div className="card bg-blue-50 border-l-4 border-[#2c5aa0]">
          <h3 className="text-lg font-bold text-[#2c5aa0] mb-3">How We Ranked These</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Each option was scored 0-10 on your selected priorities.</li>
            <li>✓ Top priority received 50% weight, second 30%, third 15%, rest split remaining 5%.</li>
            <li>✓ Overall score = weighted average of all priority scores.</li>
            <li>✓ Rankings are transparent: you can see exactly why each option ranked that way.</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-8 card bg-gradient-to-r from-[#2c5aa0] to-[#1e3f5a] text-white">
          <h3 className="text-lg font-bold mb-3">What's Next?</h3>
          <p className="mb-4">
            Remember: OptiChoice shows you the trade-offs, but you make the final decision. Read reviews, compare specifications, and trust your gut. Good luck!
          </p>
          <button onClick={onNewDecision} className="btn btn-primary bg-white text-[#2c5aa0] hover:bg-gray-100">
            Make Another Decision
          </button>
        </div>
      </div>
    </div>
  );
}
