export default function ResultCard({ rank, option, title, color = 'neutral' }) {
  const colorMap = {
    success: { accent: '#7ae582', glow: 'rgba(122,229,130,0.12)', border: 'rgba(122,229,130,0.2)' },
    warning: { accent: '#f5c518', glow: 'rgba(245,197,24,0.12)',  border: 'rgba(245,197,24,0.2)' },
    danger:  { accent: '#ff7b6b', glow: 'rgba(255,123,107,0.1)',  border: 'rgba(255,123,107,0.18)' },
    neutral: { accent: 'rgba(255,255,255,0.4)', glow: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
  };

  const { accent, glow, border } = colorMap[color] || colorMap.neutral;
  const scorePercent = option?.overall_score ? Math.round(option.overall_score * 100) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&family=DM+Mono:wght@300;400&display=swap');
        .rc-root {
          border-radius: 20px;
          border: 1px solid;
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .rc-root:hover {
          transform: translateY(-2px);
        }
        .rc-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
        }
        .rc-rank {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-family: 'DM Mono', monospace;
        }
        .rc-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .rc-option {
          font-size: 14px;
          font-weight: 300;
          margin-bottom: 16px;
        }
        .rc-score-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .rc-score-bar-track {
          flex: 1;
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }
        .rc-score-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .rc-score-num {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          white-space: nowrap;
        }
        .rc-reason {
          font-size: 13px;
          line-height: 1.75;
          font-weight: 300;
          color: rgba(255,255,255,0.38);
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          white-space: pre-wrap;
        }
        .rc-priorities-title {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 12px;
        }
        .rc-priority-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 12px;
        }
        .rc-priority-row:last-child { border-bottom: none; }
      `}</style>

      <div
        className="rc-root"
        style={{
          background: `rgba(255,255,255,0.025)`,
          borderColor: border,
          boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 0% 0%, ${glow} 0%, transparent 60%)`,
          }}
        />
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
          }}
        />

        <div
          className="rc-rank"
          style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
        >
          <span style={{ fontSize: '13px' }}>
            {color === 'success' ? '★' : color === 'warning' ? '◈' : '#'}
          </span>
          {rank}
        </div>

        <h3 className="rc-title">{title}</h3>
        <p className="rc-option" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {option?.option}
        </p>

        {scorePercent !== null && (
          <div className="rc-score-row">
            <div className="rc-score-bar-track">
              <div
                className="rc-score-bar-fill"
                style={{ width: `${scorePercent}%`, background: `linear-gradient(90deg, ${accent}66, ${accent})` }}
              />
            </div>
            <span className="rc-score-num" style={{ color: accent }}>{scorePercent}%</span>
          </div>
        )}

        {option?.reason && (
          <p className="rc-reason">{option.reason}</p>
        )}

        {Object.entries(option?.priority_scores || {}).length > 0 && (
          <div>
            <p className="rc-priorities-title">Priority Breakdown</p>
            {Object.entries(option.priority_scores).map(([priority, score]) => (
              <div key={priority} className="rc-priority-row">
                <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>{priority}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{score}/10</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
