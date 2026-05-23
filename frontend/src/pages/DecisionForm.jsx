import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnalysis } from '../api/client';

const PLACEHOLDERS = [
  'Best laptop for coding under ₹70k',
  'Phone with great camera and battery',
  'Laptop for gaming and college',
  'Best tablet for note taking',
];

const DEFAULT_FACTORS = {
  cpu_score:     0.24,
  gpu_score:     0.16,
  battery:       0.20,
  portability:   0.18,
  display:       0.12,
  thermals:      0.06,
  build_quality: 0.04,
};

// Refined palette — no neon, all mineral
const FACTOR_META = {
  cpu_score:     { label: 'CPU',         abbr: 'PROC', color: '#c8a96e' },
  gpu_score:     { label: 'GPU',         abbr: 'GPU',  color: '#b8a898' },
  battery:       { label: 'Battery',     abbr: 'BATT', color: '#8eab96' },
  portability:   { label: 'Portability', abbr: 'PORT', color: '#9eaab8' },
  display:       { label: 'Display',     abbr: 'DISP', color: '#b8a0a0' },
  thermals:      { label: 'Thermals',    abbr: 'THRM', color: '#a8a090' },
  build_quality: { label: 'Build',       abbr: 'BILD', color: '#a8b0a0' },
};

const PRODUCTS = [
  { id:1, name:'Lenovo LOQ 15',    price:72000, cpu_score:8.8, gpu_score:8.5, battery:5.5, portability:4.5, display:7.5, thermals:8.2, build_quality:7.0, creator_score:7.8, student_score:6.5, gaming_score:9.0, image:'https://via.placeholder.com/520x320?text=Lenovo+LOQ+15' },
  { id:2, name:'ASUS Vivobook 15', price:58000, cpu_score:7.2, gpu_score:4.5, battery:8.4, portability:8.0, display:7.0, thermals:6.8, build_quality:7.5, weight:1.7, creator_score:6.2, student_score:9.0, gaming_score:4.0, image:'https://via.placeholder.com/520x320?text=ASUS+Vivobook+15' },
  { id:3, name:'MacBook Air M2',   price:95000, cpu_score:9.0, gpu_score:6.8, battery:9.8, portability:9.5, display:9.2, thermals:9.1, build_quality:9.5, weight:1.24, creator_score:9.0, student_score:9.5, gaming_score:3.5, image:'https://via.placeholder.com/520x320?text=MacBook+Air+M2' },
  { id:4, name:'HP Victus',        price:68000, cpu_score:8.1, gpu_score:8.0, battery:5.8, portability:5.0, display:7.3, thermals:7.8, build_quality:6.8, weight:2.3, creator_score:7.0, student_score:6.0, gaming_score:8.5, image:'https://via.placeholder.com/520x320?text=HP+Victus' },
  { id:5, name:'Acer Aspire Lite', price:42000, cpu_score:6.0, gpu_score:3.0, battery:7.2, portability:7.8, display:6.2, thermals:6.0, build_quality:6.1, weight:1.6, creator_score:4.8, student_score:8.2, gaming_score:2.5, image:'https://via.placeholder.com/520x320?text=Acer+Aspire+Lite' },
];

function extractBudget(text) {
  const m = text.match(/₹\s*([0-9,]+)/) || text.match(/rs\.?\s*([0-9,]+)/i) || text.match(/([0-9]{4,6})/);
  if (!m) return 70000;
  return parseInt(m[1].replace(/,/g, ''), 10) || 70000;
}

