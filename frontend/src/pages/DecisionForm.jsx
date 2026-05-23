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
  cpu_score: 0.24,
  gpu_score: 0.16,
  battery: 0.20,
  portability: 0.18,
  display: 0.12,
  thermals: 0.06,
  build_quality: 0.04,
};

const FACTOR_META = {
  cpu_score:    { label: 'CPU',         icon: '⚡', color: '#00f5ff' },
  gpu_score:    { label: 'GPU',         icon: '🎮', color: '#bf00ff' },
  battery:      { label: 'Battery',     icon: '🔋', color: '#00ff88' },
  portability:  { label: 'Portability', icon: '🎒', color: '#ff9500' },
  display:      { label: 'Display',     icon: '🖥',  color: '#ff3cac' },
  thermals:     { label: 'Thermals',    icon: '🌡',  color: '#ff6b35' },
  build_quality:{ label: 'Build',       icon: '🔩', color: '#f5d547' },
};

const PRODUCTS = [
  { id:1, name:'Lenovo LOQ 15',   price:72000, cpu_score:8.8, gpu_score:8.5, battery:5.5, portability:4.5, display:7.5, thermals:8.2, build_quality:7.0, creator_score:7.8, student_score:6.5, gaming_score:9.0, image:'https://via.placeholder.com/520x320?text=Lenovo+LOQ+15' },
  { id:2, name:'ASUS Vivobook 15',price:58000, cpu_score:7.2, gpu_score:4.5, battery:8.4, portability:8.0, display:7.0, thermals:6.8, build_quality:7.5, weight:1.7, creator_score:6.2, student_score:9.0, gaming_score:4.0, image:'https://via.placeholder.com/520x320?text=ASUS+Vivobook+15' },
  { id:3, name:'MacBook Air M2',  price:95000, cpu_score:9.0, gpu_score:6.8, battery:9.8, portability:9.5, display:9.2, thermals:9.1, build_quality:9.5, weight:1.24, creator_score:9.0, student_score:9.5, gaming_score:3.5, image:'https://via.placeholder.com/520x320?text=MacBook+Air+M2' },
  { id:4, name:'HP Victus',       price:68000, cpu_score:8.1, gpu_score:8.0, battery:5.8, portability:5.0, display:7.3, thermals:7.8, build_quality:6.8, weight:2.3, creator_score:7.0, student_score:6.0, gaming_score:8.5, image:'https://via.placeholder.com/520x320?text=HP+Victus' },
  { id:5, name:'Acer Aspire Lite',price:42000, cpu_score:6.0, gpu_score:3.0, battery:7.2, portability:7.8, display:6.2, thermals:6.0, build_quality:6.1, weight:1.6, creator_score:4.8, student_score:8.2, gaming_score:2.5, image:'https://via.placeholder.com/520x320?text=Acer+Aspire+Lite' },
];

function extractBudget(text) {
  const m = text.match(/₹\s*([0-9,]+)/) || text.match(/rs\.?\s*([0-9,]+)/i) || text.match(/([0-9]{4,6})/);
  if (!m) return 70000;
  return parseInt(m[1].replace(/,/g, ''), 10) || 70000;
}

function RadarBar({ factor, value, color }) {
  const meta = FACTOR_META[factor];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase" style={{ color }}>
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </span>
        <span className="text-xs font-mono" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <input
        type="range"
        min="0" max="1" step="0.01"
        value={value}
        onChange={() => {}}
        className="sr-only"
        aria-label={meta.label}
      />
    </div>
  );
}

