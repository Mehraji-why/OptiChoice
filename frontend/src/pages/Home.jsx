import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';

const CATEGORIES = [
  {
    label: 'Electronics',
    sub: 'Laptops · Phones · Tablets',
    tag: 'LIVE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    metric: '10+ factors',
    metricSub: 'analysed per device',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=85',
  },
  {
    label: 'Home & Living',
    sub: 'Appliances · Furniture · Decor',
    tag: 'SOON',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    metric: 'Pareto filtered',
    metricSub: 'no dominated options',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=85',
  },
  {
    label: 'Study & Work',
    sub: 'Stationery · Tools · Software',
    tag: 'SOON',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
    metric: 'TOPSIS ranked',
    metricSub: 'distance-from-ideal',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&q=85',
  },
  {
    label: 'Health & Fitness',
    sub: 'Gear · Supplements · Wearables',
    tag: 'SOON',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    metric: 'Regret-minimised',
    metricSub: 'opportunity cost scored',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=85',
  },
  {
    label: 'Travel',
    sub: 'Luggage · Accessories · Cameras',
    tag: 'SOON',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    metric: 'Budget-aware',
    metricSub: 'quadratic penalty model',
    img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85',
  },
  {
    label: 'Finance',
    sub: 'Cards · Investments · Plans',
    tag: 'SOON',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    metric: 'Utility curves',
    metricSub: 'perception-calibrated',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=85',
  },
];

const MANIFESTO_LINES = [
  { quote: 'Utility is not a number. It is the distance between what you need and what exists.', author: 'Optimization Principle' },
  { quote: 'Pareto efficiency: no option should be chosen if another dominates it on every dimension.', author: 'Vilfredo Pareto, 1896' },
  { quote: 'The best decision is not the highest score — it is the lowest regret.', author: 'Decision Theory' },
  { quote: 'Constraints are not limitations. They are the shape of the problem.', author: 'Operations Research' },
  { quote: 'TOPSIS: measure not what is best in isolation, but what is closest to ideal under pressure.', author: 'Hwang & Yoon, 1981' },
  { quote: 'The engine infers what you value. Mathematics finds what satisfies it.', author: 'OptiChoice Engine' },
];

const STEPS = [
  {
    n: '01',
    title: 'Semantic Inference',
    body: 'Your language is parsed into a structured preference model — inferred weights, hard constraints, tradeoff tolerance. Not a keyword search. Intent extraction.',
    tech: 'NLP → PreferenceModel',
  },
  {
    n: '02',
    title: 'Deterministic Optimisation',
    body: 'Eight mathematical subsystems run in sequence: normalisation, interaction effects, utility computation, Pareto filtering, TOPSIS ranking, regret analysis.',
    tech: 'TOPSIS · Pareto · Utility',
  },
  {
    n: '03',
    title: 'Explainable Result',
    body: 'Every recommendation traces back to a mathematical reason. You see the dominant contributors, penalties, interaction effects, and what would change the answer.',
    tech: 'Confidence · Tradeoffs · Sensitivity',
  },
];

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

