// Results.jsx — Complete rewrite.
// Translates backend optimization intelligence into progressive human cognition.
// Four-layer epistemic disclosure: Orientation → Reasoning → Tradeoffs → Math.
//
// Reads from new backend data model:
//   results.ranked_products[*].regret_score / utility_score / topsis_closeness
//   results.ranked_products[*].positive_contributors / penalty_contributors
//   results.ranked_products[*].interactions_fired / explanation / regret_framing
//   results.ranked_products[*].is_statistically_equivalent / equivalence_group
//   results.ranked_products[*].is_pareto_optimal
//   results.tradeoff_pressure / global_sensitivity / inferred_weights
//   results.inference_confidence / ranking_confidence / global_explanation
//
// Backward-compatible: old API shape (composite_score, factor_scores) degrades gracefully.

import { motion } from 'framer-motion';
import PriorityHeader from '../components/optimization/PriorityHeader';
import TradeoffBanner from '../components/optimization/TradeoffBanner';
import ProductCard from '../components/optimization/ProductCard';
import EquivalenceIndicator from '../components/optimization/EquivalenceIndicator';
import SensitivityPanel from '../components/optimization/SensitivityPanel';

// ─── Fallback helpers for old API shape ───────────────────────────────────────

function inferBudget(query = '') {
  const m = query.match(/₹\s*([0-9,]+)/) || query.match(/([0-9]{4,6})/);
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ''), 10) || null;
}

// Group products by equivalence_group id
function groupEquivalent(rankedProducts = []) {
  const groups = {};
  rankedProducts.forEach((p, i) => {
    if (p.is_statistically_equivalent && p.equivalence_group != null) {
      const gid = p.equivalence_group;
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(i);
    }
  });
  return groups;
}

// ─── Equivalence bracket header ───────────────────────────────────────────────
function EquivalenceBracket({ groupSize }) {
  return (
    <EquivalenceIndicator
      groupSize={groupSize}
      style={{ marginBottom: '8px' }}
    />
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      margin: '44px 0 20px',
    }}>
      <p style={{
        fontSize: '9.5px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(240,236,228,0.22)',
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
      }}>
        {label}
      </p>
      <div style={{ flex: 1, height: '1px', background: 'rgba(200,190,170,0.07)' }} />
    </div>
  );
}

