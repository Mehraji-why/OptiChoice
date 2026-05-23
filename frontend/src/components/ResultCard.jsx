// ResultCard.jsx
// Legacy compatibility shim — the main results logic now lives in Results.jsx
// This component is kept for backward compatibility if referenced elsewhere.

export default function ResultCard({ rank, option, title, color = 'neutral' }) {
  const accentColor = {
    success: '#8eab96',
    warning: '#c8a96e',
    danger:  '#b88080',
    neutral: 'rgba(240,236,228,0.3)',
  }[color];

  return (
    <div style={{
      border: `1px solid ${accentColor}40`,
      borderRadius: '2px',
      padding: '28px',
      background: '#0e0c0a',
      fontFamily: "'DM Sans', sans-serif",
      marginBottom: '2px',
    }}>
      {/* Rank badge */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{
          fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase',
          color: accentColor, border: `1px solid ${accentColor}50`,
          padding: '4px 12px', borderRadius: '1px',
        }}>
          {rank}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '1.5rem', fontWeight: 500,
        letterSpacing: '-0.02em', color: '#f0ece4',
        marginBottom: '16px',
      }}>
        {title}
      </h3>

      <div style={{
        background: 'rgba(240,236,228,0.03)',
        border: '1px solid rgba(200,190,170,0.08)',
        padding: '16px',
        borderRadius: '2px',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(240,236,228,0.45)', marginBottom: '8px' }}>
          <span style={{ color: 'rgba(240,236,228,0.25)', letterSpacing: '0.1em', fontSize: '10px', textTransform: 'uppercase' }}>Option — </span>
          {option.option}
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(240,236,228,0.45)', marginBottom: '8px' }}>
          <span style={{ color: 'rgba(240,236,228,0.25)', letterSpacing: '0.1em', fontSize: '10px', textTransform: 'uppercase' }}>Score — </span>
          {(option.overall_score * 100).toFixed(1)}%
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(240,236,228,0.4)', lineHeight: 1.72, whiteSpace: 'pre-wrap' }}>
          <span style={{ color: 'rgba(240,236,228,0.25)', letterSpacing: '0.1em', fontSize: '10px', textTransform: 'uppercase' }}>Reasoning — </span>
          {option.reason}
        </p>
      </div>

      {Object.entries(option.priority_scores || {}).length > 0 && (
        <div>
          <p style={{
            fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.25)', marginBottom: '12px',
          }}>
            Priority Breakdown
          </p>
          {Object.entries(option.priority_scores).map(([priority, score]) => (
            <div key={priority} style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '8px', alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(240,236,228,0.38)', textTransform: 'capitalize' }}>
                {priority}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: accentColor }}>
                {score}/10
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
