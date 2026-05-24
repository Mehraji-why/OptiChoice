// ContributorPills.jsx
// Renders positive_contributors and penalty_contributors from backend.
// Uses proportional sizing for positive pills, muted treatment for penalties.
// No raw numbers exposed in Layer 2.

const FACTOR_LABELS = {
  cpu_score:     'CPU Performance',
  gpu_score:     'GPU Performance',
  battery:       'Battery Life',
  portability:   'Portability',
  display:       'Display Quality',
  thermals:      'Thermal Management',
  build_quality: 'Build Quality',
  creator_score: 'Creator Capability',
  student_score: 'Student Value',
  gaming_score:  'Gaming Performance',
  price:         'Value for Money',
};

const FACTOR_COLORS = {
  cpu_score:     '#c8a96e',
  gpu_score:     '#b8a898',
  battery:       '#8eab96',
  portability:   '#9eaab8',
  display:       '#b0a8b8',
  thermals:      '#a8a090',
  build_quality: '#a8b0a0',
  creator_score: '#b8a878',
  student_score: '#9eb8a8',
  gaming_score:  '#b89898',
  price:         '#a8b898',
};

function humanLabel(factor) {
  return FACTOR_LABELS[factor] || factor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function factorColor(factor) {
  return FACTOR_COLORS[factor] || 'rgba(240,236,228,0.4)';
}

// Positive contributor pill — sized by relative magnitude
function PositivePill({ factor, magnitude, maxMagnitude }) {
  const color = factorColor(factor);
  const opacity = 0.55 + (magnitude / maxMagnitude) * 0.45;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 10px',
      background: `${color}12`,
      border: `1px solid ${color}30`,
      borderRadius: '2px',
      fontSize: '11.5px',
      color: color,
      opacity,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.02em',
      flexShrink: 0,
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M4 7V1M1 4l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {humanLabel(factor)}
    </span>
  );
}

// Penalty note — muted, not alarming
function PenaltyNote({ factor, reason }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 0',
      borderBottom: '1px solid rgba(200,190,170,0.06)',
    }}>
      <span style={{
        width: '3px',
        height: '3px',
        borderRadius: '50%',
        background: 'rgba(184,160,144,0.5)',
        flexShrink: 0,
        marginTop: '6px',
      }} />
      <div>
        <span style={{
          fontSize: '11px',
          color: 'rgba(240,236,228,0.35)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.01em',
        }}>
          <span style={{ color: '#b8a090' }}>{humanLabel(factor)}</span>
          {reason ? ` — ${reason}` : ' scored below your priority threshold'}
        </span>
      </div>
    </div>
  );
}

// Interaction effect — real-world synergy/conflict
function InteractionNote({ event }) {
  const isPositive = event.effect > 0;
  const color = isPositive ? '#8eab96' : '#b8a090';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 0',
      borderBottom: '1px solid rgba(200,190,170,0.06)',
    }}>
      <span style={{
        fontSize: '9px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
        flexShrink: 0,
        marginTop: '1px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isPositive ? 'Synergy' : 'Tension'}
      </span>
      <span style={{
        fontSize: '11px',
        color: 'rgba(240,236,228,0.40)',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.6,
      }}>
        {event.description || event.event}
      </span>
    </div>
  );
}

export default function ContributorPills({
  positiveContributors = [],
  penaltyContributors = [],
  interactionsFired = [],
}) {
  const maxMag = Math.max(...positiveContributors.map(c => c.magnitude || 1), 1);

  return (
    <div>
      {/* Positive contributors */}
      {positiveContributors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '9.5px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.22)',
            marginBottom: '10px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Top Contributors
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {positiveContributors.map((c, i) => (
              <PositivePill
                key={i}
                factor={c.factor}
                magnitude={c.magnitude || 1}
                maxMagnitude={maxMag}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interaction effects */}
      {interactionsFired.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '9.5px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.22)',
            marginBottom: '8px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Detected Effects
          </p>
          {interactionsFired.map((event, i) => (
            <InteractionNote key={i} event={event} />
          ))}
        </div>
      )}

      {/* Penalty contributors */}
      {penaltyContributors.length > 0 && (
        <div>
          <p style={{
            fontSize: '9.5px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.22)',
            marginBottom: '8px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Where It Falls Short
          </p>
          {penaltyContributors.map((c, i) => (
            <PenaltyNote key={i} factor={c.factor} reason={c.reason} />
          ))}
        </div>
      )}
    </div>
  );
}
