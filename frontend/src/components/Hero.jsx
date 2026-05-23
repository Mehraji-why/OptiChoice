import { useEffect, useRef, useState } from 'react';

const PILLS = [
  'Best laptop for coding under ₹70k',
  'Phone with great camera & battery',
  'Tablet for note-taking & drawing',
];

const STATS = [
  { value: '10+', label: 'Factors Weighed' },
  { value: '100%', label: 'Transparent' },
  { value: '₹', label: 'Budget Smart' },
];

export default function Hero({ onTryNow, text }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    // Orbs
    const orbs = Array.from({ length: 3 }, (_, i) => ({
      x: [0.2, 0.8, 0.5][i] * w,
      y: [0.3, 0.6, 0.15][i] * h,
      r: [320, 260, 200][i],
      dx: [(Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.22][i],
      dy: [(Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.22][i],
      color: ['rgba(245,197,24,', 'rgba(168,216,234,', 'rgba(245,197,24,'][i],
      alpha: [0.055, 0.04, 0.03][i],
    }));

    // Stars
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      alpha: Math.random() * 0.35 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Orbs
      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.color + o.alpha + ')');
        g.addColorStop(1, o.color + '0)');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Stars
      stars.forEach(s => {
        s.twinkle += s.speed;
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  const lines = (text?.hero_title || 'Make the\nRight Choice').split('\n');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .hero-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          overflow: hidden;
          background: #080810;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .hero-grid-fade {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 40%, #080810 85%);
          pointer-events: none;
        }
        .hero-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(245,197,24,0.7);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: fadeUp 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .hero-label::before, .hero-label::after {
          content: '';
          width: 24px;
          height: 1px;
          background: rgba(245,197,24,0.4);
        }
        .hero-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.035em;
          color: #fff;
          text-align: center;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeUp 0.8s 0.2s cubic-bezier(0.4,0,0.2,1) forwards;
          font-size: clamp(3rem, 8vw, 6.5rem);
        }
        .hero-h1 span {
          background: linear-gradient(120deg, #f5c518 20%, #e8b020 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          max-width: 480px;
          line-height: 1.75;
          text-align: center;
          margin-bottom: 40px;
          opacity: 0;
          animation: fadeUp 0.8s 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .hero-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: 44px;
          opacity: 0;
          animation: fadeUp 0.8s 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .pill {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-style: italic;
          font-weight: 300;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.02);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .pill:hover {
          color: rgba(255,255,255,0.6);
          border-color: rgba(245,197,24,0.2);
          background: rgba(245,197,24,0.04);
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #080810;
          background: linear-gradient(135deg, #f5c518, #e8a820);
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 0 0 rgba(245,197,24,0.3), 0 4px 24px rgba(245,197,24,0.2);
          opacity: 0;
          animation: fadeUp 0.8s 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .hero-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 0 6px rgba(245,197,24,0.08), 0 8px 32px rgba(245,197,24,0.3);
        }
        .hero-cta:active { transform: translateY(0) scale(0.99); }
        .hero-cta svg {
          transition: transform 0.25s ease;
        }
        .hero-cta:hover svg { transform: translateX(3px); }
        .hero-stats {
          margin-top: 72px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: center;
          gap: 64px;
          opacity: 0;
          animation: fadeUp 0.8s 0.75s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #f5c518;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-top: 4px;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px 5px 8px;
          border-radius: 100px;
          border: 1px solid rgba(245,197,24,0.2);
          background: rgba(245,197,24,0.06);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: rgba(245,197,24,0.75);
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          opacity: 0;
          animation: fadeUp 0.6s 0s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #f5c518;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>

      <section className="hero-root">
        <div className="hero-grid" />
        <div className="hero-grid-fade" />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '860px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div className="hero-badge">
            <div className="hero-badge-dot" />
            AI-Powered Optimization Engine
          </div>

          <p className="hero-label">{text?.tagline || 'Precision Decision Intelligence'}</p>

          <h1 className="hero-h1">
            {lines[0]}
            {lines[1] && <><br /><span>{lines[1]}</span></>}
          </h1>

          <p className="hero-sub">{text?.hero_sub || 'Describe what you need in plain language. We analyze every factor and surface the best option — with full reasoning.'}</p>

          <div className="hero-pills">
            {PILLS.map(p => (
              <span key={p} className="pill" onClick={onTryNow}>"{p}"</span>
            ))}
          </div>

          <button onClick={onTryNow} className="hero-cta">
            {text?.cta || 'Find My Best Option'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
