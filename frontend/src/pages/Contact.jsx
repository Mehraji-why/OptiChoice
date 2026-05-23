export default function About({ text }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .about-root {
          background: #080810;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-top: 80px;
          overflow: hidden;
          position: relative;
        }
        .about-ambient {
          position: fixed;
          top: -100px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245,197,24,0.035) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .about-inner {
          position: relative;
          z-index: 1;
          max-width: 740px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }
        .about-eyebrow {
          font-size: 10px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 16px;
          font-family: 'DM Sans', sans-serif;
        }
        .about-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 5vw, 4rem);
          letter-spacing: -0.035em;
          color: #fff;
          line-height: 1.05;
          margin-bottom: 28px;
        }
        .about-rule {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 48px;
        }
        .about-body {
          font-size: 16px;
          line-height: 1.82;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          margin-bottom: 24px;
        }
        .about-body-highlight {
          color: rgba(255,255,255,0.62);
        }
        /* Founder card */
        .founder-card {
          border-radius: 22px;
          padding: 36px;
          background: rgba(245,197,24,0.03);
          border: 1px solid rgba(245,197,24,0.1);
          margin: 56px 0;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .founder-card:hover { border-color: rgba(245,197,24,0.18); }
        .founder-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,197,24,0.25), transparent);
        }
        .founder-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(245,197,24,0.45);
          margin-bottom: 10px;
          font-family: 'DM Sans', sans-serif;
        }
        .founder-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .founder-bio {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.35);
          margin-bottom: 20px;
          font-weight: 300;
        }
        .founder-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #f5c518;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .founder-link:hover { opacity: 1; }
        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          border-radius: 18px;
          padding: 28px 24px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
        }
        .stat-number {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          color: #f5c518;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="about-root">
        <div className="about-ambient" />
        <div className="about-inner">

          <p className="about-eyebrow">Our story</p>
          <h1 className="about-h1">Built for the age<br />of too many options.</h1>
          <div className="about-rule" />

          <p className="about-body">
            We live in an era where choosing a laptop means opening 24 browser tabs, watching three YouTube reviews, asking three friends, and still feeling unsure. The information exists — but clarity doesn't. That gap is what OptiChoice was built to close.
          </p>
          <p className="about-body">
            The idea came from a simple frustration: why does making a well-informed decision feel so exhausting? Every comparison site buries you in specs. Every review has a different opinion. Every recommendation feels like it was written for someone else.
          </p>
          <p className="about-body">
            OptiChoice is different. You describe what you need in plain language — the way you'd explain it to a knowledgeable friend — and we do the rest. We read between the lines, infer what actually matters to you, weigh the factors that fit your life, and surface one clear answer with full reasoning.{' '}
            <span className="about-body-highlight">No spreadsheets. No tab overload. No second-guessing.</span>
          </p>
          <p className="about-body">
            We believe that good decisions shouldn't require expertise. They should require honesty about what you need — and a system smart enough to listen.
          </p>

          {/* Founder */}
          <div className="founder-card">
            <p className="founder-eyebrow">Founder</p>
            <h2 className="founder-name">Prerna Mehra</h2>
            <p className="founder-bio">
              Prerna built OptiChoice in 2026 out of a personal conviction: that the real problem with buying decisions isn't lack of information — it's too much of it, poorly organized. She set out to build a tool that thinks the way a smart, unbiased advisor would — one that listens first, then recommends.
            </p>
            <a href="mailto:mehraprerna68@gmail.com" className="founder-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,12 2,6"/>
              </svg>
              mehraprerna68@gmail.com
            </a>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[['2026','Founded'],['17','Languages'],['6','Categories']].map(([v, l]) => (
              <div key={l} className="stat-card">
                <div className="stat-number">{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
