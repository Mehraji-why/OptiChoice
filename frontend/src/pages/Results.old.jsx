import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const strengthsMap = {
  battery:       'Long battery life',
  portability:   'Easy to carry',
  cpu_score:     'Strong processor',
  gpu_score:     'Graphics performance',
  display:       'High-quality display',
  thermals:      'Reliable thermals',
  build_quality: 'Premium build',
  creator_score: 'Creator-ready',
  student_score: 'Student-friendly value',
  gaming_score:  'Gaming-capable',
};

function summarizeStrengths(product) {
  return Object.entries(product.factor_scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([f]) => strengthsMap[f] || f.replace('_', ' '));
}

function summarizeTradeoffs(product) {
  return Object.entries(product.factor_scores || {})
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([f]) => `Less emphasis on ${(strengthsMap[f] || f.replace('_', ' ')).toLowerCase()}`);
}

function whoIsItBestFor(product) {
  const s = product.factor_scores || {};
  if ((s.gaming_score || 0) >= 7) return 'Gamers & high-performance users';
  if ((s.battery || 0) >= 8 && (s.portability || 0) >= 7) return 'Students & frequent travellers';
  if ((s.creator_score || 0) >= 8 || (s.cpu_score || 0) >= 8) return 'Creators & professionals';
  return 'Balanced everyday use';
}

function buildConfidence(product, weights) {
  const total = Object.values(weights || {}).reduce((s, v) => s + v, 0);
  const max = total * 10;
  return Math.min(100, Math.round(((product.composite_score || 0) / Math.max(max, 1)) * 100));
}

// ── Score bar component ──
function ScoreBar({ label, value, max = 10, color = '#c8a96e' }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '10.5px', letterSpacing: '0.12em', color: 'rgba(240,236,228,0.45)', textTransform: 'capitalize' }}>
          {label}
        </span>
        <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'rgba(240,236,228,0.4)' }}>
          {value}/10
        </span>
      </div>
      <div style={{ height: '1px', background: 'rgba(240,236,228,0.06)', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: color }}
        />
      </div>
    </div>
  );
}

