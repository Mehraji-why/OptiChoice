import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact({ text }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [focused, setFocused] = useState('');

  const inputStyle = (field) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(240,236,228,0.03)',
    border: focused === field
      ? '1px solid rgba(200,169,110,0.45)'
      : '1px solid rgba(200,190,170,0.1)',
    borderRadius: '2px',
    padding: '14px 18px',
    fontSize: '14px', color: '#f0ece4',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
    letterSpacing: '0.01em',
  });

  return (
    <div style={{
      background: '#0e0c0a',
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      paddingTop: '80px',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto', padding: '64px 32px 120px' }}>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.55)' }}>
              Reach Out
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 500, letterSpacing: '-0.03em',
            color: '#f0ece4', lineHeight: 1.08,
            marginBottom: '16px',
          }}>
            {text?.contact_title || "Let's talk."}
          </h1>

          <p style={{
            fontSize: '14px', lineHeight: 1.72,
            color: 'rgba(240,236,228,0.38)',
            marginBottom: '12px', letterSpacing: '0.01em',
          }}>
            {text?.contact_body || 'Got feedback, a feature idea, or something that felt off? We want to hear it.'}
          </p>

          <a
            href="mailto:mehraprerna68@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', letterSpacing: '0.1em', color: '#c8a96e',
              textDecoration: 'none', marginBottom: '48px',
              transition: 'opacity 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,12 2,6" />
            </svg>
            mehraprerna68@gmail.com
          </a>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(200,169,110,0.35) 0%, rgba(200,190,170,0.05) 100%)',
            marginBottom: '40px',
          }} />
        </motion.div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                border: '1px solid rgba(200,169,110,0.25)',
                padding: '48px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {[['top','left'],['bottom','right']].map(([v,h]) => (
                <div key={v+h} style={{
                  position: 'absolute', [v]: '-1px', [h]: '-1px',
                  width: '14px', height: '14px',
                  borderTop: v==='top' ? '2px solid #c8a96e' : 'none',
                  borderBottom: v==='bottom' ? '2px solid #c8a96e' : 'none',
                  borderLeft: h==='left' ? '2px solid #c8a96e' : 'none',
                  borderRight: h==='right' ? '2px solid #c8a96e' : 'none',
                }} />
              ))}
              <div style={{
                width: '40px', height: '40px',
                border: '1px solid rgba(200,169,110,0.4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.5rem', color: '#f0ece4',
                marginBottom: '8px', letterSpacing: '-0.01em',
              }}>
                Message received.
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(240,236,228,0.3)', letterSpacing: '0.04em' }}>
                We'll get back to you shortly.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={e => { e.preventDefault(); setSent(true); }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {[
                { id: 'name',    label: 'Name',    type: 'text',  ph: 'Your name' },
                { id: 'email',   label: 'Email',   type: 'email', ph: 'your@email.com' },
              ].map(f => (
                <div key={f.id}>
                  <label style={{
                    display: 'block', fontSize: '10px', letterSpacing: '0.26em',
                    textTransform: 'uppercase', color: 'rgba(240,236,228,0.3)',
                    marginBottom: '10px',
                  }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.ph}
                    value={form[f.id]}
                    required
                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                    onFocus={() => setFocused(f.id)}
                    onBlur={() => setFocused('')}
                    style={inputStyle(f.id)}
                  />
                </div>
              ))}
              <div>
                <label style={{
                  display: 'block', fontSize: '10px', letterSpacing: '0.26em',
                  textTransform: 'uppercase', color: 'rgba(240,236,228,0.3)',
                  marginBottom: '10px',
                }}>
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  value={form.message}
                  required
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle('message'), resize: 'vertical' }}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  padding: '16px',
                  background: '#c8a96e',
                  border: 'none', borderRadius: '2px',
                  fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Send Message
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