// ─── Results page ─────────────────────────────────────────────────────────────
export default function Results({ results, onNewDecision }) {
  if (!results) return null;

  const rankedProducts = results.ranked_products || [];
  const topProduct = rankedProducts[0];
  const alternatives = rankedProducts.slice(1);

  // Global signals
  const tradeoffPressure = results.tradeoff_pressure;
  const globalSensitivity = results.global_sensitivity || [];
  const inferredWeights = results.inferred_weights || {};
  const inferenceConfidence = results.inference_confidence ?? 1;
  const rankingConfidence = results.ranking_confidence ?? 1;
  const globalExplanation = results.global_explanation || '';
  const feasibilityRatio = results.tradeoff_pressure?.feasibility_ratio;

  // Equivalence groups
  const equivGroups = groupEquivalent(rankedProducts);
  const equivGroupsByProduct = {};
  Object.entries(equivGroups).forEach(([gid, indices]) => {
    indices.forEach(i => {
      equivGroupsByProduct[i] = { groupId: gid, groupSize: indices.length };
    });
  });

  // Budget (best-effort from query)
  const budget = inferBudget(results.query || '');

  // Whether top group is an equivalence bracket
  const topIsEquivalent = topProduct?.is_statistically_equivalent;
  const topEquivGroup = topIsEquivalent ? equivGroupsByProduct[0] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e0c0a',
      fontFamily: "'DM Sans', sans-serif",
      paddingTop: '80px',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(200,190,170,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(200,190,170,0.016) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '860px',
        margin: '0 auto',
        padding: '48px 32px 100px',
      }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '44px',
          }}
        >
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ width: '28px', height: '1px', background: '#c8a96e', opacity: 0.5 }} />
              <span style={{
                fontSize: '9.5px',
                letterSpacing: '0.30em',
                textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.50)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Decision Analysis Complete
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#f0ece4',
              lineHeight: 1.08,
            }}>
              {topProduct ? `The engine recommends ${topProduct.name}.` : 'Your tailored results.'}
            </h1>
          </div>

          <motion.button
            onClick={onNewDecision}
            style={{
              background: 'none',
              border: '1px solid rgba(200,190,170,0.12)',
              borderRadius: '2px',
              padding: '10px 20px',
              fontSize: '9.5px',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,228,0.38)',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
              flexShrink: 0,
              marginTop: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(200,169,110,0.30)';
              e.currentTarget.style.color = '#c8a96e';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,190,170,0.12)';
              e.currentTarget.style.color = 'rgba(240,236,228,0.38)';
            }}
          >
            New Search
          </motion.button>
        </motion.div>

        {/* Thin accent rule */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(200,169,110,0.5) 0%, rgba(200,169,110,0.05) 100%)',
          marginBottom: '36px',
        }} />

        {/* ── LAYER 1: ORIENTATION ── */}

        {/* Priority Header — trust signal */}
        {Object.keys(inferredWeights).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <PriorityHeader
              inferredWeights={inferredWeights}
              inferenceConfidence={inferenceConfidence}
              globalExplanation={globalExplanation}
              feasibilityRatio={feasibilityRatio}
              totalProducts={results.total_products}
              filteredProducts={results.filtered_products}
            />
          </motion.div>
        )}

        {/* Tradeoff pressure banner */}
        {tradeoffPressure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TradeoffBanner tradeoffPressure={tradeoffPressure} />
          </motion.div>
        )}

        {/* Equivalence bracket (if top group is tied) */}
        {topIsEquivalent && topEquivGroup && (
          <EquivalenceBracket groupSize={topEquivGroup.groupSize} />
        )}

        {/* Top product card */}
        {topProduct && (
          <ProductCard
            product={topProduct}
            rank={1}
            isTop
            isEquivalent={!!topIsEquivalent}
            equivalenceGroupSize={topEquivGroup?.groupSize}
            rankingConfidence={rankingConfidence}
            budget={budget}
            animationDelay={0.1}
          />
        )}

        {/* ── ALTERNATIVES ── */}
        {alternatives.length > 0 && (
          <>
            <SectionDivider label="Strong Alternatives" />

            {alternatives.map((product, i) => {
              const realRank = i + 2;
              const equivInfo = equivGroupsByProduct[realRank - 1];
              const isEquivWithPrev = product.is_statistically_equivalent && equivInfo;

              return (
                <div key={product.id || i}>
                  {/* Show equiv bracket only for first in a new group */}
                  {isEquivWithPrev && equivInfo && (() => {
                    const prevEquiv = equivGroupsByProduct[realRank - 2];
                    const isNewGroup = !prevEquiv || prevEquiv.groupId !== equivInfo.groupId;
                    if (isNewGroup && equivInfo.groupId !== topEquivGroup?.groupId) {
                      return <EquivalenceBracket groupSize={equivInfo.groupSize} />;
                    }
                    return null;
                  })()}

                  <ProductCard
                    product={product}
                    rank={realRank}
                    isTop={false}
                    isEquivalent={!!product.is_statistically_equivalent}
                    equivalenceGroupSize={equivInfo?.groupSize}
                    rankingConfidence={rankingConfidence}
                    budget={budget}
                    animationDelay={0.05 * (i + 1)}
                  />
                </div>
              );
            })}
          </>
        )}

        {/* ── LAYER 3: SENSITIVITY / OPTIMIZATION OPPORTUNITIES ── */}
        {globalSensitivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SensitivityPanel globalSensitivity={globalSensitivity} />
          </motion.div>
        )}

        {/* Footer note */}
        <div style={{
          marginTop: '64px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(200,190,170,0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{
            fontSize: '10.5px',
            color: 'rgba(240,236,228,0.20)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.04em',
          }}>
            Rankings computed via utility optimization, TOPSIS, and regret minimization.
          </p>
          <button
            onClick={onNewDecision}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '10.5px',
              letterSpacing: '0.14em',
              color: 'rgba(200,169,110,0.40)',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationColor: 'rgba(200,169,110,0.20)',
            }}
          >
            Search again
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .result-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