// ── Rotating manifesto quote ──
function ManifestoRotator() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MANIFESTO_LINES.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = MANIFESTO_LINES[idx];

  return (
    <div style={{
      borderLeft: '2px solid rgba(200,169,110,0.3)',
      paddingLeft: '24px',
      minHeight: '72px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontStyle: 'italic',
              color: 'rgba(240,236,228,0.72)',
              lineHeight: 1.55,
              marginBottom: '10px',
              letterSpacing: '0.01em',
            }}>
              "{current.quote}"
            </p>
            <span style={{
              fontSize: '9.5px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.5)',
            }}>
              — {current.author}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Category card ──
function CategoryCard({ cat, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const isLive = cat.tag === 'LIVE';

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isLive ? onClick : undefined}
      style={{
        position: 'relative',
        border: hovered && isLive
          ? '1px solid rgba(200,169,110,0.35)'
          : '1px solid rgba(200,190,170,0.08)',
        background: hovered && isLive ? 'rgba(200,169,110,0.03)' : 'rgba(14,12,10,0.6)',
        cursor: isLive ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      }}
    >
      {/* Image layer */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${cat.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: hovered && isLive ? 0.06 : 0.03,
        transition: 'opacity 0.4s ease',
        filter: 'grayscale(60%)',
      }} />

      <div style={{ position: 'relative', padding: '28px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{
            width: '38px', height: '38px',
            border: `1px solid ${isLive ? 'rgba(200,169,110,0.25)' : 'rgba(200,190,170,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isLive ? '#c8a96e' : 'rgba(240,236,228,0.2)',
          }}>
            {cat.icon}
          </div>
          <span style={{
            fontSize: '8.5px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: isLive ? '#c8a96e' : 'rgba(240,236,228,0.2)',
            border: `1px solid ${isLive ? 'rgba(200,169,110,0.3)' : 'rgba(200,190,170,0.1)'}`,
            padding: '4px 8px',
          }}>
            {cat.tag}
          </span>
        </div>

        {/* Label */}
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '22px',
          fontWeight: 500,
          color: isLive ? '#f0ece4' : 'rgba(240,236,228,0.35)',
          marginBottom: '6px',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}>
          {cat.label}
        </h3>
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.06em',
          color: isLive ? 'rgba(240,236,228,0.38)' : 'rgba(240,236,228,0.18)',
          marginBottom: '24px',
        }}>
          {cat.sub}
        </p>

        {/* Metric */}
        <div style={{
          paddingTop: '18px',
          borderTop: '1px solid rgba(200,190,170,0.07)',
        }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            color: isLive ? '#c8a96e' : 'rgba(240,236,228,0.18)',
            marginBottom: '3px',
            fontFamily: 'monospace',
          }}>
            {cat.metric}
          </div>
          <div style={{
            fontSize: '9.5px',
            letterSpacing: '0.14em',
            color: isLive ? 'rgba(240,236,228,0.28)' : 'rgba(240,236,228,0.12)',
            textTransform: 'uppercase',
          }}>
            {cat.metricSub}
          </div>
        </div>

        {/* Arrow for live */}
        {isLive && (
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: '28px', right: '28px',
              display: hovered ? 'flex' : 'none',
              alignItems: 'center', gap: '6px',
              fontSize: '9.5px', letterSpacing: '0.2em',
              color: '#c8a96e', textTransform: 'uppercase',
            }}
          >
            Optimise
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Home({ onNavigateToForm, text }) {
  return (
    <div style={{ background: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>
      <Hero onTryNow={onNavigateToForm} text={text} />

      {/* ── Manifesto strip ── */}
      <div style={{
        borderTop: '1px solid rgba(200,190,170,0.07)',
        borderBottom: '1px solid rgba(200,190,170,0.07)',
        background: 'rgba(200,169,110,0.015)',
        padding: '40px 0',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
          <ManifestoRotator />
        </div>
      </div>

      {/* ── Categories ── */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '100px 32px 80px' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px',
          }}>
            <div style={{ width: '28px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
            <span style={{
              fontSize: '9.5px', letterSpacing: '0.34em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.55)',
            }}>
              Decision domains
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: '#f0ece4',
            marginBottom: '12px',
            lineHeight: 1.08,
          }}>
            Every category. One engine.
          </motion.h2>
          <motion.p variants={fadeUp} style={{
            fontSize: '14px',
            color: 'rgba(240,236,228,0.38)',
            maxWidth: '520px',
            lineHeight: 1.7,
            marginBottom: '56px',
            letterSpacing: '0.01em',
          }}>
            The same deterministic optimisation core — TOPSIS, Pareto filtering, regret analysis — 
            adapted per domain. One approach. Infinitely extensible.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1px',
            background: 'rgba(200,190,170,0.06)',
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} onClick={onNavigateToForm} index={i} />
          ))}
        </motion.div>

        {/* Engine axiom below grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            marginTop: '2px',
            padding: '20px 28px',
            background: 'rgba(200,169,110,0.03)',
            border: '1px solid rgba(200,169,110,0.12)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div style={{
            width: '6px', height: '6px',
            background: '#8eab96',
            borderRadius: '50%',
            flexShrink: 0,
          }} />
          <p style={{
            fontSize: '11.5px',
            color: 'rgba(240,236,228,0.32)',
            letterSpacing: '0.06em',
            lineHeight: 1.6,
          }}>
            Electronics is live. All other categories are in the optimisation pipeline — 
            the engine architecture is domain-agnostic and expanding.
          </p>
        </motion.div>
      </section>

      {/* ── Process ── */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px 140px' }}>
        <div style={{
          position: 'relative',
          border: '1px solid rgba(200,190,170,0.1)',
          overflow: 'hidden',
        }}>
          {/* Faint background radial */}
          <div style={{
            position: 'absolute',
            top: '-40%', right: '-10%',
            width: '500px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(200,169,110,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Corner accents */}
          {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
            <div key={v+h} style={{
              position: 'absolute',
              [v]: '-1px', [h]: '-1px',
              width: '18px', height: '18px',
              borderTop: v === 'top' ? '2px solid rgba(200,169,110,0.6)' : 'none',
              borderBottom: v === 'bottom' ? '2px solid rgba(200,169,110,0.6)' : 'none',
              borderLeft: h === 'left' ? '2px solid rgba(200,169,110,0.6)' : 'none',
              borderRight: h === 'right' ? '2px solid rgba(200,169,110,0.6)' : 'none',
            }} />
          ))}

          <div style={{ padding: '72px 64px' }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} style={{
                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px',
              }}>
                <div style={{ width: '28px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
                <span style={{
                  fontSize: '9.5px', letterSpacing: '0.34em', textTransform: 'uppercase',
                  color: 'rgba(200,169,110,0.55)',
                }}>
                  Architecture
                </span>
              </motion.div>

              <motion.h2 variants={fadeUp} style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
                color: '#f0ece4',
                marginBottom: '8px',
                lineHeight: 1.1,
              }}>
                AI interprets. Mathematics decides.
              </motion.h2>
              <motion.p variants={fadeUp} style={{
                fontSize: '14px',
                color: 'rgba(240,236,228,0.35)',
                maxWidth: '480px',
                lineHeight: 1.7,
                marginBottom: '64px',
                letterSpacing: '0.01em',
              }}>
                Language models handle only two things: reading your intent, and explaining the result. 
                Every ranking in between is deterministic.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0',
              }}
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  style={{
                    padding: i < STEPS.length - 1 ? '0 48px 0 0' : '0',
                    borderRight: i < STEPS.length - 1
                      ? '1px solid rgba(200,190,170,0.08)'
                      : 'none',
                    marginRight: i < STEPS.length - 1 ? '48px' : 0,
                  }}
                >
                  <div style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '56px',
                    fontWeight: 300,
                    color: 'rgba(200,169,110,0.1)',
                    lineHeight: 1,
                    marginBottom: '24px',
                    letterSpacing: '-0.04em',
                  }}>
                    {step.n}
                  </div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#f0ece4',
                    marginBottom: '12px',
                    letterSpacing: '-0.01em',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '13.5px',
                    lineHeight: 1.74,
                    color: 'rgba(240,236,228,0.42)',
                    letterSpacing: '0.01em',
                    marginBottom: '20px',
                  }}>
                    {step.body}
                  </p>
                  {/* Tech tag */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    border: '1px solid rgba(200,169,110,0.15)',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    color: 'rgba(200,169,110,0.5)',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}>
                    <div style={{
                      width: '4px', height: '4px',
                      background: '#c8a96e',
                      opacity: 0.6,
                    }} />
                    {step.tech}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .cat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
