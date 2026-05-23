import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { languages } from '../i18n';

export default function Navbar({ page, setPage, lang, setLang, text }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'home',    label: text.nav_home },
    { key: 'how',     label: text.nav_how },
    { key: 'about',   label: text.nav_about },
    { key: 'contact', label: text.nav_contact },
  ];

  return (
    <motion.nav
      initial={{ y: -4, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        fontFamily: "'DM Sans', sans-serif",
        borderBottom: scrolled
          ? '1px solid rgba(200,190,170,0.12)'
          : '1px solid rgba(200,190,170,0.06)',
        background: scrolled
          ? 'rgba(14,12,10,0.96)'
          : 'rgba(14,12,10,0.72)',
        backdropFilter: 'blur(24px)',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Wordmark */}
        <button
          onClick={() => setPage('home')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'baseline', gap: '1px',
          }}
        >
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em',
            color: '#f0ece4',
          }}>
            Opti
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em',
            color: '#c8a96e',
          }}>
            Choice
          </span>
        </button>

        {/* Desktop nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '36px',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }} className="hidden-mobile">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '11.5px', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: page === item.key ? '#c8a96e' : 'rgba(240,236,228,0.38)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: page === item.key ? 500 : 400,
                padding: '4px 0',
                borderBottom: page === item.key
                  ? '1px solid rgba(200,169,110,0.5)'
                  : '1px solid transparent',
                transition: 'all 0.22s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(o => !o)}
              style={{
                background: 'rgba(240,236,228,0.04)',
                border: '1px solid rgba(240,236,228,0.1)',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px', letterSpacing: '0.1em',
                color: 'rgba(240,236,228,0.45)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              {languages[lang]}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: '#1a1712', border: '1px solid rgba(200,190,170,0.15)',
                    borderRadius: '6px', minWidth: '148px',
                    maxHeight: '260px', overflowY: 'auto',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    zIndex: 100,
                  }}
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '9px 16px',
                        fontSize: '12px', letterSpacing: '0.06em',
                        color: lang === code ? '#c8a96e' : 'rgba(240,236,228,0.5)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'color 0.15s',
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(240,236,228,0.5)', padding: '4px',
              display: 'none',
            }}
            className="show-mobile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {menuOpen
                ? <path d="M18 6L6 18M6 6l12 12" />
                : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderTop: '1px solid rgba(200,190,170,0.08)',
              background: '#0e0c0a',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 32px 24px' }}>
              {navItems.map((item, i) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { setPage(item.key); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 0',
                    fontSize: '13px', letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: page === item.key ? '#c8a96e' : 'rgba(240,236,228,0.4)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    borderBottom: '1px solid rgba(200,190,170,0.06)',
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </motion.nav>
  );
}
