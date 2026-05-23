import { motion } from 'framer-motion';
import Hero from '../components/Hero';

const CATEGORIES = [
  { label: 'Electronics',     sub: 'Laptops, phones, tablets, TVs',    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=85' },
  { label: 'Home & Living',   sub: 'Appliances, furniture, decor',      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=85' },
  { label: 'Study & Work',    sub: 'Stationery, tools, software',        img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&q=85' },
  { label: 'Health & Fitness',sub: 'Gear, supplements, wearables',       img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=85' },
  { label: 'Travel',          sub: 'Luggage, accessories, cameras',      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85' },
  { label: 'Finance',         sub: 'Cards, investments, plans',          img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=85' },
];

const STEPS = [
  { n: '01', title: 'Describe your need', body: 'Speak plainly. "Best laptop for college under ₹60k" is enough. Natural language is the interface.' },
  { n: '02', title: 'We extract priorities', body: 'The engine reads intent, maps signals to measurable factors, infers what actually matters to you.' },
  { n: '03', title: 'One answer surfaces', body: 'A ranked recommendation with confidence, strengths, tradeoffs, and full reasoning. No hedging.' },
];

const stagger = {
  visible: { transition: { staggerChildren: 0.09 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home({ onNavigateToForm, text }) {
  return (
    <div style={{ background: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>
      <Hero onTryNow={onNavigateToForm} text={text} />

      {/* ── Categories ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '112px 32px 80px' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} style={{
            fontSize: '10px', letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)', marginBottom: '12px',
          }}>
            Explore
          </motion.p>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500,
            letterSpacing: '-0.025em', color: '#f0ece4',
            marginBottom: '56px', lineHeight: 1.1,
          }}>
            {text?.categories_title || 'Find the right fit, by category.'}
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2px',
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              variants={fadeUp}
              onClick={onNavigateToForm}
              whileHover="hover"
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                background: '#1a1712',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* Image */}
              <motion.img
                src={cat.img}
                alt={cat.label}
                variants={{
                  hover: { scale: 1.06, filter: 'grayscale(0%)' },
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(25%)',
                  transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), filter 0.4s',
                }}
              />
              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(14,12,10,0.88) 0%, rgba(14,12,10,0.2) 55%, transparent 100%)',
              }} />
              {/* Hover tint */}
              <motion.div
                variants={{ hover: { opacity: 1 } }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(200,169,110,0.06)',
                }}
              />

              {/* Text */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '20px', fontWeight: 500,
                  color: '#f0ece4', marginBottom: '4px',
                  letterSpacing: '-0.01em',
                }}>
                  {cat.label}
                </p>
                <p style={{
                  fontSize: '11px', letterSpacing: '0.08em',
                  color: 'rgba(240,236,228,0.38)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {cat.sub}
                </p>
              </div>

              {/* Arrow */}
              <motion.div
                variants={{ hover: { opacity: 1, x: 0 } }}
                initial={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: 'absolute', top: '20px', right: '20px',
                  width: '32px', height: '32px',
                  border: '1px solid rgba(200,169,110,0.5)',
                  borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* ── Process ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 128px' }}>
        <div style={{
          border: '1px solid rgba(200,190,170,0.1)',
          padding: '72px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Corner accents */}
          {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
            <div key={v+h} style={{
              position: 'absolute',
              [v]: '-1px', [h]: '-1px',
              width: '20px', height: '20px',
              borderTop: v === 'top' ? '2px solid #c8a96e' : 'none',
              borderBottom: v === 'bottom' ? '2px solid #c8a96e' : 'none',
              borderLeft: h === 'left' ? '2px solid #c8a96e' : 'none',
              borderRight: h === 'right' ? '2px solid #c8a96e' : 'none',
            }} />
          ))}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} style={{
              fontSize: '10px', letterSpacing: '0.32em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.55)', marginBottom: '12px',
            }}>
              Process
            </motion.p>
            <motion.h2 variants={fadeUp} style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 500,
              letterSpacing: '-0.025em', color: '#f0ece4',
              marginBottom: '64px', lineHeight: 1.1,
            }}>
              {text?.how_title || 'How the engine works.'}
            </motion.h2>
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
                  padding: '0 40px 0 0',
                  borderRight: i < STEPS.length - 1
                    ? '1px solid rgba(200,190,170,0.08)'
                    : 'none',
                  marginRight: i < STEPS.length - 1 ? '40px' : 0,
                }}
              >
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '52px', fontWeight: 300,
                  color: 'rgba(200,169,110,0.12)',
                  lineHeight: 1, marginBottom: '20px',
                  letterSpacing: '-0.04em',
                }}>
                  {step.n}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '19px', fontWeight: 500,
                  color: '#f0ece4', marginBottom: '12px',
                  letterSpacing: '-0.01em',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '13.5px', lineHeight: 1.72,
                  color: 'rgba(240,236,228,0.38)',
                  letterSpacing: '0.01em',
                }}>
                  {step.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
