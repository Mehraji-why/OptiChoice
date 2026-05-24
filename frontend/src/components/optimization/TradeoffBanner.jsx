// TradeoffBanner.jsx
// Renders tradeoff_pressure context above the results list.
// Soft amber for meaningful tension, subtle note for mild tension.
// Tradeoffs are NOT errors — they are informative.

export default function TradeoffBanner({ tradeoffPressure }) {
  if (!tradeoffPressure) return null;

  const { pressure_score = 0, conflict_banner, conflict_axes = [], feasibility_ratio } = tradeoffPressure;

  // Threshold: don't show banner for low tension
  if (pressure_score < 0.25) return null;

  const isHighPressure = pressure_score > 0.55;

  if (!isHighPressure) {
    // Subtle single-line note
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        padding: '10px 0',
        borderBottom: '1px solid rgba(200,190,170,0.07)',
      }}>
        <span style={{
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(200,169,110,0.45)',
          flexShrink: 0,
        }} />
        <p style={{
          fontSize: '11px',
          color: 'rgba(240,236,228,0.32)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.01em',
        }}>
          {conflict_banner || 'Mild tension detected between your priorities — the best available balance is shown.'}
        </p>
      </div>
    );
  }

  // High pressure: prominent gold-left-border card
  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(200,169,110,0.04)',
      border: '1px solid rgba(200,169,110,0.18)',
      borderLeft: '3px solid rgba(200,169,110,0.5)',
      borderRadius: '2px',
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
          <path d="M8 2L14 13H2L8 2Z" stroke="rgba(200,169,110,0.7)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
          <path d="M8 6v3M8 11v1" stroke="rgba(200,169,110,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div>
          <p style={{
            fontSize: '9px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '6px',
          }}>
            Requirement Tension Detected
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(240,236,228,0.50)',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.65,
            letterSpacing: '0.01em',
          }}>
            {conflict_banner || 'Your requirements created competing constraints. The result shown is the optimal compromise available.'}
          </p>

          {conflict_axes.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '10px',
            }}>
              {conflict_axes.map((axis, i) => (
                <span key={i} style={{
                  fontSize: '10px',
                  letterSpacing: '0.10em',
                  color: 'rgba(200,169,110,0.45)',
                  padding: '3px 8px',
                  border: '1px solid rgba(200,169,110,0.15)',
                  borderRadius: '2px',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {axis}
                </span>
              ))}
            </div>
          )}

          {feasibility_ratio !== undefined && feasibility_ratio < 0.5 && (
            <p style={{
              fontSize: '11px',
              color: 'rgba(240,236,228,0.25)',
              fontFamily: "'DM Sans', sans-serif",
              marginTop: '8px',
            }}>
              {Math.round(feasibility_ratio * 100)}% of the catalog matched your constraints — showing the best available within scope.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
