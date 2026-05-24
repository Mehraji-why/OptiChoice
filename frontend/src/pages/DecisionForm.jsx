import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { submitAnalysis } from '../api/client';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS  (unchanged logic, richer meta)
───────────────────────────────────────────────────────────── */
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

const FACTOR_META = {
  cpu_score:     { label: 'CPU Performance',   desc: 'Processing speed & multi-core throughput', color: '#c8a96e',  icon: '⬡' },
  gpu_score:     { label: 'GPU Performance',   desc: 'Graphics rendering & compute capability',  color: '#b8a898',  icon: '◈' },
  battery:       { label: 'Battery Life',      desc: 'Runtime endurance on a single charge',     color: '#8eab96',  icon: '◉' },
  portability:   { label: 'Portability',       desc: 'Weight, form factor & on-the-go ease',     color: '#9eaab8',  icon: '◇' },
  display:       { label: 'Display Quality',   desc: 'Resolution, colour accuracy & brightness', color: '#b8a0a0',  icon: '▣' },
  thermals:      { label: 'Thermal Management',desc: 'Cooling efficiency under sustained load',  color: '#a8a090',  icon: '◬' },
  build_quality: { label: 'Build Quality',     desc: 'Materials, chassis rigidity & longevity',  color: '#a8b0a0',  icon: '◫' },
};

const PRODUCTS = [
  { id:1, name:'Lenovo LOQ 15',    price:72000, cpu_score:8.8, gpu_score:8.5, battery:5.5, portability:4.5, display:7.5, thermals:8.2, build_quality:7.0, creator_score:7.8, student_score:6.5, gaming_score:9.0, image:'https://via.placeholder.com/520x320?text=Lenovo+LOQ+15' },
  { id:2, name:'ASUS Vivobook 15', price:58000, cpu_score:7.2, gpu_score:4.5, battery:8.4, portability:8.0, display:7.0, thermals:6.8, build_quality:7.5, weight:1.7, creator_score:6.2, student_score:9.0, gaming_score:4.0, image:'https://via.placeholder.com/520x320?text=ASUS+Vivobook+15' },
  { id:3, name:'MacBook Air M2',   price:95000, cpu_score:9.0, gpu_score:6.8, battery:9.8, portability:9.5, display:9.2, thermals:9.1, build_quality:9.5, weight:1.24, creator_score:9.0, student_score:9.5, gaming_score:3.5, image:'https://via.placeholder.com/520x320?text=MacBook+Air+M2' },
  { id:4, name:'HP Victus',        price:68000, cpu_score:8.1, gpu_score:8.0, battery:5.8, portability:5.0, display:7.3, thermals:7.8, build_quality:6.8, weight:2.3, creator_score:7.0, student_score:6.0, gaming_score:8.5, image:'https://via.placeholder.com/520x320?text=HP+Victus' },
  { id:5, name:'Acer Aspire Lite', price:42000, cpu_score:6.0, gpu_score:3.0, battery:7.2, portability:7.8, display:6.2, thermals:6.0, build_quality:6.1, weight:1.6, creator_score:4.8, student_score:8.2, gaming_score:2.5, image:'https://via.placeholder.com/520x320?text=Acer+Aspire+Lite' },
];

/* ─────────────────────────────────────────────────────────────
   UNCHANGED LOGIC
───────────────────────────────────────────────────────────── */
function extractBudget(text) {
  const m = text.match(/₹\s*([0-9,]+)/) || text.match(/rs\.?\s*([0-9,]+)/i) || text.match(/([0-9]{4,6})/);
  if (!m) return 70000;
  return parseInt(m[1].replace(/,/g, ''), 10) || 70000;
}

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const T = {
  bg:        '#0b0a08',
  surface:   '#16140f',
  surfaceHi: '#1d1a13',
  border:    'rgba(200,185,155,0.09)',
  borderHi:  'rgba(200,169,110,0.28)',
  gold:      '#c8a96e',
  goldSoft:  'rgba(200,169,110,0.55)',
  goldDim:   'rgba(200,169,110,0.1)',
  cream:     '#f0ece4',
  creamDim:  'rgba(240,236,228,0.38)',
  creamFaint:'rgba(240,236,228,0.14)',
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'DM Sans', sans-serif",
};

