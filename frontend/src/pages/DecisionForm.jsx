import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnalysis } from '../api/client';

const PLACEHOLDERS = [
  'Best laptop for coding under ₹70k',
  'Phone with great camera and battery under ₹40k',
  'Laptop for gaming and college under ₹80k',
  'Best tablet for note taking and drawing',
  'Lightweight laptop for travel under ₹65k',
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

const FACTOR_META = {
  cpu_score:     { label: 'Processing Power', abbr: 'CPU',  color: '#c8a96e', desc: 'Raw compute speed' },
  gpu_score:     { label: 'Graphics',          abbr: 'GPU',  color: '#b8a898', desc: 'Gaming & visuals' },
  battery:       { label: 'Battery Life',      abbr: 'BATT', color: '#8eab96', desc: 'Hours of use' },
  portability:   { label: 'Portability',       abbr: 'PORT', color: '#9eaab8', desc: 'Weight & form' },
  display:       { label: 'Display Quality',   abbr: 'DISP', color: '#c0a8b8', desc: 'Panel & resolution' },
  thermals:      { label: 'Thermal Mgmt',      abbr: 'THRM', color: '#a8a090', desc: 'Heat & cooling' },
  build_quality: { label: 'Build Quality',     abbr: 'BILD', color: '#a0b4a0', desc: 'Material & feel' },
};

const PRODUCTS = [
  { id:1, name:'Lenovo LOQ 15',    price:72000, cpu_score:8.8, gpu_score:8.5, battery:5.5, portability:4.5, display:7.5, thermals:8.2, build_quality:7.0, creator_score:7.8, student_score:6.5, gaming_score:9.0, image:'https://via.placeholder.com/520x320?text=Lenovo+LOQ+15', url:'#' },
  { id:2, name:'ASUS Vivobook 15', price:58000, cpu_score:7.2, gpu_score:4.5, battery:8.4, portability:8.0, display:7.0, thermals:6.8, build_quality:7.5, creator_score:6.2, student_score:9.0, gaming_score:4.0, image:'https://via.placeholder.com/520x320?text=ASUS+Vivobook+15', url:'#' },
  { id:3, name:'MacBook Air M2',   price:95000, cpu_score:9.0, gpu_score:6.8, battery:9.8, portability:9.5, display:9.2, thermals:9.1, build_quality:9.5, creator_score:9.0, student_score:9.5, gaming_score:3.5, image:'https://via.placeholder.com/520x320?text=MacBook+Air+M2', url:'#' },
  { id:4, name:'HP Victus',        price:68000, cpu_score:8.1, gpu_score:8.0, battery:5.8, portability:5.0, display:7.3, thermals:7.8, build_quality:6.8, creator_score:7.0, student_score:6.0, gaming_score:8.5, image:'https://via.placeholder.com/520x320?text=HP+Victus', url:'#' },
  { id:5, name:'Acer Aspire Lite', price:42000, cpu_score:6.0, gpu_score:3.0, battery:7.2, portability:7.8, display:6.2, thermals:6.0, build_quality:6.1, creator_score:4.8, student_score:8.2, gaming_score:2.5, image:'https://via.placeholder.com/520x320?text=Acer+Aspire+Lite', url:'#' },
];

// ── Loading mini-game & quotes ──
const LOADING_QUOTES = [
  { text: 'Utility is not a number. It is the gap between what you need and what exists.', src: 'Optimisation Theory' },
  { text: 'In multi-criteria decision making, there is no single best — only the best for you.', src: 'Operations Research' },
  { text: 'Pareto efficiency: reject any option that is dominated on every dimension.', src: 'Vilfredo Pareto, 1896' },
  { text: 'TOPSIS ranks by distance from ideal — not by score alone, but by position in solution space.', src: 'Hwang & Yoon, 1981' },
  { text: 'The regret score measures what you sacrifice by choosing this over the optimal.', src: 'Regret Theory' },
  { text: 'True constraints narrow the feasible region. Everything else is preference.', src: 'Linear Programming' },
  { text: 'Sensitivity analysis asks: what single change would most improve your outcome?', src: 'Decision Science' },
  { text: 'A sigmoid utility curve means: the difference between bad and adequate matters more than the difference between good and excellent.', src: 'Behavioural Economics' },
];

const PIPELINE_STAGES = [
  { id: 'inference',      label: 'Semantic Inference',    sub: 'Extracting priorities from language' },
  { id: 'normalise',      label: 'Context Normalisation', sub: 'Applying per-factor utility curves' },
  { id: 'interactions',   label: 'Interaction Effects',   sub: 'Detecting component conflicts' },
  { id: 'utility',        label: 'Utility Computation',   sub: 'Weighted scoring with penalties' },
  { id: 'pareto',         label: 'Pareto Filtering',      sub: 'Eliminating dominated options' },
  { id: 'topsis',         label: 'TOPSIS Ranking',        sub: 'Distance from ideal solution' },
  { id: 'regret',         label: 'Regret Analysis',       sub: 'Opportunity cost per option' },
  { id: 'sensitivity',    label: 'Sensitivity Analysis',  sub: 'Computing marginal improvements' },
];

function LoadingExperience() {
  const [stage, setStage] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * LOADING_QUOTES.length));
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [game, setGame] = useState(null); // null | 'running'
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState([]);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  // Advance pipeline stages
  useEffect(() => {
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s < PIPELINE_STAGES.length) setStage(s);
      else clearInterval(iv);
    }, 680);
    return () => clearInterval(iv);
  }, []);

  // Rotate quotes
  useEffect(() => {
    const iv = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % LOADING_QUOTES.length);
        setQuoteVisible(true);
      }, 400);
    }, 5500);
    return () => clearInterval(iv);
  }, []);

  // Mini dot-catch game
  const spawnDot = () => {
    const id = Date.now() + Math.random();
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    setDots(d => [...d, { id, x, y }]);
    setTimeout(() => {
      setDots(d => d.filter(dot => dot.id !== id));
    }, 2200);
  };

  useEffect(() => {
    const iv = setInterval(spawnDot, 900);
    spawnDot();
    return () => clearInterval(iv);
  }, []);

  const catchDot = (id) => {
    setDots(d => d.filter(dot => dot.id !== id));
    setScore(s => s + 1);
  };

  const currentQuote = LOADING_QUOTES[quoteIdx];
  const completedStages = stage + 1;
  const pct = Math.round((completedStages / PIPELINE_STAGES.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: '100vh',
        background: '#0e0c0a',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.018) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              style={{
                width: '20px', height: '20px',
                border: '1.5px solid rgba(200,169,110,0.3)',
                borderTopColor: '#c8a96e',
                borderRadius: '50%',
              }}
            />
            <span style={{
              fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.6)',
            }}>
              Optimisation Engine · Running
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 500,
            color: '#f0ece4',
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            marginBottom: '8px',
          }}>
            Computing your <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>optimal choice.</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(240,236,228,0.32)', letterSpacing: '0.04em' }}>
            {pct}% complete — {PIPELINE_STAGES[stage]?.label}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '1px',
          background: 'rgba(240,236,228,0.06)',
          marginBottom: '32px',
          position: 'relative',
        }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', left: 0, top: 0,
              height: '100%', background: '#c8a96e',
            }}
          />
        </div>

        {/* Pipeline stages */}
        <div style={{ marginBottom: '48px' }}>
          {PIPELINE_STAGES.map((s, i) => {
            const done = i <= stage;
            const active = i === stage;
            return (
              <motion.div
                key={s.id}
                animate={{ opacity: done ? 1 : 0.22 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(200,190,170,0.04)',
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: active ? '#c8a96e' : done ? '#8eab96' : 'rgba(240,236,228,0.1)',
                  flexShrink: 0,
                  boxShadow: active ? '0 0 8px rgba(200,169,110,0.5)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '12px',
                    color: active ? '#f0ece4' : done ? 'rgba(240,236,228,0.55)' : 'rgba(240,236,228,0.18)',
                    letterSpacing: '0.04em',
                    transition: 'color 0.3s',
                  }}>
                    {s.label}
                  </span>
                  {active && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        color: 'rgba(200,169,110,0.5)',
                        letterSpacing: '0.08em',
                        marginTop: '2px',
                      }}
                    >
                      {s.sub}
                    </motion.span>
                  )}
                </div>
                {done && !active && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8eab96" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {active && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{
                      fontSize: '9px', letterSpacing: '0.22em',
                      color: '#c8a96e', textTransform: 'uppercase',
                    }}
                  >
                    Running
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(200,190,170,0.08)' }} />
          <span style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(240,236,228,0.2)' }}>
            While you wait
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(200,190,170,0.08)' }} />
        </div>

        {/* Two-column: quote + mini game */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px',
          marginBottom: '0',
        }}
          className="loading-grid"
        >
          {/* Quote panel */}
          <div style={{
            border: '1px solid rgba(200,190,170,0.09)',
            padding: '28px',
            background: 'rgba(240,236,228,0.01)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <p style={{
              fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.4)', marginBottom: '16px',
            }}>
              Engine Wisdom
            </p>
            <AnimatePresence mode="wait">
              {quoteVisible && (
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.38 }}
                >
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '15px',
                    fontStyle: 'italic',
                    color: 'rgba(240,236,228,0.68)',
                    lineHeight: 1.6,
                    marginBottom: '14px',
                    letterSpacing: '0.01em',
                  }}>
                    "{currentQuote.text}"
                  </p>
                  <span style={{
                    fontSize: '9.5px', letterSpacing: '0.2em',
                    color: 'rgba(200,169,110,0.45)',
                    textTransform: 'uppercase',
                  }}>
                    — {currentQuote.src}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dot-catch game */}
          <div style={{
            border: '1px solid rgba(200,190,170,0.09)',
            padding: '28px',
            background: 'rgba(240,236,228,0.01)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.4)',
              }}>
                Catch the nodes
              </p>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#c8a96e',
              }}>
                {score}
              </span>
            </div>

            <div style={{
              flex: 1,
              position: 'relative',
              background: 'rgba(200,190,170,0.02)',
              border: '1px solid rgba(200,190,170,0.06)',
              overflow: 'hidden',
              minHeight: '110px',
            }}>
              <AnimatePresence>
                {dots.map(dot => (
                  <motion.button
                    key={dot.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => catchDot(dot.id)}
                    style={{
                      position: 'absolute',
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '22px', height: '22px',
                      borderRadius: '50%',
                      background: 'none',
                      border: '1.5px solid #c8a96e',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    <div style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: '#c8a96e',
                      opacity: 0.7,
                    }} />
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Grid lines inside game */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(200,190,170,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.04) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
            </div>

            <p style={{
              fontSize: '9.5px', color: 'rgba(240,236,228,0.2)',
              letterSpacing: '0.1em', marginTop: '10px', textAlign: 'center',
            }}>
              nodes appear and fade — tap to catch
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .loading-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}

function extractBudget(text) {
  const m = text.match(/₹\s*([0-9,]+)/) || text.match(/rs\.?\s*([0-9,]+)/i) || text.match(/([0-9]{4,6})/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  return isNaN(n) ? null : n;
}

function FactorBar({ factor, value, onChange }) {
  const meta = FACTOR_META[factor];
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ marginBottom: '18px', cursor: 'default' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <span style={{
            fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: hov ? meta.color : 'rgba(240,236,228,0.45)',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            transition: 'color 0.2s',
          }}>
            {meta.abbr}
          </span>
          {hov && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginLeft: '8px',
                fontSize: '9.5px',
                color: 'rgba(240,236,228,0.25)',
                letterSpacing: '0.06em',
              }}
            >
              {meta.desc}
            </motion.span>
          )}
        </div>
        <span style={{
          fontSize: '10.5px', fontFamily: 'monospace',
          color: 'rgba(240,236,228,0.4)',
        }}>
          {Math.round(value * 100)}
        </span>
      </div>
      <div style={{ position: 'relative', height: '2px', background: 'rgba(240,236,228,0.06)', borderRadius: '1px', marginBottom: '6px' }}>
        <motion.div
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.1 }}
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: meta.color, borderRadius: '1px' }}
        />
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={e => onChange(factor, e.target.value)}
        style={{
          width: '100%', appearance: 'none', WebkitAppearance: 'none',
          background: 'transparent', cursor: 'pointer', height: '2px',
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
  const [constraintFocused, setConstraintFocused] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setPIdx(i => (i + 1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(iv);
  }, []);

  const detectedBudget = useMemo(() => extractBudget(query), [query]);

  const handleSlider = (factor, val) => {
    setFactors(prev => ({ ...prev, [factor]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!query.trim()) { setError('Please describe what you need.'); return; }
    setLoading(true);
    try {
      const budget = detectedBudget || 70000;
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
      setLoading(false);
    }
  };

  const totalWeight = Object.values(factors).reduce((a, b) => a + b, 0);

  if (loading) {
    return <LoadingExperience />;
  }

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
              color: 'rgba(240,236,228,0.35)', fontFamily: "'DM Sans', sans-serif",
              padding: 0, transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,236,228,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,236,228,0.35)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            fontSize: '10px', letterSpacing: '0.2em',
            color: 'rgba(240,236,228,0.2)',
          }}>
            <AnimatePresence>
              {detectedBudget && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    color: '#c8a96e',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    border: '1px solid rgba(200,169,110,0.2)',
                    padding: '4px 10px',
                  }}
                >
                  Budget detected: ₹{detectedBudget.toLocaleString()}
                </motion.span>
              )}
            </AnimatePresence>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#8eab96', display: 'inline-block',
                boxShadow: '0 0 6px rgba(142,171,150,0.5)',
              }} />
              <span>OPTICHOICE v2.0</span>
            </div>
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
            <div style={{ marginBottom: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.6 }} />
                <span style={{
                  fontSize: '9.5px', letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: 'rgba(200,169,110,0.6)',
                }}>
                  Decision Engine · Laptop Optimisation
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 500, lineHeight: 1.06,
                letterSpacing: '-0.03em', color: '#f0ece4',
                marginBottom: '12px',
              }}>
                Describe what<br />
                <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>you actually need.</span>
              </h1>
              <p style={{
                fontSize: '14px', color: 'rgba(240,236,228,0.4)',
                lineHeight: 1.7, letterSpacing: '0.01em',
                maxWidth: '460px',
              }}>
                The engine reads intent, infers priority weights, and runs eight optimisation 
                subsystems to find your mathematically best match.
              </p>
            </div>

            {/* Query input */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '9.5px', letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'rgba(240,236,228,0.35)',
                marginBottom: '12px',
              }}>
                <div style={{ width: '16px', height: '1px', background: 'rgba(200,169,110,0.4)' }} />
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
                    background: focused ? 'rgba(200,169,110,0.025)' : 'rgba(240,236,228,0.025)',
                    border: focused
                      ? '1px solid rgba(200,169,110,0.45)'
                      : '1px solid rgba(200,190,170,0.1)',
                    borderRadius: '2px',
                    padding: '18px 20px',
                    paddingBottom: '36px',
                    fontSize: '15px', lineHeight: 1.62,
                    color: '#f0ece4',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.22s ease, background 0.22s ease',
                    letterSpacing: '0.01em',
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: '12px', left: '20px', right: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    fontSize: '9.5px', color: 'rgba(240,236,228,0.2)',
                    letterSpacing: '0.1em', fontFamily: 'monospace',
                  }}>
                    {query.length > 0 ? `${query.length} chars` : 'plain language · budgets detected automatically'}
                  </span>
                  <span style={{
                    fontSize: '9px', color: 'rgba(240,236,228,0.15)',
                    letterSpacing: '0.1em', fontFamily: 'monospace',
                  }}>
                    {query.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '9.5px', letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'rgba(240,236,228,0.3)',
                marginBottom: '12px',
              }}>
                <div style={{ width: '16px', height: '1px', background: 'rgba(200,190,170,0.25)' }} />
                Hard Constraints
                <span style={{ color: 'rgba(240,236,228,0.18)', fontWeight: 300, letterSpacing: '0.06em', textTransform: 'none', fontSize: '9.5px' }}>
                  — optional
                </span>
              </label>
              <textarea
                rows={2}
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                placeholder="Non-negotiable requirements · e.g. must be under 1.7 kg, must have 512 GB storage"
                onFocus={() => setConstraintFocused(true)}
                onBlur={() => setConstraintFocused(false)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: constraintFocused ? 'rgba(200,169,110,0.02)' : 'rgba(240,236,228,0.015)',
                  border: constraintFocused
                    ? '1px solid rgba(200,169,110,0.35)'
                    : '1px solid rgba(200,190,170,0.07)',
                  borderRadius: '2px',
                  padding: '14px 18px',
                  fontSize: '13.5px', color: 'rgba(240,236,228,0.55)',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  letterSpacing: '0.01em',
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Factor sliders */}
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
                background: 'rgba(200,169,110,0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,110,0.5)" strokeWidth="2">
                    <path d="M12 20V10M18 20V4M6 20v-4"/>
                  </svg>
                  <p style={{
                    fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase',
                    color: 'rgba(240,236,228,0.38)',
                  }}>
                    Manual Priority Weights
                  </p>
                </div>
                <span style={{
                  fontSize: '9.5px', letterSpacing: '0.12em',
                  color: 'rgba(240,236,228,0.2)',
                }}>
                  engine will infer automatically if unchanged
                </span>
              </div>
              <div style={{
                padding: '22px',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px 36px',
              }}>
                {Object.entries(factors).map(([factor, value]) => (
                  <FactorBar key={factor} factor={factor} value={value} onChange={handleSlider} />
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
                    background: 'rgba(180,100,90,0.05)',
                    borderRadius: '2px',
                    padding: '12px 16px',
                    fontSize: '13px', color: '#c08888',
                    marginBottom: '20px',
                    letterSpacing: '0.04em',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                padding: '20px',
                background: '#c8a96e',
                border: 'none',
                borderRadius: '2px',
                color: '#0e0c0a',
                fontSize: '11px', letterSpacing: '0.26em', textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: '0 8px 32px rgba(200,169,110,0.15)',
              }}
            >
              Run Optimisation Engine
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Sub-note */}
            <p style={{
              marginTop: '14px',
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(240,236,228,0.2)',
              letterSpacing: '0.1em',
            }}>
              TOPSIS · Pareto · Regret · Sensitivity · {PRODUCTS.length} products evaluated
            </p>
          </motion.form>

          {/* ── RIGHT: Live weight panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'sticky',
              top: '96px',
            }}
          >
            {/* Weight Analysis */}
            <div style={{
              border: '1px solid rgba(200,190,170,0.1)',
              borderRadius: '2px',
              padding: '24px',
              marginBottom: '2px',
            }}>
              <p style={{
                fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.55)', marginBottom: '22px',
              }}>
                Weight Distribution
              </p>

              <div style={{ marginBottom: '20px' }}>
                {Object.entries(factors)
                  .sort((a, b) => b[1] - a[1])
                  .map(([factor, value]) => {
                    const meta = FACTOR_META[factor];
                    return (
                      <div key={factor} style={{ marginBottom: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{
                            fontSize: '10px', letterSpacing: '0.16em',
                            color: meta.color, textTransform: 'uppercase',
                          }}>
                            {meta.abbr}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(240,236,228,0.32)', fontFamily: 'monospace' }}>
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                        <div style={{ height: '1px', background: 'rgba(240,236,228,0.05)', position: 'relative' }}>
                          <motion.div
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.18 }}
                            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div style={{ borderTop: '1px solid rgba(200,190,170,0.07)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: 'rgba(240,236,228,0.22)', textTransform: 'uppercase' }}>
                    Sum
                  </span>
                  <span style={{
                    fontSize: '12px', fontFamily: 'monospace',
                    color: totalWeight > 1.01 ? '#c08888' : '#8eab96',
                  }}>
                    {totalWeight.toFixed(2)}
                  </span>
                </div>
                {totalWeight > 1.01 && (
                  <p style={{ fontSize: '10.5px', color: 'rgba(192,136,136,0.7)', letterSpacing: '0.06em', marginTop: '8px', lineHeight: 1.5 }}>
                    Exceeds 1.0 — engine normalises automatically.
                  </p>
                )}
              </div>
            </div>

            {/* Engine info card */}
            <div style={{
              border: '1px solid rgba(200,190,170,0.07)',
              padding: '20px',
              background: 'rgba(200,169,110,0.02)',
            }}>
              <p style={{
                fontSize: '9px', letterSpacing: '0.26em', textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.4)', marginBottom: '14px',
              }}>
                Pipeline
              </p>
              {[
                'Semantic inference',
                'Utility curves',
                'Interaction effects',
                'Pareto dominance',
                'TOPSIS distance',
                'Regret scoring',
                'Sensitivity analysis',
              ].map((step, i) => (
                <div key={step} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '7px 0',
                  borderBottom: i < 6 ? '1px solid rgba(200,190,170,0.04)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '9px',
                    color: 'rgba(200,169,110,0.35)',
                    minWidth: '18px',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: '11px', color: 'rgba(240,236,228,0.32)',
                    letterSpacing: '0.04em',
                  }}>
                    {step}
                  </span>
                </div>
              ))}
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
