// KnowMorePanel.jsx
// Replaces old cosmetic "Know More" with structured epistemic disclosure.
// Layer 2: contributors, penalties, interactions, explanation, regret framing.
// Layer 4: scores, bars, Pareto status (power user only).

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContributorPills from './ContributorPills';
import ScorePanel from './ScorePanel';
import ContributionBars from './ContributionBars';

export default function KnowMorePanel({
  // Layer 2
  explanation,
  regretFraming,
  tradeoffSummary,
  positiveContributors = [],
  penaltyContributors = [],
  interactionsFired = [],

  // Layer 4
  utilityScore,
  topsisCloseness,
  regretScore,
  isParetoOptimal,
  paretoFrontierRank,
  factorScores = {},
  dataCompleteness,
}) {
  const [layer2Open, setLayer2Open] = useState(false);
  const [layer4Open, setLayer4Open] = useState(false);

  const hasLayer2 = positiveContributors.length > 0 || penaltyContributors.length > 0 || explanation || regretFraming;
  const hasLayer4 = utilityScore !== undefined || topsisCloseness !== undefined || regretScore !== undefined || Object.keys(factorScores).length > 0;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Layer 2 trigger */}
      {hasLayer2 && (
        <>
          <button
            onClick={() => setLayer2Open(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '0',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: layer2Open ? 'rgba(200,169,110,0.85)' : 'rgba(200,169,110,0.55)',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'color 0.18s',
                textDecoration: layer2Open ? 'none' : 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'rgba(200,169,110,0.30)',
              }}
            >
              {layer2Open ? '← Collapse' : 'Why this ranked first →'}
            </span>
          </button>

          <AnimatePresence>
            {layer2Open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(200,190,170,0.08)',
                  marginTop: '12px',
                }}>
                  {/* Full explanation */}
                  {explanation && (
                    <p style={{
                      fontSize: '13.5px',
                      lineHeight: 1.72,
                      color: 'rgba(240,236,228,0.52)',
                      marginBottom: '20px',
                      letterSpacing: '0.01em',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {explanation}
                    </p>
                  )}

                  {/* Regret framing */}
                  {regretFraming && (
                    <div style={{
                      padding: '12px 16px',
                      borderLeft: '2px solid rgba(200,169,110,0.30)',
                      background: 'rgba(200,169,110,0.03)',
                      marginBottom: '20px',
                      borderRadius: '0 2px 2px 0',
                    }}>
                      <p style={{
                        fontSize: '9px',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: 'rgba(200,169,110,0.45)',
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: '5px',
                      }}>
                        Choosing This Means
                      </p>
                      <p style={{
                        fontSize: '12.5px',
                        color: 'rgba(240,236,228,0.42)',
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.6,
                      }}>
                        {regretFraming}
                      </p>
                    </div>
                  )}

                  {/* Tradeoff summary */}
                  {tradeoffSummary && (
                    <div style={{
                      padding: '12px 16px',
                      borderLeft: '2px solid rgba(184,168,152,0.25)',
                      background: 'rgba(184,168,152,0.03)',
                      marginBottom: '20px',
                      borderRadius: '0 2px 2px 0',
                    }}>
                      <p style={{
                        fontSize: '9px',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: 'rgba(184,168,152,0.40)',
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: '5px',
                      }}>
                        Tradeoff Summary
                      </p>
                      <p style={{
                        fontSize: '12.5px',
                        color: 'rgba(240,236,228,0.38)',
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.6,
                      }}>
                        {tradeoffSummary}
                      </p>
                    </div>
                  )}

                  {/* Contributors */}
                  <ContributorPills
                    positiveContributors={positiveContributors}
                    penaltyContributors={penaltyContributors}
                    interactionsFired={interactionsFired}
                  />

                  {/* Layer 4 trigger — secondary, clearly deep */}
                  {hasLayer4 && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{
                        height: '1px',
                        background: 'rgba(200,190,170,0.07)',
                        marginBottom: '16px',
                      }} />
                      <button
                        onClick={() => setLayer4Open(o => !o)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{
                          fontSize: '10px',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: layer4Open ? 'rgba(240,236,228,0.35)' : 'rgba(240,236,228,0.22)',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'color 0.18s',
                        }}>
                          {layer4Open ? 'Hide optimization details' : 'Show optimization details'}
                        </span>
                        <motion.span
                          animate={{ rotate: layer4Open ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,228,0.22)" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {layer4Open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ paddingTop: '20px' }}>
                              <ScorePanel
                                utilityScore={utilityScore}
                                topsisCloseness={topsisCloseness}
                                regretScore={regretScore}
                                isParetoOptimal={isParetoOptimal}
                                paretoFrontierRank={paretoFrontierRank}
                                dataCompleteness={dataCompleteness}
                              />
                              <div style={{ marginTop: '20px' }}>
                                <ContributionBars factorScores={factorScores} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
