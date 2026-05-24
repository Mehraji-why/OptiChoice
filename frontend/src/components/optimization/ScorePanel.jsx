// ScorePanel.jsx
// Layer 4 only. Shows utility_score, topsis_closeness, regret_score trio.
// Never visible by default — only rendered inside the advanced detail section.
// Communicates with precision, not intimidation.

function ScoreMetric({ label, value, note, format = 'percent', color = 'rgba(240,236,228,0.5)' }) {
  let display;
  if (format === 'percent') display = `${(value * 100).toFixed(1)}%`;
  else if (format === 'decimal') display = value.toFixed(3);
  else display = value;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '16px',
      background: 'rgba(240,236,228,0.02)',
      border: '1px solid rgba(200,190,170,0.08)',
      borderRadius: '2px',
      flex: 1,
    }}>
      <span style={{
        fontSize: '9px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(240,236,228,0.25)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'monospace',
        fontSize: '22px',
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {display}
      </span>
      {note && (
        <span style={{
          fontSize: '10.5px',
          color: 'rgba(240,236,228,0.28)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
        }}>
          {note}
        </span>
      )}
    </div>
  );
}

export default function ScorePanel({
  utilityScore,
  topsisCloseness,
  regretScore,
  isParetoOptimal,
  paretoFrontierRank,
  dataCompleteness,
}) {
  return (
    <div>
      {/* Score trio */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px',
      }}>
        {utilityScore !== undefined && (
          <ScoreMetric
            label="Utility Score"
            value={utilityScore}
            format="percent"
            color="#c8a96e"
            note="Absolute fit to your priorities"
          />
        )}
        {topsisCloseness !== undefined && (
          <ScoreMetric
            label="TOPSIS Closeness"
            value={topsisCloseness}
            format="percent"
            color="#9eaab8"
            note="Relative position among alternatives"
          />
        )}
        {regretScore !== undefined && (
          <ScoreMetric
            label="Regret Score"
            value={regretScore}
            format="decimal"
            color={regretScore <= 0.04 ? '#8eab96' : regretScore <= 0.12 ? '#a8b89c' : '#b8a898'}
            note="Opportunity cost vs optimal choice"
          />
        )}
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {isParetoOptimal && (
          <span style={{
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8eab96',
            padding: '4px 10px',
            border: '1px solid rgba(142,171,150,0.25)',
            background: 'rgba(142,171,150,0.06)',
            borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Pareto Optimal
          </span>
        )}
        {paretoFrontierRank && (
          <span style={{
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.30)',
            padding: '4px 10px',
            border: '1px solid rgba(200,190,170,0.10)',
            borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Frontier Rank #{paretoFrontierRank}
          </span>
        )}
        {dataCompleteness !== undefined && dataCompleteness < 1 && (
          <span style={{
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.45)',
            padding: '4px 10px',
            border: '1px solid rgba(200,169,110,0.15)',
            borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {Math.round(dataCompleteness * 100)}% Data Coverage
          </span>
        )}
      </div>
    </div>
  );
}
