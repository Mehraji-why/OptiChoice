// ContributionBars.jsx
// Layer 4 only. Factor contribution bars with animation.
// Shows factor_scores or positive_contributors as a full breakdown.

import { motion } from 'framer-motion';

const FACTOR_LABELS = {
  cpu_score:     'CPU',
  gpu_score:     'GPU',
  battery:       'Battery',
  portability:   'Portability',
  display:       'Display',
  thermals:      'Thermals',
  build_quality: 'Build',
  creator_score: 'Creator',
  student_score: 'Student',
  gaming_score:  'Gaming',
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
};

function Bar({ label, value, max = 10, color, index }) {
  const pct = Math.min(100, (value / max) * 100);
  const abbr = FACTOR_LABELS[label] || label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const barColor = color || FACTOR_COLORS[label] || 'rgba(200,169,110,0.6)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr 40px',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <span style={{
        fontSize: '10.5px',
        letterSpacing: '0.06em',
        color: 'rgba(240,236,228,0.38)',
        fontFamily: "'DM Sans', sans-serif",
        textAlign: 'right',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {abbr}
      </span>

      <div style={{
        height: '2px',
        background: 'rgba(240,236,228,0.06)',
        borderRadius: '1px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: barColor,
            borderRadius: '1px',
          }}
        />
      </div>

      <span style={{
        fontSize: '10px',
        fontFamily: 'monospace',
        color: 'rgba(240,236,228,0.28)',
        textAlign: 'right',
      }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </span>
    </motion.div>
  );
}

export default function ContributionBars({ factorScores = {}, contributionData = [] }) {
  // Use contributionData if available (from backend), else fall back to factorScores
  const entries = contributionData.length > 0
    ? contributionData.map(c => [c.factor, c.magnitude || c.value || 0])
    : Object.entries(factorScores);

  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(([, v]) => v), 10);

  return (
    <div>
      <p style={{
        fontSize: '9.5px',
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: 'rgba(240,236,228,0.20)',
        marginBottom: '16px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Factor Breakdown
      </p>
      {entries.map(([factor, value], i) => (
        <Bar
          key={factor}
          label={factor}
          value={value}
          max={max}
          index={i}
        />
      ))}
    </div>
  );
}
