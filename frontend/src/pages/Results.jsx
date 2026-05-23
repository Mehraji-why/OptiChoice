const strengthsMap = {
  battery: 'Long battery life',
  portability: 'Easy to carry',
  cpu_score: 'Strong performance',
  gpu_score: 'Great gaming performance',
  display: 'High-quality display',
  thermals: 'Reliable thermals',
  build_quality: 'Premium build quality',
  creator_score: 'Creator-ready performance',
  student_score: 'Student-friendly value',
  gaming_score: 'Gaming ready',
};

function summarizeStrengths(product) {
  const entries = Object.entries(product.factor_scores || {}).sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3).map(([factor]) => strengthsMap[factor] || factor.replace('_', ' '));
}

function summarizeTradeoffs(product) {
  const entries = Object.entries(product.factor_scores || {}).sort((a, b) => a[1] - b[1]);
  return entries.slice(0, 2).map(([factor]) => {
    const label = strengthsMap[factor] || factor.replace('_', ' ');
    return `Less emphasis on ${label.toLowerCase()}`;
  });
}

function whoIsItBestFor(product) {
  const scores = product.factor_scores || {};
  if ((scores.gaming_score || 0) >= 7) return 'Best for gamers and high-performance users';
  if ((scores.battery || 0) >= 8 && (scores.portability || 0) >= 7) return 'Best for students and frequent travelers';
  if ((scores.creator_score || 0) >= 8 || (scores.cpu_score || 0) >= 8) return 'Best for creators and professionals';
  return 'Best for balanced everyday use';
}

function buildConfidence(product, weights) {
  const totalWeight = Object.values(weights || {}).reduce((sum, value) => sum + value, 0);
  const maxScore = totalWeight * 10;
  const score = product.composite_score || 0;
  return Math.min(100, Math.round((score / Math.max(maxScore, 1)) * 100));
}

export default function Results({ results, onNewDecision }) {
  if (!results) return null;

  const topProduct = results.ranked_products?.[0];
  const alternatives = results.ranked_products?.slice(1) || [];
  const topConfidence = buildConfidence(topProduct, results.inferred_weights);

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Your tailored recommendation</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white mt-3">Best match for your needs</h1>
          </div>
          <button onClick={onNewDecision} className="btn btn-secondary px-5 py-3">
            New recommendation
          </button>
        </div>

        <div className="grid gap-6">
          {topProduct && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    🏆 Best Match
                  </div>
                  <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{topProduct.name}</h2>
                  <p className="text-slate-600 dark:text-slate-300">{results.explanation}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-100">Confidence: {topConfidence}%</span>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-100">Price: ₹{topProduct.price.toLocaleString()}</span>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-100">{whoIsItBestFor(topProduct)}</span>
                  </div>
                </div>
                <div className="rounded-[1.75rem] overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={topProduct.image}
                    alt={topProduct.name}
                    className="w-full object-cover h-72"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Key strengths</h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    {summarizeStrengths(topProduct).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Tradeoffs</h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    {summarizeTradeoffs(topProduct).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {alternatives.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Strong alternatives</p>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-2">Other excellent matches worth considering</h2>
                </div>
              </div>

              <div className="grid gap-6">
                {alternatives.map((product, index) => (
                  <div key={product.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">#{index + 2} alternative</span>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                      </div>
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">₹{product.price.toLocaleString()}</div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Strengths</h4>
                        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                          {summarizeStrengths(product).map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Weaknesses</h4>
                        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                          {summarizeTradeoffs(product).map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <strong>Best for:</strong> {whoIsItBestFor(product)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
