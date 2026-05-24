import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0e0c0a",
  text: "#f0ece4",
  gold: "#c8a96e",
  optimal: "#8eab96",
  excellent: "#a8b89c",
  equivalent: "#9eaab8",
  penalty: "#b8a090",
  muted: "rgba(240,236,228,0.38)",
  faint: "rgba(240,236,228,0.22)",
  veryFaint: "rgba(240,236,228,0.14)",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'DM Sans', sans-serif",
  mono: "monospace",
};

// ─── Mock backend response (new data model) ───────────────────────────────────
const MOCK_RESULTS = {
  query: "Best laptop for design and travel under ₹90k",
  global_explanation: "Your priorities strongly favored portability and display quality alongside creative performance. The engine weighted these against your budget constraint, finding a clear winner despite meaningful tension between performance and mobility.",
  inferred_weights: { portability: 0.28, display: 0.25, cpu_score: 0.22, battery: 0.17, build_quality: 0.08 },
  inference_confidence: 0.88,
  ranking_confidence: 0.82,
  tradeoff_pressure: {
    pressure_score: 0.61,
    feasibility_ratio: 0.55,
    conflict_axes: ["GPU vs Portability", "Price vs Display"],
    conflict_banner: "Your requirements created real tension between high display quality and portability at this budget — the result shown is the best available compromise.",
  },
  global_sensitivity: [
    {
      variable_type: "budget",
      description: "Increase budget by ₹12,000",
      consequence: "2 premium display options become available with meaningfully better colour accuracy",
      marginal_utility_gain: 0.14,
      confidence: 0.82,
    },
    {
      variable_type: "preference",
      description: "Relax GPU requirement slightly",
      consequence: "MacBook Air M2 scores 8% higher overall — eliminating the main tradeoff",
      marginal_utility_gain: 0.09,
      confidence: 0.76,
    },
  ],
  ranked_products: [
    {
      id: 3,
      name: "MacBook Air M2",
      price: 89000,
      regret_score: 0.02,
      utility_score: 0.87,
      topsis_closeness: 0.81,
      is_pareto_optimal: true,
      pareto_frontier_rank: 1,
      is_statistically_equivalent: false,
      equivalence_group: null,
      data_completeness: 1.0,
      explanation: "The MacBook Air M2 dominates your priority set. Its exceptional portability (1.24 kg), class-leading display, and 18-hour battery life align precisely with your travel and design workflow needs. The M2 chip handles creative applications with near-zero thermal throttling — a meaningful advantage over Windows alternatives at this price.",
      regret_framing: "Choosing this means prioritising display precision and battery life over raw GPU muscle. For GPU-heavy 3D rendering or gaming, you would look elsewhere — but for design, photography, and motion work, this is the optimal choice.",
      tradeoff_summary: "The MacBook trades discrete GPU performance for an integrated chip architecture that excels at sustained creative workloads without thermal throttling.",
      positive_contributors: [
        { factor: "portability", magnitude: 0.92 },
        { factor: "display", magnitude: 0.88 },
        { factor: "battery", magnitude: 0.95 },
        { factor: "build_quality", magnitude: 0.85 },
      ],
      penalty_contributors: [
        { factor: "gpu_score", reason: "Integrated GPU limits heavy 3D rendering tasks" },
        { factor: "gaming_score", reason: "Not positioned for gaming workloads" },
      ],
      interactions_fired: [
        { event: "portability_battery_synergy", effect: 0.08, description: "High portability and exceptional battery compound — particularly strong for travel-heavy use." },
        { event: "display_creator_boost", effect: 0.06, description: "P3 wide colour display amplifies creative workflow score." },
      ],
      factor_scores: { portability: 9.5, display: 9.2, battery: 9.8, cpu_score: 9.0, build_quality: 9.5, gpu_score: 6.8, thermals: 9.1 },
      affiliate_link: "#",
      image: null,
    },
    {
      id: 1,
      name: "Lenovo ThinkPad X1 Carbon",
      price: 87500,
      regret_score: 0.09,
      utility_score: 0.74,
      topsis_closeness: 0.68,
      is_pareto_optimal: true,
      pareto_frontier_rank: 2,
      is_statistically_equivalent: false,
      equivalence_group: null,
      data_completeness: 0.95,
      explanation: "The ThinkPad X1 Carbon is an excellent business-travel machine that nearly matches the MacBook on portability. Its advantage is Windows compatibility and keyboard quality; it falls short on display colour accuracy and GPU.",
      regret_framing: "Choosing this means accepting a slightly warmer-toned display and lower GPU scores in exchange for a best-in-class keyboard and Windows ecosystem.",
      tradeoff_summary: "Trades display precision and GPU for keyboard quality, Windows compatibility, and enterprise-grade durability.",
      positive_contributors: [
        { factor: "portability", magnitude: 0.85 },
        { factor: "build_quality", magnitude: 0.82 },
        { factor: "battery", magnitude: 0.74 },
      ],
      penalty_contributors: [
        { factor: "display", reason: "sRGB display lags behind OLED and P3 alternatives" },
        { factor: "gpu_score", reason: "Integrated graphics only" },
      ],
      interactions_fired: [],
      factor_scores: { portability: 8.8, display: 7.2, battery: 8.0, cpu_score: 8.4, build_quality: 9.2, gpu_score: 5.0, thermals: 8.5 },
      affiliate_link: "#",
    },
    {
      id: 4,
      name: "ASUS ProArt Studiobook 16",
      price: 88000,
      regret_score: 0.18,
      utility_score: 0.68,
      topsis_closeness: 0.55,
      is_pareto_optimal: false,
      is_statistically_equivalent: false,
      equivalence_group: null,
      data_completeness: 0.9,
      explanation: "The ProArt offers a superb OLED display and discrete GPU — but its 2.4 kg weight and 6-hour battery make it a poor fit for frequent travel.",
      regret_framing: "Choosing this over the MacBook means gaining GPU power and an OLED panel while accepting significantly heavier carry weight and much shorter battery life on the move.",
      tradeoff_summary: "Strong stationary design workstation; mobility and battery life are genuine sacrifices for the travel use case.",
      positive_contributors: [
        { factor: "display", magnitude: 0.95 },
        { factor: "gpu_score", magnitude: 0.88 },
        { factor: "creator_score", magnitude: 0.90 },
      ],
      penalty_contributors: [
        { factor: "portability", reason: "2.4 kg — penalised heavily for travel priority" },
        { factor: "battery", reason: "6 hours — below threshold for mobile workflows" },
      ],
      interactions_fired: [
        { event: "weight_battery_penalty", effect: -0.12, description: "Heavy weight and short battery reinforce each other negatively for a travel-heavy use case." },
      ],
      factor_scores: { portability: 4.5, display: 9.6, battery: 5.2, cpu_score: 8.8, build_quality: 8.0, gpu_score: 9.0, thermals: 8.5 },
      affiliate_link: "#",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FACTOR_HUMAN = {
  cpu_score: "CPU performance", gpu_score: "GPU performance", battery: "Battery life",
  portability: "Portability", display: "Display quality", thermals: "Thermal reliability",
  build_quality: "Build quality", creator_score: "Creator capability",
  student_score: "Student value", gaming_score: "Gaming performance",
};
const FACTOR_COLORS = {
  cpu_score: "#c8a96e", gpu_score: "#b8a898", battery: "#8eab96", portability: "#9eaab8",
  display: "#b0a8b8", thermals: "#a8a090", build_quality: "#a8b0a0",
  creator_score: "#b8a878", student_score: "#9eb8a8", gaming_score: "#b89898",
};
function hf(k) { return FACTOR_HUMAN[k] || k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function fc(k) { return FACTOR_COLORS[k] || "rgba(200,169,110,0.5)"; }

function getRegretMeta(r, rc = 1) {
  if (r <= 0.04) return { label: rc > 0.85 ? "Best Match" : rc > 0.70 ? "Top Recommendation" : "Leading Option", color: T.optimal, bg: "rgba(142,171,150,0.10)", border: "rgba(142,171,150,0.25)" };
  if (r <= 0.12) return { label: "Excellent", color: T.excellent, bg: "rgba(168,184,156,0.08)", border: "rgba(168,184,156,0.22)" };
  if (r <= 0.22) return { label: "Strong Option", color: T.gold, bg: "rgba(200,169,110,0.07)", border: "rgba(200,169,110,0.22)" };
  return { label: "Reasonable Compromise", color: "#b8a898", bg: "rgba(184,168,152,0.07)", border: "rgba(184,168,152,0.20)" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RegretBadge({ regret, rc }) {
  const { label, color, bg, border } = getRegretMeta(regret, rc);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: bg, border: `1px solid ${border}`, borderRadius: 2, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color, fontFamily: T.sans, fontWeight: 500 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: 0.8 }} />
      {label}
    </span>
  );
}

function ContributorPill({ factor, magnitude, maxMag }) {
  const color = fc(factor);
  const opacity = 0.55 + (magnitude / maxMag) * 0.45;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 2, fontSize: 11.5, color, opacity, fontFamily: T.sans }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 7V1M1 4l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {hf(factor)}
    </span>
  );
}

function FactorBar({ factor, value, max, index }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = fc(factor);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 36px", gap: 10, alignItems: "center", marginBottom: 9 }}>
      <span style={{ fontSize: 10.5, color: T.faint, fontFamily: T.sans, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {hf(factor).split(" ")[0]}
      </span>
      <div style={{ height: 2, background: "rgba(240,236,228,0.06)", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 1, transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: T.mono, color: T.veryFaint, textAlign: "right" }}>{value.toFixed(1)}</span>
    </div>
  );
}

function KnowMorePanel({ product, rc }) {
  const [l2Open, setL2Open] = useState(false);
  const [l4Open, setL4Open] = useState(false);
  const maxMag = Math.max(...(product.positive_contributors || []).map(c => c.magnitude), 1);

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={() => setL2Open(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: l2Open ? "rgba(200,169,110,0.85)" : "rgba(200,169,110,0.50)", fontFamily: T.sans, textDecoration: l2Open ? "none" : "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(200,169,110,0.25)", transition: "color 0.18s" }}>
          {l2Open ? "← Collapse" : "Why this ranked first →"}
        </span>
      </button>

      {l2Open && (
        <div style={{ paddingTop: 20, borderTop: "1px solid rgba(200,190,170,0.08)", marginTop: 12 }}>
          {/* Explanation */}
          {product.explanation && (
            <p style={{ fontSize: 13, lineHeight: 1.72, color: "rgba(240,236,228,0.50)", marginBottom: 16, fontFamily: T.sans }}>
              {product.explanation}
            </p>
          )}

          {/* Regret framing */}
          {product.regret_framing && (
            <div style={{ padding: "10px 14px", borderLeft: "2px solid rgba(200,169,110,0.28)", background: "rgba(200,169,110,0.03)", marginBottom: 16, borderRadius: "0 2px 2px 0" }}>
              <p style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,169,110,0.45)", fontFamily: T.sans, marginBottom: 4 }}>Choosing This Means</p>
              <p style={{ fontSize: 12.5, color: "rgba(240,236,228,0.40)", fontFamily: T.sans, lineHeight: 1.6 }}>{product.regret_framing}</p>
            </div>
          )}

          {/* Positive contributors */}
          {product.positive_contributors?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 10 }}>Top Contributors</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {product.positive_contributors.map((c, i) => <ContributorPill key={i} factor={c.factor} magnitude={c.magnitude} maxMag={maxMag} />)}
              </div>
            </div>
          )}

          {/* Interactions */}
          {product.interactions_fired?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 8 }}>Detected Effects</p>
              {product.interactions_fired.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(200,190,170,0.06)" }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: ev.effect > 0 ? T.optimal : T.penalty, flexShrink: 0, marginTop: 1, fontFamily: T.sans }}>
                    {ev.effect > 0 ? "Synergy" : "Tension"}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(240,236,228,0.38)", fontFamily: T.sans, lineHeight: 1.6 }}>{ev.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Penalty contributors */}
          {product.penalty_contributors?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 8 }}>Where It Falls Short</p>
              {product.penalty_contributors.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(200,190,170,0.06)" }}>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(184,160,144,0.5)", flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 11, color: T.faint, fontFamily: T.sans }}>
                    <span style={{ color: T.penalty }}>{hf(c.factor)}</span>
                    {c.reason ? ` — ${c.reason}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Layer 4 toggle */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(200,190,170,0.07)" }}>
            <button onClick={() => setL4Open(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,236,228,0.22)", fontFamily: T.sans, transition: "color 0.18s" }}>
                {l4Open ? "Hide optimization details" : "Show optimization details"}
              </span>
              <span style={{ color: "rgba(240,236,228,0.22)", transform: l4Open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-flex" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </button>

            {l4Open && (
              <div style={{ paddingTop: 20 }}>
                {/* Score trio */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Utility Score", val: product.utility_score, color: T.gold, note: "Absolute fit" },
                    { label: "TOPSIS Closeness", val: product.topsis_closeness, color: T.equivalent, note: "Relative rank" },
                    { label: "Regret Score", val: product.regret_score, color: T.optimal, note: "Opportunity cost", decimal: true },
                  ].map(m => m.val !== undefined && (
                    <div key={m.label} style={{ padding: "14px 12px", background: "rgba(240,236,228,0.02)", border: "1px solid rgba(200,190,170,0.08)", borderRadius: 2 }}>
                      <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 6 }}>{m.label}</p>
                      <p style={{ fontFamily: T.mono, fontSize: 20, color: m.color, lineHeight: 1 }}>
                        {m.decimal ? m.val.toFixed(3) : `${(m.val * 100).toFixed(1)}%`}
                      </p>
                      <p style={{ fontSize: 10.5, color: "rgba(240,236,228,0.25)", fontFamily: T.sans, marginTop: 4 }}>{m.note}</p>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {product.is_pareto_optimal && (
                    <span style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.optimal, padding: "4px 10px", border: "1px solid rgba(142,171,150,0.25)", background: "rgba(142,171,150,0.06)", borderRadius: 2, fontFamily: T.sans }}>
                      Pareto Optimal
                    </span>
                  )}
                  {product.data_completeness < 1 && (
                    <span style={{ fontSize: 9.5, color: "rgba(200,169,110,0.45)", padding: "4px 10px", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 2, fontFamily: T.sans }}>
                      {Math.round(product.data_completeness * 100)}% Data Coverage
                    </span>
                  )}
                </div>

                {/* Factor bars */}
                {Object.keys(product.factor_scores || {}).length > 0 && (
                  <div>
                    <p style={{ fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 14 }}>Factor Breakdown</p>
                    {Object.entries(product.factor_scores).map(([f, v], i) => (
                      <FactorBar key={f} factor={f} value={v} max={10} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, rank, isTop, rc, delay }) {
  const shortEx = product.explanation ? (product.explanation.split(". ")[0] + ".") : "";

  const cardStyle = isTop
    ? { background: "rgba(18,16,13,0.98)", border: "1px solid rgba(200,190,170,0.18)", boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,169,110,0.06)" }
    : { background: "rgba(14,12,10,0.95)", border: "1px solid rgba(200,190,170,0.10)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" };

  return (
    <div style={{ borderRadius: 2, overflow: "hidden", marginBottom: 8, ...cardStyle, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {isTop && (
        <div style={{ padding: "8px 24px", background: "rgba(200,169,110,0.07)", borderBottom: "1px solid rgba(200,169,110,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9.5, letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(200,169,110,0.55)", fontFamily: T.sans }}>Top Recommendation</span>
        </div>
      )}

      <div style={{ padding: "26px 28px" }}>
        {!isTop && (
          <p style={{ fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 10 }}>#{rank} Alternative</p>
        )}

        <h2 style={{ fontFamily: T.serif, fontSize: isTop ? "1.9rem" : "1.3rem", fontWeight: 500, letterSpacing: "-0.025em", color: T.text, marginBottom: 10, lineHeight: 1.1 }}>
          {product.name}
        </h2>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.serif, fontSize: isTop ? "1.4rem" : "1.15rem", color: T.gold, letterSpacing: "-0.01em" }}>
            ₹{product.price?.toLocaleString()}
          </span>
          {product.price <= 90000
            ? <span style={{ fontSize: 11, color: "rgba(142,171,150,0.70)", fontFamily: T.sans }}>Within budget</span>
            : <span style={{ fontSize: 11, color: "rgba(200,169,110,0.55)", fontFamily: T.sans }}>+₹{(product.price - 90000).toLocaleString()} over</span>
          }
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <RegretBadge regret={product.regret_score} rc={rc} />
          {product.is_pareto_optimal && (
            <span style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(142,171,150,0.50)", fontFamily: T.sans, padding: "4px 8px", border: "1px solid rgba(142,171,150,0.15)", borderRadius: 2 }}>
              Pareto Optimal
            </span>
          )}
        </div>

        {shortEx && (
          <p style={{ fontSize: 13, lineHeight: 1.68, color: "rgba(240,236,228,0.42)", fontFamily: T.sans, marginBottom: 18, maxWidth: 540 }}>
            {shortEx}
          </p>
        )}

        <a href="#" onClick={e => e.preventDefault()} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px", background: T.gold, borderRadius: 2, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#0e0c0a", fontFamily: T.sans, fontWeight: 600, textDecoration: "none" }}>
          View Deal
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </a>

        <KnowMorePanel product={product} rc={rc} />
      </div>
    </div>
  );
}

function SensitivityCard({ s }) {
  return (
    <div style={{ flex: 1, minWidth: 200, padding: 18, background: "rgba(200,169,110,0.03)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 2 }}>
      <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,110,0.55)", fontFamily: T.sans, marginBottom: 10 }}>{s.variable_type?.toUpperCase()}</p>
      <p style={{ fontSize: 14, color: T.text, fontFamily: T.sans, lineHeight: 1.5, marginBottom: 8 }}>{s.description}</p>
      <p style={{ fontSize: 12.5, color: T.muted, fontFamily: T.sans, lineHeight: 1.55, display: "flex", alignItems: "flex-start", gap: 5 }}>
        <span style={{ color: "rgba(200,169,110,0.45)", flexShrink: 0 }}>→</span>
        {s.consequence}
      </p>
    </div>
  );
}

// ─── Main Results page ────────────────────────────────────────────────────────
export default function ResultsDemo() {
  const r = MOCK_RESULTS;
  const topFactors = Object.entries(r.inferred_weights).sort(([,a],[,b]) => b-a).slice(0,3);
  const totalW = topFactors.reduce((s,[,v]) => s+v, 0);
  const [showResults, setShowResults] = useState(true);

  if (!showResults) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans }}>
        <button onClick={() => setShowResults(true)} style={{ background: "none", border: "1px solid rgba(200,169,110,0.3)", borderRadius: 2, padding: "12px 32px", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, cursor: "pointer", fontFamily: T.sans }}>
          Show Results →
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, paddingTop: 48 }}>
      {/* Grid texture */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(200,190,170,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.016) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 1, background: T.gold, opacity: 0.5 }} />
              <span style={{ fontSize: 9.5, letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(200,169,110,0.50)", fontFamily: T.sans }}>Decision Analysis Complete</span>
            </div>
            <h1 style={{ fontFamily: T.serif, fontSize: "clamp(1.7rem,4vw,2.8rem)", fontWeight: 500, letterSpacing: "-0.03em", color: T.text, lineHeight: 1.08 }}>
              The engine recommends MacBook Air M2.
            </h1>
          </div>
          <button onClick={() => setShowResults(false)} style={{ background: "none", border: "1px solid rgba(200,190,170,0.12)", borderRadius: 2, padding: "9px 18px", fontSize: 9.5, letterSpacing: "0.20em", textTransform: "uppercase", color: T.faint, cursor: "pointer", fontFamily: T.sans, flexShrink: 0, marginTop: 6, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,169,110,0.30)"; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,190,170,0.12)"; e.currentTarget.style.color = T.faint; }}
          >
            Reset
          </button>
        </div>

        {/* Accent rule */}
        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(200,169,110,0.5), rgba(200,169,110,0.04))", marginBottom: 32 }} />

        {/* ── LAYER 1: PRIORITY HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 9.5, letterSpacing: "0.30em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, marginBottom: 10 }}>Analysis Based On</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 10 }}>
            {topFactors.map(([f, w], i) => {
              const pct = Math.round((w / totalW) * 100);
              return (
                <span key={f} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, color: T.gold, fontFamily: T.sans, fontWeight: 500 }}>{hf(f)}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 4, fontFamily: T.sans }}>({pct}%)</span>
                  {i < topFactors.length - 1 && <span style={{ margin: "0 8px", color: "rgba(240,236,228,0.15)", fontSize: 12 }}>·</span>}
                </span>
              );
            })}
          </div>
          <p style={{ fontSize: 13.5, color: "rgba(240,236,228,0.38)", fontFamily: T.sans, lineHeight: 1.65, maxWidth: 580 }}>
            {r.global_explanation.split(". ")[0]}.
          </p>
        </div>

        {/* ── TRADEOFF BANNER ── */}
        <div style={{ padding: "14px 18px", background: "rgba(200,169,110,0.04)", border: "1px solid rgba(200,169,110,0.16)", borderLeft: "3px solid rgba(200,169,110,0.48)", borderRadius: 2, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M8 2L14 13H2L8 2Z" stroke="rgba(200,169,110,0.65)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
              <path d="M8 6v3M8 11v1" stroke="rgba(200,169,110,0.65)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(200,169,110,0.50)", fontFamily: T.sans, marginBottom: 5 }}>Requirement Tension Detected</p>
              <p style={{ fontSize: 13, color: "rgba(240,236,228,0.48)", fontFamily: T.sans, lineHeight: 1.65 }}>{r.tradeoff_pressure.conflict_banner}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {r.tradeoff_pressure.conflict_axes.map((a, i) => (
                  <span key={i} style={{ fontSize: 10, color: "rgba(200,169,110,0.42)", padding: "3px 8px", border: "1px solid rgba(200,169,110,0.14)", borderRadius: 2, fontFamily: T.sans }}>{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PRODUCT CARDS ── */}
        {r.ranked_products.map((p, i) => (
          <ProductCard key={p.id} product={p} rank={i + 1} isTop={i === 0} rc={r.ranking_confidence} delay={i * 0.07} />
        ))}

        {/* ── SENSITIVITY PANEL ── */}
        <div style={{ marginTop: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.28em", textTransform: "uppercase", color: T.veryFaint, fontFamily: T.sans, flexShrink: 0 }}>Optimization Opportunities</p>
            <div style={{ flex: 1, height: 1, background: "rgba(200,190,170,0.07)" }} />
          </div>
          <p style={{ fontSize: 12.5, color: "rgba(240,236,228,0.28)", fontFamily: T.sans, marginBottom: 14, lineHeight: 1.6 }}>
            Small adjustments to your requirements could meaningfully improve the match quality.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {r.global_sensitivity.map((s, i) => <SensitivityCard key={i} s={s} />)}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: "1px solid rgba(200,190,170,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 10.5, color: "rgba(240,236,228,0.18)", fontFamily: T.sans, letterSpacing: "0.04em" }}>
            Rankings computed via utility optimization, TOPSIS, and regret minimization.
          </p>
          <button onClick={() => setShowResults(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10.5, color: "rgba(200,169,110,0.38)", fontFamily: T.sans, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(200,169,110,0.18)" }}>
            Search again
          </button>
        </div>
      </div>
    </div>
  );
}
