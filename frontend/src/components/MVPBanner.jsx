import { useState } from 'react';

export default function MVPBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes bannerIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }

        .mvp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }

        .mvp-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          z-index: 999;
          width: 90%;
          max-width: 480px;
          animation: bannerIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        .mvp-inner {
          background: #0d0d1a;
          border: 1px solid rgba(245,197,24,0.18);
          border-radius: 24px;
          padding: 32px 36px 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,197,24,0.05);
        }

        .mvp-inner::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 10%, rgba(245,197,24,0.4) 50%, transparent 90%);
        }

        .mvp-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(245,197,24,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .mvp-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mvp-close:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.65);
        }

        .mvp-icon {
          width: 38px; height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,197,24,0.08);
          border: 1px solid rgba(245,197,24,0.15);
          margin-bottom: 18px;
          font-size: 16px;
        }

        .mvp-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: #fff;
          letter-spacing: -0.015em;
          margin-bottom: 10px;
        }

        .mvp-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.72;
          color: rgba(255,255,255,0.38);
          margin-bottom: 20px;
        }

        .mvp-link {
          color: #f5c518;
          opacity: 0.8;
          text-decoration: none;
          transition: opacity 0.2s ease;
          border-bottom: 1px solid rgba(245,197,24,0.3);
          padding-bottom: 1px;
        }
        .mvp-link:hover { opacity: 1; }

        .mvp-dismiss {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 9px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mvp-dismiss:hover {
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.13);
        }

        .mvp-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          margin-bottom: 22px;
        }
        .mvp-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #f5c518;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
      `}</style>

      <div className="mvp-overlay" onClick={() => setVisible(false)} />

      <div className="mvp-banner">
        <div className="mvp-inner">
          <div className="mvp-glow" />

          <button onClick={() => setVisible(false)} className="mvp-close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className="mvp-icon">🛠</div>

          <div className="mvp-status">
            <div className="mvp-status-dot" />
            Early Access Build
          </div>

          <h2 className="mvp-title">You're looking at an early build.</h2>
          <p className="mvp-body">
            OptiChoice is a work in progress which can only be used now for laptop discovery: the core engine is live, but a lot more is coming. Got a feature you'd want? A category we're missing? Something that felt off?{' '}
            <a href="mailto:mehraprerna68@gmail.com" className="mvp-link">
              Tell us directly.
            </a>
          </p>

          <button onClick={() => setVisible(false)} className="mvp-dismiss">
            Got it — continue
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
