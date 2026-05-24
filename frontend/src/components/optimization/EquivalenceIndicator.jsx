// EquivalenceIndicator.jsx
// Renders when is_statistically_equivalent is true.
// Frames equivalence as precision, not failure.
// "These are tied — choose by preference" not "we couldn't decide."

export default function EquivalenceIndicator({
  groupId,
  groupSize = 2,
  compact = false,
  style = {},
}) {
  if (compact) {
    return (
      <span style={{
        fontSize: '9.5px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#9eaab8',
        fontFamily: "'DM Sans', sans-serif",
        ...style,
      }}>
        Tied
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '10px 14px',
      background: 'rgba(158,170,184,0.06)',
      border: '1px solid rgba(158,170,184,0.18)',
      borderLeft: '2px solid rgba(158,170,184,0.35)',
      borderRadius: '2px',
      marginBottom: '8px',
      ...style,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
        <path d="M2 5h10M2 9h10" stroke="#9eaab8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div>
        <p style={{
          fontSize: '11px',
          color: '#9eaab8',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.01em',
          marginBottom: '2px',
        }}>
          {groupSize > 2 ? `These ${groupSize} options` : 'These two options'} are mathematically equivalent for your priorities.
        </p>
        <p style={{
          fontSize: '10.5px',
          color: 'rgba(158,170,184,0.6)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.01em',
        }}>
          The difference falls within the statistical margin — choose by personal preference.
        </p>
      </div>
    </div>
  );
}