/* ─────────────────────────────────────────────────────────────
   AMBIENT BACKGROUND CANVAS
───────────────────────────────────────────────────────────── */
function AmbientBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const orbs = [
      { x:0.15, y:0.25, r:0.38, color:[200,169,110], a:0.028, spd:0.00007 },
      { x:0.85, y:0.55, r:0.30, color:[100,140,200], a:0.018, spd:0.00005 },
      { x:0.50, y:0.80, r:0.25, color:[140,180,150], a:0.016, spd:0.00009 },
    ];
    const t0 = performance.now();
    const draw = (now) => {
      id = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, c.width, c.height);
      orbs.forEach((o, i) => {
        const t = now - t0;
        const px = (o.x + Math.sin(t * o.spd + i) * 0.08) * c.width;
        const py = (o.y + Math.cos(t * o.spd * 0.7 + i) * 0.06) * c.height;
        const rad = o.r * Math.min(c.width, c.height);
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, `rgba(${o.color.join(',')},${o.a})`);
        g.addColorStop(1, `rgba(${o.color.join(',')},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      });
    };
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position:'fixed', inset:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:0, opacity:0.85,
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────
   FACTOR SLIDER  — rich, full label, tooltip, 3D thumb
───────────────────────────────────────────────────────────── */
function FactorSlider({ factor, value, onChange }) {
  const meta = FACTOR_META[factor];
  const [dragging, setDragging] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const pct = value * 100;

  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      style={{ marginBottom:0, position:'relative' }}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {/* Row: label + percent */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:10 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
            <span style={{ fontSize:14, color:meta.color, opacity:0.7, lineHeight:1 }}>{meta.icon}</span>
            <span style={{ fontSize:11.5, letterSpacing:'0.08em', textTransform:'uppercase', color:meta.color, fontFamily:T.sans, fontWeight:500 }}>
              {meta.label}
            </span>
          </div>
          <AnimatePresence>
            {tooltipVisible && (
              <motion.p initial={{ opacity:0, y:2 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:2 }} transition={{ duration:0.18 }}
                style={{ fontSize:10, color:'rgba(240,236,228,0.28)', fontFamily:T.sans, letterSpacing:'0.03em', lineHeight:1.5 }}>
                {meta.desc}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
          <span style={{ fontSize:18, fontFamily:T.serif, fontWeight:500, color: dragging ? meta.color : T.cream, transition:'color 0.2s', letterSpacing:'-0.02em' }}>
            {Math.round(pct)}
          </span>
          <span style={{ fontSize:9, color:'rgba(240,236,228,0.22)', fontFamily:T.sans, letterSpacing:'0.12em' }}>%</span>
        </div>
      </div>

      {/* Track + fill */}
      <div style={{ position:'relative', height:3, background:'rgba(240,236,228,0.06)', borderRadius:2, marginBottom:6 }}>
        <motion.div
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.1 }}
          style={{
            position:'absolute', left:0, top:0, height:'100%', borderRadius:2,
            background:`linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
            boxShadow: dragging ? `0 0 10px ${meta.color}55` : 'none',
            transition:'box-shadow 0.2s',
          }}
        />
        {/* Glow dot at fill end */}
        <motion.div
          animate={{ left:`${pct}%` }}
          transition={{ duration:0.1 }}
          style={{
            position:'absolute', top:'50%',
            width:dragging ? 12 : 8, height:dragging ? 12 : 8,
            transform:'translate(-50%, -50%)',
            background:meta.color,
            borderRadius:'50%',
            boxShadow: dragging ? `0 0 18px ${meta.color}99, 0 0 6px ${meta.color}` : `0 0 6px ${meta.color}66`,
            transition:'width 0.15s, height 0.15s, box-shadow 0.2s',
            pointerEvents:'none',
          }}
        />
      </div>

      {/* Native range — invisible, sits on top for interaction */}
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={e => onChange(factor, e.target.value)}
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onTouchStart={() => setDragging(true)}
        onTouchEnd={() => setDragging(false)}
        aria-label={meta.label}
        style={{
          position:'absolute', bottom:0, left:0, width:'100%',
          height:'18px', opacity:0, cursor:'pointer', margin:0,
          WebkitAppearance:'none', appearance:'none',
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   WEIGHT RADIAL RING — live donut chart for right panel
───────────────────────────────────────────────────────────── */
function WeightRing({ factors }) {
  const sorted = Object.entries(factors).sort((a,b) => b[1]-a[1]);
  const total = sorted.reduce((s,[,v])=>s+v,0) || 1;
  const size = 120;
  const cx = size/2, cy = size/2, r = 44, stroke = 10;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = sorted.map(([k,v]) => {
    const meta = FACTOR_META[k];
    const pct = v / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const arc = { key:k, color:meta.color, dash, gap, offset, pct };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display:'flex', justifyContent:'center', marginBottom:24, position:'relative' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', overflow:'visible' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(240,236,228,0.05)" strokeWidth={stroke} />
        {arcs.map(arc => (
          <motion.circle
            key={arc.key}
            cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
            animate={{ strokeDasharray:`${arc.dash} ${arc.gap}` }}
            transition={{ duration:0.22, ease:'easeOut' }}
            style={{ opacity:0.85 }}
          />
        ))}
      </svg>
      {/* Centre label */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
        <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:500, color:T.cream, lineHeight:1 }}>
          {Math.round(arcs[0]?.[1]?.pct*100 ?? sorted[0]?.[1]*100)}
        </div>
        <div style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:T.goldSoft, marginTop:2 }}>top</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function DecisionForm({ onResultsReady, onBackHome }) {
  const [query, setQuery]           = useState('');
  const [pIdx, setPIdx]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [factors, setFactors]       = useState(DEFAULT_FACTORS);
  const [constraints, setConstraints] = useState('');
  const [focused, setFocused]       = useState(false);
  const [cFocused, setCFocused]     = useState(false);
  const [slidersOpen, setSlidersOpen] = useState(true);
  const textareaRef = useRef(null);

  /* rotate placeholder */
  useEffect(() => {
    const iv = setInterval(() => setPIdx(i => (i+1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(iv);
  }, []);

  /* budget parse — UNCHANGED */
  const budget = useMemo(() => extractBudget(query), [query]);

  /* slider handler — UNCHANGED */
  const handleSlider = (factor, val) => {
    setFactors(prev => ({ ...prev, [factor]: Number(val) }));
  };

  /* submit — UNCHANGED */
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

  const totalWeight = Object.values(factors).reduce((a,b) => a+b, 0);
  const sortedFactors = Object.entries(factors).sort((a,b) => b[1]-a[1]);

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:T.sans, paddingTop:80, position:'relative', overflow:'hidden' }}>
      {/* ── Ambient background ── */}
      <AmbientBg />

      {/* ── Structural grid ── */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
        backgroundImage:'linear-gradient(rgba(200,190,170,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.018) 1px, transparent 1px)',
        backgroundSize:'88px 88px',
      }} />

      <div style={{ position:'relative', zIndex:2, maxWidth:1140, margin:'0 auto', padding:'48px 32px 100px' }}>

        {/* ── TOP BAR ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:60 }}>
          <motion.button
            onClick={onBackHome}
            whileHover={{ x:-3, color:'rgba(240,236,228,0.55)' }}
            transition={{ duration:0.18 }}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(240,236,228,0.28)', fontFamily:T.sans, padding:0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </motion.button>

          <div style={{ display:'flex', alignItems:'center', gap:20, fontSize:10, letterSpacing:'0.22em', color:'rgba(240,236,228,0.22)', fontFamily:T.sans }}>
            <AnimatePresence>
              {query.length > 0 && (
                <motion.div initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }} transition={{ duration:0.3 }}
                  style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:9, color:'rgba(240,236,228,0.2)' }}>BUDGET DETECTED</span>
                  <span style={{ fontFamily:T.serif, fontSize:16, fontWeight:500, color:T.gold, letterSpacing:'-0.01em' }}>
                    ₹{budget.toLocaleString()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ width:1, height:16, background:'rgba(240,236,228,0.1)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#8eab96', display:'inline-block', boxShadow:'0 0 6px #8eab9688' }} />
              <span>OPTICHOICE v1.0</span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN GRID ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:52, alignItems:'start' }} className="df-grid">

          {/* ══════════════════════════════════════
              LEFT COLUMN — FORM
          ══════════════════════════════════════ */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
          >

            {/* Header */}
            <div style={{ marginBottom:48 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
                <div style={{ width:36, height:1, background:T.gold, opacity:0.55 }} />
                <span style={{ fontSize:9.5, letterSpacing:'0.34em', textTransform:'uppercase', color:T.goldSoft, fontFamily:T.sans }}>Decision Engine</span>
              </div>
              <h1 style={{ fontFamily:T.serif, fontSize:'clamp(2.2rem,4.5vw,3.2rem)', fontWeight:500, lineHeight:1.06, letterSpacing:'-0.03em', color:T.cream, marginBottom:14 }}>
                Tell us what<br/>
                <motion.span initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.6, ease:[0.22,1,0.36,1] }}
                  style={{ color:T.gold, fontStyle:'italic' }}>you need.</motion.span>
              </h1>
              <p style={{ fontSize:13.5, color:'rgba(240,236,228,0.32)', lineHeight:1.72, letterSpacing:'0.015em', maxWidth:480 }}>
                Describe your use case in plain language. The engine infers your priorities and ranks every option with full mathematical transparency.
              </p>
            </div>

            {/* ── PRIMARY QUERY ── */}
            <div style={{ marginBottom:32 }}>
              <label style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontSize:9.5, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(240,236,228,0.28)', fontFamily:T.sans }}>
                  Your Need
                </span>
                <span style={{ fontSize:9, letterSpacing:'0.14em', color:'rgba(240,236,228,0.16)', fontFamily:T.sans }}>
                  Natural language
                </span>
              </label>

              {/* Textarea wrapper with glow border */}
              <div style={{ position:'relative' }}>
                <motion.div
                  animate={{
                    boxShadow: focused
                      ? `0 0 0 1px rgba(200,169,110,0.45), 0 8px 40px rgba(200,169,110,0.08), inset 0 1px 0 rgba(200,169,110,0.06)`
                      : `0 0 0 1px rgba(200,185,155,0.09), 0 4px 16px rgba(0,0,0,0.2)`,
                  }}
                  transition={{ duration:0.25 }}
                  style={{ borderRadius:3, overflow:'hidden' }}
                >
                  <textarea
                    ref={textareaRef}
                    rows={5}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[pIdx]}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      width:'100%', boxSizing:'border-box',
                      background: focused ? 'rgba(200,169,110,0.025)' : 'rgba(240,236,228,0.025)',
                      border:'none',
                      padding:'20px 22px',
                      fontSize:15.5, lineHeight:1.64,
                      color:T.cream,
                      fontFamily:T.sans,
                      outline:'none',
                      resize:'vertical',
                      letterSpacing:'0.01em',
                      transition:'background 0.25s',
                    }}
                  />
                </motion.div>

                {/* Bottom row inside box */}
                <div style={{
                  position:'absolute', bottom:0, left:0, right:0,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'8px 16px 10px',
                  pointerEvents:'none',
                }}>
                  <AnimatePresence>
                    {query.length > 0 && (
                      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
                        style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:4, height:4, borderRadius:'50%', background:'#8eab96', display:'inline-block' }} />
                        <span style={{ fontSize:9.5, color:'rgba(140,171,150,0.7)', letterSpacing:'0.1em', fontFamily:T.sans }}>Budget parsed</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span style={{ fontSize:9.5, color:'rgba(240,236,228,0.18)', fontFamily:'monospace', letterSpacing:'0.08em' }}>
                    {query.length} chars
                  </span>
                </div>
              </div>
            </div>

            {/* ── HARD CONSTRAINTS ── */}
            <div style={{ marginBottom:36 }}>
              <label style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontSize:9.5, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(240,236,228,0.28)', fontFamily:T.sans }}>
                  Hard Constraints
                </span>
                <span style={{ fontSize:9, letterSpacing:'0.14em', color:'rgba(240,236,228,0.16)', fontFamily:T.sans }}>
                  Optional
                </span>
              </label>
              <motion.div
                animate={{
                  boxShadow: cFocused
                    ? `0 0 0 1px rgba(200,169,110,0.32), 0 4px 20px rgba(200,169,110,0.05)`
                    : `0 0 0 1px rgba(200,185,155,0.08)`,
                }}
                transition={{ duration:0.22 }}
                style={{ borderRadius:3, overflow:'hidden' }}
              >
                <textarea
                  rows={2}
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  placeholder="e.g. must be under 1.7 kg, must have 512 GB storage"
                  onFocus={() => setCFocused(true)}
                  onBlur={() => setCFocused(false)}
                  style={{
                    width:'100%', boxSizing:'border-box',
                    background:'rgba(240,236,228,0.02)',
                    border:'none',
                    padding:'14px 18px',
                    fontSize:13.5, color:'rgba(240,236,228,0.45)',
                    fontFamily:T.sans, outline:'none', resize:'none',
                    letterSpacing:'0.01em', lineHeight:1.6,
                    transition:'background 0.2s',
                  }}
                />
              </motion.div>
              <p style={{ fontSize:10, color:'rgba(240,236,228,0.18)', marginTop:8, fontFamily:T.sans, letterSpacing:'0.04em' }}>
                Hard constraints eliminate options that don't qualify — the engine will not score them.
              </p>
            </div>

            {/* ── FACTOR SLIDERS ── */}
            <motion.div
              style={{ border:`1px solid ${T.border}`, borderRadius:3, marginBottom:36, overflow:'hidden', background:`rgba(22,20,15,0.6)` }}
              animate={{ borderColor: slidersOpen ? 'rgba(200,169,110,0.18)' : T.border }}
              transition={{ duration:0.3 }}
            >
              {/* Header row — clickable toggle */}
              <button
                type="button"
                onClick={() => setSlidersOpen(o => !o)}
                style={{
                  width:'100%', background:'none', border:'none', cursor:'pointer',
                  padding:'18px 24px',
                  borderBottom:`1px solid ${T.border}`,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:9.5, letterSpacing:'0.28em', textTransform:'uppercase', color:T.goldSoft, fontFamily:T.sans }}>
                    Priority Weights
                  </span>
                  <span style={{ fontSize:9, color:'rgba(240,236,228,0.18)', fontFamily:T.sans, letterSpacing:'0.06em' }}>
                    · {Object.keys(factors).length} factors
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:9, letterSpacing:'0.14em', color:'rgba(240,236,228,0.18)', fontFamily:T.sans }}>
                    Drag to tune
                  </span>
                  <motion.div animate={{ rotate: slidersOpen ? 180 : 0 }} transition={{ duration:0.25 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,228,0.25)" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {slidersOpen && (
                  <motion.div
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
                    style={{ overflow:'hidden' }}
                  >
                    <div style={{ padding:'28px 24px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'28px 48px' }} className="df-sliders">
                      {Object.entries(factors).map(([factor, value]) => (
                        <FactorSlider
                          key={factor}
                          factor={factor}
                          value={value}
                          onChange={handleSlider}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── ERROR ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{
                    border:'1px solid rgba(180,100,90,0.28)',
                    background:'rgba(180,100,90,0.05)',
                    borderRadius:3, padding:'13px 18px',
                    fontSize:12.5, color:'#c08888',
                    marginBottom:22, letterSpacing:'0.04em',
                    fontFamily:T.sans, lineHeight:1.6,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── SUBMIT ── */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale:1.015, boxShadow:'0 12px 48px rgba(200,169,110,0.28)', letterSpacing:'0.22em' } : {}}
              whileTap={!loading ? { scale:0.985 } : {}}
              style={{
                width:'100%', padding:'19px',
                background: loading ? 'rgba(200,169,110,0.07)' : T.gold,
                border: loading ? `1px solid rgba(200,169,110,0.2)` : 'none',
                borderRadius:3,
                color: loading ? 'rgba(200,169,110,0.38)' : T.bg,
                fontSize:11, letterSpacing:'0.26em', textTransform:'uppercase',
                fontFamily:T.sans, fontWeight:600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition:'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:14,
                boxShadow: loading ? 'none' : '0 8px 32px rgba(200,169,110,0.18)',
              }}
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.2, ease:'linear' }}
                    style={{ display:'inline-block', fontSize:15, lineHeight:1 }}>
                    ◌
                  </motion.span>
                  Analysing your priorities
                </>
              ) : (
                <>
                  Find My Best Option
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </motion.button>

            {/* ── Loading state overlay hint ── */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay:0.3 }}
                  style={{ textAlign:'center', marginTop:16 }}>
                  <p style={{ fontSize:10, color:'rgba(240,236,228,0.22)', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:T.sans }}>
                    Running optimisation engine
                  </p>
                  {/* Shimmer bar */}
                  <div style={{ height:1, background:'rgba(200,169,110,0.08)', borderRadius:1, marginTop:10, overflow:'hidden', position:'relative' }}>
                    <motion.div
                      animate={{ x:['-100%','200%'] }}
                      transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}
                      style={{ position:'absolute', top:0, left:0, width:'40%', height:'100%', background:'linear-gradient(90deg, transparent, rgba(200,169,110,0.45), transparent)' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* ══════════════════════════════════════
              RIGHT COLUMN — WEIGHT ANALYSIS PANEL
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity:0, x:20 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.7, delay:0.22, ease:[0.22,1,0.36,1] }}
            style={{ position:'sticky', top:96 }}
          >
            {/* Panel card */}
            <div style={{
              border:`1px solid ${T.border}`,
              borderRadius:3, overflow:'hidden',
              background:'rgba(22,20,15,0.7)',
              backdropFilter:'blur(20px)',
              boxShadow:'0 16px 48px rgba(0,0,0,0.35)',
            }}>
              {/* Panel header */}
              <div style={{ padding:'20px 22px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:9.5, letterSpacing:'0.28em', textTransform:'uppercase', color:T.goldSoft, fontFamily:T.sans }}>
                  Weight Analysis
                </span>
                <span style={{
                  fontSize:10, fontFamily:'monospace',
                  color: totalWeight > 1.01 ? '#c08888' : '#8eab96',
                  letterSpacing:'0.06em',
                }}>
                  Σ {totalWeight.toFixed(2)}
                </span>
              </div>

              <div style={{ padding:'24px 22px' }}>
                {/* Donut ring */}
                <WeightRing factors={factors} />

                {/* Ranked list */}
                <div style={{ marginBottom:20 }}>
                  {sortedFactors.map(([factor, value], i) => {
                    const meta = FACTOR_META[factor];
                    const total = Object.values(factors).reduce((a,b)=>a+b,0) || 1;
                    const normPct = (value / total) * 100;
                    return (
                      <motion.div key={factor} layout style={{ marginBottom:13 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            {i === 0 && (
                              <span style={{ fontSize:7.5, letterSpacing:'0.14em', color:T.gold, border:`1px solid rgba(200,169,110,0.35)`, borderRadius:2, padding:'1px 4px', fontFamily:T.sans, lineHeight:1.5 }}>TOP</span>
                            )}
                            <span style={{ fontSize:10.5, letterSpacing:'0.06em', color:meta.color, fontFamily:T.sans, fontWeight:500, textTransform:'uppercase', fontSize:10 }}>
                              {meta.label}
                            </span>
                          </div>
                          <span style={{ fontSize:10, color:'rgba(240,236,228,0.3)', fontFamily:'monospace' }}>
                            {Math.round(normPct)}%
                          </span>
                        </div>
                        <div style={{ height:1.5, background:'rgba(240,236,228,0.05)', borderRadius:1, overflow:'hidden' }}>
                          <motion.div
                            animate={{ width:`${normPct}%` }}
                            transition={{ duration:0.25 }}
                            style={{ height:'100%', background:meta.color, opacity:0.7, borderRadius:1 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Normalisation notice */}
                <AnimatePresence>
                  {totalWeight > 1.01 && (
                    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      style={{ padding:'10px 12px', background:'rgba(180,100,90,0.06)', border:'1px solid rgba(180,100,90,0.2)', borderRadius:2, marginBottom:16 }}>
                      <p style={{ fontSize:10, color:'rgba(192,136,136,0.85)', letterSpacing:'0.06em', fontFamily:T.sans, lineHeight:1.6 }}>
                        Weights exceed 1.0 — the engine will normalise before ranking.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pipeline hint */}
                <div style={{ padding:'14px 16px', background:'rgba(240,236,228,0.018)', borderLeft:`2px solid rgba(200,169,110,0.22)`, borderRadius:'0 2px 2px 0' }}>
                  <p style={{ fontSize:10, color:'rgba(240,236,228,0.26)', lineHeight:1.75, letterSpacing:'0.04em', fontFamily:T.sans }}>
                    Prompt → intent extraction → weight mapping → TOPSIS + regret optimisation → ranked results.
                  </p>
                </div>

                {/* Products being evaluated */}
                <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(240,236,228,0.2)', fontFamily:T.sans, marginBottom:10 }}>
                    Products in scope
                  </p>
                  {PRODUCTS.map(p => (
                    <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7, padding:'5px 0', borderBottom:`1px solid rgba(200,185,155,0.04)` }}>
                      <span style={{ fontSize:10.5, color:'rgba(240,236,228,0.3)', fontFamily:T.sans }}>{p.name}</span>
                      <span style={{ fontSize:9.5, color:T.goldSoft, fontFamily:'monospace', letterSpacing:'0.04em' }}>₹{p.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media(max-width:860px){
          .df-grid{grid-template-columns:1fr!important;}
          .df-sliders{grid-template-columns:1fr!important;}
        }
        @media(max-width:540px){
          .df-sliders{grid-template-columns:1fr!important;}
        }
        textarea{
          color-scheme:dark;
        }
        textarea::placeholder{
          color:rgba(240,236,228,0.18);
        }
        input[type=range]{
          -webkit-appearance:none;
          appearance:none;
          background:transparent;
        }
        input[type=range]::-webkit-slider-thumb{
          -webkit-appearance:none;
          width:1px; height:1px; opacity:0;
        }
        input[type=range]::-moz-range-thumb{
          width:1px; height:1px; opacity:0; border:none;
        }
      `}</style>
    </div>
  );
}