// ── "Know More" expandable panel ──
function KnowMorePanel({ product, explanation, confidence }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'none', border: '1px solid rgba(200,190,170,0.12)',
          borderRadius: '2px', padding: '12px 20px',
          cursor: 'pointer', width: '100%',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,169,110,0.35)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(200,190,170,0.12)')}
      >
        <span style={{
          fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#c8a96e', fontFamily: "'DM Sans', sans-serif",
        }}>
          Why this is best for you
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              border: '1px solid rgba(200,190,170,0.08)',
              borderTop: 'none',
              padding: '24px',
              background: 'rgba(240,236,228,0.02)',
            }}>
              <p style={{
                fontSize: '14px', lineHeight: 1.78,
                color: 'rgba(240,236,228,0.55)',
                marginBottom: '24px',
                letterSpacing: '0.01em',
              }}>
                {explanation || `This product scored highest across the factors that matter most for your stated needs. With a ${confidence}% confidence score, the engine identified it as the optimal balance of your priorities.`}
              </p>

              {/* Factor breakdown */}
              {Object.entries(product.factor_scores || {}).length > 0 && (
                <div>
                  <p style={{
                    fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase',
                    color: 'rgba(240,236,228,0.25)', marginBottom: '16px',
                  }}>
                    Score Breakdown
                  </p>
                  {Object.entries(product.factor_scores).map(([k, v]) => (
                    <ScoreBar key={k} label={k.replace('_', ' ')} value={v} />
                  ))}
                </div>
              )}

              {/* Best for */}
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                borderLeft: '2px solid rgba(200,169,110,0.35)',
                background: 'rgba(200,169,110,0.04)',
              }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#c8a96e' }}>
                  Best for: {whoIsItBestFor(product)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Single product card ──
function ProductCard({ product, rank, confidence, explanation, weights, isTop = false }) {
  const strengths = summarizeStrengths(product);
  const tradeoffs = summarizeTradeoffs(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: isTop
          ? '1px solid rgba(200,169,110,0.3)'
          : '1px solid rgba(200,190,170,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '2px',
        background: isTop ? 'rgba(200,169,110,0.03)' : 'transparent',
      }}
    >
      {isTop && (
        <div style={{
          padding: '10px 24px',
          background: '#c8a96e',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{
            fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          }}>
            Best Match
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(14,12,10,0.2)' }} />
          <span style={{
            fontSize: '10px', fontFamily: 'monospace',
            color: 'rgba(14,12,10,0.6)',
          }}>
            {confidence}% confidence
          </span>
        </div>
      )}

      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTop ? '1fr 1fr' : '1fr auto',
          gap: '32px',
          alignItems: 'start',
        }}
          className={isTop ? 'result-top-grid' : ''}
        >
          {/* Left: info */}
          <div>
            {!isTop && (
              <p style={{
                fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase',
                color: 'rgba(240,236,228,0.25)', marginBottom: '10px',
              }}>
                #{rank} Alternative
              </p>
            )}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: isTop ? '2.2rem' : '1.5rem',
              fontWeight: 500, letterSpacing: '-0.02em',
              color: '#f0ece4', marginBottom: '16px',
              lineHeight: 1.1,
            }}>
              {product.name}
            </h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.5rem', fontWeight: 400,
                color: '#c8a96e', letterSpacing: '-0.01em',
              }}>
                ₹{product.price.toLocaleString()}
              </span>
            </div>

            {/* Strengths + tradeoffs */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '16px', marginBottom: isTop ? '0' : '0',
            }}>
              <div>
                <p style={{
                  fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(200,169,110,0.5)', marginBottom: '10px',
                }}>
                  Strengths
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {strengths.map(s => (
                    <li key={s} style={{
                      fontSize: '12.5px', color: 'rgba(240,236,228,0.55)',
                      marginBottom: '7px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#8eab96', flexShrink: 0 }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p style={{
                  fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(180,160,140,0.45)', marginBottom: '10px',
                }}>
                  Tradeoffs
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tradeoffs.map(t => (
                    <li key={t} style={{
                      fontSize: '12.5px', color: 'rgba(240,236,228,0.35)',
                      marginBottom: '7px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(240,236,228,0.2)', flexShrink: 0 }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Affiliate + Know More — only for top or any card */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Affiliate CTA */}
              <a
                href={product.affiliate_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { if (!product.affiliate_link) e.preventDefault(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 24px',
                  background: '#c8a96e',
                  borderRadius: '2px',
                  fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#0e0c0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                View Deal
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Know More */}
            {isTop && (
              <KnowMorePanel
                product={product}
                explanation={explanation}
                confidence={confidence}
              />
            )}
          </div>

          {/* Right: product image */}
          {isTop && (
            <div style={{
              borderRadius: '2px',
              overflow: 'hidden',
              background: 'rgba(240,236,228,0.03)',
              border: '1px solid rgba(200,190,170,0.08)',
            }}>
              <img
                src={product.image || `https://via.placeholder.com/520x320?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'grayscale(15%)',
                }}
              />
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(200,190,170,0.07)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(240,236,228,0.2)', textTransform: 'uppercase' }}>
                  {product.name}
                </span>
                {!isTop && (
                  <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#c8a96e' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Non-top: price badge */}
          {!isTop && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
            }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.3rem', color: '#c8a96e',
              }}>
                ₹{product.price.toLocaleString()}
              </span>
              <span style={{
                fontSize: '10.5px', letterSpacing: '0.1em',
                color: 'rgba(240,236,228,0.28)',
                textAlign: 'right', maxWidth: '140px',
              }}>
                {whoIsItBestFor(product)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Results ──
export default function Results({ results, onNewDecision }) {
  if (!results) return null;

  const topProduct  = results.ranked_products?.[0];
  const alternatives = results.ranked_products?.slice(1) || [];
  const topConf     = buildConfidence(topProduct, results.inferred_weights);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e0c0a',
      fontFamily: "'DM Sans', sans-serif",
      paddingTop: '80px',
    }}>
      {/* Structural grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.018) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '48px 32px 100px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: '56px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
              <span style={{
                fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.55)',
              }}>
                Your tailored recommendation
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 500, letterSpacing: '-0.03em',
              color: '#f0ece4', lineHeight: 1.08,
            }}>
              Best match for your needs.
            </h1>
          </div>

          <motion.button
            onClick={onNewDecision}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'none',
              border: '1px solid rgba(200,190,170,0.14)',
              borderRadius: '2px',
              padding: '12px 22px',
              fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(240,236,228,0.4)',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
              flexShrink: 0, marginTop: '8px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(200,169,110,0.35)';
              e.currentTarget.style.color = '#c8a96e';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,190,170,0.14)';
              e.currentTarget.style.color = 'rgba(240,236,228,0.4)';
            }}
          >
            New Search
          </motion.button>
        </motion.div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, #c8a96e 0%, rgba(200,169,110,0.1) 100%)',
          marginBottom: '40px',
        }} />

        {/* Top product */}
        {topProduct && (
          <ProductCard
            product={topProduct}
            rank={1}
            confidence={topConf}
            explanation={results.explanation}
            weights={results.inferred_weights}
            isTop
          />
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'rgba(240,236,228,0.25)',
              }}>
                Strong Alternatives
              </p>
              <div style={{ flex: 1, height: '1px', background: 'rgba(200,190,170,0.07)' }} />
            </div>

            {alternatives.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                rank={i + 2}
                confidence={buildConfidence(product, results.inferred_weights)}
                weights={results.inferred_weights}
                isTop={false}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .result-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
