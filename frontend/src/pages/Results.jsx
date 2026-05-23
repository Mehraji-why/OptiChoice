const strengthsMap = {
  battery:       'Long battery life',
  portability:   'Easy to carry',
  cpu_score:     'Strong performance',
  gpu_score:     'Great gaming performance',
  display:       'High-quality display',
  thermals:      'Reliable thermals',
  build_quality: 'Premium build quality',
  creator_score: 'Creator-ready performance',
  student_score: 'Student-friendly value',
  gaming_score:  'Gaming ready',
};

function summarizeStrengths(product) {
  return Object.entries(product.factor_scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([f]) => strengthsMap[f] || f.replace('_', ' '));
}
function summarizeTradeoffs(product) {
  return Object.entries(product.factor_scores || {})
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([f]) => `Less emphasis on ${(strengthsMap[f] || f.replace('_', ' ')).toLowerCase()}`);
}
function whoIsItBestFor(product) {
  const s = product.factor_scores || {};
  if ((s.gaming_score || 0) >= 7) return 'Gamers & high-performance users';
  if ((s.battery || 0) >= 8 && (s.portability || 0) >= 7) return 'Students & frequent travelers';
  if ((s.creator_score || 0) >= 8 || (s.cpu_score || 0) >= 8) return 'Creators & professionals';
  return 'Balanced everyday use';
}
function buildConfidence(product, weights) {
  const totalWeight = Object.values(weights || {}).reduce((s, v) => s + v, 0);
  const maxScore = totalWeight * 10;
  return Math.min(100, Math.round(((product.composite_score || 0) / Math.max(maxScore, 1)) * 100));
}

function ScoreBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.45)' }}>{value?.toFixed(1)}</span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, rgba(245,197,24,0.5), #f5c518)', borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

export default function Results({ results, onNewDecision }) {
  if (!results) return null;

  const topProduct  = results.ranked_products?.[0];
  const alternatives = results.ranked_products?.slice(1) || [];
  const topConfidence = buildConfidence(topProduct, results.inferred_weights);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@300;400&display=swap');

        .results-root {
          min-height: 100vh;
          background: #080810;
          padding: 100px 24px 80px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .results-ambient {
          position: fixed;
          top: -200px;
          right: -100px;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 65%);
          pointer-events: none;
        }
        .results-inner { max-width: 1080px; margin: 0 auto; position: relative; z-index: 1; }
        .results-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 56px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .results-eyebrow {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 10px;
        }
        .results-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 4vw, 3rem);
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .new-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          letter-spacing: 0.06em;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 6px;
        }
        .new-btn:hover {
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.07);
        }
        /* Hero card */
        .hero-card {
          border-radius: 24px;
          border: 1px solid rgba(245,197,24,0.12);
          background: rgba(245,197,24,0.025);
          padding: 40px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,197,24,0.3), transparent);
        }
        .best-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(245,197,24,0.1);
          border: 1px solid rgba(245,197,24,0.2);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f5c518;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 18px;
        }
        .hero-product-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .hero-explanation {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          margin-bottom: 24px;
          max-width: 600px;
        }
        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }
        .hero-tag {
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 8px;
        }
        @media (max-width: 600px) { .hero-grid { grid-template-columns: 1fr; } }
        .info-panel {
          border-radius: 16px;
          padding: 24px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .info-panel-title {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 16px;
          font-family: 'DM Sans', sans-serif;
        }
        .strength-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 10px;
          font-weight: 300;
        }
        .strength-item::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #7ae582;
          flex-shrink: 0;
        }
        .tradeoff-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 10px;
          font-weight: 300;
        }
        .tradeoff-item::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,165,100,0.7);
          flex-shrink: 0;
        }
        /* Alternatives */
        .alt-header {
          border-radius: 18px;
          padding: 28px 32px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 14px;
        }
        .alt-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 6px;
        }
        .alt-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: rgba(255,255,255,0.75);
          letter-spacing: -0.015em;
        }
        .alt-card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 28px 32px;
          margin-bottom: 12px;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .alt-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
        }
        .alt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .alt-rank {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 6px;
          font-family: 'DM Mono', monospace;
        }
        .alt-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.02em;
        }
        .alt-price {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          padding: 8px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
        }
        .alt-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }
        @media (max-width: 560px) { .alt-panels { grid-template-columns: 1fr; } }
        .best-for-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 10px;
          background: rgba(168,216,234,0.04);
          border: 1px solid rgba(168,216,234,0.1);
          font-size: 12px;
          color: rgba(168,216,234,0.6);
          font-family: 'DM Sans', sans-serif;
        }
        .confidence-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="results-root">
        <div className="results-ambient" />
        <div className="results-inner">

          {/* Header */}
          <div className="results-topbar">
            <div>
              <p className="results-eyebrow">Your tailored recommendation</p>
              <h1 className="results-h1">Best match for your needs</h1>
            </div>
            <button onClick={onNewDecision} className="new-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              New Recommendation
            </button>
          </div>

          {/* Top pick */}
          {topProduct && (
            <div className="hero-card">
              <div className="best-badge">
                <span>★</span> Best Match
              </div>
              <h2 className="hero-product-name">{topProduct.name}</h2>
              <p className="hero-explanation">{results.explanation}</p>

              <div className="hero-tags">
                <span className="hero-tag">Confidence {topConfidence}%</span>
                <span className="hero-tag">₹{topProduct.price?.toLocaleString()}</span>
                <span className="hero-tag">{whoIsItBestFor(topProduct)}</span>
              </div>

              {/* Scores */}
              {topProduct.factor_scores && (
                <div style={{ marginBottom: '24px' }}>
                  <p className="info-panel-title" style={{ marginBottom: '12px' }}>Score Breakdown</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0 32px' }}>
                    {Object.entries(topProduct.factor_scores).map(([k, v]) => (
                      <ScoreBar key={k} label={strengthsMap[k] || k} value={v} />
                    ))}
                  </div>
                </div>
              )}

              <div className="hero-grid">
                <div className="info-panel">
                  <p className="info-panel-title">Key Strengths</p>
                  {summarizeStrengths(topProduct).map(s => (
                    <div key={s} className="strength-item">{s}</div>
                  ))}
                </div>
                <div className="info-panel">
                  <p className="info-panel-title">Tradeoffs</p>
                  {summarizeTradeoffs(topProduct).map(t => (
                    <div key={t} className="tradeoff-item">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div className="alt-header">
                <p className="alt-eyebrow">Strong alternatives</p>
                <h2 className="alt-title">Other excellent matches worth considering</h2>
              </div>

              {alternatives.map((product, index) => (
                <div key={product.id} className="alt-card">
                  <div className="alt-card-header">
                    <div>
                      <p className="alt-rank">#{index + 2} Alternative</p>
                      <h3 className="alt-name">{product.name}</h3>
                    </div>
                    <span className="alt-price">₹{product.price?.toLocaleString()}</span>
                  </div>

                  <div className="alt-panels">
                    <div className="info-panel">
                      <p className="info-panel-title">Strengths</p>
                      {summarizeStrengths(product).map(s => (
                        <div key={s} className="strength-item">{s}</div>
                      ))}
                    </div>
                    <div className="info-panel">
                      <p className="info-panel-title">Weaknesses</p>
                      {summarizeTradeoffs(product).map(t => (
                        <div key={t} className="tradeoff-item">{t}</div>
                      ))}
                    </div>
                  </div>

                  <div className="best-for-tag">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Best for: {whoIsItBestFor(product)}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
