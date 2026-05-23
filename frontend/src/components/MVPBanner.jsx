import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MVPBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            maxWidth: '380px',
            width: 'calc(100vw - 48px)',
          }}
        >
          <div style={{
            background: '#1a1712',
            border: '1px solid rgba(200,169,110,0.22)',
            padding: '20px 24px',
            position: 'relative',
          }}>
            {/* Corner accents */}
            {[['top','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{
                position: 'absolute', [v]: '-1px', [h]: '-1px',
                width: '10px', height: '10px',
                borderTop: v==='top' ? '1.5px solid #c8a96e' : 'none',
                borderBottom: v==='bottom' ? '1.5px solid #c8a96e' : 'none',
                borderLeft: h==='left' ? '1.5px solid #c8a96e' : 'none',
                borderRight: h==='right' ? '1.5px solid #c8a96e' : 'none',
              }} />
            ))}

            {/* Close */}
            <button
              onClick={() => setVisible(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(240,236,228,0.3)', padding: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,236,228,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,236,228,0.3)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{ display: 'flex', gap: '14px', paddingRight: '20px' }}>
              <div style={{
                width: '28px', height: '28px',
                border: '1px solid rgba(200,169,110,0.25)',
                flexShrink: 0, marginTop: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '14px', fontWeight: 500,
                  color: '#f0ece4', marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}>
                  Early build — search for laptops only.
                </p>
                <p style={{
                  fontSize: '12px', lineHeight: 1.68,
                  color: 'rgba(240,236,228,0.35)',
                  letterSpacing: '0.02em',
                }}>
                  The core engine is live. More categories and features are coming.
                  Got feedback?{' '}
                  <a
                    href="mailto:mehraprerna68@gmail.com"
                    style={{ color: '#c8a96e', textDecoration: 'none', borderBottom: '1px solid rgba(200,169,110,0.35)' }}
                  >
                    Tell us directly.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
