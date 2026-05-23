import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Subtle scanline / grain texture via SVG data URI
const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function ThinRuler() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px',
    }}>
      <div style={{ width: '40px', height: '1px', background: '#c8a96e', opacity: 0.7 }} />
      <span style={{
        fontSize: '10px', letterSpacing: '0.32em', textTransform: 'uppercase',
        color: 'rgba(200,169,110,0.7)', fontFamily: "'DM Sans', sans-serif",
      }}>
        Optimization Engine
      </span>
    </div>
  );
}

export default function Hero({ onTryNow, text }) {
  const canvasRef = useRef(null);
  const [typed, setTyped] = useState(0);
  const headline = text?.hero_title || 'The best choice\nfor your needs';
  const lines = headline.split('\n');

  // Subtle floating grid points — warm platinum, not neon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 38 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.22 + 0.04,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,169,110,${p.a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  // Stagger counter on mount
  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setTyped(n => {
          if (n >= 3) { clearInterval(interval); return n; }
          return n + 1;
        });
      }, 280);
      return () => clearInterval(interval);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const EXAMPLES = [
    'Best laptop for coding under ₹70k',
    'Phone with great camera & battery',
    'Tablet for note-taking and drawing',
  ];

  const STATS = [
    { v: '10+', l: 'Factors Analysed' },
    { v: '100%', l: 'Transparent' },
    { v: '₹', l: 'Budget-Aware' },
  ];

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        overflow: 'hidden',
        background: '#0e0c0a',
      }}
    >
      {/* Background layers */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: NOISE_BG,
        backgroundRepeat: 'repeat',
        pointerEvents: 'none',
        opacity: 0.5,
      }} />
      {/* Structural grid — very faint */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      {/* Warm radial depth */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '700px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(200,169,110,0.055) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      {/* Horizontal rule accent — top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.4) 50%, transparent 100%)',
      }} />

      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '860px', width: '100%',
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <ThinRuler />

          {/* Main headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(3rem, 8vw, 6.4rem)',
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            color: '#f0ece4',
            marginBottom: '28px',
          }}>
            {lines[0]}
            <br />
            <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>
              {lines[1]}
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'rgba(240,236,228,0.42)',
            lineHeight: 1.72,
            maxWidth: '480px',
            marginBottom: '44px',
            letterSpacing: '0.01em',
          }}>
            {text?.hero_sub}
          </p>

          {/* Example chips */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '10px',
            marginBottom: '48px',
          }}>
            {EXAMPLES.map((ex, i) => (
              <motion.button
                key={ex}
                onClick={onTryNow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: typed > i ? 1 : 0, y: typed > i ? 0 : 8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ borderColor: 'rgba(200,169,110,0.4)', color: 'rgba(240,236,228,0.6)' }}
                style={{
                  background: 'rgba(200,190,170,0.04)',
                  border: '1px solid rgba(200,190,170,0.12)',
                  borderRadius: '2px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: 'rgba(240,236,228,0.32)',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                "{ex}"
              </motion.button>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            onClick={onTryNow}
            whileHover={{ scale: 1.02, letterSpacing: '0.18em' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 40px',
              background: '#c8a96e',
              border: 'none',
              borderRadius: '2px',
              color: '#0e0c0a',
              fontSize: '11.5px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: '0 8px 32px rgba(200,169,110,0.18)',
            }}
          >
            {text?.cta || 'Find My Best Option'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={{
            marginTop: '80px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(200,190,170,0.08)',
            display: 'flex',
            gap: '56px',
          }}
        >
          {STATS.map(({ v, l }) => (
            <div key={l}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '28px', fontWeight: 500,
                color: '#c8a96e', letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: '6px',
              }}>{v}</div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase',
                color: 'rgba(240,236,228,0.25)',
                fontFamily: "'DM Sans', sans-serif",
              }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
