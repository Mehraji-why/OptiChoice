// RegretLabel.jsx
// Translates regret_score (0–1) into a semantic human-readable badge.
// Never shows raw numbers. Communicates quality of match, not failure.

export function getRegretMeta(regretScore = 0, rankingConfidence = 1) {
  // Translate ranking_confidence into label softness
  let label, color, bg, borderColor;

  if (regretScore <= 0.04) {
    label = rankingConfidence > 0.85 ? 'Best Match' : rankingConfidence > 0.70 ? 'Top Recommendation' : 'Leading Option';
    color = '#8eab96';
    bg = 'rgba(142,171,150,0.10)';
    borderColor = 'rgba(142,171,150,0.25)';
  } else if (regretScore <= 0.12) {
    label = 'Excellent';
    color = '#a8b89c';
    bg = 'rgba(168,184,156,0.08)';
    borderColor = 'rgba(168,184,156,0.22)';
  } else if (regretScore <= 0.22) {
    label = 'Strong Option';
    color = '#c8a96e';
    bg = 'rgba(200,169,110,0.07)';
    borderColor = 'rgba(200,169,110,0.22)';
  } else {
    label = 'Reasonable Compromise';
    color = '#b8a898';
    bg = 'rgba(184,168,152,0.07)';
    borderColor = 'rgba(184,168,152,0.20)';
  }

  return { label, color, bg, borderColor };
}

export default function RegretLabel({ regretScore = 0, rankingConfidence = 1, style = {} }) {
  const { label, color, bg, borderColor } = getRegretMeta(regretScore, rankingConfidence);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: '2px',
      fontSize: '10px',
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      flexShrink: 0,
      ...style,
    }}>
      <span style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: color,
        opacity: 0.8,
        flexShrink: 0,
      }} />
      {label}
    </span>
  );
}
