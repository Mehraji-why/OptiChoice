// SensitivityPanel.jsx
// Renders global_sensitivity suggestions as action cards.
// Shows when marginal_utility_gain > 0.05 AND confidence > 0.5.
// Desktop: 3-col horizontal. Mobile: stacked.

function SensitivityCard({ suggestion, index }) {
  const {
    variable_type,
    description,
    consequence,
    marginal_utility_gain,
    confidence = 1,
  } = suggestion;

  // Infer type label
  const typeLabel = variable_type?.toUpperCase() || 'SUGGESTION';
  const showConfidence = confidence < 0.8;

  return (
    <div style={{
      padding: '20px',
      background: 'rgba(200,169,110,0.03)',
      border: '1px solid rgba(200,169,110,0.15)',
      borderRadius: '2px',
      flex: 1,
      minWidth: 0,
    }}>
      {/* Type label */}
      <p style={{
        fontSize: '9px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(200,169,110,0.55)',
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: '10px',
      }}>
        {typeLabel}
      </p>

      {/* Main suggestion */}
      <p style={{
        fontSize: '14px',
        color: '#f0ece4',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.5,
        marginBottom: '8px',
        letterSpacing: '0.01em',
      }}>
        {description}
      </p>

      {/* Consequence */}
      {consequence && (
        <p style={{
          fontSize: '12.5px',
          color: 'rgba(240,236,228,0.42)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.55,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '5px',
        }}>
          <span style={{ color: 'rgba(200,169,110,0.45)', flexShrink: 0 }}>→</span>
          {consequence}
        </p>
      )}

      {/* Confidence indicator */}
      {showConfidence && (
        <p style={{
          fontSize: '10px',
          color: 'rgba(240,236,228,0.20)',
          fontFamily: "'DM Sans', sans-serif",
          marginTop: '12px',
          letterSpacing: '0.05em',
        }}>
          Estimated improvement
        </p>
      )}
    </div>
  );
}

export default function SensitivityPanel({ globalSensitivity = [] }) {
  // Filter meaningful suggestions
  const suggestions = globalSensitivity
    .filter(s => (s.marginal_utility_gain || 0) > 0.05 && (s.confidence || 1) > 0.5)
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: '52px' }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <p style={{
          fontSize: '9.5px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(240,236,228,0.25)',
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}>
          Optimization Opportunities
        </p>
        <div style={{ flex: 1, height: '1px', background: 'rgba(200,190,170,0.07)' }} />
      </div>

      <p style={{
        fontSize: '12.5px',
        color: 'rgba(240,236,228,0.30)',
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: '16px',
        lineHeight: 1.6,
      }}>
        Small adjustments to your requirements could meaningfully improve the match quality.
      </p>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}
        className="sensitivity-cards"
      >
        {suggestions.map((s, i) => (
          <SensitivityCard key={i} suggestion={s} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sensitivity-cards {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
