import { useState } from 'react';
import { languages } from '../i18n';

export default function Navbar({ page, setPage, lang, setLang, text }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const navItems = [
    { key: 'home', label: text.nav_home },
    { key: 'how', label: text.nav_how },
    { key: 'about', label: text.nav_about },
    { key: 'contact', label: text.nav_contact },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)', fontFamily: "'DM Sans',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="text-lg font-bold text-white" style={{ fontFamily: "'DM Serif Display',serif" }}>
          Opti<span style={{ color: '#f5c842' }}>Choice</span>
        </button>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setPage(item.key)} className="text-sm transition-colors"
              style={{ color: page === item.key ? '#f5c842' : 'rgba(255,255,255,0.5)' }}>{item.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setLangOpen(o => !o)} className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.04)' }}>
              {languages[lang]}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 rounded-xl border py-1 z-50 max-h-64 overflow-y-auto"
                style={{ background: '#13131a', borderColor: 'rgba(255,255,255,0.1)', minWidth: '140px' }}>
                {Object.entries(languages).map(([code, name]) => (
                  <button key={code} onClick={() => { setLang(code); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                    style={{ color: lang === code ? '#f5c842' : 'rgba(255,255,255,0.6)' }}>{name}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-white/60 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ background: '#0a0a0f', borderColor: 'rgba(255,255,255,0.06)' }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setPage(item.key); setMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm"
              style={{ color: page === item.key ? '#f5c842' : 'rgba(255,255,255,0.5)' }}>{item.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}