export default function DecisionForm({ onResultsReady, onBackHome }) {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adjustedFactors, setAdjustedFactors] = useState(DEFAULT_FACTORS);
  const [constraints, setConstraints] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const budget = useMemo(() => extractBudget(query), [query]);

  const handleSlider = (factor, val) => {
    setAdjustedFactors(prev => ({ ...prev, [factor]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!query.trim()) { setError('Describe what you need.'); return; }
    setLoading(true);
    try {
      const res = await submitAnalysis({
        user_needs: query.trim(),
        budget,
        factors: adjustedFactors,
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

  const totalWeight = Object.values(adjustedFactors).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen py-10 px-4" style={{
      background: 'radial-gradient(ellipse at 20% 50%, #0a0f1e 0%, #060810 60%, #000 100%)',
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      {/* Ambient grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBackHome} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>← BACK</button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            fontSize: '11px', letterSpacing: '0.15em', color: '#475569',
          }}>
            <span>BUDGET <span style={{ color: '#00f5ff' }}>₹{budget.toLocaleString()}</span></span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 8px #00ff88' }} />
            <span>OPTICHOICE <span style={{ color: '#00ff88' }}>v1.0</span></span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* LEFT — main form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#00f5ff', marginBottom: '12px' }}>
                DECISION ENGINE // AI-POWERED
              </p>
              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: '#f1f5f9',
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: '12px',
              }}>
                Tell us what<br />
                <span style={{ color: '#00f5ff' }}>you need.</span>
              </h1>
              <p style={{ color: '#475569', fontSize: '14px', letterSpacing: '0.05em' }}>
                Describe your use case. We infer priorities and rank options for you.
              </p>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  style={{
                    width: '100%',
                    background: 'rgba(0,245,255,0.03)',
                    border: '1px solid rgba(0,245,255,0.2)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    fontSize: '16px',
                    color: '#f1f5f9',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#00f5ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,245,255,0.2)'}
                />
              </div>

              {/* Constraints */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#475569', display: 'block', marginBottom: '8px' }}>
                  HARD CONSTRAINTS (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  placeholder="e.g. must be under 1.7kg, must have 512GB storage"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Sliders */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#475569', marginBottom: '16px' }}>
                  PRIORITY WEIGHTS — DRAG TO TUNE
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  {Object.entries(adjustedFactors).map(([factor, value]) => {
                    const meta = FACTOR_META[factor];
                    return (
                      <div key={factor}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: meta.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {meta.icon} {meta.label.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: meta.color }}>
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                        <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '6px' }}>
                          <motion.div
                            style={{
                              position: 'absolute', left: 0, top: 0, height: '100%',
                              background: `linear-gradient(90deg, ${meta.color}66, ${meta.color})`,
                              borderRadius: '4px',
                              width: `${value * 100}%`,
                            }}
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.15 }}
                          />
                        </div>
                        <input
                          type="range" min="0" max="1" step="0.01"
                          value={value}
                          onChange={e => handleSlider(factor, e.target.value)}
                          style={{ width: '100%', accentColor: meta.color, cursor: 'pointer' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(255,50,50,0.08)',
                  border: '1px solid rgba(255,50,50,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#fca5a5',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading
                    ? 'rgba(0,245,255,0.1)'
                    : 'linear-gradient(135deg, #00f5ff22, #00f5ff11)',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(0,245,255,0.15), inset 0 1px 0 rgba(0,245,255,0.2)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  color: loading ? '#475569' : '#00f5ff',
                  fontSize: '13px',
                  letterSpacing: '0.25em',
                  fontFamily: 'inherit',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '◌ ANALYZING...' : '→ FIND MY BEST OPTION'}
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT — live weight radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: 'sticky',
              top: '24px',
              background: 'rgba(0,245,255,0.02)',
              border: '1px solid rgba(0,245,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#00f5ff', marginBottom: '20px' }}>
              ◈ LIVE WEIGHT ANALYSIS
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {Object.entries(adjustedFactors)
                .sort((a, b) => b[1] - a[1])
                .map(([factor, value]) => (
                  <RadarBar key={factor} factor={factor} value={value} color={FACTOR_META[factor].color} />
                ))}
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#475569' }}>TOTAL WEIGHT</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: totalWeight > 1.01 ? '#ff6b35' : '#00ff88' }}>
                  {totalWeight.toFixed(2)}
                </span>
              </div>
              {totalWeight > 1.01 && (
                <p style={{ fontSize: '11px', color: '#ff6b35', letterSpacing: '0.1em' }}>
                  ⚠ Weights exceed 1.0 — AI will normalize
                </p>
              )}
            </div>

            <div style={{
              marginTop: '20px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '11px',
              color: '#334155',
              letterSpacing: '0.1em',
              lineHeight: 1.6,
            }}>
              <p style={{ color: '#475569', marginBottom: '4px' }}>HOW IT WORKS</p>
              <p>Your prompt → Gemini infers context → weights applied → products ranked by composite score.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
