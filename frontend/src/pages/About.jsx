import { motion } from 'framer-motion';

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function About({ text }) {
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '64px 32px 120px' }}>

        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
            <span style={{
              fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.55)',
            }}>
              Our Story
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)',
            fontWeight: 500, letterSpacing: '-0.03em',
            color: '#f0ece4', lineHeight: 1.06,
            marginBottom: '32px',
          }}>
            Built for the age of<br />
            <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>too many options.</span>
          </motion.h1>

          {/* Gold rule */}
          <motion.div variants={fadeUp} style={{
            width: '48px', height: '2px',
            background: 'linear-gradient(90deg, #c8a96e, rgba(200,169,110,0.2))',
            marginBottom: '40px',
          }} />
        </motion.div>

        {/* Body text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ marginBottom: '64px' }}
        >
          {[
            'We live in an era where choosing a laptop means opening 24 browser tabs, watching three YouTube reviews, asking three friends, and still feeling unsure. The information exists, but clarity doesn\'t. That gap is what OptiChoice was built to close.',
            'The idea came from a simple frustration: why does making a well-informed decision feel so exhausting? Every comparison site buries you in specs. Every review has a different opinion. Every recommendation feels like it was written for someone else.',
            'OptiChoice is different. You describe what you need in plain language, the way you\'d explain it to a knowledgeable friend, and we do the rest. We read between the lines, infer what actually matters to you, weigh the factors that fit your life, and surface one clear answer with full reasoning.',
          ].map((para, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              style={{
                fontSize: '15px', lineHeight: 1.82,
                color: i === 2 ? 'rgba(240,236,228,0.52)' : 'rgba(240,236,228,0.38)',
                marginBottom: '24px',
                letterSpacing: '0.01em',
              }}
            >
              {para}
            </motion.p>
          ))}

          <motion.blockquote
            variants={fadeUp}
            style={{
              margin: '40px 0',
              padding: '24px 28px',
              borderLeft: '3px solid #c8a96e',
              background: 'rgba(200,169,110,0.04)',
            }}
          >
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.25rem', fontStyle: 'italic',
              color: 'rgba(240,236,228,0.65)', lineHeight: 1.6,
              letterSpacing: '-0.01em',
            }}>
              "Good decisions shouldn't require expertise. They should require honesty about what you need and a system smart enough to listen."
            </p>
          </motion.blockquote>
        </motion.div>

        {/* Founder card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            border: '1px solid rgba(200,190,170,0.12)',
            padding: '32px',
            marginBottom: '64px',
            position: 'relative',
          }}
        >
          {/* Corner marks */}
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

          <p style={{
            fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.5)', marginBottom: '16px',
          }}>
            Founder
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.8rem', fontWeight: 500,
            letterSpacing: '-0.02em', color: '#f0ece4',
            marginBottom: '12px',
          }}>
            Prerna Mehra
          </h2>
          <p style={{
            fontSize: '13.5px', lineHeight: 1.78,
            color: 'rgba(240,236,228,0.38)',
            marginBottom: '20px', letterSpacing: '0.01em',
          }}>
            Prerna built OptiChoice in 2026 out of a personal conviction: the real problem with making decisions isn't lack of information; it's too much of it, poorly organised. She set out to build a tool that thinks the way a smart, unbiased optimizer-advisor would, one that listens first, then recommends.
          </p>
          <a
            href="mailto:mehraprerna68@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', letterSpacing: '0.08em',
              color: '#c8a96e', textDecoration: 'none',
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
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
          }}
        >
          {[['2026', 'Founded'], ['17', 'Languages'], ['6', 'Categories']].map(([v, l]) => (
            <motion.div
              key={l}
              variants={fadeUp}
              style={{
                padding: '28px',
                border: '1px solid rgba(200,190,170,0.08)',
              }}
            >
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '2.4rem', fontWeight: 400,
                color: '#c8a96e', letterSpacing: '-0.03em',
                lineHeight: 1, marginBottom: '8px',
              }}>
                {v}
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(240,236,228,0.25)',
              }}>
                {l}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
