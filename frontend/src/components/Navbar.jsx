import { useState, useEffect } from 'react';
import { languages } from '../i18n';

export default function Navbar({ page, setPage, lang, setLang, text }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'home', label: text.nav_home },
    { key: 'how', label: text.nav_how },
    { key: 'about', label: text.nav_about },
    { key: 'contact', label: text.nav_contact },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-link {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.04em;
          transition: color 0.25s ease;
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #f5c518;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-link.active::after,
        .nav-link:hover::after { width: 100%; }
        .lang-btn {
          transition: all 0.2s ease;
        }
        .lang-btn:hover {
          background: rgba(245,197,24,0.08) !important;
          border-color: rgba(245,197,24,0.3) !important;
          color: #f5c518 !important;
        }
        .mobile-menu-enter {
          animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .logo-glow:hover { text-shadow: 0 0 20px rgba(245,197,24,0.4); }
      `}</style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          fontFamily: "'DM Sans', sans-serif",
          background: scrolled
            ? 'rgba(8,8,16,0.92)'
            : 'rgba(8,8,16,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(245,197,24,0.08)'
            : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <button
            onClick={() => setPage('home')}
            className="logo-glow"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: '18px',
              color: '#fff',
              letterSpacing: '-0.02em',
              transition: 'text-shadow 0.3s ease',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Opti<span style={{ color: '#f5c518' }}>Choice</span>
          </button>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`nav-link ${page === item.key ? 'active' : ''}`}
                style={{
                  color: page === item.key ? '#f5c518' : 'rgba(255,255,255,0.45)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
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
                className="lang-btn"
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  letterSpacing: '0.04em',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {languages[lang]}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: langOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#0e0e1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '6px',
                  zIndex: 200,
                  minWidth: '150px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}>
                  {Object.entries(languages).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: lang === code ? '#f5c518' : 'rgba(255,255,255,0.55)',
                        background: lang === code ? 'rgba(245,197,24,0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { if (lang !== code) e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (lang !== code) e.target.style.background = 'transparent'; }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'none',
                color: 'rgba(255,255,255,0.6)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
              className="show-mobile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {menuOpen
                  ? <path d="M18 6L6 18M6 6l12 12"/>
                  : <path d="M4 7h16M4 12h16M4 17h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="mobile-menu-enter"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(8,8,16,0.98)',
              padding: '16px 24px 20px',
            }}
          >
            {navItems.map((item, i) => (
              <button
                key={item.key}
                onClick={() => { setPage(item.key); setMenuOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 0',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: page === item.key ? '#f5c518' : 'rgba(255,255,255,0.5)',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < navItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
