import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'You describe your need',
    body: 'No forms, no dropdowns, no checkboxes. Type what you want the way you would say it out loud. "Best laptop for college under ₹60k" is enough. Natural language is the interface.',
    note: 'The more honest you are about your use case, the sharper the recommendation.',
  },
  {
    n: '02',
    title: 'We extract what matters',
    body: 'The engine reads your words and infers real priorities — budget cues, use-case hints, lifestyle context — and maps them to measurable factors: battery life, performance, portability, build quality.',
    note: 'You never have to rank or weight anything manually unless you want to.',
  },
  {
    n: '03',
    title: 'Every option is scored',
    body: 'Each product in the catalogue is evaluated against your inferred priorities. The same product can rank differently for different people. That is the point.',
    note: 'A student prioritising battery gets very different scoring than a gamer needing GPU power.',
  },
  {
    n: '04',
    title: 'One clear answer surfaces',
    body: 'You receive a ranked recommendation with a confidence score, key strengths, honest tradeoffs, and strong alternatives. No hedging. One best option for your situation, explained plainly.',
    note: 'If the top pick has a meaningful weakness for your case, we say so.',
  },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function HowItWorks() {
  return (
    <div style={{
      background: '#0e0c0a',
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      paddingTop: '80px',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '64px 32px 120px' }}>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
            <span style={{
              fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.55)',
            }}>
              The Process
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 500, letterSpacing: '-0.03em',
            color: '#f0ece4', lineHeight: 1.08,
            marginBottom: '20px',
          }}>
            How OptiChoice works.
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: '15px', lineHeight: 1.76,
            color: 'rgba(240,236,228,0.38)',
            maxWidth: '540px', marginBottom: '72px',
            letterSpacing: '0.01em',
          }}>
            Most recommendation tools ask you to do the thinking. OptiChoice does it for you.
            Here is exactly what happens from the moment you type to the moment you decide.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div>
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: '32px',
                marginBottom: '0',
              }}
            >
              {/* Number + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '44px', height: '44px',
                  border: '1px solid rgba(200,169,110,0.25)',
                  borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(200,169,110,0.04)',
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '15px', fontWeight: 500,
                    color: '#c8a96e', letterSpacing: '-0.01em',
                  }}>
                    {step.n}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: '1px', flex: 1,
                    background: 'linear-gradient(to bottom, rgba(200,169,110,0.2) 0%, rgba(200,169,110,0.04) 100%)',
                    minHeight: '60px', marginTop: '8px',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: i < steps.length - 1 ? '56px' : '0' }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.5rem', fontWeight: 500,
                  letterSpacing: '-0.015em', color: '#f0ece4',
                  marginBottom: '12px', marginTop: '10px',
                }}>
                  {step.title}
                </h2>
                <p style={{
                  fontSize: '14px', lineHeight: 1.78,
                  color: 'rgba(240,236,228,0.42)',
                  marginBottom: '16px', letterSpacing: '0.01em',
                }}>
                  {step.body}
                </p>
                <div style={{
                  padding: '12px 16px',
                  borderLeft: '2px solid rgba(200,169,110,0.25)',
                  background: 'rgba(200,169,110,0.03)',
                }}>
                  <p style={{
                    fontSize: '12px', lineHeight: 1.68,
                    color: 'rgba(240,236,228,0.3)',
                    letterSpacing: '0.02em',
                  }}>
                    {step.note}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            marginTop: '72px',
            border: '1px solid rgba(200,190,170,0.1)',
            padding: '48px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Corner marks */}
          {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
            <div key={v+h} style={{
              position: 'absolute', [v]: '-1px', [h]: '-1px',
              width: '16px', height: '16px',
              borderTop: v==='top' ? '2px solid #c8a96e' : 'none',
              borderBottom: v==='bottom' ? '2px solid #c8a96e' : 'none',
              borderLeft: h==='left' ? '2px solid #c8a96e' : 'none',
              borderRight: h==='right' ? '2px solid #c8a96e' : 'none',
            }} />
          ))}
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.8rem', fontWeight: 500,
            color: '#f0ece4', marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Ready to try it?
          </p>
          <p style={{
            fontSize: '13px', color: 'rgba(240,236,228,0.3)',
            marginBottom: '28px', letterSpacing: '0.04em',
          }}>
            One sentence is all it takes.
          </p>
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.scrollTo(0, 0); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '14px 36px',
              background: '#c8a96e', borderRadius: '2px',
              fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Find My Best Option
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
