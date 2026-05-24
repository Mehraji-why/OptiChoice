// ProductCard.jsx
// Three-layer card architecture aligned with Progressive Epistemic Disclosure.
// Layer 1: Name, price, one-line explanation, regret label, budget status.
// Layer 2: Contributors, penalties, interactions, explanation (via KnowMorePanel).
// Layer 4: Scores, bars (inside KnowMorePanel).

import { motion } from 'framer-motion';
import RegretLabel from './RegretLabel';
import EquivalenceIndicator from './EquivalenceIndicator';
import KnowMorePanel from './KnowMorePanel';

function BudgetStatus({ product, budget }) {
  if (!budget || !product.price) return null;

  const diff = product.price - budget;
  const isOver = diff > 0;

  if (!isOver) {
    return (
      <span style={{
        fontSize: '11px',
        color: 'rgba(142,171,150,0.70)',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.04em',
      }}>
        Within budget
      </span>
    );
  }

  return (
    <span style={{
      fontSize: '11px',
      color: 'rgba(200,169,110,0.55)',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.04em',
    }}>
      +₹{diff.toLocaleString()} over
    </span>
  );
}

export default function ProductCard({
  product,
  rank,
  isTop = false,
  isEquivalent = false,
  equivalenceGroupSize = 2,
  rankingConfidence = 1,
  budget,
  animationDelay = 0,
}) {
  // Defensive: handle both old and new API shapes
  const regretScore = product.regret_score ?? 0;
  const explanation = product.explanation || '';
  const regretFraming = product.regret_framing || '';
  const tradeoffSummary = product.tradeoff_summary || '';
  const positiveContributors = product.positive_contributors || [];
  const penaltyContributors = product.penalty_contributors || [];
  const interactionsFired = product.interactions_fired || [];
  const utilityScore = product.utility_score;
  const topsisCloseness = product.topsis_closeness;
  const isParetoOptimal = product.is_pareto_optimal;
  const paretoFrontierRank = product.pareto_frontier_rank;
  const factorScores = product.factor_scores || {};
  const dataCompleteness = product.data_completeness;

  // One-line summary — truncate to first sentence of explanation
  const shortExplanation = explanation
    ? (explanation.split('. ')[0] + (explanation.includes('. ') ? '.' : ''))
    : null;

  const cardStyle = isTop
    ? {
        background: 'rgba(18,16,13,0.98)',
        border: '1px solid rgba(200,190,170,0.18)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,169,110,0.06)',
      }
    : isEquivalent
    ? {
        background: 'rgba(14,12,10,0.95)',
        border: '1px solid rgba(200,190,170,0.10)',
        borderLeft: '2px solid rgba(158,170,184,0.25)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }
    : {
        background: 'rgba(14,12,10,0.95)',
        border: '1px solid rgba(200,190,170,0.10)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: animationDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...cardStyle,
      }}
      whileHover={{
        y: -1,
        transition: { duration: 0.2 },
      }}
    >
      {/* Rank header — top card only */}
      {isTop && (
        <div style={{
          padding: '9px 24px',
          background: 'rgba(200,169,110,0.07)',
          borderBottom: '1px solid rgba(200,169,110,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '9.5px',
            letterSpacing: '0.30em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {isEquivalent ? 'Equivalent Options' : 'Top Recommendation'}
          </span>
          {isEquivalent && (
            <span style={{
              fontSize: '9.5px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9eaab8',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Statistically Tied
            </span>
          )}
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '28px' }}>

        {/* Non-top rank label */}
        {!isTop && (
          <p style={{
            fontSize: '9.5px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,228,0.20)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '12px',
          }}>
            #{rank} Alternative{isEquivalent ? ' · Equivalent' : ''}
          </p>
        )}

        {/* Product name */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: isTop ? '2rem' : '1.35rem',
          fontWeight: 500,
          letterSpacing: '-0.025em',
          color: '#f0ece4',
          marginBottom: '10px',
          lineHeight: 1.1,
        }}>
          {product.name}
        </h2>

        {/* Price + status row */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: isTop ? '1.45rem' : '1.2rem',
            fontWeight: 400,
            color: '#c8a96e',
            letterSpacing: '-0.01em',
          }}>
            ₹{product.price?.toLocaleString()}
          </span>
          <BudgetStatus product={product} budget={budget} />
        </div>

        {/* Regret label + equivalence */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: shortExplanation ? '16px' : '20px',
        }}>
          <RegretLabel regretScore={regretScore} rankingConfidence={rankingConfidence} />
          {isEquivalent && (
            <EquivalenceIndicator compact groupSize={equivalenceGroupSize} />
          )}
          {isParetoOptimal && (
            <span style={{
              fontSize: '9.5px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(142,171,150,0.55)',
              fontFamily: "'DM Sans', sans-serif",
              padding: '4px 8px',
              border: '1px solid rgba(142,171,150,0.18)',
              borderRadius: '2px',
            }}>
              Pareto Optimal
            </span>
          )}
        </div>

        {/* Short explanation (Layer 1 — first sentence only) */}
        {shortExplanation && (
          <p style={{
            fontSize: '13px',
            lineHeight: 1.68,
            color: 'rgba(240,236,228,0.45)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.01em',
            marginBottom: '20px',
            maxWidth: '540px',
          }}>
            {shortExplanation}
          </p>
        )}

        {/* CTA row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <a
            href={product.affiliate_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => { if (!product.affiliate_link) e.preventDefault(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: '#c8a96e',
              borderRadius: '2px',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#0e0c0a',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            View Deal
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Layer 2 + 4 — expandable reasoning */}
        <KnowMorePanel
          explanation={explanation}
          regretFraming={regretFraming}
          tradeoffSummary={tradeoffSummary}
          positiveContributors={positiveContributors}
          penaltyContributors={penaltyContributors}
          interactionsFired={interactionsFired}
          utilityScore={utilityScore}
          topsisCloseness={topsisCloseness}
          regretScore={regretScore}
          isParetoOptimal={isParetoOptimal}
          paretoFrontierRank={paretoFrontierRank}
          factorScores={factorScores}
          dataCompleteness={dataCompleteness}
        />
      </div>
    </motion.div>
  );
}
