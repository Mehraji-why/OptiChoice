// PriorityHeader.jsx
// The first trust signal. Proves the engine understood the user.
// Shows inferred_weights (top 3), inference_confidence, global_explanation.
// Sits above cards, ambient — not a card itself.

const FACTOR_HUMAN = {
  cpu_score:     'CPU performance',
  gpu_score:     'GPU performance',
  battery:       'Battery life',
  portability:   'Portability',
  display:       'Display quality',
  thermals:      'Thermal reliability',
  build_quality: 'Build quality',
  creator_score: 'Creator capability',
  student_score: 'Student value',
  gaming_score:  'Gaming performance',
  price:         'Value for money',
};

function humanFactor(key) {
  return FACTOR_HUMAN[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function PriorityHeader({
  inferredWeights = {},
  inferenceConfidence = 1,
  globalExplanation,
  feasibilityRatio,
  totalProducts,
  filteredProducts,
}) {
  // Top 3 factors by weight
  const topFactors = Object.entries(inferredWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const totalWeight = topFactors.reduce((s, [, v]) => s + v, 0);
  const hasWeights = topFactors.length > 0;

  return (
    <div style={{ marginBottom: '36px' }}>
      {/* Analysis label */}
      <p style={{
        fontSize: '9.5px',
        letterSpacing: '0.30em',
        textTransform: 'uppercase',
        color: 'rgba(240,236,228,0.22)',
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: '10px',
      }}>
        Analysis Based On
      </p>

      {/* Weighted priorities */}
      {hasWeights && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          {topFactors.map(([factor, weight], i) => {
            const pct = totalWeight > 0
              ? Math.round((weight / totalWeight) * 100)
              : Math.round(weight * 100);

            return (
              <span key={factor} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <span style={{
                  fontSize: '13.5px',
                  color: '#c8a96e',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}>
                  {humanFactor(factor)}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: 'rgba(240,236,228,0.35)',
                  fontFamily: "'DM Sans', sans-serif",
                  marginLeft: '4px',
                }}>
                  ({pct}%)
                </span>
                {i < topFactors.length - 1 && (
                  <span style={{
                    margin: '0 8px',
                    color: 'rgba(240,236,228,0.15)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                  }}>
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Global explanation — first sentence */}
      {globalExplanation && (
        <p style={{
          fontSize: '13.5px',
          color: 'rgba(240,236,228,0.40)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.65,
          maxWidth: '600px',
          marginBottom: '10px',
          letterSpacing: '0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {globalExplanation.split('. ')[0]}.
        </p>
      )}

      {/* Inference confidence footnote */}
      {inferenceConfidence < 0.75 && (
        <p style={{
          fontSize: '11px',
          color: 'rgba(240,236,228,0.22)',
          fontFamily: "'DM Sans', sans-serif",
          fontStyle: 'italic',
          marginBottom: '6px',
        }}>
          {inferenceConfidence < 0.70
            ? 'Your description was partially interpreted — refine your query for more precise results.'
            : 'Some context was inferred from your description.'}
        </p>
      )}

      {/* Feasibility note */}
      {feasibilityRatio !== undefined && feasibilityRatio < 0.5 && (
        <p style={{
          fontSize: '11px',
          color: 'rgba(240,236,228,0.22)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {filteredProducts && totalProducts
            ? `${filteredProducts} of ${totalProducts} products matched your constraints`
            : `Only ${Math.round(feasibilityRatio * 100)}% of the catalog fit your requirements`}
          {' '}— showing the best available within scope.
        </p>
      )}
    </div>
  );
}