function FactorBar({ factor, value, onChange }) {
  const meta = FACTOR_META[factor];
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <span style={{
          fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
          color: meta.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        }}>
          {meta.abbr}
        </span>
        <span style={{
          fontSize: '10px', fontFamily: 'monospace',
          color: 'rgba(240,236,228,0.35)',
        }}>
          {Math.round(value * 100)}
        </span>
      </div>
      {/* Track */}
      <div style={{
        position: 'relative', height: '2px',
        background: 'rgba(240,236,228,0.06)',
        borderRadius: '1px', marginBottom: '6px',
      }}>
        <motion.div
          style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            background: meta.color,
            borderRadius: '1px',
          }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.12 }}
        />
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={e => onChange(factor, e.target.value)}
        style={{
          width: '100%',
          appearance: 'none', WebkitAppearance: 'none',
          background: 'transparent',
          cursor: 'pointer',
          height: '2px',
          accentColor: meta.color,
        }}
        aria-label={meta.label}
      />
    </div>
  );
}

export default function DecisionForm({ onResultsReady, onBackHome }) {
  const [query, setQuery] = useState('');
  const [pIdx, setPIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [factors, setFactors] = useState(DEFAULT_FACTORS);
  const [constraints, setConstraints] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setPIdx(i => (i + 1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(iv);
  }, []);

  const budget = useMemo(() => extractBudget(query), [query]);

  const handleSlider = (factor, val) => {
    setFactors(prev => ({ ...prev, [factor]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!query.trim()) { setError('Please describe what you need.'); return; }
    setLoading(true);
    try {
      const res = await submitAnalysis({
        user_needs: query.trim(),
        budget,
        factors,
        products: PRODUCTS,
        constraints: constraints.trim() ? [constraints.trim()] : undefined,
      });
      onResultsReady(res);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = Object.values(factors).reduce((a, b) => a + b, 0);

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
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '56px' }}>
          <motion.button
            onClick={onBackHome}
            whileHover={{ x: -2 }}
            transition={{ duration: 0.18 }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(240,236,228,0.3)', fontFamily: "'DM Sans', sans-serif",
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            fontSize: '10.5px', letterSpacing: '0.2em',
            color: 'rgba(240,236,228,0.28)',
          }}>
            {query.length > 0 && (
              <span style={{ color: '#c8a96e' }}>
                ₹{budget.toLocaleString()}
              </span>
            )}
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#8eab96', display: 'inline-block',
            }} />
            <span>OPTICHOICE v1.0</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          alignItems: 'start',
        }}
          className="form-grid"
        >
          {/* ── LEFT: Form ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
                <span style={{
                  fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: 'rgba(200,169,110,0.6)',
                }}>
                  Decision Engine
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 500, lineHeight: 1.08,
                letterSpacing: '-0.03em', color: '#f0ece4',
                marginBottom: '10px',
              }}>
                Tell us what<br />
                <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>you need.</span>
              </h1>
              <p style={{
                fontSize: '13.5px', color: 'rgba(240,236,228,0.35)',
                lineHeight: 1.68, letterSpacing: '0.02em',
              }}>
                Describe your use case. We infer priorities and rank options precisely.
              </p>
            </div>

            {/* Query input */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'rgba(240,236,228,0.3)',
                marginBottom: '12px',
              }}>
                Your Need
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={4}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={PLACEHOLDERS[pIdx]}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(240,236,228,0.03)',
                    border: focused
                      ? '1px solid rgba(200,169,110,0.5)'
                      : '1px solid rgba(200,190,170,0.1)',
                    borderRadius: '2px',
                    padding: '18px 20px',
                    fontSize: '15px', lineHeight: 1.6,
                    color: '#f0ece4',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: '12px', right: '16px',
                  fontSize: '10px', color: 'rgba(240,236,228,0.18)',
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace',
                }}>
                  {query.length}
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'rgba(240,236,228,0.3)',
                marginBottom: '12px',
              }}>
                Hard Constraints
                <span style={{ marginLeft: '8px', color: 'rgba(240,236,228,0.18)', fontWeight: 300 }}>
                  — Optional
                </span>
              </label>
              <textarea
                rows={2}
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                placeholder="e.g. must be under 1.7 kg, must have 512 GB storage"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(240,236,228,0.02)',
                  border: '1px solid rgba(200,190,170,0.08)',
                  borderRadius: '2px',
                  padding: '14px 18px',
                  fontSize: '13.5px', color: 'rgba(240,236,228,0.5)',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(200,169,110,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(200,190,170,0.08)')}
              />
            </div>

            {/* Factor sliders (collapsed section) */}
            <div style={{
              border: '1px solid rgba(200,190,170,0.08)',
              borderRadius: '2px',
              marginBottom: '32px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(200,190,170,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{
                  fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase',
                  color: 'rgba(240,236,228,0.3)',
                }}>
                  Priority Weights
                </p>
                <span style={{
                  fontSize: '10px', letterSpacing: '0.12em',
                  color: 'rgba(240,236,228,0.18)',
                }}>
                  Drag to tune
                </span>
              </div>
              <div style={{
                padding: '20px',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px 32px',
              }}>
                {Object.entries(factors).map(([factor, value]) => (
                  <FactorBar
                    key={factor}
                    factor={factor}
                    value={value}
                    onChange={handleSlider}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    border: '1px solid rgba(180,100,90,0.3)',
                    background: 'rgba(180,100,90,0.06)',
                    borderRadius: '2px',
                    padding: '12px 16px',
                    fontSize: '12.5px', color: '#c08888',
                    marginBottom: '20px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                width: '100%',
                padding: '18px',
                background: loading ? 'rgba(200,169,110,0.08)' : '#c8a96e',
                border: loading ? '1px solid rgba(200,169,110,0.25)' : 'none',
                borderRadius: '2px',
                color: loading ? 'rgba(200,169,110,0.4)' : '#0e0c0a',
                fontSize: '11.5px', letterSpacing: '0.24em', textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '14px' }}
                  >
                    ◌
                  </motion.span>
                  Analysing
                </>
              ) : (
                <>
                  Find My Best Option
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* ── RIGHT: Live weight panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'sticky',
              top: '96px',
              border: '1px solid rgba(200,190,170,0.1)',
              borderRadius: '2px',
              padding: '24px',
            }}
          >
            <p style={{
              fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.55)', marginBottom: '24px',
            }}>
              Weight Analysis
            </p>

            <div style={{ marginBottom: '24px' }}>
              {Object.entries(factors)
                .sort((a, b) => b[1] - a[1])
                .map(([factor, value]) => {
                  const meta = FACTOR_META[factor];
                  return (
                    <div key={factor} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '14px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{
                            fontSize: '10px', letterSpacing: '0.18em',
                            color: meta.color, textTransform: 'uppercase',
                          }}>
                            {meta.label}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(240,236,228,0.3)', fontFamily: 'monospace' }}>
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                        <div style={{
                          height: '1px', background: 'rgba(240,236,228,0.06)',
                          position: 'relative',
                        }}>
                          <motion.div
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'absolute', left: 0, top: 0,
                              height: '100%', background: meta.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ borderTop: '1px solid rgba(200,190,170,0.08)', paddingTop: '16px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(240,236,228,0.25)', textTransform: 'uppercase' }}>
                  Total
                </span>
                <span style={{
                  fontSize: '12px', fontFamily: 'monospace',
                  color: totalWeight > 1.01 ? '#c08888' : '#8eab96',
                }}>
                  {totalWeight.toFixed(2)}
                </span>
              </div>
              {totalWeight > 1.01 && (
                <p style={{ fontSize: '11px', color: '#c08888', letterSpacing: '0.06em' }}>
                  Weights exceed 1.0 — engine will normalise.
                </p>
              )}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '14px',
              background: 'rgba(240,236,228,0.02)',
              borderLeft: '2px solid rgba(200,169,110,0.25)',
            }}>
              <p style={{ fontSize: '10.5px', color: 'rgba(240,236,228,0.28)', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                Your prompt → engine infers context → weights applied → products ranked by composite score.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
